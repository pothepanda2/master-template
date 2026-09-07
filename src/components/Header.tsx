import { WhatsAppButton } from "@/components/WhatsAppButton";
import type { RestaurantSettings } from "@/lib/types";

export function Header({ settings }: { settings: RestaurantSettings }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
        <a href="#menu" className="flex min-w-0 flex-1 items-center gap-2.5">
          {settings.logo ? (
            <img
              src={settings.logo}
              alt=""
              width={32}
              height={32}
              className="size-8 shrink-0 rounded-sm outline outline-1 -outline-offset-1 outline-fg/10"
            />
          ) : (
            <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-lime font-display text-lg font-extrabold text-lime-fg">
              #
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate font-display text-sm font-bold leading-tight tracking-tight text-fg">
              {settings.name}
            </span>
            {settings.tagline ? (
              <span className="block truncate text-xs leading-tight text-muted">
                {settings.tagline}
              </span>
            ) : null}
          </span>
        </a>
        <WhatsAppButton number={settings.whatsappNumber} cafeName={settings.name} />
      </div>
    </header>
  );
}
