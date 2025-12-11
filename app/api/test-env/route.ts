import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    useMockCaptions: process.env.USE_MOCK_CAPTIONS === 'true',
    hasApiKey: !!process.env.OPENAI_API_KEY,
    apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10) + '...',
  });
}
