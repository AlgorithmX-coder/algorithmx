/**
 * Cyber Heroes, week 4: the teacher pack.
 *
 * Scams and tricks. A carnival of fakes, and the week where the raccoon stops
 * trying to break in and starts trying to get the child to open the door.
 *
 * TWO THINGS THE SOURCE MADE ME CHANGE, both about not landing on a child.
 *
 * 1. The week opens by saying a child got caught: "someone clicked. There was
 *    no prize. There never is." So the usual "has this happened to you?" slide
 *    is WRONG here, because a hand going up makes that child the someone. It
 *    is reframed as "what would you tell a friend?", which gets the same
 *    thinking with nobody exposed.
 *
 * 2. Like week 3, this week carries no "it was not your fault" line anywhere,
 *    and its whole vocabulary is biting: you bit, don't bite, not a nibble.
 *    That is good teaching and it is blame-adjacent, so the teacher supplies
 *    the reassurance. It is written into the debrief slide.
 *
 * Mirrors app/lesson/weekContent/week4.ts. See ./types.ts for the fields.
 */
import { ART } from "./art";
import type { Card, Concept, Pack, Slide } from "./types";

const FIVE: readonly Concept[] = [
  { art:ART.trap,      name:"String Follower",  line:"Every prize has a string." },
  { art:ART.trophy,    name:"Bait Detector",    line:"Too good means not true." },
  { art:ART.stopwatch, name:"Panic-Proof",      line:"Rushed is the red flag." },
  { art:ART.mask,      name:"Copycat Catcher",  line:"Almost-right is all-wrong." },
  { art:ART.hand,      name:"The No-Bite Rule", line:"Stop. Check. Show." },
];

/* The three tricks, before the break and again after it with a stamp on each.
   Same array both times: identical layout is what makes the mirror land from
   the back of the room. */
const RISKS: readonly Card[] = [
  { art:ART.trophy,    head:"Too good to be true", sub:"a prize you never entered, from a name you do not know" },
  { art:ART.stopwatch, head:"Hurry up, or else",   sub:"a countdown, and a heart going fast" },
  { art:ART.mask,      head:"Almost the right name", sub:"a 1 where the l should be" },
];

