import React from "react";
import {
  AbsoluteFill,
  Video,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";
import { VideoCompositionProps } from "./types";
import { BottomSubtitle } from "./styles/BottomSubtitle";
import { TopNewsBar } from "./styles/TopNewsBar";
import { KaraokeCaption } from "./styles/KaraokeCaption";

export const VideoComposition: React.FC<VideoCompositionProps> = ({
  videoUrl,
  captions,
  captionStyle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Convert frame to seconds
  const currentTime = frame / fps;

  // Find the current caption
  const currentCaption = captions.find(
    (caption) => currentTime >= caption.start && currentTime < caption.end
  );

  // Render caption based on style
  const renderCaption = () => {
    if (!currentCaption) return null;

    switch (captionStyle) {
      case "bottom":
        return <BottomSubtitle text={currentCaption.text} />;
      case "top":
        return <TopNewsBar text={currentCaption.text} />;
      case "karaoke":
        return (
          <KaraokeCaption
            text={currentCaption.text}
            startTime={currentCaption.start}
            endTime={currentCaption.end}
            currentTime={currentTime}
          />
        );
      default:
        return <BottomSubtitle text={currentCaption.text} />;
    }
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Video Layer */}
      <AbsoluteFill>
        <Video
          src={videoUrl.startsWith("/") ? staticFile(videoUrl) : videoUrl}
          style={{ width: "100%", height: "100%" }}
        />
      </AbsoluteFill>

      {/* Caption Layer */}
      {renderCaption()}
    </AbsoluteFill>
  );
};
