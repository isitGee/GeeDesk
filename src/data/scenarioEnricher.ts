import type {
  Scenario,
  EnrichedScenario,
  ScenarioDevice,
  SimulatedEventLog,
  SimulatedService,
  SimulatedDeviceNode,
  SimulatedADAccount,
  EscalationOption,
  LearningGuide,
  Hypothesis,
  ProgressiveHint,
  EducationalDebrief,
  InteractiveAction,
  Priority,
} from "../types/scenario";

/**
 * Derives rich IT infrastructure metadata, diagnostic hypotheses,
 * progressive hints, and educational debriefs for any scenario.
 */
export function getEnrichedScenario(scenario: Scenario): EnrichedScenario {
  const isHardware = scenario.category === "Hardware";

  // Priority derivation
  let priority: Priority = scenario.priority ?? "Medium";
  if (!scenario.priority) {
    if (scenario.tags.includes("ransomware") || scenario.tags.includes("security") || scenario.difficulty === "advanced") {
      priority = "Critical";
    } else if (scenario.difficulty === "intermediate" || scenario.tags.includes("printing") || scenario.tags.includes("gateway")) {
      priority = "High";
    } else {
      priority = "Medium";
    }
  }

  const slaMinutes = scenario.slaMinutes ?? (priority === "Critical" ? 20 : priority === "High" ? 35 : 50);

  // Office Location
  const floor = (scenario.ticketNumber.charCodeAt(scenario.ticketNumber.length - 1) % 4) + 1;
  const desk = (scenario.ticketNumber.charCodeAt(scenario.ticketNumber.length - 2) * 7) % 60 + 10;
  const location = scenario.location ?? `HQ Building B — Floor ${floor}, Pod ${desk}`;

  // User persona enhancements
  const initials = scenario.user.initials ?? scenario.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  const emailName = scenario.user.name.toLowerCase().replace(/\s+/g, ".");
  const phoneExt = `x4${(scenario.ticketNumber.charCodeAt(scenario.ticketNumber.length - 1) * 11) % 900 + 100}`;

  let techLevel: "Novice" | "Intermediate" | "Power User" = scenario.user.techLevel ?? "Novice";
  let communicationStyle = scenario.user.communicationStyle;

  if (!communicationStyle) {
    if (scenario.user.role.includes("Analyst") || scenario.user.role.includes("Engineer") || scenario.user.role.includes("Dev")) {
      techLevel = "Power User";
      communicationStyle = "Direct and descriptive, attempts basic troubleshooting before filing tickets.";
    } else if (scenario.user.role.includes("Manager") || scenario.user.role.includes("Sales") || scenario.user.role.includes("Rep")) {
      techLevel = "Intermediate";
      communicationStyle = "Pacing quickly, concerned with immediate deadlines, responds best to clear non-technical questions.";
    } else {
      techLevel = "Novice";
      communicationStyle = "Polite, describes visual symptoms rather than underlying technical errors.";
    }
  }

  // Connected Device Asset Data
  let device: ScenarioDevice = scenario.device ?? {
    hostname: `WS-${scenario.user.department.slice(0, 3).toUpperCase()}-${scenario.ticketNumber.replace(/[^0-9]/g, "").slice(-3) || "101"}`,
    deviceType: isHardware && scenario.tags.includes("printer") ? "printer" : isHardware && scenario.tags.includes("laptop") ? "laptop" : "desktop",
    os: "Windows 11 Enterprise 23H2 (Build 22631.3296)",
    ipAddress: extractIpFromOutputs(scenario) || "192.168.1.45",
    subnetMask: "255.255.255.0",
    defaultGateway: "192.168.1.1",
    dnsServers: ["192.168.1.5", "1.1.1.1"],
    macAddress: deriveMac(scenario.ticketNumber),
    vlan: deriveVlan(scenario),
    vlanName: deriveVlanName(scenario),
    switchName: "SW-ACCESS-FL02",
    switchPort: `Gi0/${(scenario.ticketNumber.charCodeAt(scenario.ticketNumber.length - 1) % 24) + 1}`,
    status: scenario.difficulty === "advanced" ? "degraded" : "online",
    connectionType: scenario.tags.includes("wifi") ? "wifi" : "ethernet",
    wifiSsid: scenario.tags.includes("wifi") ? "GEEDESK-CORP-WPA3" : undefined,
    assetTag: `AST-2025-${scenario.ticketNumber.replace(/[^0-9]/g, "") || "4092"}`,
  };

  // Specific device overrides for canonical scenarios
  if (scenario.id === "net-1042") {
    device = {
      ...device,
      hostname: "WS-HR-WHITFIELD",
      ipAddress: "192.168.1.24",
      defaultGateway: "192.168.1.1",
      dnsServers: ["192.168.1.10"], // Misconfigured DNS
      vlan: 10,
      vlanName: "HR-VLAN-10",
      switchName: "SW-CORP-FL01",
      switchPort: "Gi0/12",
    };
  } else if (scenario.id === "net-1045") {
    device = {
      ...device,
      hostname: "LT-SALES-DRAMIREZ",
      ipAddress: "192.168.5.114",
      defaultGateway: "192.168.5.1",
      dnsServers: ["192.168.5.10"],
      vlan: 50,
      vlanName: "Sales-Mobile",
      switchName: "SW-LOBBY-01",
      switchPort: "Gi0/04",
      connectionType: "wifi",
      wifiSsid: "GEEDESK-SALES-5G",
    };
  } else if (scenario.id === "win-2002") {
    device = {
      ...device,
      hostname: "WS-LEGAL-OWRIGHT",
      ipAddress: "192.168.2.88",
      defaultGateway: "192.168.2.1",
      vlan: 20,
      vlanName: "Legal-Confidential",
    };
  } else if (scenario.id === "win-2001") {
    device = {
      ...device,
      hostname: "WS-SUPPORT-GLUI",
      ipAddress: "192.168.3.15",
      defaultGateway: "192.168.3.1",
      vlan: 30,
      vlanName: "Support-Desk",
    };
  }

  // Simulated components
  const eventLogs: SimulatedEventLog[] = scenario.eventLogs ?? generateEventLogs(scenario);
  const services: SimulatedService[] = scenario.services ?? generateServices(scenario);
  const deviceManager: SimulatedDeviceNode[] = scenario.deviceManager ?? generateDeviceManager(scenario);
  const adAccount: SimulatedADAccount = scenario.adAccount ?? generateADAccount(scenario);
  const escalationOptions: EscalationOption[] = scenario.escalationOptions ?? generateEscalations(scenario);
  const learningGuide: LearningGuide = scenario.learningGuide ?? generateLearningGuide(scenario);

  // Diagnostic Hypotheses
  const hypotheses: Hypothesis[] = scenario.hypotheses ?? generateHypotheses(scenario);

  // Progressive 3-Tier Hints
  const progressiveHints: ProgressiveHint[] = scenario.progressiveHints ?? generateProgressiveHints(scenario);

  // Post-Scenario Educational Debrief
  const educationalDebrief: EducationalDebrief = scenario.educationalDebrief ?? generateEducationalDebrief(scenario);

  // Interactive Actions with Consequences
  const interactiveActions: InteractiveAction[] = scenario.interactiveActions ?? generateInteractiveActions(scenario);

  return {
    ...scenario,
    priority,
    slaMinutes,
    location,
    user: {
      ...scenario.user,
      initials,
      location,
      phone: phoneExt,
      email: `${emailName}@geedesk.local`,
      techLevel,
      communicationStyle,
      previousIncidentsCount: (scenario.ticketNumber.charCodeAt(scenario.ticketNumber.length - 1) % 4) + 1,
    },
    device,
    eventLogs,
    services,
    deviceManager,
    adAccount,
    escalationOptions,
    learningGuide,
    hypotheses,
    progressiveHints,
    educationalDebrief,
    interactiveActions,
  };
}

