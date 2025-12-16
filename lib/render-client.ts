"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export interface RenderProgress {
  progress: number;
  stage: string;
  message: string;
}

let ffmpeg: FFmpeg | null = null;

/**
 * Initialize FFmpeg.wasm (only once)
 */
async function loadFFmpeg(onProgress?: (progress: RenderProgress) => void): Promise<FFmpeg> {
  if (ffmpeg) return ffmpeg;

  onProgress?.({
    progress: 5,
    stage: "loading",
    message: "Loading video converter (first time only)...",
  });

  ffmpeg = new FFmpeg();
  
  // Load FFmpeg core
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  onProgress?.({
    progress: 10,
    stage: "loaded",
    message: "Video converter ready!",
  });

  return ffmpeg;
}

/**
 * Convert WebM to MP4 using FFmpeg.wasm
 */
async function convertWebMToMP4(
  webmBlob: Blob,
  onProgress?: (progress: RenderProgress) => void
): Promise<Blob> {
  onProgress?.({
    progress: 85,
    stage: "converting",
    message: "Converting to MP4 format...",
  });

  const ffmpegInstance = await loadFFmpeg(onProgress);

  // Write input file to FFmpeg virtual filesystem
  const inputData = await fetchFile(webmBlob);
  await ffmpegInstance.writeFile("input.webm", inputData);

  onProgress?.({
    progress: 90,
    stage: "converting",
    message: "Processing video...",
  });

  // Convert WebM to MP4
  await ffmpegInstance.exec([
    "-i", "input.webm",
    "-c:v", "libx264",      // H.264 video codec
    "-preset", "fast",       // Fast encoding
    "-crf", "22",            // Quality (lower = better, 18-28 range)
    "-c:a", "aac",           // AAC audio codec
    "-b:a", "128k",          // Audio bitrate
    "-movflags", "+faststart", // Enable streaming
    "output.mp4"
  ]);

  onProgress?.({
    progress: 95,
    stage: "finalizing",
    message: "Finalizing MP4 file...",
  });

  // Read output file
  const data = await ffmpegInstance.readFile("output.mp4");
  
  // Clean up
  await ffmpegInstance.deleteFile("input.webm");
  await ffmpegInstance.deleteFile("output.mp4");

  // Convert to Blob
  const mp4Blob = new Blob([data as any], { type: "video/mp4" });

  onProgress?.({
    progress: 100,
    stage: "complete",
    message: "MP4 video ready!",
  });

  return mp4Blob;
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
        const webmBlob = new Blob(chunks, { type: "video/webm" });
        
        try {
          // Convert WebM to MP4
          const mp4Blob = await convertWebMToMP4(webmBlob, onProgress);
          resolve(mp4Blob);
        } catch (conversionError) {
          console.error("MP4 conversion failed, returning WebM:", conversionError);
          // Fallback to WebM if conversion fails
          onProgress?.({
            progress: 100,
            stage: "complete",
            message: "Video ready (WebM format)!",
          });
          resolve(webmBlob);
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
