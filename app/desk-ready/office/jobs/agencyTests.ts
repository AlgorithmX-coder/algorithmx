import { AGENCY, PASS, agencyOf, bestExcel, bestLine, bestTyping, realExcel, realTyping, storedAgency, typingPassed } from "../agency";
import { inbound, officeFolders } from "../northfield";
import type { Check, Job, OfficeState } from "../types";

/* E13.2 The agency tests (criteria WIN-1, XL-1, XL-5).
 *
 * Jo at Pennyford Recruitment asks the learner to take the agency's two
 * online tests before she puts them forward: a three-minute typing test
 * (35 words a minute or more, at 95% accuracy) and an Excel test of ten
 * tasks in fifteen minutes (8 or more right). Both run in the agency's test
 * centre (apps/Agency), where either can be practised without the clock
 * first, as often as the learner likes. Only the real, timed runs count.
 * The learner then tells Jo they are done.
 *
 * Every result is kept in the office record (OfficeState.agency), so the
 * checks read the best real run, and the module page shows the best so far. */

const JO = AGENCY.consultant;

const JO_BODY = `Hi,

Thanks for sending your details. Before I put you forward to our office clients, please complete our two online tests:

- a typing test (3 minutes)
- an Excel test (10 tasks in 15 minutes)

Open the Pennyford test centre on your taskbar. You can practise each test as often as you like first, with no clock. When you're ready, take the real one.

Most of our office clients ask for 35 words a minute at 95% accuracy, and at least 8 of the 10 Excel tasks right.

Please reply to let me know when you've done both.

Kind regards,
Jo Marsh
Recruitment Consultant | ${AGENCY.name}
${AGENCY.phone}`;

function seed(): OfficeState {
  return {
    version: 0,
    files: officeFolders(),
    emails: [inbound({ id: "mail-jo-tests", from: JO, subject: "Your typing and Excel tests", time: "10:20", body: JO_BODY })],
    agency: { typing: [], excel: [] },
  };
}

function check(s: OfficeState): Check[] {
  const a = agencyOf(s);
  const typing = bestTyping(realTyping(a));
  const excel = bestExcel(realExcel(a));
  const practisedTyping = a.typing.some((r) => r.practice);
  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });
  const startedReal = a.typing.some((r) => !r.practice);
  const noTyping = startedReal
    ? "Your real typing test stopped before the 3 minutes were up, so it doesn't count. Take it again and keep going until the clock stops."
    : practisedTyping
      ? "You've practised, which is good. Now take the real typing test: Pennyford test centre > Typing test > Take the test."
      : "Open the Pennyford test centre on the taskbar, and take the typing test. Practise first if you like.";

  /* The typing test */
  add({ id: "typing", code: "WIN-1", group: "The typing test", label: "You took the real 3-minute typing test" }, !!typing, noTyping);
  add(
    { id: "speed", code: "WIN-1", group: "The typing test", label: `${PASS.wpm} words a minute or more (net speed)` },
    !!typing && typing.net >= PASS.wpm,
    !typing ? noTyping : `Your best net speed is ${typing.net} words a minute. Practise a few more runs, then take it again: speed comes from not stopping, so keep your eyes on the words ahead.`,
  );
  add(
    { id: "accuracy", code: "WIN-1", group: "The typing test", label: `${PASS.accuracy}% accuracy or better` },
    !!typing && typing.accuracy >= PASS.accuracy,
    !typing ? noTyping : `That run was ${Math.floor(typing.accuracy)}% accurate. Slow down a little: a word left wrong costs more than a slower word. Fix a slip with Backspace as soon as you see it.`,
  );

  /* The Excel test */
  const triedExcel = a.excel.some((r) => r.practice);
  add(
    { id: "excel", code: "XL-1", group: "The Excel test", label: "You took the real Excel test, against the clock" },
    !!excel,
    triedExcel ? "You've practised. Now take the real Excel test: Pennyford test centre > Excel test > Take the test." : "Open the Pennyford test centre on the taskbar, and take the Excel test. Practise it first if you like: there's no clock in practice.",
  );
  add(
    { id: "excel-score", code: "XL-5", group: "The Excel test", label: `${PASS.excel} or more of the 10 tasks right` },
    !!excel && excel.right.length >= PASS.excel,
    !excel ? "Take the real Excel test first." : `Your best is ${excel.right.length} of 10. Open its results to see which tasks were wrong, practise those, then take it again.`,
  );

  /* Telling Jo */
  const told = s.emails.some((e) => e.folder === "sent" && [...e.to, ...e.cc].some((p) => p.address === JO.address));
  const passedBoth = !!typing && typingPassed(typing) && !!excel && excel.right.length >= PASS.excel;
  add({ id: "told", code: "OL-4", group: "Telling Jo", label: "You told Jo the tests are done" }, told, passedBoth ? "Reply to Jo's email in one line: say both tests are done." : "When both tests are done, reply to Jo's email in one line to say so.");
  return out;
}

export const agencyTests: Job = {
  id: "m13j2",
  slug: "agency-tests",
  moduleId: "m13",
  moduleLabel: "Module 13: Show what you can do",
  title: "The agency tests",
  summary: "Before Jo puts you forward, take Pennyford's typing test (35 words a minute at 95%) and Excel test (8 of 10 in 15 minutes). Practise first as often as you like.",
  clock: "10:25",
  deadline: "Friday 13 November",
  doneLine: "You passed both of Pennyford's tests. Jo can put you forward for office jobs.",
  brief: "Jo at Pennyford Recruitment wants you to take two online tests. Read her email, then open the Pennyford test centre on the taskbar. Practise each test first if you like. When you think it's done, press Check my work.",
  apps: ["agency"],
  hide: ["explorer", "excel"],
  hints: [
    "Read Jo's email in Outlook.",
    "Click Pennyford test centre on the taskbar.",
    "Typing test: press Practise first. The clock starts when you type the first letter. Keep going, and fix slips with Backspace.",
    "When your practice runs pass, press Take the test and type for the full 3 minutes.",
    "Excel test: practise first. Each task names the cell to use, like E2. Click it, then type. Formulas start with =.",
    "Take the real Excel test. Skip a task you're stuck on and come back to it. Press Hand in my test when you're done.",
    "Reply to Jo's email to say both tests are done.",
  ],
  seed,
  check,
  habits: [
    { label: "Put it where the brief says", checks: ["typing", "excel"] },
    { label: "Check your own work", checks: ["accuracy", "excel-score"] },
    { label: "Close the loop", checks: ["told"] },
  ],
  best: () => {
    const a = storedAgency("m13j2");
    return a ? bestLine(a) : null;
  },
};
