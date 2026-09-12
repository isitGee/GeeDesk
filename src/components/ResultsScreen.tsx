import { Link } from "react-router-dom";
import { Award, RotateCcw, Sparkles, ThumbsDown, ThumbsUp, Trophy } from "lucide-react";
import type { Scenario } from "../types/scenario";
import type { ScoreResult } from "../types/game";
import { ACHIEVEMENT_DEFS } from "../game/persistence";
import { cn } from "../utils/cn";

const GRADE_STYLE: Record<ScoreResult["grade"], string> = {
  Outstanding: "text-[var(--color-success)]",
  Solid: "text-[var(--color-primary)]",
  Passable: "text-[var(--color-warning)]",
  "Needs Practice": "text-[var(--color-critical)]",
};

export function ResultsScreen({
  scenario,
  result,
  xpGained,
  newAchievementIds,
  onRetry,
}: {
  scenario: Scenario;
  result: ScoreResult;
  xpGained: number;
  newAchievementIds: string[];
  onRetry: () => void;
}) {
  const pct = Math.round((result.total / result.totalMax) * 100);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          {scenario.ticketNumber} closed
        </p>
        <div className="mt-2 flex items-center justify-center gap-4">
          <Trophy size={32} className={GRADE_STYLE[result.grade]} />
          <span className="text-5xl font-black tracking-tight text-[var(--color-text)]">{pct}%</span>
        </div>
        <p className={cn("mt-1 text-lg font-bold", GRADE_STYLE[result.grade])}>{result.grade}</p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {result.total} / {result.totalMax} points
          {result.hintsUsed > 0 && ` · ${result.hintsUsed} hint${result.hintsUsed > 1 ? "s" : ""} used`}
        </p>

        {xpGained > 0 && (
          <div className="mx-auto mt-4 flex w-fit items-center gap-1.5 rounded-full bg-[var(--color-primary-soft)] px-3 py-1 text-xs font-bold text-[var(--color-primary)]">
            <Sparkles size={13} /> +{xpGained} XP
          </div>
        )}
      </div>

      {newAchievementIds.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {newAchievementIds.map((id) => (
            <div
              key={id}
              className="flex items-center gap-3 rounded-2xl border border-[var(--color-warning)]/30 bg-[var(--color-warning-soft)] p-3"
            >
              <Award size={20} className="text-[var(--color-warning)]" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-warning)]">
                  Achievement unlocked
                </p>
                <p className="text-sm font-bold text-[var(--color-text)]">{ACHIEVEMENT_DEFS[id]?.label ?? id}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h3 className="mb-3 text-sm font-bold text-[var(--color-text)]">Score breakdown</h3>
        <div className="space-y-2.5">
          {result.categories.map((c) => (
            <div key={c.key}>
              <div className="mb-1 flex justify-between text-[12.5px]">
                <span className="text-[var(--color-text-secondary)]">{c.label}</span>
                <span className="font-semibold text-[var(--color-text)]">
                  {c.earned}/{c.max}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
                <div
                  className="h-full rounded-full bg-[var(--color-primary)]"
                  style={{ width: `${c.max === 0 ? 0 : (c.earned / c.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-success)]/25 bg-[var(--color-success-soft)] p-4">
          <h4 className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-[var(--color-success)]">
            <ThumbsUp size={14} /> What you did well
          </h4>
          <ul className="space-y-1.5 text-[12.5px] text-[var(--color-text)]">
            {result.whatYouDidWell.length === 0 && <li>Nothing yet — there's always next ticket.</li>}
            {result.whatYouDidWell.map((w, i) => (
              <li key={i}>• {w}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-[var(--color-critical)]/20 bg-[var(--color-critical-soft)] p-4">
          <h4 className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-[var(--color-critical)]">
            <ThumbsDown size={14} /> What you missed
          </h4>
          <ul className="space-y-1.5 text-[12.5px] text-[var(--color-text)]">
            {result.whatYouMissed.length === 0 && <li>Nothing — clean sweep.</li>}
            {result.whatYouMissed.map((w, i) => (
              <li key={i}>• {w}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h3 className="mb-2 text-sm font-bold text-[var(--color-text)]">What was actually wrong</h3>
        <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">{scenario.hiddenFault}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-[var(--color-surface-muted)] p-3 text-[12.5px]">
            <p className="font-semibold text-[var(--color-text)]">Correct diagnosis</p>
            <p className="mt-0.5 text-[var(--color-text-secondary)]">{result.correctDiagnosisLabel}</p>
          </div>
          <div className="rounded-xl bg-[var(--color-surface-muted)] p-3 text-[12.5px]">
            <p className="font-semibold text-[var(--color-text)]">Correct resolution</p>
            <p className="mt-0.5 text-[var(--color-text-secondary)]">{result.correctResolutionLabel}</p>
          </div>
        </div>
      </div>

      {result.skillsDemonstrated.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12.5px] font-semibold text-[var(--color-text-secondary)]">Skills demonstrated:</span>
          {result.skillsDemonstrated.map((s) => (
            <span
              key={s}
              className="rounded-full bg-[var(--color-primary-soft)] px-2.5 py-1 text-[11.5px] font-semibold text-[var(--color-primary)]"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onRetry}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] py-2.5 text-[13.5px] font-bold text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
        >
          <RotateCcw size={15} /> Retry this ticket
        </button>
        <Link
          to="/tickets"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] py-2.5 text-[13.5px] font-bold text-white hover:bg-[var(--color-primary-dark)]"
        >
          Back to tickets
        </Link>
      </div>
    </div>
  );
}
