import { VideoGetOneOutput } from '@/modules/videos/types';
import { AlertTriangleIcon } from 'lucide-react';

interface videoBannerProps {
    status: VideoGetOneOutput["muxStatus"];
}
const videoBanner = ({status}: videoBannerProps) => {
  if (status === "ready") {
    return null
  }
  return (
    <div className="bg-yellow-500 py-3 px-4 rounded-b-xl flex items-center gap-2">
        <AlertTriangleIcon className='size-4 text-black shrink-0' />
        <p className='text-xs md:text-sm font-medium text-black line-clamp-1'>This Video Is Still Processing</p>
    </div>
  )
}

export default videoBanner