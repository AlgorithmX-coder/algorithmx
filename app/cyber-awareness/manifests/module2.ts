import type { ModuleManifest, TrackBlock } from "@/app/ai-cleared/engine/types";
import { everyDesk } from "./everyDesk";

/* Cyber Awareness, Module 2 · Phishing & Social Engineering. Builds on
 * Module 1 (the five pressure buttons, the one habit) and goes inside the
 * message. Learn: a phish is a lure plus one action; the five channels;
 * how attackers make it personal; the tells that still work now the
 * spelling is perfect; the three moves when you spot one. Practise:
 * triage an inbox of emails, texts and Teams messages, looking behind
 * each sender and link, and name the tell on every phish. Prove: five
 * "what do you do next?" scenarios. Same for every desk.
 *
 * Every figure and case is taken from the published pages linked on its
 * card, checked on 9 November 2026, and phrased as reported. Every
 * message, person, firm and web address in the practice and the scenarios
 * is invented; attacker addresses all end in .example. Real brands appear
 * only as the thing being impersonated. */

const SOURCES = {
  ncscReports: { label: "NCSC: Phishing scams, how to spot and report them (figures as of September 2026)", href: "https://www.ncsc.gov.uk/information/report-suspicious-emails" },
  which: { label: "Which?, 25 June 2025: quishing scams warning, citing Action Fraud", href: "https://www.which.co.uk/news/article/quishing-scams-warning-how-to-spot-and-avoid-dodgy-qr-codes-asYsH0h6jjP1" },
  hartlepool: { label: "Hartlepool Borough Council, 25 March 2026: scam QR code on a parking machine", href: "https://www.hartlepool.gov.uk/news/article/240/warning-issued-over-scam-qr-code-on-pay-and-display-parking-ticket-machine" },
  microsoft: { label: "Microsoft Threat Intelligence, 15 May 2024 (updated June 2024): Quick Assist misused in social engineering", href: "https://www.microsoft.com/en-us/security/blog/2024/05/15/threat-actors-misusing-quick-assist-in-social-engineering-attacks-leading-to-ransomware/" },
  ncscPhishing: { label: "NCSC: Phishing attacks, defending your organisation", href: "https://www.ncsc.gov.uk/guidance/phishing" },
  ncscAi: { label: "NCSC, 24 January 2024: the near-term impact of AI on the cyber threat", href: "https://www.ncsc.gov.uk/report/impact-of-ai-on-cyber-threat" },
};

