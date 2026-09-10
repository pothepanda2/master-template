import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const BLOB_STORE = "qr-menu";
const BLOB_KEY = "studio-auth";
const FILE_PATH = join(process.cwd(), "data", "studio-auth.json");
const SESSION_MS = 1000 * 60 * 60 * 12;

type StudioAuth = {
  pinHash: string;
  sessions: Record<string, number>;
};

function hashSecret(secret: string): string {
  return createHash("sha256").update(`qr-studio:${secret}`).digest("hex");
}

function hashesMatch(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function normalizeSecret(value: string): string {
  return value.normalize("NFKC").trim();
}

function isSecret(value: string): boolean {
  return value.length >= 4 && value.length <= 64;
}

function prune(auth: StudioAuth): StudioAuth {
  const now = Date.now();
  const sessions: Record<string, number> = {};
  for (const [token, expires] of Object.entries(auth.sessions ?? {})) {
    if (expires > now) sessions[token] = expires;
  }
  return { pinHash: auth.pinHash, sessions };
}

function isAuth(value: unknown): value is StudioAuth {
  if (!value || typeof value !== "object") return false;
  const parsed = value as StudioAuth;
  return typeof parsed.pinHash === "string" && parsed.pinHash.length > 0;
}

async function blobStore() {
  try {
    const { getStore } = await import("@netlify/blobs");
    try {
      return getStore({ name: BLOB_STORE, consistency: "strong" });
    } catch {
      return getStore(BLOB_STORE);
    }
  } catch {
    return null;
  }
}

async function readAuth(): Promise<StudioAuth | null> {
  const store = await blobStore();
  if (store) {
    try {
      const parsed = await store.get(BLOB_KEY, { type: "json" });
      if (isAuth(parsed)) return prune(parsed);
    } catch {
      // fall through to file
    }
  }
  try {
    const raw = await readFile(FILE_PATH, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (isAuth(parsed)) return prune(parsed);
  } catch {
    return null;
  }
  return null;
}

async function writeAuth(auth: StudioAuth): Promise<void> {
  const next = prune(auth);
  const store = await blobStore();
  let blobOk = false;
  if (store) {
    await store.setJSON(BLOB_KEY, next);
    blobOk = true;
  }
  try {
    await mkdir(join(process.cwd(), "data"), { recursive: true });
    await writeFile(FILE_PATH, JSON.stringify(next), "utf8");
  } catch {
    if (!blobOk) throw new Error("Could not save studio lock");
  }
}

export async function studioHasPassword(): Promise<boolean> {
  const auth = await readAuth();
  return Boolean(auth?.pinHash);
}

export async function studioTokenValid(token: string): Promise<boolean> {
  if (!token) return false;
  const auth = await readAuth();
  if (!auth) return false;
  const expires = auth.sessions[token];
  return typeof expires === "number" && expires > Date.now();
}

function newToken(): string {
  return randomBytes(24).toString("base64url");
}

async function issueToken(auth: StudioAuth): Promise<string> {
  const token = newToken();
  const sessions = { ...auth.sessions, [token]: Date.now() + SESSION_MS };
  const keys = Object.keys(sessions);
  if (keys.length > 20) {
    const oldest = keys.sort((a, b) => sessions[a] - sessions[b])[0];
    delete sessions[oldest];
  }
  await writeAuth({ ...auth, sessions });
  return token;
}

export async function setStudioPassword(password: string, token?: string): Promise<string> {
  const secret = normalizeSecret(password);
  if (!isSecret(secret)) throw new Error("Password must be 4–64 characters");
  const existing = await readAuth();
  if (existing) {
    if (!token || !(await studioTokenValid(token))) {
      throw new Error("Studio is locked");
    }
    return issueToken({ pinHash: hashSecret(secret), sessions: {} });
  }
  return issueToken({ pinHash: hashSecret(secret), sessions: {} });
}

export async function verifyStudioPassword(password: string): Promise<string> {
  const secret = normalizeSecret(password);
  if (!isSecret(secret)) throw new Error("Wrong password");
  const auth = await readAuth();
  if (!auth) throw new Error("Set a password first");
  if (!hashesMatch(auth.pinHash, hashSecret(secret))) throw new Error("Wrong password");
  return issueToken(auth);
}

export async function assertStudioToken(token: string): Promise<void> {
  if (!(await studioTokenValid(token))) {
    throw new Error("Studio is locked");
  }
}
