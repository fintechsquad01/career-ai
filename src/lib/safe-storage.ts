type StorageKind = "local" | "session";
type StorageOperation = "get" | "set" | "remove";

export const STORAGE_FALLBACK_EVENT = "aiskillscore:storage-fallback";

export interface StorageFallbackDetail {
  browser: "safari";
  kind: StorageKind;
  operation: StorageOperation;
  key: string;
  reason: "storage_unavailable" | "storage_error";
}

const reportedDiagnostics = new Set<string>();

function isSafariBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;

  return (
    ua.includes("Safari") &&
    !ua.includes("Chrome") &&
    !ua.includes("CriOS") &&
    !ua.includes("Edg") &&
    !ua.includes("OPR") &&
    !ua.includes("Android")
  );
}

function reportSafariStorageFallback(detail: StorageFallbackDetail): void {
  if (typeof window === "undefined" || !isSafariBrowser()) return;

  const fingerprint = `${detail.kind}:${detail.operation}:${detail.key}:${detail.reason}`;
  if (reportedDiagnostics.has(fingerprint)) return;
  reportedDiagnostics.add(fingerprint);

  try {
    window.dispatchEvent(new CustomEvent<StorageFallbackDetail>(STORAGE_FALLBACK_EVENT, { detail }));
  } catch {
    // Diagnostics should never break user flow.
  }
}

function getStorage(kind: StorageKind): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    reportSafariStorageFallback({
      browser: "safari",
      kind,
      operation: "get",
      key: "__storage__",
      reason: "storage_unavailable",
    });
    return null;
  }
}

function getItem(kind: StorageKind, key: string): string | null {
  const storage = getStorage(kind);
  if (!storage) return null;

  try {
    return storage.getItem(key);
  } catch {
    reportSafariStorageFallback({
      browser: "safari",
      kind,
      operation: "get",
      key,
      reason: "storage_error",
    });
    return null;
  }
}

function setItem(kind: StorageKind, key: string, value: string): boolean {
  const storage = getStorage(kind);
  if (!storage) return false;

  try {
    storage.setItem(key, value);
    return true;
  } catch {
    reportSafariStorageFallback({
      browser: "safari",
      kind,
      operation: "set",
      key,
      reason: "storage_error",
    });
    return false;
  }
}

function removeItem(kind: StorageKind, key: string): boolean {
  const storage = getStorage(kind);
  if (!storage) return false;

  try {
    storage.removeItem(key);
    return true;
  } catch {
    reportSafariStorageFallback({
      browser: "safari",
      kind,
      operation: "remove",
      key,
      reason: "storage_error",
    });
    return false;
  }
}

export const safeLocalStorage = {
  getItem: (key: string) => getItem("local", key),
  setItem: (key: string, value: string) => setItem("local", key, value),
  removeItem: (key: string) => removeItem("local", key),
};

export const safeSessionStorage = {
  getItem: (key: string) => getItem("session", key),
  setItem: (key: string, value: string) => setItem("session", key, value),
  removeItem: (key: string) => removeItem("session", key),
};
