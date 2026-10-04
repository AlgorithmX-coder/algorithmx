import type { ModuleManifest } from "@/app/ai-cleared/engine/types";
import type { ModuleSummary } from "@/app/ai-cleared/manifests";
import { FLUENT_MODULE_1 } from "./module1";
import { FLUENT_MODULE_2 } from "./module2";
import { FLUENT_MODULE_3 } from "./module3";
import { FLUENT_MODULE_4 } from "./module4";
import { FLUENT_MODULE_5 } from "./module5";
import { FLUENT_MODULE_6 } from "./module6";
import { FLUENT_MODULE_7 } from "./module7";

/* The AI Fluent course map: nine modules in three acts. Modules open as
 * their content lands (phase 4 of the build); until then the home page
 * lists the whole journey with each one marked as coming. */

export const FLUENT_MODULE_LIST: ModuleSummary[] = [
  { n: 1, title: "The loop", minutes: 18, available: true },
  { n: 2, title: "Say what you want", minutes: 22, available: true },
  { n: 3, title: "Fix the prompt, not the output", minutes: 20, available: true },
  { n: 4, title: "Summarise", minutes: 20, available: true },
  { n: 5, title: "Draft", minutes: 20, available: true },
  { n: 6, title: "Analyse", minutes: 22, available: true },
  { n: 7, title: "Research", minutes: 20, available: true },
  { n: 8, title: "Verify and automate", minutes: 20, available: false },
  { n: 9, title: "Your real task", minutes: 22, available: false },
];

const MANIFESTS: Partial<Record<number, ModuleManifest>> = {
  1: FLUENT_MODULE_1,
  2: FLUENT_MODULE_2,
  3: FLUENT_MODULE_3,
  4: FLUENT_MODULE_4,
  5: FLUENT_MODULE_5,
  6: FLUENT_MODULE_6,
  7: FLUENT_MODULE_7,
};

export function getFluentModule(n: number): ModuleManifest | null {
  return MANIFESTS[n] ?? null;
}
