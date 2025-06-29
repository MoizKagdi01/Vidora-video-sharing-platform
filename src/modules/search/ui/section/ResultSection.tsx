"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { useIsMobile } from "@/hooks/use-mobile";
import VideoGridCard, { VideoGridCardSkeleton } from "@/modules/videos/component/VideoGridCard";
import VideoRowCard from "@/modules/videos/component/VideoRowCard";
import { VideoTopRowSkeleton } from "@/modules/videos/component/videoTopRow";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface resultSectionProps {
    query: string | undefined
    categoryId: string | undefined
}
export const resultSection = ({query,categoryId}: resultSectionProps) => {
return (
    <Suspense key={`${query}-${categoryId}`} fallback={<ResultSectionSkeleton />}>
        <ErrorBoundary fallback={<div>error</div>}>
            <ResultSectionSuspense query={query} categoryId={categoryId} />
        </ErrorBoundary>
    </Suspense>
)
}
const ResultSectionSkeleton = () => {
    return (
        <div className="">
            <div className="hidden flex-col gap-4 md:flex">
                {Array.from({length: 5}).map((_,index)=>(
                    <VideoTopRowSkeleton key={index} />
                ))}
            </div>
            <div className="flex flex-col gap-4 p-4 pt-6 gap-y-10 md:hidden">

                {Array.from({length: 5}).map((_,index)=>(
                    <VideoGridCardSkeleton key={index} />
                ))}
            </div>
        </div>
    )
}
const ResultSectionSuspense = ({query,categoryId}: resultSectionProps) => {
    const isMobile = useIsMobile()
    const [results, resultQuery] = trpc.search.getMany.useSuspenseInfiniteQuery({query, categoryId,limit:5},{
        getNextPageParam: (lastPage) => lastPage.nextCursor
    })

    return (
        <>
            {isMobile ? (
                <div className="flex flex-col gap-4 gap-y-10">
                    {results.pages.flatMap((page)=> page.items).map((video)=> (
                        <VideoGridCard data={video} key={video.id} />
                    ))}
                </div>
            ):(
                <div className="flex flex-col gap-4">
                    {results.pages.flatMap((page)=> page.items).map((video)=> (
                        <VideoRowCard data={video} key={video.id} />
                    ))}
                </div>
            )}
            <InfiniteScroll hasNextPage={resultQuery.hasNextPage} fetchNextPage={resultQuery.fetchNextPage} isFetchingNextPage={resultQuery.isFetchingNextPage} />
        </>
    )
}
export default resultSection