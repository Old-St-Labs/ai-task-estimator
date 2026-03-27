import { execSync } from "child_process";
import { globSync, unlinkSync } from "fs";
import path from "path";

export default async function globalTeardown() {
  const webmFiles = globSync("test-results/**/*.webm");
  for (const webm of webmFiles) {
    const mp4 = webm.replace(/\.webm$/, ".mp4");
    try {
      execSync(
        `ffmpeg -y -i "${webm}" -vcodec libx264 -crf 23 -pix_fmt yuv420p "${mp4}"`,
        { stdio: "pipe" }
      );
      unlinkSync(webm);
      console.log("Converted:", path.basename(mp4));
    } catch (e) {
      console.error("ffmpeg failed for", webm, e instanceof Error ? e.message : e);
    }
  }
}
