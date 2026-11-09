"use client";

import ModulePlayer from "../learn/ModulePlayer";
import m0 from "../lessons/m0";

/* The manifest holds functions (Try components), so it is imported here
 * on the client rather than passed from the server page. */
export default function ModuleZero() {
  return <ModulePlayer module={m0} />;
}
