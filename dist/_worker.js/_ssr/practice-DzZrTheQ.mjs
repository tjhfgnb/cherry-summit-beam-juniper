import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { h as Check, o as Search, s as RotateCcw, t as X } from "../_libs/lucide-react.mjs";
import { a as EN_DISTRACTORS, m as cn, n as useWordStore, o as ZH_DISTRACTORS, r as isDue } from "./router-Btse5H2c.mjs";
import { t as Button } from "./button-DeGVyA2Y.mjs";
import { n as PosBadge } from "./pos-pZe7L6me.mjs";
import { t as Input } from "./input-BE3TB1oA.mjs";
import { t as SelectCircle } from "./select-circle-Bm6EsPEH.mjs";
import { t as SpeakButton } from "./speak-button-BFIXe__v.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/practice-DzZrTheQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function WordPicker({ words, selectedIds, onToggle, onSelectVisible, onClear }) {
	const [query, setQuery] = (0, import_react.useState)("");
	const selectedSet = (0, import_react.useMemo)(() => new Set(selectedIds), [selectedIds]);
	const filtered = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		if (!q) return words;
		return words.filter((w) => w.en.toLowerCase().includes(q) || w.zh.toLowerCase().includes(q));
	}, [words, query]);
	const visibleIds = filtered.map((w) => w.id);
	const visibleSelected = visibleIds.filter((id) => selectedSet.has(id)).length;
	const allVisible = visibleIds.length > 0 && visibleSelected === visibleIds.length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-hidden rounded-xl bg-surface shadow-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative border-b border-line p-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-faint" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: query,
					onChange: (e) => setQuery(e.target.value),
					placeholder: "搜尋後圈選",
					className: "h-10 pl-10 shadow-none",
					autoComplete: "off"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2 px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted tabular-nums",
					children: [
						"已圈 ",
						selectedIds.length,
						" / ",
						words.length
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-1",
					children: [filtered.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-8 rounded-lg px-2 text-xs font-medium text-accent hover:bg-accent-soft/70",
						onClick: () => {
							if (allVisible) {
								const drop = new Set(visibleIds);
								onSelectVisible(selectedIds.filter((id) => !drop.has(id)));
							} else onSelectVisible([.../* @__PURE__ */ new Set([...selectedIds, ...visibleIds])]);
						},
						children: allVisible ? "取消全選" : "全選目前"
					}) : null, selectedIds.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-8 rounded-lg px-2 text-xs font-medium text-muted hover:bg-bg-warm hover:text-ink",
						onClick: onClear,
						children: "清除"
					}) : null]
				})]
			}),
			filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-4 py-6 text-center text-sm text-muted",
				children: "沒有符合的單字。"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "max-h-64 overflow-y-auto overscroll-contain",
				children: filtered.map((word) => {
					const picked = selectedSet.has(word.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "border-t border-line",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"aria-pressed": picked,
							onPointerDown: (e) => {
								if (e.pointerType === "mouse" && e.button !== 0) return;
								e.preventDefault();
								onToggle(word.id);
							},
							className: cn("flex min-h-12 w-full items-center gap-3 px-3 py-2 text-left select-none transition-colors duration-100", picked ? "bg-accent-soft/60" : "hover:bg-bg-warm"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectCircle, { selected: picked }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate font-display text-base font-semibold tracking-tight",
									children: word.en
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate text-sm text-muted",
									children: word.zh
								})]
							})]
						})
					}, word.id);
				})
			})
		]
	});
}
function shuffle(list) {
	const next = [...list];
	for (let i = next.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[next[i], next[j]] = [next[j], next[i]];
	}
	return next;
}
function pickDeck(words, count, wordIds) {
	if (wordIds && wordIds.length > 0) {
		const allow = new Set(wordIds);
		const picked = words.filter((w) => allow.has(w.id));
		return shuffle(picked).slice(0, Math.min(count, picked.length));
	}
	const due = shuffle(words.filter(isDue));
	const rest = shuffle(words.filter((w) => !isDue(w)));
	return [...due, ...rest].slice(0, count);
}
function quizOptions(word, all, direction) {
	const correct = direction === "en-zh" ? word.zh : word.en;
	const pool = all.filter((w) => w.id !== word.id).map((w) => direction === "en-zh" ? w.zh : w.en);
	const extras = direction === "en-zh" ? ZH_DISTRACTORS : EN_DISTRACTORS;
	return shuffle([correct, ...shuffle(Array.from(/* @__PURE__ */ new Set([...pool, ...extras])).filter((x) => x !== correct)).slice(0, 3)]);
}
function PracticeSession({ mode, direction, count, wordIds, onExit, onAgain }) {
	const recordReview = useWordStore((s) => s.recordReview);
	const markPracticedToday = useWordStore((s) => s.markPracticedToday);
	const [deck] = (0, import_react.useState)(() => pickDeck(useWordStore.getState().words, count, wordIds));
	const [index, setIndex] = (0, import_react.useState)(0);
	const [flipped, setFlipped] = (0, import_react.useState)(false);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [typed, setTyped] = (0, import_react.useState)("");
	const [checked, setChecked] = (0, import_react.useState)(false);
	const [missed, setMissed] = (0, import_react.useState)([]);
	const [done, setDone] = (0, import_react.useState)(false);
	const timerRef = (0, import_react.useRef)(null);
	const word = deck[index];
	const options = (0, import_react.useMemo)(() => word && mode === "quiz" ? quizOptions(word, useWordStore.getState().words, direction) : [], [
		word,
		direction,
		mode
	]);
	(0, import_react.useEffect)(() => {
		if (deck.length === 0) return;
		markPracticedToday();
	}, [deck.length, markPracticedToday]);
	(0, import_react.useEffect)(() => {
		return () => {
			if (timerRef.current) window.clearTimeout(timerRef.current);
		};
	}, []);
	function grade(quality, miss = quality === 0) {
		if (!word) return;
		recordReview(word.id, quality);
		if (miss) setMissed((m) => [...m, word]);
		if (index + 1 >= deck.length) {
			setDone(true);
			return;
		}
		setIndex((i) => i + 1);
		setFlipped(false);
		setSelected(null);
		setTyped("");
		setChecked(false);
	}
	const gradeRef = (0, import_react.useRef)(grade);
	gradeRef.current = grade;
	(0, import_react.useEffect)(() => {
		function onKey(e) {
			if (mode !== "flash" || !word || done) return;
			if (e.key === " " || e.key === "Enter") {
				e.preventDefault();
				setFlipped(true);
			}
			if (!flipped) return;
			if (e.key === "1") gradeRef.current(0);
			if (e.key === "2") gradeRef.current(1);
			if (e.key === "3") gradeRef.current(2);
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		mode,
		word,
		done,
		flipped
	]);
	if (deck.length === 0 || !word) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPractice, { onExit });
	if (done) {
		const correct = deck.length - missed.length;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl bg-surface px-5 py-8 text-center shadow-card",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-widest text-faint",
					children: "本輪結束"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 font-display text-4xl font-semibold tabular-nums tracking-tight",
					children: [correct, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xl text-muted",
						children: [" / ", deck.length]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "答對題數"
				}),
				missed.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mx-auto mt-6 max-w-sm space-y-2 text-left",
					children: missed.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-lg bg-bg px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display font-semibold",
							children: w.en
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: w.zh
						})]
					}, w.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-sm text-ok",
					children: "這一輪都很穩。"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex flex-col justify-center gap-2 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: onAgain,
						children: "再練一次"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: onExit,
						children: "回練習"
					})]
				})
			]
		});
	}
	const prompt = direction === "en-zh" ? word.en : word.zh;
	const answer = direction === "en-zh" ? word.zh : word.en;
	const progress = (index + 1) / deck.length * 100;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted tabular-nums",
				children: [
					index + 1,
					" / ",
					deck.length
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "ghost",
				size: "sm",
				onClick: onExit,
				children: "結束"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-5 h-1 overflow-hidden rounded-full bg-line",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-full rounded-full bg-accent transition-[width] duration-200",
				style: { width: `${progress}%` }
			})
		}),
		mode === "flash" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "session-swap",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlashCard, {
				word,
				prompt,
				answer,
				direction,
				flipped,
				onFlip: () => setFlipped(true),
				onGrade: grade
			})
		}, word.id) : null,
		mode === "quiz" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "session-swap",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuizCard, {
				word,
				prompt,
				answer,
				direction,
				options,
				selected,
				onSelect: (choice) => {
					if (selected) return;
					setSelected(choice);
					const ok = choice === answer;
					if (timerRef.current) window.clearTimeout(timerRef.current);
					timerRef.current = window.setTimeout(() => grade(ok ? 2 : 0, !ok), 280);
				}
			})
		}, word.id) : null,
		mode === "spell" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "session-swap",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpellCard, {
				word,
				typed,
				checked,
				onTyped: setTyped,
				onCheck: () => {
					const ok = typed.trim().toLowerCase() === word.en.toLowerCase();
					setChecked(true);
					if (timerRef.current) window.clearTimeout(timerRef.current);
					timerRef.current = window.setTimeout(() => grade(ok ? 2 : 0, !ok), ok ? 320 : 700);
				}
			})
		}, word.id) : null
	] });
}
function EmptyPractice({ onExit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-surface px-5 py-10 text-center shadow-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-xl font-semibold",
				children: "還沒有單字可練"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "先到單字本加入幾個單字。"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-6",
				onClick: onExit,
				children: "返回"
			})
		]
	});
}
function FlashCard({ word, prompt, answer, direction, flipped, onFlip, onGrade }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: onFlip,
			className: "block w-full text-left",
			"aria-label": flipped ? "已翻開" : "點擊看答案",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative min-h-56 [perspective:900px]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("flip-inner relative min-h-56 rounded-xl bg-surface px-6 py-8 shadow-card transition-transform duration-200", "ease-out-soft [transform-style:preserve-3d]", flipped && "[transform:rotateY(180deg)]"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-0 flex flex-col items-center justify-center px-6 [backface-visibility:hidden]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-widest text-faint",
								children: direction === "en-zh" ? "English" : "中文"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: cn("mt-3 text-center text-3xl font-semibold tracking-tight", direction === "en-zh" ? "font-display" : "font-sans"),
								children: prompt
							}),
							word.pos ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PosBadge, {
								pos: word.pos,
								className: "mt-3 justify-center"
							}) : null,
							direction === "en-zh" && word.phonetic ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm italic text-muted",
								children: word.phonetic
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-6 text-sm text-faint",
								children: "點卡片看答案"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-0 flex flex-col items-center justify-center px-6 [backface-visibility:hidden] [transform:rotateY(180deg)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-widest text-faint",
								children: "答案"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: cn("mt-3 text-center text-3xl font-semibold tracking-tight", direction === "zh-en" ? "font-display" : "font-sans"),
								children: answer
							}),
							word.exampleEn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 max-w-sm text-center text-sm text-muted",
								children: word.exampleEn
							}) : null
						]
					})]
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute right-3 top-3 z-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpeakButton, { text: word.en })
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("mt-4 grid grid-cols-3 gap-2", !flipped && "pointer-events-none opacity-40"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "secondary",
				onClick: () => onGrade(0),
				children: "不熟"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				onClick: () => onGrade(1),
				children: "還可以"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				onClick: () => onGrade(2),
				children: "記住了"
			})
		]
	})] });
}
function QuizCard({ word, prompt, answer, direction, options, selected, onSelect }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-surface px-5 py-7 shadow-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-widest text-faint",
					children: "選出正確意思"
				}), direction === "en-zh" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpeakButton, { text: word.en }) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-3 text-3xl font-semibold tracking-tight", direction === "en-zh" ? "font-display" : "font-sans"),
				children: prompt
			}),
			word.pos ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PosBadge, {
				pos: word.pos,
				className: "mt-2"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid gap-2",
				children: options.map((choice) => {
					const isCorrect = choice === answer;
					const isPick = selected === choice;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: selected !== null,
						onClick: () => onSelect(choice),
						className: cn("flex min-h-12 items-center justify-between rounded-xl px-4 py-3 text-left text-sm shadow-card transition-colors duration-150", selected === null && "bg-bg hover:bg-accent-soft/60", selected !== null && isCorrect && "bg-accent-soft text-accent", selected !== null && isPick && !isCorrect && "bg-danger/10 text-danger", selected !== null && !isPick && !isCorrect && "bg-bg text-muted"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn(direction === "zh-en" && "font-display text-base"),
								children: choice
							}),
							selected !== null && isCorrect ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : null,
							selected !== null && isPick && !isCorrect ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }) : null
						]
					}, choice);
				})
			})
		]
	});
}
function SpellCard({ word, typed, checked, onTyped, onCheck }) {
	const ok = typed.trim().toLowerCase() === word.en.toLowerCase();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "rounded-xl bg-surface px-5 py-7 shadow-card",
		onSubmit: (e) => {
			e.preventDefault();
			if (!checked && typed.trim()) onCheck();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-widest text-faint",
				children: "依中文拼出英文"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-3xl font-semibold tracking-tight",
				children: word.zh
			}),
			word.pos ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PosBadge, {
				pos: word.pos,
				className: "mt-2"
			}) : null,
			word.exampleZh ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: word.exampleZh
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "mt-6 font-display text-lg",
				value: typed,
				onChange: (e) => onTyped(e.target.value),
				placeholder: "輸入英文",
				autoComplete: "off",
				autoCapitalize: "off",
				spellCheck: false,
				disabled: checked,
				autoFocus: true
			}),
			checked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-3 text-sm", ok ? "text-ok" : "text-danger"),
				children: ok ? "正確" : `正確拼法：${word.en}`
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				className: "mt-4 w-full",
				disabled: !typed.trim(),
				children: "檢查"
			})
		]
	});
}
function PracticeIntro({ onStart }) {
	const words = useWordStore((s) => s.words);
	const selectedIds = useWordStore((s) => s.selectedIds);
	const toggleSelected = useWordStore((s) => s.toggleSelected);
	const setSelected = useWordStore((s) => s.setSelected);
	const clearSelected = useWordStore((s) => s.clearSelected);
	const restoreSeed = useWordStore((s) => s.restoreSeed);
	const dueWords = words.filter(isDue);
	const selectedWords = words.filter((w) => selectedIds.includes(w.id));
	const [mode, setMode] = (0, import_react.useState)("flash");
	const [direction, setDirection] = (0, import_react.useState)("en-zh");
	const [pool, setPool] = (0, import_react.useState)(selectedIds.length > 0 ? "selected" : dueWords.length > 0 ? "due" : "all");
	const [count, setCount] = (0, import_react.useState)(() => selectedIds.length > 0 ? selectedIds.length : Math.min(10, words.length || 10));
	const poolWords = pool === "selected" ? selectedWords : pool === "due" ? dueWords : words;
	const size = Math.min(count, Math.max(poolWords.length, 1));
	const poolIds = poolWords.map((w) => w.id);
	function start() {
		if (poolWords.length === 0) return;
		onStart({
			mode,
			direction: mode === "spell" ? "zh-en" : direction,
			count: size,
			wordIds: poolIds.slice(0, size)
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: words.length > 0 ? "pb-28" : void 0,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-widest text-faint",
				children: "Practice"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-display text-3xl font-semibold tracking-tight",
				children: "練習"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: selectedIds.length > 0 ? `已圈選 ${selectedIds.length} 個。選方式後就能開始，也可在下面增減。` : "先圈選要考的單字，或用待複習／全部。"
			})
		] }), words.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 rounded-xl bg-surface px-5 py-8 text-center shadow-card",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg font-semibold",
					children: "單字本是空的"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "加入單字，或還原內建的 18 個起手式。"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "mt-5",
					onClick: () => restoreSeed(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "還原起手單字"]
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid gap-2 sm:grid-cols-3",
				children: [
					{
						id: "flash",
						title: "閃卡",
						blurb: "翻面回想意思"
					},
					{
						id: "quiz",
						title: "選擇題",
						blurb: "四選一快速測"
					},
					{
						id: "spell",
						title: "拼寫",
						blurb: "看中文寫英文"
					}
				].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setMode(item.id),
					className: cn("rounded-xl px-4 py-4 text-left shadow-card transition-colors duration-150", mode === item.id ? "bg-accent text-accent-fg" : "bg-surface hover:bg-surface-2"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-lg font-semibold",
						children: item.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("mt-1 text-sm", mode === item.id ? "text-accent-fg/80" : "text-muted"),
						children: item.blurb
					})]
				}, item.id))
			}),
			mode !== "spell" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-ink-soft",
					children: "方向"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setDirection("en-zh"),
						className: cn("h-11 rounded-xl text-sm font-medium shadow-card", direction === "en-zh" ? "bg-accent text-accent-fg" : "bg-surface"),
						children: "英 → 中"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setDirection("zh-en"),
						className: cn("h-11 rounded-xl text-sm font-medium shadow-card", direction === "zh-en" ? "bg-accent text-accent-fg" : "bg-surface"),
						children: "中 → 英"
					})]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-ink-soft",
					children: "範圍"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 grid grid-cols-3 gap-2",
					children: [
						{
							id: "selected",
							title: "圈選",
							n: selectedWords.length,
							enable: true
						},
						{
							id: "due",
							title: "待複習",
							n: dueWords.length,
							enable: dueWords.length > 0
						},
						{
							id: "all",
							title: "全部",
							n: words.length,
							enable: words.length > 0
						}
					].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: !item.enable,
						onClick: () => {
							setPool(item.id);
							setCount(item.id === "selected" ? Math.max(item.n, 1) : item.n || 10);
						},
						className: cn("rounded-xl px-3 py-3 text-left shadow-card transition-colors duration-150 disabled:opacity-40", pool === item.id ? "bg-accent text-accent-fg" : "bg-surface hover:bg-surface-2"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: item.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: cn("mt-0.5 font-display text-xl font-semibold tabular-nums tracking-tight", pool === item.id ? "text-accent-fg" : "text-ink"),
							children: item.n
						})]
					}, item.id))
				})]
			}),
			pool === "selected" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WordPicker, {
					words,
					selectedIds,
					onToggle: toggleSelected,
					onSelectVisible: setSelected,
					onClear: clearSelected
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-ink-soft",
					children: "題數"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex flex-wrap gap-2",
					children: [
						5,
						10,
						15,
						poolWords.length
					].filter((n, i, arr) => n > 0 && arr.indexOf(n) === i).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setCount(n),
						className: cn("h-11 min-w-14 rounded-xl px-3 text-sm font-medium tabular-nums shadow-card", count === n ? "bg-accent text-accent-fg" : "bg-surface"),
						children: n === poolWords.length ? "全部" : n
					}, n))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none fixed inset-x-0 bottom-20 z-40 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur-sm md:bottom-0 md:left-56",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-auto mx-auto max-w-3xl",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						size: "lg",
						disabled: poolWords.length === 0,
						onClick: start,
						children: pool === "selected" ? selectedWords.length ? `開始考 ${selectedWords.length} 個` : "先圈選單字" : "開始練習"
					})
				})
			})
		] })]
	});
}
function PracticePage() {
	const [session, setSession] = (0, import_react.useState)(null);
	const [run, setRun] = (0, import_react.useState)(0);
	if (session) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PracticeSession, {
		mode: session.mode,
		direction: session.direction,
		count: session.count,
		wordIds: session.wordIds,
		onExit: () => setSession(null),
		onAgain: () => setRun((n) => n + 1)
	}, `${run}-${session.mode}-${session.wordIds?.join(",") ?? session.count}`);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PracticeIntro, { onStart: setSession });
}
//#endregion
export { PracticePage as component };
