import { auth } from '@clerk/nextjs/server';
import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import superjson from 'superjson';
import { eq } from 'drizzle-orm';
import { users } from '@/db/schema';
import { db } from '@/db';
import { ratelimit } from '@/lib/ratelimit';
import { ZodError } from 'zod';

export const createTRPCContext = cache(async () => {
    try {
        const authRequest = await auth();
        return { auth: authRequest };
    } catch (error) {
        console.error('Auth error:', error);
        return { auth: null };
    }
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError:
                    error.cause instanceof ZodError ? error.cause.flatten() : null,
            },
        };
    },
});

// Base router and procedure helpers
export const router = t.router;
export const baseProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

// Middleware to check auth
const isAuthed = t.middleware(async ({ next, ctx }) => {
    if (!ctx.auth?.userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authorized' });
    }

    return next({
        ctx: {
            auth: ctx.auth,
        },
    });
});
export const protectedProcedure = t.procedure.use(isAuthed).use(async (opts) => {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, opts.ctx.auth.userId))
        .limit(1);

    if (!user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authorized' });
    }

    const { success } = await ratelimit.limit(user.id);
    if (!success) {
        throw new TRPCError({
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many requests',
        });
    }

    return opts.next({
        ctx: {
            ...opts.ctx,
            user,
        },
    });
});
