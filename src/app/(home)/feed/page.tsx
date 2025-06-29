import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";
import { HomeView } from "@/modules/home/ui/views/home-view";
import { Suspense } from "react";   

export const dynamic = "force-dynamic";
const Page = async () => {
  const queryClient = getQueryClient();
  
  void trpc.videos.getMany({limit: 5}) 
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <HomeView  />
      </Suspense>
    </HydrationBoundary>
  );
}

export default Page;
