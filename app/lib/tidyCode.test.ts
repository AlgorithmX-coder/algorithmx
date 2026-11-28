import { describe, expect, it, vi } from "vitest";

/* tidyCode alone. The module also talks to Prisma, bcrypt and the limiter,
 * so those are stubbed the way pupilAuth.lockout.test.ts does; nothing here
 * calls them. */
vi.mock("@/app/lib/prisma", () => ({ prisma: {} }));
vi.mock("bcryptjs", () => ({ default: { compare: vi.fn(), hash: vi.fn() } }));
vi.mock("@/app/lib/rateLimit", () => ({
  RULES: {}, PUPIL_LOCK_SEC: 900, rateKey: vi.fn(), hit: vi.fn(), peek: vi.fn(), lock: vi.fn(), lockedFor: vi.fn(), clear: vi.fn(),
}));

import { tidyCode } from "./pupilAuth";

describe("tidyCode", () => {
  it("keeps a code typed exactly as printed", () => {
    expect(tidyCode("WQMD-MYB")).toBe("WQMD-MYB");
  });
  it("uppercases and adds the dash to a seven-character code", () => {
    expect(tidyCode("wqmdmyb")).toBe("WQMD-MYB");
  });
  it("strips the spaces a child types between the halves", () => {
    /* The regex was /[s_]+/, which after uppercasing removed nothing but
       underscores: "WQMD MYB" came back with its space and was refused. */
    expect(tidyCode("WQMD MYB")).toBe("WQMD-MYB");
    expect(tidyCode("  wqmd  myb ")).toBe("WQMD-MYB");
    expect(tidyCode("W Q M D M Y B")).toBe("WQMD-MYB");
  });
  it("strips underscores typed for the dash", () => {
    expect(tidyCode("WQMD_MYB")).toBe("WQMD-MYB");
  });
  it("leaves a code with its dash and spaces around it clean", () => {
    expect(tidyCode("WQMD - MYB")).toBe("WQMD-MYB");
  });
});
