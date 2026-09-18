import type { Scenario } from "../types/scenario";
import type { PlayerProgress, TicketSession, DomainStat } from "../types/game";

const STORAGE_KEY = "geedesk:progress:v2";
const LEGACY_STORAGE_KEY = "geedesk:progress:v1";

const DEFAULT_DOMAINS: Record<string, DomainStat> = {
  "Networking": { solved: 0, total: 0, accuracy: 100 },
  "Windows Administration": { solved: 0, total: 0, accuracy: 100 },
  "Hardware & Peripherals": { solved: 0, total: 0, accuracy: 100 },
  "Cybersecurity": { solved: 0, total: 0, accuracy: 100 },
  "Troubleshooting Methodology": { solved: 0, total: 0, accuracy: 100 },
  "Communication & Documentation": { solved: 0, total: 0, accuracy: 100 },
};

export function defaultProgress(): PlayerProgress {
  return {
    xp: 0,
    completedTickets: {},
    skillStats: {},
    domainStats: { ...DEFAULT_DOMAINS },
    achievements: [],
    streak: 0,
    lastPlayedDate: null,
  };
}

export function loadProgress(): PlayerProgress {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultProgress(),
        ...parsed,
        domainStats: { ...DEFAULT_DOMAINS, ...(parsed.domainStats ?? {}) },
      };
    }
    // Attempt migration from v1
    const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const parsedLegacy = JSON.parse(legacyRaw);
      const migrated = {
        ...defaultProgress(),
        ...parsedLegacy,
        domainStats: { ...DEFAULT_DOMAINS },
      };
      saveProgress(migrated);
      return migrated;
    }
    return defaultProgress();
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(progress: PlayerProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Fail silently if localStorage is restricted
  }
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function nextStreak(progress: PlayerProgress): number {
  const today = todayIso();
  if (progress.lastPlayedDate === today) return Math.max(1, progress.streak);
  if (!progress.lastPlayedDate) return 1;
  const last = new Date(progress.lastPlayedDate);
  const diffDays = Math.round((new Date(today).getTime() - last.getTime()) / 86_400_000);
  return diffDays === 1 ? progress.streak + 1 : 1;
}

