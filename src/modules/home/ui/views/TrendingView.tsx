import { FlameIcon } from "lucide-react";
import TrendingSection from "../section/TrendingVideoSection";

export const TrendingView = () => {
  return (
    <div className="flex flex-col gap-y-4 max-w-[2400px] mx-auto mb-10 px-4 pt-2.5">
      <h1 className="text-2xl flex items-center gap-x-2 font-bold">
        Trending <FlameIcon className="text-red-500 inline"  fill="#f00" />
      </h1>
      <p className="text-sm text-muted-foreground">
        Most Popular videos at the moment
      </p>
      <TrendingSection />
    </div>
  );
};
