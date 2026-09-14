import type { Scenario } from "../../types/scenario";

export const win2004: Scenario = {
  id: "win-2004",
  ticketNumber: "WIN-2004",
  title: "Windows Update stuck checking forever",
  category: "Windows",
  difficulty: "intermediate",
  user: { name: "Samuel Etim", role: "Compliance Officer", department: "Legal & Compliance" },
  ticketDescription: "My laptop finally finished an overnight update, but now Windows Update itself seems permanently stuck on 'Checking for updates', and two update attempts failed overnight.",
  symptoms: [
    "Windows Update spins on 'Checking for updates' indefinitely",
    "Update history shows two failed installs overnight",
    "Free disk space is unusually low",
  ],
  hiddenFault: "The Windows Update service is hung because of a corrupted update cache, made worse by very low free disk space that caused the last two update attempts to fail partway through.",
  availableCommands: ["sc", "tasklist", "systeminfo"],

  terminalOutputs: [
    { id: "out-sc-pre", command: "sc", match: ["sc query wuauserv"], phase: "pre", isKeyCommand: true, revealsEvidence: ["ev-wuauserv-hung"],
      output: ["SERVICE_NAME: wuauserv", "        TYPE               : 20  WIN32_SHARE_PROCESS", "        STATE              : 4  RUNNING", "                                (not responding to new requests)"] },
    { id: "out-sc-post", command: "sc", match: ["sc query wuauserv"], phase: "post",
      output: ["SERVICE_NAME: wuauserv", "        TYPE               : 20  WIN32_SHARE_PROCESS", "        STATE              : 4  RUNNING", "                                (responding normally)"] },
    { id: "out-tasklist", command: "tasklist", match: ["tasklist"], revealsEvidence: ["ev-high-disk-io"],
      output: ["Image Name                     PID   Mem Usage", "TiWorker.exe                   5521    412,880 K", "svchost.exe (wuauserv)         2290    288,204 K"] },
    { id: "out-systeminfo", command: "systeminfo", match: ["systeminfo"],
      output: ["Host Name:         SETIM-LAPTOP-11", "OS Name:           Microsoft Windows 11 Enterprise", "System Boot Time:  Today, 6:58 AM"] },
  ],

  evidence: [
    { id: "ev-ticket-summary", category: "user-report", label: "Ticket summary", detail: "Windows Update is stuck checking indefinitely after two failed overnight install attempts." },
    { id: "ev-wuauserv-hung", category: "system", isKey: true, label: "Update service running but unresponsive",
      detail: "The Windows Update service shows RUNNING but isn't actually responding to new update requests." },
    { id: "ev-high-disk-io", category: "system", label: "Update processes consuming heavy resources",
      detail: "Update-related processes are consuming unusually high memory/disk activity while stuck." },
    { id: "ev-failed-installs", category: "conversation", isKey: true, label: "Two failed installs overnight",
      detail: "Update history shows two separate failed install attempts overnight." },
    { id: "ev-low-disk", category: "conversation", isKey: true, label: "Very low free disk space",
      detail: "He's down to only about 2GB of free disk space — a common cause of failed or corrupted update installs." },
  ],
  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    { id: "q-history", prompt: "Does the update history show any errors?",
      response: "\"Yeah, two failed installs overnight with some error code I didn't write down.\"", revealsEvidence: ["ev-failed-installs"], isKeyQuestion: true },
    { id: "q-disk-space", prompt: "How much free disk space do you have?",
      response: "\"Actually not much — I think I'm down to like 2GB free.\"", revealsEvidence: ["ev-low-disk"], isKeyQuestion: true },
    { id: "q-duration", prompt: "How long has it been stuck like this?",
      response: "\"A few hours now, since the overnight attempt.\"", revealsEvidence: [] },
  ],

  keyConcepts: [
    "Recognizing a service that's 'running' but unresponsive as still broken",
    "Connecting low disk space to failed and corrupted update installs",
    "Choosing a targeted cache reset over a full reinstall",
  ],

  diagnosisOptions: [
    { id: "diag-corrupt-cache", isCorrect: true,
      label: "The Windows Update service is hung due to a corrupted update cache, likely from very low free disk space",
      explanation: "Correct. The service shows running-but-unresponsive, two installs already failed overnight, and disk space is critically low — a well-known combination that corrupts the update cache." },
    { id: "diag-malware", isCorrect: false, label: "Malware is blocking Windows Update",
      explanation: "Nothing here points to malware — the running processes are legitimate update components, and low disk space plus failed installs already explains everything." },
    { id: "diag-internet", isCorrect: false, label: "His internet connection is down",
      explanation: "The service itself reports as running with an internal stuck state, not a network connectivity error." },
    { id: "diag-hardware", isCorrect: false, label: "The laptop's hardware is failing",
      explanation: "There's no hardware failure evidence — high resource use here is a byproduct of a stuck software process, not wear or failure." },
  ],

  resolutionOptions: [
    { id: "res-clear-cache", isCorrect: true, label: "Clear the Windows Update cache and free up disk space, then restart the update service",
      explanation: "This removes the corrupted cache causing the hang and addresses the low disk space that caused it in the first place." },
    { id: "res-reinstall-windows", isCorrect: false, label: "Reinstall Windows entirely",
      explanation: "This is far more disruptive than necessary for a known, fixable update cache issue." },
    { id: "res-disable-updates", isCorrect: false, label: "Disable Windows Update permanently",
      explanation: "This leaves the machine without security updates going forward and doesn't fix the underlying corruption." },
    { id: "res-keep-waiting", isCorrect: false, label: "Just keep waiting — it'll finish eventually",
      explanation: "It's already been stuck for hours with two failed attempts — there's no sign it will resolve itself." },
  ],

  verification: { prompt: "Confirm the update service responds normally again.", expectedOutputId: "out-sc-post",
    successMessage: "The update service now responds normally to requests — Windows Update should complete a fresh check successfully." },

  scoring: { investigationMax: 20, evidenceMax: 15, diagnosisMax: 25, resolutionMax: 20, verificationMax: 10, efficiencyMax: 10, hintPenalty: 5, freeActionAllowance: 3 },
  hints: [
    { id: "hint-1", cost: 5, text: "Try: sc query wuauserv — a service can show RUNNING and still be stuck." },
    { id: "hint-2", cost: 5, text: "Ask how much free disk space is available — it matters more than people expect for updates." },
  ],
  skills: ["windows", "services", "troubleshooting-methodology"],
  tags: ["intermediate", "windows-update", "services"],
  estimatedMinutes: 10,
};
