import { cn } from "@/lib/utils";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState } from "react";

interface VideoDescriptionProps {
  compactViews: string;
  expandViews: string;
  compactDate: string;
  expandDate: string;
  description: string | null;
}
const VideoDescription = ({
  compactViews,
  expandViews,
  compactDate,
  expandDate,
  description,
}: VideoDescriptionProps) => {
    const [isExpanded, setIsExpanded] = useState(false)
  return (
    <div onClick={()=>setIsExpanded((current) => !current)} className="bg-secondary/50 rounded-xl p-3 cursor-pointer hover:bg-secondary/70 transition">
      <div className="flex gap-2 text-sm">
        <span className="font-medium ">
            {isExpanded? expandViews : compactViews} views
        </span>
        <span className="font-medium ">
            {isExpanded? expandDate : compactDate}
        </span>
      </div>
      <div className="relative">
        <p className={cn("text-sm whitespace-pre-wrap",!isExpanded && "line-clamp-2")}>
            {description || "No description"}
        </p>
        <div className="flex items-center gap-1 mt-4 font-medium text-sm">
            {isExpanded ? (
                <>
                    Show Less <ChevronUpIcon className="size-4" />
                </>
            ) : (
                <>
                    Show More <ChevronDownIcon className="size-4" />
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default VideoDescription;
