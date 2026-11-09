import type { ModuleManifest, TrackBlock } from "@/app/ai-cleared/engine/types";
import { everyDesk } from "./everyDesk";

/* Cyber Awareness, Module 8 · Report It. The last module, and the pay-off
 * for the line every earlier one ends on: tell {{firm.contact}} straight
 * away, nobody is blamed. Learn: why minutes matter (money, a lost device,
 * one phish in many inboxes, the ICO's 72 hours, and why blame stops
 * reports); what to report, near misses included; how to report inside the
 * firm and what to do while you wait; the national services, exactly as
 * published, and what the firm, not you, decides; and what goes in a
 * report. Practise: a day of four things going wrong, and the learner
 * writes each report (who and how, which details, what meanwhile), then
 * sees a model report, what happens next by the clock, and what keeping
 * quiet would have cost. Prove: five "what do you do next?" scenarios. The
 * result screen closes the course with one habit from each module. Same
 * for every desk.
 *
 * Every figure and every piece of outside advice is taken from the
 * published pages linked on its card, checked on 9 November 2026. The
 * national reporting services (report@phishing.gov.uk, 7726, Report Fraud
 * on reportfraud.police.uk or 0300 123 2040, Police Scotland on 101) are
 * real and given exactly, because they are instructions. Every person,
 * firm, address and number in the practice and the scenarios is invented:
 * addresses end in .example and phone numbers sit in Ofcom's drama ranges. */

const SOURCES = {
  ncscPhishing: { label: "NCSC: Phishing attacks, defending your organisation (reporting culture, responding quickly, and its case study)", href: "https://www.ncsc.gov.uk/guidance/phishing" },
  ncscBpf: { label: "NCSC: Business payment fraud, what action should I take?", href: "https://www.ncsc.gov.uk/section/respond-recover/business-payment-fraud" },
  ncscWhatToDo: { label: "NCSC: Phishing scams, if you've shared sensitive information", href: "https://www.ncsc.gov.uk/collection/phishing-scams/what-to-do" },
  ncscEmail: { label: "NCSC: Report a scam email (and where to report fraud)", href: "https://www.ncsc.gov.uk/collection/phishing-scams/report-scam-email" },
  ncscText: { label: "NCSC: Report a scam text", href: "https://www.ncsc.gov.uk/collection/phishing-scams/report-scam-text-message" },
  sersLaunch: { label: "The Register, 21 April 2020: the NCSC launches the Suspicious Email Reporting Service", href: "https://www.theregister.com/2020/04/21/ncsc_email_scam_takedown_address/" },
  reportFraud: { label: "GOV.UK (Serious Fraud Office), 4 December 2025: Report Fraud, new service from City of London Police", href: "https://www.gov.uk/government/news/report-fraud-new-service-from-city-of-london-police" },
  icoBreach: { label: "ICO: Personal data breaches, a guide", href: "https://ico.org.uk/for-organisations/report-a-breach/personal-data-breach/personal-data-breaches-a-guide/" },
};

