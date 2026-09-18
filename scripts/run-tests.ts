import { scenarios } from "../src/data/scenarios/index";
import { getEnrichedScenario } from "../src/data/scenarioEnricher";
import {
  createSession,
  runCommand,
  executeInteractiveAction,
  toggleHypothesisStatus,
  submitDiagnosisWithEvidence,
  submitResolution,
  unlockProgressiveHint,
} from "../src/game/engine";
import { executeEnvironmentAction, createInitialEnvironment } from "../src/game/environment";
import { scoreSession } from "../src/game/scoring";
import { auditPositionDistribution } from "../src/utils/shuffle";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log("\n========================================================");
console.log("GEEDESK SIMULATION & REASONING MECHANICS TEST SUITE");
console.log("========================================================\n");

// -----------------------------------------------------------
// SUITE 1: Anti-Bias Shuffling & Positional Entropy
// -----------------------------------------------------------
console.log("TEST SUITE 1: Anti-Bias Shuffling & Positional Entropy");

// Test 1.1: Fisher-Yates array shuffling distribution
const testItems = [
  { id: "A", isCorrect: true },
  { id: "B", isCorrect: false },
  { id: "C", isCorrect: false },
  { id: "D", isCorrect: false },
];
const distribution = auditPositionDistribution(testItems, 1000);
console.log("  [Audit Distribution for 1000 runs]:", distribution);
for (let pos = 0; pos < 4; pos++) {
  const freq = distribution[pos] ?? 0;
  // Expected ~250 out of 1000, allow 170 to 330 (3-sigma variance for binomial)
  assert(
    freq > 170 && freq < 330,
    `Correct option at position ${pos} has realistic uniform frequency: ${freq}/1000`
  );
}

// Test 1.2: Session option randomization across 500 attempts
const sampleScenario = scenarios[0];
const correctDiagnosisId = sampleScenario.diagnosisOptions.find((d) => d.isCorrect)?.id;
assert(!!correctDiagnosisId, `Sample scenario has identifiable correct diagnosis ID (${correctDiagnosisId})`);

const positionCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
for (let i = 0; i < 500; i++) {
  const session = createSession(sampleScenario, "standard");
  const pos = session.randomizedDiagnosisOptionIds.indexOf(correctDiagnosisId!);
  if (pos !== -1) {
    positionCounts[pos] = (positionCounts[pos] ?? 0) + 1;
  }
}

// Confirm the correct answer is NOT hardcoded to index 0!
console.log(`  [Distribution of correct answer across 500 sessions]:`, positionCounts);
assert(
  positionCounts[0] < 400 && positionCounts[0] > 60,
  `Correct answer position is non-deterministic: position 0 frequency (${positionCounts[0]}/500) is within entropy bounds`
);
assert(
  positionCounts[1] > 60 && positionCounts[2] > 60,
  `Correct answer appears at multiple positions: pos 1=${positionCounts[1]}, pos 2=${positionCounts[2]}`
);

// -----------------------------------------------------------
// SUITE 2: Deterministic Environment State Machine & Transitions
// -----------------------------------------------------------
console.log("\nTEST SUITE 2: Deterministic Environment State Machine & Transitions");

// Test 2.1: Initial environment construction
const env = createInitialEnvironment(sampleScenario.id);
assert(env.linkState === "up", "Initial environment linkState is up");
assert(typeof env.dnsServer === "string", `Environment has initialized DNS server: ${env.dnsServer}`);

// Test 2.2: Action 'act-reboot' advances reboot count and has consequence
const rebootResult = executeEnvironmentAction(env, "act-reboot", sampleScenario.id);
assert(rebootResult.updatedState.rebootCount === 1, "Reboot count incremented to 1");
assert(rebootResult.efficiencyPenalty === 5, "Reboot without prior notice deducted 5 efficiency points");
assert(rebootResult.consequence.includes("rebooted"), "Reboot returned descriptive consequence message");

