import { redirect } from "next/navigation";

/**
 * /organisations was a 404 while /organisations/buy existed.
 *
 * Nothing in the entire site linked to the buy page: the only references to
 * it anywhere were Stripe's own success and cancel URLs. So the one card
 * checkout we have could be reached only by somebody who had been sent the
 * full path by hand, and the obvious shorter URL, the one a person types or
 * a colleague passes on, returned not found.
 *
 * A redirect rather than a landing page of its own. A second marketing page
 * for organisations is a real piece of work with real copy decisions in it,
 * and this is not that: it is the missing front door, so the address works.
 */
export default function OrganisationsPage() {
  redirect("/organisations/buy");
}
