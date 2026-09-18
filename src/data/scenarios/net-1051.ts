import type { Scenario } from "../../types/scenario";

export const net1051: Scenario = {
  id: "net-1051",
  ticketNumber: "NET-1051",
  title: "Heavy packet loss and recurring link flaps on switchport",
  category: "Networking",
  difficulty: "advanced",
  user: {
    name: "Marcus Bradley",
    role: "Senior Accountant",
    department: "Finance",
    initials: "MB",
    location: "HQ Building B — Floor 2, Room 218",
    phone: "x4912",
    email: "m.bradley@geedesk.local",
    techLevel: "Intermediate",
    communicationStyle: "Methodical, tracks timestamps of connection drops, needs stability for payroll ledger.",
    previousIncidentsCount: 1,
  },
  ticketDescription:
    "My network connection drops every few minutes. Large Excel files fail to save back to the network share, and video calls keep stuttering with heavy frame loss.",
  symptoms: [
    "Continuous ping to default gateway shows 25-40% packet loss",
    "Network adapter icon briefly displays 'Network cable unplugged' then reconnects",
    "SMB file transfers to finance share disconnect mid-transfer",
  ],
  hiddenFault:
    "The SFP fiber optic transceiver on switch SW-CORP-FL02 port Gi0/24 is experiencing physical optical power attenuation and excessive CRC error counts. This physical Layer 1 hardware failure requires Network Operations (NOC) hardware dispatch and optical replacement.",
  availableCommands: ["ipconfig", "ping", "tracert", "netstat", "arp", "systeminfo"],

  terminalOutputs: [
    {
      id: "out-ipconfig",
      command: "ipconfig",
      match: ["ipconfig", "ipconfig /all"],
      isKeyCommand: true,
      revealsEvidence: ["ev-ip-valid"],
      output: [
        "Windows IP Configuration",
        "",
        "Ethernet adapter Ethernet:",
        "   Connection-specific DNS Suffix  . : geedesk.local",
        "   IPv4 Address. . . . . . . . . . . : 192.168.20.45",
        "   Subnet Mask . . . . . . . . . . . : 255.255.255.0",
        "   Default Gateway . . . . . . . . . : 192.168.20.1",
        "   DNS Servers . . . . . . . . . . . : 192.168.1.5",
      ],
    },
    {
      id: "out-ping-gw-pre",
      command: "ping",
      match: ["ping 192.168.20.1", "ping -n 4 192.168.20.1"],
      phase: "pre",
      isKeyCommand: true,
      revealsEvidence: ["ev-gw-packetloss"],
      output: [
        "Pinging 192.168.20.1 with 32 bytes of data:",
        "Reply from 192.168.20.1: bytes=32 time=1ms TTL=64",
        "Request timed out.",
        "Reply from 192.168.20.1: bytes=32 time=2ms TTL=64",
        "Request timed out.",
        "",
        "Ping statistics for 192.168.20.1:",
        "    Packets: Sent = 4, Received = 2, Lost = 2 (50% loss)",
      ],
    },
    {
      id: "out-ping-gw-post",
      command: "ping",
      match: ["ping 192.168.20.1", "ping -n 4 192.168.20.1"],
      phase: "post",
      output: [
        "Pinging 192.168.20.1 with 32 bytes of data:",
        "Reply from 192.168.20.1: bytes=32 time=1ms TTL=64",
        "Reply from 192.168.20.1: bytes=32 time=1ms TTL=64",
        "Reply from 192.168.20.1: bytes=32 time=1ms TTL=64",
        "Reply from 192.168.20.1: bytes=32 time=1ms TTL=64",
        "",
        "Ping statistics for 192.168.20.1:",
        "    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)",
      ],
    },
    {
      id: "out-ping-loopback",
      command: "ping",
      match: ["ping 127.0.0.1", "ping localhost"],
      revealsEvidence: ["ev-loopback-healthy"],
      output: [
        "Pinging 127.0.0.1 with 32 bytes of data:",
        "Reply from 127.0.0.1: bytes=32 time<1ms TTL=128",
        "Reply from 127.0.0.1: bytes=32 time<1ms TTL=128",
        "Reply from 127.0.0.1: bytes=32 time<1ms TTL=128",
        "Reply from 127.0.0.1: bytes=32 time<1ms TTL=128",
        "",
        "Ping statistics for 127.0.0.1:",
        "    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)",
      ],
    },
    {
      id: "out-tracert",
      command: "tracert",
      match: ["tracert 192.168.20.1", "tracert 8.8.8.8"],
      revealsEvidence: ["ev-tracert-jitter"],
      output: [
        "Tracing route to 192.168.20.1 over a maximum of 30 hops:",
        "  1     1 ms     *        2 ms  192.168.20.1",
        "",
        "Trace complete. Notice packet timeout at Hop 1.",
      ],
    },
    {
      id: "out-arp",
      command: "arp",
      match: ["arp -a"],
      output: [
        "Interface: 192.168.20.45 --- 0xe",
        "  Internet Address      Physical Address      Type",
        "  192.168.20.1          00-1a-2b-20-00-01     dynamic",
      ],
    },
    {
      id: "out-netstat",
      command: "netstat",
      match: ["netstat", "netstat -a"],
      output: [
        "Active Connections",
        "  Proto  Local Address          Foreign Address        State",
        "  TCP    192.168.20.45:49812    192.168.20.10:445      SYN_SENT",
      ],
    },
    {
      id: "out-systeminfo",
      command: "systeminfo",
      match: ["systeminfo"],
      output: [
        "Host Name:                 WS-FIN-BRADLEY",
        "OS Name:                   Microsoft Windows 11 Enterprise",
        "Network Card(s):           Intel(R) Ethernet Connection I219-V (Media connected)",
      ],
    },
  ],

  evidence: [
    {
      id: "ev-ticket-summary",
      category: "user-report",
      label: "Ticket summary",
      detail: "Marcus reports intermittent drops, failing file saves, and packet loss on local LAN.",
    },
    {
      id: "ev-ip-valid",
      category: "network",
      isKey: true,
      label: "Valid IP and Gateway",
      detail: "Workstation has assigned IP 192.168.20.45 on the Finance subnet (VLAN 20).",
    },
    {
      id: "ev-gw-packetloss",
      category: "network",
      isKey: true,
      label: "50% Packet Loss to Local Gateway",
      detail: "Pings directly to the default gateway suffer 50% packet loss — indicating Layer 1 physical link corruption before any routing occurs.",
    },
    {
      id: "ev-loopback-healthy",
      category: "system",
      isKey: true,
      label: "TCP/IP Stack Operational",
      detail: "Pinging 127.0.0.1 responds with 0% loss, proving the Windows protocol stack is healthy.",
    },
    {
      id: "ev-tracert-jitter",
      category: "network",
      label: "First-hop packet drop",
      detail: "Packet loss occurs immediately on Hop 1 between the PC NIC and switch/gateway interface.",
    },
    {
      id: "ev-swapped-cable",
      category: "conversation",
      isKey: true,
      label: "Patch cable already replaced",
      detail: "Marcus already swapped the desk patch cable with a brand new Cat6 cable yesterday, but the intermittent drops persisted.",
    },
    {
      id: "ev-adjacent-unaffected",
      category: "conversation",
      label: "Neighboring desks unaffected",
      detail: "Coworkers in adjacent cubicles connected to different switchports have zero packet loss.",
    },
  ],
  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    {
      id: "q-patch-cable",
      prompt: "Have you tried swapping the Ethernet patch cable from your computer to the wall jack?",
      response: "\"Yes, Facilities gave me a brand new sealed Cat6 cable yesterday and I swapped it. The drops didn't change at all.\"",
      revealsEvidence: ["ev-swapped-cable"],
      isKeyQuestion: true,
    },
    {
      id: "q-neighbors",
      prompt: "Are colleagues on either side of you experiencing connection drops?",
      response: "\"No, Sarah and David are on video calls all morning with zero issues.\"",
      revealsEvidence: ["ev-adjacent-unaffected"],
    },
    {
      id: "q-timing",
      prompt: "Did anything happen around the time this packet loss started?",
      response: "\"Facilities did some cable restructuring in the server closet on our floor early this week.\"",
      revealsEvidence: [],
      isKeyQuestion: true,
    },
  ],

  keyConcepts: [
    "Differentiating Layer 1 physical degradation (CRC errors, packet loss) from Layer 3 IP misconfiguration",
    "Recognizing that packet loss to the local gateway rules out WAN/ISP failures",
    "Knowing when on-site hardware or infrastructure escalation to NOC is required instead of software tweaking",
  ],

  diagnosisOptions: [
    {
      id: "diag-switch-phy",
      label: "Physical switchport hardware or fiber optic degradation (high CRC errors) requires NOC escalation",
      isCorrect: true,
      explanation:
        "Correct. The endpoint has a valid IP and healthy loopback stack, and the patch cable was already swapped. Experiencing 50% packet loss to the immediate default gateway on an isolated switchport indicates physical Layer 1 transceiver or infrastructure cabling faults that must be triaged by Network Engineering.",
    },
    {
      id: "diag-dhcp-scope",
      label: "The DHCP server scope has run out of available leases",
      isCorrect: false,
      explanation:
        "The computer holds a valid active lease (192.168.20.45) with correct subnet and gateway — DHCP exhaustion causes APIPA 169.254.x.x, not intermittent packet loss.",
    },
    {
      id: "diag-dns-cache",
      label: "The client DNS cache has corrupted host records",
      isCorrect: false,
      explanation:
        "DNS only handles name-to-IP lookup. Pinging the raw numerical IP address of the gateway suffers 50% packet loss, which is completely independent of DNS.",
    },
  ],

  resolutionOptions: [
    {
      id: "res-escalate-noc",
      label: "Escalate to Network Operations (NOC) for switchport Gi0/24 interface diagnostics and optic replacement",
      isCorrect: true,
      explanation:
        "This is the proper enterprise procedure. Tier 1 technicians lack administrative access and physical tools to re-patch core switches or replace SFP transceivers in the IDF.",
    },
    {
      id: "res-reinstall-nic",
      label: "Reinstall the Intel Ethernet network adapter driver",
      isCorrect: false,
      explanation:
        "Loopback responds cleanly and link negotiation succeeds. Reinstalling drivers will not resolve an optic attenuation fault on the switchport.",
    },
    {
      id: "res-static-ip",
      label: "Assign a manual static IP address to the workstation",
      isCorrect: false,
      explanation:
        "The IP address is already valid. Statically assigning the same or different IP does not stop packets from dropping across the degraded physical link.",
    },
  ],

  verification: {
    prompt: "Confirm the switchport optic has been replaced and gateway pings show 0% packet loss.",
    expectedOutputId: "out-ping-gw-post",
    successMessage:
      "NOC replaced the faulty SFP optic on switch SW-CORP-FL02 port Gi0/24. Ping to default gateway now responds with 0% loss and steady 1ms latency.",
  },

  scoring: {
    investigationMax: 20,
    evidenceMax: 15,
    diagnosisMax: 25,
    resolutionMax: 20,
    verificationMax: 10,
    efficiencyMax: 10,
    hintPenalty: 4,
    freeActionAllowance: 3,
  },

  hints: [
    {
      id: "hint-1",
      cost: 4,
      text: "Ping the local default gateway (192.168.20.1) — notice the high packet loss right at the first hop.",
    },
    {
      id: "hint-2",
      cost: 4,
      text: "Ask whether the user already replaced the desk Ethernet patch cable to rule out simple desk cabling.",
    },
  ],

  skills: ["networking", "switching", "troubleshooting-methodology", "escalation"],
  tags: ["advanced", "switch", "packet-loss", "cisco", "hardware"],
  estimatedMinutes: 12,
};
