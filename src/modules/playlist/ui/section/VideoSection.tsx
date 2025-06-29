"use client";
import { InfiniteScroll } from "@/components/infinite-scroll";
import VideoGridCard, {
  VideoGridCardSkeleton,
} from "@/modules/videos/component/VideoGridCard";
import VideoRowCard from "@/modules/videos/component/VideoRowCard";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";
interface VideoSectionProps {
  playlistId: string;
}
const VideoSection = ({ playlistId }: VideoSectionProps) => {
  return (
    <Suspense fallback={<VideoSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <VideoSectionSuspense playlistId={playlistId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const VideoSectionSkeleton = () => {
  return (
    <div>
      <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5  [@media(min-width:2200px)]:grid-cols-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};
const VideoSectionSuspense = ({ playlistId }: VideoSectionProps) => {
  const [videos, query] =
    trpc.playlist.getPlaylistVideos.useSuspenseInfiniteQuery(
      { limit: 5, playlistId },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );
  const utils = trpc.useUtils();
  const removeVideoFromPlaylist = trpc.playlist.removeVideo.useMutation({
    onSuccess: (data) => {
      utils.playlist.playlistVideos.invalidate();
      utils.playlist.getManyPlaylistVideo.invalidate({ videoId: data.videoId });
      utils.playlist.getOne.invalidate({ id: data.playlistId });
      utils.playlist.getPlaylistVideos.invalidate({
        playlistId: data.playlistId,
      });
      toast.success("Video removed from playlist successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add video to playlist: ${error.message}`);
    },
  });
  return (
    <div>
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {videos.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoGridCard
              onRemove={() => removeVideoFromPlaylist.mutate({ playlistId, videoId: video.id })}
              key={video.id}
              data={video}
            />
          ))}
      </div>
      <div className="flex-col gap-4 gap-y-10 hidden md:flex">
        {videos.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoRowCard
              onRemove={()=> removeVideoFromPlaylist.mutate({ playlistId, videoId: video.id })}
              key={video.id}
              data={video}
            />
          ))}
      </div>
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        fetchNextPage={query.fetchNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
      />
    </div>
  );
};

export default VideoSection;