function extractIpFromOutputs(scenario: Scenario): string | null {
  for (const t of scenario.terminalOutputs) {
    for (const line of t.output) {
      const match = line.match(/(?:IPv4 Address|Address|Interface):\s*([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)/i);
      if (match && match[1] && !match[1].startsWith("127.") && match[1] !== "8.8.8.8" && match[1] !== "1.1.1.1") {
        return match[1];
      }
    }
  }
  return null;
}

function deriveMac(seed: string): string {
  const hex = "0123456789ABCDEF";
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
  }
  const b1 = hex[Math.abs(hash) % 16] + hex[Math.abs(hash >> 2) % 16];
  const b2 = hex[Math.abs(hash >> 4) % 16] + hex[Math.abs(hash >> 6) % 16];
  const b3 = hex[Math.abs(hash >> 8) % 16] + hex[Math.abs(hash >> 10) % 16];
  return `00:1A:2B:${b1}:${b2}:${b3}`;
}

function deriveVlan(scenario: Scenario): number {
  if (scenario.id === "net-1045") return 50;
  if (scenario.id === "net-1042") return 10;
  if (scenario.id === "win-2001") return 30;
  if (scenario.id === "win-2002") return 20;
  return (scenario.ticketNumber.charCodeAt(scenario.ticketNumber.length - 1) % 6) * 10 + 10;
}

