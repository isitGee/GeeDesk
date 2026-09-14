import type { Scenario } from "../types/scenario";
import type { ActionLogEntry, ActionType, TicketSession } from "../types/game";
import { normalizeCommand, runTerminalCommand } from "./terminal";
import { scoreSession } from "./scoring";

let counter = 0;
function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}

export function createSession(scenario: Scenario): TicketSession {
  return {
    scenarioId: scenario.id,
    status: "investigating",
    terminalHistory: [],
    revealedEvidenceIds: [...scenario.defaultEvidenceIds],
    askedQuestionIds: [],
    usedHintIds: [],
    actionLog: [],
    diagnosisSubmittedId: null,
    resolutionSubmittedId: null,
    verificationPassed: false,
    startedAt: Date.now(),
    completedAt: null,
    result: null,
  };
}

function withEvidence(session: TicketSession, ids: string[] | undefined): string[] {
  if (!ids || ids.length === 0) return session.revealedEvidenceIds;
  const set = new Set(session.revealedEvidenceIds);
  ids.forEach((id) => set.add(id));
  return Array.from(set);
}

function logged(session: TicketSession, entry: Omit<ActionLogEntry, "id" | "timestamp">): ActionLogEntry[] {
  return [...session.actionLog, { ...entry, id: nextId("act"), timestamp: Date.now() }];
}

export function isFixApplied(scenario: Scenario, session: TicketSession): boolean {
  const correct = scenario.resolutionOptions.find((o) => o.isCorrect);
  return !!session.resolutionSubmittedId && session.resolutionSubmittedId === correct?.id;
}

export function runCommand(scenario: Scenario, session: TicketSession, rawInput: string): TicketSession {
  if (session.status === "complete" || !rawInput.trim()) return session;

  const normalized = normalizeCommand(rawInput);
  if (normalized === "clear" || normalized === "cls") {
    return { ...session, terminalHistory: [] };
  }

  const fixApplied = isFixApplied(scenario, session);
  const result = runTerminalCommand(scenario, rawInput, fixApplied);

  let next: TicketSession = {
    ...session,
    terminalHistory: [
      ...session.terminalHistory,
      { id: nextId("term"), input: rawInput, output: result.output, matchedOutputId: result.matched?.id ?? null },
    ],
    revealedEvidenceIds: withEvidence(session, result.matched?.revealsEvidence),
  };

  const actionType: ActionType = "command";
  next = { ...next, actionLog: logged(next, { type: actionType, label: rawInput, wasUseful: !!result.matched?.isKeyCommand }) };

  if (
    next.status === "verifying" &&
    result.matched &&
    result.matched.id === scenario.verification.expectedOutputId
  ) {
    next = {
      ...next,
      verificationPassed: true,
      actionLog: logged(next, { type: "verification", label: "Verified the fix", wasUseful: true }),
    };
  }

  return next;
}

export function askQuestion(scenario: Scenario, session: TicketSession, questionId: string): TicketSession {
  if (session.askedQuestionIds.includes(questionId)) return session;
  const question = scenario.conversationQuestions.find((q) => q.id === questionId);
  if (!question) return session;

  return {
    ...session,
    askedQuestionIds: [...session.askedQuestionIds, questionId],
    revealedEvidenceIds: withEvidence(session, question.revealsEvidence),
    actionLog: logged(session, { type: "question", label: question.prompt, wasUseful: !!question.isKeyQuestion }),
  };
}

export function useHint(scenario: Scenario, session: TicketSession, hintId: string): TicketSession {
  if (session.usedHintIds.includes(hintId)) return session;
  const hint = scenario.hints.find((h) => h.id === hintId);
  if (!hint) return session;

  return {
    ...session,
    usedHintIds: [...session.usedHintIds, hintId],
    actionLog: logged(session, { type: "hint", label: `Used a hint (-${hint.cost} pts)`, wasUseful: true }),
  };
}

export function submitDiagnosis(scenario: Scenario, session: TicketSession, optionId: string): TicketSession {
  if (session.diagnosisSubmittedId) return session;
  const option = scenario.diagnosisOptions.find((o) => o.id === optionId);
  if (!option) return session;

  return {
    ...session,
    diagnosisSubmittedId: optionId,
    status: "resolving",
    actionLog: logged(session, { type: "diagnosis", label: `Diagnosed: ${option.label}`, wasUseful: true }),
  };
}

/**
 * Resolution can be re-applied as long as verification hasn't passed yet —
 * in real troubleshooting you sometimes try a fix, verify, and discover you
 * were wrong. Once verification passes, the fix is locked in.
 */
export function submitResolution(scenario: Scenario, session: TicketSession, optionId: string): TicketSession {
  if (!session.diagnosisSubmittedId || session.verificationPassed) return session;
  const option = scenario.resolutionOptions.find((o) => o.id === optionId);
  if (!option) return session;

  return {
    ...session,
    resolutionSubmittedId: optionId,
    status: "verifying",
    actionLog: logged(session, { type: "resolution", label: `Applied fix: ${option.label}`, wasUseful: option.isCorrect }),
  };
}

export function completeTicket(scenario: Scenario, session: TicketSession): TicketSession {
  if (!session.resolutionSubmittedId || session.status === "complete") return session;
  const result = scoreSession(scenario, session);
  return { ...session, status: "complete", completedAt: Date.now(), result };
}
