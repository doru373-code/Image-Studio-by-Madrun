
export enum AspectRatio {
  Ratio1_1 = "1:1",
  Ratio4_5 = "4:5",
  Ratio3_4 = "3:4",
  Ratio16_9 = "16:9",
  Ratio9_16 = "9:16"
}

export enum ArtStyle {
  None = "No specific style",
  Photorealistic = "Photorealistic",
  Cinematic = "Cinematic",
  Surreal = "Surreal",
  Watercolor = "Watercolor",
  Moebius = "Moebius",
  HyperRealistic = "Hyper-realistic",
  Cyberpunk = "Cyberpunk",
  OilPainting = "Oil Painting",
  Anime = "Anime",
  PixelArt = "Pixel Art",
  Minimalist = "Minimalist"
}

export type ImageResolution = "1K" | "2K" | "4K";

export type AppMode = 'generate' | 'erase' | 'video' | 'remove-bg';

export type Language = 'en' | 'fr' | 'ro';

export interface GenerationResult {
  imageUrl: string | null;
  error: string | null;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  
  interface Window {
    aistudio?: AIStudio;
  }
}
