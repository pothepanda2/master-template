import { createServerFn } from "@tanstack/react-start";
import { isMenuContent, type MenuContent } from "@/lib/types";

export const loadPublishedMenu = createServerFn({ method: "GET" }).handler(
  async (): Promise<MenuContent> => {
    const { readPublishedMenu } = await import("./menu-store.server");
    return readPublishedMenu();
  },
);

export const studioStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ hasPin: boolean }> => {
    const { studioHasPin } = await import("./studio-auth.server");
    return { hasPin: await studioHasPin() };
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

export const setupStudioPin = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!data || typeof data !== "object") throw new Error("PIN must be 4 digits");
    const pin = (data as { pin?: unknown }).pin;
    if (typeof pin !== "string") throw new Error("PIN must be 4 digits");
    return { pin };
  })
  .handler(async ({ data }): Promise<{ token: string }> => {
    const { setStudioPin } = await import("./studio-auth.server");
    return { token: await setStudioPin(data.pin) };
  });

export const changeStudioPin = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!data || typeof data !== "object") throw new Error("Invalid PIN change");
    const body = data as { pin?: unknown; token?: unknown };
    if (typeof body.pin !== "string" || typeof body.token !== "string") {
      throw new Error("Invalid PIN change");
    }
    return { pin: body.pin, token: body.token };
  })
  .handler(async ({ data }): Promise<{ token: string }> => {
    const { setStudioPin } = await import("./studio-auth.server");
    return { token: await setStudioPin(data.pin, data.token) };
  });

export const unlockStudio = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!data || typeof data !== "object") throw new Error("Wrong PIN");
    const pin = (data as { pin?: unknown }).pin;
    if (typeof pin !== "string") throw new Error("Wrong PIN");
    return { pin };
  })
  .handler(async ({ data }): Promise<{ token: string }> => {
    const { verifyStudioPin } = await import("./studio-auth.server");
    return { token: await verifyStudioPin(data.pin) };
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
