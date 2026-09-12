import type { Scenario } from "../../types/scenario";
import { net1042 } from "./net-1042";

export const scenarios: Scenario[] = [net1042];

export function getScenario(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}
