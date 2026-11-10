"use client";

import ModulePlayer from "../learn/ModulePlayer";
import m6 from "../lessons/m6";

/* The manifest holds functions (Try components and their checks), so it
 * is imported here on the client rather than passed from the server page. */
export default function ModuleSix() {
  return <ModulePlayer module={m6} />;
}
