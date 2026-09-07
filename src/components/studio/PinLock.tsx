import { useEffect, useState, type ReactNode } from "react";
import { Delete, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export function PinLock({
  mode,
  cafeName,
  error,
  busy,
  onSubmit,
}: {
  mode: "setup" | "unlock";
  cafeName: string;
  error: string | null;
  busy: boolean;
  onSubmit: (pin: string) => void;
}) {
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [stage, setStage] = useState<"enter" | "confirm">("enter");
  const [mismatch, setMismatch] = useState(false);

  useEffect(() => {
    setPin("");
    setConfirm("");
    setStage("enter");
  }, [error]);

  const filling = mode === "setup" && stage === "confirm" ? confirm : pin;
  const target = filling.length;

  function press(digit: string) {
    if (busy) return;
    if (mode === "setup" && stage === "confirm") {
      const next = (confirm + digit).slice(0, 4);
      setConfirm(next);
      if (next.length === 4) {
        if (next === pin) onSubmit(next);
        else {
          setMismatch(true);
          setConfirm("");
          setPin("");
          setStage("enter");
        }
      }
      return;
    }
    const next = (pin + digit).slice(0, 4);
    setPin(next);
    setMismatch(false);
    if (next.length < 4) return;
    if (mode === "unlock") {
      onSubmit(next);
      setPin("");
      return;
    }
    setStage("confirm");
  }

  function backspace() {
    if (busy) return;
    if (mode === "setup" && stage === "confirm") {
      setConfirm((value) => value.slice(0, -1));
      return;
    }
    setPin((value) => value.slice(0, -1));
  }

  const title =
    mode === "unlock"
      ? "Enter PIN"
      : stage === "confirm"
        ? "Confirm PIN"
        : "Set a PIN";
  const subtitle =
    mode === "unlock"
      ? `Unlock Menu Studio for ${cafeName}`
      : stage === "confirm"
        ? "Type the same 4 digits again"
        : "Guests never see this. Only people with the PIN can edit the live menu.";

  return (
    <div className="flex min-h-dvh flex-col bg-bg px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 inline-flex size-14 items-center justify-center rounded-xl bg-surface text-lime shadow-[var(--shadow-border)]">
            <Lock className="size-6" />
          </span>
          <p className="font-display text-3xl font-bold tracking-tight">{title}</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">{subtitle}</p>
        </div>

        <div className="mb-6 flex justify-center gap-3">
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className={cn(
                "size-4 rounded-pill transition-colors",
                index < target ? "bg-lime" : "bg-surface-2 shadow-[var(--shadow-border)]",
              )}
            />
          ))}
        </div>

        {error || mismatch ? (
          <p className="mb-4 text-center text-sm font-semibold text-red" role="alert">
            {mismatch ? "PINs didn’t match — try again" : error}
          </p>
        ) : (
          <p className="mb-4 h-5" />
        )}

        <div className="grid grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <KeyButton key={digit} onClick={() => press(digit)} disabled={busy}>
              {digit}
            </KeyButton>
          ))}
          <span />
          <KeyButton onClick={() => press("0")} disabled={busy}>
            0
          </KeyButton>
          <KeyButton onClick={backspace} disabled={busy} aria-label="Delete">
            <Delete className="size-5" />
          </KeyButton>
        </div>
      </div>
    </div>
  );
}

function KeyButton({
  children,
  onClick,
  disabled,
  ...rest
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-16 items-center justify-center rounded-xl bg-surface font-display text-2xl font-bold text-fg shadow-[var(--shadow-border)] transition-colors hover:bg-surface-2 disabled:opacity-50"
      {...rest}
    >
      {children}
    </button>
  );
}
