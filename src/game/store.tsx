import { createContext, useContext, useState, type ReactNode } from "react";
import type { Scenario } from "../types/scenario";
import type { PlayerProgress, TicketSession } from "../types/game";
import { getScenario } from "../data/scenarios";
import * as engine from "./engine";
import { applyCompletion, loadProgress } from "./persistence";

interface GameContextValue {
  session: TicketSession | null;
  scenario: Scenario | null;
  progress: PlayerProgress;
  lastXpGained: number;
  newAchievementIds: string[];
  startTicket: (scenarioId: string) => void;
  runCommand: (input: string) => void;
  askQuestion: (id: string) => void;
  useHint: (id: string) => void;
  submitDiagnosis: (id: string) => void;
  submitResolution: (id: string) => void;
  closeTicket: () => void;
  retryTicket: () => void;
  exitTicket: () => void;
  clearAchievementNotice: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<TicketSession | null>(null);
  const [progress, setProgress] = useState<PlayerProgress>(() => loadProgress());
  const [lastXpGained, setLastXpGained] = useState(0);
  const [newAchievementIds, setNewAchievementIds] = useState<string[]>([]);

  // Small, fixed-size registry lookup — not worth memoizing, and avoids stale-closure bugs.
  const scenario = session ? getScenario(session.scenarioId) ?? null : null;

  const value: GameContextValue = {
    session,
    scenario,
    progress,
    lastXpGained,
    newAchievementIds,

    startTicket(scenarioId) {
      const s = getScenario(scenarioId);
      if (!s) return;
      setLastXpGained(0);
      setNewAchievementIds([]);
      setSession(engine.createSession(s));
    },

    runCommand(input) {
      setSession((prev) => {
        if (!prev) return prev;
        const s = getScenario(prev.scenarioId);
        return s ? engine.runCommand(s, prev, input) : prev;
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

    submitDiagnosis(id) {
      setSession((prev) => {
        if (!prev) return prev;
        const s = getScenario(prev.scenarioId);
        return s ? engine.submitDiagnosis(s, prev, id) : prev;
      });
    },

    submitResolution(id) {
      setSession((prev) => {
        if (!prev) return prev;
        const s = getScenario(prev.scenarioId);
        return s ? engine.submitResolution(s, prev, id) : prev;
      });
    },

    closeTicket() {
      if (!session || !scenario || session.status === "complete") return;
      const completed = engine.completeTicket(scenario, session);
      setSession(completed);
      if (completed.status === "complete") {
        const { progress: updated, xpGained, newAchievements } = applyCompletion(progress, scenario, completed);
        setProgress(updated);
        setLastXpGained(xpGained);
        setNewAchievementIds(newAchievements);
      }
    },

    retryTicket() {
      if (!scenario) return;
      setLastXpGained(0);
      setNewAchievementIds([]);
      setSession(engine.createSession(scenario));
    },

    exitTicket() {
      setSession(null);
    },

    clearAchievementNotice() {
      setNewAchievementIds([]);
    },
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within a GameProvider");
  return ctx;
}
