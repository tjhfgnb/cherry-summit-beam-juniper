import { useEffect, useMemo, useRef, useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SpeakButton } from "@/components/speak-button";
import { PosBadge } from "@/components/pos";
import { WordPicker } from "@/components/word-picker";
import { EN_DISTRACTORS, ZH_DISTRACTORS } from "@/lib/seed-words";
import { isDue, type Quality } from "@/lib/srs";
import { useWordStore } from "@/lib/store";
import type { Word } from "@/lib/types";
import { cn } from "@/lib/utils";

export type PracticeMode = "flash" | "quiz" | "spell";
export type Direction = "en-zh" | "zh-en";

function shuffle<T>(list: T[]) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

function pickDeck(words: Word[], count: number, wordIds?: string[]) {
  if (wordIds && wordIds.length > 0) {
    const allow = new Set(wordIds);
    const picked = words.filter((w) => allow.has(w.id));
    return shuffle(picked).slice(0, Math.min(count, picked.length));
  }
  const due = shuffle(words.filter(isDue));
  const rest = shuffle(words.filter((w) => !isDue(w)));
  return [...due, ...rest].slice(0, count);
}

function quizOptions(word: Word, all: Word[], direction: Direction) {
  const correct = direction === "en-zh" ? word.zh : word.en;
  const pool = all
    .filter((w) => w.id !== word.id)
    .map((w) => (direction === "en-zh" ? w.zh : w.en));
  const extras = direction === "en-zh" ? ZH_DISTRACTORS : EN_DISTRACTORS;
  const unique = Array.from(new Set([...pool, ...extras])).filter((x) => x !== correct);
  const distractors = shuffle(unique).slice(0, 3);
  return shuffle([correct, ...distractors]);
}

