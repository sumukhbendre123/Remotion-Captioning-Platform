import { NextRequest, NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';

// Initialize AssemblyAI client
const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('video') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided', message: 'Please upload a video file' },
        { status: 400 }
      );
    }

    // Check if AssemblyAI API key is configured
    if (!process.env.ASSEMBLYAI_API_KEY) {
      console.warn('ASSEMBLYAI_API_KEY not found, using mock captions');
      return getMockCaptions(file.name);
    }

    console.log('Processing file:', file.name, 'Size:', file.size);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('Sending to AssemblyAI for real-time transcription...');

    try {
      // Transcribe the audio/video file with word-level timestamps
      const transcript = await client.transcripts.transcribe({
        audio: buffer,
        language_code: 'en', // Auto-detect English/Hinglish
      });

      // Check if transcription was successful
      if (transcript.status === 'error') {
        throw new Error(transcript.error || 'Transcription failed');
      }

      if (!transcript.words || transcript.words.length === 0) {
        throw new Error('No words transcribed from audio');
      }

      console.log('AssemblyAI transcription received:', transcript.text);

      // Convert AssemblyAI word timestamps (milliseconds) to seconds
      const wordsWithTimestamps = transcript.words.map(w => ({
        word: w.text,
        start: w.start / 1000, // Convert ms to seconds
        end: w.end / 1000,
      }));

      // Convert word-level timestamps to caption segments
      const captions = groupWordsIntoCaptions(wordsWithTimestamps);

      console.log(`Generated ${captions.length} caption segments from ${transcript.words.length} words`);

      return NextResponse.json({
        captions,
        fileName: file.name,
        transcription: transcript.text,
        info: 'Real AI transcription powered by AssemblyAI (FREE tier)',
        duration: transcript.audio_duration,
      });

    } catch (assemblyError: any) {
      console.error('AssemblyAI API error:', assemblyError);
      
      // If AssemblyAI fails, fall back to enhanced mock captions
      console.warn('AssemblyAI failed, using enhanced mock captions');
      const estimatedDuration = Math.max((file.size / 1024 / 1024) * 10, 10);
      return getEnhancedMockCaptions(file.name, estimatedDuration);
    }

  } catch (error: any) {
    console.error('Caption generation error:', error);

    // Handle timeout errors
    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      return NextResponse.json(
        {
          error: 'Transcription timeout',
          message: 'Your video took too long to process. Vercel free tier has a 60-second limit.',
          suggestion: 'Use a SHORTER video (under 30-45 seconds) or upgrade to Vercel Pro for longer timeout limits.',
          details: error.message,
        },
        { status: 504 }
      );
    }

    // Handle API key errors
    if (error.message?.includes('API key') || error.message?.includes('ASSEMBLYAI_API_KEY')) {
      return NextResponse.json(
        {
          error: 'API Configuration Error',
          message: 'AssemblyAI API key is not configured or invalid.',
          suggestion: 'Get a free API key from https://www.assemblyai.com/ and add it to Vercel environment variables as ASSEMBLYAI_API_KEY.',
          details: error.message,
        },
        { status: 401 }
      );
    }

    // Handle quota/rate limit errors
    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      return NextResponse.json(
        {
          error: 'API Quota Exceeded',
          message: 'AssemblyAI API quota exceeded. Free tier: 5 hours/month.',
          suggestion: 'Wait for quota reset or upgrade your AssemblyAI plan.',
          details: error.message,
        },
        { status: 429 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        error: 'Caption generation failed',
        message: error.message || 'An unexpected error occurred',
        suggestion: 'Check if your video is under 30-45 seconds and under 4.5MB. Ensure ASSEMBLYAI_API_KEY is set in Vercel environment variables.',
      },
      { status: 500 }
    );
  }
}

// Helper function to group words into caption segments
function groupWordsIntoCaptions(words: Array<{ word: string; start: number; end: number }>) {
  const captions = [];
  const wordsPerCaption = 6; // Group 6-8 words per caption for readability

  for (let i = 0; i < words.length; i += wordsPerCaption) {
    const segment = words.slice(i, i + wordsPerCaption);
    const text = segment.map(w => w.word).join(' ');
    const start = segment[0].start;
    const end = segment[segment.length - 1].end;

    captions.push({
      text,
      start,
      end,
      words: segment,
    });
  }

  return captions;
}

// Mock captions fallback (when API key not configured)
function getMockCaptions(fileName: string) {
  const mockCaptions = [
    {
      text: 'Welcome to Remotion Captioning Platform',
      start: 0,
      end: 3,
      words: [
        { word: 'Welcome', start: 0, end: 0.5 },
        { word: 'to', start: 0.5, end: 0.7 },
        { word: 'Remotion', start: 0.7, end: 1.5 },
        { word: 'Captioning', start: 1.5, end: 2.3 },
        { word: 'Platform', start: 2.3, end: 3 },
      ],
    },
    {
      text: 'This is a demo caption',
      start: 3,
      end: 5,
      words: [
        { word: 'This', start: 3, end: 3.3 },
        { word: 'is', start: 3.3, end: 3.5 },
        { word: 'a', start: 3.5, end: 3.6 },
        { word: 'demo', start: 3.6, end: 4.2 },
        { word: 'caption', start: 4.2, end: 5 },
      ],
    },
    {
      text: 'Configure ASSEMBLYAI_API_KEY for real captions',
      start: 5,
      end: 8,
      words: [
        { word: 'Configure', start: 5, end: 5.7 },
        { word: 'ASSEMBLYAI_API_KEY', start: 5.7, end: 6.8 },
        { word: 'for', start: 6.8, end: 7 },
        { word: 'real', start: 7, end: 7.3 },
        { word: 'captions', start: 7.3, end: 8 },
      ],
    },
  ];

  return NextResponse.json({
    captions: mockCaptions,
    fileName: fileName,
    warning: 'Using mock captions - ASSEMBLYAI_API_KEY not configured',
  });
}

// Enhanced mock captions with dynamic duration
function getEnhancedMockCaptions(fileName: string, duration: number) {
  const sampleTexts = [
    'Welcome to our video presentation',
    'This is an automated caption system',
    'Built with Remotion and Next.js',
    'Featuring three different caption styles',
    'Bottom captions, top captions, and karaoke mode',
    'You can customize colors and animations',
    'Export your video with captions included',
    'Perfect for social media content',
    'Thank you for watching',
  ];

  const captions = [];
  const segmentDuration = duration / sampleTexts.length;

  sampleTexts.forEach((text, index) => {
    const words = text.split(' ');
    const wordDuration = segmentDuration / words.length;
    
    const wordTimestamps = words.map((word, wordIndex) => ({
      word: word,
      start: (index * segmentDuration) + (wordIndex * wordDuration),
      end: (index * segmentDuration) + ((wordIndex + 1) * wordDuration),
    }));

    captions.push({
      text: text,
      start: index * segmentDuration,
      end: (index + 1) * segmentDuration,
      words: wordTimestamps,
    });
  });

  return NextResponse.json({
    captions,
    fileName: fileName,
    warning: 'Using enhanced mock captions - Real transcription requires a dedicated speech-to-text service (AssemblyAI, Deepgram, or Google Cloud Speech-to-Text)',
    info: `Estimated video duration: ${duration.toFixed(1)} seconds`,
  });
}
