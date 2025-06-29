"use client";

import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVerticalIcon,
  TrashIcon,
  CopyIcon,
  CheckIcon,
  GlobeIcon,
  LockIcon,
  ImagePlusIcon,
  SparklesIcon,
  RefreshCwIcon,
  Loader2Icon,
  RotateCcwIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { videoUpdateSchema } from "@/db/schema";
import { toast } from "sonner";
import VideoPlayer from "../component/videoPlayer";
import Link from "next/link";
import { SnakeCaseToTitleCase } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {ThumbnailUploadModel} from "../component/thumbnailUploadModel";
import {ThumbnailGenerateModel} from "../component/thumbnailGenerateModel";
import Image from "next/image";
import { PLACEHOLDER_THUMBNAIL_URL } from "@/modules/videos/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface FormSectionProps {
  videoId: string;
}

function ErrorFallback({ error }: { error: Error }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cause = (error as any).cause;

  return (
    <div>
      <h2>Something went wrong- form section!</h2>
      <p>Error: {error.message}</p>
      {cause && <p>Cause: {String(cause)}</p>}
    </div>
  );
}

const FormSectionSuspense = ({ videoId }: FormSectionProps) => {
  return (
    <Suspense  fallback={<FormSectionSkeleton />}>
      <ErrorBoundary  FallbackComponent={ErrorFallback}>
        <FormSection videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const FormSectionSkeleton = () => {
  return (
    <div className="">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
          <Skeleton className="h-9 w-24" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="space-y-8 lg:col-span-3">
          <div className="space-y-2 ">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-full" />
          </div>
          <div className="space-y-2 ">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-[220px] w-full" />
          </div>
          <div className="space-y-2 ">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-[84px] w-[153px]" />
          </div>
          <div className="space-y-2 ">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="flex flex-col gap-y-8 lg:col-span-2">
          <div className="flex flex-col gap-4 rounded-xl bg-[#f9f9f9] overflow-hidden">
          <Skeleton className="aspect-video " />
          </div>
          <div className="space-y-2 ">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-full" />
          </div>
          <div className="space-y-2 ">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-32" />
          </div>
          <div className="space-y-2 ">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-32" />
          </div>
        </div>
      </div>
          <div className="space-y-2 ">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-10 w-full" />
          </div>
    </div>

  );
};

const FormSection = ({ videoId }: FormSectionProps) => {
  const [thumbnailModelOpen, setThumbnailModelOpen] = useState(false);
  const [thumbnailGenerateModelOpen, setThumbnailGenerateModelOpen] = useState(false);

  const router = useRouter();
  const fullUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/videos/${videoId}`;
  const [isCoppied, setIsCoppied] = useState(false);

  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });
  const utils = trpc.useUtils();
  const [categories] = trpc.categories.getAll.useSuspenseQuery();
  const updateVideo = trpc.videos.update.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      utils.studio.getOne.invalidate({ id: videoId });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const removeVideo = trpc.videos.remove.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      router.push("/studio");
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });
  const revalidate = trpc.videos.revalidate.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      utils.studio.getOne.invalidate({id: videoId})
      toast.success("revalidated")
      router.push("/studio");
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });
  const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      utils.studio.getOne.invalidate({ id: videoId });
      toast.success("Thumbnail restored");
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });
  const generateDescription = trpc.videos.generateDescription.useMutation({
    onSuccess: () => {
      toast.success("Background Job Started",{description: "This may take a while"});
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });
  const generateTitle = trpc.videos.generateTitle.useMutation({
    onSuccess: () => {
      toast.success("Background Job Started",{description: "This may take a while"});
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });
  const form = useForm<z.infer<typeof videoUpdateSchema>>({
    resolver: zodResolver(videoUpdateSchema),
    defaultValues: video,
  });
  if (!video) {
    return <div className="p-4 rounded-md bg-muted">Video not found</div>;
  }

  const onSubmit = (data: z.infer<typeof videoUpdateSchema>) => {
    updateVideo.mutate(data);
  };

  return (
    <>
      <ThumbnailUploadModel
        videoId={videoId}
        open={thumbnailModelOpen}
        onOpenChange={setThumbnailModelOpen}
      />
      <ThumbnailGenerateModel
        videoId={videoId}
        open={thumbnailGenerateModelOpen}
        onOpenChange={setThumbnailGenerateModelOpen}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between mb-6">
            {/* {JSON.stringify(video, null, 2)} */}
            <div className="">
              <h1 className="text-2xl font-bold">Video Details</h1>
              <p className="text-sm text-muted-foreground">
                Manage Your Video Details
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={updateVideo.isPending || !form.formState.isDirty}>
                {updateVideo.isPending ? "Saving..." : "Save"}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={"ghost"} size={"icon"}>
                    <MoreVerticalIcon className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => revalidate.mutate({ id: videoId })}
                  >
                    <div className="flex items-center gap-2">
                      <RotateCcwIcon className="w-4 h-4" />
                      <span>Revalidate</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => removeVideo.mutate({ id: videoId })}
                  >
                    <div className="flex items-center gap-2">
                      <TrashIcon className="w-4 h-4" />
                      <span>Delete</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="space-y-8 lg:col-span-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-x-2">
                      Title
                      <Button
                        type="button"
                        size="icon"
                        disabled={generateTitle.isPending}
                        onClick={() => generateTitle.mutate({ id: videoId })}
                        className="rounded-full size-6 [&svg]:size-3"
                        variant="outline">
                          {
                            generateTitle.isPending ?
                              <Loader2Icon className="animate-spin" />
                            :
                          <SparklesIcon />
                          }
                        </Button>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter Video Title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-x-2">
                      Description
                      <Button
                        type="button"
                        size="icon"
                        disabled={generateDescription.isPending}
                        onClick={() => generateDescription.mutate({ id: videoId })}
                        className="rounded-full size-6 [&svg]:size-3"
                        variant="outline">
                          {
                            generateDescription.isPending ?
                              <Loader2Icon className="animate-spin" />
                            :
                          <SparklesIcon />
                          }
                        </Button>
                      </div></FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={String(field.value || "")}
                        className="resize-none pr-10"
                        placeholder="Enter Video Description"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={() => (
                  <FormItem>
                    <FormLabel>Thumbnail</FormLabel>
                    <FormControl>
                      <div className="p-0.5 border border-dashed border-neutral-400 relative h-[84px] w-[153px] group">
                        <Image
                          src={video.thumbnailUrl || PLACEHOLDER_THUMBNAIL_URL}
                          alt="Thumbnail"
                          fill
                          className="object-cover"
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant={"ghost"}
                              className="bg-black/50 hover:bg-black/50 absolute top-1 rounded-full opacity-100 right-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
                              size={"icon"}
                            >
                              <MoreVerticalIcon className="w-4 h-4 text-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" side="right">
                            <DropdownMenuItem onClick={() => setThumbnailModelOpen(true)}>
                              <ImagePlusIcon className="size-4 mr-1" />
                              <span>Change Thumbnail</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() =>setThumbnailGenerateModelOpen(true) }>
                              <SparklesIcon className="size-4 mr-1" />
                              <span>Generate With AI</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => restoreThumbnail.mutate({ id: videoId })}>
                              <RefreshCwIcon className="size-4 mr-1" />
                              <span>Restore</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-8 lg:col-span-2">
              <div className="flex flex-col rounded-xl gap-4 overflow-hidden h-fit bg-background border-foreground border">
                <div className="aspect-video border-foreground border overflow-hidden relative">
                  <VideoPlayer
                    playBackId={video.muxPlaybackId}
                    thumbnail={video.thumbnailUrl}
                  />
                </div>
                <div className="p-4 flex flex-col gap-y-6">
                  <div className="flex justify-between items-center gap-x-2">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-sm">
                        Video Link
                      </p>
                      <div className="flex items-center justify-center gap-x-2">
                        <Link prefetch href={`/videos/${video.id}`}>
                          <p className="line-clamp-1 text-sm text-blue-500">
                            {video.title}
                          </p>
                        </Link>
                        <Button
                          variant={"ghost"}
                          type="button"
                          className="shrink-0"
                          size={"icon"}
                          onClick={async () => {
                            await navigator.clipboard.writeText(fullUrl);
                            setIsCoppied(true);
                            toast.success("Copied to clipboard");
                            setTimeout(() => {
                              setIsCoppied(false);
                            }, 2000);
                          }}
                          disabled={isCoppied}
                        >
                          {isCoppied ? (
                            <CheckIcon className="w-4 h-4" />
                          ) : (
                            <CopyIcon className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flexx flex-col gap-y-1">
                      <p className="text-muted-foreground text-sm">
                        Video Status
                      </p>
                      <p className="text-sm font-medium">
                        {SnakeCaseToTitleCase(video.muxStatus || "preparing")}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flexx flex-col gap-y-1">
                      <p className="text-muted-foreground text-sm">
                        Subtitle Status
                      </p>
                      <p className="text-sm font-medium">
                        {SnakeCaseToTitleCase(
                          video.muxTrackStatus || "No Subtitle"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Visibility</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["public", "private"].map((visibility) => (
                          <SelectItem key={visibility} value={visibility}>
                            <div className="flex items-center gap-x-2">
                              {visibility === "public" ? (
                                <GlobeIcon className="w-4 h-4" />
                              ) : (
                                <LockIcon className="w-4 h-4" />
                              )}
                              {SnakeCaseToTitleCase(visibility)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};

export default FormSectionSuspense;
