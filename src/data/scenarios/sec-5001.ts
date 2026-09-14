import type { Scenario } from "../../types/scenario";

export const sec5001: Scenario = {
  id: "sec-5001",
  ticketNumber: "SEC-5001",
  title: "\"Urgent\" gift card request from the CEO",
  category: "Security",
  difficulty: "beginner",
  user: { name: "Janet Cole", role: "Payroll Administrator", department: "Finance" },
  ticketDescription: "I got an email that looks like it's from our CEO, Marcus Webb, asking me to urgently buy $2,000 in gift cards for a 'client gift' and email him the codes. Something feels off — should I do it?",
  symptoms: [
    "Sender shows as m.webb@geedeskc0rp.com (note the zero instead of an 'o')",
    "Message pushes urgency and asks to keep it discreet",
    "Asks for gift card codes to be emailed directly, not a normal purchase process",
  ],
  hiddenFault: "This is a business email compromise (\"CEO fraud\") attempt sent from a lookalike domain — geedeskc0rp.com, using a zero in place of the letter O — not a genuine request from the real CEO.",
  availableCommands: ["nslookup"],

  terminalOutputs: [
    { id: "out-nslookup-fake-pre", command: "nslookup", match: ["nslookup geedeskc0rp.com"], phase: "pre", isKeyCommand: true, revealsEvidence: ["ev-lookalike-domain"],
      output: ["Server:  dns1.geedesk.local", "Address:  10.1.1.10", "", "Non-authoritative answer:", "Name:    geedeskc0rp.com", "Address:  185.220.101.47", "(hosting provider unrelated to GeeDesk, domain registered 6 days ago)"] },
    { id: "out-nslookup-fake-post", command: "nslookup", match: ["nslookup geedeskc0rp.com"], phase: "post",
      output: ["Server:  dns1.geedesk.local", "Address:  10.1.1.10", "", "*** dns1.geedesk.local can't find geedeskc0rp.com: Blocked by GeeDesk security filtering"] },
    { id: "out-nslookup-real", command: "nslookup", match: ["nslookup geedesk.com"], revealsEvidence: ["ev-real-domain"],
      output: ["Server:  dns1.geedesk.local", "Address:  10.1.1.10", "", "Non-authoritative answer:", "Name:    geedesk.com", "Address:  10.1.1.5", "(GeeDesk's own long-established mail infrastructure)"] },
  ],

  evidence: [
    { id: "ev-ticket-summary", category: "user-report", label: "Ticket summary", detail: "Janet received an urgent gift-card request that appears to be from the CEO." },
    { id: "ev-lookalike-domain", category: "network", isKey: true, label: "Sender domain is a lookalike",
      detail: "geedeskc0rp.com resolves to an unrelated hosting provider and was registered only 6 days ago — it isn't GeeDesk's real domain." },
    { id: "ev-real-domain", category: "network", label: "Real company domain for comparison",
      detail: "GeeDesk's actual domain resolves to long-established company mail infrastructure, nothing like the sender's domain." },
    { id: "ev-unusual-process", category: "conversation", isKey: true, label: "No normal process for this kind of request",
      detail: "All real purchase requests go through a formal PO process — the CEO doesn't email individuals directly for purchases." },
    { id: "ev-similar-reported", category: "conversation", isKey: true, label: "Similar email reported before",
      detail: "Someone in Accounting mentioned a similar suspicious email last month." },
    { id: "ev-reply-to-mismatch", category: "conversation", isKey: true, label: "Reply-to doesn't match the sender",
      detail: "Replying would actually go to a different address than the one shown as the sender — a classic phishing technique." },
  ],
  defaultEvidenceIds: ["ev-ticket-summary"],

  conversationQuestions: [
    { id: "q-process", prompt: "Does the CEO normally ask you directly for purchases like this?",
      response: "\"No, actually — all purchase requests go through a formal PO process.\"", revealsEvidence: ["ev-unusual-process"], isKeyQuestion: true },
    { id: "q-similar", prompt: "Have you or any coworkers seen anything similar before?",
      response: "\"Now that you mention it, someone in Accounting mentioned a similar weird email last month.\"", revealsEvidence: ["ev-similar-reported"], isKeyQuestion: true },
    { id: "q-replyto", prompt: "Does the reply-to address match the sender address shown?",
      response: "\"Actually, replying goes to a slightly different address than what's shown as the sender.\"", revealsEvidence: ["ev-reply-to-mismatch"], isKeyQuestion: true },
  ],

  keyConcepts: [
    "Comparing a suspicious sending domain against the real company domain",
    "Recognizing urgency, secrecy, and gift-card requests as classic CEO-fraud patterns",
    "Reporting through the proper security channel rather than replying, forwarding widely, or ignoring it",
  ],

  diagnosisOptions: [
    { id: "diag-phishing", isCorrect: true, label: "This is a phishing / CEO-fraud attempt sent from a lookalike domain, not a genuine request",
      explanation: "Correct. The sending domain is a recently-registered lookalike, there's no legitimate process for this kind of ask, a similar email was seen before, and the reply-to address doesn't even match." },
    { id: "diag-legit", isCorrect: false, label: "This is a legitimate urgent request from the CEO that should be fulfilled quickly",
      explanation: "The sending domain doesn't match the company's real domain, and there's no normal business process for a CEO to request this directly — both need to be resolved before ever assuming it's genuine." },
    { id: "diag-ignore", isCorrect: false, label: "It's just spam and can be safely deleted with no further action",
      explanation: "This is a targeted attempt using company-specific details, not generic spam — it should be formally reported so IT/Security can block the domain and warn others, not just deleted quietly." },
    { id: "diag-internal-test", isCorrect: false, label: "This is probably an internal IT phishing simulation",
      explanation: "Nothing indicates this is a sanctioned test, and treating a real threat as a harmless drill is risky — the specific gift-card pattern matches real attacker templates." },
  ],

  resolutionOptions: [
    { id: "res-report", isCorrect: true, label: "Don't respond or send anything; report the email to IT/Security so they can block the domain",
      explanation: "This avoids engaging with the attacker entirely and gets the domain blocked and other employees warned through the proper channel." },
    { id: "res-reply-confirm", isCorrect: false, label: "Reply to confirm before buying anything",
      explanation: "Replying confirms to the attacker that the address is active and monitored, inviting further targeted attempts." },
    { id: "res-buy-anyway", isCorrect: false, label: "Buy the gift cards just in case it's really the CEO",
      explanation: "This is exactly the outcome the scam is designed to produce, and would cause real financial loss." },
    { id: "res-forward-company", isCorrect: false, label: "Forward the email to the entire company as a warning",
      explanation: "Broad forwarding without going through Security first can spread confusion — report it through the proper channel so it's handled and communicated correctly." },
  ],

  verification: { prompt: "Confirm the lookalike domain is now blocked.", expectedOutputId: "out-nslookup-fake-post",
    successMessage: "The lookalike domain is now blocked by security filtering — future emails from it won't reach anyone's inbox." },

  scoring: { investigationMax: 20, evidenceMax: 15, diagnosisMax: 25, resolutionMax: 20, verificationMax: 10, efficiencyMax: 10, hintPenalty: 4, freeActionAllowance: 3 },
  hints: [
    { id: "hint-1", cost: 4, text: "Try: nslookup on the sender's domain — does it look anything like the real company's infrastructure?" },
    { id: "hint-2", cost: 4, text: "Ask whether there's a normal business process for this kind of request." },
  ],
  skills: ["security", "phishing", "troubleshooting-methodology"],
  tags: ["beginner", "phishing", "social-engineering"],
  estimatedMinutes: 8,
};
