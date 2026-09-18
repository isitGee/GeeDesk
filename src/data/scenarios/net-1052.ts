import type { Scenario } from "../../types/scenario";

export const net1052: Scenario = {
  id: "net-1052",
  ticketNumber: "NET-1052",
  title: "Corporate Wi-Fi authentication fails with valid credentials",
  category: "Networking",
  difficulty: "intermediate",
  user: { name: "Marcus Brody", role: "Field Engineer", department: "Operations" },
  ticketDescription:
    "I came back from a two-week field assignment and my laptop won't connect to 'CorpNet-Secure'. It immediately prompts for login and says 'Can't connect to this network' after entering my correct Active Directory credentials.",
  symptoms: [
    "Laptop fails to associate with WPA2-Enterprise SSID 'CorpNet-Secure'",
    "Active Directory credentials work fine for local laptop login",
    "Guest Wi-Fi works but lacks access to internal production servers",
  ],
  hiddenFault:
    "The corporate RADIUS server root certificate installed in the laptop's Trusted Root Certification Authorities store expired while Marcus was in the field. 802.1X PEAP authentication is rejecting the server certificate validation.",
  availableCommands: ["netsh", "ping", "ipconfig"],

  terminalOutputs: [
    {
      id: "out-netsh-wlan-pre",
      command: "netsh",
      match: ["netsh wlan show interfaces", "netsh wlan show int"],
      phase: "pre",
      isKeyCommand: true,
      revealsEvidence: ["ev-wlan-disconnected"],
      output: [
        "There is 1 interface on the system:",
        "",
        "    Name                   : Wi-Fi",
        "    Description            : Intel(R) Wi-Fi 6 AX201 160MHz",
        "    GUID                   : {a1b2c3d4-e5f6-7890-1234-56789abcdef0}",
        "    State                  : disconnected",
        "    Radio status           : Hardware On, Software On",
      ],
    },
    {
      id: "out-netsh-wlan-post",
      command: "netsh",
      match: ["netsh wlan show interfaces", "netsh wlan show int"],
      phase: "post",
      output: [
        "There is 1 interface on the system:",
        "",
        "    Name                   : Wi-Fi",
        "    Description            : Intel(R) Wi-Fi 6 AX201 160MHz",
        "    State                  : connected",
        "    SSID                   : CorpNet-Secure",
        "    BSSID                  : 00:1a:2b:3c:4d:5e",
        "    Network type           : Infrastructure",
        "    Radio type             : 802.11ax",
        "    Authentication         : WPA2-Enterprise",
        "    Cipher                 : CCMP",
        "    Connection mode        : Profile",
        "    Channel                : 36",
        "    Receive rate (Mbps)    : 866",
        "    Transmit rate (Mbps)   : 866",
        "    Signal                 : 94%",
      ],
    },
    {
      id: "out-netsh-report",
      command: "netsh",
      match: ["netsh wlan show wlanreport", "netsh wlan show profile CorpNet-Secure", "netsh wlan show profile"],
      isKeyCommand: true,
      revealsEvidence: ["ev-cert-expired"],
      output: [
        "Profile CorpNet-Secure on interface Wi-Fi:",
        "=======================================================================",
        "Type                   : Wireless LAN",
        "Authentication         : WPA2-Enterprise",
        "Encryption             : AES",
        "EAP type               : Microsoft: Protected EAP (PEAP)",
        "Validate server cert   : Yes",
        "Trusted Root CA        : 'Corp-Intermediate-CA-2024' [EXPIRED 4 DAYS AGO]",
        "Authentication method  : Secured password (EAP-MSCHAP v2)",
      ],
    },
    {
      id: "out-ipconfig-pre",
      command: "ipconfig",
      match: ["ipconfig", "ipconfig /all"],
      phase: "pre",
      output: [
        "Windows IP Configuration",
        "",
        "Wireless LAN adapter Wi-Fi:",
        "   Media State . . . . . . . . . . . : Media disconnected",
        "   Connection-specific DNS Suffix  . :",
      ],
    },
    {
      id: "out-ipconfig-post",
      command: "ipconfig",
      match: ["ipconfig", "ipconfig /all"],
      phase: "post",
      output: [
        "Windows IP Configuration",
        "",
        "Wireless LAN adapter Wi-Fi:",
        "   Connection-specific DNS Suffix  . : geedesk.local",
        "   IPv4 Address. . . . . . . . . . . : 10.40.12.105",
        "   Subnet Mask . . . . . . . . . . . : 255.255.254.0",
        "   Default Gateway . . . . . . . . . : 10.40.12.1",
        "   DNS Servers . . . . . . . . . . . : 10.10.1.5",
      ],
    },
    {
      id: "out-ping-pre",
      command: "ping",
      match: ["ping 10.10.1.5", "ping 10.40.12.1"],
      phase: "pre",
      output: [
        "Pinging 10.10.1.5 with 32 bytes of data:",
        "PING: transmit failed. General failure.",
        "PING: transmit failed. General failure.",
      ],
    },
    {
      id: "out-ping-post",
      command: "ping",
      match: ["ping 10.10.1.5", "ping 10.40.12.1"],
      phase: "post",
      output: [
        "Pinging 10.10.1.5 with 32 bytes of data:",
        "Reply from 10.10.1.5: bytes=32 time=3ms TTL=126",
        "Reply from 10.10.1.5: bytes=32 time=2ms TTL=126",
        "Ping statistics for 10.10.1.5: Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)",
      ],
    },
  ],

  evidence: [
    {
      id: "ev-ticket-summary",
      category: "user-report",
      label: "Ticket summary",
      detail: "Marcus Brody cannot connect to CorpNet-Secure Wi-Fi after returning from field assignment.",
    },
    {
      id: "ev-wlan-disconnected",
      category: "network",
      label: "Wi-Fi interface media state is disconnected",
      detail: "The Intel AX201 wireless radio is active and powered on, but currently not associated.",
    },
    {
      id: "ev-cert-expired",
      category: "system",
      isKey: true,
      label: "Trusted Root CA certificate expired",
      detail: "The 802.1X PEAP profile specifies 'Corp-Intermediate-CA-2024' which expired 4 days ago.",
    },
    {
      id: "ev-user-phone-works",
      category: "conversation",
      label: "Colleagues have working Wi-Fi",
      detail: "Marcus confirms teammates who remained in the office received an updated CA certificate automatically via Group Policy.",
    },
  ],

  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    {
      id: "q-field-duration",
      question: "How long has this machine been disconnected from the office network?",
      answer: "I was off-site for two weeks without connecting to VPN because I only used local data collection software.",
      isKey: true,
      revealsEvidence: ["ev-user-phone-works"],
    },
    {
      id: "q-guest-wifi",
      question: "Can you connect to the Guest Wi-Fi network temporarily?",
      answer: "Yes, Guest Wi-Fi connects immediately with a captive portal, but I cannot reach internal file shares.",
    },
  ],

  diagnosisOptions: [
    {
      id: "diag-expired-ca",
      label: "802.1X PEAP authentication failed due to an expired Trusted Root CA certificate on the laptop.",
      isCorrect: true,
    },
    {
      id: "diag-bad-password",
      label: "Active Directory user account is locked out from invalid password attempts.",
      isCorrect: false,
    },
    {
      id: "diag-faulty-wlan-driver",
      label: "Hardware driver failure on Intel AX201 wireless network adapter.",
      isCorrect: false,
    },
    {
      id: "diag-wlan-disabled",
      label: "Physical Wi-Fi radio hardware kill switch is turned off.",
      isCorrect: false,
    },
  ],

  resolutionOptions: [
    {
      id: "res-import-ca",
      label: "Connect laptop to Guest network/Ethernet, update Group Policy with gpupdate /force to install valid CA cert, then reconnect.",
      isCorrect: true,
    },
    {
      id: "res-disable-wlan",
      label: "Uninstall the wireless network adapter from Device Manager and reboot.",
      isCorrect: false,
      simulatedConsequence: "Driver reinstalled with generic defaults; 802.1X profile still refuses validation.",
      efficiencyPenalty: 4,
    },
    {
      id: "res-reset-ad-pass",
      label: "Reset Marcus Brody's domain password in Active Directory.",
      isCorrect: false,
      simulatedConsequence: "Password changed, but certificate validation error remains unchanged.",
      efficiencyPenalty: 5,
    },
  ],

  verification: {
    prompt: "Run a command that verifies the Wi-Fi interface is securely associated to CorpNet-Secure.",
    expectedOutputId: "out-netsh-wlan-post",
    successMessage: "Wi-Fi is now connected to CorpNet-Secure with 802.1X WPA2-Enterprise authentication.",
  },

  hints: [
    { id: "h-1", text: "802.1X Enterprise Wi-Fi validates server identity before sending user credentials.", cost: 2 },
    { id: "h-2", text: "Check wireless profile details with 'netsh wlan show profile CorpNet-Secure'.", cost: 4 },
    { id: "h-3", text: "An expired Root CA certificate causes PEAP handshake rejection. Update certificates via gpupdate.", cost: 7 },
  ],

  scoring: {
    investigationMax: 20,
    evidenceMax: 15,
    diagnosisMax: 25,
    resolutionMax: 20,
    verificationMax: 10,
    efficiencyMax: 10,
  },

  skills: ["802.1X", "PEAP", "WPA2-Enterprise", "Certificates", "Wireless Troubleshooting"],
  tags: ["Wi-Fi", "Networking", "Certificates", "Security"],
};
