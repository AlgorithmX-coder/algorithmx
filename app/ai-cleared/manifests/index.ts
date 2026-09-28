import type { ModuleManifest } from "../engine/types";
import { MODULE_2 } from "./module2";

/* The course map the rail shows. Modules without a manifest yet are listed
 * so the learner sees the whole journey; they open when their phase ships. */
export interface ModuleSummary {
  n: 1 | 2 | 3 | 4 | 5;
  title: string;
  minutes: number;
  available: boolean;
}

export const MODULE_LIST: ModuleSummary[] = [
  { n: 1, title: "What happens to what you type", minutes: 18, available: false },
  { n: 2, title: "The paste test", minutes: 22, available: true },
  { n: 3, title: "Your firm's approved tools", minutes: 16, available: false },
  { n: 4, title: "Trust but verify", minutes: 20, available: false },
  { n: 5, title: "Shadow AI and when to ask", minutes: 16, available: false },
];

const MANIFESTS: Partial<Record<number, ModuleManifest>> = {
  2: MODULE_2,
};

export function getModule(n: number): ModuleManifest | null {
  return MANIFESTS[n] ?? null;
}
