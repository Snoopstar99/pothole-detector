import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import axios from "axios";

const ROBOFLOW_API_KEY = "cB3ypDmTTMqeecqXbRfs";
const ROBOFLOW_MODEL = "pothole-detection-iwfu9/3";
const ROBOFLOW_URL = `https://detect.roboflow.com/${ROBOFLOW_MODEL}`;

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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
  })
});

export type AppRouter = typeof appRouter;
