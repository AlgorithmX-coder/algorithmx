import type { ComponentType } from "react";
import type { Action } from "../store";
import type { CopilotPaneContext, FileKind, Job, OfficeFile, OfficeState, Paper } from "../types";
/* ── Module 3 ── */
import { W } from "../../tokens";
import { pendingInvites, unreadChats } from "../meetings";
import Calendar from "./Calendar";
import Teams, { TeamsToast } from "./Teams";
/* ── end Module 3 ── */
/* ── Module 8: Documents ── */
import WordApp from "./Word";
/* ── Module 13: Show what you can do ── */
import { AGENCY } from "../agency";
import Agency from "./Agency";
/* ── Module 10: Admin in practice ── */
import Edge, { EDGE_COLOUR } from "./Edge";
import Phone, { PHONE_COLOUR, PhoneRinging } from "./Phone";
/* ── end Module 10 ── */
/* ── Module 11: Staying safe at work ── */
import { LockLayer, SECURITY_COLOUR, SignInLayer } from "./Security";
/* ── end Module 11 ── */
/* ── Module 12: AI as your assistant ── */
import { CopilotApp, CopilotPane } from "./Copilot";

/* The office's plug-in seam. Outlook, File Explorer and Excel are built
 * into Office.tsx; every other app (Calendar, Teams, Word, the Copilot
 * pane, a courier site, a phone on the desk) registers here, and a job
 * lists the ones it needs in `apps`. The office keeps each window mounted
 * while the learner switches, like windows on a real taskbar, and every
 * app reads and writes the one office record.
 *
 * An app changes the record with `dispatch({ type: "update", fn })`, so a
 * new app never has to add cases to the shared reducer. */

export interface OfficeAppProps {
  state: OfficeState;
  dispatch: (a: Action) => void;
  job: Job;
  /* Whether this app's window is the one in front. */
  active: boolean;
  /* Bring an app to the front, by id: "outlook", "explorer", "excel" or a
   * registered app. */
  show: (app: string) => void;
  /* Open a file the way double-clicking it in File Explorer would. */
  openFile: (f: OfficeFile) => void;
  /* Show a piece of paper (a delivery note, a receipt) in the viewer. */
  openPaper: (title: string, paper?: Paper) => void;
  /* The file this app was last asked to open (see `opens`). `key` changes
   * every time, so opening the same file twice still lands. */
  request: { fileId: string; key: number } | null;
}

export interface OfficeApp {
  label: string | ((s: OfficeState) => string);
  colour: string;
  /* A count on the taskbar button (unread chats, a pending invite). */
  badge?: (s: OfficeState) => number;
  /* File kinds this app opens when they are double-clicked anywhere. */
  opens?: FileKind[];
  /* The app's window. Omit it for an app that only draws a layer. */
  Window?: ComponentType<OfficeAppProps>;
  /* Drawn over the whole desktop whenever the job lists the app: a phone
   * prompt, a sticky note, a chat toast, the lock screen. */
  Layer?: ComponentType<OfficeAppProps>;
  /* Leave it off the taskbar (a layer-only app). */
  noTaskbar?: boolean;
  /* ── Module 12 ── A pane the app also opens inside Outlook (a reply) and
   * Excel (down the side), as Copilot does. */
  Pane?: ComponentType<OfficeAppProps & { ctx: CopilotPaneContext }>;
}

/* Module builds add their apps here, one line each, in course order. */
export const OFFICE_APPS: Record<string, OfficeApp> = {
  /* ── Module 3: Meetings and messages ── */
  calendar: { label: "Calendar", colour: W.outlook, badge: pendingInvites, Window: Calendar },
  teams: { label: "Teams", colour: W.teams, badge: unreadChats, Window: Teams, Layer: TeamsToast },
  /* ── end Module 3 ── */
  /* ── Module 8: Documents ── */
  word: { label: "Word", colour: W.word, opens: ["docx", "dotx"], Window: WordApp },
  /* ── Module 13: Show what you can do ── */
  agency: { label: "Pennyford test centre", colour: AGENCY.colour, Window: Agency },
  /* ── Module 10: Admin in practice ── */
  phone: { label: "Phone", colour: PHONE_COLOUR, badge: (s) => (s.phone?.calls ?? []).filter((c) => c.ringing && !(s.phone?.answered ?? []).includes(c.id)).length, Window: Phone, Layer: PhoneRinging },
  browser: { label: "Microsoft Edge", colour: EDGE_COLOUR, Window: Edge },
  /* ── end Module 10 ── */
  /* ── Module 11: Staying safe at work ── */
  authenticator: { label: "Your phone", colour: SECURITY_COLOUR, Layer: SignInLayer, noTaskbar: true },
  lock: { label: "Lock screen", colour: SECURITY_COLOUR, Layer: LockLayer, noTaskbar: true },
  /* ── end Module 11 ── */
  /* ── Module 12: AI as your assistant ── */
  copilot: { label: "Copilot", colour: W.copilot, Window: CopilotApp, Pane: CopilotPane },
};
