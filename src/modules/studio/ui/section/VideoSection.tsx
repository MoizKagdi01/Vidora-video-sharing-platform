"use client";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { format } from "date-fns";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { trpc } from "@/trpc/client";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Link from "next/link";
import VideoThumbnail from "../component/videoThumbnail";
import { SnakeCaseToTitleCase } from "@/lib/utils";
import { Globe2Icon, LockIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
export const VideoSection = () => {
  return (
    <Suspense fallback={<VideoSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <VideoSectionSuspese />
      </ErrorBoundary>
    </Suspense>
  );
};
const VideoSectionSkeleton = () => {
return (
  <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6 w-[510px]">Video</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Likes</TableHead>
              <TableHead className="text-right pr-6 ">Comments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({length: 5}).map((_, index) => (
                <TableRow key={index}>
                  <TableCell  className="pl-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-36 h-20" />
                      <div className="flex flex-col gap-2">
                        <Skeleton className="w-32 h-4" />
                        <Skeleton className="w-40 h-3" />
                      </div>
                      </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="w-16 h-4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="w-20 h-4" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="w-12 h-4" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="w-12 ml-auto h-4" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="w-12 ml-auto h-4" />
                  </TableCell>
                  <TableCell className="text-left">
                    <Skeleton className="w-24 ml-auto h-4" />
                  </TableCell>
                </TableRow>
              ))} 
          </TableBody>
          </Table>
)
}

const VideoSectionSuspese = () => {
  const [data, query] = trpc.studio.getMany.useSuspenseInfiniteQuery(
    {
      limit: 5,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  return (
    <div>
      <div className="border-y">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6 w-[510px]">Video</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Likes</TableHead>
              <TableHead className="text-right pr-6 ">Comments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.pages
              .flatMap((page) => page.items)
              .map((video) => (
                <Link
                  href={`/studio/videos/${video.id}`}
                  key={video.id}
                  legacyBehavior
                >
                  <TableRow className="hover:bg-muted/50 cursor-pointer">
                    <TableCell className="pl-6 w-[510px]">
                      <div className="flex items-center gap-4">
                        <div className="relative aspect-video w-36 shrink-0">
                          <VideoThumbnail
                            imageUrl={video.thumbnailUrl}
                            title={video.title}
                            duration={video.duration ? video.duration : 0}
                            previewUrl={video.previewUrl}
                          />
                        </div>
                        <div className="flex flex-col overflow-hidden gap-y-1 ">
                          <p className="text-sm line-clamp-1">{video.title}</p>
                          <p className="text-sm line-clamp-1">
                            {video.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-x-2">
                        {video.visibility === "private" ? (
                          <LockIcon className="size-4 mr-2" />
                        ) : (
                          <Globe2Icon className="size-4 mr-2" />
                        )}
                        <span className="text-sm">{SnakeCaseToTitleCase(video.visibility)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {SnakeCaseToTitleCase(video.muxStatus || "ERROR")}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm truncate">
                      {format(video.createdAt, "dd  MMM, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">{video.viewCount} Views</TableCell>
                    <TableCell className="text-right pl-6">{video.likeCount} Likes</TableCell>
                    <TableCell className="text-right pr-6 ">{video.commentCount} Comments</TableCell>
                  </TableRow>
                </Link>
              ))}
          </TableBody>
        </Table>
      </div>
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  );
};
