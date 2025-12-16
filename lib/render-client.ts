"use client";

export interface RenderProgress {
  progress: number;
  stage: string;
  message: string;
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
        onProgress?.({
          progress: 90,
          stage: "finalizing",
          message: "Converting to MP4...",
        });

        const webmBlob = new Blob(chunks, { type: "video/webm" });
        
        onProgress?.({
          progress: 100,
          stage: "complete",
          message: "Video ready for download!",
        });

        resolve(webmBlob);
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
