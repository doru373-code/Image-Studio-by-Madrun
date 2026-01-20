
import { GoogleGenAI } from "@google/genai";
import { AspectRatio, ImageResolution, VideoResolution, ImageModel } from "../types";

export const generateImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  resolution: ImageResolution,
  model: ImageModel,
  referenceImage?: { data: string; mimeType: string }
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is not configured. Please use the 'API Configuration' button to select a key.");
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

  // Map non-standard ratios to closest valid Gemini API ratios
  let apiRatio: string = aspectRatio;
  if (aspectRatio === AspectRatio.RatioA4) {
    apiRatio = "3:4";
  }

  const imageConfig: any = {
    aspectRatio: apiRatio as any
  };

  // Only gemini-3-pro-image-preview supports imageSize (1K, 2K, 4K)
  if (model === ImageModel.Pro) {
    imageConfig.imageSize = resolution;
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: parts },
      config: {
        imageConfig: imageConfig
      },
    });

    if (!response || !response.candidates || response.candidates.length === 0) {
      throw new Error("Nu am primit un răspuns valid de la server. Verifică conexiunea sau cheia API.");
    }

    const candidate = response.candidates[0];
    
    if (candidate.finishReason === 'SAFETY') {
      throw new Error("Solicitarea a declanșat filtrele de siguranță. Încearcă o altă descriere mai puțin sensibilă.");
    }

    if (!candidate.content || !candidate.content.parts) {
      throw new Error("Modelul a returnat un răspuns gol. Încearcă să reformulezi cerința.");
    }

    let detectedText = "";

    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
      if (part.text) {
        detectedText += part.text + " ";
      }
    }

    // Dacă modelul a returnat text în loc de imagine, afișăm acel text sau o eroare generică
    if (detectedText.trim()) {
      throw new Error(`Modelul a refuzat generarea imaginii și a răspuns: "${detectedText.trim()}"`);
    }

    throw new Error("Imaginea nu a putut fi extrasă din răspunsul AI. Modelul nu a generat date vizuale.");
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
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is not configured for Video Generation. Please use the 'API Configuration' button.");
  }

  const ai = new GoogleGenAI({ apiKey });

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

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    if (operation.error) {
       console.error("Operation Error details:", operation.error);
       throw new Error(`Veo Operation Error: ${operation.error.message || 'Procesul de generare video a eșuat.'}`);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("Generarea video s-a încheiat, dar link-ul de descărcare lipsește.");
    }

    const response = await fetch(`${downloadLink}&key=${apiKey}`);
    if (!response.ok) {
       throw new Error(`Eroare la descărcarea fișierului video: ${response.statusText}`);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error: any) {
    console.error("Veo Video Error caught in service:", error);
    throw error;
  }
};
