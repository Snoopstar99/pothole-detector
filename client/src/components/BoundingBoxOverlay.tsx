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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !imageRef.current || !imageUrl) return;

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

        // Calculate box coordinates
        const left = pred.x - pred.width / 2;
        const top = pred.y - pred.height / 2;

        // Draw box
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(left, top, pred.width, pred.height);

        // Draw corner accents
        const cornerSize = 15;
        ctx.fillStyle = color;
        // Top-left
        ctx.fillRect(left, top, cornerSize, 3);
        ctx.fillRect(left, top, 3, cornerSize);
        // Top-right
        ctx.fillRect(left + pred.width - cornerSize, top, cornerSize, 3);
        ctx.fillRect(left + pred.width - 3, top, 3, cornerSize);
        // Bottom-left
        ctx.fillRect(left, top + pred.height - 3, cornerSize, 3);
        ctx.fillRect(left, top + pred.height - cornerSize, 3, cornerSize);
        // Bottom-right
        ctx.fillRect(left + pred.width - cornerSize, top + pred.height - 3, cornerSize, 3);
        ctx.fillRect(left + pred.width - 3, top + pred.height - cornerSize, 3, cornerSize);

        // Draw label
        const label = `${pred.class} ${confidence}%`;
        const fontSize = 14;
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = color;
        const textWidth = ctx.measureText(label).width;
        const textPadding = 8;

        ctx.fillRect(
          left,
          top - fontSize - textPadding * 2,
          textWidth + textPadding * 2,
          fontSize + textPadding * 2
        );

        ctx.fillStyle = "#000";
        ctx.fillText(label, left + textPadding, top - textPadding);
      });
    };

    img.src = imageUrl;
  }, [imageUrl, predictions]);

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        className="w-full h-auto bg-black rounded-lg"
        style={{ maxHeight: "600px", objectFit: "contain" }}
      />
    </div>
  );
}
