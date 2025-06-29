import { VideoGetOneOutput } from "@/modules/videos/types";
import VideoReaction from "./VideoReaction";
import VideoMenu from "./VideoMenu";
import VideoOwner from "./VideoOwner";
import VideoDescription from "./VideoDescription";
import { useMemo } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
interface videoTopRowProps {
  video: VideoGetOneOutput;
}
export const VideoTopRowSkeleton = () =>{
  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <Skeleton className="h-6 w-4/5 md:w-2/5" />
      </div>
      <div className="flex items-center justify-between w-full ">
        <div className="flex items-center gap-3 w-[70%]">
          <Skeleton className="w-10 h-10 shrink-0 rounded-full" />
          <div className="flex flex-col gap-2 w-full">
            <Skeleton className="h-5 w-4/5 md:w-2/6" />
            <Skeleton className="h-5 w-4/5 md:w-1/5" />
          </div>
        </div>
        <Skeleton className="h-9 w-2/6 md:w-1/6 rounded-full" />
      </div>
      <div className="h-[120px] w-full"></div>
    </div>
  )
}
const VideoTopRow = ({ video }: videoTopRowProps) => {
  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(video.viewCount);
  }, [video.viewCount]);
  const ExpandViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "standard",
    }).format(video.viewCount);
  }, [video.viewCount]);
  const compactDate = useMemo(() => {
    return formatDistanceToNow(video.createdAt, { addSuffix: true });
  }, [video.createdAt]);
  const ExpandDate = useMemo(() => {
    return format(video.createdAt, "d MMM yyyy");
  }, [video.createdAt]);
  return (
    <div className="flex flex-col gap-4 mt-4">
      <h1 className="text-lx font-semibold ">{video.title}</h1>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <VideoOwner user={video.user} videoId={video.id} />
        <div className="flex overscroll-x-auto sm:min-w-[calc(50%-6px)] sm:justify-end sm:overflow-visible pb-2 -mb-2 sm:pb-0 sm:mb-0 gap-2">
          <VideoReaction videoId={video.id} likes={video.likeCount} dislikes={video.dislikeCount} viewerReaction={video.viewerReaction} />
          <VideoMenu videoId={video.id} variant="secondary" />
        </div>
      </div>
      <VideoDescription
        compactViews={compactViews}
        expandViews={ExpandViews}
        expandDate={ExpandDate}
        compactDate={compactDate}
        description={video.description}
      />
    </div>
  );
};

export default VideoTopRow;
