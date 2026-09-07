import { useEffect, useState } from "react";
import { isMenuContent, type MenuContent } from "@/lib/types";
import { SEED_MENU } from "@/lib/seed";

export const CONTENT_STORAGE_KEY = "qr-menu-content-v1";
export const CONTENT_EVENT = "qr-menu-content-changed";

export function cloneSeed(): MenuContent {
  return structuredClone(SEED_MENU);
}

export function readStoredContent(): MenuContent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONTENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isMenuContent(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveContent(content: MenuContent) {
  window.localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(content));
  window.dispatchEvent(new CustomEvent(CONTENT_EVENT, { detail: content }));
}

export function resetContent() {
  window.localStorage.removeItem(CONTENT_STORAGE_KEY);
  window.dispatchEvent(new Event(CONTENT_EVENT));
}

export function useMenuContent(initial?: MenuContent): MenuContent {
  const [content, setContent] = useState<MenuContent>(initial ?? cloneSeed());

  useEffect(() => {
    const sync = (event?: Event) => {
      const detail = event instanceof CustomEvent ? event.detail : undefined;
      if (isMenuContent(detail)) {
        setContent(detail);
        return;
      }
      setContent(readStoredContent() ?? initial ?? cloneSeed());
    };
    sync();
    window.addEventListener(CONTENT_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CONTENT_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [initial]);

  return content;
}
