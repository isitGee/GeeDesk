import { useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";
import type { ConversationQuestion, ScenarioUser } from "../types/scenario";

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ChatPanel({
  user,
  questions,
  askedIds,
  onAsk,
}: {
  user: ScenarioUser;
  questions: ConversationQuestion[];
  askedIds: string[];
  onAsk: (id: string) => void;
}) {
  const asked = questions.filter((q) => askedIds.includes(q.id));
  const unasked = questions.filter((q) => !askedIds.includes(q.id));
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [asked.length]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      {/* User Persona Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-xs font-bold text-[var(--color-primary)]">
            {initialsOf(user.name)}
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[var(--color-text)]">{user.name}</span>
              <span className="text-[11px] text-[var(--color-text-muted)]">· {user.role}</span>
            </div>
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              {user.department} {user.location ? `· ${user.location}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          {user.techLevel && (
            <span className="rounded-md bg-[var(--color-border)] px-2 py-0.5 font-medium text-[var(--color-text-secondary)]">
              Level: {user.techLevel}
            </span>
          )}
          <span className="flex items-center gap-1 text-[var(--color-success)] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
            Active on chat
          </span>
        </div>
      </div>

      {/* Persona Note Banner */}
      {user.communicationStyle && (
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-[11px] text-[var(--color-text-muted)] italic">
          <strong>Communication note:</strong> {user.communicationStyle}
        </div>
      )}

      {/* Chat Messages */}
      <div ref={scrollRef} className="thin-scroll flex-1 space-y-3 overflow-y-auto p-4">
        {asked.length === 0 && (
          <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] p-6 text-center text-xs text-[var(--color-text-muted)]">
            <MessageCircle size={24} className="mx-auto mb-2 text-[var(--color-text-muted)] opacity-60" />
            <p className="font-semibold text-[var(--color-text)]">Begin Technician Inquiry</p>
            <p className="mt-1">
              Select a question below. Asking good scoping questions (e.g. scope of impact, recent changes) scores higher than jumping directly to conclusions.
            </p>
          </div>
        )}

        {asked.map((q) => (
          <div key={q.id} className="space-y-2">
            {/* Tech question */}
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[var(--color-primary)] px-3.5 py-2 text-xs text-white shadow-xs">
                {q.prompt ?? q.question}
              </div>
            </div>

            {/* User response */}
            <div className="flex items-start gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[10px] font-bold text-[var(--color-text-secondary)] mt-0.5">
                {initialsOf(user.name)}
              </span>
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3.5 py-2 text-xs text-[var(--color-text)] leading-relaxed">
                {q.response ?? q.answer}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Question Selector Bar */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        {unasked.length > 0 ? (
          <div className="space-y-1.5">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              Available Technician Questions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {unasked.map((q) => (
                <button
                  key={q.id}
                  onClick={() => onAsk(q.id)}
                  className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-left text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)] font-medium"
                >
                  {q.prompt ?? q.question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-xs text-[var(--color-text-muted)] py-1">
            All available conversation inquiries completed.
          </p>
        )}
      </div>
    </div>
  );
}
