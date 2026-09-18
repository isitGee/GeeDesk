/**
 * Connected Environment State Engine
 *
 * Implements a deterministic, reactive state machine for enterprise IT endpoints.
 * Actions trigger realistic technical transitions and produce authentic consequences.
 */

export interface EndpointEnvironmentState {
  hostname: string;
  linkState: "up" | "down" | "flapping";
  vlan: number;
  expectedVlan: number;
  ipAddressingMode: "dhcp" | "static" | "apipa";
  ipAddress: string;
  subnetMask: string;
  defaultGateway: string;
  dnsServer: string;
  expectedDnsServer: string;
  services: Record<string, "Running" | "Stopped">;
  adAccountStatus: "Active" | "Locked Out" | "Disabled" | "Expired";
  badPasswordAttempts: number;
  c2BeaconActive: boolean;
  cableReplaced: boolean;
  rebootCount: number;
}

export interface EnvironmentActionResult {
  updatedState: EndpointEnvironmentState;
  consequence: string;
  wasUseful: boolean;
  efficiencyPenalty: number;
  outputLines: string[];
}

export function createInitialEnvironment(scenarioId: string): EndpointEnvironmentState {
  const isNet1042 = scenarioId === "net-1042";
  const isNet1045 = scenarioId === "net-1045";
  const isNet1051 = scenarioId === "net-1051";
  const isWin2001 = scenarioId === "win-2001";
  const isWin2002 = scenarioId === "win-2002";
  const isSec5003 = scenarioId === "sec-5003";

  return {
    hostname: isNet1042 ? "WS-HR-WHITFIELD" : isWin2002 ? "WS-LEGAL-OWRIGHT" : isSec5003 ? "WS-OPS-VANCE" : "WS-CORP-PC",
    linkState: isNet1051 ? "flapping" : "up",
    vlan: isNet1042 ? 10 : isNet1045 ? 50 : 20,
    expectedVlan: isNet1042 ? 10 : 20,
    ipAddressingMode: isNet1045 ? "static" : "dhcp",
    ipAddress: isNet1042 ? "192.168.1.24" : isNet1045 ? "192.168.5.114" : isNet1051 ? "192.168.20.45" : "192.168.1.45",
    subnetMask: "255.255.255.0",
    defaultGateway: isNet1042 ? "192.168.1.1" : isNet1045 ? "192.168.5.1" : "192.168.20.1",
    dnsServer: isNet1042 ? "192.168.1.10" : "192.168.1.5",
    expectedDnsServer: "192.168.1.5",
    services: {
      Spooler: isWin2002 ? "Stopped" : "Running",
      Dnscache: "Running",
      Dhcp: "Running",
      LanmanWorkstation: "Running",
    },
    adAccountStatus: isWin2001 ? "Locked Out" : "Active",
    badPasswordAttempts: isWin2001 ? 5 : 0,
    c2BeaconActive: isSec5003,
    cableReplaced: false,
    rebootCount: 0,
  };
}

/**
 * Execute an investigative or remediation action against the environment.
 */
