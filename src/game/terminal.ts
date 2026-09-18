import type { Scenario, TerminalOutput, TerminalCommandName } from "../types/scenario";
import { getEnrichedScenario } from "../data/scenarioEnricher";

export function normalizeCommand(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

function firstWord(normalized: string): string {
  return normalized.split(" ")[0] ?? "";
}

export interface TerminalRunResult {
  output: string[];
  matched: TerminalOutput | null;
  recognizedCommandUnknownUsage: boolean;
  serviceStateChanged?: { name: string; status: "Running" | "Stopped" };
}

/**
 * Runs one line of simulated terminal input against a scenario.
 * Takes into account the applied fix state, service overrides, and device metadata
 * to deliver deterministic, realistic Windows command outputs.
 */
export function runTerminalCommand(
  scenario: Scenario,
  rawInput: string,
  fixApplied: boolean,
  serviceOverrides: Record<string, "Running" | "Stopped"> = {}
): TerminalRunResult {
  const normalized = normalizeCommand(rawInput);
  const command = firstWord(normalized) as TerminalCommandName;

  if (!normalized) {
    return { output: [], matched: null, recognizedCommandUnknownUsage: false };
  }

  // --- Clear command ---
  if (normalized === "clear" || normalized === "cls") {
    return { output: [], matched: null, recognizedCommandUnknownUsage: false };
  }

  // --- Help command ---
  if (command === "help" || normalized === "/?" || normalized === "-h") {
    const enriched = getEnrichedScenario(scenario);
    return {
      output: [
        "GEEDESK Windows Command Diagnostic Shell [Version 10.0.22631.3296]",
        "Connected to host: " + enriched.device.hostname,
        "",
        "Supported diagnostic tools on this endpoint:",
        "  ipconfig    - View and manage IPv4/IPv6 adapter configuration",
        "  ping        - Send ICMP echo requests to test host reachability",
        "  nslookup    - Query DNS name servers for domain records",
        "  tracert     - Trace the network route and latency to a destination",
        "  arp         - Display and modify the Address Resolution Protocol cache",
        "  netstat     - Display active TCP connections and listening ports",
        "  route       - Manipulate and display network routing tables (route print)",
        "  net         - Manage network resources, user accounts, and services",
        "  sc          - Service Control Manager (query, start, stop services)",
        "  tasklist    - Display all currently running processes and PIDs",
        "  systeminfo  - Display comprehensive operating system and hardware configuration",
        "  whoami      - Display current logged-in user and security privileges",
        "  gpresult    - Display Resultant Set of Policy (RSoP) for user and computer",
        "  sfc         - System File Checker tool (sfc /scannow)",
        "  cls         - Clear the terminal screen",
        "",
        "Tip: Type commands with standard switches (e.g., 'ipconfig /all', 'ping 127.0.0.1', 'sc query spooler').",
      ],
      matched: null,
      recognizedCommandUnknownUsage: false,
    };
  }

  // Check if scenario explicitly provided a matching TerminalOutput
  const candidates = scenario.terminalOutputs.filter(
    (t) => t.command === command && t.match.some((m) => normalizeCommand(m) === normalized)
  );

  if (candidates.length > 0) {
    // Prefer an entry matching current phase; fallback to phase-less
    const phaseMatch =
      candidates.find((c) => c.phase === (fixApplied ? "post" : "pre")) ??
      candidates.find((c) => !c.phase) ??
      candidates[0];

    // Check if running an sc/net start command changes service state
    let serviceChange: { name: string; status: "Running" | "Stopped" } | undefined;
    if (normalized.startsWith("sc start ") || normalized.startsWith("net start ")) {
      const sName = normalized.replace(/^(sc|net) start /, "").trim();
      serviceChange = { name: sName, status: "Running" };
    }

    return {
      output: phaseMatch.output,
      matched: phaseMatch,
      recognizedCommandUnknownUsage: false,
      serviceStateChanged: serviceChange,
    };
  }

  // --- Dynamic / State-Aware Command Simulation ---
  const enriched = getEnrichedScenario(scenario);
  const dev = enriched.device;

  // 1. IPCONFIG
  if (command === "ipconfig") {
    if (normalized.includes("/flushdns")) {
      return {
        output: [
          "Windows IP Configuration",
          "",
          "Successfully flushed the DNS Resolver Cache.",
        ],
        matched: null,
        recognizedCommandUnknownUsage: false,
      };
    }

    if (normalized.includes("/release")) {
      return {
        output: [
          "Windows IP Configuration",
          "",
          "Ethernet adapter Ethernet:",
          "   Connection-specific DNS Suffix  . :",
          "   IPv4 Address. . . . . . . . . . . : 0.0.0.0",
          "   Subnet Mask . . . . . . . . . . . : 0.0.0.0",
          "   Default Gateway . . . . . . . . . :",
        ],
        matched: null,
        recognizedCommandUnknownUsage: false,
      };
    }

    if (normalized.includes("/renew")) {
      const isFixed = fixApplied;
      const ip = isFixed ? dev.ipAddress : (scenario.tags.includes("apipa") ? "169.254.112.44" : dev.ipAddress);
      return {
        output: [
          "Windows IP Configuration",
          "",
          "Ethernet adapter Ethernet:",
          "   Connection-specific DNS Suffix  . : geedesk.local",
          `   IPv4 Address. . . . . . . . . . . : ${ip}`,
          `   Subnet Mask . . . . . . . . . . . : ${dev.subnetMask}`,
          `   Default Gateway . . . . . . . . . : ${isFixed ? dev.defaultGateway : (scenario.tags.includes("apipa") ? "" : dev.defaultGateway)}`,
        ],
        matched: null,
        recognizedCommandUnknownUsage: false,
      };
    }

    if (normalized.includes("/all")) {
      return {
        output: [
          "Windows IP Configuration",
          "",
          `   Host Name . . . . . . . . . . . . : ${dev.hostname}`,
          "   Primary Dns Suffix  . . . . . . . : geedesk.local",
          "   Node Type . . . . . . . . . . . . : Hybrid",
          "   IP Routing Enabled. . . . . . . . : No",
          "   WINS Proxy Enabled. . . . . . . . : No",
          "",
          `Ethernet adapter ${dev.connectionType === "wifi" ? "Wi-Fi" : "Ethernet"}:`,
          "",
          "   Connection-specific DNS Suffix  . : geedesk.local",
          `   Description . . . . . . . . . . . : ${dev.connectionType === "wifi" ? "Intel(R) Wi-Fi 6 AX201" : "Intel(R) Ethernet Connection I219-V"}`,
          `   Physical Address. . . . . . . . . : ${dev.macAddress}`,
          "   DHCP Enabled. . . . . . . . . . . : Yes",
          "   Autoconfiguration Enabled . . . . : Yes",
          `   IPv4 Address. . . . . . . . . . . : ${dev.ipAddress}`,
          `   Subnet Mask . . . . . . . . . . . : ${dev.subnetMask}`,
          `   Default Gateway . . . . . . . . . : ${dev.defaultGateway}`,
          `   DNS Servers . . . . . . . . . . . : ${dev.dnsServers.join("\n                                       ")}`,
          "   NetBIOS over Tcpip. . . . . . . . : Enabled",
        ],
        matched: null,
        recognizedCommandUnknownUsage: false,
      };
    }

    return {
      output: [
        "Windows IP Configuration",
        "",
        `Ethernet adapter ${dev.connectionType === "wifi" ? "Wi-Fi" : "Ethernet"}:`,
        "",
        "   Connection-specific DNS Suffix  . : geedesk.local",
        `   IPv4 Address. . . . . . . . . . . : ${dev.ipAddress}`,
        `   Subnet Mask . . . . . . . . . . . : ${dev.subnetMask}`,
        `   Default Gateway . . . . . . . . . : ${dev.defaultGateway}`,
      ],
      matched: null,
      recognizedCommandUnknownUsage: false,
    };
  }

  // 2. PING
  if (command === "ping") {
    // Loopback ping
    if (normalized === "ping 127.0.0.1" || normalized === "ping localhost" || normalized === "ping ::1") {
      return {
        output: [
          "Pinging 127.0.0.1 with 32 bytes of data:",
          "Reply from 127.0.0.1: bytes=32 time<1ms TTL=128",
          "Reply from 127.0.0.1: bytes=32 time<1ms TTL=128",
          "Reply from 127.0.0.1: bytes=32 time<1ms TTL=128",
          "Reply from 127.0.0.1: bytes=32 time<1ms TTL=128",
          "",
          "Ping statistics for 127.0.0.1:",
          "    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),",
          "Approximate round trip times in milli-seconds:",
          "    Minimum = 0ms, Maximum = 0ms, Average = 0ms",
        ],
        matched: null,
        recognizedCommandUnknownUsage: false,
      };
    }

    // Ping to default gateway
    if (normalized === `ping ${dev.defaultGateway}`) {
      const gwReachable = !scenario.tags.includes("gateway-down") && !scenario.tags.includes("apipa");
      if (gwReachable) {
        return {
          output: [
            `Pinging ${dev.defaultGateway} with 32 bytes of data:`,
            `Reply from ${dev.defaultGateway}: bytes=32 time=1ms TTL=64`,
            `Reply from ${dev.defaultGateway}: bytes=32 time=1ms TTL=64`,
            `Reply from ${dev.defaultGateway}: bytes=32 time=1ms TTL=64`,
            `Reply from ${dev.defaultGateway}: bytes=32 time=1ms TTL=64`,
            "",
            `Ping statistics for ${dev.defaultGateway}:`,
            "    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)",
          ],
          matched: null,
          recognizedCommandUnknownUsage: false,
        };
      } else {
        return {
          output: [
            `Pinging ${dev.defaultGateway} with 32 bytes of data:`,
            "Request timed out.",
            "Request timed out.",
            "Request timed out.",
            "Request timed out.",
            "",
            `Ping statistics for ${dev.defaultGateway}:`,
            "    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)",
          ],
          matched: null,
          recognizedCommandUnknownUsage: false,
        };
      }
    }

    // Ping 8.8.8.8 or 1.1.1.1
    if (normalized === "ping 8.8.8.8" || normalized === "ping 1.1.1.1") {
      const wanReachable = !scenario.tags.includes("apipa") && !scenario.tags.includes("gateway-down");
      if (wanReachable) {
        return {
          output: [
            "Pinging 8.8.8.8 with 32 bytes of data:",
            "Reply from 8.8.8.8: bytes=32 time=14ms TTL=116",
            "Reply from 8.8.8.8: bytes=32 time=13ms TTL=116",
            "Reply from 8.8.8.8: bytes=32 time=15ms TTL=116",
            "Reply from 8.8.8.8: bytes=32 time=14ms TTL=116",
            "",
            "Ping statistics for 8.8.8.8:",
            "    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)",
          ],
          matched: null,
          recognizedCommandUnknownUsage: false,
        };
      }
    }
  }

  // 3. WHOAMI
  if (command === "whoami") {
    if (normalized.includes("/groups")) {
      return {
        output: [
          "GROUP INFORMATION",
          "-----------------",
          "",
          "Group Name                                 Type             SID          Attributes",
          "========================================== ================ ============ ==================================================",
          "Everyone                                   Well-known group S-1-1-0      Mandatory group, Enabled by default, Enabled group",
          "GEEDESK\\Domain Users                       Group            S-1-5-21...  Mandatory group, Enabled by default, Enabled group",
          `GEEDESK\\${enriched.user.department}-Staff Group            S-1-5-21...  Mandatory group, Enabled by default, Enabled group`,
          "BUILTIN\\Users                              Alias            S-1-5-32-545 Mandatory group, Enabled by default, Enabled group",
        ],
        matched: null,
        recognizedCommandUnknownUsage: false,
      };
    }

    return {
      output: [`geedesk\\${enriched.adAccount.username}`],
      matched: null,
      recognizedCommandUnknownUsage: false,
    };
  }

  // 4. ROUTE PRINT
  if (normalized === "route print" || normalized === "route print -4") {
    return {
      output: [
        "===========================================================================",
        "Interface List",
        ` 11...${dev.macAddress.toLowerCase().replace(/:/g, " ")} ......Intel(R) Ethernet Connection I219-V`,
        "  1...........................Software Loopback Interface 1",
        "===========================================================================",
        "",
        "IPv4 Route Table",
        "===========================================================================",
        "Active Routes:",
        "Network Destination        Netmask          Gateway       Interface  Metric",
        `          0.0.0.0          0.0.0.0   ${dev.defaultGateway}    ${dev.ipAddress}      25`,
        `        127.0.0.0        255.0.0.0         On-link         127.0.0.1     331`,
        `        127.0.0.1  255.255.255.255         On-link         127.0.0.1     331`,
        `     ${dev.ipAddress.slice(0, dev.ipAddress.lastIndexOf("."))}.0    ${dev.subnetMask}         On-link    ${dev.ipAddress}     281`,
        `    ${dev.ipAddress}  255.255.255.255         On-link    ${dev.ipAddress}     281`,
        "===========================================================================",
      ],
      matched: null,
      recognizedCommandUnknownUsage: false,
    };
  }

  // 5. SYSTEMINFO
  if (command === "systeminfo") {
    return {
      output: [
        `Host Name:                 ${dev.hostname}`,
        `OS Name:                   Microsoft ${dev.os}`,
        "OS Version:                10.0.22631 N/A Build 22631",
        "OS Manufacturer:           Microsoft Corporation",
        "System Manufacturer:       Dell Inc.",
        "System Model:              OptiPlex 7000",
        "System Type:               x64-based PC",
        "Processor(s):              1 Processor(s) Installed. [01]: Intel64 Family 6 Model 151 ~2500 Mhz",
        "BIOS Version:              Dell Inc. 1.14.0, 11/15/2024",
        "Total Physical Memory:     16,142 MB",
        "Available Physical Memory: 9,842 MB",
        "Domain:                    geedesk.local",
        "Logon Server:              \\\\DC-CORP-01",
        `Network Card(s):           1 NIC(s) Installed.`,
        `                           [01]: ${dev.connectionType === "wifi" ? "Intel(R) Wi-Fi 6 AX201" : "Intel(R) Ethernet Connection I219-V"}`,
        `                                 Connection Name: Ethernet`,
        `                                 DHCP Enabled:    Yes`,
        `                                 IP address(es):  [01]: ${dev.ipAddress}`,
      ],
      matched: null,
      recognizedCommandUnknownUsage: false,
    };
  }

  // 6. SC & NET (Services)
  if (command === "sc" || command === "net") {
    const isStart = normalized.includes("start ");
    const isStop = normalized.includes("stop ");

    if (normalized.includes("spooler")) {
      const currentOverride = serviceOverrides["Spooler"];
      const isStoppedInitially = scenario.id === "win-2002";
      let state = currentOverride ?? (isStoppedInitially ? (fixApplied ? "Running" : "Stopped") : "Running");

      if (isStart) {
        state = "Running";
        return {
          output: [
            "SERVICE_NAME: spooler",
            "        TYPE               : 110  WIN32_SHARE_PROCESS",
            "        STATE              : 2  START_PENDING",
            "        STATE              : 4  RUNNING",
            "        WIN32_EXIT_CODE    : 0  (0x0)",
          ],
          matched: null,
          recognizedCommandUnknownUsage: false,
          serviceStateChanged: { name: "Spooler", status: "Running" },
        };
      }

      if (isStop) {
        state = "Stopped";
        return {
          output: [
            "SERVICE_NAME: spooler",
            "        TYPE               : 110  WIN32_SHARE_PROCESS",
            "        STATE              : 1  STOPPED",
            "        WIN32_EXIT_CODE    : 0  (0x0)",
          ],
          matched: null,
          recognizedCommandUnknownUsage: false,
          serviceStateChanged: { name: "Spooler", status: "Stopped" },
        };
      }

      return {
        output: [
          "SERVICE_NAME: spooler",
          "        TYPE               : 110  WIN32_SHARE_PROCESS",
          `        STATE              : ${state === "Running" ? "4  RUNNING" : "1  STOPPED"}`,
          `        WIN32_EXIT_CODE    : ${state === "Running" ? "0  (0x0)" : "1077  (0x435)"}`,
          "        SERVICE_EXIT_CODE  : 0  (0x0)",
          "        CHECKPOINT         : 0x0",
          "        WAIT_HINT          : 0x0",
        ],
        matched: null,
        recognizedCommandUnknownUsage: false,
      };
    }
  }

  // 7. TASKLIST
  if (command === "tasklist") {
    const spoolerRunning = serviceOverrides["Spooler"] === "Running" || (scenario.id !== "win-2002");
    return {
      output: [
        "Image Name                     PID Session Name        Session#    Mem Usage",
        "========================= ======== ================ =========== ============",
        "System Idle Process              0 Services                   0          8 K",
        "System                           4 Services                   0      3,940 K",
        "smss.exe                       412 Services                   0      1,120 K",
        "csrss.exe                      620 Services                   0      5,428 K",
        "wininit.exe                    712 Services                   0      4,892 K",
        "services.exe                   788 Services                   0      9,340 K",
        "lsass.exe                      804 Services                   0     18,420 K",
        "svchost.exe                    936 Services                   0     24,196 K",
        ...(spoolerRunning ? ["spoolsv.exe                    4410 Services                   0     14,210 K"] : []),
        "explorer.exe                  2104 Console                    1     64,820 K",
        "chrome.exe                    3390 Console                    1    142,300 K",
        "msedge.exe                    5120 Console                    1    110,480 K",
      ],
      matched: null,
      recognizedCommandUnknownUsage: false,
    };
  }

  // 8. SFC
  if (command === "sfc" && normalized.includes("/scannow")) {
    return {
      output: [
        "Beginning system scan. This process will take some time.",
        "",
        "Beginning verification phase of system scan.",
        "Verification 100% complete.",
        "",
        "Windows Resource Protection did not find any integrity violations.",
      ],
      matched: null,
      recognizedCommandUnknownUsage: false,
    };
  }

  // 9. GPRESULT
  if (command === "gpresult") {
    return {
      output: [
        "Microsoft (R) Windows (R) Operating System Group Policy Result tool v2.0",
        "",
        "USER SETTINGS",
        "--------------",
        `    CN=${enriched.user.name},OU=${enriched.user.department},DC=geedesk,DC=local`,
        "    Last time Group Policy was applied: Today at 08:35:12",
        "    Group Policy was applied from:      DC-CORP-01.geedesk.local",
        "",
        "    Applied Group Policy Objects",
        "    -----------------------------",
        "        Default Domain Policy",
        "        Corporate Security Baseline v24",
        `        ${enriched.user.department} Department Policy`,
      ],
      matched: null,
      recognizedCommandUnknownUsage: false,
    };
  }

  // Fallback for recognized command with no scenario defined match
  return {
    output: [
      `${command}: executed with arguments "${normalized}".`,
      "No anomalies reported for this specific target in the current simulation state.",
      "Tip: Try targets mentioned in the ticket (e.g. Gateway IP, DNS hostname, or affected service).",
    ],
    matched: null,
    recognizedCommandUnknownUsage: true,
  };
}
