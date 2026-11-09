import type { ModuleManifest } from "@/app/ai-cleared/engine/types";
import type { ModuleSummary } from "@/app/ai-cleared/manifests";
import { AWARENESS_MODULE_1 } from "./module1";
import { AWARENESS_MODULE_2 } from "./module2";
import { AWARENESS_MODULE_3 } from "./module3";
import { AWARENESS_MODULE_4 } from "./module4";
import { AWARENESS_MODULE_5 } from "./module5";

/* The Cyber Awareness course map: eight modules on everyday cyber hygiene
 * for every member of staff, the same for every desk. Modules ship one
 * at a time; one marked unavailable shows on the course home as coming,
 * and its page 404s until its manifest is added below. */

export const AWARENESS_MODULE_LIST: ModuleSummary[] = [
  { n: 1, title: "The Human Firewall", minutes: 15, available: true },
  { n: 2, title: "Phishing & Social Engineering", minutes: 15, available: true },
  { n: 3, title: "Passwords, MFA & Access", minutes: 15, available: true },
  { n: 4, title: "Malware, Devices & Working Remotely", minutes: 15, available: true },
  { n: 5, title: "Data Handling", minutes: 15, available: true },
  { n: 6, title: "Invoice Fraud & BEC", minutes: 15, available: false },
  { n: 7, title: "AI-Powered Scams & Deepfakes", minutes: 15, available: false },
  { n: 8, title: "Report It", minutes: 15, available: false },
];

const MANIFESTS: Partial<Record<number, ModuleManifest>> = {
  1: AWARENESS_MODULE_1,
  2: AWARENESS_MODULE_2,
  3: AWARENESS_MODULE_3,
  4: AWARENESS_MODULE_4,
  5: AWARENESS_MODULE_5,
};

export function getAwarenessModule(n: number): ModuleManifest | null {
  return MANIFESTS[n] ?? null;
}
