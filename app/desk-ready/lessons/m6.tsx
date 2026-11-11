"use client";

import { ExcelLab, sheetOf } from "../learn/excelLab";
import { SheetFigure } from "../learn/figures/sheet";
import type { LabProps, ModuleManifest } from "../learn/types";
import { evaluate, numeric } from "../office/formula";
import type { Grid } from "../office/types";

/* Module 6: Making it do the maths (criteria XL-5, XL-6, XL-7). Formulas,
 * SUM, AVERAGE and COUNT, VAT and percentages, COUNTIF, and copying a
 * formula down. The practice runs in the office's own Excel (ExcelLab),
 * so formulas really work. Three office jobs follow on the module page.
 *
 * House copy rules: UK English, plain words, short sentences, no
 * em-dashes. Quiz options are kept to similar lengths so the right answer
 * is never the obvious longest one. */

const isFormula = (g: Grid, r: number, c: number) => (g[r]?.[c] ?? "").trim().startsWith("=");
const near = (a: number | null, b: number) => a !== null && Math.abs(a - b) < 0.005;
const formulaGives = (g: Grid, r: number, c: number, want: number) => isFormula(g, r, c) && near(numeric(g, r, c), want);

const ORDERS = sheetOf(
  [
    ["Order no", "Customer", "Qty", "Unit price", "Total"],
    ["4401", "Harlow Foods", "12", "£4.50", ""],
    ["4402", "Bright Cafe", "6", "£18.00", ""],
    ["4403", "Kent Bakery", "20", "£14.20", ""],
  ],
  5,
  8,
);

/* The sheets the lessons' figures show. Formulas show their answers. */
const ORDERS_SUM = [
  ["Order no", "Customer", "Qty", "Unit price", "Total"],
  ["4401", "Harlow Foods", "12", "£4.50", "=C2*D2"],
  ["4402", "Bright Cafe", "6", "£18.00", "=C3*D3"],
  ["4403", "Kent Bakery", "20", "£14.20", "=C4*D4"],
  ["", "", "", "Total", "=SUM(E2:E4)"],
];
const VAT_SHEET = [
  ["", "Amount"],
  ["Net (before VAT)", "£228.00"],
  ["VAT at 20%", "=B2*0.2"],
  ["Total with VAT", "=B2+B3"],
];
const CHANGE_SHEET = [
  ["", "Sales"],
  ["October", "£389.50"],
  ["November", "£452.00"],
  ["Change", "=(B3-B2)/B2"],
];
const LATE_SHEET = [
  ["Delivery note", "Supplier", "Status"],
  ["DN-77790", "Harlow Packaging", "On time"],
  ["DN-40877", "Kent Flour Mills", "Late"],
  ["DN-11618", "Brightwater Cups", "On time"],
  ["DN-77801", "Harlow Packaging", "Late"],
  ["", "Late deliveries", '=COUNTIF(C2:C5,"Late")'],
];

/* ---------- Lesson 1: your first formula ---------- */

