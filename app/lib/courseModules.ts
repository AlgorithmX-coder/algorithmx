import type { CourseSlug } from "@/app/ai-cleared/engine/courses";
import type { ModuleManifest } from "@/app/ai-cleared/engine/types";
import { MODULE_LIST, getModule, type ModuleSummary } from "@/app/ai-cleared/manifests";
import { FLUENT_MODULE_LIST, getFluentModule } from "@/app/ai-fluent/manifests";
import { AWARENESS_MODULE_LIST, getAwarenessModule } from "@/app/cyber-awareness/manifests";

/* The module list and manifests of any course, behind one door. Data
 * only, safe on the server and the client. */

export function moduleListFor(course: CourseSlug): ModuleSummary[] {
  if (course === "ai-fluent") return FLUENT_MODULE_LIST;
  if (course === "cyber-awareness") return AWARENESS_MODULE_LIST;
  return MODULE_LIST;
}

export function manifestFor(course: CourseSlug, n: number): ModuleManifest | null {
  if (course === "ai-fluent") return getFluentModule(n);
  if (course === "cyber-awareness") return getAwarenessModule(n);
  return getModule(n);
}
