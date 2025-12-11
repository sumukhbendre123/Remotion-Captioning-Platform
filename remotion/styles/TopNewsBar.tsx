import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface TopNewsBarProps {
  text: string;
}

export const TopNewsBar: React.FC<TopNewsBarProps> = ({ text }) => {
  const frame = useCurrentFrame();

  // Slide down animation
  const translateY = interpolate(frame, [0, 20], [-100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "20px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
          transform: `translateY(${translateY}px)`,
          opacity,
        }}
      >
        <div
          style={{
            fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
            fontSize: 42,
            fontWeight: "bold",
            color: "white",
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "2px",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
          }}
        >
          <span
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              padding: "5px 15px",
              borderRadius: "5px",
              marginRight: "20px",
              fontSize: 28,
            }}
          >
            ● LIVE
          </span>
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
