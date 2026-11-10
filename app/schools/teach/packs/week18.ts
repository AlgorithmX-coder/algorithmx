/**
 * Cyber Heroes, week 18: the teacher pack.
 *
 * Sharing devices. The raccoon cracks nothing this week: he waits for somebody
 * to walk away from a screen that is still signed in. Five things a good
 * visitor does on a screen that is not only theirs.
 *
 * THREE THINGS THE SOURCE MADE ME CHANGE.
 *
 * 1. The week counts the screens a child uses at home: the family tablet, the
 *    console, their own phone. Asked in a room, that is a count of money, and
 *    some children have none of them. So the pack starts from the one shared
 *    screen every child in the room has: the school computer they are about to
 *    log on to. It also makes the after-half real, because they can do the
 *    routine on that machine before they stand up.
 *
 * 2. The Button Hunt has the child fit a lock to the FAMILY tablet, on their
 *    own, from Settings. Done for real at home that night, it locks a parent
 *    out of their own device. The game is teaching where the lock lives, not
 *    asking anybody to go and set one, so the take-home job is to ask a
 *    grown-up to show them it, and the teacher is told to say "never change it
 *    on your own" out loud.
 *
 * 3. Beat 4 ("whose is this?") is gentle and right, and the game is careful
 *    never to dare a child to peek. But a class will hear it as "reading
 *    somebody's messages is wrong", and a child will offer that a parent checks
 *    theirs. A grown-up keeping an eye on a young child's tablet is ordinary
 *    and good, so the teacher gets a line that keeps both true.
 *
 * Also worth knowing: the Lock Before You Leave game reopens something AFTER
 * the child has locked correctly, every time, on purpose (the look-back lesson).
 * Like week 5's Ember Chase, a teacher who does not know will treat it as a
 * mistake.
 *
 * Mirrors app/lesson/weekContent/week18.ts. See ./types.ts for the fields.
 */
import { ART } from "./art";
import type { Card, Concept, Pack, Slide } from "./types";

const FIVE: readonly Concept[] = [
  { art:ART.phone,    name:"Screen Spotter", line:"Most screens are shared." },
  { art:ART.locked,   name:"Clean Leaver",   line:"Close. Lock. Look back." },
  { art:ART.door,     name:"Door Fitter",    line:"Every screen needs a front door." },
  { art:ART.team,     name:"Lid Putter-Downer", line:"Whose is this? Ask it first." },
  { art:ART.padkey,   name:"Balloon Popper", line:"Borrowed screen? No thank you." },
];

/* The three things a visitor leaves behind. Before the break they are open
   doors; after it, the same three, locked. Same array both times, so the
   mirror lands from the back of the room. */
const RISKS: readonly Card[] = [
  { art:ART.unlocked, head:"Still signed in",    sub:"the next person can play as you" },
  { art:ART.door,     head:"No front door",      sub:"a screen with no lock at all" },
  { art:ART.padkey,   head:"&ldquo;Remember me?&rdquo; Yes", sub:"the next person is already you" },
];

