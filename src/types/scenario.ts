// The scenario model is the single source of truth for a ticket.
// Nothing ticket-specific should ever live inside a React component or the
// engine — it should live here, as data, so new tickets are authored, not coded.

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type TerminalCommandName =
  | "ipconfig"
  | "ping"
  | "nslookup"
  | "tracert"
  | "arp"
  | "netstat"
  | "help";

export interface ScenarioUser {
  name: string;
  role: string;
  department: string;
  /** short avatar initials fallback, derived if omitted */
  initials?: string;
}

/**
 * One matchable terminal interaction. `match` is compared against the
 * player's normalized input (lowercased, collapsed whitespace). Use an
 * array so e.g. "ping 8.8.8.8" and "ping google.com" can both be defined.
 */
export interface TerminalOutput {
  id: string;
  /** exact normalized strings that trigger this output, e.g. ["ping 8.8.8.8"] */
  match: string[];
  command: TerminalCommandName;
  output: string[];
  /** evidence ids this run reveals, in addition to any static evidence */
  revealsEvidence?: string[];
  /** counts toward "useful investigation" scoring */
  isKeyCommand?: boolean;
  /**
   * Lets the same command produce a different, up-to-date result once the
   * correct fix has been applied — e.g. nslookup fails pre-fix, succeeds
   * post-fix — without the engine needing any ticket-specific logic.
   * Omit for outputs that don't change (most of them).
   */
  phase?: "pre" | "post";
}

export interface Evidence {
  id: string;
  label: string;
  detail: string;
  category: "network" | "user-report" | "conversation" | "system";
  /** key evidence is what a competent tech would need to find; used for scoring */
  isKey?: boolean;
}

export interface ConversationQuestion {
  id: string;
  prompt: string;
  response: string;
  revealsEvidence?: string[];
  isKeyQuestion?: boolean;
}

export interface DiagnosisOption {
  id: string;
  label: string;
  isCorrect: boolean;
  /** shown on the results screen regardless of what the player picked */
  explanation: string;
}

export interface ResolutionOption {
  id: string;
  label: string;
  isCorrect: boolean;
  explanation: string;
}

export interface VerificationStep {
  prompt: string;
  /** the terminal output id that, once run, counts as verification */
  expectedOutputId: string;
  successMessage: string;
}

export interface ScoringRubric {
  investigationMax: number;
  evidenceMax: number;
  diagnosisMax: number;
  resolutionMax: number;
  verificationMax: number;
  efficiencyMax: number;
  /** score points deducted per hint used */
  hintPenalty: number;
  /** non-key actions allowed before efficiency starts dropping */
  freeActionAllowance: number;
}

export interface Hint {
  id: string;
  text: string;
  cost: number;
}

export interface Scenario {
  id: string;
  ticketNumber: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  user: ScenarioUser;
  ticketDescription: string;
  symptoms: string[];
  /** internal — never rendered to the player directly */
  hiddenFault: string;
  availableCommands: TerminalCommandName[];
  terminalOutputs: TerminalOutput[];
  evidence: Evidence[];
  /** evidence ids visible immediately when the ticket opens */
  defaultEvidenceIds: string[];
  conversationQuestions: ConversationQuestion[];
  keyConcepts: string[];
  diagnosisOptions: DiagnosisOption[];
  resolutionOptions: ResolutionOption[];
  verification: VerificationStep;
  scoring: ScoringRubric;
  hints: Hint[];
  skills: string[];
  tags: string[];
  estimatedMinutes: number;
}
