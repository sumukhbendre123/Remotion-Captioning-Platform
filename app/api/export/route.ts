import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoUrl, captions, captionStyle } = body;

    if (!videoUrl || !captions || !captionStyle) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Note: Server-side video rendering is not available in serverless environments
    // The @remotion/bundler and @remotion/renderer packages require a full Node.js
    // environment and cannot run in serverless platforms like Vercel, Render, etc.
    
    // For production deployment, consider these alternatives:
    // 1. Use Remotion Lambda (AWS Lambda-based rendering)
    // 2. Deploy to a VPS or dedicated server
    // 3. Use client-side screen recording
    // 4. Integrate with a dedicated rendering service
    
    return NextResponse.json(
      {
        error: "Video export not available",
        message: "Server-side video rendering requires a dedicated server environment with FFmpeg. This feature is disabled in serverless deployments.",
        alternatives: [
          {
            name: "Remotion Lambda",
            description: "Use AWS Lambda for serverless video rendering",
            link: "https://www.remotion.dev/docs/lambda"
          },
          {
            name: "VPS Deployment",
            description: "Deploy to a VPS with Node.js and FFmpeg installed"
          },
          {
            name: "Preview Only",
            description: "Use the preview feature to view your captioned video in the browser"
          }
        ],
        preview: {
          available: true,
          message: "You can preview your video with captions using the /preview page"
        }
      },
      { status: 501 } // 501 Not Implemented
    );
  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json(
      {
        error: "Export failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
