export const STUDIO_TOKEN_KEY = "qr-studio-token";

export function readStudioToken(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.sessionStorage.getItem(STUDIO_TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeStudioToken(token: string) {
  window.sessionStorage.setItem(STUDIO_TOKEN_KEY, token);
}

export function clearStudioToken() {
  window.sessionStorage.removeItem(STUDIO_TOKEN_KEY);
}
