"use client";

import { CvFigure, LineFigure } from "../learn/figures/cv";
import { InterviewFigure, StarFigure } from "../learn/figures/interview";
import { JobAdFigure, ProfileFigure } from "../learn/figures/jobsites";
import { ExcelTestFigure, TypingFigure, TypingResultFigure } from "../learn/figures/tests";
import { AdvertLab, InterviewLab, LineLab, TestsLab, type AdItem, type LineTask } from "../learn/m13Labs";
import type { LabProps, ModuleManifest } from "../learn/types";
import { WordLab } from "../learn/wordLab";
import { pagesOf } from "../office/cv";
import { samePath, type OfficeFile, type WordDoc } from "../office/types";
import { docText, isFakeHeading, para, placeholdersIn } from "../office/word";

/* Module 13: Show what you can do (criteria WD-1, WD-4, WIN-1, XL-1,
 * XL-5). Experience in office words; a one-page CV; job sites, job alerts
 * and fake jobs; the typing and Excel tests agencies set; and video
 * interviews with STAR answers. Two office jobs follow on the module page:
 * a CV made from the learner's own week, and the agency's tests.
 *
 * House copy rules: UK English, plain words, short sentences, no
 * em-dashes. Quiz options are kept to similar lengths so the right answer
 * is never the obvious longest one. Real sites (Indeed, LinkedIn) are named
 * in words only; every drawn site, firm and person is invented. */

/* ---------- Lesson 1: experience in office words ---------- */

const LINE_TASKS: LineTask[] = [
  {
    before: "Worked on the tills at a corner shop.",
    role: "shop job",
    hint: "Think: how many customers, and what happened at closing time?",
    example: "Handled cash and card payments for up to 200 customers a day, and cashed up with the takings right every night.",
  },
  {
    before: "Worked in a warehouse.",
    role: "warehouse job",
    hint: "Think: what did you check or pack, and how much of it?",
    example: "Checked 40 pallets a shift against the delivery notes, and reported any shortages before they were signed for.",
  },
  {
    before: "Looked after my kids and ran the house.",
    role: "years at home",
    hint: "Think: money, appointments, the school run.",
    example: "Ran a household budget of about £1,800 a month with every bill paid on time, and organised school and health appointments for three children.",
  },
];

function OfficeWordsLab(p: LabProps) {
  return <LineLab {...p} tasks={LINE_TASKS} />;
}

/* ---------- Lesson 2: a CV for a desk job ---------- */

const fake = (t: string) => para(t, "normal", { bold: true, size: 16 });
const SKILLS = ["Took and checked customer orders by phone and email, about 60 a week", "Cashed up the till and recorded the takings every evening", "Kept the cake order book up to date for a team of three"];

function deeCv(): WordDoc {
  return {
    template: "CV.dotx",
    blocks: [
      para("Dee Walsh", "title"),
      para("Leicester · [Phone number] · [Email address]"),
      fake("Profile"),
      para("Friendly and reliable, with seven years serving customers in a busy bakery. Looking for a receptionist or office job in Leicester."),
      fake("Skills"),
      ...SKILLS.map((s) => para(s)),
      fake("Experience"),
      para("Retail Assistant, Market Street Bakery", "h2"),
      para("April 2018 to August 2025"),
      para("Served up to 150 customers a day and handled cash and card payments", "bullet"),
      para("Trained two new starters on the till", "bullet"),
      fake("Education"),
      para("Leicester College, Functional Skills English Level 2, 2024"),
      para("References available on request."),
    ],
  };
}

const findBlock = (d: WordDoc | null, text: string) => d?.blocks.find((b) => b.text.trim().toLowerCase() === text.toLowerCase());
const isDeePdf = (f: OfficeFile) => f.kind === "pdf" && !f.seeded && /Dee Walsh/.test(f.doc ? docText(f.doc) : "");

