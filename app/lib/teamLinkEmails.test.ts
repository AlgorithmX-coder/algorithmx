import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendAdminWelcome, sendSeatsAdded } from "./aiClearedAdmin";

/* The lead's emails carry the firm's team link: the welcome after a
 * purchase or a hand set-up, and the note when seats are added. Mail and
 * database mocked out. */

const h = vi.hoisted(() => ({ sendEmail: vi.fn() }));
vi.mock("@/app/lib/resend", () => ({ sendEmail: h.sendEmail }));
vi.mock("@/app/lib/prisma", () => ({ prisma: {} }));
vi.mock("@/app/lib/opsAlert", () => ({ opsAlert: vi.fn() }));

const TEAM = "https://algorithmx.io/ai-cleared/join/team-abcdefghjkmnpqrstuvwxyz2";

beforeEach(() => {
  vi.clearAllMocks();
  h.sendEmail.mockResolvedValue({ id: "e1" });
});

describe("sendAdminWelcome", () => {
  it("gives the lead their own account link and the team link to forward", async () => {
    await sendAdminWelcome({ to: "amara@kestrel.example", token: "kestre-abc", firmName: "Kestrel Mutual", seats: 50, origin: "https://algorithmx.io", staffName: "AlgorithmX", staffEmail: "admissions@algorithmx.co.uk", teamLink: TEAM });
    const mail = h.sendEmail.mock.calls[0][0];
    expect(mail.text).toContain("https://algorithmx.io/ai-cleared/join/kestre-abc");
    expect(mail.text).toContain(TEAM);
    expect(mail.text).toContain("Your team link");
    expect(mail.html).toContain(TEAM);
    expect(mail.html + mail.text).not.toContain("—");
  });

  it("still works without a team link", async () => {
    await sendAdminWelcome({ to: "amara@kestrel.example", token: "kestre-abc", firmName: "Kestrel Mutual", seats: 50, origin: "https://algorithmx.io", staffName: "AlgorithmX", staffEmail: null });
    const mail = h.sendEmail.mock.calls[0][0];
    expect(mail.text).toContain("https://algorithmx.io/ai-cleared/join/kestre-abc");
    expect(mail.text).not.toContain("team link");
  });
});

describe("sendSeatsAdded", () => {
  it("reminds the lead of the team link for the people the new seats are for", async () => {
    await sendSeatsAdded({ to: "amara@kestrel.example", firmName: "Kestrel Mutual", seats: 10, total: 60, origin: "https://algorithmx.io", staffName: "AlgorithmX", staffEmail: null, teamLink: TEAM });
    const mail = h.sendEmail.mock.calls[0][0];
    expect(mail.text).toContain(TEAM);
    expect(mail.html).toContain(TEAM);
  });
});
