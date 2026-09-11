import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PosBadge } from "@/components/pos";
import { parseBulkText } from "@/lib/bulk";
import { POS_OPTIONS } from "@/lib/pos";
import { useWordStore } from "@/lib/store";

export const Route = createFileRoute("/add")({ component: BulkAddPage });

const SAMPLE = `apple (n) 蘋果
run (v) 跑
run (n) 跑步
beautiful (adj) 美麗的
quickly (adv) 很快地
look forward to (phr) 期待`;

function BulkAddPage() {
  const [text, setText] = useState("");
  const importMany = useWordStore((s) => s.importMany);
  const parsed = useMemo(() => parseBulkText(text), [text]);

  function onImport() {
    if (!parsed.groups.length) {
      toast("先貼上單字，每行一個");
      return;
    }
    const { added, merged } = importMany(
      parsed.groups.map((g) => ({
        en: g.en,
        zh: g.zh,
        pos: g.pos,
        source: "manual",
      })),
    );
    toast(
      `已加入 ${added} 個新單字` + (merged ? `，合併 ${merged} 個既有單字` : "") + "，並已圈選。",
    );
    setText("");
  }

  return (
    <div>
      <header className="mb-5">
        <p className="text-xs uppercase tracking-widest text-faint">Batch add</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">速加</h1>
        <p className="mt-2 max-w-prose text-sm text-muted">
          一次貼很多行。用括號標詞性，例如 <span className="text-ink">(n)</span>{" "}
          名詞、<span className="text-ink">(v)</span> 動詞。同一個英文會自動併成一張卡片。
        </p>
      </header>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {POS_OPTIONS.map((item) => (
          <span
            key={item.key}
            className="rounded-full bg-surface px-2.5 py-1 text-xs text-ink-soft shadow-card"
          >
            <span className="font-display">({item.key})</span> {item.zh}
          </span>
        ))}
      </div>

      <label htmlFor="bulk-input" className="text-sm font-medium text-ink-soft">
        貼上單字
      </label>
      <Textarea
        id="bulk-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={SAMPLE}
        className="mt-2 min-h-48 font-mono text-sm md:text-sm"
        spellCheck={false}
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="button" onClick={onImport} disabled={!parsed.groups.length}>
          <ListPlus className="size-4" />
          {parsed.groups.length ? `加入 ${parsed.groups.length} 個單字` : "加入單字本"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setText(SAMPLE)}
        >
          填入範例
        </Button>
        {text ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => setText("")}>
            清空
          </Button>
        ) : null}
      </div>

      {parsed.groups.length > 0 ? (
        <section className="mt-6">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            預覽 · {parsed.groups.length} 張卡片
          </h2>
          <ul className="mt-3 space-y-2">
            {parsed.groups.map((group) => (
              <li
                key={group.en}
                className="rounded-xl bg-surface px-4 py-3 shadow-card"
              >
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="font-display text-xl font-semibold tracking-tight">
                    {group.en}
                  </span>
                  {group.pos ? <PosBadge pos={group.pos} /> : null}
                  {group.count > 1 ? (
                    <span className="text-xs text-muted">合併 {group.count} 行</span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-sm text-ink-soft">{group.zh}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {parsed.skipped.length > 0 ? (
        <section className="mt-5">
          <h2 className="text-sm font-medium text-danger">無法辨識 {parsed.skipped.length} 行</h2>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {parsed.skipped.map((item, i) => (
              <li key={`${item.line}-${i}`}>
                <span className="text-ink-soft">{item.reason}</span>
                {item.line ? ` · ${item.line}` : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {parsed.groups.length > 0 ? (
        <p className="mt-6 text-sm text-muted">
          加入後會自動圈選，可到{" "}
          <Link to="/practice" className="text-accent underline-offset-2 hover:underline">
            練習
          </Link>{" "}
          直接考這些。
        </p>
      ) : null}
    </div>
  );
}
