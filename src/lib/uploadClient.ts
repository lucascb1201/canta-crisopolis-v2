"use client";

import { upload } from "@vercel/blob/client";

export interface UploadableOption {
  id: string;
  name: string;
  photoFile: File | null;
  musicFile: File | null;
  photoUrl?: string;
  musicUrl?: string;
}

export interface UploadedOption {
  id: string;
  name: string;
  photoUrl?: string;
  musicUrl?: string;
}

/**
 * Envia os arquivos do browser direto para o Vercel Blob (o token vem de
 * /api/upload) e devolve as options já com as URLs. As opções sem arquivo novo
 * mantêm a URL que já estava salva.
 */
export async function uploadOptionMedia(
  options: UploadableOption[],
  onProgress?: (done: number, total: number) => void
): Promise<UploadedOption[]> {
  const total = options.reduce(
    (count, option) =>
      count + (option.photoFile ? 1 : 0) + (option.musicFile ? 1 : 0),
    0
  );

  let done = 0;

  const put = async (file: File, kind: "photo" | "music") => {
    const blob = await upload(file.name, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
      clientPayload: kind,
    });

    done += 1;
    onProgress?.(done, total);

    return blob.url;
  };

  const uploaded: UploadedOption[] = [];

  // Sequencial de propósito: dá um progresso honesto e não satura conexões ruins
  for (const option of options) {
    uploaded.push({
      id: option.id,
      name: option.name,
      photoUrl: option.photoFile
        ? await put(option.photoFile, "photo")
        : option.photoUrl,
      musicUrl: option.musicFile
        ? await put(option.musicFile, "music")
        : option.musicUrl,
    });
  }

  return uploaded;
}
