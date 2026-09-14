import type { Scenario, TerminalOutput, TerminalCommandName } from "../types/scenario";

export function normalizeCommand(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

function firstWord(normalized: string): string {
  return normalized.split(" ")[0] ?? "";
}

export interface TerminalRunResult {
  output: string[];
  matched: TerminalOutput | null;
  /** true if the command word exists but this exact usage has no defined output */
  recognizedCommandUnknownUsage: boolean;
}

/**
 * Run one line of simulated terminal input against a scenario.
 * `fixApplied` selects between "pre" and "post" phase outputs where a
 * scenario defines both (see TerminalOutput.phase).
 */
export function runTerminalCommand(
  scenario: Scenario,
  rawInput: string,
  fixApplied: boolean
): TerminalRunResult {
  const normalized = normalizeCommand(rawInput);
  const command = firstWord(normalized) as TerminalCommandName;

  if (!normalized) {
    return { output: [], matched: null, recognizedCommandUnknownUsage: false };
  }

  if (command === "help") {
    return {
      output: [
        "Available commands on this machine:",
        ...scenario.availableCommands.map((c) => `  ${c}`),
      ],
      matched: null,
      recognizedCommandUnknownUsage: false,
    };
  }

  if (!scenario.availableCommands.includes(command)) {
    return {
      output: [
        `'${command}' is not recognized as an internal command, or the command is unavailable on this machine.`,
        "Type 'help' to see available commands.",
      ],
      matched: null,
      recognizedCommandUnknownUsage: false,
    };
  }

  const candidates = scenario.terminalOutputs.filter(
    (t) => t.command === command && t.match.includes(normalized)
  );

  if (candidates.length === 0) {
    return {
      output: [
        `${command}: no defined result for "${normalized}" in this scenario.`,
        "Try a more specific target, e.g. an IP address or hostname mentioned in the ticket.",
      ],
      matched: null,
      recognizedCommandUnknownUsage: true,
    };
  }

  // Prefer an entry matching the current phase; fall back to a phase-less entry.
  const phaseMatch =
    candidates.find((c) => c.phase === (fixApplied ? "post" : "pre")) ??
    candidates.find((c) => !c.phase) ??
    candidates[0];

  return { output: phaseMatch.output, matched: phaseMatch, recognizedCommandUnknownUsage: false };
}
