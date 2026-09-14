import { scenarios } from "../src/data/scenarios";

let errors: string[] = [];
let warnings: string[] = [];

const allIds = new Set<string>();
const allTicketNumbers = new Set<string>();

for (const s of scenarios) {
  const tag = `[${s.ticketNumber} / ${s.id}]`;

  // Uniqueness across the whole registry
  if (allIds.has(s.id)) errors.push(`${tag} duplicate scenario id`);
  allIds.add(s.id);
  if (allTicketNumbers.has(s.ticketNumber)) errors.push(`${tag} duplicate ticket number`);
  allTicketNumbers.add(s.ticketNumber);

  const evidenceIds = new Set(s.evidence.map((e) => e.id));
  const outputIds = new Set(s.terminalOutputs.map((t) => t.id));

  // Internal id uniqueness
  const checkUnique = (arr: string[], label: string) => {
    const seen = new Set<string>();
    for (const id of arr) {
      if (seen.has(id)) errors.push(`${tag} duplicate ${label} id: ${id}`);
      seen.add(id);
    }
  };
  checkUnique(s.evidence.map((e) => e.id), "evidence");
  checkUnique(s.terminalOutputs.map((t) => t.id), "terminalOutput");
  checkUnique(s.conversationQuestions.map((q) => q.id), "question");
  checkUnique(s.diagnosisOptions.map((d) => d.id), "diagnosisOption");
  checkUnique(s.resolutionOptions.map((r) => r.id), "resolutionOption");
  checkUnique(s.hints.map((h) => h.id), "hint");

  // defaultEvidenceIds must exist
  for (const id of s.defaultEvidenceIds) {
    if (!evidenceIds.has(id)) errors.push(`${tag} defaultEvidenceIds references missing evidence: ${id}`);
  }

  // terminalOutputs.revealsEvidence must exist
  for (const t of s.terminalOutputs) {
    for (const id of t.revealsEvidence ?? []) {
      if (!evidenceIds.has(id)) errors.push(`${tag} terminalOutput ${t.id} reveals missing evidence: ${id}`);
    }
    if (!s.availableCommands.includes(t.command)) {
      errors.push(`${tag} terminalOutput ${t.id} uses command '${t.command}' not in availableCommands`);
    }
  }

  // conversationQuestions.revealsEvidence must exist
  for (const q of s.conversationQuestions) {
    for (const id of q.revealsEvidence ?? []) {
      if (!evidenceIds.has(id)) errors.push(`${tag} question ${q.id} reveals missing evidence: ${id}`);
    }
  }

  // Exactly one correct diagnosis / resolution option
  const correctDiag = s.diagnosisOptions.filter((d) => d.isCorrect);
  if (correctDiag.length !== 1) errors.push(`${tag} expected exactly 1 correct diagnosis option, found ${correctDiag.length}`);
  const correctRes = s.resolutionOptions.filter((r) => r.isCorrect);
  if (correctRes.length !== 1) errors.push(`${tag} expected exactly 1 correct resolution option, found ${correctRes.length}`);
  if (s.diagnosisOptions.length < 3) warnings.push(`${tag} fewer than 3 diagnosis options`);
  if (s.resolutionOptions.length < 3) warnings.push(`${tag} fewer than 3 resolution options`);

  // verification.expectedOutputId must exist
  if (!outputIds.has(s.verification.expectedOutputId)) {
    errors.push(`${tag} verification.expectedOutputId references missing terminalOutput: ${s.verification.expectedOutputId}`);
  } else {
    const target = s.terminalOutputs.find((t) => t.id === s.verification.expectedOutputId)!;
    if (target.phase !== "post") {
      warnings.push(`${tag} verification target ${target.id} is not phase:"post" — wrong-fix attempts may still pass verification`);
    }
  }

  // Every "pre" phase output should have a matching "post" sibling with the same match set, and vice versa
  const byMatch = new Map<string, { pre?: string; post?: string }>();
  for (const t of s.terminalOutputs) {
    if (!t.phase) continue;
    const key = t.command + "::" + [...t.match].sort().join(",");
    const entry = byMatch.get(key) ?? {};
    entry[t.phase] = t.id;
    byMatch.set(key, entry);
  }
  for (const [key, entry] of byMatch) {
    if (!entry.pre) warnings.push(`${tag} phase group ${key} has a "post" output but no "pre" output`);
    if (!entry.post) warnings.push(`${tag} phase group ${key} has a "pre" output but no "post" output`);
  }

  // Key evidence should be reachable via at least one command or question
  const reachable = new Set<string>();
  s.terminalOutputs.forEach((t) => (t.revealsEvidence ?? []).forEach((id) => reachable.add(id)));
  s.conversationQuestions.forEach((q) => (q.revealsEvidence ?? []).forEach((id) => reachable.add(id)));
  s.defaultEvidenceIds.forEach((id) => reachable.add(id));
  for (const e of s.evidence) {
    if (e.isKey && !reachable.has(e.id)) errors.push(`${tag} key evidence ${e.id} is not revealed by any command, question, or default`);
  }

  // Hints referenced nowhere else just need non-empty text/cost
  for (const h of s.hints) {
    if (!h.text || h.cost <= 0) errors.push(`${tag} hint ${h.id} missing text or non-positive cost`);
  }

  // Rubric should sum to 100 for consistent percentage display across the app
  const rubricSum =
    s.scoring.investigationMax + s.scoring.evidenceMax + s.scoring.diagnosisMax +
    s.scoring.resolutionMax + s.scoring.verificationMax + s.scoring.efficiencyMax;
  if (rubricSum !== 100) warnings.push(`${tag} scoring rubric sums to ${rubricSum}, not 100`);

  // Sanity on skills/tags
  if (s.skills.length === 0) warnings.push(`${tag} no skills listed`);
  if (s.tags.length === 0) warnings.push(`${tag} no tags listed`);
}

console.log(`Checked ${scenarios.length} scenarios.\n`);

if (warnings.length) {
  console.log(`--- ${warnings.length} warning(s) ---`);
  warnings.forEach((w) => console.log("  WARN: " + w));
  console.log("");
}

if (errors.length) {
  console.log(`--- ${errors.length} ERROR(S) ---`);
  errors.forEach((e) => console.log("  ERROR: " + e));
  process.exit(1);
} else {
  console.log("No errors. All scenario data is internally consistent.");
}
