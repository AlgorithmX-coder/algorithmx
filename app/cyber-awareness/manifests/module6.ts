import type { ModuleManifest, TrackBlock } from "@/app/ai-cleared/engine/types";
import { everyDesk } from "./everyDesk";

/* Cyber Awareness, Module 6 · Invoice Fraud & BEC. Modules 1 to 5 were
 * about people, messages, sign-ins, devices and data; this one is about
 * money: a request to pay somewhere new. Learn: business email compromise
 * in plain words, with UK Finance's 2025 figures; why it is everyone's job,
 * not only Finance's; the six shapes it takes (changed bank details, the
 * boss in a hurry, a reply mid-thread, a real mailbox taken over, gift
 * cards, completion day), with a UK case from Southwark Crown Court; the
 * check that works; and four habits that stop it. Practise: a week of
 * payment requests in a queue, opened in any order, where each check shows
 * what it finds and each decision (pay, hold and verify, report) explains
 * itself. One comes from a supplier's real mailbox, so only the call-back
 * catches it. Prove: five "what do you do next?" scenarios. Same for every
 * desk.
 *
 * Every figure and case is taken from the published pages linked on its
 * card, checked on 9 November 2026, and phrased as reported. Every person,
 * firm, supplier, bank detail, phone number and address in the practice and
 * the scenarios is invented: addresses end in .example, phone numbers sit
 * in Ofcom's drama ranges, and every sort code is 00-00-00 with the words
 * "example details" beside it. */

const SOURCES = {
  ncscBpf: { label: "NCSC: Business payment fraud (business email compromise)", href: "https://www.ncsc.gov.uk/section/respond-recover/business-payment-fraud" },
  ncscPhishing: { label: "NCSC: Phishing attacks, defending your organisation (making processes resistant to phishing)", href: "https://www.ncsc.gov.uk/guidance/phishing" },
  ukf2026: { label: "UK Finance, 15 June 2026: Annual Fraud Report 2026 (invoice and mandate scams, CEO scams)", href: "https://www.ukfinance.org.uk/policy-and-guidance/reports/annual-fraud-report-2026" },
  takeFive: { label: "Take Five to Stop Fraud (UK Finance): invoice and mandate fraud", href: "https://www.takefive-stopfraud.org.uk/advice/general-advice/invoice-and-mandate-consumer/" },
  lawGazette: { label: "Law Society Gazette, 3 March 2020: conveyancing fraud gang jailed for diverting deposit monies", href: "https://www.lawgazette.co.uk/news/conveyancing-fraud-gang-jailed-for-diverting-deposit-monies/5103305.article" },
  todaysConveyancer: { label: "Today's Conveyancer, 3 March 2020: online fraudsters sentenced for £10 million push payment fraud", href: "https://todaysconveyancer.co.uk/online-fraudsters-sentenced-10million-push-payment-fraud/" },
  sraRisk: { label: "Solicitors Regulation Authority: Risk Outlook 2018/19, email modification fraud", href: "https://sra.org.uk/sra/research-report/risk-outlook-2018-2019" },
  nca: { label: "National Crime Agency, 25 March 2026: campaign to protect against invoice fraud in construction", href: "https://www.nationalcrimeagency.gov.uk/news/nca-and-national-federation-of-builders-launch-campaign-to-protect-against-invoice-fraud-in-construction" },
};

