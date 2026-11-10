import type { Person } from "./types";

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
} satisfies Record<string, Person>;

/* Everyone the To box suggests as the learner types. */
export const CONTACTS: Person[] = Object.values(PEOPLE);

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
