
import { GoogleGenAI } from "@google/genai";
import { AspectRatio, ImageResolution, VideoResolution } from "../types";

export const generateImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  resolution: ImageResolution,
  referenceImage?: { data: string; mimeType: string }
): Promise<string> => {
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

    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("Imaginea nu a putut fi extrasă din răspunsul AI.");
  } catch (error: any) {
    console.error("Gemini Image Error:", error);
    throw error;
  }
};

export const generateVideo = async (
  prompt: string,
  aspectRatio: AspectRatio | "16:9" | "9:16" | "1:1",
  resolution: VideoResolution,
  referenceImage?: { data: string; mimeType: string }
): Promise<string> => {
  // Creating a new instance to ensure we use the latest selected API Key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: referenceImage ? {
        imageBytes: referenceImage.data,
        mimeType: referenceImage.mimeType,
      } : undefined,
      config: {
        numberOfVideos: 1,
        resolution: resolution,
        aspectRatio: aspectRatio as any
      }
    });

    // Polling for the video generation to complete
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds between checks
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    // Check for errors in the finished operation
    if (operation.error) {
       console.error("Operation Error details:", operation.error);
       throw new Error(`Veo Operation Error: ${operation.error.message || 'The video generation process failed.'}`);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("Video generation completed but failed to return a valid download link.");
    }

    // Fetch the MP4 bytes with the API key
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) {
       throw new Error(`Failed to download video file: ${response.statusText}`);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error: any) {
    console.error("Veo Video Error caught in service:", error);
    throw error;
  }
};
