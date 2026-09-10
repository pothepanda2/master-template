import { Clock, MapPin } from "lucide-react";
import { InstagramButton } from "@/components/InstagramButton";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import type { RestaurantSettings } from "@/lib/types";

export function Footer({ settings }: { settings: RestaurantSettings }) {
  return (
    <footer id="about" className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-8 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-10">
        <div>
          <p className="font-display text-xl font-semibold tracking-tight text-fg">
            {settings.name}
          </p>
          {settings.tagline ? (
            <p className="mt-1 text-sm text-muted">{settings.tagline}</p>
          ) : null}
        </div>

        {settings.address ? (
          <div className="flex gap-3">
            <MapPin className="mt-0.5 size-4 shrink-0 text-lime" strokeWidth={2} />
            <div className="min-w-0">
              <p className="text-sm leading-relaxed text-fg">{settings.address}</p>
              {settings.googleMapsUrl ? (
                <a
                  href={settings.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-lime"
                >
                  Open in Google Maps
                </a>
              ) : null}
            </div>
          </div>
        ) : null}

        {settings.hours ? (
          <div className="flex gap-3">
            <Clock className="mt-0.5 size-4 shrink-0 text-lime" strokeWidth={2} />
            <p className="text-sm leading-relaxed whitespace-pre-line text-fg">
              {settings.hours}
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <WhatsAppButton
            number={settings.whatsappNumber}
            cafeName={settings.name}
            variant="footer"
          />
          <InstagramButton url={settings.instagramUrl} variant="footer" />
        </div>
      </div>
    </footer>
  );
}
