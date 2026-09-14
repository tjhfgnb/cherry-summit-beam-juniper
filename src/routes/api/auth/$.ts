import { createFileRoute } from "@tanstack/react-router";

async function handleAuth(request: Request): Promise<Response> {
  try {
    const { auth } = await import("@/lib/auth/server");
    return await auth.handler(request);
  } catch (error) {
    console.error("[auth]", error);
    const path = new URL(request.url).pathname;
    if (path.includes("get-session")) {
      return new Response("null", {
        status: 200,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }
    return new Response(
      JSON.stringify({
        message: "雲端登入目前無法使用，單字仍會存在這台裝置。",
      }),
      {
        status: 503,
        headers: { "content-type": "application/json; charset=utf-8" },
      },
    );
  }
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handleAuth(request),
      POST: ({ request }) => handleAuth(request),
    },
  },
});
