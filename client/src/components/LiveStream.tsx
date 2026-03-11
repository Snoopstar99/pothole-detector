/**
 * LiveStream – handles real-time video capture and frame analysis
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, X, Camera, Activity } from "lucide-react";
import { toast } from "sonner";

interface Detection {
  x: number;
  y: number;
  width: number;
  height: number;
  class: string;
  confidence: number;
}

interface Props {
  onClose: () => void;
  onAnalyze: (base64: string) => Promise<any>;
}

export default function LiveStream({ onClose, onAnalyze }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fps, setFps] = useState(0);
  const [lastDetections, setLastDetections] = useState<Detection[]>([]);
  
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(Date.now());
  const requestRef = useRef<number>();
  const isAnalyzingRef = useRef(false);

  const startStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("Camera access denied or not available");
      onClose();
    }
  }, [onClose]);

  const stopStream = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    setIsActive(false);
  }, []);

  const drawDetections = useCallback((detections: Detection[]) => {
    if (!overlayCanvasRef.current || !videoRef.current) return;
    
    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Match canvas size to video display size
    canvas.width = videoRef.current.clientWidth;
    canvas.height = videoRef.current.clientHeight;
    
    const scaleX = canvas.width / videoRef.current.videoWidth;
    const scaleY = canvas.height / videoRef.current.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((pred) => {
      const confidence = Math.round(pred.confidence * 100);
      const severity = pred.confidence >= 0.8 ? "high" : pred.confidence >= 0.6 ? "medium" : "low";

      let color = "#10b981"; // green
      if (severity === "high") color = "#ef4444"; // red
      if (severity === "medium") color = "#f59e0b"; // amber

      const width = pred.width * scaleX;
      const height = pred.height * scaleY;
      const left = (pred.x - pred.width / 2) * scaleX;
      const top = (pred.y - pred.height / 2) * scaleY;

      // Draw box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(left, top, width, height);

      // Label
      ctx.fillStyle = color;
      ctx.font = "bold 12px Inter, sans-serif";
      const label = `${pred.class} ${confidence}%`;
      const textWidth = ctx.measureText(label).width;
      ctx.fillRect(left, top - 20, textWidth + 10, 20);
      ctx.fillStyle = "#000";
      ctx.fillText(label, left + 5, top - 5);
    });
  }, []);

  const processFrame = useCallback(async () => {
    if (!isActive || !videoRef.current || !canvasRef.current) return;

    // Update FPS
    frameCountRef.current++;
    const now = Date.now();
    if (now - lastFpsUpdateRef.current >= 1000) {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
      lastFpsUpdateRef.current = now;
    }

    // Only analyze if not already analyzing (throttle)
    if (!isAnalyzingRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
        isAnalyzingRef.current = true;
        setIsAnalyzing(true);

        // Draw current frame to hidden canvas for analysis
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        try {
          const base64 = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];
          const result = await onAnalyze(base64);
          if (result && result.predictions) {
            setLastDetections(result.predictions);
            drawDetections(result.predictions);
          }
        } catch (err) {
          console.error("Frame analysis error:", err);
        } finally {
          isAnalyzingRef.current = false;
          setIsAnalyzing(false);
        }
      }
    }

    requestRef.current = requestAnimationFrame(processFrame);
  }, [isActive, onAnalyze, drawDetections]);

  useEffect(() => {
    startStream();
    return () => stopStream();
  }, [startStream, stopStream]);

  useEffect(() => {
    if (isActive) {
      requestRef.current = requestAnimationFrame(processFrame);
    }
  }, [isActive, processFrame]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-black/40 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">LIVE</span>
            </div>
            <h3 className="text-sm font-bold text-white/90 uppercase tracking-widest mono">NaveEye Stream</h3>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white/60 mono text-xs">
              <Activity className="w-3 h-3" />
              <span>{fps} FPS</span>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative aspect-video bg-black group">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Overlay Canvas for Bounding Boxes */}
          <canvas
            ref={overlayCanvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />

          {/* Hidden Analysis Canvas */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Status Overlays */}
          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                <p className="text-white/70 font-medium">Initializing camera...</p>
              </div>
            </div>
          )}

          {/* Detection Indicator */}
          {lastDetections.length > 0 && (
            <div className="absolute bottom-6 left-6 px-4 py-2 rounded-xl bg-red-500/90 text-white font-bold text-sm shadow-lg animate-bounce flex items-center gap-2">
              <Camera className="w-4 h-4" />
              {lastDetections.length} POTHOLE(S) DETECTED
            </div>
          )}

          {/* Analyzing Indicator */}
          {isAnalyzing && (
            <div className="absolute top-6 right-6 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 backdrop-blur-md flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-tighter">Analyzing</span>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="px-6 py-4 bg-black/20 flex items-center justify-between text-[11px] text-white/40 mono uppercase tracking-wider">
          <div className="flex gap-6">
            <span>Model: Roboflow-v3</span>
            <span>Latency: ~200ms</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span>System Healthy</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Point your camera at the road. Detections will appear automatically.
        </p>
      </div>
    </div>
  );
}
