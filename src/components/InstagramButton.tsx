import { Instagram } from "lucide-react";
import { cn } from "@/lib/utils";

export function instagramHref(url: string): string {
  const value = url.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  const handle = value.replace(/^@/, "").replace(/^instagram\.com\//i, "");
  return `https://www.instagram.com/${handle.replace(/\/$/, "")}`;
}

export function InstagramButton({
  url,
  variant = "footer",
}: {
  url?: string;
  variant?: "header" | "footer";
}) {
  if (!url?.trim()) return null;
  const href = instagramHref(url);

  if (variant === "header") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-10 items-center gap-1.5 rounded-pill bg-surface px-3 text-sm font-semibold text-fg shadow-[var(--shadow-border)] hover:text-lime"
      >
        <Instagram className="size-3.5 text-lime" strokeWidth={2} />
        Instagram
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-fg shadow-[var(--shadow-border)]",
        "hover:text-lime",
      )}
    >
      <Instagram className="size-4" strokeWidth={2} />
      Instagram
    </a>
  );
}
