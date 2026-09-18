import { Link } from "react-router-dom";
import { Clock, CheckCircle2, Monitor, User, ArrowUpRight } from "lucide-react";
import type { Scenario } from "../types/scenario";
import type { CompletedTicketRecord } from "../types/game";
import { getEnrichedScenario } from "../data/scenarioEnricher";
import { DifficultyBadge } from "./DifficultyBadge";
import { cn } from "../utils/cn";

export function TicketCard({
  scenario,
  record,
}: {
  scenario: Scenario;
  record?: CompletedTicketRecord;
}) {
  const enriched = getEnrichedScenario(scenario);
  const isResolved = !!record;
  const scorePct = record ? Math.round((record.bestScore / record.bestScoreMax) * 100) : null;

  return (
    <Link
      to={`/tickets/${scenario.id}`}
      className="group flex flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--color-primary)]/50 hover:shadow-[0_12px_28px_-12px_rgba(0,103,192,0.25)]"
    >
      <div>
        {/* Top Header: ID, Priority, Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold text-[var(--color-primary)]">
              {scenario.ticketNumber}
            </span>
            <span className="text-[11px] text-[var(--color-text-muted)]">·</span>
            <span className="text-xs font-medium text-[var(--color-text-muted)]">{scenario.category}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Priority Pill */}
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                enriched.priority === "Critical" && "bg-[var(--color-critical-soft)] text-[var(--color-critical)]",
                enriched.priority === "High" && "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
                enriched.priority === "Medium" && "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300",
                enriched.priority === "Low" && "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              )}
            >
              {enriched.priority}
            </span>

            {isResolved ? (
              <span className="flex items-center gap-1 rounded-full bg-[var(--color-success-soft)] px-2 py-0.5 text-[11px] font-bold text-[var(--color-success)]">
                <CheckCircle2 size={12} />
                {scorePct}%
              </span>
            ) : (
              <span className="rounded-full bg-[var(--color-surface-muted)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-text-muted)]">
                Open
              </span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div className="mt-3">
          <h3 className="text-sm font-bold leading-snug text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors flex items-center justify-between">
            <span>{scenario.title}</span>
            <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-primary)] shrink-0" />
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
            "{scenario.ticketDescription}"
          </p>
        </div>

        {/* Requester & Device Meta */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-[var(--color-surface-muted)] p-2.5 text-[11px]">
          <div className="flex items-center gap-1.5 text-[var(--color-text)]">
            <User size={12} className="text-[var(--color-text-muted)] shrink-0" />
            <span className="font-semibold truncate max-w-[120px]">{scenario.user.name}</span>
            <span className="text-[var(--color-text-muted)] truncate max-w-[90px]">({scenario.user.department})</span>
          </div>

          <div className="flex items-center gap-1 text-[var(--color-text-muted)] ml-auto">
            <Monitor size={12} className="shrink-0" />
            <span className="font-mono text-[10.5px] truncate max-w-[110px]">{enriched.device.hostname}</span>
          </div>
        </div>
      </div>

      {/* Footer: Difficulty, SLA, Skills */}
      <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-text-muted)]">
        <DifficultyBadge difficulty={scenario.difficulty} />

        <div className="flex items-center gap-1 font-medium text-[11px]">
          <Clock size={12} />
          <span>SLA ~{enriched.slaMinutes}m</span>
        </div>
      </div>
    </Link>
  );
}
