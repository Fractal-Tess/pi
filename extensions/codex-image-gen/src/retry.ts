import { BASE_DELAY_MS, MAX_RETRIES, MAX_RETRY_DELAY_MS } from "./constants.ts";

export function isRetryableStatus(status: number, errorText: string) {
  return (
    [429, 500, 502, 503, 504].includes(status) ||
    /rate.?limit|overloaded|service.?unavailable|upstream.?connect|connection.?refused/i.test(
      errorText,
    )
  );
}

export function parseRetryAfter(value: string | null, nowMs = Date.now()) {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (/^\d+(?:\.\d+)?$/.test(trimmed)) {
    const milliseconds = Number(trimmed) * 1_000;
    return Number.isFinite(milliseconds)
      ? Math.min(milliseconds, MAX_RETRY_DELAY_MS)
      : undefined;
  }
  const dateMs = Date.parse(trimmed);
  if (!Number.isFinite(dateMs) || dateMs <= nowMs) return undefined;
  return Math.min(dateMs - nowMs, MAX_RETRY_DELAY_MS);
}

export function retryDelayMs(
  attempt: number,
  retryAfter: string | null,
  random = Math.random,
  nowMs = Date.now(),
) {
  const serverDelay = parseRetryAfter(retryAfter, nowMs);
  if (serverDelay !== undefined) {
    return Math.floor(
      Math.min(serverDelay * (1 + random() * 0.1), MAX_RETRY_DELAY_MS),
    );
  }
  const exponential = Math.min(
    BASE_DELAY_MS * 2 ** (attempt - 1),
    MAX_RETRY_DELAY_MS,
  );
  return Math.floor(exponential * (0.9 + random() * 0.2));
}

export function abortableDelay(milliseconds: number, signal?: AbortSignal) {
  if (signal?.aborted) {
    return Promise.reject(new Error("Image generation was aborted."));
  }
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(finish, milliseconds);
    function cleanup() {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
    }
    function finish() {
      cleanup();
      resolve();
    }
    function abort() {
      cleanup();
      reject(new Error("Image generation was aborted."));
    }
    signal?.addEventListener("abort", abort, { once: true });
  });
}

export const MAX_REQUEST_ATTEMPTS = MAX_RETRIES + 1;
