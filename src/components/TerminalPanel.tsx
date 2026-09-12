import { useEffect, useRef, useState } from "react";
import type { TerminalHistoryEntry } from "../types/game";

interface TerminalPanelProps {
  history: TerminalHistoryEntry[];
  availableCommands: string[];
  onRun: (input: string) => void;
  disabled?: boolean;
}

export function TerminalPanel({ history, availableCommands, onRun, disabled }: TerminalPanelProps) {
  const [input, setInput] = useState("");
  const [recallIndex, setRecallIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history]);

  function submit() {
    const value = input.trim();
    if (!value) return;
    onRun(value);
    setInput("");
    setRecallIndex(null);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      submit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = recallIndex === null ? history.length - 1 : Math.max(0, recallIndex - 1);
      setRecallIndex(nextIndex);
      setInput(history[nextIndex].input);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (recallIndex === null) return;
      const nextIndex = recallIndex + 1;
      if (nextIndex >= history.length) {
        setRecallIndex(null);
        setInput("");
      } else {
        setRecallIndex(nextIndex);
        setInput(history[nextIndex].input);
      }
    }
  }

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-xl border border-[#0B1626] bg-[#0B1626] shadow-inner"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center gap-1.5 border-b border-white/5 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#DC2626]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#D97706]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]/70" />
        <span className="ml-2 font-mono text-[11px] text-white/40">
          C:\Windows\system32\cmd.exe — simulated, not a real shell
        </span>
      </div>

      <div ref={scrollRef} className="thin-scroll flex-1 overflow-y-auto px-3 py-3 font-mono text-[12.5px] leading-relaxed">
        {history.length === 0 && (
          <p className="text-white/35">
            Type a command below. Available: {availableCommands.join(", ")}. Type{" "}
            <span className="text-white/60">help</span> for the list anytime.
          </p>
        )}
        {history.map((entry) => (
          <div key={entry.id} className="mb-3">
            <div className="flex gap-1.5 text-[var(--color-primary)]">
              <span className="text-white/40">C:\Users\svc-tech&gt;</span>
              <span className="text-white">{entry.input}</span>
            </div>
            <div className="mt-0.5 whitespace-pre-wrap text-white/75">{entry.output.join("\n")}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-white/5 px-3 py-2.5">
        <span className="font-mono text-[12.5px] text-white/40">C:\Users\svc-tech&gt;</span>
        <input
          ref={inputRef}
          value={input}
          disabled={disabled}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Terminal closed for this ticket" : "e.g. ipconfig"}
          spellCheck={false}
          autoComplete="off"
          className="flex-1 bg-transparent font-mono text-[12.5px] text-white placeholder:text-white/25 focus:outline-none disabled:cursor-not-allowed"
          aria-label="Simulated terminal command input"
        />
      </div>
    </div>
  );
}
