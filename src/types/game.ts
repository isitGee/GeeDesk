import type { ScenarioDevice, TicketDocumentation } from "./scenario";

export type TicketStatus =
  | "investigating"
  | "diagnosing"
  | "resolving"
  | "verifying"
  | "documenting"
  | "escalated"
  | "complete";

export type GameMode = "learning" | "challenge";

export type ActionType =
  | "command"
  | "question"
  | "hint"
  | "diagnosis"
  | "resolution"
  | "verification"
  | "service_toggle"
  | "device_update"
  | "escalation"
  | "documentation"
  | "interactive_action"
  | "hypothesis_test";

export interface ActionLogEntry {
  id: string;
  type: ActionType;
  label: string;
  timestamp: number;
  wasUseful: boolean;
  consequence?: string;
  penalty?: number;
}

export interface TerminalHistoryEntry {
  id: string;
  input: string;
  output: string[];
  matchedOutputId: string | null;
}

export interface ConsequenceEntry {
  id: string;
  action: string;
  consequence: string;
  penalty: number;
  timestamp: number;
}

export interface TicketSession {
  scenarioId: string;
  sessionId: string;
  status: TicketStatus;
  gameMode: GameMode;
  terminalHistory: TerminalHistoryEntry[];
  revealedEvidenceIds: string[];
  askedQuestionIds: string[];
  usedHintIds: string[];
  /** Level 1, 2, or 3 reached for progressive hints */
  unlockedHintLevels: Record<string, number>;
  actionLog: ActionLogEntry[];
  consequenceHistory: ConsequenceEntry[];
  
  // Anti-Bias Shuffled Ordering (Generated at session start)
  randomizedDiagnosisOptionIds: string[];
  randomizedResolutionOptionIds: string[];
  randomizedHypothesisIds: string[];

  // Hypothesis & Reasoning State
  hypothesisStates: Record<string, "untested" | "ruled_out" | "supported" | "confirmed">;
  selectedSupportingEvidenceIds: string[];

  diagnosisSubmittedId: string | null;
  resolutionSubmittedId: string | null;
  escalationSubmittedId: string | null;
  verificationPassed: boolean;

  serviceOverrides: Record<string, "Running" | "Stopped">;
  deviceOverrides: Partial<ScenarioDevice>;
  documentation: TicketDocumentation;
  viewedToolTabs: string[];
  startedAt: number;
  completedAt: number | null;
  result: ScoreResult | null;
}

export interface ScoreCategory {
  key: string;
  label: string;
  earned: number;
  max: number;
}

export interface ScoreResult {
  categories: ScoreCategory[];
  total: number;
  totalMax: number;
  grade: "Outstanding" | "Solid" | "Passable" | "Needs Practice";
  skillsDemonstrated: string[];
  whatYouDidWell: string[];
  whatYouMissed: string[];
  correctDiagnosisLabel: string;
  correctResolutionLabel: string;
  hintsUsed: number;
  documentationQuality?: "Comprehensive" | "Standard" | "Incomplete" | "Unsubmitted";
  evidenceCitationsValid?: boolean;
  escalationCorrect?: boolean;
  hypothesesRuledOutCount: number;
  totalHypothesesCount: number;
}

export interface CompletedTicketRecord {
  bestScore: number;
  bestScoreMax: number;
  attempts: number;
  lastCompletedAt: number;
  noHintClear: boolean;
  gameMode?: GameMode;
}

export interface DomainStat {
  solved: number;
  total: number;
  accuracy: number;
}

export interface PlayerProgress {
  xp: number;
  completedTickets: Record<string, CompletedTicketRecord>;
  skillStats: Record<string, { correct: number; total: number }>;
  domainStats: Record<string, DomainStat>;
  achievements: string[];
  streak: number;
  lastPlayedDate: string | null;
}

export const XP_PER_LEVEL = 250;

export interface TechnicianRankInfo {
  level: number;
  title: string;
  tier: "Tier 1 Support" | "Tier 2 Support" | "Tier 3 / Specialist";
  xpIntoLevel: number;
  xpForNext: number;
}

export function levelFromXp(xp: number): TechnicianRankInfo {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = xp % XP_PER_LEVEL;

  let title = "IT Support Trainee";
  let tier: TechnicianRankInfo["tier"] = "Tier 1 Support";

  if (level >= 15) {
    title = "Systems & Network Specialist";
    tier = "Tier 3 / Specialist";
  } else if (level >= 10) {
    title = "Senior Helpdesk Analyst";
    tier = "Tier 2 Support";
  } else if (level >= 6) {
    title = "IT Support Technician II";
    tier = "Tier 2 Support";
  } else if (level >= 3) {
    title = "Junior IT Support Technician";
    tier = "Tier 1 Support";
  }

  return { level, title, tier, xpIntoLevel, xpForNext: XP_PER_LEVEL };
}
