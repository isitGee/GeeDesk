import type { Scenario } from "../../types/scenario";

/**
 * NET-1042 — "connected but no internet" is the classic entry-level DNS
 * incident: L1/L2 and routing are fine, only name resolution is broken.
 * The evidence trail is intentionally designed so that pinging by IP works
 * but resolving by name does not — that contrast IS the lesson.
 */
export const net1042: Scenario = {
  id: "net-1042",
  ticketNumber: "NET-1042",
  title: "Internet unavailable",
  category: "Networking",
  difficulty: "beginner",
  user: {
    name: "Sarah Whitfield",
    role: "HR Generalist",
    department: "Human Resources",
  },
  ticketDescription:
    "My computer says it's connected to the office network, but I can't open any websites. It was working fine yesterday.",
  symptoms: [
    "Windows shows the network as \"Connected, no internet\" is not displayed — it shows plain \"Connected\"",
    "No websites load in any browser",
    "Internal HR software behaves inconsistently",
  ],
  hiddenFault:
    "A recent network settings push left Sarah's PC with an incorrect manually-configured DNS server (192.168.1.10, which is not a real DNS host on this network). IP connectivity and routing are completely healthy; only name resolution fails.",
  availableCommands: ["ipconfig", "ping", "nslookup", "tracert", "arp", "netstat"],

  terminalOutputs: [
    {
      id: "out-ipconfig",
      command: "ipconfig",
      match: ["ipconfig", "ipconfig /all"],
      isKeyCommand: true,
      revealsEvidence: ["ev-ip-config"],
      output: [
        "Windows IP Configuration",
        "",
        "Ethernet adapter Ethernet:",
        "",
        "   Connection-specific DNS Suffix  . : geedesk.local",
        "   IPv4 Address. . . . . . . . . . . : 192.168.1.24",
        "   Subnet Mask . . . . . . . . . . . : 255.255.255.0",
        "   Default Gateway . . . . . . . . . : 192.168.1.1",
        "   DNS Servers . . . . . . . . . . . : 192.168.1.10",
      ],
    },
    {
      id: "out-ping-gateway",
      command: "ping",
      match: ["ping 192.168.1.1"],
      isKeyCommand: true,
      revealsEvidence: ["ev-gateway-reachable"],
      output: [
        "Pinging 192.168.1.1 with 32 bytes of data:",
        "Reply from 192.168.1.1: bytes=32 time=1ms TTL=64",
        "Reply from 192.168.1.1: bytes=32 time=1ms TTL=64",
        "Reply from 192.168.1.1: bytes=32 time=1ms TTL=64",
        "Reply from 192.168.1.1: bytes=32 time=1ms TTL=64",
        "",
        "Ping statistics for 192.168.1.1:",
        "    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)",
      ],
    },
    {
      id: "out-ping-external",
      command: "ping",
      match: ["ping 8.8.8.8"],
      isKeyCommand: true,
      revealsEvidence: ["ev-external-reachable"],
      output: [
        "Pinging 8.8.8.8 with 32 bytes of data:",
        "Reply from 8.8.8.8: bytes=32 time=14ms TTL=115",
        "Reply from 8.8.8.8: bytes=32 time=13ms TTL=115",
        "Reply from 8.8.8.8: bytes=32 time=15ms TTL=115",
        "Reply from 8.8.8.8: bytes=32 time=14ms TTL=115",
        "",
        "Ping statistics for 8.8.8.8:",
        "    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)",
      ],
    },
    {
      id: "out-nslookup-pre",
      command: "nslookup",
      match: ["nslookup google.com", "nslookup www.google.com", "nslookup"],
      phase: "pre",
      isKeyCommand: true,
      revealsEvidence: ["ev-dns-timeout"],
      output: [
        "Server:  UnKnown",
        "Address:  192.168.1.10",
        "",
        "DNS request timed out.",
        "    timeout was 2 seconds.",
        "*** Request to UnKnown timed out",
      ],
    },
    {
      id: "out-nslookup-post",
      command: "nslookup",
      match: ["nslookup google.com", "nslookup www.google.com", "nslookup"],
      phase: "post",
      output: [
        "Server:  dns1.geedesk.local",
        "Address:  192.168.1.5",
        "",
        "Non-authoritative answer:",
        "Name:    google.com",
        "Address:  142.250.72.14",
      ],
    },
    {
      id: "out-ping-name-pre",
      command: "ping",
      match: ["ping google.com", "ping www.google.com"],
      phase: "pre",
      revealsEvidence: ["ev-dns-timeout"],
      output: [
        "Ping request could not find host google.com.",
        "Please check the name and try again.",
      ],
    },
    {
      id: "out-ping-name-post",
      command: "ping",
      match: ["ping google.com", "ping www.google.com"],
      phase: "post",
      output: [
        "Pinging google.com [142.250.72.14] with 32 bytes of data:",
        "Reply from 142.250.72.14: bytes=32 time=16ms TTL=115",
        "Reply from 142.250.72.14: bytes=32 time=15ms TTL=115",
        "",
        "Ping statistics for 142.250.72.14:",
        "    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)",
      ],
    },
    {
      id: "out-tracert",
      command: "tracert",
      match: ["tracert google.com", "tracert www.google.com"],
      phase: "pre",
      revealsEvidence: ["ev-tracert-fails"],
      output: [
        "Unable to resolve target system name google.com.",
      ],
    },
    {
      id: "out-arp",
      command: "arp",
      match: ["arp -a", "arp"],
      revealsEvidence: ["ev-arp-normal"],
      output: [
        "Interface: 192.168.1.24 --- 0xb",
        "  Internet Address      Physical Address      Type",
        "  192.168.1.1            aa-14-ff-2b-10-01     dynamic",
        "  192.168.1.254          aa-14-ff-2b-10-fe     dynamic",
      ],
    },
    {
      id: "out-netstat",
      command: "netstat",
      match: ["netstat", "netstat -a"],
      revealsEvidence: ["ev-netstat-normal"],
      output: [
        "Active Connections",
        "",
        "  Proto  Local Address          Foreign Address        State",
        "  TCP    192.168.1.24:52104     192.168.1.20:445       ESTABLISHED",
        "  TCP    192.168.1.24:52110     192.168.1.15:389        ESTABLISHED",
        "  TCP    192.168.1.24:52190     192.168.1.10:53         TIME_WAIT",
      ],
    },
  ],

  evidence: [
    {
      id: "ev-ticket-summary",
      label: "Ticket summary",
      detail: "Sarah (HR) reports her PC shows \"Connected\" but no websites will load in any browser. Started this morning.",
      category: "user-report",
    },
    {
      id: "ev-ip-config",
      label: "IP configuration",
      detail: "Local IP, subnet, and gateway all look correctly assigned. DNS is manually set to 192.168.1.10.",
      category: "network",
      isKey: true,
    },
    {
      id: "ev-gateway-reachable",
      label: "Gateway responds",
      detail: "The default gateway (192.168.1.1) answers pings with 0% loss — the local link and routing to the LAN edge are healthy.",
      category: "network",
      isKey: true,
    },
    {
      id: "ev-external-reachable",
      label: "External IP responds",
      detail: "A public IP address (8.8.8.8) answers pings normally — general internet routing is healthy, so this isn't a full outage.",
      category: "network",
      isKey: true,
    },
    {
      id: "ev-dns-timeout",
      label: "DNS requests time out",
      detail: "Queries to the configured DNS server (192.168.1.10) time out completely — that server isn't answering.",
      category: "network",
      isKey: true,
    },
    {
      id: "ev-tracert-fails",
      label: "tracert can't resolve the target",
      detail: "tracert fails at the very first step because it can't resolve google.com — consistent with a name-resolution failure rather than a routing failure.",
      category: "network",
    },
    {
      id: "ev-arp-normal",
      label: "ARP table looks normal",
      detail: "The gateway's MAC address is cached correctly — this rules out a local cable or switch port problem.",
      category: "system",
    },
    {
      id: "ev-netstat-normal",
      label: "No suspicious connections",
      detail: "Active connections are all to internal addresses. No sign of malware or a firewall blocking outbound traffic.",
      category: "system",
    },
    {
      id: "ev-others-unaffected",
      label: "No one else is affected",
      detail: "Sarah's teammates on the same switch are online with no issues — this is isolated to her machine's configuration, not an office-wide outage.",
      category: "conversation",
      isKey: true,
    },
    {
      id: "ev-internal-ip-access-works",
      label: "Internal portal works by IP, not by name",
      detail: "Sarah can reach the internal HR portal by typing its raw IP address, but not by its hostname — a strong signal this is a name-resolution problem specifically.",
      category: "conversation",
      isKey: true,
    },
    {
      id: "ev-started-after-update",
      label: "Started after an IT config push",
      detail: "The problem began right after Sarah's laptop received a network settings update this morning.",
      category: "conversation",
    },
  ],
  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    {
      id: "q-others-affected",
      prompt: "Is anyone else on your team having the same problem?",
      response: "\"No, actually — the two people sitting next to me are working fine.\"",
      revealsEvidence: ["ev-others-unaffected"],
      isKeyQuestion: true,
    },
    {
      id: "q-when-started",
      prompt: "When exactly did this start?",
      response: "\"This morning, right after my laptop installed some kind of network settings update.\"",
      revealsEvidence: ["ev-started-after-update"],
    },
    {
      id: "q-internal-sites",
      prompt: "Can you reach any internal sites, like the HR portal?",
      response: "\"That's odd — if I type the portal's IP address it opens fine, but typing the normal web address doesn't work.\"",
      revealsEvidence: ["ev-internal-ip-access-works"],
      isKeyQuestion: true,
    },
    {
      id: "q-other-device",
      prompt: "Does another device work fine from your desk or port?",
      response: "\"My personal phone connects to the guest Wi-Fi and browses fine, if that helps.\"",
      revealsEvidence: [],
    },
  ],

  keyConcepts: [
    "Testing the default gateway before assuming a total outage",
    "Testing a raw external IP to separate routing problems from DNS problems",
    "Using nslookup to directly test name resolution",
    "Recognizing 'works by IP, fails by name' as a DNS signature",
    "Correlating the user's account with the technical evidence",
  ],

  diagnosisOptions: [
    {
      id: "diag-dns",
      label: "The configured DNS server is unreachable, so hostnames can't be resolved to IP addresses",
      isCorrect: true,
      explanation:
        "Correct. The gateway and a raw external IP both respond normally, which rules out a routing or link failure — but every hostname lookup times out against the configured DNS server. That combination is the signature of a DNS-only failure.",
    },
    {
      id: "diag-gateway-down",
      label: "The default gateway is down",
      isCorrect: false,
      explanation:
        "The gateway answered every ping with 0% loss, so it's healthy. A dead gateway would also break the raw IP ping to 8.8.8.8, which succeeded.",
    },
    {
      id: "diag-cable",
      label: "A bad network cable or switch port is causing the outage",
      isCorrect: false,
      explanation:
        "A physical layer problem wouldn't let the PC get an IP address, reach the gateway, or ping an external IP — all of which worked fine here.",
    },
    {
      id: "diag-firewall",
      label: "A firewall is blocking all outbound traffic",
      isCorrect: false,
      explanation:
        "Outbound traffic to a raw external IP (8.8.8.8) succeeded, so general outbound traffic isn't being blocked — only name resolution is failing.",
    },
  ],

  resolutionOptions: [
    {
      id: "res-fix-dns",
      label: "Update the DNS server setting to a working DNS server (e.g. 192.168.1.5 or 1.1.1.1)",
      isCorrect: true,
      explanation:
        "This directly addresses the root cause — pointing the adapter at a DNS server that actually answers queries restores name resolution without touching anything else that was already working.",
    },
    {
      id: "res-replace-cable",
      label: "Replace the network cable",
      isCorrect: false,
      explanation:
        "The cable and link are already proven healthy (gateway and external IP both reachable) — replacing it wouldn't change anything.",
    },
    {
      id: "res-restart-router",
      label: "Restart the office router",
      isCorrect: false,
      explanation:
        "Other employees on the same router are unaffected, and the gateway is already responding normally — the fault is local to Sarah's DNS setting, not the router.",
    },
    {
      id: "res-dhcp-renew",
      label: "Release and renew the IP address via DHCP",
      isCorrect: false,
      explanation:
        "Her IP, subnet, and gateway are already correct. A DHCP renewal wouldn't fix a bad DNS entry unless DHCP itself were the source — and other users on DHCP are unaffected.",
    },
  ],

  verification: {
    prompt: "Run a command that proves name resolution is working again.",
    expectedOutputId: "out-nslookup-post",
    successMessage:
      "nslookup now returns a valid answer from the working DNS server — Sarah's browser will resolve hostnames normally again.",
  },

  scoring: {
    investigationMax: 20,
    evidenceMax: 15,
    diagnosisMax: 25,
    resolutionMax: 20,
    verificationMax: 10,
    efficiencyMax: 10,
    hintPenalty: 5,
    freeActionAllowance: 3,
  },

  hints: [
    {
      id: "hint-1",
      text: "Try pinging something by its raw IP address, then try reaching the same kind of thing by name. Compare the results.",
      cost: 5,
    },
    {
      id: "hint-2",
      text: "Ask Sarah whether her coworkers on the same switch are having the same problem.",
      cost: 5,
    },
    {
      id: "hint-3",
      text: "Check which DNS server is configured in ipconfig, then test whether that specific server is actually responding.",
      cost: 8,
    },
  ],

  skills: ["networking", "dns", "troubleshooting-methodology"],
  tags: ["beginner", "dns", "windows", "connectivity"],
  estimatedMinutes: 10,
};
