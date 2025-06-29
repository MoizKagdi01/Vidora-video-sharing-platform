import { ThumbsUpIcon } from "lucide-react";
import LikedSection from "../section/LikedSection";

export const LikedView = () => {
  return (
    <div className="flex flex-col gap-y-4 max-w-screen-md mx-auto mb-10 px-4 pt-2.5">
      <h1 className="text-2xl flex items-center gap-x-2 font-bold">
        Liked Videos <ThumbsUpIcon fill="#f00" />
      </h1>
      <p className="text-sm text-muted-foreground">
       All your favourite liked videos will be awailable here
      </p>
      <LikedSection />
    </div>
  );
};
