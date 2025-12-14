import { GoogleGenAI } from "@google/genai";
import { AspectRatio, ImageResolution } from "../types";

export const generateImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  resolution: ImageResolution,
  referenceImage1?: { data: string; mimeType: string },
  referenceImage2?: { data: string; mimeType: string }
): Promise<string> => {
  try {
    // Initialize the API client inside the function to ensure it picks up 
    // any newly selected API keys from process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const parts: any[] = [];

    // Add reference image 1 if provided
    if (referenceImage1) {
      parts.push({
        inlineData: {
          data: referenceImage1.data,
          mimeType: referenceImage1.mimeType,
        },
      });
    }

    // Add reference image 2 if provided
    if (referenceImage2) {
      parts.push({
        inlineData: {
          data: referenceImage2.data,
          mimeType: referenceImage2.mimeType,
        },
      });
    }

    // Add text prompt
    parts.push({
      text: prompt,
    });

    // Determine model based on resolution
    // 1K uses NanoBanana (Flash), 2K/4K uses Pro
    let model = 'gemini-2.5-flash-image';
    if (resolution === '2K' || resolution === '4K') {
      model = 'gemini-3-pro-image-preview';
    }

    const config: any = {
      imageConfig: {
        aspectRatio: aspectRatio,
      },
    };

    // Only set imageSize for the Pro model
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

    // Check for safety or other finish reasons that blocked content
    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
        // If content is empty or missing parts, we assume it was fully blocked
        if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
             throw new Error(`Image generation stopped. Reason: ${candidate.finishReason}`);
        }
    }

    const content = candidate.content;
    
    if (!content || !content.parts) {
      throw new Error("No content parts returned.");
    }

    let textOutput = "";

    // Iterate through parts to find the image
    for (const part of content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const base64Data = part.inlineData.data;
        // Determine mime type, default to png if not specified
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${base64Data}`;
      }
      if (part.text) {
        textOutput += part.text;
      }
    }

    // If we are here, no image was found.
    if (textOutput) {
       // The model likely returned a text refusal or explanation.
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
  referenceImage?: { data: string; mimeType: string }
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Determine model and resolution settings
    // 1K -> Fast Model (720p)
    // 2K/4K -> Quality Model (1080p)
    const videoResolution = resolution === '1K' ? '720p' : '1080p';
    const model = resolution === '1K' ? 'veo-3.1-fast-generate-preview' : 'veo-3.1-generate-preview';

    // Veo only supports 16:9 (Landscape) or 9:16 (Portrait). 
    // We must map other aspect ratios (1:1, 4:3, 3:4) to these supported values.
    let videoAspectRatio = '16:9';
    if (aspectRatio === AspectRatio.Tall || aspectRatio === AspectRatio.Portrait) {
      videoAspectRatio = '9:16';
    }

    let operation = await ai.models.generateVideos({
      model: model,
      prompt: prompt,
      ...(referenceImage ? {
        image: {
          imageBytes: referenceImage.data,
          mimeType: referenceImage.mimeType,
        }
      } : {}),
      config: {
        numberOfVideos: 1,
        resolution: videoResolution,
        aspectRatio: videoAspectRatio,
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    if (operation.error) {
       throw new Error(`Video generation failed: ${operation.error.message}`);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    
    if (!downloadLink) {
      throw new Error("No video URI returned.");
    }

    // Fetch the video content using the API key
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) {
      throw new Error("Failed to download generated video.");
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error: any) {
    console.error("Gemini Video API Error:", error);
    throw new Error(error.message || "Failed to generate video.");
  }
};