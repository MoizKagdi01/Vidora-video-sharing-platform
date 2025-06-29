import { db } from "@/db";
import {
  videos,
  users,
  videoViews,
  videoReaction,
  playlists,
  playlistVideos,
} from "@/db/schema";
import { router, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { eq, and, getTableColumns, or, lt, desc, sql } from "drizzle-orm";
import { z } from "zod";
export const PlaylistRouter = router({
  remove : protectedProcedure.input(
    z.object({
      id: z.string().uuid()
    })
  ).mutation(async ({ input, ctx }) => {
    const { id } = input;
    const { id: userId } = ctx.user;
    const [existingPlaylist] = await db
      .select()
      .from(playlists)
      .where(and(eq(playlists.id, id), eq(playlists.userId, userId)));
    if (!existingPlaylist) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Playlist not found" });
    }
    const [deletedPlaylist] = await db
      .delete(playlists)
      .where(and(eq(playlists.id, id), eq(playlists.userId, userId)))
      .returning();
    if (!deletedPlaylist) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Failed to delete playlist" });
    }
    return deletedPlaylist;
  }),
  getOne : protectedProcedure.input(
    z.object({
      id: z.string().uuid(),
    })
  ).query(async ({ input,ctx }) => {
    const { id } = input;
    const {id:  userId} = ctx.user;
    const [existingPlaylist] = await db
      .select()
      .from(playlists)
      .where(and(eq(playlists.id, id), eq(playlists.userId, userId)));
    if (!existingPlaylist) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Playlist not found" });
    }
    return existingPlaylist;
  }),
  removeVideo: protectedProcedure
    .input(z.object({ 
      playlistId: z.string().uuid(),
      videoId: z.string().uuid(),
     }))
    .mutation(async ({ input, ctx }) => {
      const { playlistId, videoId } = input;
      const { id: userId } = ctx.user;
      const [existingPlaylist] = await db
        .select().from(playlists)
        .where(eq(playlists.id, playlistId));
      if (!existingPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Playlist not found" });
      }
      if (existingPlaylist.userId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You do not have permission to add videos to this playlist" });
      }
      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(
            eq(videos.id,videoId)
          )
        if (!existingVideo) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
        }
        const [existingPlaylistVideo] = await db
        .select()
        .from(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            eq(playlistVideos.videoId, videoId)
          )
        );
        if (!existingPlaylistVideo) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Video not found in playlist" });
        }
      const [deletedPlaylistVideo] = await db
        .delete(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            eq(playlistVideos.videoId, videoId)
          )
        )
        .returning();

      if (!deletedPlaylistVideo) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Failed to remove video from playlist" });
      }
      return deletedPlaylistVideo;
    }),
  addVideo: protectedProcedure
    .input(z.object({ 
      playlistId: z.string().uuid(),
      videoId: z.string().uuid(),
     }))
    .mutation(async ({ input, ctx }) => {
      const { playlistId, videoId } = input;
      const { id: userId } = ctx.user;
      const [existingPlaylist] = await db
        .select().from(playlists)
        .where(eq(playlists.id, playlistId));
      if (!existingPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Playlist not found" });
      }
      if (existingPlaylist.userId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You do not have permission to add videos to this playlist" });
      }
      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(
            eq(videos.id,videoId)
          )
        if (!existingVideo) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
        }
        const [existingPlaylistVideo] = await db
        .select()
        .from(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            eq(playlistVideos.videoId, videoId)
          )
        );
        if (existingPlaylistVideo) {
          throw new TRPCError({ code: "CONFLICT", message: "Video already exists in playlist" });
        }
      const [createdPlaylistVideo] = await db
        .insert(playlistVideos).values({
          playlistId: playlistId,
          videoId: videoId
        }).returning();

      if (!createdPlaylistVideo) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Failed to add video to playlist" });
      }
      return createdPlaylistVideo;
    }),
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const { name } = input;
      const { id: userId } = ctx.user;
      const [createdPlaylist] = await db
        .insert(playlists)
        .values({
          userId: userId,
          name: name,
        })
        .returning();
      if (!createdPlaylist) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
      return createdPlaylist;
    }),
  getLiked: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            likedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(10).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      const { cursor, limit } = input;
      const { id: userId } = ctx.user;
      const viewerVideoReaction = db.$with("viewer_video_reaction").as(
        db
          .select({
            videoId: videoReaction.videoId,
            likedAt: videoReaction.updatedAt,
          })
          .from(videoReaction)
          .where(
            and(
              eq(videoReaction.userId, userId),
              eq(videoReaction.type, "like")
            )
          )
      );
      const data = await db
        .with(viewerVideoReaction)
        .select({
          ...getTableColumns(videos),
          users: users,
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likeCount: db.$count(
            videoReaction,
            and(
              eq(videoReaction.videoId, videos.id),
              eq(videoReaction.type, "like")
            )
          ),
          dislikeCount: db.$count(
            videoReaction,
            and(
              eq(videoReaction.videoId, videos.id),
              eq(videoReaction.type, "dislike")
            )
          ),
          likedAt: viewerVideoReaction.likedAt,
        })
        .from(videos)
        .innerJoin(users, eq(users.id, videos.userId))
        .innerJoin(
          viewerVideoReaction,
          eq(videos.id, viewerVideoReaction.videoId)
        )
        .where(
          and(
            eq(videos.visibility, "public"),
            cursor
              ? or(
                  lt(viewerVideoReaction.likedAt, cursor.likedAt),
                  and(
                    eq(viewerVideoReaction.likedAt, cursor.likedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(viewerVideoReaction.likedAt), desc(videos.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];

      return {
        items,
        nextCursor: hasMore
          ? {
              id: lastItem.id,
              likedAt: lastItem.likedAt,
            }
          : null,
      };
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            viewedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(10).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      const { cursor, limit } = input;
      const { id: userId } = ctx.user;
      const viewerVideoViews = db.$with("viewer_video_views").as(
        db
          .select({
            videoId: videoViews.videoId,
            viewedAt: videoViews.updatedAt,
          })
          .from(videoViews)
          .where(eq(videoViews.userId, userId))
      );
      const data = await db
        .with(viewerVideoViews)
        .select({
          ...getTableColumns(videos),
          users: users,
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likeCount: db.$count(
            videoReaction,
            and(
              eq(videoReaction.videoId, videos.id),
              eq(videoReaction.type, "like")
            )
          ),
          dislikeCount: db.$count(
            videoReaction,
            and(
              eq(videoReaction.videoId, videos.id),
              eq(videoReaction.type, "dislike")
            )
          ),
          viewedAt: viewerVideoViews.viewedAt,
        })
        .from(videos)
        .innerJoin(users, eq(users.id, videos.userId))
        .innerJoin(viewerVideoViews, eq(videos.id, viewerVideoViews.videoId))
        .where(
          and(
            eq(videos.visibility, "public"),
            cursor
              ? or(
                  lt(viewerVideoViews.viewedAt, cursor.viewedAt),
                  and(
                    eq(viewerVideoViews.viewedAt, cursor.viewedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(viewerVideoViews.viewedAt), desc(videos.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];

      return {
        items,
        nextCursor: hasMore
          ? {
              id: lastItem.id,
              viewedAt: lastItem.viewedAt,
            }
          : null,
      };
    }),
    getPlaylistVideos: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().uuid(),
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(10).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      const { cursor, limit, playlistId } = input;
      const { id: userId } = ctx.user;
      const [existingPlaylist] = await db
        .select()
        .from(playlists)
        .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)));
      if (!existingPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Playlist not found" });
      }
      const videosFromPlaylist = db.$with("playlist_videos").as(
        db
          .select({
            videoId: playlistVideos.videoId,
          })
          .from(playlistVideos)
          .where(eq(playlistVideos.playlistId, playlistId))
      );
      const data = await db
        .with(videosFromPlaylist)
        .select({
          ...getTableColumns(videos),
          users: users,
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likeCount: db.$count(
            videoReaction,
            and(
              eq(videoReaction.videoId, videos.id),
              eq(videoReaction.type, "like")
            )
          ),
          dislikeCount: db.$count(
            videoReaction,
            and(
              eq(videoReaction.videoId, videos.id),
              eq(videoReaction.type, "dislike")
            )
          ),
        })
        .from(videos)
        .innerJoin(users, eq(users.id, videos.userId))
        .innerJoin(videosFromPlaylist, eq(videos.id, videosFromPlaylist.videoId))
        .where(
          and(
            eq(videos.visibility, "public"),
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
  playlistVideos: protectedProcedure
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
    .query(async ({ input, ctx }) => {
      const { cursor, limit } = input;
      const { id: userId } = ctx.user;
      const data = await db
        .select({
          ...getTableColumns(playlists),
          videoCount: db.$count(
            playlistVideos,
            eq(playlistVideos.playlistId, playlists.id)
          ),
          user: users,
          thumbnail: sql<string|null>`(SELECT v.thumbnail_url FROM ${playlistVideos} pv JOIN ${videos} v ON pv.video_id = v.id WHERE pv.playlist_id = ${playlists.id} ORDER BY pv.updated_at DESC LIMIT 1)`,
        })
        .from(playlists)
        .innerJoin(users, eq(users.id, playlists.userId))
        .where(
          and(
            eq(playlists.userId, userId),
            cursor
              ? or(
                  lt(playlists.updatedAt, cursor.updatedAt),
                  and(
                    eq(playlists.updatedAt, cursor.updatedAt),
                    lt(playlists.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(playlists.updatedAt), desc(playlists.id))
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
  getManyPlaylistVideo: protectedProcedure
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
    .query(async ({ input, ctx }) => {
      const { cursor, videoId, limit } = input;
      const { id: userId } = ctx.user;
      const data = await db
        .select({
          ...getTableColumns(playlists),
          videoCount: db.$count(
            playlistVideos,
            eq(playlistVideos.playlistId, playlists.id)
          ),
          user: users,
          containsVideo: videoId
            ? sql<boolean>`(SELECT EXISTS ( SELECT 1 FROM ${playlistVideos} pv WHERE pv.playlist_id = ${playlists.id} AND pv.video_id = ${videoId} ))`
            : sql<boolean>`false`,
        })
        .from(playlists)
        .innerJoin(users, eq(users.id, playlists.userId))
        .where(
          and(
            eq(playlists.userId, userId),
            cursor
              ? or(
                  lt(playlists.updatedAt, cursor.updatedAt),
                  and(
                    eq(playlists.updatedAt, cursor.updatedAt),
                    lt(playlists.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(playlists.updatedAt), desc(playlists.id))
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
