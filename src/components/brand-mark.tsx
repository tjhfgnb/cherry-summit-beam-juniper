import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8", className)}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="currentColor" className="text-accent" />
      <path
        d="M8 8.5h11.5c.8 0 1.5.7 1.5 1.5v14.2c0 .5-.4.8-.8.8H9.2c-.6 0-1.2-.5-1.2-1.1V8.5z"
        fill="currentColor"
        className="text-accent-fg"
      />
      <path d="M11 8.5v16.5" stroke="#21564E" strokeWidth="1.2" strokeLinecap="round" />
      <path
        d="M20.8 8.5H24c.6 0 1 .5 1 1.1V12l-1.6 1.1L25 14.2v9.2c0 .6-.4 1.1-1 1.1h-3.2"
        fill="#DCE8E5"
      />
      <rect x="14.2" y="7" width="3.2" height="7.5" rx="0.6" fill="#1C1915" />
    </svg>
  );
}
