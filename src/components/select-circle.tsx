import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function SelectCircle({
  selected,
  className,
}: {
  selected: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "pointer-events-none flex size-7 items-center justify-center rounded-full border-2 transition-[background-color,border-color,transform] duration-100 ease-out-soft",
        selected ? "scale-100 border-accent bg-accent" : "border-faint bg-transparent",
        className,
      )}
      aria-hidden
    >
      <Check
        className={cn(
          "size-3.5 text-accent-fg transition-[opacity,transform] duration-150 ease-out-soft",
          selected ? "scale-100 opacity-100" : "scale-50 opacity-0",
        )}
        strokeWidth={3}
      />
    </span>
  );
}
