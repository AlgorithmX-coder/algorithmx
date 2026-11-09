import type { ModuleManifest, TrackBlock } from "@/app/ai-cleared/engine/types";
import { everyDesk } from "./everyDesk";

/* Cyber Awareness, Module 5 · Data Handling. Modules 1 to 4 were about
 * attackers; this one is about the data you handle every day, and the
 * mistakes that need no attacker at all. Learn: what counts as personal
 * data and special category data, in plain words; the firm's four data
 * classes, in the firm's own names (the same ones AI Cleared uses); two UK
 * cases from the regulator (the PSNI's hidden worksheet, 2023; Central
 * YMCA's CC line, 2024); where data must not live; six checks before
 * anything leaves; paper, printers, disposal and retention; and what to do
 * when data goes to the wrong place, or someone asks for theirs.
 * Practise: an outbox before send, where each email or share is checked
 * against what you meant to do and fixed on the line that is wrong. Prove:
 * five "what do you do next?" scenarios. Same for every desk.
 *
 * Every figure and case is taken from the published pages linked on its
 * card, checked on 9 November 2026, and phrased as reported. This is not
 * legal advice: the firm's data protection contact decides. Every person,
 * firm, client and address in the practice and the scenarios is invented. */

const SOURCES = {
  icoPersonal: { label: "ICO: What is personal data?", href: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/personal-information-what-is-it/what-is-personal-data/what-is-personal-data/" },
  icoSpecial: { label: "ICO: What is special category data?", href: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/what-is-special-category-data/" },
  psni: { label: "ICO, 3 October 2024: What price privacy? Poor PSNI procedures culminate in £750k fine", href: "https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2024/10/what-price-privacy-poor-psni-procedures-culminate-in-750k-fine/" },
  ymca: { label: "ICO enforcement: The Central Young Men's Christian Association, monetary penalty", href: "https://ico.org.uk/action-weve-taken/enforcement/2024/04/the-central-young-men-s-christian-association-mpn/" },
  ymcaNews: { label: "ICO, April 2024: Persistent sensitive information breaches failing people living with HIV", href: "https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2024/04/information-commissioner-persistent-sensitive-information-breaches-failing-people-living-with-hiv/" },
  lanarkshire: { label: "ICO enforcement, 31 July 2023: NHS Lanarkshire, reprimand", href: "https://ico.org.uk/action-weve-taken/enforcement/2023/07/nhs-lanarkshire/" },
  lanarkshireNews: { label: "Infosecurity Magazine, 1 August 2023: NHS staff reprimanded for WhatsApp data sharing", href: "https://www.infosecurity-magazine.com/news/nhs-staff-reprimanded-whatsapp/" },
  icoSecurity: { label: "ICO advice for small organisations: data security advice", href: "https://ico.org.uk/for-organisations/advice-for-small-organisations/information-security/data-security-advice/" },
  icoBreach: { label: "ICO: Personal data breaches, a guide", href: "https://ico.org.uk/for-organisations/report-a-breach/personal-data-breach/personal-data-breaches-a-guide/" },
  icoDisclose: { label: "ICO, 31 July 2025: New guidance on disclosing documents to the public", href: "https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2025/07/new-guidance-on-disclosing-documents-to-the-public/" },
  icoRedact: { label: "ICO: How do we avoid an accidental breach when redacting information?", href: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/security/disclosing-documents-to-the-public-securely/how-do-we-avoid-an-accidental-breach-when-redacting-information/" },
  msSharing: { label: "Microsoft Learn: Manage sharing settings for SharePoint and OneDrive (Anyone links)", href: "https://learn.microsoft.com/en-us/sharepoint/turn-external-sharing-on-or-off" },
  icoStorage: { label: "ICO: The data protection principles, storage limitation", href: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/storage-limitation/" },
  icoSar: { label: "ICO: A guide to subject access", href: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/subject-access-requests/a-guide-to-subject-access/" },
};

const BLOCK: TrackBlock = {
  practise: {
    kind: "outbox",
    task: "Seven things are waiting in your outbox at {{firm.name}}. Before each one goes, check it against what you meant to do, and look closer where you can. If a line is wrong, press Fix this on that line. If it is all right, send it.",
    scene: "Some of them are fine as they are. Every one shows why once you decide.",
    items: [
      {
        kind: "email",
        title: "Budget draft for a second look",
        meant: "Send the Lindell family's draft budget to Sam Fielding, your colleague in Finance, for a second look before it goes to them.",
        cls: "C",
        parts: [
          {
            id: "to",
            label: "To",
            value: "Sam Whitlock <sam.whitlock@harbourlets.example>",
            external: true,
            look: { action: "Show who this is", found: "Sam Whitlock, a letting agent you emailed once in March. Your mail app offered him as soon as you typed Sam." },
            fixed: "Sam Fielding, Finance, inside the firm",
          },
          {
            id: "file",
            label: "Attachment",
            value: "Lindell budget draft.xlsx",
            look: { action: "Open it", found: "The draft you meant to send: one tab, the family's income and outgoings, nothing hidden." },
          },
        ],
        body: "Hi Sam, could you give this a quick look before I send it to the Lindells on Friday? Thanks.",
        fault: ["to"],
        why: "Your mail app offered the last Sam you emailed, and he is outside the firm: the External tag is the giveaway. A family's finances sent to a letting agent is a data breach. Read the whole name and address before you press Send, every time. The ICO suggests firms turn auto-complete off for exactly this reason.",
      },
      {
        kind: "email",
        title: "Opening hours over the holidays",
        meant: "Tell all 40 of your clients when the office closes and reopens over the holidays.",
        cls: "I",
        parts: [
          {
            id: "to",
            label: "To",
            value: "40 clients: Ashdown Bakery, Birch Lane Dental, Moxley Florists and 37 more",
            look: { action: "Show all 40", found: "info@ashdownbakery.example, accounts@birchlanedental.example, hello@moxleyflorists.example and 37 more addresses, every one shown to every client who opens the email." },
            fixed: "Your own address",
          },
          { id: "bcc", label: "Bcc", value: "(empty)", fixed: "40 clients" },
        ],
        body: "Dear all,\nOur office closes at 1pm on 24 December and reopens on 2 January. Season's greetings from everyone at {{firm.name}}.",
        fault: ["bcc", "to"],
        why: "The message is harmless; the list is not. With 40 clients in To, every one of them sees the other 39: who your clients are, and how to reach them. Put the addresses in Bcc and yourself in To, or better, use the firm's mailing tool if it has one. The ICO says getting Bcc wrong is one of the top breaches reported to it every year.",
      },
      {
        kind: "email",
        title: "Project cost summary",
        meant: "Send Rowan Tate at Tate Joinery, your client, the cost summary he asked for: the Summary and Costs tabs.",
        cls: "C",
        parts: [
          {
            id: "to",
            label: "To",
            value: "Rowan Tate <rowan@tatejoinery.example>",
            external: true,
            look: { action: "Show who this is", found: "Rowan Tate, director of Tate Joinery: your client, and the right Rowan." },
          },
          {
            id: "file",
            label: "Attachment",
            value: "Tate project costs.xlsx · tabs: Summary, Costs",
            look: {
              action: "Check for hidden tabs",
              found: "A third tab is hidden: Staff rates, with the name and salary of everyone who worked on the job.",
              table: {
                columns: ["Name", "Role", "Salary"],
                rows: [
                  ["Ada Example", "Senior", "£40,000"],
                  ["Ben Sample", "Junior", "£30,000"],
                  ["Cara Specimen", "Trainee", "£25,000"],
                ],
              },
            },
            fixed: "Tate costs for client.xlsx · tabs: Summary, Costs, copied into a new file",
          },
        ],
        body: "Hi Rowan, as promised, the cost summary for the workshop project. Any questions, just shout.",
        fault: ["file"],
        why: "Hidden is not deleted: Rowan could unhide that tab in a couple of clicks and read your colleagues' salaries. A worksheet nobody noticed is how the PSNI's breach happened. Copy only the tabs he needs into a new file, check every tab, then send that.",
      },
      {
        kind: "share",
        title: "Signed contracts 2026 (folder)",
        meant: "Give Jo Marsh, finance director at Fernhill Foods, your client, access to the signed contracts folder for this week's audit.",
        cls: "C",
        parts: [
          { id: "with", label: "Shared with", value: "Jo Marsh <jo.marsh@fernhillfoods.example>", external: true },
          {
            id: "access",
            label: "Who can open it",
            value: "Anyone with the link",
            look: { action: "What this means", found: "Anyone who ends up with the link can open the folder without signing in: Jo, anyone she forwards it to, anyone it reaches by mistake. You cannot see who has opened it." },
            fixed: "Only Jo Marsh, after she signs in",
          },
          { id: "perm", label: "They can", value: "View only" },
          { id: "ends", label: "Access ends", value: "Never", fixed: "Friday, when the audit ends" },
        ],
        fault: ["access", "ends"],
        why: "Jo is the right person, but the link is not just for her. Anyone with the link means anyone it reaches: forwarded on, pasted into a chat, sent to the wrong inbox. Share with Jo by name, so she has to sign in, and set it to end when the audit does.",
      },
      {
        kind: "email",
        title: "Incident report for the insurer",
        meant: "Send the insurer's claims team the report on the visitor who slipped in reception, with his name, address and medical details redacted.",
        cls: "R",
        parts: [
          {
            id: "to",
            label: "To",
            value: "Claims team <claims@brightwaterinsurance.example>",
            external: true,
            look: { action: "Show who this is", found: "The claims team at Brightwater Insurance, the firm's insurer. The right address." },
          },
          {
            id: "file",
            label: "Attachment",
            value: "Incident report REDACTED.pdf",
            preview: "Visitor: [[Ivo Example]], of [[1 Sample Street]], slipped on a wet floor in reception at 10:15. Injuries: [[a sprained wrist; he takes medication for epilepsy]]. First aid given on site.",
            look: { action: "Select the text", found: "Copied into another document, every word under the black boxes is still there. They were drawn on top; nothing was removed." },
            fixed: "Incident report REDACTED.pdf, redacted again with a tool that removes the text",
          },
        ],
        body: "Hello, please find attached our report on the incident of 3 November, redacted as agreed.",
        fault: ["file"],
        why: "A box drawn over text hides it from your eyes, not from the file. Anyone could copy it out and read his name, his address and his health, which is special category data. Redact with a tool that removes the text, then check by trying to select or search for it before you send.",
      },
      {
        kind: "email",
        title: "Your signed engagement letter",
        meant: "Send Grace Holt at Holt & Daughters, your new client, her signed engagement letter.",
        cls: "C",
        parts: [
          {
            id: "to",
            label: "To",
            value: "Grace Holt <grace@holtanddaughters.example>",
            external: true,
            look: { action: "Show who this is", found: "Grace Holt, managing director of Holt & Daughters: the client you are writing to." },
          },
          {
            id: "file",
            label: "Attachment",
            value: "Engagement letter, Holt & Daughters, signed FINAL.pdf",
            look: { action: "Open it", found: "The signed final version, dated today, addressed to Holt & Daughters. No tracked changes, no comments, nothing about any other client." },
          },
        ],
        body: "Dear Grace, attached is your signed engagement letter for your records. We look forward to working with you.",
        why: "Everything matches what you meant: the right Grace, the right letter, the final signed version, and nothing hidden in it. The External tag is expected, because she is the client. Ten seconds of checking, then send.",
      },
      {
        kind: "share",
        title: "Board pack, November.pdf",
        meant: "Share the November board pack with the three directors, view only, before Thursday's meeting.",
        cls: "R",
        parts: [
          { id: "with", label: "Shared with", value: "Ana Ruiz, Tom Kerr and Lena Ward, all inside the firm" },
          { id: "access", label: "Who can open it", value: "Only the people named here, after they sign in" },
          { id: "perm", label: "They can", value: "View only, no download" },
          { id: "ends", label: "Access ends", value: "Friday, the day after the meeting" },
        ],
        why: "Named people inside the firm, view only, with an end date: this is how a sensitive file should be shared. Nothing to fix. Share it.",
      },
    ],
  },
  prove: [
    {
      kind: "choose",
      stem: "You have just emailed a client's tax letter, which shows her salary and home address, to the wrong Jo: someone outside the firm. You notice a minute later. What do you do next?",
      options: [
        "Recall the message, and say nothing if the recall seems to work.",
        "Tell {{firm.contact}} now: what went, to whom, and when you sent it.",
        "Email the wrong Jo to ask her to delete it, and leave it at that.",
      ],
      answer: 1,
      why: "Speed matters. A recall often fails, and asking her to delete it may help, but it is not your call to close the matter. Sending personal data to the wrong person is a data breach, and the firm may have only 72 hours from becoming aware of it to report it to the ICO. Tell {{firm.contact}} or the data protection contact, and let them decide. Nobody is blamed for saying so fast.",
    },
    {
      kind: "choose",
      stem: "Your work laptop will not connect from home tonight, and a report full of clients' names and addresses is due first thing. What do you do next?",
      options: [
        "Email it to your personal address and finish it on your own computer.",
        "Save it to your personal cloud storage, which has a strong password.",
        "Tell your manager it may be late, and ask IT for a way to reach it.",
      ],
      answer: 2,
      why: "Both shortcuts put client data somewhere {{firm.name}} cannot protect, see or get back, and a strong password does not change who controls the account. A late report is a conversation; client data in a personal account is a breach. IT may well have a way in for you tonight.",
    },
    {
      kind: "choose",
      stem: "A client rings and says: \"I want a copy of everything you hold about me.\" She uses no formal words, and has not put it in writing. What do you do next?",
      options: [
        "Ask her to put it in writing first, or it does not count as a request.",
        "Pass it to {{firm.name}}'s data protection contact today, with the date.",
        "Send her whatever you can find in your own inbox, to save her waiting.",
      ],
      answer: 1,
      why: "It counts. The ICO says a request can be made verbally or in writing and needs no special words, and the firm has one month to answer it. The date it came in matters, so pass it on the same day. Sending bits yourself risks sending the wrong things, or someone else's data with them.",
    },
    {
      kind: "choose",
      stem: "You print a disciplinary letter about a colleague on the shared printer, get pulled into a call, and come back twenty minutes later. It is not in the tray. What do you do next?",
      options: [
        "Ask around for it, and tell {{firm.contact}} if it has not turned up.",
        "Assume someone put it in the bin, and print yourself a fresh copy.",
        "Print it again, and stand by the printer this time until it is out.",
      ],
      answer: 0,
      why: "A letter about a named colleague, missing from a shared printer, may be in someone else's hands. Look for it first; if it has not turned up, it may be a breach, and the data protection contact decides what it means. Printing it again fixes your morning, not the missing copy. Next time, collect it straight away or use secure printing.",
    },
    {
      kind: "choose",
      stem: "Your team's WhatsApp group is quicker than email. A colleague posts a photo of a client's passport so everyone can check the spelling of her name. What do you do next?",
      options: [
        "Leave it, as the group is only your own team and nobody else sees it.",
        "Say thanks, then delete the photo from your own phone to be careful.",
        "Ask them to delete it, and tell {{firm.contact}} it was shared there.",
      ],
      answer: 2,
      why: "An ID document on a personal messaging app is outside the firm's control: on every phone in the group, and in their backups. Deleting your own copy leaves everyone else's. In the NHS Lanarkshire case, a group like this had someone from outside added by mistake. Have it removed, tell {{firm.contact}}, and use the tool {{firm.name}} has approved.",
    },
  ],
};

export const AWARENESS_MODULE_5: ModuleManifest = {
  n: 5,
  slug: "data-handling",
  title: "Data Handling",
  minutes: 15,
  course: "cyber-awareness",
  promise: "Know what counts as personal data, keep it on the firm's systems, and catch the wrong recipient, the hidden tab and the open link before you press Send.",
  passMark: 4,
  shuffleOptions: true,
  dock: [
    { label: "Before you press Send", lines: ["Read the whole name and address. Is External expected?", "A group? Bcc, or the firm's mailing tool.", "Open the attachment: right version, no hidden tabs."] },
    { label: "Sharing a link", lines: ["Named people, not anyone with the link.", "View only unless they need to edit. Set an end date."] },
    { label: "Gone to the wrong place?", lines: ["Tell {{firm.contact}} straight away: what went, to whom, and when.", "The firm may have only 72 hours to report it."] },
  ],
  learn: [
    {
      kind: "intro",
      eyebrow: "Module 5 of 8 · about 15 minutes",
      heading: "A data breach can be one click on Send.",
      lead: "Not every breach needs a criminal. Plenty start with someone doing their job: an email to the wrong Sam, a spreadsheet with a tab nobody noticed, a link anyone can open. This module is about the data you handle every day: what counts as personal data, where it must never live, how to send and share it safely, and what to do the moment it goes wrong.",
      note: "The cases come from the UK regulator's published reports, linked on each card. Every person, firm, client and address in the practice is invented. This is not legal advice: {{firm.name}}'s data protection contact decides how the rules apply at your firm.",
      cta: "Show me what counts",
    },
    {
      kind: "cards",
      eyebrow: "Learn · personal data in plain words",
      heading: "About a person who could be identified? Then it is personal data. Tap each.",
      reveal: true,
      columns: 1,
      cards: [
        {
          title: "Personal data",
          tag: "In plain words",
          tint: "I",
          body: "Anything about a living person who can be identified from it, on its own or with other information.",
          detail: "A name, a home address, a date of birth, a phone number, an ID number, a photo. The ICO's guidance says a name and a work email address together are personal data too: details are not exempt because they are about work. It does not matter whether it sits in a database, a spreadsheet, an email or a note on your desk.",
          sources: [SOURCES.icoPersonal],
        },
        {
          title: "Special category data",
          tag: "Extra protection",
          tint: "crit",
          body: "The kinds of personal data that could do the most harm if they got out.",
          detail: "UK GDPR gives extra protection to data revealing someone's racial or ethnic origin, political opinions, religious or philosophical beliefs or trade union membership, and to genetic data, biometric data used to identify someone, health data, and data about their sex life or sexual orientation. Criminal records have similar rules of their own. At work it is often a sick note, an HR file or a medical report.",
          sources: [SOURCES.icoSpecial],
        },
        {
          title: "\"It's only internal\"",
          tag: "Not a reason",
          tint: "warn",
          body: "Data does not become safe because it stays inside the firm.",
          detail: "Inside the firm, only the people who need personal data should see it, and internal files have a way of leaving: forwarded, attached, uploaded. In the PSNI case a couple of screens on, details of every officer and member of staff, held for internal use, went out in a public reply. Treat every file as if it could be forwarded, because it can.",
          sources: [SOURCES.psni],
        },
      ],
    },
    {
      kind: "tiles",
      eyebrow: "Learn · {{firm.name}}'s data classes",
      heading: "Four classes, in {{firm.name}}'s own names: the same ones AI Cleared uses.",
      tiles: [
        { cls: "P", title: "Already public.", body: "On the website or in a published report. Fine to share anywhere." },
        { cls: "I", title: "Fine inside the firm, not outside it.", body: "Rotas, internal notices, a colleague's name and work email. Firm systems only, never a personal account." },
        { cls: "C", title: "Clients, deals and people.", body: "Client files, contact details, anything that identifies a person or could harm a deal. Named people only, on the firm's own systems." },
        { cls: "R", title: "The most harm if it got out.", body: "Health and HR records, salaries, ID documents, account numbers: special category data lives here. Shared only when it must be, with the right person." },
      ],
      check: {
        question: "Quick check. Which class is this?",
        snippet: "A spreadsheet of staff sickness absence, with the reason for each one.",
        options: ["I", "C", "R"],
        answer: "R",
        why: "Health information about named people is special category data, so it belongs in {{firm.name}}'s highest class, {{class.R}}. That name is on the label of every file in the practice later.",
      },
    },
    {
      kind: "cards",
      eyebrow: "Learn · how it goes wrong",
      heading: "Two UK cases, as reported by the regulator. Tap each.",
      lead: "Neither involved a criminal. Both began with an ordinary task: answering a request, sending an email.",
      reveal: true,
      columns: 1,
      cards: [
        {
          title: "Police Service of Northern Ireland, 2023",
          tag: "Public sector · UK",
          tint: "crit",
          body: "A hidden worksheet in a spreadsheet exposed every officer and member of staff.",
          detail: "The ICO reports that in August 2023 the PSNI answered freedom of information requests with a spreadsheet uploaded to the WhatDoTheyKnow website. Staff had deleted the tabs they could see, but the original worksheet, with the surnames, initials, ranks and roles of all 9,483 officers and staff, was still in the file, and the checks missed it. It was online for under three hours. In October 2024 the ICO fined the PSNI £750,000, and said simple procedures could have prevented the breach.",
          sources: [SOURCES.psni],
        },
        {
          title: "Central YMCA, 2024",
          tag: "Charity · UK",
          tint: "crit",
          body: "Emails to people on an HIV support programme, sent with CC instead of Bcc.",
          detail: "The ICO reports that emails to people on a programme for those living with HIV were sent using CC rather than Bcc, showing all 264 email addresses to everyone who received them. 166 people could be identified, or potentially identified, and anyone on the list could be taken to be living with HIV. The ICO fined the charity £7,500, reduced from an initial £300,000 in line with its public sector approach, and issued a reprimand. It says getting Bcc wrong is one of the top data breaches reported to it every year.",
          sources: [SOURCES.ymca, SOURCES.ymcaNews],
        },
      ],
      note: "A hidden tab and a CC line. The practice later is full of moments like these.",
    },
    {
      kind: "cards",
      eyebrow: "Learn · where data must not live",
      heading: "On the firm's systems, and nowhere else. Tap each.",
      lead: "Each of these feels like a shortcut. Each one takes data somewhere {{firm.name}} cannot see, protect or get back.",
      reveal: true,
      columns: 2,
      cards: [
        {
          title: "Personal email",
          tint: "crit",
          body: "Forwarding a file to your own email account to work on it at home.",
          detail: "Once it is in a personal account it is outside the firm's protection: none of the firm's sign-in rules, no way for IT to remove it, no record of where it goes next. If you cannot reach work systems from home, ask {{firm.contact}} for a way that works. Module 4 covered personal devices; personal accounts are the same door.",
        },
        {
          title: "Personal cloud storage",
          tint: "crit",
          body: "Your own online drive, to get a file from one device to another.",
          detail: "The file now sits in an account the firm does not control, often synced to every device you own, and it stays there long after you have forgotten it. Use the firm's own storage, which IT can secure and which follows the firm's rules on how long things are kept.",
        },
        {
          title: "WhatsApp and personal messaging",
          tint: "crit",
          body: "A team group chat that is quicker than email.",
          detail: "The ICO reprimanded NHS Lanarkshire in 2023. As reported, 26 staff used a WhatsApp group the health board had not approved to share patient information on more than 500 occasions over two years, and someone who was not on the staff was added by mistake. Use the messaging tool {{firm.name}} has approved, and keep client and personal details out of anything else.",
          sources: [SOURCES.lanarkshire, SOURCES.lanarkshireNews],
        },
        {
          title: "File-transfer websites",
          tint: "warn",
          body: "A free site to send a file that is too big for email.",
          detail: "A free transfer site holds a copy of what you upload on its own terms, and the link it sends can be forwarded to anyone. If a file is too big for email, use the firm's own sharing, with a link for named people, or ask IT.",
        },
        {
          title: "Personal USB sticks",
          tint: "warn",
          body: "A copy on your own stick, to take home.",
          detail: "Easy to lose, rarely encrypted, and invisible to the firm. Module 4 covered sticks from the malware side; from the data side the answer is the same: use the firm's storage, not your own stick.",
        },
        {
          title: "AI tools",
          tint: "I",
          body: "Pasting client or personal data into a chatbot to tidy it up.",
          detail: "That is AI Cleared's ground: run its paste test before anything goes into an AI tool, and use only the tools {{firm.name}} has approved.",
        },
      ],
      note: "The rule under all six: work data stays on work systems, where the firm can protect it and you can find it again.",
    },
    {
      kind: "cards",
      eyebrow: "Learn · sending and sharing safely",
      heading: "Six checks before anything leaves. Tap each.",
      reveal: true,
      columns: 2,
      cards: [
        {
          title: "The right recipient",
          tint: "crit",
          body: "Your mail app finishes the name for you. Is it the right Sam?",
          detail: "Auto-complete offers the last person you emailed with that name, inside the firm or out. The ICO's advice to organisations includes turning auto-complete off, warning senders who use CC, and a short delay before email goes, so mistakes can be caught. Whatever your settings, read the whole name and address, and look for the External tag. Sending personal data to the wrong person is one of the ICO's own examples of a data breach.",
          sources: [SOURCES.icoSecurity, SOURCES.icoBreach],
        },
        {
          title: "Bcc, not To, for a group",
          tint: "crit",
          body: "Forty clients in the To line can all see each other.",
          detail: "Every address in To or CC is shown to everyone who gets the email: who your clients are, and how to reach them. The ICO says it has seen hundreds of breach reports where someone forgot Bcc. For sensitive mailings, such as anything about health, it advises going further, with a bulk email service, mail merge or a secure transfer service. Ask what {{firm.name}} uses.",
          sources: [SOURCES.icoSecurity, SOURCES.ymcaNews],
        },
        {
          title: "The right attachment",
          tint: "warn",
          body: "Draft or final? This client's, or the last one's?",
          detail: "Open the attachment before you send it, not just the file with the same name in your downloads. Check it is the final version, for this client, with no tracked changes or comments that were never meant to leave the firm.",
        },
        {
          title: "Hidden tabs and columns",
          tint: "crit",
          body: "Hidden is not deleted.",
          detail: "Anyone can unhide a tab, column or row in a couple of clicks. The ICO's guidance on disclosing documents tells organisations to look for hidden rows, columns and worksheets, metadata and filters before anything goes out. Safest: copy only what the person needs into a new file, then check every tab. At the PSNI, a worksheet nobody saw was the whole breach.",
          sources: [SOURCES.icoDisclose, SOURCES.psni],
        },
        {
          title: "Sharing links",
          tint: "warn",
          body: "\"Anyone with the link\" means anyone who ends up with it.",
          detail: "Microsoft's own documentation says that with Anyone links, a forwarded link works for whoever has it, and you cannot track who has access. Share with named people instead, give view only unless they need to edit, and set access to end when the job does.",
          sources: [SOURCES.msSharing],
        },
        {
          title: "Redaction that removes",
          tint: "crit",
          body: "A black box drawn over text hides it from your eyes, not from the file.",
          detail: "The ICO warns that text covered only by a shape stays in the electronic file, and can be revealed by copying it into another document. Use a proper redaction tool that removes the text, then check by trying to select or search for what you removed. On paper, black marker can be read against the light: redact a copy, then photocopy or scan it.",
          sources: [SOURCES.icoRedact],
        },
      ],
      note: "One habit covers all six: before you press Send, read it as the person receiving it will.",
    },
    {
      kind: "cards",
      eyebrow: "Learn · paper, screens and keeping",
      heading: "Paper and screens count too. Tap each.",
      reveal: true,
      columns: 2,
      cards: [
        {
          title: "Clear desk",
          tint: "I",
          body: "Nothing personal left out when you leave your desk.",
          detail: "Files, notes and printouts go away when you step out, and into a locked drawer at the end of the day. Lock your screen too (Module 4 has the keys), and watch who can see it when it shows a client's details.",
        },
        {
          title: "Printers",
          tint: "warn",
          body: "A printout in the tray belongs to whoever picks it up.",
          detail: "Collect what you print straight away, and use secure printing if the firm has it, so nothing comes out until you are standing at the printer. A page missing from the tray is something to mention, not something to print again.",
        },
        {
          title: "Disposal",
          tint: "warn",
          body: "Paper with personal data goes in confidential waste, not the recycling.",
          detail: "The ICO's advice is to dispose of data securely, so it cannot be recovered, for example by shredding documents rather than putting them in general waste. Old laptops, phones and drives go back to IT, never in a drawer or a bin.",
          sources: [SOURCES.icoSecurity],
        },
        {
          title: "Keep only what you need",
          tint: "I",
          body: "Data you no longer need is risk with nothing in return.",
          detail: "The ICO's guidance is that personal data must not be kept for longer than it is needed, and that firms should set retention periods and review what they hold. Follow {{firm.name}}'s retention rules, and do not keep your own copies just in case.",
          sources: [SOURCES.icoStorage],
        },
      ],
    },
    {
      kind: "cards",
      eyebrow: "Learn · when it goes wrong, or someone asks",
      heading: "Tell your data protection contact straight away. Tap each.",
      reveal: true,
      columns: 1,
      cards: [
        {
          title: "Data gone to the wrong place",
          tag: "Hours matter",
          tint: "crit",
          body: "The wrong recipient, a lost file, something shared too widely: say so at once.",
          detail: "Sending personal data to the wrong person is a personal data breach. If a breach is likely to put people at risk, the firm must report it to the ICO within 72 hours of becoming aware of it, and if the risk is high, tell the people affected too. That clock may be running from the moment you notice. Tell {{firm.contact}} or {{firm.name}}'s data protection contact straight away: what went, to whom, and when. They decide what happens next. Do not try to tidy it up quietly. Module 8 covers how to report.",
          sources: [SOURCES.icoBreach],
        },
        {
          title: "Someone asks for their data",
          tag: "Pass it on today",
          tint: "I",
          body: "A client, a colleague or a member of the public asks what you hold about them.",
          detail: "People have a right to a copy of their personal data. The ICO says a request can be made verbally or in writing, including on social media, with no special words, and the firm must answer within one month. So a call saying \"send me everything you have on me\" counts. Pass it to {{firm.name}}'s data protection contact the same day, with the date it came in, and do not send anything yourself.",
          sources: [SOURCES.icoSar],
        },
      ],
      note: "Fast and honest beats perfect. Nobody is blamed for reporting a mistake; the harm comes from the hours nobody knew. Next: your outbox.",
    },
  ],
  tracks: everyDesk(BLOCK),
};
