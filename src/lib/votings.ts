import { isBlobUrl } from "./media";

export interface IncomingOption {
  id: string;
  name: string;
  photoUrl?: string;
  musicUrl?: string;
}

/**
 * As URLs chegam do cliente e vão parar direto em `<img src>` / `<audio src>`,
 * então só aceitamos o que veio do nosso próprio Blob store.
 */
const assertMediaUrl = (url: unknown): string | undefined => {
  if (url === undefined || url === null || url === "") return undefined;

  if (typeof url !== "string" || !isBlobUrl(url)) {
    throw new Error("InvalidMediaUrl");
  }

  return url;
};

export function sanitizeOptions(options: unknown): IncomingOption[] {
  if (!Array.isArray(options)) return [];

  return options.map((option: any) => ({
    id: String(option?.id ?? ""),
    name: String(option?.name ?? ""),
    photoUrl: assertMediaUrl(option?.photoUrl),
    musicUrl: assertMediaUrl(option?.musicUrl),
  }));
}

/**
 * `showResults: false` precisa esconder as parciais da resposta, não só da UI —
 * caso contrário basta abrir o DevTools para ver a apuração em andamento.
 * Votação encerrada sempre revela o resultado.
 */
export function stripHiddenVotes(voting: any) {
  if (voting?.showResults || voting?.isClosed) return voting;

  return {
    ...voting,
    options: (voting?.options ?? []).map(({ votes, ...option }: any) => option),
  };
}
