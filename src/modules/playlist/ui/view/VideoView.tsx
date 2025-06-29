import PlaylistHeaderSection from "../section/PlaylistHeaderSection";
import VideoSection from "../section/VideoSection";
interface VideoViewProps {
  playlistId: string;
}
export const VideoView = ({ playlistId }: VideoViewProps) => {
  return (
    <div className="flex flex-col gap-y-4 max-w-screen-md mx-auto mb-10 px-4 pt-2.5">
      <PlaylistHeaderSection playlistId={playlistId} />
      <VideoSection playlistId={playlistId} />
    </div>
  );
};
