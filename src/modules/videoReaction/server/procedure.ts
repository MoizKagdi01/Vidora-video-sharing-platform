import { db } from "@/db";
import { videoReaction } from "@/db/schema";
import { protectedProcedure, router } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
export const videoReactionRouter = router({
  like: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { videoId } = input;
      const [existingVideoReactionLike] = await db
        .select()
        .from(videoReaction)
        .where(
          and(
            eq(videoReaction.videoId, videoId),
            eq(videoReaction.userId, userId),
            eq(videoReaction.type, "like")
          )
        );
      if (existingVideoReactionLike) {
        const [deleteVideoReaction] = await db
          .delete(videoReaction)
          .where(
            and(
              eq(videoReaction.videoId, videoId),
              eq(videoReaction.userId, userId)
            )
          ).returning();

          return deleteVideoReaction
      }
      const [createdVideoReaction] = await db
        .insert(videoReaction)
        .values({ userId, videoId, type:"like"})
        .onConflictDoUpdate({
          target:[videoReaction.videoId,videoReaction.userId],
          set:{
            type:"like"
          }
        })
        .returning();
      return createdVideoReaction;
    }),
  dislike: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { videoId } = input;
      const [existingVideoReactionDislike] = await db
        .select()
        .from(videoReaction)
        .where(
          and(
            eq(videoReaction.videoId, videoId),
            eq(videoReaction.userId, userId),
            eq(videoReaction.type, "dislike")
          )
        );
      if (existingVideoReactionDislike) {
        const [deleteVideoReaction] = await db
          .delete(videoReaction)
          .where(
            and(
              eq(videoReaction.videoId, videoId),
              eq(videoReaction.userId, userId)
            )
          ).returning();

          return deleteVideoReaction
      }
      const [createdVideoReaction] = await db
        .insert(videoReaction)
        .values({ userId, videoId, type:"dislike"})
        .onConflictDoUpdate({
          target:[videoReaction.videoId,videoReaction.userId],
          set:{
            type:"dislike"
          }
        })
        .returning();
      return createdVideoReaction;
    }),
});
