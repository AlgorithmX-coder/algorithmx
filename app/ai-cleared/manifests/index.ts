import type { ModuleManifest } from "../engine/types";
import { MODULE_1 } from "./module1";
import { MODULE_2 } from "./module2";
import { MODULE_3 } from "./module3";
import { MODULE_5 } from "./module5";

/* The course map the rail shows. Modules without a manifest yet are listed
 * so the learner sees the whole journey; they open when their phase ships. */
export interface ModuleSummary {
  n: 1 | 2 | 3 | 4 | 5;
  title: string;
  minutes: number;
  available: boolean;
}

export const MODULE_LIST: ModuleSummary[] = [
  { n: 1, title: "What happens to what you type", minutes: 18, available: true },
  { n: 2, title: "The paste test", minutes: 22, available: true },
  { n: 3, title: "Your firm's approved tools", minutes: 16, available: true },
  { n: 4, title: "Trust but verify", minutes: 20, available: false },
  { n: 5, title: "Shadow AI and when to ask", minutes: 16, available: true },
];

const MANIFESTS: Partial<Record<number, ModuleManifest>> = {
  1: MODULE_1,
  2: MODULE_2,
  3: MODULE_3,
  5: MODULE_5,
};

export function getModule(n: number): ModuleManifest | null {
  return MANIFESTS[n] ?? null;
}