export const ACHIEVEMENT_DEFS: Record<string, { label: string; description: string; category: string }> = {
  "first-ticket": {
    label: "First Incident Resolved",
    description: "Investigated, diagnosed, and resolved your first help desk ticket.",
    category: "General",
  },
  "dns-detective": {
    label: "DNS Detective",
    description: "Mastered name resolution troubleshooting and identified a DNS server timeout.",
    category: "Networking",
  },
  "network-whisperer": {
    label: "Network Whisperer",
    description: "Successfully resolved 3 enterprise networking incidents.",
    category: "Networking",
  },
  "ccna-prodigy": {
    label: "CCNA Ready",
    description: "Achieved an Outstanding score (90%+) on 5 networking incidents.",
    category: "Networking",
  },
  "no-hint-resolve": {
    label: "Clean Sleuth",
    description: "Diagnosed and resolved a ticket without revealing a single hint.",
    category: "Methodology",
  },
  "service-controller": {
    label: "Service Controller",
    description: "Restored system functionality by inspecting and restarting a stopped Windows Service.",
    category: "Windows",
  },
  "master-documentarian": {
    label: "ITIL Master Documentarian",
    description: "Submitted comprehensive ITIL work notes covering problem, findings, fix, and prevention.",
    category: "Documentation",
  },
  "escalation-expert": {
    label: "Escalation Specialist",
    description: "Correctly escalated an incident beyond Tier 1 scope to the appropriate engineering team.",
    category: "Service Desk",
  },
  "hardware-savvy": {
    label: "Hardware Specialist",
    description: "Diagnosed and resolved a physical layer or peripheral hardware malfunction.",
    category: "Hardware",
  },
  "security-sentinel": {
    label: "Security Sentinel",
    description: "Detected a phishing attempt or isolated a suspected cybersecurity threat.",
    category: "Security",
  },
};

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
  const noHintClear = result.hintsUsed === 0 && diagnosisCorrect && resolutionCorrect && (session.verificationPassed || !!session.escalationSubmittedId);
  const isDocComprehensive = result.documentationQuality === "Comprehensive";

  let xpGained = Math.round(result.total);
  if (isFirstAttempt) xpGained += 35;
  if (noHintClear) xpGained += 15;
  if (session.gameMode === "challenge") xpGained += 25;
  if (isDocComprehensive) xpGained += 20;

  const completedTickets = {
    ...progress.completedTickets,
    [scenario.id]: {
      bestScore: Math.max(prevBest, result.total),
      bestScoreMax: result.totalMax,
      attempts: (progress.completedTickets[scenario.id]?.attempts ?? 0) + 1,
      lastCompletedAt: Date.now(),
      noHintClear: (progress.completedTickets[scenario.id]?.noHintClear || noHintClear),
      gameMode: session.gameMode,
    },
  };

  // Skill stats
  const skillStats = { ...progress.skillStats };
  for (const skill of scenario.skills) {
    const prev = skillStats[skill] ?? { correct: 0, total: 0 };
    skillStats[skill] = {
      total: prev.total + 1,
      correct: prev.correct + (diagnosisCorrect && resolutionCorrect ? 1 : 0),
    };
  }

  // Domain stats update
  const domainStats = { ...progress.domainStats };
  let primaryDomain = "Troubleshooting Methodology";
  if (scenario.category === "Networking") primaryDomain = "Networking";
  else if (scenario.category === "Windows") primaryDomain = "Windows Administration";
  else if (scenario.category === "Hardware") primaryDomain = "Hardware & Peripherals";
  else if (scenario.category === "Security") primaryDomain = "Cybersecurity";

  const dPrev = domainStats[primaryDomain] ?? { solved: 0, total: 0, accuracy: 100 };
  const dCorrect = diagnosisCorrect && resolutionCorrect ? 1 : 0;
  const newTotal = dPrev.total + 1;
  const newSolved = dPrev.solved + dCorrect;
  domainStats[primaryDomain] = {
    total: newTotal,
    solved: newSolved,
    accuracy: Math.round((newSolved / newTotal) * 100),
  };

  // Documentation domain update
  if (docPointsEarned(result) > 5) {
    const docPrev = domainStats["Communication & Documentation"] ?? { solved: 0, total: 0, accuracy: 100 };
    domainStats["Communication & Documentation"] = {
      total: docPrev.total + 1,
      solved: docPrev.solved + 1,
      accuracy: 100,
    };
  }

  // Achievements
  const newAchievements: string[] = [];
  const hasAchievement = (id: string) => progress.achievements.includes(id);

  if (!hasAchievement("first-ticket")) newAchievements.push("first-ticket");

  if (scenario.tags.includes("dns") && diagnosisCorrect && !hasAchievement("dns-detective")) {
    newAchievements.push("dns-detective");
  }

  const networkTicketsCount = Object.keys(completedTickets).filter((id) => id.startsWith("net-")).length;
  if (networkTicketsCount >= 3 && !hasAchievement("network-whisperer")) {
    newAchievements.push("network-whisperer");
  }

  const highScoringNet = Object.entries(completedTickets).filter(
    ([id, rec]) => id.startsWith("net-") && (rec.bestScore / rec.bestScoreMax) >= 0.9
  ).length;
  if (highScoringNet >= 5 && !hasAchievement("ccna-prodigy")) {
    newAchievements.push("ccna-prodigy");
  }

  if (noHintClear && !hasAchievement("no-hint-resolve")) {
    newAchievements.push("no-hint-resolve");
  }

  if (scenario.id === "win-2002" && session.serviceOverrides["Spooler"] === "Running" && !hasAchievement("service-controller")) {
    newAchievements.push("service-controller");
  }

  if (isDocComprehensive && !hasAchievement("master-documentarian")) {
    newAchievements.push("master-documentarian");
  }

  if (session.escalationSubmittedId && result.escalationCorrect && !hasAchievement("escalation-expert")) {
    newAchievements.push("escalation-expert");
  }

  if (scenario.category === "Hardware" && diagnosisCorrect && !hasAchievement("hardware-savvy")) {
    newAchievements.push("hardware-savvy");
  }

  if (scenario.category === "Security" && (diagnosisCorrect || session.escalationSubmittedId) && !hasAchievement("security-sentinel")) {
    newAchievements.push("security-sentinel");
  }

  const updated: PlayerProgress = {
    xp: progress.xp + xpGained,
    completedTickets,
    skillStats,
    domainStats,
    achievements: [...progress.achievements, ...newAchievements],
    streak: nextStreak(progress),
    lastPlayedDate: todayIso(),
  };

  saveProgress(updated);
  return { progress: updated, xpGained, newAchievements };
}

function docPointsEarned(result: { categories: { key: string; earned: number }[] }): number {
  return result.categories.find((c) => c.key === "documentation")?.earned ?? 0;
}
