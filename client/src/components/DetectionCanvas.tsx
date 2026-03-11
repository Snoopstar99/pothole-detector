/**
 * DetectionCanvas – renders the uploaded image with bounding box overlays
 * Design: Bold AI-Tech – teal bounding boxes with amber confidence labels
 */

import { useEffect, useRef, useState } from "react";
import type { DetectionResult } from "@/pages/Home";

interface Props {
  imageUrl: string;
  result: DetectionResult | null;
  isAnalyzing: boolean;
}

export default function DetectionCanvas({ imageUrl, result, isAnalyzing }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scanPos, setScanPos] = useState(0);
  const animFrameRef = useRef<number | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  // Load image and set canvas size
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const container = containerRef.current;
      if (!container) return;
      const maxW = container.clientWidth || 800;
      const ratio = img.height / img.width;
      const w = maxW;
      const h = Math.round(maxW * ratio);
      setCanvasSize({ w, h });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Scan animation
  useEffect(() => {
    if (!isAnalyzing) {
      setScanPos(0);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }
    let start: number | null = null;
    const duration = 1500;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = (ts - start) % duration;
      setScanPos(elapsed / duration);
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isAnalyzing]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || canvasSize.w === 0) return;

    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw image
    ctx.drawImage(img, 0, 0, canvasSize.w, canvasSize.h);

    // Draw scan line overlay
    if (isAnalyzing) {
      // Dark overlay
      ctx.fillStyle = "rgba(15, 23, 42, 0.35)";
      ctx.fillRect(0, 0, canvasSize.w, canvasSize.h);

      // Scan beam
      const y = scanPos * canvasSize.h;
      const gradient = ctx.createLinearGradient(0, y - 40, 0, y + 40);
      gradient.addColorStop(0, "rgba(6, 182, 212, 0)");
      gradient.addColorStop(0.5, "rgba(6, 182, 212, 0.6)");
      gradient.addColorStop(1, "rgba(6, 182, 212, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, y - 40, canvasSize.w, 80);

      // Scan line
      ctx.strokeStyle = "rgba(6, 182, 212, 0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasSize.w, y);
      ctx.stroke();
    }

    // Draw bounding boxes
    if (result && result.predictions.length > 0) {
      const scaleX = canvasSize.w / result.image.width;
      const scaleY = canvasSize.h / result.image.height;

      result.predictions.forEach((pred, idx) => {
        const x1 = (pred.x - pred.width / 2) * scaleX;
        const y1 = (pred.y - pred.height / 2) * scaleY;
        const w = pred.width * scaleX;
        const h = pred.height * scaleY;

        // Confidence-based color: high = teal, low = amber
        const conf = pred.confidence;
        const color = conf >= 0.7
          ? "rgba(6, 182, 212, 0.9)"   // teal
          : conf >= 0.5
          ? "rgba(245, 158, 11, 0.9)"  // amber
          : "rgba(239, 68, 68, 0.9)";  // red

        // Bounding box
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([]);
        ctx.strokeRect(x1, y1, w, h);

        // Corner accents
        const cornerLen = Math.min(w, h) * 0.15;
        ctx.lineWidth = 3;
        // TL
        ctx.beginPath(); ctx.moveTo(x1, y1 + cornerLen); ctx.lineTo(x1, y1); ctx.lineTo(x1 + cornerLen, y1); ctx.stroke();
        // TR
        ctx.beginPath(); ctx.moveTo(x1 + w - cornerLen, y1); ctx.lineTo(x1 + w, y1); ctx.lineTo(x1 + w, y1 + cornerLen); ctx.stroke();
        // BL
        ctx.beginPath(); ctx.moveTo(x1, y1 + h - cornerLen); ctx.lineTo(x1, y1 + h); ctx.lineTo(x1 + cornerLen, y1 + h); ctx.stroke();
        // BR
        ctx.beginPath(); ctx.moveTo(x1 + w - cornerLen, y1 + h); ctx.lineTo(x1 + w, y1 + h); ctx.lineTo(x1 + w, y1 + h - cornerLen); ctx.stroke();

        // Label background
        const label = `#${idx + 1} ${Math.round(conf * 100)}%`;
        ctx.font = "bold 12px 'JetBrains Mono', monospace";
        const textW = ctx.measureText(label).width;
        const labelH = 22;
        const labelY = y1 > labelH + 4 ? y1 - labelH - 2 : y1 + 2;

        ctx.fillStyle = color.replace("0.9", "0.85");
        ctx.fillRect(x1, labelY, textW + 12, labelH);

        // Label text
        ctx.fillStyle = "#0F172A";
        ctx.fillText(label, x1 + 6, labelY + 15);
      });
    }
  }, [canvasSize, result, isAnalyzing, scanPos]);

  return (
    <div ref={containerRef} className="relative w-full">
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "auto", display: "block" }}
      />
      {isAnalyzing && (
        <div className="absolute bottom-4 left-4 flex items-center gap-2 glass-card px-3 py-2 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <span className="text-xs mono text-primary font-semibold">SCANNING...</span>
        </div>
      )}
    </div>
  );
}
