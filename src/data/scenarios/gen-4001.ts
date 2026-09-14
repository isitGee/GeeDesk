import type { Scenario } from "../../types/scenario";

export const gen4001: Scenario = {
  id: "gen-4001",
  ticketNumber: "GEN-4001",
  title: "Shared printer shows offline for everyone",
  category: "General IT",
  difficulty: "beginner",
  user: { name: "Patricia Nwosu", role: "Office Manager", department: "Administration" },
  ticketDescription: "The 3rd floor printer shows offline for everyone, but it's powered on and has paper.",
  symptoms: [
    "Printer is powered on with paper loaded",
    "Every user on that floor sees it as offline",
    "Facilities briefly unplugged it yesterday to clean around it",
  ],
  hiddenFault: "Facilities briefly unplugged the printer yesterday. When it powered back on, it picked up a new DHCP address (192.168.9.87) instead of the 192.168.9.50 that everyone's print queue expects.",
  availableCommands: ["ping", "arp", "netstat"],

  terminalOutputs: [
    { id: "out-ping-old-pre", command: "ping", match: ["ping 192.168.9.50"], phase: "pre", isKeyCommand: true, revealsEvidence: ["ev-old-ip-dead"],
      output: ["Pinging 192.168.9.50 with 32 bytes of data:", "Request timed out.", "Request timed out.", "Request timed out."] },
    { id: "out-ping-old-post", command: "ping", match: ["ping 192.168.9.50"], phase: "post",
      output: ["Pinging 192.168.9.50 with 32 bytes of data:", "Reply from 192.168.9.50: bytes=32 time=1ms TTL=64", "Reply from 192.168.9.50: bytes=32 time=1ms TTL=64"] },
    { id: "out-ping-new-pre", command: "ping", match: ["ping 192.168.9.87"], phase: "pre", isKeyCommand: true, revealsEvidence: ["ev-new-ip-alive"],
      output: ["Pinging 192.168.9.87 with 32 bytes of data:", "Reply from 192.168.9.87: bytes=32 time=1ms TTL=64", "Reply from 192.168.9.87: bytes=32 time=1ms TTL=64"] },
    { id: "out-ping-new-post", command: "ping", match: ["ping 192.168.9.87"], phase: "post",
      output: ["Pinging 192.168.9.87 with 32 bytes of data:", "Request timed out.", "Request timed out.", "(the printer now holds 192.168.9.50 again after the reservation + reboot)"] },
    { id: "out-arp", command: "arp", match: ["arp -a"], output: ["Interface: 192.168.9.5 --- 0xa", "  Internet Address      Physical Address      Type", "  192.168.9.87           3c-52-a1-90-b2-04     dynamic"] },
    { id: "out-netstat", command: "netstat", match: ["netstat"], output: ["Active Connections", "  (no relevant sessions)"] },
  ],

  evidence: [
    { id: "ev-ticket-summary", category: "user-report", label: "Ticket summary", detail: "The 3rd floor printer is physically fine but shows offline for everyone." },
    { id: "ev-old-ip-dead", category: "network", isKey: true, label: "Configured printer address doesn't respond",
      detail: "The address every print queue expects (192.168.9.50) doesn't respond at all." },
    { id: "ev-new-ip-alive", category: "network", isKey: true, label: "Printer is alive at a different address",
      detail: "The printer's front panel shows it's actually now at 192.168.9.87 — a different address than what's configured." },
    { id: "ev-new-printer-ip", category: "conversation", isKey: true, label: "Front panel shows new IP",
      detail: "Checking the printer's own display shows it currently holds 192.168.9.87." },
    { id: "ev-recent-reboot", category: "conversation", isKey: true, label: "Recently power-cycled",
      detail: "Facilities briefly unplugged the printer yesterday to clean around it." },
    { id: "ev-isolated", category: "conversation", label: "Only this printer affected", detail: "Other shared printers on the same floor and print server are working fine." },
  ],
  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    { id: "q-panel", prompt: "Can you check the printer's own front panel for its current IP address?",
      response: "\"It shows 192.168.9.87.\"", revealsEvidence: ["ev-new-printer-ip"], isKeyQuestion: true },
    { id: "q-recent-event", prompt: "Did anything happen to the printer recently, like a reboot or being unplugged?",
      response: "\"Actually, facilities unplugged it briefly yesterday to clean around it.\"", revealsEvidence: ["ev-recent-reboot"], isKeyQuestion: true },
    { id: "q-others", prompt: "Are other shared printers affected, or just this one?",
      response: "\"Just this one — the others are fine.\"", revealsEvidence: ["ev-isolated"] },
  ],

  keyConcepts: [
    "Using a device's own front panel as a legitimate diagnostic source, not just remote tools",
    "Recognizing that a power-cycle can trigger a new DHCP lease and break address-dependent configs",
    "Preferring a fix that prevents recurrence (a reservation) over a one-time patch",
  ],

  diagnosisOptions: [
    { id: "diag-ip-changed", isCorrect: true,
      label: "The printer picked up a new IP address after being power-cycled, but every print queue still points at its old address",
      explanation: "Correct. The configured address is dead, but the printer's own display confirms it's alive at a different address — and it was power-cycled right before this started." },
    { id: "diag-printer-broken", isCorrect: false, label: "The printer itself is broken or out of supplies",
      explanation: "The printer is confirmed powered on with paper loaded — this isn't a hardware or supply issue." },
    { id: "diag-server-crashed", isCorrect: false, label: "The print server service crashed",
      explanation: "Other shared printers on the exact same print server are working fine for everyone." },
    { id: "diag-floor-outage", isCorrect: false, label: "There's a network outage on the 3rd floor",
      explanation: "Other devices and printers on the same floor have no connectivity issues." },
  ],

  resolutionOptions: [
    { id: "res-reservation", isCorrect: true, label: "Set a DHCP reservation so the printer always gets 192.168.9.50, then reboot it",
      explanation: "This restores the address every print queue already expects and prevents the same problem the next time the printer restarts." },
    { id: "res-update-all-queues", isCorrect: false, label: "Manually update every user's print queue to the new IP",
      explanation: "This might work for now, but it's far more effort across every affected user, and doesn't prevent the exact same problem next time the printer reboots." },
    { id: "res-replace-printer", isCorrect: false, label: "Replace the printer",
      explanation: "The printer hardware is completely fine — this is purely an addressing issue." },
    { id: "res-restart-server", isCorrect: false, label: "Restart the print server",
      explanation: "Every other printer on that same server is working normally — the fault is isolated to this one device's address." },
  ],

  verification: { prompt: "Confirm the printer now responds at the address everyone's queue expects.", expectedOutputId: "out-ping-old-post",
    successMessage: "192.168.9.50 now responds — the printer holds its expected address again and queues will work normally." },

  scoring: { investigationMax: 20, evidenceMax: 15, diagnosisMax: 25, resolutionMax: 20, verificationMax: 10, efficiencyMax: 10, hintPenalty: 4, freeActionAllowance: 3 },
  hints: [
    { id: "hint-1", cost: 4, text: "Check the printer's own front panel display — it often shows its current IP address directly." },
    { id: "hint-2", cost: 4, text: "Ask whether the printer was recently power-cycled or unplugged." },
  ],
  skills: ["general-it", "printers", "troubleshooting-methodology"],
  tags: ["beginner", "printers", "dhcp"],
  estimatedMinutes: 8,
};
