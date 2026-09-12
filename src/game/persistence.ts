import type { Scenario } from "../types/scenario";
import type { PlayerProgress, TicketSession } from "../types/game";

const STORAGE_KEY = "geedesk:progress:v1";

export function defaultProgress(): PlayerProgress {
  return {
    xp: 0,
    completedTickets: {},
    skillStats: {},
    achievements: [],
    streak: 0,
    lastPlayedDate: null,
  };
}

export function loadProgress(): PlayerProgress {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw);
    // shallow-merge over defaults so older saves don't crash on new fields
    return { ...defaultProgress(), ...parsed };
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(progress: PlayerProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // storage unavailable (private browsing, quota) — fail silently, game still playable
  }
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function nextStreak(progress: PlayerProgress): number {
  const today = todayIso();
  if (progress.lastPlayedDate === today) return progress.streak;
  if (!progress.lastPlayedDate) return 1;
  const last = new Date(progress.lastPlayedDate);
  const diffDays = Math.round((new Date(today).getTime() - last.getTime()) / 86_400_000);
  return diffDays === 1 ? progress.streak + 1 : 1;
}

const ACHIEVEMENT_DEFS: Record<string, { label: string }> = {
  "first-ticket": { label: "First Ticket" },
  "dns-detective": { label: "DNS Detective" },
  "network-whisperer": { label: "Network Whisperer" },
  "no-hint-resolve": { label: "No-Hint Resolve" },
};

export { ACHIEVEMENT_DEFS };

export function applyCompletion(
  progress: PlayerProgress,
  scenario: Scenario,
  session: TicketSession
): { progress: PlayerProgress; xpGained: number; newAchievements: string[] } {
  const result = session.result;
  if (!result) return { progress, xpGained: 0, newAchievements: [] };

  const isFirstAttempt = !progress.completedTickets[scenario.id];
  const prevBest = progress.completedTickets[scenario.id]?.bestScore ?? -1;
  const diagnosisCorrect = result.categories.find((c) => c.key === "diagnosis")!.earned > 0;
  const resolutionCorrect = result.categories.find((c) => c.key === "resolution")!.earned > 0;
  const noHintClear = result.hintsUsed === 0 && diagnosisCorrect && resolutionCorrect && !!session.verificationPassed;

  let xpGained = Math.round(result.total);
  if (isFirstAttempt) xpGained += 25;
  if (noHintClear) xpGained += 10;

  const completedTickets = {
    ...progress.completedTickets,
    [scenario.id]: {
      bestScore: Math.max(prevBest, result.total),
      bestScoreMax: result.totalMax,
      attempts: (progress.completedTickets[scenario.id]?.attempts ?? 0) + 1,
      lastCompletedAt: Date.now(),
      noHintClear: progress.completedTickets[scenario.id]?.noHintClear || noHintClear,
    },
  };

  const skillStats = { ...progress.skillStats };
  for (const skill of scenario.skills) {
    const prev = skillStats[skill] ?? { correct: 0, total: 0 };
    skillStats[skill] = {
      total: prev.total + 1,
      correct: prev.correct + (diagnosisCorrect && resolutionCorrect ? 1 : 0),
    };
  }

  const newAchievements: string[] = [];
  const hasAchievement = (id: string) => progress.achievements.includes(id);

  if (isFirstAttempt && !hasAchievement("first-ticket")) newAchievements.push("first-ticket");
  if (
    scenario.tags.includes("dns") &&
    diagnosisCorrect &&
    !hasAchievement("dns-detective")
  ) {
    newAchievements.push("dns-detective");
  }
  const networkingClears = Object.keys(completedTickets).length; // V1 has one category, kept simple + extensible
  if (scenario.category === "Networking" && networkingClears >= 3 && !hasAchievement("network-whisperer")) {
    newAchievements.push("network-whisperer");
  }
  if (noHintClear && !hasAchievement("no-hint-resolve")) newAchievements.push("no-hint-resolve");

  const updated: PlayerProgress = {
    xp: progress.xp + xpGained,
    completedTickets,
    skillStats,
    achievements: [...progress.achievements, ...newAchievements],
    streak: nextStreak(progress),
    lastPlayedDate: todayIso(),
  };

  saveProgress(updated);
  return { progress: updated, xpGained, newAchievements };
}
