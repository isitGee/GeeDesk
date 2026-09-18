import type { Scenario } from "../../types/scenario";

export const net1053: Scenario = {
  id: "net-1053",
  ticketNumber: "NET-1053",
  title: "VPN user cannot reach database server when working from home",
  category: "Networking",
  difficulty: "intermediate",
  user: { name: "Elena Rostova", role: "Database Developer", department: "Engineering" },
  ticketDescription:
    "When I work from home and connect to the corporate VPN, I can access internal web portals (10.20.0.0/16) and email, but I cannot ping or connect to the development database server at 192.168.1.50.",
  symptoms: [
    "Corporate SSL VPN client (AnyConnect) shows connected and healthy",
    "Internal resources on 10.20.0.0/16 respond normally",
    "Database host at 192.168.1.50 times out consistently",
  ],
  hiddenFault:
    "Elena's home consumer Wi-Fi router uses the default 192.168.1.0/24 subnet. The corporate VPN uses split tunneling. Elena's local routing table sends 192.168.1.50 packets to her home LAN interface rather than across the VPN virtual tunnel adapter.",
  availableCommands: ["route", "tracert", "ipconfig"],

  terminalOutputs: [
    {
      id: "out-route-print-pre",
      command: "route",
      match: ["route print", "route print 192.168.1.*"],
      phase: "pre",
      isKeyCommand: true,
      revealsEvidence: ["ev-route-overlap"],
      output: [
        "IPv4 Route Table",
        "===========================================================================",
        "Active Routes:",
        "Network Destination        Netmask          Gateway       Interface  Metric",
        "          0.0.0.0          0.0.0.0      192.168.1.1     192.168.1.84     25",
        "        10.20.0.0      255.255.0.0       10.254.1.1     10.254.1.42       1",
        "      192.168.1.0    255.255.255.0         On-link      192.168.1.84    281",
        "     192.168.1.84  255.255.255.255         On-link      192.168.1.84    281",
        "===========================================================================",
      ],
    },
    {
      id: "out-route-print-post",
      command: "route",
      match: ["route print", "route print 192.168.1.*"],
      phase: "post",
      output: [
        "IPv4 Route Table",
        "===========================================================================",
        "Active Routes:",
        "Network Destination        Netmask          Gateway       Interface  Metric",
        "          0.0.0.0          0.0.0.0      192.168.1.1     192.168.1.84     25",
        "        10.20.0.0      255.255.0.0       10.254.1.1     10.254.1.42       1",
        "     192.168.1.50  255.255.255.255       10.254.1.1     10.254.1.42       1",
        "      192.168.1.0    255.255.255.0         On-link      192.168.1.84    281",
        "===========================================================================",
      ],
    },
    {
      id: "out-tracert-pre",
      command: "tracert",
      match: ["tracert 192.168.1.50", "tracert -d 192.168.1.50"],
      phase: "pre",
      output: [
        "Tracing route to 192.168.1.50 over a maximum of 30 hops",
        "",
        "  1  192.168.1.84  reports: Destination host unreachable.",
        "",
        "Trace complete.",
      ],
    },
    {
      id: "out-tracert-post",
      command: "tracert",
      match: ["tracert 192.168.1.50", "tracert -d 192.168.1.50"],
      phase: "post",
      output: [
        "Tracing route to 192.168.1.50 over a maximum of 30 hops",
        "",
        "  1     8 ms     7 ms     8 ms  10.254.1.1",
        "  2     9 ms     8 ms     9 ms  10.100.0.1",
        "  3    11 ms    10 ms    10 ms  192.168.1.50",
        "",
        "Trace complete.",
      ],
    },
    {
      id: "out-ipconfig",
      command: "ipconfig",
      match: ["ipconfig", "ipconfig /all"],
      revealsEvidence: ["ev-ip-home-lan"],
      output: [
        "Windows IP Configuration",
        "",
        "Ethernet adapter VPN:",
        "   IPv4 Address. . . . . . . . . . . : 10.254.1.42",
        "   Subnet Mask . . . . . . . . . . . : 255.255.255.255",
        "   Default Gateway . . . . . . . . . :",
        "",
        "Wireless LAN adapter Wi-Fi:",
        "   IPv4 Address. . . . . . . . . . . : 192.168.1.84",
        "   Subnet Mask . . . . . . . . . . . : 255.255.255.0",
        "   Default Gateway . . . . . . . . . : 192.168.1.1",
      ],
    },
  ],

  evidence: [
    {
      id: "ev-ticket-summary",
      category: "user-report",
      label: "Ticket summary",
      detail: "Elena cannot reach database server 192.168.1.50 over split-tunnel VPN from home.",
    },
    {
      id: "ev-route-overlap",
      category: "network",
      isKey: true,
      label: "Subnet collision in routing table",
      detail: "The 192.168.1.0/24 network is marked On-link on her Wi-Fi adapter, intercepting traffic intended for the corporate database.",
    },
    {
      id: "ev-ip-home-lan",
      category: "network",
      label: "Local Wi-Fi interface is on 192.168.1.0/24",
      detail: "The user's home ISP router assigned 192.168.1.84 with gateway 192.168.1.1.",
    },
    {
      id: "ev-office-works",
      category: "conversation",
      label: "Connection works when in the office",
      detail: "Elena confirms the database connection works perfectly when she is plugged in at headquarters.",
    },
  ],

  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    {
      id: "q-in-office",
      question: "Does this database connection work when you are physically in the office?",
      answer: "Yes, at my desk in the office, Navicat connects in two seconds without issues.",
      isKey: true,
      revealsEvidence: ["ev-office-works"],
    },
    {
      id: "q-other-vpn",
      question: "Can you reach any other corporate servers right now?",
      answer: "Yes, our intranet wiki on 10.20.4.15 and our GitLab server on 10.20.8.20 load fine.",
    },
  ],

  diagnosisOptions: [
    {
      id: "diag-subnet-overlap",
      label: "Subnet overlap between user's home network (192.168.1.0/24) and the corporate database subnet caused routing misdirection.",
      isCorrect: true,
    },
    {
      id: "diag-vpn-auth-failure",
      label: "The SSL VPN connection failed authentication or session token expired.",
      isCorrect: false,
    },
    {
      id: "diag-database-offline",
      label: "The database server at 192.168.1.50 is crashed and powered off.",
      isCorrect: false,
    },
  ],

  resolutionOptions: [
    {
      id: "res-host-route",
      label: "Add an explicit host route for 192.168.1.50 via VPN gateway (or configure Full Tunneling / re-IP home LAN).",
      isCorrect: true,
    },
    {
      id: "res-restart-vpn",
      label: "Reboot the home computer and reconnect the VPN client.",
      isCorrect: false,
      simulatedConsequence: "Computer rebooted; home router still assigns 192.168.1.0/24 and collision persists.",
      efficiencyPenalty: 4,
    },
    {
      id: "res-flush-dns",
      label: "Flush DNS cache using ipconfig /flushdns.",
      isCorrect: false,
      simulatedConsequence: "DNS cache cleared, but raw IP routing remains directed to local LAN.",
      efficiencyPenalty: 3,
    },
  ],

  verification: {
    prompt: "Run a traceroute command to confirm traffic to 192.168.1.50 is exiting through the VPN gateway (10.254.1.1).",
    expectedOutputId: "out-tracert-post",
    successMessage: "Traceroute proves packets are now routed through the corporate VPN gateway to the database.",
  },

  hints: [
    { id: "h-1", text: "When using split tunneling, the OS must choose whether traffic goes to the home LAN or the VPN.", cost: 2 },
    { id: "h-2", text: "Inspect the routing table with 'route print'. Look at where 192.168.1.0/24 traffic is sent.", cost: 4 },
    { id: "h-3", text: "Her home network and the database share the same 192.168.1.0/24 range. Add an explicit host route for 192.168.1.50.", cost: 7 },
  ],

  scoring: {
    investigationMax: 20,
    evidenceMax: 15,
    diagnosisMax: 25,
    resolutionMax: 20,
    verificationMax: 10,
    efficiencyMax: 10,
  },

  skills: ["VPN", "Split Tunneling", "Routing Tables", "Subnetting", "CIDR"],
  tags: ["VPN", "Networking", "Routing", "Remote Work"],
};
