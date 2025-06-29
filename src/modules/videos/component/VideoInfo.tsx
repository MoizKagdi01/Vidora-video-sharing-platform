
import { useMemo } from "react";
import { VideoGetManyOutput } from "../types";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import UserAvatar from "@/components/user-avatar";
import UserInfo from "@/modules/users/ui/components/UserInfo";
import VideoMenu from "./VideoMenu";
import { Skeleton } from "@/components/ui/skeleton";
interface VideoInfoProps {
    data: VideoGetManyOutput["items"][number];
    onRemove?: () => void;
}
export const VideoInfoSkeleton = () => {
    return (
        <div className="flex gap-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-5 w-[90%]" />
                <Skeleton className="h-5 w-[70%]" />
            </div>
        </div>
    )
}
const VideoInfo = ({data,onRemove}: VideoInfoProps) => {
  const compactViewCount = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(data.viewCount);
  }, [data.viewCount]);
  const compactDate = useMemo(() => {
    return formatDistanceToNow(data.updatedAt, {addSuffix: true})
  }, [data.updatedAt]);
  return (
    <div className="flex gap-3">
        <Link prefetch href={`/users/${data.users.id}`} >
            <UserAvatar imageUrl={data.users.imageURL} name={data.users.name} />
        </Link>
        <div className="min-w-0 flex-1">
            <Link prefetch href={`/videos/${data.id}`} >
                <h3 className="font-medium line-clamp-1 lg:line-clamp-2 text-base break-words">
                    {data.title}
                </h3>
            </Link>
        <Link prefetch href={`/users/${data.users.id}`} >
            <UserInfo name={data.users.name} />
        </Link>
            <Link prefetch href={`/videos/${data.id}`} >
                <p className="text-sm line-clamp-1 text-gray-500">
                    {compactViewCount} views | {compactDate} 
                </p>
            </Link>
        </div>
        <div className="flex-shrink-0">
            <VideoMenu videoId={data.id} onRemove={onRemove} />
        </div>
    </div>
  )
}

export default VideoInfo