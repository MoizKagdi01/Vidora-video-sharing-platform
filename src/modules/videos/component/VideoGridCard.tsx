
import Link from "next/link";
import { VideoGetManyOutput } from "../types";
import VideoThumbnail, { VideoThumbnailSkeleton } from "./videoThumbnail";
import VideoInfo, { VideoInfoSkeleton } from "./VideoInfo";

interface VideoGridCardProps {
  data: VideoGetManyOutput["items"][number];
  onRemove?: () => void
}
export const VideoGridCardSkeleton = () => {
    return (
        <div className="flex fcol gap-2 w-full">
            <VideoThumbnailSkeleton />
            <VideoInfoSkeleton />
        </div>
    )
}
const VideoGridCard = ({data, onRemove}: VideoGridCardProps) => {
  return (
    <div className="flex flex-col gap-2 w-full group">
        <Link prefetch href={`/videos/${data.id}`} >
            <VideoThumbnail duration={data.duration} previewUrl={data.previewUrl} imageUrl={data.thumbnailUrl} key={data.id} title={data.title} />
        </Link>
        <VideoInfo data={data} onRemove={onRemove} />
    </div>
  )
}

export default VideoGridCard