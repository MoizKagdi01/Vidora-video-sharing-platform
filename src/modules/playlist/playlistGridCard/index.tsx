import Link from "next/link";
import { PlaylistGetManyOutput } from "../types";
import PlaylistThumbnail,{PlaylistThumbnailSkeleton} from "./PlaylistThumbnail";
import { PlayListInfo,PlaylistInfoSkeleton } from "./PlayListInfo";

interface PlaylistGridCardProps {
  playlist: PlaylistGetManyOutput["items"][number];
}
export const PlaylistGridCardSkeleton = () => {
 return (
    <div className="flex flex-col gap-2 w-full group">
      <PlaylistThumbnailSkeleton />
      <PlaylistInfoSkeleton  />
    </div>
 )
}
export const PlaylistGridCard = ({ playlist }: PlaylistGridCardProps) => {
  return (
    <Link prefetch href={`/playlist/${playlist.id}`} >
        <div className="flex flex-col gap-2 w-full group">
            <PlaylistThumbnail imageUrl={playlist.thumbnail || "./placeholder.svg"} title={playlist.name} videoCount={playlist.videoCount} />
            <PlayListInfo playlist={playlist} />
        </div>
    </Link>
  );
};

export default PlaylistGridCard;
