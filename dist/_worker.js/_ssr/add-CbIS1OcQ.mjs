import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { f as ListPlus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as parseBulkText, n as useWordStore, s as POS_OPTIONS } from "./router-C0Aafbcp.mjs";
import { n as Button, r as PosBadge } from "./pos-CHniOR3Y.mjs";
import { t as Textarea } from "./textarea-Co25t2iR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/add-CbIS1OcQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SAMPLE = `apple (n) 蘋果
run (v) 跑
run (n) 跑步
beautiful (adj) 美麗的
quickly (adv) 很快地
look forward to (phr) 期待`;
function BulkAddPage() {
	const [text, setText] = (0, import_react.useState)("");
	const importMany = useWordStore((s) => s.importMany);
	const parsed = (0, import_react.useMemo)(() => parseBulkText(text), [text]);
	function onImport() {
		if (!parsed.groups.length) {
			toast("先貼上單字，每行一個");
			return;
		}
		const { added, merged } = importMany(parsed.groups.map((g) => ({
			en: g.en,
			zh: g.zh,
			pos: g.pos,
			source: "manual"
		})));
		toast(`已加入 ${added} 個新單字` + (merged ? `，合併 ${merged} 個既有單字` : "") + "，並已圈選。");
		setText("");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "mb-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-widest text-faint",
					children: "Batch add"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl font-semibold tracking-tight",
					children: "速加"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 max-w-prose text-sm text-muted",
					children: [
						"一次貼很多行。用括號標詞性，例如 ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-ink",
							children: "(n)"
						}),
						" ",
						"名詞、",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-ink",
							children: "(v)"
						}),
						" 動詞。同一個英文會自動併成一張卡片。"
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4 flex flex-wrap gap-1.5",
			children: POS_OPTIONS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "rounded-full bg-surface px-2.5 py-1 text-xs text-ink-soft shadow-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-display",
						children: [
							"(",
							item.key,
							")"
						]
					}),
					" ",
					item.zh
				]
			}, item.key))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			htmlFor: "bulk-input",
			className: "text-sm font-medium text-ink-soft",
			children: "貼上單字"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
			id: "bulk-input",
			value: text,
			onChange: (e) => setText(e.target.value),
			placeholder: SAMPLE,
			className: "mt-2 min-h-48 font-mono text-sm md:text-sm",
			spellCheck: false
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 flex flex-wrap items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					onClick: onImport,
					disabled: !parsed.groups.length,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListPlus, { className: "size-4" }), parsed.groups.length ? `加入 ${parsed.groups.length} 個單字` : "加入單字本"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "sm",
					onClick: () => setText(SAMPLE),
					children: "填入範例"
				}),
				text ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "sm",
					onClick: () => setText(""),
					children: "清空"
				}) : null
			]
		}),
		parsed.groups.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "font-display text-lg font-semibold tracking-tight",
				children: [
					"預覽 · ",
					parsed.groups.length,
					" 張卡片"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-2",
				children: parsed.groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl bg-surface px-4 py-3 shadow-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-baseline gap-x-2 gap-y-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-xl font-semibold tracking-tight",
								children: group.en
							}),
							group.pos ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PosBadge, { pos: group.pos }) : null,
							group.count > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted",
								children: [
									"合併 ",
									group.count,
									" 行"
								]
							}) : null
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-sm text-ink-soft",
						children: group.zh
					})]
				}, group.en))
			})]
		}) : null,
		parsed.skipped.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "text-sm font-medium text-danger",
				children: [
					"無法辨識 ",
					parsed.skipped.length,
					" 行"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 space-y-1 text-sm text-muted",
				children: parsed.skipped.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-ink-soft",
					children: item.reason
				}), item.line ? ` · ${item.line}` : null] }, `${item.line}-${i}`))
			})]
		}) : null,
		parsed.groups.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-6 text-sm text-muted",
			children: [
				"加入後會自動圈選，可到",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/practice",
					className: "text-accent underline-offset-2 hover:underline",
					children: "練習"
				}),
				" ",
				"直接考這些。"
			]
		}) : null
	] });
}
//#endregion
export { BulkAddPage as component };
