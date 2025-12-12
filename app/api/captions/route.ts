import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Create OpenAI client with timeouts suitable for Vercel free tier (60s max)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 50000, // 50 seconds timeout (leave buffer for Vercel's 60s limit)
  maxRetries: 2, // Reduce retries to fit in 60s window
  dangerouslyAllowBrowser: false,
});

// Retry helper function for network errors (reduced for Vercel limits)
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a retryable error
      const isRetryable = 
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'ENOTFOUND' ||
        error.cause?.code === 'ECONNRESET' ||
        error.message?.includes('Connection error');
      
      if (!isRetryable || attempt === maxRetries - 1) {
        throw error;
      }
      
      // Shorter backoff for Vercel: 1s, 2s
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

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

    // Check file size (Vercel free tier with 60s timeout works best with videos under 25MB)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          error: "File too large",
          details: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds limit of 25MB for Vercel free tier. Please use a shorter video or upgrade to Pro plan.`,
          maxSizeMB: 25,
          fileSizeMB: (file.size / 1024 / 1024).toFixed(2)
        },
        { status: 413 }
      );
    }

    // Convert file to buffer (serverless compatible - no disk writes)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    console.log("File loaded into memory, ready for processing");

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
        videoData: buffer.toString('base64').substring(0, 100) + '...', // Return small preview
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
      // Use retry logic with exponential backoff (reduced for Vercel 60s limit)
      transcription = await retryWithBackoff(async () => {
        console.log("Attempting Whisper API call...");
        
        // Create a File object from buffer for OpenAI (serverless compatible)
        const fileForWhisper = new File([buffer], file.name, { type: file.type });
        
        const result = await openai.audio.transcriptions.create({
          file: fileForWhisper,
          model: "whisper-1",
          response_format: "verbose_json",
          timestamp_granularities: ["word"],
        });
        
        console.log("Whisper API call successful!");
        return result;
      }, 2, 1000); // 2 retries with 1 second base delay (faster for Vercel limits)
      
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
          apiError.cause?.code === 'ECONNRESET' ||
          apiError.message?.includes('Connection error')) {
        
        console.error("Network error detected - using fallback mock captions");
        
        // Return detailed error with suggestion to use mock mode
        return NextResponse.json(
          {
            error: "Network connection error to OpenAI",
            details: "The server is unable to establish a stable connection to OpenAI API. This may be due to network restrictions or OpenAI service issues.",
            suggestion: "Using mock captions as fallback. For production, please check network configuration or try again later.",
            technicalDetails: {
              errorCode: apiError.code || apiError.cause?.code,
              errorMessage: apiError.message,
              timestamp: new Date().toISOString(),
            },
            // Provide fallback mock captions
            fallbackCaptions: [
              { start: 0, end: 2.5, text: "Welcome to the Remotion Captioning Platform" },
              { start: 2.5, end: 5.0, text: "OpenAI API is currently unavailable" },
              { start: 5.0, end: 7.5, text: "These are fallback captions" },
              { start: 7.5, end: 10.0, text: "Please try again later or contact support" },
            ],
            mock: true,
          },
          { status: 503 } // Service Unavailable
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
          technicalDetails: {
            code: apiError.code,
            status: apiError.status,
            type: apiError.type,
          }
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
      fileName: file.name,
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
