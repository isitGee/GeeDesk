import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Search, ArrowRight, CheckCircle2 } from "lucide-react";
import { KB_ARTICLES, searchKBArticles, type KBArticle } from "../data/kbArticles";
import { cn } from "../utils/cn";

export function KnowledgeBasePage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeArticle, setActiveArticle] = useState<KBArticle>(KB_ARTICLES[0]);

  const categories = ["All", "Networking", "Windows", "Hardware", "Security", "Service Desk"];

  const filtered = searchKBArticles(query).filter(
    (a) => selectedCategory === "All" || a.category === selectedCategory
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
            <BookOpen size={15} />
            <span>GeeDesk Knowledge Base & ITIL Library</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[var(--color-text)] mt-1">
            Standard Operating Procedures (SOPs)
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Diagnostic workflows, CCNA/CompTIA technical principles, and incident remediation guides.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-3 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search DNS, DHCP, VLANs, Spooler..."
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-9 pr-3 text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none shadow-xs"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors",
              selectedCategory === cat
                ? "bg-[var(--color-primary)] text-white shadow-xs"
                : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Article Index / Directory */}
        <div className="thin-scroll space-y-2 lg:max-h-[calc(100vh-250px)] lg:overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-xs text-[var(--color-text-muted)]">
              No SOP articles found matching "{query}".
            </div>
          ) : (
            filtered.map((art) => {
              const isSelected = activeArticle.id === art.id;
              return (
                <div
                  key={art.id}
                  onClick={() => setActiveArticle(art)}
                  className={cn(
                    "cursor-pointer rounded-2xl border p-4 transition-all shadow-xs",
                    isSelected
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]/40 ring-1 ring-[var(--color-primary)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-muted)]"
                  )}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-[var(--color-primary)]">{art.sopNumber}</span>
                    <span className="text-[var(--color-text-muted)]">{art.category}</span>
                  </div>
                  <h3 className="text-xs font-bold text-[var(--color-text)] mt-1 leading-snug">
                    {art.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[11.5px] text-[var(--color-text-secondary)] leading-relaxed">
                    {art.summary}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Article Viewer */}
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-[var(--color-primary)]">
                {activeArticle.sopNumber}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">·</span>
              <span className="rounded-md bg-[var(--color-surface-muted)] px-2 py-0.5 text-xs font-semibold text-[var(--color-text-secondary)]">
                {activeArticle.category}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">·</span>
              <span className="text-xs text-[var(--color-text-muted)]">{activeArticle.readingTimeMinutes} min reference read</span>
            </div>

            <h2 className="text-2xl font-black tracking-tight text-[var(--color-text)] mt-2">
              {activeArticle.title}
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {activeArticle.summary}
            </p>
          </div>

          {/* Diagnostic Steps Flow */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              Diagnostic & Triage Workflow
            </h3>
            <div className="space-y-3">
              {activeArticle.diagnosticSteps.map((step) => (
                <div
                  key={step.step}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 text-xs"
                >
                  <div className="flex items-center gap-2 font-bold text-[var(--color-text)]">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] text-white">
                      {step.step}
                    </span>
                    <span className="text-xs">{step.title}</span>
                  </div>
                  <p className="mt-1.5 text-[12px] text-[var(--color-text-secondary)] leading-relaxed">
                    {step.action}
                  </p>
                  {step.command && (
                    <div className="mt-2 rounded-xl bg-[#070D18] p-2.5 font-mono text-[11.5px] text-emerald-400">
                      C:\Users\svc-tech&gt; {step.command}
                    </div>
                  )}
                  <p className="mt-2 text-[11px] text-[var(--color-text-muted)] font-medium">
                    Expected Result: <em>{step.expectedOutcome}</em>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Root Cause Analysis */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-xs space-y-2">
            <h3 className="font-bold text-[var(--color-text)] uppercase tracking-wider text-[11px]">
              Technical Root Cause Analysis
            </h3>
            <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">
              {activeArticle.rootCauseAnalysis}
            </p>
          </div>

          {/* Remediation Points */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              Remediation Protocols
            </h3>
            <ul className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
              {activeArticle.remediation.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-[var(--color-success)] shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Verification Box */}
          <div className="rounded-2xl border border-[var(--color-success)]/40 bg-[var(--color-success-soft)] p-4 text-xs">
            <span className="font-bold text-[var(--color-success)] block mb-1">Standard Verification Proof:</span>
            <p className="text-[var(--color-text)] leading-relaxed">{activeArticle.verification}</p>
          </div>

          {/* Related Tickets */}
          {activeArticle.relatedScenarios.length > 0 && (
            <div className="border-t border-[var(--color-border)] pt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[var(--color-text-muted)]">Practice in Incident:</span>
              {activeArticle.relatedScenarios.map((scenId) => (
                <Link
                  key={scenId}
                  to={`/tickets/${scenId}`}
                  className="flex items-center gap-1 rounded-lg border border-[var(--color-primary)]/40 bg-[var(--color-primary-soft)] px-2.5 py-1 text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                >
                  <span>{scenId.toUpperCase()}</span>
                  <ArrowRight size={11} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
