// Shared difficulty picker used on every game start screen.
import { Button } from "@/components/ui/button";
import { Overlay } from "./GameShell";

export type Difficulty = "easy" | "medium" | "hard";

export function StartPanel({
  title,
  subtitle,
  onStart,
  onTutorial,
}: {
  title: string;
  subtitle: string;
  onStart: (d: Difficulty) => void;
  onTutorial?: () => void;
}) {
  return (
    <Overlay title={title} subtitle={subtitle}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onStart("easy")}>
            Easy
          </Button>
          <Button size="sm" onClick={() => onStart("medium")}>
            Medium
          </Button>
          <Button size="sm" variant="outline" onClick={() => onStart("hard")}>
            Hard
          </Button>
        </div>
        {onTutorial && (
          <button
            onClick={onTutorial}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            How to play →
          </button>
        )}
        <div className="text-[11px] text-muted-foreground">
          Shortcuts · Esc pause · Space resume · F2 mute
        </div>
      </div>
    </Overlay>
  );
}
