import { InferenceClient } from "@huggingface/inference";
export  const inference = new InferenceClient(process.env.HUGGINGFACE_TOKEN!);