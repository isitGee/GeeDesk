import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { MessageCircle, Search, TerminalSquare } from "lucide-react";
import { useGame } from "../game/store";
import { getScenario } from "../data/scenarios";
import { TerminalPanel } from "../components/TerminalPanel";
import { EvidencePanel } from "../components/EvidencePanel";
import { ChatPanel } from "../components/ChatPanel";
import { CasePanel } from "../components/CasePanel";
import { ActionHistory } from "../components/ActionHistory";
import { DifficultyBadge } from "../components/DifficultyBadge";
import { ResultsScreen } from "../components/ResultsScreen";
import { cn } from "../utils/cn";

type Tab = "terminal" | "evidence" | "chat";

const STATUS_COPY: Record<string, string> = {
  investigating: "Investigate the issue, then submit a diagnosis when you're confident.",
  resolving: "Diagnosis locked in. Choose a resolution to apply.",
  verifying: "Fix applied. Run a command in the terminal to prove it actually worked.",
};

export function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const { session, scenario, startTicket, runCommand, askQuestion, useHint, submitDiagnosis, submitResolution, closeTicket, retryTicket, lastXpGained, newAchievementIds } = useGame();
  const [tab, setTab] = useState<Tab>("terminal");

  useEffect(() => {
    if (id && (!session || session.scenarioId !== id)) {
      startTicket(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!id || !getScenario(id)) return <Navigate to="/tickets" replace />;
  if (!session || !scenario || session.scenarioId !== id) return null;

  if (session.status === "complete" && session.result) {
    return (
      <div className="px-4 py-10 sm:px-6">
        <ResultsScreen
          scenario={scenario}
          result={session.result}
          xpGained={lastXpGained}
          newAchievementIds={newAchievementIds}
          onRetry={retryTicket}
        />
      </div>
    );
  }

  const evidenceCount = session.revealedEvidenceIds.length;
  const chatCount = session.askedQuestionIds.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* status strip */}
      <div className="mb-5 flex items-center gap-2 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary-soft)] px-4 py-2.5 text-[13px] font-medium text-[var(--color-primary)]">
        <Search size={15} className="shrink-0" />
        {STATUS_COPY[session.status] ?? STATUS_COPY.investigating}
      </div>

      <div className="grid gap-5 lg:grid-cols-[280px_1fr_320px]">
        {/* Ticket info */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:h-[calc(100vh-160px)] lg:overflow-y-auto thin-scroll">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              {scenario.ticketNumber} · {scenario.category}
            </p>
            <h1 className="mt-1 text-[17px] font-bold leading-snug text-[var(--color-text)]">{scenario.title}</h1>
            <div className="mt-2">
              <DifficultyBadge difficulty={scenario.difficulty} />
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
              "{scenario.ticketDescription}"
            </p>
            <div className="mt-3 flex items-center gap-2 border-t border-[var(--color-border)] pt-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[11px] font-bold text-[var(--color-text-secondary)]">
                {scenario.user.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </span>
              <div>
                <p className="text-[12.5px] font-semibold text-[var(--color-text)]">{scenario.user.name}</p>
                <p className="text-[11.5px] text-[var(--color-text-muted)]">
                  {scenario.user.role} · {scenario.user.department}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <h2 className="mb-2 text-[12.5px] font-bold text-[var(--color-text)]">Reported symptoms</h2>
            <ul className="space-y-1.5 text-[12.5px] text-[var(--color-text-secondary)]">
              {scenario.symptoms.map((s, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="text-[var(--color-text-muted)]">–</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 lg:block">
            <h2 className="mb-2 text-[12.5px] font-bold text-[var(--color-text)]">Action history</h2>
            <ActionHistory actions={session.actionLog} />
          </div>
        </aside>

        {/* Workspace */}
        <main className="flex min-h-0 flex-col gap-3">
          <div className="flex gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
            <TabButton active={tab === "terminal"} onClick={() => setTab("terminal")} icon={TerminalSquare} label="Terminal" />
            <TabButton active={tab === "evidence"} onClick={() => setTab("evidence")} icon={Search} label="Evidence" count={evidenceCount} />
            <TabButton active={tab === "chat"} onClick={() => setTab("chat")} icon={MessageCircle} label={scenario.user.name.split(" ")[0]} count={chatCount} />
          </div>

          <div className="h-[440px] lg:h-[calc(100vh-280px)]">
            {tab === "terminal" && (
              <TerminalPanel
                history={session.terminalHistory}
                availableCommands={scenario.availableCommands}
                onRun={runCommand}
                disabled={session.status === "complete"}
              />
            )}
            {tab === "evidence" && (
              <div className="h-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <EvidencePanel evidence={scenario.evidence} revealedIds={session.revealedEvidenceIds} />
              </div>
            )}
            {tab === "chat" && (
              <div className="h-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <ChatPanel
                  user={scenario.user}
                  questions={scenario.conversationQuestions}
                  askedIds={session.askedQuestionIds}
                  onAsk={askQuestion}
                />
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 lg:hidden">
            <h2 className="mb-2 text-[12.5px] font-bold text-[var(--color-text)]">Action history</h2>
            <ActionHistory actions={session.actionLog} />
          </div>
        </main>

        {/* Case panel */}
        <aside className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 lg:sticky lg:top-20 lg:h-[calc(100vh-160px)]">
          <CasePanel
            scenario={scenario}
            session={session}
            onSubmitDiagnosis={submitDiagnosis}
            onSubmitResolution={submitResolution}
            onUseHint={useHint}
            onClose={closeTicket}
          />
        </aside>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof TerminalSquare;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12.5px] font-semibold transition-colors",
        active ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
      )}
    >
      <Icon size={14} />
      {label}
      {typeof count === "number" && count > 0 && (
        <span
          className={cn(
            "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold",
            active ? "bg-white/25 text-white" : "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
