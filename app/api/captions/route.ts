import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured");
      return NextResponse.json(
        { 
          error: "OpenAI API key not configured",
          details: "Please add OPENAI_API_KEY to your .env.local file"
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("video") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No video file provided" },
        { status: 400 }
      );
    }

    console.log("Processing file:", file.name, "Size:", file.size, "Type:", file.type);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Save video file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const videoPath = path.join(uploadsDir, file.name);
    await writeFile(videoPath, buffer);

    console.log("Video saved to:", videoPath);

    // Check if we should use mock data (for testing when OpenAI is unavailable)
    const useMockData = process.env.USE_MOCK_CAPTIONS === 'true';
    
    if (useMockData) {
      console.log("Using mock captions for testing");
      const mockCaptions = [
        { start: 0, end: 2.5, text: "Welcome to the Remotion Captioning Platform" },
        { start: 2.5, end: 5.0, text: "This is a demo caption" },
        { start: 5.0, end: 7.5, text: "Upload your video to get started" },
        { start: 7.5, end: 10.0, text: "AI-powered captions in Hinglish" },
      ];
      
      return NextResponse.json({
        success: true,
        captions: mockCaptions,
        videoPath: `/uploads/${file.name}`,
        transcription: "Mock transcription for testing",
        mock: true,
      });
    }

    // Extract audio and send to Whisper
    // For simplicity, we're sending the video file directly
    // In production, you might want to extract audio first using ffmpeg
    
    console.log("Generating captions with Whisper...");
    console.log("OpenAI API Key present:", !!process.env.OPENAI_API_KEY);

    // Create a File-like object that OpenAI SDK can handle
    const fileForWhisper = new File([buffer], file.name, { type: file.type });

    let transcription;
    try {
      transcription = await openai.audio.transcriptions.create({
        file: fileForWhisper,
        model: "whisper-1",
        response_format: "verbose_json",
        timestamp_granularities: ["word"],
      });
    } catch (apiError: any) {
      console.error("OpenAI API Error:", apiError);
      
      // Provide more specific error message
      if (apiError.code === 'ECONNRESET' || apiError.cause?.code === 'ECONNRESET') {
        return NextResponse.json(
          {
            error: "Network connection error",
            details: "Unable to connect to OpenAI API. Please check your internet connection and firewall settings. If using a proxy, ensure it's configured correctly.",
          },
          { status: 500 }
        );
      }
      
      if (apiError.status === 401) {
        return NextResponse.json(
          {
            error: "Invalid API key",
            details: "Your OpenAI API key is invalid. Please check your .env.local file.",
          },
          { status: 500 }
        );
      }
      
      throw apiError;
    }

    // Process transcription into caption format
    const captions: Array<{ start: number; end: number; text: string }> = [];

    if (transcription.words) {
      // Group words into caption segments (every 5-8 words or by punctuation)
      let currentSegment: typeof transcription.words = [];
      let segmentStartTime = 0;

      transcription.words.forEach((word, index) => {
        if (currentSegment.length === 0) {
          segmentStartTime = word.start;
        }

        currentSegment.push(word);

        // Create segment when:
        // 1. We have 6-8 words
        // 2. Word ends with punctuation
        // 3. It's the last word
        const shouldCreateSegment =
          currentSegment.length >= 7 ||
          /[.!?]$/.test(word.word) ||
          index === transcription.words.length - 1;

        if (shouldCreateSegment) {
          const text = currentSegment.map((w) => w.word).join(" ");
          const endTime = currentSegment[currentSegment.length - 1].end;

          captions.push({
            start: segmentStartTime,
            end: endTime,
            text: text.trim(),
          });

          currentSegment = [];
        }
      });
    } else {
      // Fallback: use segments if words not available
      if (transcription.segments) {
        transcription.segments.forEach((segment: any) => {
          captions.push({
            start: segment.start,
            end: segment.end,
            text: segment.text.trim(),
          });
        });
      }
    }

    return NextResponse.json({
      success: true,
      captions,
      videoPath: `/uploads/${file.name}`,
      transcription: transcription.text,
    });
  } catch (error: any) {
    console.error("Caption generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate captions",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
