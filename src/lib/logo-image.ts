const LOGO_MAX_EDGE = 512;
const LOGO_MAX_BYTES = 6 * 1024 * 1024;
const DISH_MAX_EDGE = 360;
const DISH_MAX_BYTES = 4 * 1024 * 1024;

export function isVisibleLogo(logo?: string | null): boolean {
  const value = logo?.trim() ?? "";
  if (!value) return false;
  if (value === "/logo.svg") return false;
  return true;
}

export function isVisiblePhoto(photo?: string | null): boolean {
  return Boolean(photo?.trim());
}

type CompressOpts = {
  maxEdge: number;
  maxInputBytes: number;
  jpegQuality: number;
  maxOutputChars: number;
};

async function fileToDataUrl(file: File, opts: CompressOpts): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose a JPG, PNG, or WebP photo");
  }
  if (file.size > opts.maxInputBytes) {
    const mb = Math.round(opts.maxInputBytes / (1024 * 1024));
    throw new Error(`That photo is too large (max ${mb} MB)`);
  }

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) {
    throw new Error("Could not read that photo. Try JPG or PNG.");
  }

  const scale = Math.min(1, opts.maxEdge / Math.max(bitmap.width, bitmap.height));
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

  const webp = canvas.toDataURL("image/webp", opts.jpegQuality);
  if (webp.startsWith("data:image/webp") && webp.length < opts.maxOutputChars) return webp;

  let quality = opts.jpegQuality;
  let jpeg = canvas.toDataURL("image/jpeg", quality);
  while (jpeg.length > opts.maxOutputChars && quality > 0.5) {
    quality -= 0.08;
    jpeg = canvas.toDataURL("image/jpeg", quality);
  }
  if (jpeg.length > opts.maxOutputChars) {
    const small = document.createElement("canvas");
    const nextW = Math.max(1, Math.round(width * 0.75));
    const nextH = Math.max(1, Math.round(height * 0.75));
    small.width = nextW;
    small.height = nextH;
    const sctx = small.getContext("2d");
    if (sctx) {
      sctx.drawImage(canvas, 0, 0, nextW, nextH);
      jpeg = small.toDataURL("image/jpeg", 0.7);
    }
  }
  return jpeg;
}

export async function fileToLogoDataUrl(file: File): Promise<string> {
  return fileToDataUrl(file, {
    maxEdge: LOGO_MAX_EDGE,
    maxInputBytes: LOGO_MAX_BYTES,
    jpegQuality: 0.86,
    maxOutputChars: 280_000,
  });
}

export async function fileToDishDataUrl(file: File): Promise<string> {
  return fileToDataUrl(file, {
    maxEdge: DISH_MAX_EDGE,
    maxInputBytes: DISH_MAX_BYTES,
    jpegQuality: 0.72,
    maxOutputChars: 80_000,
  });
}
