import type { Incident, ModuleManifest, ProveItem, TrackBlock } from "../engine/types";

/* Module 5 · Shadow AI and when to ask. The practise is six incidents to
 * triage into three columns; the prove is the final assessment, ten items
 * drawn from a bank of thirty plus the track's own ten, pass at eight.
 * A retake never draws the same ten. */

const COLUMNS = [
  { id: "none" as const, label: "No harm done", desc: "Nothing left the firm, or nothing above PUBLIC did. Carry on." },
  { id: "manager" as const, label: "Tell your manager this week", desc: "Something INTERNAL or a habit that needs fixing. Not urgent, not nothing." },
  { id: "today" as const, label: "Tell {{firm.contact}} today", desc: "CONFIDENTIAL or RESTRICTED data has left the firm, or a tool nobody approved has it." },
];

const SHARED_INCIDENTS: Incident[] = [
  { title: "The extension", body: "You notice a “summarise this page” extension has been installed on your browser for a month. You use the case system in that browser every day.", answer: "today", why: "An unvetted service has had a month of client pages. That is a same-day report, and it protects you: you found it, you reported it." },
  { title: "The draft", body: "You used {{firm.approved}} on your work account to draft a letter with placeholders for the client's name and amount.", answer: "none", why: "Approved tool, work account, placeholders. This is the habit working." },
  { title: "The note-taker", body: "A colleague has been letting a free AI note-taker join client calls to write the minutes. Nobody asked the clients.", answer: "today", why: "A third party has recordings of client calls with no contract and no consent. Same day, and it is the colleague's report to make with your help, not yours to sit on." },
  { title: "The quarter total", body: "Last month you pasted the department's quarter total into your personal ChatGPT to make a chart. No client, no names.", answer: "manager", why: "INTERNAL data on a consumer account. Not a client incident, but the habit needs fixing this week, and your manager should know it happened." },
  { title: "The phone photo", body: "You photographed a signed client letter and asked a personal AI app to read it out while you drove.", answer: "today", why: "A client document, with a name and a signature, on a consumer app. CONFIDENTIAL has left the firm. Today." },
  { title: "The public FAQ", body: "You pasted three paragraphs from the firm's public website into a free tool to tidy the wording.", answer: "none", why: "PUBLIC data is public. Nothing to report, though the approved tool would have done the same job." },
];

const FINANCE_INCIDENTS: Incident[] = [
  ...SHARED_INCIDENTS.slice(0, 4),
  { title: "The bank line", body: "A supplier chaser you sent through the approved tool included the firm's sort code and account number in the prompt.", answer: "today", why: "RESTRICTED data in a prompt is reportable at most firms whether or not anyone reads it, and the approved tool does not change the class. Today." },
  SHARED_INCIDENTS[5],
];

const LEGAL_INCIDENTS: Incident[] = [
  ...SHARED_INCIDENTS.slice(0, 4),
  { title: "The bundle", body: "A trainee uploaded a full privileged bundle to a personal account to “get a head start” on the summary.", answer: "today", why: "Privileged material on a consumer account. This is the kind of incident the SRA expects to be recorded and acted on the same day." },
  SHARED_INCIDENTS[5],
];

const HR_INCIDENTS: Incident[] = [
  ...SHARED_INCIDENTS.slice(0, 4),
  { title: "The reference", body: "You pasted a reference request that mentioned a former employee's sickness absence into a free tool to draft the reply.", answer: "today", why: "Health data is special category data under UK GDPR and RESTRICTED in this course. Today, and the person affected may need to be told." },
  SHARED_INCIDENTS[5],
];

/* The shared bank the final assessment draws from: thirty items across the
 * five modules, tagged with the module they come from so a draw is spread. */
