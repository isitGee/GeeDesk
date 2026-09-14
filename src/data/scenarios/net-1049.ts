import type { Scenario } from "../../types/scenario";

export const net1049: Scenario = {
  id: "net-1049",
  ticketNumber: "NET-1049",
  title: "Wired network completely dead, cable is plugged in",
  category: "Networking",
  difficulty: "intermediate",
  user: { name: "Ben Carter", role: "Graphic Designer", department: "Marketing" },
  ticketDescription: "My desktop suddenly lost network access completely. Windows says the cable might be unplugged, but I've checked — it's definitely plugged in on both ends.",
  symptoms: ["No IP address at all, adapter shows disconnected", "Cable is confirmed plugged in at both ends", "Two nearby coworkers lost connection around the same time"],
  hiddenFault: "A coworker connected a small personal switch under their desk in a way that created a network loop. The switch's loop-protection feature automatically disabled every port on that segment, including Ben's.",
  availableCommands: ["ipconfig", "ping", "nslookup", "tracert", "arp", "netstat"],

  terminalOutputs: [
    { id: "out-ipconfig-pre", command: "ipconfig", match: ["ipconfig"], phase: "pre", isKeyCommand: true, revealsEvidence: ["ev-media-disconnected"],
      output: ["Ethernet adapter Ethernet:", "   Media State . . . . . . . . . . . : Media disconnected", "   Connection-specific DNS Suffix  . :"] },
    { id: "out-ipconfig-post", command: "ipconfig", match: ["ipconfig"], phase: "post",
      output: ["Ethernet adapter Ethernet:", "   IPv4 Address. . . . . . . . . . . : 192.168.3.77", "   Subnet Mask . . . . . . . . . . . : 255.255.255.0", "   Default Gateway . . . . . . . . . : 192.168.3.1"] },
    { id: "out-ping-pre", command: "ping", match: ["ping 192.168.3.1"], phase: "pre",
      output: ["Pinging 192.168.3.1 with 32 bytes of data:", "PING: transmit failed. General failure."] },
    { id: "out-ping-post", command: "ping", match: ["ping 192.168.3.1"], phase: "post",
      output: ["Pinging 192.168.3.1 with 32 bytes of data:", "Reply from 192.168.3.1: bytes=32 time=1ms TTL=64", "Reply from 192.168.3.1: bytes=32 time=1ms TTL=64"] },
    { id: "out-arp", command: "arp", match: ["arp -a"], output: ["No ARP Entries Found"] },
    { id: "out-netstat", command: "netstat", match: ["netstat"], output: ["Active Connections", "  (none — adapter is disconnected)"] },
    { id: "out-nslookup", command: "nslookup", match: ["nslookup google.com"], output: ["*** UnKnown can't find google.com: No response from server"] },
    { id: "out-tracert", command: "tracert", match: ["tracert google.com"], output: ["Unable to contact IP driver. General failure."] },
  ],

  evidence: [
    { id: "ev-ticket-summary", category: "user-report", label: "Ticket summary", detail: "Ben's desktop shows a fully disconnected network, despite the cable being plugged in." },
    { id: "ev-media-disconnected", category: "network", isKey: true, label: "Media disconnected at the adapter",
      detail: "ipconfig shows 'Media disconnected' — the adapter isn't seeing a link at all, not just missing an IP." },
    { id: "ev-cable-confirmed", category: "user-report", isKey: true, label: "Cable confirmed plugged in",
      detail: "Ben checked both ends of his cable twice — it's fully seated." },
    { id: "ev-loop-device", category: "conversation", isKey: true, label: "A coworker added a small switch",
      detail: "A neighbor borrowed a small personal switch to add extra ports under their desk this morning." },
    { id: "ev-cluster-affected", category: "conversation", isKey: true, label: "Multiple nearby desks affected",
      detail: "Two other coworkers on the same run of desks lost their wired connection at almost the same time." },
  ],
  defaultEvidenceIds: ["ev-ticket-summary", "ev-cable-confirmed"],

  conversationQuestions: [
    { id: "q-recent-change", prompt: "Did anything change at your desks recently — new cables or devices plugged in?",
      response: "\"My neighbor mentioned borrowing a little switch to add more ports under his desk this morning.\"",
      revealsEvidence: ["ev-loop-device"], isKeyQuestion: true },
    { id: "q-others", prompt: "Is anyone else nearby also having network problems?",
      response: "\"Actually yeah — two other people on our row lost their connection around the same time as me.\"",
      revealsEvidence: ["ev-cluster-affected"], isKeyQuestion: true },
    { id: "q-cable-check", prompt: "Just to be sure — is the cable fully plugged in on both ends?",
      response: "\"Yes, I've checked it twice now.\"", revealsEvidence: [] },
  ],

  keyConcepts: [
    "Reading 'Media disconnected' as a Layer 1/2 signal problem, not a missing IP address",
    "Recognizing that several people losing link at once points to the switch, not individual cables",
    "Connecting an unauthorized small switch/hub to loop protection shutting a port down",
  ],

  diagnosisOptions: [
    { id: "diag-loop", isCorrect: true,
      label: "The switch automatically disabled the port(s) after detecting a network loop from the borrowed switch",
      explanation: "Correct. Media disconnected despite a confirmed-good cable, multiple nearby people affected simultaneously, and a freshly added unmanaged switch together point straight at a loop triggering port shutdown." },
    { id: "diag-cable-bad", isCorrect: false, label: "Ben's network cable is faulty",
      explanation: "The cable was checked and confirmed fully seated at both ends, and two other people lost connection at the same time — a single bad cable wouldn't explain that." },
    { id: "diag-nic-failed", isCorrect: false, label: "Ben's network card has failed",
      explanation: "A single failed NIC wouldn't explain multiple coworkers on nearby desks losing their connection at the same moment." },
    { id: "diag-building-outage", isCorrect: false, label: "The whole building's network is down",
      explanation: "Only a small cluster of nearby desks lost connection — a building-wide outage would affect far more than that." },
  ],

  resolutionOptions: [
    { id: "res-remove-loop", isCorrect: true, label: "Remove the borrowed switch causing the loop and have IT re-enable the affected switch port(s)",
      explanation: "This eliminates the loop at its source and restores the ports that were automatically shut down to protect the network." },
    { id: "res-replace-cable", isCorrect: false, label: "Replace Ben's network cable",
      explanation: "The cable was already confirmed good — replacing it won't re-enable a port the switch disabled on purpose." },
    { id: "res-restart-pc", isCorrect: false, label: "Restart Ben's computer", explanation: "A restart on his end can't override a protective shutdown happening at the switch." },
    { id: "res-wifi", isCorrect: false, label: "Have Ben switch to Wi-Fi permanently",
      explanation: "That's a workaround for one person, not a fix — it leaves the loop in place and the other affected coworkers still without a wired connection." },
  ],

  verification: { prompt: "Confirm his wired connection is back.", expectedOutputId: "out-ping-post",
    successMessage: "His adapter shows a normal address again and the gateway responds — the port was successfully re-enabled." },

  scoring: { investigationMax: 20, evidenceMax: 15, diagnosisMax: 25, resolutionMax: 20, verificationMax: 10, efficiencyMax: 10, hintPenalty: 5, freeActionAllowance: 3 },
  hints: [
    { id: "hint-1", cost: 5, text: "'Media disconnected' means the adapter sees no link at all — that's different from just missing an IP address." },
    { id: "hint-2", cost: 5, text: "Ask whether anyone nearby is having the same issue, and whether any new equipment was plugged in recently." },
  ],
  skills: ["networking", "switching", "troubleshooting-methodology"],
  tags: ["intermediate", "switching", "hardware"],
  estimatedMinutes: 10,
};
