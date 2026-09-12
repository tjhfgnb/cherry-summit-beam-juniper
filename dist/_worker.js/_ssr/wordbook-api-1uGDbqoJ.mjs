import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { A as boolean, D as _enum, F as object, P as number, R as string, k as array } from "../_libs/@better-auth/core+[...].mjs";
import { t as authMiddleware } from "./middleware-2UtE0-LH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wordbook-api-1uGDbqoJ.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var wordSchema = object({
	id: string().min(1).max(80),
	en: string().min(1).max(200),
	zh: string().min(1).max(400),
	phonetic: string().max(120).optional().default(""),
	pos: string().max(80).optional().default(""),
	exampleEn: string().max(500).optional().default(""),
	exampleZh: string().max(500).optional().default(""),
	note: string().max(500).optional().default(""),
	tags: array(string().max(40)).max(12).optional().default([]),
	starred: boolean().optional().default(false),
	ease: number().int().min(0).max(5).optional().default(0),
	intervalDays: number().int().min(0).max(3650).optional().default(0),
	nextReviewAt: number().int().optional().default(0),
	reviewCount: number().int().min(0).optional().default(0),
	correctCount: number().int().min(0).optional().default(0),
	wrongCount: number().int().min(0).optional().default(0),
	createdAt: number().int(),
	updatedAt: number().int(),
	source: _enum([
		"seed",
		"manual",
		"translate"
	]).optional().default("manual")
});
var statsSchema = object({
	streak: number().int().min(0).max(1e4),
	lastPracticeDate: string().nullable(),
	totalReviews: number().int().min(0)
});
var snapshotSchema = object({
	words: array(wordSchema).max(500),
	stats: statsSchema
});
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
var loadWordbook_createServerFn_handler = createServerRpc({
	id: "0d14523e6618b73b54fe4d38bb8d3b2d8fbb8257bc478a9d9ed337dae27a2a32",
	name: "loadWordbook",
	filename: "src/lib/wordbook-api.ts"
}, (opts) => loadWordbook.__executeServer(opts));
var loadWordbook = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadWordbook_createServerFn_handler, async ({ context }) => {
	const { getSql } = await import("./db-CAc5B_Bv.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	const rows = await sql`
      select id, en, zh, phonetic, pos, example_en, example_zh, note, tags,
             starred, ease, interval_days, next_review_at, review_count,
             correct_count, wrong_count, created_at, updated_at, source
      from words
      where user_id = ${context.userId}
      order by updated_at desc
    `;
	const statsRow = (await sql`
      select streak, last_practice_date, total_reviews
      from practice_stats
      where user_id = ${context.userId}
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
});
var saveWordbook_createServerFn_handler = createServerRpc({
	id: "d25f0bc5354f36198a48cb5987f930174ed0edd85054852f223b96047c6ecd35",
	name: "saveWordbook",
	filename: "src/lib/wordbook-api.ts"
}, (opts) => saveWordbook.__executeServer(opts));
var saveWordbook = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => snapshotSchema.parse(input)).handler(saveWordbook_createServerFn_handler, async ({ context, data }) => {
	const { getSql } = await import("./db-CAc5B_Bv.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	await sql`delete from words where user_id = ${context.userId}`;
	for (const word of data.words) await sql`
        insert into words (
          id, user_id, en, zh, phonetic, pos, example_en, example_zh, note, tags,
          starred, ease, interval_days, next_review_at, review_count,
          correct_count, wrong_count, created_at, updated_at, source
        ) values (
          ${word.id}, ${context.userId}, ${word.en}, ${word.zh}, ${word.phonetic},
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
        ${context.userId}, ${data.stats.streak}, ${data.stats.lastPracticeDate},
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
});
//#endregion
export { loadWordbook_createServerFn_handler, saveWordbook_createServerFn_handler };
