"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { trpc } from "@/trpc/client";
import { cn } from "@/lib/utils";
import VideoPlayer from "@/modules/studio/ui/component/videoPlayer";
import VideoBanner from "@/modules/videos/component/videoBanner";
import VideoTopRow,{VideoTopRowSkeleton} from "@/modules/videos/component/videoTopRow";
import { useAuth } from "@clerk/nextjs";
import { VideoPlayerSkeleton } from "../component/videoPlayer";

interface VideoSectionProps {
  videoId: string;
}
const VideoSectionSkeleton = () => {
  return (
    <>
    <VideoPlayerSkeleton />
    <VideoTopRowSkeleton />
    </>
  )
}
const videoSection = ({ videoId }: VideoSectionProps) => {
  return (
    <Suspense fallback={<VideoSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <VideoSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};
const VideoSectionSuspense = ({ videoId }: VideoSectionProps) => {
  const {isSignedIn} = useAuth()
  const utils = trpc.useUtils()
  const [ video ]= trpc.videos.getOne.useSuspenseQuery({ id: videoId });
  const createView = trpc.videoViews.create.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({id:videoId})
    }
  })
  const handlePlay = () =>{
    if (!isSignedIn) {
      return
    }
    createView.mutate({videoId})
  }
  return (
    <>
      <div
        className={cn(
          "bg-background rounded-xl aspect-video relative overflow-hidden",
          video.muxStatus !== "ready" && "rounded-b-none"
        )}
      >
        <VideoPlayer
            autoPlay={false}
            onPlay={handlePlay}
            title={video.title}
            playBackId={video.muxPlaybackId}
            thumbnail={video.thumbnailUrl}
        />
      </div>
      <VideoBanner status={video.muxStatus  } />
      <VideoTopRow video={video} />
    </>
  );
};

export default videoSection;
