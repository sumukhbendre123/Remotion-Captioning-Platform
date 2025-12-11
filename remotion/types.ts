export interface Caption {
  start: number;
  end: number;
  text: string;
}

export type CaptionStyle = "bottom" | "top" | "karaoke";

export interface VideoCompositionProps {
  videoUrl: string;
  captions: Caption[];
  captionStyle: CaptionStyle;
}
