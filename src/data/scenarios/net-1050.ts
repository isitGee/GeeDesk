import type { Scenario } from "../../types/scenario";

export const net1050: Scenario = {
  id: "net-1050",
  ticketNumber: "NET-1050",
  title: "Copying files to the shared drive is painfully slow",
  category: "Networking",
  difficulty: "intermediate",
  user: { name: "Lauren Kim", role: "Data Analyst", department: "Analytics" },
  ticketDescription: "Browsing is fine, but copying anything to the shared drive takes forever and sometimes fails partway through.",
  symptoms: ["Web browsing and email are completely normal", "Large file copies to the shared drive crawl or fail", "Facilities moved her desk and ran a new cable last week"],
  hiddenFault: "Her network adapter and the new switch port disagree on speed/duplex settings after the re-cabling — a duplex mismatch — causing heavy collisions and retransmissions that only show up under sustained, larger transfers.",
  availableCommands: ["ipconfig", "ping", "nslookup", "tracert", "arp", "netstat"],

  terminalOutputs: [
    { id: "out-ipconfig", command: "ipconfig", match: ["ipconfig"], revealsEvidence: ["ev-ip-normal"],
      output: ["Ethernet adapter Ethernet:", "   IPv4 Address. . . . . . . . . . . : 192.168.6.31", "   Subnet Mask . . . . . . . . . . . : 255.255.255.0", "   Default Gateway . . . . . . . . . : 192.168.6.1"] },
    { id: "out-ping-small", command: "ping", match: ["ping 192.168.6.1"], revealsEvidence: ["ev-small-ping-fine"],
      output: ["Pinging 192.168.6.1 with 32 bytes of data:", "Reply from 192.168.6.1: bytes=32 time=1ms TTL=64", "Reply from 192.168.6.1: bytes=32 time=1ms TTL=64", "", "Ping statistics for 192.168.6.1:", "    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)"] },
    { id: "out-ping-large-pre", command: "ping", match: ["ping 192.168.6.1 -l 1400", "ping -l 1400 192.168.6.1"], phase: "pre", isKeyCommand: true, revealsEvidence: ["ev-large-packet-loss"],
      output: ["Pinging 192.168.6.1 with 1400 bytes of data:", "Reply from 192.168.6.1: bytes=1400 time=4ms TTL=64", "Request timed out.", "Reply from 192.168.6.1: bytes=1400 time=210ms TTL=64", "Request timed out.", "", "Ping statistics for 192.168.6.1:", "    Packets: Sent = 4, Received = 2, Lost = 2 (50% loss)"] },
    { id: "out-ping-large-post", command: "ping", match: ["ping 192.168.6.1 -l 1400", "ping -l 1400 192.168.6.1"], phase: "post",
      output: ["Pinging 192.168.6.1 with 1400 bytes of data:", "Reply from 192.168.6.1: bytes=1400 time=1ms TTL=64", "Reply from 192.168.6.1: bytes=1400 time=1ms TTL=64", "", "Ping statistics for 192.168.6.1:", "    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)"] },
    { id: "out-netstat-e-pre", command: "netstat", match: ["netstat -e"], phase: "pre", isKeyCommand: true, revealsEvidence: ["ev-interface-errors"],
      output: ["Interface Statistics", "", "                           Received            Sent", "Bytes                     48210332           9931201", "Discards                        0              1822", "Errors                        1266                31"] },
    { id: "out-netstat-e-post", command: "netstat", match: ["netstat -e"], phase: "post",
      output: ["Interface Statistics", "", "                           Received            Sent", "Bytes                     52110221          14031201", "Discards                        0                 0", "Errors                           0                 0"] },
    { id: "out-nslookup", command: "nslookup", match: ["nslookup google.com"], output: ["Server:  dns1.geedesk.local", "Address:  192.168.6.10", "", "Non-authoritative answer:", "Name:    google.com", "Address:  142.250.72.14"] },
    { id: "out-arp", command: "arp", match: ["arp -a"], output: ["Interface: 192.168.6.31 --- 0xd", "  Internet Address      Physical Address      Type", "  192.168.6.1            aa-14-ff-2b-10-77     dynamic"] },
    { id: "out-tracert", command: "tracert", match: ["tracert google.com"], output: ["Tracing route to google.com over a maximum of 30 hops:", "  1     2 ms     1 ms   180 ms  192.168.6.1", "  2    18 ms    17 ms    19 ms  10.0.0.1"] },
  ],

  evidence: [
    { id: "ev-ticket-summary", category: "user-report", label: "Ticket summary", detail: "Browsing is fine for Lauren, but shared-drive file copies are extremely slow and sometimes fail." },
    { id: "ev-ip-normal", category: "network", label: "Normal addressing", detail: "Her IP, subnet, and gateway are all assigned correctly." },
    { id: "ev-small-ping-fine", category: "network", label: "Small pings look perfectly normal", detail: "Standard-size pings to the gateway are fast with zero loss." },
    { id: "ev-large-packet-loss", category: "network", isKey: true, label: "Large packets fail heavily",
      detail: "Larger pings to the same gateway show major latency spikes and 50% packet loss — small traffic is fine, but larger transfers clearly aren't." },
    { id: "ev-interface-errors", category: "system", isKey: true, label: "High interface errors and discards",
      detail: "Her network interface statistics show a large number of errors and discarded packets — consistent with a speed/duplex disagreement with the switch." },
    { id: "ev-recent-recable", category: "conversation", isKey: true, label: "Recently moved and re-cabled",
      detail: "Facilities moved her desk and ran a brand new cable to a different switch port last week." },
    { id: "ev-large-transfer-slow", category: "conversation", isKey: true, label: "Only large transfers are slow",
      detail: "The slowness is specific to big file copies — everyday browsing is completely normal." },
    { id: "ev-isolated", category: "conversation", label: "No one else affected", detail: "Coworkers on other ports/desks report no slowness." },
  ],
  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    { id: "q-when-slow", prompt: "Is it slow all the time, or mainly with big files?",
      response: "\"Mostly big files or folders — regular browsing feels totally normal.\"", revealsEvidence: ["ev-large-transfer-slow"], isKeyQuestion: true },
    { id: "q-recable", prompt: "Did anything change with your desk or cabling recently?",
      response: "\"Actually yes — facilities moved my desk last week and ran a brand new cable.\"", revealsEvidence: ["ev-recent-recable"], isKeyQuestion: true },
    { id: "q-others", prompt: "Is anyone else experiencing this slowness?", response: "\"No, everyone else on my team seems fine.\"", revealsEvidence: ["ev-isolated"] },
  ],

  keyConcepts: [
    "Recognizing that 'small pings fine, large transfers awful' points at link quality, not routing or addressing",
    "Reading interface error/discard counters as evidence of a physical or duplex-level problem",
    "Correlating a recent re-cabling/re-porting event with a new performance issue",
  ],

  diagnosisOptions: [
    { id: "diag-duplex", isCorrect: true,
      label: "A speed/duplex mismatch between her adapter and the new switch port is causing errors on larger transfers",
      explanation: "Correct. Small traffic is unaffected but larger packets show heavy loss, and the interface counters show real errors and discards — the classic signature of a duplex mismatch, and it lines up with the recent re-cabling to a new port." },
    { id: "diag-server-overloaded", isCorrect: false, label: "The shared drive server is overloaded",
      explanation: "Her coworkers using the same server report no slowness at all — the server itself is handling load fine." },
    { id: "diag-cable-unplugged", isCorrect: false, label: "Her network cable is unplugged",
      explanation: "She has a normal IP address and functioning connectivity for everyday use — the link is up, just unreliable under load." },
    { id: "diag-dns", isCorrect: false, label: "DNS is misconfigured",
      explanation: "This is a throughput/error problem on a specific link, not a name-resolution issue — DNS isn't involved in raw file-copy performance." },
  ],

  resolutionOptions: [
    { id: "res-fix-duplex", isCorrect: true, label: "Have IT reset the switch port and NIC to auto-negotiate speed/duplex so both sides agree",
      explanation: "This removes the mismatch causing collisions and retransmissions, restoring full, reliable throughput on that link." },
    { id: "res-replace-server", isCorrect: false, label: "Replace the shared drive server",
      explanation: "Other users of the same server have no issue — the server isn't the bottleneck here." },
    { id: "res-restart-pc", isCorrect: false, label: "Restart her computer",
      explanation: "A hard-set duplex mismatch persists across restarts — it needs to be corrected on the port and/or adapter settings themselves." },
    { id: "res-move-desk-back", isCorrect: false, label: "Move her back to her old desk",
      explanation: "That avoids the problem rather than fixing the actual port/adapter mismatch, and isn't a sustainable resolution." },
  ],

  verification: { prompt: "Confirm large transfers now succeed cleanly.", expectedOutputId: "out-ping-large-post",
    successMessage: "Large packets now come back with zero loss and interface errors have stopped climbing — file copies should be fast and reliable again." },

  scoring: { investigationMax: 20, evidenceMax: 15, diagnosisMax: 25, resolutionMax: 20, verificationMax: 10, efficiencyMax: 10, hintPenalty: 5, freeActionAllowance: 3 },
  hints: [
    { id: "hint-1", cost: 5, text: "Try a ping with a much larger packet size to the gateway — does it behave differently than a normal ping?" },
    { id: "hint-2", cost: 5, text: "Check the interface's error and discard counters, not just whether it's connected." },
  ],
  skills: ["networking", "switching", "troubleshooting-methodology"],
  tags: ["intermediate", "duplex", "performance"],
  estimatedMinutes: 11,
};
