import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";
import { Suspense } from "react";   
import { SubscriptionView } from "@/modules/home/ui/views/SubscriptionView";

export const dynamic = "force-dynamic";
const Page = async () => {
  const queryClient = getQueryClient();
  
  void trpc.videos.subscribed({limit: 5}) 
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <SubscriptionView  />
      </Suspense>
    </HydrationBoundary>
  );
}

export default Page;
