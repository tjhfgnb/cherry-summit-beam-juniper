import "./wordbook-schema-RDVANq7b.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wordbook-data.server-Btk97sW5.js
function parseTags(raw) {
	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.filter((t) => typeof t === "string") : [];
	} catch {
		return [];
	}
}
function rowToWord(row) {
	const source = [
		"seed",
		"manual",
		"translate"
	].includes(row.source) ? row.source : "manual";
	return {
		id: row.id,
		en: row.en,
		zh: row.zh,
		phonetic: row.phonetic ?? "",
		pos: row.pos ?? "",
		exampleEn: row.example_en ?? "",
		exampleZh: row.example_zh ?? "",
		note: row.note ?? "",
		tags: parseTags(row.tags ?? "[]"),
		starred: Boolean(row.starred),
		ease: Number(row.ease) || 0,
		intervalDays: Number(row.interval_days) || 0,
		nextReviewAt: Number(row.next_review_at) || 0,
		reviewCount: Number(row.review_count) || 0,
		correctCount: Number(row.correct_count) || 0,
		wrongCount: Number(row.wrong_count) || 0,
		createdAt: Number(row.created_at) || 0,
		updatedAt: Number(row.updated_at) || 0,
		source
	};
}
async function loadWordbookData(userId) {
	const { getSql } = await import("./db-BY9kKZ5u.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	const rows = await sql`
    select id, en, zh, phonetic, pos, example_en, example_zh, note, tags,
           starred, ease, interval_days, next_review_at, review_count,
           correct_count, wrong_count, created_at, updated_at, source
    from words
    where user_id = ${userId}
    order by updated_at desc
  `;
	const statsRow = (await sql`
    select streak, last_practice_date, total_reviews
    from practice_stats
    where user_id = ${userId}
    limit 1
  `)[0];
	const stats = statsRow ? {
		streak: Number(statsRow.streak) || 0,
		lastPracticeDate: statsRow.last_practice_date,
		totalReviews: Number(statsRow.total_reviews) || 0
	} : {
		streak: 0,
		lastPracticeDate: null,
		totalReviews: 0
	};
	return {
		words: rows.map(rowToWord),
		stats
	};
}
async function saveWordbookData(userId, data) {
	const { getSql } = await import("./db-BY9kKZ5u.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	await sql`delete from words where user_id = ${userId}`;
	for (const word of data.words) await sql`
      insert into words (
        id, user_id, en, zh, phonetic, pos, example_en, example_zh, note, tags,
        starred, ease, interval_days, next_review_at, review_count,
        correct_count, wrong_count, created_at, updated_at, source
      ) values (
        ${word.id}, ${userId}, ${word.en}, ${word.zh}, ${word.phonetic},
        ${word.pos}, ${word.exampleEn}, ${word.exampleZh}, ${word.note},
        ${JSON.stringify(word.tags)}, ${word.starred}, ${word.ease},
        ${word.intervalDays}, ${word.nextReviewAt}, ${word.reviewCount},
        ${word.correctCount}, ${word.wrongCount}, ${word.createdAt},
        ${word.updatedAt}, ${word.source}
      )
    `;
	await sql`
    insert into practice_stats (user_id, streak, last_practice_date, total_reviews, updated_at)
    values (
      ${userId}, ${data.stats.streak}, ${data.stats.lastPracticeDate},
      ${data.stats.totalReviews}, ${Date.now()}
    )
    on conflict (user_id) do update set
      streak = excluded.streak,
      last_practice_date = excluded.last_practice_date,
      total_reviews = excluded.total_reviews,
      updated_at = excluded.updated_at
  `;
	return {
		ok: true,
		count: data.words.length
	};
}
//#endregion
export { loadWordbookData, saveWordbookData };
