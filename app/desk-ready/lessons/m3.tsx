"use client";

import { ComposeLab, type Draft } from "../learn/labs";
import { BookingFigure, InviteFigure, SchedulingFigure, type InviteExample } from "../learn/figures/calendar";
import { ComposeFigure } from "../learn/figures/email";
import { ActionsFigure, CallFigure, PreJoinFigure, ShareTrayFigure, TeamsFigure, type TeamsExample } from "../learn/figures/teams";
import { CallLab, ChatOrEmailLab, InviteLab, JoinLab, MeetingChat } from "../learn/meetingLabs";
import type { LabProps, ModuleManifest } from "../learn/types";

/* Module 3: Meetings and messages (criteria TM-1 to TM-5). Answering an
 * invite and booking a meeting, joining a Teams or Zoom call, mute,
 * camera and sharing one window, chat or email, and writing down the
 * actions. Every lesson opens on the whole thing drawn with its parts
 * numbered (owner rule, 2026-11-11), and later cards light up the part
 * they teach. Three office jobs follow on the module page, in the
 * office's own Calendar and Teams.
 *
 * House copy rules: UK English, plain words, short sentences, no
 * em-dashes. Quiz options are kept to similar lengths so the right answer
 * is never the obvious longest one. */

/* An invite that clashes with your induction, for the Propose card. */
const CLASH_INVITE: InviteExample = {
  title: "Harlow Packaging visit",
  organiser: "Daniel Okafor",
  day: "Thursday 12 November",
  time: "11:30 to 12:30",
  where: "Boardroom",
  teams: false,
  people: ["You", "Priya Shah", "Tom Hale"],
  agenda: ["Tom from Harlow is visiting. I'd like you there, as you'll be ordering from them."],
  mine: [
    [9, 0.25, "Morning huddle"],
    [11.5, 1, "Health and safety induction"],
  ],
  meeting: [11.5, 1],
  from: 9,
  to: 13,
};

/* The stock meeting's chat, drawn in Teams for Lesson 5. */
const STOCK_CHAT: TeamsExample = {
  name: "Late deliveries review",
  group: true,
  lines: [
    { who: "Daniel Okafor", time: "09:52", text: "Sarah, can you ring Kent Flour Mills about the late vans? By Thursday." },
    { who: "Sarah Patel", time: "09:53", text: "Will do, Thursday." },
    { who: "Emma Clarke", time: "09:55", text: "I'll move the early shift to 07:30, by Friday." },
    { who: "Daniel Okafor", time: "09:58", text: "Thanks. Can you add a Late column to the delivery log today, and send the actions round?" },
  ],
};

/* ---------- Lesson 5: write up the actions ---------- */

