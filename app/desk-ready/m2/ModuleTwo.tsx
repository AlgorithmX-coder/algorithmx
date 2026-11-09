"use client";

import ModulePlayer from "../learn/ModulePlayer";
import m2 from "../lessons/m2";

/* The manifest holds functions (Try components and their checks), so it
 * is imported here on the client rather than passed from the server page. */
export default function ModuleTwo() {
  return <ModulePlayer module={m2} />;
}
