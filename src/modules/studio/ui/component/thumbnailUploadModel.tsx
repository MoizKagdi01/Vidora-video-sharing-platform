import ResponsiveDilogue from "@/components/responsive-dilogue"
import { UploadDropzone } from "@/lib/uploadthing"
import { trpc } from "@/trpc/client"

interface ThumbnailUploadModelProps {
    videoId: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const ThumbnailUploadModel = ({ videoId, open, onOpenChange }: ThumbnailUploadModelProps) => {
    const utils = trpc.useUtils();
    const onUploadComplete = () => {
        onOpenChange(false);
        utils.studio.getMany.invalidate();
        utils.studio.getOne.invalidate({ id: videoId });
    }
    return (
        <ResponsiveDilogue title="Upload Thumbnail" open={open} onOpenChange={onOpenChange}>
            <UploadDropzone
                endpoint="thumbnailUploader"
                onClientUploadComplete={onUploadComplete}
                input={{ videoId }}
            />
        </ResponsiveDilogue>
    )
}
