import { c as canonicalizePos, l as formatPos } from "./router-C0Aafbcp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lookup-CNHju-oU.js
var POS_FROM_EN = {
	noun: "n",
	"proper noun": "n",
	verb: "v",
	adjective: "adj",
	adverb: "adv",
	preposition: "prep",
	conjunction: "conj",
	pronoun: "pron",
	determiner: "det",
	article: "det",
	interjection: "int",
	exclamation: "int",
	phrase: "phr",
	proverb: "phr",
	idiom: "phr",
	"phrasal verb": "phr"
};
var CACHE_KEY = "yingxiben-lookup-v2";
var CACHE_TTL_MS = 12096e5;
var memoryCache = /* @__PURE__ */ new Map();
var inflight = /* @__PURE__ */ new Map();
function hasCjk(text) {
	return /[\u3400-\u9fff]/.test(text);
}
function detectLang(text, hint) {
	if (hint === "en" || hint === "zh") return hint;
	return hasCjk(text) ? "zh" : "en";
}
function cacheKey(text, hint) {
	return `${hint ?? "auto"}:${text.trim().toLowerCase()}`;
}
function readPersisted(key) {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(CACHE_KEY);
		if (!raw) return null;
		const hit = JSON.parse(raw)[key];
		if (!hit || Date.now() - hit.at > CACHE_TTL_MS) return null;
		return hit.result;
	} catch {
		return null;
	}
}
function writePersisted(key, result) {
	if (typeof window === "undefined") return;
	try {
		const raw = window.localStorage.getItem(CACHE_KEY);
		const all = raw ? JSON.parse(raw) : {};
		all[key] = {
			at: Date.now(),
			result
		};
		const keys = Object.keys(all);
		if (keys.length > 80) keys.sort((a, b) => (all[a]?.at ?? 0) - (all[b]?.at ?? 0)).slice(0, keys.length - 80).forEach((k) => {
			delete all[k];
		});
		window.localStorage.setItem(CACHE_KEY, JSON.stringify(all));
	} catch {}
}
function stripHtml(value) {
	return value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}
async function fetchJson(url, timeout) {
	try {
		const res = await fetch(url, {
			signal: AbortSignal.timeout(timeout),
			headers: { Accept: "application/json" }
		});
		if (!res.ok) return null;
		if ((res.headers.get("content-type") ?? "").includes("text/html")) return null;
		return await res.json();
	} catch {
		return null;
	}
}
function parseGoogleTranslate(payload) {
	if (!Array.isArray(payload) || payload.length === 0) return null;
	const first = payload[0];
	if (typeof first === "string" && first.trim()) return first.trim();
	if (Array.isArray(first) && typeof first[0] === "string" && first[0].trim()) return first[0].trim();
	return null;
}
async function translateText(text, from, to) {
	const sl = from === "zh" ? "zh-TW" : "en";
	const tl = to === "zh" ? "zh-TW" : "en";
	const url = new URL("https://clients5.google.com/translate_a/t");
	url.searchParams.set("client", "dict-chrome-ex");
	url.searchParams.set("sl", sl);
	url.searchParams.set("tl", tl);
	url.searchParams.set("q", text);
	const parsed = parseGoogleTranslate(await fetchJson(url.toString(), 4e3));
	if (!parsed) return null;
	if (parsed.toLowerCase() === text.trim().toLowerCase() && from !== to) return null;
	return parsed;
}
async function lookupWiktionary(english) {
	const title = english.trim().toLowerCase().replace(/\s+/g, "_");
	if (!title) return {
		pos: "",
		phonetic: "",
		exampleEn: ""
	};
	const defPayload = await fetchJson(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(title)}`, 2800);
	const keys = [];
	let exampleEn = "";
	const entries = defPayload?.en ?? [];
	for (const entry of entries) {
		const mapped = POS_FROM_EN[(entry.partOfSpeech ?? "").trim().toLowerCase()];
		if (mapped && !keys.includes(mapped)) keys.push(mapped);
		if (!exampleEn) {
			const sense = entry.definitions?.[0];
			exampleEn = stripHtml(sense?.parsedExamples?.[0]?.example || sense?.examples?.[0] || "");
		}
	}
	if (english.trim().includes(" ") && !keys.includes("phr")) keys.push("phr");
	return {
		pos: formatPos(keys),
		phonetic: "",
		exampleEn
	};
}
function emptyExtras() {
	return {
		pos: "",
		phonetic: "",
		exampleEn: ""
	};
}
async function lookupPhrase(input) {
	const body = input.data ?? input;
	const text = body.text?.trim() ?? "";
	if (!text) return {
		ok: false,
		error: "先輸入要翻譯的文字。"
	};
	if (text.length > 400) return {
		ok: false,
		error: "文字太長，請縮短後再試。"
	};
	const key = cacheKey(text, body.hint);
	const cached = memoryCache.get(key) ?? readPersisted(key);
	if (cached) {
		memoryCache.set(key, cached);
		input.onPartial?.(cached);
		return cached;
	}
	const pending = inflight.get(key);
	if (pending) return pending;
	const task = (async () => {
		const sourceLang = detectLang(text, body.hint);
		const targetLang = sourceLang === "en" ? "zh" : "en";
		try {
			const extrasP = sourceLang === "en" ? lookupWiktionary(text).catch(() => emptyExtras()) : Promise.resolve(null);
			const translation = await translateText(text, sourceLang, targetLang);
			if (!translation) return {
				ok: false,
				error: "找不到翻譯，請改為手動填入中英文。"
			};
			const partial = {
				ok: true,
				sourceLang,
				targetLang,
				source: text,
				translation,
				phonetic: "",
				pos: "",
				examples: [],
				alternatives: []
			};
			input.onPartial?.(partial);
			const extras = await extrasP ?? await lookupWiktionary(translation).catch(() => emptyExtras());
			const full = {
				...partial,
				phonetic: extras.phonetic,
				pos: canonicalizePos(extras.pos),
				examples: extras.exampleEn ? [{
					en: extras.exampleEn,
					zh: ""
				}] : []
			};
			input.onPartial?.(full);
			memoryCache.set(key, full);
			writePersisted(key, full);
			return full;
		} catch {
			return {
				ok: false,
				error: "翻譯失敗，請稍後再試，或改為手動新增。"
			};
		}
	})();
	inflight.set(key, task);
	try {
		return await task;
	} finally {
		inflight.delete(key);
	}
}
//#endregion
export { lookupPhrase as t };
