"use client";

import { ExcelLab, sheetOf } from "../learn/excelLab";
import { ChoiceLab, ComposeLab, type Draft } from "../learn/labs";
import type { LabProps, ModuleManifest } from "../learn/types";
import type { Grid } from "../office/types";

/* Module 7: What the numbers mean (criteria XL-8, XL-9, OL-4). Spotting
 * data that looks wrong, colour that points things out, one simple chart,
 * answering the question, and sending the answer in an email. The
 * practice runs in the office's own Excel (ExcelLab), with highlight
 * rules and a bar chart; two office jobs follow on the module page.
 *
 * House copy rules: UK English, plain words, short sentences, no
 * em-dashes. Quiz options are kept to similar lengths so the right answer
 * is never the obvious longest one. */

const cell = (g: Grid, r: number, c: number) => (g[r]?.[c] ?? "").trim();

/* ---------- Lesson 1: spotting data that looks wrong ---------- */

const MESSY = sheetOf(
  [
    ["Order no", "Date", "Customer", "Qty"],
    ["4401", "28/09/2026", "Harlow Foods", "12"],
    ["4402", "29/09/2026", "Bright Cafe", "6"],
    ["4403", "29/09/2026", "Kent Bakery", "200"],
    ["4404", "31/09/2026", "Oak Street Deli", "10"],
    ["4404", "31/09/2026", "Oak Street Deli", "10"],
    ["4405", "30/09/2026", "Mill Lane Pub", "24"],
  ],
  4,
  10,
);

