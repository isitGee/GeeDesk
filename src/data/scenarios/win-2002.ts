import type { Scenario } from "../../types/scenario";

export const win2002: Scenario = {
  id: "win-2002",
  ticketNumber: "WIN-2002",
  title: "Print jobs never come out",
  category: "Windows",
  difficulty: "beginner",
  user: { name: "Oliver Wright", role: "Legal Assistant", department: "Legal" },
  ticketDescription: "I can't print anything — my jobs just sit there and never come out. The printer's on, and my coworkers are printing to it just fine.",
  symptoms: [
    "Print jobs stay queued and never print",
    "Coworkers printing to the same printer have no issue",
    "His PC forced a restart for updates this morning",
  ],
  hiddenFault: "The Print Spooler service on Oliver's own PC has stopped running, so his print jobs never actually get sent to the printer — even though the printer itself and the network are fine.",
  availableCommands: ["sc", "tasklist"],

  terminalOutputs: [
    { id: "out-sc-pre", command: "sc", match: ["sc query spooler"], phase: "pre", isKeyCommand: true, revealsEvidence: ["ev-spooler-stopped"],
      output: ["SERVICE_NAME: spooler", "        TYPE               : 110  WIN32_SHARE_PROCESS", "        STATE              : 1  STOPPED", "        WIN32_EXIT_CODE   : 1077  (0x435)"] },
    { id: "out-sc-post", command: "sc", match: ["sc query spooler"], phase: "post",
      output: ["SERVICE_NAME: spooler", "        TYPE               : 110  WIN32_SHARE_PROCESS", "        STATE              : 4  RUNNING", "        WIN32_EXIT_CODE   : 0  (0x0)"] },
    { id: "out-tasklist-pre", command: "tasklist", match: ["tasklist"], phase: "pre", revealsEvidence: ["ev-no-spoolsv"],
      output: ["Image Name                     PID   Session Name", "========================= ========  ============", "explorer.exe                   2104  Console", "chrome.exe                     3390  Console", "(spoolsv.exe is not running)"] },
    { id: "out-tasklist-post", command: "tasklist", match: ["tasklist"], phase: "post",
      output: ["Image Name                     PID   Session Name", "========================= ========  ============", "explorer.exe                   2104  Console", "spoolsv.exe                    4410  Services"] },
  ],

  evidence: [
    { id: "ev-ticket-summary", category: "user-report", label: "Ticket summary", detail: "Oliver's print jobs never complete, but coworkers print to the same printer fine." },
    { id: "ev-spooler-stopped", category: "system", isKey: true, label: "Print Spooler service is stopped",
      detail: "The Print Spooler service on his own PC is stopped, not running." },
    { id: "ev-no-spoolsv", category: "system", label: "No spoolsv.exe process running",
      detail: "There's no spooler process active in the task list, matching the stopped service." },
    { id: "ev-coworkers-fine", category: "conversation", isKey: true, label: "Coworkers unaffected",
      detail: "Other people printing to the exact same printer have no trouble at all." },
    { id: "ev-recent-update", category: "conversation", isKey: true, label: "Forced update restart this morning",
      detail: "His PC forced a restart for Windows updates this morning, right before the problem started." },
    { id: "ev-stuck-queue", category: "conversation", label: "Jobs stuck in the queue",
      detail: "He has about 4 jobs sitting in his print queue saying \"Printing\" but never finishing." },
  ],
  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    { id: "q-coworkers", prompt: "Are your coworkers able to print to the same printer right now?",
      response: "\"Yeah, they're printing to it just fine.\"", revealsEvidence: ["ev-coworkers-fine"], isKeyQuestion: true },
    { id: "q-update", prompt: "Did this start after any recent restart or update?",
      response: "\"Actually yes — my computer forced a restart for updates this morning.\"", revealsEvidence: ["ev-recent-update"], isKeyQuestion: true },
    { id: "q-queue", prompt: "Do you see any jobs stuck in your print queue?",
      response: "\"Yeah, there's like 4 jobs just sitting there saying 'Printing'.\"", revealsEvidence: ["ev-stuck-queue"] },
  ],

  keyConcepts: [
    "Isolating a printing problem to one PC's local service, not the printer or network, using an unaffected coworker",
    "Reading a Windows service state (STOPPED vs RUNNING) as the direct cause",
    "Connecting an update-triggered restart to a service failing to restart properly",
  ],

  diagnosisOptions: [
    { id: "diag-spooler", isCorrect: true, label: "The Print Spooler service on his own PC has stopped, so jobs never reach the printer",
      explanation: "Correct. The service explicitly shows STOPPED, there's no spooler process running, and coworkers using the same printer are unaffected — this is local to his machine." },
    { id: "diag-printer-offline", isCorrect: false, label: "The printer itself is out of paper or offline",
      explanation: "Coworkers are printing to the exact same printer with no problem at the same time." },
    { id: "diag-cable", isCorrect: false, label: "His network cable is unplugged",
      explanation: "This is a local Windows service problem, not a connectivity issue — and nothing else suggests he's lost network access generally." },
    { id: "diag-driver", isCorrect: false, label: "His printer driver is corrupted",
      explanation: "A corrupted driver usually produces an error on the job itself; here the underlying spooler service that manages all print jobs isn't even running." },
  ],

  resolutionOptions: [
    { id: "res-restart-spooler", isCorrect: true, label: "Restart the Print Spooler service",
      explanation: "This brings the service that manages and sends print jobs back online, letting his queued (and future) jobs actually reach the printer." },
    { id: "res-reinstall-printer", isCorrect: false, label: "Reinstall the printer on his PC",
      explanation: "The printer and its driver aren't the problem — the local service responsible for dispatching jobs isn't running at all." },
    { id: "res-toner", isCorrect: false, label: "Replace the printer's toner",
      explanation: "Coworkers are printing successfully on the same toner right now — this isn't a hardware consumable issue." },
    { id: "res-power-cycle-printer", isCorrect: false, label: "Power cycle the printer",
      explanation: "The printer itself is working fine for everyone else — the problem is entirely on Oliver's PC." },
  ],

  verification: { prompt: "Confirm the Print Spooler service is running again.", expectedOutputId: "out-sc-post",
    successMessage: "The Print Spooler now shows RUNNING — his queued jobs should print and new ones will go through normally." },

  scoring: { investigationMax: 20, evidenceMax: 15, diagnosisMax: 25, resolutionMax: 20, verificationMax: 10, efficiencyMax: 10, hintPenalty: 4, freeActionAllowance: 3 },
  hints: [
    { id: "hint-1", cost: 4, text: "Try: sc query spooler — check whether the Print Spooler service is actually running." },
    { id: "hint-2", cost: 4, text: "Ask whether coworkers can print to the exact same printer right now." },
  ],
  skills: ["windows", "services", "troubleshooting-methodology"],
  tags: ["beginner", "printing", "services"],
  estimatedMinutes: 6,
};
