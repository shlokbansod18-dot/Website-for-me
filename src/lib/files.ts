import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

import { randomId } from "./crypto";
import { UPLOAD_DIR } from "./env";

export const MAX_UPLOAD_BYTES = 24 * 1024 * 1024;

/**
 * Extensions a digital-goods shop actually sells. Anything that a browser or
 * server might *execute* is absent on purpose: even though these files are
 * only ever streamed back as attachments, an allowlist is one fewer thing to
 * get wrong later.
 */
const ALLOWED_EXTENSIONS = new Set([
  ".zip", ".rar", ".7z", ".tar", ".gz",
  ".pdf", ".epub",
  ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg",
  ".psd", ".ai", ".fig", ".sketch", ".xd",
  ".mp3", ".wav", ".aiff", ".flac",
  ".mp4", ".mov", ".webm",
  ".ttf", ".otf", ".woff", ".woff2",
  ".json", ".csv", ".txt", ".md",
  ".blend", ".obj", ".fbx", ".glb",
]);

export type SavedFile = {
  storedName: string;
  originalName: string;
  size: number;
  mime: string;
};

export function extensionOf(name: string): string {
  const ext = path.extname(name).toLowerCase();
  return ext.length > 1 && ext.length <= 10 ? ext : "";
}

/** Strips directory separators and control characters from a display name. */
export function safeDisplayName(name: string): string {
  return (
    path
      .basename(name)
      .replace(/[\u0000-\u001f\u007f]/g, "")
      .replace(/[\\/:*?"<>|]/g, "-")
      .slice(0, 120) || "download"
  );
}

export async function saveUpload(file: File): Promise<SavedFile | { error: string }> {
  if (file.size === 0) return { error: "That file is empty." };
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: `Files must be under ${Math.floor(MAX_UPLOAD_BYTES / 1024 / 1024)} MB.` };
  }

  const originalName = safeDisplayName(file.name);
  const ext = extensionOf(originalName);
  if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
    return { error: `We cannot host "${ext || "that"}" files. Zip the product up and upload the archive.` };
  }

  // The name on disk is random. Nothing the seller typed becomes a path, so a
  // filename can never escape the upload directory.
  const storedName = `${randomId()}${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, storedName), bytes, { mode: 0o600 });

  return {
    storedName,
    originalName,
    size: file.size,
    mime: file.type || "application/octet-stream",
  };
}

export async function deleteUpload(storedName: string | null | undefined): Promise<void> {
  if (!storedName) return;
  // Refuse anything that is not a bare filename we generated.
  if (storedName !== path.basename(storedName)) return;
  try {
    await fs.unlink(path.join(UPLOAD_DIR, storedName));
  } catch {
    // Already gone — nothing to do.
  }
}

export function resolveUploadPath(storedName: string): string | null {
  if (storedName !== path.basename(storedName)) return null;
  const full = path.join(UPLOAD_DIR, storedName);
  // Final guard: the resolved path must still sit inside the upload directory.
  if (!full.startsWith(UPLOAD_DIR + path.sep)) return null;
  return full;
}

export async function readUpload(storedName: string): Promise<Buffer | null> {
  const full = resolveUploadPath(storedName);
  if (!full) return null;
  try {
    return await fs.readFile(full);
  } catch {
    return null;
  }
}