const BLOCK: TrackBlock = {
  practise: {
    kind: "payments",
    task: "This week you are covering payments at {{firm.name}} while Ola in Finance is on leave. Six requests reach your desk. Open each one, take the checks you need, then decide: Pay, Hold and verify, or Report.",
    scene: "The firm's process: new or changed bank details are checked by phone on the number in the supplier record, then approved by a second person. Some of these requests are genuine, and every decision shows why.",
    decisions: [
      { id: "pay", label: "Pay", desc: "Release the payment" },
      { id: "hold", label: "Hold and verify", desc: "Stop it until it is checked" },
      { id: "report", label: "Report", desc: "Stop it, and tell {{firm.contact}}" },
    ],
    requests: [
      {
        when: "Mon 09:05",
        channel: "Invoice by email",
        from: "Orchard Lane Stationery",
        address: "invoices@orchardlanestationery.example",
        subject: "Invoice OLS-1182",
        text: "Hello, please find attached invoice OLS-1182 for the paper and toner delivered on Thursday. Payment terms are 30 days, as usual. Thank you for your order.",
        file: "OLS-1182.pdf",
        payee: "Orchard Lane Stationery Ltd",
        amount: "£312.60",
        bank: "Sort code 00-00-00 · Account 0000 3104 (example details)",
        checks: [
          { action: "Match it to the purchase order", found: "Order PO-4502, raised by Ola in Finance for 40 reams of paper and 6 toner cartridges: £312.60 including VAT. Reception signed for the delivery on Thursday.", result: "match" },
          { action: "Compare the bank details with the supplier record", found: "The same account as on the supplier record, used for the last 14 payments to Orchard Lane.", result: "match" },
          { action: "Check the address", found: "invoices@orchardlanestationery.example: the address on the supplier record, letter for letter.", result: "match" },
        ],
        accept: ["pay"],
        outcomes: {
          pay: "£312.60 goes to Orchard Lane, as ordered, through the usual process.",
          hold: "Nothing is lost, but nothing here was new or changed, and holding it only delays a supplier who did everything right.",
          report: "There is nothing to report: a known supplier, the usual bank details, and an invoice that matches its order.",
        },
        why: "This is what normal looks like: an order, a delivery, an invoice that matches both, and bank details that have not changed. Knowing normal is what makes the others stand out. Pay it through the usual process.",
      },
      {
        when: "Mon 14:40",
        channel: "Email",
        from: "Helen Ashworth, Managing Director",
        address: "h.ashworth.office@securemail-direct.example",
        subject: "Confidential: payment needed today",
        text: "Are you at your desk? I need a payment made today to Quillmere Advisory, the deposit on a confidential acquisition. Please keep this between us until it is announced, not even Finance yet. I am in meetings all afternoon, so email only, no calls. Details below. Thank you for handling this.",
        payee: "Quillmere Advisory Ltd",
        amount: "£24,500.00",
        bank: "Sort code 00-00-00 · Account 0000 6618 (example details)",
        checks: [
          { action: "Check the address", found: "The name is your managing director's. The address behind it is not the firm's: securemail-direct.example, a mail service anyone can sign up to. Replies would go there too.", result: "mismatch" },
          { action: "Look up Quillmere Advisory in the supplier record", found: "No supplier of that name. Paying them means setting up a new payee, which the firm's process says needs checks and a second person first.", result: "mismatch" },
          { action: "Call Helen on the number in the firm's directory", found: "Helen answers between meetings. She has asked nobody for a payment, has never heard of Quillmere, and asks you to tell {{firm.contact}}.", result: "mismatch" },
        ],
        accept: ["report", "hold"],
        outcomes: {
          pay: "£24,500 goes to an account the criminals control, and the real Helen finds out from the bank statement. Tell your bank and {{firm.contact}} at once: the faster it is reported, the better the chance of getting some back.",
          hold: "Nothing goes out, which is the main thing. The call to Helen's real number shows it is fraud, so report it too: others at the firm may have had the same email.",
          report: "Nothing goes out, and {{firm.contact}} can block the sender, warn everyone else and check that nobody else has paid.",
        },
        why: "Urgency, authority and secrecy together. \"Keep this between us\" and \"no calls\" are there to stop exactly the check that catches it. A request to skip the process is the tell, whoever it seems to come from. Check with the person on a number you already hold.",
      },
      {
        when: "Tue 10:15",
        channel: "Invoice by email",
        from: "Brightwell Catering",
        address: "accounts@brightwellcatering.example",
        subject: "Invoice BC-2207, to our new account",
        text: "Hi, as discussed on the phone last week, here is our first invoice since we moved banks: lunch for your client seminar on 3 November. The new details are on the invoice. Thanks again for checking with us.",
        file: "BC-2207.pdf",
        payee: "Brightwell Catering Ltd",
        amount: "£1,180.00",
        bank: "Sort code 00-00-00 · Account 0000 5527 (example details)",
        checks: [
          { action: "Compare the bank details with the supplier record", found: "Updated last Wednesday. Ola noted: \"New details confirmed by phone with Raj Patel on 01632 960552, the number already on the record. Change approved by Tom Hale as second person.\" The account matches this invoice.", result: "match" },
          { action: "Call the number on file", found: "Raj Patel at Brightwell picks up on 01632 960552. He confirms the invoice and the new account, and thanks you for checking.", result: "match" },
          { action: "Match it to the purchase order", found: "Order PO-4497, for the client seminar lunch on 3 November: £1,180.00. The office manager confirmed the catering arrived.", result: "match" },
        ],
        accept: ["pay"],
        outcomes: {
          pay: "£1,180 goes to Brightwell's new account, which was checked the right way before anyone paid it.",
          hold: "No harm in being careful, but the change was already checked on the number on file and approved by a second person. Holding it again only delays a supplier who did everything right.",
          report: "There is nothing to report. Bank details do change for real reasons; what matters is that this change was checked on a number the firm already held.",
        },
        why: "Changed bank details are not always fraud: suppliers do move banks. This change was handled the right way, with a call to the number already on the record, never the one in the email, and a second person signing it off. With that done, pay.",
      },
      {
        when: "Wed 11:30",
        channel: "Email, in a thread",
        from: "Sian Morgan, Hamlin Interiors",
        address: "sian.morgan@harnlininteriors.example",
        subject: "Re: Office refit, final instalment",
        text: "Hi both, thanks for the walk-round yesterday, glad you are happy with the meeting rooms. Please note our updated remittance details for the final instalment, attached. Could you settle it by Thursday so the fitters are not stood down? Many thanks, Sian",
        file: "Hamlin final instalment.pdf",
        payee: "Hamlin Interiors Ltd",
        amount: "£18,750.00",
        bank: "Sort code 00-00-00 · Account 0000 9041 (example details)",
        checks: [
          { action: "Read the address letter by letter", found: "harnlininteriors.example: an r and an n where the m should be. Every earlier message in the thread came from hamlininteriors.example.", result: "mismatch" },
          { action: "Read the earlier messages in the thread", found: "Three genuine emails from Sian about the refit and yesterday's walk-round. Whoever wrote this one has read them, so a mailbox at one end of the thread has been read by someone else.", result: "info" },
          { action: "Call the number on file", found: "Sian answers on 01632 960734. Hamlin have not changed banks, and the final instalment is not due until the snagging list is signed off next month.", result: "mismatch" },
        ],
        accept: ["report", "hold"],
        outcomes: {
          pay: "£18,750 goes to the criminals, and Hamlin are still owed it. Tell your bank and {{firm.contact}} straight away: the faster it is reported, the better the chance of getting some back.",
          hold: "Nothing goes out. Sian's answer on the phone shows it is fraud, so report it too, and tell Hamlin: someone has read their emails or yours.",
          report: "Nothing goes out. {{firm.contact}} can find out whether it was your mailbox or Hamlin's that was read, and Sian can warn her other clients.",
        },
        why: "It knew about the walk-round because someone had read the real thread, which is why it sounded right. The address is one character off, rn for m, the trick Module 2 showed. A reply that lands mid-thread with new bank details gets the same call as any other: to the number you already hold.",
      },
      {
        when: "Thu 08:52",
        channel: "Email",
        from: "Ashby & Rowe Facilities",
        address: "accounts@ashbyrowe.example",
        subject: "Change of bank details",
        text: "Dear customer, please be advised that we have moved our banking to a new provider. With immediate effect, please make all payments, including invoice AR-2291 due this Friday, to the account on the attached letter. Our old account closes at the end of the month. Kind regards, Dina Ashby, Finance Manager",
        file: "Ashby & Rowe change of bank details.pdf",
        payee: "Ashby & Rowe Facilities Ltd",
        amount: "£6,840.00",
        bank: "Sort code 00-00-00 · Account 0000 7730 (example details)",
        checks: [
          { action: "Check the address", found: "accounts@ashbyrowe.example: exactly the address on the supplier record, the one every invoice for two years has come from. Nothing is off by a letter.", result: "match" },
          { action: "Open the letter", found: "On Ashby & Rowe's letterhead, signed by Dina Ashby, with their usual logo and footer. It looks like every other letter they have sent.", result: "match" },
          { action: "Compare the bank details with the supplier record", found: "The new account is not the one on the record. Every payment to Ashby & Rowe so far has gone to the account on file.", result: "mismatch" },
          { action: "Call the number on file", found: "You ring 01632 960418 from the supplier record. Dina Ashby says they have not changed banks and sent no such letter. She thinks their mailbox has been broken into, and asks you to forward the email to their IT team.", result: "mismatch" },
        ],
        accept: ["report", "hold"],
        outcomes: {
          pay: "£6,840 goes to the criminals, and every later payment would follow it. Tell your bank and {{firm.contact}} at once: speed gives the best chance of getting some back.",
          hold: "Nothing goes out. The call to Dina is what shows it is fraud, so report it too, and tell Ashby & Rowe their mailbox has been taken over.",
          report: "Nothing goes out. {{firm.contact}} can warn others, and Ashby & Rowe can lock down the mailbox the email really came from.",
        },
        why: "This is the one an address check cannot catch. It came from Ashby & Rowe's real mailbox, which criminals had got into, on their real letterhead. Only the call to the number you already hold showed the truth. That is why every change of bank details gets that call, however genuine it looks.",
      },
      {
        when: "Fri 12:20",
        channel: "Text message",
        from: "Laura Benn, Client Services Director",
        address: "07700 900236",
        subject: "Quick favour",
        text: "Hi, it's Laura. In back-to-back pitches all day so can't talk. Could you get 8 x £50 gift cards for a client thank-you this afternoon? Scratch off the backs and text me photos of the codes, and I'll sort the expenses on Monday. Thanks, you're a star.",
        payee: "Gift cards, codes sent by text",
        amount: "£400.00",
        checks: [
          { action: "Check the number", found: "07700 900236 is not the mobile on Laura's entry in the firm's directory, which ends 900712. It is not in your contacts either.", result: "mismatch" },
          { action: "Check how the firm buys client gifts", found: "Client gifts are ordered by the office manager on the firm's card, with a receipt. Nobody at the firm pays anyone in gift card codes.", result: "mismatch" },
          { action: "Call Laura on the directory number", found: "Laura picks up between meetings. She sent nothing, and asks you to tell {{firm.contact}} so others can be warned.", result: "mismatch" },
        ],
        accept: ["report", "hold"],
        outcomes: {
          pay: "The codes are spent within minutes, and gift cards are almost impossible to get back. Tell {{firm.contact}} at once anyway, so nobody else is caught by the same text.",
          hold: "Nothing is bought. The call to Laura's real number shows it is a scam, so report it too: colleagues may have had the same text.",
          report: "Nothing is bought, and {{firm.contact}} can warn everyone who might get the same text.",
        },
        why: "Gift card codes are as good as cash and almost impossible to trace or get back, which is why criminals ask for them. A new number, no calls, and a way of paying the firm never uses: Module 1's pressure buttons, aimed at the firm's money. Check on the number you already hold.",
      },
    ],
  },
  prove: [
    {
      kind: "choose",
      stem: "You are buying a flat. On completion morning an email from your solicitor's usual address says their bank details have changed, and the money must go to the new account by noon. What do you do next?",
      options: [
        "Pay it, since the email came from the solicitor's usual address.",
        "Call the solicitor on the number from their letters, not the email.",
        "Reply to the email and ask them to confirm the new details first.",
      ],
      answer: 1,
      why: "Completion day is exactly when this is tried: the SRA calls it Friday afternoon fraud. A real address proves nothing if the mailbox has been broken into, and a reply goes to whoever is reading it. Call on a number you had before this email arrived, and do not pay until you have.",
    },
    {
      kind: "choose",
      stem: "Your finance director messages: \"The second approver is off sick and this supplier must be paid today. Release it on your approval alone, just this once.\" What do you do next?",
      options: [
        "Release it alone, since the finance director has asked you to.",
        "Release it, and get the approver to sign it off when they are back.",
        "Ask who stands in as second approver, and wait for that sign-off.",
      ],
      answer: 2,
      why: "Dual approval only protects the firm if it happens every time, and \"just this once\" is the phrase attackers rely on. A sign-off after the money has gone checks nothing. A real finance director can wait for the stand-in the process names; a genuine payment survives the process.",
    },
    {
      kind: "choose",
      stem: "On Friday you paid a supplier's invoice to new bank details from an email. On Monday the real supplier rings to chase it: they never changed banks. What do you do next?",
      options: [
        "Call your bank and tell {{firm.contact}} now: when, how much, where.",
        "Email the receiving bank yourself and ask for the money to be returned.",
        "Check through the email trail first, then tell your manager this week.",
      ],
      answer: 0,
      why: "Money paid to a criminal is moved on fast, so every hour counts. Your bank can try to stop or recover it, but only once it knows, and {{firm.contact}} can check whose mailbox was compromised. Nobody is blamed for reporting; the harm comes from the hours nobody knew. Module 8 covers reporting in full.",
    },
    {
      kind: "choose",
      stem: "A caller says he is from your cleaning contractor's accounts team. He quotes your last invoice number, says they have changed banks, and gives you a direct line to call back and confirm. What do you do next?",
      options: [
        "Call back on the direct line he gave, then update the record.",
        "Note the details, then call the contractor on the number on file.",
        "Update the record, as he knows the contract and the invoice number.",
      ],
      answer: 1,
      why: "Calling back only helps if the number is one you already hold: a number the caller gives you reaches the caller. Invoice numbers are easy to find in a stolen email. Use the number on the supplier record, then let the firm's process, with a second person, make the change.",
    },
    {
      kind: "choose",
      stem: "You work in HR. An email from a colleague's real work account asks you to change her salary payments to a new bank account before payroll runs tomorrow. What do you do next?",
      options: [
        "Change it, since the request came from her own work email account.",
        "Reply to her email and ask her to confirm the new account number.",
        "Check with her in person, or on her known number, before changing it.",
      ],
      answer: 2,
      why: "Payroll diversion is the same trick aimed at salaries: change the account, and her pay goes to a criminal. Her real account proves little if it has been taken over, and a reply may be answered by whoever is in it. Check face to face or on a number you already hold, then follow the firm's process for the change.",
    },
  ],
};

