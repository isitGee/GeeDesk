import type { Scenario } from "../../types/scenario";

export const net1048: Scenario = {
  id: "net-1048",
  ticketNumber: "NET-1048",
  title: "No internet, but local printing still works",
  category: "Networking",
  difficulty: "beginner",
  user: { name: "Helen Ochoa", role: "Accounts Payable Clerk", department: "Finance" },
  ticketDescription: "I can print to the office printer just fine, but I can't load any websites at all.",
  symptoms: ["Printing to the local network printer works", "No websites load in any browser", "IT gave her a fixed IP address a few weeks ago for a finance application"],
  hiddenFault: "IT fat-fingered her manually configured default gateway — it's set to 192.168.7.100, which isn't a router at all, instead of the real gateway at 192.168.7.1. Local traffic works fine; anything that needs to leave the subnet doesn't.",
  availableCommands: ["ipconfig", "ping", "nslookup", "tracert", "arp", "netstat"],

  terminalOutputs: [
    { id: "out-ipconfig-pre", command: "ipconfig", match: ["ipconfig"], phase: "pre", isKeyCommand: true, revealsEvidence: ["ev-bad-gateway"],
      output: ["Ethernet adapter Ethernet:", "   IPv4 Address. . . . . . . . . . . : 192.168.7.42", "   Subnet Mask . . . . . . . . . . . : 255.255.255.0", "   Default Gateway . . . . . . . . . : 192.168.7.100"] },
    { id: "out-ipconfig-post", command: "ipconfig", match: ["ipconfig"], phase: "post",
      output: ["Ethernet adapter Ethernet:", "   IPv4 Address. . . . . . . . . . . : 192.168.7.42", "   Subnet Mask . . . . . . . . . . . : 255.255.255.0", "   Default Gateway . . . . . . . . . : 192.168.7.1"] },
    { id: "out-ping-gw-pre", command: "ping", match: ["ping 192.168.7.100"], phase: "pre", isKeyCommand: true, revealsEvidence: ["ev-gateway-unreachable"],
      output: ["Pinging 192.168.7.100 with 32 bytes of data:", "Request timed out.", "Request timed out.", "Request timed out."] },
    { id: "out-ping-realgw", command: "ping", match: ["ping 192.168.7.1"],
      output: ["Pinging 192.168.7.1 with 32 bytes of data:", "Reply from 192.168.7.1: bytes=32 time=1ms TTL=64", "Reply from 192.168.7.1: bytes=32 time=1ms TTL=64"] },
    { id: "out-ping-printer", command: "ping", match: ["ping 192.168.7.50"], isKeyCommand: true, revealsEvidence: ["ev-local-works"],
      output: ["Pinging 192.168.7.50 with 32 bytes of data:", "Reply from 192.168.7.50: bytes=32 time=1ms TTL=64", "Reply from 192.168.7.50: bytes=32 time=1ms TTL=64"] },
    { id: "out-ping-ext-pre", command: "ping", match: ["ping 8.8.8.8"], phase: "pre",
      output: ["Pinging 8.8.8.8 with 32 bytes of data:", "PING: transmit failed. General failure."] },
    { id: "out-ping-ext-post", command: "ping", match: ["ping 8.8.8.8"], phase: "post",
      output: ["Pinging 8.8.8.8 with 32 bytes of data:", "Reply from 8.8.8.8: bytes=32 time=14ms TTL=115", "Reply from 8.8.8.8: bytes=32 time=13ms TTL=115"] },
    { id: "out-nslookup", command: "nslookup", match: ["nslookup google.com"], isKeyCommand: true, revealsEvidence: ["ev-dns-fine"],
      output: ["Server:  dns1.geedesk.local", "Address:  192.168.7.10", "", "Non-authoritative answer:", "Name:    google.com", "Address:  142.250.72.14"] },
    { id: "out-arp", command: "arp", match: ["arp -a"], output: ["Interface: 192.168.7.42 --- 0xa", "  Internet Address      Physical Address      Type", "  192.168.7.50           aa-14-ff-2b-10-33     dynamic"] },
    { id: "out-tracert", command: "tracert", match: ["tracert google.com"], output: ["Unable to resolve target system name google.com.", "(name resolved fine, but the route out has no valid gateway to use)"] },
    { id: "out-netstat", command: "netstat", match: ["netstat"], output: ["Active Connections", "  TCP    192.168.7.42:52001    192.168.7.50:9100     ESTABLISHED"] },
  ],

  evidence: [
    { id: "ev-ticket-summary", category: "user-report", label: "Ticket summary", detail: "Helen can print locally but no websites load at all." },
    { id: "ev-bad-gateway", category: "network", isKey: true, label: "Gateway address looks wrong",
      detail: "Her default gateway is manually set to 192.168.7.100 — not the address other machines on this subnet use." },
    { id: "ev-gateway-unreachable", category: "network", isKey: true, label: "Configured gateway doesn't respond",
      detail: "192.168.7.100 doesn't answer at all — it isn't acting as a router on this network." },
    { id: "ev-local-works", category: "network", isKey: true, label: "Local traffic works fine",
      detail: "She can reach another device on her own subnet (the printer) directly, without needing a gateway." },
    { id: "ev-dns-fine", category: "network", isKey: true, label: "DNS resolves normally",
      detail: "nslookup successfully resolves external hostnames — DNS itself isn't the problem." },
    { id: "ev-static-ip-context", category: "conversation", isKey: true, label: "She's on a manually assigned IP",
      detail: "IT set her up with a fixed (static) IP configuration a few weeks ago for a finance application." },
    { id: "ev-others-fine", category: "conversation", label: "No one else affected", detail: "Her neighbor on the same switch has no internet issues." },
  ],
  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    { id: "q-static", prompt: "Has your network setup been changed recently, like getting a fixed IP address?",
      response: "\"Yes, actually — IT set me up with a specific fixed address a few weeks ago for our finance software.\"",
      revealsEvidence: ["ev-static-ip-context"], isKeyQuestion: true },
    { id: "q-others", prompt: "Is anyone near you having internet trouble too?",
      response: "\"No, my neighbor's totally fine.\"", revealsEvidence: ["ev-others-fine"] },
    { id: "q-printer-works", prompt: "Just to confirm — printing still works?", response: "\"Yes, that's never stopped working.\"", revealsEvidence: [] },
  ],

  keyConcepts: [
    "Recognizing that local traffic can succeed while all off-subnet traffic fails when the gateway is wrong",
    "Using nslookup to rule DNS in or out before blaming routing",
    "Understanding that a manually (statically) configured setting won't self-correct via DHCP renewal",
  ],

  diagnosisOptions: [
    { id: "diag-gateway", isCorrect: true, label: "Her default gateway is configured incorrectly, so nothing can leave her local subnet",
      explanation: "Correct. DNS resolves fine and local devices are reachable directly, but the configured gateway address doesn't respond at all — nothing can get routed out to the internet." },
    { id: "diag-dns", isCorrect: false, label: "DNS is misconfigured",
      explanation: "nslookup successfully resolved an external hostname — DNS is working normally here." },
    { id: "diag-cable", isCorrect: false, label: "Her network cable or port has failed",
      explanation: "She can reach another device on her own subnet directly over the same link — the physical connection is fine." },
    { id: "diag-isp", isCorrect: false, label: "The building's internet service is down",
      explanation: "Her neighbor on the same switch has no problem reaching the internet at the same time." },
  ],

  resolutionOptions: [
    { id: "res-fix-gateway", isCorrect: true, label: "Correct her default gateway to the real router address, 192.168.7.1",
      explanation: "This points her traffic at an address that's actually acting as a router, restoring her path off the local subnet." },
    { id: "res-dhcp-renew", isCorrect: false, label: "Release and renew her DHCP lease",
      explanation: "Her IP configuration is static, not from DHCP — a renewal has nothing to renew and won't touch the misconfigured gateway." },
    { id: "res-restart", isCorrect: false, label: "Restart her computer", explanation: "A restart won't change a manually entered, incorrect gateway address." },
    { id: "res-cable", isCorrect: false, label: "Replace her network cable", explanation: "Local traffic over that same cable already works fine — this isn't a cabling problem." },
  ],

  verification: { prompt: "Confirm she can now reach the internet.", expectedOutputId: "out-ping-ext-post",
    successMessage: "External sites now respond — her traffic is routing through the correct gateway." },

  scoring: { investigationMax: 20, evidenceMax: 15, diagnosisMax: 25, resolutionMax: 20, verificationMax: 10, efficiencyMax: 10, hintPenalty: 4, freeActionAllowance: 3 },
  hints: [
    { id: "hint-1", cost: 4, text: "Try pinging her configured gateway address directly — does it even respond?" },
    { id: "hint-2", cost: 4, text: "Test whether DNS itself works before assuming it's the problem." },
  ],
  skills: ["networking", "ip-addressing", "troubleshooting-methodology"],
  tags: ["beginner", "routing", "windows"],
  estimatedMinutes: 8,
};
