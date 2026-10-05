/* Registry of BUILT modules, keyed by module number.
 *
 * A module appears here once its ModuleDef + Act surface exist. The play route
 * and the course map read this to tell built modules from the still-to-come
 * ones in the locked 16-module curriculum, so there is a single source of
 * "what's actually playable" as content is authored module by module. */

import type { ModuleDef } from "./Engagement";
import { MODULE1 } from "./module01";
import { MODULE2 } from "./module02";
import { MODULE3 } from "./module03";
import { MODULE4 } from "./module04";
import { MODULE5 } from "./module05";
import { MODULE6 } from "./module06";
import { MODULE7 } from "./module07";
import { MODULE8 } from "./module08";
import { MODULE9 } from "./module09";
import { MODULE10 } from "./module10";
import { MODULE11 } from "./module11";
import { MODULE12 } from "./module12";
import { MODULE13 } from "./module13";
import { MODULE14 } from "./module14";
import { MODULE15 } from "./module15";
import { MODULE16 } from "./module16";

export const BUILT_MODULES: Record<number, ModuleDef> = {
  1: MODULE1,
  2: MODULE2,
  3: MODULE3,
  4: MODULE4,
  5: MODULE5,
  6: MODULE6,
  7: MODULE7,
  8: MODULE8,
  9: MODULE9,
  10: MODULE10,
  11: MODULE11,
  12: MODULE12,
  13: MODULE13,
  14: MODULE14,
  15: MODULE15,
  16: MODULE16,
};

export function builtModule(n: number): ModuleDef | null {
  return BUILT_MODULES[n] ?? null;
}

export const BUILT_MODULE_NUMBERS = Object.keys(BUILT_MODULES)
  .map(Number)
  .sort((a, b) => a - b);

export const HIGHEST_BUILT_MODULE = Math.max(...BUILT_MODULE_NUMBERS);
