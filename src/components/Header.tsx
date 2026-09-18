import { NavLink } from "react-router-dom";
import { TerminalSquare, CalendarCheck, BadgeCheck, Sun, Moon, GraduationCap, ShieldAlert } from "lucide-react";
import { useGame } from "../game/store";
import { levelFromXp } from "../types/game";
import { cn } from "../utils/cn";

export function Header() {
  const { progress, theme, toggleTheme, gameMode, setGameMode } = useGame();
  const rank = levelFromXp(progress.xp);
  const pct = Math.round((rank.xpIntoLevel / rank.xpForNext) * 100);

  return (
    <header className="sticky top-0 z-40 glass border-b border-[var(--color-border)] shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2.5 sm:px-6">
        {/* Logo and Creator Attribution */}
        <div className="flex items-center gap-3">
          <NavLink to="/" className="flex items-center gap-2 shrink-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white shadow-xs">
              <TerminalSquare size={18} strokeWidth={2.25} />
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[17px] font-black tracking-tight text-[var(--color-text)]">GeeDesk</span>
                <span className="hidden sm:inline-block rounded-full bg-[var(--color-primary-soft)] px-2 py-0.2 text-[9.5px] font-bold text-[var(--color-primary)]">
                  v2.0 Pro
                </span>
              </div>
              <span className="hidden sm:block text-[9.5px] font-semibold text-[var(--color-text-muted)] -mt-1">
                by George Mwanga
              </span>
            </div>
          </NavLink>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 ml-2 sm:ml-4">
            {[
              { to: "/", label: "Overview", end: true },
              { to: "/dashboard", label: "Dashboard", end: true },
              { to: "/tickets", label: "Queue", end: false },
              { to: "/kb", label: "Knowledge Base", end: false },
              { to: "/progression", label: "Career & Skills", end: false },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors sm:text-[13px]",
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
        </div>

        {/* Right Toolbar: Mode Toggle, Theme Toggle, Rank & XP */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mode Switcher */}
          <div className="hidden lg:flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5 text-xs font-semibold">
            <button
              onClick={() => setGameMode("learning")}
              className={cn(
                "flex items-center gap-1 rounded-lg px-2.5 py-1 transition-colors",
                gameMode === "learning"
                  ? "bg-[var(--color-primary)] text-white shadow-xs"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              )}
            >
              <GraduationCap size={13} />
              <span>Learning</span>
            </button>
            <button
              onClick={() => setGameMode("challenge")}
              className={cn(
                "flex items-center gap-1 rounded-lg px-2.5 py-1 transition-colors",
                gameMode === "challenge"
                  ? "bg-[var(--color-warning)] text-white shadow-xs"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              )}
            >
              <ShieldAlert size={13} />
              <span>Challenge</span>
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
          >
            {theme === "dark" ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
          </button>

          {/* Daily Streak */}
          {progress.streak > 0 && (
            <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
              <CalendarCheck size={13} className="text-[var(--color-primary)]" />
              <span>{progress.streak}d active</span>
            </div>
          )}

          {/* Technician Rank & XP Pill */}
          <NavLink
            to="/progression"
            className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-1 pl-2 pr-3 hover:border-[var(--color-primary)] transition-colors"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
              <BadgeCheck size={13} strokeWidth={2.25} />
            </span>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[var(--color-text)]">Lvl {rank.level}</span>
                <span className="hidden sm:inline-block text-[11px] text-[var(--color-text-muted)] truncate max-w-[110px]">
                  · {rank.title}
                </span>
              </div>
              <div className="hidden sm:block h-1 w-20 overflow-hidden rounded-full bg-[var(--color-surface-muted)] mt-0.5">
                <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </NavLink>
        </div>
      </div>
    </header>
  );
}
