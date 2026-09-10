export const THEME_IDS = ["warm", "dark", "coffee", "forest", "rose", "ocean"] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export type ThemeVars = {
  "--color-bg": string;
  "--color-surface": string;
  "--color-surface-2": string;
  "--color-fg": string;
  "--color-muted": string;
  "--color-subtle": string;
  "--color-lime": string;
  "--color-lime-dim": string;
  "--color-lime-fg": string;
  "--color-border": string;
  "--color-line": string;
  "--color-price": string;
  "--shadow-border": string;
  "--shadow-border-hover": string;
};

const LIGHT_SHADOW = [
  "0 0 0 1px rgba(42, 31, 22, 0.06)",
  "0 1px 2px -1px rgba(42, 31, 22, 0.06)",
  "0 2px 8px rgba(42, 31, 22, 0.04)",
].join(", ");

const LIGHT_SHADOW_HOVER = [
  "0 0 0 1px color-mix(in srgb, var(--color-lime) 35%, transparent)",
  "0 1px 2px -1px rgba(42, 31, 22, 0.08)",
  "0 4px 12px rgba(42, 31, 22, 0.06)",
].join(", ");

const DARK_SHADOW = "0 0 0 1px rgba(255, 255, 255, 0.08)";
const DARK_SHADOW_HOVER = "0 0 0 1px color-mix(in srgb, var(--color-lime) 40%, transparent)";

export const THEMES: Record<
  ThemeId,
  { label: string; dark: boolean; vars: ThemeVars }
> = {
  warm: {
    label: "Warm cream",
    dark: false,
    vars: {
      "--color-bg": "#f4ebdd",
      "--color-surface": "#fff8ef",
      "--color-surface-2": "#efe4d2",
      "--color-fg": "#2a1f16",
      "--color-muted": "#746354",
      "--color-subtle": "#9a8874",
      "--color-lime": "#c45c26",
      "--color-lime-dim": "#a34a1e",
      "--color-lime-fg": "#fff8ef",
      "--color-border": "#e4d5c0",
      "--color-line": "#eadcc8",
      "--color-price": "#8a4a1f",
      "--shadow-border": LIGHT_SHADOW,
      "--shadow-border-hover": LIGHT_SHADOW_HOVER,
    },
  },
  dark: {
    label: "Dark",
    dark: true,
    vars: {
      "--color-bg": "#050605",
      "--color-surface": "#101410",
      "--color-surface-2": "#181d18",
      "--color-fg": "#f3f6ee",
      "--color-muted": "#9aa394",
      "--color-subtle": "#6e7669",
      "--color-lime": "#c8ff3d",
      "--color-lime-dim": "#8fb82c",
      "--color-lime-fg": "#121800",
      "--color-border": "#242a24",
      "--color-line": "#1b211b",
      "--color-price": "#c8ff3d",
      "--shadow-border": DARK_SHADOW,
      "--shadow-border-hover": DARK_SHADOW_HOVER,
    },
  },
  coffee: {
    label: "Coffee",
    dark: true,
    vars: {
      "--color-bg": "#1c1410",
      "--color-surface": "#2a1f18",
      "--color-surface-2": "#3a2b22",
      "--color-fg": "#f6efe6",
      "--color-muted": "#c4b3a3",
      "--color-subtle": "#8f7d6e",
      "--color-lime": "#d4a054",
      "--color-lime-dim": "#b8863e",
      "--color-lime-fg": "#1c1410",
      "--color-border": "#3d2e24",
      "--color-line": "#2e221c",
      "--color-price": "#e0b36a",
      "--shadow-border": DARK_SHADOW,
      "--shadow-border-hover": DARK_SHADOW_HOVER,
    },
  },
  forest: {
    label: "Forest",
    dark: false,
    vars: {
      "--color-bg": "#eef4ee",
      "--color-surface": "#f7faf6",
      "--color-surface-2": "#e2ece3",
      "--color-fg": "#1c2a1e",
      "--color-muted": "#5d7260",
      "--color-subtle": "#88a08b",
      "--color-lime": "#2f6b3a",
      "--color-lime-dim": "#245530",
      "--color-lime-fg": "#f7faf6",
      "--color-border": "#d0ddd2",
      "--color-line": "#dce6dd",
      "--color-price": "#2a5a32",
      "--shadow-border": LIGHT_SHADOW,
      "--shadow-border-hover": LIGHT_SHADOW_HOVER,
    },
  },
  rose: {
    label: "Rose",
    dark: false,
    vars: {
      "--color-bg": "#f6ebe8",
      "--color-surface": "#fff8f6",
      "--color-surface-2": "#f0ddd8",
      "--color-fg": "#3a1f22",
      "--color-muted": "#8a6468",
      "--color-subtle": "#b08a8e",
      "--color-lime": "#b44d5a",
      "--color-lime-dim": "#933e49",
      "--color-lime-fg": "#fff8f6",
      "--color-border": "#e8d0d3",
      "--color-line": "#eed9db",
      "--color-price": "#8f3b46",
      "--shadow-border": LIGHT_SHADOW,
      "--shadow-border-hover": LIGHT_SHADOW_HOVER,
    },
  },
  ocean: {
    label: "Ocean",
    dark: false,
    vars: {
      "--color-bg": "#e8f0f2",
      "--color-surface": "#f5fbfc",
      "--color-surface-2": "#d5e6ea",
      "--color-fg": "#163038",
      "--color-muted": "#4f6d75",
      "--color-subtle": "#7a969c",
      "--color-lime": "#1f7a8c",
      "--color-lime-dim": "#186271",
      "--color-lime-fg": "#f5fbfc",
      "--color-border": "#c5d6db",
      "--color-line": "#d4e2e6",
      "--color-price": "#1a6574",
      "--shadow-border": LIGHT_SHADOW,
      "--shadow-border-hover": LIGHT_SHADOW_HOVER,
    },
  },
};

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && (THEME_IDS as readonly string[]).includes(value);
}

