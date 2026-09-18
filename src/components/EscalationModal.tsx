import { useState } from "react";
import { Share2, AlertTriangle, X } from "lucide-react";
import type { Scenario, EscalationOption } from "../types/scenario";
import { cn } from "../utils/cn";

interface EscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: Scenario;
  escalationOptions: EscalationOption[];
  onConfirmEscalation: (escalationId: string) => void;
}

export function EscalationModal({
  isOpen,
  onClose,
  scenario,
  escalationOptions,
  onConfirmEscalation,
}: EscalationModalProps) {
  const [selectedId, setSelectedId] = useState<string>(escalationOptions[0]?.id ?? "");
  const [justification, setJustification] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-warning-soft)] text-[var(--color-warning)]">
              <Share2 size={16} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text)]">
                Escalate Ticket — {scenario.ticketNumber}
              </h3>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Professional escalation is rewarded when an incident exceeds Tier 1 scope.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning-soft)] p-3 text-xs text-[var(--color-text)] flex items-start gap-2">
            <AlertTriangle size={16} className="text-[var(--color-warning)] shrink-0 mt-0.5" />
            <p>
              Escalating routes this incident to specialized Tier 2, Network Engineering, or Information Security teams. Ensure you have gathered preliminary evidence before escalating.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] mb-2">
              Select Destination Team & Tier
            </label>
            <div className="space-y-2">
              {escalationOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-xs transition-colors",
                    selectedId === opt.id
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface-muted)] hover:border-[var(--color-border-strong)]"
                  )}
                >
                  <input
                    type="radio"
                    name="escalation"
                    className="mt-0.5 accent-[var(--color-primary)]"
                    checked={selectedId === opt.id}
                    onChange={() => setSelectedId(opt.id)}
                  />
                  <div>
                    <span className="font-bold text-[var(--color-text)] block">{opt.targetTeam}</span>
                    <span className="text-[11.5px] text-[var(--color-text-secondary)]">{opt.reason}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] mb-1">
              Escalation Briefing & Justification (Mandatory for Hand-off)
            </label>
            <textarea
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Detail reasons why Tier 1 cannot resolve: e.g. Core switch hardware fault detected, elevated domain permissions required, or active malware containment needed."
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-2.5 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-2 text-xs font-bold text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
          >
            Cancel
          </button>

          <button
            disabled={!selectedId}
            onClick={() => onConfirmEscalation(selectedId)}
            className="flex items-center gap-1.5 rounded-xl bg-[var(--color-warning)] px-5 py-2 text-xs font-bold text-white transition-colors hover:opacity-90 disabled:opacity-50"
          >
            <Share2 size={14} /> Confirm Escalation
          </button>
        </div>
      </div>
    </div>
  );
}
