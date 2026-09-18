import { useState } from "react";
import { ChevronRight, ChevronDown, Monitor, HardDrive, Cpu, AlertTriangle, CheckCircle, ShieldAlert, Wifi } from "lucide-react";
import type { SimulatedDeviceNode } from "../../types/scenario";
import { cn } from "../../utils/cn";

interface DeviceManagerToolProps {
  devices: SimulatedDeviceNode[];
  hostname: string;
}

export function DeviceManagerTool({ devices, hostname }: DeviceManagerToolProps) {
  const [selectedDevice, setSelectedDevice] = useState<SimulatedDeviceNode | null>(devices[0] ?? null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Network Adapters": true,
    "Display Adapters": true,
    "Disk Drives": true,
  });

  const categories = Array.from(new Set(devices.map((d) => d.category)));

  function toggleCategory(cat: string) {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }

  function getCategoryIcon(cat: string) {
    switch (cat) {
      case "Network Adapters":
        return <Wifi size={14} className="text-[var(--color-primary)]" />;
      case "Display Adapters":
        return <Monitor size={14} className="text-purple-500" />;
      case "Disk Drives":
        return <HardDrive size={14} className="text-amber-500" />;
      default:
        return <Cpu size={14} className="text-emerald-500" />;
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      {/* MMC Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-xs">
        <div className="flex items-center gap-2">
          <Monitor size={14} className="text-[var(--color-primary)]" />
          <span className="font-semibold text-[var(--color-text)]">Device Manager — {hostname}</span>
          <span className="rounded bg-[var(--color-border)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-secondary)]">
            devmgmt.msc
          </span>
        </div>
        <span className="text-[11px] text-[var(--color-text-muted)]">{devices.length} hardware nodes</span>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden sm:flex-row">
        {/* Tree View */}
        <div className="thin-scroll flex-1 overflow-y-auto border-r border-[var(--color-border)] p-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 py-1 text-xs font-bold text-[var(--color-text)]">
              <Monitor size={14} className="text-[var(--color-primary)]" />
              <span>{hostname}</span>
            </div>

            <div className="pl-3 space-y-1">
              {categories.map((cat) => {
                const isExpanded = !!expandedCategories[cat];
                const catDevices = devices.filter((d) => d.category === cat);
                const hasWarning = catDevices.some((d) => d.status !== "OK");

                return (
                  <div key={cat} className="space-y-0.5">
                    <button
                      onClick={() => toggleCategory(cat)}
                      className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
                    >
                      {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      {getCategoryIcon(cat)}
                      <span>{cat}</span>
                      {hasWarning && (
                        <AlertTriangle size={12} className="ml-auto text-[var(--color-warning)]" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="pl-5 space-y-0.5">
                        {catDevices.map((dev) => {
                          const isSelected = selectedDevice?.name === dev.name;
                          return (
                            <button
                              key={dev.name}
                              onClick={() => setSelectedDevice(dev)}
                              className={cn(
                                "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-left transition-colors",
                                isSelected
                                  ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)] font-semibold"
                                  : "text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
                              )}
                            >
                              {dev.status === "OK" ? (
                                <CheckCircle size={12} className="text-[var(--color-success)] shrink-0" />
                              ) : (
                                <AlertTriangle size={12} className="text-[var(--color-warning)] shrink-0" />
                              )}
                              <span className="truncate">{dev.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Device Properties Pane */}
        <div className="w-full sm:w-[300px] p-4 bg-[var(--color-surface)] overflow-y-auto thin-scroll space-y-3">
          {selectedDevice ? (
            <div className="space-y-3">
              <div className="border-b border-[var(--color-border)] pb-2">
                <span className="text-[10.5px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  Device Properties
                </span>
                <h4 className="font-bold text-xs text-[var(--color-text)] mt-1">{selectedDevice.name}</h4>
                <span className="text-[11px] text-[var(--color-text-muted)]">{selectedDevice.category}</span>
              </div>

              <div className="rounded-lg border border-[var(--color-border)] p-3 space-y-2 text-xs">
                <div>
                  <span className="text-[11px] text-[var(--color-text-muted)] block">Device Status:</span>
                  <div className="mt-1 flex items-start gap-1.5">
                    {selectedDevice.status === "OK" ? (
                      <CheckCircle size={14} className="text-[var(--color-success)] shrink-0 mt-0.5" />
                    ) : (
                      <ShieldAlert size={14} className="text-[var(--color-warning)] shrink-0 mt-0.5" />
                    )}
                    <span className={cn("text-[11.5px] leading-tight font-medium", selectedDevice.status === "OK" ? "text-[var(--color-text)]" : "text-[var(--color-warning)] font-semibold")}>
                      {selectedDevice.statusCode ?? (selectedDevice.status === "OK" ? "This device is working properly." : "Hardware reporting issue.")}
                    </span>
                  </div>
                </div>

                {selectedDevice.driverVersion && (
                  <div className="border-t border-[var(--color-border)] pt-2">
                    <span className="text-[11px] text-[var(--color-text-muted)] block">Driver Version:</span>
                    <span className="font-mono text-xs text-[var(--color-text)]">{selectedDevice.driverVersion}</span>
                  </div>
                )}
              </div>

              <p className="text-[10.5px] text-[var(--color-text-muted)] leading-relaxed italic">
                Device Manager errors like Code 10 or Code 43 indicate hardware controller or firmware issues requiring driver triage or hardware replacement.
              </p>
            </div>
          ) : (
            <p className="text-center text-xs text-[var(--color-text-muted)] py-12">Select a device from the hardware tree.</p>
          )}
        </div>
      </div>
    </div>
  );
}
