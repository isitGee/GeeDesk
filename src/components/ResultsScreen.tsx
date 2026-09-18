import { Link } from "react-router-dom";
import { Award, RotateCcw, Sparkles, ThumbsDown, ThumbsUp, Trophy, ArrowRight, CheckCircle2, ShieldCheck, GitBranch, AlertTriangle, Compass, BookOpen } from "lucide-react";
import type { Scenario } from "../types/scenario";
import type { ScoreResult } from "../types/game";
import { getEnrichedScenario } from "../data/scenarioEnricher";
import { ACHIEVEMENT_DEFS } from "../game/persistence";
import { cn } from "../utils/cn";

const GRADE_STYLE: Record<ScoreResult["grade"], { text: string; bg: string; border: string }> = {
  Outstanding: { text: "text-[var(--color-success)]", bg: "bg-[var(--color-success-soft)]", border: "border-[var(--color-success)]/30" },
  Solid: { text: "text-[var(--color-primary)]", bg: "bg-[var(--color-primary-soft)]", border: "border-[var(--color-primary)]/30" },
  Passable: { text: "text-[var(--color-warning)]", bg: "bg-[var(--color-warning-soft)]", border: "border-[var(--color-warning)]/30" },
  "Needs Practice": { text: "text-[var(--color-critical)]", bg: "bg-[var(--color-critical-soft)]", border: "border-[var(--color-critical)]/30" },
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
  const gradeConfig = GRADE_STYLE[result.grade];
  const enriched = getEnrichedScenario(scenario);
  const debrief = enriched.educationalDebrief;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16">
      {/* Hero Score Card */}
      <div className={cn("rounded-3xl border p-6 sm:p-8 text-center shadow-lg relative overflow-hidden bg-[var(--color-surface)]", gradeConfig.border)}>
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
          Incident Evaluation Report · {scenario.ticketNumber}
        </p>

        <div className="mt-3 flex items-center justify-center gap-4">
          <Trophy size={40} className={gradeConfig.text} />
          <span className="text-6xl font-black tracking-tight text-[var(--color-text)]">{pct}%</span>
        </div>

        <p className={cn("mt-2 text-xl font-black", gradeConfig.text)}>{result.grade}</p>

        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          Total Score: <strong>{result.total} / {result.totalMax} points</strong>
          {result.hintsUsed > 0 && ` · ${result.hintsUsed} hint${result.hintsUsed > 1 ? "s" : ""} used`}
        </p>

        {xpGained > 0 && (
          <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full bg-[var(--color-primary-soft)] px-4 py-1.5 text-xs font-bold text-[var(--color-primary)] shadow-xs">
            <Sparkles size={14} /> +{xpGained} Technician XP Earned
          </div>
        )}
      </div>

      {/* Unlocked Achievements */}
      {newAchievementIds.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {newAchievementIds.map((id) => {
            const def = ACHIEVEMENT_DEFS[id];
            return (
              <div
                key={id}
                className="flex items-center gap-3 rounded-2xl border border-[var(--color-warning)]/40 bg-[var(--color-warning-soft)] p-4 shadow-sm"
              >
                <Award size={24} className="text-[var(--color-warning)] shrink-0" />
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--color-warning)]">
                    Career Milestone Unlocked
                  </p>
                  <p className="text-sm font-bold text-[var(--color-text)]">{def?.label ?? id}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{def?.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rubric Breakdown */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6 shadow-sm">
        <h3 className="text-sm font-bold text-[var(--color-text)] mb-4">
          Diagnostic Rubric Breakdown
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          {result.categories.map((c) => {
            const catPct = c.max === 0 ? 0 : Math.round((c.earned / c.max) * 100);
            return (
              <div key={c.key} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[var(--color-text)]">{c.label}</span>
                  <span className="font-mono font-bold text-[var(--color-text)]">
                    {c.earned} / {c.max} pts ({catPct}%)
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-border)]">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      catPct >= 80 ? "bg-[var(--color-success)]" : catPct >= 50 ? "bg-[var(--color-primary)]" : "bg-[var(--color-warning)]"
                    )}
                    style={{ width: `${catPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Educational Debrief: Elimination Tree & Hypothesis Analysis */}
      {debrief && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
            <GitBranch size={17} className="text-[var(--color-primary)]" />
            <span>CompTIA 7-Step Hypothesis Elimination Tree</span>
          </div>

          <p className="text-xs text-[var(--color-text-secondary)]">
            Professional troubleshooting follows the scientific method: state plausible theories, inspect layers systematically, and eliminate competing explanations before applying changes.
          </p>

          <div className="space-y-2.5">
            {debrief.eliminationTree.map((item, idx) => {
              const isConfirmed = item.status === "Root Cause";
              return (
                <div
                  key={idx}
                  className={cn(
                    "rounded-xl border p-3 text-xs space-y-1.5",
                    isConfirmed
                      ? "border-[var(--color-success)]/40 bg-[var(--color-success-soft)]/20"
                      : "border-[var(--color-border)] bg-[var(--color-surface-muted)]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--color-text)]">
                      Theory: {item.hypothesis}
                    </span>
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-[10px] font-bold uppercase",
                        isConfirmed
                          ? "bg-[var(--color-success)] text-white"
                          : "bg-[var(--color-border)] text-[var(--color-text-secondary)]"
                      )}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--color-text-secondary)]">
                    <strong className="text-[var(--color-text)]">Investigation Finding: </strong>
                    {item.reason}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Optimal Investigation Path vs Traps */}
      {debrief && (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Optimal Path */}
          <div className="rounded-2xl border border-[var(--color-primary)]/30 bg-[var(--color-primary-soft)]/20 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
              <Compass size={15} /> Optimal Investigation Path
            </div>
            <ol className="space-y-2 text-xs text-[var(--color-text)]">
              {debrief.optimalInvestigationPath.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-bold text-white">
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Common Traps & Real-World Takeaway */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--color-warning)]/30 bg-[var(--color-warning-soft)]/20 p-4 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-warning)]">
                <AlertTriangle size={15} /> Novice Traps & Misconceptions
              </div>
              <ul className="space-y-1.5 text-xs text-[var(--color-text)]">
                {debrief.commonMistakes.map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[var(--color-warning)] font-bold">•</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">
                <BookOpen size={15} className="text-[var(--color-primary)]" /> Production Takeaway
              </div>
              <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                {debrief.realWorldTakeaway}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* What You Handled Well vs What You Missed */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-success)]/30 bg-[var(--color-success-soft)] p-5 shadow-sm">
          <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-success)]">
            <ThumbsUp size={15} /> What You Handled Well
          </h4>
          <ul className="space-y-2 text-xs text-[var(--color-text)]">
            {result.whatYouDidWell.length === 0 ? (
              <li>Keep practicing — every ticket builds troubleshooting intuition.</li>
            ) : (
              result.whatYouDidWell.map((w, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-[var(--color-success)] shrink-0 mt-0.5" />
                  <span>{w}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-[var(--color-critical)]/20 bg-[var(--color-critical-soft)] p-5 shadow-sm">
          <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-critical)]">
            <ThumbsDown size={15} /> Areas for Improvement
          </h4>
          <ul className="space-y-2 text-xs text-[var(--color-text)]">
            {result.whatYouMissed.length === 0 ? (
              <li className="flex items-center gap-2 font-semibold text-[var(--color-success)]">
                <ShieldCheck size={14} /> Flawless ticket resolution — clean investigation and documentation!
              </li>
            ) : (
              result.whatYouMissed.map((w, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[var(--color-critical)] font-bold mt-0.5">•</span>
                  <span>{w}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Infrastructure Fault Analysis */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text)]">Underlying Infrastructure Fault</h3>
          <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
            {scenario.hiddenFault}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 text-xs">
            <p className="font-bold text-[var(--color-text)]">Definitive Diagnosis</p>
            <p className="mt-1 text-[var(--color-text-secondary)]">{result.correctDiagnosisLabel}</p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 text-xs">
            <p className="font-bold text-[var(--color-text)]">Standard Remediation</p>
            <p className="mt-1 text-[var(--color-text-secondary)]">{result.correctResolutionLabel}</p>
          </div>
        </div>

        {(scenario.keyConcepts?.length ?? 0) > 0 && (
          <div className="border-t border-[var(--color-border)] pt-3">
            <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-2">
              Key CompTIA / CCNA Concepts Exercised:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {scenario.keyConcepts?.map((kc, i) => (
                <span
                  key={i}
                  className="rounded-lg bg-[var(--color-surface-muted)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text)]"
                >
                  ✓ {kc}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Navigation */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={onRetry}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] py-3 text-xs font-bold text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] transition-colors"
        >
          <RotateCcw size={14} /> Retry This Ticket
        </button>

        <Link
          to="/tickets"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] py-3 text-xs font-bold text-white hover:bg-[var(--color-primary-dark)] transition-colors shadow-sm"
        >
          <span>Return to Ticket Queue</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
