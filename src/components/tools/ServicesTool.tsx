import { useState } from "react";
import { Play, Square, RotateCcw, Cog, CheckCircle2, Shield } from "lucide-react";
import type { SimulatedService } from "../../types/scenario";
import { cn } from "../../utils/cn";

interface ServicesToolProps {
  services: SimulatedService[];
  serviceOverrides: Record<string, "Running" | "Stopped">;
  onToggleService: (serviceName: string, newStatus: "Running" | "Stopped") => void;
  hostname: string;
}

export function ServicesTool({
  services,
  serviceOverrides,
  onToggleService,
  hostname,
}: ServicesToolProps) {
  const [selectedName, setSelectedName] = useState<string>(services[0]?.name ?? "");
  const [feedback, setFeedback] = useState<string | null>(null);

  const mergedServices = services.map((s) => ({
    ...s,
    status: serviceOverrides[s.name] ?? s.status,
  }));

  const selectedService = mergedServices.find((s) => s.name === selectedName) ?? mergedServices[0];

  function handleAction(action: "start" | "stop" | "restart") {
    if (!selectedService) return;
    const targetStatus = action === "stop" ? "Stopped" : "Running";
    onToggleService(selectedService.name, targetStatus);
    setFeedback(`Service '${selectedService.displayName}' ${action === "start" ? "started" : action === "stop" ? "stopped" : "restarted"} successfully.`);
    setTimeout(() => setFeedback(null), 4000);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      {/* MMC Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-xs">
        <div className="flex items-center gap-2">
          <Cog size={15} className="text-[var(--color-primary)]" />
          <span className="font-semibold text-[var(--color-text)]">Services (Local) — {hostname}</span>
          <span className="rounded bg-[var(--color-border)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-secondary)]">
            services.msc
          </span>
        </div>
        <span className="text-[11px] text-[var(--color-text-muted)]">{mergedServices.length} managed services</span>
      </div>

      {/* Action / Control Toolbar */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleAction("start")}
            disabled={!selectedService?.canToggle || selectedService?.status === "Running"}
            className={cn(
              "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
              selectedService?.status !== "Running" && selectedService?.canToggle
                ? "bg-[var(--color-success)] text-white hover:opacity-90"
                : "cursor-not-allowed bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
            )}
          >
            <Play size={11} fill="currentColor" /> Start
          </button>
          <button
            onClick={() => handleAction("stop")}
            disabled={!selectedService?.canToggle || selectedService?.status === "Stopped"}
            className={cn(
              "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
              selectedService?.status === "Running" && selectedService?.canToggle
                ? "bg-[var(--color-critical)] text-white hover:opacity-90"
                : "cursor-not-allowed bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
            )}
          >
            <Square size={11} fill="currentColor" /> Stop
          </button>
          <button
            onClick={() => handleAction("restart")}
            disabled={!selectedService?.canToggle}
            className={cn(
              "flex items-center gap-1 rounded-lg border border-[var(--color-border-strong)] px-2.5 py-1 text-xs font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-muted)]",
              !selectedService?.canToggle && "cursor-not-allowed opacity-50"
            )}
          >
            <RotateCcw size={11} /> Restart
          </button>
        </div>

        {feedback && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-success)] font-medium">
            <CheckCircle2 size={13} />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* Main Table and Detail */}
      <div className="flex flex-1 flex-col overflow-hidden sm:flex-row">
        <div className="thin-scroll flex-1 overflow-y-auto border-r border-[var(--color-border)]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-[var(--color-surface-muted)] font-semibold text-[var(--color-text-secondary)]">
              <tr className="border-b border-[var(--color-border)]">
                <th className="py-2 pl-3 pr-2">Display Name</th>
                <th className="px-2 py-2">Service Name</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Startup Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] font-mono text-[11.5px]">
              {mergedServices.map((svc) => {
                const isSelected = selectedService?.name === svc.name;
                const isRunning = svc.status === "Running";
                return (
                  <tr
                    key={svc.name}
                    onClick={() => setSelectedName(svc.name)}
                    className={cn(
                      "cursor-pointer transition-colors",
                      isSelected
                        ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)] font-semibold"
                        : "hover:bg-[var(--color-surface-muted)] text-[var(--color-text)]"
                    )}
                  >
                    <td className="py-2 pl-3 pr-2 font-sans font-medium">{svc.displayName}</td>
                    <td className="px-2 py-2 text-[var(--color-text-secondary)]">{svc.name}</td>
                    <td className="px-2 py-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                          isRunning
                            ? "bg-[var(--color-success-soft)] text-[var(--color-success)]"
                            : "bg-[var(--color-critical-soft)] text-[var(--color-critical)]"
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full", isRunning ? "bg-[var(--color-success)]" : "bg-[var(--color-critical)]")} />
                        {svc.status}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-[var(--color-text-secondary)]">{svc.startupType}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Selected Service Detail Panel */}
        <div className="w-full sm:w-[280px] p-4 bg-[var(--color-surface)] overflow-y-auto thin-scroll space-y-3">
          {selectedService && (
            <>
              <div className="border-b border-[var(--color-border)] pb-2">
                <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  Service Properties
                </span>
                <h4 className="font-bold text-sm text-[var(--color-text)] mt-0.5">{selectedService.displayName}</h4>
                <p className="font-mono text-xs text-[var(--color-text-muted)]">service: {selectedService.name}</p>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] block mb-1">
                  Description:
                </span>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-2.5">
                  {selectedService.description ?? "Provides core operating system background functionality."}
                </p>
              </div>

              <div className="rounded-lg border border-[var(--color-border)] p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Current State:</span>
                  <span className={cn("font-bold", selectedService.status === "Running" ? "text-[var(--color-success)]" : "text-[var(--color-critical)]")}>
                    {selectedService.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Startup Type:</span>
                  <span className="text-[var(--color-text)] font-semibold">{selectedService.startupType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Account:</span>
                  <span className="text-[var(--color-text)] font-mono">LocalSystem</span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-[var(--color-primary-soft)] p-2.5 text-[11px] text-[var(--color-primary)]">
                <Shield size={14} className="shrink-0" />
                <span>Modifying services alters live process state in this simulated Windows host.</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
