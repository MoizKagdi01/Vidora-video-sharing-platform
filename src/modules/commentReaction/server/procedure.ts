import { db } from "@/db";
import { commentsReaction } from "@/db/schema";
import { protectedProcedure, router } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
export const commentReactionRouter = router({
  like: protectedProcedure
    .input(z.object({ commentId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { commentId } = input;
      const [existingCommentReactionLike] = await db
        .select()
        .from(commentsReaction)
        .where(
          and(
            eq(commentsReaction.commentId, commentId),
            eq(commentsReaction.userId, userId),
            eq(commentsReaction.reaction, "like")
          )
        );
      if (existingCommentReactionLike) {
        const [deletecommentReaction] = await db
          .delete(commentsReaction)
          .where(
            and(
              eq(commentsReaction.commentId, commentId),
              eq(commentsReaction.userId, userId)
            )
          )
          .returning();

        return deletecommentReaction;
      }
      const [createdCommentReaction] = await db
        .insert(commentsReaction)
        .values({ userId, commentId, reaction: "like" })
        .onConflictDoUpdate({
          target: [commentsReaction.commentId, commentsReaction.userId],
          set: {
            reaction: "like",
          },
        })
        .returning();
      return createdCommentReaction;
    }),
  dislike: protectedProcedure
    .input(z.object({ commentId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { commentId } = input;
      const [existingCommentReactionDisike] = await db
        .select()
        .from(commentsReaction)
        .where(
          and(
            eq(commentsReaction.commentId, commentId),
            eq(commentsReaction.userId, userId),
            eq(commentsReaction.reaction, "dislike")
          )
        );
      if (existingCommentReactionDisike) {
        const [deletecommentReaction] = await db
          .delete(commentsReaction)
          .where(
            and(
              eq(commentsReaction.commentId, commentId),
              eq(commentsReaction.userId, userId)
            )
          )
          .returning();

        return deletecommentReaction;
      }
      const [createdCommentReaction] = await db
        .insert(commentsReaction)
        .values({ userId, commentId, reaction: "dislike" })
        .onConflictDoUpdate({
          target: [commentsReaction.commentId, commentsReaction.userId],
          set: {
            reaction: "dislike",
          },
        })
        .returning();
      return createdCommentReaction;
    }),
});
