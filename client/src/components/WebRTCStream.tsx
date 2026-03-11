/**
 * WebRTCStream – handles remote video feeds via WebRTC
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, X, Activity, Globe, Play, Square } from "lucide-react";
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

export default function WebRTCStream({ onClose, onAnalyze }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [streamUrl, setStreamUrl] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fps, setFps] = useState(0);
  const [lastDetections, setLastDetections] = useState<Detection[]>([]);
  
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(Date.now());
  const requestRef = useRef<number>();
  const isAnalyzingRef = useRef(false);

  const handleConnect = useCallback(async () => {
    if (!streamUrl) {
      toast.error("Please enter a valid stream URL");
      return;
    }

    setIsConnecting(true);
    
    // For demo purposes, we'll support direct video URLs or simulate WebRTC
    // In a real WebRTC app, you'd use RTCPeerConnection here
    try {
      if (videoRef.current) {
        videoRef.current.src = streamUrl;
        videoRef.current.onloadedmetadata = () => {
          setIsConnected(true);
          setIsConnecting(false);
          toast.success("Connected to stream");
        };
        videoRef.current.onerror = () => {
          setIsConnecting(false);
          toast.error("Failed to load stream. Ensure the URL is correct and CORS is enabled.");
        };
      }
    } catch (err) {
      console.error("Error connecting to stream:", err);
      setIsConnecting(false);
      toast.error("Connection failed");
    }
  }, [streamUrl]);

  const handleDisconnect = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.src = "";
      videoRef.current.load();
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    setIsConnected(false);
    setLastDetections([]);
  }, []);

  const drawDetections = useCallback((detections: Detection[]) => {
    if (!overlayCanvasRef.current || !videoRef.current) return;
    
    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(left, top, width, height);

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
    if (!isConnected || !videoRef.current || !canvasRef.current) return;

    frameCountRef.current++;
    const now = Date.now();
    if (now - lastFpsUpdateRef.current >= 1000) {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
      lastFpsUpdateRef.current = now;
    }

    if (!isAnalyzingRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
        isAnalyzingRef.current = true;
        setIsAnalyzing(true);

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
  }, [isConnected, onAnalyze, drawDetections]);

  useEffect(() => {
    if (isConnected) {
      requestRef.current = requestAnimationFrame(processFrame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isConnected, processFrame]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-black/40 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30">
              <Globe className="w-3 h-3 text-cyan-500" />
              <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider">REMOTE</span>
            </div>
            <h3 className="text-sm font-bold text-white/90 uppercase tracking-widest mono">WebRTC Feed</h3>
          </div>
          
          <div className="flex items-center gap-4">
            {isConnected && (
              <div className="flex items-center gap-2 text-white/60 mono text-xs">
                <Activity className="w-3 h-3" />
                <span>{fps} FPS</span>
              </div>
            )}
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Connection Bar */}
        {!isConnected && (
          <div className="px-6 py-8 bg-black/20 border-b border-white/5">
            <div className="max-w-md mx-auto">
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 mono">
                Stream URL (WebRTC / HLS / MP4)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="https://example.com/stream.m3u8"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                />
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Connect
                </button>
              </div>
              <p className="mt-3 text-[10px] text-white/30 italic">
                Note: Ensure the stream source allows CORS for browser-based analysis.
              </p>
            </div>
          </div>
        )}

        {/* Video Container */}
        <div className="relative aspect-video bg-black group">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            crossOrigin="anonymous"
            className={`w-full h-full object-cover ${!isConnected ? 'hidden' : ''}`}
          />
          
          {/* Overlay Canvas for Bounding Boxes */}
          <canvas
            ref={overlayCanvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />

          {/* Hidden Analysis Canvas */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Status Overlays */}
          {!isConnected && !isConnecting && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="text-center">
                <Globe className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <p className="text-white/40 font-medium text-sm">Waiting for connection...</p>
              </div>
            </div>
          )}

          {isConnecting && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                <p className="text-white/70 font-medium">Connecting to remote feed...</p>
              </div>
            </div>
          )}

          {/* Detection Indicator */}
          {isConnected && lastDetections.length > 0 && (
            <div className="absolute bottom-6 left-6 px-4 py-2 rounded-xl bg-red-500/90 text-white font-bold text-sm shadow-lg animate-bounce flex items-center gap-2">
              <Activity className="w-4 h-4" />
              {lastDetections.length} POTHOLE(S) DETECTED
            </div>
          )}

          {/* Analyzing Indicator */}
          {isConnected && isAnalyzing && (
            <div className="absolute top-6 right-6 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 backdrop-blur-md flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-tighter">Analyzing</span>
            </div>
          )}

          {/* Disconnect Button */}
          {isConnected && (
            <button
              onClick={handleDisconnect}
              className="absolute top-6 left-6 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 backdrop-blur-md text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/40 transition-colors flex items-center gap-2"
            >
              <Square className="w-3 h-3 fill-current" />
              Disconnect
            </button>
          )}
        </div>

        {/* Footer Info */}
        <div className="px-6 py-4 bg-black/20 flex items-center justify-between text-[11px] text-white/40 mono uppercase tracking-wider">
          <div className="flex gap-6">
            <span>Protocol: WebRTC/HLS</span>
            <span>Status: {isConnected ? 'CONNECTED' : 'IDLE'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-white/20'}`} />
            <span>{isConnected ? 'STREAM ACTIVE' : 'SYSTEM READY'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
