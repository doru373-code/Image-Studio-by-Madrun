export enum AspectRatio {
  Square = "1:1",
  Portrait = "3:4",
  Landscape = "4:3",
  Tall = "9:16",
  Wide = "16:9"
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
    
  }
  
  interface Window {
    aistudio?: AIStudio;
  }
}