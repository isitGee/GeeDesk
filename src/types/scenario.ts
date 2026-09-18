// The scenario model is the single source of truth for a ticket.
// Nothing ticket-specific should ever live inside a React component or the
// engine — it should live here, as data, so new tickets are authored, not coded.

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type Priority = "Low" | "Medium" | "High" | "Critical";

export type TicketStatusType =
  | "New"
  | "Open"
  | "Investigating"
  | "Pending User"
  | "Escalated"
  | "Resolved"
  | "Closed";

export type TerminalCommandName =
  | "ipconfig"
  | "ping"
  | "nslookup"
  | "tracert"
  | "arp"
  | "netstat"
  | "netsh"
  | "net"
  | "whoami"
  | "gpresult"
  | "sc"
  | "tasklist"
  | "systeminfo"
  | "chkdsk"
  | "sfc"
  | "driverquery"
  | "powercfg"
  | "route"
  | "w32tm"
  | "gpupdate"
  | "powershell"
  | "devcon"
  | "mdsched"
  | "reg"
  | "dir"
  | "wmic"
  | "help";

export interface ScenarioUser {
  name: string;
  role: string;
  department: string;
  /** short avatar initials fallback, derived if omitted */
  initials?: string;
  /** office or desk location */
  location?: string;
  phone?: string;
  email?: string;
  /** user's comfort with technology */
  techLevel?: "Novice" | "Intermediate" | "Power User";
  /** conversational personality and quirks */
  communicationStyle?: string;
  /** number of past incidents logged by this requester */
  previousIncidentsCount?: number;
}

export interface ScenarioDevice {
  hostname: string;
  deviceType: "desktop" | "laptop" | "printer" | "switch" | "server" | "mobile";
  os: string;
  ipAddress: string;
  subnetMask: string;
  defaultGateway: string;
  dnsServers: string[];
  macAddress: string;
  vlan: number | string;
  vlanName?: string;
  switchName: string;
  switchPort: string;
  status: "online" | "degraded" | "offline";
  connectionType: "ethernet" | "wifi";
  wifiSsid?: string;
  assetTag: string;
}

export interface SimulatedEventLog {
  id: string;
  level: "Error" | "Warning" | "Information";
  source: string;
  eventId: number;
  timestamp: string;
  description: string;
  isKeyFinding?: boolean;
}

export interface SimulatedService {
  name: string;
  displayName: string;
  status: "Running" | "Stopped" | "Paused";
  startupType: "Automatic" | "Manual" | "Disabled";
  canToggle?: boolean;
  description?: string;
}

export interface SimulatedDeviceNode {
  category: string;
  name: string;
  status: "OK" | "Warning" | "Error" | "Disabled";
  statusCode?: string;
  driverVersion?: string;
}

export interface SimulatedADAccount {
  username: string;
  displayName: string;
  department: string;
  status: "Active" | "Locked Out" | "Disabled" | "Expired";
  badPasswordAttempts: number;
  lastLogon: string;
  passwordLastChanged: string;
  groups: string[];
}

export interface EscalationOption {
  id: string;
  targetTeam: "Tier 2 Desktop Support" | "Network Operations (NOC)" | "Security Operations (SOC)" | "Systems Infrastructure" | "Hardware Vendor";
  reason: string;
  isCorrect: boolean;
  explanation: string;
}

export interface LearningGuide {
  investigationChecklist: string[];
  suggestedTools: string[];
  keyConceptOverview: string;
  commonTrap: string;
}

export interface TicketDocumentation {
  problemSummary: string;
  investigationFindings: string;
  rootCause: string;
  resolutionApplied: string;
  verificationSteps: string;
  preventiveAdvice: string;
}

/**
 * Diagnostic Hypothesis used for CompTIA 7-step theory testing.
 * Technicians track and rule out hypotheses through objective testing.
 */
export interface Hypothesis {
  id: string;
  label: string;
  category: "L1-Physical" | "L2-Switching" | "L3-Routing" | "L7-DNS" | "OS-Service" | "Security";
  isRootCause: boolean;
  ruleOutEvidenceIds?: string[];
  ruleOutExplanation?: string;
  supportEvidenceIds?: string[];
  supportExplanation?: string;
}

