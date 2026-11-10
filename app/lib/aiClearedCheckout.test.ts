import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";
import { createCorporateCheckout, fulfilCheckoutSession } from "./aiClearedCheckout";

/* The firm checkout and its fulfilment, with Stripe, the database and the
 * mail mocked out: what Stripe is asked to charge, and what a paid session
 * does to a firm's seats, for a new firm, a top-up and a session opened
 * under the old per-course checkout. The arithmetic itself is pinned in
 * cyberSecuredPricing.test.ts. */

const h = vi.hoisted(() => ({
  sessionsCreate: vi.fn(),
  seatPurchaseFind: vi.fn(),
  seatPurchaseCreate: vi.fn(),
  orgFind: vi.fn(),
  orgUpdate: vi.fn(),
  seatFindFirst: vi.fn(),
  transaction: vi.fn(),
  createFirm: vi.fn(),
  sendSeatsAdded: vi.fn(),
  opsAlert: vi.fn(),
}));

vi.mock("@/app/lib/prisma", () => ({
  prisma: {
    seatPurchase: { findUnique: h.seatPurchaseFind, create: h.seatPurchaseCreate },
    organisation: { findUnique: h.orgFind, update: h.orgUpdate },
    seat: { findFirst: h.seatFindFirst },
    $transaction: h.transaction,
  },
}));
vi.mock("@/app/lib/aiClearedOps", () => ({ createFirm: h.createFirm }));
vi.mock("@/app/lib/aiClearedAdmin", () => ({ sendSeatsAdded: h.sendSeatsAdded }));
vi.mock("@/app/lib/opsAlert", () => ({ opsAlert: h.opsAlert }));
vi.mock("@/app/lib/stripe", async (orig) => ({
  ...(await orig<typeof import("@/app/lib/stripe")>()),
  stripe: () => ({ checkout: { sessions: { create: h.sessionsCreate } } }),
  vatTaxRateId: async () => "txr_vat",
}));


const BUYER = { firmName: "Kestrel Mutual", sector: "Insurance", contactName: "Amara Osei", contactRole: "Head of Compliance", tool: "copilot", adminEmail: "Amara@Kestrel.example", origin: "https://algorithmx.io" };

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_SECRET_KEY = "sk_test_x";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_x";
  h.sessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.test/s" });
  h.seatPurchaseFind.mockResolvedValue(null);
  h.orgFind.mockResolvedValue(null);
  h.seatFindFirst.mockResolvedValue(null);
  h.transaction.mockResolvedValue([]);
  h.orgUpdate.mockImplementation((a) => ({ op: "org.update", ...a }));
  h.seatPurchaseCreate.mockImplementation((a) => ({ op: "seatPurchase.create", ...a }));
  h.createFirm.mockResolvedValue({ org: { id: "org_new", slug: "kestrel-mutual", name: "Kestrel Mutual" }, emailed: true, link: "https://algorithmx.io/ai-cleared/join/x" });
  h.sendSeatsAdded.mockResolvedValue({ id: null });
});

afterEach(() => {
  for (const k of ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "VAT_MODE"]) delete process.env[k];
});

type CreateParams = Stripe.Checkout.SessionCreateParams;
const lastCreate = () => h.sessionsCreate.mock.calls[0][0] as CreateParams;

describe("createCorporateCheckout", () => {
  it("49 seats: one inline line at £99, VAT at the fixed rate, Cyber Secured metadata", async () => {
    expect(await createCorporateCheckout({ ...BUYER, seats: 49 })).toEqual({ url: "https://checkout.stripe.test/s" });
    const p = lastCreate();
    expect(p.line_items).toHaveLength(1);
    const line = p.line_items![0];
    expect(line.price).toBeUndefined();
    expect(line.quantity).toBe(49);
    expect(line.tax_rates).toEqual(["txr_vat"]);
    expect(line.price_data).toMatchObject({ currency: "gbp", unit_amount: 9900 });
    expect(line.price_data!.product_data!.name).toMatch(/^Cyber Secured/);
    expect(p.automatic_tax).toEqual({ enabled: false });
    expect(p.metadata).toMatchObject({ product: "corporate-seats", course: "cyber-secured", seats: "49", plan: "TEAM", ratePence: "9900", firmName: "Kestrel Mutual", tool: "copilot", adminEmail: "amara@kestrel.example" });
    expect(p.cancel_url).toBe("https://algorithmx.io/corporate/buy?seats=49");
    expect(p.success_url).toContain("/corporate/buy/thanks?session_id={CHECKOUT_SESSION_ID}");
  });

  it("50 seats: the Firm rate, £85", async () => {
    await createCorporateCheckout({ ...BUYER, seats: 50 });
    const p = lastCreate();
    expect(p.line_items![0]).toMatchObject({ quantity: 50, price_data: { unit_amount: 8500 } });
    expect(p.metadata).toMatchObject({ seats: "50", plan: "FIRM", ratePence: "8500" });
  });

  it("automatic VAT: Stripe Tax, prices exclusive, no fixed rate", async () => {
    process.env.VAT_MODE = "automatic";
    await createCorporateCheckout({ ...BUYER, seats: 10 });
    const p = lastCreate();
    expect(p.automatic_tax).toEqual({ enabled: true });
    expect(p.line_items![0].tax_rates).toBeUndefined();
    expect(p.line_items![0].price_data!.tax_behavior).toBe("exclusive");
  });

  it("no VAT: neither mechanism", async () => {
    process.env.VAT_MODE = "none";
    await createCorporateCheckout({ ...BUYER, seats: 10 });
    const p = lastCreate();
    expect(p.automatic_tax).toEqual({ enabled: false });
    expect(p.line_items![0].tax_rates).toBeUndefined();
  });

  it("refuses a count outside 10 to 249, and stays off without Stripe", async () => {
    expect(await createCorporateCheckout({ ...BUYER, seats: 9 })).toMatchObject({ status: 400 });
    expect(await createCorporateCheckout({ ...BUYER, seats: 250 })).toMatchObject({ status: 400 });
    delete process.env.STRIPE_WEBHOOK_SECRET;
    expect(await createCorporateCheckout({ ...BUYER, seats: 10 })).toMatchObject({ status: 503 });
    expect(h.sessionsCreate).not.toHaveBeenCalled();
  });
});

