import { FileSearch, Network, MessageCircle, MonitorCog } from "lucide-react";
import type { Evidence } from "../types/scenario";

const CATEGORY_ICON: Record<Evidence["category"], typeof Network> = {
  network: Network,
  "user-report": FileSearch,
  conversation: MessageCircle,
  system: MonitorCog,
};

export function EvidencePanel({ evidence, revealedIds }: { evidence: Evidence[]; revealedIds: string[] }) {
  const revealed = evidence.filter((e) => revealedIds.includes(e.id));
  const remaining = evidence.length - revealed.length;

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden">
      <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
        <span>{revealed.length} clue{revealed.length === 1 ? "" : "s"} found</span>
        {remaining > 0 && <span>{remaining} more to uncover</span>}
      </div>

      <div className="thin-scroll flex-1 space-y-2 overflow-y-auto pr-1">
        {revealed.length === 0 && (
          <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] p-6 text-center text-sm text-[var(--color-text-muted)]">
            Nothing gathered yet. Run terminal commands or ask the user questions to uncover clues.
          </div>
        )}
        {revealed.map((e) => {
          const Icon = CATEGORY_ICON[e.category];
          return (
            <div key={e.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                  <Icon size={13} />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-[var(--color-text)]">{e.label}</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--color-text-secondary)]">{e.detail}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
