import type { Scenario } from "../../types/scenario";

export const hw3002: Scenario = {
  id: "hw-3002",
  ticketNumber: "HW-3002",
  title: "Laptop battery keeps draining even while plugged in",
  category: "Hardware",
  difficulty: "beginner",
  user: { name: "Omar Siddiqui", role: "Account Manager", department: "Sales" },
  ticketDescription: "My laptop battery keeps draining even though it's plugged in, and the charging icon flickers on and off.",
  symptoms: [
    "Battery percentage keeps dropping despite being plugged in",
    "Charging icon flickers on and off",
    "He misplaced his usual charger and borrowed a coworker's last week",
  ],
  hiddenFault: "He's using a borrowed 45W charger instead of the required 65W charger for this laptop. That's not enough power to both run the laptop under a full docked workload and charge the battery at the same time.",
  availableCommands: ["powercfg", "systeminfo"],

  terminalOutputs: [
    { id: "out-powercfg-pre", command: "powercfg", match: ["powercfg /batteryreport", "powercfg"], phase: "pre", isKeyCommand: true, revealsEvidence: ["ev-low-wattage"],
      output: ["Battery report saved.", "", "AC Adapter connected:  Yes", "AC Adapter rating:     45 W", "Charge rate under load: Insufficient -- net discharge while docked"] },
    { id: "out-powercfg-post", command: "powercfg", match: ["powercfg /batteryreport", "powercfg"], phase: "post",
      output: ["Battery report saved.", "", "AC Adapter connected:  Yes", "AC Adapter rating:     65 W", "Charge rate under load: Positive -- battery charging normally"] },
    { id: "out-systeminfo", command: "systeminfo", match: ["systeminfo"], output: ["Host Name:  OSIDDIQUI-LAPTOP", "OS Name:    Microsoft Windows 11 Pro"] },
  ],

  evidence: [
    { id: "ev-ticket-summary", category: "user-report", label: "Ticket summary", detail: "Omar's battery drains even while plugged in, with a flickering charge icon." },
    { id: "ev-low-wattage", category: "system", isKey: true, label: "Charger is underpowered",
      detail: "The connected AC adapter is only rated for 45W, and the battery report shows a net discharge under his usual docked workload." },
    { id: "ev-wrong-charger", category: "conversation", isKey: true, label: "Using a borrowed charger",
      detail: "He misplaced his own charger last week and has been using a coworker's smaller one since." },
    { id: "ev-charges-when-idle", category: "conversation", isKey: true, label: "Charges fine when idle",
      detail: "It seems to charge normally overnight when the dock and monitors aren't attached and drawing extra power." },
    { id: "ev-cable-intact", category: "conversation", label: "Cable looks physically fine",
      detail: "The charging cable itself shows no visible damage or fraying." },
  ],
  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    { id: "q-charger-origin", prompt: "Is this the charger IT originally gave you?",
      response: "\"Actually no — I misplaced mine last week and borrowed one from a coworker.\"", revealsEvidence: ["ev-wrong-charger"], isKeyQuestion: true },
    { id: "q-idle-charge", prompt: "Does it charge fine when you're not using the dock and monitors?",
      response: "\"Now that you mention it, yeah — it seems to charge okay overnight when everything else is unplugged.\"", revealsEvidence: ["ev-charges-when-idle"], isKeyQuestion: true },
    { id: "q-cable-damage", prompt: "Does the charging cable look damaged or frayed at all?",
      response: "\"No, it looks totally fine.\"", revealsEvidence: ["ev-cable-intact"] },
  ],

  keyConcepts: [
    "Reading a battery/power report instead of guessing at hardware failure",
    "Recognizing that charging under light load but not heavy load points at insufficient wattage, not a dead battery",
    "Connecting a borrowed/mismatched charger to a wattage-related symptom",
  ],

  diagnosisOptions: [
    { id: "diag-underpowered-charger", isCorrect: true,
      label: "He's using an underpowered 45W charger instead of the required 65W one, so the battery can't keep up under his usual docked workload",
      explanation: "Correct. The battery report shows a 45W adapter with a net discharge under load, it charges fine when idle with lighter draw, and he's confirmed using a borrowed, smaller charger." },
    { id: "diag-battery-failed", isCorrect: false, label: "The battery itself has failed and needs replacing",
      explanation: "It charges normally overnight under light load — a genuinely failed battery wouldn't charge properly under any condition." },
    { id: "diag-cable-damaged", isCorrect: false, label: "The charging cable is damaged",
      explanation: "The cable was checked and shows no visible damage — and the battery report points specifically at wattage, not cable continuity." },
    { id: "diag-port-broken", isCorrect: false, label: "The laptop's charging port is broken",
      explanation: "Charging clearly works under lighter load overnight — a broken port wouldn't allow that at all." },
  ],

  resolutionOptions: [
    { id: "res-correct-charger", isCorrect: true, label: "Get him his original 65W charger back, or issue a proper replacement",
      explanation: "This restores enough power delivery to run his full docked setup and charge the battery at the same time." },
    { id: "res-replace-battery", isCorrect: false, label: "Replace the battery",
      explanation: "The battery itself isn't the problem — it charges fine under lighter load. Replacing it won't fix an underpowered charger." },
    { id: "res-replace-laptop", isCorrect: false, label: "Replace the entire laptop",
      explanation: "This is a simple charger mismatch, not a hardware failure — replacing the whole laptop is unnecessary." },
    { id: "res-no-dock", isCorrect: false, label: "Have him permanently stop using the dock and monitors",
      explanation: "That avoids the symptom rather than fixing it, and isn't practical for his day-to-day work." },
  ],

  verification: { prompt: "Confirm the correct charger restores normal charging under load.", expectedOutputId: "out-powercfg-post",
    successMessage: "The adapter now reports 65W with a positive charge rate under load — his battery will charge normally even fully docked." },

  scoring: { investigationMax: 20, evidenceMax: 15, diagnosisMax: 25, resolutionMax: 20, verificationMax: 10, efficiencyMax: 10, hintPenalty: 4, freeActionAllowance: 3 },
  hints: [
    { id: "hint-1", cost: 4, text: "Try: powercfg /batteryreport — check the connected adapter's actual wattage." },
    { id: "hint-2", cost: 4, text: "Ask whether this is his usual charger or a different one." },
  ],
  skills: ["hardware", "power", "troubleshooting-methodology"],
  tags: ["beginner", "battery", "laptop"],
  estimatedMinutes: 6,
};
