"use client";

import { ComposeLab, SignatureLab, SortLab, type Draft } from "../learn/labs";
import type { LabProps, ModuleManifest } from "../learn/types";

/* Module 2: Writing a work email. The pilot module (owner 2026-11-09).
 *
 * House copy rules: UK English, plain words, short sentences, no
 * em-dashes. Quiz options are kept to similar lengths so the right answer
 * is never the obvious longest one (the Pro "answer tell" rule).
 *
 * The email checks are deliberately forgiving: they look for the few
 * things that make a work email work (a clear subject, a greeting, the
 * detail, a polite ask, a sign-off) and never for exact wording. */

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean);
const GREETING = /^\s*(hi|hello|dear|good (morning|afternoon))\b/i;
const ASKS = /\b(could you|can you|would you|please|let me know)\b/i;
/* A word of four or more capitals reads as shouting. */
const SHOUTING = /\b[A-Z]{4,}\b|!!/;
/* A sign-off line followed by at least one more line (your name). */
const SIGN_OFF = /\b(kind regards|best regards|many thanks|best wishes|regards|thanks|thank you)\b[^\n]*\n+\s*\S/i;

const NORTHFIELD_MANAGER = "sarah.jones@northfield.co.uk";

/* ---------- Lesson 1: subject lines ---------- */