function deriveVlanName(scenario: Scenario): string {
  const vlan = deriveVlan(scenario);
  const names: Record<number, string> = {
    10: "Corporate-Users",
    20: "Executive-VLAN",
    30: "Operations-LAN",
    40: "Engineering-Lab",
    50: "Mobile-Sales",
    60: "Guest-Isolated",
  };
  return names[vlan] ?? "Corp-Data";
}

function generateEventLogs(scenario: Scenario): SimulatedEventLog[] {
  const logs: SimulatedEventLog[] = [];
  const now = new Date();
  const timeStr = (minsAgo: number) => {
    const d = new Date(now.getTime() - minsAgo * 60000);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  };

  if (scenario.id === "net-1042") {
    logs.push(
      {
        id: "evt-1042-1",
        level: "Error",
        source: "DNS Client Events",
        eventId: 1014,
        timestamp: timeStr(14),
        description: "Name resolution for the name www.google.com timed out after none of the configured DNS servers (192.168.1.10) responded.",
        isKeyFinding: true,
      },
      {
        id: "evt-1042-2",
        level: "Warning",
        source: "DNS Client Events",
        eventId: 1014,
        timestamp: timeStr(28),
        description: "Name resolution for the name portal.geedesk.local timed out after none of the configured DNS servers responded.",
        isKeyFinding: true,
      },
      {
        id: "evt-1042-3",
        level: "Information",
        source: "Tcpip",
        eventId: 4200,
        timestamp: timeStr(55),
        description: "Network interface Ethernet connected at 1.0 Gbps Full Duplex. IP Address: 192.168.1.24.",
      }
    );
  } else if (scenario.id === "win-2002") {
    logs.push(
      {
        id: "evt-2002-1",
        level: "Error",
        source: "Service Control Manager",
        eventId: 7034,
        timestamp: timeStr(35),
        description: "The Print Spooler service terminated unexpectedly. It has done this 1 time(s). Action: Restart the service.",
        isKeyFinding: true,
      },
      {
        id: "evt-2002-2",
        level: "Error",
        source: "PrintService",
        eventId: 372,
        timestamp: timeStr(40),
        description: "The document Print Document, owned by Oliver Wright, failed to print on printer HP-LaserJet-Corp. Error code: 0x6ba (RPC server unavailable).",
        isKeyFinding: true,
      }
    );
  } else if (scenario.id === "win-2001") {
    logs.push(
      {
        id: "evt-2001-1",
        level: "Warning",
        source: "Microsoft-Windows-Security-Auditing",
        eventId: 4625,
        timestamp: timeStr(42),
        description: "An account failed to log on. Subject: glui. Failure Reason: Account currently locked out. Caller Process: lsass.exe.",
        isKeyFinding: true,
      },
      {
        id: "evt-2001-2",
        level: "Error",
        source: "Microsoft-Windows-Security-Auditing",
        eventId: 4740,
        timestamp: timeStr(50),
        description: "A user account was locked out. Target Account Name: glui. Caller Computer Name: MOBILE-GLUI-IPHONE.",
        isKeyFinding: true,
      }
    );
  } else {
    logs.push(
      {
        id: `evt-${scenario.id}-1`,
        level: "Warning",
        source: "System",
        eventId: 1001,
        timestamp: timeStr(15),
        description: `Operational event logged during symptom onset: ${scenario.symptoms[0] ?? "Service state degraded."}`,
        isKeyFinding: true,
      },
      {
        id: `evt-${scenario.id}-2`,
        level: "Information",
        source: "Tcpip",
        eventId: 4200,
        timestamp: timeStr(60),
        description: "Network link state confirmed active at 1.0 Gbps.",
      }
    );
  }

  return logs;
}