export function isAccentHex(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function parseHex(hex: string): [number, number, number] {
  const n = hex.replace("#", "");
  return [
    Number.parseInt(n.slice(0, 2), 16),
    Number.parseInt(n.slice(2, 4), 16),
    Number.parseInt(n.slice(4, 6), 16),
  ];
}

function toHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("")}`;
}

function mix(hex: string, toward: [number, number, number], amount: number): string {
  const [r, g, b] = parseHex(hex);
  return toHex(
    r + (toward[0] - r) * amount,
    g + (toward[1] - g) * amount,
    b + (toward[2] - b) * amount,
  );
}

function luminance(hex: string): number {
  const channel = (n: number) => {
    const c = n / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = parseHex(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function resolveTheme(
  themeId?: string | null,
  accentColor?: string | null,
): ThemeVars {
  const id = isThemeId(themeId) ? themeId : "warm";
  const base = { ...THEMES[id].vars };
  if (!isAccentHex(accentColor)) return base;
  const lightText = luminance(accentColor) > 0.55;
  base["--color-lime"] = accentColor;
  base["--color-lime-dim"] = mix(accentColor, [0, 0, 0], 0.22);
  base["--color-lime-fg"] = lightText ? "#1a120c" : "#fff8ef";
  base["--color-price"] = THEMES[id].dark ? accentColor : mix(accentColor, [0, 0, 0], 0.28);
  return base;
}

export function themeColorMeta(themeId?: string | null, accentColor?: string | null): string {
  return resolveTheme(themeId, accentColor)["--color-bg"];
}

export function themeCssText(themeId?: string | null, accentColor?: string | null): string {
  const vars = resolveTheme(themeId, accentColor);
  return Object.entries(vars)
    .map(([key, value]) => `${key}: ${value};`)
    .join(" ");
}
