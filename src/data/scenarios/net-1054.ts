import type { Scenario } from "../../types/scenario";

export const net1054: Scenario = {
  id: "net-1054",
  ticketNumber: "NET-1054",
  title: "Intermittent connection drops and duplicate IP warnings on shipping PC",
  category: "Networking",
  difficulty: "beginner",
  user: { name: "Todd Henderson", role: "Logistics Lead", department: "Warehouse" },
  ticketDescription:
    "Every afternoon around 1:00 PM, my shipping workstation (SHIP-PC-01) disconnects from the label printer and drops out of our ERP system. A Windows popup says 'Another computer on this network has the same IP address'.",
  symptoms: [
    "Periodic Windows notification: 'There is an IP address conflict with another system on the network'",
    "ERP software and local label printer disconnect unexpectedly",
    "Pinging the default gateway shows erratic latency and duplicate replies",
  ],
  hiddenFault:
    "A warehouse contractor plugged in a handheld barcode cradle configured with an unauthorized static IP (192.168.20.105), which overlaps with the DHCP scope allocation assigned to Todd's PC.",
  availableCommands: ["arp", "ping", "ipconfig"],

  terminalOutputs: [
    {
      id: "out-ipconfig",
      command: "ipconfig",
      match: ["ipconfig", "ipconfig /all"],
      revealsEvidence: ["ev-todd-ip"],
      output: [
        "Windows IP Configuration",
        "",
        "Ethernet adapter Ethernet:",
        "   Connection-specific DNS Suffix  . : warehouse.geedesk.local",
        "   IPv4 Address. . . . . . . . . . . : 192.168.20.105",
        "   Subnet Mask . . . . . . . . . . . : 255.255.255.0",
        "   Default Gateway . . . . . . . . . : 192.168.20.1",
        "   DHCP Enabled. . . . . . . . . . . : Yes",
      ],
    },
    {
      id: "out-arp-pre",
      command: "arp",
      match: ["arp -a", "arp -a 192.168.20.105"],
      phase: "pre",
      isKeyCommand: true,
      revealsEvidence: ["ev-duplicate-mac"],
      output: [
        "Interface: 192.168.20.105 --- 0x4",
        "  Internet Address      Physical Address      Type",
        "  192.168.20.1          00-1b-d4-ee-aa-01     dynamic",
        "  192.168.20.105        70-b3-d5-8c-11-22     dynamic (Conflicting MAC from Zebra Scanner)",
        "  192.168.20.255        ff-ff-ff-ff-ff-ff     static",
      ],
    },
    {
      id: "out-arp-post",
      command: "arp",
      match: ["arp -a", "arp -a 192.168.20.105"],
      phase: "post",
      output: [
        "Interface: 192.168.20.188 --- 0x4",
        "  Internet Address      Physical Address      Type",
        "  192.168.20.1          00-1b-d4-ee-aa-01     dynamic",
        "  192.168.20.255        ff-ff-ff-ff-ff-ff     static",
      ],
    },
    {
      id: "out-ping-pre",
      command: "ping",
      match: ["ping 192.168.20.1"],
      phase: "pre",
      output: [
        "Pinging 192.168.20.1 with 32 bytes of data:",
        "Reply from 192.168.20.1: bytes=32 time=1ms TTL=64",
        "Request timed out.",
        "Reply from 192.168.20.1: bytes=32 time=450ms TTL=64",
        "Reply from 192.168.20.1: bytes=32 time=1ms TTL=64",
      ],
    },
    {
      id: "out-ping-post",
      command: "ping",
      match: ["ping 192.168.20.1"],
      phase: "post",
      output: [
        "Pinging 192.168.20.1 with 32 bytes of data:",
        "Reply from 192.168.20.1: bytes=32 time=1ms TTL=64",
        "Reply from 192.168.20.1: bytes=32 time=1ms TTL=64",
        "Reply from 192.168.20.1: bytes=32 time=1ms TTL=64",
        "Reply from 192.168.20.1: bytes=32 time=1ms TTL=64",
        "Ping statistics for 192.168.20.1: Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)",
      ],
    },
  ],

  evidence: [
    {
      id: "ev-ticket-summary",
      category: "user-report",
      label: "Ticket summary",
      detail: "Todd reports Windows IP address conflict warning and dropping ERP connection around 1:00 PM daily.",
    },
    {
      id: "ev-todd-ip",
      category: "network",
      label: "Todd's IP is 192.168.20.105 via DHCP",
      detail: "The workstation holds a lease for 192.168.20.105 on the warehouse subnet.",
    },
    {
      id: "ev-duplicate-mac",
      category: "network",
      isKey: true,
      label: "Duplicate MAC recorded in ARP table",
      detail: "ARP shows MAC 70-b3-d5-8c-11-22 (registered to Zebra Technologies) claiming 192.168.20.105.",
    },
    {
      id: "ev-shift-change",
      category: "conversation",
      label: "Afternoon shift starts at 1:00 PM",
      detail: "Todd mentions the afternoon picking crew powers on their inventory barcode scanners right at 1:00 PM.",
    },
  ],

  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    {
      id: "q-what-happens-at-one",
      question: "What happens in the warehouse at 1:00 PM each day?",
      answer: "The second inventory shift begins; workers grab handheld scanners from the dock charging stations.",
      isKey: true,
      revealsEvidence: ["ev-shift-change"],
    },
    {
      id: "q-reboot-pc",
      question: "Does restarting your computer temporarily fix the issue?",
      answer: "Sometimes it works for a few minutes, but then the warning box pops right back up.",
    },
  ],

  diagnosisOptions: [
    {
      id: "diag-ip-conflict",
      label: "IP address conflict caused by a secondary device (Zebra barcode scanner) statically configured with Todd's leased IP.",
      isCorrect: true,
    },
    {
      id: "diag-bad-patch-cable",
      label: "Physical cable fault on Todd's network jack causing packet corruption.",
      isCorrect: false,
    },
    {
      id: "diag-switch-loop",
      label: "Spanning Tree Protocol broadcast storm from a network loop in the warehouse.",
      isCorrect: false,
    },
  ],

  resolutionOptions: [
    {
      id: "res-dhcp-exclude",
      label: "Reconfigure the barcode scanner to use DHCP (or create a DHCP reservation/exclusion), then release and renew Todd's IP.",
      isCorrect: true,
    },
    {
      id: "res-disable-nic",
      label: "Disable and re-enable Todd's network adapter.",
      isCorrect: false,
      simulatedConsequence: "Todd received the same IP back from DHCP cache; conflict popped up again 2 minutes later.",
      efficiencyPenalty: 3,
    },
    {
      id: "res-replace-switch",
      label: "Power cycle the warehouse core network switch.",
      isCorrect: false,
      simulatedConsequence: "Interrupted all picking operations for 8 minutes; conflict returned as soon as devices reconnected.",
      efficiencyPenalty: 6,
    },
  ],

  verification: {
    prompt: "Run a ping command to confirm uninterrupted, stable connectivity to the warehouse gateway (192.168.20.1).",
    expectedOutputId: "out-ping-post",
    successMessage: "Ping confirms zero packet loss and 1ms latency to gateway without ARP collisions.",
  },

  hints: [
    { id: "h-1", text: "Two devices sharing the same IP cause erratic packet delivery and OS conflict warnings.", cost: 2 },
    { id: "h-2", text: "Check the local ARP cache with 'arp -a' to see which hardware MAC address is answering.", cost: 4 },
    { id: "h-3", text: "A Zebra barcode cradle has a conflicting static IP. Reconfigure it or reserve an excluded IP.", cost: 7 },
  ],

  scoring: {
    investigationMax: 20,
    evidenceMax: 15,
    diagnosisMax: 25,
    resolutionMax: 20,
    verificationMax: 10,
    efficiencyMax: 10,
  },

  skills: ["ARP", "DHCP", "IP Conflict", "MAC Addressing", "Warehouse IT"],
  tags: ["Networking", "DHCP", "ARP", "Hardware"],
};
