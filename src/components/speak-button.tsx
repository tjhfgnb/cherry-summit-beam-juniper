import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speakEnglish } from "@/lib/speech";
import { cn } from "@/lib/utils";

export function SpeakButton({
  text,
  className,
  size = "icon-sm",
}: {
  text: string;
  className?: string;
  size?: "icon" | "icon-sm";
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      className={cn("text-muted hover:text-accent", className)}
      aria-label={`朗讀 ${text}`}
      onClick={(e) => {
        e.stopPropagation();
        speakEnglish(text);
      }}
    >
      <Volume2 className="size-4" />
    </Button>
  );
}
