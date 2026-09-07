import { createServerFn } from "@tanstack/react-start";
import { isMenuContent, type MenuContent } from "@/lib/types";

export const loadPublishedMenu = createServerFn({ method: "GET" }).handler(
  async (): Promise<MenuContent> => {
    const { readPublishedMenu } = await import("./menu-store.server");
    return readPublishedMenu();
  },
);

export const publishMenu = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!isMenuContent(data)) {
      throw new Error("Invalid menu content");
    }
    return data;
  })
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { writePublishedMenu } = await import("./menu-store.server");
    await writePublishedMenu(data);
    return { ok: true };
  });
