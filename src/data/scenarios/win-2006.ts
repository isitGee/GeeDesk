import type { Scenario } from "../../types/scenario";

export const win2006: Scenario = {
  id: "win-2006",
  ticketNumber: "WIN-2006",
  title: "Random blue screens when docking or waking up",
  category: "Windows",
  difficulty: "advanced",
  user: { name: "Felix Adeyemi", role: "Software Engineer", department: "Engineering" },
  ticketDescription: "My laptop blue-screens randomly a few times a day, almost always when I plug in my second monitor or wake it up from sleep.",
  symptoms: [
    "Blue screens correlate with docking or waking from sleep",
    "Got a new docking station about two weeks ago",
    "A coworker with the same new dock model mentioned something similar",
  ],
  hiddenFault: "An outdated graphics driver is incompatible with the new docking station's display hardware, causing a crash whenever the display configuration changes (docking, undocking, or waking with an external monitor attached).",
  availableCommands: ["driverquery", "systeminfo", "tasklist"],

  terminalOutputs: [
    { id: "out-driverquery-pre", command: "driverquery", match: ["driverquery"], phase: "pre", isKeyCommand: true, revealsEvidence: ["ev-driver-outdated"],
      output: ["Module Name  Display Name              Driver Type   Link Date", "igfx         Intel Graphics Driver     Kernel        Over a year before this dock model shipped", "nvlddmkm     NVIDIA Graphics Driver    Kernel        Current"] },
    { id: "out-driverquery-post", command: "driverquery", match: ["driverquery"], phase: "post",
      output: ["Module Name  Display Name              Driver Type   Link Date", "igfx         Intel Graphics Driver     Kernel        Current, certified for this dock", "nvlddmkm     NVIDIA Graphics Driver    Kernel        Current"] },
    { id: "out-systeminfo", command: "systeminfo", match: ["systeminfo"], revealsEvidence: ["ev-recent-reboot"],
      output: ["Host Name:         FADEYEMI-LAPTOP", "OS Name:           Microsoft Windows 11 Pro", "System Boot Time:  Today, 9:14 AM"] },
    { id: "out-tasklist", command: "tasklist", match: ["tasklist"], output: ["Image Name                     PID   Mem Usage", "dwm.exe                        1180    198,204 K", "code.exe                       3390  1,240,880 K"] },
  ],

  evidence: [
    { id: "ev-ticket-summary", category: "user-report", label: "Ticket summary", detail: "Felix's laptop blue-screens repeatedly, almost always tied to docking or waking with an external monitor." },
    { id: "ev-driver-outdated", category: "system", isKey: true, label: "Graphics driver predates the new dock",
      detail: "His graphics driver is significantly older than the release of his new docking station model — a known compatibility gap." },
    { id: "ev-recent-reboot", category: "system", label: "Short uptime from repeated crash-reboots",
      detail: "The system's boot time is very recent, consistent with a crash-and-restart cycle happening throughout the day." },
    { id: "ev-trigger-pattern", category: "conversation", isKey: true, label: "Crashes tied to display changes",
      detail: "Crashes happen almost exclusively when plugging in the second monitor or waking from sleep with it attached." },
    { id: "ev-new-dock", category: "conversation", isKey: true, label: "New dock two weeks ago",
      detail: "He got a new docking station model about two weeks ago, right before the crashes began." },
    { id: "ev-others-similar-dock", category: "conversation", isKey: true, label: "Coworker with the same dock has similar issues",
      detail: "A coworker who also has the new dock model has mentioned something similar happening to them." },
  ],
  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    { id: "q-pattern", prompt: "Does this happen at a specific time, like waking up or docking?",
      response: "\"Yeah, almost always right when I plug in my second monitor or wake it up from sleep.\"", revealsEvidence: ["ev-trigger-pattern"], isKeyQuestion: true },
    { id: "q-new-dock", prompt: "Did you recently get a new docking station or monitor setup?",
      response: "\"Yes, I got a new docking station about two weeks ago, right before this started.\"", revealsEvidence: ["ev-new-dock"], isKeyQuestion: true },
    { id: "q-others", prompt: "Have any coworkers with a similar setup had this issue?",
      response: "\"Actually, one other person with the same new dock mentioned something similar.\"", revealsEvidence: ["ev-others-similar-dock"], isKeyQuestion: true },
  ],

  keyConcepts: [
    "Correlating crash timing with a specific trigger (display topology changes) rather than assuming random hardware failure",
    "Using driverquery to spot a driver that predates newly added hardware",
    "Using a second affected user to confirm a compatibility pattern, not a one-off defect",
  ],

  diagnosisOptions: [
    { id: "diag-driver-conflict", isCorrect: true,
      label: "An outdated graphics driver is conflicting with the new docking station, crashing on display configuration changes",
      explanation: "Correct. The crashes are tightly correlated with docking/waking events, the graphics driver predates the new dock, and another user with the same dock has similar symptoms." },
    { id: "diag-ram", isCorrect: false, label: "The laptop's RAM is failing",
      explanation: "Failing RAM usually causes crashes at fairly random and unpredictable times, not consistently tied to a specific display event." },
    { id: "diag-dock-defective", isCorrect: false, label: "This specific docking station unit is defective",
      explanation: "A coworker with the same dock model has similar issues — this points to a compatibility problem with the model, not one broken unit." },
    { id: "diag-reinstall-os", isCorrect: false, label: "Windows itself needs to be reinstalled",
      explanation: "A full reinstall is far more disruptive than needed when a single outdated driver already explains the exact trigger pattern." },
  ],

  resolutionOptions: [
    { id: "res-update-driver", isCorrect: true, label: "Update the graphics driver to the version certified for this docking station",
      explanation: "This directly resolves the compatibility gap that's crashing the system whenever the display configuration changes." },
    { id: "res-replace-ram", isCorrect: false, label: "Replace the laptop's RAM",
      explanation: "There's no RAM-specific evidence here — the crash pattern points squarely at the display driver, not memory." },
    { id: "res-new-dock", isCorrect: false, label: "Buy a different docking station model for every affected user",
      explanation: "This is a far more expensive and disruptive fix than simply updating a driver, and doesn't address the root incompatibility for anyone still on the old driver." },
    { id: "res-reinstall-windows", isCorrect: false, label: "Reinstall Windows entirely",
      explanation: "This is disproportionate compared to updating the one outdated component actually causing the crashes." },
  ],

  verification: { prompt: "Confirm the graphics driver is now current and certified for this dock.", expectedOutputId: "out-driverquery-post",
    successMessage: "The graphics driver now shows as current and certified for this dock model — docking and waking should no longer trigger a crash." },

  scoring: { investigationMax: 20, evidenceMax: 15, diagnosisMax: 25, resolutionMax: 20, verificationMax: 10, efficiencyMax: 10, hintPenalty: 6, freeActionAllowance: 3 },
  hints: [
    { id: "hint-1", cost: 6, text: "Try: driverquery — check whether the graphics driver looks current for his hardware." },
    { id: "hint-2", cost: 6, text: "Ask exactly when the crashes happen — is there a pattern, or does it seem random?" },
  ],
  skills: ["windows", "drivers", "hardware", "troubleshooting-methodology"],
  tags: ["advanced", "drivers", "bsod"],
  estimatedMinutes: 13,
};
