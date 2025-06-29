"use client";
import { InfiniteScroll } from "@/components/infinite-scroll";
import VideoGridCard, { VideoGridCardSkeleton } from "@/modules/videos/component/VideoGridCard";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface VideoSectionProps {
  userId: string;
}
const VideoSection = ({ userId }: VideoSectionProps) => {
  return (
    <Suspense key={userId} fallback={<VideoSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <VideoSectionSuspense userId={userId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const VideoSectionSkeleton = () => {
  return <div> 
        <div className="gap-4 gap-y-10 grid-cols-1 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
        {Array.from({length:5}).map((_,index) => (
            <VideoGridCardSkeleton key={index} />
          ))}</div></div>;
};
const VideoSectionSuspense = ({ userId }: VideoSectionProps) => {
  const [videos, query] = trpc.videos.getMany.useSuspenseInfiniteQuery(
    { userId, limit: 5 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  return (
    <div>
      <div className="gap-4 gap-y-10  grid-cols-1 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5  [@media(min-width:2200px)]:grid-cols-6">
        {videos.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoGridCard key={video.id} data={video} />
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
