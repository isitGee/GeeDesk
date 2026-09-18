import type { Scenario } from "../../types/scenario";

export const win2009: Scenario = {
  id: "win-2009",
  ticketNumber: "WIN-2009",
  title: "Group Policy fails to update with 'The processing of Group Policy failed. Kerberos error'",
  category: "Windows",
  difficulty: "advanced",
  user: { name: "Rajesh Patel", role: "Systems Specialist", department: "IT Operations" },
  ticketDescription:
    "A computer in the lab (LAB-PC-04) cannot authenticate to network shared drives and gpupdate /force fails immediately with an Event ID 1058 saying 'The processing of Group Policy failed. Windows could not authenticate to the Active Directory service on domain controller.'",
  symptoms: [
    "gpupdate /force fails with Kerberos authentication failure",
    "Accessing \\\\geedesk.local\\sysvol returns 'The target principal name is incorrect'",
    "Active Directory user login works only with cached credentials",
  ],
  hiddenFault:
    "The CMOS battery on LAB-PC-04 failed during a weekend power maintenance, causing the local hardware system clock to drift 22 minutes behind the domain controller. Kerberos default maximum tolerance for computer clock synchronization is 5 minutes.",
  availableCommands: ["w32tm", "gpupdate", "ping"],

  terminalOutputs: [
    {
      id: "out-w32tm-pre",
      command: "w32tm",
      match: ["w32tm /query /status", "w32tm /query /peers", "w32tm /monitor"],
      phase: "pre",
      isKeyCommand: true,
      revealsEvidence: ["ev-clock-skew"],
      output: [
        "Leap Indicator: 0(no warning)",
        "Stratum: 0 (unspecified)",
        "Precision: -23 (119.209ns per tick)",
        "Root Delay: 0.0000000s",
        "Root Dispersion: 10.0000000s",
        "ReferenceId: 0x00000000 (unspecified)",
        "Last Successful Sync Time: 09/15/2026 08:14:02 AM",
        "Source: Free-running System Clock",
        "Poll Interval: 10 (1024s)",
        "Phase Offset: -1322.4182900s (-22.04 minutes from DC1.geedesk.local)",
      ],
    },
    {
      id: "out-w32tm-post",
      command: "w32tm",
      match: ["w32tm /query /status", "w32tm /query /peers", "w32tm /monitor"],
      phase: "post",
      output: [
        "Leap Indicator: 0(no warning)",
        "Stratum: 3 (secondary reference - syncd by (S)NTP)",
        "Precision: -23 (119.209ns per tick)",
        "Root Delay: 0.0214820s",
        "Root Dispersion: 0.0351294s",
        "ReferenceId: 0xC0A80105 (DC1.geedesk.local)",
        "Last Successful Sync Time: 09/18/2026 10:14:22 AM",
        "Source: DC1.geedesk.local",
        "Poll Interval: 6 (64s)",
        "Phase Offset: 0.0002190s",
      ],
    },
    {
      id: "out-gpupdate-pre",
      command: "gpupdate",
      match: ["gpupdate /force", "gpupdate"],
      phase: "pre",
      output: [
        "Updating policy...",
        "",
        "Computer Policy update has completed successfully.",
        "User Policy could not be updated successfully. The following errors were encountered:",
        "",
        "The processing of Group Policy failed. Windows could not authenticate to the Active Directory service on domain controller. (Event ID 1058: Kerberos authentication ticket expired or invalid time skew).",
      ],
    },
    {
      id: "out-gpupdate-post",
      command: "gpupdate",
      match: ["gpupdate /force", "gpupdate"],
      phase: "post",
      output: [
        "Updating policy...",
        "",
        "Computer Policy update has completed successfully.",
        "User Policy update has completed successfully.",
        "",
        "Group Policy was successfully refreshed across both machine and user contexts.",
      ],
    },
    {
      id: "out-ping-dc",
      command: "ping",
      match: ["ping DC1.geedesk.local", "ping 192.168.1.5", "ping geedesk.local"],
      revealsEvidence: ["ev-dc-reachable"],
      output: [
        "Pinging DC1.geedesk.local [192.168.1.5] with 32 bytes of data:",
        "Reply from 192.168.1.5: bytes=32 time=1ms TTL=128",
        "Reply from 192.168.1.5: bytes=32 time=1ms TTL=128",
        "Ping statistics for 192.168.1.5: Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)",
      ],
    },
  ],

  evidence: [
    {
      id: "ev-ticket-summary",
      category: "user-report",
      label: "Ticket summary",
      detail: "Rajesh reports LAB-PC-04 cannot authenticate to SYSVOL; gpupdate fails with Kerberos error.",
    },
    {
      id: "ev-clock-skew",
      category: "system",
      isKey: true,
      label: "System time is 22 minutes behind Domain Controller",
      detail: "w32tm status reveals a phase offset of -1322 seconds (> 22 minutes) and source 'Free-running System Clock'.",
    },
    {
      id: "ev-dc-reachable",
      category: "network",
      label: "Domain Controller network reachability is healthy",
      detail: "Pinging DC1.geedesk.local responds in 1ms with 0% packet loss.",
    },
    {
      id: "ev-power-maintenance",
      category: "conversation",
      label: "Lab building had full power shutdown over the weekend",
      detail: "Rajesh notes this desktop had its power cord pulled from the wall for 48 hours during facility breaker testing.",
    },
  ],

  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    {
      id: "q-lab-events",
      question: "Was this lab machine moved or unplugged recently?",
      answer: "Yes, facility electricians shut down power in Lab B all weekend, so it sat completely unpowered.",
      isKey: true,
      revealsEvidence: ["ev-power-maintenance"],
    },
    {
      id: "q-other-lab-pcs",
      question: "Are other workstations in Lab B experiencing Group Policy errors?",
      answer: "No, the other newer Dell units updated fine; this one is an older custom build.",
    },
  ],

  diagnosisOptions: [
    {
      id: "diag-kerberos-time-skew",
      label: "Kerberos authentication failure caused by excessive clock skew (system time drifted 22 minutes behind DC).",
      isCorrect: true,
    },
    {
      id: "diag-computer-account-deleted",
      label: "The computer trust relationship broken because the machine account was deleted in Active Directory.",
      isCorrect: false,
    },
    {
      id: "diag-sysvol-permission",
      label: "SYSVOL NTFS file share permissions corrupted on the domain controller.",
      isCorrect: false,
    },
  ],

  resolutionOptions: [
    {
      id: "res-sync-time",
      label: "Resynchronize system clock with domain hierarchy using 'w32tm /resync /rediscover', then run 'gpupdate /force'.",
      isCorrect: true,
    },
    {
      id: "res-disjoin-domain",
      label: "Disjoin the machine from geedesk.local into a WORKGROUP and reboot.",
      isCorrect: false,
      simulatedConsequence: "Machine removed from domain; now blocked from all domain credentials and Kerberos tickets.",
      efficiencyPenalty: 6,
    },
    {
      id: "res-delete-gpo-cache",
      label: "Delete C:\\Windows\\System32\\GroupPolicy folder and reboot.",
      isCorrect: false,
      simulatedConsequence: "Local cached policy deleted; machine still unable to authenticate to DC to fetch new GPOs.",
      efficiencyPenalty: 5,
    },
  ],

  verification: {
    prompt: "Run gpupdate /force to confirm both User and Computer policies process and update successfully.",
    expectedOutputId: "out-gpupdate-post",
    successMessage: "Group Policy updated successfully across machine and user contexts after Kerberos time synchronization.",
  },

  hints: [
    { id: "h-1", text: "Kerberos relies on synchronized timestamps between client and KDC to prevent replay attacks.", cost: 2 },
    { id: "h-2", text: "Check time synchronization status with 'w32tm /query /status'.", cost: 4 },
    { id: "h-3", text: "The clock is 22 minutes behind. Run 'w32tm /resync /rediscover' to sync with the domain controller.", cost: 7 },
  ],

  scoring: {
    investigationMax: 20,
    evidenceMax: 15,
    diagnosisMax: 25,
    resolutionMax: 20,
    verificationMax: 10,
    efficiencyMax: 10,
  },

  skills: ["Kerberos", "Active Directory", "W32tm", "Time Synchronization", "Group Policy"],
  tags: ["Windows", "Kerberos", "Active Directory", "Group Policy", "Security"],
};
