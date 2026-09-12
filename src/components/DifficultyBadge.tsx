import type { Difficulty } from "../types/scenario";
import { cn } from "../utils/cn";

const CONFIG: Record<Difficulty, { label: string; dots: number; className: string }> = {
  beginner: { label: "Beginner", dots: 1, className: "text-[var(--color-success)]" },
  intermediate: { label: "Intermediate", dots: 2, className: "text-[var(--color-warning)]" },
  advanced: { label: "Advanced", dots: 3, className: "text-[var(--color-critical)]" },
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const cfg = CONFIG[difficulty];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", cfg.className)}>
      <span className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn("h-1.5 w-1.5 rounded-full", i < cfg.dots ? "bg-current" : "bg-[var(--color-border-strong)]")}
          />
        ))}
      </span>
      {cfg.label}
    </span>
  );
}
