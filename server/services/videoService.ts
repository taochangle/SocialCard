import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import os from "os";
import path from "path";

const execFileAsync = promisify(execFile);

const FFMPEG_BIN = process.env.FFMPEG_PATH || "ffmpeg";
const FPS = 60;
const WIDTH = 1080;
const HEIGHT = 1920;
const TRANSITION = 0.5; // crossfade duration between cards
const FINAL_FADE = 0.4;
const BGM_VOLUME = 0.12; // ≈ -18dB, keeps the track under everything else
const BGM_FADE_OUT = 1.5;

// First image (cover) gets more screen time; each detail card holds for 3s.
const DEFAULT_DURATIONS = (count: number) => Array.from({ length: count }, (_, i) => (i === 0 ? 3.5 : 3));

export const videoService = {
  /**
   * Convert 9:16 PNG frames into a single MP4 (H.264 + AAC).
   * Each card is static (no zoom, no jitter) and transitions via a smooth
   * crossfade (xfade) into the next card, with a short fade-out at the end.
   */
  async imagesToMp4(images: Buffer[], outputPath: string, bgmPath?: string): Promise<string> {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "socialcard-video-"));
    try {
      const durations = DEFAULT_DURATIONS(images.length);

      const inputs: string[] = [];
      const filters: string[] = [];

      for (let i = 0; i < images.length; i++) {
        const file = path.join(tmpDir, `${i}.png`);
        await fs.writeFile(file, images[i]);

        const dur = durations[i];
        inputs.push("-loop", "1", "-framerate", String(FPS), "-t", String(dur), "-i", file);
        filters.push(
          `[${i}:v]scale=${WIDTH}:${HEIGHT},setsar=1,` +
            `format=yuv420p,` +
            `setpts=PTS-STARTPTS[v${i}]`
        );
      }

      // Chain crossfades: [v0][v1]xfade... -> [x1]; [x1][v2]xfade... -> [x2]; ...
      const xfades: string[] = [];
      let prev = "v0";
      let totalDuration = durations[0];
      for (let i = 1; i < images.length; i++) {
        const offset = totalDuration - TRANSITION;
        xfades.push(
          `[${prev}][v${i}]xfade=transition=fade:duration=${TRANSITION}:offset=${offset.toFixed(3)}[x${i}]`
        );
        prev = `x${i}`;
        totalDuration = totalDuration + durations[i] - TRANSITION;
      }
      const filterComplex = [
        ...filters,
        ...xfades,
        `[${prev}]fade=t=out:st=${Math.max(totalDuration - FINAL_FADE, 0).toFixed(3)}:d=${FINAL_FADE}[vout]`,
      ].join(";");

      const audioIndex = images.length;
      let audioFilter = "";
      if (bgmPath) {
        // 循环播放 BGM、压低音量、结尾淡出
        audioFilter = `[${audioIndex}:a]volume=${BGM_VOLUME},afade=t=out:st=${Math.max(totalDuration - BGM_FADE_OUT, 0).toFixed(3)}:d=${BGM_FADE_OUT}[aout]`;
      }
      const fullFilter = audioFilter
        ? `${filterComplex};${audioFilter}`
        : filterComplex;

      const args = [
        "-y",
        ...inputs,
        ...(bgmPath
          ? ["-stream_loop", "-1", "-t", String(totalDuration), "-i", bgmPath]
          : ["-f", "lavfi", "-t", String(totalDuration), "-i", "anullsrc=r=44100:cl=stereo"]),
        "-filter_complex", fullFilter,
        "-map", "[vout]",
        "-map", audioFilter ? "[aout]" : `${audioIndex}:a`,
        "-r", String(FPS),
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "20",
        "-c:a", "aac",
        "-b:a", "128k",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        outputPath,
      ];

      await execFileAsync(FFMPEG_BIN, args, { maxBuffer: 1024 * 1024 * 64 });
      return outputPath;
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  },

  /**
   * Convert PNG frames to MP4 in a temp directory, returning the path plus a
   * cleanup function. Caller must run cleanup() when done with the file.
   */
  async createMp4(images: Buffer[], bgmPath?: string): Promise<{ path: string; cleanup: () => Promise<void> }> {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "socialcard-youtube-"));
    const mp4Path = path.join(tmpDir, "github-trending-shorts.mp4");
    await this.imagesToMp4(images, mp4Path, bgmPath);
    return {
      path: mp4Path,
      cleanup: () => fs.rm(tmpDir, { recursive: true, force: true }),
    };
  },
};
