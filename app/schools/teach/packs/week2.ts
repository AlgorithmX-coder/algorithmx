/**
 * Cyber Heroes, week 2: the teacher pack.
 *
 * Private info. The week after passwords, and deliberately the opposite shape:
 * week 1 was one thing to protect, this one is a short list of things to keep
 * and a much longer list of things they are free to say. Lead with the second
 * or the whole lesson lands as a set of bans.
 *
 * Mirrors app/lesson/weekContent/week2.ts, so the words on the board are the
 * words on their screens. See ./types.ts for what each field is for, and note
 * that several carry authored HTML on purpose.
 */
import { ART } from "./art";
import type { Card, Concept, Pack, Slide } from "./types";

const FIVE: readonly Concept[] = [
  { art:ART.shield,   name:"Private Radar",    line:"Who you are. Where you are." },
  { art:ART.share,    name:"Share Smarts",     line:"Favourites are fine to say." },
  { art:ART.question, name:"The Why-Check",    line:"Why do they need it?" },
  { art:ART.mask,     name:"Secret Identity",  line:"Your username is a mask." },
  { art:ART.pause,    name:"Ask First",        line:"Not sure? Pause and ask." },
];

/* The three cards that appear twice: once as what he could do with a scrap of
   private information, and again after the break with a stamp on each. Same
   array both times, because identical layout is what makes the mirror land
   from the back of the room. */
const RISKS: readonly Card[] = [
  { art:ART.home,   head:"Turns up at your door", sub:"your address is where you sleep" },
  { art:ART.school, head:"Waits at the gates",    sub:"your school is where you are, five days a week" },
  { art:ART.phone,  head:"Rings at bedtime",      sub:"your number, going off at dinner and after lights out" },
];

