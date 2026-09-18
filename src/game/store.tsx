import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Scenario, EnrichedScenario, TicketDocumentation } from "../types/scenario";
import type { GameMode, PlayerProgress, TicketSession } from "../types/game";
import { getScenario } from "../data/scenarios";
import { getEnrichedScenario } from "../data/scenarioEnricher";
import * as engine from "./engine";
import { applyCompletion, defaultProgress, loadProgress, saveProgress } from "./persistence";

interface GameContextValue {
  session: TicketSession | null;
  scenario: Scenario | null;
  enrichedScenario: EnrichedScenario | null;
  progress: PlayerProgress;
  theme: "light" | "dark";
  gameMode: GameMode;
  lastXpGained: number;
  newAchievementIds: string[];
  toggleTheme: () => void;
  setGameMode: (mode: GameMode) => void;
  startTicket: (scenarioId: string, mode?: GameMode) => void;
  runCommand: (input: string) => void;
  executeInteractiveAction: (actionId: string) => void;
  toggleService: (serviceName: string, newStatus: "Running" | "Stopped") => void;
  askQuestion: (id: string) => void;
  useHint: (id: string) => void;
  unlockProgressiveHint: (hintId: string, level: number) => void;
  toggleHypothesisStatus: (hypothesisId: string, status: "untested" | "ruled_out" | "supported" | "confirmed") => void;
  submitDiagnosis: (id: string) => void;
  submitDiagnosisWithEvidence: (id: string, supportingEvidenceIds: string[]) => void;
  submitResolution: (id: string) => void;
  submitEscalation: (id: string) => void;
  updateDocumentation: (doc: Partial<TicketDocumentation>) => void;
  markToolTabViewed: (tab: string) => void;
  closeTicket: () => void;
  retryTicket: () => void;
  exitTicket: () => void;
  clearAchievementNotice: () => void;
  resetProgress: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<TicketSession | null>(null);
  const [progress, setProgress] = useState<PlayerProgress>(() => loadProgress());
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("geedesk:theme");
      if (saved === "dark" || saved === "light") return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });
  const [gameMode, setGameModeState] = useState<GameMode>("learning");
  const [lastXpGained, setLastXpGained] = useState(0);
  const [newAchievementIds, setNewAchievementIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      try {
        window.localStorage.setItem("geedesk:theme", theme);
      } catch {
        // Ignore quota issues
      }
    }
  }, [theme]);

  const rawScenario = session ? getScenario(session.scenarioId) ?? null : null;
  const enrichedScenario = rawScenario ? getEnrichedScenario(rawScenario) : null;

  const value: GameContextValue = {
    session,
    scenario: rawScenario,
    enrichedScenario,
    progress,
    theme,
    gameMode,
    lastXpGained,
    newAchievementIds,

    toggleTheme() {
      setTheme((t) => (t === "light" ? "dark" : "light"));
    },

    setGameMode(mode: GameMode) {
      setGameModeState(mode);
      if (session) {
        setSession((prev) => (prev ? { ...prev, gameMode: mode } : prev));
      }
    },

    startTicket(scenarioId, mode) {
      const s = getScenario(scenarioId);
      if (!s) return;
      const activeMode = mode ?? gameMode;
      setLastXpGained(0);
      setNewAchievementIds([]);
      setSession(engine.createSession(s, activeMode));
    },

    runCommand(input) {
      setSession((prev) => {
        if (!prev) return prev;
        const s = getScenario(prev.scenarioId);
        return s ? engine.runCommand(s, prev, input) : prev;
      });
    },

    executeInteractiveAction(actionId) {
      setSession((prev) => {
        if (!prev) return prev;
        const s = getScenario(prev.scenarioId);
        return s ? engine.executeInteractiveAction(s, prev, actionId) : prev;
      });
    },

    toggleService(serviceName, newStatus) {
      setSession((prev) => {
        if (!prev) return prev;
        const s = getScenario(prev.scenarioId);
        return s ? engine.toggleService(s, prev, serviceName, newStatus) : prev;
      });
    },

    askQuestion(id) {
      setSession((prev) => {
        if (!prev) return prev;
        const s = getScenario(prev.scenarioId);
        return s ? engine.askQuestion(s, prev, id) : prev;
      });
    },

    useHint(id) {
      setSession((prev) => {
        if (!prev) return prev;
        const s = getScenario(prev.scenarioId);
        return s ? engine.useHint(s, prev, id) : prev;
      });
    },

    unlockProgressiveHint(hintId, level) {
      setSession((prev) => {
        if (!prev) return prev;
        const s = getScenario(prev.scenarioId);
        return s ? engine.unlockProgressiveHint(s, prev, hintId, level) : prev;
      });
    },

    toggleHypothesisStatus(hypothesisId, status) {
      setSession((prev) => {
        if (!prev) return prev;
        return engine.toggleHypothesisStatus(prev, hypothesisId, status);
      });
    },

    submitDiagnosis(id) {
      setSession((prev) => {
        if (!prev) return prev;
        const s = getScenario(prev.scenarioId);
        return s ? engine.submitDiagnosisWithEvidence(s, prev, id, prev.selectedSupportingEvidenceIds) : prev;
      });
    },

    submitDiagnosisWithEvidence(id, supportingEvidenceIds) {
      setSession((prev) => {
        if (!prev) return prev;
        const s = getScenario(prev.scenarioId);
        return s ? engine.submitDiagnosisWithEvidence(s, prev, id, supportingEvidenceIds) : prev;
      });
    },

    submitResolution(id) {
      setSession((prev) => {
        if (!prev) return prev;
        const s = getScenario(prev.scenarioId);
        return s ? engine.submitResolution(s, prev, id) : prev;
      });
    },

    submitEscalation(id) {
      if (!session || !rawScenario || session.status === "complete") return;
      const escalated = engine.submitEscalation(rawScenario, session, id);
      setSession(escalated);
      if (escalated.status === "complete") {
        const { progress: updated, xpGained, newAchievements } = applyCompletion(progress, rawScenario, escalated);
        setProgress(updated);
        setLastXpGained(xpGained);
        setNewAchievementIds(newAchievements);
      }
    },

    updateDocumentation(doc) {
      setSession((prev) => (prev ? engine.updateDocumentation(prev, doc) : prev));
    },

    markToolTabViewed(tab) {
      setSession((prev) => (prev ? engine.markToolTabViewed(prev, tab) : prev));
    },

    closeTicket() {
      if (!session || !rawScenario || session.status === "complete") return;
      const completed = engine.completeTicket(rawScenario, session);
      setSession(completed);
      if (completed.status === "complete") {
        const { progress: updated, xpGained, newAchievements } = applyCompletion(progress, rawScenario, completed);
        setProgress(updated);
        setLastXpGained(xpGained);
        setNewAchievementIds(newAchievements);
      }
    },

    retryTicket() {
      if (!rawScenario) return;
      setLastXpGained(0);
      setNewAchievementIds([]);
      setSession(engine.createSession(rawScenario, session?.gameMode ?? gameMode));
    },

    exitTicket() {
      setSession(null);
    },

    clearAchievementNotice() {
      setNewAchievementIds([]);
    },

    resetProgress() {
      const reset = defaultProgress();
      setProgress(reset);
      saveProgress(reset);
    },
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within a GameProvider");
  return ctx;
}
