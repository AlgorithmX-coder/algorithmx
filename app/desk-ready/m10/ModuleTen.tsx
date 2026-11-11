"use client";

import ModulePlayer from "../learn/ModulePlayer";
import m10 from "../lessons/m10";

/* The manifest holds functions (Try components and their checks), so it
 * is imported here on the client rather than passed from the server page. */
export default function ModuleTen() {
  return <ModulePlayer module={m10} />;
}
