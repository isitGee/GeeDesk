export interface KBArticle {
  id: string;
  sopNumber: string;
  title: string;
  category: "Networking" | "Windows" | "Hardware" | "Security" | "Service Desk";
  readingTimeMinutes: number;
  tags: string[];
  summary: string;
  symptoms: string[];
  diagnosticSteps: {
    step: number;
    title: string;
    action: string;
    command?: string;
    expectedOutcome: string;
  }[];
  rootCauseAnalysis: string;
  remediation: string[];
  verification: string;
  relatedScenarios: string[];
}

export const KB_ARTICLES: KBArticle[] = [
  {
    id: "kb-dns-101",
    sopNumber: "SOP-101",
    title: "Troubleshooting DNS Name Resolution Failures",
    category: "Networking",
    readingTimeMinutes: 4,
    tags: ["dns", "networking", "nslookup", "ipconfig", "ccna"],
    summary:
      "A systematic procedure for determining whether network connectivity failures stem from Layer 3 IP routing issues or Layer 7 DNS name resolution timeouts.",
    symptoms: [
      "User reports 'Internet is down' or websites fail to load in browser.",
      "Internal applications accessible by raw IP (e.g., http://192.168.1.50) but fail by hostname (http://intranet.geedesk.local).",
      "nslookup times out with 'DNS request timed out' or returns 'Server: UnKnown'.",
    ],
    diagnosticSteps: [
      {
        step: 1,
        title: "Test Default Gateway Reachability",
        action: "Send 4 ICMP packets to the local gateway to rule out Layer 1/2 physical link failure.",
        command: "ping 192.168.1.1",
        expectedOutcome: "0% packet loss with <5ms round-trip time.",
      },
      {
        step: 2,
        title: "Test External IP Connectivity Without DNS",
        action: "Ping a known reliable public IP address directly to verify external routing is functioning.",
        command: "ping 8.8.8.8",
        expectedOutcome: "Successful replies confirming WAN routing is intact.",
      },
      {
        step: 3,
        title: "Verify Configured DNS Resolvers",
        action: "Inspect the active IPv4 adapter configuration to view currently assigned DNS servers.",
        command: "ipconfig /all",
        expectedOutcome: "Identify Primary and Secondary DNS IPs. Check if set to stale or invalid address.",
      },
      {
        step: 4,
        title: "Direct Name Resolution Test",
        action: "Query the configured DNS server directly for an external domain.",
        command: "nslookup google.com",
        expectedOutcome: "A non-authoritative answer with valid IPv4 address. If timed out, DNS server is dead or misconfigured.",
      },
    ],
    rootCauseAnalysis:
      "In enterprise environments, workstations frequently receive erroneous static DNS entries during manual setup or faulty GPO rollout. If the gateway answers and raw IP pings succeed, name resolution is the solitary failure point.",
    remediation: [
      "If statically set, reconfigure adapter IPv4 DNS to the legitimate corporate internal DNS server (or 1.1.1.1 / 8.8.8.8).",
      "If DHCP assigned, verify DHCP scope Option 006 on the Windows DHCP Server.",
      "Flush the client DNS cache using: ipconfig /flushdns.",
    ],
    verification: "Execute nslookup google.com followed by pinging a domain name. Confirm instant resolution.",
    relatedScenarios: ["net-1042", "net-1049"],
  },
  {
    id: "kb-dhcp-102",
    sopNumber: "SOP-102",
    title: "Diagnosing DHCP Failures & APIPA (169.254.x.x) Autoconfiguration",
    category: "Networking",
    readingTimeMinutes: 5,
    tags: ["dhcp", "apipa", "networking", "ipconfig", "vlan"],
    summary:
      "Guide for diagnosing why client devices fail to obtain a valid DHCP lease and fall back to an Automatic Private IP Addressing (APIPA) address in the 169.254.0.0/16 range.",
    symptoms: [
      "Adapter shows 'Unidentified network, no Internet access'.",
      "IPv4 Address displays as 169.254.X.X with subnet mask 255.255.0.0 and no Default Gateway.",
      "Workstation cannot communicate with any local subnet or gateway.",
    ],
    diagnosticSteps: [
      {
        step: 1,
        title: "Check IP Configuration",
        action: "Determine whether the adapter is holding a valid DHCP lease or an APIPA fallback address.",
        command: "ipconfig",
        expectedOutcome: "Notice 169.254.x.x address, confirming DORA (Discover, Offer, Request, Acknowledge) failed.",
      },
      {
        step: 2,
        title: "Release and Attempt Lease Renewal",
        action: "Force the Windows DHCP Client to discard current state and broadcast a new DHCPDISCOVER packet.",
        command: "ipconfig /release && ipconfig /renew",
        expectedOutcome: "Either assigns a valid LAN IP or times out with 'unable to contact your DHCP server'.",
      },
      {
        step: 3,
        title: "Verify Physical Link & Switch Port VLAN",
        action: "Check switchport VLAN membership. If the switchport was assigned to an empty, deactivated, or trunked VLAN lacking an active DHCP helper, broadcasts will go unanswered.",
        expectedOutcome: "Ensure the switch port is in access mode on the user VLAN.",
      },
    ],
    rootCauseAnalysis:
      "When a client sends a DHCPDISCOVER broadcast, the switch must forward it within the broadcast domain. If the port is assigned to the wrong VLAN, if DHCP scope is exhausted (100% leased), or if ip helper-address is missing on the L3 switch, the client defaults to APIPA.",
    remediation: [
      "Verify switchport configuration: switchport mode access, switchport access vlan [ID].",
      "Ensure the DHCP service is running on the domain server.",
      "Check DHCP scope pool exhaustion on the DHCP management console.",
    ],
    verification: "Execute ipconfig /renew. Confirm client receives valid LAN IP, subnet mask, default gateway, and DNS servers.",
    relatedScenarios: ["net-1045", "net-1043"],
  },
  {
    id: "kb-vlan-103",
    sopNumber: "SOP-103",
    title: "VLAN Configuration, Access vs Trunk Ports, and Mismatches",
    category: "Networking",
    readingTimeMinutes: 5,
    tags: ["vlan", "switching", "cisco", "ccna", "networking"],
    summary:
      "Essential guide for enterprise Layer 2 switching, isolating traffic across 802.1Q VLANs, and resolving port assignment discrepancies.",
    symptoms: [
      "Workstation recently moved to a new cubicle or desk loses all server and intranet connectivity.",
      "Device is given an IP address in the wrong subnet or gets no IP at all.",
      "High packet loss or inability to ping the default gateway of the intended departmental subnet.",
    ],
    diagnosticSteps: [
      {
        step: 1,
        title: "Identify Connected Switch and Port",
        action: "Look at the patch panel label or cable run to identify switch name and interface (e.g., SW-CORP-01 Gi0/14).",
        expectedOutcome: "Know the exact switchport the user machine is wired into.",
      },
      {
        step: 2,
        title: "Verify Client Subnet and Gateway",
        action: "Check the local IP against company IP schema.",
        command: "ipconfig",
        expectedOutcome: "Confirm if the workstation IP matches the departmental subnet (e.g., VLAN 10 = 192.168.10.x).",
      },
      {
        step: 3,
        title: "Inspect Switchport Mode and VLAN",
        action: "In switch CLI, verify if port is configured for correct access VLAN.",
        command: "show mac address-table interface Gi0/14",
        expectedOutcome: "Ensure the client MAC is learned on the correct VLAN.",
      },
    ],
    rootCauseAnalysis:
      "When office furniture or employee seating is moved, technicians often plug Ethernet cables into wall jacks mapped to switchports configured for a different department's VLAN or an isolated guest VLAN.",
    remediation: [
      "Update the switch port configuration to the appropriate departmental VLAN.",
      "Release and renew the IP address on the endpoint.",
      "For IP phones with PC pass-through, ensure voice VLAN and data VLAN are both tagged appropriately.",
    ],
    verification: "Verify IP address is renewed in correct subnet and default gateway responds to ICMP ping.",
    relatedScenarios: ["net-1045", "net-1047"],
  },
  {
    id: "kb-spooler-104",
    sopNumber: "SOP-104",
    title: "Diagnosing Windows Print Spooler (spoolsv.exe) Crashes & Network Printing",
    category: "Windows",
    readingTimeMinutes: 4,
    tags: ["windows", "printing", "spooler", "services", "troubleshooting"],
    summary:
      "Standard Operating Procedure for handling stopped print spoolers, corrupt print queues, and spooler service dependency errors.",
    symptoms: [
      "User cannot print: 'The Active Directory Domain Services is currently unavailable' or 'Print spooler service is not running'.",
      "Print jobs remain in queue with 'Printing' or 'Deleting' status indefinitely.",
      "Printer properties cannot be opened in Settings or Control Panel.",
    ],
    diagnosticSteps: [
      {
        step: 1,
        title: "Check Print Spooler Service Status",
        action: "Query the status of the 'spooler' service using command line or services.msc.",
        command: "sc query spooler",
        expectedOutcome: "State should be 4 RUNNING. If 1 STOPPED, service has crashed.",
      },
      {
        step: 2,
        title: "Inspect Event Viewer for Crash Source",
        action: "Open Event Viewer > Windows Logs > System and check for Event ID 7034 or 7031 from Service Control Manager.",
        expectedOutcome: "Identifies whether a faulty third-party printer driver caused spoolsv.exe to terminate.",
      },
      {
        step: 3,
        title: "Clear Corrupt Spooler Cache",
        action: "If spooler crashes immediately after restarting, corrupt print files in C:\\Windows\\System32\\spool\\PRINTERS must be deleted.",
        command: "net stop spooler && del /Q /F C:\\Windows\\System32\\spool\\PRINTERS\\* && net start spooler",
        expectedOutcome: "Clears stuck print buffers and restarts cleanly.",
      },
    ],
    rootCauseAnalysis:
      "Print Spooler crashes are predominantly caused by corrupt print spool files (.SHD / .SPL) or uncertified Type 3 third-party print drivers executing in the same memory process as spoolsv.exe.",
    remediation: [
      "Restart the spooler service: net start spooler or through services.msc.",
      "Purge stalled jobs from C:\\Windows\\System32\\spool\\PRINTERS.",
      "Isolate print drivers into separate worker processes if crashes recur.",
    ],
    verification: "Run sc query spooler, confirm RUNNING, and print a Windows test page.",
    relatedScenarios: ["win-2002", "net-1048"],
  },
  {
    id: "kb-ad-105",
    sopNumber: "SOP-105",
    title: "Active Directory Account Lockout Investigation & Event 4740",
    category: "Windows",
    readingTimeMinutes: 4,
    tags: ["active-directory", "security", "accounts", "windows", "lockout"],
    summary:
      "Procedure for identifying root causes behind persistent Active Directory account lockouts and locating the caller computer triggering failed attempts.",
    symptoms: [
      "User receives: 'The referenced account is currently locked out and may not be logged on to.'",
      "User insists they have not entered an incorrect password.",
      "Account re-locks immediately or within 10 minutes of being unlocked by IT.",
    ],
    diagnosticSteps: [
      {
        step: 1,
        title: "Check Account Lockout Status",
        action: "Query domain controller for the user account state and bad password count.",
        command: "net user [username] /domain",
        expectedOutcome: "Confirms 'Account lockout: Yes' and reveals bad password count and password expiration date.",
      },
      {
        step: 2,
        title: "Trace Source of Failed Logons (Event 4740)",
        action: "On Domain Controller security event log, filter for Event ID 4740 (A user account was locked out).",
        expectedOutcome: "Examine 'Caller Computer Name' field to find the specific machine sending stale credentials.",
      },
      {
        step: 3,
        title: "Inspect Stale Credentials on Endpoint",
        action: "Check user mobile phones, tablets, mapped drives, Windows Credential Manager, and background scheduled tasks.",
        expectedOutcome: "Find mobile email app or persistent VPN client attempting sync with expired password.",
      },
    ],
    rootCauseAnalysis:
      "When a user updates their domain password on their workstation, secondary devices (smartphones, iPads, second laptops) retain the old cached password. Background sync loops trigger 5+ failed attempts, repeatedly tripping the domain lockout threshold.",
    remediation: [
      "Unlock the account in Active Directory Users and Computers (ADUC) or net user [username] /active:yes /domain.",
      "Instruct user to update or delete cached credentials in mobile mail client and Windows Credential Manager.",
      "If password has expired, guide user through self-service password reset.",
    ],
    verification: "Verify Bad Password Count resets to 0 and user logs in successfully without subsequent lockout.",
    relatedScenarios: ["win-2001"],
  },
  {
    id: "kb-netstack-106",
    sopNumber: "SOP-106",
    title: "Windows Network Stack Diagnostics & Reset Procedures",
    category: "Networking",
    readingTimeMinutes: 4,
    tags: ["netsh", "networking", "tcpip", "winsock", "windows"],
    summary:
      "Methodology for diagnosing corrupted TCP/IP stack, Winsock catalog corruption, and performing clean network state resets.",
    symptoms: [
      "Cannot obtain IP address or browse despite healthy physical link and working DHCP server.",
      "Error: 'The requested service provider could not be loaded or initialized.'",
      "ping 127.0.0.1 fails with general failure, indicating internal protocol stack corruption.",
    ],
    diagnosticSteps: [
      {
        step: 1,
        title: "Test Local Loopback Interface",
        action: "Ping IPv4 loopback to verify the integrity of the local TCP/IP protocol stack.",
        command: "ping 127.0.0.1",
        expectedOutcome: "Should return 4 replies with <1ms. If 'General failure', stack is corrupted.",
      },
      {
        step: 2,
        title: "Inspect Network Interfaces via netsh",
        action: "Review configured interfaces, MTU sizes, and IP configuration state.",
        command: "netsh interface ip show config",
        expectedOutcome: "Displays all IP configurations per adapter.",
      },
      {
        step: 3,
        title: "Perform Winsock and IP Reset",
        action: "Reset the Winsock catalog and TCP/IP stack registry keys back to clean defaults.",
        command: "netsh winsock reset && netsh int ip reset",
        expectedOutcome: "Prompts to restart the computer to complete the reset.",
      },
    ],
    rootCauseAnalysis:
      "Third-party VPN clients, anti-malware filter drivers, or incomplete Windows updates can hook into the Winsock Layered Service Provider (LSP) chain. If an uninstalled tool fails to unregister its driver, network traffic is dropped locally.",
    remediation: [
      "Execute: netsh winsock reset",
      "Execute: netsh int ip reset",
      "Restart workstation: shutdown /r /t 0",
    ],
    verification: "Ping 127.0.0.1, check ipconfig for DHCP lease, and verify web browser loads test portal.",
    relatedScenarios: ["net-1046", "win-2003"],
  },
  {
    id: "kb-gateway-107",
    sopNumber: "SOP-107",
    title: "Default Gateway & Routing Table Troubleshooting",
    category: "Networking",
    readingTimeMinutes: 5,
    tags: ["routing", "gateway", "tracert", "route", "ccna"],
    summary:
      "Step-by-step guidance for diagnosing unreachable gateways, incorrect subnet masks, and broken default routes in Windows.",
    symptoms: [
      "Can ping other computers on the same physical switch/subnet, but cannot reach any server in another building or the internet.",
      "tracert fails at hop 1 with 'Destination host unreachable' or '*' request timed out.",
      "Workstation configured with typo in default gateway address.",
    ],
    diagnosticSteps: [
      {
        step: 1,
        title: "Check Assigned Gateway and Subnet Mask",
        action: "Inspect IP settings to ensure the gateway IP falls strictly within the host's subnet.",
        command: "ipconfig",
        expectedOutcome: "Ensure host IP and Gateway share identical network prefixes based on the subnet mask.",
      },
      {
        step: 2,
        title: "Trace Route to Remote Destination",
        action: "Observe hop-by-hop packet progress to pinpoint where the packet is dropped.",
        command: "tracert 8.8.8.8",
        expectedOutcome: "Hop 1 should always be the local default gateway.",
      },
      {
        step: 3,
        title: "Inspect Local Routing Table",
        action: "Display the active IPv4 routing table to check default route (0.0.0.0/0).",
        command: "route print",
        expectedOutcome: "Verify 0.0.0.0 netmask 0.0.0.0 points to the correct gateway with lowest metric.",
      },
    ],
    rootCauseAnalysis:
      "Without a reachable Default Gateway, a workstation cannot encapsulate Layer 2 Ethernet frames addressed to the router's MAC. Traffic destined for external subnets is immediately discarded.",
    remediation: [
      "Correct static gateway IP or toggle adapter back to DHCP.",
      "Verify gateway router interface status and ARP table.",
      "Ensure subnet mask matches router interface (e.g., /24 vs /25).",
    ],
    verification: "Ping the default gateway, then ping an off-subnet target. Validate 0% packet loss.",
    relatedScenarios: ["net-1043", "net-1047"],
  },
  {
    id: "kb-wifi-108",
    sopNumber: "SOP-108",
    title: "Enterprise 802.1X Wi-Fi & WPA-Enterprise Authentication Failures",
    category: "Networking",
    readingTimeMinutes: 4,
    tags: ["wifi", "802.1x", "wpa", "certificates", "radius"],
    summary:
      "Troubleshooting guide for enterprise wireless connections utilizing RADIUS/NPS and 802.1X certificate authentication.",
    symptoms: [
      "Laptop constantly prompts for credentials when connecting to corporate Wi-Fi.",
      "Error: 'Can't connect to this network' or 'The server certificate is invalid'.",
      "Personal hotspot works, but enterprise SSID fails.",
    ],
    diagnosticSteps: [
      {
        step: 1,
        title: "Inspect WLAN Interface Status",
        action: "Check wireless radio state, signal strength, and BSSID.",
        command: "netsh wlan show interfaces",
        expectedOutcome: "State should be connected or authenticating. Signal should be >60%.",
      },
      {
        step: 2,
        title: "Verify Machine and User Certificates",
        action: "Check whether the computer or user has an active, trusted certificate issued by the corporate PKI CA.",
        expectedOutcome: "Ensure corporate root CA is in Trusted Root Certification Authorities store.",
      },
      {
        step: 3,
        title: "Delete Corrupt Wi-Fi Profile",
        action: "Remove cached wireless credentials to force a clean re-negotiation.",
        command: "netsh wlan delete profile name=\"GEEDESK-CORP\"",
        expectedOutcome: "Forces Windows to prompt for fresh credentials and accept CA certificate.",
      },
    ],
    rootCauseAnalysis:
      "Enterprise 802.1X uses EAP-TLS or PEAP-MSCHAPv2. If the RADIUS server certificate expired, or the user's password changed while the laptop was offline, authentication fails at the RADIUS handshake.",
    remediation: [
      "Reconnect and verify domain username formatted as DOMAIN\\username.",
      "Check computer system clock (Kerberos/TLS will fail if clock is off by >5 minutes).",
      "Re-import current corporate root certificate.",
    ],
    verification: "Connect to corporate SSID. Verify netsh wlan show interfaces reports 'State: connected'.",
    relatedScenarios: ["net-1046"],
  },
  {
    id: "kb-services-109",
    sopNumber: "SOP-109",
    title: "Managing Windows Services (sc, net start, services.msc)",
    category: "Windows",
    readingTimeMinutes: 4,
    tags: ["services", "windows", "sc", "sysadmin"],
    summary:
      "A complete overview of Windows service architecture, command line inspection with sc and net, and resolving stuck services.",
    symptoms: [
      "Key Windows feature (DHCP client, Audio, DNS, Spooler) is unresponsive.",
      "Service status in Task Manager shows 'Stopped' or 'Stopping'.",
      "Event Viewer displays Event ID 7000: 'The service failed to start due to dependency failure'.",
    ],
    diagnosticSteps: [
      {
        step: 1,
        title: "Query Service State and Exit Code",
        action: "Inspect service state, PID, and Win32 exit code.",
        command: "sc query [service_name]",
        expectedOutcome: "State: 1 STOPPED, 2 START_PENDING, 3 STOP_PENDING, or 4 RUNNING.",
      },
      {
        step: 2,
        title: "Start or Restart the Target Service",
        action: "Attempt to bring the service to running state.",
        command: "net start [service_name]",
        expectedOutcome: "Returns 'The service was started successfully' or an explicit error code.",
      },
      {
        step: 3,
        title: "Check Service Dependencies",
        action: "Determine if the service requires other background components to be running first.",
        command: "sc qc [service_name]",
        expectedOutcome: "Shows DEPENDENCIES list and START_TYPE (Automatic / Manual / Disabled).",
      },
    ],
    rootCauseAnalysis:
      "Services crash due to memory leaks, corrupt cache files, or unhandled exceptions. If configured with Automatic startup, Windows will attempt recovery; however, after repeated failures, services remain STOPPED until manual triage.",
    remediation: [
      "If service is disabled: sc config [service] start= auto",
      "Start service: net start [service]",
      "If service is hung in STOP_PENDING: taskkill /F /PID [PID] to terminate the host process.",
    ],
    verification: "Execute sc query [service]. Validate state is 4 RUNNING and Win32 exit code is 0.",
    relatedScenarios: ["win-2002", "win-2004"],
  },
  {
    id: "kb-devmgmt-110",
    sopNumber: "SOP-110",
    title: "Device Manager Error Codes & Hardware Driver Troubleshooting",
    category: "Hardware",
    readingTimeMinutes: 5,
    tags: ["hardware", "drivers", "devicemanager", "windows"],
    summary:
      "Reference guide for common Windows Device Manager error codes (Code 10, Code 22, Code 28, Code 43) and physical peripheral diagnostics.",
    symptoms: [
      "Hardware component (NIC, GPU, Audio controller) has a yellow exclamation mark in Device Manager.",
      "Network adapter says 'This device cannot start (Code 10)'.",
      "Peripheral says 'Windows has stopped this device because it has reported problems (Code 43)'.",
    ],
    diagnosticSteps: [
      {
        step: 1,
        title: "Identify Driver Version and Hardware ID",
        action: "In Device Manager, open device properties and note Driver Provider, Date, and Version.",
        expectedOutcome: "Verify if driver is a generic Microsoft fallback driver or vendor OEM driver.",
      },
      {
        step: 2,
        title: "Check Device Disabled State (Code 22)",
        action: "If Code 22 is present, the device was administratively disabled in Windows.",
        expectedOutcome: "Right-click and select 'Enable device'.",
      },
      {
        step: 3,
        title: "Review System Event Log for Kernel-PnP Errors",
        action: "Filter System event log for source Kernel-PnP or driver loading errors.",
        expectedOutcome: "Examine if firmware, PCIe power management, or physical seating caused the failure.",
      },
    ],
    rootCauseAnalysis:
      "Code 10 indicates the device failed during initial hardware handshake (frequently resolved by reseating or power cycling). Code 43 indicates the hardware driver reported a fatal hardware fault to the OS. Code 28 indicates missing driver software.",
    remediation: [
      "Re-enable device if disabled.",
      "Update or roll back the driver to a verified stable OEM build.",
      "Perform a full power drain (shut down, unplug AC power, hold power button 30s) to reset hardware controller state.",
    ],
    verification: "Confirm device status shows 'This device is working properly' with no warning overlay.",
    relatedScenarios: ["hw-3001", "hw-3004"],
  },
  {
    id: "kb-soc-111",
    sopNumber: "SOP-111",
    title: "SOC Escalation & Rapid Host Containment Protocols",
    category: "Security",
    readingTimeMinutes: 5,
    tags: ["security", "soc", "malware", "phishing", "incident-response"],
    summary:
      "Incident response SOP for Tier 1 IT support: recognizing active cyber threats, immediate host isolation, and formal escalation to the SOC.",
    symptoms: [
      "User reports files ending in strange extensions (e.g., .locked, .crypt) or desktop wallpaper changed to a ransom note.",
      "Suspicious PowerShell or cmd scripts launching hidden background connections to external foreign IPs.",
      "Employee clicked a suspicious link and typed their corporate Active Directory credentials.",
    ],
    diagnosticSteps: [
      {
        step: 1,
        title: "Assess Threat Severity & Contain Immediately",
        action: "Disconnect the affected device from the corporate LAN and Wi-Fi immediately to prevent lateral movement.",
        expectedOutcome: "Unplug Ethernet cable and disable Wi-Fi. Do NOT power off or reboot (preserves volatile RAM).",
      },
      {
        step: 2,
        title: "Collect Non-Invasive Evidence",
        action: "Record active processes, netstat connections, and suspicious file paths without modifying files.",
        command: "netstat -ano",
        expectedOutcome: "Identify foreign IP connections and corresponding process IDs (PIDs).",
      },
      {
        step: 3,
        title: "Initiate Priority SOC Escalation",
        action: "Immediately open a P1 Security Incident with the Security Operations Center (SOC).",
        expectedOutcome: "Provide hostname, IP, MAC address, user account, and time of earliest symptom.",
      },
    ],
    rootCauseAnalysis:
      "Tier 1 technicians must never attempt to 'clean' or negotiate with ransomware independently. Containment and preservation of forensic artifacts (memory, event logs) takes absolute priority.",
    remediation: [
      "Physical network isolation.",
      "Reset user's Active Directory password and revoke all active session tokens/refresh tokens.",
      "Hand off to SOC for EDR triage and disk image acquisition.",
    ],
    verification: "Confirm device is quarantined and formal SOC handoff ticket is acknowledged.",
    relatedScenarios: ["sec-5001", "sec-5002"],
  },
  {
    id: "kb-itil-112",
    sopNumber: "SOP-112",
    title: "ITIL Help Desk Documentation Standards & Professional Work Notes",
    category: "Service Desk",
    readingTimeMinutes: 4,
    tags: ["itil", "documentation", "servicedesk", "best-practices"],
    summary:
      "Best practices for authoring clear, structured ticket documentation that accelerates future incident resolution and meets enterprise SLA standards.",
    symptoms: [
      "Vague work notes ('fixed it', 'rebooted', 'working now') leaving future technicians unable to understand recurring issues.",
      "Audits flagging incomplete change records and missing verification proofs.",
    ],
    diagnosticSteps: [
      {
        step: 1,
        title: "Problem Statement",
        action: "Document exact symptoms, affected user, device, and impact on business workflows.",
        expectedOutcome: "Clear, factual explanation of what was malfunctioning.",
      },
      {
        step: 2,
        title: "Investigation Performed",
        action: "Detail diagnostic commands run (ipconfig, ping, event logs) and key evidence collected.",
        expectedOutcome: "Chronological log of diagnostic reasoning.",
      },
      {
        step: 3,
        title: "Root Cause & Remediation",
        action: "Explicitly state what failed (e.g., bad DNS IP) and what specific action corrected it.",
        expectedOutcome: "Technical explanation distinguishing symptoms from underlying causes.",
      },
      {
        step: 4,
        title: "Verification & Preventive Advice",
        action: "Document the precise command or user test that proved the fix worked, plus preventive steps.",
        expectedOutcome: "Objective proof that service has been restored.",
      },
    ],
    rootCauseAnalysis:
      "Over 40% of help desk time is wasted re-troubleshooting previously solved issues due to deficient documentation. High-quality work notes are an indispensable asset for enterprise IT.",
    remediation: [
      "Follow the 5-point ITIL documentation structure on every ticket.",
      "Include before-and-after command outputs when applicable.",
      "Tag relevant KB articles for team reference.",
    ],
    verification: "Ticket review by Team Lead confirms all mandatory fields are thoroughly completed.",
    relatedScenarios: ["net-1042", "win-2001"],
  },
];

export function getKBArticle(id: string): KBArticle | undefined {
  return KB_ARTICLES.find((a) => a.id === id);
}

export function searchKBArticles(query: string): KBArticle[] {
  const q = query.toLowerCase().trim();
  if (!q) return KB_ARTICLES;
  return KB_ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.sopNumber.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q)) ||
      a.category.toLowerCase().includes(q)
  );
}
