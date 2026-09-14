import type { Scenario } from "../../types/scenario";

export const win2001: Scenario = {
  id: "win-2001",
  ticketNumber: "WIN-2001",
  title: "Account locked out, but the password is right",
  category: "Windows",
  difficulty: "beginner",
  user: { name: "Grace Liu", role: "Customer Support Rep", department: "Support" },
  ticketDescription: "I can't log into my computer — it says my account is locked out. I'm positive I'm typing the right password. My AD username is glui.",
  symptoms: [
    "Login screen says \"This user account has been locked out\"",
    "She's confident she's typing the correct password",
    "Her phone was stuck retrying an email sync all night",
  ],
  hiddenFault:
    "Grace's domain password expired two days ago. Her phone still had the old password cached for email sync and kept retrying it automatically overnight, tripping the account lockout policy after five failed attempts.",
  availableCommands: ["net"],

  terminalOutputs: [
    { id: "out-net-user-pre", command: "net", match: ["net user glui /domain", "net user glui"], phase: "pre",
      isKeyCommand: true, revealsEvidence: ["ev-account-locked", "ev-password-expired"],
      output: [
        "User name                    glui",
        "Full Name                    Grace Liu",
        "Account active               Yes",
        "Account expires              Never",
        "Password last set            91 days ago",
        "Password expires             Password already expired",
        "Account lockout              Yes -- locked out",
        "Bad password count           5",
      ] },
    { id: "out-net-user-post", command: "net", match: ["net user glui /domain", "net user glui"], phase: "post",
      output: [
        "User name                    glui",
        "Full Name                    Grace Liu",
        "Account active               Yes",
        "Password last set            Today",
        "Password expires             In 90 days",
        "Account lockout              No",
        "Bad password count           0",
      ] },
    { id: "out-net-accounts", command: "net", match: ["net accounts /domain", "net accounts"],
      revealsEvidence: ["ev-lockout-policy"],
      output: [
        "Minimum password age (days):        1",
        "Maximum password age (days):        90",
        "Lockout threshold:                  5 bad password attempts",
        "Lockout duration (minutes):         30",
      ] },
  ],

  evidence: [
    { id: "ev-ticket-summary", category: "user-report", label: "Ticket summary", detail: "Grace (glui) is locked out and confident her password is correct." },
    { id: "ev-account-locked", category: "system", isKey: true, label: "Account is genuinely locked out",
      detail: "Her AD account shows an active lockout with 5 recorded bad password attempts." },
    { id: "ev-password-expired", category: "system", isKey: true, label: "Password already expired",
      detail: "Her password expired two days ago per the 90-day policy." },
    { id: "ev-lockout-policy", category: "system", label: "Lockout policy",
      detail: "This domain locks accounts out after 5 bad attempts within the policy window." },
    { id: "ev-phone-retry", category: "conversation", isKey: true, label: "Phone retried a stale password overnight",
      detail: "Her phone was stuck retrying email sync all night — almost certainly using her old, now-expired password." },
    { id: "ev-old-password", category: "conversation", isKey: true, label: "Hasn't changed her password recently",
      detail: "She estimates she last changed her password around three months ago." },
  ],
  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    { id: "q-overnight", prompt: "Did anything unusual happen overnight, like a device retrying a login?",
      response: "\"Now that you mention it, my phone was stuck 'syncing' email all night with a bunch of failure notifications.\"",
      revealsEvidence: ["ev-phone-retry"], isKeyQuestion: true },
    { id: "q-last-changed", prompt: "When did you last change your password?",
      response: "\"Honestly not sure... maybe three months ago?\"", revealsEvidence: ["ev-old-password"], isKeyQuestion: true },
    { id: "q-confident", prompt: "Are you sure about the password you're typing right now?",
      response: "\"Yes, it's the one I always use.\"", revealsEvidence: [] },
  ],

  keyConcepts: [
    "Distinguishing 'wrong password right now' from 'account locked from past failed attempts'",
    "Recognizing a stale cached credential on another device as a lockout cause",
    "Reading net user / net accounts output to check account and policy state",
  ],

  diagnosisOptions: [
    { id: "diag-stale-cred", isCorrect: true,
      label: "Her password expired and a device with the old cached password kept retrying it, triggering a lockout",
      explanation: "Correct. The account shows 5 bad attempts and an expired password, and her phone was retrying email sync all night with what was almost certainly the old password." },
    { id: "diag-typo", isCorrect: false, label: "She's simply typing the wrong password right now",
      explanation: "She's confident in her password, and the account status shows a lockout from 5 attempts overnight — not a single failed attempt just now." },
    { id: "diag-deleted", isCorrect: false, label: "Her account was deleted",
      explanation: "Her account shows as active — it's locked, not deleted or disabled." },
    { id: "diag-attack", isCorrect: false, label: "Someone is maliciously trying to break into her account",
      explanation: "There's no evidence of an external attack — a far simpler explanation (her own phone retrying a stale password) already fits every fact." },
  ],

  resolutionOptions: [
    { id: "res-unlock-and-fix-phone", isCorrect: true,
      label: "Unlock her account and update the cached password on her phone with a new one",
      explanation: "This restores access immediately and stops the phone from immediately re-triggering the same lockout by retrying a stale password." },
    { id: "res-unlock-only", isCorrect: false, label: "Just unlock the account and change nothing else",
      explanation: "Without fixing the phone's stale cached password, it'll keep retrying the old one and lock her out again shortly." },
    { id: "res-factory-reset", isCorrect: false, label: "Reset her computer to factory settings",
      explanation: "This is a domain account lockout, not a problem with her computer itself — a factory reset wouldn't touch it and is wildly disproportionate." },
    { id: "res-disable-policy", isCorrect: false, label: "Disable the account lockout policy for the whole domain",
      explanation: "This removes an important security control for everyone just to work around one stale credential on one device." },
  ],

  verification: { prompt: "Confirm her account is unlocked and no longer showing failed attempts.", expectedOutputId: "out-net-user-post",
    successMessage: "Her account now shows no lockout and a freshly-set password — she should be able to log in immediately." },

  scoring: { investigationMax: 20, evidenceMax: 15, diagnosisMax: 25, resolutionMax: 20, verificationMax: 10, efficiencyMax: 10, hintPenalty: 4, freeActionAllowance: 3 },
  hints: [
    { id: "hint-1", cost: 4, text: "Try: net user glui /domain — check the account's actual lockout and password status." },
    { id: "hint-2", cost: 4, text: "Ask whether any other device might have been trying to log in with an old password." },
  ],
  skills: ["windows", "accounts", "troubleshooting-methodology"],
  tags: ["beginner", "active-directory", "accounts"],
  estimatedMinutes: 7,
};
