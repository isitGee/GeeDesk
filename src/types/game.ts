export type TicketStatus =
  | "investigating"
  | "diagnosing"
  | "resolving"
  | "verifying"
  | "complete";

export type ActionType =
  | "command"
  | "question"
  | "hint"
  | "diagnosis"
  | "resolution"
  | "verification";

export interface ActionLogEntry {
  id: string;
  type: ActionType;
  label: string;
  timestamp: number;
  wasUseful: boolean;
}

export interface TerminalHistoryEntry {
  id: string;
  input: string;
  output: string[];
  /** id of the TerminalOutput definition that produced this, if any matched */
  matchedOutputId: string | null;
}

export interface TicketSession {
  scenarioId: string;
  status: TicketStatus;
  terminalHistory: TerminalHistoryEntry[];
  revealedEvidenceIds: string[];
  askedQuestionIds: string[];
  usedHintIds: string[];
  actionLog: ActionLogEntry[];
  diagnosisSubmittedId: string | null;
  resolutionSubmittedId: string | null;
  verificationPassed: boolean;
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
}

export interface CompletedTicketRecord {
  /** raw points earned on the best attempt */
  bestScore: number;
  /** the rubric's total possible points at time of that best attempt (rubrics aren't guaranteed to sum to 100) */
  bestScoreMax: number;
  attempts: number;
  lastCompletedAt: number;
  noHintClear: boolean;
}

export interface PlayerProgress {
  xp: number;
  completedTickets: Record<string, CompletedTicketRecord>;
  skillStats: Record<string, { correct: number; total: number }>;
  achievements: string[];
  streak: number;
  lastPlayedDate: string | null;
}

export const XP_PER_LEVEL = 250;

export function levelFromXp(xp: number): { level: number; xpIntoLevel: number; xpForNext: number } {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = xp % XP_PER_LEVEL;
  return { level, xpIntoLevel, xpForNext: XP_PER_LEVEL };
}