export function executeEnvironmentAction(
  state: EndpointEnvironmentState,
  actionId: string,
  scenarioId: string
): EnvironmentActionResult {
  switch (actionId) {
    case "act-reboot": {
      const next: EndpointEnvironmentState = { ...state, rebootCount: state.rebootCount + 1 };
      const wasUseful = false;
      return {
        updatedState: next,
        consequence: "Workstation rebooted (30s elapsed). System initialization completed. The original symptom persists unchanged.",
        wasUseful,
        efficiencyPenalty: 5,
        outputLines: [
          "Restarting computer...",
          "Stopping background services.",
          "Windows 11 booting.",
          "Desktop reloaded. Network state unchanged.",
        ],
      };
    }

    case "act-replace-cable": {
      const isCableIssue = scenarioId === "hw-3001" || scenarioId === "net-1044";
      const next: EndpointEnvironmentState = { ...state, cableReplaced: true };
      if (isCableIssue) {
        return {
          updatedState: { ...next, linkState: "up" },
          consequence: "Replaced faulty patch cable. Link renegotiated at 1.0 Gbps Full Duplex.",
          wasUseful: true,
          efficiencyPenalty: 0,
          outputLines: ["Ethernet interface disconnected.", "New Cat6 cable detected.", "Link speed: 1000 Mbps Full Duplex."],
        };
      }
      return {
        updatedState: next,
        consequence: "Installed a new Cat6 patch cable. Link negotiation remains at 1.0 Gbps, but the original issue persists because the cable was not the fault.",
        wasUseful: false,
        efficiencyPenalty: 4,
        outputLines: ["Media disconnected.", "Media reconnected.", "IP configuration and symptoms remain identical."],
      };
    }

    case "act-flush-dns": {
      const isDnsCacheIssue = scenarioId === "gen-4003";
      return {
        updatedState: state,
        consequence: isDnsCacheIssue
          ? "Flushed DNS Resolver Cache. Stale corrupted DNS records cleared."
          : "Flushed DNS Resolver Cache. Local cache was cleared, but the root cause is not cache-related; queries continue to fail.",
        wasUseful: isDnsCacheIssue,
        efficiencyPenalty: isDnsCacheIssue ? 0 : 3,
        outputLines: ["Windows IP Configuration", "Successfully flushed the DNS Resolver Cache."],
      };
    }

    case "act-renew-dhcp": {
      const isApipa = state.ipAddressingMode === "apipa";
      const isVlanMismatch = state.vlan !== state.expectedVlan;

      if (isVlanMismatch) {
        return {
          updatedState: state,
          consequence: "Sent DHCPDISCOVER broadcast. Switchport VLAN configuration mismatch prevented DHCP offer from reaching the host. Adapter fell back to APIPA 169.254.x.x.",
          wasUseful: false,
          efficiencyPenalty: 2,
          outputLines: [
            "DHCPDISCOVER sent on interface Ethernet.",
            "No DHCPOFFER received within timeout.",
            "Assigned autoconfiguration IPv4: 169.254.114.28",
          ],
        };
      }

      return {
        updatedState: { ...state, ipAddressingMode: "dhcp" },
        consequence: "DHCP lease renewed successfully with corporate DHCP server.",
        wasUseful: isApipa,
        efficiencyPenalty: 0,
        outputLines: [
          `IPv4 Address renewed: ${state.ipAddress}`,
          `Subnet Mask: ${state.subnetMask}`,
          `Default Gateway: ${state.defaultGateway}`,
        ],
      };
    }

    case "act-fix-dns-config": {
      const isNet1042 = scenarioId === "net-1042";
      const next: EndpointEnvironmentState = { ...state, dnsServer: state.expectedDnsServer };
      return {
        updatedState: next,
        consequence: "Updated adapter IPv4 DNS server configuration to active corporate resolver (192.168.1.5). Name resolution immediately operational.",
        wasUseful: isNet1042,
        efficiencyPenalty: 0,
        outputLines: [
          "Adapter Ethernet DNS servers modified.",
          `Primary DNS: ${state.expectedDnsServer}`,
          "nslookup queries now returning valid non-authoritative answers.",
        ],
      };
    }

    case "act-restart-spooler": {
      const isSpoolerCrash = scenarioId === "win-2002";
      const next: EndpointEnvironmentState = {
        ...state,
        services: { ...state.services, Spooler: "Running" },
      };
      return {
        updatedState: next,
        consequence: "Started Print Spooler service (spoolsv.exe). Queued print jobs dispatched to HP LaserJet printer successfully.",
        wasUseful: isSpoolerCrash,
        efficiencyPenalty: 0,
        outputLines: [
          "SERVICE_NAME: spooler",
          "        STATE: 4 RUNNING",
          "Jobs cleared from local print spool buffer.",
        ],
      };
    }

    case "act-unlock-ad": {
      const isLockout = scenarioId === "win-2001";
      const next: EndpointEnvironmentState = {
        ...state,
        adAccountStatus: "Active",
        badPasswordAttempts: 0,
      };
      return {
        updatedState: next,
        consequence: "Active Directory user account unlocked on DC-CORP-01. Bad password count reset to 0.",
        wasUseful: isLockout,
        efficiencyPenalty: 0,
        outputLines: ["Account status: Active", "Bad password count: 0", "Domain authentication restored."],
      };
    }

    case "act-quarantine-host": {
      const isSecurityThreat = scenarioId === "sec-5003" || scenarioId === "sec-5002";
      const next: EndpointEnvironmentState = {
        ...state,
        c2BeaconActive: false,
        linkState: "down",
      };
      return {
        updatedState: next,
        consequence: "Endpoint administratively isolated from the corporate network. Outbound C2 socket connection terminated; lateral spread halted.",
        wasUseful: isSecurityThreat,
        efficiencyPenalty: 0,
        outputLines: [
          "Network adapter state: Administratively Isolated",
          "Terminating PID 5120 outbound TCP socket to 185.193.12.88:4444",
          "Host quarantine complete.",
        ],
      };
    }

    default:
      return {
        updatedState: state,
        consequence: "Action executed with no observable change to endpoint health.",
        wasUseful: false,
        efficiencyPenalty: 2,
        outputLines: ["No status changes reported."],
      };
  }
}