function generateServices(scenario: Scenario): SimulatedService[] {
  const isSpoolerFault = scenario.id === "win-2002" || scenario.tags.includes("printing");
  return [
    {
      name: "Spooler",
      displayName: "Print Spooler",
      status: isSpoolerFault ? "Stopped" : "Running",
      startupType: "Automatic",
      canToggle: true,
      description: "Manages all local and network print queues and controls all print jobs.",
    },
    {
      name: "Dnscache",
      displayName: "DNS Client",
      status: "Running",
      startupType: "Automatic",
      canToggle: true,
      description: "Resolves and caches Domain Name System (DNS) names for this computer.",
    },
    {
      name: "Dhcp",
      displayName: "DHCP Client",
      status: "Running",
      startupType: "Automatic",
      canToggle: true,
      description: "Registers and updates IP addresses and DNS records for this computer.",
    },
    {
      name: "wuauserv",
      displayName: "Windows Update",
      status: "Running",
      startupType: "Manual",
      canToggle: true,
      description: "Enables detection, download, and installation of updates for Windows.",
    },
    {
      name: "LanmanWorkstation",
      displayName: "Workstation",
      status: "Running",
      startupType: "Automatic",
      canToggle: true,
      description: "Creates and maintains client network connections to remote servers using SMB.",
    },
  ];
}

function generateDeviceManager(scenario: Scenario): SimulatedDeviceNode[] {
  const isNetworkIssue = scenario.category === "Networking";
  return [
    {
      category: "Network Adapters",
      name: "Intel(R) Ethernet Connection (7) I219-V",
      status: isNetworkIssue && scenario.tags.includes("nic") ? "Warning" : "OK",
      statusCode: isNetworkIssue && scenario.tags.includes("nic") ? "Code 10: This device cannot start." : "This device is working properly.",
      driverVersion: "12.19.2.55",
    },
    {
      category: "Network Adapters",
      name: "Intel(R) Wi-Fi 6 AX201 160MHz",
      status: "OK",
      statusCode: "This device is working properly.",
      driverVersion: "22.180.0.4",
    },
    {
      category: "Display Adapters",
      name: "Intel(R) UHD Graphics 770",
      status: scenario.id === "hw-3001" ? "Warning" : "OK",
      statusCode: scenario.id === "hw-3001" ? "Code 43: Windows has stopped this device." : "This device is working properly.",
      driverVersion: "31.0.101.4575",
    },
    {
      category: "Disk Drives",
      name: "Samsung SSD 980 PRO 1TB",
      status: "OK",
      statusCode: "This device is working properly.",
    },
  ];
}

function generateADAccount(scenario: Scenario): SimulatedADAccount {
  const isLocked = scenario.id === "win-2001";
  const username = scenario.user.name.toLowerCase().replace(/[^a-z]/g, "").slice(0, 7) || "user01";
  return {
    username,
    displayName: scenario.user.name,
    department: scenario.user.department,
    status: isLocked ? "Locked Out" : "Active",
    badPasswordAttempts: isLocked ? 5 : 0,
    lastLogon: isLocked ? "Yesterday at 17:42" : "Today at 08:30",
    passwordLastChanged: isLocked ? "91 days ago (Expired)" : "14 days ago",
    groups: ["Domain Users", `${scenario.user.department}-Staff`, "VPN-Remote-Access"],
  };
}

function generateEscalations(scenario: Scenario): EscalationOption[] {
  const isSec = scenario.category === "Security";
  const isNetCore = scenario.tags.includes("switch") || scenario.tags.includes("vlan") || scenario.tags.includes("routing");

  return [
    {
      id: "esc-tier2",
      targetTeam: "Tier 2 Desktop Support",
      reason: "Requires hands-on desk visit or physical component replacement.",
      isCorrect: scenario.id === "hw-3002" || scenario.id === "hw-3003",
      explanation: "Tier 2 handles on-site desktop hardware triage when remote software troubleshooting cannot resolve the physical failure.",
    },
    {
      id: "esc-noc",
      targetTeam: "Network Operations (NOC)",
      reason: "Incident involves core infrastructure switchport reconfiguration, trunking, or physical fiber failure.",
      isCorrect: isNetCore && scenario.difficulty === "advanced",
      explanation: "Core network hardware, switch trunk lines, and corporate firewalls are restricted to Network Engineering.",
    },
    {
      id: "esc-soc",
      targetTeam: "Security Operations (SOC)",
      reason: "Suspected active compromise, credential theft, ransomware outbreak, or malicious phishing attack.",
      isCorrect: isSec,
      explanation: "Confirmed or high-suspicion security breaches require immediate SOC quarantine and containment protocols.",
    },
    {
      id: "esc-infra",
      targetTeam: "Systems Infrastructure",
      reason: "Active Directory domain controller issue, corporate DHCP scope exhaustion, or virtualized host crash.",
      isCorrect: false,
      explanation: "Standard user workstation tickets should be addressed at Tier 1 or Tier 2 before escalating to Systems Infrastructure.",
    },
  ];
}