export function PracticeSession({
  mode,
  direction,
  count,
  wordIds,
  onExit,
  onAgain,
}: {
  mode: PracticeMode;
  direction: Direction;
  count: number;
  wordIds?: string[];
  onExit: () => void;
  onAgain: () => void;
}) {
  const recordReview = useWordStore((s) => s.recordReview);
  const markPracticedToday = useWordStore((s) => s.markPracticedToday);

  const [deck] = useState(() =>
    pickDeck(useWordStore.getState().words, count, wordIds),
  );
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [checked, setChecked] = useState(false);
  const [missed, setMissed] = useState<Word[]>([]);
  const [done, setDone] = useState(false);
  const timerRef = useRef<number | null>(null);

  const word = deck[index];
  const options = useMemo(
    () =>
      word && mode === "quiz"
        ? quizOptions(word, useWordStore.getState().words, direction)
        : [],
    [word, direction, mode],
  );

  useEffect(() => {
    if (deck.length === 0) return;
    markPracticedToday();
  }, [deck.length, markPracticedToday]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  function grade(quality: Quality, miss = quality === 0) {
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

  const gradeRef = useRef(grade);
  gradeRef.current = grade;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
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
  }, [mode, word, done, flipped]);

  if (deck.length === 0 || !word) {
    return <EmptyPractice onExit={onExit} />;
  }

  if (done) {
    const correct = deck.length - missed.length;
    return (
      <div className="rounded-xl bg-surface px-5 py-8 text-center shadow-card">
        <p className="text-xs uppercase tracking-widest text-faint">本輪結束</p>
        <p className="mt-2 font-display text-4xl font-semibold tabular-nums tracking-tight">
          {correct}
          <span className="text-xl text-muted"> / {deck.length}</span>
        </p>
        <p className="mt-2 text-sm text-muted">答對題數</p>
        {missed.length > 0 ? (
          <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left">
            {missed.map((w) => (
              <li key={w.id} className="rounded-lg bg-bg px-3 py-2">
                <p className="font-display font-semibold">{w.en}</p>
                <p className="text-sm text-muted">{w.zh}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-sm text-ok">這一輪都很穩。</p>
        )}
        <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
          <Button onClick={onAgain}>再練一次</Button>
          <Button variant="secondary" onClick={onExit}>
            回練習
          </Button>
        </div>
      </div>
    );
  }

  const prompt = direction === "en-zh" ? word.en : word.zh;
  const answer = direction === "en-zh" ? word.zh : word.en;
  const progress = ((index + 1) / deck.length) * 100;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted tabular-nums">
          {index + 1} / {deck.length}
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={onExit}>
          結束
        </Button>
      </div>
      <div className="mb-5 h-1 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      {mode === "flash" ? (
        <div key={word.id} className="session-swap">
          <FlashCard
            word={word}
            prompt={prompt}
            answer={answer}
            direction={direction}
            flipped={flipped}
            onFlip={() => setFlipped(true)}
            onGrade={grade}
          />
        </div>
      ) : null}

      {mode === "quiz" ? (
        <div key={word.id} className="session-swap">
          <QuizCard
            word={word}
            prompt={prompt}
            answer={answer}
            direction={direction}
            options={options}
            selected={selected}
            onSelect={(choice) => {
              if (selected) return;
              setSelected(choice);
              const ok = choice === answer;
              if (timerRef.current) window.clearTimeout(timerRef.current);
              timerRef.current = window.setTimeout(() => grade(ok ? 2 : 0, !ok), 280);
            }}
          />
        </div>
      ) : null}

      {mode === "spell" ? (
        <div key={word.id} className="session-swap">
          <SpellCard
            word={word}
            typed={typed}
            checked={checked}
            onTyped={setTyped}
            onCheck={() => {
              const ok = typed.trim().toLowerCase() === word.en.toLowerCase();
              setChecked(true);
              if (timerRef.current) window.clearTimeout(timerRef.current);
              timerRef.current = window.setTimeout(() => grade(ok ? 2 : 0, !ok), ok ? 320 : 700);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function EmptyPractice({ onExit }: { onExit: () => void }) {
  return (
    <div className="rounded-xl bg-surface px-5 py-10 text-center shadow-card">
      <p className="font-display text-xl font-semibold">還沒有單字可練</p>
      <p className="mt-2 text-sm text-muted">先到單字本加入幾個單字。</p>
      <Button className="mt-6" onClick={onExit}>
        返回
      </Button>
    </div>
  );
}

function FlashCard({
  word,
  prompt,
  answer,
  direction,
  flipped,
  onFlip,
  onGrade,
}: {
  word: Word;
  prompt: string;
  answer: string;
  direction: Direction;
  flipped: boolean;
  onFlip: () => void;
  onGrade: (q: Quality) => void;
}) {
  return (
    <div>
      <div className="relative">
        <button
          type="button"
          onClick={onFlip}
          className="block w-full text-left"
          aria-label={flipped ? "已翻開" : "點擊看答案"}
        >
          <div className="relative min-h-56 [perspective:900px]">
            <div
              className={cn(
                "flip-inner relative min-h-56 rounded-xl bg-surface px-6 py-8 shadow-card transition-transform duration-200",
                "ease-out-soft [transform-style:preserve-3d]",
                flipped && "[transform:rotateY(180deg)]",
              )}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 [backface-visibility:hidden]">
                <p className="text-xs uppercase tracking-widest text-faint">
                  {direction === "en-zh" ? "English" : "中文"}
                </p>
                <p
                  className={cn(
                    "mt-3 text-center text-3xl font-semibold tracking-tight",
                    direction === "en-zh" ? "font-display" : "font-sans",
                  )}
                >
                  {prompt}
                </p>
                {word.pos ? <PosBadge pos={word.pos} className="mt-3 justify-center" /> : null}
                {direction === "en-zh" && word.phonetic ? (
                  <p className="mt-3 text-sm italic text-muted">{word.phonetic}</p>
                ) : null}
                <p className="mt-6 text-sm text-faint">點卡片看答案</p>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <p className="text-xs uppercase tracking-widest text-faint">答案</p>
                <p
                  className={cn(
                    "mt-3 text-center text-3xl font-semibold tracking-tight",
                    direction === "zh-en" ? "font-display" : "font-sans",
                  )}
                >
                  {answer}
                </p>
                {word.exampleEn ? (
                  <p className="mt-4 max-w-sm text-center text-sm text-muted">
                    {word.exampleEn}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </button>
        <div className="absolute right-3 top-3 z-10">
          <SpeakButton text={word.en} />
        </div>
      </div>

      <div className={cn("mt-4 grid grid-cols-3 gap-2", !flipped && "pointer-events-none opacity-40")}>
        <Button type="button" variant="secondary" onClick={() => onGrade(0)}>
          不熟
        </Button>
        <Button type="button" variant="outline" onClick={() => onGrade(1)}>
          還可以
        </Button>
        <Button type="button" onClick={() => onGrade(2)}>
          記住了
        </Button>
      </div>
    </div>
  );
}

function QuizCard({
  word,
  prompt,
  answer,
  direction,
  options,
  selected,
  onSelect,
}: {
  word: Word;
  prompt: string;
  answer: string;
  direction: Direction;
  options: string[];
  selected: string | null;
  onSelect: (choice: string) => void;
}) {
  return (
    <div className="rounded-xl bg-surface px-5 py-7 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs uppercase tracking-widest text-faint">選出正確意思</p>
        {direction === "en-zh" ? <SpeakButton text={word.en} /> : null}
      </div>
      <p
        className={cn(
          "mt-3 text-3xl font-semibold tracking-tight",
          direction === "en-zh" ? "font-display" : "font-sans",
        )}
      >
        {prompt}
      </p>
      {word.pos ? <PosBadge pos={word.pos} className="mt-2" /> : null}
      <div className="mt-6 grid gap-2">
        {options.map((choice) => {
          const isCorrect = choice === answer;
          const isPick = selected === choice;
          return (
            <button
              key={choice}
              type="button"
              disabled={selected !== null}
              onClick={() => onSelect(choice)}
              className={cn(
                "flex min-h-12 items-center justify-between rounded-xl px-4 py-3 text-left text-sm shadow-card transition-colors duration-150",
                selected === null && "bg-bg hover:bg-accent-soft/60",
                selected !== null && isCorrect && "bg-accent-soft text-accent",
                selected !== null && isPick && !isCorrect && "bg-danger/10 text-danger",
                selected !== null && !isPick && !isCorrect && "bg-bg text-muted",
              )}
            >
              <span className={cn(direction === "zh-en" && "font-display text-base")}>
                {choice}
              </span>
              {selected !== null && isCorrect ? <Check className="size-4" /> : null}
              {selected !== null && isPick && !isCorrect ? <X className="size-4" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SpellCard({
  word,
  typed,
  checked,
  onTyped,
  onCheck,
}: {
  word: Word;
  typed: string;
  checked: boolean;
  onTyped: (value: string) => void;
  onCheck: () => void;
}) {
  const ok = typed.trim().toLowerCase() === word.en.toLowerCase();
  return (
    <form
      className="rounded-xl bg-surface px-5 py-7 shadow-card"
      onSubmit={(e) => {
        e.preventDefault();
        if (!checked && typed.trim()) onCheck();
      }}
    >
      <p className="text-xs uppercase tracking-widest text-faint">依中文拼出英文</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{word.zh}</p>
      {word.pos ? <PosBadge pos={word.pos} className="mt-2" /> : null}
      {word.exampleZh ? <p className="mt-2 text-sm text-muted">{word.exampleZh}</p> : null}
      <Input
        className="mt-6 font-display text-lg"
        value={typed}
        onChange={(e) => onTyped(e.target.value)}
        placeholder="輸入英文"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        disabled={checked}
        autoFocus
      />
      {checked ? (
        <p className={cn("mt-3 text-sm", ok ? "text-ok" : "text-danger")}>
          {ok ? "正確" : `正確拼法：${word.en}`}
        </p>
      ) : (
        <Button type="submit" className="mt-4 w-full" disabled={!typed.trim()}>
          檢查
        </Button>
      )}
    </form>
  );
}

export type StartOpts = {
  mode: PracticeMode;
  direction: Direction;
  count: number;
  wordIds?: string[];
};

export function PracticeIntro({
  onStart,
}: {
  onStart: (opts: StartOpts) => void;
}) {
  const words = useWordStore((s) => s.words);
  const selectedIds = useWordStore((s) => s.selectedIds);
  const toggleSelected = useWordStore((s) => s.toggleSelected);
  const setSelected = useWordStore((s) => s.setSelected);
  const clearSelected = useWordStore((s) => s.clearSelected);
  const restoreSeed = useWordStore((s) => s.restoreSeed);
  const dueWords = words.filter(isDue);
  const selectedWords = words.filter((w) => selectedIds.includes(w.id));

  const [mode, setMode] = useState<PracticeMode>("flash");
  const [direction, setDirection] = useState<Direction>("en-zh");
  const [pool, setPool] = useState<"selected" | "due" | "all">(
    selectedIds.length > 0 ? "selected" : dueWords.length > 0 ? "due" : "all",
  );
  const [count, setCount] = useState(() =>
    selectedIds.length > 0 ? selectedIds.length : Math.min(10, words.length || 10),
  );

  const poolWords =
    pool === "selected" ? selectedWords : pool === "due" ? dueWords : words;
  const size = Math.min(count, Math.max(poolWords.length, 1));
  const poolIds = poolWords.map((w) => w.id);

  function start() {
    if (poolWords.length === 0) return;
    onStart({
      mode,
      direction: mode === "spell" ? "zh-en" : direction,
      count: size,
      wordIds: poolIds.slice(0, size),
    });
  }

  return (
    <div className={words.length > 0 ? "pb-28" : undefined}>
      <header>
        <p className="text-xs uppercase tracking-widest text-faint">Practice</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">練習</h1>
        <p className="mt-2 text-sm text-muted">
          {selectedIds.length > 0
            ? `已圈選 ${selectedIds.length} 個。選方式後就能開始，也可在下面增減。`
            : "先圈選要考的單字，或用待複習／全部。"}
        </p>
      </header>

      {words.length === 0 ? (
        <div className="mt-6 rounded-xl bg-surface px-5 py-8 text-center shadow-card">
          <p className="font-display text-lg font-semibold">單字本是空的</p>
          <p className="mt-2 text-sm text-muted">加入單字，或還原內建的 18 個起手式。</p>
          <Button className="mt-5" onClick={() => restoreSeed()}>
            <RotateCcw className="size-4" />
            還原起手單字
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            {(
              [
                { id: "flash", title: "閃卡", blurb: "翻面回想意思" },
                { id: "quiz", title: "選擇題", blurb: "四選一快速測" },
                { id: "spell", title: "拼寫", blurb: "看中文寫英文" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={cn(
                  "rounded-xl px-4 py-4 text-left shadow-card transition-colors duration-150",
                  mode === item.id ? "bg-accent text-accent-fg" : "bg-surface hover:bg-surface-2",
                )}
              >
                <p className="font-display text-lg font-semibold">{item.title}</p>
                <p className={cn("mt-1 text-sm", mode === item.id ? "text-accent-fg/80" : "text-muted")}>
                  {item.blurb}
                </p>
              </button>
            ))}
          </div>

          {mode !== "spell" ? (
            <div className="mt-5">
              <p className="text-sm font-medium text-ink-soft">方向</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDirection("en-zh")}
                  className={cn(
                    "h-11 rounded-xl text-sm font-medium shadow-card",
                    direction === "en-zh" ? "bg-accent text-accent-fg" : "bg-surface",
                  )}
                >
                  英 → 中
                </button>
                <button
                  type="button"
                  onClick={() => setDirection("zh-en")}
                  className={cn(
                    "h-11 rounded-xl text-sm font-medium shadow-card",
                    direction === "zh-en" ? "bg-accent text-accent-fg" : "bg-surface",
                  )}
                >
                  中 → 英
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-5">
            <p className="text-sm font-medium text-ink-soft">範圍</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(
                [
                  { id: "selected" as const, title: "圈選", n: selectedWords.length, enable: true },
                  { id: "due" as const, title: "待複習", n: dueWords.length, enable: dueWords.length > 0 },
                  { id: "all" as const, title: "全部", n: words.length, enable: words.length > 0 },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={!item.enable}
                  onClick={() => {
                    setPool(item.id);
                    setCount(item.id === "selected" ? Math.max(item.n, 1) : item.n || 10);
                  }}
                  className={cn(
                    "rounded-xl px-3 py-3 text-left shadow-card transition-colors duration-150 disabled:opacity-40",
                    pool === item.id ? "bg-accent text-accent-fg" : "bg-surface hover:bg-surface-2",
                  )}
                >
                  <p className="text-sm font-medium">{item.title}</p>
                  <p
                    className={cn(
                      "mt-0.5 font-display text-xl font-semibold tabular-nums tracking-tight",
                      pool === item.id ? "text-accent-fg" : "text-ink",
                    )}
                  >
                    {item.n}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {pool === "selected" ? (
            <div className="mt-3">
              <WordPicker
                words={words}
                selectedIds={selectedIds}
                onToggle={toggleSelected}
                onSelectVisible={setSelected}
                onClear={clearSelected}
              />
            </div>
          ) : (
            <div className="mt-5">
              <p className="text-sm font-medium text-ink-soft">題數</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[5, 10, 15, poolWords.length]
                  .filter((n, i, arr) => n > 0 && arr.indexOf(n) === i)
                  .map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCount(n)}
                      className={cn(
                        "h-11 min-w-14 rounded-xl px-3 text-sm font-medium tabular-nums shadow-card",
                        count === n ? "bg-accent text-accent-fg" : "bg-surface",
                      )}
                    >
                      {n === poolWords.length ? "全部" : n}
                    </button>
                  ))}
              </div>
            </div>
          )}

          <div className="pointer-events-none fixed inset-x-0 bottom-20 z-40 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur-sm md:bottom-0 md:left-56">
            <div className="pointer-events-auto mx-auto max-w-3xl">
              <Button
                className="w-full"
                size="lg"
                disabled={poolWords.length === 0}
                onClick={start}
              >
                {pool === "selected"
                  ? selectedWords.length
                    ? `開始考 ${selectedWords.length} 個`
                    : "先圈選單字"
                  : "開始練習"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