export const AWARENESS_MODULE_6: ModuleManifest = {
  n: 6,
  slug: "invoice-fraud-and-bec",
  title: "Invoice Fraud & BEC",
  minutes: 15,
  course: "cyber-awareness",
  promise: "Stop a payment going to a criminal: know the shapes the request takes, and check any new or changed bank details on a number you already hold.",
  passMark: 4,
  shuffleOptions: true,
  dock: [
    { label: "Before you pay", lines: ["New or changed bank details? Call a number you already hold, never one in the request.", "The firm's process every time: a second person, the usual route."] },
    { label: "Stop signs", lines: ["Secrecy plus urgency.", "A new payee, a new account, or a way of paying the firm never uses.", "A request to skip the process, from anyone."] },
    { label: "Paid already?", lines: ["Tell your bank and {{firm.contact}} straight away. Minutes matter.", "Nobody is blamed for reporting."] },
  ],
  learn: [
    {
      kind: "intro",
      eyebrow: "Module 6 of 8 · about 15 minutes",
      heading: "One email can send the firm's money to a criminal.",
      lead: "Business email compromise is the quiet attack: nothing to install and nothing to click, just a convincing request to pay. This module is for everyone, not only Finance, because whoever passes on \"the new bank details\" is part of the payment chain. It covers the shapes the request takes, the one check that beats all of them, and what to do if money has already gone.",
      note: "The figures and cases come from published reports, linked on each card. Every person, firm, supplier, bank detail and address in the practice is invented.",
      cta: "Show me how it works",
    },
    {
      kind: "cards",
      eyebrow: "Learn · business email compromise in plain words",
      heading: "Someone gets into, or imitates, a mailbox in the payment chain. Tap each.",
      reveal: true,
      columns: 1,
      cards: [
        {
          title: "In plain words",
          tag: "What it is",
          tint: "I",
          body: "A criminal gets into, or imitates, an email account between your firm and the money, then asks for a payment to go somewhere new.",
          detail: "The NCSC calls it business payment fraud, also known as business email compromise, or BEC: criminals impersonate a regular contact and send a fake invoice, or ask for a payment to a different bank account. Nothing harmful lands on your computer. The message is the attack, and the payment is made by someone at the firm who believes it is genuine.",
          sources: [SOURCES.ncscBpf],
        },
        {
          title: "UK losses, 2025",
          tag: "UK Finance",
          tint: "crit",
          body: "£41.3m lost to invoice and mandate scams in a single year.",
          detail: "UK Finance's Annual Fraud Report 2026 counts 2,305 invoice and mandate scam cases in 2025, with £41.3m lost: criminals posing as a supplier, a builder or a conveyancing solicitor and claiming the bank details have changed, often by intercepting emails or getting into an email account. 68% of those losses, £28m, came from business accounts, where large genuine payments are routine and a fake one is harder to spot. CEO fraud, where the criminal poses as a senior person, cost £5.6m, with the highest average loss of any scam type: just over £28,000 a case.",
          sources: [SOURCES.ukf2026],
        },
        {
          title: "Why it is everyone's job",
          tag: "Not only Finance",
          tint: "warn",
          body: "Anyone can be the person who passes on the new bank details.",
          detail: "The request does not always land in Finance. It reaches whoever the criminal thinks will act: the person who knows the supplier, a director's assistant, the colleague covering while someone is on leave. If you forward an email with new bank details, update a record, or ask Finance to pay, you are part of the payment chain.",
        },
      ],
    },
    {
      kind: "cards",
      eyebrow: "Learn · the shapes it takes",
      heading: "Six shapes, one ask: pay somewhere new. Tap each.",
      lead: "The story changes; the ask does not. Every one of these ends with money going to an account the criminal controls.",
      reveal: true,
      columns: 2,
      cards: [
        {
          title: "\"We've changed banks\"",
          tint: "crit",
          body: "A supplier's email or letter: please pay our invoices to this new account.",
          detail: "This is mandate or invoice redirection fraud. The invoice is often real and expected; only the bank details are new. Take Five, the UK Finance campaign, advises querying any change to a company's payment details and confirming them with the company directly before you pay.",
          sources: [SOURCES.takeFive],
        },
        {
          title: "The boss needs it now",
          tint: "crit",
          body: "\"Pay this new firm today, and keep it between us.\"",
          detail: "CEO fraud borrows a senior person's name: a deal, an acquisition, a payment that cannot wait, and a reason why you cannot call. UK Finance describes criminals either getting into the company's email system or spoofing an email that appears to come from the chief executive, asking for an urgent payment or a change to payment details.",
          sources: [SOURCES.ukf2026],
        },
        {
          title: "A reply mid-thread",
          tint: "warn",
          body: "A real conversation, then one more message from an address one letter off.",
          detail: "Criminals who have read a genuine email thread join in at the right moment, from a lookalike address, with new details for the payment everyone is expecting. It sounds right because it knows what was said. Module 2 showed how to read an address letter by letter.",
        },
        {
          title: "A real mailbox, taken over",
          tint: "crit",
          body: "The address is genuine, because the account is.",
          detail: "If a supplier's or a colleague's mailbox has been broken into, the fraud comes from their real address, in their style, on their letterhead. In a case reported in March 2020, a gang jailed at Southwark Crown Court had used malware to steal email logins, watched the accounts for large payments, then sent spoofed emails telling victims where to pay. Police linked 235 frauds between 2014 and 2019 to them, in a scheme reported to be worth around £10m, paid into about 100 UK accounts. No address check catches this; only a call to a number you already hold does.",
          sources: [SOURCES.lawGazette, SOURCES.todaysConveyancer],
        },
        {
          title: "Gift cards",
          tint: "warn",
          body: "\"Buy some gift cards for a client and text me the codes.\"",
          detail: "Codes are as good as cash, spent in minutes and almost impossible to get back, which is why criminals ask for them. A firm does not pay anyone in gift card codes. Module 1 showed the pressure behind requests like this; the check is the same.",
        },
        {
          title: "Completion day",
          tag: "Property",
          tint: "crit",
          body: "Your solicitor's \"new bank details\" on the day you complete.",
          detail: "The Solicitors Regulation Authority describes email modification fraud: criminals impersonating someone in a transaction, usually at short notice and under time pressure. Used to steal conveyancing money it is known as Friday afternoon fraud, because many completions happen on Friday afternoons; sometimes the criminal poses as the law firm, and the buyer sends the money straight to them. At work or at home, the defence is the same.",
          sources: [SOURCES.sraRisk],
        },
      ],
      note: "Faked voices and video calls are the next step up: Module 7 covers them. The check on the next screen works on those too.",
    },
    {
      kind: "timeline",
      eyebrow: "Learn · the check that works",
      heading: "New or changed bank details? Call a number you already hold.",
      lead: "One check beats every shape on the last screen, including the one sent from a real mailbox.",
      before: {
        label: "How it gets paid",
        steps: [
          "An email says the supplier has changed banks, with a letter on their letterhead.",
          "You reply to check, and get a friendly yes from the same address.",
          "The record is updated and the invoice paid, just this once, before the deadline.",
          "Weeks later the real supplier chases the money. It went to a criminal.",
        ],
      },
      after: {
        label: "The check",
        steps: [
          "Pause. New or changed bank details, or a new payee, is the trigger, whoever it seems to come from.",
          "Do not use the phone number, email or link in the request. A reply goes to whoever sent it.",
          "Call on a number you already hold: the supplier record, an earlier invoice, the firm's directory.",
          "Then the firm's process: a second person approves the change, and the payment goes the usual way.",
        ],
      },
      revealLabel: "Show the check",
      note: "Saying \"I will call you back on the number we have\" is always allowed, to a supplier or to a director. A genuine request survives the call.",
    },
    {
      kind: "cards",
      eyebrow: "Learn · the defence that works",
      heading: "Four habits that stop it. Tap each.",
      reveal: true,
      columns: 1,
      cards: [
        {
          title: "Call a number you already hold",
          tag: "Every change",
          tint: "ok",
          body: "Any new or changed bank details, checked by phone on a number from before the request.",
          detail: "The National Crime Agency's advice to firms in March 2026: check for any change to invoice or bank details, or pressure to pay urgently; verify by calling the genuine supplier on a number you have used before; and never transfer money until you are sure the details are right. It quoted Report Fraud figures: £3.9m lost to invoice fraud in September 2025 alone, from 83 cases, more than £47,000 each on average. The NCSC likewise advises checking important email requests through a second type of communication, such as a phone call.",
          sources: [SOURCES.nca, SOURCES.ncscPhishing],
        },
        {
          title: "The process, every time",
          tag: "Never just this once",
          tint: "ok",
          body: "A second person, a matching order, the usual route.",
          detail: "A second person checking a change or a payment only protects the firm if it happens every time; an attacker's whole job is to make this one feel like the exception. The NCSC advises making sure staff know the normal way key tasks, such as payments, are done, so a request to do it differently stands out. If {{firm.name}}'s process is not clear to you, ask {{firm.contact}}.",
          sources: [SOURCES.ncscPhishing],
        },
        {
          title: "Secrecy plus urgency is a stop sign",
          tint: "warn",
          body: "\"Today, and keep it between us\" is the shape of a scam.",
          detail: "A real deal survives a two-minute call. Secrecy is there to stop you checking; urgency is there to stop you thinking. When both turn up with a payment, stop, and check with the person on a number you already hold. Nobody at {{firm.name}} is in trouble for checking with a director.",
        },
        {
          title: "Paid already? Minutes matter",
          tint: "crit",
          body: "Tell your bank and {{firm.contact}} straight away.",
          detail: "Money paid to a criminal is moved on fast, so the sooner the bank knows, the better the chance of stopping or recovering some of it. The NCSC's advice is to tell your IT team as soon as you can, and to contact your bank directly on its official number. UK Finance reports that 48% of invoice and mandate scam losses were returned to victims in 2025. Module 8 covers reporting in full.",
          sources: [SOURCES.ncscBpf, SOURCES.ukf2026],
        },
      ],
      note: "Next: a week of payment requests on your desk. Take the checks before you decide.",
    },
  ],
  tracks: everyDesk(BLOCK),
};