// Test 2.3: Action 'act-flush-dns'
const flushResult = executeEnvironmentAction(env, "act-flush-dns", sampleScenario.id);
assert(flushResult.consequence.includes("Resolver Cache"), "Resolver cache cleared");

// Test 2.4: Action 'act-fix-dns-config' modifies live state
const dnsResult = executeEnvironmentAction(env, "act-fix-dns-config", sampleScenario.id);
assert(dnsResult.updatedState.dnsServer === "192.168.1.5", "DNS server IP updated to authoritative resolver 192.168.1.5");
assert(dnsResult.wasUseful === true, "Fixing DNS config marked as useful for DNS scenario");

// Test 2.5: Action 'act-restart-spooler'
const spoolerEnv = createInitialEnvironment("win-2002");
assert(spoolerEnv.services["Spooler"] === "Stopped", "Win-2002 initial Spooler service is Stopped");
const spoolerResult = executeEnvironmentAction(spoolerEnv, "act-restart-spooler", "win-2002");
assert(spoolerResult.updatedState.services["Spooler"] === "Running", "Print spooler service is now Running");
assert(spoolerResult.wasUseful === true, "Restarting spooler was marked useful");

// Test 2.6: Action 'act-unlock-ad'
const adEnv = createInitialEnvironment("win-2001");
assert(adEnv.adAccountStatus === "Locked Out", "Win-2001 initial AD account is Locked Out");
const adResult = executeEnvironmentAction(adEnv, "act-unlock-ad", "win-2001");
assert(adResult.updatedState.adAccountStatus === "Active", "AD account status unlocked to Active");

// -----------------------------------------------------------
// SUITE 3: Interactive Actions & Consequence Tracking in Engine
// -----------------------------------------------------------
console.log("\nTEST SUITE 3: Interactive Actions & Consequence Tracking in Engine");

let testSession = createSession(sampleScenario, "standard");
assert(testSession.consequenceHistory.length === 0, "Initial session has empty consequence history");

// Execute interactive action in session
testSession = executeInteractiveAction(sampleScenario, testSession, "act-reboot");
assert(testSession.consequenceHistory.length === 1, "Consequence entry recorded in session");
assert(testSession.consequenceHistory[0].penalty === 5, "Consequence history captured 5pt efficiency deduction");

// Verify action is logged in actionLog
const lastAction = testSession.actionLog[testSession.actionLog.length - 1];
assert(lastAction.type === "interactive_action", "Action log captured interactive_action event");

// -----------------------------------------------------------
// SUITE 4: Command Handling Variations & State-Aware Output
// -----------------------------------------------------------
console.log("\nTEST SUITE 4: Command Handling Variations & State-Aware Output");

// Test 4.1: Command normalization (casing and whitespace)
const keyCmdOutput = sampleScenario.terminalOutputs[0];
if (keyCmdOutput) {
  const upperCmd = keyCmdOutput.command.toUpperCase();
  const spacedCmd = "   " + keyCmdOutput.command + "   ";
  
  let s1 = createSession(sampleScenario, "standard");
  s1 = runCommand(sampleScenario, s1, upperCmd);
  const lastEntry1 = s1.terminalHistory[s1.terminalHistory.length - 1];
  assert(
    lastEntry1 && !lastEntry1.isError,
    `Uppercase command variation "${upperCmd}" executed without error`
  );

  let s2 = createSession(sampleScenario, "standard");
  s2 = runCommand(sampleScenario, s2, spacedCmd);
  const lastEntry2 = s2.terminalHistory[s2.terminalHistory.length - 1];
  assert(
    lastEntry2 && !lastEntry2.isError,
    `Command with surrounding whitespace executed without error`
  );
}

// Test 4.2: Evidence discovery via commands
let s3 = createSession(sampleScenario, "standard");
for (const termOut of sampleScenario.terminalOutputs) {
  s3 = runCommand(sampleScenario, s3, termOut.command);
}
assert(s3.revealedEvidenceIds.length > 0, `Executing commands revealed ${s3.revealedEvidenceIds.length} findings`);

