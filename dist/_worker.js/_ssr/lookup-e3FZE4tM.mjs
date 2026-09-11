import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as formatPos, p as cn, s as canonicalizePos } from "./router-ugn03xlr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lookup-e3FZE4tM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-28 w-full rounded-xl bg-surface px-3.5 py-3 text-base text-ink shadow-card", "placeholder:text-faint outline-none transition-[box-shadow] duration-150", "focus-visible:ring-2 focus-visible:ring-accent/35", "disabled:cursor-not-allowed disabled:opacity-50 resize-y", "md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
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
function hasCjk(text) {
	return /[\u3400-\u9fff]/.test(text);
}
function detectLang(text, hint) {
	if (hint === "en" || hint === "zh") return hint;
	return hasCjk(text) ? "zh" : "en";
}
function stripHtml(value) {
	return value.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/\s+/g, " ").trim();
}
async function fetchJson(url, timeout = 1e4) {
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
	if (typeof first === "string" && first.trim()) return { text: first.trim() };
	if (Array.isArray(first) && typeof first[0] === "string" && first[0].trim()) return {
		text: first[0].trim(),
		detected: typeof first[1] === "string" ? first[1] : void 0
	};
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
	const parsed = parseGoogleTranslate(await fetchJson(url.toString()));
	if (!parsed?.text) return null;
	if (parsed.text.toLowerCase() === text.trim().toLowerCase() && from !== to) return null;
	return parsed.text;
}
function wikiTitle(english) {
	return english.trim().toLowerCase().replace(/\s+/g, "_");
}
async function lookupWiktionary(english) {
	const title = wikiTitle(english);
	if (!title) return {
		pos: "",
		phonetic: "",
		exampleEn: ""
	};
	const [defPayload, parsePayload] = await Promise.all([fetchJson(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(title)}`), fetchJson(`https://en.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(title.replaceAll("_", " "))}&prop=wikitext&format=json&origin=*`)]);
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
	let phonetic = "";
	const ipa = (parsePayload?.parse?.wikitext?.["*"] ?? "").match(/\{\{IPA\|en\|(\/[^|}\s]+)/i);
	if (ipa?.[1]) phonetic = ipa[1];
	return {
		pos: formatPos(keys),
		phonetic,
		exampleEn
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
	const sourceLang = detectLang(text, body.hint);
	const targetLang = sourceLang === "en" ? "zh" : "en";
	try {
		const [translation, extrasAhead] = await Promise.all([translateText(text, sourceLang, targetLang), sourceLang === "en" ? lookupWiktionary(text) : Promise.resolve(null)]);
		if (!translation) return {
			ok: false,
			error: "找不到翻譯，請改為手動填入中英文。"
		};
		const extras = extrasAhead ?? await lookupWiktionary(sourceLang === "en" ? text : translation);
		let exampleZh = "";
		if (extras.exampleEn) exampleZh = await translateText(extras.exampleEn, "en", "zh") ?? "";
		return {
			ok: true,
			sourceLang,
			targetLang,
			source: text,
			translation,
			phonetic: extras.phonetic,
			pos: canonicalizePos(extras.pos),
			examples: extras.exampleEn ? [{
				en: extras.exampleEn,
				zh: exampleZh
			}] : [],
			alternatives: []
		};
	} catch {
		return {
			ok: false,
			error: "翻譯失敗，請稍後再試，或改為手動新增。"
		};
	}
}
//#endregion
export { lookupPhrase as n, Textarea as t };
