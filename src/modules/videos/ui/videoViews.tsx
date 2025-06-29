import VideoSection from "@/modules/videos/section/videoSection";
import SuggestionSection from "./section/SuggestionSection";
import CommentSection from "./section/commentSection";

interface VideoViewProps {
  videoId: string;
}
const videoViews = ({videoId}: VideoViewProps) => {
  return (
    <div className="flex flex-col max-w-[1200px] mx-auto pt-2.5 px-4 mb-10">
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Video section (main content) */}
        <div className="flex-1 min-w-0">
          <VideoSection videoId={videoId} />
          <div className="xl:hidden mt-4">
            <SuggestionSection isManual={true} videoId={videoId} />
          </div>
          <div>
            <CommentSection videoId={videoId} />
          </div>
        </div>

        {/* Suggestion section (sidebar) */}
        <div className="hidden xl:block w-[380px] 2xl:w-[460px] shrink-0">
          <SuggestionSection videoId={videoId} />
        </div>
      </div>
    </div>
  )
}

export default videoViews