const SLIDES: readonly Slide[] = [
  /* ───────── 10 MINUTES: TALKING IT THROUGH BEFORE THEY PLAY ───────── */
  { at:"before", kind:"tell", scene:"solo", art:ART.vault, eyebrow:"Week 2 &middot; Private Info",
    title:"Some things<br>stay locked.",
    say:"&ldquo;Eyes up here. Last week we did passwords. This week is about the things a password is <b>protecting</b>. Here is the good news first: most of what you want to say online is completely fine. Your favourite game, your favourite colour, the fact you love drawing. Say all of it. But there is a <b>short list</b> that goes in the vault, and this week you learn exactly what is on it.&rdquo;",
    warn:"<b>Lead with the good news, not the list of bans.</b> The whole week is built on the idea that almost everything is fine and only a short list is private. Children who hear &ldquo;do not share anything&rdquo; either stop listening or go quiet online, and neither is what you want." },

  { at:"before", kind:"ask", scene:"racc", eyebrow:"Ask the class",
    title:"Why would he want<br>to know that?",
    bubble:"What school do you go to?",
    say:"&ldquo;He is back. But look, he is not asking for your password this week.&rdquo; Read the speech bubble out. &ldquo;That sounds harmless, does it not? So why does he want it?&rdquo;",
    hear:[
      ["&ldquo;So he can find me.&rdquo;", "&ldquo;That is exactly it. Your school is where you are, five days a week, at the same times.&rdquo;"],
      ["&ldquo;But it is not a secret. It is on my jumper.&rdquo;", "&ldquo;Good point, and you are right. The difference is <b>who is looking</b>. The people who can see your jumper are already standing there. Somebody online is not.&rdquo;"],
      ["&ldquo;I would just say it.&rdquo;", "&ldquo;Most people would, and that is why it works. He is not stealing anything. He is just asking, politely, and hoping you answer.&rdquo;"],
    ],
    warn:"The jumper answer comes up almost every time and it is a good one. Do not swat it. The distinction worth drawing is between somebody who is already there and somebody who is not, and a child who has worked that out for themselves has understood the week." },

  { at:"before", kind:"ask", scene:"risks", id:"risks", cards:RISKS, eyebrow:"Talk about it",
    title:"So what could<br>he do with it?",
    say:"&ldquo;Let us think about what that actually means. If he knew where you lived, where you went to school, and your phone number, what could he do?&rdquo; Take a few answers, then walk the three on the board. &ldquo;He knows where you sleep. He knows where to wait on a Tuesday morning. And he can ring you at dinner, and again at bedtime.&rdquo;",
    hear:[
      ["&ldquo;Come to my house.&rdquo;", "&ldquo;He could. And the only reason he could is that somebody typed an address into a box.&rdquo;"],
      ["&ldquo;Pretend to be my friend.&rdquo;", "&ldquo;That is the clever one. Somebody who already knows your name and your school <b>feels</b> like a friend. That is the whole trick.&rdquo;"],
      ["A child goes quiet or looks worried", "Stop and say it plainly: this is exactly why they are learning it, and by the end of the lesson they will know how to give him none of it."],
    ],
    link:{ to:"safe", text:"You come back to these same three on slide %s, after they have played, and show them stopped." },
    warn:"This is the slide that makes them care, so give it a minute. Then <b>stop</b>. Do not add frightening things nobody asked about, and do not tell true stories from the news. The game keeps this comic on purpose: the raccoon turns up in a trench coat, not a real stranger." },

  { at:"before", kind:"ask", scene:"scenarios", eyebrow:"Ask the class",
    cards:[
      { art:ART.gamepad, sub:"A game wanted your school before it would let you join" },
      { art:ART.mail,    sub:"Free stickers, if you just type your name and your phone number" },
      { art:ART.nametag, sub:"A username with your real name, or the year you were born, in it" },
    ],
    title:"Has any of this<br>happened to you?",
    say:"&ldquo;Hands up if any of these has ever happened to you. There is nothing wrong with any of it, I just want to know.&rdquo; Go along the three one at a time.",
    hear:[
      ["Lots of hands on the last one", "Extremely common, and it is the easiest one to fix. &ldquo;We will sort that out at the end of the lesson.&rdquo;"],
      ["&ldquo;I put my birthday in mine.&rdquo;", "&ldquo;Thank you for saying so. That is the exact thing we are going to change tonight, and you are not in trouble.&rdquo;"],
      ["A child looks uncomfortable", "Move on and check in with them afterwards. Never press a child in front of the room."],
    ],
    warn:"Keep this light and quick. Hands up, a comment, move on. The point is only to make it their life rather than a story about a cartoon." },

  { at:"before", kind:"do", scene:"five", eyebrow:"Now it is your turn",
    title:"Log on and<br>have a go.",
    under:"We all come back together 10 minutes before the end.",
    say:"&ldquo;Right. In a minute you are going to play Week 2 yourselves, and you are going to learn <b>five things</b>.&rdquo; Read the five off the board. &ldquo;Sarah talks you through every screen, so just get going. And we all come back together <b>10 minutes before the end</b> to talk about what you found.&rdquo;",
    hear:[
      ["&ldquo;Do we make a username?&rdquo;", "&ldquo;You do. There is a machine that builds one for you, and it is the best bit.&rdquo;"],
      ["Somebody cannot log in", "Get them going before you sit down. A child stuck on the login learns nothing for forty-five minutes."],
    ],
    handover:true,
    warn:"<b>Read the five names off the board before they go.</b> Without the words the game is just clicking; with them, every screen has a name they have already heard you say. Then <b>watch the clock</b>: set an alarm for 10 minutes before the end, stop them wherever they are, and bring everyone back. The rest of this deck is that last 10 minutes." },

  /* ───────── 45 MINUTES ON THE COMPUTERS ───────── */

  /* ───────── 10 MINUTES: TALKING IT THROUGH AFTERWARDS ───────── */
  { at:"after", kind:"ask", scene:"racc", eyebrow:"Talk about it",
    title:"How did you get on?",
    bubble:"My list came back blank.",
    say:"&ldquo;So. He spent the whole lesson asking you for things. What did he actually get?&rdquo; Let them enjoy it. &ldquo;What was he asking for that you would not give him?&rdquo;",
    hear:[
      ["&ldquo;My address!&rdquo; &ldquo;My school!&rdquo;", "Take the list. Every one they shout is one they recognised, which is the whole point of the lesson."],
      ["&ldquo;I got one wrong at the start.&rdquo;", "&ldquo;Good. That is what the game is for. Which one caught you?&rdquo; The ones that catch people are worth the whole class hearing."],
      ["&ldquo;The sticker one was sneaky.&rdquo;", "&ldquo;It was. Free things that cost your phone number are not free.&rdquo;"],
    ],
    warn:"Let them tell you. They have just been tested by the game, so nothing here needs a right answer. This is where you find out what actually stuck." },

  { at:"after", kind:"ask", scene:"risks", eyebrow:"Ask the class",
    cards:[
      { art:ART.speech, head:"Pancakes are<br>the best breakfast", sub:"what you like" },
      { art:ART.school, head:"Maple Hill is<br>the best school", sub:"where you are, five days a week" },
      { art:ART.home,   head:"Rainbow Road is<br>the best street", sub:"where you sleep" },
    ],
    title:"One of these is fine.<br>Two are not.",
    say:"&ldquo;All three of these sound like favourites. Somebody wrote them on their profile. Which one is safe?&rdquo; Take votes on each. &ldquo;Only the pancakes. The other two sound like favourites but they quietly tell a stranger <b>where you are</b>.&rdquo;",
    hear:[
      ["They get it instantly", "Excellent. Push once: &ldquo;So what is the test?&rdquo; You want <em>does it say who I am or where I am</em>."],
      ["&ldquo;The school one is fine, loads of people go there.&rdquo;", "&ldquo;True. But he does not need to know which of you it is yet. He only needs to know where to stand.&rdquo;"],
      ["Somebody spots it is a trick question", "&ldquo;It is. And that is exactly how it looks in real life. The dangerous ones are dressed up as favourites.&rdquo;"],
    ],
    warn:"This is the slide that does the most work in the whole week, because it is the only one where the wrong answer looks completely innocent. If you only have time for one thing after the break, do this one." },

  { at:"after", kind:"do", scene:"recipe", eyebrow:"Do it together",
    title:"Let&rsquo;s build a<br>hero name.",
    recipe:{ slots:["hero word","creature","a number that means nothing"],
      test:"Now check it. Is there any of the real you in there?" },
    say:"&ldquo;Everybody think of a hero word. Shout them out.&rdquo; Take three or four. &ldquo;Now a creature.&rdquo; Take three or four. &ldquo;And a number that does not mean anything. Not your age, not the year you were born, not your house number.&rdquo; Build two or three on the board from what they shout. &ldquo;<b>CometWizard77.</b> Now, is there any of the real you in that? No. That is a mask with no holes in it.&rdquo;",
    hear:[
      ["Somebody offers their own age as the number", "&ldquo;Ah, and there is the hole. Your age is a clue. Pick one that means nothing at all.&rdquo; Do it in front of them, it lands better than a rule."],
      ["&ldquo;Mine has my name in it.&rdquo;", "&ldquo;A lot of them do. That is tonight&rsquo;s job, and it takes about a minute to change.&rdquo;"],
      ["It gets silly", "Let it. The sillier the name, the better the mask, and they remember the ones that made the room laugh."],
    ],
    warn:"Build it <b>on the board with their words</b>, not from the examples here. A name the class invented is one they will actually use. Watch for children offering their own real usernames out loud and steer away from that: you do not want thirty children learning each other&rsquo;s logins." },

  { at:"after", kind:"tell", scene:"risks", safe:true, id:"safe", cards:RISKS, eyebrow:"Look what you did",
    title:"He went home<br>with nothing.",
    say:"&ldquo;Remember these from the start of the lesson? Look at them now.&rdquo; Go along the three. &ldquo;He cannot turn up, because nobody gave him an address. He cannot wait at the gates, because nobody told him the school. And he cannot ring you, because nobody typed a phone number. <b>You stopped all three</b>, and you did it by not typing.&rdquo;",
    hear:[
      ["&ldquo;That is it? Just not typing?&rdquo;", "&ldquo;That is it. It is the easiest superpower you will ever learn.&rdquo;"],
      ["Somebody looks pleased with themselves", "Let them. This is the pay-off slide and they earned it."],
    ],
    warn:"Same three cards, same order, same layout as the slide before the break. That is deliberate, so do not describe them again from scratch. Point at them and let the class notice what has changed." },

  { at:"after", kind:"ask", scene:"solo", art:ART.school, eyebrow:"What would you do?",
    title:"Someone asks what<br>school you go to.",
    say:"&ldquo;Last one. You are playing a game, and somebody friendly you have never met asks what school you go to. What do you do?&rdquo;",
    hear:[
      ["&ldquo;Do not answer.&rdquo;", "&ldquo;Right. And you do not have to be rude about it. You can just talk about something else.&rdquo;"],
      ["&ldquo;Block them.&rdquo;", "&ldquo;You can. And tell a grown-up you did, so somebody knows.&rdquo;"],
      ["&ldquo;What if they are actually nice?&rdquo;", "&ldquo;They might well be. But a nice person does not need to know your school to play a game with you, so nothing is lost by not saying.&rdquo;"],
      ["&ldquo;What if I already told someone?&rdquo;", "&ldquo;Then you tell a grown-up today, and you are not in trouble. Telling is never the wrong move.&rdquo;"],
    ],
    warn:"<b>Have an answer ready for the last one, because somebody usually asks it.</b> A child who has already given something away needs to hear, out loud and from you, that telling a grown-up is the right move and that they are not in trouble. Then follow it up quietly afterwards." },

  { at:"after", kind:"tell", scene:"tonight", art:ART.mask, eyebrow:"Tonight",
    title:"Check one<br>username.",
    under:"Tonight, with a grown-up.",
    say:"&ldquo;One job tonight. Pick <b>one</b> username, on a game or an app, and look at it properly. Is your real name in it? Is your age? Is the year you were born? Is your school? If any of those are in there, change it with a grown-up. Hero word, creature, number that means nothing.&rdquo;",
    hear:[
      ["&ldquo;What if I cannot change it?&rdquo;", "&ldquo;Some games will not let you, and that is annoying. Tell a grown-up which one and they can decide what to do.&rdquo;"],
      ["&ldquo;Can I change all of them?&rdquo;", "&ldquo;Do one properly. One that is actually fixed beats five you half did.&rdquo;"],
    ],
    warn:"One username, not all of them. A job a child can finish is a job that gets done, and it gives the grown-up at home something small and specific to help with." },
];

export const WEEK_2: Pack = {
  n: 2,
  title: "Private Info",
  sub: "Guard Your Secrets",
  five: FIVE,
  slides: SLIDES,
  games: "The Raccoon&rsquo;s Wish List, The Treasure Table, The Nosy Form, The Secret Identity Machine, The Hero Pause, Grab-Bag Blaster",
};
