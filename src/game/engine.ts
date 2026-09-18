import type { Scenario, TicketDocumentation } from "../types/scenario";
import type { ActionLogEntry, ActionType, GameMode, TicketSession, ConsequenceEntry } from "../types/game";
import { normalizeCommand, runTerminalCommand } from "./terminal";
import { scoreSession } from "./scoring";
import { shuffleArray } from "../utils/shuffle";
import { getEnrichedScenario } from "../data/scenarioEnricher";
import { executeEnvironmentAction, createInitialEnvironment } from "./environment";

let counter = 0;
function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}

export function defaultDocumentation(): TicketDocumentation {
  return {
    problemSummary: "",
    investigationFindings: "",
    rootCause: "",
    resolutionApplied: "",
    verificationSteps: "",
    preventiveAdvice: "",
  };
}

export function createSession(scenario: Scenario, gameMode: GameMode = "learning"): TicketSession {
  const sessionId = nextId("sess");
  const enriched = getEnrichedScenario(scenario);

  // Anti-Bias Shuffling: Guarantee random positions per attempt
  const diagIds = shuffleArray(scenario.diagnosisOptions.map((d) => d.id), `${sessionId}:diag`);
  const resIds = shuffleArray(scenario.resolutionOptions.map((r) => r.id), `${sessionId}:res`);
  const hypIds = shuffleArray((enriched.hypotheses ?? []).map((h) => h.id), `${sessionId}:hyp`);

  // Initial hypotheses states
  const initialHypotheses: Record<string, "untested" | "ruled_out" | "supported" | "confirmed"> = {};
  for (const h of enriched.hypotheses ?? []) {
    initialHypotheses[h.id] = "untested";
  }

  return {
    scenarioId: scenario.id,
    sessionId,
    status: "investigating",
    gameMode,
    terminalHistory: [],
    revealedEvidenceIds: [...scenario.defaultEvidenceIds],
    askedQuestionIds: [],
    usedHintIds: [],
    unlockedHintLevels: {},
    actionLog: [],
    consequenceHistory: [],
    randomizedDiagnosisOptionIds: diagIds,
    randomizedResolutionOptionIds: resIds,
    randomizedHypothesisIds: hypIds,
    hypothesisStates: initialHypotheses,
    selectedSupportingEvidenceIds: [],
    diagnosisSubmittedId: null,
    resolutionSubmittedId: null,
    escalationSubmittedId: null,
    verificationPassed: false,
    serviceOverrides: {},
    deviceOverrides: {},
    documentation: defaultDocumentation(),
    viewedToolTabs: ["terminal"],
    startedAt: Date.now(),
    completedAt: null,
    result: null,
  };
}

function withEvidence(
  session: TicketSession,
  scenario: Scenario,
  ids: string[] | undefined
): { revealedIds: string[]; updatedHypotheses: Record<string, "untested" | "ruled_out" | "supported" | "confirmed"> } {
  const set = new Set(session.revealedEvidenceIds);
  if (ids) {
    ids.forEach((id) => set.add(id));
  }
  const revealedIds = Array.from(set);

  // Evaluate hypotheses based on discovered evidence
  const enriched = getEnrichedScenario(scenario);
  const updatedHypotheses = { ...session.hypothesisStates };

  for (const hyp of enriched.hypotheses ?? []) {
    if (updatedHypotheses[hyp.id] === "confirmed") continue;

    // Check if ruled out
    if (hyp.ruleOutEvidenceIds && hyp.ruleOutEvidenceIds.some((eId) => set.has(eId))) {
      updatedHypotheses[hyp.id] = "ruled_out";
    } else if (hyp.supportEvidenceIds && hyp.supportEvidenceIds.some((eId) => set.has(eId))) {
      updatedHypotheses[hyp.id] = "supported";
    }
  }

  return { revealedIds, updatedHypotheses };
}

function logged(session: TicketSession, entry: Omit<ActionLogEntry, "id" | "timestamp">): ActionLogEntry[] {
  return [...session.actionLog, { ...entry, id: nextId("act"), timestamp: Date.now() }];
}

export function isFixApplied(scenario: Scenario, session: TicketSession): boolean {
  const correct = scenario.resolutionOptions.find((o) => o.isCorrect);
  if (session.resolutionSubmittedId && session.resolutionSubmittedId === correct?.id) {
    return true;
  }
  if (scenario.id === "win-2002" && session.serviceOverrides["Spooler"] === "Running") {
    return true;
  }
  return false;
}

