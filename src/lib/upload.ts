import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await mkdir(path.join(UPLOAD_DIR, "photos"), { recursive: true });
    await mkdir(path.join(UPLOAD_DIR, "music"), { recursive: true });
  } catch (error) {
    console.error("Error creating upload directories:", error);
  }
}

export async function saveFile(
  file: File,
  type: "photo" | "music"
): Promise<string> {
  await ensureUploadDir();

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = path.extname(file.name);
  const filename = `${randomUUID()}${ext}`;
  const filepath = path.join(
    UPLOAD_DIR,
    type === "photo" ? "photos" : "music",
    filename
  );

  await writeFile(filepath, buffer);

  return `/uploads/${type === "photo" ? "photos" : "music"}/${filename}`;
}

export async function parseFormData(request: NextRequest) {
  const formData = await request.formData();
  const data: any = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      data[key] = value;
    } else {
      // Handle nested JSON data
      if (key.includes("[") || key.includes(".")) {
        // Parse nested keys like options[0].name
        const keys = key
          .replace(/\]/g, "")
          .split(/[\[\.]/)
          .filter((k) => k);
        let current = data;

        for (let i = 0; i < keys.length - 1; i++) {
          const k = keys[i];
          if (!current[k]) {
            current[k] = isNaN(Number(keys[i + 1])) ? {} : [];
          }
          current = current[k];
        }

        current[keys[keys.length - 1]] = value;
      } else {
        data[key] = value;
      }
    }
  }

  return data;
}
