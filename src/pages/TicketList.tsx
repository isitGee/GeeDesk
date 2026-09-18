import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, LayoutGrid, List, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";
import { useGame } from "../game/store";
import { scenarios } from "../data/scenarios";
import { getEnrichedScenario } from "../data/scenarioEnricher";
import { TicketCard } from "../components/TicketCard";
import { cn } from "../utils/cn";

export function TicketList() {
  const { progress } = useGame();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [priority, setPriority] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const categories = ["All", "Networking", "Windows", "Hardware", "Security", "General IT"];
  const priorities = ["All", "Critical", "High", "Medium", "Low"];
  const difficulties = ["All", "beginner", "intermediate", "advanced"];

  const filteredScenarios = scenarios.filter((s) => {
    const enriched = getEnrichedScenario(s);
    const isCompleted = !!progress.completedTickets[s.id];

    if (category !== "All" && s.category !== category) return false;
    if (priority !== "All" && enriched.priority !== priority) return false;
    if (difficulty !== "All" && s.difficulty !== difficulty) return false;
    if (statusFilter === "Resolved" && !isCompleted) return false;
    if (statusFilter === "Open" && isCompleted) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchText = `${s.ticketNumber} ${s.title} ${s.ticketDescription} ${s.user.name} ${s.user.department} ${enriched.device.hostname} ${enriched.device.ipAddress}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    return true;
  });

  const totalCount = scenarios.length;
  const resolvedCount = Object.keys(progress.completedTickets).length;
  const criticalCount = scenarios.filter((s) => getEnrichedScenario(s).priority === "Critical").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      {/* Title & Queue Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
            Service Desk Incident Management
          </span>
          <h1 className="text-3xl font-black tracking-tight text-[var(--color-text)] mt-0.5">
            Incident Queue
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Triage, investigate, and resolve user-reported incidents according to enterprise SLA targets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs">
            <span className="text-[var(--color-text-muted)]">Active Pool: </span>
            <strong className="text-[var(--color-text)]">{totalCount} Incidents</strong>
          </div>
          <div className="rounded-xl border border-[var(--color-critical)]/30 bg-[var(--color-critical-soft)] px-3 py-1.5 text-xs text-[var(--color-critical)] font-bold">
            {criticalCount} Critical
          </div>
          <div className="rounded-xl border border-[var(--color-success)]/30 bg-[var(--color-success-soft)] px-3 py-1.5 text-xs text-[var(--color-success)] font-bold">
            {resolvedCount} Resolved
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search box */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-3 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by Ticket #, Requester, IP, Hostname..."
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-9 pr-3 text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none shadow-2xs"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold text-[var(--color-text)] focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          {/* Priority Dropdown */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold text-[var(--color-text)] focus:outline-none"
          >
            {priorities.map((p) => (
              <option key={p} value={p}>
                Priority: {p}
              </option>
            ))}
          </select>

          {/* Difficulty Dropdown */}
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold text-[var(--color-text)] focus:outline-none capitalize"
          >
            {difficulties.map((d) => (
              <option key={d} value={d}>
                Difficulty: {d}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold text-[var(--color-text)] focus:outline-none"
          >
            <option value="All">Status: All</option>
            <option value="Open">Status: Open Only</option>
            <option value="Resolved">Status: Resolved Only</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1 text-xs">
          <button
            onClick={() => setViewMode("table")}
            className={cn(
              "flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-colors",
              viewMode === "table"
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            )}
          >
            <List size={13} />
            <span>Table</span>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-colors",
              viewMode === "grid"
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            )}
          >
            <LayoutGrid size={13} />
            <span>Cards</span>
          </button>
        </div>
      </div>

      {/* Main Ticket Queue Viewport */}
      {filteredScenarios.length === 0 ? (
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center text-xs text-[var(--color-text-muted)] space-y-2">
          <AlertCircle size={32} className="mx-auto text-[var(--color-text-muted)] opacity-50" />
          <h3 className="font-bold text-sm text-[var(--color-text)]">No Incidents Found</h3>
          <p>No tickets match your active filter criteria. Try resetting search filters.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredScenarios.map((s) => (
            <TicketCard key={s.id} scenario={s} record={progress.completedTickets[s.id]} />
          ))}
        </div>
      ) : (
        /* Professional Enterprise Table View */
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--color-surface-muted)] font-semibold text-[var(--color-text-secondary)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="py-3 pl-4 pr-2">Ticket #</th>
                  <th className="px-3 py-3">Priority</th>
                  <th className="px-3 py-3">Title & Issue</th>
                  <th className="px-3 py-3">Requester</th>
                  <th className="px-3 py-3">Device / Host</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">SLA</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3 text-right pr-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[12px]">
                {filteredScenarios.map((s) => {
                  const enriched = getEnrichedScenario(s);
                  const record = progress.completedTickets[s.id];
                  const isResolved = !!record;
                  const scorePct = record ? Math.round((record.bestScore / record.bestScoreMax) * 100) : null;

                  return (
                    <tr key={s.id} className="hover:bg-[var(--color-surface-muted)] transition-colors group">
                      <td className="py-3 pl-4 pr-2 font-mono font-bold text-[var(--color-primary)] whitespace-nowrap">
                        {s.ticketNumber}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span
                          className={cn(
                            "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase",
                            enriched.priority === "Critical" && "bg-[var(--color-critical-soft)] text-[var(--color-critical)]",
                            enriched.priority === "High" && "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
                            enriched.priority === "Medium" && "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300",
                            enriched.priority === "Low" && "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          )}
                        >
                          {enriched.priority}
                        </span>
                      </td>
                      <td className="px-3 py-3 max-w-xs">
                        <div className="font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                          {s.title}
                        </div>
                        <div className="text-[11px] text-[var(--color-text-muted)] line-clamp-1">
                          {s.ticketDescription}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="font-semibold text-[var(--color-text)]">{s.user.name}</div>
                        <div className="text-[10.5px] text-[var(--color-text-muted)]">{s.user.department}</div>
                      </td>
                      <td className="px-3 py-3 font-mono text-[11px] whitespace-nowrap">
                        <div className="text-[var(--color-text)]">{enriched.device.hostname}</div>
                        <div className="text-[var(--color-text-muted)] text-[10px]">{enriched.device.ipAddress}</div>
                      </td>
                      <td className="px-3 py-3 text-[var(--color-text-secondary)] whitespace-nowrap">
                        {s.category}
                      </td>
                      <td className="px-3 py-3 text-[var(--color-text-muted)] whitespace-nowrap font-medium text-[11px]">
                        ~{enriched.slaMinutes}m
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {isResolved ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-success-soft)] px-2 py-0.5 text-[11px] font-bold text-[var(--color-success)]">
                            <CheckCircle2 size={12} /> {scorePct}%
                          </span>
                        ) : (
                          <span className="rounded-full bg-[var(--color-surface-muted)] px-2 py-0.5 text-[10.5px] font-semibold text-[var(--color-text-muted)]">
                            Open
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right pr-4 whitespace-nowrap">
                        <Link
                          to={`/tickets/${s.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-primary-soft)] px-2.5 py-1 text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                        >
                          <span>{isResolved ? "Reopen" : "Investigate"}</span>
                          <ArrowUpRight size={12} />
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
    </div>
  );
}
