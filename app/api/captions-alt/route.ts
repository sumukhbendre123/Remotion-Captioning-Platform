import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import FormData from "form-data";

// Alternative implementation using native fetch with better error handling
export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured");
      return NextResponse.json(
        { 
          error: "OpenAI API key not configured",
          details: "Please add OPENAI_API_KEY to your environment variables"
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

    // Check if we should use mock data
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

    console.log("Generating captions with Whisper (using native fetch)...");
    console.log("OpenAI API Key present:", !!process.env.OPENAI_API_KEY);

    // Use native fetch with proper FormData
    const openaiFormData = new FormData();
    openaiFormData.append('file', buffer, {
      filename: file.name,
      contentType: file.type,
    });
    openaiFormData.append('model', 'whisper-1');
    openaiFormData.append('response_format', 'verbose_json');
    openaiFormData.append('timestamp_granularities[]', 'word');

    let transcription;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        console.log(`Attempt ${retryCount + 1}/${maxRetries} to call OpenAI API...`);
        
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            ...openaiFormData.getHeaders(),
          },
          body: openaiFormData as any, // Type assertion for FormData compatibility
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`OpenAI API error (${response.status}):`, errorText);
          
          if (response.status === 401) {
            return NextResponse.json({
              error: "Invalid API key",
              details: "Your OpenAI API key is invalid or expired.",
            }, { status: 500 });
          }
          
          if (response.status === 429) {
            return NextResponse.json({
              error: "Rate limit exceeded",
              details: "OpenAI API rate limit reached. Please try again later.",
            }, { status: 429 });
          }
          
          throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
        }

        transcription = await response.json();
        console.log("Whisper API call successful!");
        break; // Success, exit retry loop
        
      } catch (fetchError: any) {
        console.error(`Attempt ${retryCount + 1} failed:`, fetchError.message);
        retryCount++;
        
        if (retryCount >= maxRetries) {
          console.error("All retry attempts failed");
          return NextResponse.json({
            error: "Network connection error to OpenAI",
            details: "Unable to establish a stable connection to OpenAI API after multiple attempts.",
            suggestion: "This may be due to network restrictions on the server. Please contact support.",
            technicalDetails: {
              error: fetchError.message,
              attempts: retryCount,
            },
          }, { status: 503 });
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, retryCount) * 2000;
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Process transcription into caption format
    const captions: Array<{ start: number; end: number; text: string }> = [];

    if (transcription.words) {
      let currentSegment: typeof transcription.words = [];
      let segmentStartTime = 0;

      transcription.words.forEach((word: any, index: number) => {
        if (currentSegment.length === 0) {
          segmentStartTime = word.start;
        }

        currentSegment.push(word);

        const shouldCreateSegment =
          currentSegment.length >= 7 ||
          /[.!?]$/.test(word.word) ||
          index === transcription.words.length - 1;

        if (shouldCreateSegment) {
          const text = currentSegment.map((w: any) => w.word).join(" ");
          const endTime = currentSegment[currentSegment.length - 1].end;

          captions.push({
            start: segmentStartTime,
            end: endTime,
            text: text.trim(),
          });

          currentSegment = [];
        }
      });
    } else if (transcription.segments) {
      transcription.segments.forEach((segment: any) => {
        captions.push({
          start: segment.start,
          end: segment.end,
          text: segment.text.trim(),
        });
      });
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
