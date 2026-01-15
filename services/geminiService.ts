
import { GoogleGenAI } from "@google/genai";
import { AspectRatio, ImageResolution } from "../types";

export const generateImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  resolution: ImageResolution,
  referenceImage?: { data: string; mimeType: string }
): Promise<string> => {
  // Re-instanțiem pentru a ne asigura că folosim cheia proaspăt selectată de utilizator
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

    if (!response.candidates?.[0]) {
      throw new Error("Nu am primit niciun rezultat de la AI.");
    }

    const candidate = response.candidates[0];
    if (candidate.finishReason === 'SAFETY') {
      throw new Error("Imaginea a fost blocată de filtrele de siguranță.");
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData?.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("Datele imaginii lipsesc din răspuns.");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
