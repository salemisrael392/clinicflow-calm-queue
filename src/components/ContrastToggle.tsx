import { Contrast } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useHighContrast } from "@/hooks/useHighContrast";
import { cn } from "@/lib/utils";

export function ContrastToggle({ className }: { className?: string }) {
  const { enabled, setEnabled } = useHighContrast();
  return (
    <div className={cn("flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2", className)}>
      <Contrast className="h-4 w-4 text-foreground" aria-hidden="true" />
      <Label htmlFor="high-contrast" className="text-sm font-semibold text-foreground cursor-pointer">
        High contrast
      </Label>
      <Switch id="high-contrast" checked={enabled} onCheckedChange={setEnabled} aria-describedby="high-contrast-desc" />
      <span id="high-contrast-desc" className="sr-only">Increases text and border contrast for easier reading</span>
    </div>
  );
}
