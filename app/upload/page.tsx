"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useVideoStore } from "@/store/videoStore";
import { Upload, Video, ArrowRight, Loader2 } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    setVideoFile,
    setVideoUrl,
    setCaptions,
    setIsGeneratingCaptions,
    isGeneratingCaptions,
  } = useVideoStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("video/")) {
        toast({
          title: "Invalid File",
          description: "Please upload a valid video file (MP4, MOV, etc.)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Please upload a video smaller than 100MB",
          variant: "destructive",
        });
        return;
      }

      setVideoFile(file);
      toast({
        title: "Video Loaded",
        description: `${file.name} is ready for caption generation`,
      });
    }
  };

  const handleGenerateCaptions = async () => {
    const videoFile = useVideoStore.getState().videoFile;

    if (!videoFile) {
      toast({
        title: "No Video",
        description: "Please upload a video first",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingCaptions(true);
    setUploadProgress(0);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("video", videoFile);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      toast({
        title: "Processing Video",
        description: "Uploading and generating captions with AI...",
      });

      // Call caption generation API
      const response = await fetch("/api/captions", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || "Failed to generate captions");
      }

      const data = await response.json();

      // Create URL for the video file for preview
      const videoUrl = URL.createObjectURL(videoFile);

      // Update store with video URL and captions
      setVideoUrl(videoUrl);
      setCaptions(data.captions);

      toast({
        title: "Captions Generated!",
        description: data.info || `Successfully generated ${data.captions.length} caption segments`,
      });

      // Navigate to preview
      setTimeout(() => {
        router.push("/preview");
      }, 1000);
    } catch (error: any) {
      console.error("Caption generation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate captions",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCaptions(false);
      setUploadProgress(0);
    }
  };

  const videoFile = useVideoStore((state: any) => state.videoFile);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Upload Your Video
          </h1>
          <p className="text-gray-600">
            Upload an MP4 video to automatically generate AI-powered captions
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors">
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />

            <label htmlFor="video-upload" className="cursor-pointer">
              <Input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isGeneratingCaptions}
              />
              <Button variant="outline" asChild>
                <span>
                  <Video className="mr-2 w-4 h-4" />
                  Choose Video File
                </span>
              </Button>
            </label>

            <p className="text-sm text-gray-500 mt-4">
              Supported formats: MP4, MOV, AVI (Max 100MB)
            </p>

            {videoFile && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="font-semibold text-blue-900">{videoFile.name}</p>
                <p className="text-sm text-blue-700">
                  {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>

          {/* Progress */}
          {isGeneratingCaptions && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Generating captions...
                </span>
                <span className="text-sm text-gray-600">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Generate Button */}
          <div className="mt-8">
            <Button
              onClick={handleGenerateCaptions}
              disabled={!videoFile || isGeneratingCaptions}
              size="lg"
              className="w-full"
            >
              {isGeneratingCaptions ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Generating Captions...
                </>
              ) : (
                <>
                  Generate Captions
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">🤖 AI-Powered</h3>
            <p className="text-sm text-gray-600">
              Using AssemblyAI for accurate real-time transcription with word-level timestamps
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">🌏 Hinglish Support</h3>
            <p className="text-sm text-gray-600">
              Supports English, Hindi, and mixed Hinglish speech
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
