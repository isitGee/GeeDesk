import { Network, Wifi, CheckCircle2, Shield, Layers, Radio } from "lucide-react";
import type { ScenarioDevice } from "../../types/scenario";
import { cn } from "../../utils/cn";

interface NetworkConfigToolProps {
  device: ScenarioDevice;
}

export function NetworkConfigTool({ device }: NetworkConfigToolProps) {
  const isWifi = device.connectionType === "wifi";

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-xs">
        <div className="flex items-center gap-2">
          {isWifi ? <Wifi size={14} className="text-[var(--color-primary)]" /> : <Network size={14} className="text-[var(--color-primary)]" />}
          <span className="font-semibold text-[var(--color-text)]">Network Connections — {device.hostname}</span>
          <span className="rounded bg-[var(--color-border)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-secondary)]">
            ncpa.cpl
          </span>
        </div>
        <span className="text-[11px] text-[var(--color-text-muted)]">Layer 2 / Layer 3 Interface Config</span>
      </div>

      <div className="thin-scroll flex-1 overflow-y-auto p-4 space-y-4">
        {/* Adapter Status Card */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
                {isWifi ? <Wifi size={14} className="text-[var(--color-primary)]" /> : <Network size={14} className="text-[var(--color-primary)]" />}
                {isWifi ? "Wi-Fi Adapter (802.11ax)" : "Ethernet Adapter (Gigabit)"}
              </span>
              <span className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                device.status === "online" ? "bg-[var(--color-success-soft)] text-[var(--color-success)]" : "bg-[var(--color-warning-soft)] text-[var(--color-warning)]"
              )}>
                {device.status}
              </span>
            </div>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Hardware MAC:</span>
                <span className="font-mono text-[var(--color-text)] font-semibold">{device.macAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Link Negotiation:</span>
                <span className="text-[var(--color-text)] font-semibold">1.0 Gbps / Full Duplex</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Asset Tag:</span>
                <span className="font-mono text-[var(--color-text-secondary)]">{device.assetTag}</span>
              </div>
            </div>
          </div>

          {/* Infrastructure Link Card */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
                <Layers size={14} className="text-purple-500" />
                Switch & VLAN Infrastructure
              </span>
              <span className="rounded bg-purple-100 dark:bg-purple-950 px-2 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-300">
                VLAN {device.vlan}
              </span>
            </div>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Switch Name:</span>
                <span className="font-mono text-[var(--color-text)] font-semibold">{device.switchName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Interface Port:</span>
                <span className="font-mono text-[var(--color-text)] font-semibold">{device.switchPort}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">VLAN Name:</span>
                <span className="text-[var(--color-text)]">{device.vlanName ?? "Corporate-Data"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Windows IPv4 Properties Simulated Dialog */}
        <div className="rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-2 mb-3">
            <Shield size={15} className="text-[var(--color-primary)]" />
            <h4 className="text-xs font-bold text-[var(--color-text)]">
              Internet Protocol Version 4 (TCP/IPv4) Properties
            </h4>
          </div>

          <div className="space-y-3 text-xs max-w-lg">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-[var(--color-text)]">
                <CheckCircle2 size={13} className="text-[var(--color-primary)]" />
                <span>Currently Active Configuration</span>
              </div>

              <div className="grid grid-cols-[130px_1fr] gap-2 pt-1 font-mono text-[11.5px]">
                <span className="text-[var(--color-text-muted)] font-sans">IPv4 Address:</span>
                <span className="font-bold text-[var(--color-text)]">{device.ipAddress}</span>

                <span className="text-[var(--color-text-muted)] font-sans">Subnet Mask:</span>
                <span className="text-[var(--color-text)]">{device.subnetMask}</span>

                <span className="text-[var(--color-text-muted)] font-sans">Default Gateway:</span>
                <span className="text-[var(--color-text)]">{device.defaultGateway || "None (Unreachable)"}</span>

                <span className="text-[var(--color-text-muted)] font-sans">Primary DNS:</span>
                <span className="text-[var(--color-text)]">{device.dnsServers[0] ?? "192.168.1.1"}</span>

                {device.dnsServers[1] && (
                  <>
                    <span className="text-[var(--color-text-muted)] font-sans">Secondary DNS:</span>
                    <span className="text-[var(--color-text)]">{device.dnsServers[1]}</span>
                  </>
                )}
              </div>
            </div>

            {isWifi && device.wifiSsid && (
              <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-2.5">
                <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1.5">
                  <Radio size={14} className="text-[var(--color-primary)]" />
                  Connected SSID: <strong>{device.wifiSsid}</strong>
                </span>
                <span className="text-[11px] font-semibold text-[var(--color-success)]">Signal: 94% (-54 dBm)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