const BLOCK: TrackBlock = {
  practise: {
    kind: "reports",
    task: "Four things go wrong across one Thursday at {{firm.name}}. For each, build the report: who you tell first and how, what goes in it, and what you do while you wait. Then send it, and see a model report and what happens next.",
    scene: "{{firm.contact}} is {{firm.name}}'s named contact for anything that goes wrong. Nobody is blamed for reporting, including for a false alarm.",
    incidents: [
      {
        time: "Thu 09:40",
        title: "A link, a password and a code",
        art: "link",
        happened: "An email titled \"Mailbox almost full\" asked you to sign in to keep your messages. You clicked, typed your password and the code from your authenticator, and the page went blank. Then you noticed the address bar: mailbox-quota-help.example, not your usual sign-in page.",
        tempt: "Change the password tonight, from home. Nobody needs to know you fell for that.",
        route: [
          {
            label: "Ring {{firm.contact}} now",
            desc: "By phone, from your desk",
            grade: "best",
            why: "Fast, and on a channel the attacker cannot see. If someone is inside your mailbox now, an email about it may be read, or deleted, by them. A call reaches a person in a minute.",
          },
          {
            label: "Email {{firm.contact}} from your mailbox",
            desc: "A quick note from the account you just typed into",
            grade: "ok",
            why: "Reporting at once is what counts most, so this is safe. But the attacker may be inside that very mailbox and can read or delete your note. When the account itself may be taken over, ring.",
          },
          {
            label: "Reply to the email to ask if it is real",
            desc: "Ask the sender",
            grade: "wrong",
            why: "A reply goes straight to the attacker, tells them the address is watched, and reaches nobody who can lock your account. Report through a channel you trust, never through the message itself.",
          },
          {
            label: "Change your password tonight, and say nothing",
            desc: "Sort it yourself, later",
            grade: "wrong",
            why: "By tonight the attacker has had a whole day in your mailbox, and a new password may not end a sign-in that is already open, or undo what they set up. Only IT can see and remove that, and only once they know.",
          },
        ],
        details: [
          { text: "About 09:35: clicked a link in an email titled \"Mailbox almost full\"", useful: true, why: "When, and which email: IT can find the same message in every other inbox and pull it." },
          { text: "The fake email, forwarded to the whole team as a warning", useful: false, why: "Forwarding it hands the live link to more people. Let IT warn everyone, and pull the email for you." },
          { text: "Typed my password and my authenticator code into the page", useful: true, why: "What you typed decides what IT does: with the code as well, they treat the account as taken over, not just at risk." },
          { text: "The page was on mailbox-quota-help.example", useful: true, why: "The address lets IT block the site for everyone at {{firm.name}}." },
          { text: "A long apology, and a promise it will never happen again", useful: false, why: "There is nothing to apologise for: reporting is the right thing. The facts help; the apology only slows the report down." },
          { text: "On my work laptop, signed in to my work email", useful: true, why: "Which device and which account, so IT knows what to check and what to lock." },
          { text: "My guess at which gang is behind it", useful: false, why: "A guess adds nothing IT can act on. The facts are enough; finding out who it was is their job." },
        ],
        meanwhile: [
          {
            label: "Delete the email so nobody clicks it",
            grade: "wrong",
            why: "Deleting it removes what IT uses to find the other copies, and does nothing about the copies already in other inboxes.",
          },
          {
            label: "Open the link again to see what the page does",
            grade: "wrong",
            why: "That is investigating it yourself, and may hand over more. Leave the looking to IT.",
          },
          {
            label: "Leave the email where it is, and do what IT says",
            grade: "best",
            why: "The email is evidence: IT uses it to find and pull every copy. Carry on only if they say so, and follow their steps exactly.",
          },
          {
            label: "Unplug the laptop and switch it off",
            grade: "ok",
            why: "Not harmful, but only do it if IT asks. Switching off can lose what IT needs to see, and the danger here is your account, which lives online, not only the laptop.",
          },
        ],
        model: {
          to: "{{firm.contact}}",
          via: "by phone, at 09:41",
          lines: [
            "\"I clicked a link in an email called Mailbox almost full, at about 09:35, and typed my password and my authenticator code into the page.\"",
            "\"The page was on mailbox-quota-help.example. It was my work laptop and my work email.\"",
            "\"I haven't deleted the email. What would you like me to do?\"",
          ],
        },
        after: [
          { time: "09:41", text: "You ring {{firm.contact}}." },
          { time: "09:44", text: "IT finds a sign-in to your account at 09:37 from a device nobody knows, signs it out everywhere and resets your password." },
          { time: "09:47", text: "IT removes a rule the attacker added at 09:39 to forward a copy of your email to an outside address." },
          { time: "09:55", text: "The same email is pulled from 14 other inboxes before anyone else clicks." },
        ],
        ifQuiet: "A password change tonight would have come a working day late. The forwarding rule would have copied your email to a stranger all day, and the same email would still have been sitting in 14 inboxes.",
      },
      {
        time: "Thu 11:20",
        title: "The wrong Sam",
        art: "mail",
        happened: "You send the client contact list (240 clients, with names, emails and phone numbers) to Sam Patel in Marketing for the newsletter. The address filled itself in: it went to sam.patel@hartwellgroup.example, a Sam at another firm. No reply yet.",
        tempt: "Recall it and ask that Sam to delete it. Nobody else needs to know.",
        route: [
          {
            label: "Email that Sam yourself and ask them to delete it",
            desc: "Sort it out directly",
            grade: "wrong",
            why: "Well meant, but it is the firm's breach to handle, and a second email from you is one more thing that can go wrong. {{firm.contact}} decides who contacts the other firm, and what it is asked.",
          },
          {
            label: "Tell your manager at the end of the day",
            desc: "When things are calmer",
            grade: "ok",
            why: "Safe, because it reaches someone, but hours late. The firm may have only 72 hours from becoming aware of a breach to report it to the ICO, and the people who decide need every one of them.",
          },
          {
            label: "Ring or walk over to {{firm.contact}} now",
            desc: "Straight away, in person or by phone",
            grade: "best",
            why: "Fast and direct. Sending personal data to the wrong person is a personal data breach, and the firm needs to start at once: contact the other firm, assess the risk, decide what must be reported.",
          },
          {
            label: "Try a recall, and say nothing if it works",
            desc: "Quietly",
            grade: "wrong",
            why: "A recall often fails, and you cannot see whether the email was read. Even if it works, the firm still has a breach to record and a decision to make. Hiding it turns a slip into a problem.",
          },
        ],
        details: [
          { text: "The client contact list: 240 names, emails and phone numbers", useful: true, why: "What went, and how much of it: that decides how serious the breach is." },
          { text: "A copy of the list, attached so {{firm.contact}} can see it", useful: false, why: "That sends the personal data again. Say where the list is saved instead; {{firm.contact}} can open it there." },
          { text: "Sent at 11:14 to sam.patel@hartwellgroup.example", useful: true, why: "When, and the exact address: the firm can reach the right people at the other firm, and knows when the clock started." },
          { text: "Whose fault it is that the address filled itself in", useful: false, why: "Nobody is being blamed, you included. What went, where and when is all the report needs." },
          { text: "No reply yet, and I have not recalled or deleted anything", useful: true, why: "What you have and have not done since, so nobody acts on a wrong guess." },
          { text: "A promise to ring every client on the list to apologise", useful: false, why: "Whether and how the clients are told is the firm's decision, made with care. A call from you could say the wrong thing." },
        ],
        meanwhile: [
          {
            label: "Ring the clients on the list to warn them",
            grade: "wrong",
            why: "The firm decides whether, and how, the people affected are told. A rushed call from you can make it worse, and spreads the news before anyone knows the risk.",
          },
          {
            label: "Leave the sent email as it is, and wait for {{firm.contact}}",
            grade: "best",
            why: "The sent email is the record of exactly what went where. Leave it, and leave the contacting to the firm.",
          },
          {
            label: "Delete the email from your Sent folder",
            grade: "wrong",
            why: "That removes the record of what went where, which the firm needs. It does not unsend anything.",
          },
          {
            label: "Try a recall, and tell {{firm.contact}} you did",
            grade: "ok",
            why: "Harmless if you say you did it, and it sometimes works. But it is not the fix: the firm still deals with it as a breach.",
          },
        ],
        model: {
          to: "{{firm.contact}}",
          via: "in person, at 11:22",
          lines: [
            "\"I sent our client contact list, 240 clients with names, emails and phone numbers, to the wrong Sam Patel at 11:14.\"",
            "\"It went to sam.patel@hartwellgroup.example. No reply yet, and I haven't recalled or deleted anything.\"",
          ],
        },
        after: [
          { time: "11:22", text: "You tell {{firm.contact}}." },
          { time: "11:40", text: "{{firm.contact}} rings the other firm, which deletes the email and confirms it in writing." },
          { time: "12:30", text: "The firm records the breach and assesses the risk to the clients. It decides whether the ICO must be told, with almost all of its 72 hours still to run." },
        ],
        ifQuiet: "If the recall had failed and nobody knew, the firm would have heard about it from a client or the other firm, perhaps weeks later and long past 72 hours. Then the silence, not the slip, would have been the problem.",
      },
      {
        time: "Thu 15:10",
        title: "A call that felt wrong",
        art: "phone",
        happened: "A caller said he was from {{firm.name}}'s IT support company, checking which remote-access app you use and when your manager is next on holiday, \"for the maintenance window\". His number showed as 01632 960452. Something felt off. You said you would rather not say, and ended the call. You gave nothing away.",
        tempt: "Nothing happened, so there is nothing to report.",
        route: [
          {
            label: "Leave it, since nothing happened",
            desc: "No harm done",
            grade: "wrong",
            why: "Nothing happened to you. The caller is still working through the staff list, and the next person may answer his questions.",
          },
          {
            label: "Mention it to the colleague at the next desk",
            desc: "Over the partition",
            grade: "ok",
            why: "Better than nothing, and they may get the same call. But it does not reach the people who can warn everyone, check with the IT company and watch for what comes next.",
          },
          {
            label: "Ring the number back to see who answers",
            desc: "Find out for yourself",
            grade: "wrong",
            why: "That is investigating it yourself, and calling back tells him your number is live. A number on the screen can be faked anyway. Pass it on and let IT check.",
          },
          {
            label: "Tell {{firm.contact}} anyway, today",
            desc: "A quick call, or a message on Teams",
            grade: "best",
            why: "A near miss is worth reporting. You saw one call; {{firm.contact}} may see a pattern, and can warn the people he rings next. Teams is fine here: nothing of yours has been taken over.",
          },
        ],
        details: [
          { text: "About 15:05, a call from 01632 960452", useful: true, why: "When, and the number shown: IT can match it with other reports, even if it was faked." },
          { text: "A word-for-word script of the call, from memory", useful: false, why: "The gist is enough. A long transcript slows the report down without changing what anyone does." },
          { text: "He asked which remote-access app I use, and when my manager is away", useful: true, why: "What he wanted shows what he is planning: a fake support session, at a time nobody senior is around." },
          { text: "My guess at which gang it was", useful: false, why: "A guess adds nothing IT can act on. The facts are enough." },
          { text: "I told him nothing and ended the call", useful: true, why: "What you did and did not say, so nobody has to wonder what he learned." },
        ],
        meanwhile: [
          {
            label: "Carry on, and if he rings back, take the time and pass it on",
            grade: "best",
            why: "There is nothing to fix on your side. If he rings again, say nothing new and add the time to your report.",
          },
          {
            label: "Post a warning with his number on social media",
            grade: "wrong",
            why: "That tells the caller he has been spotted, and puts {{firm.name}}'s business in public. Let {{firm.contact}} warn the staff.",
          },
          {
            label: "Block the number and forget about it",
            grade: "ok",
            why: "Fine for you, but he will simply use another number. The report is what protects everyone else.",
          },
        ],
        model: {
          to: "{{firm.contact}}",
          via: "on Teams, at 15:12",
          lines: [
            "\"At about 15:05 a man rang from 01632 960452, saying he was from our IT support company.\"",
            "\"He asked which remote-access app I use and when my manager is next on holiday. I told him nothing and ended the call.\"",
          ],
        },
        after: [
          { time: "15:12", text: "You message {{firm.contact}}." },
          { time: "15:30", text: "{{firm.contact}} finds two more reports this week. Someone in Finance was about to tell the caller the name of the app." },
          { time: "15:45", text: "The IT support company confirms it made no such calls. Every member of staff gets a warning with the number." },
        ],
        ifQuiet: "Three people had the call, and each thought it was nothing. Together it was a pattern, and the next person might have let the caller into their laptop.",
      },
      {
        time: "Thu 18:25",
        title: "The laptop bag on the train",
        art: "laptop",
        happened: "On the train home you reach for your bag and it is not on the rack. Your work laptop is in it: the screen lock is on, but it is still signed in to your email and the client folders. The last time you saw it was boarding the 17:52.",
        tempt: "It will turn up at lost property. Tell IT in the morning.",
        route: [
          {
            label: "Wait for lost property, and tell IT in the morning",
            desc: "It will probably turn up",
            grade: "wrong",
            why: "A whole night with a laptop signed in to your email and the client folders. A screen lock slows a thief down; it does not make the laptop safe. IT can lock it tonight, and unlock it if it turns up.",
          },
          {
            label: "Ring {{firm.contact}} now, on the number in your phone",
            desc: "Tonight, not tomorrow",
            grade: "best",
            why: "IT can lock or wipe the laptop and sign it out of everything, but only once they know. Every hour it is missing is an hour someone else could try to get in. Module 4's rule.",
          },
          {
            label: "Email IT from your phone, then call lost property",
            desc: "And hope someone reads it tonight",
            grade: "ok",
            why: "Reported, which matters most. But an email may sit unread until the morning. Ring, so a person knows now.",
          },
          {
            label: "Track it down yourself with a finder app",
            desc: "And go and get it",
            grade: "wrong",
            why: "Fetching a bag from a stranger is not your job, and may not be safe. IT can lock the laptop wherever it is; finding it is for them, lost property or the police.",
          },
        ],
        details: [
          { text: "Work laptop LT-0417, last seen boarding the 17:52, missed at 18:20", useful: true, why: "What, where and when: IT finds the right device in seconds, and lost property knows which train." },
          { text: "My laptop password, so IT can sign in and check it", useful: false, why: "Never put a password in any report, to anyone. IT does not need it to lock or wipe the laptop." },
          { text: "Screen lock on, but signed in to email and the client folders", useful: true, why: "What it can reach decides how urgent the lock is, and which passwords IT resets." },
          { text: "Whose fault it is that the rack was so far from the seat", useful: false, why: "Nobody is blamed. Facts only, and quickly." },
          { text: "I am ringing the train company's lost property next", useful: true, why: "What you are doing about it, so IT knows to expect a reference and nobody rings twice." },
        ],
        meanwhile: [
          {
            label: "Do nothing more until you hear back",
            grade: "wrong",
            why: "IT will lock the laptop, but lost property is your call to make, and the sooner the better. Report it there too, and pass on any reference.",
          },
          {
            label: "Change your work passwords from your phone yourself",
            grade: "ok",
            why: "Not harmful, but IT will reset what needs resetting, all at once and in the right order. Ask them before you do it.",
          },
          {
            label: "Post online asking if anyone has your laptop",
            grade: "wrong",
            why: "That tells whoever has it that it is a work laptop worth opening. Leave it to lost property and IT.",
          },
          {
            label: "Ring lost property, and pass any reference to IT",
            grade: "best",
            why: "After IT, lost property is the right next call. Give IT the reference, so they know at once if the laptop is found.",
          },
        ],
        model: {
          to: "{{firm.contact}}",
          via: "by phone, at 18:27",
          lines: [
            "\"My work laptop, LT-0417, is missing. I last saw it boarding the 17:52 and noticed at 18:20.\"",
            "\"The screen lock was on, but it's signed in to my email and the client folders. I'm ringing lost property next.\"",
          ],
        },
        after: [
          { time: "18:27", text: "You ring {{firm.contact}}." },
          { time: "18:33", text: "IT locks the laptop and signs it out of your email and every client folder." },
          { time: "18:45", text: "IT resets your passwords and tells you how to sign in tomorrow on a spare laptop." },
          { time: "10:15", text: "The next morning, lost property has the bag. IT checks the laptop over before you use it again." },
        ],
        ifQuiet: "Until the morning, a laptop signed in to your email and the client folders would have been in a stranger's hands, with nothing standing in the way but the screen lock.",
      },
    ],
  },
  prove: [
    {
      kind: "choose",
      stem: "Ten minutes ago you typed your work password into a page that, you now realise, was fake. Nothing odd has happened since, and it is nearly lunchtime. What do you do next?",
      options: [
        "Change your password after lunch and keep it to yourself.",
        "Report it now: ring {{firm.contact}} and say what you typed.",
        "Forward the fake email to the team so nobody else falls for it.",
      ],
      answer: 1,
      why: "Minutes matter: a stolen password can be used straight away, and only IT can see and end a sign-in that is already open. A change after lunch may come too late, and forwarding the email spreads the trap. Ring, so the report cannot be read by whoever may be in your mailbox.",
    },
    {
      kind: "choose",
      stem: "A caller claiming to be from your IT company asked for the code your authenticator shows. You refused and hung up, and gave nothing away. What do you do next?",
      options: [
        "Nothing more, since you gave nothing away and the call is over.",
        "Ring the number back to find out who it really was.",
        "Report it to {{firm.contact}}, with the time, number and request.",
      ],
      answer: 2,
      why: "A near miss is worth reporting. You saw one call, but {{firm.contact}} may see a pattern, and can warn the next person he rings. Ringing back is investigating it yourself, and tells him your number is live.",
    },
    {
      kind: "choose",
      stem: "This morning you paid a supplier's new bank details. An hour ago the real supplier rang: they never changed them. What do you do next?",
      options: [
        "Ring your bank now on its official number, and tell {{firm.contact}}.",
        "Email the new account and ask for the money back before it moves.",
        "Wait until the end of the day, in case the supplier is mistaken.",
      ],
      answer: 0,
      why: "Money paid to a criminal is moved on fast, so the bank needs to know at once: ring the number on its website or on your card, never one from the message. Emailing the account reaches the criminal. Then {{firm.contact}} can find out how the details were changed.",
    },
    {
      kind: "choose",
      stem: "You emailed a client list to the wrong person outside the firm. A colleague says you must report it to the ICO yourself, within 72 hours. What do you do next?",
      options: [
        "Fill in the ICO's breach report form yourself, tonight.",
        "Report it to {{firm.contact}} now; the firm decides on the ICO.",
        "Wait to see whether the client complains before saying anything.",
      ],
      answer: 1,
      why: "The duty to report a breach to the ICO sits with the firm, which has to assess the risk first. Your part is to tell {{firm.contact}} fast, with what went, to whom and when, so the firm has as much of its 72 hours as possible. Waiting for a complaint wastes them.",
    },
    {
      kind: "choose",
      stem: "A text on your own phone says a parcel is held and asks for a small fee by link. You have not tapped it. What do you do next?",
      options: [
        "Forward it to 7726 so the network can block the sender.",
        "Reply STOP so they take your number off their list.",
        "Tap the link to check whether the parcel is real.",
      ],
      answer: 0,
      why: "7726 is free on most UK networks, and lets your provider investigate the sender and block it if it is malicious. A reply tells them the number is live, and the link is the scam. On a work phone, tell IT as well.",
    },
  ],
};

