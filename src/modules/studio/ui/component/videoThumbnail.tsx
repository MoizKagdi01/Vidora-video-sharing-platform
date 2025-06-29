import { formatDuration } from '@/lib/utils';
import { PLACEHOLDER_THUMBNAIL_URL } from '@/modules/videos/constants';
import Image from 'next/image';
import React from 'react'
interface VideoThumbnailProps {
    imageUrl?: string|null;
    previewUrl?: string|null;
    title: string;
    duration: number;
}
const videoThumbnail = ({imageUrl, previewUrl, title, duration}: VideoThumbnailProps) => {
  return (
    <div className="relative group">
        {/* Thumbnail Wrapper */}
        <div className="relative w-full overflow-hidden rounded-lg aspect-video">
            <Image src={imageUrl || PLACEHOLDER_THUMBNAIL_URL} fill alt={title} className="w-full h-full object-cover group-hover:opacity-0" />
            <Image unoptimized={!!previewUrl} src={previewUrl || PLACEHOLDER_THUMBNAIL_URL} fill alt="thumbnail" className="w-full h-full object-cover opacity-0 group-hover:opacity-100" />
        </div>
        {/* Video Duration */}
        <div className="absolute bottom-2 right-2 bg-black/50 text-foreground text-sm px-1 py-0.5 rounded">
            <div className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-background/80 texxt-white text-sm font-medium">
              {formatDuration(duration)}
            </div>
        </div>
    </div>
  )
}

export default videoThumbnail