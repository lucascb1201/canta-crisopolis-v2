/**
 * Proxy de leitura do Vercel Blob para media.cantacrisopolis.com.br.
 *
 * O Vercel Blob cobra Data Transfer na saída. Com o cache da Cloudflare na
 * frente, o Blob só é acessado no primeiro request de cada arquivo — o resto
 * sai do edge.
 *
 * Os uploads usam `addRandomSuffix`, então cada arquivo tem URL única e
 * imutável: dá para cachear por um ano sem risco de servir conteúdo velho, e
 * nunca é preciso fazer purge.
 *
 * Configure BLOB_HOST como variável do Worker, com o hostname do store
 * (ex.: "abc123def456.public.blob.vercel-storage.com").
 */

const CACHE_TTL = 31536000; // 1 ano

export default {
  async fetch(request, env) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { Allow: "GET, HEAD" },
      });
    }

    if (!env.BLOB_HOST) {
      return new Response("BLOB_HOST is not configured", { status: 500 });
    }

    const url = new URL(request.url);
    const originUrl = `https://${env.BLOB_HOST}${url.pathname}`;

    // Só o Range é repassado: o <audio> depende dele para dar seek no MP3.
    // Cookies e Authorization do visitante não têm por que chegar ao Blob.
    const headers = new Headers();
    const range = request.headers.get("Range");
    if (range) headers.set("Range", range);

    const response = await fetch(originUrl, {
      method: request.method,
      headers,
      cf: { cacheEverything: true, cacheTtl: CACHE_TTL },
    });

    const outHeaders = new Headers(response.headers);
    outHeaders.set("Cache-Control", `public, max-age=${CACHE_TTL}, immutable`);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: outHeaders,
    });
  },
};
