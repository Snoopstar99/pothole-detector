import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import axios from "axios";
import { sendDamageReport } from "./email";
import { extractVideoFrames, getVideoMetadata } from "./videoProcessor";
import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import os from "os";

const ROBOFLOW_API_KEY = "IhL1Lhrl5Qra3XJDkFYD";
const ROBOFLOW_MODEL = "pothole-detection-lwf9u/3";
const ROBOFLOW_URL = `https://detect.roboflow.com/${ROBOFLOW_MODEL}`;
const ROBOFLOW_VIDEO_URL = `https://detect.roboflow.com/${ROBOFLOW_MODEL}`;

// Helper function for frame extraction method (fallback)
async function analyzeVideoWithFrames(videoBase64: string, fps: number, maxFrames: number) {
  const tempDir = os.tmpdir();
  const tempFile = path.join(tempDir, `video-${nanoid()}.mp4`);
  
  try {
    const videoBuffer = Buffer.from(videoBase64, "base64");
    await fs.writeFile(tempFile, videoBuffer);

    const metadata = await getVideoMetadata(tempFile);
    console.log("[Video] Metadata:", metadata);

    const frames = await extractVideoFrames(tempFile, { fps, maxFrames });
    console.log(`[Video] Extracted ${frames.length} frames`);

    const results = [];
    for (let i = 0; i < frames.length; i++) {
      try {
        const response = await axios.post(ROBOFLOW_URL, frames[i], {
          params: { api_key: ROBOFLOW_API_KEY },
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 30000,
        });

        results.push({
          frameNumber: i,
          timestamp: (i / fps).toFixed(2),
          predictions: response.data.predictions || [],
          confidence: response.data.predictions?.length > 0
            ? (response.data.predictions.reduce((sum: number, p: any) => sum + p.confidence, 0) / response.data.predictions.length).toFixed(2)
            : 0,
        });
      } catch (error) {
        console.error(`Failed to analyze frame ${i}:`, error);
      }
    }

    return {
      totalFrames: frames.length,
      videoMetadata: metadata,
      results,
      summary: {
        totalDetections: results.reduce((sum, r) => sum + (r.predictions?.length || 0), 0),
        framesWithDetections: results.filter((r) => r.predictions?.length > 0).length,
      },
    };
  } finally {
    try { await fs.unlink(tempFile); } catch (e) { /* ignore */ }
  }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Detection router
  detection: router({
    analyze: publicProcedure
      .input(
        z.object({
          imageBase64: z.string().describe("Base64 encoded image"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const response = await axios.post(ROBOFLOW_URL, input.imageBase64, {
            params: {
              api_key: ROBOFLOW_API_KEY,
            },
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            timeout: 30000,
          });

          return response.data;
        } catch (error) {
          console.error("Roboflow API error:", error);
          throw new Error("Failed to analyze image with Roboflow API");
        }
      }),
    sendReport: publicProcedure
      .input(
        z.object({
          potholeCount: z.number(),
          averageConfidence: z.number(),
          latitude: z.number(),
          longitude: z.number(),
          address: z.string().optional(),
          imageBase64: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const severityLevel =
            input.averageConfidence >= 0.8
              ? "HIGH"
              : input.averageConfidence >= 0.6
              ? "MEDIUM"
              : "LOW";

          await sendDamageReport({
            potholeCount: input.potholeCount,
            severityLevel: severityLevel as "LOW" | "MEDIUM" | "HIGH",
            averageConfidence: input.averageConfidence,
            location: {
              latitude: input.latitude,
              longitude: input.longitude,
              address: input.address,
            },
            timestamp: new Date().toISOString(),
            imageBase64: input.imageBase64,
            damageDescription: "",
          });

          return { success: true, message: "Report sent successfully" };
        } catch (error) {
          console.error("Failed to send report:", error);
          throw new Error("Failed to send damage report");
        }
      }),
    analyzeVideo: publicProcedure
      .input(
        z.object({
          videoBase64: z.string(),
          fps: z.number().optional().default(1),
          maxFrames: z.number().optional().default(30),
        })
      )
      .mutation(async ({ input }) => {
        try {
          console.log("[Video] Sending video to Roboflow for inference...");
          
          // Convert base64 to buffer
          const videoBuffer = Buffer.from(input.videoBase64, "base64");
          
          // Send video directly to Roboflow for inference
          // Try different approaches
          const formData = new FormData();
          const blob = new Blob([videoBuffer], { type: "video/mp4" });
          formData.append("file", blob, "video.mp4");
          
          // Try video inference API
          const response = await axios.post(
            `${ROBOFLOW_VIDEO_URL}?api_key=${ROBOFLOW_API_KEY}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
              timeout: 120000,
            }
          );
          
          console.log("[Video] Roboflow response:", response.data);
          
          // Parse response
          const roboflowData = response.data;
          const predictions = roboflowData.predictions || roboflowData || [];
          
          // Handle different response formats
          const results = Array.isArray(predictions) 
            ? predictions.map((pred: any, idx: number) => ({
                frameNumber: idx,
                timestamp: pred.timestamp?.toString() || (idx / 1).toString(),
                predictions: pred.detections || pred.predictions || [],
                confidence: pred.detections?.length > 0 
                  ? (pred.detections.reduce((sum: number, p: any) => sum + p.confidence, 0) / pred.detections.length).toFixed(2)
                  : 0,
              }))
            : [];
          
          return {
            totalFrames: results.length,
            videoMetadata: {
              duration: roboflowData.video_info?.duration || 0,
              width: roboflowData.video_info?.width || 0,
              height: roboflowData.video_info?.height || 0,
            },
            results,
            summary: {
              totalDetections: results.reduce((sum: number, r: any) => sum + (r.predictions?.length || 0), 0),
              framesWithDetections: results.filter((r: any) => r.predictions?.length > 0).length,
            },
          };
        } catch (error: any) {
          console.error("Roboflow video API error:", error.response?.data || error.message);
          
          // Fallback: Use frame extraction method
          console.log("[Video] Falling back to frame extraction method...");
          return analyzeVideoWithFrames(input.videoBase64, input.fps || 1, input.maxFrames || 30);
        }
      }),
  })
});

export type AppRouter = typeof appRouter;
