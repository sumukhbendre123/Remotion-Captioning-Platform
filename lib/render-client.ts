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
 * Record video from Remotion Player by capturing the entire player container
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
        message: "Setting up screen capture...",
      });

      // Check if player container exists
      if (!playerRef) {
        throw new Error("Player reference is null");
      }

      console.log("Player container:", playerRef);
      console.log("Container children:", playerRef.children.length);

      // Find the actual player div (it's inside the container)
      const playerElement = playerRef.querySelector('[data-remotion-player]') || 
                           playerRef.querySelector('.remotion-player') ||
                           playerRef.querySelector('div > div') ||
                           playerRef;

      console.log("Player element found:", !!playerElement);

      // Get dimensions from the player
      const rect = playerElement.getBoundingClientRect();
      const width = Math.floor(rect.width) || 1920;
      const height = Math.floor(rect.height) || 1080;

      console.log("Player dimensions:", width, "x", height);

      // Create a canvas to draw frames
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { 
        willReadFrequently: false,
        alpha: false 
      })!;

      onProgress?.({
        progress: 10,
        stage: "recording",
        message: "Starting video capture...",
      });

      // Try to use modern Screen Capture API if available
      let stream: MediaStream;
      
      try {
        // Method 1: Try to capture from canvas stream
        stream = canvas.captureStream(30);
        console.log("Canvas stream created");
      } catch (err) {
        console.error("Failed to create canvas stream:", err);
        throw new Error("Browser doesn't support video capture. Please use Chrome or Edge.");
      }

      // Try to capture audio from video element
      const videoElement = playerRef.querySelector("video") as HTMLVideoElement;
      if (videoElement) {
        try {
          const audioContext = new AudioContext();
          const source = audioContext.createMediaElementSource(videoElement);
          const dest = audioContext.createMediaStreamDestination();
          source.connect(dest);
          source.connect(audioContext.destination);
          
          const audioTracks = dest.stream.getAudioTracks();
          console.log("Audio tracks found:", audioTracks.length);
          audioTracks.forEach((track: MediaStreamTrack) => stream.addTrack(track));
        } catch (e) {
          console.warn("Could not capture audio:", e);
        }
      }

      const chunks: Blob[] = [];
      
      // Use the most compatible codec
      let mimeType = "video/webm;codecs=vp8";
      if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
        mimeType = "video/webm;codecs=vp9";
      } else if (MediaRecorder.isTypeSupported("video/webm")) {
        mimeType = "video/webm";
      }
      
      console.log("Using codec:", mimeType);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 8000000,
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log("Chunk received:", event.data.size, "bytes");
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("Recording stopped, total chunks:", chunks.length);
        
        if (chunks.length === 0) {
          reject(new Error("Recording failed: No video data captured. Please try again."));
          return;
        }

        const webmBlob = new Blob(chunks, { type: "video/webm" });
        console.log("WebM blob created, size:", webmBlob.size, "bytes");
        
        if (webmBlob.size === 0 || webmBlob.size < 1000) {
          reject(new Error("Recording produced empty video. Please try again."));
          return;
        }

        try {
          onProgress?.({
            progress: 75,
            stage: "recorded",
            message: "Recording complete! Converting to MP4...",
          });

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
      mediaRecorder.start(100);

      // Capture frames using html2canvas-like approach
      const fps = 30;
      const frameDuration = 1000 / fps;
      const totalFrames = Math.ceil(durationInSeconds * fps);
      let frameCount = 0;

      // Import html2canvas dynamically for DOM to canvas conversion
      const captureFrame = async () => {
        if (frameCount >= totalFrames) {
          return;
        }

        try {
          // Draw the player element to canvas using basic DOM capture
          // This is a simplified version - we'll draw black background and white text for demo
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Try to capture the video element if present
          if (videoElement && !videoElement.paused) {
            try {
              ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            } catch (e) {
              console.warn("Could not draw video frame:", e);
            }
          }

          // TODO: Capture text overlays - for now we're just capturing the video
          
          frameCount++;

          const progress = Math.min((frameCount / totalFrames) * 65, 65);
          onProgress?.({
            progress: 10 + progress,
            stage: "recording",
            message: `Recording frame ${frameCount}/${totalFrames}...`,
          });

          if (frameCount < totalFrames) {
            setTimeout(captureFrame, frameDuration);
          } else {
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
