import { useState } from "react";
import { FileSearch, Network, MessageCircle, MonitorCog, KeyRound } from "lucide-react";
import type { Evidence } from "../types/scenario";
import { cn } from "../utils/cn";

const CATEGORY_ICON: Record<Evidence["category"], typeof Network> = {
  network: Network,
  "user-report": FileSearch,
  conversation: MessageCircle,
  system: MonitorCog,
};

export function EvidencePanel({ evidence, revealedIds }: { evidence: Evidence[]; revealedIds: string[] }) {
  const [filter, setFilter] = useState<string>("all");

  const revealed = evidence.filter((e) => revealedIds.includes(e.id));
  const remaining = evidence.length - revealed.length;
  const keyRevealedCount = revealed.filter((e) => e.isKey).length;
  const totalKeyCount = evidence.filter((e) => e.isKey).length;

  const filteredRevealed = revealed.filter((e) => {
    if (filter === "all") return true;
    if (filter === "key") return e.isKey;
    return e.category === filter;
  });

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-xs">
        <div className="flex items-center gap-2">
          <KeyRound size={14} className="text-[var(--color-primary)]" />
          <span className="font-semibold text-[var(--color-text)]">Evidence Locker</span>
          <span className="rounded bg-[var(--color-border)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-secondary)]">
            {revealed.length} of {evidence.length} collected
          </span>
        </div>

        <span className="text-[11px] font-semibold text-[var(--color-warning)]">
          {keyRevealedCount} / {totalKeyCount} Key Clues Found
        </span>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[var(--color-border)] p-2 text-[11px]">
        {["all", "network", "system", "conversation", "key"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-md px-2 py-0.5 font-medium transition-colors capitalize",
              filter === f
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
            )}
          >
            {f === "key" ? "⭐ Key Findings" : f}
          </button>
        ))}
      </div>

      {/* Findings List */}
      <div className="thin-scroll flex-1 space-y-2 overflow-y-auto p-3">
        {filteredRevealed.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] p-6 text-center text-xs text-[var(--color-text-muted)]">
            {revealed.length === 0
              ? "No evidence logged yet. Execute terminal commands, inspect tools, or ask the user questions to uncover findings."
              : "No findings match the current filter."}
          </div>
        ) : (
          filteredRevealed.map((e) => {
            const Icon = CATEGORY_ICON[e.category] ?? Network;
            return (
              <div
                key={e.id}
                className={cn(
                  "rounded-xl border p-3 text-xs transition-colors shadow-2xs",
                  e.isKey
                    ? "border-[var(--color-warning)]/40 bg-[var(--color-warning-soft)]/20"
                    : "border-[var(--color-border)] bg-[var(--color-surface)]"
                )}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={cn(
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs",
                      e.isKey
                        ? "bg-[var(--color-warning-soft)] text-[var(--color-warning)]"
                        : "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                    )}
                  >
                    <Icon size={13} />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[var(--color-text)]">{e.label}</p>
                      {e.isKey && (
                        <span className="rounded bg-[var(--color-warning-soft)] px-1.5 py-0.2 text-[9.5px] font-bold text-[var(--color-warning)]">
                          ⭐ Key Evidence
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-[var(--color-text-secondary)]">{e.detail}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {remaining > 0 && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1.5 text-center text-[10.5px] text-[var(--color-text-muted)]">
          {remaining} additional diagnostic finding{remaining === 1 ? "" : "s"} remain to be uncovered on this machine.
        </div>
      )}
    </div>
  );
}
