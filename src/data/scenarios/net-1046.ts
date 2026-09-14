import type { Scenario } from "../../types/scenario";

export const net1046: Scenario = {
  id: "net-1046",
  ticketNumber: "NET-1046",
  title: "Wi-Fi is painfully slow in the conference room",
  category: "Networking",
  difficulty: "intermediate",
  user: { name: "Aisha Bello", role: "UX Designer", department: "Product" },
  ticketDescription:
    "My laptop shows full Wi-Fi bars in the icon but everything loads painfully slowly and drops constantly once I'm in the conference room.",
  symptoms: [
    "Connection is fine at her desk, terrible in the conference room",
    "Windows still shows a Wi-Fi connection, just very slow",
    "Video calls freeze and drop in that room specifically",
  ],
  hiddenFault:
    "Her laptop stayed associated with the distant lobby access point instead of roaming to the much closer conference-room access point — a classic 'sticky client' problem — so it's working with a very weak, congested signal.",
  availableCommands: ["ipconfig", "ping", "nslookup", "tracert", "arp", "netstat", "netsh"],

  terminalOutputs: [
    { id: "out-netsh-pre", command: "netsh", match: ["netsh wlan show interfaces"], phase: "pre",
      isKeyCommand: true, revealsEvidence: ["ev-weak-signal"],
      output: ["Name                   : Wi-Fi", "SSID                   : GeeDesk-Corp", "BSSID                  : 3c-de-a1-90-11-04  (AP-Lobby-04)", "Signal                 : 24%", "Radio type             : 802.11n"] },
    { id: "out-netsh-post", command: "netsh", match: ["netsh wlan show interfaces"], phase: "post",
      output: ["Name                   : Wi-Fi", "SSID                   : GeeDesk-Corp", "BSSID                  : 9a-11-c4-20-88-12  (AP-ConfRoom-12)", "Signal                 : 88%", "Radio type             : 802.11ac"] },
    { id: "out-ipconfig", command: "ipconfig", match: ["ipconfig"], revealsEvidence: ["ev-ip-normal"],
      output: ["Wireless LAN adapter Wi-Fi:", "   IPv4 Address. . . . . . . . . . . : 192.168.40.61", "   Subnet Mask . . . . . . . . . . . : 255.255.255.0", "   Default Gateway . . . . . . . . . : 192.168.40.1"] },
    { id: "out-ping-gw-pre", command: "ping", match: ["ping 192.168.40.1"], phase: "pre", isKeyCommand: true, revealsEvidence: ["ev-high-latency"],
      output: ["Pinging 192.168.40.1 with 32 bytes of data:", "Reply from 192.168.40.1: bytes=32 time=210ms TTL=64", "Request timed out.", "Reply from 192.168.40.1: bytes=32 time=185ms TTL=64", "", "Ping statistics for 192.168.40.1:", "    Packets: Sent = 4, Received = 3, Lost = 1 (25% loss)"] },
    { id: "out-ping-gw-post", command: "ping", match: ["ping 192.168.40.1"], phase: "post",
      output: ["Pinging 192.168.40.1 with 32 bytes of data:", "Reply from 192.168.40.1: bytes=32 time=2ms TTL=64", "Reply from 192.168.40.1: bytes=32 time=1ms TTL=64", "", "Ping statistics for 192.168.40.1:", "    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)"] },
    { id: "out-nslookup", command: "nslookup", match: ["nslookup google.com"],
      output: ["Server:  dns1.geedesk.local", "Address:  192.168.40.10", "", "Non-authoritative answer:", "Name:    google.com", "Address:  142.250.72.14"] },
    { id: "out-arp", command: "arp", match: ["arp -a"],
      output: ["Interface: 192.168.40.61 --- 0xe", "  Internet Address      Physical Address      Type", "  192.168.40.1           3c-de-a1-90-11-04     dynamic"] },
    { id: "out-tracert", command: "tracert", match: ["tracert google.com"],
      output: ["Tracing route to google.com over a maximum of 30 hops:", "  1   198 ms   12 ms  205 ms  192.168.40.1", "  2    22 ms    19 ms    21 ms  10.0.0.1"] },
    { id: "out-netstat", command: "netstat", match: ["netstat"], output: ["Active Connections", "  TCP    192.168.40.61:52301   192.168.40.10:443     ESTABLISHED"] },
  ],

  evidence: [
    { id: "ev-ticket-summary", category: "user-report", label: "Ticket summary", detail: "Aisha's Wi-Fi shows connected but is unusably slow specifically in the conference room." },
    { id: "ev-weak-signal", category: "network", isKey: true, label: "Very weak signal on a distant AP",
      detail: "Her laptop is still associated with the lobby access point at only 24% signal, even though she's now in the conference room." },
    { id: "ev-ip-normal", category: "network", label: "Normal IP configuration",
      detail: "Her IP, subnet, and gateway are all assigned normally — this isn't an addressing problem." },
    { id: "ev-high-latency", category: "network", isKey: true, label: "High latency and packet loss",
      detail: "Pings to the gateway show 200ms+ latency and dropped packets — consistent with a weak, congested radio link, not a wired problem." },
    { id: "ev-others-fine-conf-room", category: "conversation", isKey: true, label: "Others fine in the same room",
      detail: "A coworker sitting right next to her in the conference room has a strong, fast connection." },
    { id: "ev-worked-at-desk", category: "conversation", label: "Fine at her own desk",
      detail: "Her connection is completely normal at her usual desk." },
  ],
  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    { id: "q-others-room", prompt: "Is anyone else in the conference room having the same problem?",
      response: "\"No — the person next to me is on a video call with zero issues.\"", revealsEvidence: ["ev-others-fine-conf-room"], isKeyQuestion: true },
    { id: "q-desk-fine", prompt: "Is your Wi-Fi normal back at your own desk?",
      response: "\"Yeah, totally fine at my desk. It's just this room.\"", revealsEvidence: ["ev-worked-at-desk"], isKeyQuestion: true },
    { id: "q-how-long", prompt: "How long does it take to get slow after you arrive?",
      response: "\"It's slow pretty much the second I sit down.\"", revealsEvidence: [] },
  ],

  keyConcepts: [
    "Reading Wi-Fi signal strength and access point association, not just 'connected or not'",
    "Recognizing 'sticky client' behavior — staying on a far AP instead of roaming",
    "Using a nearby unaffected coworker to rule out a room-wide outage",
  ],

  diagnosisOptions: [
    { id: "diag-sticky", isCorrect: true,
      label: "Her laptop stayed connected to a distant access point instead of roaming to the closer, stronger one in that room",
      explanation: "Correct. The signal strength and BSSID show she's still riding the far lobby AP — a classic sticky-client problem — while a coworker on the near AP is fine." },
    { id: "diag-internet-down", isCorrect: false, label: "The building's internet connection is down",
      explanation: "A coworker in the same room has a strong, fast connection at the same time — the internet uplink itself is fine." },
    { id: "diag-driver", isCorrect: false, label: "Her Wi-Fi adapter driver is corrupted",
      explanation: "The same adapter works perfectly at her desk minutes earlier — a corrupted driver wouldn't selectively fail only in one room." },
    { id: "diag-network-down", isCorrect: false, label: "The whole office Wi-Fi network is down",
      explanation: "Only she is affected in that room; everyone else's connection is normal." },
  ],

  resolutionOptions: [
    { id: "res-reconnect", isCorrect: true, label: "Disconnect and reconnect to Wi-Fi so the laptop re-associates with the nearest access point",
      explanation: "Forcing a fresh association lets the laptop pick the strongest nearby AP instead of clinging to the distant one." },
    { id: "res-restart-router", isCorrect: false, label: "Restart the building's wireless network",
      explanation: "Every other device in the building is working fine — restarting the whole wireless network is disruptive and doesn't target the actual sticky-client behavior." },
    { id: "res-replace-card", isCorrect: false, label: "Replace her Wi-Fi adapter",
      explanation: "The adapter works perfectly at her desk — there's no hardware fault to replace." },
    { id: "res-move-desk", isCorrect: false, label: "Permanently move her desk closer to an access point",
      explanation: "That's not a fix IT can apply, and it doesn't address the underlying roaming behavior for the next time she moves around the building." },
  ],

  verification: { prompt: "Confirm she's now associated with a strong, nearby access point.", expectedOutputId: "out-netsh-post",
    successMessage: "She's now on the conference-room access point at 88% signal — video calls should be smooth again." },

  scoring: { investigationMax: 20, evidenceMax: 15, diagnosisMax: 25, resolutionMax: 20, verificationMax: 10, efficiencyMax: 10, hintPenalty: 5, freeActionAllowance: 3 },
  hints: [
    { id: "hint-1", cost: 5, text: "Check which access point (BSSID) she's actually associated with, and how strong that signal is." },
    { id: "hint-2", cost: 5, text: "Ask whether anyone else in that same room is having trouble right now." },
  ],
  skills: ["networking", "wifi", "troubleshooting-methodology"],
  tags: ["intermediate", "wifi", "wireless"],
  estimatedMinutes: 9,
};
