import { serve } from "@upstash/workflow/nextjs";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { videos } from "@/db/schema";
import axios from "axios";
interface InputType {
  userId: string;
  videoId: string;
}
const TITLE_SYSTEM_PROMPT = `Your task is to generate an SEO-focused title for a YouTube video based on its transcript. Please follow these guidelines:
- Be concise but descriptive, using relevant keywords to improve discoverability.
- Highlight the most compelling or unique aspect of the video content.
- Avoid jargon or overly complex language unless it directly supports searchability.
- Use action-oriented phrasing or clear value propositions where applicable.
- Ensure the title is 3-8 words long and no more than 100 characters.
- ONLY return the title as plain text. Do not add quotes or any additional formatting.`;
export const { POST } = serve(async (context) => {
  const input = context.requestPayload as InputType;
  const { userId, videoId } = input;

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

  const transcript = await context.run("get-transcript", async () => {
    const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`
    const response = await fetch(trackUrl);
    const text = await response.text();
    if (!text) {
      throw new Error("Transcript not found");
    }
    return text;
  })
  
  const title = await context.run("generate-title", async () => {
    try {
      // Check if the OpenRouter API key is set
      if (!process.env.DEEPSEEK_API_KEY) {
        console.error("DEEPSEEK_API_KEY is not set in environment variables");
        return "no env";
      }
      const textResponse = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
          messages: [
            {
              role: "system",
              content: TITLE_SYSTEM_PROMPT
            },
            {
              role: "user",
              content: transcript
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      
      // Extract the generated text from the response
      let result = "";
      
      // Handle OpenRouter API response format
      if (textResponse.data && textResponse.data.choices && textResponse.data.choices.length > 0) {
        const choice = textResponse.data.choices[0];
        if (choice.message && choice.message.content) {
          result = choice.message.content;
        }
      }
      
      result = result.trim();
      if (result.startsWith('"') && result.endsWith('"')) {
        result = result.slice(1, -1);
      }
      
      if (!result) {
        return "no result";
      }
      return result;
    } 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (error:any) {
      console.error("Error calling OpenRouter API:", 
        error.response?.status,
        error.response?.statusText,
        error.response?.data || error.message
      );
      return "error";
    }
  })
  await context.run("update-video", async () => {
    await db
    .update(videos)
    .set({
      title: title ?? "generated by workflow",
    })
    .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
  });
});
