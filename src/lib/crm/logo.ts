import { readFile } from "fs/promises";
import path from "path";

const LOGO_CANDIDATES = ["logo.webp", path.join("wp-admin", "uploads", "footer-logo.webp")];

export async function loadOfficialLogoDataUri() {
  for (const relative of LOGO_CANDIDATES) {
    try {
      const filePath = path.join(process.cwd(), "public", relative);
      const buffer = await readFile(filePath);
      const mime = relative.endsWith(".png") ? "image/png" : "image/webp";
      return `data:${mime};base64,${buffer.toString("base64")}`;
    } catch {
      // try next official logo path
    }
  }
  return "";
}
