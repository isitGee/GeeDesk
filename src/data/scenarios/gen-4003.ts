import type { Scenario } from "../../types/scenario";

export const gen4003: Scenario = {
  id: "gen-4003",
  ticketNumber: "GEN-4003",
  title: "CAD software suddenly says \"unlicensed\"",
  category: "General IT",
  difficulty: "intermediate",
  user: { name: "Yusuf Karimi", role: "Structural Engineer", department: "Engineering" },
  ticketDescription: "My CAD software says it's unlicensed since this morning, and none of my project files will open.",
  symptoms: [
    "CAD software shows \"License not found\" on launch",
    "A couple of other engineers mentioned the same thing this morning",
    "IT migrated the license server to new hardware over the weekend",
  ],
  hiddenFault: "IT migrated the license server to new hardware over the weekend, but the internal DNS record for the license server's hostname was never updated — it still points at the old, decommissioned server.",
  availableCommands: ["ping", "nslookup", "tracert"],

  terminalOutputs: [
    { id: "out-nslookup-pre", command: "nslookup", match: ["nslookup licsrv.geedesk.local"], phase: "pre", isKeyCommand: true, revealsEvidence: ["ev-dns-stale"],
      output: ["Server:  dns1.geedesk.local", "Address:  10.5.2.10", "", "Name:    licsrv.geedesk.local", "Address:  10.5.2.20"] },
    { id: "out-nslookup-post", command: "nslookup", match: ["nslookup licsrv.geedesk.local"], phase: "post",
      output: ["Server:  dns1.geedesk.local", "Address:  10.5.2.10", "", "Name:    licsrv.geedesk.local", "Address:  10.5.2.55"] },
    { id: "out-ping-hostname-pre", command: "ping", match: ["ping licsrv.geedesk.local"], phase: "pre", isKeyCommand: true, revealsEvidence: ["ev-license-server-unreachable"],
      output: ["Pinging licsrv.geedesk.local [10.5.2.20] with 32 bytes of data:", "Request timed out.", "Request timed out."] },
    { id: "out-ping-hostname-post", command: "ping", match: ["ping licsrv.geedesk.local"], phase: "post",
      output: ["Pinging licsrv.geedesk.local [10.5.2.55] with 32 bytes of data:", "Reply from 10.5.2.55: bytes=32 time=1ms TTL=64", "Reply from 10.5.2.55: bytes=32 time=1ms TTL=64"] },
    { id: "out-ping-newip", command: "ping", match: ["ping 10.5.2.55"], isKeyCommand: true, revealsEvidence: ["ev-new-server-alive"],
      output: ["Pinging 10.5.2.55 with 32 bytes of data:", "Reply from 10.5.2.55: bytes=32 time=1ms TTL=64", "Reply from 10.5.2.55: bytes=32 time=1ms TTL=64"] },
    { id: "out-tracert", command: "tracert", match: ["tracert licsrv.geedesk.local"], output: ["Tracing route to licsrv.geedesk.local [10.5.2.20]:", "  1     *        *        *     Request timed out."] },
  ],

  evidence: [
    { id: "ev-ticket-summary", category: "user-report", label: "Ticket summary", detail: "Yusuf's CAD software reports 'License not found' and a couple of coworkers have the same issue." },
    { id: "ev-dns-stale", category: "network", isKey: true, label: "DNS still points at the old server",
      detail: "The license server's hostname still resolves to its old, pre-migration address." },
    { id: "ev-license-server-unreachable", category: "network", isKey: true, label: "License server hostname unreachable",
      detail: "Pinging the license server by its hostname times out completely — it's resolving to a dead address." },
    { id: "ev-new-server-alive", category: "network", label: "New server is actually up",
      detail: "The new license server, reached directly by its real IP, responds normally — the new hardware itself is fine." },
    { id: "ev-others-affected-too", category: "conversation", isKey: true, label: "Other engineers affected too",
      detail: "A couple of other engineers have reported the exact same licensing error this morning." },
    { id: "ev-migration-notice", category: "conversation", isKey: true, label: "Migration happened over the weekend",
      detail: "IT sent a notice about migrating the license server to new hardware over the weekend." },
  ],
  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    { id: "q-others", prompt: "Are any other engineers having the same licensing issue?",
      response: "\"Yeah, a couple of us have noticed it this morning.\"", revealsEvidence: ["ev-others-affected-too"], isKeyQuestion: true },
    { id: "q-migration", prompt: "Did IT mention any recent server changes?",
      response: "\"Yeah, I got an email about a license server migration over the weekend.\"", revealsEvidence: ["ev-migration-notice"], isKeyQuestion: true },
    { id: "q-error-detail", prompt: "What exact message does the software show?",
      response: "\"Just 'License not found', nothing more specific.\"", revealsEvidence: [] },
  ],

  keyConcepts: [
    "Using nslookup and ping-by-hostname together to distinguish a DNS problem from a dead server",
    "Recognizing that several users failing identically points at a shared, central cause",
    "Connecting a recent infrastructure migration to a sudden, unrelated-looking application error",
  ],

  diagnosisOptions: [
    { id: "diag-stale-dns", isCorrect: true,
      label: "The DNS record for the license server still points at the old, decommissioned server from before the migration",
      explanation: "Correct. nslookup shows the hostname resolving to the old address, that old address is dead, the new server is alive when reached directly, and several other users are affected identically — the shared DNS record is the common failure point." },
    { id: "diag-no-seats", isCorrect: false, label: "There aren't enough license seats available for everyone",
      explanation: "A seat shortage typically shows a distinct 'no seats available' message, not 'license not found' — and this would rarely affect this specific, consistent group of users in exactly the same way." },
    { id: "diag-software-corrupt", isCorrect: false, label: "The CAD software itself is corrupted and needs reinstalling",
      explanation: "Multiple, unrelated users are hitting the exact same failure — a coincidence of several independently corrupted installs is far less likely than one shared cause." },
    { id: "diag-server-down", isCorrect: false, label: "The license server is completely down",
      explanation: "The new server responds normally when reached directly by its real IP address — it's up; the hostname just isn't pointing at it." },
  ],

  resolutionOptions: [
    { id: "res-fix-dns", isCorrect: true, label: "Update the DNS record for the license server's hostname to the new server's address",
      explanation: "This fixes the shared root cause for every affected user in one change, matching the hostname to where the license server actually now lives." },
    { id: "res-reinstall-everyone", isCorrect: false, label: "Reinstall the CAD software for every affected user",
      explanation: "This doesn't touch the actual shared cause — a stale DNS record — and would need to be repeated for every future new user too." },
    { id: "res-buy-licenses", isCorrect: false, label: "Purchase additional license seats",
      explanation: "This isn't a seat shortage — the clients simply can't find the license server at all." },
    { id: "res-restart-workstations", isCorrect: false, label: "Restart the affected workstations",
      explanation: "A stale DNS record lives on the DNS server, not the workstation — a restart just re-fetches the same incorrect record." },
  ],

  verification: { prompt: "Confirm the license server hostname now resolves to the new, live server.", expectedOutputId: "out-ping-hostname-post",
    successMessage: "Pinging the license server by hostname now reaches the new address successfully — CAD software should find its license again." },

  scoring: { investigationMax: 20, evidenceMax: 15, diagnosisMax: 25, resolutionMax: 20, verificationMax: 10, efficiencyMax: 10, hintPenalty: 5, freeActionAllowance: 3 },
  hints: [
    { id: "hint-1", cost: 5, text: "Check what the license server's hostname actually resolves to right now." },
    { id: "hint-2", cost: 5, text: "Ask whether any other engineers are seeing the same error." },
  ],
  skills: ["general-it", "dns", "troubleshooting-methodology"],
  tags: ["intermediate", "licensing", "dns"],
  estimatedMinutes: 10,
};
