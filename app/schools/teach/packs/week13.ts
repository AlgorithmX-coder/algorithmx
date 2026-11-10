/**
 * Cyber Heroes, week 13: the teacher pack.
 *
 * Screen time. The Power Station, and a raccoon who has turned battery thief:
 * not phone batteries, KID batteries, because a tired hero is an easy hero to
 * trick.
 *
 * THE ONE TONE RULE, carried over from the source: NEVER ANTI-SCREEN. The
 * game's see-saw sits level with two screen blocks still aboard, and "no
 * screens at all" is a wrong answer in every check. A teacher who tuts about
 * "too much telly" undoes the week, so the pack says so on the first slide.
 *
 * THREE THINGS THE SOURCE MADE ME CHANGE, all about not landing on a family.
 *
 * 1. The usual "has this happened to you?" slide would be "how much screen
 *    time do you get?", and that is a question about the HOME, not the child.
 *    Some homes have no limits, in some a grown-up is on a phone all evening,
 *    and a seven year old can change neither. It is replaced with "when is it
 *    easiest to decide to stop?", which is the week's real idea and exposes
 *    nobody.
 *
 * 2. The game's plan dials say "Told Dad", "Told Mum". Plenty of children do
 *    not live with either, so the pack keeps "who knows" wide: whoever is
 *    looking after you.
 *
 * 3. Night Fall sends the screens out of a bedroom. A child who shares a room,
 *    or sleeps where the family telly is, has no say over it. The pack tells
 *    the teacher their job is their OWN screen, and nobody else's.
 *
 * Lane note: the buildsheet lists "signs you need a break" as concept 2. The
 * source dropped it on 2026-09-19 because week 10 already owns body signals,
 * and replaced it with "set it before you start". The pack follows the source.
 *
 * Mirrors app/lesson/weekContent/week13.ts. See ./types.ts for the fields.
 */
import { ART } from "./art";
import type { Card, Concept, Pack, Slide } from "./types";

const FIVE: readonly Concept[] = [
  { art:ART.thumbsup,  name:"Level Keeper",  line:"Some, not none." },
  { art:ART.stopwatch, name:"Jug Reader",    line:"An hour here is an hour not there." },
  { art:ART.clipboard, name:"Plan Setter",   line:"Decide it before you press play." },
  { art:ART.pause,     name:"Smooth Lander", line:"Save. Say bye. Plug in." },
  { art:ART.star,      name:"Night Keeper",  line:"Screens sleep on charge." },
];

/* The Battery Thief's three tricks, before the break and again after it with a
   stamp on each. Same array both times: identical layout is what makes the
   mirror land from the back of the room. */
const RISKS: readonly Card[] = [
  { art:ART.swirl,    head:"One more episode",     sub:"a game never feels finished, on purpose" },
  { art:ART.question, head:"See how it goes",      sub:"no plan, so the game decides" },
  { art:ART.phone,    head:"A screen by the pillow", sub:"face down and silent, still one look away" },
];

