const MAX_EDGE = 512;
const MAX_BYTES = 6 * 1024 * 1024;

export function isVisibleLogo(logo?: string | null): boolean {
  const value = logo?.trim() ?? "";
  if (!value) return false;
  if (value === "/logo.svg") return false;
  return true;
}

export async function fileToLogoDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose a JPG, PNG, or WebP photo");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("That photo is too large (max 6 MB)");
  }

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) {
    throw new Error("Could not read that photo. Try JPG or PNG.");
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Could not process that photo");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const webp = canvas.toDataURL("image/webp", 0.86);
  if (webp.startsWith("data:image/webp") && webp.length < 280_000) return webp;

  if (file.type === "image/png") {
    const png = canvas.toDataURL("image/png");
    if (png.length < 360_000) return png;
  }

  return canvas.toDataURL("image/jpeg", 0.86);
}
