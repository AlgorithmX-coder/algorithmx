"use client";

import ModulePlayer from "../learn/ModulePlayer";
import m3 from "../lessons/m3";

/* The manifest holds functions (Try components and their checks), so it
 * is imported here on the client rather than passed from the server page. */
export default function ModuleThree() {
  return <ModulePlayer module={m3} />;
}
