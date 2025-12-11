import { NextRequest, NextResponse } from "next/server";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import { createReadStream, existsSync } from "fs";
import { readFile } from "fs/promises";

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

    console.log("Starting video export...");

    // Bundle the Remotion project
    const bundleLocation = await bundle({
      entryPoint: path.join(process.cwd(), "remotion", "index.ts"),
      webpackOverride: (config) => config,
    });

    // Get composition
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "VideoWithCaptions",
      inputProps: {
        videoUrl,
        captions,
        captionStyle,
      },
    });

    // Determine output path
    const outputDir = path.join(process.cwd(), "public", "exports");
    const outputFileName = `export-${Date.now()}.mp4`;
    const outputLocation = path.join(outputDir, outputFileName);

    // Ensure output directory exists
    const { mkdir } = await import("fs/promises");
    const { existsSync } = await import("fs");
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }

    console.log("Rendering video...");

    // Render the video
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation,
      inputProps: {
        videoUrl,
        captions,
        captionStyle,
      },
    });

    console.log("Video exported successfully!");

    // Return download URL
    return NextResponse.json({
      success: true,
      downloadUrl: `/exports/${outputFileName}`,
      message: "Video exported successfully!",
    });
  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json(
      {
        error: "Failed to export video",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Download endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("file");

    if (!filename) {
      return NextResponse.json(
        { error: "No filename provided" },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), "public", "exports", filename);

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to download file", details: error.message },
      { status: 500 }
    );
  }
}
