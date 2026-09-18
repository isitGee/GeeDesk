import { useState } from "react";
import { UserCheck, Lock, Unlock, ShieldAlert, Users, CheckCircle2 } from "lucide-react";
import type { SimulatedADAccount } from "../../types/scenario";
import { cn } from "../../utils/cn";

interface ActiveDirectoryToolProps {
  account: SimulatedADAccount;
}

export function ActiveDirectoryTool({ account }: ActiveDirectoryToolProps) {
  const [isLocked, setIsLocked] = useState(account.status === "Locked Out");
  const [unlockedNotice, setUnlockedNotice] = useState(false);

  function handleUnlock() {
    setIsLocked(false);
    setUnlockedNotice(true);
    setTimeout(() => setUnlockedNotice(false), 5000);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      {/* MMC Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-xs">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-[var(--color-primary)]" />
          <span className="font-semibold text-[var(--color-text)]">Active Directory Users and Computers — geedesk.local</span>
          <span className="rounded bg-[var(--color-border)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-secondary)]">
            dsa.msc
          </span>
        </div>
        <span className="text-[11px] text-[var(--color-text-muted)]">Domain Controller: \\DC-CORP-01</span>
      </div>

      <div className="thin-scroll flex-1 overflow-y-auto p-4 space-y-4">
        {/* User Card */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-sm font-bold text-[var(--color-primary)]">
                {account.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </span>
              <div>
                <h3 className="font-bold text-sm text-[var(--color-text)]">{account.displayName}</h3>
                <p className="font-mono text-xs text-[var(--color-text-muted)]">
                  sAMAccountName: {account.username} · {account.department}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
                  isLocked
                    ? "bg-[var(--color-critical-soft)] text-[var(--color-critical)]"
                    : "bg-[var(--color-success-soft)] text-[var(--color-success)]"
                )}
              >
                {isLocked ? <Lock size={12} /> : <UserCheck size={12} />}
                {isLocked ? "Account Locked Out" : "Account Active"}
              </span>

              {isLocked && (
                <button
                  onClick={handleUnlock}
                  className="flex items-center gap-1 rounded-lg bg-[var(--color-primary)] px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
                >
                  <Unlock size={12} /> Unlock Account
                </button>
              )}
            </div>
          </div>

          {unlockedNotice && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--color-success-soft)] p-2.5 text-xs font-semibold text-[var(--color-success)]">
              <CheckCircle2 size={14} />
              <span>Account '{account.username}' has been successfully unlocked on DC-CORP-01.</span>
            </div>
          )}

          {/* Account Attributes */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 space-y-1.5">
              <span className="font-bold text-[var(--color-text)] block mb-1">Logon Security Attributes</span>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Bad Password Count:</span>
                <span className={cn("font-bold font-mono", isLocked ? "text-[var(--color-critical)]" : "text-[var(--color-text)]")}>
                  {isLocked ? account.badPasswordAttempts : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Password Last Set:</span>
                <span className="text-[var(--color-text)]">{account.passwordLastChanged}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Last Logon Timestamp:</span>
                <span className="text-[var(--color-text)]">{account.lastLogon}</span>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 space-y-1.5">
              <span className="font-bold text-[var(--color-text)] block mb-1">Group Membership</span>
              <ul className="space-y-1">
                {account.groups.map((grp) => (
                  <li key={grp} className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                    <span>{grp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 text-xs text-[var(--color-text-secondary)]">
          <ShieldAlert size={16} className="text-[var(--color-warning)] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>AD Security Note:</strong> If an account repeatedly locks out after being unlocked, verify background devices (mobile phones, tablets, or cached VPN credentials) that may be retrying an expired password.
          </p>
        </div>
      </div>
    </div>
  );
}