const SLIDES: readonly Slide[] = [
  /* ───────── 10 MINUTES: TALKING IT THROUGH BEFORE THEY PLAY ───────── */
  { at:"before", kind:"tell", scene:"solo", art:ART.trap, eyebrow:"Week 4 &middot; Real or Fake?",
    title:"A scam is a trick<br>in a costume.",
    say:"&ldquo;Eyes up. Here is this week in five words: <b>a scam is a trick in a costume.</b> It dresses up as something lovely. A prize. A warning. A message from your game. But underneath the costume it always wants something back: your password, your family&rsquo;s money, or just your tap. And here is the test.&rdquo; Slow down for this. &ldquo;<b>A real message wants nothing back.</b> It just tells you a thing. Scams always want something, and that is how you catch them.&rdquo;",
    warn:"&ldquo;A real message wants nothing back&rdquo; is the most useful sentence in the week, because a seven year old can actually apply it. Say it at the start, say it again at the end, and they will keep it." },

  { at:"before", kind:"ask", scene:"racc", eyebrow:"Ask the class",
    title:"So what does it<br>want back?",
    bubble:"YOU WON 10,000 COINS!",
    say:"&ldquo;Look what he sent to every child in the city.&rdquo; Read the bubble with far too much excitement. &ldquo;Ten thousand coins! Amazing! So, question one: what does he want <b>back</b>?&rdquo;",
    hear:[
      ["&ldquo;Your password.&rdquo;", "&ldquo;Almost always. To give you the prize, he just needs you to log in. Except there is no prize.&rdquo;"],
      ["&ldquo;Nothing, it is free!&rdquo;", "&ldquo;That is what it says. So follow the string. Why would a stranger give ten thousand coins to somebody he has never met?&rdquo;"],
      ["&ldquo;Money.&rdquo;", "&ldquo;Sometimes. A pound to release a parcel. And that pound is really a doorway to a grown-up&rsquo;s card.&rdquo;"],
      ["&ldquo;I got one of those!&rdquo;", "&ldquo;Loads of people do. He sends it to everybody, which is exactly why it is not special.&rdquo;"],
    ],
    warn:"If a child volunteers that they got one, take it lightly and normalise it fast: <em>he sends it to everybody</em>. Do not turn it into a story, and do not ask whether they clicked." },

  { at:"before", kind:"ask", scene:"risks", id:"risks", cards:RISKS, eyebrow:"Talk about it",
    title:"He has three tricks.<br>That is all.",
    say:"&ldquo;The good news is he only has three tricks, and once you know them you see them coming a mile off.&rdquo; Walk the three. &ldquo;Too good to be true. Hurry up or else. And a name that is <b>almost</b> right.&rdquo; Then the important one. &ldquo;Real companies <b>never</b> give you a scary countdown. Ever. So if you feel rushed, that feeling <b>is</b> the warning.&rdquo;",
    hear:[
      ["&ldquo;What if the prize is small?&rdquo;", "&ldquo;Brilliant question. A small prize you actually earned can be completely real. A bookmark for finishing ten library books? Real. A free console from a stranger? Not real.&rdquo;"],
      ["&ldquo;How do you check a name?&rdquo;", "&ldquo;Letter by letter, slowly. That is the whole skill, and you will get very good at it in a minute.&rdquo;"],
    ],
    link:{ to:"safe", text:"You come back to these same three on slide %s, after they have played, and show them spotted." },
    warn:"<b>Do not skip the small-prize answer.</b> Without it the week teaches blanket suspicion, and children stop believing real things. The game is careful about this and so should you be: a prize you earned, from somebody you know, can be real." },

  { at:"before", kind:"ask", scene:"scenarios", eyebrow:"Ask the class",
    cards:[
      { art:ART.gamepad, sub:"&ldquo;Game bag full! Type your password to make space.&rdquo;" },
      { art:ART.trophy,  sub:"&ldquo;You won a family trip to the beach!&rdquo;" },
      { art:ART.warning, sub:"&ldquo;Your account will be deleted in 10 minutes!&rdquo;" },
    ],
    title:"What would you tell<br>a friend who got this?",
    say:"&ldquo;Imagine your friend shows you their tablet and one of these is on it. What do you tell them?&rdquo; Go along the three, taking a couple of answers each.",
    hear:[
      ["&ldquo;Do not do it!&rdquo;", "&ldquo;Right. And <em>why</em>? What is the giveaway on that one?&rdquo; The why is the bit that transfers."],
      ["&ldquo;Show a grown-up.&rdquo;", "&ldquo;Every single time. That is the whole rule and we come back to it at the end.&rdquo;"],
      ["Somebody says they got one", "&ldquo;Loads of people get those.&rdquo; Keep it completely ordinary and move on."],
    ],
    warn:"<b>Deliberately not &ldquo;has this happened to you?&rdquo;</b> The film they are about to watch opens by saying a child clicked one of these, so a hand going up in this room makes that child <em>the</em> one who bit. Asking what they would tell a friend gets you the same thinking with nobody exposed." },

  { at:"before", kind:"do", scene:"five", eyebrow:"Now it is your turn",
    title:"Log on and<br>have a go.",
    under:"We all come back together 10 minutes before the end.",
    say:"&ldquo;Right. Week 4 is a whole carnival of fakes and you have to spot every one. <b>Five things</b> to learn.&rdquo; Read the five off the board. &ldquo;We come back together <b>10 minutes before the end</b>.&rdquo;",
    hear:[
      ["&ldquo;Is there a timer?&rdquo;", "&ldquo;There is one quick question with a five second clock. It can be retried, so nothing is lost.&rdquo;"],
      ["Somebody cannot log in", "Get them going before you sit down. A child stuck on the login learns nothing for forty-five minutes."],
    ],
    handover:true,
    warn:"Two heads-ups. <b>One quick check runs on a five second timer</b>, in a week that is otherwise about not being rushed: say so now, and say it can be retried. And the hurry-up game <b>deliberately makes their heart go faster</b> before it names the feeling. That is the lesson working, but a couple of children will find it uncomfortable, so tell them it is coming." },

  /* ───────── 45 MINUTES ON THE COMPUTERS ───────── */

  /* ───────── 10 MINUTES: TALKING IT THROUGH AFTERWARDS ───────── */
  { at:"after", kind:"ask", scene:"racc", eyebrow:"Talk about it",
    title:"How did you get on?",
    bubble:"Not even a nibble!",
    say:"&ldquo;So, his carnival is shut. Which of his tricks was the sneakiest?&rdquo; Let them argue about it. &ldquo;And did any of them nearly get you?&rdquo;",
    hear:[
      ["&ldquo;The name one!&rdquo;", "&ldquo;That is the hardest, because you have to look at something you normally skip straight past.&rdquo;"],
      ["&ldquo;I clicked one in the game.&rdquo;", "&ldquo;Good. That is exactly what the game is for, and it is a much better place to get it wrong than real life.&rdquo;"],
      ["&ldquo;The countdown made me panic a bit.&rdquo;", "&ldquo;<b>That is the whole lesson.</b> You felt it. Now you know what it feels like, you will spot it next time.&rdquo;"],
    ],
    warn:"If a child says the countdown got to them, treat it as a win out loud. Naming the feeling in front of the class tells everybody else it is normal, which is the point of that game." },

  { at:"after", kind:"ask", scene:"risks", eyebrow:"Ask the class",
    cards:[
      { art:ART.medal,  head:"&ldquo;You won player<br>of the match!&rdquo;", sub:"from your coach" },
      { art:ART.trophy, head:"&ldquo;You won a brand<br>new console!&rdquo;", sub:"from a name you have never heard of" },
      { art:ART.gamepad,head:"&ldquo;You won a family<br>trip to the beach!&rdquo;", sub:"from a name you have never heard of" },
    ],
    title:"One of these wins<br>could be real.",
    say:"&ldquo;Three messages saying you won something, all on the same day. Which one could actually be true?&rdquo; Take votes. &ldquo;Only the first. You really <b>played in that match</b>, and your coach is somebody you know and could go and ask. You cannot win a competition you never entered, from somebody you have never heard of.&rdquo;",
    hear:[
      ["&ldquo;But you might win a console.&rdquo;", "&ldquo;You might. Did you enter anything? No? Then it is not yours. That is the test.&rdquo;"],
      ["&ldquo;So prizes are never real?&rdquo;", "&ldquo;No, and this is the important bit. Real prizes come from real tries, and from people you can go and check with.&rdquo;"],
    ],
    warn:"This is the slide that stops the week teaching blanket suspicion. <b>Real wins come from real tries.</b> A child who leaves believing nothing good is ever real has learned the wrong thing." },

  { at:"after", kind:"do", scene:"recipe", eyebrow:"Do it together",
    title:"Say it with me.",
    recipe:{ slots:["STOP","CHECK","SHOW"],
      test:"A scam only works if you bite. So do not bite." },
    say:"&ldquo;Three words, and they beat every trick ever invented. Say them with me and do the actions.&rdquo; Do it three times, faster each time. &ldquo;<b>STOP.</b> Hands off. No tapping, no replying. <b>CHECK.</b> Read it slowly. Who sent it? What does it want? <b>SHOW.</b> A grown-up, every single time, at home or here at school.&rdquo;",
    hear:[
      ["&ldquo;What if the grown-up is busy?&rdquo;", "&ldquo;Then it waits. Nothing on a screen is ever so urgent that it cannot wait for a grown-up. That is exactly what the countdown is pretending.&rdquo;"],
      ["&ldquo;What if I already tapped it?&rdquo;", "See the warning below, and answer it properly."],
    ],
    warn:"Do it as three taps on the table and get the whole room doing it. It is the take-home action for the week and a chant survives a weekend far better than a rule does. Say <b>&ldquo;at home or here at school&rdquo;</b> out loud, so a child without a reliable adult at home still has a route." },

  { at:"after", kind:"tell", scene:"risks", safe:true, stamp:"spotted", id:"safe", cards:RISKS, eyebrow:"Look what you did",
    title:"All three tricks.<br>Spotted.",
    say:"&ldquo;Remember his three tricks from the start? Look at them now.&rdquo; Go along the three. &ldquo;You measured the bait. You felt the rush and slowed down anyway. And you read the name letter by letter. <b>His carnival is shut.</b>&rdquo; Then, to the whole room, not to anybody in particular:",
    hear:[
      ["Somebody looks pleased", "Let them. They earned it."],
      ["Somebody looks worried", "That is who the sentence below is for. Say it to the room, not to them."],
    ],
    warn:"<b>Say this out loud, whether or not anybody asks, and the game will not say it for you.</b> Something like: <em>if you have ever tapped one of these, you are not in trouble, it happens to grown-ups all the time, and the only thing to do is tell somebody.</em> This week talks about biting all the way through, which is good teaching and lands hard on a child who has bitten. Week 4 has no &ldquo;it was not your fault&rdquo; line anywhere in it. You are it." },

  { at:"after", kind:"ask", scene:"solo", art:ART.magnifier, eyebrow:"What would you do?",
    title:"It says it is from<br>your school.",
    say:"&ldquo;Last one. A message arrives and it says it is from your school. It wants you to tap a link. What do you do?&rdquo;",
    hear:[
      ["&ldquo;Check the name.&rdquo;", "&ldquo;Letter by letter. And what else? Where did it come from?&rdquo; You want the address, not just the name."],
      ["&ldquo;Ask a teacher.&rdquo;", "&ldquo;Perfect. You are <b>in</b> the school. You can just come and ask me, and I can tell you in about four seconds.&rdquo;"],
      ["&ldquo;So my school might send fake things?&rdquo;", "&ldquo;No. Your school is fine. It is that <b>anybody can put your school&rsquo;s name on a message</b>, the same way anybody can wear a costume. The costume is the fake, not the school.&rdquo;"],
    ],
    warn:"<b>The last one needs answering properly.</b> This week teaches that a message can pretend to be your game, your school, even your family, and a young child can hear that as &ldquo;my family might be fake&rdquo;. The repair is the costume: anybody can wear the name. The real grandma, saved in the family phone, is still the real grandma." },

  { at:"after", kind:"tell", scene:"tonight", art:ART.hand, eyebrow:"Tonight",
    title:"Teach it to<br>a grown-up.",
    under:"Three words. Stop. Check. Show.",
    say:"&ldquo;One job tonight, and this time <b>you</b> are the teacher. Find a grown-up and teach them the three words. Stop. Check. Show. Then ask them if they have ever had one of these messages.&rdquo; Pause. &ldquo;I promise you they have. Grown-ups get tricked by these all the time, which is why it is not embarrassing, and why it is worth you telling them what you learned today.&rdquo;",
    hear:[
      ["&ldquo;Grown-ups get tricked?&rdquo;", "&ldquo;Constantly. These tricks are made by people who are very good at making them. That is worth knowing.&rdquo;"],
      ["&ldquo;What if they already knew?&rdquo;", "&ldquo;Then you have got something to talk about. Ask them which one they nearly fell for.&rdquo;"],
    ],
    warn:"Teaching it to somebody else is the best way to keep it, and this particular job does a second thing: it tells a child that adults get caught too. That takes the shame out of it before a child ever needs it taken out, which matters more in this week than in any other so far." },
];

export const WEEK_4: Pack = {
  n: 4,
  title: "Real or Fake?",
  sub: "Scams and Tricks",
  five: FIVE,
  slides: SLIDES,
  games: "Strings Attached, The Believe-o-Meter, The Barker&rsquo;s Booth, The Name Tag Check, The No-Bite Wall, The Hall of Mirrors",
};
