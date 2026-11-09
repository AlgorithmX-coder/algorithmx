"use client";

import ModulePlayer from "../learn/ModulePlayer";
import m5 from "../lessons/m5";

/* The manifest holds functions (Try components and their checks), so it
 * is imported here on the client rather than passed from the server page. */
export default function ModuleFive() {
  return <ModulePlayer module={m5} />;
}
