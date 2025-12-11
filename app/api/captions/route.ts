import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import OpenAI from "openai";
import { createReadStream } from "fs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000, // 60 seconds timeout
  maxRetries: 2, // Retry failed requests
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
    console.log("OpenAI API Key (first 10 chars):", process.env.OPENAI_API_KEY?.substring(0, 10));

    let transcription;
    try {
      // Use file stream for better compatibility with OpenAI SDK
      const fileStream = createReadStream(videoPath) as any;
      
      transcription = await openai.audio.transcriptions.create({
        file: fileStream,
        model: "whisper-1",
        response_format: "verbose_json",
        timestamp_granularities: ["word"],
      });
      
      console.log("Whisper API call successful");
    } catch (apiError: any) {
      console.error("OpenAI API Error:", apiError);
      console.error("Error details:", {
        message: apiError.message,
        code: apiError.code,
        status: apiError.status,
        cause: apiError.cause,
      });
      
      // Provide more specific error message
      if (apiError.code === 'ECONNRESET' || 
          apiError.code === 'ENOTFOUND' || 
          apiError.code === 'ETIMEDOUT' ||
          apiError.cause?.code === 'ECONNRESET') {
        return NextResponse.json(
          {
            error: "Network connection error",
            details: "Unable to connect to OpenAI API. Server may be experiencing network issues or OpenAI service may be unavailable.",
            suggestion: "Please try again in a few moments. If the issue persists, contact support.",
          },
          { status: 500 }
        );
      }
      
      if (apiError.status === 401 || apiError.status === 403) {
        return NextResponse.json(
          {
            error: "Invalid API key",
            details: "Your OpenAI API key is invalid or expired. Please check your environment variables.",
          },
          { status: 500 }
        );
      }

      if (apiError.status === 429) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            details: "OpenAI API rate limit reached. Please try again later.",
          },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        {
          error: "OpenAI API error",
          details: apiError.message || "Unknown error occurred",
        },
        { status: 500 }
      );
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
