import {
  TerminalSquare,
  MessageCircle,
  Lightbulb,
  Stethoscope,
  Wrench,
  ShieldCheck,
  Cog,
  HardDrive,
  Share2,
  FileText,
  Zap,
  GitBranch,
} from "lucide-react";
import type { ActionLogEntry, ActionType } from "../types/game";

const ICON: Record<ActionType, typeof TerminalSquare> = {
  command: TerminalSquare,
  question: MessageCircle,
  hint: Lightbulb,
  diagnosis: Stethoscope,
  resolution: Wrench,
  verification: ShieldCheck,
  service_toggle: Cog,
  device_update: HardDrive,
  escalation: Share2,
  documentation: FileText,
  interactive_action: Zap,
  hypothesis_test: GitBranch,
};

export function ActionHistory({ actions }: { actions: ActionLogEntry[] }) {
  if (actions.length === 0) {
    return <p className="text-[12px] text-[var(--color-text-muted)]">No actions taken yet.</p>;
  }
  return (
    <ol className="thin-scroll max-h-40 space-y-1.5 overflow-y-auto pr-1">
      {[...actions].reverse().map((a) => {
        const Icon = ICON[a.type] ?? TerminalSquare;
        return (
          <li key={a.id} className="flex items-center gap-2 text-[12px] text-[var(--color-text-secondary)]">
            <Icon size={12} className="shrink-0 text-[var(--color-text-muted)]" />
            <span className="truncate">{a.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
