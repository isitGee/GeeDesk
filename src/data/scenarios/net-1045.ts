import type { Scenario } from "../../types/scenario";

export const net1045: Scenario = {
  id: "net-1045",
  ticketNumber: "NET-1045",
  title: "\"IP address conflict\" pop-up, connection keeps dropping",
  category: "Networking",
  difficulty: "intermediate",
  user: { name: "Diego Ramirez", role: "Field Sales Rep", department: "Sales" },
  ticketDescription:
    "Windows keeps popping up a message saying my IP address is already in use, and my connection drops every few minutes.",
  symptoms: [
    "Recurring Windows balloon: \"This system has been configured with an IP address that is already in use\"",
    "Connection drops every few minutes, mostly near the lobby",
    "Started after a new lobby check-in kiosk was installed last week",
  ],
  hiddenFault:
    "The new lobby kiosk was given a static IP address (192.168.5.114) that falls inside the DHCP pool — the same address already leased to Diego's laptop. The two devices keep fighting over it.",
  availableCommands: ["ipconfig", "ping", "nslookup", "tracert", "arp", "netstat"],

  terminalOutputs: [
    { id: "out-ipconfig", command: "ipconfig", match: ["ipconfig"], isKeyCommand: true, revealsEvidence: ["ev-address"],
      output: ["Ethernet adapter Ethernet:", "   IPv4 Address. . . . . . . . . . . : 192.168.5.114", "   Subnet Mask . . . . . . . . . . . : 255.255.255.0", "   Default Gateway . . . . . . . . . : 192.168.5.1"] },
    { id: "out-ping-self-pre", command: "ping", match: ["ping 192.168.5.114"], phase: "pre",
      isKeyCommand: true, revealsEvidence: ["ev-duplicate-confirmed"],
      output: ["Pinging 192.168.5.114 with 32 bytes of data:", "Reply from 192.168.5.114: bytes=32 time=1ms TTL=64",
        "Warning: duplicate IP address detected. Reply also received from MAC 8C-DE-F1-2B-90-11.", "Reply from 192.168.5.114: bytes=32 time=118ms TTL=64"] },
    { id: "out-ping-self-post", command: "ping", match: ["ping 192.168.5.114"], phase: "post",
      output: ["Pinging 192.168.5.114 with 32 bytes of data:", "Reply from 192.168.5.114: bytes=32 time=1ms TTL=64", "Reply from 192.168.5.114: bytes=32 time=1ms TTL=64", "", "Ping statistics for 192.168.5.114:", "    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)"] },
    { id: "out-arp", command: "arp", match: ["arp -a"], revealsEvidence: ["ev-mac-mismatch"],
      output: ["Interface: 192.168.5.114 --- 0xc", "  Internet Address      Physical Address      Type", "  192.168.5.1            aa-14-ff-2b-10-01     dynamic", "  192.168.5.114          8c-de-f1-2b-90-11     dynamic   <- not this laptop's own adapter"] },
    { id: "out-ping-gw", command: "ping", match: ["ping 192.168.5.1"],
      output: ["Pinging 192.168.5.1 with 32 bytes of data:", "Reply from 192.168.5.1: bytes=32 time=1ms TTL=64", "Reply from 192.168.5.1: bytes=32 time=1ms TTL=64"] },
    { id: "out-nslookup", command: "nslookup", match: ["nslookup google.com"],
      output: ["Server:  dns1.geedesk.local", "Address:  192.168.5.10", "", "Non-authoritative answer:", "Name:    google.com", "Address:  142.250.72.14"] },
    { id: "out-tracert", command: "tracert", match: ["tracert google.com"],
      output: ["Tracing route to google.com over a maximum of 30 hops:", "  1     1 ms     1 ms     1 ms  192.168.5.1", "  2     *        *        *     Request timed out."] },
    { id: "out-netstat", command: "netstat", match: ["netstat"],
      output: ["Active Connections", "  TCP    192.168.5.114:52110    192.168.5.10:445      ESTABLISHED"] },
  ],

  evidence: [
    { id: "ev-ticket-summary", category: "user-report", label: "Ticket summary",
      detail: "Diego's laptop reports a duplicate IP address and drops connection repeatedly." },
    { id: "ev-address", category: "network", label: "Current leased address",
      detail: "Diego's laptop is currently holding 192.168.5.114." },
    { id: "ev-duplicate-confirmed", category: "network", isKey: true, label: "Self-ping reveals a second device",
      detail: "Pinging his own address gets replies from two different MAC addresses — unmistakable proof of a real duplicate on the network." },
    { id: "ev-mac-mismatch", category: "system", isKey: true, label: "ARP shows an unfamiliar MAC",
      detail: "The MAC address holding 192.168.5.114 in ARP doesn't match Diego's laptop — some other device believes it owns this address." },
    { id: "ev-new-kiosk", category: "conversation", isKey: true, label: "New kiosk installed",
      detail: "A new self-service check-in kiosk was installed in the lobby last week." },
    { id: "ev-isolated", category: "conversation", label: "No one else affected",
      detail: "As far as Diego knows, he's the only one having this problem." },
    { id: "ev-lobby-correlation", category: "conversation", isKey: true, label: "Correlates with the lobby",
      detail: "The drops happen a lot when he's near the lobby, where the new kiosk sits." },
  ],
  defaultEvidenceIds: ["ev-ticket-summary", "ev-address"],

  conversationQuestions: [
    { id: "q-new-equip", prompt: "Has any new equipment been added to the network recently?",
      response: "\"Actually yeah — they installed a self-service check-in kiosk in the lobby last week.\"",
      revealsEvidence: ["ev-new-kiosk"], isKeyQuestion: true },
    { id: "q-others", prompt: "Is anyone else reporting this?", response: "\"Not that I know of — just me.\"",
      revealsEvidence: ["ev-isolated"] },
    { id: "q-pattern", prompt: "Does this happen in a particular spot, or randomly?",
      response: "\"Now that you mention it... it does seem to happen a lot near the lobby.\"",
      revealsEvidence: ["ev-lobby-correlation"], isKeyQuestion: true },
  ],

  keyConcepts: [
    "Using a self-ping to detect a duplicate address (a classic real technique)",
    "Reading ARP output to spot a MAC address that doesn't belong",
    "Correlating a new static device with a sudden addressing conflict",
  ],

  diagnosisOptions: [
    { id: "diag-dup-static", isCorrect: true,
      label: "Another device (the new kiosk) was statically assigned an address already leased to this laptop",
      explanation: "Correct. The self-ping returning two MAC addresses, plus the timing lining up with the new kiosk's install, both point to a static IP collision." },
    { id: "diag-nic-failing", isCorrect: false, label: "The laptop's network card is failing",
      explanation: "A failing NIC wouldn't produce a real second reply from a different MAC address on a self-ping — that's a second live device, not a hardware fault." },
    { id: "diag-dhcp-down", isCorrect: false, label: "The DHCP server is completely down",
      explanation: "If DHCP were down, the laptop simply wouldn't get a lease at all — it wouldn't specifically detect a live conflicting host." },
    { id: "diag-firewall", isCorrect: false, label: "A firewall is blocking the laptop's traffic",
      explanation: "Firewalls don't generate an 'address already in use' warning, and they don't explain a second MAC replying to the same IP." },
  ],

  resolutionOptions: [
    { id: "res-fix-kiosk-ip", isCorrect: true,
      label: "Move the kiosk to an address outside the DHCP pool (or exclude its address from the pool)",
      explanation: "This removes the collision at its source, so DHCP can safely keep leasing this address to laptops like Diego's." },
    { id: "res-restart-laptop", isCorrect: false, label: "Restart Diego's laptop",
      explanation: "Restarting doesn't stop the kiosk from claiming the same static address again once Diego reconnects." },
    { id: "res-reinstall-drivers", isCorrect: false, label: "Reinstall the laptop's network drivers",
      explanation: "The laptop's hardware isn't the problem — a second device is statically using its address." },
    { id: "res-flush-dns", isCorrect: false, label: "Flush the DNS cache",
      explanation: "This is an addressing conflict, not a name-resolution problem — flushing DNS won't touch it." },
  ],

  verification: {
    prompt: "Confirm the address conflict is gone.",
    expectedOutputId: "out-ping-self-post",
    successMessage: "Pinging his own address now gets clean replies with no duplicate warning — the conflict is resolved.",
  },

  scoring: { investigationMax: 20, evidenceMax: 15, diagnosisMax: 25, resolutionMax: 20, verificationMax: 10, efficiencyMax: 10, hintPenalty: 5, freeActionAllowance: 3 },
  hints: [
    { id: "hint-1", cost: 5, text: "Try pinging the laptop's own IP address — sometimes a device answers for itself when it shouldn't." },
    { id: "hint-2", cost: 5, text: "Ask whether any new devices were added to the network recently." },
  ],
  skills: ["networking", "ip-addressing", "troubleshooting-methodology"],
  tags: ["intermediate", "dhcp", "windows"],
  estimatedMinutes: 10,
};
