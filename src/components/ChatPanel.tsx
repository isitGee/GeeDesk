import { useEffect, useRef } from "react";
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
    <div className="flex h-full flex-col gap-3 overflow-hidden">
      <div ref={scrollRef} className="thin-scroll flex-1 space-y-3 overflow-y-auto pr-1">
        {asked.length === 0 && (
          <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] p-6 text-center text-sm text-[var(--color-text-muted)]">
            You haven't asked {user.name.split(" ")[0]} anything yet. Pick a question below.
          </div>
        )}
        {asked.map((q) => (
          <div key={q.id} className="space-y-2">
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[var(--color-primary)] px-3.5 py-2 text-[13px] text-white">
                {q.prompt}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[11px] font-bold text-[var(--color-text-secondary)]">
                {initialsOf(user.name)}
              </span>
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-[13px] text-[var(--color-text)]">
                {q.response}
              </div>
            </div>
          </div>
        ))}
      </div>

      {unasked.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-3">
          {unasked.map((q) => (
            <button
              key={q.id}
              onClick={() => onAsk(q.id)}
              className="rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              {q.prompt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
