"use client";

import { ComposeFigure, type WriteExample } from "../learn/figures/email";
import { tidy, CallCheckFigure, CustomerDataFigure, InvoicePairFigure, LockScreenFigure, PasswordFigure, ScamEmailFigure, SignInFigure, ToLineFigure } from "../learn/figures/safety";
import type { ModuleManifest } from "../learn/types";
import { FakeInvoiceLab, InspectLab, PasswordLab, PrivacyLab, ToLineLab } from "./m11labs";

/* Module 11: Staying safe at work (criteria SAFE-1 to SAFE-5). Spotting a
 * scam email, stopping a fake invoice, passwords and two-step sign-in,
 * sending to the right person, and keeping customer details private.
 * Every lesson opens on the whole real thing with its parts numbered
 * (learn/figures/safety), and every Try runs on look-alikes of the real
 * screens (lessons/m11labs). Three office jobs follow on the module page.
 *
 * House copy rules: UK English, plain words, short sentences, no
 * em-dashes, no real bank or helpline named. Quiz options are kept to
 * similar lengths so the right answer is never the obvious longest. */

const GROUP_EMAIL: WriteExample = {
  to: "You",
  bcc: "Jo Marsh; Imran Ahmed; Rosa Bianchi",
  subject: "Christmas opening hours",
  greeting: "Hello,",
  message: ["Our warehouse closes at 1pm on Thursday 24 December and opens again on Monday 4 January.", "Orders for the new year need to reach us by Friday 18 December."],
  signoff: "Kind regards,\nJordan",
  signature: ["Jordan Miles", "Office Administrator | Northfield Supplies", "01632 960 431"],
};

/* The group email has no one name to greet, so its key says so. */
const GROUP_WHAT = { greeting: "\"Hello,\" on its own line. A group has no one name to use." };

