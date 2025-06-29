import { db } from "@/db";
import {
  comments,
  users,
  videoReaction,
  videos,
  videoViews,
} from "@/db/schema";
import { router, protectedProcedure } from "@/trpc/init";
import { eq, desc, and, or, lt, getTableColumns } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const studioRouter = router({
  getOne: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const { id: userId } = ctx.user;

      try {
        const [video] = await db
          .select()
          .from(videos)
          .where(and(eq(videos.id, id), eq(videos.userId, userId)));

        if (!video) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Video not found or you don't have access to it",
          });
        }

        return video;
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch video",
          cause: error,
        });
      }
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(10).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;
      const { id: userId } = ctx.user;
      const data = await db
        .select({
          ...getTableColumns(videos),
          user: users,
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          commentCount: db.$count(comments, eq(comments.videoId, videos.id)),
          likeCount: db.$count(
            videoReaction,
            and(
              eq(videoReaction.videoId, videos.id),
              eq(videoReaction.type, "like")
            )
          ),
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .where(
          and(
            eq(videos.userId, userId),
            cursor
              ? or(
                  lt(videos.updatedAt, cursor.updatedAt),
                  and(
                    eq(videos.updatedAt, cursor.updatedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(videos.updatedAt), desc(videos.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];

      return {
        items,
        nextCursor: hasMore
          ? {
              id: lastItem.id,
              updatedAt: lastItem.updatedAt,
            }
          : null,
      };
    }),
});
