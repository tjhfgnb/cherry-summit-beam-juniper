import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, Search } from "lucide-react";
import { AddWordDialog } from "@/components/add-word-dialog";
import { QuickAdd } from "@/components/quick-add";
import { WordList } from "@/components/word-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isDue } from "@/lib/srs";
import { useWordStore } from "@/lib/store";
import type { Word } from "@/lib/types";

export const Route = createFileRoute("/")({ component: Home });

function greeting() {
  const h = new Date().getHours();
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
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Word | null>(null);
  const [presetEn, setPresetEn] = useState("");
  const [lesson, setLesson] = useState(0);

  const due = words.filter((w) => isDue(w)).length;
  const mastered = words.filter((w) => w.ease >= 4).length;

  const preset = useMemo(() => {
    if (!presetEn.trim()) return undefined;
    return /[\u3400-\u9fff]/.test(presetEn) ? { zh: presetEn } : { en: presetEn };
  }, [presetEn]);

  function openManual(text?: string) {
    setEditing(null);
    setPresetEn(text?.trim() ?? "");
    setDialogOpen(true);
  }

  return (
    <div>
      <header className="mb-5">
        <p className="text-xs uppercase tracking-widest text-faint">{greeting()}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">單字本</h1>
        <p className="mt-2 max-w-prose text-sm text-muted">
          點一列圈選後，可「考這些」或「一鍵刪除」。也可依第1課、第2課分組。
        </p>
      </header>

      <dl className="mb-5 grid grid-cols-3 gap-2">
        <Stat label="單字" value={words.length} />
        <Stat label="待複習" value={due} />
        <Stat label="連續" value={stats.streak} suffix="天" />
      </dl>

      <div className="mb-3 flex flex-wrap gap-2">
        <Button asChild>
          <Link to="/practice">
            {selectedCount > 0 ? `考這 ${selectedCount} 個` : "開始練習"}
          </Link>
        </Button>
        {mastered > 0 ? (
          <p className="self-center text-sm text-muted">
            已掌握 <span className="tabular-nums text-ink">{mastered}</span> 個
          </p>
        ) : null}
      </div>

      <QuickAdd onManual={openManual} lesson={lesson} onLessonChange={setLesson} />
      <p className="mt-2 text-sm text-muted">
        要一次貼很多？到{" "}
        <Link to="/add" className="text-accent underline-offset-2 hover:underline">
          速加
        </Link>
        ，用 (n) (v) 標詞性。
      </p>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜尋英文、中文或例句"
          className="pl-10"
          autoComplete="off"
        />
      </div>

      <WordList
        query={query}
        onEdit={(word) => {
          setEditing(word);
          setPresetEn("");
          setDialogOpen(true);
        }}
      />

      {words.length < 5 ? (
        <div className="mt-6 text-center">
          <Button type="button" variant="ghost" size="sm" onClick={() => restoreSeed()}>
            <RotateCcw className="size-3.5" />
            還原起手單字
          </Button>
        </div>
      ) : null}

      <AddWordDialog
        open={dialogOpen}
        defaultLesson={lesson}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditing(null);
            setPresetEn("");
          }
        }}
        editing={editing}
        preset={preset}
      />
    </div>
  );
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-xl bg-surface px-3 py-3 shadow-card">
      <dt className="text-xs uppercase tracking-widest text-faint">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-semibold tabular-nums tracking-tight">
        {value}
        {suffix ? (
          <span className="ml-0.5 font-sans text-sm font-medium text-muted">{suffix}</span>
        ) : null}
      </dd>
    </div>
  );
}
