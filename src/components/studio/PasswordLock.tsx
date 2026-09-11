import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export function PasswordLock({
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
  onSubmit: (password: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [mismatch, setMismatch] = useState(false);

  const title = mode === "unlock" ? "Enter password" : "Set a password";
  const subtitle =
    mode === "unlock"
      ? `Unlock Menu Studio for ${cafeName}`
      : "Guests never see this. Only people with the password can edit the live menu.";

  function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const next = password.trim();
    if (next.length < 4) return;
    if (mode === "setup") {
      if (next !== confirm.trim()) {
        setMismatch(true);
        return;
      }
    }
    setMismatch(false);
    onSubmit(next);
  }

  const ready =
    password.trim().length >= 4 && (mode === "unlock" || password.trim() === confirm.trim());

  return (
    <div className="flex min-h-dvh flex-col bg-bg px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 inline-flex size-14 items-center justify-center rounded-xl bg-surface text-lime shadow-[var(--shadow-border)]">
            <Lock className="size-6" />
          </span>
          <p className="font-display text-3xl font-semibold tracking-tight">{title}</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">{subtitle}</p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <SecretField
            label={mode === "setup" ? "New password" : "Password"}
            value={password}
            show={show}
            disabled={busy}
            autoComplete={mode === "setup" ? "new-password" : "current-password"}
            onChange={(value) => {
              setPassword(value);
              setMismatch(false);
            }}
            onToggle={() => setShow((value) => !value)}
          />
          {mode === "setup" ? (
            <SecretField
              label="Confirm password"
              value={confirm}
              show={show}
              disabled={busy}
              autoComplete="new-password"
              onChange={(value) => {
                setConfirm(value);
                setMismatch(false);
              }}
              onToggle={() => setShow((value) => !value)}
            />
          ) : null}

          {error || mismatch ? (
            <p className="text-center text-sm font-semibold text-red" role="alert">
              {mismatch ? "Passwords didn’t match — try again" : error}
            </p>
          ) : (
            <p className="text-center text-xs text-subtle">
              At least 4 characters.
            </p>
          )}

          <button
            type="submit"
            disabled={!ready || busy}
            className="mt-1 inline-flex min-h-12 items-center justify-center rounded-md bg-lime px-4 text-sm font-semibold text-lime-fg disabled:opacity-40"
          >
            {busy ? "Please wait…" : mode === "setup" ? "Save password" : "Unlock"}
          </button>
        </form>
      </div>
    </div>
  );
}

function SecretField({
  label,
  value,
  show,
  disabled,
  autoComplete,
  onChange,
  onToggle,
}: {
  label: string;
  value: string;
  show: boolean;
  disabled?: boolean;
  autoComplete: string;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold tracking-wide text-muted uppercase">
        {label}
      </span>
      <span className="relative block">
        <input
          type={show ? "text" : "password"}
          value={value}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={64}
          onChange={(e) => onChange(e.target.value.slice(0, 64))}
          className={cn(
            "h-12 w-full rounded-md bg-surface pr-12 pl-3 text-base text-fg shadow-[var(--shadow-border)]",
            "placeholder:text-subtle focus:shadow-[var(--shadow-border-hover)] focus:outline-none",
          )}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 items-center justify-center rounded-sm text-muted hover:text-fg"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </span>
    </label>
  );
}
