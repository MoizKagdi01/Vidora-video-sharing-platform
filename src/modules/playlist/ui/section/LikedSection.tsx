"use client";
import { InfiniteScroll } from "@/components/infinite-scroll";
import VideoGridCard, { VideoGridCardSkeleton } from "@/modules/videos/component/VideoGridCard";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const LikedSection = () => {
  return (
    <Suspense fallback={<LikedSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <LikedSectionSuspense  />
      </ErrorBoundary>
    </Suspense>
  );
};

const LikedSectionSkeleton = () => {
  return <div> 
        <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5  [@media(min-width:2200px)]:grid-cols-6">
        {Array.from({length:5}).map((_,index) => (
            <VideoGridCardSkeleton key={index} />
          ))}</div></div>;
};
const LikedSectionSuspense = () => {
  const [videos, query] = trpc.playlist.getLiked.useSuspenseInfiniteQuery(
    { limit: 5 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  return (
    <div>
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {videos.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoGridCard key={video.id} data={video} />
          ))}
      </div>
      <div className="flex-col gap-4 gap-y-10 hidden md:flex">
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

export default LikedSection;
