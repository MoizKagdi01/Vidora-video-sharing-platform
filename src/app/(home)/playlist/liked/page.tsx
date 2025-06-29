import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { LikedView } from "@/modules/playlist/ui/view/LikedView";

export const dynamic = "force-dynamic";
const Page = async () => {
  const queryClient = getQueryClient();
  void trpc.playlist.getLiked({limit: 5}) 
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <LikedView />
      </Suspense>
    </HydrationBoundary>
  );
}

export default Page;
