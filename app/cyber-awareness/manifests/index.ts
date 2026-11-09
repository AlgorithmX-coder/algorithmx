import type { ModuleManifest } from "@/app/ai-cleared/engine/types";
import type { ModuleSummary } from "@/app/ai-cleared/manifests";

/* The Cyber Awareness course map: eight modules on everyday cyber hygiene
 * for every member of staff. Phase 1 plumbing only (Cyber Secured build):
 * every module is listed as coming, same shape as AI Fluent's own phase
 * 1 manifest list, so a reader (including the Corporate Portal) sees the
 * whole journey while the content is written in a later, separate pass.
 * No manifest exists yet, so every module page 404s until one ships. */

export const AWARENESS_MODULE_LIST: ModuleSummary[] = [
  { n: 1, title: "The Human Firewall", minutes: 15, available: false },
  { n: 2, title: "Phishing & Social Engineering", minutes: 15, available: false },
  { n: 3, title: "Passwords, MFA & Access", minutes: 15, available: false },
  { n: 4, title: "Malware & Safe Browsing", minutes: 15, available: false },
  { n: 5, title: "Data Handling", minutes: 15, available: false },
  { n: 6, title: "Invoice Fraud & BEC", minutes: 15, available: false },
  { n: 7, title: "Shadow AI", minutes: 15, available: false },
  { n: 8, title: "Report It", minutes: 15, available: false },
];

const MANIFESTS: Partial<Record<number, ModuleManifest>> = {};

export function getAwarenessModule(n: number): ModuleManifest | null {
  return MANIFESTS[n] ?? null;
}
