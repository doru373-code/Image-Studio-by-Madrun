
import { GoogleGenAI } from "@google/genai";
import { AspectRatio, ImageResolution } from "../types";

export const generateImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  resolution: ImageResolution,
  referenceImage?: { data: string; mimeType: string }
): Promise<string> => {
  // Always create a fresh instance to catch any key updates from the browser environment
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: parts },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio
        }
      },
    });

    if (!response || !response.candidates || response.candidates.length === 0) {
      throw new Error("Nu am primit un răspuns valid de la server.");
    }

    const candidate = response.candidates[0];
    
    if (candidate.finishReason === 'SAFETY') {
      throw new Error("Solicitarea a declanșat filtrele de siguranță. Încearcă o altă descriere.");
    }

    // Extraction loop as per documentation guidelines
    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("Imaginea nu a putut fi extrasă din răspunsul AI.");
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    // Passing error upstream for App.tsx to handle
    throw error;
  }
};