const BANK: ProveItem[] = [
  // Module 1
  { kind: "choose", from: 1, stem: "What is the surest sign that a chat window is under your firm's contract?", options: ["The tool's name in the corner.", "The firm's name or work-account label on the screen.", "A padlock icon."], answer: 1, why: "The account label is the tell. Names and padlocks appear on every tier." },
  { kind: "choose", from: 1, stem: "On a free consumer account, what is the usual default for “improve the model”?", options: ["Off until you turn it on.", "On until you find the switch and turn it off.", "It does not exist on free accounts."], answer: 1, why: "Most consumer tiers start with training on. The switch is yours to find." },
  { kind: "choose", from: 1, stem: "What does deleting a chat reliably do?", options: ["Removes it from your history.", "Removes it from the vendor's systems immediately.", "Removes it from any model it was used to train."], answer: 0, why: "Only the first is guaranteed. The vendor's pages describe a retention period after deletion." },
  { kind: "choose", from: 1, stem: "Which tier keeps data inside a tenant your admin controls?", options: ["Consumer, paid", "Enterprise", "Any tier with Temporary chat on"], answer: 1, why: "The tenant comes with the enterprise contract, not with the price or a setting." },
  { kind: "choose", from: 1, stem: "Paying for a personal subscription changes which of these?", options: ["Who owns the data terms.", "The model and the limits.", "Whether your firm can see your usage."], answer: 1, why: "Paying upgrades the model. The account is still personal." },
  { kind: "choose", from: 1, stem: "Where should you check what a tool does with your inputs?", options: ["A colleague who uses it a lot.", "The vendor's own data or privacy page.", "The tool's welcome message."], answer: 1, why: "The vendor's page is the source, and the course shows you where each one is." },
  // Module 2
  { kind: "classify", from: 2, stem: "The firm's registered office address.", options: ["P", "I", "C", "R"], answer: "P", why: "It is on the letterhead and the website." },
  { kind: "classify", from: 2, stem: "A colleague's name and their internal extension number.", options: ["P", "I", "C", "R"], answer: "I", why: "Fine inside the firm's enterprise tool, not in a personal one." },
  { kind: "classify", from: 2, stem: "A client's name and the fact they are disputing an invoice.", options: ["P", "I", "C", "R"], answer: "C", why: "A named client and a commercial risk. Placeholder before any tool." },
  { kind: "classify", from: 2, stem: "An employee's National Insurance number.", options: ["P", "I", "C", "R"], answer: "R", why: "Never enters a prompt, even to check a format." },
  { kind: "choose", from: 2, stem: "What does the paste test's second question ask?", options: ["Is the tool approved?", "Does it name a person or a client?", "Is the amount over a threshold?"], answer: 1, why: "The name is the hook every other fact hangs on." },
  { kind: "choose", from: 2, stem: "You need a good letter to a client. What goes in the prompt?", options: ["The client's name, so the tone is right.", "The situation, with placeholders for the facts you fill in afterwards.", "Nothing; do not use the tool for client letters."], answer: 1, why: "Describe the situation, leave gaps, fill them yourself. Same quality of letter." },
  { kind: "classify", from: 2, stem: "Three INTERNAL facts that together identify a client's invoice.", options: ["P", "I", "C", "R"], answer: "C", why: "Invoice number plus amount plus date is the invoice. Facts add up." },
  // Module 3
  { kind: "choose", from: 3, stem: "A tool is not on any of your firm's three lists. What is it?", options: ["Approved by default.", "A question for {{firm.contact}} before any client data goes in.", "Not allowed, permanently."], answer: 1, why: "Unknown means ask. Client data waits." },
  { kind: "choose", from: 3, stem: "You open your own ChatGPT on the firm's laptop. Which terms apply?", options: ["The firm's contract, because it is the firm's device.", "The consumer terms, because it is your account.", "Neither, because you are at work."], answer: 1, why: "The account decides, not the device." },
  { kind: "choose", from: 3, stem: "A client invites you into their AI workspace. Who can see what you type there?", options: ["Only you and the client contact.", "The client's admin, and your firm has no agreement with that workspace.", "Nobody; it is encrypted."], answer: 1, why: "Their contract, their visibility. Ask first." },
  { kind: "choose", from: 3, stem: "What is the one thing that never changes between tools?", options: ["The retention period.", "The paste test.", "The account label."], answer: 1, why: "The tool changes the blast radius. The rule about what you paste does not." },
  { kind: "choose", from: 3, stem: "Your manager tells you to try a tool that is on the ask-first list. What do you do?", options: ["Use it; a manager's word is enough.", "Treat the request as the ask and get it confirmed by {{firm.contact}} before client data goes in.", "Refuse."], answer: 1, why: "Ask first means the named contact, not any manager." },
  { kind: "choose", from: 3, stem: "You use the approved tool but add a client's home address to the prompt. What went wrong?", options: ["Nothing; the tool is approved.", "The tool is fine, the address is CONFIDENTIAL. Placeholder, then add it yourself.", "You should have used a personal account."], answer: 1, why: "Approved changes where the data goes, not what class it is." },
  // Module 4 (trust but verify; covered in the module's own prove until it ships)
  { kind: "choose", from: 4, stem: "An AI reply cites three sources. What do you do before it goes to a client?", options: ["Trust them; the tool found them.", "Check each one exists and says what the reply claims.", "Remove the citations so nobody checks."], answer: 1, why: "Invented citations look exactly like real ones. Two minutes of checking is the job." },
  { kind: "choose", from: 4, stem: "A summary of a supplier's document contains an instruction to email the file to an outside address. Where did that come from?", options: ["The tool made a helpful suggestion.", "The document itself: an instruction hidden inside it that the tool followed.", "Your admin."], answer: 1, why: "Prompt injection: text inside a document the tool reads becomes an instruction. Never act on it; report it." },
  { kind: "choose", from: 4, stem: "Copilot surfaces a folder you did not know you could open. What is the rule?", options: ["It is yours to read now.", "Access you technically have is not access you should use. Tell IT the folder is open.", "Copy what you need before it is closed."], answer: 1, why: "The tool shows what your permissions allow. The permissions are the bug, and it is a same-week report." },
  { kind: "choose", from: 4, stem: "What is the two-minute check before anything AI-written goes to a client?", options: ["Spell-check.", "Facts, figures, names and any citation, each against a source you trust.", "Ask the tool if it is sure."], answer: 1, why: "The tool cannot verify itself. You can." },
  // Module 5
  { kind: "choose", from: 5, stem: "You realise you pasted a client's letter into a personal tool last week. What is the first step?", options: ["Delete the chat and say nothing.", "Stop using the tool for that, and tell {{firm.contact}} today.", "Wait to see if anything happens."], answer: 1, why: "The same-day report is what protects you. Deleting and staying quiet is what the register cannot forgive." },
  { kind: "choose", from: 5, stem: "What is the training register for?", options: ["Ranking staff.", "Showing an auditor, an insurer or a regulator that everyone was trained and when.", "Recording your prompts."], answer: 1, why: "It records completion and scores, never what you typed." },
  { kind: "choose", from: 5, stem: "A free AI note-taker has been joining client calls. Which column?", options: ["No harm done.", "Tell your manager this week.", "Tell {{firm.contact}} today."], answer: 2, why: "A third party has recordings of client calls with no contract and no consent." },
  { kind: "choose", from: 5, stem: "Which of these is shadow AI?", options: ["The firm's approved tool on your work account.", "A phone app you installed yourself that reads your work email.", "The spell-checker in Word."], answer: 1, why: "Shadow AI is any AI service the firm has not vetted that touches work data." },
  { kind: "choose", from: 5, stem: "You pasted the department's quarter total into a personal account. Which column?", options: ["No harm done.", "Tell your manager this week.", "Tell {{firm.contact}} today."], answer: 1, why: "INTERNAL data, no client. Fix the habit this week." },
  { kind: "choose", from: 5, stem: "Why report the same day rather than wait?", options: ["Because the firm can often contain it, and a prompt report is what shows you acted properly.", "Because the tool will tell the firm anyway.", "Because reporting later is not allowed."], answer: 0, why: "Early is containable. Late is a cover-up, even when it was not meant as one." },
];

