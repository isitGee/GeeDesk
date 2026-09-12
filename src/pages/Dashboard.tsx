import { Link } from "react-router-dom";
import { ArrowRight, Flame, ListChecks, Trophy, Zap } from "lucide-react";
import { useGame } from "../game/store";
import { scenarios } from "../data/scenarios";
import { levelFromXp } from "../types/game";
import { TicketCard } from "../components/TicketCard";

export function Dashboard() {
  const { progress } = useGame();
  const { level, xpIntoLevel, xpForNext } = levelFromXp(progress.xp);
  const solvedCount = Object.keys(progress.completedTickets).length;
  const hasPlayed = progress.xp > 0;

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6">
      {/* Hero */}
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">
            IT troubleshooting simulator
          </p>
          <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-[var(--color-text)] sm:text-5xl">
            Diagnose real tickets.
            <br />
            Prove your fix works.
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
            GeeDesk hands you a helpdesk ticket, a simulated terminal, and a user who's waiting on you. Investigate,
            form a diagnosis, apply a fix, and verify it — before the game scores how you actually got there.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/tickets"
              className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
            >
              Open the ticket queue
              <ArrowRight size={16} />
            </Link>
            <span className="text-[13px] text-[var(--color-text-muted)]">No account needed — your progress saves on this device.</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#0B1626] bg-[#0B1626] shadow-[0_24px_60px_-24px_rgba(0,103,192,0.45)]">
          <div className="flex items-center gap-1.5 border-b border-white/5 px-3 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#DC2626]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#D97706]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]/70" />
            <span className="ml-2 font-mono text-[11px] text-white/40">NET-1042 — investigation log</span>
          </div>
          <div className="space-y-3 px-4 py-4 font-mono text-[12px] leading-relaxed">
            <div>
              <p className="text-white/40">C:\Users\svc-tech&gt; ping 192.168.1.1</p>
              <p className="text-white/70">Reply from 192.168.1.1: bytes=32 time=1ms TTL=64</p>
            </div>
            <div>
              <p className="text-white/40">C:\Users\svc-tech&gt; nslookup google.com</p>
              <p className="text-[#F59E0B]">*** Request to UnKnown timed out</p>
            </div>
            <div>
              <p className="text-white/40">C:\Users\svc-tech&gt; _</p>
            </div>
          </div>
        </div>
      </section>

      {/* Player stats */}
      {hasPlayed && (
        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={Zap} label={`Level ${level}`} value={`${xpIntoLevel}/${xpForNext} XP`} />
          <StatCard icon={ListChecks} label="Tickets solved" value={String(solvedCount)} />
          <StatCard icon={Flame} label="Day streak" value={String(progress.streak)} />
        </section>
      )}

      {/* Ticket queue preview */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-text)]">Open tickets</h2>
          <Link to="/tickets" className="text-[13px] font-semibold text-[var(--color-primary)] hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((s) => (
            <TicketCard key={s.id} scenario={s} record={progress.completedTickets[s.id]} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div className="mb-5 flex items-center gap-2">
          <Trophy size={16} className="text-[var(--color-primary)]" />
          <h2 className="text-sm font-bold text-[var(--color-text)]">How a ticket plays out</h2>
        </div>
        <ol className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[
            "Read the ticket and the user's report",
            "Investigate with terminal commands and questions",
            "Submit a diagnosis based on the evidence",
            "Apply and verify a fix",
            "Get a scored breakdown of how you did",
          ].map((step, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[10.5px] font-bold text-[var(--color-primary)]">
                {i + 1}
              </span>
              <p className="text-[12.5px] leading-snug text-[var(--color-text-secondary)]">{step}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Zap; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
        <Icon size={18} />
      </span>
      <div>
        <p className="text-[11.5px] text-[var(--color-text-muted)]">{label}</p>
        <p className="text-sm font-bold text-[var(--color-text)]">{value}</p>
      </div>
    </div>
  );
}
