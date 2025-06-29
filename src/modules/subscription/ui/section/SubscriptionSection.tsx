"use client";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";
import SubscriptionItem, { SubscriptionItemSkeleton } from "../component/SubscriptionItem";

const SubscriptionSection = () => {
  return (
    <Suspense fallback={<SubscriptionSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <SubscriptionSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const SubscriptionSectionSkeleton = () => {
  return (
    <div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <SubscriptionItemSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};
const SubscriptionSectionSuspense = () => {
  const utils = trpc.useUtils();

  const unsubscribe = trpc.subscriptions.remove.useMutation({
    onSuccess: (data) => {
      utils.videos.subscribed.invalidate();
      utils.subscriptions.getMany.invalidate();
      utils.users.getOne.invalidate({ id: data.creatorId });
      toast.success("Unsubscribed");
    },
    onError: () => {
      toast.error("Somethin went wrong");
    },
  });

  const [subscriptions, query] =
    trpc.subscriptions.getMany.useSuspenseInfiniteQuery(
      { limit: 5 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );
  return (
    <div>
      <div className="flex flex-col gap-4">
        {subscriptions.pages
          .flatMap((page) => page.items)
          .map((subscription) => (
            <Link
              href={`/users/${subscription.users.id}`}
              key={subscription.creatorId}
            >
              <SubscriptionItem
                name={subscription.users.name}
                imageUrl={subscription.users.imageURL}
                subscriberCount={subscription.users.subscriberCount}
                onUnsubscribe={() =>
                  unsubscribe.mutate({ userId: subscription.creatorId })
                }
                disabled={unsubscribe.isPending}
              />
            </Link>
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

export default SubscriptionSection;
