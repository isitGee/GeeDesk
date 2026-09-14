import type { Scenario } from "../../types/scenario";

export const hw3001: Scenario = {
  id: "hw-3001",
  ticketNumber: "HW-3001",
  title: "Monitor shows no signal, but the PC seems on",
  category: "Hardware",
  difficulty: "beginner",
  user: { name: "Wendy Park", role: "Executive Assistant", department: "Executive Office" },
  ticketDescription: "My monitor shows 'No Signal' but the computer seems to be on — I can hear the fans and see lights on the tower.",
  symptoms: [
    "Monitor's power light is on, but it shows \"No Signal\"",
    "PC fans are running and lights are on",
    "She was cleaning around her desk this morning and may have bumped some cables",
  ],
  hiddenFault: "A cable came loose (or the monitor's input source got switched) while she was cleaning around her desk, so the monitor isn't receiving a signal from the dock — even though the PC itself is fully powered on and running normally.",
  availableCommands: ["systeminfo", "tasklist"],

  terminalOutputs: [
    { id: "out-systeminfo-pre", command: "systeminfo", match: ["systeminfo"], phase: "pre", isKeyCommand: true, revealsEvidence: ["ev-os-running"],
      output: ["Host Name:          WPARK-DESKTOP-02", "OS Name:            Microsoft Windows 11 Enterprise", "System Boot Time:   Today, 8:02 AM", "Attached Display:   None detected (no signal)"] },
    { id: "out-systeminfo-post", command: "systeminfo", match: ["systeminfo"], phase: "post",
      output: ["Host Name:          WPARK-DESKTOP-02", "OS Name:            Microsoft Windows 11 Enterprise", "System Boot Time:   Today, 8:02 AM", "Attached Display:   1920x1080 @ 60Hz - Connected"] },
    { id: "out-tasklist", command: "tasklist", match: ["tasklist"], revealsEvidence: ["ev-desktop-loaded"],
      output: ["Image Name                     PID   Session Name", "explorer.exe                   2104  Console", "outlook.exe                    3390  Console"] },
  ],

  evidence: [
    { id: "ev-ticket-summary", category: "user-report", label: "Ticket summary", detail: "Wendy's monitor shows no signal even though the tower appears powered on." },
    { id: "ev-os-running", category: "system", isKey: true, label: "The OS itself is fully running",
      detail: "A remote check shows the machine booted normally this morning and is running — it isn't powered off or crashed." },
    { id: "ev-desktop-loaded", category: "system", label: "Desktop session is active",
      detail: "Her normal desktop applications are running in an active session, confirming she's actually logged in." },
    { id: "ev-monitor-no-signal", category: "user-report", isKey: true, label: "Monitor's own light is on",
      detail: "The monitor's power indicator is lit, but it displays \"No Signal\" — the monitor itself has power." },
    { id: "ev-cables-bumped", category: "conversation", isKey: true, label: "Cables may have been bumped",
      detail: "She was cleaning around her desk this morning and may have knocked some cables loose." },
  ],
  defaultEvidenceIds: ["ev-ticket-summary", "ev-monitor-no-signal"],

  conversationQuestions: [
    { id: "q-monitor-light", prompt: "Do you see any lights or hear anything from the monitor itself?",
      response: "\"The monitor's power light is on, it just says 'No Signal'.\"", revealsEvidence: [] },
    { id: "q-bumped", prompt: "Did anything get bumped or moved on your desk recently?",
      response: "\"I was cleaning around my desk this morning — I might have knocked a cable loose.\"", revealsEvidence: ["ev-cables-bumped"], isKeyQuestion: true },
    { id: "q-dock-setup", prompt: "Is the monitor plugged into the docking station or directly into the computer?",
      response: "\"Into the dock, like always.\"", revealsEvidence: [] },
  ],

  keyConcepts: [
    "Confirming the OS itself is running remotely before assuming the whole PC is off",
    "Distinguishing a display/cable problem from a powered-off or crashed machine",
    "Connecting a recent physical disturbance (cleaning, bumped cables) to a sudden signal loss",
  ],

  diagnosisOptions: [
    { id: "diag-cable", isCorrect: true,
      label: "A cable came loose or the input source got switched while she was cleaning, so the monitor isn't getting a signal",
      explanation: "Correct. The PC is confirmed fully running and logged in remotely — only the display path is broken, right after cables were disturbed while cleaning." },
    { id: "diag-off", isCorrect: false, label: "The computer is powered off",
      explanation: "A remote check shows the machine booted this morning and is actively running a logged-in session." },
    { id: "diag-gpu", isCorrect: false, label: "The graphics card has failed",
      explanation: "A failed graphics card is possible in general, but a simple, very recently disturbed cable is a far more likely and simpler explanation here, and hasn't been ruled in or out yet." },
    { id: "diag-crashed", isCorrect: false, label: "Windows has crashed",
      explanation: "The remote checks show Windows running normally with an active desktop session — it hasn't crashed." },
  ],

  resolutionOptions: [
    { id: "res-reseat-cable", isCorrect: true, label: "Check and reseat the monitor cable, and confirm the correct input source is selected",
      explanation: "This directly addresses the most likely cause — a cable or input source disturbed while cleaning — without any unnecessary hardware replacement." },
    { id: "res-replace-monitor", isCorrect: false, label: "Replace the monitor",
      explanation: "There's no evidence the monitor itself is faulty — it has power and simply isn't receiving a signal, most likely from a loose cable." },
    { id: "res-replace-gpu", isCorrect: false, label: "Replace the graphics card",
      explanation: "This is a costly step with no supporting evidence yet — a simple cable check should be tried first." },
    { id: "res-reinstall-windows", isCorrect: false, label: "Reinstall Windows",
      explanation: "Windows is already confirmed running fine — this is purely a physical display connection issue." },
  ],

  verification: { prompt: "Confirm the display is now detected.", expectedOutputId: "out-systeminfo-post",
    successMessage: "A display is now detected at a normal resolution — the cable/input issue is resolved." },

  scoring: { investigationMax: 20, evidenceMax: 15, diagnosisMax: 25, resolutionMax: 20, verificationMax: 10, efficiencyMax: 10, hintPenalty: 4, freeActionAllowance: 3 },
  hints: [
    { id: "hint-1", cost: 4, text: "Check remotely whether the OS itself is actually running before assuming the whole PC is off." },
    { id: "hint-2", cost: 4, text: "Ask whether anything near the desk was recently bumped or moved." },
  ],
  skills: ["hardware", "displays", "troubleshooting-methodology"],
  tags: ["beginner", "display", "cabling"],
  estimatedMinutes: 6,
};
