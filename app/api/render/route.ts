import { NextRequest, NextResponse } from "next/server";

// This endpoint provides rendering configuration for client-side rendering
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoUrl, captions, captionStyle, duration } = body;

    if (!videoUrl || !captions || !captionStyle) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Return configuration for client-side rendering
    return NextResponse.json({
      success: true,
      message: "Ready for client-side rendering",
      renderConfig: {
        compositionId: "CaptionedVideo",
        inputProps: {
          videoUrl,
          captions,
          captionStyle,
        },
        fps: 30,
        durationInFrames: Math.ceil((duration || 30) * 30), // duration in seconds * fps
      },
      note: "Rendering will be done in your browser. This may take a few minutes depending on video length.",
    });
  } catch (error: any) {
    console.error("Render config error:", error);
    
    return NextResponse.json(
      {
        error: "Failed to prepare rendering",
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
