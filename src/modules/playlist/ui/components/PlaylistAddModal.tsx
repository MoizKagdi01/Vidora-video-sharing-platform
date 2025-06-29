import { InfiniteScroll } from "@/components/infinite-scroll";
import ResponsiveDilogue from "@/components/responsive-dilogue";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Loader2Icon, SquareCheckIcon, SquareIcon } from "lucide-react";
import { toast } from "sonner";

interface PlaylistAddModalProps {
  open: boolean;
  videoId: string;
  onOpenChange: (open: boolean) => void;
}
export const PlaylistAddModal = ({
  open,
  onOpenChange,
  videoId,
}: PlaylistAddModalProps) => {
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    trpc.playlist.getManyPlaylistVideo.useInfiniteQuery(
      { limit: 5, videoId },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: !!videoId && open,
      }
    );
  const utils = trpc.useUtils();
  const addVideoToPlaylist = trpc.playlist.addVideo.useMutation({
    onSuccess: (data) => {
      utils.playlist.playlistVideos.invalidate();
      utils.playlist.getManyPlaylistVideo.invalidate();
      utils.playlist.getOne.invalidate({id: data.playlistId});
      utils.playlist.getPlaylistVideos.invalidate({playlistId: data.playlistId});
      toast.success("Video added to playlist successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to add video to playlist: ${error.message}`);
    },
  });
  const removeVideoFromPlaylist = trpc.playlist.removeVideo.useMutation({
    onSuccess: (data) => {
      utils.playlist.playlistVideos.invalidate();
      utils.playlist.getManyPlaylistVideo.invalidate({videoId});
      utils.playlist.getOne.invalidate({id: data.playlistId});
      utils.playlist.getPlaylistVideos.invalidate({playlistId: data.playlistId});
      toast.success("Video removed from playlist successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to add video to playlist: ${error.message}`);
    },
  });
  return (
    <ResponsiveDilogue
      title="Create a playlist"
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="flex flex-col gap-2">
        {isLoading && (
          <div className="flex justify-center p-4">
            <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading &&
          data?.pages.flatMap((page) =>
            page.items.map((playlist) => (
              <Button
                variant={"ghost"}
                disabled={removeVideoFromPlaylist.isPending || addVideoToPlaylist.isPending}
                className="w-full justify-start px-2 [&_svg]:size-5"
                size={"lg"}
                onClick={() => {
                  if (playlist.containsVideo) {
                    removeVideoFromPlaylist.mutate({
                      playlistId: playlist.id,
                      videoId,
                    });
                  } else {
                    addVideoToPlaylist.mutate({
                      playlistId: playlist.id,
                      videoId,
                    });
                  }
                }}
                key={playlist.id}
              >
                {playlist.containsVideo ? (
                  <SquareCheckIcon className="mr-2" />
                ) : (
                  <SquareIcon className="mr-2" />
                )}
                {playlist.name}
              </Button>
            ))
          )}
        {!isLoading && (
          <InfiniteScroll
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            isManual
            fetchNextPage={fetchNextPage}
          />
        )}
      </div>
    </ResponsiveDilogue>
  );
};