function SubjectLab(p: LabProps) {
  return (
    <ComposeLab
      {...p}
      tasks={[
        {
          scenario: "Sarah, your manager, has asked you to email her this week's timesheet. The week ends on Friday 14 November. Write the subject line, then press Send.",
          to: NORTHFIELD_MANAGER,
          write: ["subject"],
          rules: [
            { label: "Says what the email is about", test: (d: Draft) => /time\s?sheet/i.test(d.subject), hint: "Use the word timesheet, so Sarah knows what it is before she opens it." },
            { label: "Says which week", test: (d) => /\b(14|nov|november|this week|w\/e|week ending)\b/i.test(d.subject), hint: "Add the week, for example \"week ending 14 November\"." },
            { label: "Short enough to read at a glance", test: (d) => words(d.subject).length >= 2 && words(d.subject).length <= 10, hint: "Aim for about 3 to 8 words." },
            { label: "Calm, with no shouting", test: (d) => !SHOUTING.test(d.subject), hint: "Leave out capital-letter words and exclamation marks." },
          ],
        },
        {
          scenario: "Order 5520 arrived this morning with 3 boxes damaged. Write the subject line for an email to the supplier, then press Send.",
          to: "orders@brightlinesupplies.co.uk",
          write: ["subject"],
          rules: [
            { label: "Says which order", test: (d) => /5520/.test(d.subject), hint: "Put the order number in: 5520. It is the first thing the supplier will look up." },
            { label: "Says what is wrong", test: (d) => /damag|broken|crush|smash/i.test(d.subject), hint: "Say what the problem is, for example \"3 boxes damaged\"." },
            { label: "No greeting in the subject", test: (d) => !/^\s*(hi|hello|hey|dear)\b/i.test(d.subject), hint: "Save \"Hi\" for the first line of the email. The subject says what it is about." },
            { label: "Short enough to read at a glance", test: (d) => words(d.subject).length >= 3 && words(d.subject).length <= 10, hint: "Aim for about 3 to 8 words." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 2: greetings ---------- */

function GreetingLab(p: LabProps) {
  return (
    <SortLab
      {...p}
      buckets={["Good for a colleague", "Good for a formal email", "Not for work"]}
      items={[
        { text: "Hi Sarah,", bucket: 0, why: "Friendly and polite. Right for most people you work with." },
        { text: "Good morning Priya,", bucket: 0, why: "Warm and polite. Fine for colleagues, and for customers you already know." },
        { text: "Hi everyone,", bucket: 0, why: "The right way to start an email to a whole team." },
        { text: "Dear Mr Khan,", bucket: 1, why: "\"Dear\" with a title and surname suits someone you have not met, or someone senior." },
        { text: "Dear Sir or Madam,", bucket: 1, why: "Only for when you have no name at all, such as a general enquiries address." },
        { text: "Dear Ms Patel,", bucket: 1, why: "Formal and polite. Good for a first email to a customer or a manager at another firm." },
        { text: "Hey you,", bucket: 2, why: "Too casual for work, and it leaves out their name." },
        { text: "Hiya mate!!", bucket: 2, why: "Fine with friends, but too casual for work, and the exclamation marks read like shouting." },
        { text: "Yo", bucket: 2, why: "Too casual for any work email." },
      ]}
    />
  );
}

/* ---------- Lesson 3: say what you need ---------- */

function AskLab(p: LabProps) {
  return (
    <ComposeLab
      {...p}
      tasks={[
        {
          scenario: "The printer on the first floor has run out of toner. Email the Facilities team and ask them to replace it by tomorrow morning. Start with a greeting, then say what you need. You do not need a sign-off yet: that is the next lesson.",
          to: "facilities@northfield.co.uk",
          write: ["body"],
          prefill: { subject: "First floor printer needs toner" },
          rules: [
            { label: "Starts with a greeting", test: (d) => GREETING.test(d.body), hint: "Start with \"Hi everyone,\" or \"Hello,\" on its own line." },
            { label: "Says which printer", test: (d) => /\b(first|1st) floor\b/i.test(d.body), hint: "Say which printer: the one on the first floor." },
            { label: "Says what is wrong", test: (d) => /toner|ink/i.test(d.body), hint: "Say it has run out of toner." },
            { label: "Asks politely", test: (d) => ASKS.test(d.body), hint: "Ask with \"Could you\" or \"please\", for example \"Could you replace it?\"" },
            { label: "Says when you need it", test: (d) => /\b(tomorrow|today|by|morning|asap)\b/i.test(d.body), hint: "Say when: \"by tomorrow morning\"." },
            { label: "Short and to the point", test: (d) => words(d.body).length >= 8 && words(d.body).length <= 90, hint: "Keep it to a few lines, under about 90 words. Facilities only need the facts." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 4: sign-off and signature ---------- */

function SignOffAndSignatureLab(p: LabProps) {
  return <SignatureLab {...p} />;
}

/* ---------- Lesson 5: chasing, the whole email ---------- */

function ChaserLab(p: LabProps) {
  return (
    <ComposeLab
      {...p}
      tasks={[
        {
          scenario: "Last Monday you emailed Mark at Brightline Supplies to ask when order 5520 will arrive. He has not replied, and you need to know by Thursday. Write a polite chaser: a subject, a greeting, what you need, a sign-off and your name.",
          to: "mark.evans@brightlinesupplies.co.uk",
          write: ["subject", "body"],
          rules: [
            { label: "The subject says which order", test: (d) => /5520/.test(d.subject), hint: "Put the order number in the subject, for example \"Order 5520: delivery date?\"" },
            { label: "Starts with a greeting to Mark", test: (d) => /^\s*(hi|hello|dear|good (morning|afternoon))\b[^\n]*\bmark\b/i.test(d.body), hint: "Start with \"Hi Mark,\" on its own line." },
            { label: "Says which order", test: (d) => /5520/.test(d.body), hint: "Mention order 5520 in the email too." },
            { label: "Asks clearly and says by when", test: (d) => ASKS.test(d.body) && /thursday/i.test(d.body), hint: "Ask politely and give the day: \"Could you let me know by Thursday?\"" },
            { label: "Stays polite", test: (d) => !SHOUTING.test(d.body) && !/(still (not|haven'?t|hasn'?t)|yet again|ignor|you never|why haven'?t)/i.test(d.body), hint: "Leave out blame like \"you still haven't\" and capital-letter words. Assume Mark is busy, not rude." },
            { label: "Signs off with your name", test: (d) => SIGN_OFF.test(d.body), hint: "End with \"Kind regards,\" and your name on the next line." },
          ],
        },
      ]}
    />
  );
}

const m2: ModuleManifest = {
  id: "m2",
  number: 2,
  title: "Writing a work email",
  intro: "Email is how most offices talk. In five short lessons you will learn to write one that is clear, polite and gets a reply, and you will practise in a pretend inbox where nothing is really sent.",
  outcomes: [
    "Write a subject line that says what the email is about",
    "Start an email the right way for the person you are writing to",
    "Say what you need clearly, in a few lines",
    "Sign off properly and set up your email signature",
    "Chase someone politely, and say sorry well when something goes wrong",
  ],
  topics: [
    {
      id: "m2t1",
      title: "A subject line that says what is inside",
      minutes: 8,
      brief: "The subject line is the first thing anyone sees. In this lesson you will learn to write one that tells people what your email is about before they open it.",
      learn: [
        {
          heading: "Why the subject line matters",
          body: [
            "People at work get dozens of emails a day. Most of them decide what to open, and what to leave for later, from the subject line alone.",
            "A good subject line tells them what the email is about before they open it. A vague one gets left until last.",
          ],
          good: [{ text: "Delivery 4417 is two pallets short" }],
          bad: [{ text: "Hi" }, { text: "Question" }, { text: "URGENT!!!" }],
        },
        {
          heading: "Say what it is about, and what you need",
          body: ["A simple pattern works almost every time: the thing, then what about it.", "If you need something, you can put it in the subject too."],
          good: [
            { text: "Holiday request: 3 to 7 March" },
            { text: "Order 5520: can we deliver on Friday?" },
            { text: "Timesheet for week ending 14 November" },
          ],
          tip: "Put in the number people will look up: the order number, the invoice number or the date.",
        },
        {
          heading: "Keep it short and calm",
          body: [
            "Aim for about 3 to 8 words. Phones cut long subject lines off, so put the important part first.",
            "Words in capital letters read as shouting. Save \"Urgent\" for things that really are.",
          ],
          good: [{ text: "Fire door on bay 3 will not close" }],
          bad: [{ text: "PLEASE READ THIS NOW" }, { text: "Hello, I am writing to ask about something that happened yesterday" }],
        },
        {
          heading: "When you reply, keep the subject",
          body: [
            "When you press Reply, the subject stays the same with \"RE:\" in front. Leave it as it is, so the whole conversation stays together.",
            "If you want to talk about something new, start a new email with its own subject.",
          ],
          good: [{ text: "RE: Order 5520: can we deliver on Friday?", note: "A reply keeps the same subject." }],
        },
      ],
      tryIt: {
        title: "Write two subject lines",
        intro: "Read what has happened, type a subject line in the pretend email, then press Send. Nothing is really sent: you will see what is good and what to fix.",
        Lab: SubjectLab,
      },
      check: [
        {
          q: "Which subject line is best for asking about a missing payslip?",
          options: ["Payslip for October has not arrived", "Hi, I have a quick question for you", "PAYSLIP PROBLEM, PLEASE READ!!!"],
          answer: 0,
          reasons: [
            "It says exactly what the email is about, so payroll can deal with it straight away.",
            "It does not say what the question is, so it will be left until later.",
            "Capital letters and exclamation marks read like shouting.",
          ],
        },
        {
          q: "You are replying to an email called \"Rota for next week\". What should the subject be?",
          options: ["Leave it as \"RE: Rota for next week\"", "Change it to \"Here is my answer\"", "Delete it, so the box is left empty"],
          answer: 0,
          reasons: [
            "Keeping the subject keeps the whole conversation together.",
            "A new subject splits the conversation, so people lose track of it.",
            "An empty subject is easy to miss and hard to find later.",
          ],
        },
        {
          q: "What is a good length for a subject line?",
          options: ["One word, to keep it short", "About 3 to 8 words", "A full sentence or two"],
          answer: 1,
          reasons: [
            "One word rarely says enough, like \"Question\" or \"Help\".",
            "Long enough to say what it is about, short enough to read at a glance.",
            "Long subject lines get cut off, especially on phones.",
          ],
        },
      ],
      takeaways: [
        "Say what the email is about: the thing, then what about it.",
        "Put in the number people will look up, like an order number.",
        "Keep it to about 3 to 8 words, with no shouting.",
      ],
    },
    {
      id: "m2t2",
      title: "Starting it off: greetings",
      minutes: 7,
      brief: "How you start an email sets the tone. In this lesson you will learn which greeting to use for whom, so you always sound friendly and professional.",
      learn: [
        {
          heading: "\"Hi\" and their name works most of the time",
          body: [
            "For people you work with, and most people at other companies, \"Hi\" and their first name is right.",
            "Put a comma after the name, then start your message on a new line.",
          ],
          good: [{ text: "Hi Sarah," }, { text: "Good morning Priya," }],
        },
        {
          heading: "\"Dear\" for formal emails",
          body: [
            "Use \"Dear\" for a first email to someone senior, a job application, or a complaint. Use their title and surname if you do not know them.",
            "Only write \"Dear Sir or Madam\" when you have no name at all.",
          ],
          good: [{ text: "Dear Mr Khan," }, { text: "Dear Ms Patel," }, { text: "Dear Sir or Madam,", note: "Only when there is no name to use." }],
        },
        {
          heading: "Writing to a group",
          body: ["When the email goes to a team or several people, greet them all together."],
          good: [{ text: "Hi everyone," }, { text: "Hello all," }, { text: "Hi team," }],
        },
        {
          heading: "What to leave out",
          body: [
            "Some greetings that are fine with friends sound too casual at work. And always check you have spelled their name right: it is the first thing they read.",
          ],
          bad: [{ text: "Hey" }, { text: "Hiya mate!!" }, { text: "Yo" }, { text: "No greeting at all on a first email" }],
          tip: "Not sure? Copy how they greeted you. If they wrote \"Hi Dave\", reply with \"Hi\" too.",
        },
      ],
      tryIt: {
        title: "Sort the greetings",
        intro: "One greeting at a time: choose whether it suits a colleague, a formal email, or is not right for work at all.",
        Lab: GreetingLab,
      },
      check: [
        {
          q: "You are emailing a customer you have never met, called Mr Ahmed. How do you start?",
          options: ["Hey there Ahmed,", "Dear Mr Ahmed,", "Ahmed,"],
          answer: 1,
          reasons: [
            "\"Hey\" is too casual for someone you have never met.",
            "Formal and polite: right for a first email to a customer.",
            "Just the name, with no greeting, can sound abrupt or cross.",
          ],
        },
        {
          q: "You are emailing your whole team about the rota. Which greeting fits?",
          options: ["Dear Sir or Madam,", "Yo team!!", "Hi everyone,"],
          answer: 2,
          reasons: [
            "Far too formal for your own team, and you know their names.",
            "Too casual, and the exclamation marks look like shouting.",
            "Friendly and includes everyone the email goes to.",
          ],
        },
        {
          q: "What goes straight after the greeting?",
          options: ["A comma, then the message on a new line", "Nothing: carry straight on with the message", "A full stop and an exclamation mark"],
          answer: 0,
          reasons: [
            "\"Hi Sarah,\" then a new line is the standard layout.",
            "Running straight on makes the email harder to read.",
            "That looks odd and can read like shouting.",
          ],
        },
      ],
      takeaways: [
        "\"Hi\" and their first name suits most people at work.",
        "Use \"Dear\" and their title and surname for formal emails.",
        "Greet a group with \"Hi everyone,\" and always spell names right.",
      ],
    },
    {
      id: "m2t3",
      title: "Say what you need, once",
      minutes: 9,
      brief: "Busy people read the first line and decide what to do. In this lesson you will learn to put your point first and give people everything they need to help you.",
      learn: [
        {
          heading: "Put the point first",
          body: [
            "After the greeting, say straight away why you are writing. Do not make people read a long story to find out what you want.",
          ],
          good: [{ text: "Could you check order 4417? We received 10 pallets, not 12." }],
          bad: [{ text: "So this morning I came in and was doing the usual checks and then I noticed something with one of the deliveries from yesterday..." }],
        },
        {
          heading: "Give them the details",
          body: ["Think about what the reader needs to act without coming back to you with questions.", "Usually that is: which one, what is wrong, what you want them to do, and by when."],
          good: [{ text: "The printer on the first floor has run out of toner. Could you replace it by tomorrow morning?" }],
          tip: "Before you send, ask yourself: could they do this without asking me anything?",
        },
        {
          heading: "Ask politely, and clearly",
          body: [
            "\"Could you\", \"please\" and \"thank you\" go a long way. They make a request sound friendly without making it vague.",
            "Be clear about what you are asking. A question mark helps.",
          ],
          good: [{ text: "Could you send me the new rota by Friday, please?" }],
          bad: [{ text: "Send me the rota.", note: "Clear, but sounds like an order." }, { text: "Not sure if it's possible but maybe the rota at some point?", note: "Polite, but they will not know what you want or when." }],
        },
        {
          heading: "Short sentences, short email",
          body: [
            "Most work emails need only three to five lines. Use short sentences and a new paragraph for each new point.",
            "If you have two unrelated things to ask, it is often better to send two emails, each with its own subject.",
          ],
        },
      ],
      tryIt: {
        title: "Ask Facilities for help",
        intro: "Write the email in the pretend inbox: a greeting, then what you need. Press Send to see how it does.",
        Lab: AskLab,
      },
      check: [
        {
          q: "Where should you say what you need?",
          options: ["Right at the end, after the full story", "Straight after the greeting", "In the subject line only"],
          answer: 1,
          reasons: [
            "Readers may never get that far, or miss what you are asking.",
            "Busy people read the first line first. Put your point there.",
            "The subject helps, but the email should say it clearly too.",
          ],
        },
        {
          q: "Which request is best?",
          options: ["Send me the rota.", "Maybe the rota sometime if that's OK?", "Could you send me the rota by Friday?"],
          answer: 2,
          reasons: [
            "Clear, but it sounds like an order rather than a request.",
            "Polite, but it does not say clearly what you want or when.",
            "Polite, clear, and it says when you need it.",
          ],
        },
        {
          q: "You need to ask payroll about overtime and ask IT to reset a password. What should you do?",
          options: ["Send two separate emails", "Put both in one long email", "Phone both and email neither"],
          answer: 0,
          reasons: [
            "Each goes to the right people, with its own clear subject.",
            "Payroll and IT are different teams, so one of them gets the wrong half.",
            "A call is fine, but an email gives everyone a record of what was asked.",
          ],
        },
      ],
      takeaways: [
        "Put your point straight after the greeting.",
        "Give the details: which one, what is wrong, what you need and by when.",
        "Ask with \"Could you\" or \"please\", and keep it to a few lines.",
      ],
    },
    {
      id: "m2t4",
      title: "Signing off and your signature",
      minutes: 8,
      brief: "A good ending is polite and tells people who you are and how to reach you. In this lesson you will learn the right sign-off and build your own email signature.",
      learn: [
        {
          heading: "The sign-off",
          body: ["End every work email with a short, polite sign-off, a comma, and then your name on the next line."],
          good: [
            { text: "Kind regards,\nDave", note: "Safe for anyone, any time." },
            { text: "Many thanks,\nDave", note: "When you have asked for something." },
            { text: "Best wishes,\nDave", note: "Friendly, for people you know." },
          ],
          bad: [{ text: "Love, Dave xx" }, { text: "Nothing at all after the last line" }],
        },
        {
          heading: "What a signature is",
          body: [
            "Your signature is the block of details under your name. You set it up once in your email program and it is added to every email you send.",
            "It saves people hunting for your phone number or asking which company you are from.",
          ],
          good: [{ text: "Dave Morris\nStock Administrator\nNorthfield Foods Ltd\n01632 960 418" }],
        },
        {
          heading: "What to put in it",
          body: [
            "Four things are enough: your full name, your job title, your company and your work phone number.",
            "Many companies give everyone a standard signature with the logo. If yours does, use that one.",
          ],
          tip: "In Outlook, you set it up under Settings, then Signatures.",
        },
        {
          heading: "Keep it plain",
          body: ["A work signature is not the place for quotes, emojis, pictures or coloured fonts. They look unprofessional and can make your emails look like spam."],
          bad: [{ text: "\"Live, laugh, love\" 😊" }, { text: "Sent from my iPhone, sorry for typos!!" }],
        },
      ],
      tryIt: {
        title: "Build your signature",
        intro: "Fill in your details. You can use your real job or one you are aiming for. Watch how it looks under an email, then check it.",
        Lab: SignOffAndSignatureLab,
      },
      check: [
        {
          q: "Which sign-off is safe for any work email?",
          options: ["Kind regards,", "Love,", "Cheers mate!"],
          answer: 0,
          reasons: [
            "It works for anyone, from a colleague to a new customer.",
            "Too personal for work.",
            "Too casual for most work emails, especially to customers.",
          ],
        },
        {
          q: "What should a work email signature include?",
          options: ["Your favourite quote and a smiley", "Name, job title, company and phone", "Just your first name"],
          answer: 1,
          reasons: [
            "Quotes and emojis look unprofessional at work.",
            "Everything people need to know who you are and how to reach you.",
            "People will not know your role or how to call you.",
          ],
        },
        {
          q: "How often do you need to type your signature?",
          options: ["At the bottom of every email", "Only on emails to customers", "Once, when you set it up"],
          answer: 2,
          reasons: [
            "There is no need: once it is set up, it is added for you.",
            "Your signature helps colleagues too, so it goes on every email.",
            "Set it up once and it is added to every email automatically.",
          ],
        },
      ],
      takeaways: [
        "End with \"Kind regards,\" or \"Many thanks,\" and your name on the next line.",
        "Your signature: full name, job title, company and phone.",
        "Keep it plain: no quotes, emojis or pictures.",
      ],
    },
    {
      id: "m2t5",
      title: "Polite but direct: chasing and saying sorry",
      minutes: 10,
      brief: "Sometimes people do not reply, and sometimes things go wrong. In this lesson you will learn to chase without sounding cross, say sorry well, and check an email before you send it.",
      learn: [
        {
          heading: "Chasing politely",
          body: [
            "If someone has not replied, wait a couple of working days. Then reply to your own email, so they can see what you asked before.",
            "Keep it short and friendly, and say when you need an answer.",
          ],
          good: [{ text: "Hi Mark,\nJust following up on my email below about order 5520. Could you let me know the delivery date by Thursday?\nMany thanks,\nDave" }],
        },
        {
          heading: "Leave out the blame",
          body: [
            "However annoyed you feel, assume they are busy, not rude. Blame and capital letters make people defensive, and it slows everything down.",
          ],
          bad: [{ text: "You STILL haven't replied to my email." }, { text: "Why haven't you answered me yet again?" }],
          good: [{ text: "I know you are busy, so just a quick reminder about the order below." }],
        },
        {
          heading: "Saying sorry at work",
          body: ["Everyone makes mistakes. A good apology says sorry once, says what went wrong, and says what you have done about it.", "No need for a long explanation or lots of sorries."],
          good: [{ text: "Sorry, I attached the wrong file earlier. The right one is attached now." }],
          bad: [{ text: "Sorry sorry sorry!! I am so useless, I always do this, sorry again" }],
        },
        {
          heading: "Check before you send",
          body: ["Before you press Send, take 20 seconds to check:"],
          good: [
            { text: "Is it going to the right person?" },
            { text: "Is their name spelled right?" },
            { text: "Did you attach the file you mentioned?" },
            { text: "Does the subject say what it is about?" },
          ],
          tip: "Read it once in your head as if you were the person getting it. Would you know what to do?",
        },
      ],
      tryIt: {
        title: "Write a polite chaser",
        intro: "This one is a whole email: subject, greeting, what you need, sign-off and your name. Use everything from this module, then press Send.",
        Lab: ChaserLab,
      },
      check: [
        {
          q: "Mark has not replied for two days. Which chaser is best?",
          options: [
            "Following up on order 5520. Could you reply by Thursday?",
            "Why have you STILL not answered me about order 5520?!",
            "Hello? Is anyone there? I need this sorted today.",
          ],
          answer: 0,
          reasons: [
            "Polite, says which order, and says when you need an answer.",
            "Blame and capital letters make people defensive.",
            "Sarcastic, and it does not say what you need.",
          ],
        },
        {
          q: "You sent the wrong attachment. What is the best email to send next?",
          options: [
            "Ignore it and hope nobody notices the wrong file",
            "Sorry, I sent the wrong file. The right one is attached.",
            "Sorry sorry!! I'm useless, I always do this. So sorry!",
          ],
          answer: 1,
          reasons: [
            "They may use the wrong file, which causes bigger problems later.",
            "Says sorry once, says what went wrong, and fixes it.",
            "Too many sorries, and putting yourself down helps nobody.",
          ],
        },
        {
          q: "Which is the best way to chase an email?",
          options: ["Start a brand new email with a new subject", "Send the same email again, unchanged", "Reply to your own email, so they see it"],
          answer: 2,
          reasons: [
            "They lose the history of what you asked before.",
            "Sending it again unchanged can come across as rude or as a mistake.",
            "Replying keeps your first email underneath, so they have everything.",
          ],
        },
      ],
      takeaways: [
        "Chase after a couple of working days, by replying to your own email.",
        "Leave out blame and capital letters: assume people are busy, not rude.",
        "Say sorry once, say what went wrong and how you fixed it.",
      ],
    },
  ],
};

export default m2;
