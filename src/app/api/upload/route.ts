import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const PHOTO_RULES = {
  allowedContentTypes: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ],
  maximumSizeInBytes: 5 * 1024 * 1024,
};

const MUSIC_RULES = {
  allowedContentTypes: [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "audio/mp4",
    "audio/x-m4a",
  ],
  maximumSizeInBytes: 15 * 1024 * 1024,
};

/**
 * Emite tokens para upload direto do browser para o Vercel Blob. O arquivo
 * nunca passa por esta função, o que contorna o limite de ~4.5MB de body das
 * Serverless Functions.
 */
export async function POST(request: NextRequest) {
  // Antes de handleUpload: a lib valida o token do Blob primeiro e mascararia
  // um 401 como erro de configuração.
  if (!getAuthUser(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const rules = clientPayload === "music" ? MUSIC_RULES : PHOTO_RULES;

        return { ...rules, addRandomSuffix: true };
      },
      // Não é chamado em localhost (a Vercel precisa de uma URL pública) e não
      // dependemos dele: a URL do blob volta direto para o cliente.
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    console.error("Upload token error:", error);

    return NextResponse.json(
      { error: "Upload failed" },
      { status: 400 }
    );
  }
}