function WrongLab(p: LabProps) {
  return (
    <ExcelLab
      {...p}
      tasks={[
        {
          scenario: "Three things in this order log can't be right. Check it against the order forms, which say: 4403 was 20 sacks, and 4404 came in on 30/09/2026, once. Fix the quantity and the date, and clear the copy of 4404 (click each of its cells and press Delete).",
          file: "September orders.xlsx",
          grid: MESSY,
          widths: [100, 120, 160, 70],
          rules: [
            { label: "4403's quantity is 20", test: (g) => cell(g, 3, 3) === "20", hint: "200 sacks of flour for one bakery? The form says 20. Fix D4." },
            { label: "4404's date is a real date: 30/09/2026", test: (g) => g.slice(1).every((r) => !/31\/09/.test(r[1] ?? "")) && g.some((r) => r[0] === "4404" && r[1] === "30/09/2026"), hint: "September only has 30 days. Change 31/09/2026 to 30/09/2026." },
            { label: "4404 is in the log once", test: (g) => g.filter((r) => (r[0] ?? "").trim() === "4404").length === 1, hint: "Row 6 is the same order again. Clear its cells, so 4404 is only counted once." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 2: colour that points things out ---------- */

const DELIVERIES = sheetOf(
  [
    ["Delivery note", "Supplier", "Status", "Value"],
    ["DN-77790", "Harlow Packaging", "On time", "£384.00"],
    ["DN-40877", "Kent Flour Mills", "Late", "£568.00"],
    ["DN-11618", "Brightwater Cups", "On time", "£270.00"],
    ["DN-77801", "Harlow Packaging", "Late", "£96.00"],
    ["DN-40890", "Kent Flour Mills", "On time", "£568.00"],
    ["DN-11622", "Brightwater Cups", "Late", "£612.00"],
  ],
  4,
  10,
);

function HighlightLab(p: LabProps) {
  return (
    <ExcelLab
      {...p}
      tasks={[
        {
          scenario: "Priya wants every delivery worth over £500 to stand out. Click any cell in the Value column (D), then press 🖍 Highlight ▾ > Greater than…, type 500 and press OK.",
          file: "Delivery log.xlsx",
          grid: DELIVERIES,
          widths: [130, 170, 100, 100],
          rules: [
            { label: "Values over £500 are highlighted", test: (_, __, t) => (t.highlights ?? []).some((h) => h.col === 3 && h.op === ">" && Number(h.value.replace(/[£,]/g, "")) === 500), hint: "Select a cell in column D first, then Highlight ▾ > Greater than… and type 500." },
            { label: "Nothing else is highlighted", test: (_, __, t) => (t.highlights ?? []).every((h) => h.col === 3), hint: "Use Highlight ▾ > Clear highlights, then do it again on column D." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 3: one simple chart ---------- */

const WEEK = sheetOf(
  [
    ["Day", "Sales"],
    ["Monday", "£412.50"],
    ["Tuesday", "£388.00"],
    ["Wednesday", "£455.20"],
    ["Thursday", "£402.30"],
    ["Friday", "£512.00"],
  ],
  2,
  9,
);

function ChartLab(p: LabProps) {
  return (
    <ExcelLab
      {...p}
      tasks={[
        {
          scenario: "Daniel wants a picture of this week's sales for the team board. Press 📊 Chart. Put the days along the bottom and the sales up the side, give it a title that says what it shows, and press OK.",
          file: "Sales this week.xlsx",
          grid: WEEK,
          widths: [130, 120],
          rules: [
            { label: "There's a chart", test: (_, __, t) => !!t.chart, hint: "Press 📊 Chart on the ribbon." },
            { label: "Days along the bottom, sales up the side", test: (_, __, t) => t.chart?.labelCol === 0 && t.chart?.valueCol === 1, hint: "Names along the bottom: A: Day. Numbers up the side: B: Sales." },
            { label: "It has a title that says what it shows", test: (_, __, t) => (t.chart?.title ?? "").split(/\s+/).filter(Boolean).length >= 2, hint: "Press Edit on the chart and give it a title, like \"Sales this week\"." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 4: answering the question ---------- */

const SPEND = `Customer | November | October
Harlow Foods | £128.97 | £140.20
Bright Cafe | £176.40 | £150.00
Kent Bakery | £452.00 | £389.50
Oak Street Deli | £133.75 | £120.00
Mill Lane Pub | £43.20 | £51.60`;

function AnswerLab(p: LabProps) {
  return (
    <ChoiceLab
      {...p}
      steps={[
        {
          prompt: "Daniel asks: \"Who was our biggest customer in November?\" What's the answer?",
          context: SPEND,
          options: [
            { text: "Kent Bakery, with £452.00", correct: true, why: "The biggest number in the November column is Kent Bakery's." },
            { text: "Bright Cafe, because they grew", why: "They grew, but Daniel asked who spent most, not who grew." },
            { text: "Kent Bakery, with £389.50", why: "That's October's number. He asked about November." },
          ],
        },
        {
          prompt: "Daniel then asks: \"Which customers spent less than in October?\"",
          context: SPEND,
          options: [
            { text: "Harlow Foods and Mill Lane Pub", correct: true, why: "Both have a smaller November number than October." },
            { text: "Only Mill Lane Pub", why: "Harlow Foods went down too: £140.20 to £128.97." },
            { text: "Everyone except Kent Bakery", why: "Bright Cafe and Oak Street Deli went up. Check each row." },
          ],
        },
        {
          prompt: "Which reply answers Daniel best?",
          options: [
            { text: "Kent Bakery, £452.00 in November, up 16% on October.", correct: true, why: "The answer first, with the number and what it means." },
            { text: "I've looked at the spreadsheet and done some sums.", why: "It doesn't answer the question. Lead with the answer." },
            { text: "See attached. The figures are on the second tab.", why: "Daniel would have to work it out himself." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 5: sending the answer in an email ---------- */

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean);
const firstLine = (s: string) =>
  s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .find((l) => !/^(hi|hello|dear|good (morning|afternoon))\b/i.test(l)) ?? "";

function AnswerEmailLab(p: LabProps) {
  return (
    <ComposeLab
      {...p}
      tasks={[
        {
          scenario: "Daniel emailed: \"Which supplier was late most often in October? One line is fine.\" Your COUNTIF shows Harlow Packaging was late 4 times, more than anyone else. Reply to him: a greeting, the answer in the first line with the number, and a sign-off.",
          to: "daniel.okafor@northfieldsupplies.example",
          write: ["body"],
          prefill: { subject: "Re: Late suppliers in October" },
          rules: [
            { label: "Starts with a greeting", test: (d: Draft) => /^\s*(hi|hello|dear|good (morning|afternoon))\b/i.test(d.body), hint: "Start with \"Hi Daniel,\" on its own line." },
            { label: "The first line gives the answer", test: (d) => /harlow/i.test(firstLine(d.body)), hint: "Put the answer straight after the greeting: Harlow Packaging." },
            { label: "It gives the number", test: (d) => /\b(4|four)\b/i.test(d.body), hint: "Say how many times: 4." },
            { label: "Short, like he asked", test: (d) => words(d.body).length <= 60, hint: "Daniel said one line is fine. Keep it under about 60 words." },
            { label: "Signs off", test: (d) => /(thanks|regards|best|cheers)[^\n]*\n*\s*\S*/i.test(d.body), hint: "End with \"Thanks,\" and your name." },
          ],
        },
      ]}
    />
  );
}

const m7: ModuleManifest = {
  id: "m7",
  number: 7,
  title: "What the numbers mean",
  intro: "A spreadsheet is only useful if someone can act on it. In five short lessons you will spot numbers that can't be right, make the important ones stand out, draw one clear chart, and answer a manager's question in a single line. Then you will do it for real in the pretend office.",
  outcomes: [
    "Spot data that looks wrong, and check it against the source",
    "Make the numbers that matter stand out with colour",
    "Make one clear chart with a title",
    "Answer the question that was actually asked",
    "Send the answer in an email, first line first",
  ],
  topics: [
    {
      id: "m7t1",
      title: "Spotting data that looks wrong",
      minutes: 8,
      brief: "Spreadsheets are only as good as what's typed into them. In this lesson you will learn the classic slips to look for, and how to check them.",
      learn: [
        {
          heading: "Too big, too small, or impossible",
          body: ["Look for numbers far bigger or smaller than the ones around them: 200 sacks when every other order is 20.", "Look for dates that can't exist, like 31 September."],
          bad: [{ text: "Qty 200", note: "Every other flour order is about 20." }, { text: "31/09/2026", note: "September has 30 days." }],
        },
        {
          heading: "Twice is wrong too",
          body: ["The same order on two rows gets counted twice, and every total that uses it is too high.", "Sort by order number to bring copies together, then remove the extra one."],
        },
        {
          heading: "Check it against the source",
          body: ["Don't guess the right number. Check the order form, the invoice or the delivery note.", "If you can't check it, flag it to the person who owns the sheet."],
          tip: "A number that looks wrong is worth a minute. A wrong total can cost a lot more.",
        },
      ],
      tryIt: { title: "Fix the log", intro: "Three things in a real order log can't be right. Fix them from the order forms.", Lab: WrongLab },
      check: [
        {
          q: "Every order is about 20 sacks, but one says 200. What do you do?",
          options: ["Check the order form before changing it", "Change it to 20, it's obviously wrong", "Leave it, the sheet must be right"],
          answer: 0,
          reasons: ["Check the source, then fix it.", "It probably is 20, but check first. It might really be 200.", "Sheets are only as right as what was typed in."],
        },
        {
          q: "Why does the same order on two rows matter?",
          options: ["It gets counted twice in the totals", "It makes the sheet longer", "It doesn't, Excel ignores copies"],
          answer: 0,
          reasons: ["Every total that includes it is too high.", "Length isn't the problem. Wrong totals are.", "Excel counts every row, copies and all."],
        },
        {
          q: "Which date can't be right?",
          options: ["31/09/2026", "30/09/2026", "31/10/2026"],
          answer: 0,
          reasons: ["September has 30 days.", "That's the last day of September.", "October has 31 days."],
        },
      ],
      takeaways: ["Look for too big, too small and impossible.", "A copy of a row counts twice.", "Check the source before you fix it."],
    },
    {
      id: "m7t2",
      title: "Colour that points things out",
      minutes: 7,
      brief: "Colour can make the important numbers jump out. In this lesson you will make Excel colour the cells that matter, and keep it updating by itself.",
      learn: [
        {
          heading: "Let Excel do the colouring",
          body: ["Select a cell in a column, then Highlight ▾ > Greater than…, and type a number.", "Every cell in that column over the number turns red, and it updates when the numbers change."],
          good: [{ text: "Highlight: Value greater than 500" }],
        },
        {
          heading: "One colour, one meaning",
          body: ["Use colour for one thing at a time, like \"over £500\" or \"late\".", "A sheet in five colours tells nobody anything."],
          bad: [{ text: "Red, yellow, green and blue on the same sheet, for no reason" }],
        },
        {
          heading: "Say what the colour means",
          body: ["When you send a sheet with colour, say what it shows: \"Red means over £500.\"", "Some people can't tell red from green, so never let colour be the only clue."],
          tip: "Odd values often jump out once they're coloured. That's how a typo of 1080 instead of 108 gets caught.",
        },
      ],
      tryIt: { title: "Make the big ones stand out", intro: "A delivery log. Colour everything over £500.", Lab: HighlightLab },
      check: [
        {
          q: "Why use a highlight rule rather than colouring cells by hand?",
          options: ["It updates when the numbers change", "It looks nicer", "Hand colouring isn't allowed"],
          answer: 0,
          reasons: ["Change a value and the colour follows.", "Looks aren't the point. Accuracy is.", "You can colour by hand, it just goes out of date."],
        },
        {
          q: "How many meanings should one colour have on a sheet?",
          options: ["One", "As many as you like", "At least three"],
          answer: 0,
          reasons: ["One colour, one meaning, so nobody has to guess.", "Then nobody knows what it means.", "That's three times the confusion."],
        },
        {
          q: "You send a sheet with red cells. What should your email say?",
          options: ["What the red means", "Nothing, red is obvious", "Sorry about the colours"],
          answer: 0,
          reasons: ["\"Red means over £500\" saves a phone call.", "It's obvious to you, not to them.", "No need to apologise: explain."],
        },
      ],
      takeaways: ["Let a rule do the colouring.", "One colour, one meaning.", "Say what the colour means."],
    },
    {
      id: "m7t3",
      title: "One simple chart",
      minutes: 8,
      brief: "Some answers are easier to see than to read. In this lesson you will make one clear bar chart, with a title that says what it shows.",
      learn: [
        {
          heading: "A bar chart compares things",
          body: ["Use a bar chart to compare a few things: sales by day, spend by customer.", "Names go along the bottom, numbers go up the side."],
        },
        {
          heading: "The title says what it shows",
          body: ["\"Chart 1\" tells nobody anything. Say what the chart shows, and when.", "Excel uses your headings to label the axes, so good headings matter."],
          good: [{ text: "Sales this week" }, { text: "Spend by customer, November 2026" }],
          bad: [{ text: "Chart 1" }, { text: "Data" }],
        },
        {
          heading: "Keep it simple",
          body: ["One chart, one point. If it needs a long explanation, it's the wrong chart.", "Don't add 3D, shadows or lots of colours. They make it harder to read."],
        },
      ],
      tryIt: { title: "Chart the week", intro: "Five days of sales. Turn them into a bar chart with a proper title.", Lab: ChartLab },
      check: [
        {
          q: "What's a bar chart good for?",
          options: ["Comparing a few things side by side", "Showing every number in a sheet", "Making a sheet look busy"],
          answer: 0,
          reasons: ["Bars make the biggest and smallest obvious at a glance.", "A table does that better.", "Charts are for clarity, not decoration."],
        },
        {
          q: "Which is the best chart title?",
          options: ["Spend by customer, November 2026", "Chart 1", "Numbers"],
          answer: 0,
          reasons: ["It says what and when.", "It says nothing.", "Which numbers?"],
        },
        {
          q: "Where do the names go on a bar chart?",
          options: ["Along the bottom", "Up the side", "In the title"],
          answer: 0,
          reasons: ["Names along the bottom, numbers up the side.", "The side is for the numbers.", "The title says what the whole chart shows."],
        },
      ],
      takeaways: ["Bar charts compare things.", "The title says what and when.", "One chart, one point, no 3D."],
    },
    {
      id: "m7t4",
      title: "Answering the question",
      minutes: 7,
      brief: "Managers ask questions, not for spreadsheets. In this lesson you will learn to read what's really being asked and find exactly that.",
      learn: [
        {
          heading: "Read the question twice",
          body: ["\"Who spent most?\" and \"Who grew most?\" sound alike but have different answers.", "Underline the important word: most, least, November, late."],
        },
        {
          heading: "Check you've got the right column",
          body: ["Questions are easy to answer from the wrong month or the wrong column.", "Before you reply, check the heading of the column your answer came from."],
          bad: [{ text: "Kent Bakery, £389.50", note: "That's October. He asked about November." }],
        },
        {
          heading: "Answer first, explain after",
          body: ["Start with the answer, with its number. Add one line of what it means if it helps.", "Leave out how you did it unless they ask."],
          good: [{ text: "Kent Bakery, £452.00 in November, up 16% on October." }],
        },
      ],
      tryIt: { title: "Answer Daniel", intro: "A customer spend table and three of Daniel's questions.", Lab: AnswerLab },
      check: [
        {
          q: "Daniel asks who spent most. Bright Cafe grew most. Who's the answer?",
          options: ["Whoever has the biggest number that month", "Bright Cafe, because they grew", "Whoever was top last month"],
          answer: 0,
          reasons: ["Spent most means the biggest amount.", "Growth is a different question.", "He asked about this month."],
        },
        {
          q: "What goes first in your reply?",
          options: ["The answer, with its number", "How you worked it out", "An apology for the wait"],
          answer: 0,
          reasons: ["Lead with what they asked for.", "Only if they ask.", "Just answer."],
        },
        {
          q: "How do you avoid answering from the wrong month?",
          options: ["Check the column heading", "Use the bigger number", "Ask a colleague every time"],
          answer: 0,
          reasons: ["The heading tells you which month it is.", "Bigger isn't always right.", "Checking the heading is quicker."],
        },
      ],
      takeaways: ["Read the question twice.", "Check the column heading.", "Answer first, with the number."],
    },
    {
      id: "m7t5",
      title: "Sending the answer in an email",
      minutes: 7,
      brief: "The work is only done when the answer reaches the person who asked. In this lesson you will write the short email that gets it there.",
      learn: [
        {
          heading: "First line first",
          body: ["Put the answer in the first line after the greeting. Busy people may read nothing else.", "Then one more line if it helps, and a sign-off."],
          good: [{ text: "Hi Daniel,\nHarlow Packaging, late 4 times in October.\nThanks," }],
        },
        {
          heading: "Give the number",
          body: ["A number is what turns \"quite a lot\" into something a manager can act on.", "Say what it's out of if that helps: 4 of their 10 deliveries."],
          bad: [{ text: "Harlow were late quite a lot." }],
        },
        {
          heading: "Link the sheet if they'll want it",
          body: ["If they might want to look, add a link to the sheet, so they see your working.", "Keep the email short either way."],
          tip: "\"One line is fine\" means one line. Respect it.",
        },
      ],
      tryIt: { title: "Reply to Daniel", intro: "Write the short reply to a manager's question, answer first.", Lab: AnswerEmailLab },
      check: [
        {
          q: "Where does the answer go in your email?",
          options: ["In the first line, after the greeting", "At the end, after the working", "In the subject only"],
          answer: 0,
          reasons: ["That's the line they're sure to read.", "They might never get that far.", "Put it in the email, so it's clear."],
        },
        {
          q: "Daniel says \"One line is fine.\" How long should your reply be?",
          options: ["A greeting, one line and a sign-off", "A full page with the working", "Just the number, no greeting"],
          answer: 0,
          reasons: ["Short, polite and complete.", "He said one line.", "Still be polite."],
        },
        {
          q: "Which is the better answer line?",
          options: ["Harlow Packaging, late 4 times in October.", "Harlow were late quite a few times.", "Please see the spreadsheet."],
          answer: 0,
          reasons: ["Who, how many, when.", "\"Quite a few\" isn't a number.", "He'd have to find the answer himself."],
        },
      ],
      takeaways: ["Answer in the first line.", "Give the number.", "Keep it as short as they asked."],
    },
  ],
};

export default m7;
