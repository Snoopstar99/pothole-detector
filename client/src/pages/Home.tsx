/**
 * PotholeScan – Home Page (Refactored)
 * Design: Realistic professional pothole detection platform
 * 
 * Features:
 * - Browse Files upload
 * - Take Photo (camera)
 * - Live Stream video feed
 * - WebRTC Stream support
 * - Display Roboflow API results only (backend-driven inference)
 */

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DetectionResults from "@/components/DetectionResults";
import InputMethods from "@/components/InputMethods";

type InputMode = "idle" | "browse" | "camera" | "live-stream" | "webrtc";

interface Detection {
  x: number;
  y: number;
  width: number;
  height: number;
  class: string;
  confidence: number;
}

interface DetectionResult {
  predictions: Detection[];
  image: { width: number; height: number };
}

export default function Home() {
  const { user } = useAuth();
  const [inputMode, setInputMode] = useState<InputMode>("idle");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string>("");
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // tRPC mutation for analyzing image
  const analyzeMutation = trpc.detection.analyze.useMutation({
    onSuccess: (data) => {
      console.log("Detection successful:", data);
      setDetectionResult(data);
      setIsAnalyzing(false);
      toast.success(`Detected ${data.predictions.length} pothole(s)!`);
    },
    onError: (error) => {
      setIsAnalyzing(false);
      console.error("Detection error:", error);
      toast.error("Analysis failed: " + error.message);
    },
  });

  const handleBrowseFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, WEBP)");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File must be smaller than 20MB");
      return;
    }

    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setInputMode("browse");
    setIsAnalyzing(true);
    setDetectionResult(null);

    // Convert file to base64 and send to backend
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setImageBase64(base64);
      console.log("Sending image to backend for analysis...");
      analyzeMutation.mutate({ imageBase64: base64 });
    };
    reader.readAsDataURL(file);
  }, [analyzeMutation]);

  const handleTakePhoto = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setInputMode("camera");
      }
    } catch (err) {
      toast.error("Camera access denied");
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);

    const imageDataUrl = canvasRef.current.toDataURL("image/jpeg");
    const base64 = imageDataUrl.split(",")[1];
    
    setImageUrl(imageDataUrl);
    setIsAnalyzing(true);
    setDetectionResult(null);
    
    console.log("Capturing photo and sending to backend...");
    analyzeMutation.mutate({ imageBase64: base64 });

    // Stop camera stream
    const stream = videoRef.current.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
    setInputMode("idle");
  }, [analyzeMutation]);

  const handleReset = () => {
    setInputMode("idle");
    setSelectedImage(null);
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    setDetectionResult(null);
    setIsAnalyzing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/30 py-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-lg">NaveEye</h1>
              <p className="text-xs text-muted-foreground">Road Damage Detection</p>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground">Home</a>
            <a href="/about" className="text-sm text-muted-foreground hover:text-foreground">About</a>
            <a href="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
            <button className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center hover:bg-primary/30 transition-colors">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </nav>
        </div>
      </header>

      <main className="container py-12">
        {/* Results display or input methods */}
        {detectionResult && imageUrl && !isAnalyzing ? (
          <DetectionResults
            result={detectionResult}
            imageUrl={imageUrl}
            imageBase64={imageBase64}
            onReset={handleReset}
          />
        ) : (
          <InputMethods
            inputMode={inputMode}
            isAnalyzing={isAnalyzing}
            onBrowse={() => fileInputRef.current?.click()}
            onTakePhoto={handleTakePhoto}
            onCapturePhoto={capturePhoto}
            onLiveStream={() => setInputMode("live-stream")}
            onWebRTC={() => setInputMode("webrtc")}
            videoRef={videoRef as React.RefObject<HTMLVideoElement>}
          />
        )}
      </main>

      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleBrowseFile}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