const ME = /\b(i|i'll|i will|me|my|myself|you|jordan)\b/i;
const lineHas = (body: string, tests: RegExp[]) =>
  body
    .split(/\n|(?<=[.;])\s+/)
    .map((l) => l.trim())
    .some((l) => tests.every((t) => t.test(l)));

const CHRISTMAS_CHAT = [
  { who: "Daniel Okafor", time: "09:40", text: "So: open on 22 and 23 December, closed from the 24th until 2 January. Priya, can you email our customers the Christmas hours? By Friday, please." },
  { who: "Priya Shah", time: "09:42", text: "Will do, by Friday 13th." },
  { who: "Sarah Patel", time: "09:45", text: "I'll book an extra van for the 21st. I can do that by Monday." },
  { who: "Daniel Okafor", time: "09:47", text: "Great. And could you update the Christmas rota in Emma's folder? By Thursday, please." },
  { who: "Daniel Okafor", time: "09:50", text: "Can you send the actions round to Sarah and Priya afterwards? Thanks all." },
];

function ActionsLab(p: LabProps) {
  return (
    <div>
      <MeetingChat title="Christmas opening hours · meeting chat" lines={CHRISTMAS_CHAT} />
      <div style={{ height: 6 }} />
      <ComposeLab
        {...p}
        tasks={[
          {
            scenario: "The meeting's just finished. Read its chat above, then email Sarah and Priya the actions: one line each, who, what and by when. Your own action counts too. Add a subject, a greeting and a sign-off.",
            to: "Sarah Patel; Priya Shah",
            write: ["subject", "body"],
            rules: [
              { label: "The subject says which meeting", test: (d: Draft) => /christmas|opening hours/i.test(d.subject), hint: "Name the meeting in the subject, like \"Actions from the Christmas opening hours meeting\"." },
              { label: "Starts with a greeting", test: (d) => /^\s*(hi|hello|dear|good (morning|afternoon))\b/i.test(d.body), hint: "Start with \"Hi Sarah and Priya,\" on its own line." },
              { label: "Priya: email customers the hours, by Friday", test: (d) => lineHas(d.body, [/priya/i, /email|customer|hours/i, /fri/i]), hint: "Give Priya her own line: \"Priya: email customers the Christmas hours by Friday 13 November\"." },
              { label: "Sarah: book the extra van, by Monday", test: (d) => lineHas(d.body, [/sarah/i, /van/i, /mon/i]), hint: "Give Sarah her own line: \"Sarah: book an extra van for 21 December by Monday 16 November\"." },
              { label: "You: update the Christmas rota, by Thursday", test: (d) => lineHas(d.body, [ME, /rota/i, /thu/i]), hint: "Your own action goes in too: \"Me: update the Christmas rota by Thursday 12 November\"." },
              { label: "Signs off with your name", test: (d) => /\b(kind regards|best regards|many thanks|best wishes|regards|thanks|thank you)\b[^\n]*\n+\s*\S/i.test(d.body), hint: "End with \"Thanks,\" and your name on the next line." },
            ],
          },
        ]}
      />
    </div>
  );
}

const m3: ModuleManifest = {
  id: "m3",
  number: 3,
  title: "Meetings and messages",
  intro: "Offices run on meetings and quick messages as much as on email. In five short lessons you'll learn to answer an invite and book a meeting, join a video call the right way, mute and share your screen safely, choose chat or email, and write down who's doing what. Then you'll do it for real in the pretend office, with its own Calendar and Teams.",
  outcomes: [
    "Accept, decline or propose a new time, depending on your calendar",
    "Book a meeting at a time everyone is free, with a room and an agenda",
    "Join a Teams or Zoom call muted, with your camera set the way you're asked",
    "Share one window, never your whole screen, and stop when you're done",
    "Choose Teams chat for quick things and email for anything that needs a record",
    "Write up a meeting's actions: who, what and by when",
  ],
  topics: [
    /* ---------- Lesson 1 ---------- */
    {
      id: "m3t1",
      title: "Calendar invites",
      minutes: 11,
      brief: "Meetings arrive as invites. In this lesson you'll learn to read one, answer it the right way for your calendar, and book a meeting yourself at a time that suits everyone.",
      learn: [
        {
          heading: "Here is a whole meeting invite",
          body: [
            "When someone wants you at a meeting, Outlook sends you an invite. It arrives in your inbox like an email, and sits in your calendar, shaded, until you answer.",
            "Every part is numbered, and the key underneath says what each one is for. Notice your own calendar for that day (8), drawn right beside it.",
          ],
          figure: <InviteFigure />,
        },
        {
          heading: "Check your calendar before you answer",
          figure: <InviteFigure focus={["when", "yourday"]} title="The time, and your own day around it" />,
          body: [
            "Look at the date and time (3), then at your calendar (8). The shaded block is this meeting. If nothing else of yours sits beside it, you're free.",
            "Here, 11:00 to 11:30 on Tuesday is clear: the huddle is at 09:00 and the shadowing starts at 14:00.",
          ],
          tip: "Words like \"tomorrow\" in an invite count from the day it was sent. The date in part 3 is the one that matters.",
        },
        {
          heading: "Four ways to answer",
          figure: <InviteFigure focus={["respond"]} title="Your answer" chosen="Accept" />,
          body: ["Your answer (7) goes back to the organiser and updates your calendar. Pick the one that's true:"],
          good: [
            { text: "Accept", note: "You're free and you'll be there. It goes in your calendar." },
            { text: "Tentative", note: "Maybe: you're waiting to find out. Change it once you know." },
            { text: "Decline", note: "You can't go, or you don't need to. It comes out of your calendar." },
            { text: "Propose new time", note: "You should be there, but the time clashes. Offer one that works." },
          ],
        },
        {
          heading: "When it clashes, propose a new time",
          figure: <InviteFigure invite={CLASH_INVITE} focus={["respond", "yourday"]} chosen="Propose new time" title="A clash: two blocks side by side" what={{ yourday: "Your induction is at 11:30 too: the two blocks sit side by side, and the invite's outline turns red." }} />,
          body: [
            "Here Daniel wants you at a supplier visit, but your health and safety induction is at the same time.",
            "Daniel wants you there, so don't just decline. Press Propose new time and pick a time you're free. He can move the visit, or tell you which one to miss.",
          ],
          bad: [{ text: "Accepting both and hoping for the best", note: "One of them gets let down, and nobody knew it was coming." }],
        },
        {
          heading: "Booking a meeting yourself",
          body: [
            "To book a meeting, open your calendar and press New event. This is the form you fill in, with every part numbered.",
            "Add the people you need (3) and pick a time (4). The next screen shows how to choose a time they can all make.",
          ],
          figure: <BookingFigure />,
        },
        {
          heading: "Find a time everyone is free",
          body: [
            "Guessing a time means someone can't come. The Scheduling Assistant (8 on the form) puts everyone's calendar on one timeline instead.",
            "Each person gets a row (2). Blue bars are times they're busy (3). Look down the timeline for a gap where no row has any blue, rooms too (4). The box (5) is your meeting: green means everyone's free.",
          ],
          figure: <SchedulingFigure />,
        },
        {
          heading: "A clash shows red",
          figure: <SchedulingFigure start={10.5} focus={["slot", "status"]} title="The same meeting, moved to 10:30" />,
          body: ["Move the meeting to 10:30 and the box turns red: Sarah is busy until 12:00. The line at the top (6) says who's busy, so you don't have to work it out.", "Click the timeline to move the box until it turns green."],
        },
        {
          heading: "Five things every invite needs",
          figure: <BookingFigure focus={["attendees", "time", "teams", "room", "agenda"]} title="Who, when, how long, where, and what for" />,
          body: [
            "Before you press Send, check the invite has all five: the right people (3), the date and time (4) and how long, a room (6) or a Teams link (5), and a one-line agenda (7).",
            "Then tell whoever asked you to book it that it's done.",
          ],
          tip: "Book a room only when people will be in the office. For a video call, the Teams switch is enough.",
        },
      ],
      tryIt: {
        title: "Answer four invites, then book one",
        intro: "Each invite shows your calendar for that day. Answer the way you would at work. Then find the one half hour three busy people are all free.",
        Lab: InviteLab,
      },
      check: [
        {
          q: "An invite is for Tuesday at 11:00. Your calendar is clear then, and it's your job to be there. What do you press?",
          options: ["Accept", "Tentative", "Propose new time"],
          answer: 0,
          reasons: [
            "You're free and you're needed. Accept puts it in your calendar and tells the organiser you're coming.",
            "Tentative means maybe. You're free and it's your job, so there's nothing to be unsure about.",
            "There's no clash at 11:00, so there's no reason to ask for a different time.",
          ],
        },
        {
          q: "In the Scheduling Assistant, Sarah's row has a blue bar from 09:00 to 10:00. What does it tell you?",
          options: ["Sarah has accepted your invite", "Sarah is busy from 09:00 to 10:00", "Sarah is free from 09:00 to 10:00"],
          answer: 1,
          reasons: [
            "The bars show busy time, not answers. You haven't sent the invite yet.",
            "A blue bar is busy. Book your meeting where her row, and everyone else's, is clear.",
            "It's the other way round: the blue bar is when she's already booked.",
          ],
        },
        {
          q: "Which meeting invite is ready to send?",
          options: ["\"Meeting\", Thursday, Sarah and Priya, Room 2, no agenda", "\"Stock count\", Thursday 10:00, Room 2, nobody added yet", "\"Stock count\", Thursday 10:00 to 10:30, Sarah and Priya, Room 2, agenda"],
          answer: 2,
          reasons: [
            "No time, and no agenda: nobody knows when it is or what it's for.",
            "Nobody would get it. The people you need go in Required attendees.",
            "It has all five: the people, the time and length, a room, and what it's for.",
          ],
        },
      ],
      takeaways: [
        "Check your calendar before you answer: Accept, Tentative, Decline or Propose new time.",
        "Use the Scheduling Assistant to find a time when every row is clear.",
        "Every invite needs the people, the time and length, a room or Teams, and an agenda.",
      ],
    },

    /* ---------- Lesson 2 ---------- */
    {
      id: "m3t2",
      title: "Joining a Teams or Zoom call",
      minutes: 8,
      brief: "Most meetings now have a video call. In this lesson you'll learn what you see before you go in, how to join the way you've been asked, and that Zoom works the same way.",
      learn: [
        {
          heading: "Here is the screen before a Teams call",
          body: [
            "When you press Join, Teams doesn't put you straight into the meeting. First it shows this screen, so you can choose how you go in.",
            "Every part is numbered. Nobody in the meeting can see or hear you yet.",
          ],
          figure: <PreJoinFigure />,
        },
        {
          heading: "How you get here: Join",
          figure: <InviteFigure focus={["join", "when"]} title="Join, on the invite" />,
          body: [
            "A Teams meeting has a Join button (5) on the invite. The same button is on the meeting in your calendar, and in Teams.",
            "Press it a minute or two before the start time (3), so you're in when it begins.",
          ],
          tip: "Joining a few minutes early gives you time to sort out your sound without holding anyone up.",
        },
        {
          heading: "Camera and microphone, before you go in",
          figure: <PreJoinFigure camera mic={false} focus={["preview", "camera", "mic"]} title="Camera on, microphone muted" />,
          body: [
            "Teams often starts with your microphone on and your camera off. Set both before you press Join now.",
            "Many offices ask you to join muted, so the noise around you doesn't interrupt. Read the invite: it may say whether cameras should be on. Your picture (2) shows what they'll see.",
          ],
        },
        {
          heading: "Sound through your computer, then Join now",
          figure: <PreJoinFigure camera mic={false} focus={["audio", "join"]} title="Computer audio, then Join now" />,
          body: ["Leave Computer audio (5) chosen: you'll hear the meeting through your laptop or headset.", "Then press Join now (6). You go in with your camera and microphone set the way you chose."],
        },
        {
          heading: "Zoom works the same way",
          body: [
            "Customers and suppliers sometimes send a Zoom link instead of Teams. The words are different, but the parts are the same, and they're numbered the same here.",
            "One difference: Zoom asks about sound after you press Join. Choose Join with Computer Audio (5), or nobody will hear you.",
          ],
          figure: <PreJoinFigure zoom />,
        },
        {
          heading: "If you can't get in",
          body: [
            "Sometimes you'll see \"Someone in the meeting should let you in soon\". Wait: the organiser lets you in.",
            "If nobody can hear you, check your microphone isn't muted, then check your headset is plugged in. Leaving and joining again fixes most things.",
          ],
          good: [{ text: "Sorry, my sound wasn't working. I've rejoined.", note: "One line in the meeting chat is enough." }],
        },
      ],
      tryIt: {
        title: "Join two calls the way you're asked",
        intro: "Press Join, set your camera and microphone on the screen before the call, and go in. The first is Emma's Teams call; the second is a customer's Zoom.",
        Lab: JoinLab,
      },
      check: [
        {
          q: "Emma's invite says \"please join on mute\". When do you switch your microphone off?",
          options: ["Before you press Join now", "Once everyone has said hello", "Only if someone asks you to"],
          answer: 0,
          reasons: [
            "The screen before the call is where you set it, so you go in muted from the first second.",
            "By then the office noise behind you has already interrupted the start.",
            "Emma already asked, in the invite. Do it before you join.",
          ],
        },
        {
          q: "You join a supplier's Zoom. A box asks how you'll hear the meeting. What do you choose?",
          options: ["Close the box and carry on", "Join with Computer Audio", "Leave and join again later"],
          answer: 1,
          reasons: [
            "Without audio you can't hear them, and they can't hear you.",
            "That connects your laptop's sound or headset, so you can hear and be heard.",
            "There's nothing wrong: answer the box and you're in.",
          ],
        },
        {
          q: "When is a good time to press Join?",
          options: ["The moment the invite arrives", "Ten minutes after it starts", "A minute or two before it starts"],
          answer: 2,
          reasons: [
            "That could be days early. The call happens at the time on the invite.",
            "You'd miss the start and hold everyone up while you catch up.",
            "Early enough to sort out your sound, and in when it begins.",
          ],
        },
      ],
      takeaways: [
        "Press Join on the invite, in your calendar or in Teams, a minute or two early.",
        "Set your camera and microphone before Join now: muted, unless you're told otherwise.",
        "Zoom works the same way: choose Join with Computer Audio.",
      ],
    },

    /* ---------- Lesson 3 ---------- */
    {
      id: "m3t3",
      title: "Mute, camera and sharing your screen",
      minutes: 9,
      brief: "Once you're in a call, a handful of buttons do everything. In this lesson you'll learn to mute, turn your camera on and off, and share one window without showing anything private.",
      learn: [
        {
          heading: "Here is a Teams call",
          body: ["This is what a call looks like once you're in. The buttons along the top do everything you'll need.", "Every part is numbered. Here you're muted, with your camera on."],
          figure: <CallFigure />,
        },
        {
          heading: "Mute when you're not talking",
          figure: <CallFigure focus={["mic", "you"]} title="Mic, and the sign you're muted" />,
          body: [
            "Click Mic (7) to mute or unmute. A line through it means nobody can hear you.",
            "Your own picture (3) shows a crossed-out microphone too. Glance at it before you speak: talking while muted is the most common slip in any call.",
          ],
          tip: "Mute whenever you're not talking. Keyboards, coffee cups and lorries outside are louder than you think.",
        },
        {
          heading: "Camera on, camera off",
          figure: <CallFigure camera={false} focus={["camera", "you"]} title="Camera off: they see your initials" />,
          body: [
            "Click Camera (6) to turn it on or off. With it off, everyone sees your initials (3) instead of your face.",
            "Turn it on when you're asked to, or when it helps, like meeting someone new. Turn it off if your connection is slow and your picture keeps freezing.",
          ],
        },
        {
          heading: "Share: what the others will see",
          body: [
            "Click Share (8 on the call) and Teams asks what to show. This is the Share tray, with every part numbered.",
            "Your whole screen (1) shows everything on it. One window (2) shows only that window.",
          ],
          figure: <ShareTrayFigure />,
        },
        {
          heading: "Share one window, not your whole screen",
          figure: <ShareTrayFigure focus={["window", "private"]} title="The window they need, and the one they mustn't see" />,
          body: [
            "Pick the one window people need to see (2), like the rota in Excel. Then nothing else shows, even if a new email pops up.",
            "Your whole screen shows every open window, including anything private (3), like an email about your pay.",
          ],
          tip: "Before a call where you'll share, close anything private. Then a slip can't show it.",
        },
        {
          heading: "While you share",
          figure: <CallFigure sharing="Excel · Rota w/c 16 November.xlsx" focus={["sharebar", "them"]} title="The red bar: what they can see" />,
          body: [
            "A red bar (10) says exactly what the others can see. Check it says the window you meant.",
            "When you've finished, click Stop sharing. Your face comes back instead of your screen.",
          ],
        },
        {
          heading: "Raise, chat and leave",
          figure: <CallFigure focus={["raise", "chat", "leave"]} title="Speaking up, typing, and leaving" />,
          body: [
            "Raise (5) puts a hand by your name when you'd like to speak, so you don't talk over anyone. Chat (4) lets you type to everyone: a link, or \"you've frozen\".",
            "Leave (9) takes you out of the call. It carries on for everyone else.",
          ],
        },
      ],
      tryIt: {
        title: "Run a call with your own hands",
        intro: "Daniel's call has started. Follow each instruction using the buttons in the call: mute, share one window, stop, camera off, unmute, leave.",
        Lab: CallLab,
      },
      check: [
        {
          q: "Someone starts drilling in the next room during a call. What do you press?",
          options: ["Camera, to turn it off", "Leave, then join again", "Mic, to mute yourself"],
          answer: 2,
          reasons: [
            "The camera has nothing to do with the noise. They'd still hear the drill.",
            "That drops you out of the call, and the drilling will still be there.",
            "Muted, nobody hears the drill. Unmute when you need to speak.",
          ],
        },
        {
          q: "Daniel wants to see the rota. A private email is open in Outlook. What do you share?",
          options: ["Just the Excel window with the rota", "Your whole screen, so he sees it all", "The Outlook window with the email"],
          answer: 0,
          reasons: [
            "Only the rota shows. The private email stays private.",
            "Your whole screen shows every window, the private email included.",
            "That's the one window he must not see.",
          ],
        },
        {
          q: "How can you tell what the others can see while you share?",
          options: ["Teams emails you a copy of it", "A red bar says what you're sharing", "Your camera picture turns red"],
          answer: 1,
          reasons: [
            "Nothing is emailed. Check the bar at the top of the call.",
            "The red bar names the window or screen on show, with Stop sharing beside it.",
            "Your picture doesn't change. The red bar along the top is the sign.",
          ],
        },
      ],
      takeaways: [
        "Mute whenever you're not talking, and check your picture before you speak.",
        "Share one window, never your whole screen, and close anything private first.",
        "Watch the red bar while you share, and press Stop sharing when you're done.",
      ],
    },

    /* ---------- Lesson 4 ---------- */
    {
      id: "m3t4",
      title: "Chat or email: which one?",
      minutes: 8,
      brief: "Teams chat and email both send words to people, but they're for different things. In this lesson you'll learn which to use, so quick things are quick and important things are kept.",
      learn: [
        {
          heading: "Here is Teams, open on a chat",
          body: [
            "Teams is where most offices chat. It's quicker than email: messages pop up straight away, like texts.",
            "Every part is numbered. This is a quick question to Sarah, and her answer.",
          ],
          figure: <TeamsFigure />,
        },
        {
          heading: "Chat is for quick things",
          figure: <TeamsFigure focus={["messages", "compose", "send"]} title="A quick question, a quick answer" />,
          body: [
            "Use chat for things that are quick and don't need keeping: a yes-or-no question, \"running late\", \"thanks, got it\".",
            "Type it (7), press Enter or Send (8), and it appears in the conversation (6) at once.",
          ],
          good: [{ text: "Is the warehouse printer working again?" }, { text: "Running 5 minutes late, sorry." }, { text: "Thanks, got it!" }],
        },
        {
          heading: "Email is for anything that needs a record",
          figure: <ComposeFigure focus={["to", "subject", "attach"]} title="An email: a record anyone can find later" email={{ to: "Tom Hale", subject: "Invoice HP-2291: credit note for two pallets", attachment: "DN-77812.pdf", greeting: "Dear Mr Hale,", message: ["Invoice HP-2291 charges us for 12 pallets, but delivery note DN-77812 shows only 10 arrived.", "Could you send a credit note for £115.20 by Friday 13 November?"], signoff: "Kind regards,\nJordan", signature: ["Jordan Miles", "Office Administrator | Northfield Supplies", "01632 960 431"] }} />,
          body: [
            "Use email for anything people may need to find again: money, files, decisions, complaints, and the actions from a meeting.",
            "An email has a subject (5) people can search for, it can carry a file (6), and it stays in everyone's inbox as a record.",
          ],
        },
        {
          heading: "Outside the company? Email.",
          body: [
            "Customers and suppliers usually aren't in your company's Teams. Email them.",
            "Anything with a price, an order or a promise in it goes by email too, so both sides have it in writing.",
          ],
          good: [{ text: "Email Bright Cafe their price for 15 cases of cups." }],
          bad: [{ text: "Try to find the supplier in Teams to ask about an invoice." }],
        },
        {
          heading: "Is now a good time? The status dot",
          figure: <TeamsFigure focus={["presence", "unread"]} title="Status dots, and unread chats" />,
          body: [
            "The dot on someone's picture (4) says if now's a good time. Green: available. Red: busy, or in a call. Yellow: away from their desk.",
            "A chat in bold with a number (3) has messages you haven't read. Teams also puts a number on its button on the taskbar.",
          ],
          tip: "Red dot? Send the chat anyway if it's quick, but don't expect an answer until they're free.",
        },
        {
          heading: "A quick test",
          body: ["Ask yourself one question: would anyone need to find this again next week? If yes, email. If no, chat."],
          good: [
            { text: "Is Room 2 free at 2?", note: "Chat: quick, and nobody needs it later." },
            { text: "The signed delivery report", note: "Email: it's a file, and a record." },
            { text: "What we agreed in the meeting", note: "Email: people will look it up." },
          ],
        },
      ],
      tryIt: {
        title: "Send each one the right way",
        intro: "Eight things to send. For each, choose Teams chat or email. Watch where each one lands.",
        Lab: ChatOrEmailLab,
      },
      check: [
        {
          q: "You need to tell Emma you're 5 minutes late for your 11:30 with her. How?",
          options: ["An email to Emma", "A Teams chat to Emma", "A meeting invite to Emma"],
          answer: 1,
          reasons: [
            "She may not open an email before 11:30, and nobody needs a record of it.",
            "Quick, and it pops up for her straight away.",
            "An invite is for booking a meeting, not for saying you're late.",
          ],
        },
        {
          q: "Which of these should go by email?",
          options: ["A price quote for a customer", "\"Is the printer fixed yet?\"", "\"Thanks, got it!\""],
          answer: 0,
          reasons: [
            "A customer is outside the company, and a price needs to be in writing for both sides.",
            "A quick question with a one-word answer: chat.",
            "A quick thank-you: chat. An email just fills an inbox.",
          ],
        },
        {
          q: "Sarah's picture in Teams has a red dot. What does it mean?",
          options: ["She's working from home today", "She has unread messages", "She's busy, or in a call"],
          answer: 2,
          reasons: [
            "The dot says if she's free, not where she's working.",
            "Unread messages show as bold chats with a number, not as a red dot.",
            "Red means busy. A quick chat is fine, but don't expect an answer straight away.",
          ],
        },
      ],
      takeaways: [
        "Chat for quick things nobody needs to keep: questions, running late, thanks.",
        "Email for anything that needs a record: money, files, decisions, actions.",
        "People outside the company: email them.",
      ],
    },

    /* ---------- Lesson 5 ---------- */
    {
      id: "m3t5",
      title: "Writing down the actions",
      minutes: 9,
      brief: "A meeting is only useful if things get done afterwards. In this lesson you'll learn to write up the actions: who's doing what, by when, in one short email.",
      learn: [
        {
          heading: "Here is an email with a meeting's actions",
          body: [
            "After a meeting, someone sends round what was agreed. Often that's the person who booked it, which will be you.",
            "Every part is numbered. The heart of it is a short list: who (4), what (5) and by when (6).",
          ],
          figure: <ActionsFigure />,
        },
        {
          heading: "Listen for three things",
          figure: <ActionsFigure focus={["who", "what", "when"]} title="Who, what, by when" />,
          body: ["Every action has three parts. Who (4) is doing it, what (5) they're doing, and by when (6).", "If one of the three is missing, it isn't an action yet. Ask, there and then: \"Who's taking that? By when?\""],
        },
        {
          heading: "Where the actions come from",
          figure: <TeamsFigure chat={STOCK_CHAT} focus={["messages"]} title="The meeting chat: actions hidden in the talk" what={{ messages: "Read it for anyone saying they'll do something, and by when. Here there are three, one of them yours." }} />,
          body: [
            "Actions are said out loud, or typed in the meeting's chat (6). Note them down as they're agreed.",
            "Here: Sarah will ring Kent Flour Mills by Thursday, Emma will move the early shift by Friday, and you'll add a Late column today.",
          ],
        },
        {
          heading: "One name per action",
          figure: <ActionsFigure focus={["who"]} title="A named person on every line" />,
          body: ["Put one person's name on each action (4). \"We\" or \"someone\" means nobody does it.", "Your own actions go in the list too, with your name or \"Me\"."],
          good: [{ text: "Sarah: ring Kent Flour Mills about the late vans" }],
          bad: [{ text: "Someone to ring Kent Flour Mills" }, { text: "We need to sort the vans out" }],
        },
        {
          heading: "A real date, not \"soon\"",
          figure: <ActionsFigure focus={["when"]} title="By when: a real day" />,
          body: ["Give each action a day (6). \"Soon\" and \"next week\" mean different things to different people."],
          good: [{ text: "by Friday 13 November" }, { text: "by the end of today" }],
          bad: [{ text: "ASAP" }, { text: "when you get a chance" }],
        },
        {
          heading: "Send it by email, the same day",
          figure: <ActionsFigure focus={["to", "subject", "opening"]} title="To everyone with an action, about one meeting" />,
          body: [
            "Send it to everyone with an action (1), the same day, while it's fresh. Others from the meeting can go on Cc.",
            "Name the meeting in the subject (2), so anyone can search for it later. It's a record, so it goes by email, not chat.",
          ],
          tip: "Keep it short: one opening line (3), the list, and thanks. No need to write up everything that was said.",
        },
      ],
      tryIt: {
        title: "Send the actions round",
        intro: "Read the meeting chat, then write the actions email to Sarah and Priya: one line each for who, what and by when. Press Send to see how it does.",
        Lab: ActionsLab,
      },
      check: [
        {
          q: "Which action is written well?",
          options: ["Someone to chase Harlow at some point", "Priya: chase Harlow by Friday 13 November", "We should look into the invoice soon"],
          answer: 1,
          reasons: [
            "No name and no date: it's likely nobody does it.",
            "Who, what and by when, all in one line.",
            "\"We\" and \"soon\" leave it to nobody, and to no particular day.",
          ],
        },
        {
          q: "Who should the actions email go to?",
          options: ["Only your manager", "Only people who missed the meeting", "Everyone who has an action"],
          answer: 2,
          reasons: [
            "Your manager might like a copy, but the people doing the work need it most.",
            "Everyone with an action needs it in writing, whether or not they were there.",
            "Each of them gets their action in writing. Others can go on Cc.",
          ],
        },
        {
          q: "You agreed to update the stock sheet. Does that go in the list?",
          options: ["Yes, with your name and a date", "No, you'll just remember it", "Only if your manager asks"],
          answer: 0,
          reasons: [
            "Your actions count like anyone's. Writing them down shows you'll do them.",
            "Everyone else can see what's yours, and you won't forget it when the week gets busy.",
            "Don't wait to be asked: put it in with everyone else's.",
          ],
        },
      ],
      takeaways: [
        "Every action needs who, what and by when.",
        "One name per action, and a real date, never \"soon\".",
        "Email them the same day to everyone with an action, with the meeting in the subject.",
      ],
    },
  ],
};

export default m3;
