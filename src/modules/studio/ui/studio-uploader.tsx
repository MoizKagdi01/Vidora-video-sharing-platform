import { Button } from "@/components/ui/button";
import MuxUploader, {
  MuxUploaderDrop,
  MuxUploaderFileSelect,
  MuxUploaderProgress,
  MuxUploaderStatus,
} from "@mux/mux-uploader-react";
import { UploadIcon } from "lucide-react";

interface StudioUploaderProps {
  endpoint: string;
  onSuccess: () => void;
}

const StudioUploader = ({ endpoint, onSuccess }: StudioUploaderProps) => {
  return (
    <div>
      <MuxUploader
        id="video-uploader"
        className="hidden group/uploader"
        endpoint={endpoint}
        onSuccess={onSuccess}
      />
      <MuxUploaderDrop muxUploader="video-uploader" className="group/drop" >
        <div slot="heading" className="flex flex-col items-center gap-6">
          <div className="gap-2 rounded-full flex items-center justify-center bg-muted h-32 w-32">
            <UploadIcon className="h-10 w-10 text-muted-foreground group/drop-[&[active]]:animate-bounce transition-all duration-300" />
          </div>
          <div className="flex flex-col gap-2 text-center">
            <p className="text-sm font-medium">Drag and drop your video file to upload</p>
            <p className="text-sm text-muted-foreground">Videos will be private until published</p>
          </div>
          <MuxUploaderFileSelect muxUploader="video-uploader">
          <Button type="button" className="rounded-full">
            Select Files
          </Button>
          </MuxUploaderFileSelect>
        </div>
        <span slot="seperator" className="hidden" />
        <MuxUploaderStatus className="text-sm" muxUploader="video-uploader" />
        <MuxUploaderProgress type="percentage" muxUploader="video-uploader" />
        <MuxUploaderProgress type="bar" muxUploader="video-uploader" />
      </MuxUploaderDrop>
    </div>
  );
};

export default StudioUploader;
