import { fold, sameAddress } from "../admin";
import { inbound, officeFolders, PEOPLE, SIGNATURE } from "../northfield";
import type { Check, CourierBooking, Job, OfficeState } from "../types";

/* E10.4 Book a courier (criterion ADM-5). Sarah asks for a collection of
 * the returned cups: 2 boxes at 12 kg each, from goods-in, on Friday
 * afternoon, to Brightwater Cups in Derby. It is Thursday afternoon, so
 * Friday is 13 November, and the afternoon window is 13:00 to 17:00. The
 * learner books it on the Hopwell Couriers website in Edge (the account's
 * address book has both Northfield's reception and goods-in, and a Bright
 * Cafe as well as Brightwater Cups), then emails Sarah the reference. */

export const COLLECT_DATE = "2026-11-13";
export const COLLECT_WINDOW = "13:00 to 17:00";

function seed(): OfficeState {
  return {
    version: 0,
    files: officeFolders(),
    courier: {
      bookings: [
        {
          ref: "HW-7KQ2MD",
          status: "collected",
          method: "collect",
          from: { name: "Northfield Supplies, Goods in", lines: ["Unit 2, Abbey Trade Park", "Rear yard, gate B", "Leicester"], postcode: "LE4 5AQ", contact: "Sarah Patel", phone: "01632 960 412" },
          to: { name: "Kent Flour Mills", lines: ["Mill Lane, Ashford", "Kent"], postcode: "TN24 8QH", contact: "Orders", phone: "01632 960 870" },
          date: "2026-11-05",
          window: "09:00 to 13:00",
          parcels: [{ kg: 8, cm: "Medium" }],
          service: "Next day",
          price: 9.95,
          booked: "04/11/2026 10:12",
        },
      ],
    },
    emails: [
      inbound({
        id: "m-sarah-courier",
        from: PEOPLE.sarah,
        subject: "Returned cups to Brightwater",
        time: "15:02",
        body: `Hi,\n\nBook a collection for the returned cups: 2 boxes, 12 kg each, from goods-in, Friday afternoon, to Brightwater Cups in Derby.\n\nSend me the booking reference so I can put it on the boxes.\n\nThanks,\nSarah\n\n${SIGNATURE.sarah}`,
      }),
      inbound({
        id: "m-brightwater-rma",
        from: PEOPLE.brightwater,
        subject: "Your return of 8 oz cups",
        time: "Tue 11:40",
        unread: false,
        body: "Hello,\n\nThank you for letting us know the cups from order 3298 were the wrong size. Please send them back to our Derby warehouse at your convenience, and we will credit your account when they arrive.\n\nBrightwater Cups Accounts",
      }),
    ],
  };
}

/* ── marking ─────────────────────────────────────────────────────────── */

