import { useState } from "react";
import { FileText, Sparkles, CheckCircle2, X } from "lucide-react";
import type { Scenario, TicketDocumentation } from "../types/scenario";
import type { TicketSession } from "../types/game";

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: Scenario;
  session: TicketSession;
  onSave: (doc: Partial<TicketDocumentation>) => void;
  onProceedToClose: () => void;
}

export function DocumentationModal({
  isOpen,
  onClose,
  scenario,
  session,
  onSave,
  onProceedToClose,
}: DocumentationModalProps) {
  const [doc, setDoc] = useState<TicketDocumentation>({
    problemSummary: session.documentation?.problemSummary || "",
    investigationFindings: session.documentation?.investigationFindings || "",
    rootCause: session.documentation?.rootCause || "",
    resolutionApplied: session.documentation?.resolutionApplied || "",
    verificationSteps: session.documentation?.verificationSteps || "",
    preventiveAdvice: session.documentation?.preventiveAdvice || "",
  });

  if (!isOpen) return null;

  function autoFillFromFindings() {
    const revealedEv = scenario.evidence.filter((e) => session.revealedEvidenceIds.includes(e.id));
    const diag = scenario.diagnosisOptions.find((d) => d.id === session.diagnosisSubmittedId);
    const res = scenario.resolutionOptions.find((r) => r.id === session.resolutionSubmittedId);

    const generated: TicketDocumentation = {
      problemSummary: `${scenario.user.name} reported: "${scenario.ticketDescription}" Symptoms observed: ${scenario.symptoms.join(", ")}.`,
      investigationFindings: revealedEv.map((e) => `• ${e.label}: ${e.detail}`).join("\n"),
      rootCause: diag?.label || "Fault identified during diagnostic testing.",
      resolutionApplied: res?.label || "Configuration updated and service verified.",
      verificationSteps: scenario.verification.successMessage,
      preventiveAdvice: "Monitor host network adapter; ensure configuration changes adhere to change management policies.",
    };

    setDoc(generated);
    onSave(generated);
  }

  function handleSaveAndClose() {
    onSave(doc);
    onProceedToClose();
  }

  // Completeness indicator
  const completedFields = [
    doc.problemSummary.trim().length > 10,
    doc.investigationFindings.trim().length > 10,
    doc.rootCause.trim().length > 10,
    doc.resolutionApplied.trim().length > 10,
    doc.preventiveAdvice.trim().length > 5,
  ].filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative flex h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
              <FileText size={16} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text)]">
                ITIL Ticket Documentation & Work Notes — {scenario.ticketNumber}
              </h3>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Structured closure records are scored for completeness and clarity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={autoFillFromFindings}
              className="flex items-center gap-1 rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white"
            >
              <Sparkles size={13} /> Auto-assemble findings
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2 text-xs">
          <span className="text-[var(--color-text-secondary)]">
            Documentation Completeness: <strong>{completedFields} / 5 sections</strong>
          </span>
          <div className="h-2 w-32 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
            <div
              className="h-full rounded-full bg-[var(--color-primary)] transition-all"
              style={{ width: `${(completedFields / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Body */}
        <div className="thin-scroll flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] mb-1">
              1. Problem Summary (User Symptoms & Impact)
            </label>
            <textarea
              rows={2}
              value={doc.problemSummary}
              onChange={(e) => {
                const next = { ...doc, problemSummary: e.target.value };
                setDoc(next);
                onSave(next);
              }}
              placeholder="e.g. User reported inability to access internet or corporate websites despite network link showing connected..."
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-2.5 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] mb-1">
              2. Diagnostic Findings & Investigation Steps
            </label>
            <textarea
              rows={3}
              value={doc.investigationFindings}
              onChange={(e) => {
                const next = { ...doc, investigationFindings: e.target.value };
                setDoc(next);
                onSave(next);
              }}
              placeholder="e.g. Executed ipconfig /all to verify adapter settings; pinged default gateway 192.168.1.1 (0% loss); tested nslookup which timed out against 192.168.1.10..."
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-2.5 text-xs text-[var(--color-text)] font-mono text-[11px] focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:outline-none"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] mb-1">
                3. Root Cause Identified
              </label>
              <textarea
                rows={2}
                value={doc.rootCause}
                onChange={(e) => {
                  const next = { ...doc, rootCause: e.target.value };
                  setDoc(next);
                  onSave(next);
                }}
                placeholder="e.g. Manually misconfigured DNS IP pointing to a nonexistent server on the local subnet."
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-2.5 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] mb-1">
                4. Resolution Applied
              </label>
              <textarea
                rows={2}
                value={doc.resolutionApplied}
                onChange={(e) => {
                  const next = { ...doc, resolutionApplied: e.target.value };
                  setDoc(next);
                  onSave(next);
                }}
                placeholder="e.g. Updated adapter IPv4 DNS server configuration to active corporate resolver 192.168.1.5 and flushed cache."
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-2.5 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] mb-1">
              5. Preventive Advice & Follow-Up
            </label>
            <textarea
              rows={2}
              value={doc.preventiveAdvice}
              onChange={(e) => {
                const next = { ...doc, preventiveAdvice: e.target.value };
                setDoc(next);
                onSave(next);
              }}
              placeholder="e.g. Advised user to notify IT before reconfiguring adapter properties; scheduled audit on static IP allocations."
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-2.5 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-2 text-xs font-bold text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
          >
            Save Draft & Continue Investigation
          </button>

          <button
            onClick={handleSaveAndClose}
            className="flex items-center gap-1.5 rounded-xl bg-[var(--color-primary)] px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
          >
            <CheckCircle2 size={15} /> Save & Finalize Ticket
          </button>
        </div>
      </div>
    </div>
  );
}
