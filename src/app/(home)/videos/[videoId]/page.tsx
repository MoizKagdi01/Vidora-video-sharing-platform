
import { HydrateClient, trpc } from "@/trpc/server";
import VideoView from "@/modules/videos/ui/videoViews";
export const dynamic = 'force-dynamic';
interface VideoIdProps {
  params: Promise<{
    
    videoId: string;
  }>;
}
const VideoId = async ({ params }: VideoIdProps) => {
  const { videoId } =await params;
  
  void trpc.videos.getOne({ id: videoId });
  void trpc.comments.getMany.prefetch({videoId: videoId,limit:5});
  void trpc.suggestions.getMany.prefetch({videoId: videoId,limit:5});
  return (
    <HydrateClient>
        <VideoView videoId={videoId} />
    </HydrateClient>
  );
};

export default VideoId;
