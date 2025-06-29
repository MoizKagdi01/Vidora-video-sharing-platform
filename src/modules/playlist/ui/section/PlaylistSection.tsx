"use client";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import PlaylistGridCard, { PlaylistGridCardSkeleton } from "../../playlistGridCard";

const PlaylistSection = () => {
  return (
    <Suspense fallback={<PlaylistSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <PlaylistSectionSuspense  />
      </ErrorBoundary>
    </Suspense>
  );
};

const PlaylistSectionSkeleton = () => {
  return <div> 
        <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5  [@media(min-width:2200px)]:grid-cols-6">
        {Array.from({length:5}).map((_,index) => (
            <PlaylistGridCardSkeleton key={index} />
          ))}</div></div>;
};
const PlaylistSectionSuspense = () => {
  const [playlist, query] = trpc.playlist.playlistVideos.useSuspenseInfiniteQuery(
    { limit: 5 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  return (
    <>
      <div className="gap-4 gap-y-10  grid-cols-1 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
        {playlist.pages
          .flatMap((page) => page.items)
          .map((playlist) => (
            <PlaylistGridCard  key={playlist.id} playlist={playlist} />
          ))}
      </div>
        <InfiniteScroll
          hasNextPage={query.hasNextPage}
          fetchNextPage={query.fetchNextPage}
          isFetchingNextPage={query.isFetchingNextPage}
        />
    </>
  );
};

export default PlaylistSection;
