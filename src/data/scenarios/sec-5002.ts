import type { Scenario } from "../../types/scenario";

export const sec5002: Scenario = {
  id: "sec-5002",
  ticketNumber: "SEC-5002",
  title: "Browser flooded with ads and a changed homepage",
  category: "Security",
  difficulty: "intermediate",
  user: { name: "Tomasz Nowak", role: "Inside Sales Rep", department: "Sales" },
  ticketDescription: "My browser keeps opening random ads and tabs by itself, and my homepage changed to some search site I don't recognize. It started a few days after I installed a 'free PDF converter'.",
  symptoms: [
    "Browser opens random ad tabs on its own",
    "Homepage changed to an unfamiliar search site",
    "Downloaded a free PDF converter from an unfamiliar site a few days ago",
  ],
  hiddenFault: "A bundled adware/browser-hijacker program was installed alongside the free PDF converter he downloaded from an untrusted site. It's altering his browser settings and injecting ads and redirects.",
  availableCommands: ["tasklist", "netstat"],

  terminalOutputs: [
    { id: "out-tasklist-pre", command: "tasklist", match: ["tasklist"], phase: "pre", isKeyCommand: true, revealsEvidence: ["ev-suspicious-process"],
      output: ["Image Name                     PID   Mem Usage", "chrome.exe                     3390    412,880 K", "SearchProtectBHO.exe           6104     88,204 K", "PDFHelper_bg.exe               6188     41,020 K"] },
    { id: "out-tasklist-post", command: "tasklist", match: ["tasklist"], phase: "post",
      output: ["Image Name                     PID   Mem Usage", "chrome.exe                     3390    398,112 K"] },
    { id: "out-netstat-pre", command: "netstat", match: ["netstat"], phase: "pre", isKeyCommand: true, revealsEvidence: ["ev-suspicious-connections"],
      output: ["Active Connections", "  TCP    10.4.2.61:52210    193.42.11.88:443     ESTABLISHED  (unrecognized ad network)", "  TCP    10.4.2.61:52214    193.42.11.90:443     ESTABLISHED  (unrecognized ad network)"] },
    { id: "out-netstat-post", command: "netstat", match: ["netstat"], phase: "post",
      output: ["Active Connections", "  TCP    10.4.2.61:52301    142.250.72.14:443    ESTABLISHED  (normal browsing traffic)"] },
  ],

  evidence: [
    { id: "ev-ticket-summary", category: "user-report", label: "Ticket summary", detail: "Tomasz's browser opens ads on its own and his homepage was changed, after installing a free PDF tool." },
    { id: "ev-suspicious-process", category: "system", isKey: true, label: "Unfamiliar background processes running",
      detail: "Processes named like 'SearchProtectBHO' and 'PDFHelper_bg' are running — not anything he or IT installed intentionally." },
    { id: "ev-suspicious-connections", category: "system", isKey: true, label: "Active connections to unrecognized ad networks",
      detail: "His machine has active connections to unfamiliar external addresses tied to ad networks, not normal browsing traffic." },
    { id: "ev-recent-download", category: "conversation", isKey: true, label: "Recently downloaded free software",
      detail: "He downloaded a free PDF converter from an unfamiliar site a few days ago, right before this started." },
    { id: "ev-single-browser", category: "conversation", label: "Isolated to one browser",
      detail: "This is only happening in one browser, not system-wide." },
    { id: "ev-new-toolbar", category: "conversation", isKey: true, label: "Unrecognized new toolbar",
      detail: "He noticed a new browser toolbar he doesn't remember installing." },
  ],
  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    { id: "q-recent-install", prompt: "Did you install anything recently, like free software or a browser extension?",
      response: "\"Yeah, I downloaded a free PDF converter a few days ago from a random site, right before this started.\"", revealsEvidence: ["ev-recent-download"], isKeyQuestion: true },
    { id: "q-scope", prompt: "Is this happening in one browser, or all of them?",
      response: "\"Just this one browser, actually.\"", revealsEvidence: ["ev-single-browser"] },
    { id: "q-toolbar", prompt: "Did you notice any new toolbar or extension appear recently?",
      response: "\"Now that you mention it, yeah — there's some toolbar I don't remember installing.\"", revealsEvidence: ["ev-new-toolbar"], isKeyQuestion: true },
  ],

  keyConcepts: [
    "Recognizing bundled adware as a common consequence of free software from untrusted sources",
    "Using running processes and active connections to spot unwanted background software",
    "Scoping whether an issue is one browser/app vs. the whole system before deciding how serious it is",
  ],

  diagnosisOptions: [
    { id: "diag-adware", isCorrect: true,
      label: "A bundled adware/browser-hijacker program was installed alongside the free PDF converter, and it's altering his browser",
      explanation: "Correct. Unfamiliar processes and ad-network connections appeared right after he installed free software from an untrusted site, and a new toolbar showed up around the same time — the classic signature of bundled adware." },
    { id: "diag-network-compromise", isCorrect: false, label: "His internet connection has been compromised at the network level",
      explanation: "This is isolated to one browser and traces directly back to a specific recent software install — not a network-wide compromise." },
    { id: "diag-normal-ads", isCorrect: false, label: "This is just normal advertising from a legitimate website",
      explanation: "An unrecognized new toolbar, a changed homepage, and unfamiliar background processes go well beyond a normal ad on a webpage." },
    { id: "diag-reinstall-os", isCorrect: false, label: "Windows needs to be reinstalled",
      explanation: "This is a well-scoped, targeted browser hijack tied to one specific install — it's addressable without wiping the whole system." },
  ],

  resolutionOptions: [
    { id: "res-remove-adware", isCorrect: true, label: "Uninstall the PDF converter and any bundled software/extensions, remove the toolbar, and reset browser settings",
      explanation: "This removes the unwanted software at its source and restores his browser to its normal, expected configuration." },
    { id: "res-ignore-popups", isCorrect: false, label: "Just ignore the pop-ups",
      explanation: "This leaves the adware active and running in the background, doing nothing to stop it — and it could be used for worse things later." },
    { id: "res-reinstall-windows", isCorrect: false, label: "Reinstall Windows entirely",
      explanation: "This is disproportionate for a well-understood, fixable browser hijack limited to one piece of bundled software." },
    { id: "res-change-password", isCorrect: false, label: "Change his Windows password",
      explanation: "This isn't a compromised-credential issue — it's unwanted local software altering browser behavior, which a password change does nothing to remove." },
  ],

  verification: { prompt: "Confirm the suspicious processes and connections are gone.", expectedOutputId: "out-tasklist-post",
    successMessage: "The unfamiliar processes are gone and only normal browser activity remains — the adware has been removed." },

  scoring: { investigationMax: 20, evidenceMax: 15, diagnosisMax: 25, resolutionMax: 20, verificationMax: 10, efficiencyMax: 10, hintPenalty: 5, freeActionAllowance: 3 },
  hints: [
    { id: "hint-1", cost: 5, text: "Check the running processes for anything unfamiliar that doesn't belong to his normal software." },
    { id: "hint-2", cost: 5, text: "Ask whether he's installed any free software or browser extensions recently." },
  ],
  skills: ["security", "malware", "troubleshooting-methodology"],
  tags: ["intermediate", "adware", "browser"],
  estimatedMinutes: 10,
};