function CvLab(p: LabProps) {
  return (
    <WordLab
      {...p}
      tasks={[
        {
          scenario:
            "Dee's CV is nearly ready to send to an agency. Put these right in Word, then save it:\n\n1. Profile, Skills, Experience and Education are bold Normal text. Click in each and pick Heading 1.\n2. Type over the placeholders: her phone is 07700 900218 and her email is dee.walsh@email.example.\n3. Make the three lines under Skills bullet points.\n4. File > Export > Create PDF. Save it in OneDrive > Documents, named Dee Walsh CV.",
          files: [{ id: "lab-dee", path: ["OneDrive", "Documents"], name: "Dee Walsh CV.docx", kind: "docx", modified: "Today 09:02", by: "Dee Walsh", doc: deeCv(), seeded: true }],
          open: "lab-dee",
          rules: [
            { label: "Profile, Skills, Experience and Education are Heading 1", test: (d) => ["Profile", "Skills", "Experience", "Education"].every((h) => findBlock(d, h)?.style === "h1") && !d?.blocks.some(isFakeHeading), hint: "Click in the word Profile, then click Heading 1 in the Styles box. Do the same for the other three. Picking a style clears the bold and the size." },
            { label: "No placeholders left: her phone and email are in", test: (d) => !!d && placeholdersIn(d).length === 0 && /07700 900218/.test(docText(d)) && /dee\.walsh@email\.example/i.test(docText(d)), hint: "Click [Phone number] once and type 07700 900218. Click [Email address] and type dee.walsh@email.example." },
            { label: "The three skills are bullet points", test: (d) => SKILLS.every((s) => findBlock(d, s)?.style === "bullet"), hint: "Click in each skill line and press Bullets in the Paragraph group on the Home tab." },
            { label: "Still fits on one page", test: (d) => !!d && pagesOf(d) === 1, hint: "The status bar should say Page 1 of 1. Take out anything you added by mistake." },
            { label: "Saved as Dee Walsh CV.pdf in OneDrive > Documents", test: (_, s) => s.files.some((f) => isDeePdf(f) && f.name === "Dee Walsh CV.pdf" && samePath(f.path, ["OneDrive", "Documents"])), hint: "File > Export > Create PDF. In the box, stay in OneDrive > Documents, type Dee Walsh CV as the name and press Save." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 3: Indeed and LinkedIn ---------- */

const ADS: AdItem[] = [
  {
    ad: { title: "Admin Assistant", employer: "Redhill Lane Opticians", location: "Leicester LE2", pay: "£12.75 an hour", hours: "Part-time, 25 hours a week", text: "Answer the phone, book appointments and keep patient records up to date. Full training given.", apply: "Apply now" },
    scam: false,
    why: "A named employer you can look up, normal pay, a clear job, and you apply through the site.",
  },
  {
    ad: { title: "Data Entry from Home", employer: "Online Admin Solutions", location: "Remote", pay: "£400 a day", hours: "Flexible", text: "Earn £400 a day typing at home. Pay a £35 registration fee and we'll send your login.", apply: "Pay fee and start" },
    scam: true,
    why: "It asks you to pay to start. Employers pay you, never the other way round. And £400 a day for typing is far too good to be true.",
  },
  {
    ad: { title: "Receptionist", employer: "Castlegate Builders Merchants", location: "Leicester LE4", pay: "£24,000 a year", hours: "Full-time, permanent", text: "Greet trade customers, answer the phone and take orders. Interviews on site: bring proof of your right to work in the UK.", apply: "Apply now" },
    scam: false,
    why: "Employers must check your right to work in the UK, so being asked to bring proof to an interview is normal. Nothing is asked for up front.",
  },
  {
    ad: { title: "Office Assistant", employer: "Recruiting now", location: "Leicester", pay: "£28,000 a year", hours: "Full-time", text: "You've been chosen! To secure your interview, send your bank details and a photo of your passport to our HR team today.", apply: "Message HR: 07700 900914" },
    scam: true,
    why: "Bank details and a passport photo before an interview, by message, to someone with no company name. That's how identities get stolen.",
  },
  {
    ad: { title: "Data Entry Clerk, 3 months", employer: "Pennyford Recruitment", location: "Loughborough", pay: "£13.10 an hour", hours: "Full-time, temporary", text: "Our client needs a data entry clerk for a busy order office. You'll take our typing and Excel tests before we put you forward.", apply: "Apply now" },
    scam: false,
    why: "Agencies advertise for their clients and test you first. That's normal. An agency never charges you to find you work.",
  },
  {
    ad: { title: "Mystery Shopper and Admin", employer: "Big UK Brands", location: "Anywhere", pay: "£650 a week", hours: "Pick your own hours", text: "We'll post you a cheque. Pay it in, keep £200 for yourself, and send the rest back to us by bank transfer.", apply: "Reply to this advert" },
    scam: true,
    why: "A cheque to pay in and money to send back is an old scam: the cheque bounces days later, and the money you sent is gone.",
  },
];

function JobSitesLab(p: LabProps) {
  return <AdvertLab {...p} items={ADS} />;
}

const m13: ModuleManifest = {
  id: "m13",
  number: 13,
  title: "Show what you can do",
  intro: "Getting the job is a job in itself. In five short lessons you'll put what you've done into office words, write a one-page CV, use job sites safely, practise the tests agencies set, and get ready for a video interview. Then you'll do it for real: a CV for an agency, and the agency's own tests.",
  outcomes: [
    "Describe your experience, paid or not, in the words offices use",
    "Write a one-page CV with real headings, saved as a PDF with your name",
    "Read a job advert, set up job alerts and spot a fake job",
    "Pass a typing test and an Excel test of the kind agencies set",
    "Set up for a video interview and answer with a STAR story",
  ],
  topics: [
    {
      id: "m13t1",
      title: "Your experience, in office words",
      minutes: 9,
      brief: "You've done more office work than you think. In this lesson you'll take things you've done, in a shop, a warehouse, at home or as a volunteer, and say them the way an office job advert does.",
      learn: [
        {
          heading: "Here is one line of experience, before and after",
          body: [
            "On the yellow note is how most people first write it (1). Underneath is the same job on a CV: the job title and employer (2), the dates (3), then one line that says what was done.",
            "That line has four parts: a doing word (4), the task in office words (5), a number (6), and what it led to (7). The next cards take each in turn.",
          ],
          figure: <LineFigure />,
        },
        {
          heading: "Start with a doing word",
          body: [
            "Every line starts with a word for what you did (4): Handled, Kept, Checked, Organised, Logged.",
            "It reads as action, and it saves space. Leave out \"I\", and never start with \"Responsible for\": that says what was expected of you, not what you did.",
          ],
          figure: <LineFigure focus={["verb"]} title="A doing word" />,
          good: [{ text: "Handled cash and card payments", note: "Says what you did." }],
          bad: [{ text: "Responsible for the till", note: "Says what you were supposed to do." }],
        },
        {
          heading: "Name the task in office words",
          body: [
            "Office adverts use words like payments, records, stock, orders, bookings and customers. Your work used them too (5), even if nobody called it that.",
            "Cash on a till is payments. A stock count is records. Rebooking a hospital appointment is scheduling.",
          ],
          figure: <LineFigure focus={["task"]} title="The task, in office words" />,
          tip: "Read three adverts for the job you want and note the words they repeat. Use the ones that are true for you.",
        },
        {
          heading: "Put a number on it",
          body: ["A number (6) lets the reader picture it: 200 customers a day is a busy shop; 40 pallets a shift is a busy warehouse.", "Use a true number, or a fair round one, like \"about 200\". You may be asked about it, so pick one you can explain."],
          figure: <LineFigure focus={["number"]} title="A number" />,
        },
        {
          heading: "Say what it led to",
          body: ["End with why it mattered (7): the money was right, nothing was missed, a customer came back.", "If there's no result to tell, the line can stop after the number. It still beats the plain version."],
          figure: <LineFigure focus={["result"]} title="What it led to" />,
        },
        {
          heading: "Job title, employer and dates",
          body: ["Above the lines go what you were and where (2), then the dates (3), month and year.", "Newest job first. A gap is fine: if you were caring for someone or raising a family, say so, as the next card shows."],
          figure: <LineFigure focus={["role", "dates"]} title="What you were, where and when" />,
        },
        {
          heading: "Work that wasn't a paid job",
          body: [
            "Caring for someone, raising a family, volunteering: all of it counts. Give it a title, like Carer for a family member (2), and the same kind of line.",
            "Organising appointments, medicines and letters is scheduling and record keeping. Running a home on a budget is managing money.",
          ],
          figure: <LineFigure example="caring" focus={["role", "verb", "task", "number", "result"]} title="Caring, in office words" what={{ before: "How a carer might first write it.", role: "A title for unpaid work, so it reads like the jobs around it." }} />,
          good: [{ text: "Ran a household budget of about £1,800 a month, with every bill paid on time" }, { text: "Kept a community food bank's stock list up to date every Saturday for two years" }],
        },
        {
          heading: "True, every word",
          body: ["Everything on your CV must be true. An interviewer will pick a line and say \"tell me about that\".", "Making it sound good is fine. Making it up is not: no jobs you didn't do, no skills you can't show, no qualifications you don't have."],
          figure: <LineFigure example="warehouse" focus={["number"]} title="A warehouse job, in office words" what={{ number: "True, and easy to explain: \"we had about 40 pallets on a normal shift\"." }} />,
          bad: [{ text: "Managed the whole warehouse", note: "Not if you didn't. One question and it falls apart." }],
        },
      ],
      tryIt: { title: "Say it in office words", intro: "Three plain lines from three different lives. Write each one again for a CV.", Lab: OfficeWordsLab },
      check: [
        {
          q: "Which line works best on a CV?",
          options: ["Handled cash and card payments for up to 200 customers a day", "Responsible for the tills and helping customers when needed", "I worked on the tills and I am good with people"],
          answer: 0,
          reasons: ["A doing word, the task in office words, and a number.", "Says what was expected, not what you did, and gives no number.", "Starts with \"I\", and \"good with people\" can't be checked."],
        },
        {
          q: "You cared for your dad for three years. What goes on your CV?",
          options: ["A carer entry, with what you organised", "Nothing at all: it wasn't a paid job", "A gap in the dates, with no reason"],
          answer: 0,
          reasons: ["It's real experience: appointments, medicines, paperwork.", "Unpaid work counts, and it explains the dates.", "An unexplained gap raises questions. Say what you were doing."],
        },
        {
          q: "An interviewer asks about a line on your CV. What makes that easy?",
          options: ["Every line is true, and you can explain it", "Every line uses the longest words you know", "Every line copies the wording of the advert"],
          answer: 0,
          reasons: ["Then any line is an easy story to tell.", "Long words don't help if you can't back them up.", "Borrow their words only where they're true for you."],
        },
      ],
      takeaways: ["A doing word, the task, a number, what it led to.", "Caring, raising a family and volunteering all count.", "True, every word: you'll be asked about it."],
    },
    {
      id: "m13t2",
      title: "A CV for a desk job",
      minutes: 10,
      brief: "A recruiter looks at a CV for about 30 seconds before deciding. In this lesson you'll see a whole one-page CV, part by part, then put one right in Word.",
      learn: [
        {
          heading: "Here is a whole one-page CV",
          body: [
            "This is Jordan's CV, open in Word. It fits on one page (10), and the file has Jordan's name in it (1).",
            "From the top: the name (2), how to reach Jordan (3), a short profile (4), then the sections, each with a heading (5): skills (6), experience (7) and education (8), with references at the end (9).",
          ],
          figure: <CvFigure />,
        },
        {
          heading: "Thirty seconds to make an impression",
          body: ["A recruiter's eye goes to the name (2), down the headings (5), and stops at the skills (6). That's often all they read before deciding whether to call.", "So your three best lines go in Skills, near the top, where they'll be seen."],
          figure: <CvFigure focus={["name", "headings", "skills"]} title="Where a recruiter looks" />,
        },
        {
          heading: "Your name and how to reach you",
          body: [
            "Your name, in the Title style (2). Underneath, on one line: your town, a phone number and an email address (3).",
            "Leave off your home address, your date of birth and a photo: UK employers don't need them, and a CV gets passed around. In this course's practice, use a made-up number like 07700 900461, and Leicester as your town.",
          ],
          figure: <CvFigure focus={["name", "contact"]} title="Name and contact line" />,
          tip: "Use an email address with your name in it, not an old nickname.",
        },
        {
          heading: "A short profile",
          body: ["Two or three lines (4): who you are, what you're good at, and the job you want.", "Write it last, once the rest is done: it sums up the page."],
          figure: <CvFigure focus={["profile"]} title="The profile" />,
          good: [{ text: "Organised and calm under pressure, with six years on the tills and a week's office placement. Looking for an office administrator job in Leicester." }],
          bad: [{ text: "A hard-working team player who can also work on their own.", note: "Everyone writes this. It says nothing about you." }],
        },
        {
          heading: "Skills: three lines in your own words",
          body: ["Three lines (6), each a skill an office needs, said the way you did it. Use what you learned in lesson 1: a doing word, the task, a number.", "Write them in your own words. Recruiters see the same stock phrases all day, and a copied line tells them nothing about you."],
          figure: <CvFigure focus={["skills"]} title="Skills" />,
        },
        {
          heading: "Experience, newest first",
          body: ["Each job (7): the title and employer on one line, the dates under it, then two or three lines on what you did.", "Newest first, so the office placement sits above the shop job. Older or less useful jobs can have one line, or none."],
          figure: <CvFigure focus={["experience"]} title="Experience" />,
        },
        {
          heading: "Education and references",
          body: ["Education (8): where, what and when. Courses count: a college course, Functional Skills, this course.", "References (9): one line is enough. Have two names ready, such as a past manager and someone who knows your work, and ask them first."],
          figure: <CvFigure focus={["education", "refs"]} title="Education and references" />,
        },
        {
          heading: "Real headings, and one page",
          body: [
            "Each section heading (5) uses the Heading 1 style, not bold text made bigger. The CV template has them ready: type over the words and the style stays.",
            "Keep it to one page. Check the status bar says Page 1 of 1 (10). If it doesn't, cut the oldest lines first.",
          ],
          figure: <CvFigure focus={["headings", "pages"]} title="Headings and pages" />,
        },
        {
          heading: "Save it as a PDF, with your name",
          body: ["Make a PDF: File > Export > Create PDF. It looks the same on any computer, and nobody can change it by mistake.", "Name it your name, then CV (1): Jordan Miles CV.pdf. A recruiter with a hundred files called CV.pdf will thank you."],
          figure: <CvFigure focus={["file"]} title="The file name" />,
          good: [{ text: "Jordan Miles CV.pdf" }],
          bad: [{ text: "CV final new.pdf", note: "Whose is it? Which one?" }],
        },
      ],
      tryIt: { title: "Put a CV right", intro: "Dee's CV is nearly ready for the agency. Give it real headings, fill the gaps, make the skills bullet points and save it as a PDF.", Lab: CvLab },
      check: [
        {
          q: "What goes on the contact line of a CV?",
          options: ["Your town, phone number and email", "Your full home address and postcode", "Your date of birth and a photo"],
          answer: 0,
          reasons: ["Enough to reach you, and nothing a stranger shouldn't have.", "Your town is enough. A CV gets passed around.", "UK employers don't need either, and shouldn't ask."],
        },
        {
          q: "Your CV runs onto a second page. What do you do?",
          options: ["Cut the oldest and least useful lines", "Make the writing smaller until it fits", "Leave it: more pages shows more work"],
          answer: 0,
          reasons: ["The best lines stay, and it fits on one page.", "Tiny writing is hard to read. Cut words instead.", "A recruiter reads one page. The second often isn't read."],
        },
        {
          q: "What should your CV's file be called?",
          options: ["Jordan Miles CV.pdf", "CV final version 2.pdf", "My CV for jobs.docx"],
          answer: 0,
          reasons: ["Your name, then CV, as a PDF.", "Whose? And \"final version 2\" means there are others.", "No name in it, and a Word file can look wrong on their computer."],
        },
      ],
      takeaways: ["One page, with real headings.", "Your town, phone and email: never your home address.", "Save it as a PDF called your name, then CV."],
    },
    {
      id: "m13t3",
      title: "Indeed and LinkedIn",
      minutes: 11,
      brief: "Most office jobs are found online. In this lesson you'll read a job advert part by part, spot a fake one, and see what a good work profile looks like.",
      learn: [
        {
          heading: "Here is a whole job advert",
          body: [
            "This is how job sites such as Indeed show an advert. Indeed is free for job seekers: you search, read and apply with your CV.",
            "The job (1), who it's with (2) and where (3), the pay (4) and hours (5), what you'd do (6), how to apply (7), and a job alert (8).",
          ],
          figure: <JobAdFigure />,
        },
        {
          heading: "Title, pay and hours first",
          body: ["Read the title (1), the pay (4) and the hours (5) before anything else. If one of them can't work for you, move on.", "Search with the titles offices use: Office Administrator, Admin Assistant, Receptionist, Data Entry Clerk."],
          figure: <JobAdFigure focus={["title", "pay", "hours"]} title="The first three things to read" />,
        },
        {
          heading: "Who, and where",
          body: ["Look up the employer (2). A real firm has a website, an address and reviews.", "Check where it is (3) and how you'd get there every day. \"Hybrid\" means some days at home; \"Remote\" means all of them."],
          figure: <JobAdFigure focus={["employer", "location"]} title="The employer and the place" />,
        },
        {
          heading: "What you'd do, and how to apply",
          body: [
            "What you'd do (6) tells you which skill lines to put first on your CV. If it says \"keep the orders spreadsheet up to date\", make sure an Excel line is in your Skills.",
            "Apply now (7) sends your CV through the site. Some adverts send you to the company's own website instead. Either way, you upload your PDF.",
          ],
          figure: <JobAdFigure focus={["details", "apply"]} title="The job, and applying" />,
        },
        {
          heading: "Let the jobs come to you",
          body: ["Turn on a job alert (8) and the site emails you new jobs like this one, once a day.", "Set one for each job title you'd take, in your town. Check the emails each morning and apply early: the first good CVs get read first."],
          figure: <JobAdFigure focus={["alert"]} title="A job alert" />,
        },
        {
          heading: "Here is a fake job advert",
          body: [
            "Scammers post adverts too. This one has every sign: a vague job (1), no company name (2), \"anywhere\" (3), pay too good to be true (4) and hours too easy (5).",
            "Worst of all, it asks for money and your bank details (6), and wants you to message someone on a chat app (7). Report it (8) and move on.",
          ],
          figure: <JobAdFigure scam />,
        },
        {
          heading: "Never pay, and never send bank details early",
          body: [
            "A real employer never asks you to pay for training, a starter pack, an ID check or a DBS check before you start.",
            "Your bank details go on the new-starter form, after a written job offer from an employer you can look up. Never before an interview, and never by chat.",
          ],
          figure: <JobAdFigure scam focus={["details", "apply"]} title="What a real employer never asks" />,
          tip: "Already sent money or bank details? Ring your bank straight away, on the number on the back of your card.",
        },
        {
          heading: "Here is the top of a profile",
          body: [
            "LinkedIn is a site for your working life: a profile like an online CV, where recruiters search for people. The basic account is free.",
            "The parts that matter: a photo if you want one (1), your name (2), a headline (3), your town (4), Open to work (5), an About (6) and your skills (7).",
          ],
          figure: <ProfileFigure />,
        },
        {
          heading: "A headline that says what you want",
          body: [
            "The headline (3) is the line recruiters see in their search results. Say the job you want and what you bring.",
            "Open to work (5) tells recruiters which jobs you're after. You can choose to show it to recruiters only.",
          ],
          figure: <ProfileFigure focus={["headline", "open"]} title="Headline and Open to work" />,
          good: [{ text: "Office administrator | Excel, Outlook and Word | Calm with customers" }],
          bad: [{ text: "Looking for work", note: "Nothing a recruiter could search for." }],
        },
        {
          heading: "Photo, About and skills",
          body: ["A photo (1) is optional. If you add one, make it just you, face on, in good light.", "About (6) is your CV's profile in your own voice. Skills (7) are the words recruiters search for: add the ones you can show."],
          figure: <ProfileFigure focus={["photo", "about", "skills"]} title="The rest of the profile" />,
        },
      ],
      tryIt: { title: "Real job, or a scam?", intro: "Six adverts. For each one, decide: would you apply, or report it?", Lab: JobSitesLab },
      check: [
        {
          q: "An advert asks for a £40 fee for a training pack before you start. What do you do?",
          options: ["Don't pay, and report the advert", "Pay it: training is worth having", "Pay half now, half on your first day"],
          answer: 0,
          reasons: ["Real employers pay you. A fee to start is a scam.", "Real training is paid for by the employer.", "Any payment to start a job is a warning sign."],
        },
        {
          q: "When should you give an employer your bank details?",
          options: ["After a written job offer, on their form", "When you first apply, so pay is quicker", "In a message to the recruiter who found you"],
          answer: 0,
          reasons: ["Once you know who they are and you've been offered the job.", "Nobody needs to pay you before you've got the job.", "Never by message: that's how details get stolen."],
        },
        {
          q: "Which is the stronger headline on a work profile?",
          options: ["Office administrator | Excel and Outlook | Calm with customers", "Looking for any work, please do get in touch with me", "Hard-working team player who also works well alone"],
          answer: 0,
          reasons: ["The job, the skills and something about you, all searchable.", "It doesn't say what you want or what you bring.", "Everyone says it, and recruiters don't search for it."],
        },
      ],
      takeaways: ["Read the title, pay and hours first, then look up the employer.", "A real job never costs you money.", "Bank details only after a written job offer."],
    },
    {
      id: "m13t4",
      title: "Typing and Excel tests",
      minutes: 12,
      brief: "Before a recruitment agency puts you forward, it tests you. In this lesson you'll see the two tests UK agencies use, how they're marked and how to practise, then try a short version.",
      learn: [
        {
          heading: "Here is an agency typing test",
          body: [
            "Agencies test typing on a screen like this one: a short business letter (4) to copy into a box (7), with the time left (1), your speed (2) and your accuracy (3) shown as you go.",
            "Words you've typed right turn green, the one you're on is shaded (5), and a word left wrong turns red (6).",
          ],
          figure: <TypingFigure />,
        },
        {
          heading: "The clock starts with your first key",
          body: ["Read the instructions, click in the box (7), then take a breath. The clock (1) doesn't start until you type the first letter.", "Most agency tests run for 3 minutes, some for 5. It stops by itself, so keep going to the end."],
          figure: <TypingFigure focus={["timer", "box"]} title="Starting the test" />,
        },
        {
          heading: "Fix it as you go",
          body: ["A slip left in (6) costs you. Spot one straight away? Backspace and type the word again.", "Keep your eyes on the shaded word (5) and the ones just ahead, not on your fingers."],
          figure: <TypingFigure focus={["slip", "current"]} title="Slips and your place" />,
        },
        {
          heading: "Here is a typing test result",
          body: [
            "When the clock stops you get a result like this. Gross speed (2) counts everything you typed. Each mistake left in (3) takes a word a minute off it, which gives your net speed (4).",
            "Accuracy (5) is the share of letters typed right. Most office jobs ask for 35 words a minute (net) at 95% accuracy or better (1).",
          ],
          figure: <TypingResultFigure />,
        },
        {
          heading: "Accuracy first, speed second",
          body: ["An employer would rather have 38 words a minute, all right, than 60 full of mistakes: every mistake is something someone has to fix.", "Practise 10 minutes a day. Speed comes by itself once your fingers know where the keys are."],
          figure: <TypingResultFigure focus={["net", "acc"]} title="The two numbers that count" />,
          tip: "Free typing practice sites are easy to find: search for \"typing test\". Take the same 3-minute test each day and write your score down.",
        },
        {
          heading: "Here is an agency Excel test",
          body: [
            "The Excel test gives you a list of short tasks (2) to do on a real workbook, against the clock (1).",
            "Each task names a cell (3). You click it, check the Name box (4) and type. What's really in the cell shows in the formula bar (5), and the answer in the cell (6). Some tasks are on another sheet (7). Hand in my test (8) when you're done.",
          ],
          figure: <ExcelTestFigure />,
        },
        {
          heading: "Find the cell it names",
          body: ["E12 means column E, row 12 (3). A right answer in the wrong cell scores nothing.", "After you click, glance at the Name box (4): it says which cell you're in."],
          figure: <ExcelTestFigure focus={["address", "namebox"]} title="The cell" />,
        },
        {
          heading: "A formula, not a number",
          body: [
            "The test reads the formula bar (5), not just the cell (6). If you add up the costs yourself and type 501.90, it's marked wrong: it must be =SUM(E2:E10).",
            "Formulas start with =. The ones agencies ask for most: SUM, AVERAGE, a percentage, COUNTIF, and a fixed reference like $E$12 that stays put when you copy it down.",
          ],
          figure: <ExcelTestFigure focus={["formula", "cell"]} title="The formula and its answer" />,
        },
        {
          heading: "Beat the clock",
          body: ["Fifteen minutes for ten tasks is about 90 seconds each (1). Read each task (2) twice before you start it.", "Stuck? Leave it and come back: every task is worth the same. With a minute to go, check you've tried them all, then hand it in (8)."],
          figure: <ExcelTestFigure focus={["timer", "task", "handin"]} title="Working against the clock" />,
        },
      ],
      tryIt: { title: "Try a short test", intro: "A one-minute typing test, then three tasks from an agency's Excel test.", Lab: TestsLab },
      check: [
        {
          q: "What's the difference between gross and net typing speed?",
          options: ["Net takes off a word a minute per mistake", "Net counts only the words typed in capitals", "Gross is your speed over the first minute"],
          answer: 0,
          reasons: ["Net speed is what's left once mistakes are counted.", "Capitals have nothing to do with it.", "Both cover the whole test."],
        },
        {
          q: "A task says \"In E12, add up the costs with SUM.\" What goes in E12?",
          options: ["=SUM(E2:E10)", "The total, worked out on a calculator", "The words SUM E2 to E10"],
          answer: 0,
          reasons: ["A formula, so it stays right if a cost changes.", "A typed number is marked wrong: they want the formula.", "Without the = and brackets, Excel sees only words."],
        },
        {
          q: "You're stuck on task 4 of 10. What's best?",
          options: ["Leave it, do the rest, then come back", "Keep at it until it's right, however long", "Hand in the test now, before it gets worse"],
          answer: 0,
          reasons: ["Every task is worth the same. Bank the easy ones first.", "One task could eat the time for three others.", "The other six tasks are still worth marks."],
        },
      ],
      takeaways: ["Accuracy first: 35 words a minute at 95% is the usual bar.", "Find the cell by its address, and use a formula.", "Skip and come back: every task counts the same."],
    },
    {
      id: "m13t5",
      title: "Video interviews",
      minutes: 10,
      brief: "Many first interviews now happen on a video call. In this lesson you'll set yourself up to look and sound your best, and learn the STAR way to answer the question everyone dreads.",
      learn: [
        {
          heading: "Here is a video interview",
          body: [
            "This is a job interview on Teams. The invite (1) gives the time and the link. The interviewer fills the screen (2), and your own picture sits in the corner (3).",
            "Beside it is a good set-up, seen from the side: camera at eye level (4), light in front of you (5), a plain background (6). At the bottom: the microphone (7), camera (8) and Leave (9).",
          ],
          figure: <InterviewFigure />,
        },
        {
          heading: "Test the link the day before",
          body: ["Click the link (1) the day before. Teams or Zoom may ask to install or update, which can take ten minutes: better then than at 9:59.", "On the day, join five minutes early, with your phone on silent and a glass of water nearby."],
          figure: <InterviewFigure focus={["join"]} title="The invite and its link" />,
          tip: "Keep the interviewer's phone number from the invite email to hand, in case the call drops.",
        },
        {
          heading: "Camera at eye level",
          body: ["Raise the laptop on books or a box until the camera is level with your eyes (4), about an arm's length away. Your picture (3) should show your head and shoulders.", "Look at the camera when you talk, not at the interviewer's face (2). To them, that's eye contact."],
          figure: <InterviewFigure focus={["eyelevel", "you", "them"]} title="Where the camera goes" />,
        },
        {
          heading: "Light and background",
          body: ["Sit facing a window or a lamp (5). Light behind you turns your face into a shadow.", "Choose a plain, tidy wall behind you (6), or turn on background blur. Nothing personal on show."],
          figure: <InterviewFigure focus={["light", "background"]} title="Light and background" />,
        },
        {
          heading: "Microphone, camera and Leave",
          body: ["Keep your microphone on (7) while you talk. If there's a sudden noise, mute, then unmute to answer.", "Keep your camera on (8) the whole time. Press Leave (9) only after you've both said goodbye, and you've thanked them."],
          figure: <InterviewFigure focus={["mute", "camera", "leave"]} title="The buttons" />,
        },
        {
          heading: "Here is an answer, the STAR way",
          body: [
            "Interviewers often say \"Tell me about a time...\" (1). They want one real story, told in four parts.",
            "Situation (2): where you were. Task (3): what you had to do. Action (4): what you did. Result (5): how it ended. This answer comes from a week like yours at Northfield.",
          ],
          figure: <StarFigure />,
        },
        {
          heading: "Most of it is the Action",
          body: ["Spend most of your answer on the Action (4): what you did, step by step. Say \"I\", not \"we\": they're interviewing you.", "Finish with the Result (5): a fact or a number if you have one, and what you'd do again next time."],
          figure: <StarFigure focus={["action", "result"]} title="Action and Result" />,
        },
        {
          heading: "Have two stories ready",
          body: [
            "Before the interview, write down two true stories: a time you put a mistake right, and a time you helped a customer or a colleague. Practise saying each out loud in about a minute.",
            "At the end they'll ask if you have any questions. Have one ready, like \"What would a normal day look like?\"",
          ],
          figure: <StarFigure focus={["question", "situation", "task"]} title="Getting a story ready" />,
          tip: "A few words on a sticky note just under the camera are fine. Reading out a script isn't.",
        },
      ],
      tryIt: { title: "Ready for the call", intro: "First put your camera picture right, then put two answers in STAR order.", Lab: InterviewLab },
      check: [
        {
          q: "Where should your camera be for a video interview?",
          options: ["Level with your eyes", "Below your chin, looking up", "Switched off, so they listen"],
          answer: 0,
          reasons: ["They see you face on, as if across a table.", "It looks up your nose and makes you look down at them.", "Keep it on. They need to see you, as in a room."],
        },
        {
          q: "Where's the best light for a video call?",
          options: ["In front of you, on your face", "Behind you, through a window", "Above you, from the ceiling only"],
          answer: 0,
          reasons: ["Your face is clear and easy to read.", "It turns you into a dark shape against the glass.", "Light from above alone leaves shadows under your eyes."],
        },
        {
          q: "In a STAR answer, which part should be the longest?",
          options: ["Action: what you did", "Situation: where you were", "Result: how it ended"],
          answer: 0,
          reasons: ["That's what they're really asking about.", "One sentence is enough to set the scene.", "Keep it short and, if you can, give a number."],
        },
      ],
      takeaways: ["Test the link the day before, and join five minutes early.", "Camera at eye level, light in front, a plain wall behind.", "Tell me about a time: Situation, Task, Action, Result."],
    },
  ],
};

export default m13;
