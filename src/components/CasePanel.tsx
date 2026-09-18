import { useState } from "react";
import { CheckCircle2, Circle, Lightbulb, Lock, ShieldCheck, FileText, Share2, GraduationCap, CheckSquare, Square } from "lucide-react";
import type { Scenario } from "../types/scenario";
import type { TicketSession } from "../types/game";
import { getEnrichedScenario } from "../data/scenarioEnricher";
import { cn } from "../utils/cn";

interface CasePanelProps {
  scenario: Scenario;
  session: TicketSession;
  onSubmitDiagnosis: (id: string) => void;
  onSubmitDiagnosisWithEvidence?: (id: string, supportingEvidenceIds: string[]) => void;
  onSubmitResolution: (id: string) => void;
  onUseHint?: (id: string) => void;
  onUnlockProgressiveHint?: (hintId: string, level: number) => void;
  onClose: () => void;
  onOpenDocumentation?: () => void;
  onOpenEscalation?: () => void;
}

function StepHeader({ index, title, state }: { index: number; title: string; state: "locked" | "active" | "done" }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
          state === "done" && "bg-[var(--color-success)] text-white",
          state === "active" && "bg-[var(--color-primary)] text-white shadow-xs",
          state === "locked" && "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
        )}
      >
        {state === "done" ? <CheckCircle2 size={14} /> : index}
      </span>
      <h3
        className={cn(
          "text-xs font-bold uppercase tracking-wider",
          state === "locked" ? "text-[var(--color-text-muted)]" : "text-[var(--color-text)]"
        )}
      >
        {title}
      </h3>
    </div>
  );
}

