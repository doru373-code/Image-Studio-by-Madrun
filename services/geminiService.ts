
import { GoogleGenAI, VideoGenerationReferenceType } from "@google/genai";
import { AspectRatio, ImageResolution, ImageModel } from "../types";

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000;

const getApiKey = () => {
  // 1. Check for token injected by Hostinger server.js
  const injectedKey = (window as any).ENV_API_KEY;
  if (injectedKey && injectedKey !== "__GEMINI_API_KEY__" && injectedKey.length > 5) {
    return injectedKey;
  }
  
  // 2. Check for process.env (Vercel / Local Vite)
  const envKey = process.env.API_KEY;
  if (envKey && envKey.length > 5) {
    return envKey;
  }

  // 3. Last resort: specific environment mock (from index.html script tag)
  const mockKey = (window as any).process?.env?.API_KEY;
  if (mockKey && mockKey.length > 5) {
    return mockKey;
  }

  return null;
};

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const status = error?.status || error?.error?.code;
    const isRetryable = status === 503 || status === 429;
    
    if (isRetryable && retries > 0) {
      console.warn(`Model overloaded (${status}). Retrying in ${delay}ms...`);
      await wait(delay);
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const generateVideo = async (
  prompt: string,
  referenceImages: { data: string; mimeType: string }[] = [],
  onStatusUpdate?: (status: string) => void
): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key missing. Please set API_KEY in your Hostinger or Vercel Environment Variables.");
  
  const ai = new GoogleGenAI({ apiKey });
  
  const referenceImagesPayload: any[] = referenceImages.map(img => ({
    image: {
      imageBytes: img.data,
      mimeType: img.mimeType,
    },
    referenceType: VideoGenerationReferenceType.ASSET,
  }));

  onStatusUpdate?.("Initializing video generation...");
  
  let operation = await withRetry(async () => {
    return await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9',
        referenceImages: referenceImagesPayload.length > 0 ? referenceImagesPayload : undefined
      }
    });
  });

  while (!operation.done) {
    onStatusUpdate?.("AI is processing video frames...");
    await wait(10000);
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Failed to retrieve video download link.");

  const fetchResponse = await fetch(`${downloadLink}&key=${apiKey}`);
  const blob = await fetchResponse.blob();
  return URL.createObjectURL(blob);
};

export const generateImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  resolution: ImageResolution,
  model: ImageModel,
  referenceImages: { data: string; mimeType: string }[] = []
): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key missing. Please set API_KEY in your Hostinger or Vercel Environment Variables.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  const parts: any[] = [];
  
  if (referenceImages.length > 0) {
    referenceImages.forEach((img) => {
      parts.push({
        inlineData: {
          data: img.data,
          mimeType: img.mimeType,
        },
      });
    });
  }

  parts.push({ text: prompt });

  let apiRatio: string = "1:1";
  switch (aspectRatio) {
    case AspectRatio.Ratio1_1: apiRatio = "1:1"; break;
    case AspectRatio.Ratio16_9: apiRatio = "16:9"; break;
    case AspectRatio.Ratio9_16: apiRatio = "9:16"; break;
    case AspectRatio.Ratio3_4: 
    case AspectRatio.Ratio4_5:
    case AspectRatio.RatioA4: 
      apiRatio = "3:4"; 
      break;
    default: apiRatio = "1:1";
  }

  const config: any = {
    imageConfig: {
      aspectRatio: apiRatio
    }
  };

  if (model === ImageModel.Pro) {
    config.imageConfig.imageSize = resolution;
  }

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: parts },
      config: config,
    });

    if (!response || !response.candidates || response.candidates.length === 0) {
      throw new Error("No response received from AI model.");
    }

    const candidate = response.candidates[0];
    if (candidate.finishReason === 'SAFETY') {
      throw new Error("Content blocked by safety filters.");
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("Image data not found in model response.");
  });
};
