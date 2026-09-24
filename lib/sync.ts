/**
 * Cloudflare Workers KV Synchronization Pipeline for Skholario
 * Provides zero-maintenance state sync across devices via skholario-sync worker.
 */

export const SYNC_WORKER_URL =
  process.env.NEXT_PUBLIC_SYNC_WORKER_URL ||
  "https://skholario-sync.light-scilla.workers.dev";

export const SYNC_EMAIL_KEY = "skholario.sync_email";
export const DEFAULT_SYNC_EMAIL = "student@skholario.app";

/**
 * Get current sync email from localStorage or fall back to default
 */
export function getSyncEmail(): string {
  if (typeof window === "undefined") return DEFAULT_SYNC_EMAIL;
  try {
    return window.localStorage.getItem(SYNC_EMAIL_KEY) || DEFAULT_SYNC_EMAIL;
  } catch {
    return DEFAULT_SYNC_EMAIL;
  }
}

/**
 * Update the sync email identity in localStorage
 */
export function setSyncEmail(email: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SYNC_EMAIL_KEY, email.trim().toLowerCase());
  } catch {
    // ignore local storage restrictions
  }
}

/**
 * Check if the user has entered their own unique sync email (not empty and not the placeholder default)
 */
export function hasConfiguredSyncEmail(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const val = window.localStorage.getItem(SYNC_EMAIL_KEY);
    return Boolean(
      val &&
      val.trim().toLowerCase() !== "" &&
      val.trim().toLowerCase() !== DEFAULT_SYNC_EMAIL &&
      val.includes("@")
    );
  } catch {
    return false;
  }
}

export interface SyncResponse {
  success: boolean;
  email?: string;
  syncedAt?: string;
  error?: string;
}

/**
 * Pushes client state to Cloudflare KV for the specified student email.
 */
export async function pushSync(
  email: string,
  state: unknown,
): Promise<SyncResponse> {
  const cleanEmail = email.trim().toLowerCase();
  const url = `${SYNC_WORKER_URL}/sync/${encodeURIComponent(cleanEmail)}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window === "undefined") {
    headers["User-Agent"] =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
  }

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(state),
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        success: false,
        error: `HTTP ${res.status}: ${errText || res.statusText}`,
      };
    }

    const data = (await res.json()) as SyncResponse;
    return data;
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Pulls remote state from Cloudflare KV for the specified student email.
 * Returns null if not found or empty.
 */
export async function pullSync<T = Record<string, unknown>>(
  email: string,
): Promise<T | null> {
  const cleanEmail = email.trim().toLowerCase();
  const url = `${SYNC_WORKER_URL}/sync/${encodeURIComponent(cleanEmail)}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (typeof window === "undefined") {
    headers["User-Agent"] =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
  }

  try {
    const res = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
      return null;
    }
    return data as T;
  } catch (err) {
    console.warn("Skholario KV pullSync error:", err);
    return null;
  }
}

/**
 * Creates a debounced version of a function for state push.
 */
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delayMs = 800,
): (...args: Args) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delayMs);
  };
}
