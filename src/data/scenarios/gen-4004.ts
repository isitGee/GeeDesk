import type { Scenario } from "../../types/scenario";

export const gen4004: Scenario = {
  id: "gen-4004",
  ticketNumber: "GEN-4004",
  title: "Outlook hasn't received new email since yesterday",
  category: "General IT",
  difficulty: "intermediate",
  user: { name: "Monica Alvarez", role: "Recruiter", department: "Human Resources" },
  ticketDescription: "My Outlook hasn't shown any new emails since yesterday, but I can still send. My phone's webmail is completely up to date.",
  symptoms: [
    "No new mail arriving in desktop Outlook since yesterday",
    "Sending still works fine from the same Outlook",
    "Phone webmail shows everything up to date",
  ],
  hiddenFault: "Outlook's local cached data file has become bloated and stuck, so it stopped syncing new mail down from the server — even though the mailbox itself, and her connection to it, are both completely fine.",
  availableCommands: ["ping", "tasklist"],

  terminalOutputs: [
    { id: "out-ping-server", command: "ping", match: ["ping mail.geedesk.local"], isKeyCommand: true, revealsEvidence: ["ev-server-reachable"],
      output: ["Pinging mail.geedesk.local [10.8.0.15] with 32 bytes of data:", "Reply from 10.8.0.15: bytes=32 time=6ms TTL=115", "Reply from 10.8.0.15: bytes=32 time=5ms TTL=115"] },
    { id: "out-tasklist-pre", command: "tasklist", match: ["tasklist"], phase: "pre", isKeyCommand: true, revealsEvidence: ["ev-outlook-high-memory"],
      output: ["Image Name                     PID   Mem Usage", "OUTLOOK.EXE                    4102  1,912,304 K", "explorer.exe                   2104     88,204 K"] },
    { id: "out-tasklist-post", command: "tasklist", match: ["tasklist"], phase: "post",
      output: ["Image Name                     PID   Mem Usage", "OUTLOOK.EXE                    4530    210,112 K", "explorer.exe                   2104     88,204 K"] },
  ],

  evidence: [
    { id: "ev-ticket-summary", category: "user-report", label: "Ticket summary", detail: "Monica's desktop Outlook stopped receiving mail yesterday, but she can send, and her phone is fully up to date." },
    { id: "ev-server-reachable", category: "network", isKey: true, label: "Mail server is reachable",
      detail: "The mail server responds to a ping normally — her network connection to it is fine." },
    { id: "ev-outlook-high-memory", category: "system", isKey: true, label: "Outlook using abnormal memory",
      detail: "OUTLOOK.EXE is consuming an unusually large amount of memory — consistent with a bloated or stuck local data cache." },
    { id: "ev-send-works", category: "conversation", isKey: true, label: "Sending still works",
      detail: "She can send emails from the same Outlook profile with no problem." },
    { id: "ev-webmail-works", category: "conversation", isKey: true, label: "Webmail is fully up to date",
      detail: "Her phone's webmail shows every new email — the mailbox on the server side is completely fine." },
    { id: "ev-outlook-sluggish", category: "conversation", label: "Outlook has felt sluggish lately",
      detail: "She mentions Outlook has felt noticeably slow for the past few days." },
  ],
  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    { id: "q-send", prompt: "Can you send emails, just not receive them?",
      response: "\"Yes, sending works completely fine.\"", revealsEvidence: ["ev-send-works"], isKeyQuestion: true },
    { id: "q-webmail", prompt: "Does your phone or webmail show the new emails?",
      response: "\"Yes, my phone shows everything up to date.\"", revealsEvidence: ["ev-webmail-works"], isKeyQuestion: true },
    { id: "q-sluggish", prompt: "Has Outlook felt slow or laggy lately?",
      response: "\"Now that you mention it, yes — really sluggish the past few days.\"", revealsEvidence: ["ev-outlook-sluggish"] },
  ],

  keyConcepts: [
    "Using a second client (webmail/phone) to confirm the server-side mailbox is fine",
    "Recognizing that 'can send but not receive' usually isn't a network or account problem",
    "Reading abnormal memory usage as a sign of a corrupted local cache, not a server fault",
  ],

  diagnosisOptions: [
    { id: "diag-ost-corrupt", isCorrect: true,
      label: "Outlook's local cached data file is corrupted or stuck, so new mail isn't syncing down even though the mailbox is fine",
      explanation: "Correct. Webmail proves the server-side mailbox is completely current, sending still works, and Outlook is using abnormal memory — all pointing at a stuck local cache rather than anything server-side." },
    { id: "diag-server-down", isCorrect: false, label: "The mail server is down",
      explanation: "Webmail shows every new email up to date, and the mail server responds fine to a direct ping — it's not down." },
    { id: "diag-network", isCorrect: false, label: "Her network connection is down",
      explanation: "She can send mail and reach the mail server fine over the same connection — this isn't a connectivity problem." },
    { id: "diag-account-disabled", isCorrect: false, label: "Her account was disabled",
      explanation: "She can log into webmail and send mail without issue — the account is clearly active." },
  ],

  resolutionOptions: [
    { id: "res-rebuild-ost", isCorrect: true, label: "Rebuild Outlook's local cached data file so it re-syncs cleanly from the server",
      explanation: "This clears out the corrupted local cache causing the stuck sync, letting Outlook pull a fresh, complete copy from the already-healthy mailbox." },
    { id: "res-reset-mailbox", isCorrect: false, label: "Reset her mailbox on the mail server",
      explanation: "The server-side mailbox is already confirmed completely fine via webmail — resetting it is unnecessary and risks real data loss." },
    { id: "res-reinstall-windows", isCorrect: false, label: "Reinstall Windows",
      explanation: "This is a local Outlook data file issue, not a Windows-wide problem — reinstalling the OS is a massive overreaction." },
    { id: "res-new-email", isCorrect: false, label: "Give her a brand new email address",
      explanation: "This doesn't fix a local sync issue and would cause much bigger problems, like losing her mail history and contacts." },
  ],

  verification: { prompt: "Confirm Outlook is back to normal resource usage after the rebuild.", expectedOutputId: "out-tasklist-post",
    successMessage: "Outlook's memory usage is back to normal — the rebuilt cache should sync new mail normally going forward." },

  scoring: { investigationMax: 20, evidenceMax: 15, diagnosisMax: 25, resolutionMax: 20, verificationMax: 10, efficiencyMax: 10, hintPenalty: 5, freeActionAllowance: 3 },
  hints: [
    { id: "hint-1", cost: 5, text: "Check whether her phone or webmail shows the new emails — that tells you if the server side is fine." },
    { id: "hint-2", cost: 5, text: "Check how much memory Outlook itself is using right now." },
  ],
  skills: ["general-it", "email", "troubleshooting-methodology"],
  tags: ["intermediate", "outlook", "email"],
  estimatedMinutes: 9,
};