function check(s: OfficeState): Check[] {
  const seeded = new Set(seed().courier?.bookings.map((b) => b.ref));
  const mine = (s.courier?.bookings ?? []).filter((b) => !seeded.has(b.ref));
  const live = mine.filter((b) => b.status === "booked");
  const b: CourierBooking | undefined = live[live.length - 1];
  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });
  const first = "Book the collection first, on the Hopwell site in Edge.";

  add(
    { id: "booked", code: "ADM-5", group: "The booking", label: "One collection is booked" },
    live.length === 1,
    live.length === 0
      ? mine.length
        ? "Your booking was cancelled, so nothing is booked now. Book it again."
        : "Nothing is booked yet. Open Microsoft Edge, go to Hopwell Couriers on the Favourites bar, and press Book a collection."
      : `You have ${live.length} collections booked, so the courier would come ${live.length} times and Northfield would pay for each. On the Hopwell site, open My bookings and cancel the extra ones.`,
  );
  add(
    { id: "method", code: "ADM-5", group: "The booking", label: "The courier collects from us" },
    !!b && b.method === "collect",
    b ? 'It is booked as a drop-off, so nobody will come for the boxes. Cancel it and book again with "We collect from you".' : first,
  );
  add(
    { id: "from", code: "ADM-5", group: "The booking", label: "Collected from goods-in, LE4 5AQ" },
    !!b && sameAddress(b.from, "LE4 5AQ", /goods/i),
    b ? `It is collecting from ${b.from.name}, ${b.from.postcode}. Sarah said goods-in: the driver would go to the wrong door. Cancel and book again, collecting from "Northfield Supplies, Goods in".` : first,
  );
  add(
    { id: "to", code: "ADM-5", group: "The booking", label: "Going to Brightwater Cups, Derby DE1 2QY" },
    !!b && sameAddress(b.to, "DE1 2QY", /brightwater/i),
    b ? `It is going to ${b.to.name}, ${b.to.postcode}. The cups go back to Brightwater Cups Ltd in Derby. Bright Cafe is a customer in Leicester. Cancel and book again.` : first,
  );
  add(
    { id: "date", code: "ADM-5", group: "The booking", label: "On Friday 13 November" },
    !!b && b.date === COLLECT_DATE,
    b ? `It is booked for ${b.date.split("-").reverse().join("/")}. Today is Thursday, so Friday is 13 November.` : first,
  );
  add(
    { id: "time", code: "ADM-5", group: "The booking", label: `In the afternoon: ${COLLECT_WINDOW}` },
    !!b && b.window === COLLECT_WINDOW,
    b ? `The time is ${b.window}. Sarah asked for the afternoon: ${COLLECT_WINDOW}.` : first,
  );
  const parcelsOk = !!b && b.parcels.length === 2 && b.parcels.every((p) => Math.abs(p.kg - 12) < 0.01);
  add(
    { id: "parcels", code: "ADM-5", group: "The booking", label: "2 parcels, 12 kg each" },
    parcelsOk,
    b ? `It has ${b.parcels.length} ${b.parcels.length === 1 ? "parcel" : "parcels"}: ${b.parcels.map((p) => `${p.kg} kg`).join(", ")}. Sarah has 2 boxes at 12 kg each: one line per box. A wrong weight can mean a surcharge or a refusal.` : first,
  );

  const toSarah = s.emails.filter((e) => e.folder === "sent" && [...e.to, ...e.cc].some((p) => p.address === PEOPLE.sarah.address));
  const withRef = b ? toSarah.find((e) => fold(`${e.subject} ${e.body}`).includes(fold(b.ref))) : undefined;
  add({ id: "told", code: "OL-5", group: "Telling Sarah", label: "You emailed Sarah" }, toSarah.length > 0, "Reply to Sarah's email once it's booked.");
  add(
    { id: "ref", code: "ADM-5", group: "Telling Sarah", label: "With the booking reference in it" },
    !!withRef,
    !b ? first : toSarah.length ? `Your email to Sarah doesn't have the reference, ${b.ref}. She needs it for the labels. Copy it from the confirmation page or My bookings.` : `Reply to Sarah with the reference: ${b.ref}.`,
  );
  return out;
}

export const courierBooking: Job = {
  id: "m10j4",
  slug: "book-a-courier",
  moduleId: "m10",
  moduleLabel: "Module 10: Admin in practice",
  title: "Book a courier",
  summary: "Sarah needs the returned cups collected tomorrow afternoon. Book it on the courier's website and send her the reference.",
  clock: "Thu 12 Nov, 15:10",
  deadline: "The collection is tomorrow",
  doneLine: "The right boxes, from the right door, on the right afternoon, and Sarah has the reference.",
  brief: "Sarah has asked you to book a courier. Northfield uses Hopwell Couriers: their website is on the Favourites bar in Microsoft Edge. Read Sarah's email, book exactly what she asks, and send her the reference. When you think it's done, press Check my work.",
  hints: [
    "Open Microsoft Edge from the taskbar, and click Hopwell Couriers on the Favourites bar.",
    "Press Book a collection. Work down the numbered parts: we collect from you, goods-in, Brightwater Cups in Derby.",
    "Add a second parcel, and put 12 kg on each. Today is Thursday, so pick Fri 13 Nov and the afternoon.",
    "Check the summary, press Book collection, and copy the reference. Then reply to Sarah with it.",
    "Booked something wrong? Open My bookings, cancel it, and book again.",
  ],
  apps: ["browser"],
  seed,
  check,
  habits: [
    { label: "One version, in one place", checks: ["booked"] },
    { label: "Check your own work", checks: ["method", "from", "to", "date", "time", "parcels"] },
    { label: "Close the loop", checks: ["told", "ref"] },
  ],
};
