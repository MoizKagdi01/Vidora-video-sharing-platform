"use client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";

interface PlaylistHeaderSectionProps {
    playlistId: string;
}
const PlaylistHeaderSection = ({ playlistId }: PlaylistHeaderSectionProps) => {
  return (
    <Suspense fallback={<PlaylistHeaderSectionSkeleton />}>
        <ErrorBoundary fallback={<div>Error loading playlist header</div>}>
            <PlaylistHeaderSectionSuspense playlistId={playlistId} />
        </ErrorBoundary>
    </Suspense>
  )
}
const PlaylistHeaderSectionSkeleton = () => {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}
const PlaylistHeaderSectionSuspense = ({ playlistId }: PlaylistHeaderSectionProps) => {
  const [playlist] = trpc.playlist.getOne.useSuspenseQuery({ id: playlistId });
  const utils = trpc.useUtils();
  const router = useRouter()
  const remove = trpc.playlist.remove.useMutation({
    onSuccess: () => {
      toast.success("Playlist removed successfully");
      utils.playlist.getMany.invalidate();
      router.push("/playlist");
    },
    onError: (error) => {
      toast.error(`Failed to remove playlist: ${error.message}`);
    }
  });
  return (
    <div className="flex justify-between items-center"><div className="">
      <h1 className="text-2xl font-bold">{playlist.name}</h1>
      <p className="text-xs text-muted-foreground">Videos From The Playlist</p>
    </div>
        <Button variant={"outline"} size={"icon"} disabled={remove.isPending} onClick={() => remove.mutate({ id: playlistId })} className="rounded-full" >
            <Trash2Icon />
        </Button>
    </div>
  );
}

export default PlaylistHeaderSection