
export enum AspectRatio {
  Ratio1_1 = "1:1",
  Ratio4_5 = "4:5",
  Ratio3_4 = "3:4",
  Ratio16_9 = "16:9",
  Ratio9_16 = "9:16",
  RatioA4 = "A4"
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
  Minimalist = "Minimalist",
  Pexar = "Pexar (3D Animation)",
  Cartoon = "Cartoon"
}

export enum BookTheme {
  None = "Standard",
  Fairytale = "Enchanted Fairytale",
  Vintage = "Old Manuscript",
  Modern = "Minimalist Modern",
  Space = "Galactic Odyssey",
  Dark = "Gothic Mystery"
}

export enum ImageModel {
  Flash = "gemini-2.5-flash-image",
  Pro = "gemini-3-pro-image-preview",
  Veo = "veo-3.1-generate-preview"
}

export type ImageResolution = "1K" | "2K" | "4K" | "720p" | "1080p";

export type AppMode = 'generate' | 'erase' | 'remove-bg' | 'pencil-sketch' | 'watercolor' | 'pexar' | 'video-clone';

export type Language = 'en' | 'fr' | 'ro';

export interface ApiUsage {
  totalRequests: number;
  successCount: number;
  failureCount: number;
  flashRequests: number;
  proRequests: number;
  estimatedCost: number; // in USD
}

export interface HistoryEntry {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  modelUsed: ImageModel;
  type?: 'image' | 'video';
  theme?: BookTheme;
}

export interface UserRecord {
  id: string;
  email: string;
  subscription: 'free' | 'pro' | 'trial';
  role: 'admin' | 'user';
  password?: string;
  joinDate: string;
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