function generateLearningGuide(scenario: Scenario): LearningGuide {
  return {
    investigationChecklist: [
      "Scope the impact: single workstation or departmental outage?",
      "Test Layer 1 & 2 link integrity and assigned IP configuration",
      "Test Layer 3 gateway reachability (ping default gateway)",
      "Test Layer 7 name resolution (nslookup against configured resolver)",
      "Correlate Event Viewer logs and service states with symptom timeline",
    ],
    suggestedTools: scenario.availableCommands.slice(0, 4),
    keyConceptOverview: scenario.keyConcepts?.[0] ?? "Eliminate layers systematically from physical to application.",
    commonTrap: "Avoid restarting equipment or changing IP settings before gathering diagnostic proof.",
  };
}

function generateHypotheses(scenario: Scenario): Hypothesis[] {
  const isDns = scenario.tags.includes("dns");
  const isDhcp = scenario.tags.includes("dhcp");
  const isGw = scenario.tags.includes("gateway");
  const isSpooler = scenario.tags.includes("printing") || scenario.id === "win-2002";
  const isLockout = scenario.id === "win-2001";
  const isSecurity = scenario.category === "Security";

  return [
    {
      id: "hyp-dns",
      label: "Layer 7: Domain Name System (DNS) resolver failure or bad DNS server IP",
      category: "L7-DNS",
      isRootCause: isDns,
      ruleOutEvidenceIds: isDns ? undefined : ["ev-external-reachable"],
      ruleOutExplanation: "Ruled out because hostname resolution returns valid answers.",
      supportEvidenceIds: ["ev-dns-timeout"],
      supportExplanation: "Supported because queries to the configured DNS server time out.",
    },
    {
      id: "hyp-dhcp",
      label: "Layer 3: DHCP lease failure resulting in APIPA (169.254.x.x) autoconfiguration",
      category: "L3-Routing",
      isRootCause: isDhcp,
      ruleOutEvidenceIds: ["ev-ip-config", "ev-gateway-reachable"],
      ruleOutExplanation: "Ruled out because the host holds a valid corporate IP and reaches its gateway.",
    },
    {
      id: "hyp-physical",
      label: "Layer 1: Disconnected, unseated, or physically damaged network cable",
      category: "L1-Physical",
      isRootCause: false,
      ruleOutEvidenceIds: ["ev-gateway-reachable", "ev-ip-config"],
      ruleOutExplanation: "Ruled out because the adapter has an active 1 Gbps link and pings the gateway.",
    },
    {
      id: "hyp-gateway",
      label: "Layer 3: Default gateway unreachable or incorrect default route",
      category: "L3-Routing",
      isRootCause: isGw,
      ruleOutEvidenceIds: ["ev-gateway-reachable"],
      ruleOutExplanation: "Ruled out because ICMP echo replies return 0% packet loss from the gateway.",
    },
    {
      id: "hyp-service",
      label: "Operating System: Local Windows background service terminated unexpectedly",
      category: "OS-Service",
      isRootCause: isSpooler,
      ruleOutEvidenceIds: isSpooler ? undefined : ["ev-ip-config"],
      ruleOutExplanation: "Ruled out because all critical Windows networking services are active.",
      supportEvidenceIds: isSpooler ? ["ev-spooler-stopped"] : undefined,
    },
    {
      id: "hyp-security",
      label: "Security Incident: Active compromise, malware beacon, or credential lockout",
      category: "Security",
      isRootCause: isSecurity || isLockout,
    },
  ];
}

