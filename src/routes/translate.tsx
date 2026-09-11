import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowRightLeft, Languages, LoaderCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SpeakButton } from "@/components/speak-button";
import { PosBadge } from "@/components/pos";
import { lookupPhrase } from "@/lib/lookup";
import { useWordStore } from "@/lib/store";
import type { LookupOk } from "@/lib/types";

export const Route = createFileRoute("/translate")({ component: TranslatePage });

function hasCjk(text: string) {
  return /[\u3400-\u9fff]/.test(text);
}

function TranslatePage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupOk | null>(null);
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
        data: { text: value, hint: hasCjk(value) ? "zh" : "en" },
        onPartial: (partial) => {
          setResult(partial);
          setLoading(false);
        },
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
      source: "translate",
    });
    toast(duplicated ? `「${word.en}」已在單字本中` : `已加入 ${word.en} · ${word.zh}`);
  }

  const englishSide = result
    ? result.sourceLang === "en"
      ? result.source
      : result.translation
    : "";

  return (
    <div>
      <header className="mb-5">
        <p className="text-xs uppercase tracking-widest text-faint">Translate</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">翻譯</h1>
        <p className="mt-2 max-w-prose text-sm text-muted">
          輸入英文或中文，取得台灣繁體、音標與例句。翻譯走公開詞典，不會用到你的 Grok 額度。
        </p>
      </header>

      <form
        className="rounded-xl bg-surface p-4 shadow-card"
        onSubmit={(e) => {
          e.preventDefault();
          void onTranslate();
        }}
      >
        <label htmlFor="translate-input" className="text-sm font-medium text-ink-soft">
          原文
        </label>
        <Textarea
          id="translate-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="beautiful / 美麗的 / look forward to"
          className="mt-2 min-h-32"
          maxLength={400}
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs tabular-nums text-faint">{text.trim().length} / 400</p>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Languages className="size-4" />
            )}
            {loading ? "翻譯中…" : "翻譯"}
          </Button>
        </div>
      </form>

      {result ? (
        <section className="mt-5 rounded-xl bg-surface p-5 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-faint">
                {result.sourceLang === "en" ? "English → 中文" : "中文 → English"}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <p className="font-display text-2xl font-semibold tracking-tight">{englishSide}</p>
                <SpeakButton text={englishSide} />
              </div>
              {result.phonetic ? (
                <p className="mt-1 text-sm italic text-muted">{result.phonetic}</p>
              ) : null}
            </div>
            <ArrowRightLeft className="mt-6 size-4 shrink-0 text-faint" />
          </div>

          <p className="mt-4 text-xl text-ink-soft">
            {result.sourceLang === "en" ? result.translation : result.source}
          </p>
          {result.pos ? <PosBadge pos={result.pos} className="mt-2" /> : null}

          {result.alternatives.length > 0 ? (
            <p className="mt-3 text-sm text-muted">也作：{result.alternatives.join("、")}</p>
          ) : null}

          {result.examples.length > 0 ? (
            <ul className="mt-5 space-y-3 border-t border-line pt-4">
              {result.examples.map((ex) => (
                <li key={ex.en}>
                  <p className="font-display text-base leading-snug">{ex.en}</p>
                  <p className="mt-1 text-sm text-muted">{ex.zh}</p>
                </li>
              ))}
            </ul>
          ) : null}

          <Button type="button" className="mt-5" onClick={addCurrent}>
            <Plus className="size-4" />
            加入單字本
          </Button>
        </section>
      ) : null}
    </div>
  );
}
