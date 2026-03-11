/**
 * PotholeScan – Home Page
 * Design: Bold AI-Tech / Deep-tech Startup
 * Colors: Deep navy + Electric teal (#06B6D4) + Amber (#F59E0B)
 * Typography: Outfit (headings) + JetBrains Mono (data)
 * 
 * Roboflow API: POST https://detect.roboflow.com/pothole-detection-iwfu9/3
 * Key: cB3ypDmTTMqeecqXbRfs
 * Response: { predictions: [{x, y, width, height, class, confidence}], image: {width, height} }
 */

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import DetectionCanvas from "@/components/DetectionCanvas";
import StatsPanel from "@/components/StatsPanel";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

export interface Detection {
  x: number;
  y: number;
  width: number;
  height: number;
  class: string;
  confidence: number;
}

export interface DetectionResult {
  predictions: Detection[];
  image: { width: number; height: number };
  time?: number;
}

type AppState = "idle" | "uploading" | "analyzing" | "done" | "error";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Image must be smaller than 20MB.");
      return;
    }
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setResult(null);
    setAppState("uploading");
    runInference(file);
  }, []);

  const runInference = async (file: File) => {
    setAppState("analyzing");
    const startTime = Date.now();
    try {
      const base64 = await fileToBase64(file);
      const response = await fetch(
        `https://detect.roboflow.com/pothole-detection-iwfu9/3?api_key=cB3ypDmTTMqeecqXbRfs`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: base64,
        }
      );
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      const data: DetectionResult = await response.json();
      data.time = Date.now() - startTime;
      setResult(data);
      setAppState("done");
      if (data.predictions.length === 0) {
        toast.success("Analysis complete — no potholes detected.");
      } else {
        toast.success(
          `Detected ${data.predictions.length} pothole${data.predictions.length > 1 ? "s" : ""}!`
        );
      }
    } catch (err) {
      console.error(err);
      setAppState("error");
      toast.error("Detection failed. Please try again.");
    }
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip the data URL prefix
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleReset = () => {
    setAppState("idle");
    setImageFile(null);
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <HeroSection />

      {/* ── Detection Section ── */}
      <section id="detect" className="py-20 relative">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.72 0.18 200) 1px, transparent 1px), linear-gradient(90deg, oklch(0.72 0.18 200) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="container relative z-10">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mono bg-primary/10 text-primary border border-primary/20 mb-4">
              POWERED BY ROBOFLOW AI
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Upload & Detect
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Upload any road image and our AI model will instantly identify potholes with bounding boxes and confidence scores.
            </p>
          </div>

          {/* Upload / Result area */}
          {appState === "idle" ? (
            <UploadZone
              isDragging={isDragging}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onFileChange={handleFileChange}
              fileInputRef={fileInputRef}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in-up">
              {/* Annotated image */}
              <div className="lg:col-span-2">
                <div className="glass-card rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-sm font-semibold mono text-primary">
                        {appState === "analyzing" ? "ANALYZING..." : "DETECTION RESULT"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {imageFile && (
                        <span className="text-xs text-muted-foreground mono">
                          {imageFile.name}
                        </span>
                      )}
                      <button
                        onClick={handleReset}
                        className="text-xs px-3 py-1 rounded-md border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                      >
                        New Image
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    {imageUrl && (
                      <DetectionCanvas
                        imageUrl={imageUrl}
                        result={result}
                        isAnalyzing={appState === "analyzing"}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Stats panel */}
              <div className="lg:col-span-1">
                <StatsPanel
                  result={result}
                  isAnalyzing={appState === "analyzing"}
                  imageFile={imageFile}
                  onNewImage={handleReset}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      <HowItWorks />
      <Footer />
    </div>
  );
}

/* ── Upload Zone Component ── */
interface UploadZoneProps {
  isDragging: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

function UploadZone({
  isDragging,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileChange,
  fileInputRef,
}: UploadZoneProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={`gradient-border transition-all duration-300 ${isDragging ? "scale-[1.02]" : ""}`}
      >
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`
            glass-card rounded-xl p-12 text-center cursor-pointer
            transition-all duration-300 relative overflow-hidden
            ${isDragging
              ? "bg-primary/10 border-primary/60"
              : "hover:bg-primary/5"
            }
          `}
        >
          {/* Animated background dots */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-primary/30"
                style={{
                  left: `${15 + i * 15}%`,
                  top: `${20 + (i % 3) * 30}%`,
                  animation: `pulseGlow ${1.5 + i * 0.3}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>

          {/* Upload icon */}
          <div className="relative z-10">
            <div className={`
              w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center
              bg-primary/10 border border-primary/30
              transition-all duration-300
              ${isDragging ? "scale-110 bg-primary/20 border-primary/60" : ""}
            `}>
              <svg
                className="w-10 h-10 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>

            <h3 className="text-2xl font-bold mb-2">
              {isDragging ? "Drop to analyze" : "Drop your road image here"}
            </h3>
            <p className="text-muted-foreground mb-6">
              or click to browse files
            </p>

            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg btn-teal text-sm font-bold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Choose Image
            </div>

            <p className="text-xs text-muted-foreground mt-4 mono">
              Supports JPG, PNG, WEBP · Max 20MB
            </p>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
      />

      {/* Sample images hint */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        Try uploading a photo of a damaged road to see the AI in action.
      </p>
    </div>
  );
}
