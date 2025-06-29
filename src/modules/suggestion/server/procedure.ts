import { db } from "@/db";
import { users, videoReaction, videos, videoViews } from "@/db/schema";
import { router, baseProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { eq, desc, and, or, lt, getTableColumns, not } from "drizzle-orm";
import { z } from "zod";

export const suggestionRouter = router({
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(10).default(10),
      })
    )
    .query(async ({ input }) => {
      const { cursor, limit, videoId } = input;
      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(eq( videos.id, videoId));
      if (!existingVideo) {
        throw new TRPCError({code:"NOT_FOUND"})
      }
      const data = await db
        .select({
          ...getTableColumns(videos),
          viewCount: db.$count(videoViews, eq( videoViews.videoId,videoId)),
          likeCount: db.$count(videoReaction, and(
            eq(videoReaction.videoId, videoId),
            eq(videoReaction.type, "like")
          )),
          dislikeCount: db.$count(videoReaction, and(
            eq(videoReaction.videoId, videoId),
            eq(videoReaction.type, "dislike")
          )),
          users: users
        })
        .from(videos)
        .innerJoin(users,eq(users.id, videos.userId))
        .where(
          and(
            not(eq(videos.id, existingVideo.id)),
            eq(videos.visibility, "public"),
              existingVideo.categoryId ?
            eq(
                videos.categoryId, existingVideo.categoryId
            ): undefined,
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
