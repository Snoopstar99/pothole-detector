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

const ROBOFLOW_API_KEY = "IhL1Lhrl5Qra3XJDkFYD";
const ROBOFLOW_MODEL = "pothole-detection-lwf9u/3";
const ROBOFLOW_URL = `https://detect.roboflow.com/${ROBOFLOW_MODEL}`;

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
        const tempFile = path.join("/tmp", `video-${nanoid()}.mp4`);
        try {
          const videoBuffer = Buffer.from(input.videoBase64, "base64");
          await fs.writeFile(tempFile, videoBuffer);

          const metadata = await getVideoMetadata(tempFile);
          console.log("[Video] Metadata:", metadata);

          const frames = await extractVideoFrames(tempFile, {
            fps: input.fps,
            maxFrames: input.maxFrames,
          });

          console.log(`[Video] Extracted ${frames.length} frames`);

          const results = [];
          for (let i = 0; i < frames.length; i++) {
            try {
              const response = await axios.post(ROBOFLOW_URL, frames[i], {
                params: {
                  api_key: ROBOFLOW_API_KEY,
                },
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                timeout: 30000,
              });

              results.push({
                frameNumber: i,
                timestamp: (i / input.fps).toFixed(2),
                predictions: response.data.predictions,
                confidence: response.data.predictions.length > 0
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
              totalDetections: results.reduce((sum, r) => sum + r.predictions.length, 0),
              framesWithDetections: results.filter((r) => r.predictions.length > 0).length,
            },
          };
        } catch (error) {
          console.error("Video analysis error:", error);
          throw new Error("Failed to analyze video");
        } finally {
          try {
            await fs.unlink(tempFile);
          } catch (e) {
            // Ignore cleanup errors
          }
        }
      }),
  })
});

export type AppRouter = typeof appRouter;
