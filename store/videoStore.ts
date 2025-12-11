import { create } from "zustand";
import { Caption, CaptionStyle } from "@/remotion/types";

interface VideoState {
  videoUrl: string | null;
  videoFile: File | null;
  captions: Caption[];
  captionStyle: CaptionStyle;
  isGeneratingCaptions: boolean;
  isExporting: boolean;
  exportProgress: number;
  setVideoFile: (file: File) => void;
  setVideoUrl: (url: string) => void;
  setCaptions: (captions: Caption[]) => void;
  setCaptionStyle: (style: CaptionStyle) => void;
  setIsGeneratingCaptions: (isGenerating: boolean) => void;
  setIsExporting: (isExporting: boolean) => void;
  setExportProgress: (progress: number) => void;
  reset: () => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  videoUrl: null,
  videoFile: null,
  captions: [],
  captionStyle: "bottom",
  isGeneratingCaptions: false,
  isExporting: false,
  exportProgress: 0,

  setVideoFile: (file) => set({ videoFile: file }),
  setVideoUrl: (url) => set({ videoUrl: url }),
  setCaptions: (captions) => set({ captions }),
  setCaptionStyle: (style) => set({ captionStyle: style }),
  setIsGeneratingCaptions: (isGenerating) =>
    set({ isGeneratingCaptions: isGenerating }),
  setIsExporting: (isExporting) => set({ isExporting }),
  setExportProgress: (progress) => set({ exportProgress: progress }),
  reset: () =>
    set({
      videoUrl: null,
      videoFile: null,
      captions: [],
      captionStyle: "bottom",
      isGeneratingCaptions: false,
      isExporting: false,
      exportProgress: 0,
    }),
}));
