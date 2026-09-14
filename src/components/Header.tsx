import { NavLink } from "react-router-dom";
import { TerminalSquare, Flame, Zap } from "lucide-react";
import { useGame } from "../game/store";
import { levelFromXp } from "../types/game";
import { cn } from "../utils/cn";

export function Header() {
  const { progress } = useGame();
  const { level, xpIntoLevel, xpForNext } = levelFromXp(progress.xp);
  const pct = Math.round((xpIntoLevel / xpForNext) * 100);

  return (
    <header className="sticky top-0 z-40 glass border-b border-[var(--color-border)]">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-3 sm:gap-6 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white">
            <TerminalSquare size={18} strokeWidth={2.25} />
          </span>
          <span className="text-[17px] font-bold tracking-tight text-[var(--color-text)]">GeeDesk</span>
        </NavLink>

        <nav className="flex items-center gap-1">
          {[
            { to: "/", label: "Dashboard", end: true },
            { to: "/tickets", label: "Tickets", end: false },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-2 py-1.5 text-[13px] font-medium transition-colors sm:px-3 sm:text-sm",
                  isActive
                    ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {progress.streak > 0 && (
            <div className="hidden items-center gap-1 text-sm font-semibold text-[var(--color-warning)] sm:flex">
              <Flame size={16} />
              {progress.streak}
            </div>
          )}
          <div className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] py-1 pl-1.5 pr-2 sm:gap-2 sm:pl-2 sm:pr-3">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
              <Zap size={12} strokeWidth={2.5} />
            </span>
            <span className="text-xs font-semibold text-[var(--color-text)]">Lvl {level}</span>
            <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-[var(--color-surface-muted)] sm:block">
              <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