export function CasePanel({
  scenario,
  session,
  onSubmitDiagnosis,
  onSubmitDiagnosisWithEvidence,
  onSubmitResolution,
  onUseHint: _onUseHint,
  onUnlockProgressiveHint,
  onClose,
  onOpenDocumentation,
  onOpenEscalation,
}: CasePanelProps) {
  const [showHints, setShowHints] = useState(false);
  const [showGuide, setShowGuide] = useState(session.gameMode === "learning");
  const [confirmClose, setConfirmClose] = useState(false);

  const enriched = getEnrichedScenario(scenario);
  const diagnosisDone = !!session.diagnosisSubmittedId;
  const resolutionDone = !!session.resolutionSubmittedId;
  const verified = session.verificationPassed;

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto thin-scroll pr-1">
      {/* Learning Mode Guide Card */}
      {session.gameMode === "learning" && (
        <div className="rounded-xl border border-[var(--color-primary)]/30 bg-[var(--color-primary-soft)] p-3 text-xs">
          <button
            onClick={() => setShowGuide((v) => !v)}
            className="flex w-full items-center justify-between font-bold text-[var(--color-primary)]"
          >
            <span className="flex items-center gap-1.5">
              <GraduationCap size={15} /> Learning Guide & Workflow
            </span>
            <span>{showGuide ? "▾" : "▸"}</span>
          </button>

          {showGuide && (
            <div className="mt-2.5 space-y-2 border-t border-[var(--color-primary)]/20 pt-2 text-[11.5px] text-[var(--color-text-secondary)]">
              <p className="font-semibold text-[var(--color-text)]">
                Recommended Troubleshooting Flow:
              </p>
              <ul className="space-y-1">
                {enriched.learningGuide.investigationChecklist.map((step, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[var(--color-primary)] font-bold">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
              <div className="rounded-lg bg-[var(--color-surface)] p-2 text-[11px] text-[var(--color-warning)] font-medium">
                <strong>Pitfall:</strong> {enriched.learningGuide.commonTrap}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 1 — Diagnosis with Evidence Citations */}
      <section className="space-y-2">
        <StepHeader index={1} title="Formulate Diagnosis & Cite Evidence" state={diagnosisDone ? "done" : "active"} />
        {!diagnosisDone ? (
          <DiagnosisFormWithEvidence
            scenario={scenario}
            session={session}
            onSubmit={(diagId, evidenceIds) => {
              if (onSubmitDiagnosisWithEvidence) {
                onSubmitDiagnosisWithEvidence(diagId, evidenceIds);
              } else {
                onSubmitDiagnosis(diagId);
              }
            }}
          />
        ) : (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 text-xs text-[var(--color-text-secondary)] space-y-1.5">
            <span className="flex items-center gap-1.5 font-bold text-[var(--color-text)]">
              <Lock size={12} className="text-[var(--color-primary)]" /> Diagnosis Locked In
            </span>
            <p className="line-clamp-2">
              "{scenario.diagnosisOptions.find((d) => d.id === session.diagnosisSubmittedId)?.label}"
            </p>
            {session.selectedSupportingEvidenceIds.length > 0 && (
              <span className="text-[10.5px] text-[var(--color-primary)] font-semibold block">
                Citing {session.selectedSupportingEvidenceIds.length} corroborating evidence items
              </span>
            )}
          </div>
        )}
      </section>

      {/* Step 2 — Resolution */}
      <section className={cn("space-y-2", !diagnosisDone && "pointer-events-none opacity-40")}>
        <StepHeader index={2} title="Apply Targeted Fix" state={!diagnosisDone ? "locked" : resolutionDone ? "done" : "active"} />
        {diagnosisDone && (
          <ResolutionForm
            scenario={scenario}
            session={session}
            selectedId={session.resolutionSubmittedId}
            locked={verified}
            onSubmit={onSubmitResolution}
          />
        )}
      </section>

      {/* Step 3 — Verify */}
      <section className={cn("space-y-2", !resolutionDone && "pointer-events-none opacity-40")}>
        <StepHeader index={3} title="Verify Operational State" state={!resolutionDone ? "locked" : verified ? "done" : "active"} />
        {resolutionDone && (
          <div
            className={cn(
              "rounded-xl border p-3 text-xs leading-relaxed",
              verified
                ? "border-[var(--color-success)]/40 bg-[var(--color-success-soft)] text-[var(--color-success)]"
                : "border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]"
            )}
          >
            {verified ? (
              <span className="flex items-start gap-1.5 font-semibold">
                <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                <span>{scenario.verification.successMessage}</span>
              </span>
            ) : (
              <>
                <p className="font-bold text-[var(--color-text)]">{scenario.verification.prompt}</p>
                <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                  Execute the verification command in the Terminal or inspection tool.
                </p>
              </>
            )}
          </div>
        )}
      </section>

      {/* Documentation Quick Action */}
      {resolutionDone && onOpenDocumentation && (
        <section className="rounded-xl border border-[var(--color-primary)]/30 bg-[var(--color-surface)] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
              <FileText size={14} className="text-[var(--color-primary)]" /> Work Notes & Documentation
            </span>
            <span className="text-[10.5px] font-semibold text-[var(--color-primary)]">ITIL Standard</span>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)] leading-tight">
            Record symptoms, diagnostic findings, and root causes before final closure.
          </p>
          <button
            onClick={onOpenDocumentation}
            className="w-full rounded-lg border border-[var(--color-primary)] bg-[var(--color-primary-soft)] py-1.5 text-xs font-bold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white"
          >
            Edit Ticket Documentation Form
          </button>
        </section>
      )}

      {/* Escalation Option */}
      {onOpenEscalation && (
        <div className="pt-1">
          <button
            onClick={onOpenEscalation}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] py-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-warning)] hover:text-[var(--color-warning)] transition-colors"
          >
            <Share2 size={13} /> Escalate Ticket (Tier 2 / NOC / SOC)
          </button>
        </div>
      )}

      {/* Progressive 3-Tier Hints */}
      <section className="space-y-1.5 pt-1">
        <button
          onClick={() => setShowHints((v) => !v)}
          className="flex w-full items-center justify-between text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
        >
          <span className="flex items-center gap-1.5">
            <Lightbulb size={13} /> Progressive Diagnostic Hints
          </span>
          <span>{showHints ? "▾" : "▸"}</span>
        </button>

        {showHints && (
          <div className="space-y-3 pt-1">
            {enriched.progressiveHints.map((ph, idx) => {
              const currentLevel = session.unlockedHintLevels[ph.id] ?? 0;
              return (
                <div key={ph.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-[var(--color-text)]">
                    <span>Hint Track {idx + 1}</span>
                    <span className="text-[10.5px] text-[var(--color-text-muted)]">
                      Level {currentLevel} of 3
                    </span>
                  </div>

                  {/* Level 1: Concept */}
                  {currentLevel >= 1 ? (
                    <div className="rounded-lg bg-[var(--color-surface-muted)] p-2 text-[11px] text-[var(--color-text-secondary)]">
                      <strong>L1 Concept:</strong> {ph.concept}
                    </div>
                  ) : (
                    <button
                      onClick={() => onUnlockProgressiveHint?.(ph.id, 1)}
                      className="w-full flex items-center justify-between rounded-lg border border-[var(--color-border)] p-2 text-[11px] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
                    >
                      <span>Unlock L1: Conceptual Coaching</span>
                      <span className="font-bold text-[var(--color-warning)]">-2 pts</span>
                    </button>
                  )}

                  {/* Level 2: Direction */}
                  {currentLevel >= 2 ? (
                    <div className="rounded-lg bg-[var(--color-surface-muted)] p-2 text-[11px] text-[var(--color-text-secondary)]">
                      <strong>L2 Direction:</strong> {ph.direction}
                    </div>
                  ) : currentLevel === 1 ? (
                    <button
                      onClick={() => onUnlockProgressiveHint?.(ph.id, 2)}
                      className="w-full flex items-center justify-between rounded-lg border border-[var(--color-border)] p-2 text-[11px] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
                    >
                      <span>Unlock L2: Layer & Tool Direction</span>
                      <span className="font-bold text-[var(--color-warning)]">-4 pts</span>
                    </button>
                  ) : null}

                  {/* Level 3: Action */}
                  {currentLevel >= 3 ? (
                    <div className="rounded-lg bg-[var(--color-primary-soft)] p-2 text-[11px] text-[var(--color-primary)] font-medium">
                      <strong>L3 Direct Action:</strong> {ph.action}
                    </div>
                  ) : currentLevel === 2 ? (
                    <button
                      onClick={() => onUnlockProgressiveHint?.(ph.id, 3)}
                      className="w-full flex items-center justify-between rounded-lg border border-[var(--color-border)] p-2 text-[11px] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
                    >
                      <span>Unlock L3: Specific Command / Remediation</span>
                      <span className="font-bold text-[var(--color-warning)]">-7 pts</span>
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Close ticket button */}
      <div className="mt-auto pt-3">
        {!confirmClose ? (
          <button
            disabled={!resolutionDone}
            onClick={() => {
              if (verified) {
                if (onOpenDocumentation && !session.documentation?.rootCause) {
                  onOpenDocumentation();
                } else {
                  onClose();
                }
              } else {
                setConfirmClose(true);
              }
            }}
            className={cn(
              "w-full rounded-xl py-2.5 text-xs font-bold transition-all shadow-xs",
              resolutionDone
                ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
                : "cursor-not-allowed bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
            )}
          >
            {verified ? "Complete & Close Incident" : "Close Ticket"}
          </button>
        ) : (
          <div className="space-y-2 rounded-xl border border-[var(--color-warning)]/40 bg-[var(--color-warning-soft)] p-3">
            <p className="text-xs font-semibold text-[var(--color-text)]">
              You haven't verified the fix yet. Close anyway?
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg bg-[var(--color-warning)] py-1.5 text-xs font-bold text-white hover:opacity-90"
              >
                Close without verifying
              </button>
              <button
                onClick={() => setConfirmClose(false)}
                className="flex-1 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] py-1.5 text-xs font-semibold text-[var(--color-text)]"
              >
                Verify first
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DiagnosisFormWithEvidence({
  scenario,
  session,
  onSubmit,
}: {
  scenario: Scenario;
  session: TicketSession;
  onSubmit: (diagId: string, evidenceIds: string[]) => void;
}) {
  const [selectedDiagId, setSelectedDiagId] = useState<string | null>(null);
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([]);

  // Shuffled order from session
  const orderedOptions = [...scenario.diagnosisOptions].sort((a, b) => {
    const idxA = session.randomizedDiagnosisOptionIds.indexOf(a.id);
    const idxB = session.randomizedDiagnosisOptionIds.indexOf(b.id);
    if (idxA === -1 || idxB === -1) return 0;
    return idxA - idxB;
  });

  const discoveredEvidence = scenario.evidence.filter((e) =>
    session.revealedEvidenceIds.includes(e.id)
  );

  function toggleEvidence(id: string) {
    setSelectedEvidenceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  return (
    <div className="space-y-3">
      {/* Root Cause Options */}
      <div className="space-y-1.5">
        <span className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">
          A. Select Root Cause Hypothesis:
        </span>
        {orderedOptions.map((opt) => (
          <label
            key={opt.id}
            className={cn(
              "flex cursor-pointer items-start gap-2 rounded-xl border p-2.5 text-xs transition-colors",
              selectedDiagId === opt.id
                ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-strong)]"
            )}
          >
            <input
              type="radio"
              name="diagnosis"
              className="mt-0.5 accent-[var(--color-primary)]"
              checked={selectedDiagId === opt.id}
              onChange={() => setSelectedDiagId(opt.id)}
            />
            <span className="text-[var(--color-text)] leading-snug">{opt.label}</span>
          </label>
        ))}
      </div>

      {/* Supporting Evidence Citations */}
      {discoveredEvidence.length > 0 && (
        <div className="space-y-1.5 border-t border-[var(--color-border)] pt-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              B. Cite Supporting Evidence (Proof):
            </span>
            <span className="text-[10px] text-[var(--color-primary)] font-semibold">
              {selectedEvidenceIds.length} selected
            </span>
          </div>
          <div className="max-h-36 overflow-y-auto thin-scroll space-y-1">
            {discoveredEvidence.map((ev) => {
              const isChecked = selectedEvidenceIds.includes(ev.id);
              return (
                <div
                  key={ev.id}
                  onClick={() => toggleEvidence(ev.id)}
                  className={cn(
                    "flex items-start gap-2 p-1.5 rounded-lg border text-[11px] cursor-pointer transition-colors",
                    isChecked
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]/30 text-[var(--color-text)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]"
                  )}
                >
                  {isChecked ? (
                    <CheckSquare size={13} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
                  ) : (
                    <Square size={13} className="text-[var(--color-text-muted)] shrink-0 mt-0.5" />
                  )}
                  <span className="truncate">{ev.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        disabled={!selectedDiagId}
        onClick={() => selectedDiagId && onSubmit(selectedDiagId, selectedEvidenceIds)}
        className={cn(
          "w-full rounded-lg py-2 text-xs font-bold transition-colors shadow-2xs",
          selectedDiagId
            ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
            : "cursor-not-allowed bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
        )}
      >
        Lock In Diagnosis & Evidence
      </button>
    </div>
  );
}

function ResolutionForm({
  scenario,
  session,
  selectedId,
  locked,
  onSubmit,
}: {
  scenario: Scenario;
  session: TicketSession;
  selectedId: string | null;
  locked: boolean;
  onSubmit: (id: string) => void;
}) {
  const [pending, setPending] = useState<string | null>(selectedId);

  // Shuffled order from session
  const orderedOptions = [...scenario.resolutionOptions].sort((a, b) => {
    const idxA = session.randomizedResolutionOptionIds.indexOf(a.id);
    const idxB = session.randomizedResolutionOptionIds.indexOf(b.id);
    if (idxA === -1 || idxB === -1) return 0;
    return idxA - idxB;
  });

  return (
    <div className="space-y-2">
      {orderedOptions.map((opt) => (
        <label
          key={opt.id}
          className={cn(
            "flex cursor-pointer items-start gap-2 rounded-xl border p-2.5 text-xs transition-colors",
            pending === opt.id
              ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
              : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-strong)]",
            locked && "opacity-60"
          )}
        >
          <input
            type="radio"
            name="resolution"
            disabled={locked}
            className="mt-0.5 accent-[var(--color-primary)]"
            checked={pending === opt.id}
            onChange={() => setPending(opt.id)}
          />
          <span className="text-[var(--color-text)] leading-snug">{opt.label}</span>
          {selectedId === opt.id && (
            <span className="ml-auto shrink-0 text-[var(--color-text-muted)]">
              {locked ? <ShieldCheck size={14} className="text-[var(--color-success)]" /> : <Circle size={12} />}
            </span>
          )}
        </label>
      ))}
      {!locked && (
        <button
          disabled={!pending || pending === selectedId}
          onClick={() => pending && onSubmit(pending)}
          className={cn(
            "w-full rounded-lg py-2 text-xs font-bold transition-colors",
            pending && pending !== selectedId
              ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
              : "cursor-not-allowed bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
          )}
        >
          {selectedId ? "Apply Alternative Fix" : "Apply Fix to Machine"}
        </button>
      )}
    </div>
  );
}
