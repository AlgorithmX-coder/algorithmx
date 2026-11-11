"use client";

import { ExplainLab, PasteLab, PromptLab, TrustLab } from "../learn/copilotLabs";
import { CheckFigure, CopilotFigure, DraftFigure, ExcelCopilotFigure, PasteFigure, PromptFigure } from "../learn/figures/copilot";
import { ComposeLab, type Draft } from "../learn/labs";
import type { LabProps, ModuleManifest } from "../learn/types";

/* Module 12: AI as your assistant (criteria AI-1 to AI-4). What Copilot is
 * good and bad at; asking it for a draft with the facts, the reader and the
 * tone; asking it to explain a formula; checking what it wrote against the
 * facts; and what must never go in. Copilot here is scripted, not live AI
 * (owner, 2026-11-10), so every lab and job gives the same honest result:
 * good drafts with planted mistakes, a confident wrong count, and no
 * refusals, so the checking is always the learner's.
 *
 * House copy rules: UK English, plain words, short sentences, no
 * em-dashes. Quiz options are kept to similar lengths so the right answer
 * is never the obvious longest one. */

/* ---------- Lesson 4: checking what it wrote ---------- */

function CheckLab(p: LabProps) {
  return (
    <ComposeLab
      {...p}
      tasks={[
        {
          scenario:
            "Copilot drafted this reply to Leah Morgan at Bright Cafe. Check it against Priya's note, fix it in the email, then press Send.\n\nPriya's note: 20 cases of lids at £11.40 a case. That's £228.00, plus VAT of £45.60: £273.60 in total. Delivery on Friday 13 November. No other offers.",
          to: "leah@brightcafe.example",
          write: ["body"],
          prefill: {
            subject: "Re: Price for lids",
            body: "Hi Leah,\n\nThanks for your order. Here's your price for 20 cases of lids at £11.40 a case: £228.00, plus VAT of £45.60, so £237.60 in total.\n\nWe'll deliver them on Thursday 12 November, and as a thank you, delivery is free on this order.\n\nKind regards,\nNorthfield Supplies",
          },
          rules: [
            { label: "The total adds up", test: (d: Draft) => /273\.60/.test(d.body) && !/237\.60/.test(d.body), hint: "Add up £228.00 and £45.60 yourself, and compare it with the total in the draft. Copilot swapped two digits." },
            { label: "The day matches Priya's note", test: (d) => /friday/i.test(d.body) && /\b13\b/.test(d.body) && !/thursday|\b12 nov/i.test(d.body), hint: "Check the delivery day and date against Priya's note, and change it to match." },
            { label: "Nothing Priya didn't offer", test: (d) => !/free/i.test(d.body), hint: "Read it for anything Priya's note doesn't say. She says no other offers, so that sentence comes out." },
            { label: "It still says 20 cases at £11.40", test: (d) => /\b20\b/.test(d.body) && /11\.40/.test(d.body), hint: "Keep what was right: 20 cases at £11.40 a case." },
          ],
        },
        {
          scenario: "Copilot drafted this update to Sarah. Check it against Tom's email, fix it, then press Send.\n\nTom Hale's email: the 2 missing pallets from order 4417 will arrive on Wednesday 11 November, before 10:00.",
          to: "sarah.patel@northfieldsupplies.example",
          write: ["body"],
          prefill: {
            subject: "Harlow's missing pallets",
            body: "Hi Sarah,\n\nTom Hale from Harlow Packaging has confirmed the 3 missing pallets from order 4471 will arrive on Wednesday 11 November, before 10:00. He's also agreed to refund the delivery charge.\n\nThanks",
          },
          rules: [
            { label: "The number of pallets matches Tom's email", test: (d) => /\b(2|two)\b/i.test(d.body) && !/\b3\b|\bthree\b/i.test(d.body), hint: "Check how many pallets Tom says are missing." },
            { label: "The order number matches", test: (d) => /4417/.test(d.body) && !/4471/.test(d.body), hint: "Check the order number digit by digit against Tom's email. Copilot swapped two of them." },
            { label: "Nothing Tom didn't say", test: (d) => !/refund/i.test(d.body), hint: "Read it for anything Tom's email doesn't say, and take it out." },
            { label: "It still says Wednesday 11 November, before 10:00", test: (d) => /wednesday/i.test(d.body) && /\b10\b|10:00/.test(d.body), hint: "Keep the day and time: they were right." },
          ],
        },
      ]}
    />
  );
}

