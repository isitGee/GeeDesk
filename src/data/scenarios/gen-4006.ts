import type { Scenario } from "../../types/scenario";

export const gen4006: Scenario = {
  id: "gen-4006",
  ticketNumber: "GEN-4006",
  title: "Outlook desktop stuck on 'Updating Inbox' and search returns zero results",
  category: "General IT",
  difficulty: "beginner",
  user: { name: "Franklin Scott", role: "Legal Counsel", department: "Legal" },
  ticketDescription:
    "My Outlook 365 app hasn't downloaded any new emails since yesterday afternoon. The bottom status bar says 'Updating Inbox (3.8 GB)' and the blue progress bar never finishes. When I search for recent contracts, it says 'Search results may be incomplete'. Webmail works fine on my iPad.",
  symptoms: [
    "Outlook status bar permanently stuck on 'Updating Inbox'",
    "Searching for emails returns zero results or incomplete search index",
    "Outlook on the Web (OWA) receives new messages without delay",
  ],
  hiddenFault:
    "Franklin's offline Outlook data file (C:\\Users\\fscott\\AppData\\Local\\Microsoft\\Outlook\\fscott@geedesk.com.ost) grew past 48 GB and suffered SQLite/MAPI index corruption when his laptop battery died mid-sync.",
  availableCommands: ["dir", "tasklist", "ping"],

  terminalOutputs: [
    {
      id: "out-dir-ost-pre",
      command: "dir",
      match: [
        "dir \"%localappdata%\\Microsoft\\Outlook\"",
        "dir C:\\Users\\fscott\\AppData\\Local\\Microsoft\\Outlook",
        "dir C:\\Users\\fscott\\AppData\\Local\\Microsoft\\Outlook\\*.ost",
      ],
      phase: "pre",
      isKeyCommand: true,
      revealsEvidence: ["ev-huge-ost"],
      output: [
        " Directory of C:\\Users\\fscott\\AppData\\Local\\Microsoft\\Outlook",
        "",
        "09/17/2026  03:14 PM    <DIR>          .",
        "09/17/2026  03:14 PM    <DIR>          ..",
        "09/17/2026  03:14 PM    51,489,144,832 fscott@geedesk.com.ost [CORRUPT HEADER / DIRTY SHUTDOWN]",
        "09/17/2026  03:14 PM         1,048,576 fscott@geedesk.com.nst",
        "               2 File(s) 51,490,193,408 bytes",
      ],
    },
    {
      id: "out-dir-ost-post",
      command: "dir",
      match: [
        "dir \"%localappdata%\\Microsoft\\Outlook\"",
        "dir C:\\Users\\fscott\\AppData\\Local\\Microsoft\\Outlook",
        "dir C:\\Users\\fscott\\AppData\\Local\\Microsoft\\Outlook\\*.ost",
      ],
      phase: "post",
      output: [
        " Directory of C:\\Users\\fscott\\AppData\\Local\\Microsoft\\Outlook",
        "",
        "09/18/2026  10:22 AM    <DIR>          .",
        "09/18/2026  10:22 AM    <DIR>          ..",
        "09/18/2026  10:22 AM     4,194,304,000 fscott@geedesk.com.ost [ALL FOLDERS UP TO DATE / HEALTHY]",
        "               1 File(s)  4,194,304,000 bytes",
      ],
    },
    {
      id: "out-tasklist",
      command: "tasklist",
      match: ["tasklist", "tasklist /fi \"imagename eq OUTLOOK.EXE\""],
      revealsEvidence: ["ev-outlook-running"],
      output: [
        "Image Name                     PID Session Name        Session#    Mem Usage",
        "========================= ======== ================ =========== ============",
        "explorer.exe                  4112 Console                    1     84,210 K",
        "OUTLOOK.EXE                   7812 Console                    1    890,440 K (High memory / unresponsive thread)",
        "SearchHost.exe                8410 Console                    1     38,120 K",
      ],
    },
    {
      id: "out-ping-o365",
      command: "ping",
      match: ["ping outlook.office365.com", "ping outlook.office.com"],
      revealsEvidence: ["ev-o365-reachable"],
      output: [
        "Pinging outlook.office365.com [52.96.166.146] with 32 bytes of data:",
        "Reply from 52.96.166.146: bytes=32 time=14ms TTL=242",
        "Reply from 52.96.166.146: bytes=32 time=14ms TTL=242",
        "Ping statistics: Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)",
      ],
    },
  ],

  evidence: [
    {
      id: "ev-ticket-summary",
      category: "user-report",
      label: "Ticket summary",
      detail: "Franklin's Outlook is hung on 'Updating Inbox'; webmail works fine.",
    },
    {
      id: "ev-huge-ost",
      category: "system",
      isKey: true,
      label: "OST cache file reached 51 GB and has a corrupt header",
      detail: "Directory listing shows fscott@geedesk.com.ost exceeds the default 50GB file boundary and suffered an improper shutdown.",
    },
    {
      id: "ev-o365-reachable",
      category: "network",
      label: "Microsoft 365 cloud endpoints are reachable",
      detail: "Ping to outlook.office365.com responds in 14ms with zero packet loss.",
    },
    {
      id: "ev-webmail-works",
      category: "conversation",
      label: "User can send and receive emails via browser",
      detail: "Franklin confirms his Exchange mailbox is active and receives email normally in webmail.",
    },
    {
      id: "ev-outlook-running",
      category: "system",
      label: "OUTLOOK.EXE process running with 890MB memory footprint",
      detail: "Outlook process is active but caught in an infinite thread loop.",
    },
  ],

  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    {
      id: "q-webmail-check",
      question: "Are new emails arriving when you log into webmail (outlook.office.com)?",
      answer: "Yes, webmail shows new emails from 10 minutes ago, so the server itself is clearly receiving them.",
      isKey: true,
      revealsEvidence: ["ev-webmail-works"],
    },
    {
      id: "q-laptop-crash",
      question: "Did your laptop shut down unexpectedly yesterday?",
      answer: "My battery died completely while I was working on an airplane yesterday before I could plug in.",
    },
  ],

  diagnosisOptions: [
    {
      id: "diag-corrupt-ost",
      label: "Local offline Outlook data cache (.ost file) is corrupted and bloated beyond 50GB, preventing folder synchronization.",
      isCorrect: true,
    },
    {
      id: "diag-mailbox-full",
      label: "Exchange Online cloud mailbox exceeded storage quota (50GB hard limit).",
      isCorrect: false,
    },
    {
      id: "diag-autodiscover-down",
      label: "DNS Autodiscover record for geedesk.com is down worldwide.",
      isCorrect: false,
    },
  ],

  resolutionOptions: [
    {
      id: "res-rebuild-ost",
      label: "Close Outlook, rename/delete the corrupt fscott@geedesk.com.ost cache file, and reopen Outlook to generate a clean synchronized OST.",
      isCorrect: true,
    },
    {
      id: "res-reinstall-office",
      label: "Uninstall Microsoft Office 365 and reinstall from office.com.",
      isCorrect: false,
      simulatedConsequence: "Reinstalled Office; Outlook reconnected to the same corrupted OST file on disk and remained frozen.",
      efficiencyPenalty: 6,
    },
    {
      id: "res-delete-exchange-account",
      label: "Delete Franklin's user account in Microsoft 365 Admin Center.",
      isCorrect: false,
      simulatedConsequence: "Severe operational incident: deleted Franklin's mailbox and cloud archive.",
      efficiencyPenalty: 10,
    },
  ],

  verification: {
    prompt: "Check the Outlook local AppData directory to verify a healthy, newly generated OST file is actively syncing.",
    expectedOutputId: "out-dir-ost-post",
    successMessage: "Clean OST cache file generated; Outlook completed synchronization with status 'All folders up to date'.",
  },

  hints: [
    { id: "h-1", text: "When webmail works but the desktop client hangs on sync, the problem is local to the workstation.", cost: 2 },
    { id: "h-2", text: "Check the size and state of the .ost file in '%localappdata%\\Microsoft\\Outlook'.", cost: 4 },
    { id: "h-3", text: "The .ost file is corrupted. Close Outlook and rename or delete the .ost file so Outlook can rebuild it.", cost: 7 },
  ],

  scoring: {
    investigationMax: 20,
    evidenceMax: 15,
    diagnosisMax: 25,
    resolutionMax: 20,
    verificationMax: 10,
    efficiencyMax: 10,
  },

  skills: ["Outlook Troubleshooting", "OST Rebuild", "MAPI Cache", "Office 365", "Email Clients"],
  tags: ["General IT", "Email", "Outlook", "Office 365", "Storage"],
};
