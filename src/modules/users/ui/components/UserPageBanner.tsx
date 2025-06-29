import { cn } from "@/lib/utils";
import { UserGetOneOutput } from "../../types";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Edit2Icon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BannerUploadModal } from "@/modules/studio/ui/component/bannerUploadModal";
import { useState } from "react";

interface UserPageBannerProps {
    user: UserGetOneOutput;
}
export const UserPageBannerSkeleton = () => {
   return (
    <Skeleton className="w-full max-h-[200px] h-[15vh] md:h-[25vh]" />
   )
}
const UserPageBanner = ({ user }: UserPageBannerProps) => {
  const {userId} = useAuth()
  const [isBannerUploadOpen, setIsBannerUploadOpen] = useState(false);
  return (
    <div className="relative group">
        <BannerUploadModal userId={user.id} open={isBannerUploadOpen} onOpenChange={setIsBannerUploadOpen} />
        <div className={cn("w-full max-h-[200px] h-[15vh] md:h-[25vh] bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl",
          user.bannerUrl ? "bg-cover bg-center":"bg-gray-100")} style={{ backgroundImage: user.bannerUrl ? `url(${user.bannerUrl})` : undefined }}>
            {user.clerkId === userId  && (
              <Button type="button" onClick={() => setIsBannerUploadOpen(true)} size={"icon"} className="absolute top-4 right-4 bg-background/50 hover:bg-background/50 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity rounded-full duration-300">
                <Edit2Icon className="size-4 text-foreground" />
              </Button>
            )}
        </div>
    </div>
  )
}

export default UserPageBanner