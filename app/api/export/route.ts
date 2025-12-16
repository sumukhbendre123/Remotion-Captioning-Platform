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

    console.log('Export request:', {
      captionsCount: captions.length,
      style: captionStyle,
    });

    // Generate SRT subtitle file
    const srtContent = generateSRT(captions);
    
    // Create a data URL for the SRT file
    const srtDataUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(srtContent)}`;

    // Return success with SRT download
    return NextResponse.json({
      success: true,
      message: "Captions exported successfully as SRT file",
      srtContent,
      downloadUrl: srtDataUrl,
      fileName: `captions-${Date.now()}.srt`,
      exportMethod: "srt",
      instructions: {
        title: "How to use your SRT file",
        steps: [
          "Download the SRT file using the button below",
          "Open your video editing software (DaVince Resolve, Premiere Pro, iMovie, VLC, etc.)",
          "Import your original video",
          "Add the SRT file as subtitles/captions",
          "Export your final video with burned-in captions",
        ],
        alternativeOptions: [
          {
            name: "VLC Media Player (Free)",
            description: "Play video with captions: Subtitle → Add Subtitle File → Select your SRT",
          },
          {
            name: "HandBrake (Free)",
            description: "Burn subtitles into video permanently",
          },
          {
            name: "DaVinci Resolve (Free)",
            description: "Professional video editing with subtitle support",
          },
        ],
      },
      note: "Server-side video rendering requires FFmpeg and is not available in serverless environments. SRT files work with all major video players and editors.",
    });

  } catch (error: any) {
    console.error("Export error:", error);
    
    return NextResponse.json(
      {
        error: "Export failed",
        message: error.message || "An unexpected error occurred",
        details: error.stack,
      },
      { status: 500 }
    );
  }
}

// Generate SRT subtitle file format
function generateSRT(captions: Array<{ text: string; start: number; end: number }>): string {
  let srtContent = '';
  
  captions.forEach((caption, index) => {
    const startTime = formatSRTTime(caption.start);
    const endTime = formatSRTTime(caption.end);
    
    srtContent += `${index + 1}\n`;
    srtContent += `${startTime} --> ${endTime}\n`;
    srtContent += `${caption.text}\n\n`;
  });
  
  return srtContent;
}

// Format seconds to SRT time format (HH:MM:SS,mmm)
function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
}
    return NextResponse.json(
      {
        error: "Export failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
