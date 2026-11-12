"use client";

import ModulePlayer from "../learn/ModulePlayer";
import m12 from "../lessons/m12";

/* The manifest holds functions (Try components and their checks), so it
 * is imported here on the client rather than passed from the server page. */
export default function ModuleTwelve() {
  return <ModulePlayer module={m12} />;
}
