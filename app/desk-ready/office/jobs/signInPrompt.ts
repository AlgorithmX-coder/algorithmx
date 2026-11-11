import { inbound, officeFolders, PEOPLE, SIGNATURE } from "../northfield";
import { IT_HELPDESK } from "../safety";
import type { Check, Email, Job, OfficeState } from "../types";

/* E11.3 A sign-in you didn't start (criteria SAFE-3, SAFE-5). At 15:02 the
 * learner's phone asks "Approve sign-in to Northfield Supplies?", from a
 * place they have never been, while they are reading email. They are not
 * signing in to anything. Done means: the request is denied and reported
 * to IT (with Report in the app, or an email to the IT Helpdesk), and then,
 * as Daniel has asked them to the meeting room, the screen is locked (Win+L,
 * or Start > You > Lock) before they step away. */

function seed(): OfficeState {
  const emails: Email[] = [
    inbound({
      id: "m-daniel-chat",
      from: PEOPLE.daniel,
      subject: "Quick chat at 15:05?",
      time: "14:58",
      body: `Hi,\n\nCan you pop over to the small meeting room at 15:05? Bring a notebook. It's a quick catch-up on your first week, about 20 minutes.\n\nThanks,\nDaniel\n\n${SIGNATURE.daniel}`,
    }),
    inbound({
      id: "m-it-welcome",
      from: IT_HELPDESK,
      subject: "Your two-step sign-in is set up",
      time: "Mon 09:20",
      unread: false,
      body: "Hi,\n\nYour Northfield account is now set up for two-step sign-in. When you sign in on a new computer, the Authenticator app on your phone will ask you to approve it.\n\nAny questions, email us here or ring ext 444.\n\nIT Helpdesk\nNorthfield Supplies",
    }),
    inbound({
      id: "m-fire-drill",
      from: PEOPLE.facilities,
      subject: "Fire drill on Thursday at 11:00",
      time: "Mon 15:30",
      unread: false,
      body: "Hello all,\n\nThe alarm will sound for about two minutes on Thursday at 11:00. Please leave by the nearest exit and meet in the car park.\n\nFacilities Team",
    }),
  ];
  return {
    version: 0,
    files: officeFolders(),
    emails,
    contacts: [IT_HELPDESK],
    signIn: { at: "15:02", app: "Office 365", location: "Amsterdam, Netherlands", status: "waiting" },
    screen: { locked: false, locks: 0 },
  };
}

/* ── marking ─────────────────────────────────────────────────────────── */

function check(s: OfficeState): Check[] {
  const p = s.signIn;
  const toIT = s.emails.some((e) => e.folder === "sent" && [...e.to, ...e.cc].some((x) => x.address === IT_HELPDESK.address));
  const reported = !!p?.reported || toIT;
  const locked = !!s.screen?.locked || !!s.screen?.afterPrompt;
  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });

  add(
    { id: "denied", code: "SAFE-3", group: "The sign-in request", label: "You turned it down" },
    p?.status === "denied",
    p?.status === "approved"
      ? "You approved a sign-in you didn't start. That let whoever was signing in into your account: they had your password, and you gave them the last step. At work, tell IT straight away and change your password. Here, start the job again and press \"No, it's not me\"."
      : "The request on your phone is still waiting. You aren't signing in to anything, so there's no number to type. Press \"No, it's not me\".",
  );
  add(
    { id: "reported", code: "SAFE-3", group: "The sign-in request", label: "You reported it to IT" },
    reported,
    "Someone out there has your password. After you turn it down, press Report on the phone, or email the IT Helpdesk, so they can lock them out and help you change it.",
  );
  add(
    { id: "locked", code: "SAFE-5", group: "Stepping away", label: "You locked the screen before going to see Daniel" },
    locked,
    "Daniel wants you in the meeting room at 15:05. Before you leave your desk, lock the screen: press the Windows key and L together, or Start > You > Lock.",
  );
  return out;
}

export const signInPrompt: Job = {
  id: "m11j3",
  slug: "sign-in-prompt",
  moduleId: "m11",
  moduleLabel: "Module 11: Staying safe at work",
  title: "A sign-in you didn't start",
  summary: "Your phone asks you to approve a sign-in, but you're not signing in to anything. Then it's time to step away from your desk.",
  clock: "Wed 11 Nov, 15:01",
  deadline: "Daniel wants you at 15:05",
  doneLine: "The stranger stayed out, IT know, and your desk was locked behind you. That's how it's done.",
  brief: "You're at your desk, reading email. Keep an eye on your phone, bottom right. Deal with anything that comes up, then do what Daniel asks. When you think it's done, press Check my work.",
  hints: [
    "Read Daniel's email: you're about to leave your desk.",
    "When the phone buzzes, read it. Are you signing in to anything right now? Is there a number on your screen to type?",
    "If it wasn't you: \"No, it's not me\", then Report.",
    "Before you go, lock the screen: Windows key + L, or Start (the blue squares on the taskbar) > You > Lock.",
  ],
  apps: ["authenticator", "lock"],
  seed,
  check,
  habits: [
    { label: "Close the loop", checks: ["reported"] },
    { label: "Check your own work", checks: ["denied"] },
  ],
};
