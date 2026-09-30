import type { CourseSlug } from "@/app/ai-cleared/engine/courses";
import type { ModuleManifest } from "@/app/ai-cleared/engine/types";
import { MODULE_LIST, getModule, type ModuleSummary } from "@/app/ai-cleared/manifests";
import { FLUENT_MODULE_LIST, getFluentModule } from "@/app/ai-fluent/manifests";

/* The module list and manifests of either course, behind one door. Data
 * only, safe on the server and the client. */

export function moduleListFor(course: CourseSlug): ModuleSummary[] {
  return course === "ai-fluent" ? FLUENT_MODULE_LIST : MODULE_LIST;
}

export function manifestFor(course: CourseSlug, n: number): ModuleManifest | null {
  return course === "ai-fluent" ? getFluentModule(n) : getModule(n);
}
