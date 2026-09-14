import type { Scenario } from "../../types/scenario";

export const win2005: Scenario = {
  id: "win-2005",
  ticketNumber: "WIN-2005",
  title: "Desktop reset itself, apps keep crashing",
  category: "Windows",
  difficulty: "intermediate",
  user: { name: "Renee Castillo", role: "Billing Specialist", department: "Finance" },
  ticketDescription: "Since this morning my desktop looks totally different — default background, no icons, and apps keep crashing or can't save their settings. I also saw a weird message about a 'temporary profile.'",
  symptoms: [
    "Windows displayed a \"logged on with a temporary profile\" banner",
    "Desktop background, icons, and saved settings are all missing",
    "Her laptop battery died completely overnight before she could log off properly",
  ],
  hiddenFault: "A power loss during her last logoff corrupted her Windows user profile. Windows is now loading a blank temporary profile instead of her real one, which is why nothing is saved and profile-dependent apps are failing.",
  availableCommands: ["chkdsk", "systeminfo"],

  terminalOutputs: [
    { id: "out-chkdsk-pre", command: "chkdsk", match: ["chkdsk c:", "chkdsk"], phase: "pre", isKeyCommand: true, revealsEvidence: ["ev-dirty-shutdown"],
      output: ["The type of the file system is NTFS.", "", "WARNING: This volume was not cleanly unmounted during the last session.", "Windows has scheduled a disk check for the next restart."] },
    { id: "out-chkdsk-post", command: "chkdsk", match: ["chkdsk c:", "chkdsk"], phase: "post",
      output: ["The type of the file system is NTFS.", "", "Windows has checked the file system and found no problems.", "No further action is needed."] },
    { id: "out-systeminfo", command: "systeminfo", match: ["systeminfo"], revealsEvidence: ["ev-recent-boot"],
      output: ["Host Name:         REN-LAPTOP-04", "OS Name:           Microsoft Windows 11 Enterprise", "System Boot Time:  Today, 6:42 AM"] },
  ],

  evidence: [
    { id: "ev-ticket-summary", category: "user-report", label: "Ticket summary", detail: "Renee's desktop reset to defaults and apps are crashing after seeing a 'temporary profile' banner." },
    { id: "ev-dirty-shutdown", category: "system", isKey: true, label: "Volume wasn't cleanly unmounted",
      detail: "A disk check warning shows the drive wasn't cleanly unmounted last session — consistent with an abrupt power loss." },
    { id: "ev-recent-boot", category: "system", label: "Recent unexpected boot",
      detail: "The system booted early this morning, matching the timeline of the power loss." },
    { id: "ev-temp-profile-banner", category: "conversation", isKey: true, label: "Saw the temporary profile banner",
      detail: "She confirms she saw a message about being logged on with a temporary profile." },
    { id: "ev-power-loss", category: "conversation", isKey: true, label: "Battery died before logging off",
      detail: "Her laptop battery died completely overnight before she could save her work and log off properly." },
  ],
  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    { id: "q-banner", prompt: "Did you notice any message about a 'temporary profile' when you logged in?",
      response: "\"Yes! It said something like that — I didn't think much of it at the time.\"", revealsEvidence: ["ev-temp-profile-banner"], isKeyQuestion: true },
    { id: "q-shutdown", prompt: "Did your computer shut down unexpectedly recently — a power outage or forced restart?",
      response: "\"Actually, my battery died completely last night before I could save and log off.\"", revealsEvidence: ["ev-power-loss"], isKeyQuestion: true },
    { id: "q-other-pcs", prompt: "Is this happening on just this laptop, or elsewhere too?", response: "\"Just this laptop.\"", revealsEvidence: [] },
  ],

  keyConcepts: [
    "Recognizing a 'temporary profile' banner as a specific, well-known Windows failure mode",
    "Connecting an abrupt power loss during logoff to profile corruption",
    "Distinguishing a corrupted profile from a settings change or malware",
  ],

  diagnosisOptions: [
    { id: "diag-profile-corrupt", isCorrect: true,
      label: "Her local Windows profile has become corrupted, so she's loaded into a blank temporary profile instead",
      explanation: "Correct. The temporary-profile banner, combined with the disk's dirty-unmount warning from the overnight power loss, is the classic signature of a corrupted user profile." },
    { id: "diag-update-changed-settings", isCorrect: false, label: "A recent Windows update changed her settings",
      explanation: "A normal settings change from an update wouldn't trigger a 'temporary profile' banner — that message specifically means Windows couldn't load her real profile at all." },
    { id: "diag-malware", isCorrect: false, label: "Malware reset her desktop",
      explanation: "There's no evidence of malware, and a dirty shutdown from a dead battery is a far simpler, well-documented explanation for exactly these symptoms." },
    { id: "diag-account-recreated", isCorrect: false, label: "Her account was deleted and recreated",
      explanation: "A recreated account wouldn't specifically present as a 'temporary profile' — that banner means the real profile exists but can't currently be loaded." },
  ],

  resolutionOptions: [
    { id: "res-repair-profile", isCorrect: true, label: "Repair her corrupted user profile so Windows loads her real profile again",
      explanation: "This restores her actual saved settings, icons, and app configuration instead of leaving her stuck on a throwaway temporary profile." },
    { id: "res-reinstall-apps", isCorrect: false, label: "Reinstall all of her applications",
      explanation: "Her apps aren't broken — her Windows profile is. Reinstalling apps won't restore a corrupted profile." },
    { id: "res-new-computer", isCorrect: false, label: "Give her a new computer",
      explanation: "This is a well-understood, fixable software issue — replacing the hardware is a drastic overreaction." },
    { id: "res-keep-temp-profile", isCorrect: false, label: "Just have her keep using the temporary profile",
      explanation: "A temporary profile never saves anything permanently — she'd lose all settings and files again at every single login." },
  ],

  verification: { prompt: "Confirm the underlying disk/profile issue is resolved.", expectedOutputId: "out-chkdsk-post",
    successMessage: "The disk check now comes back clean — her profile has been repaired and should load normally on next login." },

  scoring: { investigationMax: 20, evidenceMax: 15, diagnosisMax: 25, resolutionMax: 20, verificationMax: 10, efficiencyMax: 10, hintPenalty: 5, freeActionAllowance: 3 },
  hints: [
    { id: "hint-1", cost: 5, text: "Ask specifically whether she saw any message about a 'temporary profile' at login." },
    { id: "hint-2", cost: 5, text: "Ask whether her computer shut down unexpectedly recently." },
  ],
  skills: ["windows", "user-profiles", "troubleshooting-methodology"],
  tags: ["intermediate", "profiles", "windows"],
  estimatedMinutes: 9,
};
