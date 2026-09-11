import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Pencil, Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SelectCircle } from "@/components/select-circle";
import { SpeakButton } from "@/components/speak-button";
import { PosBadge } from "@/components/pos";
import { isDue, reviewLabel } from "@/lib/srs";
import { useWordStore } from "@/lib/store";
import type { Word } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filter = "all" | "due" | "starred" | "new" | "picked";

function matches(word: Word, query: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    word.en.toLowerCase().includes(q) ||
    word.zh.toLowerCase().includes(q) ||
    word.exampleEn.toLowerCase().includes(q) ||
    word.tags.some((t) => t.toLowerCase().includes(q))
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
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const filtered = useMemo(() => {
    return words.filter((w) => {
      if (!matches(w, query)) return false;
      if (filter === "due") return isDue(w);
      if (filter === "starred") return w.starred;
      if (filter === "new") return w.reviewCount === 0;
      if (filter === "picked") return selectedSet.has(w.id);
      return true;
    });
  }, [words, query, filter, selectedSet]);

  const visibleIds = filtered.map((w) => w.id);
  const visibleSelected = visibleIds.filter((id) => selectedSet.has(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && visibleSelected === visibleIds.length;

  const chips: { id: Filter; label: string }[] = [
    { id: "all", label: `全部 ${words.length}` },
    { id: "due", label: "待複習" },
    { id: "picked", label: selectedIds.length ? `圈選 ${selectedIds.length}` : "圈選" },
    { id: "starred", label: "收藏" },
    { id: "new", label: "新單字" },
  ];

  return (
    <section className={cn("mt-6", selectedIds.length > 0 && "pb-24")}>
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
            {allVisibleSelected ? "取消全選" : "全選目前"}
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted">
          {filter === "picked" ? "還沒圈選單字。點一列即可。" : "沒有符合的單字。"}
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {filtered.map((word) => {
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
                      onClick={() => toggleSelected(word.id)}
                      className="flex min-w-0 flex-1 items-center gap-1 py-3 pl-1.5 pr-1 text-left"
                    >
                      <SelectCircle selected={picked} className="mx-2 shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-3">
                          <span className="min-w-0">
                            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="font-display text-xl font-semibold tracking-tight text-ink">
                                {word.en}
                              </span>
                              {word.pos ? <PosBadge pos={word.pos} /> : null}
                            </span>
                            <span className="mt-0.5 block text-sm text-ink-soft">{word.zh}</span>
                          </span>
                          <Mastery ease={word.ease} />
                        </span>
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
      )}

      {selectedIds.length > 0 ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 px-4 md:bottom-6 md:left-56">
          <div className="pointer-events-auto mx-auto flex max-w-3xl items-center gap-3 rounded-xl bg-ink px-3 py-2.5 text-accent-fg shadow-card-hover">
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
              className="text-accent-fg/80 hover:bg-accent-fg/10 hover:text-accent-fg"
              onClick={clearSelected}
            >
              清除
            </Button>
            <Button asChild size="sm" className="bg-accent-fg text-ink hover:bg-accent-fg/90">
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
