import { createServerFn } from "@tanstack/react-start";
import { isMenuContent, type MenuContent } from "@/lib/types";

export const loadPublishedMenu = createServerFn({ method: "GET" }).handler(
  async (): Promise<MenuContent> => {
    const { readPublishedMenu } = await import("./menu-store.server");
    return readPublishedMenu();
  },
);

export const studioStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ hasPassword: boolean }> => {
    const { studioHasPassword } = await import("./studio-auth.server");
    return { hasPassword: await studioHasPassword() };
  },
);

export const checkStudioToken = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!data || typeof data !== "object") return { token: "" };
    const token = (data as { token?: unknown }).token;
    return { token: typeof token === "string" ? token : "" };
  })
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    const { studioTokenValid } = await import("./studio-auth.server");
    return { ok: await studioTokenValid(data.token) };
  });

function readPassword(data: unknown): string {
  if (!data || typeof data !== "object") throw new Error("Password must be 4–64 characters");
  const password = (data as { password?: unknown }).password;
  if (typeof password !== "string") throw new Error("Password must be 4–64 characters");
  return password;
}

export const setupStudioPassword = createServerFn({ method: "POST" })
  .validator((data: unknown) => ({ password: readPassword(data) }))
  .handler(async ({ data }): Promise<{ token: string }> => {
    const { setStudioPassword } = await import("./studio-auth.server");
    return { token: await setStudioPassword(data.password) };
  });

export const changeStudioPassword = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!data || typeof data !== "object") throw new Error("Invalid password change");
    const body = data as { password?: unknown; token?: unknown };
    if (typeof body.password !== "string" || typeof body.token !== "string") {
      throw new Error("Invalid password change");
    }
    return { password: body.password, token: body.token };
  })
  .handler(async ({ data }): Promise<{ token: string }> => {
    const { setStudioPassword } = await import("./studio-auth.server");
    return { token: await setStudioPassword(data.password, data.token) };
  });

export const unlockStudio = createServerFn({ method: "POST" })
  .validator((data: unknown) => ({ password: readPassword(data) }))
  .handler(async ({ data }): Promise<{ token: string }> => {
    const { verifyStudioPassword } = await import("./studio-auth.server");
    return { token: await verifyStudioPassword(data.password) };
  });

export const publishMenu = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!data || typeof data !== "object") throw new Error("Invalid menu content");
    const body = data as { menu?: unknown; token?: unknown };
    if (!isMenuContent(body.menu)) throw new Error("Invalid menu content");
    if (typeof body.token !== "string" || !body.token) {
      throw new Error("Studio is locked");
    }
    return { menu: body.menu, token: body.token };
  })
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { assertStudioToken } = await import("./studio-auth.server");
    const { writePublishedMenu } = await import("./menu-store.server");
    await assertStudioToken(data.token);
    await writePublishedMenu(data.menu);
    return { ok: true };
  });
