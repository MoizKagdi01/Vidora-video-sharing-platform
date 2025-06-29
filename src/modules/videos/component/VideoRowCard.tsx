import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { VideoGetManyOutput } from "../types";
import Link from "next/link";
import VideoThumbnail, { VideoThumbnailSkeleton } from "./videoThumbnail";
import VideoMenu from "./VideoMenu";
import { useMemo } from "react";
import UserAvatar from "@/components/user-avatar";
import UserInfo from "@/modules/users/ui/components/UserInfo";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

const VideoRowCardVariants = cva("group flex min-w-0", {
  variants: {
    size: {
      default: "gap-4",
      compact: "gap-2",
    },
  },
  defaultVariants: {
    size: "default",
  },
});
const ThumbnailVariants = cva("relative flex-none", {
  variants: {
    size: {
      default: "w-[38%]",
      compact: "w-[168px]",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface VideoRowCardProps extends VariantProps<typeof VideoRowCardVariants> {
  data: VideoGetManyOutput["items"][number];
  onRemove?: () => void;
}

export const VideoRowCardSkeleton = ({ size="default" }: VariantProps<typeof VideoRowCardVariants>) => {
  return <div className={VideoRowCardVariants({size})}>
    <div className={ThumbnailVariants({size})}>
        <VideoThumbnailSkeleton />
    </div>
    <div className="flex min-w-0">
        <div className="flex justify-between gap-x-2">
            <Skeleton className={cn("h-5 w-[40%]", size === "compact" &&  "h-4 w-[40%]")} />
            {
                size === "default" && (
                    <>
                        <Skeleton className="h-4 w-[20% mt-1"  />
                        <div className="flex gap-2 my-3 items-center">
                            <Skeleton className="size-8 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </>
                )
            }
            {
                size === "compact" && (
                    <>
                        <Skeleton className="h-4 mt-1 w-[50%]" />
                    </>
                )
            }
        </div>
    </div>
  </div>;
};
const VideoRowCard = ({ data, size="default", onRemove }: VideoRowCardProps) => {
  const compactViewCount = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(data.viewCount);
  }, [data.viewCount]);
  const compactLikeCount = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(data.likeCount);
  }, [data.likeCount]);
  return (
    <div className={VideoRowCardVariants({ size })}>
      <Link prefetch href={`/videos/${data.id}`} className={ThumbnailVariants({ size })}>
        <VideoThumbnail
          imageUrl={data.thumbnailUrl}
          previewUrl={data.previewUrl}
          title={data.title}
          duration={data.duration}
        />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-x-2">
          <Link prefetch className="flex-1 min-w-0" href={`/videos/${data.id}`}>
            <h3
              className={cn(
                "font-medium line-clamp-2",
                size === "compact" ? "text-sm" : "text-base"
              )}
            >
              {data.title}
            </h3>
            {size === "default" && (
              <p className="text-xs text-muted-foreground mt-1">
                {compactViewCount} views • {compactLikeCount} likes
              </p>
            )}
            {size === "default" && (
                <>
                <div className="flex items-center gap-2 my-3">
                  <UserAvatar
                    size={"sm"}
                    imageUrl={data.users.imageURL}
                    name={data.users.name}
                  />
                  <UserInfo size={"sm"} name={data.users.name} />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs w-fit line-clamp-2 text-muted-foreground">
                      {data.description ?? "No Description"}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    align="center"
                    className="bg-background/70"
                    >
                    <p>From the Video Description</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
            {size === "compact" && (
                <UserInfo size={"sm"} name={data.users.name} />
            )}
            {size === "compact" && (
              <p className="text-xs text-muted-foreground mt-1">
                {compactViewCount} views • {compactLikeCount} likes
              </p>
            )}
          </Link>
          <div className="flex-none">
            <VideoMenu videoId={data.id} onRemove={onRemove} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoRowCard;
