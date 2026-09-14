import type { Scenario } from "../../types/scenario";

export const hw3004: Scenario = {
  id: "hw-3004",
  ticketNumber: "HW-3004",
  title: "Random blue screens with different errors each time",
  category: "Hardware",
  difficulty: "advanced",
  user: { name: "Isabelle Fournier", role: "Research Scientist", department: "R&D" },
  ticketDescription: "My computer randomly blue-screens with different error messages — sometimes during normal use, sometimes overnight while running long computations.",
  symptoms: [
    "Blue screens with inconsistent, varying stop codes",
    "No clear pattern to when it happens",
    "Got extra RAM installed about a month ago",
  ],
  hiddenFault: "One of Isabelle's RAM modules — recently added a month ago — has developed a fault. Faulty RAM causes random, inconsistent memory errors that surface as blue screens with varying, seemingly unrelated stop codes.",
  availableCommands: ["systeminfo", "tasklist"],

  terminalOutputs: [
    { id: "out-systeminfo-pre", command: "systeminfo", match: ["systeminfo"], phase: "pre", isKeyCommand: true, revealsEvidence: ["ev-varying-codes", "ev-ram-installed"],
      output: ["Host Name:              IFOURNIER-WORKSTATION", "Total Physical Memory:  32,768 MB", "Recent Error Events:    Event ID 1001 (BugCheck) x6 in the last week", "                        Stop codes vary: 0x1E, 0x3B, 0xA0 (inconsistent)"] },
    { id: "out-systeminfo-post", command: "systeminfo", match: ["systeminfo"], phase: "post",
      output: ["Host Name:              IFOURNIER-WORKSTATION", "Total Physical Memory:  16,384 MB", "Recent Error Events:    None in the last 7 days"] },
    { id: "out-tasklist", command: "tasklist", match: ["tasklist"], output: ["Image Name                     PID   Mem Usage", "MATLAB.exe                     5521  8,412,880 K", "python.exe                     2290  1,988,204 K"] },
  ],

  evidence: [
    { id: "ev-ticket-summary", category: "user-report", label: "Ticket summary", detail: "Isabelle gets random blue screens with different error codes and no clear pattern." },
    { id: "ev-varying-codes", category: "system", isKey: true, label: "Multiple different stop codes logged",
      detail: "The system logged six crashes in a week with several different, seemingly unrelated stop codes." },
    { id: "ev-ram-installed", category: "system", label: "Confirms current RAM total",
      detail: "The system currently reports 32GB of installed memory." },
    { id: "ev-no-pattern", category: "conversation", isKey: true, label: "No consistent trigger",
      detail: "Crashes happen during normal use and during overnight computations alike — no clear common trigger." },
    { id: "ev-different-errors", category: "conversation", isKey: true, label: "Different error each time",
      detail: "She confirms the on-screen error message is different nearly every time it happens." },
    { id: "ev-recent-ram-upgrade", category: "conversation", isKey: true, label: "RAM upgraded a month ago",
      detail: "IT installed additional RAM for her about a month ago, right before the crashes started." },
  ],
  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    { id: "q-trigger", prompt: "Do the crashes happen doing anything in particular?",
      response: "\"Not really — sometimes while I'm working, sometimes overnight during long computations. No clear pattern.\"", revealsEvidence: ["ev-no-pattern"], isKeyQuestion: true },
    { id: "q-error-consistency", prompt: "Is it the same error message each time, or different ones?",
      response: "\"Actually, different every time, now that you mention it.\"", revealsEvidence: ["ev-different-errors"], isKeyQuestion: true },
    { id: "q-upgrade", prompt: "Did you get any hardware upgrades recently, like more memory?",
      response: "\"Yeah, actually — IT added extra RAM for me about a month ago for some bigger datasets.\"", revealsEvidence: ["ev-recent-ram-upgrade"], isKeyQuestion: true },
  ],

  keyConcepts: [
    "Recognizing that varying, inconsistent stop codes point at a hardware memory fault rather than a single software bug",
    "Distinguishing RAM faults from thermal shutdowns (which present as clean power-offs, not varied BSODs)",
    "Connecting a recent hardware change to a new, otherwise-unexplained failure pattern",
  ],

  diagnosisOptions: [
    { id: "diag-bad-ram", isCorrect: true,
      label: "One of her RAM modules — added a month ago — has developed a fault, causing random crashes with inconsistent codes",
      explanation: "Correct. Genuinely varying, unrelated stop codes with no usage pattern are the classic signature of a hardware memory fault, and it lines up with a RAM upgrade a month ago." },
    { id: "diag-driver", isCorrect: false, label: "A single buggy driver is causing the crashes",
      explanation: "A specific buggy driver usually produces the same or closely related stop code repeatedly — not a wide variety of unrelated ones." },
    { id: "diag-disk", isCorrect: false, label: "Her hard drive is failing",
      explanation: "Disk failures typically show up as slow or failed file access, or specific disk-related errors — not broadly inconsistent crash codes across unrelated activities." },
    { id: "diag-overheat", isCorrect: false, label: "Overheating is causing the crashes",
      explanation: "Overheating typically causes a clean shutdown or reboot, not varying blue-screen stop codes — and there's no mention of loud fans or heat correlation here." },
  ],

  resolutionOptions: [
    { id: "res-diagnose-replace-ram", isCorrect: true, label: "Run a memory diagnostic to identify the faulty RAM module and replace it",
      explanation: "This directly tests and isolates the hardware fault causing the inconsistent crashes, rather than guessing at software fixes." },
    { id: "res-reinstall-windows", isCorrect: false, label: "Reinstall Windows",
      explanation: "A reinstall doesn't test or fix a hardware memory fault — the same inconsistent crashes would return." },
    { id: "res-replace-disk", isCorrect: false, label: "Replace the hard drive",
      explanation: "Nothing points to a disk fault specifically — the crash pattern is consistent with memory, not storage." },
    { id: "res-update-drivers", isCorrect: false, label: "Update all device drivers",
      explanation: "This might coincidentally help some crash causes, but it doesn't test for or address a hardware memory fault." },
  ],

  verification: { prompt: "Confirm crashes have stopped after addressing the faulty RAM.", expectedOutputId: "out-systeminfo-post",
    successMessage: "No new crash events logged in the last week since the faulty module was replaced — the system is stable." },

  scoring: { investigationMax: 20, evidenceMax: 15, diagnosisMax: 25, resolutionMax: 20, verificationMax: 10, efficiencyMax: 10, hintPenalty: 6, freeActionAllowance: 3 },
  hints: [
    { id: "hint-1", cost: 6, text: "Check whether the crash error codes are the same each time, or genuinely different." },
    { id: "hint-2", cost: 6, text: "Ask about any recent hardware changes, especially anything involving memory." },
  ],
  skills: ["hardware", "memory", "troubleshooting-methodology"],
  tags: ["advanced", "ram", "bsod"],
  estimatedMinutes: 12,
};
