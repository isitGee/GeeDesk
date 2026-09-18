import type { Scenario } from "../../types/scenario";

export const hw3006: Scenario = {
  id: "hw-3006",
  ticketNumber: "HW-3006",
  title: "Desktop computer runs extremely sluggishly and shuts down without warning",
  category: "Hardware",
  difficulty: "beginner",
  user: { name: "Carl Weaver", role: "Quality Inspector", department: "Manufacturing" },
  ticketDescription:
    "My shop floor PC (MFG-INSP-01) has become unbearably slow over the past week. Just opening an Excel spreadsheet takes 45 seconds, mouse movements lag across the screen, and the PC abruptly powers off with a black screen after about 20 minutes of use.",
  symptoms: [
    "Extreme mouse stutter and severe OS sluggishness",
    "PC shuts down abruptly without generating a BSOD crash dump",
    "CPU core clock throttled down to minimum base frequency (0.79 GHz)",
  ],
  hiddenFault:
    "The CPU cooler 4-pin PWM fan header on the motherboard came loose during shop floor relocation, and the heatsink fins are clogged with industrial textile dust, causing the Intel Core i7 CPU to hit 100°C and thermal throttle down to 800MHz before thermal trip-shutdown.",
  availableCommands: ["wmic", "powershell", "tasklist"],

  terminalOutputs: [
    {
      id: "out-wmic-cpu-pre",
      command: "wmic",
      match: ["wmic cpu get", "wmic cpu get currentclockspeed,maxclockspeed,loadpercentage", "wmic cpu"],
      phase: "pre",
      isKeyCommand: true,
      revealsEvidence: ["ev-cpu-throttling"],
      output: [
        "CurrentClockSpeed  LoadPercentage  MaxClockSpeed  Name",
        "792                100             3600           12th Gen Intel(R) Core(TM) i7-12700",
      ],
    },
    {
      id: "out-wmic-cpu-post",
      command: "wmic",
      match: ["wmic cpu get", "wmic cpu get currentclockspeed,maxclockspeed,loadpercentage", "wmic cpu"],
      phase: "post",
      output: [
        "CurrentClockSpeed  LoadPercentage  MaxClockSpeed  Name",
        "3610               12              3600           12th Gen Intel(R) Core(TM) i7-12700",
      ],
    },
    {
      id: "out-ps-thermal-pre",
      command: "powershell",
      match: [
        "powershell Get-CimInstance -Namespace root/wmi -ClassName MSAcpi_ThermalZoneTemperature",
        "Get-CimInstance -Namespace root/wmi -ClassName MSAcpi_ThermalZoneTemperature",
        "powershell thermal",
      ],
      phase: "pre",
      isKeyCommand: true,
      revealsEvidence: ["ev-thermal-100c"],
      output: [
        "Active             : True",
        "CurrentTemperature : 3732  (100.05 Celsius / 212.09 Fahrenheit)",
        "CriticalTripPoint  : 3782  (105.05 Celsius / 221.09 Fahrenheit)",
        "ThrottlePoint      : 3682  (95.05 Celsius)",
        "InstanceName       : ACPI\\ThermalZone\\TZ00_0",
      ],
    },
    {
      id: "out-ps-thermal-post",
      command: "powershell",
      match: [
        "powershell Get-CimInstance -Namespace root/wmi -ClassName MSAcpi_ThermalZoneTemperature",
        "Get-CimInstance -Namespace root/wmi -ClassName MSAcpi_ThermalZoneTemperature",
        "powershell thermal",
      ],
      phase: "post",
      output: [
        "Active             : True",
        "CurrentTemperature : 3132  (40.05 Celsius / 104.09 Fahrenheit)",
        "CriticalTripPoint  : 3782  (105.05 Celsius / 221.09 Fahrenheit)",
        "ThrottlePoint      : 3682  (95.05 Celsius)",
        "InstanceName       : ACPI\\ThermalZone\\TZ00_0",
      ],
    },
    {
      id: "out-tasklist",
      command: "tasklist",
      match: ["tasklist", "tasklist /v"],
      revealsEvidence: ["ev-normal-processes"],
      output: [
        "Image Name                     PID Session Name        Session#    Mem Usage",
        "========================= ======== ================ =========== ============",
        "System Idle Process              0 Services                   0          8 K",
        "System                           4 Services                   0        148 K",
        "dwm.exe                       1120 Console                    1     45,210 K",
        "explorer.exe                  4112 Console                    1     84,210 K",
        "excel.exe                     6210 Console                    1    110,400 K",
      ],
    },
  ],

  evidence: [
    {
      id: "ev-ticket-summary",
      category: "user-report",
      label: "Ticket summary",
      detail: "Carl's shop floor computer suffers severe stutter, clock throttling, and sudden thermal blackouts.",
    },
    {
      id: "ev-cpu-throttling",
      category: "system",
      isKey: true,
      label: "CPU clock throttled to 792 MHz (0.79 GHz)",
      detail: "The 3.6 GHz Intel Core i7 CPU is heavily downclocked to its lowest power-state frequency.",
    },
    {
      id: "ev-thermal-100c",
      category: "system",
      isKey: true,
      label: "Thermal zone temperature reached 100°C (3732 Kelvin)",
      detail: "The processor is pegged at thermal throttle limit (100°C), within 5°C of hardware critical shutdown.",
    },
    {
      id: "ev-normal-processes",
      category: "system",
      label: "No rogue crypto-mining or high-CPU runaway processes",
      detail: "Running process list shows standard Windows desktop services and Microsoft Excel.",
    },
  ],

  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    {
      id: "q-fan-noise",
      question: "Do you hear the internal fans spinning loudly when the machine gets slow?",
      answer: "No, actually it is strangely dead silent. I used to hear a whooshing fan hum, but now nothing.",
      isKey: true,
      revealsEvidence: ["ev-thermal-100c"],
    },
    {
      id: "q-shop-environment",
      question: "Is this machine located near manufacturing equipment or fabric cutters?",
      answer: "Yes, it sits right next to the textile trimming station on the factory floor.",
    },
  ],

  diagnosisOptions: [
    {
      id: "diag-thermal-throttling",
      label: "Severe thermal throttling caused by disconnected/non-functional CPU fan and dust buildup, forcing the CPU to 0.79 GHz.",
      isCorrect: true,
    },
    {
      id: "diag-ransomware-mining",
      label: "Host compromised with background cryptocurrency miner exhausting processor cycles.",
      isCorrect: false,
    },
    {
      id: "diag-hdd-failure",
      label: "Magnetic mechanical hard drive read head degradation.",
      isCorrect: false,
    },
  ],

  resolutionOptions: [
    {
      id: "res-clean-reconnect-fan",
      label: "Open chassis, blow out heatsink dust with compressed air, reconnect CPU_FAN 4-pin PWM header, and verify fan spins up.",
      isCorrect: true,
    },
    {
      id: "res-format-windows",
      label: "Wipe hard drive and perform a clean reinstallation of Windows 11.",
      isCorrect: false,
      simulatedConsequence: "Windows installation halted halfway through because the overheating CPU shut down mid-install.",
      efficiencyPenalty: 7,
    },
    {
      id: "res-disable-c-states",
      label: "Enter BIOS and disable Intel SpeedStep and C-States to force 3.6 GHz clock speed.",
      isCorrect: false,
      simulatedConsequence: "Forcing full clock speed with no cooling caused immediate shutdown within 45 seconds.",
      efficiencyPenalty: 6,
    },
  ],

  verification: {
    prompt: "Query thermal zone temperature and CPU clock speed to confirm temperatures normalized (~40°C) and clocks returned to 3.6 GHz.",
    expectedOutputId: "out-ps-thermal-post",
    successMessage: "CPU temperature dropped from 100°C to 40°C; thermal throttling resolved with full clock restoration.",
  },

  hints: [
    { id: "h-1", text: "When modern CPUs overheat, they downclock to 800MHz before triggering a thermal emergency power cut.", cost: 2 },
    { id: "h-2", text: "Inspect thermal zone temperature using PowerShell 'MSAcpi_ThermalZoneTemperature'.", cost: 4 },
    { id: "h-3", text: "The CPU is at 100°C because the fan is unplugged. Clean the heatsink and plug the fan into the CPU_FAN header.", cost: 7 },
  ],

  scoring: {
    investigationMax: 20,
    evidenceMax: 15,
    diagnosisMax: 25,
    resolutionMax: 20,
    verificationMax: 10,
    efficiencyMax: 10,
  },

  skills: ["Thermal Management", "CPU Throttling", "Hardware Diagnostics", "PowerShell CIM", "Cooling"],
  tags: ["Hardware", "CPU", "Thermal", "Cooling", "Performance"],
};
