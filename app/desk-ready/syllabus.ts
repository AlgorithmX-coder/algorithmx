/* The Desk Ready course map, as data. One source for the course page, the
 * landing and (later) progress: the order of parts and modules lives here
 * and nowhere else. Plan agreed with the owner 2026-11-09: 14 modules in
 * six parts, then one final task. Written for an adult who is new to
 * computers, so every title and line is plain English.
 *
 * `ready` flips true as each module ships; until then the course page shows
 * it as coming soon. Modules are mapped to FutureDotNow's AI-embedded
 * Essential Digital Skills Framework (25 work tasks) in the plan. */

export interface DeskModule {
  /** Route segment and progress key, e.g. "m2" -> /desk-ready/m2. */
  id: string;
  number: number;
  title: string;
  /** One line: what the learner can do once it is finished. */
  promise: string;
  /** The short lessons inside it, in order. */
  topics: string[];
  ready: boolean;
}

export interface DeskPart {
  id: string;
  label: string; // "Part 1"
  title: string;
  blurb: string;
  modules: DeskModule[];
}

export const PARTS: readonly DeskPart[] = [
  {
    id: "p0",
    label: "Part 0",
    title: "Getting comfortable",
    blurb: "If you have mostly used a phone, start here. If you already use a computer, you can skip it.",
    modules: [
      {
        id: "m0",
        number: 0,
        title: "Your computer, your way",
        promise: "Use a mouse and keyboard with confidence, and find what you saved.",
        topics: ["The mouse: click, double-click, drag", "The keyboard and the keys that matter", "Windows: open, close, switch", "Copy, paste and undo", "Saving and finding a file", "Typing practice"],
        ready: false,
      },
    ],
  },
  {
    id: "p1",
    label: "Part 1",
    title: "Email",
    blurb: "Most desk jobs run on email. Read it, write it and sort it like you have done it for years.",
    modules: [
      {
        id: "m1",
        number: 1,
        title: "The work inbox",
        promise: "Find your way round a work inbox without missing anything.",
        topics: ["What is in an email", "To, Cc and Bcc", "Reply, Reply all and Forward", "Attachments", "Folders, flags and search"],
        ready: false,
      },
      {
        id: "m2",
        number: 2,
        title: "Writing a work email",
        promise: "Write a clear, polite work email that gets a reply.",
        topics: ["A subject line that says what is inside", "Starting it off: greetings", "Say what you need, once", "Signing off and your signature", "Polite but direct: chasing and saying sorry"],
        ready: false,
      },
      {
        id: "m3",
        number: 3,
        title: "Meetings and messages",
        promise: "Accept a meeting, join a video call and use Teams chat.",
        topics: ["Calendar invites", "Joining a Teams or Zoom call", "Mute, camera and sharing your screen", "Chat or email: which one?", "Writing down the actions"],
        ready: false,
      },
    ],
  },
  {
    id: "p2",
    label: "Part 2",
    title: "Spreadsheets",
    blurb: "Excel is the tool every office uses. Learn it with real business data, not made-up numbers.",
    modules: [
      {
        id: "m4",
        number: 4,
        title: "What a spreadsheet is",
        promise: "Know your way round rows, columns and cells.",
        topics: ["Rows, columns and cells", "Cell addresses like B4", "Typing in and fixing mistakes", "Sheets and tabs", "Saving your work"],
        ready: false,
      },
      {
        id: "m5",
        number: 5,
        title: "Putting business data in",
        promise: "Enter business data neatly, so other people can trust it.",
        topics: ["One row for one thing", "Headings that make sense", "Dates and numbers done the same way", "Sort and filter", "Checking your own work"],
        ready: false,
      },
      {
        id: "m6",
        number: 6,
        title: "Making it do the maths",
        promise: "Add up, average and count with simple formulas.",
        topics: ["Your first formula", "SUM, AVERAGE and COUNT", "Adding VAT and working out a percentage", "Counting what matches: COUNTIF", "Copying a formula down"],
        ready: false,
      },
      {
        id: "m7",
        number: 7,
        title: "What the numbers mean",
        promise: "Answer a manager's question from a spreadsheet.",
        topics: ["Spotting data that looks wrong", "Colour that points things out", "One simple chart", "Answering the question", "Sending the answer in an email"],
        ready: false,
      },
    ],
  },
  {
    id: "p3",
    label: "Part 3",
    title: "Documents and files",
    blurb: "Write a tidy document and keep your files where you, and everyone else, can find them.",
    modules: [
      {
        id: "m8",
        number: 8,
        title: "Documents",
        promise: "Write and lay out a letter or a short report.",
        topics: ["Headings, bullets and tables", "Using a template", "Spelling and grammar checks", "Saving as a PDF", "Filling in and uploading a form"],
        ready: false,
      },
      {
        id: "m9",
        number: 9,
        title: "Files and sharing",
        promise: "Name, save and share files the way offices expect.",
        topics: ["Folders that make sense", "File names you can find again", "OneDrive and shared folders", "Send a link or attach a file?", "Who can see it: sharing settings"],
        ready: false,
      },
    ],
  },
  {
    id: "p4",
    label: "Part 4",
    title: "The everyday office",
    blurb: "The jobs you will do every week, how to stay safe while you do them, and how AI can help.",
    modules: [
      {
        id: "m10",
        number: 10,
        title: "Admin in practice",
        promise: "Handle invoices, orders, timesheets and messages.",
        topics: ["Reading a purchase order and an invoice", "Checking an invoice against a delivery", "Timesheets, holidays and expenses", "Booking systems", "Turning a phone message into an email"],
        ready: false,
      },
      {
        id: "m11",
        number: 11,
        title: "Staying safe at work",
        promise: "Spot a scam email and keep other people's details safe.",
        topics: ["Spotting a scam email", "Fake invoices and changed bank details", "Passwords and two-step sign-in", "Sending to the wrong person", "Keeping customer details private"],
        ready: false,
      },
      {
        id: "m12",
        number: 12,
        title: "AI as your assistant",
        promise: "Use Copilot or ChatGPT to help, and check what it gives you.",
        topics: ["What AI is good and bad at", "Asking it to draft an email", "Asking it to explain a formula", "Checking what it wrote", "What you must never paste in"],
        ready: false,
      },
    ],
  },
  {
    id: "p5",
    label: "Part 5",
    title: "Getting the job",
    blurb: "Show employers what you can do, and turn the work you have done into the words they look for.",
    modules: [
      {
        id: "m13",
        number: 13,
        title: "From floor to desk",
        promise: "Write a CV for a desk job and pass the tests agencies set.",
        topics: ["Your experience, in office words", "A CV for a desk job", "Indeed and LinkedIn", "Typing and Excel tests", "Video interviews"],
        ready: false,
      },
    ],
  },
];

/* The final task: a pretend Monday morning that uses everything. */
export const FINAL = {
  id: "final",
  title: "Monday morning at the desk",
  promise: "Eight emails, a spreadsheet to update, a meeting to book and one scam hidden in the pile. Get through the morning and keep what you made.",
  ready: false,
} as const;

export const ALL_MODULES: readonly DeskModule[] = PARTS.flatMap((p) => p.modules);
