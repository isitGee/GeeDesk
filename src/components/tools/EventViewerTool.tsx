import { useState } from "react";
import { AlertCircle, AlertTriangle, Info, Search, Filter, ShieldAlert } from "lucide-react";
import type { SimulatedEventLog } from "../../types/scenario";
import { cn } from "../../utils/cn";

interface EventViewerToolProps {
  logs: SimulatedEventLog[];
  hostname: string;
}

export function EventViewerTool({ logs, hostname }: EventViewerToolProps) {
  const [selectedId, setSelectedId] = useState<string | null>(logs[0]?.id ?? null);
  const [filterLevel, setFilterLevel] = useState<string>("All");
  const [search, setSearch] = useState("");

  const filteredLogs = logs.filter((log) => {
    if (filterLevel !== "All" && log.level !== filterLevel) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.source.toLowerCase().includes(q) ||
        String(log.eventId).includes(q) ||
        log.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedLog = logs.find((l) => l.id === selectedId) ?? filteredLogs[0] ?? null;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      {/* Windows 11 MMC Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-xs">
        <div className="flex items-center gap-2">
          <ShieldAlert size={14} className="text-[var(--color-primary)]" />
          <span className="font-semibold text-[var(--color-text)]">Event Viewer (Local) — {hostname}</span>
          <span className="rounded bg-[var(--color-border)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-secondary)]">
            Windows Logs &gt; System
          </span>
        </div>
        <span className="text-[11px] text-[var(--color-text-muted)]">{filteredLogs.length} events logged</span>
      </div>

      {/* Toolbar / Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] p-2">
        <div className="relative flex-1 min-w-[140px]">
          <Search size={13} className="absolute left-2.5 top-2.5 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Event ID, Source, keywords..."
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1.5 pl-8 pr-3 text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 text-xs">
          <Filter size={12} className="text-[var(--color-text-muted)]" />
          {["All", "Error", "Warning", "Information"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                filterLevel === lvl
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
              )}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: Event Table & Details Pane */}
      <div className="flex flex-1 flex-col overflow-hidden sm:flex-row">
        {/* Table list */}
        <div className="thin-scroll flex-1 overflow-y-auto border-r border-[var(--color-border)]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-[var(--color-surface-muted)] font-semibold text-[var(--color-text-secondary)]">
              <tr className="border-b border-[var(--color-border)]">
                <th className="py-2 pl-3 pr-2">Level</th>
                <th className="px-2 py-2">Date and Time</th>
                <th className="px-2 py-2">Source</th>
                <th className="px-2 py-2">Event ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] font-mono text-[11.5px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-[var(--color-text-muted)]">
                    No event records match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isSelected = selectedLog?.id === log.id;
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedId(log.id)}
                      className={cn(
                        "cursor-pointer transition-colors",
                        isSelected
                          ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)] font-semibold"
                          : "hover:bg-[var(--color-surface-muted)] text-[var(--color-text)]"
                      )}
                    >
                      <td className="py-2 pl-3 pr-2">
                        <span className="flex items-center gap-1.5">
                          {log.level === "Error" && <AlertCircle size={13} className="text-[var(--color-critical)] shrink-0" />}
                          {log.level === "Warning" && <AlertTriangle size={13} className="text-[var(--color-warning)] shrink-0" />}
                          {log.level === "Information" && <Info size={13} className="text-[var(--color-primary)] shrink-0" />}
                          <span>{log.level}</span>
                        </span>
                      </td>
                      <td className="px-2 py-2 text-[var(--color-text-secondary)]">{log.timestamp}</td>
                      <td className="px-2 py-2 truncate max-w-[140px]">{log.source}</td>
                      <td className="px-2 py-2">{log.eventId}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Event Properties Inspector Pane */}
        <div className="thin-scroll w-full p-4 overflow-y-auto bg-[var(--color-surface)] sm:w-[320px]">
          {selectedLog ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                <div className="flex items-center gap-2">
                  {selectedLog.level === "Error" && <AlertCircle size={16} className="text-[var(--color-critical)]" />}
                  {selectedLog.level === "Warning" && <AlertTriangle size={16} className="text-[var(--color-warning)]" />}
                  {selectedLog.level === "Information" && <Info size={16} className="text-[var(--color-primary)]" />}
                  <h4 className="font-bold text-xs text-[var(--color-text)]">Event {selectedLog.eventId} Properties</h4>
                </div>
                {selectedLog.isKeyFinding && (
                  <span className="rounded bg-[var(--color-warning-soft)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--color-warning)]">
                    Diagnostic Clue
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[var(--color-text-muted)] block">Log Name:</span>
                  <span className="font-mono text-[var(--color-text)]">System</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] block">Source:</span>
                  <span className="font-mono text-[var(--color-text)]">{selectedLog.source}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] block">Logged:</span>
                  <span className="font-mono text-[var(--color-text)]">{selectedLog.timestamp}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] block">Computer:</span>
                  <span className="font-mono text-[var(--color-text)]">{hostname}</span>
                </div>
              </div>

              <div className="border-t border-[var(--color-border)] pt-2">
                <span className="text-[11px] font-bold text-[var(--color-text-secondary)] block mb-1">
                  General Description:
                </span>
                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-2.5 font-mono text-[11.5px] leading-relaxed text-[var(--color-text)] whitespace-pre-wrap">
                  {selectedLog.description}
                </div>
              </div>

              <p className="text-[10.5px] text-[var(--color-text-muted)] leading-tight italic">
                Event logs capture real operating system errors and service state transitions. Correlate with timestamp of reported symptoms.
              </p>
            </div>
          ) : (
            <p className="py-12 text-center text-xs text-[var(--color-text-muted)]">Select an event from the list to view its properties.</p>
          )}
        </div>
      </div>
    </div>
  );
}
