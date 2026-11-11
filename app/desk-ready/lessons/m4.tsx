"use client";

import { ChoiceLab } from "../learn/labs";
import { SheetLab, cell, type Grid } from "../learn/sheet";
import { SheetFigure } from "../learn/figures/sheet";
import type { LabProps, ModuleManifest } from "../learn/types";

/* Module 4: What a spreadsheet is (criteria XL-1, WIN-4). Rows, columns
 * and cells, cell addresses, typing in and fixing, sheets and tabs, and
 * saving. The two office jobs on the module page (Fix the stock count,
 * Start December's rota) are where it gets used for real.
 *
 * House copy rules: UK English, plain words, short sentences, no
 * em-dashes. Quiz options are kept to similar lengths so the right answer
 * is never the obvious longest one. */

const STOCK: Grid = [
  ["Item", "Boxes", "Location"],
  ["Pallet wrap", "24", "C-01"],
  ["Labels (1000)", "18", "C-02"],
  ["Paper cups 8oz", "40", "C-03"],
  ["Lids 8oz", "35", "C-04"],
  ["Napkins", "95", "C-08"],
];

/* ---------- Lesson 1: rows, columns and cells ---------- */

function RowsLab(p: LabProps) {
  return (
    <SheetLab
      {...p}
      tasks={[
        {
          scenario: "This is the stock list for aisle C. Each row is one item, and each column is one detail about it. Sarah has just counted the lids: there are 38 boxes, not 35. Find the lids row, and change its number in the Boxes column to 38.",
          file: "Stock aisle C.xlsx",
          cols: 3,
          rows: 7,
          initial: STOCK,
          locked: (r, c) => r === 0 || c !== 1,
          rules: [
            { label: "The lids now say 38", test: (g) => cell(g, 4, 1) === "38", hint: "Lids 8oz is on row 5. Its number of boxes is in column B, the Boxes column." },
            { label: "Nothing else changed", test: (g) => [1, 2, 3, 5].every((r) => cell(g, r, 1) === STOCK[r][1]), hint: "Only the lids were recounted. Put the other numbers back as they were." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 2: cell addresses ---------- */

function AddressLab(p: LabProps) {
  return (
    <SheetLab
      {...p}
      tasks={[
        {
          scenario: "Sarah's note says: \"Put 120 in B6, and type Checked in D1.\" A cell's name is its column letter, then its row number. The name of the cell you are in shows in the box above the sheet.",
          file: "Stock aisle C.xlsx",
          cols: 4,
          rows: 7,
          initial: STOCK.map((r) => [...r, ""]),
          rules: [
            { label: "B6 says 120", test: (g) => cell(g, 5, 1) === "120", hint: "Column B, row 6: that's the Napkins row, in the Boxes column." },
            { label: "D1 says Checked", test: (g) => /^checked$/i.test(cell(g, 0, 3)), hint: "Column D, row 1: the top of the empty fourth column." },
            { label: "Nothing else changed", test: (g) => cell(g, 4, 1) === "35" && cell(g, 1, 1) === "24" && cell(g, 0, 1) === "Boxes", hint: "Only change B6 and D1." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 3: typing in and fixing mistakes ---------- */

function FixLab(p: LabProps) {
  const initial: Grid = [
    ["Item", "Boxes", "Location"],
    ["Pallet wrapp", "24", "C-01"],
    ["Labels (1000)", "1888", "C-02"],
    ["Paper cups 8oz", "40", "C-3"],
  ];
  return (
    <SheetLab
      {...p}
      tasks={[
        {
          scenario: "Three typing mistakes crept in. Fix them: \"Pallet wrapp\" has an extra p, the labels should be 18 boxes, and the cups are in C-03. Click a cell and type to replace it, or press F2 to change just part of it.",
          file: "Stock aisle C.xlsx",
          cols: 3,
          rows: 5,
          initial,
          locked: (r) => r === 0,
          rules: [
            { label: "Pallet wrap is spelled right", test: (g) => cell(g, 1, 0) === "Pallet wrap", hint: "Fix A2 so it says Pallet wrap." },
            { label: "The labels say 18", test: (g) => cell(g, 2, 1) === "18", hint: "Click B3 and type 18. Typing replaces what was there." },
            { label: "The cups are in C-03", test: (g) => cell(g, 3, 2) === "C-03", hint: "C4 should say C-03, with the zero, like the others." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 4: sheets and tabs ---------- */

function TabsLab(p: LabProps) {
  return (
    <ChoiceLab
      {...p}
      steps={[
        {
          prompt: "Sarah asks you to fix a number \"on the Aisle C tab\". Where do you look?",
          options: [
            { text: "The tabs along the bottom of the workbook", correct: true, why: "Each sheet has a tab at the bottom. Click Aisle C to open that sheet." },
            { text: "The File menu at the top", why: "File is for saving and opening. Sheets are on the tabs at the bottom." },
            { text: "A different workbook called Aisle C", why: "It's the same workbook. Aisle C is one sheet inside it." },
          ],
        },
        {
          prompt: "Emma wants a new month added to the rota workbook. What do you do?",
          options: [
            { text: "Press ⊕ to add a sheet, then rename it", correct: true, why: "A new tab keeps every month in the one rota file, where everyone expects it." },
            { text: "Make a whole new rota workbook", why: "Then the rota is split across files, and people open the wrong one." },
            { text: "Type December under November's rows", why: "One month per sheet keeps each month easy to read and print." },
          ],
        },
        {
          prompt: "How do you rename a sheet from Sheet2 to December?",
          options: [
            { text: "Double-click its tab and type the name", correct: true, why: "Double-click the tab, type December, then press Enter." },
            { text: "Save the workbook as December", why: "That renames the whole file, not the sheet inside it." },
            { text: "Type December in cell A1", why: "That only changes a cell. The tab keeps its old name." },
          ],
        },
        {
          prompt: "You changed a number but you're not sure which tab you were on. What's the safest thing to do?",
          options: [
            { text: "Check the tab, and put back anything changed by mistake", correct: true, why: "Each tab is someone's list. A number in the wrong tab is a wrong number for them." },
            { text: "Save anyway, someone will notice", why: "They might not, and orders or rotas get made from the wrong number." },
            { text: "Delete the tab and start again", why: "That deletes everyone else's work on that sheet." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 5: saving your work ---------- */

function SavingLab(p: LabProps) {
  return (
    <ChoiceLab
      {...p}
      steps={[
        {
          prompt: "You've updated the team's stock sheet, which lives on SharePoint. How do you keep your changes?",
          options: [
            { text: "Press Save, so the team's file is updated", correct: true, why: "Save updates the file where it already lives. Everyone sees the new numbers." },
            { text: "Save as a copy in your Downloads", why: "Then the team's file still has the old numbers, and your copy helps no one." },
            { text: "Close it, Excel saves by itself", why: "Not always. With AutoSave off, closing without saving loses your changes." },
          ],
        },
        {
          prompt: "You opened a template to make a new report. What happens when you press Save?",
          options: [
            { text: "Excel asks where to save it and what to call it", correct: true, why: "A template opens as a new workbook, so the template stays clean for next time." },
            { text: "It saves over the template", why: "Templates open as a new file on purpose, so they never get overwritten." },
            { text: "Nothing, templates can't be saved", why: "You can save the new workbook. Save as asks for a place and a name." },
          ],
        },
        {
          prompt: "Excel asks \"Save changes before closing?\" and you meant to keep them. What do you press?",
          options: [
            { text: "Save", correct: true, why: "Save keeps your changes. Don't save throws them away." },
            { text: "Don't save", why: "That throws away everything since you last saved." },
            { text: "Cancel, then switch the computer off", why: "Your changes still aren't saved. Press Save." },
          ],
        },
        {
          prompt: "The title bar says \"Not saved\". What does it mean?",
          options: [
            { text: "You've made changes the file doesn't have yet", correct: true, why: "Press Save (or Ctrl+S) and it changes to \"Saved\"." },
            { text: "The file has been deleted", why: "It's still there. It just doesn't have your latest changes yet." },
            { text: "Someone else is using the file", why: "It's about your own changes, not other people." },
          ],
        },
      ]}
    />
  );
}

const m4: ModuleManifest = {
  id: "m4",
  number: 4,
  title: "What a spreadsheet is",
  intro: "Nearly every office keeps its lists in Excel: stock, orders, rotas, invoices. In five short lessons you will learn how a spreadsheet is laid out, find any cell by its name, type and fix data, use sheets and tabs, and save your work safely. Then you will do it for real in the pretend office.",
  outcomes: [
    "Know a row from a column, and find any cell",
    "Go straight to a cell when someone says \"B9\"",
    "Type in data and fix mistakes without breaking anything",
    "Find, add and rename sheets on their tabs",
    "Save in the right place, and never lose your changes",
  ],
  topics: [
    {
      id: "m4t1",
      title: "Rows, columns and cells",
      minutes: 7,
      brief: "A spreadsheet is a grid. In this lesson you will learn what rows, columns and cells are, and how a list of business data fits into them.",
      learn: [
        {
          heading: "Here is a whole spreadsheet",
          body: [
            "This is Excel, open on the stock list for aisle C. Every part of the screen is numbered, and the list underneath says what each one is for.",
            "Take a minute to find each number. The next screens go through the most important ones: rows, columns and cells.",
          ],
          figure: <SheetFigure />,
        },
        {
          heading: "Rows go across, columns go down",
          figure: <SheetFigure focus={["numbers", "letters", "row", "column"]} title="Rows and columns" what={{ row: "Row 6, across: everything about napkins.", column: "Column B, down: the number of boxes, for every item." }} />,
          body: ["A row runs across the screen. Rows are numbered down the left: 1, 2, 3.", "A column runs down the screen. Columns are lettered across the top: A, B, C."],
          tip: "Think of a row as one line in a list, and a column as one question asked about every line.",
        },
        {
          heading: "A cell is where they meet",
          figure: <SheetFigure focus={["cell", "namebox"]} title="A cell" what={{ cell: "B5: column B (Boxes) meets row 5 (Lids 8oz). It holds one thing: 35." }} />,
          body: ["Each box in the grid is a cell. You click a cell to select it, and type to put something in it.", "A cell holds one thing: a word, a number or a date."],
          good: [{ text: "Napkins", note: "One item in one cell." }],
          bad: [{ text: "Napkins 95 boxes C-08", note: "Three facts squashed into one cell." }],
        },
        {
          heading: "One row for each thing, one column for each detail",
          figure: <SheetFigure focus={["headings", "row"]} title="Headings, then one row per thing" />,
          body: ["In a stock list, each item gets its own row. Each detail about it, like how many boxes or where it is, gets its own column.", "Row 1 holds the headings, so everyone knows what each column means."],
          good: [{ text: "Item | Boxes | Location" }, { text: "Napkins | 95 | C-08" }],
        },
      ],
      tryIt: { title: "Update one number", intro: "Find the right row and the right column, and change one number in a real stock list.", Lab: RowsLab },
      check: [
        {
          q: "Which way does a row go?",
          options: ["Across the screen", "Down the screen", "Diagonally"],
          answer: 0,
          reasons: ["Rows run across, and are numbered down the left.", "That's a column.", "Neither rows nor columns go diagonally."],
        },
        {
          q: "In a stock list, what should one row hold?",
          options: ["Everything about one item", "One detail about every item", "The headings for each column"],
          answer: 0,
          reasons: ["One row is one thing: its name, count and location.", "That's a column.", "Only row 1 holds the headings."],
        },
        {
          q: "What goes in row 1 of a tidy list?",
          options: ["The headings for each column", "The most important item", "The date the list was made"],
          answer: 0,
          reasons: ["Headings tell everyone what each column means.", "Items start in row 2, under the headings.", "A date can go in its own column, not row 1."],
        },
      ],
      takeaways: ["Rows go across. Columns go down.", "One row per thing, one column per detail.", "Headings go in row 1."],
    },
    {
      id: "m4t2",
      title: "Cell addresses like B4",
      minutes: 7,
      brief: "Every cell has a name, like B4. In this lesson you will learn to read it and jump straight to any cell someone mentions.",
      learn: [
        {
          heading: "Every cell has a name",
          body: [
            "Here is the same stock list. The selected cell (10), with the green box, is the lids' number of boxes.",
            "Its name is in the Name Box (3): B5. The rest of this lesson shows where that name comes from.",
          ],
          figure: <SheetFigure focus={["namebox", "letters", "numbers", "cell"]} title="A cell and its name" />,
        },
        {
          heading: "Letter first, then number",
          figure: <SheetFigure focus={["letters", "numbers", "cell"]} title="Column letter, then row number" what={{ cell: "Column B, row 5, so its name is B5." }} />,
          body: ["A cell's name is its column letter, then its row number. B4 is column B, row 4.", "It's like a map grid reference, or a seat in a theatre."],
          good: [{ text: "B4", note: "Column B, row 4." }, { text: "C14", note: "Column C, row 14." }],
        },
        {
          heading: "Find it in two steps",
          figure: <SheetFigure focus={["namebox", "cell"]} title="The Name Box shows where you are" />,
          body: ["Go to the column letter along the top, then down to the row number on the left. Where they meet is the cell.", "When a cell is selected, its name shows in the box just above the sheet, called the Name Box."],
          tip: "When someone says \"have a look at B9\", it's the quickest way to point at one number among hundreds.",
        },
        {
          heading: "Why people use addresses",
          body: ["At work, people send each other cell names all the time: \"G13 is the total\", \"B9 needs updating\".", "Formulas use them too. You'll meet those in Module 6."],
          good: [{ text: "\"The total in G13 looks too high. Can you check it?\"" }],
        },
      ],
      tryIt: { title: "Go to the cell", intro: "Follow Sarah's note: put two things in exactly the cells she names.", Lab: AddressLab },
      check: [
        {
          q: "What does the cell name D7 mean?",
          options: ["Column D, row 7", "Row D, column 7", "The 7th cell in a list"],
          answer: 0,
          reasons: ["Letter is the column, number is the row.", "Rows are numbers and columns are letters.", "It's a grid reference, not a count."],
        },
        {
          q: "Where can you see the name of the cell you're in?",
          options: ["In the Name Box above the sheet", "On the tab at the bottom", "In the title bar at the top"],
          answer: 0,
          reasons: ["The Name Box shows the selected cell, like B4.", "Tabs show sheet names, not cells.", "The title bar shows the file name."],
        },
        {
          q: "A colleague says \"A1\". Where is that?",
          options: ["The top-left cell", "The bottom-right cell", "The first cell you typed in"],
          answer: 0,
          reasons: ["Column A, row 1: the very top left.", "That would have a big row number and a late letter.", "A1 is always the same cell."],
        },
      ],
      takeaways: ["Column letter, then row number.", "The Name Box shows where you are.", "A1 is the top-left cell."],
    },
    {
      id: "m4t3",
      title: "Typing in and fixing mistakes",
      minutes: 8,
      brief: "Typing into a spreadsheet works a little differently from a letter. In this lesson you will learn to type in data, move about with the keyboard, and fix mistakes cleanly.",
      learn: [
        {
          heading: "Where you type",
          body: [
            "You type into the selected cell (10). Whatever's in it also shows in the formula bar (4), where you can see the whole of it, however long.",
            "The Name Box (3) tells you which cell you're in, so you can be sure you're typing in the right place.",
          ],
          figure: <SheetFigure focus={["namebox", "formulabar", "cell"]} title="The cell you type in" />,
        },
        {
          heading: "Click and type",
          figure: <SheetFigure focus={["cell"]} title="Click a cell, then type" />,
          body: ["Click a cell and start typing. What you type replaces whatever was in the cell.", "Press Enter to finish and move down, or Tab to finish and move right."],
          tip: "Enter down, Tab across. You'll type a whole row without touching the mouse.",
        },
        {
          heading: "Change part of a cell with F2",
          figure: <SheetFigure focus={["formulabar", "cell"]} title="Editing in the formula bar" grid={[["Item", "Boxes", "Location", "Counted by"], ["Pallet wrapp", "24", "C-01", "SP"], ["Labels (1000)", "18", "C-02", "SP"]]} cell={[1, 0]} row={1} column={0} what={{ cell: "A2 has a typo: Pallet wrapp. Press F2 to change just the extra p.", formulabar: "Shows the whole of A2. You can click in here and fix it too." }} />,
          body: ["To change only part of a cell, like one letter, press F2 or double-click the cell. Now you're editing, not replacing.", "You can also click in the formula bar above the sheet and edit there."],
          good: [{ text: "\"Pallet wrapp\": press F2, delete one p, press Enter" }],
        },
        {
          heading: "Clear a cell, or undo",
          body: ["Press Delete to empty a cell.", "Typed over the wrong cell? Press Esc before Enter to cancel, or type the right value back in."],
          bad: [{ text: "Pressing the space bar to \"empty\" a cell", note: "It leaves a space in the cell that you can't see, which can upset totals and filters." }],
        },
        {
          heading: "Type numbers as numbers",
          figure: <SheetFigure focus={["headings", "column"]} title="The heading says what the numbers are" what={{ column: "Column B holds only numbers: 24, 18, 40. The heading, Boxes, says what they count." }} />,
          body: ["Type just the number: 18, not \"18 boxes\". The heading says what it counts.", "Keep codes the same way every time: C-03, not C-3."],
          good: [{ text: "18" }],
          bad: [{ text: "18 boxes" }, { text: "eighteen" }],
        },
      ],
      tryIt: { title: "Fix three mistakes", intro: "A stock list with three typing slips. Put them right.", Lab: FixLab },
      check: [
        {
          q: "You click a cell that says 95 and type 120. What happens?",
          options: ["It now says 120", "It says 95120", "Nothing, you must delete first"],
          answer: 0,
          reasons: ["Typing replaces what was in the cell.", "That only happens when you're editing with F2.", "You don't need to delete first. Just type."],
        },
        {
          q: "What does pressing Tab do after you type in a cell?",
          options: ["Finishes and moves one cell right", "Finishes and moves one cell down", "Adds a space inside the cell"],
          answer: 0,
          reasons: ["Tab moves across, ready for the next detail.", "That's Enter.", "Tab moves you on. It doesn't type a space."],
        },
        {
          q: "How should you type a count of 18 boxes?",
          options: ["Just 18", "18 boxes", "Eighteen"],
          answer: 0,
          reasons: ["Numbers on their own can be added up. The heading says what they count.", "Words in the cell stop Excel adding it up.", "Excel can't add up words."],
        },
      ],
      takeaways: ["Type to replace. F2 to change part.", "Enter goes down, Tab goes across.", "Numbers on their own; the heading says what they are."],
    },
    {
      id: "m4t4",
      title: "Sheets and tabs",
      minutes: 7,
      brief: "One workbook can hold many sheets. In this lesson you will learn to find the sheet you need, add a new one and give it a sensible name.",
      learn: [
        {
          heading: "One workbook, several sheets",
          body: [
            "Along the bottom of every workbook are its sheet tabs (11). This stock workbook has three: Aisle A, Aisle B and Aisle C.",
            "Each tab is a separate sheet with its own rows and columns. The white, underlined tab is the one you're looking at.",
          ],
          figure: <SheetFigure focus={["tabs"]} title="Sheet tabs" />,
        },
        {
          heading: "A workbook holds sheets",
          figure: <SheetFigure focus={["tabs"]} title="The tabs along the bottom" />,
          body: ["An Excel file is called a workbook. Inside it are one or more sheets, each a grid of its own.", "The tabs along the bottom show the sheets. Click a tab to open that sheet."],
          good: [{ text: "Stock November.xlsx · tabs: Aisle A | Aisle B | Aisle C" }],
        },
        {
          heading: "Add and rename a sheet",
          figure: <SheetFigure focus={["tabs"]} title="Adding a sheet with ⊕" what={{ tabs: "Press ⊕ to add a sheet. Double-click its tab to give it a name." }} />,
          body: ["Press the ⊕ next to the tabs to add a new sheet. It's called Sheet2 to start with.", "Double-click its tab, type a name, and press Enter."],
          good: [{ text: "December", note: "A name that says what's on it." }],
          bad: [{ text: "Sheet2", note: "Nobody knows what's on it." }],
        },
        {
          heading: "Check the tab before you change anything",
          body: ["Every tab is someone's list. A number typed on the wrong tab is a wrong number in somebody's report.", "When someone names a cell, check they also mean the tab you're on."],
          tip: "The tab you're on is the white one, underlined.",
        },
      ],
      tryIt: { title: "Find your way round a workbook", intro: "Four quick situations with sheets and tabs.", Lab: TabsLab },
      check: [
        {
          q: "Where are a workbook's sheets?",
          options: ["On the tabs along the bottom", "In the File menu", "In separate files"],
          answer: 0,
          reasons: ["Each sheet has a tab at the bottom.", "File is for saving and opening.", "One workbook file holds all its sheets."],
        },
        {
          q: "How do you rename a sheet?",
          options: ["Double-click its tab", "Save the file again", "Type in cell A1"],
          answer: 0,
          reasons: ["Double-click, type, Enter.", "That doesn't change the tab's name.", "That only changes a cell."],
        },
        {
          q: "Why give a sheet a name like December?",
          options: ["So everyone knows what's on it", "Because Excel needs a month", "To make the file smaller"],
          answer: 0,
          reasons: ["A clear name saves people opening every tab.", "Excel accepts any name.", "Names don't change the file size."],
        },
      ],
      takeaways: ["A workbook holds sheets on tabs.", "⊕ adds a sheet. Double-click a tab to rename it.", "Check the tab before you change a number."],
    },
    {
      id: "m4t5",
      title: "Saving your work",
      minutes: 7,
      brief: "Saving sounds simple, but it's where most spreadsheet work gets lost. In this lesson you will learn when to use Save, when to use Save as, and how to tell your changes are safe.",
      learn: [
        {
          heading: "How to tell it's saved",
          body: [
            "The top of the window shows the file's name and whether it's saved (1). \"Not saved\" means your latest changes aren't in the file yet.",
            "Save lives on the ribbon (2), and Ctrl+S does the same.",
          ],
          figure: <SheetFigure focus={["file", "ribbon"]} saved={false} title="Saved or not saved" what={{ file: "The workbook's name. Here it says Not saved: there are changes that aren't in the file yet." }} />,
        },
        {
          heading: "Save: update the file where it lives",
          figure: <SheetFigure focus={["ribbon", "file"]} title="Save, on the ribbon" />,
          body: ["Save (or Ctrl+S) writes your changes into the same file, in the same place.", "Use it when you've changed a file that already exists, like the team's stock sheet."],
          tip: "Press Ctrl+S every few minutes. It costs nothing.",
        },
        {
          heading: "Save as: a new file, a new place or a new name",
          body: ["Save as asks where to put the file and what to call it.", "Use it for a brand new workbook, or when you mean to make a separate copy."],
          good: [{ text: "Operations Team > Documents > Stock > Stock November.xlsx" }],
        },
        {
          heading: "Saved or not saved?",
          body: ["The title bar at the top says \"Saved\" or \"Not saved\".", "If Excel asks \"Save changes?\" when you close, Save keeps them. Don't save throws them away."],
          bad: [{ text: "Closing, then pressing Don't save without reading" }],
        },
        {
          heading: "Templates open as a new file",
          body: ["A template, like a delivery report template, opens as a new workbook. Save asks where to put it.", "That keeps the template clean for the next person."],
        },
      ],
      tryIt: { title: "Keep your work safe", intro: "Four saving moments. Choose what you'd do.", Lab: SavingLab },
      check: [
        {
          q: "You've updated the team's existing stock sheet. What do you press?",
          options: ["Save", "Save as", "Close"],
          answer: 0,
          reasons: ["Save updates the file where it lives.", "Save as would make a second copy somewhere.", "Closing might throw your changes away."],
        },
        {
          q: "What is the shortcut for Save?",
          options: ["Ctrl+S", "Ctrl+P", "Ctrl+Z"],
          answer: 0,
          reasons: ["Ctrl+S saves.", "Ctrl+P prints.", "Ctrl+Z undoes."],
        },
        {
          q: "When should you use Save as?",
          options: ["For a new file or a deliberate copy", "Every time you press save", "Only when the computer asks"],
          answer: 0,
          reasons: ["Save as is for a new place or a new name.", "Using it every time leaves copies everywhere.", "You choose Save as when you need it."],
        },
      ],
      takeaways: ["Save updates the file where it lives.", "Save as is for a new file or a deliberate copy.", "Check the title bar says Saved."],
    },
  ],
};

export default m4;
