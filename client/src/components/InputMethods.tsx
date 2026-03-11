/**
 * InputMethods – displays upload, camera, and streaming options
 */

import { Loader2 } from "lucide-react";

type InputMode = "idle" | "browse" | "camera" | "live-stream" | "webrtc";

interface Props {
  inputMode: InputMode;
  isAnalyzing: boolean;
  onBrowse: () => void;
  onTakePhoto: () => void;
  onCapturePhoto: () => void;
  onLiveStream: () => void;
  onWebRTC: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export default function InputMethods({
  inputMode,
  isAnalyzing,
  onBrowse,
  onTakePhoto,
  onCapturePhoto,
  onLiveStream,
  onWebRTC,
  videoRef,
}: Props) {
  if (inputMode === "camera") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <span className="text-sm font-semibold text-primary mono">CAMERA CAPTURE</span>
            <button
              onClick={onCapturePhoto}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Capture Photo
            </button>
          </div>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full aspect-video bg-black"
          />
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-lg font-semibold">Analyzing image...</p>
        <p className="text-muted-foreground text-sm mt-2">Please wait while Roboflow processes your image</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Detect Road Damage</h2>
        <p className="text-muted-foreground text-lg">
          Upload or capture images to analyze for potholes and road damage
        </p>
      </div>

      {/* Input options grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Browse Files */}
        <button
          onClick={onBrowse}
          className="glass-card rounded-xl p-8 text-center hover:border-primary/60 transition-all hover:bg-primary/5"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="font-bold text-lg mb-2">Browse Files</h3>
          <p className="text-sm text-muted-foreground">Upload an image from your device</p>
        </button>

        {/* Take Photo */}
        <button
          onClick={onTakePhoto}
          className="glass-card rounded-xl p-8 text-center hover:border-primary/60 transition-all hover:bg-primary/5"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="font-bold text-lg mb-2">Take Photo</h3>
          <p className="text-sm text-muted-foreground">Use your device camera</p>
        </button>

        {/* Live Stream */}
        <button
          onClick={onLiveStream}
          disabled
          className="glass-card rounded-xl p-8 text-center opacity-50 cursor-not-allowed"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-muted/10 border border-muted/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-bold text-lg mb-2">Live Stream</h3>
          <p className="text-sm text-muted-foreground">Coming soon</p>
        </button>

        {/* WebRTC Stream */}
        <button
          onClick={onWebRTC}
          disabled
          className="glass-card rounded-xl p-8 text-center opacity-50 cursor-not-allowed"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-muted/10 border border-muted/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 19V6a2 2 0 012-2h4a2 2 0 012 2v13a2 2 0 01-2 2h-4a2 2 0 01-2-2zm0 0V5a2 2 0 012-2h4a2 2 0 012 2v14a2 2 0 01-2 2h-4a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="font-bold text-lg mb-2">WebRTC Stream</h3>
          <p className="text-sm text-muted-foreground">Coming soon</p>
        </button>
      </div>
    </div>
  );
}
