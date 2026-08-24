const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

/**
 * O banco guarda a URL canônica do Vercel Blob (é o que `del()` precisa
 * receber) e é ela que é servida ao público.
 *
 * Se um dia entrar um CDN na frente do Blob, basta apontar
 * NEXT_PUBLIC_MEDIA_BASE_URL para ele: a origem é trocada aqui, na
 * renderização, sem tocar no que está salvo.
 */
export function toPublicMediaUrl(url?: string | null): string {
  if (!url) return "";
  if (!MEDIA_BASE) return url;

  try {
    const parsed = new URL(url);

    if (!parsed.hostname.endsWith(BLOB_HOST_SUFFIX)) return url;

    return `${MEDIA_BASE.replace(/\/$/, "")}${parsed.pathname}`;
  } catch {
    // Caminhos relativos de dados legados (`/uploads/...`)
    return url;
  }
}

export function isBlobUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" && parsed.hostname.endsWith(BLOB_HOST_SUFFIX)
    );
  } catch {
    return false;
  }
}
