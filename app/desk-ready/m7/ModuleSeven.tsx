"use client";

import ModulePlayer from "../learn/ModulePlayer";
import m7 from "../lessons/m7";

/* The manifest holds functions (Try components and their checks), so it
 * is imported here on the client rather than passed from the server page. */
export default function ModuleSeven() {
  return <ModulePlayer module={m7} />;
}
