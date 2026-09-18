import type { Scenario } from "../../types/scenario";

export const sec5003: Scenario = {
  id: "sec-5003",
  ticketNumber: "SEC-5003",
  title: "Suspicious PowerShell background traffic and canary ransom note",
  category: "Security",
  difficulty: "advanced",
  user: {
    name: "Devon Vance",
    role: "Operations Specialist",
    department: "Operations",
    initials: "DV",
    location: "HQ Building A — Floor 1, Desk 104",
    phone: "x4104",
    email: "d.vance@geedesk.local",
    techLevel: "Intermediate",
    communicationStyle: "Alarmed, noticed fan running at 100% and desktop icons suddenly turned white with odd extension.",
    previousIncidentsCount: 2,
  },
  ticketDescription:
    "My computer fan started spinning loudly, and a strange file called 'HOW_TO_RECOVER_FILES.txt' suddenly appeared on my desktop. Several spreadsheets have had their icons changed.",
  symptoms: [
    "High background CPU usage and loud cooling fan",
    "New text file on Desktop: HOW_TO_RECOVER_FILES.txt",
    "Documents ending with abnormal extension .cryptlock",
  ],
  hiddenFault:
    "Endpoint WS-OPS-VANCE was infected via a malicious macro payload that spawned an obfuscated PowerShell Command and Control (C2) reverse shell beacon connected to foreign IP 185.193.12.88 on port 4444. This is an active ransomware staging incident requiring immediate physical network isolation and priority escalation to the Security Operations Center (SOC).",
  availableCommands: ["netstat", "tasklist", "whoami", "ipconfig", "systeminfo"],

  terminalOutputs: [
    {
      id: "out-netstat-pre",
      command: "netstat",
      match: ["netstat", "netstat -ano", "netstat -a"],
      phase: "pre",
      isKeyCommand: true,
      revealsEvidence: ["ev-c2-connection"],
      output: [
        "Active Connections",
        "",
        "  Proto  Local Address          Foreign Address        State           PID",
        "  TCP    192.168.10.84:49812    192.168.10.1:445       ESTABLISHED     4",
        "  TCP    192.168.10.84:50114    185.193.12.88:4444     ESTABLISHED     5120",
        "  TCP    192.168.10.84:50220    192.168.1.5:53         TIME_WAIT       0",
      ],
    },
    {
      id: "out-netstat-post",
      command: "netstat",
      match: ["netstat", "netstat -ano", "netstat -a"],
      phase: "post",
      output: [
        "Active Connections",
        "",
        "  Proto  Local Address          Foreign Address        State           PID",
        "  TCP    192.168.10.84:49812    192.168.10.1:445       TIME_WAIT       4",
        "(Interface administratively quarantined — foreign C2 connection terminated)",
      ],
    },
    {
      id: "out-tasklist",
      command: "tasklist",
      match: ["tasklist"],
      isKeyCommand: true,
      revealsEvidence: ["ev-powershell-pid"],
      output: [
        "Image Name                     PID Session Name        Session#    Mem Usage",
        "========================= ======== ================ =========== ============",
        "explorer.exe                  2104 Console                    1     64,820 K",
        "powershell.exe                5120 Console                    1    184,200 K",
        "svchost.exe                    936 Services                   0     24,196 K",
      ],
    },
    {
      id: "out-whoami",
      command: "whoami",
      match: ["whoami", "whoami /all"],
      output: [
        "geedesk\\dvance",
      ],
    },
    {
      id: "out-ipconfig",
      command: "ipconfig",
      match: ["ipconfig"],
      output: [
        "Ethernet adapter Ethernet:",
        "   IPv4 Address. . . . . . . . . . . : 192.168.10.84",
        "   Subnet Mask . . . . . . . . . . . : 255.255.255.0",
        "   Default Gateway . . . . . . . . . : 192.168.10.1",
      ],
    },
    {
      id: "out-systeminfo",
      command: "systeminfo",
      match: ["systeminfo"],
      output: [
        "Host Name:                 WS-OPS-VANCE",
        "OS Name:                   Microsoft Windows 11 Enterprise",
        "Hotfix(s):                 4 Hotfix(s) Installed.",
      ],
    },
  ],

  evidence: [
    {
      id: "ev-ticket-summary",
      category: "user-report",
      label: "Ticket summary",
      detail: "Devon noticed loud fans, files renamed with .cryptlock, and a ransom note file appearing on the desktop.",
    },
    {
      id: "ev-c2-connection",
      category: "network",
      isKey: true,
      label: "Foreign C2 Connection on Port 4444",
      detail: "netstat reveals active TCP connection from PID 5120 to foreign IP 185.193.12.88 on port 4444 (common Metasploit/C2 port).",
    },
    {
      id: "ev-powershell-pid",
      category: "system",
      isKey: true,
      label: "Hidden PowerShell Process",
      detail: "PID 5120 correlates to a hidden powershell.exe process consuming abnormal memory in tasklist.",
    },
    {
      id: "ev-macro-opened",
      category: "conversation",
      isKey: true,
      label: "Downloaded invoice macro",
      detail: "Devon recalls opening an email attachment titled 'Vendor_Invoice_982.docm' and clicking 'Enable Content' 20 minutes ago.",
    },
    {
      id: "ev-share-unaffected",
      category: "conversation",
      label: "Central shares not yet encrypted",
      detail: "Shared network folders do not show encrypted files yet — the attack is in early staging on the local machine.",
    },
  ],
  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    {
      id: "q-attachment",
      prompt: "Did you open any email attachments, download files, or enable macros recently?",
      response: "\"About 20 minutes ago I opened an invoice named 'Vendor_Invoice_982.docm' and clicked 'Enable Macros' because it said it was protected.\"",
      revealsEvidence: ["ev-macro-opened"],
      isKeyQuestion: true,
    },
    {
      id: "q-network-drives",
      prompt: "Have you checked whether mapped network drives or shared folders look normal?",
      response: "\"I checked the Operations drive and files look normal so far — only my local desktop and documents have those weird extensions.\"",
      revealsEvidence: ["ev-share-unaffected"],
      isKeyQuestion: true,
    },
    {
      id: "q-reboot",
      prompt: "Have you restarted or powered off the computer since this happened?",
      response: "\"No, I immediately called IT before touching anything else.\"",
      revealsEvidence: [],
    },
  ],

  keyConcepts: [
    "Correlating netstat established TCP connections with foreign IPs and tasklist PIDs",
    "Preserving volatile memory evidence and halting lateral movement by immediate network containment",
    "Knowing that active ransomware outbreaks strictly require SOC Incident Response escalation, not local DIY cleanup",
  ],

  diagnosisOptions: [
    {
      id: "diag-ransomware-c2",
      label: "Active malware/ransomware infection with live Command & Control (C2) beacon to a foreign IP",
      isCorrect: true,
      explanation:
        "Correct. An obfuscated PowerShell process (PID 5120) holds an active established connection to 185.193.12.88 on port 4444 following a macro execution, and local files are being encrypted. This is an active breach requiring immediate containment.",
    },
    {
      id: "diag-antivirus-scan",
      label: "Windows Defender is running a scheduled background scan causing high CPU",
      isCorrect: false,
      explanation:
        "Windows Defender does not rename files to .cryptlock, drop ransom notes, or open reverse shells to foreign hosting IPs on port 4444.",
    },
    {
      id: "diag-onedrive-sync",
      label: "OneDrive sync conflict created duplicate encrypted files",
      isCorrect: false,
      explanation:
        "Cloud sync conflicts append machine names to files, never ransom notes or suspicious TCP connections.",
    },
  ],

  resolutionOptions: [
    {
      id: "res-isolate-and-soc",
      label: "Isolate endpoint from network immediately and escalate P1 incident to Security Operations Center (SOC)",
      isCorrect: true,
      explanation:
        "Correct. Tier 1 must immediately isolate the endpoint (unplug cable, disable wireless) to prevent lateral spread to company file shares, preserve RAM state, and escalate directly to the SOC for containment and credential revocation.",
    },
    {
      id: "res-reboot-safe-mode",
      label: "Restart into Safe Mode and run a free online antivirus scanner",
      isCorrect: false,
      explanation:
        "Rebooting destroys volatile RAM evidence crucial for threat intelligence, and DIY antivirus scans fail against customized enterprise C2 payloads.",
    },
    {
      id: "res-pay-ransom",
      label: "Follow instructions in the text file to pay the decryption fee",
      isCorrect: false,
      explanation:
        "Corporate policy strictly forbids extortion payments. Backups and SOC incident response protocols must be utilized.",
    },
  ],

  verification: {
    prompt: "Confirm the endpoint network connection is severed and the foreign C2 beacon has terminated.",
    expectedOutputId: "out-netstat-post",
    successMessage:
      "Host is successfully quarantined and foreign C2 connection is severed. SOC incident ticket P1-SEC-882 is active for forensic acquisition.",
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
      text: "Run netstat -ano and check the Foreign Address column for non-local IP addresses.",
    },
    {
      id: "hint-2",
      cost: 4,
      text: "Look at the PID connected to the foreign IP in netstat, then locate that PID in tasklist.",
    },
  ],

  skills: ["security", "incident-response", "malware", "troubleshooting-methodology", "escalation"],
  tags: ["advanced", "security", "ransomware", "soc", "powershell"],
  estimatedMinutes: 12,
};
