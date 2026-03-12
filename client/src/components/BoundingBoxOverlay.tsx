/**
 * BoundingBoxOverlay – draws Roboflow detection bounding boxes on image
 */

import { useEffect, useRef } from "react";

interface Detection {
  x: number;
  y: number;
  width: number;
  height: number;
  class: string;
  confidence: number;
}

interface Props {
  imageUrl: string;
  predictions: Detection[];
  imageWidth: number;
  imageHeight: number;
}

export default function BoundingBoxOverlay({
  imageUrl,
  predictions,
  imageWidth,
  imageHeight,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !imageUrl) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Draw bounding boxes
      predictions.forEach((pred) => {
        const confidence = Math.round(pred.confidence * 100);
        const severity =
          pred.confidence >= 0.8 ? "high" : pred.confidence >= 0.6 ? "medium" : "low";

        // Color based on severity
        let color = "#10b981"; // green
        if (severity === "high") color = "#ef4444"; // red
        if (severity === "medium") color = "#f59e0b"; // amber

        // Calculate box coordinates (Roboflow returns center x, y with width, height)
        const left = pred.x - pred.width / 2;
        const top = pred.y - pred.height / 2;

        // Draw main box
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(left, top, pred.width, pred.height);

        // Draw corner accents
        const cornerSize = 15;
        ctx.fillStyle = color;
        
        // Top-left corner
        ctx.fillRect(left, top, cornerSize, 3);
        ctx.fillRect(left, top, 3, cornerSize);
        
        // Top-right corner
        ctx.fillRect(left + pred.width - cornerSize, top, cornerSize, 3);
        ctx.fillRect(left + pred.width - 3, top, 3, cornerSize);
        
        // Bottom-left corner
        ctx.fillRect(left, top + pred.height - 3, cornerSize, 3);
        ctx.fillRect(left, top + pred.height - cornerSize, 3, cornerSize);
        
        // Bottom-right corner
        ctx.fillRect(left + pred.width - cornerSize, top + pred.height - 3, cornerSize, 3);
        ctx.fillRect(left + pred.width - 3, top + pred.height - cornerSize, 3, cornerSize);

        // Draw label background
        const label = `${pred.class} ${confidence}%`;
        const fontSize = 14;
        ctx.font = `bold ${fontSize}px Arial`;
        const textMetrics = ctx.measureText(label);
        const textWidth = textMetrics.width;
        const textPadding = 8;

        // Label background
        ctx.fillStyle = color;
        ctx.fillRect(
          left,
          top - fontSize - textPadding * 2,
          textWidth + textPadding * 2,
          fontSize + textPadding * 2
        );

        // Label text
        ctx.fillStyle = "#000";
        ctx.fillText(label, left + textPadding, top - textPadding);
      });
    };

    img.onerror = () => {
      console.error("Failed to load image for bounding box overlay");
    };

    img.src = imageUrl;
  }, [imageUrl, predictions]);

  return (
    <div ref={containerRef} className="relative w-full bg-black rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-auto"
        style={{ maxHeight: "600px", display: "block" }}
      />
    </div>
  );
}
