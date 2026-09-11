import { POS_BY_KEY, POS_OPTIONS, parsePos, togglePosKey, type PosKey } from "@/lib/pos";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PosBadge({ pos, className }: { pos: string; className?: string }) {
  const keys = parsePos(pos);
  if (!keys.length) {
    if (!pos.trim()) return null;
    return <Badge className={className}>{pos}</Badge>;
  }
  return (
    <span className={cn("inline-flex flex-wrap gap-1", className)}>
      {keys.map((key) => {
        const item = POS_BY_KEY[key];
        return (
          <Badge key={key}>
            <span className="font-display">{item.abbr}</span>
            <span className="ml-1">{item.zh}</span>
          </Badge>
        );
      })}
    </span>
  );
}

export function PosPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const selected = new Set(parsePos(value));
  return (
    <div className="flex flex-wrap gap-1.5">
      {POS_OPTIONS.map((item) => {
        const on = selected.has(item.key as PosKey);
        return (
          <button
            key={item.key}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(togglePosKey(value, item.key))}
            className={cn(
              "h-9 rounded-full px-3 text-sm font-medium transition-colors duration-150",
              on
                ? "bg-accent text-accent-fg"
                : "bg-bg-warm text-ink-soft shadow-card hover:bg-surface-2",
            )}
          >
            <span className="font-display">{item.abbr}</span>
            <span className="ml-1">{item.zh}</span>
          </button>
        );
      })}
    </div>
  );
}
