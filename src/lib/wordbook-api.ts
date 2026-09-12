import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { snapshotSchema } from "./wordbook-schema";

export const loadWordbook = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { loadWordbookData } = await import("./wordbook-data.server");
    return loadWordbookData(context.userId);
  });

export const saveWordbook = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => snapshotSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { saveWordbookData } = await import("./wordbook-data.server");
    return saveWordbookData(context.userId, data);
  });
