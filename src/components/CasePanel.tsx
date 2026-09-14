import { useState } from "react";
import { CheckCircle2, Circle, Lightbulb, Lock, ShieldCheck, XCircle } from "lucide-react";
import type { Scenario } from "../types/scenario";
import type { TicketSession } from "../types/game";
import { cn } from "../utils/cn";

interface CasePanelProps {
  scenario: Scenario;
  session: TicketSession;
  onSubmitDiagnosis: (id: string) => void;
  onSubmitResolution: (id: string) => void;
  onUseHint: (id: string) => void;
  onClose: () => void;
}

function StepHeader({ index, title, state }: { index: number; title: string; state: "locked" | "active" | "done" }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
          state === "done" && "bg-[var(--color-success)] text-white",
          state === "active" && "bg-[var(--color-primary)] text-white",
          state === "locked" && "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
        )}
      >
        {state === "done" ? <CheckCircle2 size={14} /> : index}
      </span>
      <h3
        className={cn(
          "text-[13.5px] font-bold",
          state === "locked" ? "text-[var(--color-text-muted)]" : "text-[var(--color-text)]"
        )}
      >
        {title}
      </h3>
    </div>
  );
}

export function CasePanel({ scenario, session, onSubmitDiagnosis, onSubmitResolution, onUseHint, onClose }: CasePanelProps) {
  const [showHints, setShowHints] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  const diagnosisDone = !!session.diagnosisSubmittedId;
  const resolutionDone = !!session.resolutionSubmittedId;
  const verified = session.verificationPassed;

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto thin-scroll pr-1">
      {/* Step 1 — Diagnosis */}
      <section className="space-y-2.5">
        <StepHeader index={1} title="Submit a diagnosis" state={diagnosisDone ? "done" : "active"} />
        {!diagnosisDone ? (
          <DiagnosisForm scenario={scenario} onSubmit={onSubmitDiagnosis} />
        ) : (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 text-[12.5px] text-[var(--color-text-secondary)]">
            <span className="flex items-center gap-1.5 font-semibold text-[var(--color-text)]">
              <Lock size={12} /> Diagnosis locked in
            </span>
            You'll find out whether it holds up once you verify your fix.
          </div>
        )}
      </section>

      {/* Step 2 — Resolution */}
      <section className={cn("space-y-2.5", !diagnosisDone && "pointer-events-none opacity-40")}>
        <StepHeader index={2} title="Choose a resolution" state={!diagnosisDone ? "locked" : resolutionDone ? "done" : "active"} />
        {diagnosisDone && (
          <ResolutionForm
            scenario={scenario}
            selectedId={session.resolutionSubmittedId}
            locked={verified}
            onSubmit={onSubmitResolution}
          />
        )}
      </section>

      {/* Step 3 — Verify */}
      <section className={cn("space-y-2.5", !resolutionDone && "pointer-events-none opacity-40")}>
        <StepHeader index={3} title="Verify the fix" state={!resolutionDone ? "locked" : verified ? "done" : "active"} />
        {resolutionDone && (
          <div
            className={cn(
              "rounded-xl border p-3 text-[12.5px]",
              verified
                ? "border-[var(--color-success)]/30 bg-[var(--color-success-soft)] text-[var(--color-success)]"
                : "border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]"
            )}
          >
            {verified ? (
              <span className="flex items-center gap-1.5 font-semibold">
                <ShieldCheck size={14} /> {scenario.verification.successMessage}
              </span>
            ) : (
              <>
                <p className="font-semibold text-[var(--color-text)]">{scenario.verification.prompt}</p>
                <p className="mt-1">Run it in the terminal — you'll know it worked when the ticket says so here.</p>
              </>
            )}
          </div>
        )}
      </section>

      {/* Hints */}
      <section className="space-y-2">
        <button
          onClick={() => setShowHints((v) => !v)}
          className="flex w-full items-center gap-1.5 text-[12.5px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
        >
          <Lightbulb size={14} />
          Hints {showHints ? "▾" : "▸"}
        </button>
        {showHints && (
          <div className="space-y-2">
            {scenario.hints.map((hint) => {
              const used = session.usedHintIds.includes(hint.id);
              return (
                <div key={hint.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2.5 text-[12.5px]">
                  {used ? (
                    <p className="text-[var(--color-text-secondary)]">{hint.text}</p>
                  ) : (
                    <button
                      onClick={() => onUseHint(hint.id)}
                      className="flex w-full items-center justify-between text-[var(--color-text)]"
                    >
                      <span>Reveal a hint</span>
                      <span className="font-semibold text-[var(--color-warning)]">-{hint.cost} pts</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Close ticket */}
      <div className="mt-auto pt-2">
        {!confirmClose ? (
          <button
            disabled={!resolutionDone}
            onClick={() => (verified ? onClose() : setConfirmClose(true))}
            className={cn(
              "w-full rounded-xl py-2.5 text-[13.5px] font-bold transition-colors",
              resolutionDone
                ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
                : "cursor-not-allowed bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
            )}
          >
            Close ticket
          </button>
        ) : (
          <div className="space-y-2 rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning-soft)] p-3">
            <p className="text-[12.5px] font-semibold text-[var(--color-text)]">
              You haven't verified the fix yet. Close anyway?
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg bg-[var(--color-warning)] py-1.5 text-[12.5px] font-bold text-white"
              >
                Close anyway
              </button>
              <button
                onClick={() => setConfirmClose(false)}
                className="flex-1 rounded-lg border border-[var(--color-border-strong)] py-1.5 text-[12.5px] font-semibold text-[var(--color-text)]"
              >
                Keep investigating
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DiagnosisForm({ scenario, onSubmit }: { scenario: Scenario; onSubmit: (id: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="space-y-2">
      {scenario.diagnosisOptions.map((opt) => (
        <label
          key={opt.id}
          className={cn(
            "flex cursor-pointer items-start gap-2 rounded-xl border p-2.5 text-[12.5px] transition-colors",
            selected === opt.id
              ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
              : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-strong)]"
          )}
        >
          <input
            type="radio"
            name="diagnosis"
            className="mt-0.5 accent-[var(--color-primary)]"
            checked={selected === opt.id}
            onChange={() => setSelected(opt.id)}
          />
          <span className="text-[var(--color-text)]">{opt.label}</span>
        </label>
      ))}
      <button
        disabled={!selected}
        onClick={() => selected && onSubmit(selected)}
        className={cn(
          "w-full rounded-lg py-2 text-[12.5px] font-bold transition-colors",
          selected
            ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
            : "cursor-not-allowed bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
        )}
      >
        Lock in diagnosis
      </button>
    </div>
  );
}

function ResolutionForm({
  scenario,
  selectedId,
  locked,
  onSubmit,
}: {
  scenario: Scenario;
  selectedId: string | null;
  locked: boolean;
  onSubmit: (id: string) => void;
}) {
  const [pending, setPending] = useState<string | null>(selectedId);
  return (
    <div className="space-y-2">
      {scenario.resolutionOptions.map((opt) => (
        <label
          key={opt.id}
          className={cn(
            "flex cursor-pointer items-start gap-2 rounded-xl border p-2.5 text-[12.5px] transition-colors",
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
          <span className="text-[var(--color-text)]">{opt.label}</span>
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
            "w-full rounded-lg py-2 text-[12.5px] font-bold transition-colors",
            pending && pending !== selectedId
              ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
              : "cursor-not-allowed bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
          )}
        >
          {selectedId ? "Try this fix instead" : "Apply fix"}
        </button>
      )}
      {selectedId && !locked && (
        <p className="flex items-center gap-1 text-[11.5px] text-[var(--color-text-muted)]">
          <XCircle size={12} /> Fix applied — head to the terminal to verify it.
        </p>
      )}
    </div>
  );
}
