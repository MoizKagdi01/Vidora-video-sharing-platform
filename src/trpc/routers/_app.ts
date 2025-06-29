import { categoriesRouter } from "@/modules/server/procedures";
import { router } from "../init";
import { studioRouter } from "@/modules/studio/server/procedures";
import { VideosRouter } from "@/modules/videos/server/procedure";
import { videoViewsRouter } from "@/modules/videoViews/server/procedure";
import { videoReactionRouter } from "@/modules/videoReaction/server/procedure";
import { SubscriptionRouter } from "@/modules/subscription/server/procedure";
import { CommentRouter } from "@/modules/comment/server/procedure";
import { commentReactionRouter } from "@/modules/commentReaction/server/procedure";
import { suggestionRouter } from "@/modules/suggestion/server/procedure";
import { searchRouter } from "@/modules/search/server/procedures";
import { PlaylistRouter } from "@/modules/playlist/server/procedure";
import { usersRouter } from "@/modules/users/server/procedure";

export const appRouter = router({
  categories: categoriesRouter,
  studio: studioRouter,
  videos: VideosRouter, 
  videoViews:videoViewsRouter,
  videoReaction:videoReactionRouter,
  subscriptions: SubscriptionRouter,
  comments: CommentRouter,
  search: searchRouter,
  commentsReaction: commentReactionRouter,
  suggestions: suggestionRouter,
  playlist: PlaylistRouter,
  users: usersRouter, 
});
// export type definition of API
export type AppRouter = typeof appRouter;