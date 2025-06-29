import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";
import { Suspense } from "react";   
import { TrendingView } from "@/modules/home/ui/views/TrendingView";

export const dynamic = "force-dynamic";
const Page = async () => {
  const queryClient = getQueryClient();
  
  void trpc.videos.getTrending({limit: 5}) 
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <TrendingView  />
      </Suspense>
    </HydrationBoundary>
  );
}

export default Page;
