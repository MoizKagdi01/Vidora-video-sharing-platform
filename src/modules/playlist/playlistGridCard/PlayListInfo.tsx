import { Skeleton } from "@/components/ui/skeleton";
import { PlaylistGetManyOutput } from "../types";

interface PlayListInfoProps {
  playlist: PlaylistGetManyOutput["items"][number];
}
export const PlaylistInfoSkeleton = () => {
  return (
    <div className="flex gap-3">
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-5 w-[90%]" />
        <Skeleton className="h-5 w-[70%]" />
        <Skeleton className="h-5 w-[50%]" />
      </div>
    </div>
  );
}
export const PlayListInfo = ({ playlist }: PlayListInfoProps) => {
  return (
    <div className="flex gap-3">
        <div className="flex-1 min-w-0">
            <h3 className="font-medium line-clamp-1 lg:line-clamp-2 text-sm break-words">
                {playlist.name}
            </h3>
            <p className="text-sm text-muted-foreground">playlists</p>
            <p className="text-sm text-muted-foreground font-semibold hover:text-primary">View Full playlist</p>
        </div>
    </div>
  );
};