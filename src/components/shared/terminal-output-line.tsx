import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { isTerminalOkLine, terminalOkMessage } from "@/lib/ui/terminal-lines";

export function TerminalOutputLine({
  line,
  className,
}: {
  line: string;
  className?: string;
}) {
  if (isTerminalOkLine(line)) {
    return (
      <div className={cn("flex items-start gap-1.5 text-success font-medium", className)}>
        <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
        <span>{terminalOkMessage(line)}</span>
      </div>
    );
  }

  return <div className={className}>{line}</div>;
}