export function runCommand(scenario: Scenario, session: TicketSession, rawInput: string): TicketSession {
  if (session.status === "complete" || !rawInput.trim()) return session;

  const normalized = normalizeCommand(rawInput);
  if (normalized === "clear" || normalized === "cls") {
    return { ...session, terminalHistory: [] };
  }

  const fixApplied = isFixApplied(scenario, session);
  const result = runTerminalCommand(scenario, rawInput, fixApplied, session.serviceOverrides);

  let updatedServiceOverrides = { ...session.serviceOverrides };
  if (result.serviceStateChanged) {
    updatedServiceOverrides[result.serviceStateChanged.name] = result.serviceStateChanged.status;
  }

  const { revealedIds, updatedHypotheses } = withEvidence(session, scenario, result.matched?.revealsEvidence);

  let next: TicketSession = {
    ...session,
    serviceOverrides: updatedServiceOverrides,
    hypothesisStates: updatedHypotheses,
    terminalHistory: [
      ...session.terminalHistory,
      { id: nextId("term"), input: rawInput, output: result.output, matchedOutputId: result.matched?.id ?? null },
    ],
    revealedEvidenceIds: revealedIds,
  };

  const actionType: ActionType = "command";
  next = {
    ...next,
    actionLog: logged(next, {
      type: actionType,
      label: rawInput,
      wasUseful: !!result.matched?.isKeyCommand || !result.recognizedCommandUnknownUsage,
    }),
  };

  // Check verification
  const isVerifyingOutput =
    result.matched &&
    result.matched.id === scenario.verification.expectedOutputId;

  if (isVerifyingOutput) {
    next = {
      ...next,
      verificationPassed: true,
      actionLog: logged(next, {
        type: "verification",
        label: `Verified fix with command: ${rawInput}`,
        wasUseful: true,
      }),
    };
  }

  return next;
}

export function executeInteractiveAction(
  scenario: Scenario,
  session: TicketSession,
  actionId: string
): TicketSession {
  const env = createInitialEnvironment(scenario.id);
  const actionRes = executeEnvironmentAction(env, actionId, scenario.id);

  const consequenceEntry: ConsequenceEntry = {
    id: nextId("csq"),
    action: actionId,
    consequence: actionRes.consequence,
    penalty: actionRes.efficiencyPenalty,
    timestamp: Date.now(),
  };

  let next: TicketSession = {
    ...session,
    consequenceHistory: [...session.consequenceHistory, consequenceEntry],
    actionLog: logged(session, {
      type: "interactive_action",
      label: `Action: ${actionId}`,
      wasUseful: actionRes.wasUseful,
      consequence: actionRes.consequence,
      penalty: actionRes.efficiencyPenalty,
    }),
  };

  // If action was useful and corresponds to fix, reflect in session
  if (actionRes.wasUseful) {
    const resOpt = scenario.resolutionOptions.find((r) => r.isCorrect);
    if (resOpt && !next.resolutionSubmittedId) {
      next = { ...next, resolutionSubmittedId: resOpt.id, status: "verifying" };
    }
  }

  return next;
}

export function toggleService(
  scenario: Scenario,
  session: TicketSession,
  serviceName: string,
  newStatus: "Running" | "Stopped"
): TicketSession {
  const updatedOverrides = { ...session.serviceOverrides, [serviceName]: newStatus };
  const wasUseful = scenario.id === "win-2002" && serviceName === "Spooler" && newStatus === "Running";

  let next: TicketSession = {
    ...session,
    serviceOverrides: updatedOverrides,
    actionLog: logged(session, {
      type: "service_toggle",
      label: `${newStatus === "Running" ? "Started" : "Stopped"} Windows Service: ${serviceName}`,
      wasUseful,
    }),
  };

  if (wasUseful) {
    const resOpt = scenario.resolutionOptions.find((r) => r.isCorrect);
    if (resOpt && !next.resolutionSubmittedId) {
      next = { ...next, resolutionSubmittedId: resOpt.id, status: "verifying" };
    }
  }

  return next;
}

export function askQuestion(scenario: Scenario, session: TicketSession, questionId: string): TicketSession {
  if (session.askedQuestionIds.includes(questionId)) return session;
  const question = scenario.conversationQuestions.find((q) => q.id === questionId);
  if (!question) return session;

  const { revealedIds, updatedHypotheses } = withEvidence(session, scenario, question.revealsEvidence);

  return {
    ...session,
    askedQuestionIds: [...session.askedQuestionIds, questionId],
    revealedEvidenceIds: revealedIds,
    hypothesisStates: updatedHypotheses,
    actionLog: logged(session, {
      type: "question",
      label: question.prompt ?? question.question ?? "Asked question",
      wasUseful: !!(question.isKeyQuestion ?? question.isKey),
    }),
  };
}

