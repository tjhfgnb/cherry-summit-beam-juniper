import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SelectCircle } from "@/components/select-circle";
import { Input } from "@/components/ui/input";
import type { Word } from "@/lib/types";
import { cn } from "@/lib/utils";

export function WordPicker({
  words,
  selectedIds,
  onToggle,
  onSelectVisible,
  onClear,
}: {
  words: Word[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onSelectVisible: (ids: string[]) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState("");
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return words;
    return words.filter(
      (w) => w.en.toLowerCase().includes(q) || w.zh.toLowerCase().includes(q),
    );
  }, [words, query]);

  const visibleIds = filtered.map((w) => w.id);
  const visibleSelected = visibleIds.filter((id) => selectedSet.has(id)).length;
  const allVisible = visibleIds.length > 0 && visibleSelected === visibleIds.length;

  return (
    <div className="overflow-hidden rounded-xl bg-surface shadow-card">
      <div className="relative border-b border-line p-2">
        <Search className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-faint" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜尋後圈選"
          className="h-10 pl-10 shadow-none"
          autoComplete="off"
        />
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <p className="text-xs text-muted tabular-nums">
          已圈 {selectedIds.length} / {words.length}
        </p>
        <div className="flex gap-1">
          {filtered.length > 0 ? (
            <button
              type="button"
              className="h-8 rounded-lg px-2 text-xs font-medium text-accent hover:bg-accent-soft/70"
              onClick={() => {
                if (allVisible) {
                  const drop = new Set(visibleIds);
                  onSelectVisible(selectedIds.filter((id) => !drop.has(id)));
                } else {
                  onSelectVisible([...new Set([...selectedIds, ...visibleIds])]);
                }
              }}
            >
              {allVisible ? "取消全選" : "全選目前"}
            </button>
          ) : null}
          {selectedIds.length > 0 ? (
            <button
              type="button"
              className="h-8 rounded-lg px-2 text-xs font-medium text-muted hover:bg-bg-warm hover:text-ink"
              onClick={onClear}
            >
              清除
            </button>
          ) : null}
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted">沒有符合的單字。</p>
      ) : (
        <ul className="max-h-64 overflow-y-auto overscroll-contain">
          {filtered.map((word) => {
            const picked = selectedSet.has(word.id);
            return (
              <li key={word.id} className="border-t border-line">
                <button
                  type="button"
                  aria-pressed={picked}
                  onClick={() => onToggle(word.id)}
                  className={cn(
                    "flex min-h-12 w-full items-center gap-3 px-3 py-2 text-left transition-colors duration-150",
                    picked ? "bg-accent-soft/60" : "hover:bg-bg-warm",
                  )}
                >
                  <SelectCircle selected={picked} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-base font-semibold tracking-tight">
                      {word.en}
                    </span>
                    <span className="block truncate text-sm text-muted">{word.zh}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
