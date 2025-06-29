import { db } from "@/db";
import { comments, commentsReaction, users } from "@/db/schema";
import { baseProcedure, protectedProcedure, router } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  inArray,
  isNotNull,
  isNull,
  lt,
  or,
} from "drizzle-orm";
import { z } from "zod";
export const CommentRouter = router({
  remove: protectedProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { commentId } = input;

      const [deletedComments] = await db
        .delete(comments)
        .where(and(eq(comments.id, commentId), eq(comments.userId, userId)))
        .returning();

      if (!deletedComments) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return deletedComments;
    }),
  create: protectedProcedure
    .input(
      z.object({
        parentId: z.string().uuid().nullish(),
        videoId: z.string().uuid(),
        value: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { parentId, videoId, value } = input;

      // OPTOIONAL: ( changeable if needed)
      const [existingComment] = await db
        .select()
        .from(comments)
        .where(inArray(comments.id, parentId ? [parentId] : []));
      if (!existingComment && parentId) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (existingComment?.parentId && parentId) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [createdComments] = await db
        .insert(comments)
        .values({ userId, parentId, videoId, value })
        .returning();
      return createdComments;
    }),
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        parentId: z.string().uuid().nullish(),
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const { videoId,parentId, cursor, limit } = input;
      const clerkUserId = ctx.auth?.userId;
      let userId;
      let viewerReaction;
      const [user] = await db
        .select()
        .from(users)
        .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []));
      if (user) {
        userId = user.id;
        viewerReaction = db.$with("viewer_reaction").as(
          db
            .select({
              commentId: commentsReaction.commentId,
              reaction: commentsReaction.reaction,
            })
            .from(commentsReaction)
            .where(inArray(commentsReaction.userId, userId ? [userId] : []))
        );
      } else {
        viewerReaction = db.$with("viewer_reaction").as(
          db
            .select({
              commentId: commentsReaction.commentId,
              reaction: commentsReaction.reaction,
            })
            .from(commentsReaction)
            .where(inArray(commentsReaction.userId, []))
        );
      }
      const replies = db.$with("replies").as(
        db
          .select({
            parentId: comments.parentId,
            count: count(comments.id).as("count"),
          })
          .from(comments)
          .where(isNotNull(comments.parentId))
          .groupBy(comments.parentId)
      );
      const [totalCount, data] = await Promise.all([
        db
          .select({ count: count() })
          .from(comments)
          .where(and(eq(comments.videoId, videoId), isNull(comments.parentId))), // remove null to count replies as comment
        db
          .with(viewerReaction,replies)
          .select({
            ...getTableColumns(comments),
            user: users,
            viewerReaction: viewerReaction.reaction,
            replyCount: replies.count,
            likeCount: db.$count(
              commentsReaction,
              and(
                eq(commentsReaction.reaction, "like"),
                eq(commentsReaction.commentId, comments.id)
              )
            ),
            dislikeCount: db.$count(
              commentsReaction,
              and(
                eq(commentsReaction.reaction, "dislike"),
                eq(commentsReaction.commentId, comments.id)
              )
            ),
          })
          .from(comments)
          .where(
            and(
              eq(comments.videoId, videoId),
              parentId ? eq(comments.parentId,parentId):
              isNull(comments.parentId),
              cursor
                ? or(
                    lt(comments.updatedAt, cursor.updatedAt),
                    and(
                      eq(comments.updatedAt, cursor.updatedAt),
                      lt(comments.id, cursor.id)
                    )
                  )
                : undefined
            )
          )
          .innerJoin(users, eq(comments.userId, users.id))
          .leftJoin(viewerReaction, eq(viewerReaction.commentId, comments.id))
          .leftJoin(replies, eq(comments.id, replies.parentId))
          .orderBy(desc(comments.updatedAt), desc(comments.id))
          .limit(limit + 1),
      ]);
      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      return { items, nextCursor, totalCount: totalCount[0].count };
    }),
});
