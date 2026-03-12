import ffmpeg from "fluent-ffmpeg";
import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";

/**
 * Extract frames from video file at specified intervals
 * Returns array of base64-encoded frames
 */
export async function extractVideoFrames(
  videoPath: string,
  options: {
    fps?: number; // frames per second to extract (default: 1)
    maxFrames?: number; // maximum number of frames to extract (default: 100)
  } = {}
): Promise<string[]> {
  const { fps = 1, maxFrames = 100 } = options;

  return new Promise((resolve, reject) => {
    const tempDir = path.join("/tmp", `video-frames-${nanoid()}`);
    const frames: string[] = [];

    ffmpeg(videoPath)
      .on("filenames", (filenames: string[]) => {
        console.log(`[Video] Extracting ${filenames.length} frames from video`);
      })
      .on("end", async () => {
        try {
          // Read extracted frames and convert to base64
          const files = await fs.readdir(tempDir);
          const sortedFiles = files
            .filter((f) => f.endsWith(".png"))
            .sort((a, b) => {
              const numA = parseInt(a.match(/\d+/)?.[0] || "0");
              const numB = parseInt(b.match(/\d+/)?.[0] || "0");
              return numA - numB;
            })
            .slice(0, maxFrames);

          for (const file of sortedFiles) {
            const filePath = path.join(tempDir, file);
            const data = await fs.readFile(filePath);
            frames.push(data.toString("base64"));
          }

          // Cleanup temp directory
          for (const file of sortedFiles) {
            await fs.unlink(path.join(tempDir, file));
          }
          await fs.rmdir(tempDir);

          resolve(frames);
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (error: Error) => {
        console.error("[Video] FFmpeg error:", error);
        reject(error);
      })
      .screenshots({
        folder: tempDir,
        filename: "frame-%i.png",
        size: "1280x720",
        timestamps: [`0%+${1 / fps}s`], // Extract at specified FPS
      });
  });
}

/**
 * Get video metadata (duration, dimensions, etc.)
 */
export async function getVideoMetadata(
  videoPath: string
): Promise<{
  duration: number;
  width: number;
  height: number;
  fps: number;
}> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (error: Error | null, metadata: any) => {
      if (error) {
        reject(error);
        return;
      }

      const stream = metadata.streams.find((s: any) => s.codec_type === "video");
      if (!stream) {
        reject(new Error("No video stream found"));
        return;
      }

      const fps = stream.r_frame_rate
        ? eval(stream.r_frame_rate)
        : stream.avg_frame_rate
          ? eval(stream.avg_frame_rate)
          : 30;

      resolve({
        duration: metadata.format.duration || 0,
        width: stream.width || 1280,
        height: stream.height || 720,
        fps: Math.round(fps),
      });
    });
  });
}

/**
 * Stream video frames in real-time (for RTSP or live streams)
 * Yields frames as they're captured
 */
export async function streamVideoFrames(
  streamUrl: string,
  onFrame: (frameBase64: string) => Promise<void>,
  options: {
    fps?: number; // frames per second to capture
    timeout?: number; // timeout in seconds
  } = {}
): Promise<void> {
  const { fps = 2, timeout = 300 } = options;
  const frameInterval = 1000 / fps; // milliseconds between frames

  return new Promise((resolve, reject) => {
    const tempDir = path.join("/tmp", `stream-frames-${nanoid()}`);
    let frameCount = 0;
    let isRunning = true;

    // Create temp directory
    fs.mkdir(tempDir, { recursive: true }).catch(reject);

    const timeoutHandle = setTimeout(() => {
      isRunning = false;
    }, timeout * 1000);

    ffmpeg(streamUrl)
      .on("error", (error: Error) => {
        clearTimeout(timeoutHandle);
        isRunning = false;
        reject(error);
      })
      .on("end", () => {
        clearTimeout(timeoutHandle);
        isRunning = false;
        resolve();
      })
      .screenshots({
        folder: tempDir,
        filename: "frame-%i.png",
        size: "1280x720",
        timestamps: ["0%+1s"], // Capture every second initially
      });

    // Monitor for new frames
    const monitorInterval = setInterval(async () => {
      if (!isRunning) {
        clearInterval(monitorInterval);
        clearTimeout(timeoutHandle);
        resolve();
        return;
      }

      try {
        const files = await fs.readdir(tempDir);
        const newFrames = files.filter((f) => f.endsWith(".png")).length;

        if (newFrames > frameCount) {
          for (let i = frameCount; i < newFrames; i++) {
            const framePath = path.join(tempDir, `frame-${i + 1}.png`);
            const data = await fs.readFile(framePath);
            await onFrame(data.toString("base64"));
            await fs.unlink(framePath);
          }
          frameCount = newFrames;
        }
      } catch (error) {
        console.error("[Stream] Error reading frames:", error);
      }
    }, frameInterval);
  });
}
