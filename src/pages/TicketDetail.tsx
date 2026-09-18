import { useEffect, useState } from "react";
import { Navigate, useParams, Link } from "react-router-dom";
import {
  TerminalSquare,
  Search,
  MessageCircle,
  Clock,
  BookOpen,
  Copy,
  Check,
  ChevronLeft,
  Cog,
  Monitor,
  Users,
  Radio,
  Shield,
  GitBranch,
  Wrench,
  Network,
} from "lucide-react";
import { useGame } from "../game/store";
import { getScenario } from "../data/scenarios";
import { getEnrichedScenario } from "../data/scenarioEnricher";
import { TerminalPanel } from "../components/TerminalPanel";
import { EvidencePanel } from "../components/EvidencePanel";
import { ChatPanel } from "../components/ChatPanel";
import { CasePanel } from "../components/CasePanel";
import { ActionHistory } from "../components/ActionHistory";
import { ResultsScreen } from "../components/ResultsScreen";
import { EventViewerTool } from "../components/tools/EventViewerTool";
import { ServicesTool } from "../components/tools/ServicesTool";
import { DeviceManagerTool } from "../components/tools/DeviceManagerTool";
import { NetworkConfigTool } from "../components/tools/NetworkConfigTool";
import { ActiveDirectoryTool } from "../components/tools/ActiveDirectoryTool";
import { TopologyPingTool } from "../components/tools/TopologyPingTool";
import { HypothesisBoardTool } from "../components/tools/HypothesisBoardTool";
import { InteractiveActionsTool } from "../components/tools/InteractiveActionsTool";
import { KnowledgeBaseModal } from "../components/tools/KnowledgeBaseModal";
import { DocumentationModal } from "../components/DocumentationModal";
import { EscalationModal } from "../components/EscalationModal";
import { cn } from "../utils/cn";

type ToolTab =
  | "terminal"
  | "hypotheses"
  | "interventions"
  | "chat"
  | "evidence"
  | "eventvwr"
  | "services"
  | "devmgmt"
  | "ncpa"
  | "ad"
  | "topology";

