import type { Scenario } from "../../types/scenario";

export const net1043: Scenario = {
  id: "net-1043",
  ticketNumber: "NET-1043",
  title: "Scanner shows no network",
  category: "Networking",
  difficulty: "beginner",
  user: { name: "Marcus Chen", role: "Warehouse Associate", department: "Logistics" },
  ticketDescription: "My handheld scanner shows a 'No Network' icon and I can't scan shipments. It was fine yesterday.",
  symptoms: [
    "Scanner shows a red 'No Network' icon",
    "Can't submit any scanned shipments",
    "Started this morning, right after new devices joined the warehouse Wi-Fi",
  ],
  hiddenFault:
    "The warehouse Wi-Fi's DHCP scope has a small address pool. A batch of new tablets consumed the remaining leases, so this scanner fell back to a self-assigned APIPA address instead of getting a real one.",
  availableCommands: ["ipconfig", "ping", "nslookup", "tracert", "arp", "netstat"],

  terminalOutputs: [
    {
      id: "out-ipconfig", command: "ipconfig", match: ["ipconfig", "ipconfig /all"], phase: "pre",
      isKeyCommand: true, revealsEvidence: ["ev-apipa"],
      output: [
        "Wireless LAN adapter Wi-Fi:",
        "",
        "   Connection-specific DNS Suffix  . : warehouse.local",
        "   IPv4 Address. . . . . . . . . . . : 169.254.23.11",
        "   Subnet Mask . . . . . . . . . . . : 255.255.0.0",
        "   Default Gateway . . . . . . . . . :",
      ],
    },
    {
      id: "out-ipconfig-post", command: "ipconfig", match: ["ipconfig", "ipconfig /all"], phase: "post",
      output: [
        "Wireless LAN adapter Wi-Fi:",
        "",
        "   Connection-specific DNS Suffix  . : warehouse.local",
        "   IPv4 Address. . . . . . . . . . . : 10.20.4.57",
        "   Subnet Mask . . . . . . . . . . . : 255.255.0.0",
        "   Default Gateway . . . . . . . . . : 10.20.4.1",
      ],
    },
    {
      id: "out-ping-gw-pre", command: "ping", match: ["ping 10.20.4.1"], phase: "pre",
      isKeyCommand: true, revealsEvidence: ["ev-no-gateway"],
      output: ["PING: transmit failed. General failure.", "This device has no default gateway configured."],
    },
    {
      id: "out-ping-gw-post", command: "ping", match: ["ping 10.20.4.1"], phase: "post",
      output: [
        "Pinging 10.20.4.1 with 32 bytes of data:",
        "Reply from 10.20.4.1: bytes=32 time=3ms TTL=64",
        "Reply from 10.20.4.1: bytes=32 time=2ms TTL=64",
      ],
    },
    {
      id: "out-ping-ext-pre", command: "ping", match: ["ping 8.8.8.8"], phase: "pre",
      revealsEvidence: ["ev-no-internet"],
      output: ["PING: transmit failed. General failure."],
    },
    {
      id: "out-ping-ext-post", command: "ping", match: ["ping 8.8.8.8"], phase: "post",
      output: [
        "Pinging 8.8.8.8 with 32 bytes of data:",
        "Reply from 8.8.8.8: bytes=32 time=19ms TTL=112",
        "Reply from 8.8.8.8: bytes=32 time=18ms TTL=112",
        "",
        "Ping statistics for 8.8.8.8:",
        "    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)",
      ],
    },
    {
      id: "out-arp", command: "arp", match: ["arp -a", "arp"],
      revealsEvidence: ["ev-arp-empty"],
      output: ["No ARP Entries Found"],
    },
    {
      id: "out-nslookup", command: "nslookup", match: ["nslookup google.com", "nslookup"],
      output: ["*** UnKnown can't find google.com: No response from server"],
    },
    {
      id: "out-tracert", command: "tracert", match: ["tracert google.com"],
      output: ["Unable to contact IP driver. General failure."],
    },
    {
      id: "out-netstat", command: "netstat", match: ["netstat", "netstat -a"],
      output: ["Active Connections", "", "  (none — no established network sessions)"],
    },
  ],

  evidence: [
    { id: "ev-ticket-summary", label: "Ticket summary", category: "user-report",
      detail: "Marcus (Warehouse) says his scanner shows 'No Network' since this morning." },
    { id: "ev-apipa", label: "Self-assigned APIPA address", category: "network", isKey: true,
      detail: "The scanner has a 169.254.x.x address — a sign it never got a response from the DHCP server." },
    { id: "ev-no-gateway", label: "No default gateway", category: "network", isKey: true,
      detail: "No gateway is configured at all, consistent with DHCP never completing." },
    { id: "ev-no-internet", label: "No general connectivity", category: "network",
      detail: "The device can't reach anything off its own segment — expected once DHCP has failed entirely." },
    { id: "ev-arp-empty", label: "Empty ARP table", category: "system",
      detail: "The device hasn't successfully exchanged traffic with anything nearby yet." },
    { id: "ev-others-affected", label: "Other scanners affected too", category: "conversation", isKey: true,
      detail: "Two other warehouse scanners lost their connection this morning as well." },
    { id: "ev-new-devices", label: "New devices added recently", category: "conversation", isKey: true,
      detail: "IT added a batch of new tablets to the warehouse Wi-Fi earlier this week." },
  ],
  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    { id: "q-others", prompt: "Are other devices having the same problem?",
      response: "\"Yeah, actually — two other scanners on the floor stopped connecting this morning too.\"",
      revealsEvidence: ["ev-others-affected"], isKeyQuestion: true },
    { id: "q-changes", prompt: "Has anything changed on the network recently?",
      response: "\"IT rolled out a bunch of new tablets to the warehouse this week, if that matters.\"",
      revealsEvidence: ["ev-new-devices"], isKeyQuestion: true },
    { id: "q-reboot", prompt: "Did restarting the scanner help?",
      response: "\"I restarted it twice. Same red icon both times.\"", revealsEvidence: [] },
  ],

  keyConcepts: [
    "Recognizing a 169.254.x.x address as a failed DHCP request (APIPA)",
    "Distinguishing 'never got an address' from 'has an address but can't route'",
    "Correlating a new-device rollout with sudden DHCP failures for others",
  ],

  diagnosisOptions: [
    { id: "diag-dhcp-exhausted", isCorrect: true,
      label: "The DHCP scope has run out of available addresses, so this device fell back to a self-assigned address",
      explanation: "Correct. A 169.254.x.x address with no gateway means DHCP never completed. Combined with other devices failing right after new ones joined, the scope is exhausted." },
    { id: "diag-radio-broken", isCorrect: false, label: "The scanner's Wi-Fi radio is broken",
      explanation: "A broken radio wouldn't associate to the network at all. This device did associate — it just never received a DHCP lease." },
    { id: "diag-dns-down", isCorrect: false, label: "The DNS server is down",
      explanation: "DNS failures don't prevent a device from getting an IP address or gateway. This device never completed basic addressing at all." },
    { id: "diag-gateway-crashed", isCorrect: false, label: "The gateway router has crashed",
      explanation: "Devices that joined before the new tablets are working fine — a crashed gateway would affect everyone, not just newly-joining devices." },
  ],

  resolutionOptions: [
    { id: "res-expand-scope", isCorrect: true,
      label: "Have IT expand the DHCP scope (or shorten lease times) so there are enough addresses for every device",
      explanation: "This fixes the actual shortage, so this scanner and the next new device can both get valid leases." },
    { id: "res-static-ip", isCorrect: false, label: "Assign this one scanner a static IP address",
      explanation: "This gets one device working but leaves the other affected scanners — and the next new device — with the same problem." },
    { id: "res-reboot-ap", isCorrect: false, label: "Reboot the warehouse Wi-Fi access point",
      explanation: "Existing devices are already connected and fine — the access point itself is working. Rebooting it doesn't create more address space." },
    { id: "res-replace-cable", isCorrect: false, label: "Replace the scanner's network cable",
      explanation: "This is a Wi-Fi device with no cable, and it already associated to the network — the failure is in getting an address, not the radio link." },
  ],

  verification: {
    prompt: "Confirm the scanner actually gets a real address and can reach the network.",
    expectedOutputId: "out-ping-ext-post",
    successMessage: "The scanner now holds a normal 10.20.4.x address and reaches the internet — it'll scan normally again.",
  },

  scoring: {
    investigationMax: 20, evidenceMax: 15, diagnosisMax: 25, resolutionMax: 20,
    verificationMax: 10, efficiencyMax: 10, hintPenalty: 4, freeActionAllowance: 3,
  },

  hints: [
    { id: "hint-1", cost: 4, text: "Look closely at the IP address ipconfig reports. Does it look like a normal address for this network?" },
    { id: "hint-2", cost: 4, text: "Ask whether other devices nearby have started having the same problem." },
  ],

  skills: ["networking", "dhcp", "troubleshooting-methodology"],
  tags: ["beginner", "dhcp", "wireless", "connectivity"],
  estimatedMinutes: 8,
};
