"use client";

import { trpc } from "@/trpc/client";
import VideoGridCard, { VideoGridCardSkeleton } from "../../component/VideoGridCard";
import VideoRowCard, { VideoRowCardSkeleton } from "../../component/VideoRowCard";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
interface SuggestionSectionProps {
  videoId: string;
  isManual ?: boolean
}
const SuggestionSection = ({ videoId,isManual }: SuggestionSectionProps) => {
  return (
    <Suspense fallback={<SuggestionSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error</p>} >
        <SuggestionSectionSuspense videoId={videoId} isManual={isManual} />
      </ErrorBoundary>
    </Suspense>
  )
}

const SuggestionSectionSkeleton = () => {
  return (
    <>
      <div className="hidden md:block space-y-3">
        {
          Array.from({length:6}).map((_, index)=> (
            (<VideoRowCardSkeleton key={index} size={"compact"} />)
          ))
        }
      </div>
      <div className="md:hidden block space-y-10">
        {
          Array.from({length:6}).map((_, index)=> (
            (<VideoGridCardSkeleton key={index} />)
          ))
        }
      </div>
    </>
  )
}

const SuggestionSectionSuspense = ({ videoId,isManual }: SuggestionSectionProps) => {
  const [suggestions, query] =
    trpc.suggestions.getMany.useSuspenseInfiniteQuery(
      { videoId, limit: 5 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );
  return (
    <>
      <div className="hidden md:block space-y-3">
        {suggestions.pages.flatMap((page) =>
          page.items.map((video) => (
            <VideoRowCard data={video} size="compact" key={video.id} />
          ))
        )}
      </div>
      <div className="block md:hidden space-y-10">
        {suggestions.pages.flatMap((page) =>
          page.items.map((video) => (
            <VideoGridCard data={video} key={video.id} />
          ))
        )}
      </div>
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        fetchNextPage={query.fetchNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        isManual={isManual}
      />
    </>
  );
};

export default SuggestionSection;
