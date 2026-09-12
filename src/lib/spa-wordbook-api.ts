/** Browser stub — cloud save needs Neon; localStorage still works. */
export async function loadWordbook() {
  return {
    words: [] as never[],
    stats: { streak: 0, lastPracticeDate: null as string | null, totalReviews: 0 },
  };
}

export async function saveWordbook(_args?: unknown) {
  return { ok: false as const };
}