export const AWARENESS_MODULE_8: ModuleManifest = {
  n: 8,
  slug: "report-it",
  title: "Report It",
  minutes: 15,
  course: "cyber-awareness",
  promise: "Report anything that goes wrong, fast and to the right person, with the details that help, and know what to do while you wait.",
  passMark: 4,
  shuffleOptions: true,
  dock: [
    { label: "Something gone wrong?", lines: ["Tell {{firm.contact}} straight away, by phone or in person.", "Nobody is blamed for reporting, even a false alarm."] },
    { label: "What to include", lines: ["What happened, and when.", "What you clicked, typed, sent or paid.", "Which device or account. Never a password."] },
    { label: "Outside the firm", lines: ["Scam emails: report@phishing.gov.uk", "Scam texts: forward to 7726", "Fraud: Report Fraud, 0300 123 2040 (in Scotland, Police Scotland on 101)"] },
  ],
  outro: {
    done: "You have finished Cyber Awareness.",
    pending: "That is the last module. Finish the ones you have left, and you have finished Cyber Awareness.",
    lead: "Eight modules, eight habits. Your firm's training register shows each module as you finish it. The habits are yours to keep.",
    habits: [
      { n: 1, title: "The Human Firewall", habit: "Pause, then check through a channel you already trust." },
      { n: 2, title: "Phishing & Social Engineering", habit: "Look past the display name to the real sender and where the link goes." },
      { n: 3, title: "Passwords, MFA & Access", habit: "Never share a code, and only approve a sign-in you started." },
      { n: 4, title: "Malware, Devices & Working Remotely", habit: "Keep devices locked and up to date, and report a lost one at once." },
      { n: 5, title: "Data Handling", habit: "Check who it goes to, and who can open it, before you press Send." },
      { n: 6, title: "Invoice Fraud & BEC", habit: "New bank details get a call to a number you already hold." },
      { n: 7, title: "AI-Powered Scams & Deepfakes", habit: "The call is never the proof. Check before you act." },
      { n: 8, title: "Report It", habit: "Tell {{firm.contact}} straight away. Nobody is blamed." },
    ],
  },
  learn: [
    {
      kind: "intro",
      eyebrow: "Module 8 of 8 · about 15 minutes",
      heading: "Something has gone wrong? The best time to say so is now.",
      lead: "Every module so far has ended the same way: tell {{firm.contact}} straight away, and nobody is blamed. This last one shows why that matters more than anything else in the course, what to report, how to report it, what to put in it and what to do while you wait. Then a day of things going wrong, and you write each report.",
      note: "Figures and advice come from the published pages linked on each card. The national reporting services named here are real and given exactly; every person, firm and number in the practice is invented.",
      cta: "Show me why minutes matter",
    },
    {
      kind: "cards",
      eyebrow: "Learn · why reporting fast matters",
      heading: "Minutes matter. Tap each to see why.",
      lead: "Most of what goes wrong can still be fixed, by the right person, if they hear about it in time.",
      reveal: true,
      columns: 1,
      cards: [
        {
          title: "Money moves fast",
          tag: "A payment",
          tint: "crit",
          body: "A payment to a criminal is moved on quickly. The bank can only try to stop it once it knows.",
          detail: "The NCSC's advice if you think you have been tricked into a fraudulent payment: report it to your IT department or person as soon as you can, because the sooner they know, the sooner they can help, and contact your bank directly, using its official website or phone number. Module 6 covered the check that stops a payment; this is what to do once one has gone.",
          sources: [SOURCES.ncscBpf],
        },
        {
          title: "A lost device is still signed in",
          tag: "A laptop or phone",
          tint: "crit",
          body: "A missing laptop or phone can still reach your email and files.",
          detail: "As Module 4 said, IT can lock or wipe a lost device and sign it out of everything, but only once they know. A report the same evening locks it within minutes. A report the next morning leaves it open all night.",
        },
        {
          title: "One phish, many inboxes",
          tag: "A reported case",
          tint: "warn",
          body: "Your report may be the first sign that an attack has got past the filters.",
          detail: "The NCSC describes a firm of around 4,000 staff that received 1,800 malicious emails posing as an urgent invoice. Filters stopped 1,750. Of the 50 that reached inboxes, 25 were reported, some of them after a click, and those reports were the first sign the attack had got through. 14 were clicked; 13 failed on up-to-date devices, and the one infected device was seized, investigated and cleaned within a few hours.",
          sources: [SOURCES.ncscPhishing],
        },
        {
          title: "Personal data: a 72-hour clock",
          tag: "Back to Module 5",
          tint: "I",
          body: "If personal data has gone to the wrong place, the firm may have only 72 hours to tell the ICO.",
          detail: "As Module 5 said, the firm must report a notifiable breach to the ICO within 72 hours of becoming aware of it, and the people who decide can only start once you tell them.",
          sources: [SOURCES.icoBreach],
        },
        {
          title: "Report early. Nobody is blamed",
          tag: "Why it works",
          tint: "ok",
          body: "People who report fast are the firm's best defence. Hiding a mistake makes it worse.",
          detail: "The NCSC puts it plainly to firms: \"Employees who are afraid for their jobs will not report mistakes.\" People who feel comfortable reporting can be, in its words, a valuable early warning system, so it tells firms to avoid a culture of blame and to support people to come forward even when they have clicked. At {{firm.name}}, the person who reports at once has done the right thing, whatever happened before.",
          sources: [SOURCES.ncscPhishing],
        },
      ],
    },
    {
      kind: "toggles",
      eyebrow: "Learn · what to report",
      heading: "Not sure? Report it. Flip each to see why.",
      lead: "You do not have to be certain anything is wrong, or know what it was. Report it, and let the people who can check do the checking.",
      toggles: [
        { label: "Something you clicked, typed, opened, approved or paid, and now doubt", off: "You think: it is probably fine, and I would look silly.", on: "Report it: if it was a trick, the minutes after are when IT can still stop it. If it was fine, they tell you so in a minute." },
        { label: "A lost or stolen laptop, phone or pass", off: "You think: it will turn up.", on: "Report it now: IT can lock it and sign it out of everything, and unlock it if it turns up." },
        { label: "Data sent, shared or shown to the wrong person", off: "You think: I will recall it and ask them to delete it.", on: "Report it: it may be a breach the firm has to assess, and the ICO's clock may already be running." },
        { label: "A suspicious call or message, even though you did nothing", off: "You think: nothing happened, so there is nothing to say.", on: "Report it: a near miss. Yours may be the third report of the same caller, and the next colleague may not say no." },
        { label: "Something that just feels off", off: "You think: I cannot even say what is wrong.", on: "Report it anyway: a pop-up you did not expect, a sign-in you do not recognise, a colleague's account acting oddly. A feeling is enough to ask." },
      ],
      note: "A report that turns out to be nothing costs a minute, and is never a waste of anyone's time.",
    },
    {
      kind: "cards",
      eyebrow: "Learn · reporting inside the firm",
      heading: "Who, how, and what to do while you wait. Tap each.",
      reveal: true,
      columns: 2,
      cards: [
        {
          title: "Tell {{firm.contact}} first",
          tag: "Who",
          tint: "ok",
          body: "{{firm.contact}} is {{firm.name}}'s named contact. Tell them before anyone else.",
          detail: "If {{firm.name}} gives you a report button in your mail app or a service desk route, use it for a suspicious email. Anything you clicked, typed, sent, paid or lost goes to {{firm.contact}} straight away as well. Out of hours, use the route your firm has given you, tonight, not tomorrow.",
        },
        {
          title: "Through a channel you trust",
          tag: "How",
          tint: "ok",
          body: "Ring, walk over, or start a new message. Never reply to the suspicious message itself.",
          detail: "A reply goes to the attacker. And if your own account may be the one taken over, an email about it can be read, or deleted, by whoever is inside it: the NCSC tells firms to bear in mind that staff may be unable to use their normal means of communication when a device is compromised. So ring.",
          sources: [SOURCES.ncscPhishing],
        },
        {
          title: "Keep the evidence",
          tag: "While you wait",
          tint: "I",
          body: "Do not delete the email, the text, the file or the call log.",
          detail: "What arrived, and what you did with it, is what IT uses to find every other copy and to work out what happened. Leave it where it is. A screenshot helps, if it is quick and safe to take.",
        },
        {
          title: "Do not investigate, or forward it round",
          tag: "While you wait",
          tint: "warn",
          body: "No opening the link again, no ringing the number back, no warning email with it attached.",
          detail: "Each of those can hand over more, or spread the trap further. The NCSC's advice is not to click on any links in a suspicious email. Leave the looking to IT, and let them warn everyone.",
          sources: [SOURCES.ncscEmail],
        },
        {
          title: "Disconnect only if IT says so",
          tag: "While you wait",
          tint: "I",
          body: "Do not pull the plug, switch off or wipe anything on your own.",
          detail: "Switching off can lose what IT needs to see, and when an account is at risk, the danger lives online, not only on the laptop. If IT asks you to disconnect, do exactly what they say.",
        },
        {
          title: "Money moved? Ring the bank now",
          tag: "Straight away",
          tint: "crit",
          body: "Use the number on the bank's website or on your card. Not a number from the message.",
          detail: "The NCSC's advice is to contact your bank directly, using its official website or phone number, and to tell your IT department or person as soon as you can. If you have lost money, tell your bank and report it as a crime: the next screen has where. Then tell {{firm.contact}}.",
          sources: [SOURCES.ncscBpf, SOURCES.ncscWhatToDo],
        },
      ],
    },
    {
      kind: "cards",
      eyebrow: "Learn · reporting outside the firm",
      heading: "The national services, and what the firm decides. Tap each.",
      lead: "At work, tell {{firm.contact}} first: they may report it for the firm, or ask you to. These are the services, given exactly.",
      reveal: true,
      columns: 1,
      cards: [
        {
          title: "Scam emails",
          tag: "To the NCSC",
          tint: "I",
          body: "Forward a scam email to the NCSC's Suspicious Email Reporting Service: report@phishing.gov.uk.",
          detail: "The NCSC launched the service in April 2020. It asks people to forward emails they are not quite sure about, even if they are not certain they are scams, because it can check. It analyses the email and any websites it links to. For an email in your work inbox, follow {{firm.name}}'s route first; from your own inbox, forward it straight there.",
          sources: [SOURCES.ncscEmail, SOURCES.sersLaunch],
        },
        {
          title: "Scam texts",
          tag: "To your network",
          tint: "I",
          body: "Forward a scam text to 7726. It is free.",
          detail: "Most UK phone providers are part of a scheme that lets customers forward suspicious texts to 7726 for free. Your provider can then investigate where the text came from and block or ban the sender if it is malicious. The NCSC adds that a scam that reached you on a work phone or laptop should go to your IT department too.",
          sources: [SOURCES.ncscText, SOURCES.ncscWhatToDo],
        },
        {
          title: "Fraud and cyber crime",
          tag: "Report Fraud",
          tint: "crit",
          body: "Report Fraud took over from Action Fraud on 4 December 2025 as the national place to report fraud and cyber crime.",
          detail: "In England, Wales and Northern Ireland, report at reportfraud.police.uk or on 0300 123 2040, the same number Action Fraud used. In Scotland, report to Police Scotland on 101. If money has gone, ring your bank first. For a fraud against {{firm.name}}, {{firm.contact}} decides who reports it.",
          sources: [SOURCES.reportFraud, SOURCES.ncscEmail],
        },
        {
          title: "The ICO and regulators",
          tag: "The firm decides",
          tint: "warn",
          body: "You do not report {{firm.name}} to the ICO or a regulator yourself. The firm does.",
          detail: "The ICO's guide puts the duty to report a personal data breach on the organisation, and expects it to make sure staff know how to escalate a security incident to the right person or team. That is your part: tell {{firm.contact}} fast, with the facts. The firm decides what goes to the ICO or any regulator, and when.",
          sources: [SOURCES.icoBreach],
        },
      ],
    },
    {
      kind: "contact",
      eyebrow: "Learn · what goes in a report",
      heading: "Short, factual and fast. Here is what to say.",
      lead: "You do not need the whole story, or to know what it was. {{firm.contact}} needs enough to act in the first few minutes.",
      script: [
        "What happened, and when: \"I clicked a link in an email at about 09:35.\"",
        "What you clicked, typed, opened, sent or paid: \"I typed my password and my code.\"",
        "Which device, and which account: \"My work laptop, my work email.\"",
        "What you have done since: \"I haven't deleted anything.\"",
        "A screenshot, if it is quick and safe. Never forward the suspicious message round, and never put a password in a report.",
      ],
      note: "Then do what they ask, and leave the fixing to them. Next: a day of things going wrong at {{firm.name}}, and you write each report.",
    },
  ],
  tracks: everyDesk(BLOCK),
};