function block(incidents: Incident[], trackProve: ProveItem[]): TrackBlock {
  return {
    practise: {
      kind: "triage",
      task: "Six things that happened this month. Put each in the right column. The reason appears as soon as you choose.",
      columns: COLUMNS,
      incidents,
    },
    prove: trackProve,
  };
}

const FINANCE_PROVE: ProveItem[] = [
  { kind: "classify", from: 2, stem: "The firm's own sort code and account number.", options: ["P", "I", "C", "R"], answer: "R", why: "Bank details never enter a prompt." },
  { kind: "classify", from: 2, stem: "Q2 aged debtors as a single total.", options: ["P", "I", "C", "R"], answer: "I", why: "A firm total with no client in it." },
  { kind: "classify", from: 2, stem: "A supplier's name and the fact their invoice is disputed.", options: ["P", "I", "C", "R"], answer: "C", why: "Named counterparty plus a dispute." },
  { kind: "classify", from: 2, stem: "An employee's salary.", options: ["P", "I", "C", "R"], answer: "R", why: "Payroll is RESTRICTED." },
  { kind: "choose", from: 5, stem: "A chaser sent through the approved tool included the firm's bank details in the prompt. Which column?", options: ["No harm done.", "Tell your manager this week.", "Tell {{firm.contact}} today."], answer: 2, why: "RESTRICTED in a prompt is reportable whatever the tool." },
  { kind: "choose", from: 3, stem: "The approved tool, your work account, a draft with an invoice number and the amount. What is the rule?", options: ["Fine.", "Ask first.", "Not here."], answer: 0, why: "INTERNAL in the approved tool is what it is for." },
  { kind: "choose", from: 2, stem: "You need a firm-but-polite chaser. What goes in the prompt?", options: ["The client, the contact and the amount.", "The situation and the amount, placeholders for the client and contact, and “payment details are on the invoice”.", "Nothing; write it yourself."], answer: 1, why: "Same letter, no leak." },
  { kind: "classify", from: 2, stem: "Our standard payment terms.", options: ["P", "I", "C", "R"], answer: "P", why: "Printed on every invoice." },
  { kind: "choose", from: 1, stem: "A finance colleague uses a free spreadsheet AI add-on on the management accounts. Which tier is that?", options: ["Enterprise, because it is in Excel.", "Consumer, free: an add-on is a service, and the add-on's terms apply.", "Self-hosted."], answer: 1, why: "The add-on is its own service with its own terms. Excel does not make it the firm's." },
  { kind: "choose", from: 5, stem: "You find a payroll export in a personal AI chat history from months ago. Which column?", options: ["No harm done, it is old.", "Tell your manager this week.", "Tell {{firm.contact}} today."], answer: 2, why: "RESTRICTED, regardless of age." },
];

