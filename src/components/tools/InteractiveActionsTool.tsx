import { useState } from "react";
import { Play, AlertTriangle, RotateCcw, CheckCircle2, History } from "lucide-react";
import type { InteractiveAction } from "../../types/scenario";
import type { ConsequenceEntry } from "../../types/game";
import { cn } from "../../utils/cn";

interface InteractiveActionsToolProps {
  actions: InteractiveAction[];
  consequenceHistory: ConsequenceEntry[];
  onExecuteAction: (actionId: string) => void;
  disabled?: boolean;
}

export function InteractiveActionsTool({
  actions,
  consequenceHistory,
  onExecuteAction,
  disabled,
}: InteractiveActionsToolProps) {
  const [selectedActionId, setSelectedActionId] = useState<string>(actions[0]?.id ?? "");

  const selectedAction = actions.find((a) => a.id === selectedActionId) ?? actions[0];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <RotateCcw size={14} className="text-[var(--color-primary)]" />
          <span className="font-bold text-[var(--color-text)]">Active Troubleshooting Operations</span>
          <span className="rounded bg-[var(--color-border)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-secondary)]">
            Live Endpoint Intervention
          </span>
        </div>
        <span className="text-[11px] text-[var(--color-text-muted)]">
          {consequenceHistory.length} operation{consequenceHistory.length === 1 ? "" : "s"} performed
        </span>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden sm:flex-row">
        {/* Actions Selection Left Column */}
        <div className="thin-scroll w-full sm:w-[320px] border-r border-[var(--color-border)] p-3 space-y-2 overflow-y-auto">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">
            Available Intervention Actions
          </span>

          {actions.map((act) => {
            const isSelected = selectedActionId === act.id;
            return (
              <button
                key={act.id}
                onClick={() => setSelectedActionId(act.id)}
                className={cn(
                  "w-full rounded-xl border p-3 text-left text-xs transition-all shadow-2xs space-y-1",
                  isSelected
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]/40 ring-1 ring-[var(--color-primary)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-muted)]"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--color-text)]">{act.label}</span>
                </div>
                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                  {act.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Action Details & Execution Pane */}
        <div className="thin-scroll flex-1 p-4 bg-[var(--color-surface)] overflow-y-auto space-y-4">
          {selectedAction && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 space-y-2">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Action Overview
                </span>
                <h3 className="text-sm font-black text-[var(--color-text)]">{selectedAction.label}</h3>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {selectedAction.description}
                </p>
                <div className="pt-2">
                  <button
                    disabled={disabled}
                    onClick={() => onExecuteAction(selectedAction.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-[var(--color-primary)] px-4 py-2 text-xs font-bold text-white transition-all hover:bg-[var(--color-primary-dark)] disabled:opacity-50 shadow-xs"
                  >
                    <Play size={12} fill="currentColor" /> Execute Action on Machine
                  </button>
                </div>
              </div>

              {/* Consequence History / Audit Log */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text)]">
                  <History size={13} className="text-[var(--color-primary)]" />
                  <span>Simulated Outcome & Consequence Log</span>
                </div>

                {consequenceHistory.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[var(--color-border)] p-6 text-center text-xs text-[var(--color-text-muted)]">
                    No active intervention actions executed yet. Select an action above and click execute to observe simulated technical consequences.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[...consequenceHistory].reverse().map((csq) => (
                      <div
                        key={csq.id}
                        className={cn(
                          "rounded-xl border p-3 text-xs space-y-1 shadow-2xs",
                          csq.penalty > 0
                            ? "border-[var(--color-warning)]/40 bg-[var(--color-warning-soft)]/20"
                            : "border-[var(--color-success)]/40 bg-[var(--color-success-soft)]/20"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[var(--color-text)] flex items-center gap-1.5">
                            {csq.penalty > 0 ? (
                              <AlertTriangle size={13} className="text-[var(--color-warning)]" />
                            ) : (
                              <CheckCircle2 size={13} className="text-[var(--color-success)]" />
                            )}
                            {csq.action}
                          </span>
                          {csq.penalty > 0 && (
                            <span className="font-mono text-[10px] font-bold text-[var(--color-warning)]">
                              Efficiency -{csq.penalty} pts
                            </span>
                          )}
                        </div>
                        <p className="text-[11.5px] text-[var(--color-text-secondary)] leading-relaxed">
                          {csq.consequence}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
