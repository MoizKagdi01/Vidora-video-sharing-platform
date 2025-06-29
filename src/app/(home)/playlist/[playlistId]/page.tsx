import {  HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { VideoView } from "@/modules/playlist/ui/view/VideoView";

export const dynamic = "force-dynamic";
interface HomePageProps {
  params: Promise<{
    playlistId: string;
  }>;
}

const Page = async ({ params }: HomePageProps) => {
  const { playlistId } = await params;
  void trpc.playlist.getOne({id: playlistId});
  void trpc.playlist.getMany({limit: 5})

  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <VideoView playlistId={playlistId} />
      </Suspense>
    </HydrateClient>
  );
}

export default Page;
