import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CalendarCheck,
  Network,
  BookOpen,
  Award,
  Play,
} from "lucide-react";
import { useGame } from "../game/store";
import { scenarios } from "../data/scenarios";
import { levelFromXp } from "../types/game";
import { TicketCard } from "../components/TicketCard";

export function Dashboard() {
  const { progress } = useGame();
  const rank = levelFromXp(progress.xp);
  const solvedCount = Object.keys(progress.completedTickets).length;
  const totalCount = scenarios.length;

  const firstUnsolved = scenarios.find((s) => !progress.completedTickets[s.id]) ?? scenarios[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-10">
      {/* Service Desk Command Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-10 shadow-sm">
        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--color-primary-soft)] px-3 py-1 text-xs font-bold text-[var(--color-primary)]">
                IT Service Desk Troubleshooting Simulator
              </span>
              <span className="rounded-full bg-[var(--color-surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                Created by George Mwanga
              </span>
            </div>

            <h1 className="text-3xl font-black leading-tight tracking-tight text-[var(--color-text)] sm:text-5xl">
              Investigate. Diagnose.
              <br />
              <span className="text-[var(--color-primary)]">Verify the Root Cause.</span>
            </h1>

            <p className="max-w-xl text-xs sm:text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Step into the role of a junior IT technician in a connected corporate network.
              Query endpoints, inspect Windows event logs and services, interview employees,
              remediate networking and system faults, and author structured ITIL closure documentation.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to={`/tickets/${firstUnsolved.id}`}
                className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-xs sm:text-sm font-bold text-white transition-all hover:bg-[var(--color-primary-dark)] shadow-sm"
              >
                <Play size={16} fill="currentColor" />
                <span>Dispatch Next Incident ({firstUnsolved.ticketNumber})</span>
              </Link>

              <Link
                to="/tickets"
                className="flex items-center gap-2 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-3 text-xs sm:text-sm font-bold text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] transition-colors"
              >
                <span>View Full Queue ({totalCount})</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Connected Diagnostic Terminal Preview */}
          <div className="overflow-hidden rounded-2xl border border-[#0B1626] bg-[#070D18] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 bg-[#0B1626] px-3 py-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                <span className="ml-2 font-mono text-[11px] text-white/50">
                  GEEDESK-TIER1-CONSOLE — WS-HR-WHITFIELD
                </span>
              </div>
              <span className="font-mono text-[10px] text-emerald-400">ONLINE</span>
            </div>

            <div className="space-y-3 px-4 py-4 font-mono text-[11.5px] leading-relaxed text-white/80">
              <div>
                <p className="text-white/40">C:\Users\svc-tech&gt; ping 192.168.1.1</p>
                <p className="text-white/70">Reply from 192.168.1.1: bytes=32 time=1ms TTL=64</p>
              </div>
              <div>
                <p className="text-white/40">C:\Users\svc-tech&gt; nslookup google.com</p>
                <p className="text-[#F59E0B]">Server: UnKnown · Address: 192.168.1.10</p>
                <p className="text-[#EF4444]">*** DNS request timed out after 2 seconds</p>
              </div>
              <div className="border-t border-white/10 pt-2 text-[10.5px] text-emerald-300">
                <span>[Diagnosis Confirmed] Layer 3 Gateway healthy; Layer 7 DNS resolver failed.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technician Metric Strip */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={BadgeCheck}
          label="Technician Rank"
          value={rank.title}
          detail={`Level ${rank.level} · ${progress.xp} XP`}
        />
        <MetricCard
          icon={CheckCircle2}
          label="Incidents Cleared"
          value={`${solvedCount} of ${totalCount}`}
          detail={`${Math.round((solvedCount / totalCount) * 100)}% queue resolved`}
        />
        <MetricCard
          icon={CalendarCheck}
          label="Daily Troubleshooting Streak"
          value={`${progress.streak} Day${progress.streak === 1 ? "" : "s"}`}
          detail="Consecutive service days"
        />
        <MetricCard
          icon={BookOpen}
          label="SOP Knowledge Base"
          value="12 Technical Guides"
          detail="CCNA & Windows procedures"
        />
      </section>

      {/* Networking Focus Highlight Banner (Cisco / CCNA) */}
      <section className="rounded-3xl border border-[var(--color-border)] bg-gradient-to-r from-blue-900 to-indigo-950 p-6 sm:p-8 text-white shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-blue-300">
              <Network size={14} /> CCNA & Network+ Diagnostic Training
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Deterministic Layer 1 to Layer 7 Troubleshooting
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
              Explore interconnected scenarios involving DHCP DORA failures, APIPA (169.254.x.x) autoconfiguration,
              VLAN switchport mismatches, duplicate IP ARP collisions, and split-brain DNS resolution.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/tickets?category=Networking"
              className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-blue-950 hover:bg-blue-50 transition-colors shadow-xs"
            >
              Browse 9 Networking Scenarios
            </Link>
            <Link
              to="/kb"
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-colors"
            >
              View Networking SOPs
            </Link>
          </div>
        </div>
      </section>

      {/* Priority Ticket Queue Preview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)]">Active Service Desk Queue</h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Critical and open incidents pending technician investigation.
            </p>
          </div>
          <Link
            to="/tickets"
            className="flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] hover:underline"
          >
            <span>View All ({totalCount})</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.slice(0, 6).map((s) => (
            <TicketCard key={s.id} scenario={s} record={progress.completedTickets[s.id]} />
          ))}
        </div>
      </section>

      {/* Standard ITIL Lifecycle Flow */}
      <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-6">
          <Award size={18} className="text-[var(--color-primary)]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text)]">
            Standard Incident Lifecycle Workflow
          </h2>
        </div>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {[
            { title: "1. Intake & Scope", desc: "Interview requester and scope incident impact" },
            { title: "2. Inspect Tools", desc: "Run cmd diagnostic commands and review event logs" },
            { title: "3. Gather Clues", desc: "Compile objective technical evidence into the locker" },
            { title: "4. Isolate Fault", desc: "Diagnose root cause before applying fixes" },
            { title: "5. Remediate & Verify", desc: "Apply targeted fix and prove operational recovery" },
            { title: "6. ITIL Work Notes", desc: "Document findings, prevention, and close ticket" },
          ].map((step, i) => (
            <li key={i} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3.5 space-y-1">
              <span className="font-bold text-xs text-[var(--color-primary)]">{step.title}</span>
              <p className="text-[11.5px] text-[var(--color-text-secondary)] leading-tight">{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof BadgeCheck;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
        <Icon size={19} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-[var(--color-text-muted)] truncate">{label}</p>
        <p className="text-sm font-black text-[var(--color-text)] truncate">{value}</p>
        <p className="text-[10.5px] text-[var(--color-text-secondary)] truncate">{detail}</p>
      </div>
    </div>
  );
}