const BLOCK: TrackBlock = {
  practise: {
    kind: "inbox",
    task: "Your inbox at {{firm.name}}, late morning: emails, texts and Teams messages. Mark each one Phishing or Looks fine, and for every phish, name the tell that gives it away.",
    scene: "Look behind each one first. Hover over a sender or a link to see what is really there; on a phone, tap a sender, and press and hold a link. Nothing here opens, and flagging a genuine message costs nothing.",
    tells: [
      { id: "sender", label: "Real sender is wrong", desc: "The address, number or account behind the name is not who it claims to be." },
      { id: "lookalike", label: "Lookalike address", desc: "A web address made to look right: a swapped letter, an extra word or hyphen, a different ending." },
      { id: "link", label: "Link goes elsewhere", desc: "The words say one place; hovering, or pressing and holding, shows another." },
      { id: "share", label: "Unexpected file or share", desc: "A document, or a \"shared with you\" notice, that you were not expecting." },
      { id: "process", label: "Skips the normal process", desc: "Asks you to do it a different way from usual: a new site, an outside account, just this once." },
    ],
    messages: [
      {
        channel: "email",
        time: "09:12",
        from: "{{firm.name}} HR",
        realFrom: "hr-notices@staff-benefits-portal.example",
        subject: "Your 2027 holiday allowance has been updated",
        text: "Hi, your holiday allowance for next year has been recalculated. Please sign in with your work account to check your new total and confirm your carry-over days by Friday.",
        link: { label: "Check my allowance", href: "https://staff-benefits-portal.example/m365/sign-in" },
        tells: ["sender", "link"],
        why: "The name says {{firm.name}} HR, but the address behind it is not your firm's at all, and the button goes to the same outside site, which wants your work sign-in. Curiosity and a Friday deadline do the rest. Check your allowance on the intranet, the way you normally would.",
      },
      {
        channel: "teams",
        time: "09:30",
        from: "Leah Brennan",
        realFrom: "Leah Brennan, inside {{firm.name}}, no External label",
        text: "Morning! Notes from yesterday's client call, as promised. Shout if I missed anything.",
        file: "Client call notes.docx",
        why: "A colleague inside your firm, with no External label, sending the notes she said she would send after a call you were both on. You were expecting this file.",
      },
      {
        channel: "sms",
        time: "09:41",
        from: "07700 900417",
        realFrom: "07700 900417, not in your contacts",
        text: "We tried to deliver a parcel to your office today. Pay the £1.45 redelivery fee to choose a new slot:",
        link: { label: "parcel-rebook-uk.example/r/7Hk2", href: "https://parcel-rebook-uk.example/r/7Hk2" },
        tells: ["lookalike", "sender"],
        why: "Read the web address: a made-up site dressed to look official, not a courier's own, sent from an unknown mobile number. The small fee is the hook; what they want is the card details you type. Expecting a parcel? Track it on the courier's own site, typed in yourself.",
      },
      {
        channel: "email",
        time: "10:05",
        from: "Martin Hale",
        realFrom: "martin.hale@tidemillestates.example",
        subject: "Martin Hale shared \"Signed heads of terms.pdf\" with you",
        text: "You have been sent a secure document. Open it to view and download.",
        file: "Signed heads of terms.pdf",
        link: { label: "Open document", href: "https://tidemill-secure-docs.example/view?id=88231" },
        tells: ["share", "link"],
        why: "The address really is your client Martin's, and that is the trap: client accounts get taken over, then the real address sends the phish. You were not expecting a document, and the button goes to a site that is not Tidemill's. Call Martin on the number you already have.",
      },
      {
        channel: "email",
        time: "10:22",
        from: "Gemma Price",
        realFrom: "gemma.price@brackwaterlune.example",
        subject: "Re: year-end timetable",
        text: "Thanks for the call this morning. As agreed, I will upload the draft accounts to our client portal on the 14th, and we can go through them together on the 16th. Nothing needed from you before then.",
        link: { label: "Brackwater & Lune client portal", href: "https://portal.brackwaterlune.example" },
        why: "From your accountant's usual address, following up a call you really had, and the link goes to her firm's own portal on the same domain as her email. It asks nothing of you today. Worth remembering that address.",
      },
      {
        channel: "teams",
        time: "10:48",
        from: "IT Help Desk",
        realFrom: "IT Help Desk, an account from helpdesk-support365.example, outside your firm",
        external: true,
        text: "Hi, this is IT. We have seen a lot of spam hitting your mailbox this morning. Accept a remote support session and I will clear it for you now. Two minutes.",
        link: { label: "Start support session", href: "https://remote-session-help.example/join/4471" },
        tells: ["sender", "process", "link"],
        why: "Read the External label: this account is outside your firm, whatever it calls itself. Your own IT team messages you from inside {{firm.name}}, and does not start remote sessions from a link in a chat. Microsoft has reported criminals using exactly this approach. Call IT on the number you already have.",
      },
      {
        channel: "email",
        time: "11:15",
        from: "Gemma Price",
        realFrom: "gemma.price@brackwater-lune.example",
        subject: "Draft accounts ready early",
        text: "Good news, the drafts are ready ahead of the 14th. We have moved to a new file sharing site, so please sign in with your work email to download them. The link expires tonight.",
        link: { label: "Download draft accounts", href: "https://bl-fileshare.example/login" },
        tells: ["lookalike", "process", "link"],
        why: "Compare it with Gemma's real email above: brackwater-lune, with a hyphen, instead of brackwaterlune. One character. She said the drafts would come through the usual portal on the 14th; a new site, a sign-in and a deadline tonight all skip that. Someone knew about your real conversation. Call Gemma on the number you have.",
      },
      {
        channel: "sms",
        time: "11:40",
        from: "Tom Ellis",
        realFrom: "Tom Ellis, your manager, saved in your contacts: 07700 900182",
        text: "Running ten minutes late for the 2pm. Start without me, I'll catch up.",
        why: "A saved contact, in his normal tone, telling you something and asking for nothing: no link, no code, no favour. Nothing to check.",
      },
    ],
  },
  prove: [
    {
      kind: "choose",
      stem: "You are parking for a client meeting. A sticker on the pay machine says the card reader is faulty and to scan a QR code to pay by app instead. What do you do next?",
      options: [
        "Scan it, then pay once the page shows the parking firm's logo.",
        "Pay through the official app or the number on the car park signs.",
        "Scan it, and pay by card only if the page address starts https.",
      ],
      answer: 1,
      why: "You cannot see where a QR code goes until you have scanned it, and fake stickers on parking machines are a reported trick. A logo and https prove nothing: fake sites have both. Use the app or phone number on the official signs, or pay another way.",
    },
    {
      kind: "choose",
      stem: "An email from \"Microsoft 365\" says your mailbox is nearly full and asks you to sign in to keep your messages. The logo is right and the English is perfect, but the address behind the name is one you do not recognise. What do you do next?",
      options: [
        "Report it with the report button, and leave the link alone.",
        "Sign in, since the page looks exactly like the one you use.",
        "Reply to ask Microsoft support whether it is really from them.",
      ],
      answer: 0,
      why: "Perfect branding and spelling prove nothing now; the address behind the name is the tell. A reply goes straight to the attacker. Report it so it can be blocked for everyone, and if you are worried about your mailbox, open Outlook the way you always do.",
    },
    {
      kind: "choose",
      stem: "A Teams chat from \"IT Support\", marked External, says your laptop needs an urgent security fix and asks you to accept a screen-sharing session now. What do you do next?",
      options: [
        "Accept, but watch the screen closely so you can stop it in time.",
        "Ask in the same chat for their staff ID before you accept it.",
        "Decline it, then call IT yourself on the number you already have.",
      ],
      answer: 2,
      why: "External means the account is outside your firm, whatever it is called; your own IT team works from inside. An ID typed into the same chat proves nothing, and watching does not stop someone who already has control. Decline, then check with IT through a channel you already trust.",
    },
    {
      kind: "choose",
      stem: "Your manager is on leave and her out-of-office names you as cover. An email from a client's address you know asks: \"As she's away, could you send me the signed engagement letter and the team's mobile numbers today?\" What do you do next?",
      options: [
        "Send them, since the client has a real reason to need them both.",
        "Look closely at the address, then call the client on a known number.",
        "Reply asking the client to confirm before you send anything at all.",
      ],
      answer: 1,
      why: "An out-of-office tells a stranger who is away and who covers. Check the address for a lookalike, and do not rely on a reply: if the address is fake, or the client's mailbox has been taken over, the attacker answers. Call the client on the number you already hold.",
    },
    {
      kind: "choose",
      stem: "A WhatsApp message from an unknown number: \"Hi, it's your managing partner, this is my new number. Are you free? I need a quick favour.\" The profile photo is the partner's. What do you do next?",
      options: [
        "Reply to ask what the favour is before agreeing to anything.",
        "Save the new number, as the profile photo is the partner's.",
        "Check with the partner on their usual number or on Teams.",
      ],
      answer: 2,
      why: "A new number and a vague favour is a lure built to get a reply; the real request comes next. A profile photo can be copied from the firm's website. Check through a channel you already have: their usual number, Teams, or their assistant.",
    },
  ],
};