const LEGAL_PROVE: ProveItem[] = [
  { kind: "classify", from: 2, stem: "A client's email chain about a live dispute.", options: ["P", "I", "C", "R"], answer: "C", why: "Privileged and client-identifying." },
  { kind: "classify", from: 2, stem: "The court's public listing for a hearing.", options: ["P", "I", "C", "R"], answer: "P", why: "It is published." },
  { kind: "classify", from: 2, stem: "A matter number and the fee earner's initials.", options: ["P", "I", "C", "R"], answer: "I", why: "Fine in the approved tool, meaningless outside it." },
  { kind: "classify", from: 2, stem: "A witness's medical history in a statement.", options: ["P", "I", "C", "R"], answer: "R", why: "Health data is special category." },
  { kind: "choose", from: 3, stem: "Counsel asks for a summary of a privileged bundle. You are in the approved tool. What is the rule?", options: ["Fine.", "Ask first: privileged material has its own rule, and redact where you can.", "Not here."], answer: 1, why: "Approved tool, but privilege is a separate question the firm answers." },
  { kind: "choose", from: 5, stem: "A trainee uploaded a privileged bundle to a personal account. Which column?", options: ["No harm done.", "Tell your manager this week.", "Tell {{firm.contact}} today."], answer: 2, why: "Privileged, consumer account, today." },
  { kind: "choose", from: 2, stem: "You want a first draft of a letter before action. What goes in the prompt?", options: ["The parties, the facts and the sum.", "The type of claim and the structure you want, placeholders for the parties and the sum.", "Nothing; it cannot be done safely."], answer: 1, why: "Structure from the tool, facts from you." },
  { kind: "choose", from: 4, stem: "An AI reply cites a case you do not recognise. What do you do?", options: ["Cite it; the tool found it.", "Check it on a source you trust before it goes anywhere.", "Ask the tool for the citation again."], answer: 1, why: "Invented authorities look real. Checking is the job." },
  { kind: "choose", from: 1, stem: "A client invites you into their ChatGPT Business workspace to review a contract. Which tier is that window?", options: ["Your firm's enterprise tier.", "The client's enterprise tier, under the client's contract.", "Consumer, paid."], answer: 1, why: "Enterprise, but not yours. Ask first." },
  { kind: "choose", from: 5, stem: "A free note-taker joined a privileged client call. Which column?", options: ["No harm done.", "Tell your manager this week.", "Tell {{firm.contact}} today."], answer: 2, why: "A third party holds a recording of privileged advice." },
];

