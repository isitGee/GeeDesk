import { useState } from "react";
import { Monitor, Network, Server, Globe, Play, CheckCircle2, XCircle, AlertTriangle, ArrowRight } from "lucide-react";
import type { ScenarioDevice } from "../../types/scenario";
import { cn } from "../../utils/cn";

interface TopologyPingToolProps {
  device: ScenarioDevice;
  category?: string;
  tags: string[];
  fixApplied: boolean;
}

export function TopologyPingTool({ device, tags, fixApplied }: TopologyPingToolProps) {
  const [testing, setTesting] = useState(false);
  const [tested, setTested] = useState(false);

  const isDnsIssue = tags.includes("dns") && !fixApplied;
  const isGatewayIssue = (tags.includes("gateway") || tags.includes("apipa")) && !fixApplied;
  const isSwitchIssue = tags.includes("vlan") && !fixApplied;

  function runTest() {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      setTested(true);
    }, 1200);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-xs">
        <div className="flex items-center gap-2">
          <Network size={14} className="text-[var(--color-primary)]" />
          <span className="font-semibold text-[var(--color-text)]">Network Path & Topology Diagnostic</span>
          <span className="rounded bg-[var(--color-border)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-secondary)]">
            End-to-End Hop Visualizer
          </span>
        </div>
        <button
          onClick={runTest}
          disabled={testing}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
        >
          <Play size={11} fill="currentColor" /> {testing ? "Tracing Hops..." : "Run Packet Trace"}
        </button>
      </div>

      <div className="thin-scroll flex-1 overflow-y-auto p-4 space-y-5">
        {/* Topology Diagram Nodes */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
          <h4 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">
            Logical Network Path
          </h4>

          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center">
            {/* Hop 1: Host */}
            <div className="flex flex-col items-center p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] min-w-[120px]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                <Monitor size={20} />
              </span>
              <span className="font-bold text-xs text-[var(--color-text)] mt-1.5">{device.hostname}</span>
              <span className="font-mono text-[10px] text-[var(--color-text-muted)]">{device.ipAddress}</span>
              <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[var(--color-success)]">
                <CheckCircle2 size={10} /> Link Up
              </span>
            </div>

            <ArrowRight size={16} className="text-[var(--color-text-muted)] shrink-0 hidden md:block" />

            {/* Hop 2: Switch */}
            <div className="flex flex-col items-center p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] min-w-[120px]">
              <span className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                isSwitchIssue ? "bg-[var(--color-warning-soft)] text-[var(--color-warning)]" : "bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300"
              )}>
                <Network size={20} />
              </span>
              <span className="font-bold text-xs text-[var(--color-text)] mt-1.5">{device.switchName}</span>
              <span className="font-mono text-[10px] text-[var(--color-text-muted)]">{device.switchPort} · VLAN {device.vlan}</span>
              {tested && (
                <span className={cn("mt-1 flex items-center gap-1 text-[10px] font-semibold", isSwitchIssue ? "text-[var(--color-warning)]" : "text-[var(--color-success)]")}>
                  {isSwitchIssue ? <AlertTriangle size={10} /> : <CheckCircle2 size={10} />}
                  {isSwitchIssue ? "VLAN Mismatch" : "Forwarding"}
                </span>
              )}
            </div>

            <ArrowRight size={16} className="text-[var(--color-text-muted)] shrink-0 hidden md:block" />

            {/* Hop 3: Gateway Router */}
            <div className="flex flex-col items-center p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] min-w-[120px]">
              <span className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                isGatewayIssue ? "bg-[var(--color-critical-soft)] text-[var(--color-critical)]" : "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300"
              )}>
                <Server size={20} />
              </span>
              <span className="font-bold text-xs text-[var(--color-text)] mt-1.5">Default Gateway</span>
              <span className="font-mono text-[10px] text-[var(--color-text-muted)]">{device.defaultGateway || "Unconfigured"}</span>
              {tested && (
                <span className={cn("mt-1 flex items-center gap-1 text-[10px] font-semibold", isGatewayIssue ? "text-[var(--color-critical)]" : "text-[var(--color-success)]")}>
                  {isGatewayIssue ? <XCircle size={10} /> : <CheckCircle2 size={10} />}
                  {isGatewayIssue ? "Unreachable (Timeout)" : "1ms TTL=64"}
                </span>
              )}
            </div>

            <ArrowRight size={16} className="text-[var(--color-text-muted)] shrink-0 hidden md:block" />

            {/* Hop 4: Internet / DNS */}
            <div className="flex flex-col items-center p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] min-w-[120px]">
              <span className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                isDnsIssue || isGatewayIssue || isSwitchIssue
                  ? "bg-[var(--color-critical-soft)] text-[var(--color-critical)]"
                  : "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300"
              )}>
                <Globe size={20} />
              </span>
              <span className="font-bold text-xs text-[var(--color-text)] mt-1.5">DNS / Internet</span>
              <span className="font-mono text-[10px] text-[var(--color-text-muted)]">{device.dnsServers[0]}</span>
              {tested && (
                <span className={cn("mt-1 flex items-center gap-1 text-[10px] font-semibold", isDnsIssue ? "text-[var(--color-critical)]" : (isGatewayIssue || isSwitchIssue ? "text-[var(--color-text-muted)]" : "text-[var(--color-success)]"))}>
                  {isDnsIssue ? <XCircle size={10} /> : (isGatewayIssue || isSwitchIssue ? <XCircle size={10} /> : <CheckCircle2 size={10} />)}
                  {isDnsIssue ? "DNS Timeout" : (isGatewayIssue || isSwitchIssue ? "No Route" : "Resolved (14ms)")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Diagnostic Analysis Box */}
        {tested && (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-xs space-y-1.5">
            <span className="font-bold text-[var(--color-text)]">Diagnostic Finding:</span>
            {isDnsIssue ? (
              <p className="text-[var(--color-critical)] font-medium">
                Layer 1 (Physical) and Layer 3 (IP Gateway) are operational. Packets successfully reach WAN hosts by IP, but name resolution fails at the configured DNS server ({device.dnsServers[0]}).
              </p>
            ) : isGatewayIssue ? (
              <p className="text-[var(--color-critical)] font-medium">
                Packets drop immediately at the local subnet boundary. Default Gateway ({device.defaultGateway}) is unresponsive or misconfigured in IP properties.
              </p>
            ) : isSwitchIssue ? (
              <p className="text-[var(--color-warning)] font-medium">
                Switchport configuration mismatch. Broadcast traffic and DHCP offer packets are not being routed to the endpoint's expected VLAN.
              </p>
            ) : (
              <p className="text-[var(--color-success)] font-medium">
                Full end-to-end network path verified healthy. All hops respond with normal latency.
              </p>
            )}
          </div>
        )}

        <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed italic">
          This topology tool performs automated ICMP and DNS trace sequencing across each network layer, helping isolate physical, switching, routing, or application layer bottlenecks.
        </p>
      </div>
    </div>
  );
}
