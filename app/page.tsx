import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Upload, Video, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <Video className="w-20 h-20 text-blue-600" />
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Remotion Captioning Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              AI-powered video captioning with stunning styles. Upload,
              generate, and export professional captions in seconds.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <Sparkles className="w-12 h-12 text-blue-600 mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">AI-Powered</h3>
              <p className="text-gray-600 text-sm">
                Auto-generate accurate captions using OpenAI Whisper
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <Video className="w-12 h-12 text-purple-600 mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Live Preview</h3>
              <p className="text-gray-600 text-sm">
                Real-time preview with Remotion Player
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <Upload className="w-12 h-12 text-pink-600 mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Export HD</h3>
              <p className="text-gray-600 text-sm">
                Export professional quality MP4 videos
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="space-x-4">
            <Link href="/upload">
              <Button size="lg" className="text-lg px-8">
                <Upload className="mr-2 w-5 h-5" />
                Start Creating
              </Button>
            </Link>
          </div>

          {/* Supported Features */}
          <div className="mt-16 p-8 bg-white rounded-lg shadow-md">
            <h3 className="font-semibold text-xl mb-4">Caption Styles</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 border rounded">
                <span className="font-semibold">Bottom Centered</span>
                <p className="text-gray-600 mt-2">Classic subtitle style</p>
              </div>
              <div className="p-4 border rounded">
                <span className="font-semibold">Top News Bar</span>
                <p className="text-gray-600 mt-2">Breaking news style</p>
              </div>
              <div className="p-4 border rounded">
                <span className="font-semibold">Karaoke</span>
                <p className="text-gray-600 mt-2">Word-by-word highlight</p>
              </div>
            </div>
            <p className="text-gray-600 mt-6">
              ✨ Supports Hinglish (English + Devanagari)
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
