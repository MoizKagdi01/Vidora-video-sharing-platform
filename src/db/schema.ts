import {
  pgTable,
  uuid,
  text,
  timestamp,
  primaryKey,
  uniqueIndex,
  integer,
  pgEnum,
  foreignKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

export const VideoVisibility = pgEnum("video_visibility", [
  "private",
  "public",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").unique().notNull(),
    name: text("name").notNull(),
    bannerUrl: text("banner_url"),
    bannerKey: text("banner_key"),
    imageURL: text("image_url").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("clerk_id_idx").on(t.clerkId)]
);

export const usersRelations = relations(users, ({ many }) => ({
  videos: many(videos),
  videoViews: many(videoViews),
  comments:many(comments),
  commentsReaction: many(commentsReaction),
  videoReaction: many(videoReaction),
  subscription: many(subscription, {
    relationName: "subscription_viewer_id_fk",
  }),
  subscribers: many(subscription, {
    relationName: "subscription_creator_id_fk",
  }),
  playlists: many(playlists),
}));

export const subscription = pgTable(
  "subscription",
  {
    creatorId: uuid("creator_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    viewerId: uuid("viewer_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    primaryKey({
      name: "subscription_pk",
      columns: [t.creatorId, t.viewerId],
    }),
  ]
);
export const subscriptionRelation = relations(subscription, ({ one }) => ({
  viewer: one(users, {
    fields: [subscription.viewerId],
    references: [users.id],
    relationName: "subscription_viewer_id_fk",
  }),
  creator: one(users, {
    fields: [subscription.creatorId],
    references: [users.id],
    relationName: "subscription_creator_id_fk",
  }),
}));

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("name_idx").on(t.name)]
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  videos: many(videos),
}));

export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),

  muxStatus: text("mux_status"),
  muxUploadId: text("mux_upload_id").unique(),
  muxAssetId: text("mux_asset_id").unique(),
  muxPlaybackId: text("mux_playback_id").unique(),
  thumbnailUrl: text("thumbnail_url"),
  thumbnailKey: text("thumbnail_key"),
  previewUrl: text("preview_url"),
  previewKey: text("preview_key"),
  duration: integer("duration").default(0).notNull(),
  visibility: VideoVisibility("visibility").default("private").notNull(),
  muxTrackId: text("mux_track_id").unique(),
  muxTrackStatus: text("mux_track_status"),

  categoryId: uuid("category_id")
    .references(() => categories.id, { onDelete: "set null" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const videoInsertSchema = createInsertSchema(videos);
export const videoSelectSchema = createSelectSchema(videos);
export const videoUpdateSchema = createUpdateSchema(videos);

export const videosRelations = relations(videos, ({ one, many }) => ({
  user: one(users, {
    fields: [videos.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [videos.categoryId],
    references: [categories.id],
  }),
  views: many(videoViews),
  reactions: many(videoReaction),
  comments: many(comments),
}));

export const comments = pgTable("comments",{
  id: uuid("id").primaryKey().defaultRandom(),
  parentId: uuid("parent_id"),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  videoId: uuid("video_id")
    .references(() => videos.id, { onDelete: "cascade" })
    .notNull(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
},(t)=>{
  return [
    foreignKey({
      columns: [t.parentId],
      foreignColumns: [t.id],
      name: "comment_parent_id_fk"
    }).onDelete("cascade")
  ]
})

export const playlistVideos = pgTable("playlist_videos",{
  playlistId: uuid("playlist_id").references(() => playlists.id, { onDelete: "cascade" }).notNull(),
  videoId: uuid("video_id").references(() => videos.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
},(t)=> [
  primaryKey({
    name: "playlist_videos_pk",
    columns: [t.playlistId, t.videoId]
  })
])

export const playlistVideoRelation = relations(playlistVideos,({one}) => ({
  playlist: one(playlists,{
    fields: [playlistVideos.playlistId],
    references: [playlists.id]
  }),
  video: one(videos,{
    fields: [playlistVideos.videoId],
    references: [videos.id]
  }),
}))

export const playlists = pgTable("playlist",{
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("Description"),
  userId: uuid().references(()=> users.id,{onDelete:"cascade"}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const playlistRelation = relations(playlists,({one,many}) => ({
  user: one(users,{
    fields: [playlists.userId],
    references: [users.id]
  }),
  playlistVideo: many(playlistVideos),
}))

export const commentsRelation = relations(comments,({one,many}) => ({
  user: one(users,{
    fields: [comments.userId],
    references: [users.id]
  }),
  video: one(videos,{
    fields: [comments.videoId],
    references: [videos.id]
  }),
  parent: one(comments,{
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "comment_parent_id_fk"
  }),
  reactions: many(commentsReaction),
  replies: many(comments,{
    relationName: "comment_parent_id_fk"
  })
}))
export const commentInsertSchema = createInsertSchema(comments);
export const commentSelectSchema = createSelectSchema(comments);
export const commentUpdateSchema = createUpdateSchema(comments);

export const reactionType = pgEnum("reaction_type", ["like", "dislike"]);
 
export const commentsReaction = pgTable("comment_reaction",{
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    commentId: uuid("comment_id")
      .references(() => comments.id, { onDelete: "cascade" })
      .notNull(),
    reaction: reactionType("reaction").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
},
  (t) => [
    primaryKey({
      name: "comment_reaction_pk",
      columns: [t.commentId, t.userId],
    }),
  ])
  
export const commentReactionRelation = relations(commentsReaction, ({ one }) => ({
  users: one(users, {
    fields: [commentsReaction.userId],
    references: [users.id],
  }),
  comment: one(comments, {
    fields: [commentsReaction.commentId],
    references: [comments.id],
  }),
}));


export const videoViews = pgTable(
  "video_views",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    videoId: uuid("video_id")
      .references(() => videos.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    primaryKey({
      name: "video_views_pk",
      columns: [t.videoId, t.userId],
    }),
  ]
);

export const videoViewRelations = relations(videoViews, ({ one }) => ({
  users: one(users, {
    fields: [videoViews.userId],
    references: [users.id],
  }),
  videos: one(videos, {
    fields: [videoViews.videoId],
    references: [videos.id],
  }),
}));

export const videoViewInsertSchema = createInsertSchema(videoViews);
export const videoViewSelectSchema = createSelectSchema(videoViews);
export const videoViewUpdateSchema = createUpdateSchema(videoViews);

export const videoReaction = pgTable(
  "video_reaction",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    videoId: uuid("video_id")
      .references(() => videos.id, { onDelete: "cascade" })
      .notNull(),
    type: reactionType("type").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    primaryKey({
      name: "video_reaction_pk",
      columns: [t.videoId, t.userId],
    }),
  ]
);

export const videoReactionRelation = relations(videoReaction, ({ one }) => ({
  users: one(users, {
    fields: [videoReaction.userId],
    references: [users.id],
  }),
  videos: one(videos, {
    fields: [videoReaction.videoId],
    references: [videos.id],
  }),
}));

export const videoReactionInsertSchema = createInsertSchema(videoReaction);
export const videoReactionSelectSchema = createSelectSchema(videoReaction);
export const videoReactionUpdateSchema = createUpdateSchema(videoReaction);
