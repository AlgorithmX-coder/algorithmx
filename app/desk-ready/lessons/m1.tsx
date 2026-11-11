"use client";

import { ChoiceLab, SortLab } from "../learn/labs";
import { ComposeFigure, EmailFigure, FileNameFigure, InboxFigure, ReplyFigure } from "../learn/figures/email";
import type { LabProps, ModuleManifest } from "../learn/types";

/* Module 1: The work inbox (criteria OL-1, OL-5, OL-6, OL-8, SAFE-1).
 * Reading a work email, who goes in To, Cc and Bcc, Reply versus Reply
 * all versus Forward, attachments, and keeping an inbox in order. The two
 * office jobs on the module page (Monday's inbox, Reply all) are where it
 * all gets used for real.
 *
 * House copy rules: UK English, plain words, short sentences, no
 * em-dashes. Quiz options are kept to similar lengths so the right answer
 * is never the obvious longest one. Every name and address is Northfield
 * Supplies, the course's pretend company. */


/* ---------- Lesson 1: what is in an email ---------- */

function ReadEmailLab(p: LabProps) {
  return (
    <ChoiceLab
      {...p}
      steps={[
        {
          prompt: "Who sent this email?",
          figure: <EmailFigure bare title="Sarah's email" />,
          options: [
            { text: "Sarah Patel", correct: true, why: "The From line always shows who sent it." },
            { text: "Daniel Okafor", why: "Daniel is on Cc. He was copied in to keep him informed, but he didn't send it." },
            { text: "You", why: "You are in To: it was sent to you, not from you." },
          ],
        },
        {
          prompt: "What is Sarah asking you to do?",
          figure: <EmailFigure bare title="Sarah's email" />,
          options: [
            { text: "Recount aisle C and update the stock sheet", correct: true, why: "That's the ask, and it sits in the first two lines where it should." },
            { text: "Reply to Daniel about the pallets", why: "Daniel is only copied in. Sarah hasn't asked you to email him." },
            { text: "Order more pallets for aisle C", why: "Nothing says to order anything. Read for the verbs: recount, update." },
          ],
        },
        {
          prompt: "By when does she need it?",
          figure: <EmailFigure bare title="Sarah's email" />,
          options: [
            { text: "By 2pm on Tuesday", correct: true, why: "She sent it on Monday and said \"2pm tomorrow\", so that's Tuesday at 2pm." },
            { text: "By 10:12 on Monday", why: "That's when the email was sent, not when the work is due." },
            { text: "There is no deadline", why: "Look again: \"by 2pm tomorrow\". Missing a deadline is the most common inbox mistake." },
          ],
        },
        {
          prompt: "Why is Daniel on Cc?",
          figure: <EmailFigure bare title="Sarah's email" />,
          options: [
            { text: "So he knows about it, without having to act", correct: true, why: "Cc means \"for your information\". The people in To are the ones who act." },
            { text: "So he can do the recount instead of you", why: "The person in To does the work. Cc is just to keep someone in the loop." },
            { text: "Because every email copies in a manager", why: "Not every email does. Sarah chose to keep Daniel informed this time." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 2: To, Cc and Bcc ---------- */

function RecipientsLab(p: LabProps) {
  return (
    <SortLab
      {...p}
      buckets={["To", "Cc", "Bcc", "Leave them off"]}
      items={[
        { text: "You are asking Priya in Accounts to pay an invoice by Friday. Where does Priya go?", bucket: 0, why: "Priya has to act, so she goes in To." },
        { text: "Your manager Daniel asked to be kept informed about that invoice.", bucket: 1, why: "Daniel only needs to know, so Cc keeps him in the loop." },
        { text: "You are emailing 40 customers about Christmas opening hours. Where do their addresses go?", bucket: 2, why: "Bcc hides the addresses from each other. Putting 40 customers in To shares everyone's email with everyone, which can break data protection rules." },
        { text: "Emma in HR, on an email about a delivery problem that has nothing to do with her.", bucket: 3, why: "Only copy people who need it. An inbox full of other people's problems gets ignored." },
        { text: "Sarah, who will fix the delivery problem you're emailing about.", bucket: 0, why: "Sarah has to act on it, so she goes in To." },
        { text: "Your team's shared mailbox, so the email is on record for the whole team.", bucket: 1, why: "It's there for information and for the record, so Cc." },
        { text: "Everyone in the company, on a reply that only says \"Thanks!\"", bucket: 3, why: "A thank-you goes to the person who helped, not to all 40 staff." },
      ]}
    />
  );
}

/* ---------- Lesson 3: Reply, Reply all and Forward ---------- */

function ReplyLab(p: LabProps) {
  return (
    <ChoiceLab
      {...p}
      steps={[
        {
          prompt: "Emma emailed 30 staff: \"Can you send me your holiday dates by Friday?\" What do you press?",
          options: [
            { text: "Reply, so only Emma gets your dates", correct: true, why: "Emma is collecting them. The other 29 don't need your holiday dates in their inbox." },
            { text: "Reply all, so everyone sees your dates", why: "29 people would get an email that's no use to them. Reply all is the classic office annoyance." },
            { text: "Forward it to Emma with your dates", why: "Forward is for sending an email on to someone new. Emma sent it, so you reply." },
          ],
        },
        {
          prompt: "A customer complains, with three of their own staff on Cc. What do you press to answer them?",
          options: [
            { text: "Reply all, so all four get your answer", correct: true, why: "They were all affected, and the customer chose to copy them in. Everyone on it should see your reply." },
            { text: "Reply, so only the sender gets it", why: "The other three would be left out, and they're waiting for an answer too." },
            { text: "Forward it to each of them one by one", why: "That takes four emails and breaks the conversation up. Reply all does it in one." },
          ],
        },
        {
          prompt: "You need Sarah to deal with a customer's email. She wasn't on it. What do you press?",
          options: [
            { text: "Forward, then put Sarah in To", correct: true, why: "Forward sends the customer's email on to someone new, with your note on top." },
            { text: "Reply all, then add Sarah to it", why: "The customer would see your internal note to Sarah. Keep internal chat internal." },
            { text: "Reply, and ask the customer to email Sarah", why: "That makes the customer do your job. Pass it on yourself." },
          ],
        },
        {
          prompt: "You forward a supplier's email to Daniel. What should you add?",
          options: [
            { text: "A line on top saying what you need from him", correct: true, why: "\"Hi Daniel, can you approve this price?\" Without a line, he has to guess why you sent it." },
            { text: "Nothing, the email speaks for itself", why: "Daniel has to read the whole thread to work out what you want. Tell him in one line." },
            { text: "A copy of the email typed out again", why: "Forward already includes it underneath. Just add your line on top." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 4: attachments ---------- */

function AttachmentLab(p: LabProps) {
  return (
    <ChoiceLab
      {...p}
      steps={[
        {
          prompt: "Priya needs to edit the stock sheet, which lives on the team's SharePoint. How do you send it?",
          options: [
            { text: "Send her a link to the file", correct: true, why: "A link opens the one real file, so everyone works on the same copy." },
            { text: "Attach a copy of the file", why: "She'd edit a copy, and the team's file wouldn't change. Now there are two versions." },
            { text: "Paste the numbers into an email", why: "She can't edit the sheet from that, and the numbers go out of date at once." },
          ],
        },
        {
          prompt: "A new supplier outside the company needs your signed letter. How do you send it?",
          options: [
            { text: "Attach it as a PDF", correct: true, why: "People outside the company can't open your SharePoint links. A PDF can't be changed by accident either." },
            { text: "Send a SharePoint link", why: "Outside people usually can't open your internal links, and you might share more than you meant to." },
            { text: "Attach the Word file", why: "It works, but anyone can change the wording. Send a PDF for anything signed or final." },
          ],
        },
        {
          prompt: "An email from an address you don't know says \"Your parcel could not be delivered\" and has an attachment called label.zip. What do you do?",
          options: [
            { text: "Don't open it, and report the email", correct: true, why: "Unexpected .zip files are a favourite way to hide something nasty. Report it, as IT would want." },
            { text: "Open it to see whose parcel it is", why: "Opening it is exactly what the scammer wants. A real courier wouldn't send a zip file." },
            { text: "Forward it to a colleague to check", why: "Now two people might open it. Report it instead." },
          ],
        },
        {
          prompt: "Your email says \"Please find the report attached.\" What should you check before you press Send?",
          options: [
            { text: "That the report really is attached", correct: true, why: "The most common email slip of all. Look for the attachment above the message." },
            { text: "That the report is written in bold", why: "Formatting doesn't matter here. Check it's actually attached." },
            { text: "That you've attached it twice to be safe", why: "Once is enough. Two copies just confuse people." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 5: folders, flags and search ---------- */

function FilingLab(p: LabProps) {
  return (
    <SortLab
      {...p}
      buckets={["Deliveries", "Invoices", "HR", "Report it"]}
      items={[
        { text: "\"Delivery booked for Thursday\" from Kent Flour Mills", bucket: 0, why: "It's about goods coming in, so Deliveries." },
        { text: "\"Invoice BC-5518 attached\" from Brightwater Cups", bucket: 1, why: "A bill to pay goes in Invoices." },
        { text: "\"Your rota for next week\" from the HR Team", bucket: 2, why: "Rotas, pay and holidays go in HR." },
        { text: "\"Your mailbox is full. Sign in within 2 hours to keep your email\" from mail-support@0utlook-help.example", bucket: 3, why: "A threat, a deadline and a sign-in link, from a fake address with a zero in it. Report it, and don't click." },
        { text: "\"Credit note for damaged wrap\" from Harlow Packaging", bucket: 1, why: "Credit notes are about money, so Invoices." },
        { text: "\"Missing delivery note for DN-40890\" from Sarah", bucket: 0, why: "It's about a delivery, so Deliveries." },
        { text: "\"Christmas holiday requests\" from Emma Clarke", bucket: 2, why: "Holidays go in HR." },
        { text: "\"Urgent: the boss needs gift cards bought today, keep it quiet\" from daniel.okafor.ceo@gmail.example", bucket: 3, why: "Your manager wouldn't use a personal address, ask for gift cards or ask you to keep it quiet. Report it." },
      ]}
    />
  );
}

const m1: ModuleManifest = {
  id: "m1",
  number: 1,
  title: "The work inbox",
  intro: "Most desk jobs start the day in an inbox. In five short lessons you will learn to read a work email quickly, send it to the right people, handle attachments safely and keep your inbox in order. Then you will do it for real in the pretend office.",
  outcomes: [
    "Read any work email and say who wants what, by when",
    "Put people in To, Cc or Bcc for the right reason",
    "Choose Reply, Reply all or Forward without a second thought",
    "Send a link or an attachment, and spot a dangerous one",
    "File, flag and search so nothing gets missed",
  ],
  topics: [
    {
      id: "m1t1",
      title: "What is in an email",
      minutes: 7,
      brief: "Every work email has the same parts. In this lesson you will learn what each one tells you, and how to find the ask in seconds.",
      learn: [
{
          heading: "Here is a whole work email",
          body: [
            "This is a real-looking email from Sarah, a supervisor at the warehouse. Almost every work email has these same ten parts, in this order.",
            "The numbers on the email match the list underneath it. Take a minute to look at each part. The next screens go through them one at a time.",
          ],
          figure: <EmailFigure />,
        },
        {
          heading: "The top: what it's about, who and when",
          body: [
            "The subject (1) is the headline. It's what you see in your inbox before you open anything.",
            "Under it: From (2) is who sent it, To (3) is who it's for, Cc (4) is anyone copied in to keep them informed, and the date and time (5) is when it was sent.",
          ],
          figure: <EmailFigure focus={["subject", "from", "to", "cc", "sent"]} title="The top of the email" />,
          tip: "Your name in To means you're expected to act. Your name in Cc usually means read it and keep it in mind.",
        },
        {
          heading: "An attachment is a file that came with it",
          body: [
            "The box with the file name (6) is an attachment: a file Sarah sent along with the email. Here it's last week's stock count, as a PDF.",
            "Click it to open it. In your inbox, a small paperclip next to an email tells you there's an attachment inside.",
          ],
          figure: <EmailFigure focus={["attachment"]} title="The attachment" />,
        },
        {
          heading: "The message: who wants what, by when",
          body: [
            "The greeting (7) says who it's for. The message (8) is the reason for the email.",
            "Read the message for three things, in this order: who wants something, what they want, and by when.",
          ],
          figure: <EmailFigure focus={["greeting", "message"]} title="The greeting and the message" />,
          good: [{ text: "\"Could you recount the pallets in aisle C and update the stock sheet by 2pm tomorrow?\"", note: "Who: Sarah. What: recount aisle C and update the sheet. By when: 2pm tomorrow." }],
          tip: "\"Tomorrow\" counts from when the email was sent (5), not from when you read it. Sent Monday means Tuesday at 2pm.",
        },
        {
          heading: "The bottom: sign-off and signature",
          body: [
            "The sign-off (9) is how the email ends, with the sender's first name.",
            "The signature (10) sits under it: full name, job title, company and phone number. It tells you who they are and how to ring them if an email isn't enough.",
          ],
          figure: <EmailFigure focus={["signoff", "signature"]} title="How it ends" />,
        },
      ],
      tryIt: { title: "Read a real email", intro: "Here's an email from Sarah. Answer four quick questions about it, as you would at your desk.", Lab: ReadEmailLab },
      check: [
        {
          q: "Which line tells you who is expected to act?",
          options: ["The To line", "The Cc line", "The time it was sent"],
          answer: 0,
          reasons: ["People in To are the ones the email is for.", "Cc is for people kept informed. They usually don't act.", "The time tells you when it was sent, not who acts."],
        },
        {
          q: "An email sent on Tuesday says \"by tomorrow\". When is that?",
          options: ["By Wednesday", "By Tuesday", "Whenever you read it"],
          answer: 0,
          reasons: ["Tomorrow counts from when the email was sent: Tuesday, so Wednesday.", "That's the day it was sent, not the deadline.", "Deadlines don't move with when you read it."],
        },
        {
          q: "Where do you usually find someone's job title and phone number?",
          options: ["In their signature", "In the subject line", "In the Cc line"],
          answer: 0,
          reasons: ["The signature at the bottom has their name, role and number.", "The subject says what the email is about.", "Cc shows who was copied in."],
        },
      ],
      takeaways: ["To means act. Cc means know.", "Read for who wants what, by when.", "Deadlines count from when the email was sent."],
    },
    {
      id: "m1t2",
      title: "To, Cc and Bcc",
      minutes: 7,
      brief: "Who you put where says a lot. In this lesson you will learn who goes in To, who goes in Cc, and the one time Bcc matters.",
      learn: [
{
          heading: "Three boxes decide who gets an email",
          body: [
            "Here's an email being written. At the top are three boxes for people: To (2), Cc (3) and Bcc (4).",
            "Who you put in which box tells each person what you expect of them. The numbers match the list underneath.",
          ],
          figure: <ComposeFigure email={{ to: "Priya Shah", cc: "Daniel Okafor", bcc: "", subject: "Invoice HP-2291: please pay by Friday", greeting: "Hi Priya,", message: ["Could you pay invoice HP-2291 from Harlow Packaging by Friday 13 November? I've checked it against the order and the delivery note, and it's right."], signoff: "Thanks,\nJordan", signature: ["Jordan Miles", "Office Administrator | Northfield Supplies", "01632 960 431"] }} />,
        },
        {
          heading: "To: the people who must act",
          body: ["Put people in To (2) when you need them to do something or reply.", "If two people need to act, put both in To and say in the message who does what."],
          figure: <ComposeFigure focus={["to"]} title="The To box" email={{ to: "Priya Shah", cc: "Daniel Okafor", subject: "Invoice HP-2291: please pay by Friday", greeting: "Hi Priya,", message: ["Could you pay invoice HP-2291 from Harlow Packaging by Friday 13 November?"], signoff: "Thanks,\nJordan", signature: ["Jordan Miles", "Office Administrator | Northfield Supplies", "01632 960 431"] }} />,
        },
        {
          heading: "Cc: the people who need to know",
          body: [
            "Cc (3) stands for carbon copy, from the days of paper. It keeps someone informed without asking them to act. Here, Daniel asked to be kept in the loop on invoices.",
            "Only copy people who really need to know. Too many Ccs and people stop reading them.",
          ],
          figure: <ComposeFigure focus={["cc"]} title="The Cc box" email={{ to: "Priya Shah", cc: "Daniel Okafor", subject: "Invoice HP-2291: please pay by Friday", greeting: "Hi Priya,", message: ["Could you pay invoice HP-2291 from Harlow Packaging by Friday 13 November?"], signoff: "Thanks,\nJordan", signature: ["Jordan Miles", "Office Administrator | Northfield Supplies", "01632 960 431"] }} />,
          bad: [{ text: "Cc: everyone in the company", note: "On a question for one person." }],
        },
        {
          heading: "Bcc: hidden copies",
          body: [
            "Bcc (4) is a blind copy: everyone in it gets the email, but nobody can see anyone else's address.",
            "Use it when you email lots of outside people who don't know each other, like 40 customers. Showing their addresses to each other can break data protection rules.",
          ],
          figure: <ComposeFigure focus={["bcc"]} title="The Bcc box" email={{ to: "You", bcc: "40 customers", subject: "Our Christmas opening hours", greeting: "Hello,", message: ["We're closed from 24 December and open again on 2 January. Orders placed by 18 December will arrive before Christmas."], signoff: "Kind regards,\nNorthfield Supplies", signature: ["Northfield Supplies", "Unit 2, Abbey Trade Park, Leicester", "01632 960 400"] }} />,
          tip: "Don't use Bcc to secretly copy your manager on a colleague's email. If someone needs to know, Cc them openly.",
        },
      ],
      tryIt: { title: "Who goes where?", intro: "For each person, choose To, Cc, Bcc or leave them off.", Lab: RecipientsLab },
      check: [
        {
          q: "You're sending a newsletter to 60 customers. Where do their addresses go?",
          options: ["In Bcc", "In To", "In Cc"],
          answer: 0,
          reasons: ["Bcc keeps every customer's address private from the others.", "Everyone would see 59 other customers' addresses.", "Cc shows every address to everyone, just like To."],
        },
        {
          q: "What does it usually mean if you're in Cc?",
          options: ["Read it, you may not need to act", "You must reply within an hour", "It was sent to you by mistake"],
          answer: 0,
          reasons: ["Cc is to keep you informed.", "Cc doesn't come with a deadline unless someone asks you by name.", "Cc is on purpose: someone wanted you to know."],
        },
        {
          q: "Two people need to do something. Where do they go?",
          options: ["Both in To, saying who does what", "One in To and one in Cc", "Both in Bcc so it stays private"],
          answer: 0,
          reasons: ["Both have to act, so both go in To. Say what each one does.", "The person in Cc might think it's not their job.", "Bcc hides them from each other, so neither knows the other got it."],
        },
      ],
      takeaways: ["To acts. Cc knows. Bcc hides addresses.", "Copy only the people who need it.", "Use Bcc for big lists of outside people."],
    },
    {
      id: "m1t3",
      title: "Reply, Reply all and Forward",
      minutes: 8,
      brief: "Three buttons, three jobs. In this lesson you will learn which one to press, so the right people get your answer and nobody else does.",
      learn: [
{
          heading: "Three buttons, three different groups of people",
          body: [
            "Every email you open has three buttons above it: Reply, Reply all and Forward. They decide who gets your answer.",
            "Here, Imran from Kent Bakery has emailed you (1), with four of his staff on Cc. Green names get your email; crossed-out names don't.",
          ],
          figure: <ReplyFigure />,
        },
        {
          heading: "Reply: just the sender",
          body: ["Reply (2) sends your answer only to the person who sent the email: Imran.", "Use it when only they need your answer, even if lots of people got the first email."],
          figure: <ReplyFigure focus={["original", "reply"]} title="Reply" />,
          good: [{ text: "Emma asked 30 people for their holiday dates. You Reply with yours, so only Emma gets them." }],
        },
        {
          heading: "Reply all: everyone on the email",
          body: ["Reply all (3) goes to the sender and everyone who was in To and Cc: here, all five people at Kent Bakery.", "Use it when everyone on the email needs your answer, like a customer who copied in their team."],
          figure: <ReplyFigure focus={["original", "replyall"]} title="Reply all" />,
          bad: [{ text: "Reply all to 30 people: \"Thanks!\"", note: "29 people now have a useless email." }],
          tip: "Before you press Reply all, look at the Cc line and ask: does every one of these people need this?",
        },
        {
          heading: "Forward: pass it on to someone new",
          body: [
            "Forward (4) sends the whole email, and its attachments, to someone who wasn't on it. You type their name in To, like Sarah.",
            "Always add a line on top saying what you need from them. And keep it internal: nobody from Kent Bakery sees what you write to Sarah.",
          ],
          figure: <ReplyFigure focus={["original", "forward"]} title="Forward" />,
          good: [{ text: "\"Hi Sarah, can you take this up with the haulier? I've replied to the customer.\"" }],
          bad: [{ text: "Reply all to the customer: \"Sarah, these people are always complaining\"", note: "The customer reads it too." }],
        },
      ],
      tryIt: { title: "Which button?", intro: "Four everyday situations. Pick the button you'd press.", Lab: ReplyLab },
      check: [
        {
          q: "Who gets your email when you press Reply all?",
          options: ["The sender and everyone in To and Cc", "Only the person who sent it", "Everyone in your contacts list"],
          answer: 0,
          reasons: ["Reply all keeps everyone on the original email.", "That's Reply.", "Reply all only goes to the people on that email."],
        },
        {
          q: "You need your manager to see a customer's email. What do you do?",
          options: ["Forward it with a line saying why", "Reply all and add your manager", "Print it out and leave it on their desk"],
          answer: 0,
          reasons: ["Forward passes it on, and your line tells them what you need.", "The customer would see what you write to your manager.", "Email is quicker, and it keeps a record."],
        },
        {
          q: "When is Reply all the right choice?",
          options: ["When everyone on it needs your answer", "Whenever more than two people are on it", "When you want to look busy and helpful"],
          answer: 0,
          reasons: ["That's the only test that matters.", "Lots of people on it doesn't mean they all need your answer.", "Extra emails make you look careless, not helpful."],
        },
      ],
      takeaways: ["Reply: just them. Reply all: everyone on it. Forward: someone new.", "Add a line on top of every forward.", "Internal notes never go in a Reply all."],
    },
    {
      id: "m1t4",
      title: "Attachments",
      minutes: 8,
      brief: "Files travel with emails all day. In this lesson you will learn when to attach a file, when to send a link instead, and how to spot an attachment you should never open.",
      learn: [
{
          heading: "Where attachments show up",
          body: [
            "An attachment is a file that travels with an email: an invoice, a delivery note, a form. When you receive one, it sits under the email's details as a box with the file's name (6).",
            "Click the box to open the file. In your inbox, a paperclip next to the email tells you there's one inside.",
          ],
          figure: <EmailFigure focus={["attachment"]} title="An attachment you've received" />,
        },
        {
          heading: "Adding one: attach a copy, or insert a link",
          body: [
            "When you write an email, there are two buttons for files (6). Attach file sends a copy of the file. Insert link sends a link to the real file on OneDrive or the team's SharePoint.",
            "Colleagues get a link, so everyone works on the one real file. People outside the company get the file attached, usually as a PDF, because they can't open your links.",
          ],
          figure: <ComposeFigure focus={["attach"]} title="Adding a file to an email you're writing" />,
          good: [{ text: "Colleague: a link to Stock November.xlsx" }, { text: "Supplier: Letter to Harlow.pdf attached" }],
        },
        {
          heading: "Say it's there, and check it's there",
          body: ["Mention the attachment in your message, so people know to look for it.", "Then check it's really attached before you press Send. Forgetting is the most common email slip of all."],
          figure: <ComposeFigure focus={["attach", "message"]} title="Mention it, then check it" />,
          good: [{ text: "\"I've attached their delivery note, which shows the 10 we received.\"" }],
        },
        {
          heading: "Read the file's name before you open it",
          body: [
            "A file's name has two parts: the name (1), then a dot and an ending (2) that says what kind of file it really is.",
            "Scammers hide harmful programs in attachments by faking the ending (3). Be wary of anything you weren't expecting, especially .zip files and anything ending in .exe.",
          ],
          figure: <FileNameFigure />,
          tip: "Not sure? Don't open it. Ask IT, or report the email. Nobody ever got in trouble for checking.",
        },
      ],
      tryIt: { title: "Send it, or stop", intro: "Four attachment moments. Choose what you'd do.", Lab: AttachmentLab },
      check: [
        {
          q: "A colleague needs to edit a file on the team's SharePoint. What do you send?",
          options: ["A link to the file", "An attached copy", "A screenshot of the file"],
          answer: 0,
          reasons: ["A link means everyone edits the same file.", "They'd edit a copy, so now there are two versions.", "They can't edit a picture."],
        },
        {
          q: "What does a file called report.pdf.exe really contain?",
          options: ["A program that will run", "A PDF report", "A Word document"],
          answer: 0,
          reasons: ["The real type is the last part, .exe: a program. Don't open it.", "The .pdf in the middle is there to fool you.", "Nothing in the name says Word."],
        },
        {
          q: "You're sending a signed letter to a customer. How should it go?",
          options: ["Attached as a PDF", "As a SharePoint link", "Typed into the email"],
          answer: 0,
          reasons: ["A PDF opens anywhere and can't be changed by accident.", "Outside people usually can't open internal links.", "A signed letter should go as the letter itself."],
        },
      ],
      takeaways: ["Colleagues get links. Outside people get PDFs.", "Mention it, then check it's attached.", "Never open an attachment you weren't expecting."],
    },
    {
      id: "m1t5",
      title: "Folders, flags and search",
      minutes: 8,
      brief: "An inbox that's in order means nothing gets missed. In this lesson you will learn to file emails into folders, flag what needs doing, find anything with search, and report what looks wrong.",
      learn: [
{
          heading: "Here is the whole inbox",
          body: [
            "This is Outlook as you'll see it at work. On the left are your folders (1) and the Inbox (2). In the middle is the list of emails (3). On the right, the email you clicked on (11).",
            "Along the top are the buttons that keep it in order: Move to (8), Flag (9), Report (10) and Search (7). The numbers match the list underneath.",
          ],
          figure: <InboxFigure />,
        },
        {
          heading: "Reading the list",
          body: [
            "Each line in the list (3) is one email: who sent it, the subject, the first words, and when.",
            "Bold with a blue bar (4) means you haven't opened it yet. A paperclip (6) means it has an attachment. The number next to Inbox (2) is how many you haven't opened.",
          ],
          figure: <InboxFigure focus={["inbox", "list", "unread", "clip"]} title="The list of emails" />,
        },
        {
          heading: "Folders: a place for everything",
          body: [
            "Most teams agree a few folders (1), like Deliveries, Invoices and HR. Once an email is dealt with, open it and use Move to (8) to file it.",
            "Aim to leave only what still needs doing in your Inbox.",
          ],
          figure: <InboxFigure focus={["folders", "moveto"]} title="Filing an email" />,
        },
        {
          heading: "Flags: what you must act on",
          body: [
            "A red flag (5) marks an email you still need to do something about. Press Flag (9) to add one, and again to clear it once it's done.",
            "Only flag what needs action. Flag everything and the flags mean nothing.",
          ],
          figure: <InboxFigure focus={["flag", "flagbtn"]} title="Flagging an email" />,
        },
        {
          heading: "Search: find anything in seconds",
          body: [
            "Type a name, a word or an order number into Search (7). Outlook looks in every folder at once.",
            "This is why good subject lines matter: they make emails easy to find later.",
          ],
          figure: <InboxFigure focus={["search"]} title="Searching" />,
          good: [{ text: "Search: 4417", note: "Every email about order 4417, wherever it was filed." }],
        },
        {
          heading: "Report what looks wrong",
          body: [
            "A scam email usually has a sender you don't know, a threat or a rush, and a link asking for your password or money.",
            "Don't click anything in it. Open it and press Report (10). It goes to Junk, and IT can warn everyone else.",
          ],
          figure: <InboxFigure focus={["report"]} title="Reporting a scam" />,
          bad: [{ text: "\"Sign in within 24 hours or your account will be closed\"" }],
        },
      ],
      tryIt: { title: "File the inbox", intro: "Eight emails from a real-looking Monday. Choose a folder for each, or report it.", Lab: FilingLab },
      check: [
        {
          q: "What should a flag on an email mean?",
          options: ["You still need to act on it", "You found it interesting", "It came from your manager"],
          answer: 0,
          reasons: ["Flags are your to-do list. Clear them when it's done.", "Interesting emails can be filed. Flags are for action.", "Who sent it doesn't decide if it needs a flag."],
        },
        {
          q: "You can't remember where you filed an email about order 4417. What's quickest?",
          options: ["Search for 4417", "Open every folder in turn", "Ask the sender to send it again"],
          answer: 0,
          reasons: ["Search looks in every folder at once.", "That works, but slowly.", "No need to bother anyone. Search finds it."],
        },
        {
          q: "An email says your password expires today and has a sign-in link. What do you do?",
          options: ["Report it without clicking", "Click the link to check", "Reply to ask if it's real"],
          answer: 0,
          reasons: ["A rush and a sign-in link are classic scam signs. Report it.", "Clicking is what the scammer wants.", "Replying tells the scammer your address is real."],
        },
      ],
      takeaways: ["File what's done. Leave only what needs doing.", "Flag only what you must act on.", "Rushed, unknown and asking for a password? Report it."],
    },
  ],
};

export default m1;
