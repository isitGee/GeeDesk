# GeeDesk — Enterprise IT Troubleshooting & Simulation Platform

**GeeDesk** is an interactive IT support and help-desk troubleshooting simulator created by **George Mwanga**.

It transforms realistic IT helpdesk incidents into a connected, immersive diagnostic training environment. Rather than clicking through canned options, technicians must investigate the problem, gather objective evidence, use simulated Windows and networking tools, interview affected employees, formulate root-cause diagnoses, execute remediation, verify operational recovery, and author structured ITIL documentation.

**Zero backend. Zero paid APIs. Zero accounts.** Everything runs client-side; progress is saved in your browser's `localStorage` and deploys seamlessly to GitHub Pages.

---

## The Core Technician Workflow

$$\text{Incident Intake} \longrightarrow \text{User Scoping} \longrightarrow \text{Multi-Tool Triage} \longrightarrow \text{Root-Cause Diagnosis} \longrightarrow \text{Remediation} \longrightarrow \text{Verification} \longrightarrow \text{ITIL Documentation} \longrightarrow \text{Performance Audit}$$

---

## Key Features & Upgrades

### 1. Enterprise Service Desk & Queue Management
- **Professional Incident Queue**: Filterable and searchable by ticket ID, requester, department, symptom, device hostname, IP address, priority (Critical, High, Medium, Low), difficulty, and status.
- **Queue Views**: Instant toggle between an **Enterprise Table / Grid Queue** and responsive **Card Grid View**.
- **Service Desk Metrics**: Real-time tracking of active incidents, SLA compliance targets, and first-contact resolution rates.

### 2. Multi-Tool Connected Investigation Workspace
The central workspace equips technicians with an array of realistic, deterministic diagnostic tools:
- 💻 **Simulated Windows Terminal (PowerShell / CMD)**: Interactive CLI supporting `ipconfig (/all, /release, /renew, /flushdns)`, `ping`, `nslookup`, `tracert`, `arp -a`, `netstat -ano`, `route print`, `whoami`, `gpresult`, `sc`, `net`, `tasklist`, `systeminfo`, and `sfc /scannow`.
- 📋 **Event Viewer (`eventvwr.msc`)**: Filter and inspect System, Application, and Security logs with real Windows Event IDs (e.g., Event 1014 DNS timeout, Event 7034 Service crash, Event 4740 Account lockout, Event 4199 IP conflict).
- ⚙️ **Services Manager (`services.msc`)**: Inspect background Windows services (`Spooler`, `Dnscache`, `Dhcp`, `LanmanWorkstation`) with functional **Start**, **Stop**, and **Restart** controls that dynamically update live simulation state.
- 🔌 **Device Manager (`devmgmt.msc`)**: Categorized hardware tree with real device status error codes (Code 10, Code 22 disabled, Code 43 stopped) and driver details.
- 🌐 **Network Adapter Configuration (`ncpa.cpl`)**: Visual IPv4 properties dialog (DHCP vs Static IP, Subnet Mask, Gateway, Primary/Secondary DNS) and 802.11ax Wi-Fi link parameters.
- 👤 **Active Directory Inspector (`dsa.msc`)**: Domain user account status, Bad Password Count tracking, group memberships, and an interactive **Unlock Account** action.
- 🗺️ **Visual Topology & Packet Trace Inspector**: Interactive hop-by-hop diagnostic path tracing packets from `[Endpoint] -> [Switch] -> [Gateway Router] -> [WAN / DNS]`.

### 3. Connected Simulation State & Dynamic Dependencies
Actions exert real consequences on the simulated machine:
- Restarting the stopped Print Spooler in `services.msc` updates the process list in `tasklist`, enables print queue dispatch, and updates terminal query state.
- Correcting IP/VLAN configurations enables successful DHCP renewals and subsequent DNS queries.
- Host quarantine severs active foreign C2 network sockets in `netstat`.

