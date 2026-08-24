import { del } from "@vercel/blob";
import { isBlobUrl } from "./media";

/**
 * Remove blobs que deixaram de ser referenciados. URLs que não pertencem ao
 * nosso store (dados legados em `/uploads/...`) são ignoradas, e falhas de
 * exclusão não derrubam a requisição — o pior caso é um arquivo órfão.
 */
export async function deleteBlobs(urls: (string | undefined | null)[]) {
  const targets = urls.filter(
    (url): url is string => !!url && isBlobUrl(url)
  );

  if (targets.length === 0) return;

  try {
    await del(targets);
  } catch (error) {
    console.error("Failed to delete blobs:", error);
  }
}
