import type { Scenario } from "../../types/scenario";

export const sec5004: Scenario = {
  id: "sec-5004",
  ticketNumber: "SEC-5004",
  title: "Employee clicked macro invoice attachment and PC spawned hidden PowerShell window",
  category: "Security",
  difficulty: "advanced",
  user: { name: "Chloe Bennett", role: "Billing Specialist", department: "Finance" },
  ticketDescription:
    "I received an urgent vendor email with an attached Word document titled 'OVERDUE_INVOICE_9102.docm'. When I opened it, a yellow banner asked me to 'Enable Content'. After clicking it, Word froze, a black command prompt popped up for half a second and disappeared, and now my fans are spinning loudly.",
  symptoms: [
    "User enabled macros on an unsolicited external email attachment",
    "Brief PowerShell/cmd window flashed on screen",
    "Outbound network connections established to an unfamiliar foreign IP",
  ],
  hiddenFault:
    "The malicious document executed a VBA macro that spawned an encoded PowerShell command (Base64), downloading a secondary Cobalt Strike beacon payload and establishing a persistent C2 beacon over port 443 to 185.220.101.5.",
  availableCommands: ["netstat", "tasklist", "powershell"],

  terminalOutputs: [
    {
      id: "out-netstat-c2-pre",
      command: "netstat",
      match: ["netstat -ano", "netstat -ano | findstr ESTABLISHED", "netstat -b"],
      phase: "pre",
      isKeyCommand: true,
      revealsEvidence: ["ev-c2-connection"],
      output: [
        "Active Connections",
        "",
        "  Proto  Local Address          Foreign Address        State           PID",
        "  TCP    192.168.1.75:49812     185.220.101.5:443      ESTABLISHED     9144",
        "  TCP    192.168.1.75:49815     13.107.42.16:443       ESTABLISHED     4112",
        "  TCP    192.168.1.75:49820     52.96.166.146:443      ESTABLISHED     7812",
      ],
    },
    {
      id: "out-netstat-c2-post",
      command: "netstat",
      match: ["netstat -ano", "netstat -ano | findstr ESTABLISHED", "netstat -b"],
      phase: "post",
      output: [
        "Active Connections",
        "",
        "  Proto  Local Address          Foreign Address        State           PID",
        "  TCP    192.168.1.75:49815     13.107.42.16:443       ESTABLISHED     4112",
        "  TCP    192.168.1.75:49820     52.96.166.146:443      ESTABLISHED     7812",
      ],
    },
    {
      id: "out-tasklist-pid-pre",
      command: "tasklist",
      match: ["tasklist /fi \"pid eq 9144\"", "tasklist /v", "tasklist"],
      phase: "pre",
      isKeyCommand: true,
      revealsEvidence: ["ev-malicious-ps-process"],
      output: [
        "Image Name                     PID Session Name        Session#    Mem Usage",
        "========================= ======== ================ =========== ============",
        "powershell.exe                9144 Services                   0    142,880 K",
        "  Window Title: N/A (Hidden/NoProfile -EncodedCommand SQBFAFgAIAAoAE4AZQB3AC0ATwBi...)",
      ],
    },
    {
      id: "out-tasklist-pid-post",
      command: "tasklist",
      match: ["tasklist /fi \"pid eq 9144\"", "tasklist /v", "tasklist"],
      phase: "post",
      output: [
        "INFO: No tasks are running which match the specified criteria.",
      ],
    },
    {
      id: "out-ps-startup",
      command: "powershell",
      match: [
        "powershell Get-CimInstance Win32_StartupCommand",
        "Get-CimInstance Win32_StartupCommand",
        "powershell startup",
      ],
      revealsEvidence: ["ev-persistence-reg"],
      output: [
        "Name        : WindowsHealthTelemetry",
        "Command     : C:\\Users\\cbennett\\AppData\\Roaming\\msupdate.vbs",
        "Location    : HKU\\S-1-5-21-397955417-626881126-18844144-1050\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
        "User        : geedesk\\cbennett",
      ],
    },
  ],

  evidence: [
    {
      id: "ev-ticket-summary",
      category: "user-report",
      label: "Ticket summary",
      detail: "Chloe enabled macros in an unsolicited invoice; black window flashed on screen.",
    },
    {
      id: "ev-c2-connection",
      category: "network",
      isKey: true,
      label: "Active TCP connection to known malicious C2 IP (185.220.101.5)",
      detail: "netstat reveals PID 9144 holding an established outbound session to 185.220.101.5 on port 443.",
    },
    {
      id: "ev-malicious-ps-process",
      category: "system",
      isKey: true,
      label: "Hidden PowerShell process running Base64 encoded payload (PID 9144)",
      detail: "Process 9144 was spawned with '-NoProfile -WindowStyle Hidden -EncodedCommand'.",
    },
    {
      id: "ev-persistence-reg",
      category: "system",
      label: "Persistence mechanism created in HKCU Run registry key",
      detail: "Malware established 'WindowsHealthTelemetry' pointing to msupdate.vbs in user AppData.",
    },
  ],

  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    {
      id: "q-sender-address",
      question: "What was the sender's actual email address on the invoice email?",
      answer: "The display name said 'QuickBooks Billing', but the email address was billing@invoicing-update-check99.top.",
      isKey: true,
      revealsEvidence: ["ev-c2-connection"],
    },
    {
      id: "q-forward-email",
      question: "Did you forward this email to anyone else in the company?",
      answer: "No, thank goodness. I called IT right after seeing the black window flash.",
    },
  ],

  diagnosisOptions: [
    {
      id: "diag-macro-malware",
      label: "Phishing attack delivering malicious VBA macro that spawned hidden PowerShell C2 beacon (PID 9144) to 185.220.101.5.",
      isCorrect: true,
    },
    {
      id: "diag-harmless-word-crash",
      label: "Microsoft Word compatibility bug caused by legacy DOCM file format.",
      isCorrect: false,
    },
    {
      id: "diag-windows-update-glitch",
      label: "Legitimate Microsoft Windows Update background telemetry collection.",
      isCorrect: false,
    },
  ],

  resolutionOptions: [
    {
      id: "res-incident-response",
      label: "Immediately isolate PC from network, terminate rogue process (taskkill /PID 9144 /F), remove persistence key, and escalate to SOC.",
      isCorrect: true,
    },
    {
      id: "res-run-disk-cleanup",
      label: "Run Disk Cleanup and empty Chloe's Recycle Bin.",
      isCorrect: false,
      simulatedConsequence: "Left active C2 beacon running and exfiltrating company accounting credentials.",
      efficiencyPenalty: 10,
    },
    {
      id: "res-tell-user-ignore",
      label: "Advise Chloe to close Word and reopen the document in Protected View.",
      isCorrect: false,
      simulatedConsequence: "Critical security blunder: ignored an active malware infection.",
      efficiencyPenalty: 10,
    },
  ],

  verification: {
    prompt: "Run netstat and tasklist to confirm the rogue PowerShell PID 9144 is terminated and C2 connection to 185.220.101.5 is closed.",
    expectedOutputId: "out-netstat-c2-post",
    successMessage: "Rogue malicious process terminated and C2 communication connection completely severed.",
  },

  hints: [
    { id: "h-1", text: "Macros in unsolicited email attachments are a primary vector for ransomware and remote access trojans (RATs).", cost: 2 },
    { id: "h-2", text: "Inspect active network sockets with 'netstat -ano' and find the process ID using 'tasklist'.", cost: 4 },
    { id: "h-3", text: "PID 9144 is an active C2 beacon. Isolate the machine, kill the process, and escalate to the Security Operations Center.", cost: 7 },
  ],

  scoring: {
    investigationMax: 20,
    evidenceMax: 15,
    diagnosisMax: 25,
    resolutionMax: 20,
    verificationMax: 10,
    efficiencyMax: 10,
  },

  skills: ["Incident Response", "Malware Analysis", "Netstat", "Process Hunting", "Phishing Defense"],
  tags: ["Security", "Malware", "Phishing", "Incident Response", "Network"],
};
