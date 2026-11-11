import type { ComponentType } from "react";
import type { Action } from "../store";
import type { FileKind, Job, OfficeFile, OfficeState, Paper } from "../types";

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
}

/* Module builds add their apps here, one line each, in course order. */
export const OFFICE_APPS: Record<string, OfficeApp> = {};
