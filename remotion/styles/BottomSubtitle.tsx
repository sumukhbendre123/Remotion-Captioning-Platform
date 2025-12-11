import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface BottomSubtitleProps {
  text: string;
}

export const BottomSubtitle: React.FC<BottomSubtitleProps> = ({ text }) => {
  const frame = useCurrentFrame();

  // Fade in animation
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Slide up animation
  const translateY = interpolate(frame, [0, 15], [20, 0], {
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
          fontSize: 48,
          fontWeight: "bold",
          color: "white",
          textAlign: "center",
          textShadow: `
            2px 2px 4px rgba(0, 0, 0, 0.9),
            -1px -1px 2px rgba(0, 0, 0, 0.9),
            1px -1px 2px rgba(0, 0, 0, 0.9),
            -1px 1px 2px rgba(0, 0, 0, 0.9)
          `,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          padding: "15px 40px",
          borderRadius: "10px",
          maxWidth: "80%",
          opacity,
          transform: `translateY(${translateY}px)`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