export function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    session,
    scenario,
    enrichedScenario,
    startTicket,
    runCommand,
    toggleService,
    askQuestion,
    useHint,
    submitDiagnosis,
    submitDiagnosisWithEvidence,
    submitResolution,
    submitEscalation,
    updateDocumentation,
    markToolTabViewed,
    toggleHypothesisStatus,
    executeInteractiveAction,
    unlockProgressiveHint,
    closeTicket,
    retryTicket,
    lastXpGained,
    newAchievementIds,
  } = useGame();

  const [activeTab, setActiveTab] = useState<ToolTab>("terminal");
  const [kbModalOpen, setKbModalOpen] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [escModalOpen, setEscModalOpen] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);

  useEffect(() => {
    if (id && (!session || session.scenarioId !== id)) {
      startTicket(id);
    }
  }, [id, session, startTicket]);

  if (!id || !getScenario(id)) return <Navigate to="/tickets" replace />;
  if (!session || !scenario || session.scenarioId !== id) return null;

  const enriched = enrichedScenario ?? getEnrichedScenario(scenario);

  if (session.status === "complete" && session.result) {
    return (
      <div className="px-4 py-8 sm:px-6">
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

  function handleSelectTab(tab: ToolTab) {
    setActiveTab(tab);
    markToolTabViewed(tab);
  }

  function copyIp() {
    navigator.clipboard?.writeText(enriched.device.ipAddress);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  }

  const isFixActive = !!session.resolutionSubmittedId && session.resolutionSubmittedId === scenario.resolutionOptions.find((r) => r.isCorrect)?.id;

  // Count active hypotheses
  const hypothesisKeys = Object.keys(session.hypothesisStates);
  const eliminatedCount = hypothesisKeys.filter((k) => session.hypothesisStates[k] === "ruled_out").length;

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 space-y-4">
      {/* Top Breadcrumb & Status Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Link
            to="/tickets"
            className="flex items-center gap-1 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Queue</span>
          </Link>
          <span className="text-[var(--color-text-muted)]">/</span>
          <span className="font-mono text-xs font-bold text-[var(--color-primary)]">{scenario.ticketNumber}</span>
          <span className="text-[var(--color-text-muted)]">·</span>
          <span className="text-xs font-bold text-[var(--color-text)] truncate max-w-[200px] sm:max-w-md">
            {scenario.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Priority Badge */}
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-[10.5px] font-bold uppercase",
              enriched.priority === "Critical" && "bg-[var(--color-critical-soft)] text-[var(--color-critical)]",
              enriched.priority === "High" && "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
              enriched.priority === "Medium" && "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300",
              enriched.priority === "Low" && "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            )}
          >
            {enriched.priority} Priority
          </span>

          <span className="flex items-center gap-1 rounded-md bg-[var(--color-surface-muted)] px-2 py-0.5 text-xs font-semibold text-[var(--color-text-secondary)]">
            <Clock size={12} /> SLA: ~{enriched.slaMinutes}m
          </span>

          {/* Quick KB lookup button */}
          <button
            onClick={() => setKbModalOpen(true)}
            className="flex items-center gap-1 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] transition-colors"
          >
            <BookOpen size={13} className="text-[var(--color-primary)]" />
            <span className="hidden sm:inline">Lookup SOPs</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Workstation Layout */}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr_340px]">
        {/* Left Column: Asset & Requester Dossier */}
        <aside className="space-y-3.5 lg:sticky lg:top-18 lg:h-[calc(100vh-120px)] lg:overflow-y-auto thin-scroll">
          {/* Requester Profile Card */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-xs font-bold text-[var(--color-primary)]">
                {enriched.user.initials}
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-[var(--color-text)] truncate">{enriched.user.name}</h4>
                <p className="text-[11px] text-[var(--color-text-muted)] truncate">
                  {enriched.user.role} · {enriched.user.department}
                </p>
              </div>
            </div>

            <div className="mt-3 space-y-1.5 border-t border-[var(--color-border)] pt-2.5 text-[11px] text-[var(--color-text-secondary)]">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Location:</span>
                <span className="truncate max-w-[150px] font-medium">{enriched.user.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Phone:</span>
                <span className="font-mono">{enriched.user.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Tech Level:</span>
                <span className="font-semibold text-[var(--color-text)]">{enriched.user.techLevel}</span>
              </div>
            </div>
          </div>

          {/* Connected Device Card */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1">
                <Monitor size={12} /> Connected Asset
              </span>
              <span className={cn(
                "rounded-full px-2 py-0.2 text-[9.5px] font-bold uppercase",
                enriched.device.status === "online" ? "bg-[var(--color-success-soft)] text-[var(--color-success)]" : "bg-[var(--color-warning-soft)] text-[var(--color-warning)]"
              )}>
                {enriched.device.status}
              </span>
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-2.5 space-y-1 font-mono text-[11px]">
              <div className="flex justify-between font-sans">
                <span className="text-[var(--color-text-muted)]">Hostname:</span>
                <span className="font-bold text-[var(--color-text)] font-mono">{enriched.device.hostname}</span>
              </div>
              <div className="flex justify-between items-center font-sans">
                <span className="text-[var(--color-text-muted)]">IPv4 Address:</span>
                <div className="flex items-center gap-1 font-mono">
                  <span className="text-[var(--color-text)] font-semibold">{enriched.device.ipAddress}</span>
                  <button onClick={copyIp} title="Copy IP" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
                    {copiedIp ? <Check size={11} className="text-[var(--color-success)]" /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between font-sans">
                <span className="text-[var(--color-text-muted)]">Gateway:</span>
                <span className="text-[var(--color-text-secondary)] font-mono">{enriched.device.defaultGateway || "None"}</span>
              </div>
              <div className="flex justify-between font-sans">
                <span className="text-[var(--color-text-muted)]">Switch / Port:</span>
                <span className="text-[var(--color-text)]">{enriched.device.switchPort} (VLAN {enriched.device.vlan})</span>
              </div>
            </div>
          </div>

          {/* Reported Symptoms */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 shadow-xs">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
              Reported Symptoms
            </h4>
            <ul className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
              {scenario.symptoms.map((s, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-[var(--color-primary)] font-bold mt-0.5">•</span>
                  <span className="leading-snug">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Activity Log */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 shadow-xs">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
              Session Activity Log
            </h4>
            <ActionHistory actions={session.actionLog} />
          </div>
        </aside>

        {/* Center Column: Multi-Tool Investigation Center */}
        <main className="flex min-h-0 flex-col gap-2">
          {/* Scrollable Tool Tabs Navigation Bar */}
          <div className="flex items-center gap-1 overflow-x-auto thin-scroll rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
            <ToolTabButton
              active={activeTab === "terminal"}
              onClick={() => handleSelectTab("terminal")}
              icon={TerminalSquare}
              label="Terminal"
            />
            <ToolTabButton
              active={activeTab === "hypotheses"}
              onClick={() => handleSelectTab("hypotheses")}
              icon={GitBranch}
              label="Hypothesis Board"
              count={eliminatedCount > 0 ? eliminatedCount : undefined}
            />
            <ToolTabButton
              active={activeTab === "interventions"}
              onClick={() => handleSelectTab("interventions")}
              icon={Wrench}
              label="Live Actions"
              count={session.consequenceHistory.length > 0 ? session.consequenceHistory.length : undefined}
            />
            <ToolTabButton
              active={activeTab === "chat"}
              onClick={() => handleSelectTab("chat")}
              icon={MessageCircle}
              label={`Chat (${scenario.user.name.split(" ")[0]})`}
              count={session.askedQuestionIds.length}
            />
            <ToolTabButton
              active={activeTab === "evidence"}
              onClick={() => handleSelectTab("evidence")}
              icon={Search}
              label="Evidence"
              count={session.revealedEvidenceIds.length}
            />
            <ToolTabButton
              active={activeTab === "eventvwr"}
              onClick={() => handleSelectTab("eventvwr")}
              icon={Shield}
              label="Event Viewer"
            />
            <ToolTabButton
              active={activeTab === "services"}
              onClick={() => handleSelectTab("services")}
              icon={Cog}
              label="Services"
            />
            <ToolTabButton
              active={activeTab === "ncpa"}
              onClick={() => handleSelectTab("ncpa")}
              icon={Network}
              label="Network Adapter"
            />
            <ToolTabButton
              active={activeTab === "devmgmt"}
              onClick={() => handleSelectTab("devmgmt")}
              icon={Monitor}
              label="Device Manager"
            />
            <ToolTabButton
              active={activeTab === "ad"}
              onClick={() => handleSelectTab("ad")}
              icon={Users}
              label="Active Directory"
            />
            <ToolTabButton
              active={activeTab === "topology"}
              onClick={() => handleSelectTab("topology")}
              icon={Radio}
              label="Topology Ping"
            />
          </div>

          {/* Active Tool Viewport */}
          <div className="h-[520px] lg:h-[calc(100vh-210px)]">
            {activeTab === "terminal" && (
              <TerminalPanel
                history={session.terminalHistory}
                availableCommands={scenario.availableCommands}
                onRun={runCommand}
                disabled={session.status === "complete"}
              />
            )}
            {activeTab === "hypotheses" && (
              <HypothesisBoardTool
                hypotheses={enriched.hypotheses}
                hypothesisStates={session.hypothesisStates}
                onToggleStatus={toggleHypothesisStatus}
                revealedEvidenceIds={session.revealedEvidenceIds}
                allEvidence={scenario.evidence}
              />
            )}
            {activeTab === "interventions" && (
              <InteractiveActionsTool
                actions={enriched.interactiveActions}
                consequenceHistory={session.consequenceHistory}
                onExecuteAction={executeInteractiveAction}
                disabled={session.status === "complete"}
              />
            )}
            {activeTab === "chat" && (
              <ChatPanel
                user={enriched.user}
                questions={scenario.conversationQuestions}
                askedIds={session.askedQuestionIds}
                onAsk={askQuestion}
              />
            )}
            {activeTab === "evidence" && (
              <EvidencePanel
                evidence={scenario.evidence}
                revealedIds={session.revealedEvidenceIds}
              />
            )}
            {activeTab === "eventvwr" && (
              <EventViewerTool
                logs={enriched.eventLogs}
                hostname={enriched.device.hostname}
              />
            )}
            {activeTab === "services" && (
              <ServicesTool
                services={enriched.services}
                serviceOverrides={session.serviceOverrides}
                onToggleService={toggleService}
                hostname={enriched.device.hostname}
              />
            )}
            {activeTab === "devmgmt" && (
              <DeviceManagerTool
                devices={enriched.deviceManager}
                hostname={enriched.device.hostname}
              />
            )}
            {activeTab === "ncpa" && (
              <NetworkConfigTool device={enriched.device} />
            )}
            {activeTab === "ad" && (
              <ActiveDirectoryTool account={enriched.adAccount} />
            )}
            {activeTab === "topology" && (
              <TopologyPingTool
                device={enriched.device}
                category={scenario.category}
                tags={scenario.tags}
                fixApplied={isFixActive}
              />
            )}
          </div>
        </main>

        {/* Right Column: Case Resolution & Remediation Panel */}
        <aside className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs lg:sticky lg:top-18 lg:h-[calc(100vh-120px)] flex flex-col">
          <CasePanel
            scenario={scenario}
            session={session}
            onSubmitDiagnosis={submitDiagnosis}
            onSubmitDiagnosisWithEvidence={submitDiagnosisWithEvidence}
            onSubmitResolution={submitResolution}
            onUseHint={useHint}
            onUnlockProgressiveHint={unlockProgressiveHint}
            onClose={closeTicket}
            onOpenDocumentation={() => setDocModalOpen(true)}
            onOpenEscalation={() => setEscModalOpen(true)}
          />
        </aside>
      </div>

      {/* Knowledge Base Modal */}
      <KnowledgeBaseModal
        isOpen={kbModalOpen}
        onClose={() => setKbModalOpen(false)}
        initialQuery={scenario.tags[0] ?? ""}
      />

      {/* Documentation Form Modal */}
      <DocumentationModal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        scenario={scenario}
        session={session}
        onSave={updateDocumentation}
        onProceedToClose={() => {
          setDocModalOpen(false);
          closeTicket();
        }}
      />

      {/* Escalation Modal */}
      <EscalationModal
        isOpen={escModalOpen}
        onClose={() => setEscModalOpen(false)}
        scenario={scenario}
        escalationOptions={enriched.escalationOptions}
        onConfirmEscalation={(optId) => {
          setEscModalOpen(false);
          submitEscalation(optId);
        }}
      />
    </div>
  );
}

function ToolTabButton({
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
        "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors",
        active
          ? "bg-[var(--color-primary)] text-white shadow-xs"
          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
      )}
    >
      <Icon size={13} />
      <span>{label}</span>
      {typeof count === "number" && count > 0 && (
        <span
          className={cn(
            "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9.5px] font-bold",
            active ? "bg-white/20 text-white" : "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
