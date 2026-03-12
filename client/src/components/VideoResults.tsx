/**
 * VideoResults – displays video analysis results with send to authorities option
 */

import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { LocationData } from "@/hooks/useLocation";

interface Detection {
  x: number;
  y: number;
  width: number;
  height: number;
  class: string;
  confidence: number;
}

interface VideoFrameResult {
  frameNumber: number;
  timestamp: string;
  predictions: Detection[];
  confidence: string;
}

interface VideoAnalysisResult {
  totalFrames: number;
  videoMetadata: { duration: number; width: number; height: number };
  results: VideoFrameResult[];
  summary: {
    totalDetections: number;
    framesWithDetections: number;
  };
}

interface Props {
  result: VideoAnalysisResult;
  onReset: () => void;
  capturedLocation: LocationData | null;
}

export default function VideoResults({ result, onReset, capturedLocation }: Props) {
  const [isSending, setIsSending] = useState(false);
  
  const sendReportMutation = trpc.detection.sendReport.useMutation({
    onSuccess: () => {
      setIsSending(false);
      toast.success("Report sent to authorities!");
    },
    onError: (error) => {
      setIsSending(false);
      toast.error("Failed to send report: " + error.message);
    },
  });

  const handleSendToAuthorities = () => {
    if (!capturedLocation) {
      toast.error("Location not available. Please allow location access.");
      return;
    }

    setIsSending(true);
    
    // Calculate average confidence from all frames with detections
    const framesWithDetections = result.results.filter(r => r.predictions.length > 0);
    const avgConfidence = framesWithDetections.length > 0
      ? framesWithDetections.reduce((sum, r) => sum + parseFloat(r.confidence), 0) / framesWithDetections.length
      : 0;

    // Get the frame with most detections for the image attachment
    const bestFrame = result.results.reduce((best, current) => 
      current.predictions.length > best.predictions.length ? current : best
    , result.results[0]);

    // Create a simple summary image showing detection info
    const summaryText = `Video Analysis Summary:
- Total Frames Analyzed: ${result.totalFrames}
- Frames with Detections: ${result.summary.framesWithDetections}
- Total Potholes Detected: ${result.summary.totalDetections}
- Average Confidence: ${(avgConfidence * 100).toFixed(1)}%
- Video Duration: ${result.videoMetadata.duration.toFixed(1)}s

Frames with detections: ${framesWithDetections.map(f => `Frame ${f.frameNumber} (${f.timestamp}s): ${f.predictions.length} potholes`).join('\n')}`;

    sendReportMutation.mutate({
      potholeCount: result.summary.totalDetections,
      averageConfidence: avgConfidence,
      latitude: capturedLocation.latitude,
      longitude: capturedLocation.longitude,
      address: capturedLocation.address,
      imageBase64: btoa(summaryText), // Send summary as text in base64
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video analysis results */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <span className="text-sm font-semibold text-primary mono">VIDEO ANALYSIS RESULTS</span>
              <button
                onClick={onReset}
                className="text-xs px-3 py-1 rounded-md border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                ← Back
              </button>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-5xl font-extrabold text-primary mb-2">{result.summary.totalDetections}</div>
                <p className="text-muted-foreground">Total Potholes Detected</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{result.totalFrames}</div>
                  <p className="text-xs text-muted-foreground">Frames Analyzed</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{result.summary.framesWithDetections}</div>
                  <p className="text-xs text-muted-foreground">Frames with Detections</p>
                </div>
              </div>

              {/* Frames with detections */}
              {result.results.filter(r => r.predictions.length > 0).length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mono mb-3">DETECTIONS BY FRAME</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {result.results.filter(r => r.predictions.length > 0).map((frame, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-amber-400/10 border border-amber-400/30">
                        <div>
                          <p className="text-sm font-semibold">Frame {frame.frameNumber}</p>
                          <p className="text-xs text-muted-foreground">Timestamp: {frame.timestamp}s</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-amber-400">{frame.predictions.length}</p>
                          <p className="text-xs text-muted-foreground">potholes</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Summary */}
          <div className="glass-card rounded-xl p-5">
            <p className="text-xs text-muted-foreground mono mb-3">SUMMARY</p>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Video Duration</span>
                <span className="text-sm font-semibold">{result.videoMetadata.duration.toFixed(1)}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Resolution</span>
                <span className="text-sm font-semibold">{result.videoMetadata.width}x{result.videoMetadata.height}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Frames Analyzed</span>
                <span className="text-sm font-semibold">{result.totalFrames}</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className={`
            rounded-xl p-4 border text-sm font-semibold flex items-center gap-2
            ${result.summary.totalDetections > 0
              ? "bg-amber-400/10 border-amber-400/30 text-amber-400"
              : "bg-green-400/10 border-green-400/30 text-green-400"
            }
          `}>
            {result.summary.totalDetections > 0 ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Road damage detected
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Road appears clear
              </>
            )}
          </div>

          {/* Send to Authorities button */}
          <button
            onClick={handleSendToAuthorities}
            disabled={isSending}
            className="w-full py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSending ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                📧 Send to Authorities
              </>
            )}
          </button>

          {/* Location info */}
          {capturedLocation && (
            <div className="glass-card rounded-xl p-4 text-xs">
              <p className="text-muted-foreground mb-2">📍 Location Detected</p>
              <p className="font-mono text-xs">{capturedLocation.latitude.toFixed(6)}, {capturedLocation.longitude.toFixed(6)}</p>
              {capturedLocation.address && <p className="text-muted-foreground mt-1">{capturedLocation.address}</p>}
            </div>
          )}

          {/* New analysis button */}
          <button
            onClick={onReset}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            ↑ Analyze Another
          </button>
        </div>
      </div>
    </div>
  );
}
