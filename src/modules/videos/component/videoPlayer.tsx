import { PLACEHOLDER_THUMBNAIL_URL } from "@/modules/videos/constants";
import MuxPlayer from "@mux/mux-player-react";

interface VideoPlayerProps {
    playBackId?: string|null| undefined;
    thumbnail?: string|null| undefined;
    autoPlay?: boolean;
    onPlay?: () => void;
}
export const VideoPlayerSkeleton = () => {
    return (
        <div className="aspect-video bg-black rounded-xl "></div>
    )
}

const VideoPlayer = ({ playBackId, thumbnail, autoPlay, onPlay }: VideoPlayerProps) => {

    if (!playBackId) {
        return null;
    }

  return (
    <div>
        <MuxPlayer
            playbackId={playBackId}
            autoPlay={autoPlay}
            poster={thumbnail || PLACEHOLDER_THUMBNAIL_URL}
            thumbnailTime={0}
            onPlay={onPlay}
            
            className="object-contain"
            accentColor="#FF2056"
        />
    </div>
  )
}

export default VideoPlayer