function FirstFormulaLab(p: LabProps) {
  return (
    <ExcelLab
      {...p}
      tasks={[
        {
          scenario: "Each order's total is the quantity times the unit price. In E2, type =C2*D2 and press Enter. Then do the same for rows 3 and 4: =C3*D3 and =C4*D4. The * means times.",
          file: "Orders.xlsx",
          grid: ORDERS,
          widths: [90, 140, 70, 100, 100],
          rules: [
            { label: "E2 works out 12 times £4.50", test: (g) => formulaGives(g, 1, 4, 54), hint: "Click E2 and type =C2*D2, then press Enter. It should show £54.00." },
            { label: "E3 works out its own row", test: (g) => formulaGives(g, 2, 4, 108), hint: "E3 needs =C3*D3: the same formula, using row 3." },
            { label: "E4 works out its own row", test: (g) => formulaGives(g, 3, 4, 284), hint: "E4 needs =C4*D4." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 2: SUM, AVERAGE and COUNT ---------- */

const SALES = sheetOf(
  [
    ["Day", "Sales"],
    ["Monday", "£412.50"],
    ["Tuesday", "£388.00"],
    ["Wednesday", "£455.20"],
    ["Thursday", "£402.30"],
    ["Friday", "£512.00"],
    [],
    ["Total", ""],
    ["Average", ""],
    ["Days", ""],
  ],
  2,
  12,
);

function SumLab(p: LabProps) {
  return (
    <ExcelLab
      {...p}
      tasks={[
        {
          scenario: "Daniel wants this week's sales summed up. In B8 type =SUM(B2:B6). In B9 work out the average day with =AVERAGE(B2:B6). In B10 count the days with =COUNT(B2:B6). B2:B6 means every cell from B2 down to B6.",
          file: "Sales this week.xlsx",
          grid: SALES,
          widths: [130, 120],
          rules: [
            { label: "B8 adds up the week: £2,170.00", test: (g) => formulaGives(g, 7, 1, 2170), hint: "Click B8 and type =SUM(B2:B6)." },
            { label: "B9 works out the average day: £434.00", test: (g) => formulaGives(g, 8, 1, 434), hint: "Click B9 and type =AVERAGE(B2:B6)." },
            { label: "B10 counts the days: 5", test: (g) => formulaGives(g, 9, 1, 5), hint: "Click B10 and type =COUNT(B2:B6). COUNT counts the cells with numbers in." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 3: VAT and percentages ---------- */

const QUOTE = sheetOf(
  [
    ["", "Amount"],
    ["Net (before VAT)", "£228.00"],
    ["VAT at 20%", ""],
    ["Total with VAT", ""],
    [],
    ["Last month's sales", "£389.50"],
    ["This month's sales", "£452.00"],
    ["Change", ""],
  ],
  2,
  10,
);

function VatLab(p: LabProps) {
  return (
    <ExcelLab
      {...p}
      tasks={[
        {
          scenario: "VAT is 20%, which is the net times 0.2. In B3 type =B2*0.2. In B4 add them up with =B2+B3. Then work out how much sales changed: in B8 type =(B7-B6)/B6, and press % on the ribbon to show it as a percentage.",
          file: "Quote and sales.xlsx",
          grid: QUOTE,
          widths: [190, 120],
          rules: [
            { label: "B3 works out the VAT: £45.60", test: (g) => formulaGives(g, 2, 1, 45.6), hint: "Click B3 and type =B2*0.2." },
            { label: "B4 is the total with VAT: £273.60", test: (g) => formulaGives(g, 3, 1, 273.6), hint: "Click B4 and type =B2+B3." },
            { label: "B8 works out the change", test: (g) => formulaGives(g, 7, 1, (452 - 389.5) / 389.5), hint: "Click B8 and type =(B7-B6)/B6. The brackets make Excel take away first." },
            { label: "B8 shows as a percentage", test: (_, f) => f.B8 === "percent", hint: "With B8 selected, press % on the ribbon. It should show about 16%." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 4: COUNTIF ---------- */

const LOG = sheetOf(
  [
    ["Delivery note", "Supplier", "Status", "Value"],
    ["DN-77790", "Harlow Packaging", "On time", "£384.00"],
    ["DN-40877", "Kent Flour Mills", "Late", "£568.00"],
    ["DN-11618", "Brightwater Cups", "On time", "£270.00"],
    ["DN-77801", "Harlow Packaging", "Late", "£96.00"],
    ["DN-40890", "Kent Flour Mills", "On time", "£568.00"],
    ["DN-11622", "Brightwater Cups", "Late", "£612.00"],
    ["DN-77812", "Harlow Packaging", "On time", "£576.00"],
    [],
    ["How many late?", ""],
    ["Worth over £500?", ""],
  ],
  4,
  12,
);

function CountIfLab(p: LabProps) {
  return (
    <ExcelLab
      {...p}
      tasks={[
        {
          scenario: "COUNTIF counts the cells that match. In B10 type =COUNTIF(C2:C8,\"Late\") to count the late deliveries. In B11 count the deliveries worth over £500 with =COUNTIF(D2:D8,\">500\"). The quote marks go round what you're looking for.",
          file: "Delivery log.xlsx",
          grid: LOG,
          widths: [140, 170, 100, 100],
          rules: [
            { label: "B10 counts the late ones: 3", test: (g) => formulaGives(g, 9, 1, 3) && /countif/i.test(g[9][1]), hint: "Click B10 and type =COUNTIF(C2:C8,\"Late\")." },
            { label: "B11 counts those over £500: 4", test: (g) => formulaGives(g, 10, 1, 4) && /countif/i.test(g[10][1]), hint: "Click B11 and type =COUNTIF(D2:D8,\">500\")." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 5: copying a formula down ---------- */

const LONG = sheetOf(
  [
    ["Order no", "Customer", "Qty", "Unit price", "Total"],
    ["4401", "Harlow Foods", "12", "£4.50", "=C2*D2"],
    ["4402", "Bright Cafe", "6", "£18.00", ""],
    ["4403", "Kent Bakery", "20", "£14.20", ""],
    ["4404", "Harlow Foods", "3", "£9.99", ""],
    ["4405", "Oak Street Deli", "10", "£3.25", ""],
    ["4406", "Bright Cafe", "6", "£11.40", ""],
    ["4407", "Kent Bakery", "8", "£21.00", ""],
    ["4408", "Mill Lane Pub", "24", "£1.80", ""],
  ],
  5,
  11,
);
const LONG_TOTALS = [54, 108, 284, 29.97, 32.5, 68.4, 168, 43.2];

function FillLab(p: LabProps) {
  return (
    <ExcelLab
      {...p}
      tasks={[
        {
          scenario: "E2 already works out its total. Rather than typing the formula seven more times, click E2, then press ⇩ Fill down on the ribbon. Excel copies it down to the last order, and each row works out its own total.",
          file: "Orders.xlsx",
          grid: LONG,
          widths: [90, 150, 70, 100, 100],
          rules: [
            { label: "Every order has a total", test: (g) => LONG_TOTALS.every((t, i) => formulaGives(g, i + 1, 4, t)), hint: "Click E2, then press ⇩ Fill down." },
            { label: "Each row uses its own numbers", test: (g) => /C9\*D9/i.test(g[8][4] ?? "") && evaluate(g, 8, 4) === 43.2, hint: "E9 should say =C9*D9. Fill down moves the row numbers for you." },
          ],
        },
      ]}
    />
  );
}

const m6: ModuleManifest = {
  id: "m6",
  number: 6,
  title: "Making it do the maths",
  intro: "Excel does the sums so you don't have to, and gets them right every time. In five short lessons you will write your first formulas, add up, average and count, work out VAT and percentages, count what matches, and copy a formula down a whole list. Then you will do it for real in the pretend office.",
  outcomes: [
    "Write a formula that works out a total",
    "Add up, average and count a list with SUM, AVERAGE and COUNT",
    "Add VAT and work out a percentage change",
    "Count what matches with COUNTIF",
    "Copy a formula down a list in one go",
  ],
  topics: [
    {
      id: "m6t1",
      title: "Your first formula",
      minutes: 8,
      brief: "A formula is a sum Excel does for you. In this lesson you will write your first ones, and see why a formula beats typing the answer.",
      learn: [
        {
          heading: "A formula, and the answer it gives",
          body: [
            "Here's an order list. Look at the selected cell (10), E2: it shows £54.00. But look at the formula bar (4): what's really in E2 is =C2*D2.",
            "That's a formula. It tells Excel to work out the quantity (C2) times the unit price (D2), and show the answer. Change either number and the answer changes by itself.",
          ],
          figure: <SheetFigure grid={ORDERS_SUM} file="Orders.xlsx" tabs={["Orders"]} activeTab={0} widths={[90, 140, 60, 100, 100]} cell={[1, 4]} row={1} column={4} focus={["formulabar", "cell"]} title="What's typed, and what shows" what={{ formulabar: "=C2*D2: what's really typed in E2. The = tells Excel it's a formula.", cell: "E2 shows the answer: 12 times £4.50 is £54.00." }} />,
        },
        {
          heading: "Every formula starts with =",
          body: ["Type = in a cell, then the sum. Press Enter and Excel shows the answer.", "Click the cell again and the formula bar shows the formula behind it."],
          good: [{ text: "=12*4.50", note: "Shows 54." }],
          tip: "On a keyboard: + adds, - takes away, * times, / divides.",
        },
        {
          heading: "Use cell names, not numbers",
          figure: <SheetFigure grid={ORDERS_SUM} file="Orders.xlsx" tabs={["Orders"]} activeTab={0} widths={[90, 140, 60, 100, 100]} cell={[1, 4]} row={1} column={4} focus={["formulabar"]} title="Cell names in a formula" what={{ formulabar: "=C2*D2 points at the cells. Type =12*4.50 instead and it won't change when the order does." }} />,
          body: ["Point the formula at the cells, like =C2*D2, rather than typing the numbers in.", "Then if C2 changes, the answer changes too."],
          good: [{ text: "=C2*D2", note: "Quantity times unit price, from the cells." }],
          bad: [{ text: "54", note: "Typed in. If the quantity changes, it's wrong." }],
        },
        {
          heading: "Brackets go first",
          body: ["Excel does times and divide before plus and minus, like school maths.", "Put brackets round the part you want done first."],
          good: [{ text: "=(B7-B6)/B6", note: "Take away first, then divide." }],
        },
      ],
      tryIt: { title: "Work out three totals", intro: "Real orders, real prices. Write a formula for each total.", Lab: FirstFormulaLab },
      check: [
        {
          q: "What does every formula start with?",
          options: ["=", "+", "#"],
          answer: 0,
          reasons: ["An equals sign tells Excel it's a formula.", "A plus sign is for adding, inside a formula.", "A # shows an error, like #VALUE!."],
        },
        {
          q: "Why write =C2*D2 rather than typing 54?",
          options: ["It updates when C2 or D2 change", "It looks more professional", "Excel can't show plain numbers"],
          answer: 0,
          reasons: ["Change the quantity and the total follows.", "It's not about looks: typed totals go wrong.", "Excel shows plain numbers fine."],
        },
        {
          q: "Which sign means times in Excel?",
          options: ["*", "x", "×"],
          answer: 0,
          reasons: ["The star means times.", "Excel reads x as a letter.", "Excel doesn't use the × sign."],
        },
      ],
      takeaways: ["Formulas start with =.", "Point at cells, like =C2*D2.", "Brackets go first."],
    },
    {
      id: "m6t2",
      title: "SUM, AVERAGE and COUNT",
      minutes: 8,
      brief: "Three formulas do most of the work in an office. In this lesson you will add up a list, find its average and count it.",
      learn: [
        {
          heading: "A total at the bottom of a list",
          body: [
            "The total in E5 (10) shows £446.00. The formula bar (4) shows how: =SUM(E2:E4).",
            "SUM adds up every number from E2 down to E4. Add a row in the middle and widen the range, and the total keeps up.",
          ],
          figure: <SheetFigure grid={ORDERS_SUM} file="Orders.xlsx" tabs={["Orders"]} activeTab={0} widths={[90, 140, 60, 100, 100]} cell={[4, 4]} row={4} column={4} focus={["formulabar", "cell", "column"]} title="A SUM" what={{ formulabar: "=SUM(E2:E4): add up E2, E3 and E4.", cell: "E5 shows the answer: £446.00.", column: "The numbers it adds: E2 to E4." }} />,
        },
        {
          heading: "SUM adds up a list",
          figure: <SheetFigure grid={ORDERS_SUM} file="Orders.xlsx" tabs={["Orders"]} activeTab={0} widths={[90, 140, 60, 100, 100]} cell={[4, 4]} row={4} column={4} focus={["formulabar", "column"]} title="E2:E4 means E2 down to E4" />,
          body: ["=SUM(B2:B6) adds every number from B2 down to B6.", "The colon means \"down to\", so you don't have to name every cell."],
          good: [{ text: "=SUM(B2:B6)" }],
          bad: [{ text: "=B2+B3+B4+B5+B6", note: "It works, but it's slow, and easy to miss a cell." }],
        },
        {
          heading: "AVERAGE finds the middle",
          body: ["=AVERAGE(B2:B6) adds them up and divides by how many there are.", "Managers ask for it all the time: the average order, the average day."],
          good: [{ text: "=AVERAGE(B2:B6)" }],
        },
        {
          heading: "COUNT counts the numbers",
          body: ["=COUNT(B2:B6) counts how many cells have a number in.", "It's how you answer \"how many orders did we get?\""],
          good: [{ text: "=COUNT(A2:A11)", note: "How many order numbers there are." }],
          tip: "COUNT only counts numbers. Words and empty cells are left out.",
        },
      ],
      tryIt: { title: "Sum up the week", intro: "Five days of sales. Add them up, average them and count them.", Lab: SumLab },
      check: [
        {
          q: "What does B2:B6 mean in a formula?",
          options: ["Every cell from B2 down to B6", "Just B2 and B6", "B2 divided by B6"],
          answer: 0,
          reasons: ["The colon means a range: all the cells in between.", "That would be B2,B6.", "Divide is a slash, not a colon."],
        },
        {
          q: "Which formula gives the average order?",
          options: ["=AVERAGE(G2:G11)", "=SUM(G2:G11)", "=COUNT(G2:G11)"],
          answer: 0,
          reasons: ["AVERAGE adds and divides for you.", "SUM gives the total, not the average.", "COUNT tells you how many orders, not their average."],
        },
        {
          q: "What does COUNT leave out?",
          options: ["Words and empty cells", "Numbers over 100", "The first cell"],
          answer: 0,
          reasons: ["COUNT only counts cells with numbers.", "It counts every number, big or small.", "It counts the whole range."],
        },
      ],
      takeaways: ["SUM adds, AVERAGE averages, COUNT counts.", "B2:B6 means from B2 down to B6.", "COUNT only counts numbers."],
    },
    {
      id: "m6t3",
      title: "Adding VAT and working out a percentage",
      minutes: 9,
      brief: "Quotes and invoices need VAT, and managers love a percentage. In this lesson you will add VAT to a price and work out how much something has gone up.",
      learn: [
        {
          heading: "VAT, worked out by a formula",
          body: [
            "Here the net price is in B2. The VAT in B3 (10) shows £45.60, and the formula bar (4) shows how: =B2*0.2, which is 20% of the net.",
            "The total with VAT, in B4, is another formula: =B2+B3.",
          ],
          figure: <SheetFigure grid={VAT_SHEET} file="Quote.xlsx" tabs={["Quote"]} activeTab={0} widths={[180, 110]} cell={[2, 1]} row={2} column={1} focus={["formulabar", "cell"]} title="VAT at 20%" what={{ formulabar: "=B2*0.2: 20% of the net price in B2.", cell: "B3 shows the VAT: £45.60." }} />,
        },
        {
          heading: "VAT is 20% of the net price",
          body: ["The net price is before VAT. VAT is 20% of it, which is the net times 0.2.", "The total with VAT, sometimes called gross, is the net plus the VAT."],
          good: [{ text: "=B2*0.2", note: "VAT on the net in B2." }, { text: "=B2+B3", note: "Net plus VAT." }],
          tip: "Shortcut: the total with VAT is the net times 1.2.",
        },
        {
          heading: "A percentage change",
          figure: <SheetFigure grid={CHANGE_SHEET} file="Sales.xlsx" tabs={["Sales"]} activeTab={0} widths={[150, 110]} cell={[3, 1]} row={3} column={1} shown={(r, c) => (r === 3 && c === 1 ? "16%" : undefined)} focus={["formulabar", "cell"]} title="How much it went up" what={{ formulabar: "=(B3-B2)/B2: take away first, then divide by the old number.", cell: "B4, shown as a percentage: up 16%." }} />,
          body: ["To see how much something went up: take the old number from the new one, then divide by the old one.", "=(new-old)/old. Brackets round the take-away part, so Excel does it first."],
          good: [{ text: "=(B7-B6)/B6", note: "£389.50 to £452.00 is up about 16%." }],
        },
        {
          heading: "Show it as a percentage",
          body: ["Excel shows the answer as 0.16. Select the cell and press % to show it as 16%.", "Press £ to show a number as money, with a pound sign and two decimal places."],
        },
      ],
      tryIt: { title: "A quote and a change", intro: "Add VAT to a quote, then work out how much sales went up.", Lab: VatLab },
      check: [
        {
          q: "The net price is £100. What's the total with VAT?",
          options: ["£120", "£100.20", "£80"],
          answer: 0,
          reasons: ["VAT is £20, so £100 plus £20.", "VAT is 20%, not 20p.", "VAT is added, not taken off."],
        },
        {
          q: "Which formula works out VAT on the net price in B2?",
          options: ["=B2*0.2", "=B2+20", "=B2/20"],
          answer: 0,
          reasons: ["20% is 0.2, so times 0.2.", "That adds £20, whatever the price.", "That gives 5%, not 20%."],
        },
        {
          q: "Why the brackets in =(B7-B6)/B6?",
          options: ["So Excel takes away first", "To make it look tidy", "Because Excel needs them always"],
          answer: 0,
          reasons: ["Without them, Excel would divide B6 by B6 first.", "They change the answer, not just the look.", "Only when you want part done first."],
        },
      ],
      takeaways: ["VAT is the net times 0.2.", "Change is (new minus old) divided by old.", "Press % or £ to show it the right way."],
    },
    {
      id: "m6t4",
      title: "Counting what matches: COUNTIF",
      minutes: 8,
      brief: "\"How many were late?\" is a question you'll hear a lot. In this lesson you will answer it in one formula with COUNTIF.",
      learn: [
        {
          heading: "Counting what matches",
          body: [
            "This delivery log has a Status column. The cell under it (10) shows 2, and the formula bar (4) shows how: =COUNTIF(C2:C5,\"Late\").",
            "COUNTIF looks down C2 to C5 and counts every cell that says Late.",
          ],
          figure: <SheetFigure grid={LATE_SHEET} file="Delivery log.xlsx" tabs={["October"]} activeTab={0} widths={[120, 170, 100]} cell={[5, 2]} row={5} column={2} focus={["formulabar", "cell", "column"]} title="A COUNTIF" what={{ formulabar: '=COUNTIF(C2:C5,"Late"): count the cells in C2 to C5 that say Late.', cell: "C6 shows the count: 2.", column: "Where it looks: the Status column, C2 to C5." }} tint={(r, c) => (c === 2 && r > 0 && r < 5 && LATE_SHEET[r][2] === "Late" ? "#fde2e4" : undefined)} />,
        },
        {
          heading: "COUNTIF counts what matches",
          figure: <SheetFigure grid={LATE_SHEET} file="Delivery log.xlsx" tabs={["October"]} activeTab={0} widths={[120, 170, 100]} cell={[5, 2]} row={5} column={2} focus={["formulabar"]} title="Where to look, then what to look for" what={{ formulabar: 'C2:C5 is where to look. "Late" is what to count.' }} />,
          body: ["=COUNTIF(C2:C8,\"Late\") counts the cells in C2 to C8 that say Late.", "First where to look, then a comma, then what to look for in quote marks."],
          good: [{ text: "=COUNTIF(C2:C41,\"Late\")" }],
        },
        {
          heading: "Count by a number, too",
          body: ["Put a comparison in the quote marks to count numbers over or under something.", "\">500\" means more than 500. \"<10\" means fewer than 10."],
          good: [{ text: "=COUNTIF(D2:D8,\">500\")", note: "Deliveries worth over £500." }],
        },
        {
          heading: "It keeps up by itself",
          body: ["Change a delivery from On time to Late, and the count goes up straight away.", "That's why it beats counting by eye."],
          tip: "Spelling matters: \"Late\" won't match \"late \" with a space after it. Keep the words in a list the same every time.",
        },
      ],
      tryIt: { title: "Count the late ones", intro: "A delivery log. Count the late ones, then the big ones.", Lab: CountIfLab },
      check: [
        {
          q: "What does =COUNTIF(C2:C41,\"Late\") work out?",
          options: ["How many cells in C2 to C41 say Late", "The total of everything that's late", "Which row is late first"],
          answer: 0,
          reasons: ["It counts the matches.", "That would be SUMIF.", "COUNTIF counts, it doesn't find rows."],
        },
        {
          q: "How do you count deliveries worth more than £500?",
          options: ["=COUNTIF(D2:D8,\">500\")", "=COUNT(D2:D8)>500", "=SUM(D2:D8,500)"],
          answer: 0,
          reasons: ["The comparison goes in quote marks.", "That doesn't count anything.", "That adds 500 to the total."],
        },
        {
          q: "Why might COUNTIF miss a late delivery?",
          options: ["It was typed as \"late \" with a space", "COUNTIF only counts up to 10", "Late deliveries are in red"],
          answer: 0,
          reasons: ["A stray space makes it a different word.", "There's no limit like that.", "Colour doesn't matter to COUNTIF."],
        },
      ],
      takeaways: ["COUNTIF(where, what) counts matches.", "Use \">500\" to count by a number.", "Keep words in a list the same every time."],
    },
    {
      id: "m6t5",
      title: "Copying a formula down",
      minutes: 7,
      brief: "Lists are long. In this lesson you will write a formula once and copy it down the whole list, with every row working out its own answer.",
      learn: [
        {
          heading: "One formula on every row",
          body: [
            "Every total in column E (9) is a formula. Select E3 (10) and the formula bar (4) shows =C3*D3: the same sum as E2, but using row 3's numbers.",
            "You only write it once. Copying it down moves the row numbers for you.",
          ],
          figure: <SheetFigure grid={ORDERS_SUM} file="Orders.xlsx" tabs={["Orders"]} activeTab={0} widths={[90, 140, 60, 100, 100]} cell={[2, 4]} row={2} column={4} focus={["formulabar", "cell", "column"]} title="The same formula, row by row" what={{ formulabar: "=C3*D3: row 3's quantity times row 3's price.", cell: "E3 shows £108.00.", column: "E2 is =C2*D2, E3 is =C3*D3, E4 is =C4*D4." }} />,
        },
        {
          heading: "Write it once, copy it down",
          body: ["Write the formula in the first row. Then copy it down to every row below.", "In real Excel you double-click the small square at the corner of the cell. Here, press ⇩ Fill down."],
        },
        {
          heading: "The row numbers move for you",
          figure: <SheetFigure grid={ORDERS_SUM} file="Orders.xlsx" tabs={["Orders"]} activeTab={0} widths={[90, 140, 60, 100, 100]} cell={[3, 4]} row={3} column={4} focus={["formulabar", "cell"]} title="Copied down to row 4" what={{ formulabar: "=C4*D4: the formula from E2, copied down, now uses row 4.", cell: "E4 shows £284.00." }} />,
          body: ["=C2*D2 in row 2 becomes =C3*D3 in row 3, =C4*D4 in row 4, and so on.", "Each row works out its own total, without you typing anything."],
          good: [{ text: "E2: =C2*D2 · E3: =C3*D3 · E9: =C9*D9" }],
        },
        {
          heading: "Check the last row",
          body: ["After copying, click the last cell and read the formula bar. It should use that row's numbers.", "If it doesn't, the first formula probably had a mistake."],
          tip: "Formulas mean a manager can change one number and trust every total.",
        },
      ],
      tryIt: { title: "Total the whole list", intro: "One formula in E2. Copy it down to every order.", Lab: FillLab },
      check: [
        {
          q: "You copy =C2*D2 from row 2 down to row 5. What does row 5 say?",
          options: ["=C5*D5", "=C2*D2", "=C2*D5"],
          answer: 0,
          reasons: ["The row numbers move with it.", "That's what you'd get if it didn't move: every row would show row 2's total.", "Both references move, not one."],
        },
        {
          q: "Why copy a formula instead of typing each one?",
          options: ["It's quicker and avoids typos", "Typed formulas don't work", "Excel won't let you type them"],
          answer: 0,
          reasons: ["Write once, copy down, done.", "Typed ones work, just slowly.", "You can type them, it just takes longer."],
        },
        {
          q: "How do you check a copied formula is right?",
          options: ["Click the last cell and read the formula bar", "Make the column wider", "Print it out"],
          answer: 0,
          reasons: ["The formula bar shows what that cell works out.", "Width doesn't change the formula.", "No need to print. Just look."],
        },
      ],
      takeaways: ["Write it once, copy it down.", "The row numbers move for you.", "Check the last row's formula."],
    },
  ],
};

export default m6;
