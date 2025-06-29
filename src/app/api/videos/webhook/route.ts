import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetDeletedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
} from "@mux/mux-node/resources/webhooks";
import { muxClient } from "@/lib/mux";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { UTApi } from "uploadthing/server";
const WEBHOOK_SECRET = process.env.MUX_WEBHOOK_SECRET;

type WebhookEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetTrackReadyWebhookEvent
  | VideoAssetDeletedWebhookEvent;

export async function POST(req: Request) {
    if (!WEBHOOK_SECRET) {
        throw new Error("MUX_WEBHOOK_SIGNING_SECRET is not set");
    }

    const headersPayload = await headers();
    const signature = headersPayload.get("mux-signature");
    
    if (!signature) {
        return new Response("No signature", {status: 400});
    }

    try {
        // Get raw body as text first
        const rawBody = await req.text();

        // Verify the webhook signature
        muxClient.webhooks.verifySignature(rawBody, {
            'mux-signature': signature
        }, WEBHOOK_SECRET);
        
        // Parse the body as JSON after verification
        const payload = JSON.parse(rawBody);

        switch (payload.type as WebhookEvent["type"]) {
            case "video.asset.created": {
                const data = payload.data;
                if (!data.upload_id) {
                    return new Response("No upload id", {status: 400});
                }
                await db.update(videos).set({
                    muxStatus: data.status,
                    muxAssetId: data.id,
                }).where(eq(videos.muxUploadId, data.upload_id));
                break;
            }
            case "video.asset.ready": {
                const data = payload.data;
                const playbackId = data.playback_ids?.[0].id; 
                if (!playbackId) {
                    return new Response("No playback id", {status: 400});
                }
                if (!data.upload_id) {
                    return new Response("No upload id", {status: 400});
                }
                const tempThumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.png`;
                const tempPreviewUrl = `https://image.mux.com/${playbackId}/animated.gif`;
                const utApi = new UTApi();
                const [uploadedThumbnail, uploadedPreview] = await utApi.uploadFilesFromUrl([tempThumbnailUrl, tempPreviewUrl]);
                if (!uploadedThumbnail.data || !uploadedPreview.data) {
                    return new Response("Failed to upload thumbnail or preview", {status: 500});
                }
                const {key: thumbnailKey, url: thumbnailUrl} = uploadedThumbnail.data;
                const {key: previewKey, url: previewUrl} = uploadedPreview.data; 

                const duration = data.duration? Math.round(data.duration * 1000) : 0;
                await db.update(videos).set({
                    muxStatus: data.status,
                    muxPlaybackId: playbackId,
                    muxAssetId: data.id,
                    thumbnailKey,
                    thumbnailUrl,
                    previewKey,
                    previewUrl,
                    duration
                }).where(eq(videos.muxUploadId, data.upload_id));
                break;
            }
            case "video.asset.errored": {
                const data = payload.data as VideoAssetErroredWebhookEvent["data"];
                if (!data.upload_id) {
                    return new Response("No upload id", {status: 400});
                }
                await db.update(videos).set({
                    muxStatus: data.status,
                }).where(eq(videos.muxUploadId, data.upload_id));
                break;
            }
            case "video.asset.deleted": {
                const data = payload.data as VideoAssetDeletedWebhookEvent["data"];
                if (!data.upload_id) {
                    return new Response("No upload id", {status: 400});
                } 
                await db.delete(videos).where(eq(videos.muxUploadId, data.upload_id));
                break;
            } 
            case "video.asset.track.ready": {
                const data = payload.data as VideoAssetTrackReadyWebhookEvent["data"] & {
                    asset_id: string;
                }
                if (!data.asset_id) {
                    return new Response("No asset id", {status: 400});
                }
                await db.update(videos).set({
                    muxTrackId: data.id,
                    muxTrackStatus: data.status,
                }).where(eq(videos.muxAssetId, data.asset_id));
                break;

            }
        }
        return new Response("Webhook received", {status: 200});
    } catch (error) {
        console.error("Webhook error:", error);
        return new Response("Invalid signature", {status: 401});
    }
}
