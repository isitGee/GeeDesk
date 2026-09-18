import { CheckCircle2, XCircle, HelpCircle, Layers, Sparkles } from "lucide-react";
import type { Hypothesis, Evidence } from "../../types/scenario";
import { cn } from "../../utils/cn";

interface HypothesisBoardToolProps {
  hypotheses: Hypothesis[];
  hypothesisStates: Record<string, "untested" | "ruled_out" | "supported" | "confirmed">;
  onToggleStatus: (id: string, status: "untested" | "ruled_out" | "supported" | "confirmed") => void;
  randomizedOrderIds?: string[];
  revealedEvidenceIds?: string[];
  allEvidence?: Evidence[];
}

export function HypothesisBoardTool({
  hypotheses,
  hypothesisStates,
  onToggleStatus,
  randomizedOrderIds,
  revealedEvidenceIds: _revealedEvidenceIds,
  allEvidence: _allEvidence,
}: HypothesisBoardToolProps) {
  // Order by randomizedOrderIds if available to prevent positional bias
  const orderedHypotheses = [...hypotheses].sort((a, b) => {
    if (!randomizedOrderIds) return 0;
    const idxA = randomizedOrderIds.indexOf(a.id);
    const idxB = randomizedOrderIds.indexOf(b.id);
    if (idxA === -1 || idxB === -1) return 0;
    return idxA - idxB;
  });

  const total = hypotheses.length;
  const ruledOut = hypotheses.filter((h) => hypothesisStates[h.id] === "ruled_out").length;
  const supported = hypotheses.filter((h) => hypothesisStates[h.id] === "supported" || hypothesisStates[h.id] === "confirmed").length;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-[var(--color-primary)]" />
          <span className="font-bold text-[var(--color-text)]">Diagnostic Hypothesis Elimination Board</span>
          <span className="rounded bg-[var(--color-border)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-secondary)]">
            CompTIA 7-Step Method
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-semibold">
          <span className="text-[var(--color-critical)]">{ruledOut} Ruled Out</span>
          <span className="text-[var(--color-success)]">{supported} Supported</span>
          <span className="text-[var(--color-text-muted)]">{total - ruledOut - supported} Untested</span>
        </div>
      </div>

      {/* Progress & Directive Bar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-xs space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[var(--color-text-secondary)] font-medium">
            Hypothesis Testing Progress: <strong>{ruledOut + supported} / {total} evaluated</strong>
          </span>
          <span className="font-mono text-[var(--color-primary)] font-bold">
            {Math.round(((ruledOut + supported) / Math.max(1, total)) * 100)}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
          <div
            className="h-full bg-[var(--color-primary)] transition-all duration-300"
            style={{ width: `${((ruledOut + supported) / Math.max(1, total)) * 100}%` }}
          />
        </div>
        <p className="text-[10.5px] text-[var(--color-text-muted)] italic pt-0.5">
          Troubleshooting is the elimination of theories. Run diagnostic commands to gather evidence and eliminate impossible failure points.
        </p>
      </div>

      {/* Hypotheses List */}
      <div className="thin-scroll flex-1 overflow-y-auto p-3 space-y-2.5">
        {orderedHypotheses.map((hyp) => {
          const status = hypothesisStates[hyp.id] ?? "untested";
          return (
            <div
              key={hyp.id}
              className={cn(
                "rounded-xl border p-3 text-xs transition-all shadow-2xs space-y-2",
                status === "ruled_out" && "border-[var(--color-border)] bg-[var(--color-surface-muted)]/60 opacity-80",
                status === "supported" && "border-[var(--color-success)]/40 bg-[var(--color-success-soft)]/20",
                status === "confirmed" && "border-[var(--color-primary)]/50 bg-[var(--color-primary-soft)]/30 ring-1 ring-[var(--color-primary)]",
                status === "untested" && "border-[var(--color-border)] bg-[var(--color-surface)]"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[var(--color-surface-muted)] px-2 py-0.5 text-[9.5px] font-bold text-[var(--color-text-muted)]">
                      {hyp.category}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.2 text-[10px] font-bold capitalize",
                        status === "ruled_out" && "bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300",
                        status === "supported" && "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300",
                        status === "confirmed" && "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300",
                        status === "untested" && "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      )}
                    >
                      {status === "ruled_out" && <XCircle size={10} />}
                      {status === "supported" && <CheckCircle2 size={10} />}
                      {status === "confirmed" && <Sparkles size={10} />}
                      {status === "untested" && <HelpCircle size={10} />}
                      {status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="font-bold text-xs text-[var(--color-text)] leading-snug">
                    {hyp.label}
                  </p>
                </div>

                {/* State toggle actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onToggleStatus(hyp.id, "ruled_out")}
                    title="Mark theory as Ruled Out"
                    className={cn(
                      "rounded-lg px-2 py-1 text-[10.5px] font-semibold border transition-colors",
                      status === "ruled_out"
                        ? "border-[var(--color-critical)] bg-[var(--color-critical)] text-white"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-critical)] hover:text-[var(--color-critical)]"
                    )}
                  >
                    Rule Out
                  </button>
                  <button
                    onClick={() => onToggleStatus(hyp.id, "supported")}
                    title="Mark theory as Supported by Evidence"
                    className={cn(
                      "rounded-lg px-2 py-1 text-[10.5px] font-semibold border transition-colors",
                      status === "supported" || status === "confirmed"
                        ? "border-[var(--color-success)] bg-[var(--color-success)] text-white"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-success)] hover:text-[var(--color-success)]"
                    )}
                  >
                    Support
                  </button>
                </div>
              </div>

              {/* Explanations */}
              {status === "ruled_out" && hyp.ruleOutExplanation && (
                <div className="rounded-lg bg-[var(--color-surface)] p-2 text-[11px] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                  <strong>Elimination proof:</strong> {hyp.ruleOutExplanation}
                </div>
              )}

              {status === "supported" && hyp.supportExplanation && (
                <div className="rounded-lg bg-[var(--color-success-soft)] p-2 text-[11px] text-[var(--color-success)] border border-[var(--color-success)]/30 font-medium">
                  <strong>Supporting finding:</strong> {hyp.supportExplanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
