import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface KaraokeCaptionProps {
  text: string;
  startTime: number;
  endTime: number;
  currentTime: number;
}

export const KaraokeCaption: React.FC<KaraokeCaptionProps> = ({
  text,
  startTime,
  endTime,
  currentTime,
}) => {
  const frame = useCurrentFrame();

  // Split text into words
  const words = text.split(" ");
  const duration = endTime - startTime;
  const timePerWord = duration / words.length;

  // Calculate which word is currently active
  const elapsedTime = currentTime - startTime;
  const currentWordIndex = Math.floor(elapsedTime / timePerWord);

  // Fade in animation
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: "80px",
      }}
    >
      <div
        style={{
          fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
          fontSize: 52,
          fontWeight: "bold",
          textAlign: "center",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: "20px 50px",
          borderRadius: "15px",
          maxWidth: "85%",
          opacity,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "15px",
        }}
      >
        {words.map((word, index) => {
          const isActive = index === currentWordIndex;
          const isPast = index < currentWordIndex;

          return (
            <span
              key={index}
              style={{
                color: isActive ? "#FFD700" : isPast ? "#FFFFFF" : "#888888",
                textShadow: isActive
                  ? `
                    0 0 20px rgba(255, 215, 0, 0.8),
                    2px 2px 4px rgba(0, 0, 0, 0.9)
                  `
                  : "2px 2px 4px rgba(0, 0, 0, 0.9)",
                transform: isActive ? "scale(1.1)" : "scale(1)",
                transition: "all 0.2s ease",
                display: "inline-block",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