const m12: ModuleManifest = {
  id: "m12",
  number: 12,
  title: "AI as your assistant",
  intro: "Copilot can draft an email, explain a formula or summarise a page in seconds. In five short lessons you will learn what it is good at, how to ask for what you need, how to check what it gives you, and what must never go into it.",
  outcomes: [
    "Know what AI like Copilot and ChatGPT is good at, and where it guesses",
    "Ask Copilot for a draft with the facts, who it's for and the tone",
    "Get a formula explained in plain words, then use it yourself",
    "Check a draft line by line against the facts, and fix it before it goes",
    "Keep customer details, passwords and payroll out of AI tools",
  ],
  topics: [
    {
      id: "m12t1",
      title: "What AI is good and bad at",
      minutes: 9,
      brief: "Copilot is an AI assistant built into the Microsoft apps you use at work. In this lesson you will see the whole of it, find out what it does well, and learn where it gets things wrong.",
      learn: [
        {
          heading: "Here is Copilot",
          body: [
            "This is Copilot, the AI assistant in Microsoft 365. Every part is numbered, and the list underneath says what each one is.",
            "You type what you want in the prompt box (9). In a few seconds, Copilot writes an answer (4). The rest of this lesson is about when you can trust that answer.",
          ],
          figure: <CopilotFigure />,
        },
        {
          heading: "What AI is, in plain words",
          figure: <CopilotFigure focus={["asked", "answer"]} title="You ask, it writes" />,
          body: [
            "AI tools like Copilot have read a huge amount of writing. From that, they are very good at working out which words should come next, so they can write an email, a summary or an explanation that reads well.",
            "What they don't do is know things the way you do. Copilot hasn't been to your warehouse, and it wasn't on yesterday's phone call. It only knows what you tell it (3) and what's in the files it can see.",
          ],
        },
        {
          heading: "What it's good at: the words",
          figure: <CopilotFigure focus={["answer"]} title="Good at: drafting, summarising, explaining" what={{ answer: "Here, a draft written from facts you gave it. Quick, clear and friendly: this is what it's good at." }} />,
          body: ["Use it for the words. It can draft an email from facts you give it, summarise a long email or document, explain a formula or a word you don't know, and reword something to sound more polite."],
          good: [{ text: "Draft a reply confirming the delivery: 2 pallets, Wednesday, before 10:00." }, { text: "Summarise this email in three lines." }, { text: "Explain what this formula does." }],
        },
        {
          heading: "What it's bad at: facts, numbers and dates",
          figure: <CopilotFigure focus={["refs", "note"]} title="Watch for: the references and the warning" />,
          body: [
            "It's bad at facts it doesn't have: today's stock, what a customer said on the phone, what was agreed. It's bad at numbers and dates, like a total or the day of the week. And when it doesn't know, it doesn't say so. It writes something that sounds right.",
            "The references line (5) shows what it read to answer. No reference means it was working from general knowledge, so treat any fact in the answer as a guess.",
          ],
          bad: [
            { text: "What time does Kent Bakery's van arrive?", note: "It can't know. It will still give you a time." },
            { text: "What's 15 cases at £18.00, plus VAT?", note: "Do sums in Excel or on a calculator." },
          ],
        },
        {
          heading: "You're responsible for what goes",
          figure: <CopilotFigure focus={["buttons", "note"]} title="Insert puts it in. You send it." />,
          body: [
            "Copy and Insert (6) put Copilot's words into your email in one click. From that moment they're your words. If a customer gets the wrong day, they won't blame Copilot.",
            "That's what the note under every answer (7) means. Read every line before you send.",
          ],
          tip: "A simple rule: Copilot writes the first draft. You write the last one.",
        },
        {
          heading: "Copilot and ChatGPT",
          figure: <CopilotFigure focus={["shield", "header"]} title="Copilot, signed in at work" />,
          body: [
            "ChatGPT is the best-known AI chat tool. It does the same kind of thing: you type, it writes. Copilot is Microsoft's, built into Outlook, Word, Excel and Teams, and at work you sign in to it with your work account (2).",
            "The same rules apply to both: check what it gives you, and keep private details out. Some workplaces only allow Copilot, and some allow no AI tools at all. Follow your workplace's rules.",
          ],
          tip: "Not sure whether you're allowed to use AI at work? Ask your manager before you start.",
        },
      ],
      tryIt: {
        title: "Ask Copilot six things",
        intro: "Ask Copilot each question, read its answer, and decide whether you can use it. Nothing here is really sent.",
        Lab: TrustLab,
      },
      check: [
        {
          q: "Which of these jobs is Copilot good at?",
          options: ["Summarising a long email in three lines", "Telling you how many sacks are in stock", "Saying what a customer agreed by phone"],
          answer: 0,
          reasons: [
            "Summarising text you give it is one of its strengths.",
            "It can't see the warehouse. It would guess a number and sound sure.",
            "It wasn't on the call. Anything it says would be made up.",
          ],
        },
        {
          q: "An answer has no references under it. What does that tell you?",
          options: ["It has checked the facts with your files", "It didn't read your files, so it may be guessing", "It is extra sure, so you needn't check it"],
          answer: 1,
          reasons: [
            "No reference means the opposite: it didn't read any of your files.",
            "Right. Any fact in that answer comes from general knowledge, or is made up.",
            "AI sounds just as sure when it's guessing. That's the danger.",
          ],
        },
        {
          q: "You send a reply Copilot wrote, and the day in it is wrong. Whose mistake is it?",
          options: ["Copilot's, because it wrote the email", "Nobody's, because AI mistakes don't count", "Yours, because you pressed Send"],
          answer: 2,
          reasons: [
            "Copilot wrote it, but the customer only sees who sent it.",
            "The customer still turns up on the wrong day.",
            "Whatever you send is yours, so you check it first.",
          ],
        },
      ],
      takeaways: ["Copilot is good with words: drafting, summarising and explaining.", "It's bad at facts it can't see, numbers and dates, and it guesses without saying so.", "Whatever you send is yours, so read every line first."],
    },
    {
      id: "m12t2",
      title: "Asking it to draft an email",
      minutes: 10,
      brief: "Copilot can write a reply for you inside Outlook. In this lesson you will learn what to tell it, so the draft it gives you is nearly right first time.",
      learn: [
        {
          heading: "Here is Draft with Copilot",
          body: [
            "In Outlook, Copilot can write a reply for you, right inside the email. Here's one being drafted, with every part numbered.",
            "You press Reply (1), then Copilot (2). You say what you want (3) and press Generate (4). A few seconds later, the draft (5) appears.",
          ],
          figure: <DraftFigure />,
        },
        {
          heading: "Your prompt, close up",
          figure: <PromptFigure />,
          body: ["What you type in the box is called a prompt. Here's the good one from the last picture, taken apart.", "It has four parts: what you want (1), the tone (2), who it's for (3) and the facts (4)."],
        },
        {
          heading: "The facts",
          figure: <PromptFigure focus={["facts"]} title="The facts" />,
          body: [
            "Copilot can't know the facts: how many, which day, what time. Give it every one, copied from the email or note they came from (4).",
            "Leave one out and it either writes round it (\"the change to your order\") or fills the gap with a guess.",
          ],
          good: [{ text: "Confirm his flour order is now 30 sacks, delivered on Thursday 12 November, before 10:00." }],
          bad: [{ text: "Confirm the change.", note: "Which change? When? Copilot can't know." }],
        },
        {
          heading: "Who it's for",
          figure: <PromptFigure focus={["reader"]} title="Who it's for" />,
          body: ["Say who will read it, and who they are to you: a customer, a supplier, your manager (3). Copilot uses that to choose the greeting and how formal to be."],
          good: [{ text: "to Imran Ahmed at Kent Bakery" }],
          bad: [{ text: "to him", note: "Copilot doesn't know who \"him\" is." }],
        },
        {
          heading: "The tone",
          figure: <PromptFigure focus={["tone", "ask"]} title="What you want, and how it should sound" />,
          body: ["Start with what you want (1): a reply, an email, a short note. Then say how it should sound, in a word or two (2): short, friendly, polite or formal. Without it, you get stiff, wordy emails."],
          good: [{ text: "Write a short, friendly reply ..." }, { text: "Write a polite, formal email ..." }],
          tip: "If the first draft isn't right, don't start again. Add what's missing to your prompt, and press Generate again.",
        },
        {
          heading: "Keep it, then check it",
          figure: <DraftFigure focus={["draft", "keep", "note"]} title="Keep it puts the draft in your email" />,
          body: [
            "When the draft (5) looks close, press Keep it (6). It goes into your email, where you can change it like anything you typed. Regenerate gives you another wording.",
            "And the note (7) is right: this draft has two mistakes in it, even from a good prompt. Can you see them? Lesson 4 is about finding them.",
          ],
        },
      ],
      tryIt: {
        title: "Draft a reply with Copilot",
        intro: "Write a prompt for Rita's reply and press Generate. You will see straight away whether it has the facts, who it's for and the tone.",
        Lab: PromptLab,
      },
      check: [
        {
          q: "A prompt says: \"Write a polite reply to Mr Hale at Harlow Packaging.\" What's missing?",
          options: ["The facts", "Who it's for", "The tone"],
          answer: 0,
          reasons: [
            "Right. Copilot knows who and how, but not what to say. It will write round the gap.",
            "It's there: Mr Hale at Harlow Packaging.",
            "It's there: polite.",
          ],
        },
        {
          q: "Your prompt leaves out the delivery day. What is Copilot most likely to do?",
          options: ["Ask Sarah which day it is", "Leave the day out, or guess one", "Refuse to write the email"],
          answer: 1,
          reasons: [
            "Copilot can't ask anyone. It works only from what it has.",
            "Right. Either is a problem, and a guessed day reads just like a real one.",
            "It will always write something. That's why the gaps matter.",
          ],
        },
        {
          q: "The draft is nearly right, but far too long. What's the quickest fix?",
          options: ["Send it anyway, as long is polite", "Delete it and write it all yourself", "Add \"short\" to the prompt and Generate"],
          answer: 2,
          reasons: [
            "Long emails get skimmed, and things get missed.",
            "You can, but you lose the time Copilot saved you.",
            "Right. Add what's missing to the prompt, and try again.",
          ],
        },
      ],
      takeaways: ["A good prompt gives the facts, who it's for and the tone.", "Copy the facts from where they came from: an email or a note.", "Keep it puts the draft in your email. Then you check it."],
    },
    {
      id: "m12t3",
      title: "Asking it to explain a formula",
      minutes: 9,
      brief: "Someone's left a formula in a sheet and you don't know what it does. In this lesson you will get Copilot to explain it in plain words, then use it yourself.",
      learn: [
        {
          heading: "Here is Copilot in Excel",
          body: [
            "In Excel, Copilot opens down the side of your sheet (5). It can read the sheet, so you can ask it about a formula and get an answer in plain words. Every part is numbered.",
            "Here someone asked what =COUNTIF(F:F,\"Late\") does (6), and Copilot explained it (7).",
          ],
          figure: <ExcelCopilotFigure />,
        },
        {
          heading: "Open it from the ribbon",
          figure: <ExcelCopilotFigure focus={["button", "pane"]} title="The Copilot button, and its pane" />,
          body: ["Press Copilot on the ribbon (1). The pane (5) opens beside your sheet. Press the button again, or the cross at the top of the pane, to close it."],
        },
        {
          heading: "Ask about one formula at a time",
          figure: <ExcelCopilotFigure focus={["bar", "question"]} title="The formula, and your question" />,
          body: [
            "Click the cell with the formula and look at the formula bar (3). That shows the formula itself, not just its answer.",
            "Copy it into your question (6), or click the cell and ask Copilot to explain the formula in it.",
          ],
          good: [{ text: "What does =COUNTIF(F:F,\"Late\") do?" }, { text: "Explain the formula in D15." }],
        },
        {
          heading: "Read the explanation, piece by piece",
          figure: <ExcelCopilotFigure focus={["explain", "column"]} title="The explanation, against the sheet" />,
          body: [
            "A good explanation (7) takes the formula apart. COUNTIF means \"count the cells that match\". F:F means every row of column F (4). \"Late\" is what to look for.",
            "Check it against the sheet: is column F really the Status column? Do the cells really say Late?",
          ],
        },
        {
          heading: "Then use it yourself",
          figure: <ExcelCopilotFigure focus={["cell", "bar"]} title="The formula, typed in" />,
          body: [
            "Understanding it is half the job. Now click the cell where the answer goes (2), type the formula and press Enter. Excel works out the answer: 3.",
            "A formula you typed keeps itself up to date as the sheet changes. A number Copilot told you doesn't.",
          ],
        },
        {
          heading: "Don't ask it to count for you",
          figure: <ExcelCopilotFigure focus={["note"]} title="The warning, meant" />,
          body: [
            "You can ask Copilot \"How many deliveries were late?\" and it will give you a number. It can be wrong: it reads the sheet loosely, and a note saying \"the driver rang to say he'd be late\" can get counted too.",
            "Use Copilot to understand the formula, and the formula to get the number.",
          ],
          tip: "If Copilot's number and your formula's number differ, trust the formula. Then look at why.",
        },
      ],
      tryIt: {
        title: "Explain it, then use it",
        intro: "Ask Copilot what Daniel's SUMIF does, then write the same kind of formula for another customer. This is the office's own Excel: the formula really works.",
        Lab: ExplainLab,
      },
      check: [
        {
          q: "What does F:F mean in a formula?",
          options: ["Cell F1 only", "Every row of column F", "Columns A to F"],
          answer: 1,
          reasons: ["That would be written F1.", "Right. The whole column, top to bottom.", "That would be A:F."],
        },
        {
          q: "Copilot says 4 deliveries were late. Your COUNTIF says 3. What do you tell Priya?",
          options: ["3, and look at why Copilot said 4", "4, as Copilot read the whole sheet", "Both numbers, and let her choose"],
          answer: 0,
          reasons: [
            "Right. The formula counts exactly. Copilot reads loosely, and it miscounted.",
            "Reading the whole sheet loosely is how it got it wrong.",
            "Priya asked you for the number. Give her the right one.",
          ],
        },
        {
          q: "Why type the formula in, rather than the number Copilot gave?",
          options: ["Excel won't let you type a number", "Copilot's numbers can't be copied", "The formula updates as the log changes"],
          answer: 2,
          reasons: ["You can type a number, but it never updates.", "You can copy them. They just might be wrong.", "Right. And it's worked out exactly, every time."],
        },
      ],
      takeaways: ["Press Copilot on the ribbon and ask about one formula at a time.", "Read the explanation against the sheet.", "Then type the formula yourself, and trust its answer over Copilot's count."],
    },
    {
      id: "m12t4",
      title: "Checking what it wrote",
      minutes: 9,
      brief: "Copilot's drafts read well, and that's exactly why mistakes slip through. In this lesson you will check a draft line by line against the facts, and fix it before it goes.",
      learn: [
        {
          heading: "Here is a draft, checked against the facts",
          body: [
            "This is the draft from lesson 2, kept into the reply to Imran. Beside it are the facts, from Sarah's email (1). Every part is numbered.",
            "Two things are lit red. Neither is a typo: they read perfectly well. That's why you check every line.",
          ],
          figure: <CheckFigure />,
        },
        {
          heading: "Put the facts beside the draft",
          figure: <CheckFigure focus={["facts", "draft"]} title="The facts, and the draft" />,
          body: ["Before you read the draft (2), open the email or note the facts came from (1). Not your memory, and not Copilot: the original.", "Then go through the draft one line at a time."],
        },
        {
          heading: "Tick off what matches",
          figure: <CheckFigure focus={["match"]} title="What matches" />,
          body: ["For every number, day, date, time and name in the draft, find it in the facts. 30 sacks: yes. Before 10:00: yes (3)."],
          tip: "Numbers, days, dates, times and names: check those one by one. They're where AI slips.",
        },
        {
          heading: "Fix what's wrong",
          figure: <CheckFigure focus={["day"]} title="A wrong day" />,
          body: [
            "Friday 13 November (4). Sarah said Thursday 12 November. Copilot often slips on days and dates, and it reads just as confidently when it does.",
            "Click in the email and change it, as you would fix anything you'd typed.",
          ],
        },
        {
          heading: "Take out what nobody said",
          figure: <CheckFigure focus={["offer"]} title="Something nobody said" />,
          body: ["A 10% discount (5). Nobody agreed that: Sarah said same price as always. AI fills gaps with things that sound kind or helpful. If it isn't in your facts, it doesn't go out."],
          bad: [{ text: "We'd also like to give you 10% off this order.", note: "Sounds nice. Nobody agreed it." }],
        },
        {
          heading: "Then, and only then, Send",
          figure: <CheckFigure focus={["send"]} title="Send is yours" />,
          body: ["Read it once more, as the customer will. The right day, the right amount, nothing extra? Then press Send (6). Once it's gone, the customer holds you to every word."],
        },
      ],
      tryIt: {
        title: "Fix two Copilot drafts",
        intro: "Each draft came from Copilot and has three mistakes in it. Check it against the facts, fix it in the email, then press Send.",
        Lab: CheckLab,
      },
      check: [
        {
          q: "Copilot's draft offers free delivery. The facts don't mention it. What do you do?",
          options: ["Leave it in, as customers like it", "Ask Copilot whether it's true", "Take it out: nobody agreed it"],
          answer: 2,
          reasons: [
            "Then the company owes a promise nobody made.",
            "Copilot made it up. Asking it again won't make it true.",
            "Right. If it isn't in the facts, it doesn't go out.",
          ],
        },
        {
          q: "What should you check Copilot's draft against?",
          options: ["The email or note the facts came from", "What you remember of the phone call", "A second draft from Copilot"],
          answer: 0,
          reasons: ["Right. The original is the only reliable source.", "Memory slips too. Check the written facts.", "Another draft can have the same mistakes, or new ones."],
        },
        {
          q: "Which parts of a draft most need checking word by word?",
          options: ["The greeting and the sign-off", "Numbers, days, dates and names", "How long each sentence is"],
          answer: 1,
          reasons: ["They're worth a glance, but they're rarely where the damage is.", "Right. That's where AI slips, and where mistakes cost.", "Length matters less than whether it's true."],
        },
      ],
      takeaways: ["Check the draft against the original facts, line by line.", "Numbers, days, dates and names first.", "Anything nobody said comes out before you send."],
    },
    {
      id: "m12t5",
      title: "What you must never paste in",
      minutes: 10,
      brief: "Whatever you paste into an AI tool is sent the moment you press Enter. In this lesson you will learn what must stay out, and how to take it out without losing what you need.",
      learn: [
        {
          heading: "Here is a paste, with the personal details lit",
          body: [
            "This complaint is about to go into Copilot, and every personal detail in it is lit. Every part is numbered.",
            "Underneath is the same complaint with nobody in it (7). Copilot can summarise that one just as well.",
          ],
          figure: <PasteFigure />,
        },
        {
          heading: "Names",
          figure: <PasteFigure focus={["name", "clean"]} title="A name, and what to put instead" />,
          body: ["A customer's name (1) tells Copilot who complained. It doesn't need to know. Swap the name for Customer A, Customer B, and the summary still makes sense (7)."],
          good: [{ text: "Customer A at Bright Cafe says their card was charged twice." }],
        },
        {
          heading: "Phone numbers, emails and addresses",
          figure: <PasteFigure focus={["phone", "email", "address"]} title="Ways to reach a person" />,
          body: ["Phone numbers (2), email addresses (3) and addresses (5) never help a summary. Delete them before you send."],
        },
        {
          heading: "Card details and passwords",
          figure: <PasteFigure focus={["card"]} title="Anything to do with payment" />,
          body: [
            "Anything to do with payment stays out: card numbers, even just the last four digits (4), and bank details.",
            "So do passwords and PINs. Never type a password into any AI tool, for any reason.",
          ],
        },
        {
          heading: "Pay and payroll",
          body: [
            "Some things don't go in at all, even with the names taken out: pay, payroll, overtime figures, National Insurance numbers, and anything from HR about a person.",
            "If a job needs them, do it yourself, or ask the person who looks after that information.",
          ],
          bad: [{ text: "October overtime: Jordan Miles, 12 hours, £186.00", note: "Pay. Not even with the name swapped." }],
        },
        {
          heading: "Copilot won't stop you",
          figure: <PasteFigure focus={["warning"]} title="The warning line" />,
          body: [
            "In this course's office, the paste box lights up details like these as you paste (6). Real tools may not. Either way, Copilot won't refuse: it will read whatever you send.",
            "So the check is you. Look at the box before you press Enter, every time.",
          ],
        },
        {
          heading: "Work Copilot, and free tools",
          figure: <CopilotFigure focus={["shield"]} title="Signed in with your work account" />,
          body: [
            "At work, you sign in to Copilot with your work account, shown by the shield (2), so your company's data protection covers it. Free AI tools on the internet may keep what you type, and some use it to train their next version.",
            "Never paste work information into a free tool unless your workplace says you can. And even in work Copilot, customer details, passwords and payroll stay out.",
          ],
        },
      ],
      tryIt: {
        title: "Clean it up before it goes",
        intro: "Take the personal details out of each paste, then send it. The last one is a decision: paste it, or not?",
        Lab: PasteLab,
      },
      check: [
        {
          q: "Which of these is safe to paste into Copilot?",
          options: ["A complaint with the customer's name and phone", "The same complaint, with \"Customer A\" instead", "Last month's overtime sheet, without the names"],
          answer: 1,
          reasons: ["The name and phone number are personal. Take them out first.", "Right. Nobody can be identified, and the complaint still makes sense.", "Pay figures are payroll. They stay out, names or not."],
        },
        {
          q: "Copilot doesn't stop you sending a phone number. Why not?",
          options: ["It doesn't check: keeping it out is your job", "Phone numbers are fine to give to AI", "It deletes the number before it reads it"],
          answer: 0,
          reasons: ["Right. It reads whatever you send.", "A phone number is personal. It should never go in.", "It doesn't. Once it's sent, it's sent."],
        },
        {
          q: "A friend says a free AI app is quicker. Can you paste work emails into it?",
          options: ["Yes, if you delete the chat afterwards", "Yes, it does the same thing as Copilot", "Only if your workplace says you can"],
          answer: 2,
          reasons: ["Deleting the chat doesn't undo sending it.", "It may do the same job, but it may keep what you type.", "Right. And never with customer details, passwords or pay."],
        },
      ],
      takeaways: ["No names, phone numbers, emails, addresses, card digits or passwords.", "Pay and payroll never go in, even without names.", "Swap names for Customer A, and the summary still works."],
    },
  ],
};

export default m12;