const m11: ModuleManifest = {
  id: "m11",
  number: 11,
  title: "Staying safe at work",
  intro: "One click on the wrong email can cost a company thousands, and one email to the wrong person can break data protection law. This module makes you the careful one: the person who spots the scam, checks before paying, and keeps other people's details safe.",
  outcomes: [
    "Spot a scam email by its tells, and report it without clicking",
    "Stop a fake invoice by ringing the supplier on the number you already hold",
    "Make a strong password, and approve only the sign-ins you started",
    "Check the To line before you send anything personal",
    "Keep customer details private, and lock your screen when you leave your desk",
  ],
  topics: [
    {
      id: "m11t1",
      title: "Spotting a scam email",
      minutes: 10,
      brief: "Most attacks on a business start with a single email. In this lesson you will take a real-looking scam apart, tell by tell, and learn the one habit that beats nearly all of them: point, don't click.",
      learn: [
        {
          heading: "Here is a scam email",
          figure: <ScamEmailFigure />,
          body: [
            "This arrived at Northfield at 08:40. It looks like it's from Harlow Packaging, one of our suppliers. It isn't. Every part is numbered: ten tells (2 to 11), and the Report button (1) to press once you've spotted them.",
            "Read the key underneath. You don't need all eleven to be sure: two or three is plenty to stop and report it.",
          ],
        },
        {
          heading: "The name can say anything",
          figure: <ScamEmailFigure focus={["name", "address"]} title="The display name and the real address" />,
          body: [
            "The bold name (3) is typed in by whoever sends the email. A scammer can type \"Harlow Packaging Accounts\", or your manager's name, or \"IT Service Desk\".",
            "The real address (4) is in the brackets. In Outlook, point at the name or click it, and a card shows the address in full.",
          ],
        },
        {
          heading: "A look-alike domain",
          figure: <ScamEmailFigure focus={["domain"]} title="The part after the @" />,
          body: [
            "The part after the @ is the domain (5). It says which company the email really came from.",
            "Harlow's real one is harlowpackaging.example. This one is harlow-packaging-uk.co: extra dashes, extra letters. Scammers buy names that look right at a glance.",
          ],
          good: [{ text: "harlowpackaging.example", note: "Harlow's real domain, after the @" }],
          bad: [{ text: "harlow-packaging-uk.co", note: "Dashes and \"uk.co\" added" }],
        },
        {
          heading: "A rush, a threat, and no name",
          figure: <ScamEmailFigure focus={["urgency", "greeting", "payment"]} title="Pressure, and a greeting with no name" />,
          body: [
            "\"URGENT\" and \"today\" in the subject (2), a late fee if you don't pay (8), and \"Dear Customer\" (6).",
            "The pressure is the point: a scammer wants you to act before you think, or before you ask anyone. A real supplier knows your name and gives you 30 days.",
          ],
        },
        {
          heading: "Point at a link, but never click",
          figure: <ScamEmailFigure focus={["link", "linkurl"]} title="The link, and where it really goes" />,
          body: [
            "A link's words (10) can say anything. Rest the mouse pointer on it, without clicking, and its real address appears (11), in a small box and in the bottom corner of the window.",
            "On a phone, press and hold the link instead of tapping it.",
          ],
          tip: "If the address isn't the company's own, or you're not sure, don't click. Nobody was ever told off for not clicking.",
        },
        {
          heading: "Report it",
          figure: <ScamEmailFigure focus={["report"]} title="The Report button" />,
          body: [
            "Don't reply, don't forward it to a colleague, don't click. Open it and press Report (1).",
            "It goes to Junk, and IT are told, so they can block it and warn everyone else. If you clicked something by mistake, tell IT straight away: it's fixable if they know fast.",
          ],
        },
      ],
      tryIt: { title: "Point, don't click", intro: "Four emails in a pretend Outlook. Inspect each one by pointing, then report it or deal with it.", Lab: InspectLab },
      check: [
        {
          q: "An email's sender name says \"Northfield IT Desk\". How do you check who really sent it?",
          options: ["Point at the name to see the address", "Trust it, as it has IT's name on it", "Reply to it and ask if it's really them"],
          answer: 0,
          reasons: ["The address shows where it really came from.", "Anyone can type any name. Check the address.", "A scammer will say yes, and now knows you read it."],
        },
        {
          q: "Which address could really be from Harlow Packaging?",
          options: ["tom.hale@harlowpackaging.example", "tom.hale@harlow-packaging.example", "tom.hale@harlowpackaging-uk.example"],
          answer: 0,
          reasons: ["That's Harlow's real domain, exactly.", "Close, but the dash makes it a different domain.", "Extra letters on the end: a different domain."],
        },
        {
          q: "You clicked a link in a scam email by mistake. What now?",
          options: ["Tell IT straight away", "Close it and keep quiet", "Reply and ask what it was"],
          answer: 0,
          reasons: ["The faster they know, the more they can stop.", "If it did something, nobody can fix it in time.", "That's the scammer. Tell IT instead."],
        },
      ],
      takeaways: ["Read the address, not the name.", "Point at a link to see where it goes. Never click to find out.", "A rush, a threat, no name and a link: report it."],
    },
    {
      id: "m11t2",
      title: "Fake invoices and changed bank details",
      minutes: 10,
      brief: "The costliest scam in offices isn't a virus. It's an email asking you to pay a real bill into a new bank account. In this lesson you will spot a fake invoice, and learn the one check that stops it: ring the supplier on the number you already hold.",
      learn: [
        {
          heading: "Here are two invoices",
          figure: <InvoicePairFigure />,
          body: [
            "First, Harlow's real invoice HP-2291, as it sits in Finance. Then the fake one, from a scam email. Every part is numbered.",
            "Three things are the same on both, numbered on the real one (1 to 3). Four are different, numbered on the fake (4 to 7), and all four are about where your money and your questions go.",
          ],
        },
        {
          heading: "Same look, same number, same amount",
          figure: <InvoicePairFigure focus={["look", "number", "total"]} title="What a scammer copies" />,
          body: [
            "Anyone can copy a logo and a layout (1). Scammers often copy a real invoice number (2) and amount (3), sometimes from a mailbox they have broken into.",
            "So a fake can look perfect. Don't judge an invoice by its looks.",
          ],
        },
        {
          heading: "The bank details have changed",
          figure: <InvoicePairFigure focus={["bank"]} title="Where the money goes" />,
          body: [
            "This is the whole scam, on the fake (6): pay the real bill, but into the scammer's account. Once the money has gone, your bank can rarely get it back.",
            "Suppliers almost never change bank. When one really does, they tell you more than once, and expect you to check by phone.",
          ],
          bad: [{ text: "Please note our new bank details below and pay today.", note: "Stop. Check by phone first." }],
        },
        {
          heading: "New contact details, and a rush",
          figure: <InvoicePairFigure focus={["email", "phone", "terms"]} title="The email address, the phone number and the deadline" />,
          body: [
            "On the fake, the email address (4) and the phone number (5) are the scammer's own, so any question you ask goes straight back to them.",
            "And the deadline (7) is today, with a late fee. The real invoice gives 30 days.",
          ],
        },
        {
          heading: "Ring the number you already hold",
          figure: <CallCheckFigure />,
          body: [
            "Never use the contact details in the email you're checking. Find the supplier in your own records: the desk phone's Contacts (1), a supplier list, an old invoice. Every part is numbered.",
            "Ring Tom (2) on the number we hold (3), with Call (4). The number in the email (5) only rings the scammer.",
          ],
        },
        {
          heading: "What to say, and who to tell",
          figure: <CallCheckFigure focus={["call"]} title="The call" />,
          body: [
            "Press Call (4), and keep it simple: \"We've had an email saying your bank details have changed. Is that right?\"",
            "If they say no, it's a scam. Don't pay, report the email, and tell whoever pays suppliers straight away. At Northfield, that's Priya in Accounts.",
          ],
          tip: "Never reply to the email to ask if it's real. The scammer reads the replies.",
        },
      ],
      tryIt: { title: "Stop the fake invoice", intro: "Compare the real invoice with the fake, ring to check, then decide what to do.", Lab: FakeInvoiceLab },
      check: [
        {
          q: "An email says a supplier's bank details have changed. What do you do first?",
          options: ["Ring them on the number you hold", "Ring the number given in the email", "Reply to the email and ask them"],
          answer: 0,
          reasons: ["Only a number you held before the email can be trusted.", "That number rings the scammer.", "The scammer reads the replies."],
        },
        {
          q: "The fake invoice has the right logo, number and amount. What gives it away?",
          options: ["New bank and contact details", "The logo is slightly blurred", "It came as a PDF attachment"],
          answer: 0,
          reasons: ["That's where the money and your questions would go.", "A good fake has a perfect logo.", "Real invoices come as PDFs too."],
        },
        {
          q: "Tom says nothing has changed. Who else must know straight away?",
          options: ["Priya, who pays the suppliers", "Nobody, the call sorted it out", "Every customer on our books"],
          answer: 0,
          reasons: ["She's the one who would have paid it.", "Someone else might still pay it. Tell Priya.", "It's about paying a supplier. Tell Accounts."],
        },
      ],
      takeaways: ["Changed bank details? Stop and check.", "Ring on the number you already hold, never the one in the email.", "Report it, and tell whoever pays."],
    },
    {
      id: "m11t3",
      title: "Passwords and two-step sign-in",
      minutes: 12,
      brief: "Your password and your phone are the two keys to your work account. In this lesson you will make a password that's strong and easy to remember, keep it to yourself, and learn when to say yes, and when to say no, to a sign-in request on your phone.",
      learn: [
        {
          heading: "Here is how you sign in",
          figure: <SignInFigure />,
          body: [
            "At work you sign in in two steps. First your account (1) and password (2), then Sign in (3). Every part is numbered.",
            "Then your screen shows a number (4) and your phone asks: Approve sign-in? (5). You check the app, place and time (6), type the number (7), and press Yes (9). If you didn't start it: No, it's not me (8).",
          ],
        },
        {
          heading: "Your password is the first key",
          figure: <SignInFigure focus={["password"]} title="The password" />,
          body: [
            "On its own, a password can be guessed, typed into a fake sign-in page, or leaked when another website is hacked.",
            "That's why there's a second step on your phone. But the password still needs to be a good one.",
          ],
        },
        {
          heading: "Here is a strong password",
          figure: <PasswordFigure />,
          body: [
            "This is the page where you change your password. Every part is numbered.",
            "The new password (2) is three random words, joined: CopperKettleHarbour. It's long, so the strength meter (3) says Strong, and it's easy for you to picture.",
          ],
        },
        {
          heading: "Three random words",
          figure: <PasswordFigure focus={["newpw", "strength"]} title="The new password and its strength" />,
          body: [
            "Pick three words that have nothing to do with each other, or with you. Join them, with a capital at the start of each (2).",
            "Length beats cleverness (3). Three random words are longer, and easier to remember, than a short jumble like Password1!",
          ],
          good: [{ text: "CopperKettleHarbour" }, { text: "TulipCanyonBiscuit" }],
          bad: [
            { text: "Password1!", note: "The first thing anyone tries" },
            { text: "Northfield2026", note: "Company and year: easy to guess" },
          ],
        },
        {
          heading: "Never share it, never reuse it",
          figure: <PasswordFigure focus={["rules"]} title="The rules" />,
          body: [
            "Nobody needs your password: not your manager, not even IT. IT will never ask for it. If someone does, it's a scam.",
            "And use it nowhere else (5). When a shop or a website is hacked, criminals try the stolen passwords everywhere else.",
          ],
          tip: "Too many passwords to remember? Your company may give you a password manager. It remembers them, so you only need one.",
        },
        {
          heading: "Here is a request you didn't start",
          figure: <SignInFigure started={false} />,
          body: [
            "Now you're just reading email. You haven't pressed Sign in anywhere, and there's no number on your screen (1). Every part is numbered.",
            "But your phone asks you to approve a sign-in (2), from a place you're not in (3). Someone has your password and is trying it right now.",
          ],
        },
        {
          heading: "Say no, then report it",
          figure: <SignInFigure started={false} focus={["numbox", "deny", "yes"]} title="No number to type, so: No, it's not me" />,
          body: [
            "There's no number to type (4), because you didn't start this. Press No, it's not me (5). The app then offers to report it: say yes, or tell IT straight away. Never Yes (6).",
            "If requests keep coming, don't press Yes to make them stop. That's exactly what the scammer is hoping for. Tell IT, and change your password.",
          ],
        },
      ],
      tryIt: { title: "Change it, and answer your phone", intro: "Make a strong new password, then deal with two sign-in requests: one you started, and one you didn't.", Lab: PasswordLab },
      check: [
        {
          q: "Which is the strongest password?",
          options: ["MeadowLanternParrot", "Northfield2026!", "P@ssw0rd123"],
          answer: 0,
          reasons: ["Three random words: long and hard to guess.", "Company name and year: easy to guess.", "Swapping letters for symbols fools nobody."],
        },
        {
          q: "Your phone asks you to approve a sign-in, but you aren't signing in. What do you do?",
          options: ["No, it's not me, then report it", "Yes, to make the request go away", "Ignore it and carry on working"],
          answer: 0,
          reasons: ["Someone has your password. IT can stop them.", "That lets a stranger into your account.", "They'll try again. Tell IT so they can stop them."],
        },
        {
          q: "Someone rings saying they're from IT and asks for your password. What do you do?",
          options: ["Say no: IT never need it", "Tell them, as they're from IT", "Email it to them instead"],
          answer: 0,
          reasons: ["Real IT never ask. It's a scam: report it.", "Anyone can say they're from IT.", "Written down, it's even easier to steal."],
        },
      ],
      takeaways: ["Three random words, used only for work.", "Never share it. Nobody needs it.", "Only approve a sign-in you started yourself."],
    },
    {
      id: "m11t4",
      title: "Sending to the wrong person",
      minutes: 8,
      brief: "The most common data breach in any office isn't hacking. It's an email to the wrong person. In this lesson you will see how Outlook's suggestions can trip you up, and the two checks that catch it before you press Send.",
      learn: [
        {
          heading: "Here is how it goes wrong",
          figure: <ToLineFigure />,
          body: [
            "Daniel asked you to send the overtime sheet to Emma in HR. You typed \"Emma\" (1) and pressed Enter. Every part is numbered.",
            "Outlook picked its first suggestion (2): Emma Clarkson, a customer at Bright Cafe. The one you meant (4) was second.",
          ],
        },
        {
          heading: "Outlook puts recent people first",
          figure: <ToLineFigure focus={["typed", "first", "second"]} title="What you typed, and what Outlook suggested" />,
          body: [
            "Suggestions come in order of who you've heard from most recently. Emma Clarkson emailed this morning, so she's first (2), and Enter picks her.",
            "Never press Enter on a name without reading the suggestion it's on.",
          ],
        },
        {
          heading: "Read the address",
          figure: <ToLineFigure focus={["external", "address"]} title="External, and the address" />,
          body: [
            "Under each name is an address (5) and who they are. @northfieldsupplies.example is us. Anything else is outside the company, and Outlook marks it External (3).",
            "Two Emmas, two Toms, two Sarahs: the address is what tells them apart.",
          ],
        },
        {
          heading: "The yellow warning",
          figure: <ToLineFigure focus={["mailtip", "chip"]} title="The warning, and who it's going to" />,
          body: [
            "Once someone outside the company is on an email, Outlook shows a yellow bar (7), and their name turns yellow too (8).",
            "When you mean to email a customer, that's expected. When it's pay or anything private, stop: the wrong person is on it.",
          ],
        },
        {
          heading: "Check before you send",
          figure: <ToLineFigure focus={["attach", "send"]} title="What's going, and Send" />,
          body: [
            "What's going (9) decides how careful to be. Pay, staff details, customer details: read the To line twice before you press Send (6).",
            "Once it has gone to someone outside the company, you can't take it back.",
          ],
        },
        {
          heading: "If it goes to the wrong person",
          figure: <ToLineFigure focus={["chip"]} title="Who it went to" />,
          body: [
            "Tell your manager straight away. It isn't about blame: a data breach may have to be reported within days, so they need to know now.",
            "Then ask the person who got it (8) to delete it, and to tell you when they have. Don't wait and hope.",
          ],
          tip: "Every company has someone who handles this. At Northfield, tell your manager, Daniel Okafor, first.",
        },
      ],
      tryIt: { title: "Pick the right person", intro: "Three emails in a pretend Outlook. Type the name, read the suggestions, and send each one to the right person.", Lab: ToLineLab },
      check: [
        {
          q: "You type \"Emma\" and two Emmas appear. How do you choose?",
          options: ["Read the address under each name", "Press Enter to take the first one", "Pick whichever name looks right"],
          answer: 0,
          reasons: ["The address says who they are and where.", "The first is just the most recent, not the right one.", "The names look nearly the same. Read the address."],
        },
        {
          q: "A yellow bar says someone is outside your organisation. What does it mean?",
          options: ["They don't work for your company", "The email will bounce back to you", "They have blocked your email address"],
          answer: 0,
          reasons: ["Fine for a customer; a stop sign for payroll.", "It will be delivered. That's the worry.", "It's about who they are, not what they've done."],
        },
        {
          q: "You sent the overtime sheet to a customer by mistake. What do you do first?",
          options: ["Tell your manager straight away", "Wait to see if they notice it", "Just send it again to HR"],
          answer: 0,
          reasons: ["They may need to report it, and fast.", "Hoping doesn't undo it. Tell your manager.", "HR need it, but the breach still needs dealing with."],
        },
      ],
      takeaways: ["Never press Enter on a name without reading it.", "Read the address: ours end northfieldsupplies.example.", "Sent it to the wrong person? Tell your manager straight away."],
    },
    {
      id: "m11t5",
      title: "Keeping customer details private",
      minutes: 10,
      brief: "Customers trust you with their names, numbers, addresses and sometimes their card details. In this lesson you will learn what counts as personal data, how to email a group without sharing everyone's address, and why you lock your screen every time you stand up.",
      learn: [
        {
          heading: "Here is a customer list",
          figure: <CustomerDataFigure />,
          body: [
            "This sheet holds Northfield's customer contacts. Every part is numbered.",
            "Much of it is personal data (3 to 7): anything that tells you about one living person. The law says it must be kept safe, and used only for the job it was collected for.",
          ],
        },
        {
          heading: "What counts as personal",
          figure: <CustomerDataFigure focus={["person", "phone", "email", "address", "card"]} title="Personal data" />,
          body: [
            "A person's name (3), their phone number (4), their own email address (5), where they live (6), even the last four digits of their card (7).",
            "Put together, they can be used to trick or rob someone. Treat each one like cash.",
          ],
        },
        {
          heading: "What isn't",
          figure: <CustomerDataFigure focus={["business"]} title="A business's name" />,
          body: [
            "A business's name (2) isn't personal: it's on the sign above the door. Prices, orders and products aren't personal either.",
            "When you're not sure, treat it as personal.",
          ],
        },
        {
          heading: "Keep it where it lives",
          figure: <CustomerDataFigure focus={["file"]} title="Where the list is kept" />,
          body: [
            "The list lives on the team site (1), where only the people who need it can open it.",
            "Don't download copies, email it round, or paste it anywhere else. Send colleagues a link to the one real file instead.",
          ],
        },
        {
          heading: "Here is an email to a group of customers",
          figure: <ComposeFigure email={GROUP_EMAIL} title="An email to three customers" what={GROUP_WHAT} />,
          body: [
            "Christmas opening hours, going to three customers. Every part is numbered, as in Module 1.",
            "Look at To (2) and Bcc (4): the customers are in Bcc, and you're in To.",
          ],
        },
        {
          heading: "Bcc keeps their addresses private",
          figure: <ComposeFigure email={GROUP_EMAIL} focus={["to", "bcc"]} title="To and Bcc" what={GROUP_WHAT} />,
          body: [
            "Everyone in To and Cc can see everyone else's address. Put 30 customers in To and you've given each of them 29 other people's email addresses.",
            "Bcc (4) sends each one a copy without showing the others. Put yourself in To (2).",
          ],
        },
        {
          heading: "Here is a locked screen",
          figure: <LockScreenFigure />,
          body: [
            "Your screen shows whatever you're working on to anyone who walks past. Every part is numbered.",
            "Windows key + L (1), or Start > You > Lock (2), puts up the lock screen (3): just the time and date (4). Your work waits behind it until you sign back in (5).",
          ],
        },
        {
          heading: "Lock it every time you stand up",
          figure: <LockScreenFigure focus={["keys"]} title="Windows key + L" />,
          body: [
            "Make it a reflex: stand up, Windows key + L (1). Even for a coffee, even for a minute.",
            "And keep printouts with personal details off your desk: in a drawer, or in the confidential waste when you've finished with them.",
          ],
          tip: "On a Mac, it's Control + Command + Q.",
        },
      ],
      tryIt: { title: "Keep it private", intro: "Sort personal from not, fix a group email with Bcc, then lock your screen before you leave your desk.", Lab: PrivacyLab },
      check: [
        {
          q: "Which of these is personal data?",
          options: ["A customer's mobile number", "The price of a case of cups", "A shop's opening hours"],
          answer: 0,
          reasons: ["It reaches one person: keep it safe.", "That's about a product, not a person.", "That's about the shop, not a person."],
        },
        {
          q: "You're emailing 20 customers about a price change. Where do their addresses go?",
          options: ["Bcc, with yourself in To", "All in To, so it's clear", "All in Cc, so they're copied"],
          answer: 0,
          reasons: ["Each gets it; nobody sees the others.", "All 20 would see each other's addresses.", "Cc shows every address too."],
        },
        {
          q: "You're going to the kitchen for two minutes. What do you do first?",
          options: ["Lock it: Windows key + L", "Nothing, you'll be quick", "Minimise what's on screen"],
          answer: 0,
          reasons: ["Two seconds, and nobody can see or use it.", "Two minutes is plenty for someone else.", "One click brings it back for anyone."],
        },
      ],
      takeaways: ["Names, numbers, addresses, card digits: personal. Keep them safe.", "Emailing a group of customers? Bcc.", "Stand up, Windows key + L."],
    },
  ],
};

/* Copy that wraps well on a phone (learn/figures/safety 'tidy'): no lone last
 * word, and "30 days", phone numbers and domains never split. */
for (const t of m11.topics)
  t.learn = t.learn.map((c) => ({ ...c, heading: tidy(c.heading), body: c.body.map(tidy), tip: c.tip && tidy(c.tip), good: c.good?.map((g) => ({ ...g, note: g.note && tidy(g.note) })), bad: c.bad?.map((b) => ({ ...b, note: b.note && tidy(b.note) })) }));

export default m11;
