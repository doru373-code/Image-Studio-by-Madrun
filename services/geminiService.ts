
import { GoogleGenAI } from "@google/genai";
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
    // Verificăm dacă eroarea este de tip "overloaded" (503) sau "rate limit" (429)
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

export const generateImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  resolution: ImageResolution,
  model: ImageModel,
  referenceImage?: { data: string; mimeType: string }
): Promise<string> => {
  // Obținem cheia API direct din process.env la fiecare apel pentru a fi siguri că e cea mai nouă
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Cheia API nu este configurată. Te rugăm să folosești butonul Configurare API.");
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

  // MAPARE STRICTĂ: API-ul suportă doar "1:1", "3:4", "4:3", "9:16", "16:9"
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

  // Doar modelul Pro suportă setarea explicită a dimensiunii 2K/4K
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
      throw new Error("Imaginea nu a putut fi generată din cauza filtrelor de siguranță (conținut sensibil).");
    }

    // Căutăm partea care conține datele imaginii (inlineData)
    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("Răspunsul nu conține o imagine validă. Verifică prompt-ul.");
  });
};
