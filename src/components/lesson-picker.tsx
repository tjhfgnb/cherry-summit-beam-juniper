import { Minus, Plus } from "lucide-react";
import { formatLesson } from "@/lib/lesson";
import { cn } from "@/lib/utils";

export function LessonPicker({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (n: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        aria-label="上一課"
        className="grid size-11 place-items-center rounded-full bg-surface-2 text-ink-soft"
        onClick={() => onChange(Math.max(0, value - 1))}
      >
        <Minus className="size-4" />
      </button>
      <span className="min-w-20 text-center font-display text-base font-semibold tabular-nums">
        {formatLesson(value)}
      </span>
      <button
        type="button"
        aria-label="下一課"
        className="grid size-11 place-items-center rounded-full bg-surface-2 text-ink-soft"
        onClick={() => onChange(Math.min(99, value + 1))}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