export function useHint(scenario: Scenario, session: TicketSession, hintId: string): TicketSession {
  if (session.usedHintIds.includes(hintId)) return session;
  const hint = scenario.hints.find((h) => h.id === hintId);
  if (!hint) return session;

  return {
    ...session,
    usedHintIds: [...session.usedHintIds, hintId],
    actionLog: logged(session, {
      type: "hint",
      label: `Revealed hint (-${hint.cost} pts)`,
      wasUseful: true,
    }),
  };
}

export function unlockProgressiveHint(
  _scenario: Scenario,
  session: TicketSession,
  hintId: string,
  level: number
): TicketSession {
  const prevLevel = session.unlockedHintLevels[hintId] ?? 0;
  if (level <= prevLevel) return session;

  const cost = level === 1 ? 2 : level === 2 ? 4 : 7;
  const hintKey = `${hintId}-lvl${level}`;

  return {
    ...session,
    unlockedHintLevels: { ...session.unlockedHintLevels, [hintId]: level },
    usedHintIds: [...session.usedHintIds, hintKey],
    actionLog: logged(session, {
      type: "hint",
      label: `Unlocked Level ${level} Progressive Hint (-${cost} pts)`,
      wasUseful: true,
    }),
  };
}

export function toggleHypothesisStatus(
  session: TicketSession,
  hypothesisId: string,
  status: "untested" | "ruled_out" | "supported" | "confirmed"
): TicketSession {
  return {
    ...session,
    hypothesisStates: {
      ...session.hypothesisStates,
      [hypothesisId]: status,
    },
    actionLog: logged(session, {
      type: "hypothesis_test",
      label: `Hypothesis '${hypothesisId}' set to ${status}`,
      wasUseful: true,
    }),
  };
}

export function submitDiagnosisWithEvidence(
  scenario: Scenario,
  session: TicketSession,
  optionId: string,
  supportingEvidenceIds: string[]
): TicketSession {
  if (session.diagnosisSubmittedId) return session;
  const option = scenario.diagnosisOptions.find((o) => o.id === optionId);
  if (!option) return session;

  return {
    ...session,
    diagnosisSubmittedId: optionId,
    selectedSupportingEvidenceIds: supportingEvidenceIds,
    status: "resolving",
    actionLog: logged(session, {
      type: "diagnosis",
      label: `Diagnosed: ${option.label} (with ${supportingEvidenceIds.length} cited evidence items)`,
      wasUseful: option.isCorrect,
    }),
  };
}

export function submitResolution(scenario: Scenario, session: TicketSession, optionId: string): TicketSession {
  if (!session.diagnosisSubmittedId || session.verificationPassed) return session;
  const option = scenario.resolutionOptions.find((o) => o.id === optionId);
  if (!option) return session;

  let consequenceHistory = session.consequenceHistory;
  if (!option.isCorrect && option.simulatedConsequence) {
    consequenceHistory = [
      ...consequenceHistory,
      {
        id: nextId("csq"),
        action: option.label,
        consequence: option.simulatedConsequence,
        penalty: option.efficiencyPenalty ?? 4,
        timestamp: Date.now(),
      },
    ];
  }

  return {
    ...session,
    consequenceHistory,
    resolutionSubmittedId: optionId,
    status: "verifying",
    actionLog: logged(session, {
      type: "resolution",
      label: `Applied resolution: ${option.label}`,
      wasUseful: option.isCorrect,
      consequence: option.simulatedConsequence,
      penalty: !option.isCorrect ? option.efficiencyPenalty ?? 4 : 0,
    }),
  };
}

export function updateDocumentation(
  session: TicketSession,
  documentation: Partial<TicketDocumentation>
): TicketSession {
  return {
    ...session,
    documentation: {
      ...session.documentation,
      ...documentation,
    },
  };
}

export function markToolTabViewed(session: TicketSession, tab: string): TicketSession {
  if (session.viewedToolTabs.includes(tab)) return session;
  return {
    ...session,
    viewedToolTabs: [...session.viewedToolTabs, tab],
  };
}

export function submitEscalation(
  scenario: Scenario,
  session: TicketSession,
  escalationId: string
): TicketSession {
  const next = {
    ...session,
    escalationSubmittedId: escalationId,
    status: "escalated" as const,
    actionLog: logged(session, {
      type: "escalation",
      label: `Escalated ticket to tier/team: ${escalationId}`,
      wasUseful: true,
    }),
  };
  return completeTicket(scenario, next);
}

export function completeTicket(scenario: Scenario, session: TicketSession): TicketSession {
  if (session.status === "complete") return session;
  const result = scoreSession(scenario, session);
  return {
    ...session,
    status: "complete",
    completedAt: Date.now(),
    result,
  };
}
