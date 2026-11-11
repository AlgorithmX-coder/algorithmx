"use client";

import ModulePlayer from "../learn/ModulePlayer";
import m11 from "../lessons/m11";

/* The manifest holds functions (Try components and their checks), so it
 * is imported here on the client rather than passed from the server page. */
export default function ModuleEleven() {
  return <ModulePlayer module={m11} />;
}
