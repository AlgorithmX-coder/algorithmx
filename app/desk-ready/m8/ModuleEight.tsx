"use client";

import ModulePlayer from "../learn/ModulePlayer";
import m8 from "../lessons/m8";

/* The manifest holds functions (Try components and their checks), so it
 * is imported here on the client rather than passed from the server page. */
export default function ModuleEight() {
  return <ModulePlayer module={m8} />;
}
