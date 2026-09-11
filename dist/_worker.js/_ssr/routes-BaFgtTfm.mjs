import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as Star, d as LoaderCircle, f as Languages, i as Trash2, l as Plus, o as Search, p as ChevronDown, s as RotateCcw, t as X, u as Pencil } from "../_libs/lucide-react.mjs";
import { a as DialogOverlay$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { d as isDue, f as reviewLabel, n as useWordStore, p as cn, s as canonicalizePos } from "./router-ugn03xlr.mjs";
import { a as SpeakButton, i as PosPicker, n as Button, r as PosBadge, t as Badge } from "./speak-button-CwCVNvPz.mjs";
import { n as SelectCircle, t as Input } from "./select-circle-DSGlPFSi.mjs";
import { n as lookupPhrase, t as Textarea } from "./lookup-e3FZE4tM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BaFgtTfm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-ink/40", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-1/2 top-1/2 z-50 w-[calc(100%-1.5rem)] max-w-lg -translate-x-1/2 -translate-y-1/2", "rounded-xl bg-surface p-5 shadow-card-hover max-h-[min(88dvh,720px)] overflow-y-auto", "focus:outline-none", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
		className: "absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-lg text-muted hover:bg-bg-warm hover:text-ink",
		"aria-label": "關閉",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("mb-4 pr-8", className),
		...props
	});
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("font-display text-xl font-semibold tracking-tight text-ink", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("mt-1 text-sm text-muted", className),
		...props
	});
}
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
	ref,
	className: cn("text-sm font-medium text-ink-soft", className),
	...props
}));
Label.displayName = "Label";
var empty = {
	en: "",
	zh: "",
	phonetic: "",
	pos: "",
	exampleEn: "",
	exampleZh: "",
	note: ""
};
function fromWord(word) {
	return {
		en: word.en,
		zh: word.zh,
		phonetic: word.phonetic,
		pos: word.pos,
		exampleEn: word.exampleEn,
		exampleZh: word.exampleZh,
		note: word.note
	};
}
function detectHint(en, zh) {
	if (en.trim() && !zh.trim()) return "en";
	if (zh.trim() && !en.trim()) return "zh";
	return "auto";
}
function AddWordDialog({ open, onOpenChange, editing, preset }) {
	const [draft, setDraft] = (0, import_react.useState)(empty);
	const [looking, setLooking] = (0, import_react.useState)(false);
	const addWord = useWordStore((s) => s.addWord);
	const updateWord = useWordStore((s) => s.updateWord);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		if (editing) setDraft(fromWord(editing));
		else setDraft({
			...empty,
			...preset
		});
	}, [
		open,
		editing,
		preset
	]);
	function set(key, value) {
		setDraft((d) => ({
			...d,
			[key]: value
		}));
	}
	async function onLookup() {
		const text = draft.en.trim() || draft.zh.trim();
		if (!text) {
			toast("先填英文或中文，再按翻譯");
			return;
		}
		setLooking(true);
		try {
			const result = await lookupPhrase({ data: {
				text,
				hint: detectHint(draft.en, draft.zh)
			} });
			if (!result.ok) {
				toast.error(result.error);
				return;
			}
			const isEnSource = result.sourceLang === "en";
			setDraft((d) => ({
				...d,
				en: isEnSource ? result.source : result.translation,
				zh: isEnSource ? result.translation : result.source,
				phonetic: result.phonetic || d.phonetic,
				pos: canonicalizePos(result.pos) || d.pos,
				exampleEn: result.examples[0]?.en || d.exampleEn,
				exampleZh: result.examples[0]?.zh || d.exampleZh
			}));
		} catch {
			toast.error("翻譯失敗，請稍後再試");
		} finally {
			setLooking(false);
		}
	}
	function onSave() {
		if (!draft.en.trim() || !draft.zh.trim()) {
			toast("英文與中文都需要填寫");
			return;
		}
		if (editing) {
			updateWord(editing.id, draft);
			toast("已更新單字");
		} else {
			const { duplicated, word } = addWord({
				...draft,
				source: "manual"
			});
			toast(duplicated ? `「${word.en}」已在單字本中` : `已加入 ${word.en}`);
		}
		onOpenChange(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editing ? "編輯單字" : "新增單字" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "可只填一邊，按翻譯補上另一邊；也可以兩邊都自己寫。" })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "word-en",
								children: "英文"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "word-en",
								value: draft.en,
								onChange: (e) => set("en", e.target.value),
								placeholder: "opportunity",
								autoComplete: "off"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "word-zh",
								children: "中文"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "word-zh",
								value: draft.zh,
								onChange: (e) => set("zh", e.target.value),
								placeholder: "機會",
								autoComplete: "off"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "soft",
						onClick: () => void onLookup(),
						disabled: looking,
						children: [looking ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Languages, { className: "size-4" }), looking ? "翻譯中…" : "自動翻譯"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "word-phonetic",
							children: "音標"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "word-phonetic",
							value: draft.phonetic,
							onChange: (e) => set("phonetic", e.target.value),
							placeholder: "/ˌɒpəˈtjuːnəti/",
							autoComplete: "off"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium text-ink-soft",
							children: "詞性"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PosPicker, {
							value: draft.pos,
							onChange: (pos) => set("pos", pos)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "word-ex-en",
							children: "例句（英文）"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "word-ex-en",
							value: draft.exampleEn,
							onChange: (e) => set("exampleEn", e.target.value),
							placeholder: "This is a great opportunity.",
							className: "min-h-20"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "word-ex-zh",
							children: "例句（中文）"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "word-ex-zh",
							value: draft.exampleZh,
							onChange: (e) => set("exampleZh", e.target.value),
							placeholder: "這是一個很好的機會。",
							className: "min-h-20"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "word-note",
							children: "備註"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "word-note",
							value: draft.note,
							onChange: (e) => set("note", e.target.value),
							placeholder: "自己的記憶提示",
							autoComplete: "off"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex justify-end gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					onClick: () => onOpenChange(false),
					children: "取消"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					onClick: onSave,
					children: editing ? "儲存" : "加入單字本"
				})]
			})
		] })
	});
}
function hasCjk(text) {
	return /[\u3400-\u9fff]/.test(text);
}
function QuickAdd({ onManual }) {
	const [text, setText] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const addWord = useWordStore((s) => s.addWord);
	async function translateAndAdd() {
		const value = text.trim();
		if (!value) {
			onManual();
			return;
		}
		setLoading(true);
		try {
			const result = await lookupPhrase({ data: {
				text: value,
				hint: hasCjk(value) ? "zh" : "en"
			} });
			if (!result.ok) {
				toast.error(result.error);
				onManual(value);
				return;
			}
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
			setText("");
		} catch {
			toast.error("翻譯失敗，改為手動新增");
			onManual(value);
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "rounded-xl bg-surface p-3 shadow-card sm:p-4",
		onSubmit: (e) => {
			e.preventDefault();
			translateAndAdd();
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			htmlFor: "quick-add",
			className: "text-sm font-medium text-ink-soft",
			children: "快速加入"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 flex flex-col gap-2 sm:flex-row",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				id: "quick-add",
				value: text,
				onChange: (e) => setText(e.target.value),
				placeholder: "輸入英文或中文，例如 opportunity",
				autoComplete: "off"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "submit",
					className: "flex-1 sm:flex-none",
					disabled: loading,
					children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Languages, { className: "size-4" }), loading ? "翻譯中…" : "翻譯並加入"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "secondary",
					className: "flex-1 sm:flex-none",
					onClick: () => onManual(text),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "手動"]
				})]
			})]
		})]
	});
}
function matches(word, query) {
	if (!query) return true;
	const q = query.toLowerCase();
	return word.en.toLowerCase().includes(q) || word.zh.toLowerCase().includes(q) || word.exampleEn.toLowerCase().includes(q) || word.tags.some((t) => t.toLowerCase().includes(q));
}
function WordList({ query, onEdit }) {
	const words = useWordStore((s) => s.words);
	const selectedIds = useWordStore((s) => s.selectedIds);
	const toggleStar = useWordStore((s) => s.toggleStar);
	const toggleSelected = useWordStore((s) => s.toggleSelected);
	const setSelected = useWordStore((s) => s.setSelected);
	const clearSelected = useWordStore((s) => s.clearSelected);
	const removeWord = useWordStore((s) => s.removeWord);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [openId, setOpenId] = (0, import_react.useState)(null);
	const [confirmId, setConfirmId] = (0, import_react.useState)(null);
	const selectedSet = (0, import_react.useMemo)(() => new Set(selectedIds), [selectedIds]);
	const filtered = (0, import_react.useMemo)(() => {
		return words.filter((w) => {
			if (!matches(w, query)) return false;
			if (filter === "due") return isDue(w);
			if (filter === "starred") return w.starred;
			if (filter === "new") return w.reviewCount === 0;
			if (filter === "picked") return selectedSet.has(w.id);
			return true;
		});
	}, [
		words,
		query,
		filter,
		selectedSet
	]);
	const visibleIds = filtered.map((w) => w.id);
	const visibleSelected = visibleIds.filter((id) => selectedSet.has(id)).length;
	const allVisibleSelected = visibleIds.length > 0 && visibleSelected === visibleIds.length;
	const chips = [
		{
			id: "all",
			label: `全部 ${words.length}`
		},
		{
			id: "due",
			label: "待複習"
		},
		{
			id: "picked",
			label: selectedIds.length ? `圈選 ${selectedIds.length}` : "圈選"
		},
		{
			id: "starred",
			label: "收藏"
		},
		{
			id: "new",
			label: "新單字"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("mt-6", selectedIds.length > 0 && "pb-24"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [chips.map((chip) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setFilter(chip.id),
					className: cn("h-9 rounded-full px-3 text-sm font-medium transition-colors duration-150", filter === chip.id ? "bg-accent text-accent-fg" : "bg-surface text-ink-soft shadow-card hover:bg-surface-2"),
					children: chip.label
				}, chip.id)), filtered.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						if (allVisibleSelected) {
							const drop = new Set(visibleIds);
							setSelected(selectedIds.filter((id) => !drop.has(id)));
						} else setSelected([.../* @__PURE__ */ new Set([...selectedIds, ...visibleIds])]);
					},
					className: "h-9 rounded-full px-3 text-sm font-medium text-accent hover:bg-accent-soft/70",
					children: allVisibleSelected ? "取消全選" : "全選目前"
				}) : null]
			}),
			filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 text-center text-sm text-muted",
				children: filter === "picked" ? "還沒圈選單字。點一列即可。" : "沒有符合的單字。"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-2",
				children: filtered.map((word) => {
					const open = openId === word.id;
					const picked = selectedSet.has(word.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: cn("rounded-xl bg-surface shadow-card transition-[box-shadow,background-color] duration-150", open && "shadow-card-hover", picked && "bg-accent-soft/55"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-stretch",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								"aria-pressed": picked,
								"aria-label": picked ? `取消圈選 ${word.en}` : `圈選 ${word.en}`,
								onClick: () => toggleSelected(word.id),
								className: "flex min-w-0 flex-1 items-center gap-1 py-3 pl-1.5 pr-1 text-left",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectCircle, {
									selected: picked,
									className: "mx-2 shrink-0"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "min-w-0 flex-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-start justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex flex-wrap items-center gap-x-2 gap-y-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-display text-xl font-semibold tracking-tight text-ink",
													children: word.en
												}), word.pos ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PosBadge, { pos: word.pos }) : null]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-0.5 block text-sm text-ink-soft",
												children: word.zh
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mastery, { ease: word.ease })]
									})
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-0.5 py-2 pr-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "ghost",
										size: "icon-sm",
										"aria-label": open ? "收合詳情" : "展開詳情",
										"aria-expanded": open,
										className: "text-muted",
										onClick: () => setOpenId(open ? null : word.id),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("size-4 transition-transform duration-150 ease-out-soft", open && "rotate-180") })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpeakButton, { text: word.en }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "ghost",
										size: "icon-sm",
										"aria-label": word.starred ? "取消收藏" : "收藏",
										className: word.starred ? "text-accent" : "text-muted",
										onClick: () => toggleStar(word.id),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-4", word.starred && "fill-current") })
									})
								]
							})]
						}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 border-t border-line px-4 py-3.5",
							children: [
								word.phonetic ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm italic text-muted",
									children: word.phonetic
								}) : null,
								word.exampleEn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-base leading-snug",
									children: word.exampleEn
								}), word.exampleZh ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted",
									children: word.exampleZh
								}) : null] }) : null,
								word.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-ink-soft",
									children: ["備註：", word.note]
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [word.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: tag }, tag)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-faint",
										children: reviewLabel(word.nextReviewAt)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2 pt-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "button",
										variant: "secondary",
										size: "sm",
										onClick: () => onEdit(word),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3.5" }), "編輯"]
									}), confirmId === word.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "danger",
										size: "sm",
										onClick: () => {
											removeWord(word.id);
											setConfirmId(null);
										},
										children: "確定刪除"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "button",
										variant: "ghost",
										size: "sm",
										className: "text-danger",
										onClick: () => setConfirmId(word.id),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" }), "刪除"]
									})]
								})
							]
						}) : null]
					}) }, word.id);
				})
			}),
			selectedIds.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none fixed inset-x-0 bottom-24 z-40 px-4 md:bottom-6 md:left-56",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-auto mx-auto flex max-w-3xl items-center gap-3 rounded-xl bg-ink px-3 py-2.5 text-accent-fg shadow-card-hover",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "min-w-0 flex-1 text-sm font-medium",
							children: [
								"已圈選",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums font-display text-base font-semibold",
									children: selectedIds.length
								}),
								" ",
								"個"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "sm",
							className: "text-accent-fg/80 hover:bg-accent-fg/10 hover:text-accent-fg",
							onClick: clearSelected,
							children: "清除"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "sm",
							className: "bg-accent-fg text-ink hover:bg-accent-fg/90",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/practice",
								children: "考這些"
							})
						})
					]
				})
			}) : null
		]
	});
}
function Mastery({ ease }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-1.5 flex w-16 gap-0.5",
		"aria-label": `熟練度 ${ease} / 5`,
		children: Array.from({ length: 5 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-1 flex-1 rounded-full", i < ease ? "bg-accent" : "bg-line") }, i))
	});
}
function greeting() {
	const h = (/* @__PURE__ */ new Date()).getHours();
	if (h < 5) return "夜深了";
	if (h < 11) return "早安";
	if (h < 17) return "午安";
	if (h < 22) return "晚上好";
	return "夜深了";
}
function Home() {
	const words = useWordStore((s) => s.words);
	const stats = useWordStore((s) => s.stats);
	const selectedCount = useWordStore((s) => s.selectedIds.length);
	const restoreSeed = useWordStore((s) => s.restoreSeed);
	const [query, setQuery] = (0, import_react.useState)("");
	const [dialogOpen, setDialogOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [presetEn, setPresetEn] = (0, import_react.useState)("");
	const due = words.filter((w) => isDue(w)).length;
	const mastered = words.filter((w) => w.ease >= 4).length;
	const preset = (0, import_react.useMemo)(() => {
		if (!presetEn.trim()) return void 0;
		return /[\u3400-\u9fff]/.test(presetEn) ? { zh: presetEn } : { en: presetEn };
	}, [presetEn]);
	function openManual(text) {
		setEditing(null);
		setPresetEn(text?.trim() ?? "");
		setDialogOpen(true);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "mb-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-widest text-faint",
					children: greeting()
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl font-semibold tracking-tight",
					children: "單字本"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-prose text-sm text-muted",
					children: "點一列就能圈選要考的單字，再按「考這些」。也可以翻譯或自己填。"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
			className: "mb-5 grid grid-cols-3 gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "單字",
					value: words.length
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "待複習",
					value: due
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "連續",
					value: stats.streak,
					suffix: "天"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex flex-wrap gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/practice",
					children: selectedCount > 0 ? `考這 ${selectedCount} 個` : "開始練習"
				})
			}), mastered > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "self-center text-sm text-muted",
				children: [
					"已掌握 ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums text-ink",
						children: mastered
					}),
					" 個"
				]
			}) : null]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickAdd, { onManual: openManual }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: query,
				onChange: (e) => setQuery(e.target.value),
				placeholder: "搜尋英文、中文或例句",
				className: "pl-10",
				autoComplete: "off"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WordList, {
			query,
			onEdit: (word) => {
				setEditing(word);
				setPresetEn("");
				setDialogOpen(true);
			}
		}),
		words.length < 5 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 text-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "ghost",
				size: "sm",
				onClick: () => restoreSeed(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3.5" }), "還原起手單字"]
			})
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddWordDialog, {
			open: dialogOpen,
			onOpenChange: (open) => {
				setDialogOpen(open);
				if (!open) {
					setEditing(null);
					setPresetEn("");
				}
			},
			editing,
			preset
		})
	] });
}
function Stat({ label, value, suffix }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-surface px-3 py-3 shadow-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-xs uppercase tracking-widest text-faint",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
			className: "mt-1 font-display text-2xl font-semibold tabular-nums tracking-tight",
			children: [value, suffix ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "ml-0.5 font-sans text-sm font-medium text-muted",
				children: suffix
			}) : null]
		})]
	});
}
//#endregion
export { Home as component };
