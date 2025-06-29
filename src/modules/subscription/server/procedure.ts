import { db } from "@/db";
import { subscription, users } from "@/db/schema";
import { router, protectedProcedure } from "@/trpc/init";
import { eq, and, getTableColumns, or, lt, desc} from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
export const SubscriptionRouter = router({
  
    getMany: protectedProcedure
      .input(
        z.object({
          cursor: z
            .object({
              creatorId: z.string().uuid(),
              updatedAt: z.date(),
            })
            .nullish(),
          limit: z.number().min(1).max(10).default(10),
        })
      )
      .query(async ({ input, ctx }) => {
        const { cursor, limit} = input;
        const userId = ctx.user.id;
        const data = await db
          .select({
            ...getTableColumns(subscription),
            users: {
              ...getTableColumns(users),
              subscriberCount: db.$count(subscription, eq(subscription.creatorId, users.id)),

            },
          })
          .from(subscription)
          .innerJoin(users, eq(users.id, subscription.creatorId))
          .where(
            and(
              eq(subscription.viewerId, userId),
              cursor
                ? or(
                    lt(subscription.updatedAt, cursor.updatedAt),
                    and(
                      eq(subscription.updatedAt, cursor.updatedAt),
                      lt(subscription.creatorId, cursor.creatorId)
                    )
                  )
                : undefined
            )
          )
          .orderBy(desc(subscription.updatedAt), desc(subscription.creatorId))
          .limit(limit + 1);
  
        const hasMore = data.length > limit;
        const items = hasMore ? data.slice(0, -1) : data;
        const lastItem = items[items.length - 1];
  
        return {
          items,
          nextCursor: hasMore
            ? {
                creatorId: lastItem.creatorId,
                updatedAt: lastItem.updatedAt,
              }
            : null,
        };
      }),
  
  create: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = input;
      if (userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
      const [createdSubscription] = await db
        .insert(subscription)
        .values({ viewerId: ctx.user.id, creatorId: userId })
        .returning();
      return createdSubscription;
    }),
  remove: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = input;
      if (userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
      const [deleteSubscription] = await db
        .delete(subscription)
        .where(and(
            eq(subscription.viewerId, ctx.user.id),
            eq(subscription.creatorId,userId)
        ))
        .returning();
      return deleteSubscription;
    }),
});
