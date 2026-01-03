
import { GoogleGenAI, VideoGenerationReferenceType } from "@google/genai";
import { AspectRatio, ImageResolution } from "../types";

export const generateImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  resolution: ImageResolution,
  referenceImage1?: { data: string; mimeType: string },
  referenceImage2?: { data: string; mimeType: string }
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const parts: any[] = [];

    if (referenceImage1) {
      parts.push({
        inlineData: {
          data: referenceImage1.data,
          mimeType: referenceImage1.mimeType,
        },
      });
    }

    if (referenceImage2) {
      parts.push({
        inlineData: {
          data: referenceImage2.data,
          mimeType: referenceImage2.mimeType,
        },
      });
    }

    parts.push({
      text: prompt,
    });

    let model = 'gemini-2.5-flash-image';
    if (resolution === '2K' || resolution === '4K') {
      model = 'gemini-3-pro-image-preview';
    }

    const config: any = {
      imageConfig: {
        aspectRatio: aspectRatio,
      },
    };

    if (model === 'gemini-3-pro-image-preview') {
      config.imageConfig.imageSize = resolution;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: parts,
      },
      config: config,
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates returned from the model.");
    }

    const candidate = response.candidates[0];

    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
        if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
             throw new Error(`Image generation stopped. Reason: ${candidate.finishReason}`);
        }
    }

    const content = candidate.content;
    
    if (!content || !content.parts) {
      throw new Error("No content parts returned.");
    }

    let textOutput = "";

    for (const part of content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const base64Data = part.inlineData.data;
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${base64Data}`;
      }
      if (part.text) {
        textOutput += part.text;
      }
    }

    if (textOutput) {
       throw new Error(`Model returned text: "${textOutput}"`);
    }

    throw new Error("No image data found in the response.");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate image.");
  }
};

export const generateVideo = async (
  prompt: string,
  aspectRatio: AspectRatio,
  resolution: ImageResolution,
  referenceImages: Array<{ data: string; mimeType: string }> = []
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Character cloning works best with 'veo-3.1-generate-preview'
    // This model allows up to 3 reference images as ASSETS.
    const model = 'veo-3.1-generate-preview';
    const videoResolution = '720p'; // multi-reference assets require 720p

    // Veo only supports 16:9 or 9:16
    let videoAspectRatio = '16:9';
    if (aspectRatio === AspectRatio.Ratio9_16 || aspectRatio === AspectRatio.Ratio3_4 || aspectRatio === AspectRatio.Ratio4_5) {
      videoAspectRatio = '9:16';
    }

    const referenceImagesPayload: any[] = [];
    for (const img of referenceImages) {
      referenceImagesPayload.push({
        image: {
          imageBytes: img.data,
          mimeType: img.mimeType,
        },
        referenceType: VideoGenerationReferenceType.ASSET,
      });
    }

    let operation = await ai.models.generateVideos({
      model: model,
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: videoResolution,
        aspectRatio: videoAspectRatio,
        referenceImages: referenceImagesPayload.length > 0 ? referenceImagesPayload : undefined,
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    if (operation.error) {
       throw new Error(`Video generation failed: ${operation.error.message}`);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    
    if (!downloadLink) {
      throw new Error("No video URI returned.");
    }

    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) {
      throw new Error("Failed to download generated video.");
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error: any) {
    console.error("Gemini Video API Error:", error);
    const msg = error.message || (error.error && error.error.message) || "Failed to generate video.";
    throw new Error(msg);
  }
};
