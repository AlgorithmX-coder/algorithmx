"use client";

import ModulePlayer from "../learn/ModulePlayer";
import m9 from "../lessons/m9";

/* The manifest holds functions (Try components and their checks), so it
 * is imported here on the client rather than passed from the server page. */
export default function ModuleNine() {
  return <ModulePlayer module={m9} />;
}
