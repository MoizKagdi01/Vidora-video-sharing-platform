import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { HistoryView } from "@/modules/playlist/ui/view/HistoryView";

export const dynamic = "force-dynamic";
const Page = async () => {
  const queryClient = getQueryClient();
  void trpc.playlist.getMany({limit: 5}) 
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <HistoryView />
      </Suspense>
    </HydrationBoundary>
  );
}

export default Page;