const HR_PROVE: ProveItem[] = [
  { kind: "classify", from: 2, stem: "An employee's sickness absence record.", options: ["P", "I", "C", "R"], answer: "R", why: "Health data is special category." },
  { kind: "classify", from: 2, stem: "The firm's published holiday policy.", options: ["P", "I", "C", "R"], answer: "P", why: "It is on the intranet and in the handbook given to every candidate." },
  { kind: "classify", from: 2, stem: "Headcount by department.", options: ["P", "I", "C", "R"], answer: "I", why: "A firm figure, no person in it." },
  { kind: "classify", from: 2, stem: "A candidate's name and the fact they were rejected.", options: ["P", "I", "C", "R"], answer: "C", why: "A named person and a decision about them." },
  { kind: "choose", from: 3, stem: "You paste a grievance letter into the approved tool for a neutral summary. What is the rule?", options: ["Fine, it is the approved tool.", "Ask first.", "Not here: a grievance is an HR record, RESTRICTED in any tool."], answer: 2, why: "The approved tool changes where data goes, not the class." },
  { kind: "choose", from: 5, stem: "A reference request mentioning sickness absence went into a free tool. Which column?", options: ["No harm done.", "Tell your manager this week.", "Tell {{firm.contact}} today."], answer: 2, why: "Special category data, consumer account, today." },
  { kind: "choose", from: 2, stem: "You want a draft reference reply. What goes in the prompt?", options: ["The person's name, dates and the reason they left.", "A neutral reference template with placeholders for the name, role and dates.", "Nothing."], answer: 1, why: "Template from the tool, facts from you." },
  { kind: "choose", from: 4, stem: "An AI-drafted policy cites an employment regulation by number. What do you do?", options: ["Publish it.", "Check the regulation exists and says that, on a source you trust.", "Remove the number."], answer: 1, why: "Invented references look real." },
  { kind: "choose", from: 1, stem: "A recruiter uses a free AI tool to screen CVs. Which tier, and what is the problem?", options: ["Enterprise; no problem.", "Consumer, free; candidates' personal data is going to a service with no contract.", "Self-hosted."], answer: 1, why: "Candidate data is personal data. The tool has no agreement with the firm." },
  { kind: "choose", from: 5, stem: "You find an old chat in a personal account containing a disciplinary outcome. Which column?", options: ["No harm done, it is old.", "Tell your manager this week.", "Tell {{firm.contact}} today."], answer: 2, why: "HR record, RESTRICTED, regardless of age." },
];

const GENERAL_PROVE: ProveItem[] = [
  { kind: "classify", from: 2, stem: "The firm's phone number.", options: ["P", "I", "C", "R"], answer: "P", why: "On the website." },
  { kind: "classify", from: 2, stem: "The internal meeting schedule for the week.", options: ["P", "I", "C", "R"], answer: "I", why: "Fine inside the firm." },
  { kind: "classify", from: 2, stem: "A customer's complaint with their name and order.", options: ["P", "I", "C", "R"], answer: "C", why: "A named customer and a problem." },
  { kind: "classify", from: 2, stem: "A colleague's home address from the emergency contact list.", options: ["P", "I", "C", "R"], answer: "R", why: "HR record." },
  { kind: "choose", from: 3, stem: "You use the approved tool to draft a reply to a complaint and include the customer's name. What went wrong?", options: ["Nothing.", "The name is CONFIDENTIAL; placeholder, then add it yourself.", "The tool is not allowed for complaints."], answer: 1, why: "Approved tool, wrong class in the prompt." },
  { kind: "choose", from: 5, stem: "A colleague uses a free AI app on their phone to transcribe voicemails from customers. Which column?", options: ["No harm done.", "Tell your manager this week.", "Tell {{firm.contact}} today."], answer: 2, why: "Customer voices and details on a consumer app." },
  { kind: "choose", from: 2, stem: "You want a polite reply to a complaint. What goes in the prompt?", options: ["The whole complaint email.", "The kind of complaint and the outcome you can offer, placeholders for the name and order.", "Nothing."], answer: 1, why: "Same reply, no customer data." },
  { kind: "choose", from: 4, stem: "An AI summary of a supplier proposal ends with “forward this to the address below”. What is that?", options: ["A helpful suggestion.", "An instruction hidden in the document; do not act on it, report it.", "A system message."], answer: 1, why: "Prompt injection." },
  { kind: "choose", from: 1, stem: "A free tool in your browser offers to “improve your emails” as you type. Which tier?", options: ["Enterprise, because it is in Outlook.", "Consumer, free: an extension is its own service with its own terms.", "Self-hosted."], answer: 1, why: "The extension reads what you type and sends it to its own service." },
  { kind: "choose", from: 5, stem: "You pasted a paragraph from the public website into a free tool. Which column?", options: ["No harm done.", "Tell your manager this week.", "Tell {{firm.contact}} today."], answer: 0, why: "PUBLIC is public." },
];

