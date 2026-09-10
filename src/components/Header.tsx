import { Clock, MapPin } from "lucide-react";
import { InstagramButton } from "@/components/InstagramButton";
import type { RestaurantSettings } from "@/lib/types";

function shortPlace(address?: string) {
  if (!address) return "";
  if (/nagole/i.test(address) && /hyderabad/i.test(address)) return "Nagole, Hyderabad";
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length >= 2) return `${parts[1]}, ${parts.at(-2) ?? parts.at(-1)}`;
  return parts[0] ?? "";
}

export function Header({ settings }: { settings: RestaurantSettings }) {
  const customLogo = Boolean(settings.logo && !settings.logo.endsWith(".svg"));
  const place = shortPlace(settings.address);
  const showPlace =
    Boolean(place) &&
    !(settings.tagline ?? "").toLowerCase().includes(place.split(",")[0].toLowerCase());
  const mapsHref = settings.googleMapsUrl?.trim() || "";
  const hasInstagram = Boolean(settings.instagramUrl?.trim());

  return (
    <header className="bg-transparent pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pt-7 pb-5 text-center">
        <a href="#menu" className="flex flex-col items-center">
          {customLogo ? (
            <img
              src={settings.logo}
              alt=""
              width={112}
              height={112}
              className="mb-3 size-28 rounded-xl object-cover shadow-[var(--shadow-border)] outline outline-1 -outline-offset-1 outline-fg/10"
            />
          ) : (
            <span className="font-display text-6xl leading-none font-semibold text-lime">#</span>
          )}
          <span className="mt-2 block font-display text-3xl leading-tight font-semibold tracking-tight text-fg">
            {settings.name}
          </span>
          {settings.tagline ? (
            <span className="mt-1.5 block text-sm leading-snug text-muted">{settings.tagline}</span>
          ) : null}
        </a>

        {mapsHref || hasInstagram ? (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {mapsHref ? (
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-pill bg-surface px-3 text-sm font-semibold text-fg shadow-[var(--shadow-border)] hover:text-lime"
              >
                <MapPin className="size-3.5 text-lime" strokeWidth={2} />
                {showPlace ? place : "Directions"}
              </a>
            ) : null}
            <InstagramButton url={settings.instagramUrl} variant="header" />
          </div>
        ) : null}

        {settings.hours ? (
          <span className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted">
            <Clock className="size-3.5 shrink-0 text-lime" strokeWidth={2} />
            {settings.hours}
          </span>
        ) : null}

        <span className="mt-4 h-px w-16 bg-lime/70" aria-hidden="true" />
      </div>
    </header>
  );
}
