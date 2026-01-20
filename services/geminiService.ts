
import { GoogleGenAI, VideoGenerationReferenceType } from "@google/genai";
import { AspectRatio, ImageResolution, ImageModel } from "../types";

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000;

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
      console.warn(`Model overloaded (${status}). Retrying in ${delay}ms... (${retries} retries left)`);
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
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not configured.");
  
  const ai = new GoogleGenAI({ apiKey });
  
  const referenceImagesPayload: any[] = referenceImages.map(img => ({
    image: {
      imageBytes: img.data,
      mimeType: img.mimeType,
    },
    referenceType: VideoGenerationReferenceType.ASSET,
  }));

  onStatusUpdate?.("Inițializare operațiune video...");
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      referenceImages: referenceImagesPayload,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    onStatusUpdate?.("AI-ul generează cadrele video... (proces de durată)");
    await wait(10000);
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Eroare la obținerea link-ului de descărcare video.");

  onStatusUpdate?.("Descărcare clip video final...");
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
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Cheia API nu este configurată. Te rugăm să folosești butonul Configurare API.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  const parts: any[] = [];
  
  let enhancedPrompt = prompt;
  if (referenceImages.length > 0) {
    referenceImages.forEach((img) => {
      parts.push({
        inlineData: {
          data: img.data,
          mimeType: img.mimeType,
        },
      });
    });
    
    enhancedPrompt = `STRICT CHARACTER CONSISTENCY: Using the visual identity, facial features, hair style, and body proportions of the subjects in the provided images, create a new scene. The subject must remain exactly the same person. Action/Setting: ${prompt}`;
  }

  parts.push({ text: enhancedPrompt });

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
      throw new Error("Nu am primit un răspuns de la AI. Încearcă un prompt diferit.");
    }

    const candidate = response.candidates[0];
    
    if (candidate.finishReason === 'SAFETY') {
      throw new Error("Imaginea nu a putut fi generată din cauza filtrelor de siguranță.");
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("Răspunsul nu conține date vizuale. Verifică prompt-ul.");
  });
};
