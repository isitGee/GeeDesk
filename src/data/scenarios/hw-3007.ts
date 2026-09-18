import type { Scenario } from "../../types/scenario";

export const hw3007: Scenario = {
  id: "hw-3007",
  ticketNumber: "HW-3007",
  title: "External monitors on USB-C docking station mirror each other instead of extending",
  category: "Hardware",
  difficulty: "beginner",
  user: { name: "Danielle Cooper", role: "Product Manager", department: "Product" },
  ticketDescription:
    "I connected my new company laptop to the dual-monitor USB-C dock at my desk. Both 27-inch Dell displays show the exact same cloned image. In Windows Display Settings, it only detects one display labeled '1|2' and the option to 'Extend desktop to this display' is completely grayed out.",
  symptoms: [
    "Two external monitors display mirrored output with no option to extend",
    "Windows Display Settings lists only Display 1 and Display 2 (combined as one display ID)",
    "Mouse and keyboard plugged into the same dock work without issue",
  ],
  hiddenFault:
    "The USB-C cable Danielle used to connect her laptop to the docking station is a standard charging-only / USB 2.0 cable, which lacks the high-speed differential pairs required for DisplayPort Multi-Stream Transport (MST) dual-display tunneling.",
  availableCommands: ["devcon", "wmic", "powershell"],

  terminalOutputs: [
    {
      id: "out-wmic-displays-pre",
      command: "wmic",
      match: ["wmic desktopmonitor get", "wmic desktopmonitor", "wmic path Win32_PnPEntity where \"service='monitor'\""],
      phase: "pre",
      isKeyCommand: true,
      revealsEvidence: ["ev-single-display-sink"],
      output: [
        "DeviceID           DisplayType      MonitorManufacturer  Name",
        "DesktopMonitor1    Internal LCD     Generic PnP Monitor  Wide viewing angle & High density FlexView Display",
        "DesktopMonitor2    External MST     Dell Inc.            DELL U2723QE (Cloned via Single DP Lane)",
      ],
    },
    {
      id: "out-wmic-displays-post",
      command: "wmic",
      match: ["wmic desktopmonitor get", "wmic desktopmonitor", "wmic path Win32_PnPEntity where \"service='monitor'\""],
      phase: "post",
      output: [
        "DeviceID           DisplayType      MonitorManufacturer  Name",
        "DesktopMonitor1    Internal LCD     Generic PnP Monitor  Wide viewing angle & High density FlexView Display",
        "DesktopMonitor2    External DP-1    Dell Inc.            DELL U2723QE (Extended)",
        "DesktopMonitor3    External DP-2    Dell Inc.            DELL U2723QE (Extended)",
      ],
    },
    {
      id: "out-devcon-pre",
      command: "devcon",
      match: ["devcon status *USB*", "devcon hwids *TYPEC*", "devcon status"],
      phase: "pre",
      revealsEvidence: ["ev-usb-limited-bandwidth"],
      output: [
        "USB\\VID_0BDA&PID_5411\\6&2A1B3C4&0&1",
        "    Name: Generic SuperSpeed USB Hub",
        "    Device is operational.",
        "USB\\VID_04B4&PID_5220\\7&1C2D3E4&0&2",
        "    Name: Billboard Device (USB Type-C Alternate Mode Limited Bandwidth Negotiated: 480 Mbps)",
        "    Device has a warning: Alternate Mode DP Alt Mode fallback active.",
      ],
    },
    {
      id: "out-devcon-post",
      command: "devcon",
      match: ["devcon status *USB*", "devcon hwids *TYPEC*", "devcon status"],
      phase: "post",
      output: [
        "USB\\VID_0BDA&PID_5411\\6&2A1B3C4&0&1",
        "    Name: Generic SuperSpeed USB Hub",
        "    Device is operational.",
        "USB\\VID_04B4&PID_5220\\7&1C2D3E4&0&2",
        "    Name: USB Type-C Alternate Mode Active (Thunderbolt 4 / 40 Gbps Full Duplex Tunneling)",
        "    Device is operational.",
      ],
    },
    {
      id: "out-ps-gpu",
      command: "powershell",
      match: ["powershell Get-WmiObject Win32_VideoController", "Get-WmiObject Win32_VideoController"],
      revealsEvidence: ["ev-gpu-healthy"],
      output: [
        "Name               : Intel(R) Iris(R) Xe Graphics",
        "AdapterRAM         : 1073741824",
        "DriverVersion      : 31.0.101.4575",
        "Status             : OK",
        "VideoProcessor     : Intel(R) Iris(R) Xe Graphics Family (Supports up to 4 independent displays)",
      ],
    },
  ],

  evidence: [
    {
      id: "ev-ticket-summary",
      category: "user-report",
      label: "Ticket summary",
      detail: "Danielle's external monitors are mirroring each other; Windows Display Settings cannot extend desktop.",
    },
    {
      id: "ev-usb-limited-bandwidth",
      category: "system",
      isKey: true,
      label: "USB Type-C Billboard Device negotiated only 480 Mbps",
      detail: "The USB-C cable connection lacks high-speed DisplayPort lines, forcing a low-bandwidth fallback.",
    },
    {
      id: "ev-gpu-healthy",
      category: "system",
      label: "Intel Iris Xe GPU supports up to 4 displays",
      detail: "WMI video controller query confirms integrated graphics silicon supports multiple independent displays.",
    },
    {
      id: "ev-single-display-sink",
      category: "system",
      label: "OS sees only one external display output sink",
      detail: "Windows receives a single video stream which the dock is hardware-mirroring to both HDMI/DP ports.",
    },
    {
      id: "ev-white-cable",
      category: "conversation",
      label: "User grabbed a thin white cable from her phone charger",
      detail: "Danielle says she lost the thick black cable that came with the dock and substituted a white phone charging cable.",
    },
  ],

  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    {
      id: "q-dock-cable",
      question: "Which cable is connecting the dock to your laptop?",
      answer: "I couldn't find the cable in the dock box, so I used the white USB-C cable that came with my Google Pixel phone charger.",
      isKey: true,
      revealsEvidence: ["ev-white-cable"],
    },
    {
      id: "q-single-monitor",
      question: "If you unplug one monitor, does the other stay on?",
      answer: "Yes, whichever monitor is plugged in displays normally, but plugging in the second one just clones it.",
    },
  ],

  diagnosisOptions: [
    {
      id: "diag-usb2-cable",
      label: "USB-C cable used is a charge-only / USB 2.0 cable lacking the high-speed differential pairs required for DisplayPort MST video transmission.",
      isCorrect: true,
    },
    {
      id: "diag-gpu-does-not-support",
      label: "Intel Iris Xe integrated graphics hardware is incapable of driving more than one display.",
      isCorrect: false,
    },
    {
      id: "diag-monitors-incompatible",
      label: "Dell monitors require proprietary Apple Thunderbolt firmware.",
      isCorrect: false,
    },
  ],

  resolutionOptions: [
    {
      id: "res-replace-dock-cable",
      label: "Replace the phone charging cable with a certified Thunderbolt 4 / USB4 (40 Gbps) 100W cable with DisplayPort Alt Mode support.",
      isCorrect: true,
    },
    {
      id: "res-reinstall-intel-gpu",
      label: "Uninstall and reinstall Intel Iris Xe graphics driver in Device Manager.",
      isCorrect: false,
      simulatedConsequence: "Driver reinstalled; cable still physically incapable of carrying dual MST video streams.",
      efficiencyPenalty: 4,
    },
    {
      id: "res-lower-resolution",
      label: "Lower both monitor resolutions to 800x600 in Windows Display Settings.",
      isCorrect: false,
      simulatedConsequence: "Resolution degraded to blurry 800x600; monitors remain cloned.",
      efficiencyPenalty: 3,
    },
  ],

  verification: {
    prompt: "Query display hardware sinks to verify that two independent extended Dell U2723QE monitors are detected by Windows.",
    expectedOutputId: "out-wmic-displays-post",
    successMessage: "Both external Dell monitors are now independently recognized and extended across the desktop workspace.",
  },

  hints: [
    { id: "h-1", text: "Not all USB-C cables are created equal; many smartphone cables only support USB 2.0 (480 Mbps) data.", cost: 2 },
    { id: "h-2", text: "Check USB device bandwidth negotiation and Billboard warnings using 'devcon'.", cost: 4 },
    { id: "h-3", text: "Replace the thin phone charging cable with a certified 40Gbps Thunderbolt/USB4 cable.", cost: 7 },
  ],

  scoring: {
    investigationMax: 20,
    evidenceMax: 15,
    diagnosisMax: 25,
    resolutionMax: 20,
    verificationMax: 10,
    efficiencyMax: 10,
  },

  skills: ["USB-C", "Thunderbolt", "DisplayPort MST", "Docking Stations", "Hardware Cabling"],
  tags: ["Hardware", "Displays", "USB-C", "Monitors", "Cables"],
};