const SLIDES: readonly Slide[] = [
  /* ───────── 10 MINUTES: TALKING IT THROUGH BEFORE THEY PLAY ───────── */
  { at:"before", kind:"tell", scene:"solo", art:ART.lightning, eyebrow:"Week 13 &middot; Balance Your Power",
    title:"Screens are brilliant.<br>They just get a size.",
    say:"&ldquo;Eyes up. I will start with the good news: <b>nobody is taking your screens away.</b> Games, films, video calls with Gran, looking up how volcanoes work. Brilliant, all of it.&rdquo; Let that land. &ldquo;But your day is a bit like a rucksack. It holds a lot, and it does not hold everything. So this week is not about <b>no</b> screens. It is about <b>some</b>. Some, not none.&rdquo;",
    warn:"The course&rsquo;s one tone rule for this week, and yours too: <b>never anti-screen.</b> No &ldquo;too much telly&rdquo;, no tutting, no comparing who plays most. A child who hears this week as a telling-off hides their screen time from you instead of thinking about it. The child is never the problem in this week, and the game is careful never to make them one." },

  { at:"before", kind:"ask", scene:"racc", eyebrow:"Ask the class",
    title:"Why does he want<br>you tired?",
    bubble:"Just ONE more episode!",
    say:"&ldquo;The Raccoon has a new hobby. He is a battery thief. Not phone batteries.&rdquo; Point round the room. &ldquo;<b>Kid</b> batteries. He wants you up late and glued to the glow. So, question: why would he want you tired?&rdquo;",
    hear:[
      ["&ldquo;So we are grumpy.&rdquo;", "&ldquo;Grumpy is part of it. And somebody tired and grumpy is not thinking very clearly, are they?&rdquo;"],
      ["&ldquo;So he can trick us.&rdquo;", "&ldquo;That is it exactly. <b>A tired hero is an easy hero to trick.</b> Every trick you have learned to spot this year is harder to spot when you are worn out.&rdquo;"],
      ["&ldquo;I stay up really late.&rdquo;", "&ldquo;Lots of people do sometimes. This week is about making stopping easier, not about who is worst.&rdquo; Move on."],
    ],
    warn:"Keep it light in the room. Separately: if a child tells you more than once that they are regularly up very late on a screen, or is visibly exhausted in lessons, pass it on through your school&rsquo;s usual pastoral route. Quietly, afterwards, and never as a judgement on the family." },

  { at:"before", kind:"ask", scene:"risks", id:"risks", cards:RISKS, eyebrow:"Talk about it",
    title:"Three ways he<br>drains your battery.",
    say:"&ldquo;He only has three tricks.&rdquo; Walk the three. &ldquo;One more episode. See how it goes. And a screen by the pillow, face down, on silent, but still right there.&rdquo; Then the first one again, slowly. &ldquo;Here is a secret about games. <b>A game never feels finished.</b> They are built that way, on purpose. There is always one more level waiting.&rdquo;",
    hear:[
      ["&ldquo;Some games do finish.&rdquo;", "&ldquo;And then what comes up on the screen?&rdquo; Play again, or the next one. &ldquo;Watch for it tonight.&rdquo;"],
      ["&ldquo;What is wrong with see how it goes?&rdquo;", "&ldquo;Nobody decides. So the game decides, and the game always says one more.&rdquo;"],
    ],
    link:{ to:"safe", text:"You come back to these same three on slide %s, after they have played, and show them beaten." },
    warn:"The first card is an idea most adults have never heard said plainly, and children find it genuinely interesting: <b>games are designed never to feel finished.</b> It moves the problem off the child and onto the design, which is both true and exactly the tone this week needs." },

  { at:"before", kind:"ask", scene:"scenarios", eyebrow:"Ask the class",
    cards:[
      { art:ART.gamepad,   sub:"Halfway through a level, and you are winning" },
      { art:ART.stopwatch, sub:"When the game feels finished" },
      { art:ART.pause,     sub:"Before you even press play" },
    ],
    title:"When is it easiest<br>to decide to stop?",
    say:"&ldquo;Three moments. In which one is it <b>easiest</b> to decide how long you are going to play?&rdquo; Take a vote on each. The answer is the third: before you press play you are outside the game, thinking clearly. Inside it, every part of you wants one more.",
    hear:[
      ["&ldquo;When it feels finished.&rdquo;", "&ldquo;Has a game ever told you it was finished? Remember what we just said about how they are built.&rdquo;"],
      ["&ldquo;Before you start.&rdquo;", "&ldquo;Yes. Out here you can think. Thirty seconds into the game it is a completely different story.&rdquo;"],
      ["&ldquo;When my mum says.&rdquo;", "&ldquo;That works, and it usually ends in a bit of an argument. This week you get there first.&rdquo;"],
    ],
    warn:"<b>Deliberately not &ldquo;how much screen time do you get?&rdquo;</b> That is a question about the family, not the child. Some homes have no limits at all, in some a grown-up is on a phone all evening, and a seven year old can change neither. Keep every question this week about what the child can decide, and never compare homes." },

  { at:"before", kind:"do", scene:"five", eyebrow:"Now it is your turn",
    title:"Log on and<br>have a go.",
    under:"We all come back together 10 minutes before the end.",
    say:"&ldquo;Right. Week 13 is the Power Station, and the Battery Thief is after your charge. <b>Five things</b> to learn.&rdquo; Read the five off the board. &ldquo;We come back together <b>10 minutes before the end</b>.&rdquo;",
    hear:[
      ["&ldquo;Is it going to tell me to stop playing games?&rdquo;", "&ldquo;No. It is going to tell you to keep them. You will see.&rdquo;"],
      ["Somebody cannot log in", "Get them going before you sit down. A child stuck on the login learns nothing for forty-five minutes."],
    ],
    handover:true,
    warn:"Two heads-ups. <b>Night Fall</b> asks children to send the screens out of a bedroom for the night. Some children share a room, or sleep where the family telly is, and have no say over it: their job is <b>their own screen</b>, and the course never asks them to move anybody else&rsquo;s. And one quick check is a speed round with a bar that runs down. It is for fun, and nobody fails when it empties." },

  /* ───────── 45 MINUTES ON THE COMPUTERS ───────── */

  /* ───────── 10 MINUTES: TALKING IT THROUGH AFTERWARDS ───────── */
  { at:"after", kind:"ask", scene:"racc", eyebrow:"Talk about it",
    title:"How did you get on?",
    bubble:"Still FULL bars?!",
    say:"&ldquo;So, the Battery Thief went home empty. Which game was the best?&rdquo; Let them argue. &ldquo;And which of his three tricks is the hardest one to beat?&rdquo;",
    hear:[
      ["&ldquo;The see-saw kept the cartoons!&rdquo;", "&ldquo;It did. Level, not empty. Nobody took anything away.&rdquo;"],
      ["&ldquo;The save and say bye one.&rdquo;", "&ldquo;That is the one grown-ups like best, I promise you.&rdquo;"],
      ["&ldquo;One more episode gets me.&rdquo;", "&ldquo;It gets everybody, grown-ups included. That is exactly why it is his favourite.&rdquo;"],
    ],
    warn:"If a child owns up to a trick that gets them, thank them and normalise it at once: <em>it gets everybody, grown-ups included</em>. That is the honest answer, and it keeps the week from turning into a confession." },

  { at:"after", kind:"ask", scene:"scenarios", eyebrow:"Ask the class",
    cards:[
      { art:ART.gamepad, sub:"Five hours on the game, and skip football" },
      { art:ART.shuffle, sub:"Two hours now, football, then more after" },
      { art:ART.noentry, sub:"No game at all today, to be safe" },
    ],
    title:"Saturday. New game.<br>Football at eleven.",
    say:"&ldquo;Here is the idea from the game, made real. Your day is a jug, and it never gets bigger. Every hour you pour into one thing is an hour that is <b>not</b> going into another.&rdquo; Point at the cards. &ldquo;The new game has just arrived, and football is at eleven. How do you pour it?&rdquo; Take votes. The middle one keeps both cups in the day.",
    hear:[
      ["&ldquo;Five hours!&rdquo;", "&ldquo;Lovely idea. So where does the football go?&rdquo; That is the jug. Something always gives."],
      ["&ldquo;No game, to be safe.&rdquo;", "&ldquo;You do not have to give it up. That empties a cup you never needed to empty. Some, not none.&rdquo;"],
      ["&ldquo;Two hours, then football.&rdquo;", "&ldquo;<b>Both</b> cups. That is aiming the jug instead of tipping it.&rdquo;"],
    ],
    warn:"Make sure somebody says out loud why &ldquo;no game at all&rdquo; is wrong too. The eager children will pick the empty answer to please you, and the week&rsquo;s whole point is <b>some, not none</b>. If anybody bristles at the jug, use the game&rsquo;s own line: <em>that is just how much a jug holds, not a telling-off.</em>" },

  { at:"after", kind:"do", scene:"recipe", eyebrow:"Do it together",
    title:"Set it before<br>you press play.",
    recipe:{ slots:["HOW LONG","WHAT AFTER","WHO KNOWS"],
      thenLabel:"when the time comes",
      add:["save","say bye","plug in"],
      test:"Set it outside the game, so it holds inside." },
    say:"&ldquo;Let us make a plan together. Saturday morning, swimming at half past eleven.&rdquo; Fill the three slots with whatever the room shouts. &ldquo;<b>How long?</b> A number or a time, not see how it goes. <b>What after?</b> Something with no screen in it. <b>Who knows?</b> A grown-up who is actually there.&rdquo; Then point at the pills. &ldquo;And when the time comes, you land it. Save it. Say bye. Plug it in. Twenty seconds, and it is a landing, not a crash.&rdquo;",
    hear:[
      ["&ldquo;One more level, then stop.&rdquo;", "&ldquo;That is exactly what the game wants you to say. Give me a number or a time.&rdquo;"],
      ["&ldquo;What if I am in a team game?&rdquo;", "&ldquo;Then saying bye matters most. Vanishing mid-game is the bit friends actually mind.&rdquo;"],
      ["&ldquo;What if my grown-up is busy?&rdquo;", "&ldquo;It takes ten seconds. &lsquo;One hour, then I am getting ready for swimming.&rsquo; They do not have to stop anything to hear it.&rdquo;"],
    ],
    warn:"Build a real plan on the board with a real time in it. What makes it hold is <b>saying it to somebody before you start</b>: a plan nobody heard is just a thought. Keep &ldquo;who knows&rdquo; wide. The game&rsquo;s examples say Mum and Dad, and plenty of your class live with a carer, a grandparent or one parent, so say <em>whoever is looking after you</em>." },

  { at:"after", kind:"tell", scene:"risks", safe:true, stamp:"beaten", id:"safe", cards:RISKS, eyebrow:"Look what you did",
    title:"All three tricks.<br>Beaten.",
    say:"&ldquo;Remember his three tricks from the start? Look at them now.&rdquo; Go along the three. &ldquo;One more episode? You pick the ending, early. See how it goes? Not any more, the dials are set first. A screen by the pillow? It sleeps on charge, somewhere else. <b>He did not get a single drop.</b>&rdquo; Then, to the whole room:",
    hear:[
      ["Somebody looks pleased", "Let them. They earned it."],
      ["&ldquo;My tablet sleeps in my bed.&rdquo;", "&ldquo;Lots of people&rsquo;s do. Tonight is a good night to try it somewhere else.&rdquo; Keep it light and move on."],
    ],
    warn:"<b>Say this out loud, to the room and not to anybody in particular:</b> <em>if your screen sleeps next to you at the moment, you are not in trouble and nobody is cross. It is just a thing worth trying.</em> The night is the best evidenced part of the week, and the part most likely to make a child feel caught out." },

  { at:"after", kind:"ask", scene:"solo", art:ART.home, eyebrow:"What would you do?",
    title:"A sleepover, and a<br>console in the room.",
    say:"&ldquo;Last one, and it is new. You are at a sleepover at your friend&rsquo;s house. There is a console right there in the room, and it is nearly nine o&rsquo;clock. What is your plan?&rdquo; Get all three dials out of them.",
    hear:[
      ["&ldquo;Play until we are tired.&rdquo;", "&ldquo;Until we are tired always means later than you think. How long?&rdquo;"],
      ["&ldquo;I would tell my mum.&rdquo;", "&ldquo;Your mum is at home. Who is the grown-up who can actually help tonight? <b>The one in this house.</b>&rdquo;"],
      ["&ldquo;Torch and talking!&rdquo;", "&ldquo;Perfect what-after. No screen in it, and it is the best bit of a sleepover anyway.&rdquo;"],
    ],
    warn:"This tests whether the three dials travel. The one that catches most children is <b>who knows</b>: the grown-up who counts is the one in the house where they are, not the one at home. The game makes the same point, so a child who gets it here has got the week." },

  { at:"after", kind:"tell", scene:"tonight", art:ART.clipboard, eyebrow:"Tonight",
    title:"Make tomorrow&rsquo;s<br>plan together.",
    under:"How long. What after. Who knows.",
    say:"&ldquo;One job tonight. Before you switch anything on tomorrow, sit down with a grown-up and set the three dials <b>together</b>. How long. What after. Who knows. And you both agree it.&rdquo; Pause. &ldquo;A plan you made together is yours. And plans that are yours are the ones that actually work.&rdquo;",
    hear:[
      ["&ldquo;What if they say no screens?&rdquo;", "&ldquo;Then that is your family&rsquo;s plan, and it is a fair one. You can still ask to build it together.&rdquo;"],
      ["&ldquo;What if they are too busy?&rdquo;", "&ldquo;Ten seconds is enough. &lsquo;One hour, then football, I am telling you now.&rsquo; That counts.&rdquo;"],
    ],
    warn:"The game is clear that a plan <b>built together</b> works and a rule handed down does not, so do not frame this as &ldquo;ask your parents to give you a limit&rdquo;. Some children go home to no rules at all and some to very strict ones, and this job works in both without you taking a side." },
];

export const WEEK_13: Pack = {
  n: 13,
  title: "Balance Your Power",
  sub: "Screen Time",
  five: FIVE,
  slides: SLIDES,
  games: "The See-Saw Day, The Day Jug, The Plan Desk, The Shutdown Panel, Night Fall, The Power Station Match",
};
