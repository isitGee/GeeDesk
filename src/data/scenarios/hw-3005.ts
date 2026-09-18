import type { Scenario } from "../../types/scenario";

export const hw3005: Scenario = {
  id: "hw-3005",
  ticketNumber: "HW-3005",
  title: "CAD workstation crashes randomly with MEMORY_MANAGEMENT Blue Screen",
  category: "Hardware",
  difficulty: "intermediate",
  user: { name: "Samantha Wright", role: "CAD Architect", department: "Design" },
  ticketDescription:
    "My engineering workstation (CAD-WS-02) crashes randomly 3 to 4 times a day with a blue screen. It usually happens when I render complex 3D models in Revit. The stop code on the blue screen says 'MEMORY_MANAGEMENT (0x0000001A)'.",
  symptoms: [
    "Frequent random BSODs under heavy rendering load",
    "Stop code: MEMORY_MANAGEMENT (0x0000001A)",
    "Occasional silent browser tab crashes and corrupted project save files",
  ],
  hiddenFault:
    "The DDR5 RAM stick in DIMM slot 3 is defective, generating single-bit and multi-bit parity errors when rendering buffers cross into the 48GB to 64GB memory boundary.",
  availableCommands: ["mdsched", "wmic", "systeminfo"],

  terminalOutputs: [
    {
      id: "out-wmic-memory",
      command: "wmic",
      match: ["wmic memorychip get", "wmic memorychip", "wmic memorychip list full"],
      revealsEvidence: ["ev-ram-dimms"],
      output: [
        "BankLabel  Capacity     DeviceLocator  Manufacturer     PartNumber         Speed",
        "BANK 0     17179869184  DIMM 1         Micron           MTC8C1084S1SC      5600",
        "BANK 1     17179869184  DIMM 2         Micron           MTC8C1084S1SC      5600",
        "BANK 2     17179869184  DIMM 3         Crucial          CT16G56C46U5       5600",
        "BANK 3     17179869184  DIMM 4         Micron           MTC8C1084S1SC      5600",
      ],
    },
    {
      id: "out-mdsched-pre",
      command: "mdsched",
      match: ["mdsched", "mdsched.exe", "Get-WinEvent -ProviderName Microsoft-Windows-MemoryDiagnostics-Results"],
      phase: "pre",
      isKeyCommand: true,
      revealsEvidence: ["ev-mem-errors"],
      output: [
        "Windows Memory Diagnostic Results (Event ID 1101):",
        "=======================================================================",
        "Log Name:      System",
        "Source:        Microsoft-Windows-MemoryDiagnostics-Results",
        "Event ID:      1101",
        "Description:   The Windows Memory Diagnostic tested the computer's memory",
        "               and detected hardware errors.",
        "Error Details: Physical Address Range: 0x0000000C10000000 - 0x0000000C80000000",
        "Failed Bank:   Channel B, Slot 1 (DIMM 3)",
      ],
    },
    {
      id: "out-mdsched-post",
      command: "mdsched",
      match: ["mdsched", "mdsched.exe", "Get-WinEvent -ProviderName Microsoft-Windows-MemoryDiagnostics-Results"],
      phase: "post",
      output: [
        "Windows Memory Diagnostic Results (Event ID 1201):",
        "=======================================================================",
        "Log Name:      System",
        "Source:        Microsoft-Windows-MemoryDiagnostics-Results",
        "Event ID:      1201",
        "Description:   The Windows Memory Diagnostic tested the computer's memory",
        "               and detected no hardware errors.",
        "Pass Count:    2 passes completed without memory anomalies.",
      ],
    },
    {
      id: "out-systeminfo",
      command: "systeminfo",
      match: ["systeminfo"],
      revealsEvidence: ["ev-uptime-crashes"],
      output: [
        "Host Name:                 CAD-WS-02",
        "OS Name:                   Microsoft Windows 11 Pro for Workstations",
        "System Manufacturer:       Dell Inc.",
        "System Model:              Precision 3660 Tower",
        "System Boot Time:          09/18/2026, 09:12:44 AM (1 hour ago)",
        "Total Physical Memory:     65,536 MB",
        "Available Physical Memory: 58,110 MB",
        "Hotfix(s):                 14 Hotfix(s) Installed.",
      ],
    },
  ],

  evidence: [
    {
      id: "ev-ticket-summary",
      category: "user-report",
      label: "Ticket summary",
      detail: "Samantha's CAD computer bluescreens with MEMORY_MANAGEMENT during 3D model renders.",
    },
    {
      id: "ev-mem-errors",
      category: "system",
      isKey: true,
      label: "Memory Diagnostic found hardware errors in DIMM 3",
      detail: "Event 1101 records physical hardware memory corruption localized to Channel B, Slot 1 (DIMM 3).",
    },
    {
      id: "ev-ram-dimms",
      category: "system",
      label: "Workstation has 4x 16GB DDR5 memory modules installed",
      detail: "Slot 3 has a mismatched third-party Crucial stick, while the others are OEM Micron.",
    },
    {
      id: "ev-uptime-crashes",
      category: "system",
      label: "Short system uptime indicates recent crash reboot",
      detail: "Workstation rebooted within the last hour following the latest crash.",
    },
  ],

  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    {
      id: "q-when-crash-occurs",
      question: "Does the computer crash when doing simple tasks like email or word processing?",
      answer: "Never for simple tasks. It exclusively happens when I start a Raytracing render in Revit that consumes 50GB+ of RAM.",
      isKey: true,
      revealsEvidence: ["ev-uptime-crashes"],
    },
    {
      id: "q-ram-upgrade",
      question: "Was the RAM in this machine recently upgraded or changed?",
      answer: "An intern added a 16GB stick last month so I could render larger hotel floor plans.",
    },
  ],

  diagnosisOptions: [
    {
      id: "diag-faulty-dimm3",
      label: "Hardware defect in RAM module located in DIMM slot 3, causing address corruptions and MEMORY_MANAGEMENT BSODs.",
      isCorrect: true,
    },
    {
      id: "diag-corrupt-gpu-driver",
      label: "Corrupted NVIDIA Studio GPU graphics driver.",
      isCorrect: false,
    },
    {
      id: "diag-failing-ssd",
      label: "NVMe solid state drive bad sectors causing paging file read timeouts.",
      isCorrect: false,
    },
  ],

  resolutionOptions: [
    {
      id: "res-replace-ram",
      label: "Power down workstation, disconnect AC power, reseat/replace the defective DDR5 module in DIMM slot 3, and rerun mdsched.",
      isCorrect: true,
    },
    {
      id: "res-reinstall-revit",
      label: "Uninstall and reinstall Autodesk Revit and clear temporary model caches.",
      isCorrect: false,
      simulatedConsequence: "Reinstalled Revit, but physical memory error triggered BSOD on next large render.",
      efficiencyPenalty: 5,
    },
    {
      id: "res-increase-pagefile",
      label: "Set virtual memory paging file size to 128 GB on the C: drive.",
      isCorrect: false,
      simulatedConsequence: "Increased pagefile, but physical RAM hardware errors still crashed the kernel.",
      efficiencyPenalty: 4,
    },
  ],

  verification: {
    prompt: "Run mdsched diagnostic results to verify that zero memory hardware errors are detected across all installed DIMMs.",
    expectedOutputId: "out-mdsched-post",
    successMessage: "Memory diagnostic passed with 2 complete passes and zero errors after replacing the faulty RAM module.",
  },

  hints: [
    { id: "h-1", text: "MEMORY_MANAGEMENT (0x1A) BSODs occurring under heavy memory load strongly suggest physical RAM defects.", cost: 2 },
    { id: "h-2", text: "Inspect memory diagnostic results with 'mdsched' or query Event ID 1101 in the System event log.", cost: 4 },
    { id: "h-3", text: "DIMM 3 failed hardware memory testing. Replace the defective RAM stick in slot 3.", cost: 7 },
  ],

  scoring: {
    investigationMax: 20,
    evidenceMax: 15,
    diagnosisMax: 25,
    resolutionMax: 20,
    verificationMax: 10,
    efficiencyMax: 10,
  },

  skills: ["RAM Testing", "BSOD Diagnosis", "mdsched", "Hardware Replacement", "DIMM Mapping"],
  tags: ["Hardware", "RAM", "BSOD", "Windows"],
};
