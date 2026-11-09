"use client";

import { SheetLab, cell, column, dataRows, type Grid, type SheetTask } from "../learn/sheet";
import type { LabProps, ModuleManifest } from "../learn/types";

/* Module 5: Putting business data in. The second pilot module (owner
 * 2026-11-09): Excel taught with real business data, not made-up numbers.
 * The learner types into a pretend Excel sheet (learn/sheet.tsx) and
 * presses "Check my sheet".
 *
 * House copy rules: UK English, plain words, no em-dashes, quiz options
 * of similar length so the right answer is never the obvious longest. */

const HEAD = ["Date", "Supplier", "Order no", "Pallets"];
const headerLocked = (r: number) => r === 0;

/* Find the data row holding an order number, wherever sorting put it. */
const rowFor = (g: Grid, order: string) => dataRows(g).find((row) => (row[2] ?? "").trim() === order);

/* ---------- Lesson 1: one row for one thing ---------- */

const PALLETS: Record<string, string> = { "4417": "10", "4420": "4", "4425": "7" };

function OneRowLab(p: LabProps) {
  return (
    <SheetLab
      {...p}
      tasks={[
        {
          scenario: "Three deliveries came in today. Type each one into the delivery log: one delivery on each row, each detail under the right heading. Click a cell to type in it. Enter moves you down, Tab moves you right.",
          file: "Deliveries.xlsx",
          cols: 4,
          rows: 6,
          initial: [HEAD],
          locked: headerLocked,
          paper: {
            title: "Today's deliveries",
            lines: ["Date: 10/11/2026", "Brightline Supplies, order 4417, 10 pallets", "Fenwick Packaging, order 4420, 4 pallets", "Ashby Foods, order 4425, 7 pallets"],
          },
          rules: [
            { label: "Three deliveries, one row each", test: (g) => dataRows(g).length === 3, hint: "Use three rows under the headings: one delivery on each." },
            { label: "Every row is filled in", test: (g) => dataRows(g).every((row) => row.slice(0, 4).every((x) => x.trim() !== "")), hint: "Each row needs a date, a supplier, an order number and the pallets." },
            { label: "Each order number is in the Order no column", test: (g) => ["4417", "4420", "4425"].every((o) => column(g, 2).includes(o)), hint: "Put 4417, 4420 and 4425 in column C, under Order no." },
            { label: "Each delivery has the right pallets", test: (g) => Object.entries(PALLETS).every(([o, n]) => (rowFor(g, o)?.[3] ?? "").trim() === n), hint: "Just the number in column D: 10, 4 and 7, on the same row as their order." },
            { label: "The date is on every row", test: (g) => column(g, 0).every((d) => /10/.test(d)), hint: "Every delivery arrived on 10/11/2026: put the date on each row." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 2: headings ---------- */

function HeadingsLab(p: LabProps) {
  const task: SheetTask = {
    scenario: "This shift log has no headings, so nobody can tell what the columns mean. Type a short heading at the top of each column, in row 1.",
    file: "Shift log.xlsx",
    cols: 4,
    rows: 6,
    initial: [
      ["", "", "", ""],
      ["10/11/2026", "Priya Shah", "Early", "8"],
      ["10/11/2026", "Sam Okafor", "Late", "7.5"],
      ["11/11/2026", "Dave Morris", "Early", "8"],
      ["11/11/2026", "Priya Shah", "Night", "10"],
    ],
    locked: (r) => r > 0,
    rules: [
      { label: "Every column has a heading", test: (g) => [0, 1, 2, 3].every((c) => cell(g, 0, c) !== ""), hint: "Type a heading in A1, B1, C1 and D1." },
      { label: "Column A says it is a date", test: (g) => /date|day/i.test(cell(g, 0, 0)), hint: "Column A holds dates, so call it Date." },
      { label: "Column B says who", test: (g) => /name|staff|employee|who|person|worker|colleague/i.test(cell(g, 0, 1)), hint: "Column B holds people, so call it Name or Staff." },
      { label: "Column C says which shift", test: (g) => /shift/i.test(cell(g, 0, 2)), hint: "Column C says early, late or night, so call it Shift." },
      { label: "Column D says hours", test: (g) => /hour|hrs/i.test(cell(g, 0, 3)), hint: "Column D holds hours worked, so call it Hours." },
      { label: "Headings are short", test: (g) => [0, 1, 2, 3].every((c) => cell(g, 0, c).split(/\s+/).filter(Boolean).length <= 3), hint: "Keep each heading to one to three words." },
    ],
  };
  return <SheetLab {...p} tasks={[task]} />;
}

/* ---------- Lesson 3: dates and numbers ---------- */

function TidyLab(p: LabProps) {
  return (
    <SheetLab
      {...p}
      tasks={[
        {
          scenario: "The dates are typed four different ways, and some quantities have words in them. That stops the sheet sorting and adding up. Make every date look like 03/11/2026, and leave only the number in Qty.",
          file: "Stock orders.xlsx",
          cols: 3,
          rows: 6,
          initial: [
            ["Date", "Item", "Qty (boxes)"],
            ["3/11/2026", "Pallet labels", "12 boxes"],
            ["4th Nov 2026", "Stretch wrap", "8"],
            ["05/11/2026", "Safety boots", "twenty"],
            ["Nov 6 2026", "Hi-vis vests", "15"],
          ],
          locked: (r, c) => r === 0 || c === 1,
          rules: [
            { label: "Every date is written the same way", test: (g) => column(g, 0).every((d) => /^\d{2}\/\d{2}\/\d{4}$/.test(d)), hint: "Two digits for the day, two for the month, four for the year: 03/11/2026." },
            { label: "The dates are right", test: (g) => column(g, 0).join() === "03/11/2026,04/11/2026,05/11/2026,06/11/2026", hint: "The orders were on the 3rd, 4th, 5th and 6th of November 2026." },
            { label: "Qty is just a number", test: (g) => column(g, 2).every((q) => /^\d+$/.test(q)), hint: "Take the words out. The heading already says the number is boxes." },
            { label: "The quantities are right", test: (g) => column(g, 2).join() === "12,8,20,15", hint: "\"12 boxes\" becomes 12, and \"twenty\" becomes 20." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 4: sort and filter ---------- */

const DELIVERIES: Grid = [
  HEAD,
  ["10/11/2026", "Fenwick Packaging", "4420", "4"],
  ["10/11/2026", "Brightline Supplies", "4417", "10"],
  ["11/11/2026", "Ashby Foods", "4431", "6"],
  ["11/11/2026", "Brightline Supplies", "4433", "12"],
  ["12/11/2026", "Corran Tools", "4440", "2"],
  ["12/11/2026", "Ashby Foods", "4442", "9"],
];
const SUPPLIER_OF: Record<string, string> = Object.fromEntries(DELIVERIES.slice(1).map((r) => [r[2], r[1]]));

function SortFilterLab(p: LabProps) {
  const base = { file: "Deliveries.xlsx", cols: 4, rows: 7, initial: DELIVERIES, locked: () => true, tools: { sort: true, filter: true } };
  return (
    <SheetLab
      {...p}
      tasks={[
        {
          ...base,
          scenario: "Your manager wants the deliveries in supplier order. In \"Sort by\", choose Supplier, then press Sort A to Z.",
          rules: [
            {
              label: "Sorted by supplier, A to Z",
              test: (g) => {
                const s = column(g, 1);
                return s.every((x, i) => i === 0 || s[i - 1].localeCompare(x, "en-GB") <= 0);
              },
              hint: "Choose Supplier in \"Sort by\", then press Sort A to Z.",
            },
            { label: "Every row stayed together", test: (g) => dataRows(g).every((row) => SUPPLIER_OF[row[2]] === row[1]), hint: "Sorting moves whole rows, so each order keeps its own supplier." },
          ],
        },
        {
          ...base,
          scenario: "Now she only wants to see Brightline Supplies. In \"Filter\", choose Supplier, then choose Only Brightline Supplies.",
          rules: [
            { label: "Only Brightline Supplies showing", test: (_g, v) => v.filter?.col === 1 && v.filter.value === "Brightline Supplies", hint: "Filter on Supplier, then pick Only Brightline Supplies." },
            { label: "Nothing was deleted", test: (g) => dataRows(g).length === 6, hint: "A filter hides rows. All six deliveries should still be in the sheet." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 5: checking your own work ---------- */

function CheckWorkLab(p: LabProps) {
  return (
    <SheetLab
      {...p}
      tasks={[
        {
          scenario: "Someone typed these deliveries in a hurry. Check every row against the delivery notes and fix the 4 mistakes. To remove a row that should not be there, clear every cell in it.",
          file: "Deliveries.xlsx",
          cols: 4,
          rows: 7,
          initial: [
            HEAD,
            ["10/11/2026", "Brightline Suplies", "4417", "10"],
            ["10/11/2026", "Fenwick Packaging", "4420", "40"],
            ["", "Ashby Foods", "4425", "7"],
            ["11/11/2026", "Ashby Foods", "4431", "6"],
            ["11/11/2026", "Ashby Foods", "4431", "6"],
          ],
          locked: headerLocked,
          paper: {
            title: "Delivery notes",
            lines: ["4417  Brightline Supplies  10 pallets  10/11/2026", "4420  Fenwick Packaging  4 pallets  10/11/2026", "4425  Ashby Foods  7 pallets  10/11/2026", "4431  Ashby Foods  6 pallets  11/11/2026"],
          },
          rules: [
            { label: "Supplier names spelled right", test: (g) => (rowFor(g, "4417")?.[1] ?? "").trim() === "Brightline Supplies", hint: "Look closely at the supplier for order 4417." },
            { label: "Pallet numbers match the notes", test: (g) => (rowFor(g, "4420")?.[3] ?? "").trim() === "4", hint: "One of the pallet counts has an extra zero." },
            { label: "No missing dates", test: (g) => column(g, 0).every((d) => d !== "") && (rowFor(g, "4425")?.[0] ?? "").trim() === "10/11/2026", hint: "One row has no date. The delivery notes say when it came." },
            { label: "No delivery typed twice", test: (g) => column(g, 2).length === 4 && new Set(column(g, 2)).size === 4, hint: "One delivery is in the sheet twice. Clear every cell of the extra row." },
          ],
        },
      ]}
    />
  );
}

const m5: ModuleManifest = {
  id: "m5",
  number: 5,
  title: "Putting business data in",
  intro: "Every office keeps lists in spreadsheets: deliveries, shifts, orders, stock. In five short lessons you will learn to put data in neatly, so other people can trust it, sort it and find what they need. You will practise in a pretend Excel sheet.",
  outcomes: [
    "Put one thing on each row and each detail in its own column",
    "Give every column a clear heading",
    "Type dates and numbers the same way every time",
    "Sort a list and filter it to show only what you need",
    "Check your own work against the paperwork",
  ],
  topics: [
    {
      id: "m5t1",
      title: "One row for one thing",
      minutes: 9,
      brief: "A spreadsheet is a list, and the way you lay it out matters. In this lesson you will learn the one rule that makes every spreadsheet work: one thing on each row.",
      learn: [
        {
          heading: "A spreadsheet is a list",
          body: [
            "A spreadsheet is a grid of boxes. Each box is a cell. The rows go across and have numbers. The columns go down and have letters.",
            "You have probably filled in lists like this on paper: a stock count sheet, a delivery log, a sign-in sheet. A spreadsheet is the same thing on a computer.",
          ],
          tip: "A cell is named by its column letter and row number. B4 is column B, row 4.",
        },
        {
          heading: "One row for one thing",
          body: ["Each row holds one thing: one delivery, one person, one order. Everything about that thing goes on its row, from left to right."],
          good: [{ text: "10/11/2026 | Brightline Supplies | 4417 | 10" }],
          bad: [{ text: "10/11/2026 | Brightline and Fenwick | 4417, 4420 | 14", note: "Two deliveries squashed into one row." }],
        },
        {
          heading: "One column for one kind of detail",
          body: [
            "Each column holds one kind of detail, the same all the way down: all the dates in one column, all the suppliers in the next.",
            "Then the sheet can sort, filter and add up for you. Mix them and it cannot.",
          ],
          bad: [{ text: "Brightline, 10 pallets, arrived late", note: "Three details in one cell. Give each its own column." }],
        },
        {
          heading: "No gaps, no notes in odd places",
          body: ["Start your list at the top left, in A1, with no empty rows in the middle. Keep notes out of random cells: if you need them, add a Notes column."],
          tip: "Imagine handing the sheet to someone who has never seen it. Could they read every row without asking you?",
        },
      ],
      tryIt: {
        title: "Log today's deliveries",
        intro: "Copy the deliveries from the paperwork into the sheet. One delivery on each row, then press Check my sheet.",
        Lab: OneRowLab,
      },
      check: [
        {
          q: "Two deliveries arrive from different suppliers. How many rows do they take?",
          options: ["One row, with both in it", "Two rows, one for each", "None: put them in a note"],
          answer: 1,
          reasons: [
            "Squashing two into one row means the sheet cannot sort or count them.",
            "One thing on each row, so each delivery has its own.",
            "A note cannot be sorted, filtered or added up.",
          ],
        },
        {
          q: "What is cell C3?",
          options: ["Row C, column 3", "The third sheet", "Column C, row 3"],
          answer: 2,
          reasons: [
            "Rows have numbers and columns have letters, so this is the wrong way round.",
            "Sheets have their own tabs and names at the bottom.",
            "The letter is the column, the number is the row.",
          ],
        },
        {
          q: "Where should all the dates go?",
          options: ["In one column, all the way down", "Wherever there is a gap", "In the first row, across"],
          answer: 0,
          reasons: [
            "One kind of detail per column lets the sheet sort by date.",
            "Scattered dates cannot be sorted or found.",
            "The first row is for headings, and each row is one thing.",
          ],
        },
      ],
      takeaways: ["One thing on each row.", "One kind of detail in each column.", "Start in A1, with no gaps and no stray notes."],
    },
    {
      id: "m5t2",
      title: "Headings that make sense",
      minutes: 7,
      brief: "Headings tell everyone what each column means. In this lesson you will learn to write short, clear headings, so anyone can read your sheet.",
      learn: [
        {
          heading: "Row 1 is for headings",
          body: ["The first row of a list holds a heading for each column. It says what is in that column, all the way down."],
          good: [{ text: "Date | Supplier | Order no | Pallets" }],
          bad: [{ text: "(no headings at all)", note: "Is 4417 an order, a phone extension or a price?" }],
        },
        {
          heading: "Short and clear",
          body: ["One to three words is plenty. Use the word your workplace uses, so everyone knows what it means."],
          good: [{ text: "Order no" }, { text: "Hours" }],
          bad: [{ text: "The number of the order that the supplier gave us" }],
        },
        {
          heading: "Put the unit in the heading",
          body: ["If a column holds amounts, say what they are counted in. Then the cells only need the number."],
          good: [{ text: "Qty (boxes)", note: "The cells below just say 12, 8, 20." }, { text: "Cost (£)" }],
        },
        {
          heading: "Keep the headings in view",
          body: ["On a long list, the headings scroll off the top. In Excel, View, then Freeze Panes, then Freeze Top Row keeps them in place while you scroll."],
          tip: "Make the heading row bold so it stands out from the data.",
        },
      ],
      tryIt: {
        title: "Add the missing headings",
        intro: "The shift log below has no headings. Type one at the top of each column, in row 1, then press Check my sheet.",
        Lab: HeadingsLab,
      },
      check: [
        {
          q: "Which heading is best for a column of hours worked?",
          options: ["Hours", "The hours that each person worked", "H"],
          answer: 0,
          reasons: ["Short, clear and says exactly what is in the column.", "Clear, but far too long for a heading.", "Too short: nobody will know what H means."],
        },
        {
          q: "A column holds the number of boxes ordered. What goes in the cells?",
          options: ["\"12 boxes\", \"8 boxes\"", "Just the numbers: 12, 8", "\"twelve\", \"eight\""],
          answer: 1,
          reasons: ["Words in the cell stop the sheet adding them up. Put \"boxes\" in the heading.", "Numbers only, with the unit in the heading, so it can add up.", "Numbers written as words cannot be added up."],
        },
        {
          q: "Which row should the headings go in?",
          options: ["The last row", "Row 1, at the top", "Any row you like"],
          answer: 1,
          reasons: ["People read from the top, so headings at the bottom get missed.", "The top row, so they sit above every column.", "Headings in the middle of a list confuse the sort and filter tools."],
        },
      ],
      takeaways: ["Row 1 holds a short heading for every column.", "Use the words your workplace uses.", "Put the unit in the heading, like Qty (boxes)."],
    },
    {
      id: "m5t3",
      title: "Dates and numbers done the same way",
      minutes: 8,
      brief: "A spreadsheet can only sort and add up what it understands. In this lesson you will learn to type dates and numbers so the sheet can use them.",
      learn: [
        {
          heading: "Dates: one way, every time",
          body: ["In the UK we write the day first, then the month, then the year. Use the same layout on every row."],
          good: [{ text: "03/11/2026" }],
          bad: [{ text: "3rd Nov" }, { text: "Nov 3 2026" }, { text: "11/03/26", note: "Month first is the American way, and it reads as 11 March here." }],
        },
        {
          heading: "Numbers: just the number",
          body: ["Type numbers as digits, with no words in the cell. Then the sheet can add them up, find the biggest and sort them."],
          good: [{ text: "12" }, { text: "20" }],
          bad: [{ text: "12 boxes" }, { text: "twenty" }, { text: "about 15" }],
        },
        {
          heading: "Money and phone numbers",
          body: [
            "For money, type the amount, like 24.50, and let the column format add the £ sign. Put (£) in the heading.",
            "Phone numbers are the exception: Excel drops the first 0. Type an apostrophe first, like '01632 960 418, to keep it.",
          ],
        },
        {
          heading: "Why it matters",
          body: ["If one date is typed differently, sorting by date puts it in the wrong place. If one quantity has a word in it, the total is wrong and nobody notices."],
          tip: "Tidy data is not fussiness. It is what lets other people trust your numbers.",
        },
      ],
      tryIt: {
        title: "Tidy up a messy sheet",
        intro: "Fix the dates and quantities so every row is typed the same way, then press Check my sheet.",
        Lab: TidyLab,
      },
      check: [
        {
          q: "How should 5 November 2026 be typed in a UK sheet?",
          options: ["11/05/2026", "5th of Nov", "05/11/2026"],
          answer: 2,
          reasons: ["That is the American order, and it reads as 11 May here.", "Words stop the sheet sorting it with the other dates.", "Day, month, year, the same way on every row."],
        },
        {
          q: "Why should a quantity cell hold only the number?",
          options: ["So the sheet can add it up", "Because it looks tidier", "So it fits in the cell"],
          answer: 0,
          reasons: ["A word in the cell stops the sheet adding it up.", "It does look tidier, but the real reason is the maths.", "Cells can be widened. The problem is the sheet cannot count words."],
        },
        {
          q: "Where should \"boxes\" go if a column counts boxes?",
          options: ["In every cell, after the number", "In the heading: Qty (boxes)", "Nowhere: leave it out"],
          answer: 1,
          reasons: ["Then every cell holds words, and nothing adds up.", "Say it once in the heading, so cells hold just numbers.", "People need to know what the numbers count."],
        },
      ],
      takeaways: ["Dates the UK way, the same on every row: 03/11/2026.", "Numbers as digits only, with no words in the cell.", "Put units like boxes or £ in the heading."],
    },
    {
      id: "m5t4",
      title: "Sort and filter",
      minutes: 9,
      brief: "Once your data is tidy, the sheet can do the hard work. In this lesson you will sort a list into order and filter it to show only what you need.",
      learn: [
        {
          heading: "Sort puts the list in order",
          body: [
            "Sort arranges the rows by one column: A to Z for words, smallest to largest for numbers, oldest to newest for dates.",
            "The whole row moves together, so every detail stays with its delivery.",
          ],
          tip: "In Excel, click in the column, then Data, then Sort A to Z.",
        },
        {
          heading: "Filter shows only what you need",
          body: ["Filter hides the rows you do not need right now. Show only one supplier, one date or one person."],
          good: [{ text: "Only Brightline Supplies", note: "The other rows are hidden, not deleted." }],
        },
        {
          heading: "Hidden is not deleted",
          body: ["Filtered rows are still in the sheet, just out of sight. When you have finished, clear the filter so the next person sees everything."],
          tip: "If a list looks shorter than it should, check for a filter. Excel shows a funnel on filtered columns.",
        },
        {
          heading: "Tidy data first",
          body: ["Sort and filter only work well on tidy data. A date typed a different way sorts in the wrong place, and a misspelt supplier name gets left out of the filter."],
        },
      ],
      tryIt: {
        title: "Sort it, then filter it",
        intro: "Use the Sort and Filter tools at the top of the sheet, then press Check my sheet.",
        Lab: SortFilterLab,
      },
      check: [
        {
          q: "You sort a delivery list by Supplier. What happens to each row?",
          options: ["Only the supplier names move", "The whole row moves together", "The rows are deleted and retyped"],
          answer: 1,
          reasons: ["Then the suppliers would end up next to the wrong orders.", "Every detail stays with its delivery.", "Nothing is deleted. The rows are just reordered."],
        },
        {
          q: "You filter to show one supplier. What happens to the other rows?",
          options: ["They are deleted", "They move to a new sheet", "They are hidden, not deleted"],
          answer: 2,
          reasons: ["A filter never deletes anything.", "They stay in the same sheet, just out of sight.", "They come back when you clear the filter."],
        },
        {
          q: "A filter on Supplier misses one Brightline delivery. Why?",
          options: ["The name is spelled differently", "Filters only show 5 rows", "The sheet is too long"],
          answer: 0,
          reasons: ["\"Brightline Suplies\" counts as a different supplier.", "Filters show every matching row, however many.", "Length does not matter to a filter."],
        },
      ],
      takeaways: ["Sort moves whole rows into order.", "Filter hides rows without deleting them.", "Clear the filter when you have finished."],
    },
    {
      id: "m5t5",
      title: "Checking your own work",
      minutes: 9,
      brief: "Everyone makes typing mistakes. In this lesson you will learn the quick checks that catch them before anyone else does.",
      learn: [
        {
          heading: "The four usual mistakes",
          body: ["Most spreadsheet mistakes are one of four kinds. Once you know them, you will spot them fast."],
          bad: [
            { text: "Brightline Suplies", note: "A spelling mistake" },
            { text: "40 instead of 4", note: "An extra zero, or a missing one" },
            { text: "An empty cell", note: "Something left out" },
            { text: "The same delivery twice", note: "Typed in twice" },
          ],
        },
        {
          heading: "Check against the paperwork",
          body: ["Go down the paperwork one line at a time and find the same row in the sheet. Read across the whole row, not just the first cell."],
          tip: "Put a ruler or a sheet of paper under the line you are checking, so you do not skip one.",
        },
        {
          heading: "Count the rows",
          body: ["If there are 4 delivery notes, there should be 4 rows. One extra row usually means something was typed twice. One fewer means something was missed."],
        },
        {
          heading: "Own your mistakes",
          body: ["If you find a mistake after you have shared the sheet, fix it and tell the people who use it. A quick \"I have corrected row 3\" saves a lot of trouble later."],
        },
      ],
      tryIt: {
        title: "Find and fix 4 mistakes",
        intro: "Check the sheet against the delivery notes, fix the mistakes, then press Check my sheet.",
        Lab: CheckWorkLab,
      },
      check: [
        {
          q: "There are 4 delivery notes but 5 rows in the sheet. What is most likely?",
          options: ["One delivery was typed twice", "The paperwork is wrong", "Excel added a row by itself"],
          answer: 0,
          reasons: ["An extra row usually means a delivery was typed in twice.", "Possible, but check the sheet first: duplicates are far more common.", "Excel does not add rows on its own."],
        },
        {
          q: "What is the best way to check a sheet against paperwork?",
          options: ["Look at it all at once", "Check the totals only", "Go line by line, across each row"],
          answer: 2,
          reasons: ["Glancing at the whole sheet makes it easy to miss one cell.", "A total can look right even when two rows are wrong.", "Line by line, reading the whole row, catches the most."],
        },
        {
          q: "You spot a mistake after sending the sheet to your manager. What now?",
          options: ["Say nothing and hope", "Fix it and tell her", "Delete the sheet"],
          answer: 1,
          reasons: ["She may use the wrong number, which causes bigger problems.", "Fixing it and saying so keeps everyone's trust.", "Deleting it loses everyone's work and fixes nothing."],
        },
      ],
      takeaways: ["Look for spelling, extra zeros, empty cells and duplicates.", "Check line by line against the paperwork, across each row.", "Count the rows: they should match the paperwork."],
    },
  ],
};

export default m5;
