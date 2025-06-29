import ResponsiveDilogue from "@/components/responsive-dilogue"
import { UploadDropzone } from "@/lib/uploadthing"
import { trpc } from "@/trpc/client"

interface BannerUploadModalProps {
    userId: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const BannerUploadModal = ({ userId, open, onOpenChange }: BannerUploadModalProps) => {
    const utils = trpc.useUtils();
    const onUploadComplete = () => {
        utils.users.getOne.invalidate({ id: userId });
        onOpenChange(false);
    }
    return (
        <ResponsiveDilogue title="Upload Banner" open={open} onOpenChange={onOpenChange}>
            <UploadDropzone
                endpoint="bannerUploader"
                onClientUploadComplete={onUploadComplete}
            />
        </ResponsiveDilogue>
    )
}
