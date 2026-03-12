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

import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DetectionResults from "@/components/DetectionResults";
import InputMethods from "@/components/InputMethods";
import VideoResults from "@/components/VideoResults";
import { useLocation, type LocationData } from "@/hooks/useLocation";

type InputMode = "idle" | "browse" | "camera" | "live-stream" | "webrtc" | "video";

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

interface VideoAnalysisResult {
  totalFrames: number;
  videoMetadata: { duration: number; width: number; height: number };
  results: Array<{
    frameNumber: number;
    timestamp: string;
    predictions: Detection[];
    confidence: string | number;
  }>;
  summary: {
    totalDetections: number;
    framesWithDetections: number;
  };
}

export default function Home() {
  const { user } = useAuth();
  const [inputMode, setInputMode] = useState<InputMode>("idle");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string>("");
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [videoResult, setVideoResult] = useState<VideoAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedLocation, setCapturedLocation] = useState<LocationData | null>(null);
  const { location: currentLocation, getLocation } = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
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

  // tRPC mutation for analyzing video
  const analyzeVideoMutation = trpc.detection.analyzeVideo.useMutation({
    onSuccess: (data) => {
      console.log("Video analysis successful:", data);
      setVideoResult(data);
      setIsAnalyzing(false);
      toast.success(`Video analyzed! Found ${data.summary.totalDetections} detections in ${data.summary.framesWithDetections} frames.`);
    },
    onError: (error) => {
      setIsAnalyzing(false);
      console.error("Video analysis error:", error);
      toast.error("Video analysis failed: " + error.message);
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

    // Convert file to base64 with compression
    const reader = new FileReader();
    reader.onload = async () => {
      if (!reader.result) return;
      
      // Create an image to get dimensions
      const img = new Image();
      img.onload = () => {
        // Resize image to max 800px width/height for smaller file size
        const maxSize = 800;
        let width = img.width;
        let height = img.height;
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        
        // Create canvas to resize
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Get compressed base64 (quality 0.7)
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];
        
        console.log(`Image resized from ${Math.round(reader.result.toString().length / 1024)}KB to ${Math.round(compressedBase64.length / 1024)}KB`);
        
        setImageBase64(compressedBase64);
        getLocation();
        analyzeMutation.mutate({ imageBase64: compressedBase64 });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }, [analyzeMutation]);

  // Handle video file upload
  const handleVideoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file (MP4, WEBM, etc.)");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video must be smaller than 50MB");
      return;
    }

    setInputMode("video");
    setIsAnalyzing(true);
    setDetectionResult(null);
    setVideoResult(null);

    // Get location when video is uploaded
    getLocation();

    // Convert video to base64 and send to backend
    const reader = new FileReader();
    reader.onload = async () => {
      if (!reader.result) return;
      const base64 = (reader.result as string).split(",")[1];
      console.log("Sending video to backend for analysis...", Math.round(base64.length / 1024) + "KB");
      analyzeVideoMutation.mutate({ 
        videoBase64: base64,
        fps: 1,
        maxFrames: 30
      });
    };
    reader.readAsDataURL(file);
  }, [analyzeVideoMutation]);

  // Handler for video button click
  const handleVideoButtonClick = () => {
    videoInputRef.current?.click();
  };

  // Stub handlers for unimplemented features
  const handleLiveStream = () => {
    toast.info("Live stream feature coming soon!");
  };

  const handleWebRTC = () => {
    toast.info("WebRTC streaming coming soon!");
  };

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

    // Resize image to max 800px width/height for smaller file size
    const maxSize = 800;
    let width = videoRef.current.videoWidth;
    let height = videoRef.current.videoHeight;
    
    if (width > height && width > maxSize) {
      height = (height * maxSize) / width;
      width = maxSize;
    } else if (height > maxSize) {
      width = (width * maxSize) / height;
      height = maxSize;
    }
    
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    ctx.drawImage(videoRef.current, 0, 0, width, height);

    // Get compressed base64 (quality 0.7)
    const imageDataUrl = canvasRef.current.toDataURL("image/jpeg", 0.7);
    const base64 = imageDataUrl.split(",")[1];
    
    setImageUrl(imageDataUrl);
    setIsAnalyzing(true);
    setDetectionResult(null);
    
    // Get location when photo is captured
    getLocation();
    
    console.log("Capturing photo and sending to backend...", Math.round(base64.length / 1024) + "KB");
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
    setVideoResult(null);
    setIsAnalyzing(false);
    setCapturedLocation(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  // Store location when it becomes available
  useEffect(() => {
    if (currentLocation && !capturedLocation) {
      setCapturedLocation(currentLocation);
    }
  }, [currentLocation, capturedLocation]);

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
            capturedLocation={capturedLocation}
          />
        ) : videoResult && !isAnalyzing ? (
          <VideoResults
            result={videoResult}
            onReset={handleReset}
            capturedLocation={capturedLocation}
          />
        ) : (
          <InputMethods
            inputMode={inputMode}
            isAnalyzing={isAnalyzing}
            onBrowse={() => fileInputRef.current?.click()}
            onTakePhoto={handleTakePhoto}
            onCapturePhoto={capturePhoto}
            onVideoUpload={handleVideoButtonClick}
            onRTSPStream={() => toast.info("RTSP stream coming soon!")}
            onLiveStream={handleLiveStream}
            onWebRTC={handleWebRTC}
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
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
