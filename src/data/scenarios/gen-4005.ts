import type { Scenario } from "../../types/scenario";

export const gen4005: Scenario = {
  id: "gen-4005",
  ticketNumber: "GEN-4005",
  title: "Accounting PC cannot open shared files on legacy NAS: 'You can't connect to the file share'",
  category: "General IT",
  difficulty: "intermediate",
  user: { name: "Beatrice Howard", role: "Senior Accountant", department: "Accounting" },
  ticketDescription:
    "My newly deployed Windows 11 desktop (ACCT-PC-12) cannot connect to our archive network share at \\\\nas-archive\\accounting. When I try to map the drive, Windows displays: 'You can't connect to the file share because it's not secure. This share requires the obsolete SMB1 protocol'.",
  symptoms: [
    "Unable to map or open \\\\nas-archive\\accounting on new Windows 11 PC",
    "Error dialog explicitly cites obsolete SMB1 protocol requirement",
    "Legacy Windows 10 workstations can still access the share",
  ],
  hiddenFault:
    "The department's older standalone NAS unit (D-Link ShareCenter) only supports SMBv1. Windows 11 completely disables SMBv1 client by default due to critical vulnerabilities (EternalBlue / WannaCry). The enterprise policy requires enabling SMB2/SMB3 on the NAS or migrating files to modern secure DFS shares.",
  availableCommands: ["powershell", "ping", "net"],

  terminalOutputs: [
    {
      id: "out-ps-smb-pre",
      command: "powershell",
      match: [
        "powershell Get-WindowsOptionalFeature -Online -FeatureName SMB1Protocol",
        "Get-WindowsOptionalFeature -Online -FeatureName SMB1Protocol",
        "powershell Get-SmbServerConfiguration",
      ],
      phase: "pre",
      isKeyCommand: true,
      revealsEvidence: ["ev-smb1-disabled"],
      output: [
        "FeatureName : SMB1Protocol",
        "State       : Disabled",
        "",
        "FeatureName : SMB1Protocol-Client",
        "State       : Disabled",
        "",
        "FeatureName : SMB1Protocol-Server",
        "State       : Disabled",
      ],
    },
    {
      id: "out-ps-smb-post",
      command: "powershell",
      match: [
        "powershell Get-WindowsOptionalFeature -Online -FeatureName SMB1Protocol",
        "Get-WindowsOptionalFeature -Online -FeatureName SMB1Protocol",
        "powershell Get-SmbServerConfiguration",
      ],
      phase: "post",
      output: [
        "FeatureName : SMB1Protocol",
        "State       : Disabled",
        "",
        "SMB Client Connections Active:",
        "ServerName       ShareName     Dialect  NumOpens",
        "----------       ---------     -------  --------",
        "fs-corp01.local  accounting    3.1.1    4",
      ],
    },
    {
      id: "out-net-use-pre",
      command: "net",
      match: ["net use Z: \\\\nas-archive\\accounting", "net use", "net view \\\\nas-archive"],
      phase: "pre",
      output: [
        "System error 384 has occurred.",
        "",
        "You can't connect to the file share because it's not secure. This share requires",
        "the obsolete SMB1 protocol, which is unsafe and can expose your system to attack.",
        "Your system requires SMB 2.0 or higher.",
      ],
    },
    {
      id: "out-net-use-post",
      command: "net",
      match: ["net use Z: \\\\nas-archive\\accounting", "net use", "net view \\\\nas-archive"],
      phase: "post",
      output: [
        "The command completed successfully.",
        "",
        "Status       Local     Remote                    Network",
        "-------------------------------------------------------------------------------",
        "OK           Z:        \\\\fs-corp01.local\\accounting  Microsoft Windows Network",
      ],
    },
    {
      id: "out-ping-nas",
      command: "ping",
      match: ["ping nas-archive", "ping 192.168.1.99"],
      revealsEvidence: ["ev-nas-reachable"],
      output: [
        "Pinging nas-archive [192.168.1.99] with 32 bytes of data:",
        "Reply from 192.168.1.99: bytes=32 time=2ms TTL=64",
        "Reply from 192.168.1.99: bytes=32 time=1ms TTL=64",
        "Ping statistics for 192.168.1.99: Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)",
      ],
    },
  ],

  evidence: [
    {
      id: "ev-ticket-summary",
      category: "user-report",
      label: "Ticket summary",
      detail: "Beatrice cannot access \\\\nas-archive\\accounting on new Windows 11 PC; receives System error 384.",
    },
    {
      id: "ev-smb1-disabled",
      category: "system",
      isKey: true,
      label: "SMB1Protocol-Client is Disabled on Windows 11",
      detail: "PowerShell confirms SMBv1 client features are disabled to protect against EternalBlue ransomware exploits.",
    },
    {
      id: "ev-nas-reachable",
      category: "network",
      label: "NAS device is reachable on network at 192.168.1.99",
      detail: "Physical network and IP routing to the storage appliance are fully functional.",
    },
    {
      id: "ev-share-migrated",
      category: "conversation",
      label: "IT announced migration to modern corporate file server last month",
      detail: "IT previously copied all archive files to modern Windows Server 2022 share \\\\fs-corp01.local\\accounting.",
    },
  ],

  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    {
      id: "q-it-announcement",
      question: "Did IT announce any changes to department storage recently?",
      answer: "Now that you mention it, IT sent an email last month telling us the old D-Link NAS was being retired and to use \\\\fs-corp01.local\\accounting.",
      isKey: true,
      revealsEvidence: ["ev-share-migrated"],
    },
    {
      id: "q-credentials",
      question: "Do your domain credentials work on other shares?",
      answer: "Yes, I can access our shared marketing folders without any prompt.",
    },
  ],

  diagnosisOptions: [
    {
      id: "diag-smbv1-deprecated",
      label: "Windows 11 blocks connections to obsolete SMBv1-only servers due to security deprecation (System Error 384).",
      isCorrect: true,
    },
    {
      id: "diag-ntfs-permissions",
      label: "Beatrice's Active Directory account was removed from the Accounting Security Group.",
      isCorrect: false,
    },
    {
      id: "diag-nas-crashed",
      label: "Hardware disk failure on the storage device causing RAID volume destruction.",
      isCorrect: false,
    },
  ],

  resolutionOptions: [
    {
      id: "res-remap-dfs",
      label: "Update user's mapped Z: drive to the modern SMBv3 secure corporate file server: \\\\fs-corp01.local\\accounting.",
      isCorrect: true,
    },
    {
      id: "res-enable-smb1",
      label: "Force-enable SMBv1 protocol in Windows Optional Features and reboot.",
      isCorrect: false,
      simulatedConsequence: "Violates enterprise security policy by exposing endpoint to EternalBlue/WannaCry remote code execution exploits.",
      efficiencyPenalty: 6,
    },
    {
      id: "res-disable-firewall",
      label: "Turn off Windows Defender Firewall on Private and Public profiles.",
      isCorrect: false,
      simulatedConsequence: "Firewall disabled; SMB1 protocol rejection remains unchanged.",
      efficiencyPenalty: 5,
    },
  ],

  verification: {
    prompt: "Map the Z: drive to \\\\fs-corp01.local\\accounting using 'net use' to confirm successful connection over SMBv3.",
    expectedOutputId: "out-net-use-post",
    successMessage: "Share successfully mapped to secure enterprise file server over encrypted SMB 3.1.1 dialect.",
  },

  hints: [
    { id: "h-1", text: "Windows 11 permanently disables SMBv1 out of the box because of severe security vulnerabilities.", cost: 2 },
    { id: "h-2", text: "Check SMB protocol status with PowerShell 'Get-WindowsOptionalFeature -Online -FeatureName SMB1Protocol'.", cost: 4 },
    { id: "h-3", text: "Do not re-enable insecure SMBv1. Point the user to the migrated modern server \\\\fs-corp01.local\\accounting.", cost: 7 },
  ],

  scoring: {
    investigationMax: 20,
    evidenceMax: 15,
    diagnosisMax: 25,
    resolutionMax: 20,
    verificationMax: 10,
    efficiencyMax: 10,
  },

  skills: ["SMB Protocols", "File Shares", "Security Best Practices", "Drive Mapping", "Legacy Migration"],
  tags: ["General IT", "Networking", "Security", "SMB", "Storage"],
};
