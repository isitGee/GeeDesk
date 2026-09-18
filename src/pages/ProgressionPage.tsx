import { useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Award, GitBranch, CalendarCheck, Shield, CheckCircle2, RotateCcw, ArrowRight, Network, Monitor, AlertTriangle } from "lucide-react";
import { useGame } from "../game/store";
import { scenarios } from "../data/scenarios";
import { levelFromXp } from "../types/game";
import { ACHIEVEMENT_DEFS } from "../game/persistence";
import { cn } from "../utils/cn";

export function ProgressionPage() {
  const { progress, resetProgress } = useGame();
  const rank = levelFromXp(progress.xp);
  const [confirmReset, setConfirmReset] = useState(false);

  const solvedCount = Object.keys(progress.completedTickets).length;
  const pctIntoLevel = Math.round((rank.xpIntoLevel / rank.xpForNext) * 100);

  // Domains list with unified professional icons
  const domains = [
    { name: "Networking", icon: Network },
    { name: "Windows Administration", icon: Monitor },
    { name: "Hardware & Peripherals", icon: Shield },
    { name: "Cybersecurity", icon: Shield },
    { name: "Troubleshooting Methodology", icon: GitBranch },
    { name: "Communication & Documentation", icon: Award },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
      {/* Technician Dossier Header */}
      <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white shadow-md">
              <Trophy size={32} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                  Technician Service Record
                </span>
                <span className="rounded bg-[var(--color-surface-muted)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-text-secondary)]">
                  {rank.tier}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--color-text)] mt-0.5">
                {rank.title}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Level {rank.level} · {progress.xp} Total Experience Points
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-2 text-xs font-bold text-[var(--color-text)]">
              <CheckCircle2 size={16} className="text-[var(--color-success)]" />
              <span>{solvedCount} / {scenarios.length} Incidents Cleared</span>
            </div>

            {progress.streak > 0 && (
              <div className="flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-2 text-xs font-bold text-[var(--color-text)]">
                <CalendarCheck size={16} className="text-[var(--color-primary)]" />
                <span>{progress.streak} Day Active Streak</span>
              </div>
            )}
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="mt-6 border-t border-[var(--color-border)] pt-4 space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[var(--color-text-secondary)]">Progress to Level {rank.level + 1}</span>
            <span className="font-mono text-[var(--color-text)]">
              {rank.xpIntoLevel} / {rank.xpForNext} XP ({pctIntoLevel}%)
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
            <div
              className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
              style={{ width: `${pctIntoLevel}%` }}
            />
          </div>
        </div>
      </div>

      {/* 6 Core IT Competencies */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-text)]">Core Competency Matrix</h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Demonstrated accuracy across foundational enterprise support domains.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((dom) => {
            const stat = progress.domainStats[dom.name] ?? { solved: 0, total: 0, accuracy: 100 };
            const Icon = dom.icon;
            return (
              <div
                key={dom.name}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                      <Icon size={16} />
                    </span>
                    <h3 className="font-bold text-xs text-[var(--color-text)]">{dom.name}</h3>
                  </div>
                  <span className="font-mono text-xs font-bold text-[var(--color-text)]">
                    {stat.accuracy}%
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
                    <div
                      className="h-full rounded-full bg-[var(--color-primary)]"
                      style={{ width: `${stat.accuracy}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-[var(--color-text-muted)]">
                    <span>{stat.solved} successfully resolved</span>
                    <span>{stat.total} attempted</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Career Milestones & Badges */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-text)]">Career Milestones & Certifications</h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Professional achievements earned through consistent diagnostic excellence.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(ACHIEVEMENT_DEFS).map(([id, def]) => {
            const isUnlocked = progress.achievements.includes(id);
            return (
              <div
                key={id}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-4 transition-all shadow-xs",
                  isUnlocked
                    ? "border-[var(--color-warning)]/40 bg-[var(--color-warning-soft)]/20"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] opacity-50"
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                    isUnlocked ? "bg-[var(--color-warning-soft)] text-[var(--color-warning)]" : "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
                  )}
                >
                  <Award size={18} />
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-[var(--color-text)]">{def.label}</h4>
                    {isUnlocked && <CheckCircle2 size={12} className="text-[var(--color-success)]" />}
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--color-text-secondary)] leading-snug">
                    {def.description}
                  </p>
                  <span className="mt-1.5 inline-block text-[9.5px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                    {def.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Solved Incidents Archive */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--color-text)]">Incident Clearance History</h2>

        {solvedCount === 0 ? (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-xs text-[var(--color-text-muted)]">
            No tickets resolved yet. Open the queue to begin your first investigation.
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--color-surface-muted)] font-semibold text-[var(--color-text-secondary)] border-b border-[var(--color-border)]">
                  <tr>
                    <th className="py-2.5 pl-4 pr-2">Ticket #</th>
                    <th className="px-3 py-2.5">Title</th>
                    <th className="px-3 py-2.5">Category</th>
                    <th className="px-3 py-2.5">Score</th>
                    <th className="px-3 py-2.5">Attempts</th>
                    <th className="px-3 py-2.5 text-right pr-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)] text-[12px]">
                  {Object.entries(progress.completedTickets).map(([scenId, rec]) => {
                    const scen = scenarios.find((s) => s.id === scenId);
                    if (!scen) return null;
                    const pct = Math.round((rec.bestScore / rec.bestScoreMax) * 100);
                    return (
                      <tr key={scenId} className="hover:bg-[var(--color-surface-muted)] transition-colors">
                        <td className="py-3 pl-4 pr-2 font-mono font-bold text-[var(--color-primary)]">
                          {scen.ticketNumber}
                        </td>
                        <td className="px-3 py-3 font-semibold text-[var(--color-text)] max-w-xs truncate">
                          {scen.title}
                        </td>
                        <td className="px-3 py-3 text-[var(--color-text-secondary)]">{scen.category}</td>
                        <td className="px-3 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold",
                              pct >= 90 ? "bg-[var(--color-success-soft)] text-[var(--color-success)]" : "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                            )}
                          >
                            {pct}%
                          </span>
                        </td>
                        <td className="px-3 py-3 text-[var(--color-text-muted)] font-mono">{rec.attempts}</td>
                        <td className="px-3 py-3 text-right pr-4">
                          <Link
                            to={`/tickets/${scenId}`}
                            className="font-bold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
                          >
                            <span>Re-investigate</span>
                            <ArrowRight size={11} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Danger Zone: Reset Progress */}
      <section className="border-t border-[var(--color-border)] pt-6">
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-critical)] transition-colors"
          >
            <RotateCcw size={13} />
            <span>Reset local progression data</span>
          </button>
        ) : (
          <div className="rounded-2xl border border-[var(--color-critical)]/30 bg-[var(--color-critical-soft)] p-4 text-xs space-y-2">
            <p className="font-bold text-[var(--color-critical)] flex items-center gap-1.5">
              <AlertTriangle size={15} /> Confirm Reset
            </p>
            <p className="text-[var(--color-text)]">
              This will reset your technician rank, completed ticket records, and unlocked achievements back to level 1.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  resetProgress();
                  setConfirmReset(false);
                }}
                className="rounded-lg bg-[var(--color-critical)] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
              >
                Yes, Reset All Progress
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-bold text-[var(--color-text)]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
