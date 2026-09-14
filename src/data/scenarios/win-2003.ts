import type { Scenario } from "../../types/scenario";

export const win2003: Scenario = {
  id: "win-2003",
  ticketNumber: "WIN-2003",
  title: "Access denied on a shared folder that worked last week",
  category: "Windows",
  difficulty: "beginner",
  user: { name: "Natalie Brooks", role: "Marketing Coordinator", department: "Marketing" },
  ticketDescription: "I can't open the shared 'Campaigns' folder anymore — it says access denied. It worked fine for me last week.",
  symptoms: [
    "\"Access denied\" when opening the Campaigns folder specifically",
    "Every other shared Marketing folder still works fine",
    "HR moved her to a different team status a couple weeks ago",
  ],
  hiddenFault: "Natalie's account was recently moved into a different security group (Marketing-Contractors) as part of an HR change. That new group doesn't have permission to the Campaigns folder, which only the original Marketing group can access.",
  availableCommands: ["whoami", "net"],

  terminalOutputs: [
    { id: "out-whoami-groups-pre", command: "whoami", match: ["whoami /groups"], phase: "pre", isKeyCommand: true, revealsEvidence: ["ev-wrong-group"],
      output: ["GROUP INFORMATION", "-----------------", "Group Name                        Type", "GEEDESK\\Domain Users              Well-known group", "GEEDESK\\Marketing-Contractors     Group", "GEEDESK\\VPN Users                 Group"] },
    { id: "out-whoami-groups-post", command: "whoami", match: ["whoami /groups"], phase: "post",
      output: ["GROUP INFORMATION", "-----------------", "Group Name                        Type", "GEEDESK\\Domain Users              Well-known group", "GEEDESK\\Marketing                 Group", "GEEDESK\\Marketing-Contractors     Group", "GEEDESK\\VPN Users                 Group"] },
    { id: "out-net-use", command: "net", match: ["net use"], revealsEvidence: ["ev-mapping-ok"],
      output: ["Status       Local     Remote                       Network", "-------------------------------------------------------------------------", "OK           Z:        \\\\fileserver\\Campaigns       Microsoft Windows Network"] },
  ],

  evidence: [
    { id: "ev-ticket-summary", category: "user-report", label: "Ticket summary", detail: "Natalie gets access denied on the Campaigns folder specifically; other shares work fine." },
    { id: "ev-wrong-group", category: "system", isKey: true, label: "Missing from the Marketing group",
      detail: "Her current group memberships include Marketing-Contractors, but not the Marketing group that has access to Campaigns." },
    { id: "ev-mapping-ok", category: "system", label: "Drive mapping itself is fine",
      detail: "Her Z: drive is successfully connected to the Campaigns share — this isn't a connectivity or mapping problem." },
    { id: "ev-role-change", category: "conversation", isKey: true, label: "Recent status change",
      detail: "HR moved her to a 'contractor' status a couple of weeks ago, right around when this started." },
    { id: "ev-other-folders-fine", category: "conversation", isKey: true, label: "Other shares work fine",
      detail: "Every other Marketing shared folder still opens normally — just not Campaigns." },
  ],
  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    { id: "q-role-change", prompt: "Did your role or team status change recently?",
      response: "\"Yeah, HR moved me to a 'contractor' status a couple weeks ago for some reason.\"",
      revealsEvidence: ["ev-role-change"], isKeyQuestion: true },
    { id: "q-other-folders", prompt: "Can you open any other shared folders okay?",
      response: "\"Yes, everything else is fine — just not Campaigns.\"", revealsEvidence: ["ev-other-folders-fine"], isKeyQuestion: true },
    { id: "q-error-detail", prompt: "Do you get an error code, or just 'access denied'?",
      response: "\"Just a plain access denied message.\"", revealsEvidence: [] },
  ],

  keyConcepts: [
    "Distinguishing a permissions problem from a broken mapping or missing folder",
    "Reading group membership to find a missing permission source",
    "Connecting an HR/org change to a sudden, narrowly-scoped access issue",
  ],

  diagnosisOptions: [
    { id: "diag-group", isCorrect: true, label: "Her account was moved into a group that doesn't have permission to the Campaigns folder",
      explanation: "Correct. Her group membership no longer includes Marketing, only Marketing-Contractors, and that change lines up exactly with when the access problem started." },
    { id: "diag-folder-moved", isCorrect: false, label: "The Campaigns folder was deleted or moved",
      explanation: "Her drive mapping to the share connects successfully, and other users still access the same folder — it's intact." },
    { id: "diag-broken-mapping", isCorrect: false, label: "Her mapped network drive is broken",
      explanation: "net use shows the mapping status as OK — the connection itself works fine; it's the underlying folder permission that's denying her." },
    { id: "diag-server-outage", isCorrect: false, label: "The file server is having a general outage",
      explanation: "Every other shared folder on the same server works fine for her, and for everyone else." },
  ],

  resolutionOptions: [
    { id: "res-fix-group", isCorrect: true, label: "Add her account (or her new group) back to the security group with access to Campaigns",
      explanation: "This restores the permission that was lost when her group membership changed, without affecting anyone else." },
    { id: "res-remap-drive", isCorrect: false, label: "Re-map her network drive",
      explanation: "The mapping already connects successfully — remapping it won't grant a permission she doesn't have." },
    { id: "res-local-admin", isCorrect: false, label: "Give her local administrator rights on her PC",
      explanation: "This is a network share permission tied to her domain group membership, not anything controlled by local admin rights." },
    { id: "res-recreate-folder", isCorrect: false, label: "Recreate the Campaigns folder from scratch",
      explanation: "The folder is intact and accessible to others — recreating it is unnecessary and risks losing its contents." },
  ],

  verification: { prompt: "Confirm she's now in a group with access to Campaigns.", expectedOutputId: "out-whoami-groups-post",
    successMessage: "She's now a member of the Marketing group again — the Campaigns folder should open normally." },

  scoring: { investigationMax: 20, evidenceMax: 15, diagnosisMax: 25, resolutionMax: 20, verificationMax: 10, efficiencyMax: 10, hintPenalty: 4, freeActionAllowance: 3 },
  hints: [
    { id: "hint-1", cost: 4, text: "Try: whoami /groups — check which security groups she currently belongs to." },
    { id: "hint-2", cost: 4, text: "Ask whether her role or team assignment changed recently." },
  ],
  skills: ["windows", "permissions", "troubleshooting-methodology"],
  tags: ["beginner", "permissions", "file-shares"],
  estimatedMinutes: 7,
};
