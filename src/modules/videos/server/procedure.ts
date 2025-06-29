import { db } from "@/db";
import {
  videos,
  categories,
  videoUpdateSchema,
  users,
  videoViews,
  videoReaction,
  subscription,
} from "@/db/schema";
import { router, protectedProcedure, baseProcedure } from "@/trpc/init";
import { muxClient } from "@/lib/mux";
import {
  eq,
  and,
  getTableColumns,
  inArray,
  isNotNull,
  or,
  lt,
  desc,
} from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { UTApi } from "uploadthing/server";
import { workflow } from "@/lib/workflow";
export const VideosRouter = router({
  getTrending: baseProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            viewCount: z.number(),
          })
          .nullish(),
        limit: z.number().min(1).max(10).default(10),
      })
    )
    .query(async ({ input }) => {
      const { cursor, limit } = input;
      const viewCountSubQuery = db.$count(
        videoViews,
        eq(videoViews.videoId, videos.id)
      );
      const data = await db
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
        .where(
          and(
            eq(videos.visibility, "public"),
            cursor
              ? or(
                  lt(viewCountSubQuery, cursor.viewCount),
                  and(
                    eq(viewCountSubQuery, cursor.viewCount),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(viewCountSubQuery), desc(videos.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];

      return {
        items,
        nextCursor: hasMore
          ? {
              id: lastItem.id,
              viewCount: lastItem.viewCount,
            }
          : null,
      };
    }),

  subscribed: protectedProcedure
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
    .query(async ({ input,ctx }) => {
      const {id: userId} = ctx.user
      const { cursor, limit } = input;
      const viewerSubscribed = db.$with("viewer_subscription").as(
        db.select({
          userId: subscription.creatorId
        }).from(subscription).where(eq(subscription.viewerId,userId))
      )
      const data = await db
        .with(viewerSubscribed)
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
        .innerJoin(viewerSubscribed, eq(viewerSubscribed.userId,users.id))
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

  getMany: baseProcedure
    .input(
      z.object({
        categoryId: z.string().uuid().nullish(),
        userId: z.string().uuid().nullish(),
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
      const { cursor, limit, categoryId, userId } = input;
      const data = await db
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
        .where(
          and(
            eq(videos.visibility, "public"),
            categoryId ? eq(videos.categoryId, categoryId) : undefined,
            userId ? eq(videos.userId, userId) : undefined,
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

  getOne: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const clerkUserId = ctx.auth?.userId;
      let userId;
      const [user] = await db
        .select()
        .from(users)
        .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []));
      if (user) {
        userId = user.id;
      }
      const viewerReaction = db.$with("video_reaction").as(
        db
          .select({
            videoId: videoReaction.videoId,
            type: videoReaction.type,
          })
          .from(videoReaction)
          .where(inArray(videoReaction.userId, userId ? [userId] : []))
      );
      const viewerSubscription = db.$with("viewer_subscriptions").as(
        db
          .select({
            viewerId: subscription.viewerId,
            creatorId: subscription.creatorId,
          })
          .from(subscription)
          .where(inArray(subscription.viewerId, userId ? [userId] : []))
      );
      const [existingVideo] = await db
        .with(viewerReaction, viewerSubscription)
        .select({
          ...getTableColumns(videos),
          user: {
            ...getTableColumns(users),
            subscriberCount: db.$count(subscription).as("subscriberCount"),
            viewerSubscribed: isNotNull(viewerSubscription.viewerId).mapWith(
              Boolean
            ),
          },
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
          viewerReaction: viewerReaction.type,
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .leftJoin(videoReaction, eq(videoReaction.videoId, videos.id))
        .leftJoin(
          viewerSubscription,
          eq(viewerSubscription.creatorId, users.id)
        )
        .where(eq(videos.id, input.id));
      // .groupBy(videos.id,users.id, viewerReaction.type,viewerSubscription.creatorId );
      if (!existingVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }
      return existingVideo;
    }),
  generateDescription: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflow/description`,
        body: { userId, videoId: input.id },
      });
      return workflowRunId;
    }),
  generateTitle: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflow/title`,
        body: { userId, videoId: input.id },
      });
      return workflowRunId;
    }),
  generateThumbnail: protectedProcedure
    .input(z.object({ id: z.string().uuid(), prompt: z.string().min(10) }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflow/thumbnail`,
        body: { userId, videoId: input.id, prompt: input.prompt },
      });
      return workflowRunId;
    }),
  revalidate: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)));
      if (!existingVideo)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      if (!existingVideo.muxUploadId) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
      const directUpload = await muxClient.video.uploads.retrieve(
        existingVideo.muxUploadId
      );
      if (!directUpload || !directUpload.asset_id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
      const asset = await muxClient.video.assets.retrieve(
        directUpload.asset_id
      );
      if (!asset || !asset.playback_ids) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
      const playbackId = asset.playback_ids[0].id;
      const duration = asset.duration ? Math.round(asset.duration * 1000) : 0;

      const [updatedVideo] = await db
        .update(videos)
        .set({
          muxStatus: asset.status,
          muxPlaybackId: playbackId,
          muxAssetId: asset.id,
          duration: duration,
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning();
      return updatedVideo;
    }),
  restoreThumbnail: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)));
      if (!existingVideo)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      if (existingVideo.thumbnailKey) {
        const api = new UTApi();
        await api.deleteFiles([existingVideo.thumbnailKey]);
        await db.update(videos).set({
          thumbnailKey: null,
          thumbnailUrl: null,
        });
      }
      if (!existingVideo.muxPlaybackId)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      const utApi = new UTApi();
      const tempThumbnailUrl = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.png`;
      const uploadedThumbnail = await utApi.uploadFilesFromUrl([
        tempThumbnailUrl,
      ]);
      const result = uploadedThumbnail[0];
      if (!result?.data) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload thumbnail",
        });
      }
      const { key: thumbnailKey, url: thumbnailUrl } = result.data;

      const [updatedVideo] = await db
        .update(videos)
        .set({
          thumbnailKey,
          thumbnailUrl,
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning();
      return updatedVideo;
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const [removedVideo] = await db
        .delete(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning();
      if (!removedVideo)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      return removedVideo;
    }),
  update: protectedProcedure
    .input(videoUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      if (!input.id) throw new Error("Video ID is required");
      const [updatedVideo] = await db
        .update(videos)
        .set({
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          visibility: input.visibility,
          updatedAt: new Date(),
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning();
      if (!updatedVideo)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      return updatedVideo;
    }),
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user;

    const upload = await muxClient.video.uploads.create({
      cors_origin: "*",
      new_asset_settings: {
        passthrough: userId,
        playback_policy: ["public"],
        input: [
          {
            generated_subtitles: [
              {
                language_code: "en",
                name: "English",
              },
            ],
          },
        ],
        master_access: "temporary",
      },
      // cors_origin: "*",
    });
    // Get the first category as default
    const [defaultCategory] = await db.select().from(categories).limit(1);
    if (!defaultCategory) throw new Error("No categories found");

    const [video] = await db
      .insert(videos)
      .values({
        userId,
        title: "Untitled",
        muxStatus: "pending",
        muxUploadId: upload.id,
        categoryId: defaultCategory.id,
      })
      .returning();

    return { video, url: upload.url };
  }),
});
