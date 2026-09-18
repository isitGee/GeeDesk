import type { Scenario } from "../../types/scenario";

export const sec5005: Scenario = {
  id: "sec-5005",
  ticketNumber: "SEC-5005",
  title: "USB thumb drive shows in Device Manager but File Explorer says 'Access is Denied'",
  category: "Security",
  difficulty: "beginner",
  user: { name: "Gregory Lawson", role: "R&D Chemist", department: "Research" },
  ticketDescription:
    "I brought my personal SanDisk USB drive from home to copy some spectroscopy data files to analyze over the weekend. The drive lights up and shows up as drive E: in File Explorer, but when I double-click it, Windows gives an error: 'E:\\ is not accessible. Access is denied.'",
  symptoms: [
    "USB drive detected by hardware but access denied in Windows Explorer",
    "Device Manager shows 'SanDisk Ultra USB Device' is working properly",
    "User attempting to copy proprietary R&D data onto personal unencrypted media",
  ],
  hiddenFault:
    "Corporate Data Loss Prevention (DLP) Group Policy enforces RemovableStorageDevices:Deny_Write and Deny_Read permissions on all R&D laboratory endpoints to prevent intellectual property exfiltration and malware ingress.",
  availableCommands: ["gpresult", "powershell", "devcon"],

  terminalOutputs: [
    {
      id: "out-gpresult-dlp-pre",
      command: "gpresult",
      match: ["gpresult /r", "gpresult /v", "gpresult /scope computer"],
      phase: "pre",
      isKeyCommand: true,
      revealsEvidence: ["ev-usb-dlp-policy"],
      output: [
        "Applied Group Policy Objects",
        "-----------------------------------------",
        "    Default Domain Policy",
        "    Sec-Endpoint-Hardening-V4",
        "    DLP-Removable-Storage-Block-All",
        "",
        "The following GPOs were not applied because they were filtered out",
        "-----------------------------------------",
        "    None",
        "",
        "Component Status:",
        "    Removable Storage Access: Success",
        "    Configured Settings: Removable Disks: Deny write access = Enabled",
        "                         Removable Disks: Deny read access  = Enabled",
      ],
    },
    {
      id: "out-gpresult-dlp-post",
      command: "gpresult",
      match: ["gpresult /r", "gpresult /v", "gpresult /scope computer"],
      phase: "post",
      output: [
        "Applied Group Policy Objects",
        "-----------------------------------------",
        "    Default Domain Policy",
        "    Sec-Endpoint-Hardening-V4",
        "    DLP-Removable-Storage-Block-All",
        "",
        "Component Status:",
        "    Removable Storage Access: Success (Policy intact)",
        "    User Education Ticket Note: Security Exception Request Form Provided",
      ],
    },
    {
      id: "out-ps-usb-storage",
      command: "powershell",
      match: [
        "powershell Get-PnpDevice -Class 'DiskDrive'",
        "Get-PnpDevice -Class 'DiskDrive'",
        "powershell Get-Disk",
      ],
      revealsEvidence: ["ev-usb-hardware-ok"],
      output: [
        "Status   Class       FriendlyName               InstanceId",
        "------   -----       ------------               ----------",
        "OK       DiskDrive   NVMe Micron 3400 1TB       SCSI\\DISK&VEN_NVME...",
        "OK       DiskDrive   SanDisk Ultra USB Device   USBSTOR\\DISK&VEN_SANDISK...",
      ],
    },
    {
      id: "out-devcon-status",
      command: "devcon",
      match: ["devcon status USBSTOR*", "devcon status *SanDisk*"],
      output: [
        "USBSTOR\\DISK&VEN_SANDISK&PROD_ULTRA\\0101928374",
        "    Name: SanDisk Ultra USB Device",
        "    Driver is running.",
      ],
    },
  ],

  evidence: [
    {
      id: "ev-ticket-summary",
      category: "user-report",
      label: "Ticket summary",
      detail: "Gregory cannot open personal SanDisk USB drive in R&D lab; receives Access is Denied.",
    },
    {
      id: "ev-usb-dlp-policy",
      category: "system",
      isKey: true,
      label: "Active Group Policy 'DLP-Removable-Storage-Block-All' denies all USB read/write",
      detail: "Corporate security GPO explicitly disables Removable Storage read and write access across R&D workstations.",
    },
    {
      id: "ev-usb-hardware-ok",
      category: "system",
      label: "USB hardware device is fully functional and recognized by kernel",
      detail: "Hardware layers and PnP drivers are working properly; the block is enforced by OS security policy.",
    },
    {
      id: "ev-personal-thumb-drive",
      category: "conversation",
      label: "User brought unmanaged personal USB drive from home",
      detail: "Gregory confirms the thumb drive is personal property and is not BitLocker-encrypted by corporate IT.",
    },
  ],

  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    {
      id: "q-usb-origin",
      question: "Is this USB drive an encrypted corporate-issued device or personal property?",
      answer: "It's my personal thumb drive that I bought from Best Buy. I just wanted to work on research data at home.",
      isKey: true,
      revealsEvidence: ["ev-personal-thumb-drive"],
    },
    {
      id: "q-what-data",
      question: "What kind of files were you trying to transfer to the thumb drive?",
      answer: "Proprietary chemical synthesis formulas for our new patent application.",
    },
  ],

  diagnosisOptions: [
    {
      id: "diag-dlp-gpo",
      label: "Endpoint security Data Loss Prevention (DLP) Group Policy intentionally blocks unauthorized removable USB storage devices.",
      isCorrect: true,
    },
    {
      id: "diag-dead-usb-port",
      label: "Physical USB port voltage regulator burned out on the motherboard.",
      isCorrect: false,
    },
    {
      id: "diag-corrupt-exfat",
      label: "Corrupted exFAT partition table on the SanDisk drive.",
      isCorrect: false,
    },
  ],

  resolutionOptions: [
    {
      id: "res-explain-policy-sec-share",
      label: "Explain company DLP security policy against personal USB drives; direct user to submit an approved Data Transfer Request via secure OneDrive/VPN.",
      isCorrect: true,
    },
    {
      id: "res-bypass-gpo",
      label: "Modify the registry to disable DLP policy and grant Gregory local Administrator privileges.",
      isCorrect: false,
      simulatedConsequence: "Severe compliance violation: bypassed intellectual property safeguards on export-controlled chemical research.",
      efficiencyPenalty: 10,
    },
    {
      id: "res-format-usb",
      label: "Format Gregory's personal USB drive using diskpart clean.",
      isCorrect: false,
      simulatedConsequence: "Erased user's personal data without bypassing the GPO block.",
      efficiencyPenalty: 8,
    },
  ],

  verification: {
    prompt: "Run gpresult to verify the corporate DLP policy remains in effect while logging the security guidance note.",
    expectedOutputId: "out-gpresult-dlp-post",
    successMessage: "Security posture maintained: corporate DLP policy validated and compliant secure transfer method communicated.",
  },

  hints: [
    { id: "h-1", text: "When hardware is detected in Device Manager but Access is Denied in Explorer, check security policies.", cost: 2 },
    { id: "h-2", text: "Check applied Group Policy Objects using 'gpresult /r'. Look for Removable Storage restrictions.", cost: 4 },
    { id: "h-3", text: "This is expected security behavior. Personal USBs are blocked to prevent data theft. Guide the user to approved cloud storage.", cost: 7 },
  ],

  scoring: {
    investigationMax: 20,
    evidenceMax: 15,
    diagnosisMax: 25,
    resolutionMax: 20,
    verificationMax: 10,
    efficiencyMax: 10,
  },

  skills: ["DLP", "Group Policy", "Data Security", "gpresult", "Security Compliance"],
  tags: ["Security", "Group Policy", "DLP", "USB", "Compliance"],
};
