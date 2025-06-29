import { PLACEHOLDER_THUMBNAIL_URL } from "@/modules/videos/constants";
import MuxPlayer from "@mux/mux-player-react";

interface VideoPlayerProps {
    playBackId?: string|null| undefined;
    title?: string;
    thumbnail?: string|null| undefined;
    autoPlay?: boolean;
    onPlay?: () => void;
}

const VideoPlayer = ({ playBackId,title, thumbnail, autoPlay, onPlay }: VideoPlayerProps) => {

    if (!playBackId) {
        return null;
    }

  return (
    <div>
        <MuxPlayer
            playbackId={playBackId}
            poster={thumbnail || PLACEHOLDER_THUMBNAIL_URL}
            thumbnailTime={0}
            title={title}
            autoPlay={autoPlay}
            onPlay={onPlay}
            className="object-contain aspect-video"
            accentColor="#FF2056"
        />
    </div>
  )
}

export default VideoPlayer