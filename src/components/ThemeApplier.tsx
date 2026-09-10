import { useLayoutEffect } from "react";
import { themeCssText, type ThemeId } from "@/lib/theme";

export function ThemeApplier({
  themeId,
  accentColor,
}: {
  themeId?: ThemeId | string;
  accentColor?: string;
}) {
  const css = themeCssText(themeId, accentColor);

  useLayoutEffect(() => {
    const root = document.documentElement;
    css.split(";").forEach((part) => {
      const trimmed = part.trim();
      if (!trimmed) return;
      const idx = trimmed.indexOf(":");
      if (idx < 0) return;
      root.style.setProperty(trimmed.slice(0, idx).trim(), trimmed.slice(idx + 1).trim());
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    const bg = root.style.getPropertyValue("--color-bg").trim();
    if (meta && bg) meta.setAttribute("content", bg);
  }, [css]);

  return <style dangerouslySetInnerHTML={{ __html: `:root { ${css} }` }} />;
}
