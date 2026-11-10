"use client";

import ModulePlayer from "../learn/ModulePlayer";
import m4 from "../lessons/m4";

/* The manifest holds functions (Try components and their checks), so it
 * is imported here on the client rather than passed from the server page. */
export default function ModuleFour() {
  return <ModulePlayer module={m4} />;
}
