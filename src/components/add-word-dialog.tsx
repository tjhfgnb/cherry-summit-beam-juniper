import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Languages, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PosPicker } from "@/components/pos";
import { lookupPhrase } from "@/lib/lookup";
import { canonicalizePos } from "@/lib/pos";
import { useWordStore } from "@/lib/store";
import type { Word } from "@/lib/types";

type Draft = {
  en: string;
  zh: string;
  phonetic: string;
  pos: string;
  exampleEn: string;
  exampleZh: string;
  note: string;
};

const empty: Draft = {
  en: "",
  zh: "",
  phonetic: "",
  pos: "",
  exampleEn: "",
  exampleZh: "",
  note: "",
};

function fromWord(word: Word): Draft {
  return {
    en: word.en,
    zh: word.zh,
    phonetic: word.phonetic,
    pos: word.pos,
    exampleEn: word.exampleEn,
    exampleZh: word.exampleZh,
    note: word.note,
  };
}

function detectHint(en: string, zh: string): "en" | "zh" | "auto" {
  if (en.trim() && !zh.trim()) return "en";
  if (zh.trim() && !en.trim()) return "zh";
  return "auto";
}

export function AddWordDialog({
  open,
  onOpenChange,
  editing,
  preset,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: Word | null;
  preset?: Partial<Draft>;
}) {
  const [draft, setDraft] = useState<Draft>(empty);
  const [looking, setLooking] = useState(false);
  const addWord = useWordStore((s) => s.addWord);
  const updateWord = useWordStore((s) => s.updateWord);

  useEffect(() => {
    if (!open) return;
    if (editing) setDraft(fromWord(editing));
    else setDraft({ ...empty, ...preset });
  }, [open, editing, preset]);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function onLookup() {
    const text = draft.en.trim() || draft.zh.trim();
    if (!text) {
      toast("先填英文或中文，再按翻譯");
      return;
    }
    setLooking(true);
    try {
      const result = await lookupPhrase({
        data: { text, hint: detectHint(draft.en, draft.zh) },
        onPartial: (partial) => {
          const isEnSource = partial.sourceLang === "en";
          setDraft((d) => ({
            ...d,
            en: isEnSource ? partial.source : partial.translation,
            zh: isEnSource ? partial.translation : partial.source,
            phonetic: partial.phonetic || d.phonetic,
            pos: canonicalizePos(partial.pos) || d.pos,
            exampleEn: partial.examples[0]?.en || d.exampleEn,
            exampleZh: partial.examples[0]?.zh || d.exampleZh,
          }));
          setLooking(false);
        },
      });
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
        exampleZh: result.examples[0]?.zh || d.exampleZh,
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
      const { duplicated, word } = addWord({ ...draft, source: "manual" });
      toast(duplicated ? `「${word.en}」已在單字本中` : `已加入 ${word.en}`);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "編輯單字" : "新增單字"}</DialogTitle>
          <DialogDescription>
            可只填一邊，按翻譯補上另一邊；也可以兩邊都自己寫。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="word-en">英文</Label>
              <Input
                id="word-en"
                value={draft.en}
                onChange={(e) => set("en", e.target.value)}
                placeholder="opportunity"
                autoComplete="off"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="word-zh">中文</Label>
              <Input
                id="word-zh"
                value={draft.zh}
                onChange={(e) => set("zh", e.target.value)}
                placeholder="機會"
                autoComplete="off"
              />
            </div>
          </div>

          <Button
            type="button"
            variant="soft"
            onClick={() => void onLookup()}
            disabled={looking}
          >
            {looking ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Languages className="size-4" />
            )}
            {looking ? "翻譯中…" : "自動翻譯"}
          </Button>

          <div className="grid gap-1.5">
            <Label htmlFor="word-phonetic">音標</Label>
            <Input
              id="word-phonetic"
              value={draft.phonetic}
              onChange={(e) => set("phonetic", e.target.value)}
              placeholder="/ˌɒpəˈtjuːnəti/"
              autoComplete="off"
            />
          </div>
          <div className="grid gap-1.5">
            <p className="text-sm font-medium text-ink-soft">詞性</p>
            <PosPicker value={draft.pos} onChange={(pos) => set("pos", pos)} />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="word-ex-en">例句（英文）</Label>
            <Textarea
              id="word-ex-en"
              value={draft.exampleEn}
              onChange={(e) => set("exampleEn", e.target.value)}
              placeholder="This is a great opportunity."
              className="min-h-20"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="word-ex-zh">例句（中文）</Label>
            <Textarea
              id="word-ex-zh"
              value={draft.exampleZh}
              onChange={(e) => set("exampleZh", e.target.value)}
              placeholder="這是一個很好的機會。"
              className="min-h-20"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="word-note">備註</Label>
            <Input
              id="word-note"
              value={draft.note}
              onChange={(e) => set("note", e.target.value)}
              placeholder="自己的記憶提示"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="button" onClick={onSave}>
            {editing ? "儲存" : "加入單字本"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
