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

    // Generate both SRT and VTT subtitle files
    const srtContent = generateSRT(captions);
    const vttContent = generateVTT(captions);
    
    // Create data URLs for both formats
    const srtDataUrl = `data:text/srt;charset=utf-8,${encodeURIComponent(srtContent)}`;
    const vttDataUrl = `data:text/vtt;charset=utf-8,${encodeURIComponent(vttContent)}`;

    // Return success with both download options
    return NextResponse.json({
      success: true,
      message: "Captions exported successfully in SRT and VTT formats",
      srtContent,
      vttContent,
      downloadUrl: srtDataUrl,
      vttDownloadUrl: vttDataUrl,
      fileName: `captions-${Date.now()}.srt`,
      vttFileName: `captions-${Date.now()}.vtt`,
      exportMethod: "srt+vtt",
      instructions: {
        title: "How to use your caption files",
        steps: [
          "Two files downloaded: .srt (desktop) and .vtt (mobile)",
          "For MX Player: Open video → Menu → Subtitle → Open → Select .vtt file",
          "For VLC: Open video → Subtitle → Add Subtitle File → Select .srt file",
          "For video editors: Import video and .srt file, then export with burned captions",
        ],
        alternativeOptions: [
          {
            name: "MX Player (Android - Free)",
            description: "Use .vtt file. Tap screen → 3 dots → Subtitle → Open → Select .vtt",
          },
          {
            name: "VLC Media Player (Free)",
            description: "Use .srt file. Subtitle → Add Subtitle File → Select your SRT",
          },
          {
            name: "HandBrake (Free)",
            description: "Burn subtitles into video permanently using .srt file",
          },
          {
            name: "DaVinci Resolve (Free)",
            description: "Professional video editing with subtitle support (.srt)",
          },
        ],
      },
      note: "VTT format has better mobile compatibility (MX Player, mobile browsers). SRT format is better for desktop players and video editing software.",
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

// Generate VTT (WebVTT) subtitle file format - better mobile compatibility
function generateVTT(captions: Array<{ text: string; start: number; end: number }>): string {
  let vttContent = 'WEBVTT\n\n';
  
  captions.forEach((caption, index) => {
    const startTime = formatVTTTime(caption.start);
    const endTime = formatVTTTime(caption.end);
    
    vttContent += `${index + 1}\n`;
    vttContent += `${startTime} --> ${endTime}\n`;
    vttContent += `${caption.text}\n\n`;
  });
  
  return vttContent;
}

// Format seconds to SRT time format (HH:MM:SS,mmm)
function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
}

// Format seconds to VTT time format (HH:MM:SS.mmm)
function formatVTTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}