const SLIDES: readonly Slide[] = [
  /* ───────── 10 MINUTES: TALKING IT THROUGH BEFORE THEY PLAY ───────── */
  { at:"before", kind:"tell", scene:"solo", art:ART.school, eyebrow:"Week 18 &middot; Lock Before You Leave",
    title:"On most screens,<br>you are a visitor.",
    say:"&ldquo;Eyes up. In a minute you are going to log on to the computers. Here is a question: <b>whose computer is it?</b>&rdquo; Let them answer. &ldquo;It is the school&rsquo;s. And tomorrow somebody else will sit exactly where you are sitting. So on that computer you are a <b>visitor</b>. And that is completely normal, because nearly every screen anybody uses is shared with somebody. This week is about being a brilliant visitor: you tidy up after yourself, and you leave it as you found it.&rdquo;",
    warn:"<b>Start from the school computer, not from home.</b> Asking which screens they have at home is a count of money, and some children have none. Every child in this room shares the machine in front of them, so start there and let home come up on its own." },

  { at:"before", kind:"ask", scene:"racc", eyebrow:"Ask the class",
    title:"He does not crack<br>anything. He waits.",
    bubble:"I just wait for somebody to walk away.",
    say:"&ldquo;This week he does not even try to guess a password.&rdquo; Read the bubble, slowly and smugly. &ldquo;So what is he waiting <b>for</b>?&rdquo;",
    hear:[
      ["&ldquo;For you to forget to log out.&rdquo;", "&ldquo;Exactly. Then he does not need your password, because the screen is still being you.&rdquo;"],
      ["&ldquo;For you to go to the toilet.&rdquo;", "&ldquo;Yes! Any time somebody walks away. That is all he needs.&rdquo;"],
      ["&ldquo;Your password.&rdquo;", "&ldquo;He would like it. But if you leave it signed in, he does not even need it. That is the sneaky bit.&rdquo;"],
    ],
    warn:"The point to land is that <b>a signed-in screen IS you</b>, without anybody knowing your password. Children think of safety as a secret password; this week is about what happens after you have typed it." },

  { at:"before", kind:"ask", scene:"risks", id:"risks", cards:RISKS, eyebrow:"Talk about it",
    title:"Three doors he<br>hopes you leave open.",
    say:"&ldquo;He has three favourite doors.&rdquo; Walk the three. &ldquo;A screen that is still signed in. A screen with no lock on it at all. And the sneakiest: a little balloon pops up and says <b>shall I remember your password?</b>, and somebody says yes.&rdquo; Then ask: &ldquo;Why is saying yes on a shared screen a problem?&rdquo;",
    hear:[
      ["&ldquo;Because the next person can get in.&rdquo;", "&ldquo;Without even knowing your password. The screen types it in for them. Saying yes makes the next person <b>you</b>.&rdquo;"],
      ["&ldquo;I always press yes.&rdquo;", "&ldquo;Loads of people do, grown-ups too. On your own device with a lock on it, that is fine. On a shared one, it is the thing to change.&rdquo;"],
    ],
    link:{ to:"safe", text:"You come back to these same three on slide %s, after they have played, and show them locked." },
    warn:"Keep &ldquo;on your own locked device it is fine&rdquo; in. The game says it too, and without it the week teaches that saving a password is always wrong, which is not true and not what the course says." },

  { at:"before", kind:"ask", scene:"scenarios", eyebrow:"Ask the class",
    cards:[
      { art:ART.school, sub:"The computer you sit at on Tuesdays" },
      { art:ART.phone,  sub:"The tablet that lives on the kitchen shelf" },
      { art:ART.camera, sub:"Gran&rsquo;s phone, borrowed for one photo" },
    ],
    title:"Whose screen<br>is it really?",
    say:"&ldquo;Three screens. For each one: is it yours, or are you a visitor?&rdquo; Go along the three. Then the question that sorts them all: &ldquo;Does <b>anybody else</b> ever touch it?&rdquo;",
    hear:[
      ["&ldquo;The tablet is mine!&rdquo;", "&ldquo;Who else picks it up? If anybody does, even once, it is shared. That is not bad, it just means visitor rules.&rdquo;"],
      ["&ldquo;Gran&rsquo;s phone is just for one photo.&rdquo;", "&ldquo;One photo, and then it goes home in Gran&rsquo;s pocket. With whatever you left signed in on it.&rdquo;"],
      ["&ldquo;We have not got a tablet.&rdquo;", "&ldquo;Then you are like most of us with the computers here: everything you use is shared. Which makes you the expert this week.&rdquo;"],
    ],
    warn:"<b>Shared is not dangerous.</b> The game is firm about this and you should be too: a family tablet is a lovely thing. If a child starts to sound worried about using shared screens, the answer is &ldquo;you just leave it tidy&rdquo;, not &ldquo;be careful&rdquo;." },

  { at:"before", kind:"do", scene:"five", eyebrow:"Now it is your turn",
    title:"Log on and<br>have a go.",
    under:"We all come back together 10 minutes before the end.",
    say:"&ldquo;Right. Week 18, and you are going to be a <b>Lock Master</b>. Five things to learn.&rdquo; Read the five off the board. &ldquo;We come back together <b>10 minutes before the end</b>, and when we do, stay at your computer. We are going to use it.&rdquo;",
    hear:[
      ["&ldquo;Something opened again after I locked it!&rdquo;", "&ldquo;That is meant to happen. Keep going and you will see why.&rdquo; Do not explain it yet."],
      ["Somebody cannot log in", "Get them going before you sit down. A child stuck on the login learns nothing for forty-five minutes."],
    ],
    handover:true,
    warn:"<b>One game does something on purpose that looks like a mistake.</b> In Lock Before You Leave, a child closes every card and locks the tablet correctly, and then something opens up again behind them. Every child, every time. It is the lesson about looking back, not a bug and not their error. And ask them to <b>stay at their machines</b> for the talk afterwards, because part of it has them sign out for real." },

  /* ───────── 45 MINUTES ON THE COMPUTERS ───────── */

  /* ───────── 10 MINUTES: TALKING IT THROUGH AFTERWARDS ───────── */
  { at:"after", kind:"ask", scene:"racc", eyebrow:"Talk about it",
    title:"How did you get on?",
    bubble:"Every door bolted?!",
    say:"&ldquo;Hands off the mouse for a moment. So, which of his doors was the hardest to shut?&rdquo; Then: &ldquo;Did anybody have something open up <b>after</b> they had locked the tablet?&rdquo; Most hands.",
    hear:[
      ["&ldquo;It opened again, I did it wrong.&rdquo;", "&ldquo;You did it <b>right</b>. It opens for everybody, on purpose, because shared screens really do that. That is why the last move is looking back.&rdquo;"],
      ["&ldquo;The settings one, I could not find the lock.&rdquo;", "&ldquo;It is a big menu. The trick is reading the buttons instead of guessing. It is always in Settings, under a word like Lock.&rdquo;"],
      ["&ldquo;The X closes it, so you are logged out.&rdquo;", "&ldquo;The X only hides the window. Your account is still there underneath. Only <b>log out</b> or <b>sign out</b> takes your name off.&rdquo;"],
    ],
    warn:"Say plainly that the reopening was on purpose. Children who did everything right will otherwise leave thinking they failed the main game of the week." },

  { at:"after", kind:"ask", scene:"meet", eyebrow:"Ask the class",
    cards:[
      { art:ART.speech,  head:"A chat, half open", sub:"your brother and his football team" },
      { art:ART.palette, head:"A drawing app",     sub:"your half finished dragon" },
      { art:ART.inbox,   head:"An email, open",    sub:"about work, for Dad" },
    ],
    title:"Whose is this?",
    say:"&ldquo;You pick up the family tablet and these three are open on it. One question comes before every other question.&rdquo; Point at the title. &ldquo;<b>Whose is this?</b>&rdquo; Go along the three. &ldquo;Yours means carry on. Somebody else&rsquo;s means leave it exactly as you found it, because on the other end of it is a person who would mind.&rdquo;",
    hear:[
      ["&ldquo;But it was open.&rdquo;", "&ldquo;Open is not the same as yours. A front door left open is still somebody&rsquo;s house.&rdquo;"],
      ["&ldquo;My mum reads my messages.&rdquo;", "&ldquo;That is a grown-up&rsquo;s job: keeping an eye on things while you are young. This is about you and other people&rsquo;s things.&rdquo; See below."],
      ["&ldquo;What if nobody would find out?&rdquo;", "&ldquo;The question is not whether you get caught. It is whose it is. That is why the brother would go pink.&rdquo;"],
    ],
    warn:"<b>Have the parent answer ready.</b> A child will say a grown-up at home reads their messages. For a child this age that is ordinary, good parenting, and the week must not turn it into something wrong. Keep it light and move on. If anything about what a child says worries you, follow your safeguarding policy as you would any other day. And check your register: the game&rsquo;s brother is called <b>Sam</b>, so a class with a Sam in it will turn round." },

  { at:"after", kind:"do", scene:"recipe", eyebrow:"Do it together, for real",
    title:"Close. Lock.<br>Look back.",
    recipe:{ slots:["CLOSE","LOCK","LOOK BACK"],
      thenLabel:"and if it asks",
      add:["Remember me? No thank you."],
      test:"Somebody sits here tomorrow. Leave it as you found it." },
    say:"&ldquo;Now you are going to do it for real on the computer in front of you. Say it with me: <b>close, lock, look back.</b>&rdquo; Then walk them through it on their own machines. &ldquo;Close the lesson. Go back to Cyber HQ and tap <b>Sign out</b>, the button in the bottom right corner. Now&rdquo;, pause, &ldquo;<b>look back.</b> Is your name still on the screen anywhere? No? That is a Lock Master.&rdquo;",
    hear:[
      ["&ldquo;Why do I need to look back?&rdquo;", "&ldquo;Because you are a person in a hurry, and people in a hurry miss things. It takes two seconds.&rdquo;"],
      ["&ldquo;My screen still says my name.&rdquo;", "Go and look. That child has just done exactly what the week teaches, so say so to the room."],
    ],
    warn:"Doing it on the real machine is what makes this week stick, and it also stops the next class playing as this one. <b>The Sign out button only appears on the Cyber HQ screen</b>, bottom right, with a line under it saying it is for the next person. A child who finished the week reaches Cyber HQ from the button on the last screen; a child still part way through will not have that button, so type <b>/cyberhq</b> after the site address for them. Their progress is saved either way. Do the first one together and wait for every hand before moving on." },

  { at:"after", kind:"tell", scene:"risks", safe:true, stamp:"locked", id:"safe", cards:RISKS, eyebrow:"Look what you did",
    title:"All three doors.<br>Locked.",
    say:"&ldquo;Remember his three doors from the start? Look at them now.&rdquo; Go along the three. &ldquo;You signed out. You know where the front door lives on any screen. And the balloon got a no thank you. <b>He waited all lesson, and nobody walked away.</b>&rdquo; Then, to the whole room:",
    hear:[
      ["Somebody looks pleased", "Let them. They earned it."],
      ["&ldquo;I always leave the tablet signed in.&rdquo;", "&ldquo;Most people do. Now you know, so now you can do the other thing.&rdquo;"],
    ],
    warn:"<b>Say this out loud, whether or not anybody asks.</b> Something like: <em>if you have ever left something signed in, or said yes to that balloon, you are not in trouble. Nearly everybody has, grown-ups too. You just do it differently from today.</em> Several children have, and the week calls it a door you left open." },

  { at:"after", kind:"ask", scene:"solo", art:ART.padkey, eyebrow:"What would you do?",
    title:"&ldquo;Go on, save it.<br>It&rsquo;s fine!&rdquo;",
    say:"&ldquo;Last one. You are on Grandad&rsquo;s computer, the balloon pops up, and Grandad smiles and says: go on, save it, it is fine. What do you do?&rdquo;",
    hear:[
      ["&ldquo;Save it, a grown-up said so.&rdquo;", "&ldquo;He is being kind. But his computer is shared, and your password would wait there for whoever clicks next. So what could you say?&rdquo;"],
      ["&ldquo;Say no thank you.&rdquo;", "&ldquo;Yes. And you can tell him why: &lsquo;It is your computer, Grandad, so I will not leave my key on it.&rsquo; That is polite, and now he knows it too.&rdquo;"],
      ["&ldquo;Is that being rude to Grandad?&rdquo;", "&ldquo;No thank you is never rude. You are looking after his computer as well as your account.&rdquo;"],
    ],
    warn:"This is the question the boss battle asks, and it is the hard one because <b>a grown-up says yes</b>. Keep the answer polite and small: &ldquo;no thank you&rdquo; plus a reason. It is not about out-ruling a grown-up, and you do not need a child arguing with family. If a grown-up insists, it is their computer: the child can tell their own grown-up at home about it later." },

  { at:"after", kind:"tell", scene:"tonight", art:ART.door, eyebrow:"Tonight",
    title:"Ask a grown-up to<br>show you the lock.",
    under:"Look, do not change. It is their screen.",
    say:"&ldquo;One job tonight. If there is a shared screen at home, ask a grown-up: <b>where does the lock live on this?</b> Ask them to show you. Look, do not change anything. It is their screen, and you would not want to lock everybody out.&rdquo; Pause. &ldquo;And if there is no screen at home, teach a grown-up the three words instead. Close. Lock. Look back.&rdquo;",
    hear:[
      ["&ldquo;Can I put a code on the tablet?&rdquo;", "&ldquo;Only if the grown-up whose tablet it is says yes and does it with you. Never on your own.&rdquo;"],
      ["&ldquo;Ours has no lock.&rdquo;", "&ldquo;Then that is a good thing to show a grown-up. They decide, because it is theirs.&rdquo;"],
    ],
    warn:"<b>Say &ldquo;never change it on your own&rdquo; out loud.</b> In the game the child fits a lock to the family tablet from Settings, by themselves. Done for real, that locks a parent out of their own device and lands you with a phone call. The job is to look, with a grown-up. The &ldquo;no screen at home&rdquo; version is there so every child leaves with something they can do." },
];

export const WEEK_18: Pack = {
  n: 18,
  title: "Lock Before You Leave",
  sub: "Sharing Devices",
  five: FIVE,
  slides: SLIDES,
  games: "The Charging Rack, Lock Before You Leave, Find the Front Door, Other People&rsquo;s Things, The Save Password Balloons, The Lock Master&rsquo;s Routine",
};
