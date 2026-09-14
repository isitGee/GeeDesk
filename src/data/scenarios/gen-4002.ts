import type { Scenario } from "../../types/scenario";

export const gen4002: Scenario = {
  id: "gen-4002",
  ticketNumber: "GEN-4002",
  title: "Mapped drive shows a red X after a password change",
  category: "General IT",
  difficulty: "beginner",
  user: { name: "Derrick Owusu", role: "HR Generalist", department: "Human Resources" },
  ticketDescription: "My H: drive shows a red X and I can't access my personal files. I changed my password yesterday, like the reminder told me to.",
  symptoms: [
    "H: drive shows disconnected with a red X",
    "Password was changed yesterday per a routine reminder",
    "Email and everything else works fine with the new password",
  ],
  hiddenFault: "Derrick's mapped drive has his old password cached in Windows Credential Manager. Since he changed his password yesterday, the stale saved credential no longer matches and the drive can't reconnect.",
  availableCommands: ["net"],

  terminalOutputs: [
    { id: "out-net-use-pre", command: "net", match: ["net use"], phase: "pre", isKeyCommand: true, revealsEvidence: ["ev-stale-credentials"],
      output: ["New connections will be remembered.", "", "Status       Local     Remote                          Network", "Unavailable  H:        \\\\fileserver\\home$\\dowusu       Microsoft Windows Network", "", "System error 1219 has occurred.", "Multiple connections to a server by the same user, using more than one set of credentials, are not allowed."] },
    { id: "out-net-use-post", command: "net", match: ["net use"], phase: "post",
      output: ["New connections will be remembered.", "", "Status       Local     Remote                          Network", "OK           H:        \\\\fileserver\\home$\\dowusu       Microsoft Windows Network"] },
  ],

  evidence: [
    { id: "ev-ticket-summary", category: "user-report", label: "Ticket summary", detail: "Derrick's H: drive shows a red X the day after changing his password." },
    { id: "ev-stale-credentials", category: "system", isKey: true, label: "Credential conflict error on the drive",
      detail: "The drive mapping fails with a classic 'multiple credentials' error — a strong sign of a stale saved password." },
    { id: "ev-password-changed", category: "conversation", isKey: true, label: "Changed password yesterday",
      detail: "He changed his domain password yesterday following a routine reminder." },
    { id: "ev-other-resources-fine", category: "conversation", isKey: true, label: "Everything else works with the new password",
      detail: "Email and all his other logins work completely fine with his new password." },
    { id: "ev-isolated-to-drive", category: "conversation", label: "Only this drive is affected", detail: "As far as he knows, it's just this one mapped drive." },
  ],
  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    { id: "q-password-change", prompt: "Did you change your password recently?",
      response: "\"Yes, yesterday, following the reminder popup.\"", revealsEvidence: ["ev-password-changed"], isKeyQuestion: true },
    { id: "q-other-resources", prompt: "Can you access everything else fine, like email, with your new password?",
      response: "\"Yes, email and everything else logged in fine.\"", revealsEvidence: ["ev-other-resources-fine"], isKeyQuestion: true },
    { id: "q-scope", prompt: "Is it just this drive, or other shares too?", response: "\"Just this one drive so far.\"", revealsEvidence: ["ev-isolated-to-drive"] },
  ],

  keyConcepts: [
    "Recognizing a 'multiple credentials' error as a stale saved password, not a permissions or account problem",
    "Using other working logins to confirm the new password itself is correct everywhere else",
    "Understanding that Credential Manager entries don't update automatically on a password change",
  ],

  diagnosisOptions: [
    { id: "diag-stale-creds", isCorrect: true,
      label: "His mapped drive still has his old, saved credentials cached, which no longer match his new password",
      explanation: "Correct. The classic 'multiple credentials' error, combined with a password change yesterday and every other login working fine, points squarely at a stale cached credential for just this one connection." },
    { id: "diag-server-down", isCorrect: false, label: "The file server is down",
      explanation: "Other network resources are working fine, and this is a credential-specific error message, not a general connectivity failure." },
    { id: "diag-no-permission", isCorrect: false, label: "He no longer has permission to access the drive",
      explanation: "This is specifically a credential-mismatch error, not an access-denied error, and nothing about his role or group changed." },
    { id: "diag-locked", isCorrect: false, label: "His account is locked",
      explanation: "He's already logged into Windows and other resources successfully with his new password — the account itself is active." },
  ],

  resolutionOptions: [
    { id: "res-clear-credentials", isCorrect: true, label: "Clear his saved credentials for that drive in Credential Manager, then reconnect it",
      explanation: "This removes the stale password so the drive authenticates fresh with his current password." },
    { id: "res-reset-password-again", isCorrect: false, label: "Reset his password again",
      explanation: "This doesn't clear the stale cached credential for this specific connection — the same mismatch would happen again." },
    { id: "res-new-drive-letter", isCorrect: false, label: "Map the share to a new drive letter instead",
      explanation: "The underlying stale credential is still saved and would likely cause the same error on the new mapping too." },
    { id: "res-restart-pc", isCorrect: false, label: "Restart his computer",
      explanation: "Saved credentials in Credential Manager persist across a simple restart — this alone won't clear the stale entry." },
  ],

  verification: { prompt: "Confirm the drive reconnects successfully.", expectedOutputId: "out-net-use-post",
    successMessage: "The drive now shows OK — it's authenticating with his current password." },

  scoring: { investigationMax: 20, evidenceMax: 15, diagnosisMax: 25, resolutionMax: 20, verificationMax: 10, efficiencyMax: 10, hintPenalty: 4, freeActionAllowance: 3 },
  hints: [
    { id: "hint-1", cost: 4, text: "Try: net use — read the exact error message on the failing drive carefully." },
    { id: "hint-2", cost: 4, text: "Ask whether he's changed his password recently." },
  ],
  skills: ["general-it", "accounts", "troubleshooting-methodology"],
  tags: ["beginner", "credentials", "file-shares"],
  estimatedMinutes: 6,
};
