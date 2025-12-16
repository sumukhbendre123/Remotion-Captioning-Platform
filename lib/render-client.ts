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
 * Record video from Remotion Player by playing it and capturing frames
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
        message: "Setting up video capture...",
      });

      // Find ALL canvas elements (Remotion uses multiple canvases)
      const canvases = playerRef.querySelectorAll("canvas");
      console.log("Found canvases:", canvases.length);
      
      if (canvases.length === 0) {
        throw new Error("Could not find canvas in Remotion player. Make sure video is loaded.");
      }

      // Use the last canvas (usually the final composed output)
      const sourceCanvas = canvases[canvases.length - 1] as HTMLCanvasElement;
      console.log("Using canvas:", sourceCanvas.width, "x", sourceCanvas.height);

      // Create a new canvas for capturing
      const captureCanvas = document.createElement("canvas");
      captureCanvas.width = sourceCanvas.width || 1920;
      captureCanvas.height = sourceCanvas.height || 1080;
      const ctx = captureCanvas.getContext("2d", { willReadFrequently: false })!;

      onProgress?.({
        progress: 10,
        stage: "recording",
        message: "Starting video recording...",
      });

      // Create stream from capture canvas
      const stream = captureCanvas.captureStream(30); // 30 FPS
      
      // Try to capture audio from video element
      const videoElement = playerRef.querySelector("video") as HTMLVideoElement;
      if (videoElement) {
        try {
          const mediaStream = (videoElement as any).captureStream?.() || (videoElement as any).mozCaptureStream?.();
          if (mediaStream) {
            const audioTracks = mediaStream.getAudioTracks();
            console.log("Audio tracks found:", audioTracks.length);
            audioTracks.forEach((track: MediaStreamTrack) => stream.addTrack(track));
          }
        } catch (e) {
          console.warn("Could not capture audio:", e);
        }
      }

      const chunks: Blob[] = [];
      
      // Try different codecs in order of preference
      let mimeType = "video/webm;codecs=vp8"; // Most compatible
      if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
        mimeType = "video/webm;codecs=vp9";
      }
      
      console.log("Using codec:", mimeType);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 8000000, // 8 Mbps for better quality
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log("Data chunk received:", event.data.size, "bytes");
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("Recording stopped, total chunks:", chunks.length);
        
        if (chunks.length === 0) {
          reject(new Error("Recording failed: No video data captured. The canvas might not be updating. Try refreshing the page and ensure the video is playing."));
          return;
        }

        const webmBlob = new Blob(chunks, { type: "video/webm" });
        console.log("WebM blob created, size:", webmBlob.size, "bytes");
        
        if (webmBlob.size === 0 || webmBlob.size < 1000) {
          reject(new Error("Recording produced empty or too small video file. Please try again."));
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
          
          console.log("Successfully converted to MP4, size:", mp4Blob.size, "bytes");
          resolve(mp4Blob);
        } catch (conversionError: any) {
          console.error("MP4 conversion failed:", conversionError);
          reject(new Error(`Failed to convert to MP4: ${conversionError.message}`));
        }
      };

      mediaRecorder.onerror = (error) => {
        console.error("MediaRecorder error:", error);
        reject(new Error(`Recording failed: ${error}`));
      };

      // Start recording
      console.log("Starting MediaRecorder...");
      mediaRecorder.start(100); // Collect data every 100ms

      // Continuously copy frames from source canvas to capture canvas
      let frameCount = 0;
      const fps = 30;
      const frameDuration = 1000 / fps;
      const totalFrames = Math.ceil(durationInSeconds * fps);

      const captureFrame = () => {
        if (frameCount >= totalFrames) {
          return;
        }

        try {
          // Copy current frame from source canvas
          ctx.drawImage(sourceCanvas, 0, 0, captureCanvas.width, captureCanvas.height);
          frameCount++;

          // Update progress
          const progress = Math.min((frameCount / totalFrames) * 65, 65);
          onProgress?.({
            progress: 10 + progress,
            stage: "recording",
            message: `Recording frame ${frameCount}/${totalFrames}...`,
          });

          // Schedule next frame
          if (frameCount < totalFrames) {
            setTimeout(captureFrame, frameDuration);
          } else {
            // Recording complete
            console.log("All frames captured, stopping recorder...");
            setTimeout(() => {
              mediaRecorder.stop();
              stream.getTracks().forEach(track => track.stop());
            }, 500);
          }
        } catch (err) {
          console.error("Frame capture error:", err);
        }
      };

      // Start capturing frames
      captureFrame();

    } catch (error) {
      console.error("Recording setup error:", error);
      reject(error);
    }
  });
}
