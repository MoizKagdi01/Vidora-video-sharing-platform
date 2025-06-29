import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ListVideoIcon, PlayIcon } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

interface PlaylistThumbnailProps {
  imageUrl?: string;
  title: string;
  videoCount: number;
  className?: string;
}
export const PlaylistThumbnailSkeleton = () => {
return (
        <div className="relative w-full overflow-hidden rounded-xl aspect-video">
      <Skeleton className='size-full' />
    </div>
)
}
const PlaylistThumbnail = ({
  imageUrl,
  title,
  className,
  videoCount,
}: PlaylistThumbnailProps) => {
    const compactVideoCount = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(videoCount);
  }, [videoCount]);
  return (
    <div className={cn("relative pt-3 group", className)}>
      <div className="relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[97%] rounded-xl overflow-hidden bg-black/20 aspect-video"></div>
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[98.5%] rounded-xl overflow-hidden bg-black/25 aspect-video"></div>
        <div className="relative overflow-hidden w-full rounded-xl aspect-video">
          <Image
            src={imageUrl || "./placeholder.svg"}
            className="w-full h-full object-cover"
            alt={title}
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex items-center gap-x-2">
              {" "}
              <PlayIcon className="text-foreground fill-white size-4" />{" "}
              <span className="text-foreground  font-medium"> Play All </span>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-2 right-2 px-1 py-0.5 rounded text-foreground bg-black/70 text-sm font-medium flex items-center gap-x-1">
        <ListVideoIcon className="size-4" />
        <span>{compactVideoCount} Videos</span>
      </div>
    </div>
  );
};

export default PlaylistThumbnail;
