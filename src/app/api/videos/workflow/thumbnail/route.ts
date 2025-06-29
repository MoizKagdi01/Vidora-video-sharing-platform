// TODO: fixing this
import { serve } from "@upstash/workflow/nextjs";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { videos } from "@/db/schema";
import { UTApi } from "uploadthing/server";
import { Blob } from "fetch-blob";
import fs from "fs/promises";
import path from "path";

type FileEsque = Blob & {
  name: string;
  lastModified?: number;
  customId?: string | null | undefined;
};
interface InputType {
  userId: string;
  videoId: string;
  prompt: string;
}
export const { POST } = serve(async (context) => {
  const input = context.requestPayload as InputType;
  const { userId, videoId, prompt } = input;
  const utapi = new UTApi();

  const video = await context.run("get-video", async () => {
    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));
    if (!existingVideo) {
      throw new Error("Video not found");
    }
    return existingVideo;
  });

  await context.run("thumbnail-cleaanup", async () => {
    if (video.thumbnailKey) {
      await utapi.deleteFiles(video.thumbnailKey);
      await db
        .update(videos)
        .set({
          thumbnailKey: null,
          thumbnailUrl: null,
        })
        .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
    }
  });

  const thumbnail = await context.run("generate-thumbnail", async () => {
    const CLIPDROP_API_KEY = process.env.CLIPDROP_API_KEY;
    const form = new FormData();
    form.append("prompt", prompt);

    const response = await fetch("https://clipdrop-api.co/text-to-image/v1", {
      method: "POST",
      headers: {
        "x-api-key": CLIPDROP_API_KEY!,
      },
      body: form,
    });
    if (!response.ok) {
      throw new Error(
        `ClipDrop failed: ${(response.statusText, await response.text())}`
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("image/png")) {
      throw new Error(`Unexpected content-type: ${contentType}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const imageBuffer: Buffer = buffer;

    const imageBlob = new Blob([imageBuffer], { type: "image/png" });

    const UForm = new FormData();
    UForm.append("target_width", "1280");
    UForm.append("target_height", "720");
    UForm.append("image_file", imageBlob, "generated.png");

    const res = await fetch(
      "https://clipdrop-api.co/image-upscaling/v1/upscale",
      {
        method: "POST",
        headers: {
          "x-api-key": process.env.CLIPDROP_API_KEY!,
          // ...UForm.getHeaders()
        },
        body: UForm,
      }
    );

    if (!res.ok) {
      const errorData = await res.text();
      throw new Error(
        `Upscaling failed: ${res.status} ${res.statusText}\n${errorData}`
      );
    }
    const arrayBuffer2 = await res.arrayBuffer();
    const buffer2 = Buffer.from(arrayBuffer2);
    const tmpPath = path.join(process.cwd(), "tmp", "generated.png");
  
    const blob = new Blob([buffer2], { type: "image/png" });
    
    await fs.mkdir(path.dirname(tmpPath), { recursive: true });
    await fs.writeFile(tmpPath, buffer2);

    const file: FileEsque = Object.assign(blob, {
      name: "generated.png",
      lastModified: Date.now(),
    });

    return file;
  });
  const tempThumbnail = thumbnail;
  if (!tempThumbnail) {
    throw new Error("Thumbnail not found");
  }
  const uploadThumbnail = await context.run("upload-thumbnail", async () => {
    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const fileUrl = `${origin}/api/generatedimage`;

    const res = await utapi.uploadFilesFromUrl(fileUrl);

    if (res.error) {
      console.dir(res.error, { depth: null });
      throw new Error(JSON.stringify(res.error, null, 2));
    }
    return res.data;
  });
  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({
        thumbnailUrl: uploadThumbnail.url,
        thumbnailKey: uploadThumbnail.key,
      })
      .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
  });
});
