import { PlaySquareIcon } from "lucide-react";
import SubscriptionSection from "../section/SubscriptionVideoSection";

export const SubscriptionView = () => {
  return (
    <div className="flex flex-col gap-y-4 max-w-[2400px] mx-auto mb-10 px-4 pt-2.5">
      <h1 className="text-2xl flex items-center gap-x-2 font-bold">
        Subscription <PlaySquareIcon className="text-red-500 inline"/>
      </h1>
      <p className="text-sm text-muted-foreground">
        Videos from your all subscribed channels
      </p>
      <SubscriptionSection />
    </div>
  );
};