export const AWARENESS_MODULE_2: ModuleManifest = {
  n: 2,
  slug: "phishing-and-social-engineering",
  title: "Phishing & Social Engineering",
  minutes: 15,
  course: "cyber-awareness",
  promise: "Look past the display name and the perfect logo to the tells that still give a phish away, on any channel.",
  passMark: 4,
  shuffleOptions: true,
  dock: [
    { label: "The one habit", lines: ["Pause. Then check through a channel you already trust."] },
    { label: "The five tells", lines: ["The real sender behind the name", "A lookalike web address", "Where the link really goes", "A file or share you did not expect", "Anything that skips the normal process"] },
    { label: "Spotted one?", lines: ["Do not click, reply or scan. Report it, or tell {{firm.contact}}.", "Clicked already? Tell them straight away. Nobody is blamed for reporting."] },
  ],
  learn: [
    {
      kind: "intro",
      eyebrow: "Module 2 of 8 · about 15 minutes",
      heading: "A phish is a lure plus one action.",
      lead: "Module 1 gave you the five pressure buttons and the one habit: pause, then check through a channel you already trust. This module goes inside the message itself: how a phish is put together, the ways it reaches you, how attackers make it personal, and the few tells that still work when the spelling and the logo are perfect.",
      note: "The figures and cases here come from published reports, linked on each card so you can read them yourself. Every message, person and web address in the practice is invented.",
      cta: "Show me how it is built",
    },
    {
      kind: "cards",
      eyebrow: "Learn · how a phish is built",
      heading: "The lure gets your attention. The action is what they want. Tap each action.",
      lead: "The lure is the story: a parcel, a pay rise, a shared file, a problem with your account. It exists only to get you to do one of five things.",
      reveal: true,
      columns: 2,
      cards: [
        { title: "Click", tint: "warn", body: "\"Track your parcel.\" \"View the document.\"", detail: "The link takes you to a page they control, built for the next step: a sign-in form, a download, a payment page. The click is how they move you off the message and onto their ground." },
        { title: "Sign in", tag: "Most common", tint: "warn", body: "\"Your session has expired. Sign in to continue.\"", detail: "A copy of a real sign-in page sends your password to them. Your work login opens your email, files and Teams, and lets them phish your colleagues as you. Module 3 covers how your sign-in is protected." },
        { title: "Open", tint: "warn", body: "\"Invoice attached.\" \"Martin shared a file with you.\"", detail: "A file that does the work for them, or a share notice that is really a link to a fake sign-in page. Module 4 goes deeper into files." },
        { title: "Reply", tint: "warn", body: "\"Are you at your desk? I need a quick favour.\"", detail: "No link at all, so filters often let it through. The reply starts a conversation, and the conversation is the attack: a favour, a document, a change of details." },
        { title: "Pay", tint: "warn", body: "\"Our bank details have changed.\"", detail: "Money straight out, often by changing the bank details on a real invoice. Module 6 covers it in full." },
      ],
      note: "Spot the action and you know what the message is for. If it is an action you would never normally take from a message like this, stop there.",
    },
    {
      kind: "cards",
      eyebrow: "Learn · how it reaches you",
      heading: "Not just email. Five ways in. Tap each.",
      lead: "The lure and the action stay the same; only the channel changes. Attackers pick the one you trust most at that moment.",
      reveal: true,
      columns: 1,
      cards: [
        {
          title: "Email",
          tag: "Still the biggest",
          tint: "I",
          body: "A message dressed as a colleague, a supplier, a bank or Microsoft.",
          detail: "By September 2026, the NCSC's scam reporting service had received more than 59.6 million reports, and those reports had led to 263,700 scams being taken down across 466,300 web addresses. Those are only the ones people chose to report.",
          sources: [SOURCES.ncscReports],
        },
        {
          title: "Text messages",
          tag: "Smishing",
          tint: "I",
          body: "A text about a parcel, a fine, a refund or your bank, with a link.",
          detail: "Texts feel personal and urgent, a phone shows only part of a web address, and the name at the top of a text can be faked. A familiar sender name on a text proves nothing.",
        },
        {
          title: "Phone calls",
          tag: "Vishing",
          tint: "I",
          body: "A caller from \"the bank\", \"IT\" or \"a supplier\".",
          detail: "A voice adds pressure and leaves nothing to inspect. In Module 1's M&S case, it was reported that help desk staff were talked into resetting passwords. Hang up, and call back on a number you already have.",
        },
        {
          title: "QR codes",
          tag: "Quishing",
          tint: "crit",
          body: "A code on a poster, a parking machine or in an email, hiding a web address.",
          detail: "You cannot read where a QR code goes before you scan it. Which? reported, citing Action Fraud, that £3.5m was lost to reported QR code scams in 2024, with fake stickers on car park payment machines a common trick, and warned that QR codes in emails can be used to disguise phishing links. In March 2026 Hartlepool Borough Council warned drivers after a scam code was found on a pay and display machine at Seaton Carew.",
          sources: [SOURCES.which, SOURCES.hartlepool],
        },
        {
          title: "Chat apps, and Teams from outside",
          tag: "Teams · Slack · WhatsApp",
          tint: "crit",
          body: "A message from \"Help Desk\" or \"IT Support\" in your work chat, from an account outside your firm.",
          detail: "Microsoft reported in 2024 that a criminal group flooded people's inboxes with spam, then contacted them by phone and through Microsoft Teams, from accounts named things like \"Help Desk\" and \"IT Support\", offering to fix the problem. Once let in through a remote support tool, the group in several cases went on to deploy Black Basta ransomware. Microsoft's advice: check for the External label on messages from outside your firm.",
          sources: [SOURCES.microsoft],
        },
      ],
      note: "Whatever the channel, Module 1's habit holds: leave the channel the request came in on, and check through one you already trust.",
    },
    {
      kind: "cards",
      eyebrow: "Learn · how they make it personal",
      heading: "Spear-phishing: a message written for you. Tap each.",
      lead: "A mass phish goes to thousands of people. A spear-phish is written for one, using things anyone can look up.",
      reveal: true,
      columns: 2,
      cards: [
        { title: "LinkedIn", tag: "Your profile", tint: "C", body: "Your job title, your manager, your new role, the event you just went to.", detail: "Enough to write as your manager, a recruiter or someone you met last week. A post about starting a new job is a favourite: new starters do not yet know how things are normally done, or who is who." },
        { title: "The firm's website", tag: "Team pages", tint: "C", body: "Who works where, the partners' names, your clients, your office address.", detail: "That is how a fake email can name your real colleague and a real client in its first line, and sound like someone who knows the firm." },
        { title: "Out-of-office replies", tag: "Auto-reply", tint: "C", body: "\"I'm away until Monday. For anything urgent, contact Sam in accounts.\"", detail: "One automatic reply tells a stranger who is away, for how long, and who to write to instead. Now they can email Sam \"on behalf of\" someone who cannot be reached to check. Keep external auto-replies short: say when you are back, not who covers for you." },
        {
          title: "Put together",
          tag: "Polished and personal",
          tint: "crit",
          body: "A message that names your manager, your client and your deadline, in perfect English.",
          detail: "The NCSC warns that attackers use what is freely available on a firm's website and social media to make spear-phishing more convincing, and that spear-phishing is even harder to spot than ordinary phishing. In 2024 it also assessed that generative AI can help attackers write convincing lures without the translation, spelling and grammar mistakes that often give phishing away.",
          sources: [SOURCES.ncscPhishing, SOURCES.ncscAi],
        },
      ],
      note: "Personal is not the same as genuine. A message that knows your name, your manager and your client still has to pass the check.",
    },
    {
      kind: "toggles",
      eyebrow: "Learn · the tells that work",
      heading: "Forget the typos. Look under the surface.",
      lead: "Spelling and logos prove nothing now. These five tells still work. Flip each switch to see what the message is hiding.",
      toggles: [
        { label: "Show the real sender", off: "From: IT Service Desk", on: "From: IT Service Desk <servicedesk@it-support-portal.example>. Anyone can type any display name. The address behind it is the part that counts, and this one is not your firm's." },
        { label: "Read the web address letter by letter", off: "From: Pellow & Strand Couriers <bookings@pe11owstrand.example>", on: "Look again: pe11owstrand, with the number 1 where each l should be. Lookalikes swap letters (rn for m, 1 for l), add a word or a hyphen, or change the ending. Your usual courier writes from pellowstrand.example." },
        { label: "See where the link really goes", off: "Button: Open in OneDrive", on: "Goes to: https://onedrive-files-share.example/sign-in. The words on a button are just words. Hover over it on a computer, or press and hold it on a phone, and read the real address before you do anything." },
        { label: "Question the shared file", off: "Leah Brennan shared \"Q4 bonus figures.xlsx\" with you.", on: "You were not expecting it, and opening it asks you to sign in again. A share notice is a link with a familiar name on it. If you were not expecting it, ask Leah another way first." },
        { label: "Compare it with the normal way", off: "\"Our system is down, so send the client list to my personal email for now.\"", on: "A different system, a personal address, a new website, \"just this once\": anything that skips the normal route is a tell on its own, however genuine the sender looks." },
      ],
      note: "One tell is enough to stop and check. No tell is not proof it is safe: an account that has been taken over sends from the real address.",
    },
    {
      kind: "cards",
      eyebrow: "Learn · what to do",
      heading: "Spotted one? Three moves. Tap each.",
      reveal: true,
      columns: 1,
      cards: [
        { title: "Do not click, reply or scan", tint: "crit", body: "Not even to ask \"is this really you?\", or to unsubscribe.", detail: "A reply tells them the address is live and watched, and pulls you into a conversation with the attacker. An unsubscribe link in a phish is just another link. Leave it where it is." },
        { title: "Report it", tint: "warn", body: "Use your firm's report button if you have one, or tell {{firm.contact}}.", detail: "A report lets the people who look after {{firm.name}}'s systems block the sender and warn everyone else who got the same message. It takes seconds. Module 8 covers reporting in full." },
        { title: "Check through a channel you already trust", tint: "ok", body: "If it might be real, ask the sender another way.", detail: "Call the number you already have, open the website by typing it yourself or from a bookmark, or message the person in a new chat you start. A real request survives the check." },
      ],
      note: "Clicked already, or typed something in? Tell {{firm.contact}} straight away, as in Module 1. Fast and honest beats perfect.",
    },
  ],
  tracks: everyDesk(BLOCK),
};
