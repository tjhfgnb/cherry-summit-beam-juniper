import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as ArrowRightLeft, d as LoaderCircle, l as Plus, p as Languages } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useWordStore } from "./router-BdPjIZDy.mjs";
import { n as Button, r as PosBadge } from "./pos-Z3jXgYjo.mjs";
import { t as Textarea } from "./textarea-CyaCkn6C.mjs";
import { t as SpeakButton } from "./speak-button-DmxrY2KG.mjs";
import { t as lookupPhrase } from "./lookup-DnXkgjnh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/translate-FXYQxb7A.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function hasCjk(text) {
	return /[\u3400-\u9fff]/.test(text);
}
function TranslatePage() {
	const [text, setText] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [result, setResult] = (0, import_react.useState)(null);
	const addWord = useWordStore((s) => s.addWord);
	async function onTranslate() {
		const value = text.trim();
		if (!value) {
			toast("先輸入要翻譯的文字");
			return;
		}
		setLoading(true);
		try {
			const res = await lookupPhrase({
				data: {
					text: value,
					hint: hasCjk(value) ? "zh" : "en"
				},
				onPartial: (partial) => {
					setResult(partial);
					setLoading(false);
				}
			});
			if (!res.ok) {
				toast.error(res.error);
				setResult(null);
				return;
			}
			setResult(res);
		} catch {
			toast.error("翻譯失敗，請稍後再試");
		} finally {
			setLoading(false);
		}
	}
	function addCurrent() {
		if (!result) return;
		const isEn = result.sourceLang === "en";
		const { word, duplicated } = addWord({
			en: isEn ? result.source : result.translation,
			zh: isEn ? result.translation : result.source,
			phonetic: result.phonetic,
			pos: result.pos,
			exampleEn: result.examples[0]?.en,
			exampleZh: result.examples[0]?.zh,
			source: "translate"
		});
		toast(duplicated ? `「${word.en}」已在單字本中` : `已加入 ${word.en} · ${word.zh}`);
	}
	const englishSide = result ? result.sourceLang === "en" ? result.source : result.translation : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "mb-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-widest text-faint",
					children: "Translate"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl font-semibold tracking-tight",
					children: "翻譯"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-prose text-sm text-muted",
					children: "輸入英文或中文，取得台灣繁體、音標與例句。翻譯走公開詞典，不會用到你的 Grok 額度。"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "rounded-xl bg-surface p-4 shadow-card",
			onSubmit: (e) => {
				e.preventDefault();
				onTranslate();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					htmlFor: "translate-input",
					className: "text-sm font-medium text-ink-soft",
					children: "原文"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					id: "translate-input",
					value: text,
					onChange: (e) => setText(e.target.value),
					placeholder: "beautiful / 美麗的 / look forward to",
					className: "mt-2 min-h-32",
					maxLength: 400
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs tabular-nums text-faint",
						children: [text.trim().length, " / 400"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						disabled: loading,
						children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Languages, { className: "size-4" }), loading ? "翻譯中…" : "翻譯"]
					})]
				})
			]
		}),
		result ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-5 rounded-xl bg-surface p-5 shadow-card",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-widest text-faint",
							children: result.sourceLang === "en" ? "English → 中文" : "中文 → English"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-2xl font-semibold tracking-tight",
								children: englishSide
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpeakButton, { text: englishSide })]
						}),
						result.phonetic ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm italic text-muted",
							children: result.phonetic
						}) : null
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightLeft, { className: "mt-6 size-4 shrink-0 text-faint" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-xl text-ink-soft",
					children: result.sourceLang === "en" ? result.translation : result.source
				}),
				result.pos ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PosBadge, {
					pos: result.pos,
					className: "mt-2"
				}) : null,
				result.alternatives.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm text-muted",
					children: ["也作：", result.alternatives.join("、")]
				}) : null,
				result.examples.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-5 space-y-3 border-t border-line pt-4",
					children: result.examples.map((ex) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-base leading-snug",
						children: ex.en
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: ex.zh
					})] }, ex.en))
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					className: "mt-5",
					onClick: addCurrent,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "加入單字本"]
				})
			]
		}) : null
	] });
}
//#endregion
export { TranslatePage as component };
