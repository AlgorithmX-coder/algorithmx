"use client";

import ModulePlayer from "../learn/ModulePlayer";
import m1 from "../lessons/m1";

/* The manifest holds functions (Try components and their checks), so it
 * is imported here on the client rather than passed from the server page. */
export default function ModuleOne() {
  return <ModulePlayer module={m1} />;
}
