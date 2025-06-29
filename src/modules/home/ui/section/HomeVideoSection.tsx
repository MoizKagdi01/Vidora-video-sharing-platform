"use client";
import { useView } from "@/app/(home)/ViewContext";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { cn } from "@/lib/utils";
import VideoGridCard, { VideoGridCardSkeleton } from "@/modules/videos/component/VideoGridCard";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface HomeVideoSectionProps {
  categoryId?: string;
}
const HomeVideoSection = ({ categoryId }: HomeVideoSectionProps) => {
  return (
    <Suspense key={categoryId} fallback={<HomeVideoSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <HomeVideoSectionSuspense categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const HomeVideoSectionSkeleton = () => {
  return <div> 
        <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5  [@media(min-width:2200px)]:grid-cols-6">
        {Array.from({length:5}).map((_,index) => (
            <VideoGridCardSkeleton key={index} />
          ))}</div></div>;
};
const HomeVideoSectionSuspense = ({ categoryId }: HomeVideoSectionProps) => {
  const [videos, query] = trpc.videos.getMany.useSuspenseInfiniteQuery(
    { categoryId,limit: 5 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  const { view } = useView();
  return (
    <div>
      <div className={cn("gap-y-10", view)}>
      {/* <div className="gap-4 gap-y-10  grid-cols-1 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5  [@media(min-width:2200px)]:grid-cols-6"> */}
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

export default HomeVideoSection;
