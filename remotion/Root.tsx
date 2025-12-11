import { Composition } from "remotion";
import { VideoComposition } from "./VideoComposition";
import { Caption, CaptionStyle } from "./types";

export const RemotionRoot: React.FC = () => {
  // Default props for development
  const defaultProps: {
    videoUrl: string;
    captions: Caption[];
    captionStyle: CaptionStyle;
  } = {
    videoUrl: "/sample.mp4",
    captions: [
      { start: 0, end: 2, text: "Welcome to the video" },
      { start: 2, end: 4, text: "Namaste doston" },
      { start: 4, end: 6, text: "This is a sample caption" },
    ],
    captionStyle: "bottom",
  };

  return (
    <>
      <Composition
        id="VideoWithCaptions"
        component={VideoComposition}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
      />
    </>
  );
};