// -----------------------------------------------------------
// SUITE 5: Diagnostic Hypotheses & CompTIA 7-Step Elimination
// -----------------------------------------------------------
console.log("\nTEST SUITE 5: Diagnostic Hypotheses & CompTIA 7-Step Elimination");

const enriched = getEnrichedScenario(sampleScenario);
let hypSession = createSession(sampleScenario, "standard");
const hypotheses = enriched.hypotheses;
assert(hypotheses.length >= 3, `Enriched scenario provides ${hypotheses.length} plausible hypotheses`);

const firstHyp = hypotheses[0];
hypSession = toggleHypothesisStatus(hypSession, firstHyp.id, "ruled_out");
assert(
  hypSession.hypothesisStates[firstHyp.id] === "ruled_out",
  `Hypothesis "${firstHyp.label.slice(0, 30)}..." successfully marked as ruled out`
);

const secondHyp = hypotheses[1];
hypSession = toggleHypothesisStatus(hypSession, secondHyp.id, "supported");
assert(
  hypSession.hypothesisStates[secondHyp.id] === "supported",
  `Hypothesis "${secondHyp.label.slice(0, 30)}..." successfully marked as supported`
);

// -----------------------------------------------------------
// SUITE 6: Diagnosis with Evidence Linkage
// -----------------------------------------------------------
console.log("\nTEST SUITE 6: Diagnosis with Evidence Linkage");

let diagSession = createSession(sampleScenario, "standard");

// Submitting diagnosis WITH evidence linkage
const discoveredEvidence = sampleScenario.evidence.slice(0, 2).map((e) => e.id);
diagSession = submitDiagnosisWithEvidence(
  sampleScenario,
  diagSession,
  correctDiagnosisId!,
  discoveredEvidence
);

assert(
  diagSession.diagnosisSubmittedId === correctDiagnosisId,
  "Diagnosis submitted ID correctly recorded"
);
assert(
  diagSession.selectedSupportingEvidenceIds.length === 2,
  "Supporting evidence IDs recorded with diagnosis"
);

// -----------------------------------------------------------
// SUITE 7: Progressive 3-Tier Hint Penalties
// -----------------------------------------------------------
console.log("\nTEST SUITE 7: Progressive 3-Tier Hint Penalties");

let hintSession = createSession(sampleScenario, "standard");
assert(Object.keys(hintSession.unlockedHintLevels).length === 0, "No hints unlocked initially");

// Unlock L1 (Concept, -2 pts)
hintSession = unlockProgressiveHint(sampleScenario, hintSession, "ph-1", 1);
assert(hintSession.unlockedHintLevels["ph-1"] === 1, "Hint level 1 unlocked");

// Unlock L2 (Direction, -4 pts)
hintSession = unlockProgressiveHint(sampleScenario, hintSession, "ph-1", 2);
assert(hintSession.unlockedHintLevels["ph-1"] === 2, "Hint level 2 unlocked");

// Unlock L3 (Action, -7 pts)
hintSession = unlockProgressiveHint(sampleScenario, hintSession, "ph-1", 3);
assert(hintSession.unlockedHintLevels["ph-1"] === 3, "Hint level 3 unlocked");

// -----------------------------------------------------------
// SUITE 8: Rubric Scoring Evaluation
// -----------------------------------------------------------
console.log("\nTEST SUITE 8: Rubric Scoring Evaluation");

// Prepare a fully completed session
let fullSession = createSession(sampleScenario, "standard");

// 1. Ask clarifying scoping questions
for (const q of sampleScenario.conversationQuestions) {
  fullSession = {
    ...fullSession,
    askedQuestionIds: [...fullSession.askedQuestionIds, q.id],
  };
}

// 2. Gather all evidence via commands
for (const termOut of sampleScenario.terminalOutputs) {
  fullSession = runCommand(sampleScenario, fullSession, termOut.command);
}

