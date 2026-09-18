import type { Scenario } from "../../types/scenario";

export const win2007: Scenario = {
  id: "win-2007",
  ticketNumber: "WIN-2007",
  title: "Print Spooler crashes immediately upon starting with Error 1068",
  category: "Windows",
  difficulty: "intermediate",
  user: { name: "Claire Dupont", role: "Executive Assistant", department: "Administration" },
  ticketDescription:
    "I cannot print any board packets. Every time I click Print, Windows says 'The Active Directory Domain Services is currently unavailable' or 'Print Spooler service is not running'. When I tried to start the Print Spooler in services.msc, it gave me 'Error 1068: The dependency service or group failed to start'.",
  symptoms: [
    "Unable to print from any desktop application",
    "Print Spooler service fails to start with Error 1068",
    "Network connectivity and Internet access work normally",
  ],
  hiddenFault:
    "A third-party PDF driver installer corrupted the Print Spooler's DependOnService registry key, adding a non-existent service dependency ('HttpPrintMonitor') that prevents the Windows Spooler service from initializing.",
  availableCommands: ["sc", "tasklist", "net"],

  terminalOutputs: [
    {
      id: "out-sc-qc-pre",
      command: "sc",
      match: ["sc qc spooler", "sc qc Spooler"],
      phase: "pre",
      isKeyCommand: true,
      revealsEvidence: ["ev-bad-dependency"],
      output: [
        "[SC] QueryServiceConfig SUCCESS",
        "",
        "SERVICE_NAME: spooler",
        "        TYPE               : 110  WIN32_OWN_PROCESS (interactive)",
        "        START_TYPE         : 2   AUTO_START",
        "        ERROR_CONTROL      : 1   NORMAL",
        "        BINARY_PATH_NAME   : C:\\Windows\\System32\\spoolsv.exe",
        "        LOAD_ORDER_GROUP   : SpoolerGroup",
        "        TAG                : 0",
        "        DISPLAY_NAME       : Print Spooler",
        "        DEPENDENCIES       : RPCSS",
        "                           : HttpPrintMonitor (FAILED TO START / NOT FOUND)",
        "        SERVICE_START_NAME : LocalSystem",
      ],
    },
    {
      id: "out-sc-qc-post",
      command: "sc",
      match: ["sc qc spooler", "sc qc Spooler"],
      phase: "post",
      output: [
        "[SC] QueryServiceConfig SUCCESS",
        "",
        "SERVICE_NAME: spooler",
        "        TYPE               : 110  WIN32_OWN_PROCESS (interactive)",
        "        START_TYPE         : 2   AUTO_START",
        "        ERROR_CONTROL      : 1   NORMAL",
        "        BINARY_PATH_NAME   : C:\\Windows\\System32\\spoolsv.exe",
        "        LOAD_ORDER_GROUP   : SpoolerGroup",
        "        DISPLAY_NAME       : Print Spooler",
        "        DEPENDENCIES       : RPCSS",
        "                           : http",
        "        SERVICE_START_NAME : LocalSystem",
      ],
    },
    {
      id: "out-sc-query-pre",
      command: "sc",
      match: ["sc query spooler", "sc query Spooler"],
      phase: "pre",
      output: [
        "SERVICE_NAME: spooler",
        "        TYPE               : 110  WIN32_OWN_PROCESS (interactive)",
        "        STATE              : 1  STOPPED",
        "        WIN32_EXIT_CODE    : 1068  (0x42c)",
        "        SERVICE_EXIT_CODE  : 0  (0x0)",
        "        CHECKPOINT         : 0x0",
        "        WAIT_HINT          : 0x0",
      ],
    },
    {
      id: "out-sc-query-post",
      command: "sc",
      match: ["sc query spooler", "sc query Spooler"],
      phase: "post",
      output: [
        "SERVICE_NAME: spooler",
        "        TYPE               : 110  WIN32_OWN_PROCESS (interactive)",
        "        STATE              : 4  RUNNING",
        "                                (STOPPABLE, NOT_PAUSABLE, ACCEPTS_SHUTDOWN)",
        "        WIN32_EXIT_CODE    : 0  (0x0)",
        "        SERVICE_EXIT_CODE  : 0  (0x0)",
        "        CHECKPOINT         : 0x0",
        "        WAIT_HINT          : 0x0",
      ],
    },
    {
      id: "out-tasklist",
      command: "tasklist",
      match: ["tasklist", "tasklist /fi \"imagename eq spoolsv.exe\""],
      revealsEvidence: ["ev-spooler-not-running"],
      output: [
        "Image Name                     PID Session Name        Session#    Mem Usage",
        "========================= ======== ================ =========== ============",
        "System Idle Process              0 Services                   0          8 K",
        "System                           4 Services                   0        148 K",
        "smss.exe                       428 Services                   0      1,024 K",
        "csrss.exe                      584 Services                   0      4,180 K",
        "wininit.exe                    668 Services                   0      4,512 K",
        "services.exe                   740 Services                   0      8,924 K",
        "lsass.exe                      768 Services                   0     16,420 K",
        "svchost.exe                    912 Services                   0     24,180 K",
        "explorer.exe                  4112 Console                    1     84,210 K",
      ],
    },
  ],

  evidence: [
    {
      id: "ev-ticket-summary",
      category: "user-report",
      label: "Ticket summary",
      detail: "Claire cannot print; starting Print Spooler service results in Error 1068.",
    },
    {
      id: "ev-bad-dependency",
      category: "system",
      isKey: true,
      label: "Spooler has invalid dependency 'HttpPrintMonitor'",
      detail: "Service configuration query (sc qc spooler) reveals a dependency on non-existent service 'HttpPrintMonitor'.",
    },
    {
      id: "ev-spooler-not-running",
      category: "system",
      label: "spoolsv.exe process is missing from tasklist",
      detail: "The print spooler binary is completely absent from running system processes.",
    },
    {
      id: "ev-pdf-software",
      category: "conversation",
      label: "User installed third-party PDF converter",
      detail: "Claire mentions installing a free PDF virtual printer from the web yesterday right before printing stopped.",
    },
  ],

  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    {
      id: "q-recent-installs",
      question: "Did you recently install any software or driver updates?",
      answer: "Yes, I installed a free PDF converter tool from the internet yesterday to combine board meeting documents.",
      isKey: true,
      revealsEvidence: ["ev-pdf-software"],
    },
    {
      id: "q-other-printers",
      question: "Are other colleagues able to print to the executive floor printer?",
      answer: "Yes, my colleague next to me printed 50 pages this morning without any trouble.",
    },
  ],

  diagnosisOptions: [
    {
      id: "diag-broken-dependency",
      label: "Print Spooler service failed with Error 1068 due to a missing or corrupted service dependency (HttpPrintMonitor).",
      isCorrect: true,
    },
    {
      id: "diag-network-printer-dead",
      label: "The physical network printer has a jammed paper feed and offline NIC.",
      isCorrect: false,
    },
    {
      id: "diag-spoolsv-virus",
      label: "The spoolsv.exe file has been encrypted or deleted by malware.",
      isCorrect: false,
    },
  ],

  resolutionOptions: [
    {
      id: "res-fix-dependency",
      label: "Reset Print Spooler dependencies using 'sc config spooler depend= RPCSS/http', then start the service with 'net start spooler'.",
      isCorrect: true,
    },
    {
      id: "res-reboot-pc",
      label: "Reboot the workstation to restart all system services.",
      isCorrect: false,
      simulatedConsequence: "Workstation rebooted, but Spooler still failed to start because the registry dependency remains broken.",
      efficiencyPenalty: 4,
    },
    {
      id: "res-reinstall-printer",
      label: "Delete all network printers from Control Panel and re-add them.",
      isCorrect: false,
      simulatedConsequence: "Control Panel reported 'Cannot connect to printer. The local print spooler service is not running.'",
      efficiencyPenalty: 5,
    },
  ],

  verification: {
    prompt: "Query the Spooler service status to confirm it is in the RUNNING state.",
    expectedOutputId: "out-sc-query-post",
    successMessage: "Print Spooler service is now actively RUNNING and accepted printing queue jobs.",
  },

  hints: [
    { id: "h-1", text: "Windows Error 1068 means a service could not start because a service it depends on failed.", cost: 2 },
    { id: "h-2", text: "Use 'sc qc spooler' to inspect the configured dependencies.", cost: 4 },
    { id: "h-3", text: "The third-party PDF tool added an invalid dependency. Reconfigure with 'sc config spooler depend= RPCSS/http'.", cost: 7 },
  ],

  scoring: {
    investigationMax: 20,
    evidenceMax: 15,
    diagnosisMax: 25,
    resolutionMax: 20,
    verificationMax: 10,
    efficiencyMax: 10,
  },

  skills: ["Windows Services", "SC Utility", "Error 1068", "Dependencies", "Printing"],
  tags: ["Windows", "Printing", "Services", "Registry"],
};