function paid(metadata: Record<string, string>, id = "cs_test_1"): Stripe.Checkout.Session {
  return { id, payment_status: "paid", metadata, customer: "cus_1", customer_details: { email: "amara@kestrel.example" } } as unknown as Stripe.Checkout.Session;
}
const SECURED = { product: "corporate-seats", course: "cyber-secured", seats: "49", plan: "TEAM", firmName: "Kestrel Mutual", sector: "Insurance", contactName: "Amara Osei", contactRole: "", tool: "copilot", adminEmail: "amara@kestrel.example" };
const ops = () => h.transaction.mock.calls[0][0] as { op: string; where?: unknown; data: Record<string, unknown> }[];

describe("fulfilCheckoutSession", () => {
  it("a new firm gets seatsPurchased = the seat count and one CYBER_SECURED purchase", async () => {
    const r = await fulfilCheckoutSession(paid(SECURED), "https://algorithmx.io");
    expect(r).toMatchObject({ created: true, seats: 49 });
    expect(h.createFirm).toHaveBeenCalledWith(expect.objectContaining({ name: "Kestrel Mutual", seatsPurchased: 49, plan: "TEAM", adminEmail: "amara@kestrel.example", approvedTool: "Microsoft 365 Copilot on your work account" }));
    const rows = ops().filter((o) => o.op === "seatPurchase.create");
    expect(rows).toEqual([expect.objectContaining({ data: { orgId: "org_new", course: "CYBER_SECURED", seats: 49, stripeCheckoutSessionId: "cs_test_1" } })]);
    expect(h.sendSeatsAdded).not.toHaveBeenCalled();
  });

  it("a repeat buyer tops up: the count goes up, the email names both figures", async () => {
    h.seatFindFirst.mockResolvedValue({ org: { id: "org_1", name: "Kestrel Mutual", slug: "kestrel-mutual", seatsPurchased: 60 } });
    const r = await fulfilCheckoutSession(paid({ ...SECURED, seats: "10" }), "https://algorithmx.io");
    expect(r).toMatchObject({ added: true, seats: 10, total: 70, emailed: true });
    expect(h.createFirm).not.toHaveBeenCalled();
    expect(ops()[0]).toMatchObject({ op: "org.update", where: { id: "org_1" }, data: { seatsPurchased: { increment: 10 } } });
    expect(ops()[1]).toMatchObject({ data: { orgId: "org_1", course: "CYBER_SECURED", seats: 10 } });
    expect(h.sendSeatsAdded).toHaveBeenCalledWith(expect.objectContaining({ to: "amara@kestrel.example", seats: 10, total: 70 }));
  });

  it("an old Cleared + Fluent session paid after the deploy still fulfils, people counted once", async () => {
    h.seatFindFirst.mockResolvedValue({ org: { id: "org_1", name: "Kestrel Mutual", slug: "kestrel-mutual", seatsPurchased: 20 } });
    const old = { product: "corporate-seats", course: "ai-cleared", seats: "40", fluentSeats: "20", plan: "TEAM", firmName: "Kestrel Mutual", adminEmail: "amara@kestrel.example" };
    const r = await fulfilCheckoutSession(paid(old, "cs_old"), "https://algorithmx.io");
    expect(r).toMatchObject({ added: true, seats: 40, total: 60 });
    expect(ops()[0]).toMatchObject({ data: { seatsPurchased: { increment: 40 } } });
    expect(ops().slice(1).map((o) => o.data)).toEqual([
      { orgId: "org_1", course: "AI_CLEARED", seats: 40, stripeCheckoutSessionId: "cs_old" },
      { orgId: "org_1", course: "AI_FLUENT", seats: 20, stripeCheckoutSessionId: "cs_old:fluent" },
    ]);
  });

  it("an old session from a new buyer creates the firm on the larger line", async () => {
    const old = { product: "corporate-seats", course: "ai-cleared", seats: "10", fluentSeats: "30", plan: "TEAM", firmName: "Kestrel Mutual", adminEmail: "amara@kestrel.example" };
    await fulfilCheckoutSession(paid(old, "cs_old2"), "https://algorithmx.io");
    expect(h.createFirm).toHaveBeenCalledWith(expect.objectContaining({ seatsPurchased: 30 }));
  });

  it("is idempotent on the session", async () => {
    h.seatPurchaseFind.mockResolvedValue({ orgId: "org_1" });
    expect(await fulfilCheckoutSession(paid(SECURED), "https://algorithmx.io")).toEqual({ already: true, orgId: "org_1" });
    expect(h.transaction).not.toHaveBeenCalled();
    expect(h.createFirm).not.toHaveBeenCalled();
  });

  it("skips what it should not touch", async () => {
    expect(await fulfilCheckoutSession(paid({ product: "learner-places" }), "x")).toHaveProperty("skipped");
    expect(await fulfilCheckoutSession({ ...paid(SECURED), payment_status: "unpaid" } as Stripe.Checkout.Session, "x")).toHaveProperty("skipped");
    expect(await fulfilCheckoutSession(paid({ ...SECURED, seats: "0" }), "x")).toEqual({ skipped: "session carries no seats" });
    expect(h.transaction).not.toHaveBeenCalled();
  });
});
