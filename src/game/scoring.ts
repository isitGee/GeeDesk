import type { Scenario } from "../types/scenario";
import type { ScoreResult, ScoreCategory, TicketSession } from "../types/game";
import { getEnrichedScenario } from "../data/scenarioEnricher";

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

export function scoreSession(scenario: Scenario, session: TicketSession): ScoreResult {
  const rubric = scenario.scoring;
  const enriched = getEnrichedScenario(scenario);

  // 1. Investigation: key commands run + key questions asked
  const keyCommandIds = new Set(
    scenario.terminalOutputs.filter((t) => t.isKeyCommand).map((t) => t.id)
  );
  const ranKeyCommandIds = new Set(
    session.terminalHistory
      .map((h) => h.matchedOutputId)
      .filter((id): id is string => !!id && keyCommandIds.has(id))
  );
  const keyQuestionIds = new Set(
    scenario.conversationQuestions.filter((q) => q.isKeyQuestion).map((q) => q.id)
  );
  const askedKeyQuestionIds = session.askedQuestionIds.filter((id) => keyQuestionIds.has(id));

  const totalKeyActions = keyCommandIds.size + keyQuestionIds.size;
  const completedKeyActions = ranKeyCommandIds.size + askedKeyQuestionIds.length;
  const investigationEarned =
    totalKeyActions === 0
      ? rubric.investigationMax
      : (completedKeyActions / totalKeyActions) * rubric.investigationMax;

  // 2. Evidence Gathering: proportion of key evidence discovered
  const keyEvidence = scenario.evidence.filter((e) => e.isKey);
  const revealedKeyEvidence = keyEvidence.filter((e) => session.revealedEvidenceIds.includes(e.id));
  const evidenceEarned =
    keyEvidence.length === 0
      ? rubric.evidenceMax
      : (revealedKeyEvidence.length / keyEvidence.length) * rubric.evidenceMax;

  // 3. Hypothesis Testing & Elimination
  const totalHypotheses = enriched.hypotheses?.length ?? 0;
  let ruledOutCount = 0;
  if (enriched.hypotheses) {
    for (const h of enriched.hypotheses) {
      if (session.hypothesisStates[h.id] === "ruled_out" || session.hypothesisStates[h.id] === "supported") {
        ruledOutCount++;
      }
    }
  }

  // 4. Diagnosis Accuracy & Supporting Evidence Citations
  const diagnosisCorrectOption = scenario.diagnosisOptions.find((o) => o.isCorrect);
  const diagnosisCorrect =
    !!session.diagnosisSubmittedId && session.diagnosisSubmittedId === diagnosisCorrectOption?.id;

  // Check evidence linkage: did technician cite key evidence?
  let evidenceCitationsValid = false;
  let evidenceBonus = 0;
  if (diagnosisCorrect) {
    const citedEvidence = session.selectedSupportingEvidenceIds ?? [];
    const validKeyCitations = citedEvidence.filter((id) =>
      keyEvidence.some((ke) => ke.id === id)
    );
    if (validKeyCitations.length >= 1) {
      evidenceCitationsValid = true;
      evidenceBonus = Math.min(5, validKeyCitations.length * 2.5);
    }
  }

  const baseDiag = diagnosisCorrect ? Math.max(0, rubric.diagnosisMax - 5) : 0;
  const diagnosisEarned = diagnosisCorrect ? Math.min(rubric.diagnosisMax, baseDiag + evidenceBonus) : 0;

  // 5. Resolution Accuracy
  const resolutionCorrectOption = scenario.resolutionOptions.find((o) => o.isCorrect);
  const resolutionCorrect =
    !!session.resolutionSubmittedId && session.resolutionSubmittedId === resolutionCorrectOption?.id;
  const resolutionEarned = resolutionCorrect ? rubric.resolutionMax : 0;

  // 6. Verification Discipline
  const verificationEarned = session.verificationPassed ? rubric.verificationMax : 0;

  // 7. Efficiency & Consequence Penalties
  const unnecessaryActions = session.actionLog.filter((a) => !a.wasUseful).length;
  const allowance = rubric.freeActionAllowance ?? 2;
  const overage = Math.max(0, unnecessaryActions - allowance);
  const consequencePenalties = session.consequenceHistory.reduce((sum, c) => sum + c.penalty, 0);
  const efficiencyPenalty = (overage * 2) + consequencePenalties;
  const efficiencyEarned = clamp(rubric.efficiencyMax - efficiencyPenalty, 0, rubric.efficiencyMax);

  // 8. Documentation Quality
  const doc = session.documentation;
  let docPoints = 0;
  const docMax = rubric.documentationMax ?? 10;
  if (doc) {
    if (doc.problemSummary && doc.problemSummary.trim().length > 15) docPoints += 2;
    if (doc.investigationFindings && doc.investigationFindings.trim().length > 20) docPoints += 2.5;
    if (doc.rootCause && doc.rootCause.trim().length > 15) docPoints += 2.5;
    if (doc.resolutionApplied && doc.resolutionApplied.trim().length > 15) docPoints += 2;
    if (doc.preventiveAdvice && doc.preventiveAdvice.trim().length > 10) docPoints += 1;
  }
  const documentationEarned = Math.min(docMax, docPoints);
  const docQuality: ScoreResult["documentationQuality"] =
    documentationEarned >= 8
      ? "Comprehensive"
      : documentationEarned >= 5
      ? "Standard"
      : documentationEarned > 0
      ? "Incomplete"
      : "Unsubmitted";

  // 9. Communication Quality
  const commMax = rubric.communicationMax ?? 5;
  const askedCount = session.askedQuestionIds.length;
  const usefulCount = askedKeyQuestionIds.length;
  let communicationEarned = commMax;
  if (keyQuestionIds.size > 0 && usefulCount === 0) {
    communicationEarned = 1;
  } else if (askedCount > usefulCount + 2) {
    communicationEarned = Math.max(2, commMax - 1.5);
  }

  // 10. Escalation Correctness
  let escalationCorrect: boolean | undefined;
  if (session.escalationSubmittedId) {
    const escOpt = enriched.escalationOptions?.find((e) => e.id === session.escalationSubmittedId);
    escalationCorrect = escOpt?.isCorrect ?? false;
  }

  const categories: ScoreCategory[] = [
    { key: "investigation", label: "Diagnostic Investigation", earned: round(investigationEarned), max: rubric.investigationMax },
    { key: "evidence", label: "Evidence Gathering", earned: round(evidenceEarned), max: rubric.evidenceMax },
    { key: "diagnosis", label: "Root Cause Diagnosis", earned: round(diagnosisEarned), max: rubric.diagnosisMax },
    { key: "resolution", label: "Resolution Accuracy", earned: round(resolutionEarned), max: rubric.resolutionMax },
    { key: "verification", label: "Verification Discipline", earned: round(verificationEarned), max: rubric.verificationMax },
    { key: "documentation", label: "ITIL Work Notes", earned: round(documentationEarned), max: docMax },
    { key: "communication", label: "Requester Communication", earned: round(communicationEarned), max: commMax },
    { key: "efficiency", label: "Diagnostic Efficiency", earned: round(efficiencyEarned), max: rubric.efficiencyMax },
  ];

  const totalMax = categories.reduce((sum, c) => sum + c.max, 0);
  const rawTotal = categories.reduce((sum, c) => sum + c.earned, 0);

  // Hints penalty calculation
  let hintDeduction = 0;
  for (const [_, lvl] of Object.entries(session.unlockedHintLevels ?? {})) {
    hintDeduction += lvl === 1 ? 2 : lvl === 2 ? 4 : 7;
  }
  // Fallback for legacy hints
  if (hintDeduction === 0) {
    hintDeduction = session.usedHintIds.reduce((sum, id) => {
      const hint = scenario.hints.find((h) => h.id === id);
      return sum + (hint?.cost ?? rubric.hintPenalty ?? 3);
    }, 0);
  }

  const total = clamp(round(rawTotal - hintDeduction), 0, totalMax);
  const percentage = totalMax === 0 ? 0 : total / totalMax;

  const grade: ScoreResult["grade"] =
    percentage >= 0.9
      ? "Outstanding"
      : percentage >= 0.75
      ? "Solid"
      : percentage >= 0.55
      ? "Passable"
      : "Needs Practice";

  const whatYouDidWell: string[] = [];
  const whatYouMissed: string[] = [];

  for (const e of keyEvidence) {
    if (session.revealedEvidenceIds.includes(e.id)) {
      whatYouDidWell.push(`Uncovered critical finding: ${e.label}`);
    } else {
      whatYouMissed.push(`Missed investigating key layer: ${e.label}`);
    }
  }

  if (ruledOutCount >= 2) {
    whatYouDidWell.push(`Systematically tested and ruled out ${ruledOutCount} alternative hypotheses.`);
  }

  if (diagnosisCorrect) {
    if (evidenceCitationsValid) {
      whatYouDidWell.push("Correctly identified root cause AND substantiated it with objective evidence.");
    } else {
      whatYouDidWell.push("Identified the root cause.");
      whatYouMissed.push("Did not cite corroborating evidence to justify your diagnosis — always back diagnostic claims with proof.");
    }
  } else if (session.diagnosisSubmittedId) {
    whatYouMissed.push("Diagnosis was incorrect. Review the elimination tree to understand why alternative hypotheses failed.");
  }

  if (resolutionCorrect) {
    whatYouDidWell.push("Applied the targeted fix directly addressing the failure point.");
  } else if (session.resolutionSubmittedId) {
    whatYouMissed.push("Chosen resolution did not remediate the actual root cause.");
  }

  if (session.verificationPassed) {
    whatYouDidWell.push("Verified operational recovery with a diagnostic command prior to ticket closure.");
  } else {
    whatYouMissed.push("Closed ticket without proving the fix restored service functionality.");
  }

  if (session.consequenceHistory.length > 0) {
    whatYouMissed.push(
      `Attempted ${session.consequenceHistory.length} ineffective action(s) (e.g. ${session.consequenceHistory[0]?.action}). Troubleshooting requires testing theories before applying disruptive changes.`
    );
  }

  if (docQuality === "Comprehensive") {
    whatYouDidWell.push("Authoritative ITIL work notes recorded for future help-desk engineers.");
  } else if (docQuality === "Incomplete" || docQuality === "Unsubmitted") {
    whatYouMissed.push("Incomplete ticket work notes. Professional IT support mandates clear root-cause and verification records.");
  }

  const skillsDemonstrated =
    diagnosisCorrect && resolutionCorrect
      ? scenario.skills
      : evidenceEarned / rubric.evidenceMax > 0.6
      ? scenario.skills.slice(0, 2)
      : [];

  return {
    categories,
    total,
    totalMax,
    grade,
    skillsDemonstrated,
    whatYouDidWell,
    whatYouMissed,
    correctDiagnosisLabel: diagnosisCorrectOption?.label ?? "",
    correctResolutionLabel: resolutionCorrectOption?.label ?? "",
    hintsUsed: Object.keys(session.unlockedHintLevels ?? {}).length || session.usedHintIds.length,
    documentationQuality: docQuality,
    evidenceCitationsValid,
    escalationCorrect,
    hypothesesRuledOutCount: ruledOutCount,
    totalHypothesesCount: totalHypotheses,
  };
}
