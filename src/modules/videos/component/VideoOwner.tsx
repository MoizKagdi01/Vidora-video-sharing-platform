import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/user-avatar";
import { VideoGetOneOutput } from "@/modules/videos/types";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import SubscriptionButton from "../../subscription/ui/component/SubscriptionButton";
import UserInfo from "@/modules/users/ui/components/UserInfo";
import { useSubscription } from "@/modules/subscription/hooks/useSubscription";

interface VideoOwnerProps {
  user: VideoGetOneOutput["user"];
  videoId: string;
}

const VideoOwner = ({ user, videoId }: VideoOwnerProps) => {
  const { userId, isLoaded } = useAuth();
  const {isPending, onClick} = useSubscription({
    userId: user.id,
    isSubscribed: user.viewerSubscribed,
    fromVideoId: videoId 
  })
  return (
    <div className="flex items-center sm:items-start justify-between sm:justify-start min-w-0">
      <Link prefetch href={`/users/${user.id}`}>
        <div className="flex items-center gap-0 min-w-0 ">
          <UserAvatar size={"lg"} imageUrl={user.imageURL} name={user.name} />
          <div className="flex flex-col gap-1 min-w-0">
          <UserInfo size="lg" name={user.name} />
          {/* TODO: Subscriber later */}
          <span className="text-sm text-muted-foreground line-clamp-1">
            {user.subscriberCount} Subscribers
          </span>
          </div>
        </div>
      </Link>
      {userId === user.clerkId ? (
        <Button className="rounded-full" asChild variant="secondary">
          <Link prefetch href={`/studio/videos/${videoId}`}>Edit Video</Link>
        </Button>
      ) : (
        <SubscriptionButton
          className="flex-none"
          size="default"
          isSubscribed={user.viewerSubscribed}
          onClick={onClick}
          disabled={isPending || !isLoaded}
        />
      )}
    </div>
  );
};

export default VideoOwner;
