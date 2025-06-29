import { db } from "@/db";
import { users, videoReaction, videos, videoViews } from "@/db/schema";
import { router, baseProcedure } from "@/trpc/init";
import { eq, desc, and, or, lt, ilike, getTableColumns } from "drizzle-orm";
import { z } from "zod";

export const searchRouter = router({
  getMany: baseProcedure
    .input(
      z.object({
        query: z.string().nullish(),
        categoryId: z.string().uuid().nullish(),
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
      const { cursor, limit, query, categoryId } = input;
      const data = await db
        .select({
          ...getTableColumns(videos),
          users: users,
          viewCount: db.$count(videoViews, eq( videoViews.videoId,videos.id)),
          likeCount: db.$count(videoReaction, and(
            eq(videoReaction.videoId, videos.id),
            eq(videoReaction.type, "like")
          )),
          dislikeCount: db.$count(videoReaction, and(
            eq(videoReaction.videoId, videos.id),
            eq(videoReaction.type, "dislike")
          )),
          
        })
        .from(videos)
        .innerJoin(users,eq(users.id, videos.userId))
        .where(
          and(
            eq(videos.visibility, "public"),
            ilike(videos.title,  `%${query}%`),
            categoryId ? eq(videos.categoryId, categoryId): undefined,
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
