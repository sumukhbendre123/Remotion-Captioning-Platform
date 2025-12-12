import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    const useMock = process.env.USE_MOCK_CAPTIONS;
    const nodeEnv = process.env.NODE_ENV;

    console.log("Environment check:");
    console.log("- OPENAI_API_KEY present:", !!apiKey);
    console.log("- OPENAI_API_KEY prefix:", apiKey?.substring(0, 20));
    console.log("- USE_MOCK_CAPTIONS:", useMock);
    console.log("- NODE_ENV:", nodeEnv);

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "OPENAI_API_KEY not set",
        env: {
          USE_MOCK_CAPTIONS: useMock,
          NODE_ENV: nodeEnv,
        }
      });
    }

    // Test OpenAI connection
    const openai = new OpenAI({
      apiKey: apiKey,
      timeout: 30000,
    });

    console.log("Testing OpenAI API connection...");
    
    // Simple API test - list models
    const models = await openai.models.list();
    
    return NextResponse.json({
      success: true,
      message: "OpenAI API connection successful",
      apiKeyPresent: true,
      apiKeyPrefix: apiKey.substring(0, 20),
      modelsCount: models.data.length,
      env: {
        USE_MOCK_CAPTIONS: useMock,
        NODE_ENV: nodeEnv,
      }
    });

  } catch (error: any) {
    console.error("OpenAI test error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      errorCode: error.code,
      errorStatus: error.status,
      errorType: error.type,
      apiKeyPresent: !!process.env.OPENAI_API_KEY,
    }, { status: 500 });
  }
}
