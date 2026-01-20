import { GoogleGenAI } from "@google/genai";
import { AspectRatio, ImageResolution, ImageModel } from "../types";

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000; // 2 secunde

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRetryable = error?.error?.code === 503 || error?.error?.code === 429 || error?.status === 503;
    if (isRetryable && retries > 0) {
      console.warn(`Model overloaded (503). Retrying in ${delay}ms... (${retries} retries left)`);
      await wait(delay);
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const generateImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  resolution: ImageResolution,
  model: ImageModel,
  referenceImage?: { data: string; mimeType: string }
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Cheia API nu este configurată.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  const parts: any[] = [];
  if (referenceImage) {
    parts.push({
      inlineData: {
        data: referenceImage.data,
        mimeType: referenceImage.mimeType,
      },
    });
  }
  parts.push({ text: prompt });

  let apiRatio: string = aspectRatio;
  if (aspectRatio === AspectRatio.RatioA4) {
    apiRatio = "3:4";
  }

  const imageConfig: any = {
    aspectRatio: apiRatio as any
  };

  if (model === ImageModel.Pro) {
    imageConfig.imageSize = resolution;
  }

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: parts },
      config: {
        imageConfig: imageConfig
      },
    });

    if (!response || !response.candidates || response.candidates.length === 0) {
      throw new Error("Nu am primit un răspuns valid.");
    }

    const candidate = response.candidates[0];
    
    if (candidate.finishReason === 'SAFETY') {
      throw new Error("Solicitarea a declanșat filtrele de siguranță.");
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("Imaginea nu a putut fi extrasă din răspuns.");
  });
};