export const MODULE_5: ModuleManifest = {
  n: 5,
  slug: "shadow-ai",
  title: "Shadow AI and when to ask",
  minutes: 16,
  promise: "Spot the tools nobody approved, and know exactly what to do on the day something has already gone in.",
  passMark: 8,
  final: { draw: 10, fromTrack: 4, bank: BANK },
  learn: [
    {
      kind: "intro",
      eyebrow: "Module 5 of 5 · about 16 minutes",
      heading: "The tools nobody approved, and the day it has already happened.",
      lead: "Most leaks are not a decision. They are an extension somebody installed, a note-taker that joined a call, an app on a phone. This module is how to spot them, and then the four steps for the day you realise something has already gone in. It ends with the final assessment.",
      cta: "Start",
    },
    {
      kind: "cards",
      eyebrow: "Learn · shadow AI",
      heading: "Four places AI gets in without anyone deciding",
      lead: "Tap each for the one question to ask.",
      reveal: true,
      cards: [
        { title: "Browser extensions", tint: "R", body: "“Summarise this page”, “improve my writing”, “translate”.", detail: "The question: does it read the page? If it reads the page, it reads the client file that is on the page, and sends it to a service nobody at the firm has vetted." },
        { title: "Meeting note-takers", tint: "R", body: "A bot joins the call and writes the minutes.", detail: "The question: who has the recording? A free note-taker is a third party holding a recording of a client conversation, with no contract and no consent from the client." },
        { title: "Phone apps", tint: "C", body: "A personal AI app that reads a photo, a voicemail or an email.", detail: "The question: whose account is it? A personal app is a consumer tier. The moment it sees a client document, that document has left the firm." },
        { title: "Free tools that read the inbox", tint: "C", body: "“Connect your email and we will prioritise it.”", detail: "The question: what did I just grant? Inbox access is access to every client email in it, past and future." },
      ],
      note: "None of these needs a decision to become a leak. That is why they are the most common kind.",
    },
    {
      kind: "reveal",
      eyebrow: "Learn · I have already pasted it",
      heading: "Four steps, in this order, on the day it has already gone in",
      lead: "It happens to careful people. What matters is the next hour.",
      more: "Show step {n}",
      items: [
        { title: "Stop. Do not send anything else.", body: "Close the chat. Do not paste more to “fix” it and do not ask the tool to forget it." },
        { title: "Do not delete and hope.", body: "Deleting the chat removes it from your view, not from the vendor. And a deleted chat with no report is the one thing the register cannot forgive." },
        { title: "Tell {{firm.contact}} today.", body: "What went in, which tool and account, and when. Early is containable. That is the whole point of the same-day rule." },
        { title: "Write down what, where, when.", body: "One paragraph, while you remember. The firm may need it for a regulator or a client, and it shows you acted properly." },
      ],
    },
    {
      kind: "cards",
      eyebrow: "Learn · the register",
      heading: "What the register is, and why reporting protects you",
      lead: "Tap each card.",
      reveal: true,
      cards: [
        { title: "What the register records", tint: "I", body: "Who completed which module, the score, the date, and any incident report.", detail: "Never what you typed. It exists so the firm can show an auditor, an insurer or a regulator that people were trained and that incidents were handled." },
        { title: "Why the same-day report is in your favour", tint: "ok", body: "A reported incident is a handled incident.", detail: "The firms that get into trouble are the ones where nobody said anything. A prompt report shows you knew the rule and acted on it. That is what the record will say about you." },
      ],
    },
    {
      kind: "contact",
      eyebrow: "Learn · who to tell",
      heading: "This is who you tell, today, and what you say",
      lead: "Same contact as Module 3. Same minute of your time.",
      script: ["What went in, in one line, without repeating the data.", "Which tool and which account.", "When, as closely as you can.", "Whether a client or a third party is involved."],
    },
  ],
  tracks: {
    finance: block(FINANCE_INCIDENTS, FINANCE_PROVE),
    legal: block(LEGAL_INCIDENTS, LEGAL_PROVE),
    hr: block(HR_INCIDENTS, HR_PROVE),
    general: block(SHARED_INCIDENTS, GENERAL_PROVE),
  },
};
