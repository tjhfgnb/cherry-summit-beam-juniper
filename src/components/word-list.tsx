import { useEffect, useMemo, useState, type PointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SelectCircle } from "@/components/select-circle";
import { SpeakButton } from "@/components/speak-button";
import { PosBadge } from "@/components/pos";
import { formatLesson, uniqueLessons } from "@/lib/lesson";
import { isDue, reviewLabel } from "@/lib/srs";
import { useWordStore } from "@/lib/store";
import type { Word } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filter = "all" | "due" | "starred" | "new" | "picked";
type LessonFilter = "all" | "none" | number;

function lessonOf(word: Word) {
  return word.lesson > 0 ? word.lesson : 0;
}

function matches(word: Word, query: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  const lesson = formatLesson(lessonOf(word)).toLowerCase();
  return (
    word.en.toLowerCase().includes(q) ||
    word.zh.toLowerCase().includes(q) ||
    word.exampleEn.toLowerCase().includes(q) ||
    word.tags.some((t) => t.toLowerCase().includes(q)) ||
    lesson.includes(q)
  );
}

export function WordList({
  query,
  onEdit,
}: {
  query: string;
  onEdit: (word: Word) => void;
}) {
  const words = useWordStore((s) => s.words);
  const selectedIds = useWordStore((s) => s.selectedIds);
  const toggleStar = useWordStore((s) => s.toggleStar);
  const toggleSelected = useWordStore((s) => s.toggleSelected);
  const setSelected = useWordStore((s) => s.setSelected);
  const clearSelected = useWordStore((s) => s.clearSelected);
  const removeWord = useWordStore((s) => s.removeWord);
  const removeMany = useWordStore((s) => s.removeMany);
  const [filter, setFilter] = useState<Filter>("all");
  const [lessonFilter, setLessonFilter] = useState<LessonFilter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [confirmLesson, setConfirmLesson] = useState<string | null>(null);

  useEffect(() => {
    setConfirmBulk(false);
  }, [selectedIds]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const lessons = useMemo(() => uniqueLessons(words.map(lessonOf)), [words]);
  const hasUngrouped = words.some((w) => lessonOf(w) === 0);

  const filtered = useMemo(() => {
    return words.filter((w) => {
      if (!matches(w, query)) return false;
      if (lessonFilter === "none" && lessonOf(w) !== 0) return false;
      if (typeof lessonFilter === "number" && lessonOf(w) !== lessonFilter) return false;
      if (filter === "due") return isDue(w);
      if (filter === "starred") return w.starred;
      if (filter === "new") return w.reviewCount === 0;
      if (filter === "picked") return selectedSet.has(w.id);
      return true;
    });
  }, [words, query, filter, lessonFilter, selectedSet]);

  const sections = useMemo(() => {
    if (lessonFilter !== "all") {
      return [{ key: "one", title: null as string | null, items: filtered }];
    }
    const map = new Map<number, Word[]>();
    for (const word of filtered) {
      const n = lessonOf(word);
      const list = map.get(n) ?? [];
      list.push(word);
      map.set(n, list);
    }
    const keys = [...map.keys()].sort((a, b) => {
      if (a === 0) return 1;
      if (b === 0) return -1;
      return a - b;
    });
    const hideTitles = keys.length <= 1 && (keys[0] ?? 0) === 0;
    return keys.map((k) => ({
      key: String(k),
      title: hideTitles ? null : formatLesson(k),
      items: map.get(k) ?? [],
    }));
  }, [filtered, lessonFilter]);

  const visibleIds = filtered.map((w) => w.id);
  const visibleSelected = visibleIds.filter((id) => selectedSet.has(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && visibleSelected === visibleIds.length;

  function pick(id: string) {
    return (e: PointerEvent<HTMLButtonElement>) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault();
      toggleSelected(id);
    };
  }

  const chips: { id: Filter; label: string }[] = [
    { id: "all", label: `全部 ${words.length}` },
    { id: "due", label: "待複習" },
    { id: "picked", label: selectedIds.length ? `圈選 ${selectedIds.length}` : "圈選" },
    { id: "starred", label: "收藏" },
    { id: "new", label: "新單字" },
  ];

  return (
    <section className={cn("mt-6", selectedIds.length > 0 && "pb-32")}>
      {lessons.length > 0 ? (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setLessonFilter("all")}
            className={cn(
              "h-9 rounded-full px-3 text-sm font-medium transition-colors duration-150",
              lessonFilter === "all"
                ? "bg-accent text-accent-fg"
                : "bg-surface text-ink-soft shadow-card hover:bg-surface-2",
            )}
          >
            各課
          </button>
          {lessons.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setLessonFilter(n)}
              className={cn(
                "h-9 rounded-full px-3 text-sm font-medium transition-colors duration-150",
                lessonFilter === n
                  ? "bg-accent text-accent-fg"
                  : "bg-surface text-ink-soft shadow-card hover:bg-surface-2",
              )}
            >
              {formatLesson(n)}
            </button>
          ))}
          {hasUngrouped && lessons.length > 0 ? (
            <button
              type="button"
              onClick={() => setLessonFilter("none")}
              className={cn(
                "h-9 rounded-full px-3 text-sm font-medium transition-colors duration-150",
                lessonFilter === "none"
                  ? "bg-accent text-accent-fg"
                  : "bg-surface text-ink-soft shadow-card hover:bg-surface-2",
              )}
            >
              未分課
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setFilter(chip.id)}
            className={cn(
              "h-9 rounded-full px-3 text-sm font-medium transition-colors duration-150",
              filter === chip.id
                ? "bg-accent text-accent-fg"
                : "bg-surface text-ink-soft shadow-card hover:bg-surface-2",
            )}
          >
            {chip.label}
          </button>
        ))}
        {filtered.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              if (allVisibleSelected) {
                const drop = new Set(visibleIds);
                setSelected(selectedIds.filter((id) => !drop.has(id)));
              } else {
                setSelected([...new Set([...selectedIds, ...visibleIds])]);
              }
            }}
            className="h-9 rounded-full px-3 text-sm font-medium text-accent hover:bg-accent-soft/70"
          >
            {allVisibleSelected
              ? "取消全選"
              : lessonFilter === "all"
                ? "全選目前"
                : `全選${typeof lessonFilter === "number" ? formatLesson(lessonFilter) : "未分課"}`}
          </button>
        ) : null}
        {filtered.length > 0 && lessonFilter !== "all" ? (
          confirmLesson === "visible" ? (
            <button
              type="button"
              className="h-9 rounded-full bg-danger px-3 text-sm font-medium text-accent-fg"
              onClick={() => {
                const n = removeMany(visibleIds);
                setConfirmLesson(null);
                toast(`已刪除 ${n} 個單字`);
              }}
            >
              確定刪除 {filtered.length} 個
            </button>
          ) : (
            <button
              type="button"
              className="h-9 rounded-full px-3 text-sm font-medium text-danger hover:bg-accent-soft/70"
              onClick={() => setConfirmLesson("visible")}
            >
              一鍵刪除
              {typeof lessonFilter === "number" ? formatLesson(lessonFilter) : "未分課"}
            </button>
          )
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted">
          {filter === "picked" ? "還沒圈選單字。點一列即可。" : "沒有符合的單字。"}
        </p>
      ) : (
        <div className="mt-4 space-y-5">
          {sections.map((section) => (
            <div key={section.key}>
              {section.title ? (
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="font-display text-lg font-semibold tracking-tight">
                    {section.title}
                    <span className="ml-2 text-sm font-sans font-medium text-muted tabular-nums">
                      {section.items.length}
                    </span>
                  </h2>
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                  <button
                    type="button"
                    className="h-9 rounded-full px-3 text-sm font-medium text-accent hover:bg-accent-soft/70"
                    onClick={() => {
                      const ids = section.items.map((w) => w.id);
                      const allOn = ids.every((id) => selectedSet.has(id));
                      if (allOn) {
                        const drop = new Set(ids);
                        setSelected(selectedIds.filter((id) => !drop.has(id)));
                      } else {
                        setSelected([...new Set([...selectedIds, ...ids])]);
                      }
                    }}
                  >
                    {section.items.every((w) => selectedSet.has(w.id)) ? "取消本課" : "圈選本課"}
                  </button>
                  {confirmLesson === section.key ? (
                    <button
                      type="button"
                      className="h-9 rounded-full bg-danger px-3 text-sm font-medium text-accent-fg"
                      onClick={() => {
                        const n = removeMany(section.items.map((w) => w.id));
                        setConfirmLesson(null);
                        toast(`已刪除 ${n} 個單字`);
                      }}
                    >
                      確定刪除本課
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="h-9 rounded-full px-3 text-sm font-medium text-danger hover:bg-accent-soft/70"
                      onClick={() => setConfirmLesson(section.key)}
                    >
                      一鍵刪除本課
                    </button>
                  )}
                  </div>
                </div>
              ) : null}
              <ul className="space-y-2">
                {section.items.map((word) => {
                  const open = openId === word.id;
                  const picked = selectedSet.has(word.id);
                  return (
                    <li key={word.id}>
                      <article
                        className={cn(
                          "rounded-xl bg-surface shadow-card transition-[box-shadow,background-color] duration-150",
                          open && "shadow-card-hover",
                          picked && "bg-accent-soft/55",
                        )}
                      >
                        <div className="flex items-stretch">
                          <button
                            type="button"
                            aria-pressed={picked}
                            aria-label={picked ? `取消圈選 ${word.en}` : `圈選 ${word.en}`}
                            onPointerDown={pick(word.id)}
                            className="flex w-14 shrink-0 items-center justify-center self-stretch rounded-l-xl active:bg-accent-soft/80"
                          >
                            <SelectCircle selected={picked} />
                          </button>
                          <button
                            type="button"
                            aria-pressed={picked}
                            onPointerDown={pick(word.id)}
                            className="flex min-w-0 flex-1 items-center py-3 pr-1 text-left select-none active:bg-accent-soft/40"
                          >
                            <span className="flex w-full min-w-0 items-start justify-between gap-3">
                              <span className="min-w-0">
                                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                  <span className="font-display text-xl font-semibold tracking-tight text-ink">
                                    {word.en}
                                  </span>
                                  {word.pos ? <PosBadge pos={word.pos} /> : null}
                                  {lessonFilter === "all" && lessonOf(word) > 0 && !section.title ? (
                                    <Badge>{formatLesson(lessonOf(word))}</Badge>
                                  ) : null}
                                </span>
                                <span className="mt-0.5 block text-sm text-ink-soft">{word.zh}</span>
                              </span>
                              <Mastery ease={word.ease} />
                            </span>
                          </button>
                          <div className="flex items-start gap-0.5 py-2 pr-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={open ? "收合詳情" : "展開詳情"}
                              aria-expanded={open}
                              className="text-muted"
                              onClick={() => setOpenId(open ? null : word.id)}
                            >
                              <ChevronDown
                                className={cn(
                                  "size-4 transition-transform duration-150 ease-out-soft",
                                  open && "rotate-180",
                                )}
                              />
                            </Button>
                            <SpeakButton text={word.en} />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={word.starred ? "取消收藏" : "收藏"}
                              className={word.starred ? "text-accent" : "text-muted"}
                              onClick={() => toggleStar(word.id)}
                            >
                              <Star className={cn("size-4", word.starred && "fill-current")} />
                            </Button>
                          </div>
                        </div>

                        {open ? (
                          <div className="space-y-3 border-t border-line px-4 py-3.5">
                            {word.phonetic ? (
                              <p className="text-sm italic text-muted">{word.phonetic}</p>
                            ) : null}
                            {word.exampleEn ? (
                              <div>
                                <p className="font-display text-base leading-snug">{word.exampleEn}</p>
                                {word.exampleZh ? (
                                  <p className="mt-1 text-sm text-muted">{word.exampleZh}</p>
                                ) : null}
                              </div>
                            ) : null}
                            {word.note ? (
                              <p className="text-sm text-ink-soft">備註：{word.note}</p>
                            ) : null}
                            <div className="flex flex-wrap items-center gap-2">
                              {lessonOf(word) > 0 ? <Badge>{formatLesson(lessonOf(word))}</Badge> : null}
                              {word.tags.map((tag) => (
                                <Badge key={tag}>{tag}</Badge>
                              ))}
                              <span className="text-xs text-faint">
                                {reviewLabel(word.nextReviewAt)}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-1">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => onEdit(word)}
                              >
                                <Pencil className="size-3.5" />
                                編輯
                              </Button>
                              {confirmId === word.id ? (
                                <Button
                                  type="button"
                                  variant="danger"
                                  size="sm"
                                  onClick={() => {
                                    removeWord(word.id);
                                    setConfirmId(null);
                                  }}
                                >
                                  確定刪除
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-danger"
                                  onClick={() => setConfirmId(word.id)}
                                >
                                  <Trash2 className="size-3.5" />
                                  刪除
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : null}
                      </article>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      {selectedIds.length > 0 ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 px-4 md:bottom-6 md:left-56">
          <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-xl bg-ink/95 px-3 py-2.5 text-accent-fg shadow-card-hover">
            <p className="min-w-0 flex-1 text-sm font-medium">
              已圈選{" "}
              <span className="tabular-nums font-display text-base font-semibold">
                {selectedIds.length}
              </span>{" "}
              個
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="pointer-events-auto text-accent-fg/80 hover:bg-accent-fg/10 hover:text-accent-fg"
              onClick={() => {
                setConfirmBulk(false);
                clearSelected();
              }}
            >
              清除
            </Button>
            {confirmBulk ? (
              <Button
                type="button"
                variant="danger"
                size="sm"
                className="pointer-events-auto"
                onClick={() => {
                  const n = removeMany(selectedIds);
                  setConfirmBulk(false);
                  toast(`已刪除 ${n} 個單字`);
                }}
              >
                確定刪除 {selectedIds.length} 個
              </Button>
            ) : (
              <Button
                type="button"
                variant="danger"
                size="sm"
                className="pointer-events-auto"
                onClick={() => setConfirmBulk(true)}
              >
                <Trash2 className="size-3.5" />
                一鍵刪除
              </Button>
            )}
            <Button asChild size="sm" className="pointer-events-auto bg-accent-fg text-ink hover:bg-accent-fg/90">
              <Link to="/practice">考這些</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Mastery({ ease }: { ease: number }) {
  return (
    <div className="mt-1.5 flex w-16 gap-0.5" aria-label={`熟練度 ${ease} / 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={cn("h-1 flex-1 rounded-full", i < ease ? "bg-accent" : "bg-line")}
        />
      ))}
    </div>
  );
}