// 3. Eliminate hypotheses
for (const h of hypotheses) {
  if (h.isRootCause) {
    fullSession = toggleHypothesisStatus(fullSession, h.id, "confirmed");
  } else {
    fullSession = toggleHypothesisStatus(fullSession, h.id, "ruled_out");
  }
}

// 4. Submit diagnosis with supporting evidence
const keyEvidenceIds = sampleScenario.evidence.filter((e) => e.isKey).map((e) => e.id);
fullSession = submitDiagnosisWithEvidence(
  sampleScenario,
  fullSession,
  correctDiagnosisId!,
  keyEvidenceIds
);

// 5. Submit correct resolution
const correctResolution = sampleScenario.resolutionOptions.find((r) => r.isCorrect);
assert(!!correctResolution, "Identified correct resolution option");
fullSession = submitResolution(sampleScenario, fullSession, correctResolution!.id);

// 6. Run verification command
fullSession = runCommand(sampleScenario, fullSession, "nslookup google.com");
assert(fullSession.verificationPassed === true, "Verification command passed after correct resolution");

// 7. Fill out ITIL documentation
fullSession.documentation = {
  problemSummary: "Workstation cannot resolve internal or external hostnames.",
  investigationFindings: "Ran nslookup and ipconfig /all to verify DNS server configuration and found stale server.",
  rootCause: "DNS resolver was pointed to an obsolete unreachable IP address.",
  resolutionApplied: "Updated network adapter to point to primary domain controller DNS server.",
  verificationSteps: "Executed nslookup google.com and received authoritative valid resolution.",
  preventiveAdvice: "Audit DHCP scope options to ensure correct DNS server is distributed automatically.",
};

// 8. Score ticket
const scoreResult = scoreSession(sampleScenario, fullSession);
console.log(`  [Scored Result]: Total=${scoreResult.total}/${scoreResult.totalMax}, Grade=${scoreResult.grade}`);

assert(scoreResult.total >= 80, `Mastery performance awarded high score (${scoreResult.total}/100)`);
assert(scoreResult.grade === "Outstanding" || scoreResult.grade === "Solid", `Grade is ${scoreResult.grade}`);

// Check category breakdown presence
assert(scoreResult.categories.length === 8, `Rubric includes 8 diagnostic categories (got ${scoreResult.categories.length})`);
for (const cat of scoreResult.categories) {
  assert(cat.earned <= cat.max, `Category "${cat.label}" earned (${cat.earned}) does not exceed max (${cat.max})`);
}

// -----------------------------------------------------------
// SUITE 9: Failure Recovery Without Premature Game Over
// -----------------------------------------------------------
console.log("\nTEST SUITE 9: Failure Recovery Without Premature Game Over");

let recoverySession = createSession(sampleScenario, "standard");
const wrongResolution = sampleScenario.resolutionOptions.find((r) => !r.isCorrect);
assert(!!wrongResolution, "Identified wrong resolution option for recovery test");

// Set diagnosis
recoverySession = submitDiagnosisWithEvidence(sampleScenario, recoverySession, correctDiagnosisId!, []);

// Apply wrong resolution
recoverySession = submitResolution(sampleScenario, recoverySession, wrongResolution!.id);
assert(recoverySession.verificationPassed === false, "Verification correctly failed for wrong fix");
assert(recoverySession.status === "verifying", "Session status is verifying so technician can test and recover");

// Test verification with wrong resolution (remains unverified)
recoverySession = runCommand(sampleScenario, recoverySession, "nslookup google.com");
assert(recoverySession.verificationPassed === false, "Verification fails when wrong resolution is applied");

// Learner recovers: applies correct resolution
recoverySession = submitResolution(sampleScenario, recoverySession, correctResolution!.id);
// Run verification command now
recoverySession = runCommand(sampleScenario, recoverySession, "nslookup google.com");
assert(recoverySession.verificationPassed === true, "Verification passes after applying correct remediation");

// -----------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------
console.log("\n========================================================");
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
