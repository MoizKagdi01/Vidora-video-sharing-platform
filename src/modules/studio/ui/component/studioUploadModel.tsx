"use client";

import ResponsiveDilogue from "@/components/responsive-dilogue";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { PlusIcon, Loader2, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import StudioUploader from "../studio-uploader";

const studioUploadModel = () => {
  const utils = trpc.useUtils();
  const create = trpc.videos.create.useMutation({
    onSuccess: () => {
      toast.success("Video created successfully");
      utils.studio.getMany.invalidate();
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });
  return (
    <>
      <ResponsiveDilogue
        title="Upload a Video"
        open={!!create.data?.url}
        onOpenChange={() => {
          create.reset();
        }}
      >
        {/* <p>This will upload a video to your account</p> */}
        {create.data?.url ? (
          <StudioUploader 
            endpoint={create.data.url} 
            onSuccess={() => {
              create.reset();
              toast.success("Upload completed!");
            }}
          />
        ) : (
          <Loader2Icon />
        )}
      </ResponsiveDilogue>
      <Button
        variant={"secondary"}
        onClick={() => create.mutate()}
        disabled={create.isPending}
      >
        {create.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <PlusIcon className="w-4 h-4" />
        )}
        create
      </Button>
    </>
  );
};

export default studioUploadModel;
