import { useState } from "react";
import { toast } from "sonner";
import { Languages, LoaderCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lookupPhrase } from "@/lib/lookup";
import { formatLesson } from "@/lib/lesson";
import { useWordStore } from "@/lib/store";
import { LessonPicker } from "@/components/lesson-picker";

function hasCjk(text: string) {
  return /[\u3400-\u9fff]/.test(text);
}

export function QuickAdd({
  onManual,
  lesson,
  onLessonChange,
}: {
  onManual: (preset?: string) => void;
  lesson: number;
  onLessonChange: (n: number) => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const addWord = useWordStore((s) => s.addWord);
  const updateWord = useWordStore((s) => s.updateWord);

  async function translateAndAdd() {
    const value = text.trim();
    if (!value) {
      onManual();
      return;
    }
    setLoading(true);
    try {
      let savedId: string | null = null;
      const result = await lookupPhrase({
        data: { text: value, hint: hasCjk(value) ? "zh" : "en" },
        onPartial: (partial) => {
          const isEn = partial.sourceLang === "en";
          const payload = {
            en: isEn ? partial.source : partial.translation,
            zh: isEn ? partial.translation : partial.source,
            phonetic: partial.phonetic,
            pos: partial.pos,
            exampleEn: partial.examples[0]?.en,
            exampleZh: partial.examples[0]?.zh,
            source: "translate" as const,
            lesson,
          };
          if (!savedId) {
            const { word, duplicated } = addWord(payload);
            savedId = word.id;
            toast(duplicated ? `「${word.en}」已在單字本中` : `已加入 ${word.en} · ${word.zh}`);
            setText("");
            setLoading(false);
          } else {
            updateWord(savedId, {
              phonetic: payload.phonetic,
              pos: payload.pos,
              exampleEn: payload.exampleEn,
              exampleZh: payload.exampleZh,
            });
          }
        },
      });
      if (!result.ok) {
        toast.error(result.error);
        onManual(value);
      }
    } catch {
      toast.error("翻譯失敗，改為手動新增");
      onManual(value);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="rounded-xl bg-surface p-3 shadow-card sm:p-4"
      onSubmit={(e) => {
        e.preventDefault();
        void translateAndAdd();
      }}
    >
      <label htmlFor="quick-add" className="text-sm font-medium text-ink-soft">
        快速加入
        {lesson > 0 ? ` · ${formatLesson(lesson)}` : ""}
      </label>
      <div className="mt-2">
        <LessonPicker value={lesson} onChange={onLessonChange} />
      </div>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <Input
          id="quick-add"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="輸入英文或中文，例如 opportunity"
          autoComplete="off"
        />
        <div className="flex gap-2">
          <Button type="submit" className="flex-1 sm:flex-none" disabled={loading}>
            {loading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Languages className="size-4" />
            )}
            {loading ? "翻譯中…" : "翻譯並加入"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="flex-1 sm:flex-none"
            onClick={() => onManual(text)}
          >
            <Plus className="size-4" />
            手動
          </Button>
        </div>
      </div>
    </form>
  );
}