function generateProgressiveHints(_scenario: Scenario): ProgressiveHint[] {
  return [
    {
      id: "ph-1",
      concept: "Layer 3 IP routing can succeed while Layer 7 DNS fails. Always test raw numerical IP reachability (e.g. ping 8.8.8.8) to distinguish routing from name resolution.",
      direction: "Inspect the configured DNS Server IP in 'ipconfig /all'. Test whether that specific address answers direct queries using 'nslookup'.",
      action: "Run 'nslookup google.com'. If it times out, update the adapter DNS to 192.168.1.5 or 1.1.1.1.",
    },
    {
      id: "ph-2",
      concept: "Before assuming an office-wide outage, always determine scope. If coworkers on the same switch are working normally, the fault is isolated to this machine.",
      direction: "Ask the user if neighboring colleagues are experiencing the same problem.",
      action: "Interview the requester via Chat about coworkers' connectivity.",
    },
  ];
}

function generateEducationalDebrief(scenario: Scenario): EducationalDebrief {
  return {
    whatHappened:
      scenario.hiddenFault,
    eliminationTree: [
      {
        hypothesis: "Physical Layer 1 Cable Fault",
        status: "Ruled Out",
        reason: "Adapter negotiated at 1.0 Gbps and the local default gateway answered ICMP pings with 0% loss.",
      },
      {
        hypothesis: "DHCP Lease Failure (APIPA 169.254.x.x)",
        status: "Ruled Out",
        reason: "The workstation held a valid IPv4 address and subnet mask from the corporate IP pool.",
      },
      {
        hypothesis: "Default Gateway / WAN Outage",
        status: "Ruled Out",
        reason: "Raw IP packet routing was verified healthy by successful pings to external public IPs.",
      },
      {
        hypothesis: scenario.diagnosisOptions.find((d) => d.isCorrect)?.label ?? "Target Root Cause",
        status: "Root Cause",
        reason: "Confirmed by diagnostic command outputs and symptom correlation.",
      },
    ],
    optimalInvestigationPath: [
      "1. Verify user symptoms and scope (determine single machine vs office-wide)",
      "2. Execute 'ipconfig /all' to audit IP, subnet, gateway, and DNS configuration",
      "3. Ping default gateway to verify Layer 2/3 local segment reachability",
      "4. Ping raw public IP (8.8.8.8) to verify WAN routing independent of DNS",
      "5. Query DNS using 'nslookup' to confirm whether name resolution times out",
      "6. Apply targeted remediation and verify with post-fix diagnostic command",
      "7. Author complete ITIL work notes covering problem, findings, fix, and prevention",
    ],
    realWorldTakeaway:
      "In enterprise help-desk environments, 'Internet is down' is the most common inaccurate ticket description. Technicians who test layers systematically (Link -> IP -> Gateway -> DNS) resolve incidents in minutes rather than making disruptive guesses like rebooting routers or replacing cables.",
    commonMistakes: [
      "Rebooting the workstation immediately without gathering evidence (destroys volatile state without fixing config)",
      "Assuming a total network outage when only DNS is broken (works by IP, fails by name)",
      "Applying fixes without running a verification command to prove operational recovery",
      "Closing tickets with empty or vague work notes like 'fixed it'",
    ],
  };
}

function generateInteractiveActions(scenario: Scenario): InteractiveAction[] {
  return [
    {
      id: "act-reboot",
      label: "Restart Workstation",
      description: "Perform a clean OS reboot to reinitialize hardware and drivers.",
      consequence: "Computer restarted (30s elapsed). Background services reloaded. The underlying issue persists unchanged.",
      wasUseful: false,
      efficiencyPenalty: 5,
    },
    {
      id: "act-replace-cable",
      label: "Replace Patch Cable",
      description: "Swap the desk Ethernet cable with a brand new Cat6 patch lead.",
      consequence: "Installed a new Cat6 patch cable. Link negotiation remains at 1.0 Gbps, but symptoms persist.",
      wasUseful: false,
      efficiencyPenalty: 4,
    },
    {
      id: "act-flush-dns",
      label: "Flush DNS Cache",
      description: "Execute 'ipconfig /flushdns' to clear local resolver cache entries.",
      consequence: "Flushed DNS Resolver Cache. Stale entries cleared.",
      wasUseful: scenario.tags.includes("dns-cache"),
      efficiencyPenalty: scenario.tags.includes("dns-cache") ? 0 : 2,
    },
    {
      id: "act-renew-dhcp",
      label: "Release & Renew DHCP",
      description: "Execute 'ipconfig /release' and 'ipconfig /renew' on the active adapter.",
      consequence: "DHCP lease broadcast completed.",
      wasUseful: scenario.tags.includes("dhcp"),
      efficiencyPenalty: scenario.tags.includes("dhcp") ? 0 : 2,
    },
  ];
}
