import { useEffect, useRef, useState } from "react";
import { Copy, Trash2, Check, Sparkles } from "lucide-react";
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
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history]);

  function submit(cmdToRun?: string) {
    const value = (cmdToRun ?? input).trim();
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

  function copyLog() {
    const text = history.map((h) => `C:\\Users\\svc-tech> ${h.input}\n${h.output.join("\n")}`).join("\n\n");
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-xl border border-[#0B1626] bg-[#070D18] shadow-inner"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Windows Console Titlebar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#0B1626] px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
          </div>
          <span className="ml-2 font-mono text-[11px] text-white/60">
            Administrator: Windows PowerShell (Simulated Endpoint Environment)
          </span>
        </div>

        <div className="flex items-center gap-2 text-white/50 text-xs">
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyLog();
            }}
            title="Copy terminal session"
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span className="text-[10px]">{copied ? "Copied" : "Copy"}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRun("cls");
            }}
            title="Clear terminal"
            className="flex items-center gap-1 hover:text-white transition-colors ml-2"
          >
            <Trash2 size={13} />
            <span className="text-[10px]">Clear</span>
          </button>
        </div>
      </div>

      {/* Suggested Quick Commands */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/5 bg-[#050A13] px-3 py-1.5 text-[11px]">
        <span className="flex items-center gap-1 font-mono text-white/40 text-[10px] uppercase">
          <Sparkles size={11} className="text-amber-400" /> Quick Commands:
        </span>
        {availableCommands.slice(0, 6).map((cmd) => (
          <button
            key={cmd}
            onClick={(e) => {
              e.stopPropagation();
              if (cmd === "ipconfig") submit("ipconfig /all");
              else if (cmd === "ping") submit("ping 127.0.0.1");
              else if (cmd === "nslookup") submit("nslookup google.com");
              else if (cmd === "sc") submit("sc query spooler");
              else submit(cmd);
            }}
            className="rounded bg-white/10 px-2 py-0.5 font-mono text-[11px] text-white/80 hover:bg-[var(--color-primary)] hover:text-white transition-colors"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Terminal Output Log Area */}
      <div
        ref={scrollRef}
        className="thin-scroll flex-1 overflow-y-auto px-4 py-3 font-mono text-[12px] leading-relaxed text-white/80"
      >
        <div className="text-white/40 mb-3 space-y-0.5">
          <p>Microsoft Windows [Version 10.0.22631.3296]</p>
          <p>(c) Microsoft Corporation. All rights reserved.</p>
          <p className="mt-1 text-white/60">
            Interactive Diagnostic Shell. Type <span className="text-amber-300">help</span> for commands, or use standard syntax like <span className="text-amber-300">ipconfig /all</span>, <span className="text-amber-300">ping</span>, <span className="text-amber-300">nslookup</span>.
          </p>
        </div>

        {history.map((entry) => (
          <div key={entry.id} className="mb-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="text-white/40">C:\Users\svc-tech&gt;</span>
              <span className="font-semibold text-white">{entry.input}</span>
            </div>
            <div className="mt-1 whitespace-pre-wrap text-white/80 font-mono text-[11.5px] pl-2 border-l border-white/10">
              {entry.output.join("\n")}
            </div>
          </div>
        ))}
      </div>

      {/* Terminal Prompt Input Bar */}
      <div className="flex items-center gap-2 border-t border-white/10 bg-[#0B1626] px-4 py-2.5">
        <span className="font-mono text-xs font-semibold text-emerald-400">C:\Users\svc-tech&gt;</span>
        <input
          ref={inputRef}
          value={input}
          disabled={disabled}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Terminal locked — ticket completed" : "Type command here (e.g. ipconfig /all, ping, nslookup)..."}
          spellCheck={false}
          autoComplete="off"
          className="flex-1 bg-transparent font-mono text-xs text-white placeholder:text-white/30 focus:outline-none disabled:cursor-not-allowed"
          aria-label="Simulated command prompt input"
        />
      </div>
    </div>
  );
}
