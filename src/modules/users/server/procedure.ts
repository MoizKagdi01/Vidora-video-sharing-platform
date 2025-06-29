import { db } from "@/db";
import {
  videos,
  users,
  subscription,
} from "@/db/schema";
import { router, baseProcedure } from "@/trpc/init";
import {
  eq,
  getTableColumns,
  inArray,
  isNotNull,
} from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
export const usersRouter = router({
  getOne: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const  clerkUserId = ctx.auth?.userId;
      let userId;
      const [user] = await db
        .select()
        .from(users)
        .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []));
      if (user) {
        userId = user.id;
      }
      const viewerSubscription = db.$with("viewer_subscriptions").as(
        db
          .select({
            viewerId: subscription.viewerId,
            creatorId: subscription.creatorId,
          })
          .from(subscription)
          .where(inArray(subscription.viewerId, userId ? [userId] : []))
      );
      const [existingUser] = await db
        .with(viewerSubscription)
        .select({
          ...getTableColumns(users),
          viewerSubscribed: isNotNull(viewerSubscription.viewerId).mapWith(Boolean),
          videoCount: db.$count(videos, eq(videos.userId, users.id)),
          subscriberCount: db.$count(subscription, eq(subscription.creatorId, users.id)),
          
        })
        .from(users)
        .leftJoin(
          viewerSubscription,
          eq(viewerSubscription.creatorId, users.id)
        )
        .where(eq(users.id, input.id));
      if (!existingUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      return existingUser;
    }),
});
