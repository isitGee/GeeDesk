import { useState } from "react";
import { BookOpen, Search, X, FileText } from "lucide-react";
import { KB_ARTICLES, type KBArticle } from "../../data/kbArticles";
import { cn } from "../../utils/cn";

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export function KnowledgeBaseModal({ isOpen, onClose, initialQuery = "" }: KnowledgeBaseModalProps) {
  const [search, setSearch] = useState(initialQuery);
  const [selectedArticle, setSelectedArticle] = useState<KBArticle | null>(null);

  if (!isOpen) return null;

  const filteredArticles = KB_ARTICLES.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.sopNumber.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
              <BookOpen size={16} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text)]">IT Standard Operating Procedures (SOPs)</h3>
              <p className="text-[11px] text-[var(--color-text-muted)]">GeeDesk Technical Knowledge Base</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Article List / Search Left Column */}
          <div className="thin-scroll w-full sm:w-[320px] border-r border-[var(--color-border)] flex flex-col">
            <div className="p-3 border-b border-[var(--color-border)]">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2.5 text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search DNS, DHCP, VLANs, Spooler..."
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1.5 pl-8 pr-3 text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredArticles.map((art) => {
                const isSelected = selectedArticle?.id === art.id;
                return (
                  <button
                    key={art.id}
                    onClick={() => setSelectedArticle(art)}
                    className={cn(
                      "w-full rounded-xl p-2.5 text-left text-xs transition-colors",
                      isSelected
                        ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)] font-semibold"
                        : "text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-[var(--color-text-muted)]">
                        {art.sopNumber}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)]">{art.category}</span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 font-bold text-xs">{art.title}</p>
                    <p className="mt-1 line-clamp-2 text-[11px] text-[var(--color-text-secondary)] font-normal">
                      {art.summary}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Article View Right Column */}
          <div className="thin-scroll flex-1 overflow-y-auto p-6 bg-[var(--color-surface)]">
            {selectedArticle ? (
              <div className="space-y-5 max-w-2xl">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--color-primary)]">
                      {selectedArticle.sopNumber}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">·</span>
                    <span className="rounded bg-[var(--color-surface-muted)] px-2 py-0.5 text-[10.5px] font-semibold text-[var(--color-text-secondary)]">
                      {selectedArticle.category}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">·</span>
                    <span className="text-[11px] text-[var(--color-text-muted)]">{selectedArticle.readingTimeMinutes} min read</span>
                  </div>
                  <h2 className="text-lg font-black tracking-tight text-[var(--color-text)] mt-1">
                    {selectedArticle.title}
                  </h2>
                  <p className="mt-2 text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    {selectedArticle.summary}
                  </p>
                </div>

                {/* Diagnostic Steps */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Diagnostic Procedure
                  </h3>
                  <div className="space-y-2.5">
                    {selectedArticle.diagnosticSteps.map((step) => (
                      <div key={step.step} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 text-xs">
                        <div className="flex items-center gap-2 font-bold text-[var(--color-text)]">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] text-white">
                            {step.step}
                          </span>
                          <span>{step.title}</span>
                        </div>
                        <p className="mt-1.5 text-[11.5px] text-[var(--color-text-secondary)]">{step.action}</p>
                        {step.command && (
                          <div className="mt-2 rounded bg-[#0B1626] px-2.5 py-1.5 font-mono text-[11px] text-emerald-400">
                            &gt; {step.command}
                          </div>
                        )}
                        <p className="mt-1.5 text-[11px] text-[var(--color-text-muted)] italic">
                          Expected: {step.expectedOutcome}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Root Cause & Remediation */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Remediation & Best Practices
                  </h3>
                  <ul className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
                    {selectedArticle.remediation.map((rem, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="font-bold text-[var(--color-primary)]">•</span>
                        <span>{rem}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Verification */}
                <div className="rounded-xl border border-[var(--color-success)]/30 bg-[var(--color-success-soft)] p-3 text-xs">
                  <span className="font-bold text-[var(--color-success)] block mb-1">Verification Standard:</span>
                  <p className="text-[var(--color-text)]">{selectedArticle.verification}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <FileText size={40} className="text-[var(--color-text-muted)] mb-2" />
                <h4 className="font-bold text-sm text-[var(--color-text)]">Select a Standard Operating Procedure</h4>
                <p className="text-xs text-[var(--color-text-muted)] max-w-sm mt-1">
                  Browse procedures on the left or search keywords to review technical verification standards.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
