import type { Scenario } from "../../types/scenario";

export const win2008: Scenario = {
  id: "win-2008",
  ticketNumber: "WIN-2008",
  title: "Files on Desktop disappeared and Windows says 'You've been signed in with a temporary profile'",
  category: "Windows",
  difficulty: "intermediate",
  user: { name: "Nathaniel Price", role: "Financial Analyst", department: "Finance" },
  ticketDescription:
    "I turned on my PC this morning and all my spreadsheets on my desktop are gone! My wallpaper was reset to black, and a notification says 'You've been signed in with a temporary profile. You can't access your files, and files created in this profile will be deleted when you sign out.'",
  symptoms: [
    "User logged into C:\\Users\\TEMP instead of C:\\Users\\nprice",
    "Desktop shortcuts and custom files appear missing upon login",
    "Changes made during the session do not persist after restart",
  ],
  hiddenFault:
    "An improper shutdown during a Windows update left Nathaniel's NTUSER.DAT registry hive locked. Windows created a backup registry key with a '.bak' extension under ProfileList, forcing subsequent sign-ins into a volatile temporary profile.",
  availableCommands: ["whoami", "dir", "reg"],

  terminalOutputs: [
    {
      id: "out-whoami-pre",
      command: "whoami",
      match: ["whoami /user", "whoami"],
      phase: "pre",
      revealsEvidence: ["ev-user-sid"],
      output: [
        "USER INFORMATION",
        "----------------",
        "",
        "User Name      SID",
        "============== ===============================================",
        "geedesk\\nprice S-1-5-21-397955417-626881126-18844144-1142",
      ],
    },
    {
      id: "out-whoami-post",
      command: "whoami",
      match: ["whoami /user", "whoami"],
      phase: "post",
      output: [
        "USER INFORMATION",
        "----------------",
        "",
        "User Name      SID",
        "============== ===============================================",
        "geedesk\\nprice S-1-5-21-397955417-626881126-18844144-1142",
      ],
    },
    {
      id: "out-reg-profile-pre",
      command: "reg",
      match: [
        "reg query \"HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\ProfileList\"",
        "reg query HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\ProfileList /s",
        "reg query ProfileList",
      ],
      phase: "pre",
      isKeyCommand: true,
      revealsEvidence: ["ev-profile-bak"],
      output: [
        "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\ProfileList\\S-1-5-21-397955417-626881126-18844144-1142",
        "    ProfileImagePath    REG_EXPAND_SZ    C:\\Users\\TEMP",
        "    State               REG_DWORD        0x84",
        "",
        "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\ProfileList\\S-1-5-21-397955417-626881126-18844144-1142.bak",
        "    ProfileImagePath    REG_EXPAND_SZ    C:\\Users\\nprice",
        "    State               REG_DWORD        0x0",
      ],
    },
    {
      id: "out-reg-profile-post",
      command: "reg",
      match: [
        "reg query \"HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\ProfileList\"",
        "reg query HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\ProfileList /s",
        "reg query ProfileList",
      ],
      phase: "post",
      output: [
        "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\ProfileList\\S-1-5-21-397955417-626881126-18844144-1142",
        "    ProfileImagePath    REG_EXPAND_SZ    C:\\Users\\nprice",
        "    State               REG_DWORD        0x0",
      ],
    },
    {
      id: "out-dir-users",
      command: "dir",
      match: ["dir C:\\Users", "dir c:\\users"],
      revealsEvidence: ["ev-real-profile-exists"],
      output: [
        " Directory of C:\\Users",
        "",
        "09/14/2026  09:12 AM    <DIR>          .",
        "09/14/2026  09:12 AM    <DIR>          ..",
        "01/10/2026  10:30 AM    <DIR>          Public",
        "09/18/2026  08:01 AM    <DIR>          TEMP",
        "09/17/2026  05:45 PM    <DIR>          nprice",
      ],
    },
  ],

  evidence: [
    {
      id: "ev-ticket-summary",
      category: "user-report",
      label: "Ticket summary",
      detail: "Nathaniel signed into a temporary profile; desktop files appear missing.",
    },
    {
      id: "ev-user-sid",
      category: "system",
      label: "User SID identified",
      detail: "Nathaniel's domain user account corresponds to SID ending in -1142.",
    },
    {
      id: "ev-profile-bak",
      category: "system",
      isKey: true,
      label: "ProfileList contains .bak registry key pointing to C:\\Users\\TEMP",
      detail: "Registry shows an active TEMP key and the original profile flagged with a '.bak' extension.",
    },
    {
      id: "ev-real-profile-exists",
      category: "system",
      label: "Original folder C:\\Users\\nprice is intact",
      detail: "The user's actual profile folder on disk is healthy and contains all their files.",
    },
  ],

  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    {
      id: "q-what-happened-yesterday",
      question: "Did anything unusual happen when you powered down your PC yesterday?",
      answer: "I was running late for a train, so I held down the power button while Windows said 'Getting Windows ready... Do not turn off your computer'.",
      isKey: true,
      revealsEvidence: ["ev-real-profile-exists"],
    },
    {
      id: "q-other-logins",
      question: "Have you tried logging in as another user?",
      answer: "No, this is my dedicated assigned desktop in Finance.",
    },
  ],

  diagnosisOptions: [
    {
      id: "diag-temp-profile-bak",
      label: "Corrupted profile registry key with a .bak suffix forced Windows to load a volatile temporary profile.",
      isCorrect: true,
    },
    {
      id: "diag-hard-drive-wipe",
      label: "Hard drive suffered catastrophic storage partition failure and formatted user files.",
      isCorrect: false,
    },
    {
      id: "diag-ad-profile-deleted",
      label: "Domain admin deleted Nathaniel's roaming profile path from Active Directory.",
      isCorrect: false,
    },
  ],

  resolutionOptions: [
    {
      id: "res-fix-profile-reg",
      label: "Delete the temporary profile key, remove the .bak extension from the original SID key in ProfileList, set State to 0, and sign back in.",
      isCorrect: true,
    },
    {
      id: "res-copy-temp-to-desktop",
      label: "Copy the user's files from C:\\Users\\nprice into C:\\Users\\TEMP and reboot.",
      isCorrect: false,
      simulatedConsequence: "Files copied to TEMP were permanently deleted on reboot because TEMP profiles are purged at logoff.",
      efficiencyPenalty: 6,
    },
    {
      id: "res-delete-nprice-folder",
      label: "Delete C:\\Users\\nprice folder from disk and create a new Windows local account.",
      isCorrect: false,
      simulatedConsequence: "Destroyed user's local spreadsheets without fixing the registry SID conflict.",
      efficiencyPenalty: 8,
    },
  ],

  verification: {
    prompt: "Query the ProfileList registry path to verify the original SID key is active without a .bak suffix and points to C:\\Users\\nprice.",
    expectedOutputId: "out-reg-profile-post",
    successMessage: "ProfileList registry key verified: points to C:\\Users\\nprice with State 0.",
  },

  hints: [
    { id: "h-1", text: "When Windows cannot load NTUSER.DAT, it loads a TEMP profile and renames the registry key with .bak.", cost: 2 },
    { id: "h-2", text: "Inspect 'HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\ProfileList' using reg query.", cost: 4 },
    { id: "h-3", text: "Remove the duplicate TEMP entry and strip the .bak suffix from the original SID key.", cost: 7 },
  ],

  scoring: {
    investigationMax: 20,
    evidenceMax: 15,
    diagnosisMax: 25,
    resolutionMax: 20,
    verificationMax: 10,
    efficiencyMax: 10,
  },

  skills: ["User Profiles", "Registry", "ProfileList", "Windows 11", "Data Recovery"],
  tags: ["Windows", "User Profile", "Registry", "Troubleshooting"],
};
