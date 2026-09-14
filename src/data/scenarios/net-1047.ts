import type { Scenario } from "../../types/scenario";

export const net1047: Scenario = {
  id: "net-1047",
  ticketNumber: "NET-1047",
  title: "New workstation can't reach any internal servers",
  category: "Networking",
  difficulty: "advanced",
  user: { name: "Trevor Osei", role: "DevOps Engineer", department: "Engineering" },
  ticketDescription:
    "My new workstation gets an IP and I can browse the internet fine, but I can't reach any of our internal engineering servers — including our own Git server.",
  symptoms: [
    "Internet access works normally",
    "Every internal engineering resource times out",
    "Started right after moving to a new desk with a new dock this week",
  ],
  hiddenFault:
    "The switch port at Trevor's new desk is assigned to the Guest/Internet-only VLAN instead of the Engineering VLAN, so his workstation landed on the wrong subnet — one with internet access but no route to internal engineering servers.",
  availableCommands: ["ipconfig", "ping", "nslookup", "tracert", "arp", "netstat"],

  terminalOutputs: [
    { id: "out-ipconfig", command: "ipconfig", match: ["ipconfig"], isKeyCommand: true, revealsEvidence: ["ev-wrong-subnet"],
      output: ["Ethernet adapter Ethernet:", "   IPv4 Address. . . . . . . . . . . : 10.20.14.83", "   Subnet Mask . . . . . . . . . . . : 255.255.255.0", "   Default Gateway . . . . . . . . . : 10.20.14.1"] },
    { id: "out-ping-gw", command: "ping", match: ["ping 10.20.14.1"], revealsEvidence: ["ev-gateway-ok"],
      output: ["Pinging 10.20.14.1 with 32 bytes of data:", "Reply from 10.20.14.1: bytes=32 time=1ms TTL=64", "Reply from 10.20.14.1: bytes=32 time=1ms TTL=64"] },
    { id: "out-ping-ext", command: "ping", match: ["ping 8.8.8.8"], revealsEvidence: ["ev-internet-ok"],
      output: ["Pinging 8.8.8.8 with 32 bytes of data:", "Reply from 8.8.8.8: bytes=32 time=16ms TTL=112", "Reply from 8.8.8.8: bytes=32 time=15ms TTL=112"] },
    { id: "out-ping-git-pre", command: "ping", match: ["ping 10.30.5.10"], phase: "pre", isKeyCommand: true, revealsEvidence: ["ev-git-unreachable"],
      output: ["Pinging 10.30.5.10 with 32 bytes of data:", "Request timed out.", "Request timed out.", "Request timed out.", "", "Ping statistics for 10.30.5.10:", "    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)"] },
    { id: "out-ping-git-post", command: "ping", match: ["ping 10.30.5.10"], phase: "post",
      output: ["Pinging 10.30.5.10 with 32 bytes of data:", "Reply from 10.30.5.10: bytes=32 time=1ms TTL=64", "Reply from 10.30.5.10: bytes=32 time=1ms TTL=64"] },
    { id: "out-nslookup", command: "nslookup", match: ["nslookup git.internal.geedesk.local"], isKeyCommand: true, revealsEvidence: ["ev-dns-fine"],
      output: ["Server:  dns1.geedesk.local", "Address:  10.20.14.10", "", "Non-authoritative answer:", "Name:    git.internal.geedesk.local", "Address:  10.30.5.10"] },
    { id: "out-tracert-pre", command: "tracert", match: ["tracert 10.30.5.10"], phase: "pre",
      output: ["Tracing route to 10.30.5.10 over a maximum of 30 hops:", "  1     1 ms     1 ms     1 ms  10.20.14.1", "  2     *        *        *     Request timed out.", "  3     *        *        *     Request timed out."] },
    { id: "out-arp", command: "arp", match: ["arp -a"],
      output: ["Interface: 10.20.14.83 --- 0xf", "  Internet Address      Physical Address      Type", "  10.20.14.1             aa-14-ff-2b-10-01     dynamic"] },
    { id: "out-netstat", command: "netstat", match: ["netstat"], output: ["Active Connections", "  TCP    10.20.14.83:52410    142.250.72.14:443    ESTABLISHED"] },
  ],

  evidence: [
    { id: "ev-ticket-summary", category: "user-report", label: "Ticket summary", detail: "Trevor's new workstation has internet but no access to any internal engineering server." },
    { id: "ev-wrong-subnet", category: "network", isKey: true, label: "Unexpected subnet for an engineering workstation",
      detail: "His workstation is on 10.20.14.x — the Guest/Internet VLAN range, not the 10.30.x Engineering range his team normally uses." },
    { id: "ev-gateway-ok", category: "network", label: "Gateway reachable", detail: "His default gateway responds normally." },
    { id: "ev-internet-ok", category: "network", label: "Internet reachable", detail: "External sites load fine — general connectivity works." },
    { id: "ev-git-unreachable", category: "network", isKey: true, label: "Internal Git server unreachable",
      detail: "The internal Git server at 10.30.5.10 times out completely by IP address." },
    { id: "ev-dns-fine", category: "network", isKey: true, label: "Internal DNS resolves correctly",
      detail: "The internal hostname resolves to the right IP — this rules out a DNS problem entirely." },
    { id: "ev-new-desk", category: "conversation", isKey: true, label: "Just moved to a new desk",
      detail: "Trevor moved to a new desk and got a new dock this week, right when the problem started." },
    { id: "ev-neighbor-fine", category: "conversation", isKey: true, label: "Long-time neighbor unaffected",
      detail: "The engineer at the next desk over, who's been there a while, has no problem reaching internal servers." },
  ],
  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    { id: "q-new-desk", prompt: "Did anything change about your setup recently?",
      response: "\"Yeah, I just moved to a new desk this week and got a new docking station.\"", revealsEvidence: ["ev-new-desk"], isKeyQuestion: true },
    { id: "q-neighbor", prompt: "Is the person sitting next to you having the same issue?",
      response: "\"No, he's been at that desk for months and everything works fine for him.\"", revealsEvidence: ["ev-neighbor-fine"], isKeyQuestion: true },
    { id: "q-anything-internal", prompt: "Can you reach anything internal at all?",
      response: "\"Nothing. Only external websites work.\"", revealsEvidence: [] },
  ],

  keyConcepts: [
    "Recognizing that internet-works-but-internal-doesn't often means a VLAN/subnet issue, not DNS or the destination server",
    "Using nslookup to rule DNS in or out before blaming routing",
    "Correlating a physical move (new desk/port) with a sudden network boundary change",
  ],

  diagnosisOptions: [
    { id: "diag-vlan", isCorrect: true,
      label: "The switch port at his new desk is on the wrong VLAN, putting him on a subnet with no route to internal engineering servers",
      explanation: "Correct. His address is in the Guest/Internet range, DNS resolves internal names fine, and a neighbor on a properly-assigned port has no issue — this points squarely at the port's VLAN assignment." },
    { id: "diag-git-down", isCorrect: false, label: "The internal Git server is down",
      explanation: "His neighbor reaches internal servers, including presumably Git, with no trouble — the servers themselves are up." },
    { id: "diag-local-firewall", isCorrect: false, label: "A firewall on his workstation is blocking outbound traffic",
      explanation: "External traffic works fine from the same workstation — a local firewall blocking everything internal specifically, while his very subnet is also wrong, is a much less direct explanation." },
    { id: "diag-dns-broken", isCorrect: false, label: "DNS can't resolve internal hostnames",
      explanation: "nslookup for the internal Git hostname resolved correctly — DNS is working fine here." },
  ],

  resolutionOptions: [
    { id: "res-fix-vlan", isCorrect: true, label: "Have networking reassign his switch port to the Engineering VLAN",
      explanation: "This puts his workstation on the correct subnet with the routing and access it needs to reach internal servers." },
    { id: "res-static-ip", isCorrect: false, label: "Manually set a 10.30.x static IP on his workstation",
      explanation: "The switch port itself still belongs to the wrong VLAN — a mismatched static IP on the wrong VLAN typically won't even get traffic past the port's access control." },
    { id: "res-restart-workstation", isCorrect: false, label: "Restart the workstation",
      explanation: "A restart doesn't change which VLAN a switch port is assigned to." },
    { id: "res-replace-cable", isCorrect: false, label: "Replace the network cable",
      explanation: "The link works — he gets an IP and reaches the internet over it. This isn't a cabling problem." },
  ],

  verification: { prompt: "Confirm he can now reach the internal Git server.", expectedOutputId: "out-ping-git-post",
    successMessage: "The Git server now responds — his port is on the correct VLAN with a proper path to internal resources." },

  scoring: { investigationMax: 20, evidenceMax: 15, diagnosisMax: 25, resolutionMax: 20, verificationMax: 10, efficiencyMax: 10, hintPenalty: 6, freeActionAllowance: 3 },
  hints: [
    { id: "hint-1", cost: 6, text: "Compare his IP address range to what you'd expect for an engineering workstation." },
    { id: "hint-2", cost: 6, text: "Test whether DNS itself is the problem before assuming a server is down." },
  ],
  skills: ["networking", "vlans", "troubleshooting-methodology"],
  tags: ["advanced", "vlan", "routing"],
  estimatedMinutes: 14,
};
