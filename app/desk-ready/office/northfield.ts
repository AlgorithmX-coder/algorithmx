import type { Email, OfficeFile, Person } from "./types";

/* Northfield Supplies, the one pretend company every Desk Ready job runs
 * in: a Leicester wholesaler of catering and packaging supplies, about 40
 * staff. The learner has just joined as Office Administrator. Names,
 * suppliers and customers are invented; phone numbers sit in Ofcom's drama
 * ranges and addresses use the reserved .example domain, so none of them
 * reaches anyone real. */

const DOMAIN = "northfieldsupplies.example";

export const YOU: Person = { name: "You", address: `you@${DOMAIN}` };

export const PEOPLE = {
  daniel: { name: "Daniel Okafor", address: `daniel.okafor@${DOMAIN}` },
  sarah: { name: "Sarah Patel", address: `sarah.patel@${DOMAIN}` },
  priya: { name: "Priya Shah", address: `priya.shah@${DOMAIN}` },
  emma: { name: "Emma Clarke", address: `emma.clarke@${DOMAIN}` },
  hr: { name: "HR Team", address: `hr@${DOMAIN}` },
  facilities: { name: "Facilities Team", address: `facilities@${DOMAIN}` },
  tom: { name: "Tom Hale", address: "tom.hale@harlowpackaging.example" },
  imran: { name: "Imran Ahmed", address: "imran.ahmed@kentbakery.example" },
  kentFlour: { name: "Kent Flour Mills", address: "orders@kentflourmills.example" },
  brightwater: { name: "Brightwater Cups Accounts", address: "accounts@brightwatercups.example" },
} satisfies Record<string, Person>;

/* Kent Bakery's own staff, copied in on the bakery's emails. */
export const KENT_STAFF: Person[] = [
  { name: "Lucy Grant", address: "lucy.grant@kentbakery.example" },
  { name: "Tom Reid", address: "tom.reid@kentbakery.example" },
  { name: "Aisha Khan", address: "aisha.khan@kentbakery.example" },
  { name: "Ben Cole", address: "ben.cole@kentbakery.example" },
];

/* Everyone the To box suggests as the learner types. */
export const CONTACTS: Person[] = [...Object.values(PEOPLE), ...KENT_STAFF];

/* An email to the learner, with the fields most seeds leave empty. */
export function inbound(e: Pick<Email, "id" | "from" | "subject" | "time" | "body"> & Partial<Email>): Email {
  return { folder: "inbox", to: [YOU], cc: [], attachments: [], links: [], unread: true, ...e };
}

/* The office's standard folders on OneDrive and the team sites, as every
 * job starts with them. A job adds its own files on top. */
export function officeFolders(): OfficeFile[] {
  const out: OfficeFile[] = [];
  const folder = (path: readonly string[], name: string, modified = "02/11/2026", by = "Daniel Okafor") =>
    out.push({ id: `seed-dir-${[...path, name].join("/")}`, path, name, kind: "folder", modified, by, seeded: true });
  folder(["OneDrive"], "Documents", "02/11/2026", "You");
  folder(["OneDrive"], "Desktop", "02/11/2026", "You");
  folder(["OneDrive"], "Downloads", "Today 08:01", "You");
  folder(["Operations Team"], "Documents");
  folder(["Operations Team", "Documents"], "Deliveries", "Today 07:58", "Sarah Patel");
  folder(["Operations Team", "Documents"], "Orders");
  folder(["Operations Team", "Documents"], "Stock");
  folder(["Operations Team", "Documents"], "Health and safety");
  folder(["Operations Team", "Documents", "Deliveries"], "2025", "02/01/2026", "Sarah Patel");
  folder(["Operations Team", "Documents", "Deliveries"], "2026", "09/11/2026", "Daniel Okafor");
  folder(["Operations Team", "Documents", "Orders"], "2026");
  folder(["Finance"], "Invoices");
  folder(["Finance", "Invoices"], "To approve");
  folder(["Finance", "Invoices"], "Approved");
  folder(["Finance"], "Expenses");
  folder(["HR"], "Forms");
  folder(["HR"], "Templates");
  out.push({ id: "seed-fire", path: ["Operations Team", "Documents", "Health and safety"], name: "Fire procedure.pdf", kind: "pdf", modified: "20/10/2026", by: "Facilities Team", seeded: true });
  out.push({ id: "seed-letterhead", path: ["HR", "Templates"], name: "Letterhead.docx", kind: "docx", modified: "11/03/2026", by: "Emma Clarke", seeded: true });
  return out;
}

/* The roots of the file system: the learner's own OneDrive, then the team
 * sites on SharePoint. A root always exists; folders inside are files of
 * kind "folder". */
export const ROOTS = [
  { name: "OneDrive", label: "OneDrive - Northfield Supplies", site: false },
  { name: "Operations Team", label: "Operations Team", site: true },
  { name: "Finance", label: "Finance", site: true },
  { name: "HR", label: "HR", site: true },
] as const;

export const SIGNATURE = {
  sarah: "Sarah Patel\nWarehouse Supervisor | Northfield Supplies\n01632 960 412",
  daniel: "Daniel Okafor\nOffice Manager | Northfield Supplies\n01632 960 400",
};
