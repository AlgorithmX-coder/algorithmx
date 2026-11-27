/* The "tap the three tells" demo on /cyberexplorers: the phishing message
 * and its three tells as data, plus the pure state rules the component
 * runs. Kept out of the component so the rules are unit tested. */

export type Tell = { id: string; text: string; label: string };

/* The message reads: [sender] / "Your account will be [pressure] unless you
 * verify it now at [link]". Each tell is a real button in the message. */
export const TELLS = {
  sender: { id: "sender", text: "support@gamehub-rewards-center.com", label: "Sender address" },
  pressure: { id: "pressure", text: "DELETED in 24 hours", label: "Pressure line" },
  link: { id: "link", text: "gamehub.support-verify.net", label: "Link target" },
} as const satisfies Record<string, Tell>;

export const TELL_IDS = [TELLS.sender.id, TELLS.pressure.id, TELLS.link.id] as const;
export const TELL_COUNT = TELL_IDS.length;

/** Mark one tell found. Finding the same tell twice changes nothing. */
export function findTell(found: ReadonlyArray<string>, id: string): ReadonlyArray<string> {
  if (!TELL_IDS.includes(id as (typeof TELL_IDS)[number]) || found.includes(id)) return found;
  return [...found, id];
}

export const isDone = (found: ReadonlyArray<string>) => TELL_IDS.every((id) => found.includes(id));

/** The status line under the message: "0 of 3 found" until the case closes. */
export function demoStatus(found: ReadonlyArray<string>): string {
  return isDone(found) ? "Case closed. Reported." : `${found.length} of ${TELL_COUNT} found`;
}

/** The tells "Show me the tells" still has to reveal, in reading order. */
export const remainingTells = (found: ReadonlyArray<string>) => TELL_IDS.filter((id) => !found.includes(id));
