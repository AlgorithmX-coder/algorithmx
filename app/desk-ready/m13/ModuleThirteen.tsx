"use client";

import ModulePlayer from "../learn/ModulePlayer";
import m13 from "../lessons/m13";

/* The manifest holds functions (Try components and their checks), so it
 * is imported here on the client rather than passed from the server page. */
export default function ModuleThirteen() {
  return <ModulePlayer module={m13} />;
}