/**
 * Progressive 3-Tier Hint.
 * Decreases point loss by offering conceptual coaching before giving commands away.
 */
export interface ProgressiveHint {
  id: string;
  concept: string; // Level 1 - theory explanation (2 pts)
  direction: string; // Level 2 - layer/tool direction (4 pts)
  action: string; // Level 3 - direct command/fix (7 pts)
}

/**
 * Detailed Post-Scenario Educational Debrief.
 */
export interface EducationalDebrief {
  whatHappened: string;
  eliminationTree: Array<{
    hypothesis: string;
    status: "Ruled Out" | "Root Cause";
    reason: string;
  }>;
  optimalInvestigationPath: string[];
  realWorldTakeaway: string;
  commonMistakes: string[];
}

/**
 * Interactive Troubleshooting Action (with simulated consequences).
 */
export interface InteractiveAction {
  id: string;
  label: string;
  description: string;
  consequence: string;
  wasUseful: boolean;
  efficiencyPenalty?: number;
}

/**
 * One matchable terminal interaction.
 */
export interface TerminalOutput {
  id: string;
  match: string[];
  command: TerminalCommandName;
  output: string[];
  revealsEvidence?: string[];
  isKeyCommand?: boolean;
  phase?: "pre" | "post";
}

export interface Evidence {
  id: string;
  label: string;
  detail: string;
  category: "network" | "user-report" | "conversation" | "system";
  /** raw technical observation before interpretation */
  rawObservation?: string;
  isKey?: boolean;
}

export interface ConversationQuestion {
  id: string;
  prompt?: string;
  question?: string;
  response?: string;
  answer?: string;
  revealsEvidence?: string[];
  isKey?: boolean;
  isKeyQuestion?: boolean;
}

export interface DiagnosisOption {
  id: string;
  label: string;
  isCorrect: boolean;
  explanation?: string;
  /** evidence IDs that must be cited to substantiate this diagnosis */
  requiredSupportingEvidenceIds?: string[];
  whyIncorrect?: string;
}

export interface ResolutionOption {
  id: string;
  label: string;
  isCorrect: boolean;
  explanation?: string;
  /** simulated consequence when attempted */
  simulatedConsequence?: string;
  efficiencyPenalty?: number;
}

export interface VerificationStep {
  prompt: string;
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
  documentationMax?: number;
  communicationMax?: number;
  escalationMax?: number;
  hintPenalty?: number;
  freeActionAllowance?: number;
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
  hiddenFault: string;
  availableCommands: TerminalCommandName[];
  terminalOutputs: TerminalOutput[];
  evidence: Evidence[];
  defaultEvidenceIds: string[];
  conversationQuestions: ConversationQuestion[];
  keyConcepts?: string[];
  diagnosisOptions: DiagnosisOption[];
  resolutionOptions: ResolutionOption[];
  verification: VerificationStep;
  scoring: ScoringRubric;
  hints: Hint[];
  skills: string[];
  tags: string[];
  estimatedMinutes?: number;

  // --- Extended Simulation & Educational Properties ---
  priority?: Priority;
  slaMinutes?: number;
  location?: string;
  assignedTechnician?: string;
  device?: ScenarioDevice;
  eventLogs?: SimulatedEventLog[];
  services?: SimulatedService[];
  deviceManager?: SimulatedDeviceNode[];
  adAccount?: SimulatedADAccount;
  escalationOptions?: EscalationOption[];
  isEscalationScenario?: boolean;
  learningGuide?: LearningGuide;
  hypotheses?: Hypothesis[];
  progressiveHints?: ProgressiveHint[];
  educationalDebrief?: EducationalDebrief;
  interactiveActions?: InteractiveAction[];
}

export interface EnrichedScenario extends Scenario {
  priority: Priority;
  slaMinutes: number;
  location: string;
  device: ScenarioDevice;
  eventLogs: SimulatedEventLog[];
  services: SimulatedService[];
  deviceManager: SimulatedDeviceNode[];
  adAccount: SimulatedADAccount;
  escalationOptions: EscalationOption[];
  learningGuide: LearningGuide;
  hypotheses: Hypothesis[];
  progressiveHints: ProgressiveHint[];
  educationalDebrief: EducationalDebrief;
  interactiveActions: InteractiveAction[];
}
