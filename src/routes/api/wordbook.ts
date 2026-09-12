import { createFileRoute } from "@tanstack/react-router";
import { snapshotSchema } from "@/lib/wordbook-schema";

async function sessionUserId(request: Request): Promise<string | null> {
  const { auth } = await import("@/lib/auth/server");
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user?.id ?? null;
}

function fail(message: string, status: number) {
  return new Response(JSON.stringify({ message }), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export const Route = createFileRoute("/api/wordbook")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const userId = await sessionUserId(request);
          if (!userId) return fail("未登入", 401);
          const { loadWordbookData } = await import("@/lib/wordbook-data.server");
          const data = await loadWordbookData(userId);
          return Response.json(data);
        } catch (error) {
          console.error("[wordbook GET]", error);
          return fail("雲端單字本暫時無法使用", 503);
        }
      },
      POST: async ({ request }) => {
        try {
          const userId = await sessionUserId(request);
          if (!userId) return fail("未登入", 401);
          const body = snapshotSchema.parse(await request.json());
          const { saveWordbookData } = await import("@/lib/wordbook-data.server");
          const result = await saveWordbookData(userId, body);
          return Response.json(result);
        } catch (error) {
          console.error("[wordbook POST]", error);
          return fail("雲端單字本暫時無法使用", 503);
        }
      },
    },
  },
});
