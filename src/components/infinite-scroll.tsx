import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useEffect } from "react";
import { Button } from "./ui/button";

interface InfiniteScrollProps {
  isManual?: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export const InfiniteScroll = ({
  isManual = false,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: InfiniteScrollProps) => {
    const { ref, isIntersecting } = useIntersectionObserver({
        threshold: 0.5,
        rootMargin: '100px',
    });

    useEffect(() => {
        if (isIntersecting && hasNextPage && !isFetchingNextPage && !isManual) {
            fetchNextPage();
        }
    }, [isIntersecting, hasNextPage,isManual, isFetchingNextPage, fetchNextPage]); 
    // added isManual above

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <div ref={ref} className="h-1"></div>
            {
                hasNextPage ? (
                    <Button
                        variant="secondary"
                        onClick={() => fetchNextPage()}
                        disabled={!hasNextPage || isFetchingNextPage}
                    >
                        {isFetchingNextPage ? 'Loading...' : 'Load more'}
                    </Button>
                ) : (
                    <p className="text-sm text-muted-foreground" >You reached the end of the list</p>
                )
            }
        </div>
    )
};
