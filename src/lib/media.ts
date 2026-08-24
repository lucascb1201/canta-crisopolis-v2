const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

/**
 * O banco guarda a URL canônica do Vercel Blob (é o que `del()` precisa
 * receber). A leitura pública passa pelo CDN da Cloudflare, então a origem é
 * trocada aqui, no momento da renderização.
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
