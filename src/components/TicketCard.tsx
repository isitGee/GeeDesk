import { Link } from "react-router-dom";
import { Clock, CheckCircle2, Network } from "lucide-react";
import type { Scenario } from "../types/scenario";
import type { CompletedTicketRecord } from "../types/game";
import { DifficultyBadge } from "./DifficultyBadge";

export function TicketCard({ scenario, record }: { scenario: Scenario; record?: CompletedTicketRecord }) {
  return (
    <Link
      to={`/tickets/${scenario.id}`}
      className="group flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--color-primary)]/40 hover:shadow-[0_8px_24px_-12px_rgba(0,103,192,0.25)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          <Network size={13} />
          {scenario.ticketNumber}
        </div>
        {record && (
          <span className="flex items-center gap-1 rounded-full bg-[var(--color-success-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-success)]">
            <CheckCircle2 size={12} />
            {Math.round((record.bestScore / record.bestScoreMax) * 100)}%
          </span>
        )}
      </div>

      <div>
        <h3 className="text-[15px] font-bold leading-snug text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
          {scenario.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
          {scenario.ticketDescription}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-text-muted)]">
        <DifficultyBadge difficulty={scenario.difficulty} />
        <span className="flex items-center gap-1">
          <Clock size={13} />
          ~{scenario.estimatedMinutes} min
        </span>
      </div>
    </Link>
  );
}
