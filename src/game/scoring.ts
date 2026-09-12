import type { Scenario } from "../types/scenario";
import type { ScoreResult, ScoreCategory, TicketSession } from "../types/game";

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

export function scoreSession(scenario: Scenario, session: TicketSession): ScoreResult {
  const rubric = scenario.scoring;

  // --- Investigation: unique key commands run + unique key questions asked ---
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
    totalKeyActions === 0 ? rubric.investigationMax : (completedKeyActions / totalKeyActions) * rubric.investigationMax;

  // --- Evidence: proportion of key evidence discovered ---
  const keyEvidence = scenario.evidence.filter((e) => e.isKey);
  const revealedKeyEvidence = keyEvidence.filter((e) => session.revealedEvidenceIds.includes(e.id));
  const evidenceEarned =
    keyEvidence.length === 0
      ? rubric.evidenceMax
      : (revealedKeyEvidence.length / keyEvidence.length) * rubric.evidenceMax;

  // --- Diagnosis ---
  const diagnosisCorrectOption = scenario.diagnosisOptions.find((o) => o.isCorrect);
  const diagnosisCorrect =
    !!session.diagnosisSubmittedId && session.diagnosisSubmittedId === diagnosisCorrectOption?.id;
  const diagnosisEarned = diagnosisCorrect ? rubric.diagnosisMax : 0;

  // --- Resolution ---
  const resolutionCorrectOption = scenario.resolutionOptions.find((o) => o.isCorrect);
  const resolutionCorrect =
    !!session.resolutionSubmittedId && session.resolutionSubmittedId === resolutionCorrectOption?.id;
  const resolutionEarned = resolutionCorrect ? rubric.resolutionMax : 0;

  // --- Verification ---
  const verificationEarned = session.verificationPassed ? rubric.verificationMax : 0;

  // --- Efficiency: penalize actions beyond a small allowance that weren't useful ---
  const unnecessaryActions = session.actionLog.filter((a) => !a.wasUseful).length;
  const overage = Math.max(0, unnecessaryActions - rubric.freeActionAllowance);
  const efficiencyPenalty = overage * 2;
  const efficiencyEarned = clamp(rubric.efficiencyMax - efficiencyPenalty, 0, rubric.efficiencyMax);

  const categories: ScoreCategory[] = [
    { key: "investigation", label: "Investigation", earned: round(investigationEarned), max: rubric.investigationMax },
    { key: "evidence", label: "Evidence Gathering", earned: round(evidenceEarned), max: rubric.evidenceMax },
    { key: "diagnosis", label: "Diagnosis Accuracy", earned: round(diagnosisEarned), max: rubric.diagnosisMax },
    { key: "resolution", label: "Resolution Accuracy", earned: round(resolutionEarned), max: rubric.resolutionMax },
    { key: "verification", label: "Verification Discipline", earned: round(verificationEarned), max: rubric.verificationMax },
    { key: "efficiency", label: "Efficiency", earned: round(efficiencyEarned), max: rubric.efficiencyMax },
  ];

  const totalMax = categories.reduce((sum, c) => sum + c.max, 0);
  const rawTotal = categories.reduce((sum, c) => sum + c.earned, 0);

  const hintDeduction = session.usedHintIds.reduce((sum, id) => {
    const hint = scenario.hints.find((h) => h.id === id);
    return sum + (hint?.cost ?? rubric.hintPenalty);
  }, 0);

  const total = clamp(round(rawTotal - hintDeduction), 0, totalMax);
  const percentage = totalMax === 0 ? 0 : total / totalMax;

  const grade: ScoreResult["grade"] =
    percentage >= 0.9 ? "Outstanding" : percentage >= 0.75 ? "Solid" : percentage >= 0.55 ? "Passable" : "Needs Practice";

  const whatYouDidWell: string[] = [];
  const whatYouMissed: string[] = [];

  for (const e of keyEvidence) {
    if (session.revealedEvidenceIds.includes(e.id)) {
      whatYouDidWell.push(`You confirmed: ${e.label.toLowerCase()}`);
    } else {
      whatYouMissed.push(`You didn't check: ${e.label.toLowerCase()}`);
    }
  }
  if (diagnosisCorrect) {
    whatYouDidWell.push("You correctly identified the root cause before acting on it.");
  } else if (session.diagnosisSubmittedId) {
    whatYouMissed.push("Your diagnosis didn't match the evidence you had available — review the timeline before committing to a cause.");
  }
  if (resolutionCorrect) {
    whatYouDidWell.push("You applied a fix that directly addressed the root cause.");
  } else if (session.resolutionSubmittedId) {
    whatYouMissed.push("Your fix didn't target the actual root cause.");
  }
  if (session.verificationPassed) {
    whatYouDidWell.push("You verified the fix instead of assuming it worked.");
  } else {
    whatYouMissed.push("You closed the ticket without proving the fix actually worked.");
  }

  const skillsDemonstrated = diagnosisCorrect && resolutionCorrect ? scenario.skills : evidenceEarned / rubric.evidenceMax > 0.6 ? scenario.skills.slice(0, 1) : [];

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
    hintsUsed: session.usedHintIds.length,
  };
}
