import type { Scenario } from "../../types/scenario";

export const hw3003: Scenario = {
  id: "hw-3003",
  ticketNumber: "HW-3003",
  title: "Workstation randomly powers off during renders",
  category: "Hardware",
  difficulty: "intermediate",
  user: { name: "Carlos Medina", role: "Video Editor", department: "Creative" },
  ticketDescription: "My workstation randomly shuts off completely, especially when I'm exporting or rendering video. No warning, no blue screen — it just powers off.",
  symptoms: [
    "Complete, sudden power-off with no blue screen",
    "Happens almost exclusively during heavy rendering/exports",
    "Fans get very loud right before it happens",
  ],
  hiddenFault: "Two years of dust buildup has clogged the fans and heatsinks, so under the sustained heavy load of video rendering, the CPU overheats and the system's thermal protection forces a hard shutdown.",
  availableCommands: ["systeminfo", "tasklist"],

  terminalOutputs: [
    { id: "out-systeminfo-pre", command: "systeminfo", match: ["systeminfo"], phase: "pre", isKeyCommand: true, revealsEvidence: ["ev-thermal-shutdown"],
      output: ["Host Name:            CMEDINA-WORKSTATION", "OS Name:              Microsoft Windows 11 Pro", "System Boot Time:     Today, 2:15 PM", "Last Shutdown Cause:  Thermal protection triggered (CPU exceeded safe temperature threshold)"] },
    { id: "out-systeminfo-post", command: "systeminfo", match: ["systeminfo"], phase: "post",
      output: ["Host Name:            CMEDINA-WORKSTATION", "OS Name:              Microsoft Windows 11 Pro", "System Boot Time:     3 days ago", "Last Shutdown Cause:  Normal user-initiated shutdown"] },
    { id: "out-tasklist", command: "tasklist", match: ["tasklist"], output: ["Image Name                     PID   Mem Usage", "AfterEffects.exe               5521  4,412,880 K", "MediaEncoder.exe               2290  2,288,204 K"] },
  ],

  evidence: [
    { id: "ev-ticket-summary", category: "user-report", label: "Ticket summary", detail: "Carlos's workstation powers off completely during heavy video rendering." },
    { id: "ev-thermal-shutdown", category: "system", isKey: true, label: "Logged as a thermal shutdown",
      detail: "The system's own shutdown log names thermal protection — the CPU exceeded its safe temperature threshold." },
    { id: "ev-load-correlation", category: "conversation", isKey: true, label: "Tied to heavy rendering",
      detail: "It happens almost exclusively while exporting or rendering large video projects." },
    { id: "ev-never-cleaned", category: "conversation", isKey: true, label: "Never physically cleaned",
      detail: "The workstation hasn't been opened or cleaned since he got it two years ago." },
    { id: "ev-fans-loud", category: "conversation", label: "Fans get loud beforehand",
      detail: "The fans ramp up noticeably loud right before it shuts off." },
  ],
  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    { id: "q-task-correlation", prompt: "Does this happen more during certain tasks?",
      response: "\"Yeah, almost always when I'm exporting or rendering a big project.\"", revealsEvidence: ["ev-load-correlation"], isKeyQuestion: true },
    { id: "q-cleaning-history", prompt: "When was this machine last cleaned or serviced?",
      response: "\"Honestly, I don't think it's ever been opened up since I got it two years ago.\"", revealsEvidence: ["ev-never-cleaned"], isKeyQuestion: true },
    { id: "q-fan-noise", prompt: "Do the fans get loud right before it shuts off?",
      response: "\"Yes, actually — they get really loud right before it happens.\"", revealsEvidence: ["ev-fans-loud"] },
  ],

  keyConcepts: [
    "Reading a logged shutdown cause instead of guessing between power/RAM/malware",
    "Connecting sustained heavy load to a thermal (not electrical) failure mode",
    "Recognizing multi-year, never-serviced hardware as a dust/cooling risk",
  ],

  diagnosisOptions: [
    { id: "diag-overheat", isCorrect: true,
      label: "The workstation is overheating under heavy load, most likely from dust-clogged fans/heatsinks, and shutting down via thermal protection",
      explanation: "Correct. The system explicitly logs a thermal shutdown, it's tightly correlated with sustained rendering load, fans get loud right beforehand, and the machine has never been cleaned in two years." },
    { id: "diag-psu", isCorrect: false, label: "The power supply is failing",
      explanation: "The system's own log names thermal protection specifically as the shutdown cause, not a power delivery fault." },
    { id: "diag-ram", isCorrect: false, label: "RAM is failing",
      explanation: "RAM failures typically cause crashes, reboots, or blue screens with varying errors — not a clean full power-off tied specifically to sustained heavy load with loud fans beforehand." },
    { id: "diag-malware", isCorrect: false, label: "Malware is overloading the CPU",
      explanation: "A mundane, two-years-uncleaned cooling system explains every symptom here — there's no other evidence pointing at malware." },
  ],

  resolutionOptions: [
    { id: "res-clean-cooling", isCorrect: true, label: "Clean the dust from the fans and heatsinks (or have it professionally serviced) to restore proper cooling",
      explanation: "This addresses the actual cause — restricted airflow — allowing the system to stay within safe temperatures under heavy load." },
    { id: "res-replace-psu", isCorrect: false, label: "Replace the power supply",
      explanation: "The logged cause is thermal, not electrical — replacing the power supply won't fix a cooling/dust problem." },
    { id: "res-replace-ram", isCorrect: false, label: "Replace the RAM",
      explanation: "Nothing here points to a memory fault — the shutdown log and symptom pattern both point at heat." },
    { id: "res-reinstall-os", isCorrect: false, label: "Reinstall Windows",
      explanation: "This is a physical cooling issue — reinstalling the OS has no effect on dust-clogged fans." },
  ],

  verification: { prompt: "Confirm the system is now shutting down normally, not from thermal protection.", expectedOutputId: "out-systeminfo-post",
    successMessage: "The shutdown log now shows a normal user shutdown with several stable days of uptime — cooling is restored." },

  scoring: { investigationMax: 20, evidenceMax: 15, diagnosisMax: 25, resolutionMax: 20, verificationMax: 10, efficiencyMax: 10, hintPenalty: 5, freeActionAllowance: 3 },
  hints: [
    { id: "hint-1", cost: 5, text: "Check what the system itself logged as the cause of the last shutdown." },
    { id: "hint-2", cost: 5, text: "Ask whether this happens more during any particular kind of task." },
  ],
  skills: ["hardware", "cooling", "troubleshooting-methodology"],
  tags: ["intermediate", "overheating", "maintenance"],
  estimatedMinutes: 9,
};
