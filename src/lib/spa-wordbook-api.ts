/** Browser calls used on Cloudflare Pages. Falls back if /api is down. */
export async function loadWordbook() {
  const res = await fetch("/api/wordbook", { credentials: "include" });
  if (!res.ok) {
    throw new Error("cloud wordbook unavailable");
  }
  return (await res.json()) as {
    words: never[];
    stats: { streak: number; lastPracticeDate: string | null; totalReviews: number };
  };
}

export async function saveWordbook(args: {
  data: { words: unknown; stats: unknown };
}) {
  const res = await fetch("/api/wordbook", {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(args.data),
  });
  if (!res.ok) {
    throw new Error("cloud wordbook unavailable");
  }
  return (await res.json()) as { ok: false | true };
}