### 4. Realistic User Personas & Scoping Dialogue
- Every ticket requester has a unique profile: role, department, desk location, contact extension, technical knowledge level (Novice, Intermediate, Power User), and communication style.
- Technicians are rewarded for asking targeted scoping questions (*"When did it start?"*, *"Are coworkers affected?"*, *"Did any hardware change?"*) before opening tools or guessing.

### 5. Cisco / CCNA & CompTIA Networking Focus
Dedicated emphasis on Layer 1 through Layer 7 enterprise networking:
- **DHCP DORA Process** and 169.254.x.x APIPA resolution
- **DNS Resolution Timeouts**, local vs external resolvers, and cache poisoning
- **VLAN Switchport Mismatches** and 802.1Q port tagging
- **Subnet Mask Mismatches** and default gateway routing failures
- **Duplicate IP Address & ARP Collisions**
- **SFP Fiber Optic Degradation** & physical Layer 1 CRC error analysis

### 6. Searchable Knowledge Base & SOP Repository
12 comprehensive Standard Operating Procedures (SOPs) accessible directly from the ticket workspace or dedicated library:
- `SOP-101`: Troubleshooting DNS Name Resolution Failures
- `SOP-102`: Diagnosing DHCP Failures & APIPA Autoconfiguration
- `SOP-103`: VLAN Configuration, Access vs Trunk Ports, and Mismatches
- `SOP-104`: Diagnosing Windows Print Spooler (`spoolsv.exe`) Crashes
- `SOP-105`: Active Directory Account Lockout Investigation & Event 4740
- `SOP-106`: Windows Network Stack Diagnostics & Reset Procedures
- `SOP-107`: Default Gateway & Routing Table Troubleshooting
- `SOP-108`: Enterprise 802.1X Wi-Fi Authentication Failures
- `SOP-109`: Managing Windows Services (`sc`, `net start`, `services.msc`)
- `SOP-110`: Device Manager Error Codes & Hardware Driver Triage
- `SOP-111`: SOC Escalation & Rapid Host Containment Protocols
- `SOP-112`: ITIL Help Desk Documentation Standards & Professional Work Notes

### 7. Structured ITIL Work Notes & Documentation Scoring
- After resolving an incident, technicians author formal closure notes across 5 sections: Problem Summary, Investigation Performed, Root Cause Identified, Resolution Applied, and Preventive Advice.
- An **"Auto-assemble findings"** utility assists technicians in compiling diagnostic evidence into standard work orders.

### 8. Professional Escalation Decisions
- Realistic incidents where escalation is the correct professional decision (e.g., Core switch fiber optic failure, active PowerShell ransomware beacon requiring SOC containment).
- Correct escalation judgment to Tier 2 Desktop, Network Operations (NOC), or Security Operations (SOC) is rewarded with full score honors.

### 9. Learning Mode vs Challenge Mode
- **Learning Mode**: Step-by-step diagnostic checklists, suggested tools, concept overviews, and low hint penalties.
- **Challenge Mode**: Strict SLA timer pressure, minimal hints with heavy point deductions, and rigorous documentation evaluation.

### 10. Technician Career Progression
- 5 Career Tiers: **IT Support Trainee** $\rightarrow$ **Junior IT Support Technician** $\rightarrow$ **IT Support Technician II** $\rightarrow$ **Senior Helpdesk Analyst** $\rightarrow$ **Systems & Network Specialist**.
- Competency matrix tracking 6 core domains: *Networking*, *Windows Administration*, *Hardware & Peripherals*, *Cybersecurity*, *Troubleshooting Methodology*, and *Communication & Documentation*.
- 10 Career Milestones and Certifications.

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/isitGee/GeeDesk.git
cd GeeDesk

# Install dependencies
npm ci

# Start local development server
npm run dev
```

Build a static production bundle for deployment:

```bash
npm run build      # Static bundle outputs to dist/
npm run validate   # Automated scenario integrity verification
npm run lint       # Code quality audit
```

---

## Author & Acknowledgements

- **Created by**: George Mwanga
- **Framework**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Design Inspiration**: Windows 11 Fluent UI, ITIL Service Desk Standards, Cisco CCNA Enterprise Architecture
