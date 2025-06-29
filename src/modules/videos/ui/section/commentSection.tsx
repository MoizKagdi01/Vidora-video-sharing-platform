"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import CommentForm from "@/modules/comment/ui/component/commentForm";
import CommentItem from "@/modules/comment/ui/component/CommentItem";
import { trpc } from "@/trpc/client";
import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
interface commentSectionProps {
  videoId: string;
}
const commentSection = ({ videoId }: commentSectionProps) => {
  return (
    <Suspense fallback={<CommentSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <CommentSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};
const CommentSectionSkeleton = () => {
  return (<div className="mt-6 flex justify-center items-center">
    <Loader2Icon className="text-muted-foreground size-7 animate-spin" />
  </div>)
}

const CommentSectionSuspense = ({ videoId }: commentSectionProps) => {
  const [comments,query] = trpc.comments.getMany.useSuspenseInfiniteQuery(
    { videoId, limit: 5 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  return (
    <div className="mt-6">
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-bold">{comments.pages[0].totalCount} Comments</h1>
        <CommentForm videoId={videoId} />
        <div className="flex flex-col gap-4 mt-2">
          {comments.pages
              .flatMap((page) => page.items).map((comment)=>{
            return (<CommentItem key={comment.id} comment={comment} />)
          })}
          <InfiniteScroll
          isManual
          hasNextPage={query.hasNextPage}
          isFetchingNextPage={query.isFetchingNextPage}
          fetchNextPage={query.fetchNextPage}
          />
        </div>
      </div>
    </div>
  );
};

export default commentSection;
