"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export interface RenderProgress {
  progress: number;
  stage: string;
  message: string;
}

let ffmpeg: FFmpeg | null = null;
let ffmpegLoaded = false;

/**
 * Initialize FFmpeg.wasm (only once)
 */
async function loadFFmpeg(onProgress?: (progress: RenderProgress) => void): Promise<FFmpeg> {
  if (ffmpeg && ffmpegLoaded) return ffmpeg;

  onProgress?.({
    progress: 5,
    stage: "loading",
    message: "Loading MP4 converter (30MB download, first time only)...",
  });

  ffmpeg = new FFmpeg();
  
  // Enable logging for debugging
  ffmpeg.on("log", ({ message }) => {
    console.log("[FFmpeg]", message);
  });

  ffmpeg.on("progress", ({ progress }) => {
    console.log(`[FFmpeg] Progress: ${(progress * 100).toFixed(0)}%`);
  });
  
  try {
    // Load FFmpeg core from CDN
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });

    ffmpegLoaded = true;

    onProgress?.({
      progress: 15,
      stage: "loaded",
      message: "MP4 converter loaded successfully!",
    });

    return ffmpeg;
  } catch (error) {
    console.error("Failed to load FFmpeg:", error);
    ffmpegLoaded = false;
    throw new Error(`Failed to load video converter: ${error}`);
  }
}

/**
 * Convert WebM to MP4 using FFmpeg.wasm
 */
async function convertWebMToMP4(
  webmBlob: Blob,
  onProgress?: (progress: RenderProgress) => void
): Promise<Blob> {
  try {
    onProgress?.({
      progress: 80,
      stage: "converting",
      message: "Converting to MP4 format...",
    });

    const ffmpegInstance = await loadFFmpeg(onProgress);

    // Write input file to FFmpeg virtual filesystem
    console.log("Writing input file, size:", webmBlob.size);
    const inputData = await fetchFile(webmBlob);
    await ffmpegInstance.writeFile("input.webm", inputData);

    onProgress?.({
      progress: 85,
      stage: "converting",
      message: "Encoding video to MP4...",
    });

    // Convert WebM to MP4 with compatible settings
    await ffmpegInstance.exec([
      "-i", "input.webm",
      "-c:v", "libx264",           // H.264 video codec
      "-preset", "ultrafast",       // Fastest encoding
      "-crf", "23",                 // Quality
      "-c:a", "aac",                // AAC audio codec
      "-b:a", "128k",               // Audio bitrate
      "-movflags", "faststart",     // Web optimization
      "-y",                         // Overwrite output
      "output.mp4"
    ]);

    onProgress?.({
      progress: 95,
      stage: "finalizing",
      message: "Reading MP4 file...",
    });

    // Read output file
    const data = await ffmpegInstance.readFile("output.mp4");
    console.log("Output file size:", data.length);
    
    if (!data || data.length === 0) {
      throw new Error("FFmpeg produced empty output file");
    }

    // Clean up virtual filesystem
    try {
      await ffmpegInstance.deleteFile("input.webm");
      await ffmpegInstance.deleteFile("output.mp4");
    } catch (cleanupError) {
      console.warn("Cleanup warning:", cleanupError);
    }

    // Convert to Blob
    const mp4Blob = new Blob([data as any], { type: "video/mp4" });
    console.log("MP4 blob created, size:", mp4Blob.size);

    onProgress?.({
      progress: 100,
      stage: "complete",
      message: "MP4 video ready!",
    });

    return mp4Blob;
  } catch (error) {
    console.error("MP4 conversion error:", error);
    throw error;
  }
}

/**
 * Record video from Remotion Player using MediaRecorder API
 * This captures the actual rendered output including video + captions
 */
export async function recordVideoFromPlayer(
  playerRef: HTMLDivElement,
  durationInSeconds: number,
  onProgress?: (progress: RenderProgress) => void
): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      onProgress?.({
        progress: 5,
        stage: "setup",
        message: "Initializing video recorder...",
      });

      // Find the video element within the player
      const videoElement = playerRef.querySelector("video") as HTMLVideoElement;
      const canvas = playerRef.querySelector("canvas") as HTMLCanvasElement;
      
      if (!videoElement && !canvas) {
        throw new Error("Could not find video element or canvas in player");
      }

      // Get the canvas or create one from video
      let captureCanvas: HTMLCanvasElement;
      let ctx: CanvasRenderingContext2D;

      if (canvas) {
        captureCanvas = canvas;
        ctx = canvas.getContext("2d", { willReadFrequently: true })!;
      } else {
        captureCanvas = document.createElement("canvas");
        captureCanvas.width = 1920;
        captureCanvas.height = 1080;
        ctx = captureCanvas.getContext("2d", { willReadFrequently: true })!;
      }

      onProgress?.({
        progress: 10,
        stage: "recording",
        message: "Starting recording...",
      });

      // Use canvas.captureStream() to record
      const stream = captureCanvas.captureStream(30); // 30 FPS

      // Also capture audio if available
      if (videoElement && (videoElement as any).captureStream) {
        try {
          const audioStream = (videoElement as any).captureStream();
          const audioTracks = audioStream.getAudioTracks();
          audioTracks.forEach((track: MediaStreamTrack) => stream.addTrack(track));
        } catch (e) {
          console.warn("Could not capture audio:", e);
        }
      }

      const chunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 5000000, // 5 Mbps
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("Recording stopped, chunks:", chunks.length);
        const webmBlob = new Blob(chunks, { type: "video/webm" });
        console.log("WebM blob size:", webmBlob.size);
        
        if (webmBlob.size === 0) {
          reject(new Error("Recording produced empty video"));
          return;
        }

        try {
          onProgress?.({
            progress: 75,
            stage: "recorded",
            message: "Recording complete! Converting to MP4...",
          });

          // Convert WebM to MP4
          const mp4Blob = await convertWebMToMP4(webmBlob, onProgress);
          
          if (mp4Blob.size === 0) {
            throw new Error("Conversion produced empty MP4 file");
          }
          
          console.log("Successfully converted to MP4, size:", mp4Blob.size);
          resolve(mp4Blob);
        } catch (conversionError: any) {
          console.error("MP4 conversion failed:", conversionError);
          reject(new Error(`Failed to convert to MP4: ${conversionError.message}. Please try again or contact support.`));
        }
      };

      mediaRecorder.onerror = (error) => {
        reject(new Error(`Recording failed: ${error}`));
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms

      // Update progress during recording
      const startTime = Date.now();
      const progressInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min((elapsed / durationInSeconds) * 80, 80);
        
        onProgress?.({
          progress: 10 + progress,
          stage: "recording",
          message: `Recording... ${Math.round(elapsed)}s / ${Math.round(durationInSeconds)}s`,
        });

        if (elapsed >= durationInSeconds) {
          clearInterval(progressInterval);
        }
      }, 500);

      // Stop recording after duration
      setTimeout(() => {
        clearInterval(progressInterval);
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
      }, durationInSeconds * 1000 + 500);

    } catch (error) {
      console.error("Recording error:", error);
      reject(error);
    }
  });
}
