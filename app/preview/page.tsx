"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Player } from "@remotion/player";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useVideoStore } from "@/store/videoStore";
import { VideoComposition } from "@/remotion/VideoComposition";
import { Download, ArrowLeft, Loader2 } from "lucide-react";
import { CaptionStyle } from "@/remotion/types";
import { EditCaptionsDialog } from "@/components/EditCaptionsDialog";

export default function PreviewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [playerKey, setPlayerKey] = useState(0);

  const {
    videoUrl,
    captions,
    captionStyle,
    setCaptionStyle,
    isExporting,
    setIsExporting,
  } = useVideoStore();

  useEffect(() => {
    // Redirect if no video is loaded
    if (!videoUrl || captions.length === 0) {
      toast({
        title: "No Video Loaded",
        description: "Please upload a video first",
        variant: "destructive",
      });
      router.push("/upload");
    }
  }, [videoUrl, captions, router, toast]);

  const handleStyleChange = (style: CaptionStyle) => {
    setCaptionStyle(style);
    // Force player to re-render
    setPlayerKey((prev) => prev + 1);
    toast({
      title: "Style Updated",
      description: `Caption style changed to ${style}`,
    });
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      toast({
        title: "Preparing Export",
        description: "Generating captions file...",
      });

      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl,
          captions,
          captionStyle,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Export failed");
      }

      const data = await response.json();

      // Download SRT file
      const link = document.createElement("a");
      link.href = data.downloadUrl;
      link.download = data.fileName || `captions-${Date.now()}.srt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Captions Downloaded!",
        description: data.message || "SRT file downloaded successfully. Use it with your video editing software.",
        duration: 5000,
      });

      // Show instructions dialog
      if (data.instructions) {
        setTimeout(() => {
          alert(`📥 SRT File Downloaded!\n\n${data.instructions.title}:\n\n${data.instructions.steps.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}\n\n💡 Recommended Free Tools:\n${data.instructions.alternativeOptions.map((opt: any) => `• ${opt.name}: ${opt.description}`).join('\n')}`);
        }, 1000);
      }
    } catch (error: any) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export video",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (!videoUrl || captions.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Preview & Export
            </h1>
            <p className="text-gray-600">
              Preview your video with captions and export when ready
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/upload")}>
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Video Preview</h2>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <Player
                  key={playerKey}
                  component={VideoComposition}
                  inputProps={{
                    videoUrl,
                    captions,
                    captionStyle,
                  }}
                  durationInFrames={Math.ceil(
                    (captions[captions.length - 1]?.end || 10) * 30
                  )}
                  fps={30}
                  compositionWidth={1920}
                  compositionHeight={1080}
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                  controls
                  loop
                  autoPlay={false}
                  clickToPlay
                  spaceKeyToPlay
                  moveToBeginningWhenEnded
                  allowFullscreen
                  showVolumeControls
                  showPlaybackRateControl
                />
              </div>

              {/* Caption Info */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>{captions.length}</strong> caption segments •{" "}
                  <strong>{captionStyle}</strong> style
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Style Selector */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold mb-4">Caption Style</h3>
              <Select
                value={captionStyle}
                onValueChange={(value: string) =>
                  handleStyleChange(value as CaptionStyle)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Bottom Centered</span>
                      <span className="text-xs text-gray-500">
                        Classic subtitle style
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="top">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Top News Bar</span>
                      <span className="text-xs text-gray-500">
                        Breaking news style
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="karaoke">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Karaoke</span>
                      <span className="text-xs text-gray-500">
                        Word-by-word highlight
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Style Preview */}
              <div className="mt-4 p-3 bg-gray-50 rounded border">
                <p className="text-xs text-gray-600 mb-2">Preview:</p>
                {captionStyle === "bottom" && (
                  <div className="bg-black/70 text-white text-center py-2 px-4 rounded text-sm">
                    Bottom Subtitle
                  </div>
                )}
                {captionStyle === "top" && (
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-2 px-4 rounded text-sm">
                    ● LIVE Top Bar
                  </div>
                )}
                {captionStyle === "karaoke" && (
                  <div className="bg-black/80 text-center py-2 px-4 rounded text-sm">
                    <span className="text-yellow-400">Karaoke</span>{" "}
                    <span className="text-white">Style</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6 space-y-3">
              <h3 className="font-semibold mb-4">Actions</h3>

              <EditCaptionsDialog />

              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full"
                size="lg"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 w-5 h-5" />
                    Export Video
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Export may take 2-5 minutes depending on video length
              </p>
            </div>

            {/* Caption List */}
            <div className="bg-white rounded-lg shadow-lg p-6 max-h-96 overflow-y-auto">
              <h3 className="font-semibold mb-4">Captions</h3>
              <div className="space-y-2">
                {captions.map((caption: any, index: number) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded border border-gray-200"
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      {caption.start.toFixed(1)}s - {caption.end.toFixed(1)}s
                    </div>
                    <div className="text-sm">{caption.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
