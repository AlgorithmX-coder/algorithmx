/**
 * Cyber Heroes, week 10: the teacher pack.
 *
 * Videos and channels. A glowing burrow with a ladder up to daylight, and the
 * week where the raccoon does not trick anybody at all: he just greases the
 * belt that rolls the next video in, and lets the machine do the work.
 *
 * WHAT THE SOURCE MADE ME CHANGE.
 *
 * 1. One beat is about videos that are NOT for children: "a scream and a dark
 *    hallway", "clearly made for grown-ups", "icky things about people". The
 *    game handles it well, in words only on a pretend player, and it says
 *    "never your fault" and "leaving is strong" plainly. But a class has
 *    children in it who have already seen something like that, usually by
 *    autoplay, and this may be the first adult who has said it was not their
 *    fault. So the week carries a briefing, the topic is kept OFF the risk
 *    cards (a card invites examples from the floor), and it gets its own
 *    slide after the break where the teacher is ready for it.
 *
 * 2. The lane. Balance and screen time belong to week 13; this week only
 *    teases it (docs/cyberheroes/curriculum-buildsheet.md). The source is
 *    careful to be about NOTICING the pull, not about how much is too much,
 *    and a teacher's instinct will be to say how long children should watch.
 *    Every slide that touches it says not to, and the job tonight is a
 *    noticing job any child can do whatever the rules are at home.
 *
 * 3. The source never names a real video app (it is "Hoppa" throughout), so
 *    neither does the pack.
 *
 * Mirrors app/lesson/weekContent/week10.ts. See ./types.ts for the fields.
 */
import { ART } from "./art";
import type { Card, Concept, Pack, Slide } from "./types";

const FIVE: readonly Concept[] = [
  { art:ART.swirl,    name:"Machine Spotter", line:"Autoplay picks. You choose." },
  { art:ART.question, name:"Claim Weigher",   line:"Who would really know?" },
  { art:ART.door,     name:"Calm Escaper",    line:"Pause. Back. Tell." },
  { art:ART.speech,   name:"Pond Watcher",    line:"Comments are strangers." },
  { art:ART.bell,     name:"Bell Noticer",    line:"Your body says: been a while." },
];

/* Three things waiting down the rabbit hole. The fourth, a video that is not
   for children, is kept off these cards on purpose and gets its own slide
   after the break. Same array both times, so the mirror lands from the back
   of the room. */
const RISKS: readonly Card[] = [
  { art:ART.swirl,     head:"The next-video belt", sub:"it starts by itself, and you never chose it" },
  { art:ART.megaphone, head:"The wild claim",      sub:"millions of views, and nobody checked" },
  { art:ART.speech,    head:"The fishing comment", sub:"&ldquo;What school do you go to? Just curious!&rdquo;" },
];

const SLIDES: readonly Slide[] = [
  /* ───────── 10 MINUTES: TALKING IT THROUGH BEFORE THEY PLAY ───────── */
  { at:"before", kind:"tell", scene:"solo", art:ART.swirl, eyebrow:"Week 10 &middot; Escape the Rabbit Hole",
    title:"Who picked<br>that video?",
    say:"&ldquo;Eyes up. You know when one video ends and the next one just starts? You did not pick it. Nobody in the room picked it.&rdquo; Pause on that. &ldquo;<b>A machine picked it.</b> It is called autoplay, and it has one job: keep you watching. This week is about seeing that machine. Because once you can see it, <b>you</b> get to do the choosing again.&rdquo;",
    warn:"<b>This is not a screen-time lecture</b>, and it is easy to turn it into one. How long children should watch is week 13. This week is only about noticing who is choosing. Keep it curious, like showing them how a magic trick works, rather than telling anybody off." },

  { at:"before", kind:"ask", scene:"racc", eyebrow:"Ask the class",
    title:"So who is<br>choosing now?",
    bubble:"3... 2... PLAYING NEXT!",
    say:"&ldquo;Here is his favourite trick.&rdquo; Read the bubble as a quick countdown. &ldquo;Why do you think he gives you a countdown?&rdquo;",
    hear:[
      ["&ldquo;So you do not have time to think.&rdquo;", "&ldquo;<b>Exactly that.</b> Three seconds is not long enough to decide anything. So the machine decides for you.&rdquo;"],
      ["&ldquo;So you can stop it.&rdquo;", "&ldquo;You can. But how much time does he give you? That is the clever bit.&rdquo;"],
      ["&ldquo;I like it when it keeps going.&rdquo;", "&ldquo;Lots of people do, and that is fine. The trick is just noticing that the machine is choosing, not you.&rdquo;"],
    ],
    warn:"Do not make autoplay the enemy. Plenty of families watch together with it on and enjoy it. The skill this week is noticing the pull and asking one question: <em>do I want this one?</em>" },

  { at:"before", kind:"ask", scene:"risks", id:"risks", cards:RISKS, eyebrow:"Talk about it",
    title:"Three things down<br>the rabbit hole.",
    say:"&ldquo;Down the rabbit hole there are three things waiting.&rdquo; Walk the three. &ldquo;The belt that picks the next video. The wild claim: a video shouting something amazing, with millions of views, that <b>nobody checked</b>. And the comments underneath, where some people are fishing for your name, your school or your photo.&rdquo;",
    hear:[
      ["&ldquo;But it had millions of views!&rdquo;", "&ldquo;Views count taps, not truth. Millions of people watching something does not mean one of them checked it.&rdquo;"],
      ["&ldquo;Who writes the comments?&rdquo;", "&ldquo;Anybody at all. Strangers. Remember week 3? Same rules, new place.&rdquo;"],
    ],
    link:{ to:"safe", text:"You come back to these same three on slide %s, after they have played, and show them spotted." },
    warn:"There is a fourth thing down the hole: a video that is not for children at all. <b>It is not on this board on purpose.</b> It gets its own slide after the break, where you are ready for it. If a child brings it up now, say &ldquo;we are coming to that one&rdquo; and move on, before examples start coming out in front of the class. Read the briefing at the top of this pack first." },

  { at:"before", kind:"ask", scene:"solo", art:ART.bell, eyebrow:"Ask the class",
    title:"How does your<br>body tell you?",
    say:"&ldquo;Hands up if you have ever said <em>just one more</em>.&rdquo; Put your own hand up first. &ldquo;Me too. Now here is something clever. When you have been watching for a while, your <b>body</b> tells you before you notice. How?&rdquo;",
    hear:[
      ["&ldquo;My eyes go dry.&rdquo;", "&ldquo;That is one. The game calls it your body&rsquo;s bell, ringing to say: been here a while.&rdquo;"],
      ["&ldquo;My leg goes jiggly.&rdquo;", "&ldquo;Yes! A stiff neck too. Your body wants to move.&rdquo;"],
      ["&ldquo;It got dark outside and I did not notice.&rdquo;", "&ldquo;Brilliant, that is the sneakiest bell of all.&rdquo;"],
      ["&ldquo;My mum tells me to stop.&rdquo;", "&ldquo;That works too. And your body usually tells you even before she does.&rdquo;"],
    ],
    warn:"Your hand going up first is what makes this safe to answer: <em>just one more</em> is everybody, adults included. <b>Do not count hours or ask who watches the most.</b> Home rules differ and balance is week 13. And never ask &ldquo;has anybody seen something they should not have?&rdquo;: see the briefing." },

  { at:"before", kind:"do", scene:"five", eyebrow:"Now it is your turn",
    title:"Log on and<br>have a go.",
    under:"We all come back together 10 minutes before the end.",
    say:"&ldquo;Right. Week 10, and you have slid right down the burrow. Your job is to climb out. <b>Five things</b> to learn.&rdquo; Read the five off the board. &ldquo;We come back together <b>10 minutes before the end</b>.&rdquo;",
    hear:[
      ["&ldquo;Is there a timer?&rdquo;", "&ldquo;One quick question has a five second bar. Nothing happens when it runs out.&rdquo;"],
      ["Somebody cannot log in", "Get them going before you sit down. A child stuck on the login learns nothing for forty-five minutes."],
    ],
    handover:true,
    warn:"<b>Walk the room during the Back-Out Panel</b>, the third game. It describes three videos that are not for children, in words only on a pretend player, and nothing is shown. But it will bring a real memory up for some children, and a child who wants to tell you will do it quietly while everyone else is busy. Two smaller things: <b>Pause Power</b> needs the button <em>held</em> down, not tapped, so tell them; and the five second bar on one question is for show only." },

  /* ───────── 45 MINUTES ON THE COMPUTERS ───────── */

  /* ───────── 10 MINUTES: TALKING IT THROUGH AFTERWARDS ───────── */
  { at:"after", kind:"ask", scene:"racc", eyebrow:"Talk about it",
    title:"How did you get on?",
    bubble:"I&rsquo;m switching it all off and going to bed!",
    say:"&ldquo;So he unplugged his own machine. Which rung of the ladder was hardest?&rdquo; Let a few tell you.",
    hear:[
      ["&ldquo;<em>Just one more, then I stop.</em>&rdquo;", "&ldquo;That is the belt&rsquo;s favourite sentence, because it never means one.&rdquo;"],
      ["&ldquo;Holding the pause.&rdquo;", "&ldquo;Holding is on purpose. Stopping takes a moment, and that is the whole point.&rdquo;"],
      ["&ldquo;The fizzy pop one.&rdquo;", "&ldquo;Who would really know if fizzy pop makes you tall? A doctor. Not the advert.&rdquo;"],
    ],
    warn:"Keep this one light and quick. The slide that needs your time is two along." },

  { at:"after", kind:"ask", scene:"scenarios", eyebrow:"Ask the class",
    cards:[
      { art:ART.dog,       sub:"&ldquo;Chocolate is a great treat for dogs!&rdquo;" },
      { art:ART.school,    sub:"&ldquo;No more homework ever, starting Monday!&rdquo;" },
      { art:ART.lightning, sub:"&ldquo;Lightning never strikes the same place twice!&rdquo;" },
    ],
    title:"Who would<br>really know?",
    say:"&ldquo;Three videos, three wild claims. For each one, I do not want <em>is it true?</em> I want: <b>who would really know?</b>&rdquo; Go along the three.",
    hear:[
      ["&ldquo;A vet!&rdquo;", "&ldquo;Yes. A vet spends all day learning what animals need.&rdquo;"],
      ["&ldquo;My mum.&rdquo;", "&ldquo;Great person to ask. And if she was not sure, who would she ask?&rdquo;"],
      ["&ldquo;The homework one is true!&rdquo;", "&ldquo;Who decides homework? I do. So who would really know?&rdquo; Enjoy it."],
      ["&ldquo;Lots of people liked it.&rdquo;", "&ldquo;Likes count taps, not truth.&rdquo;"],
    ],
    warn:"The question matters more than the answers, so do not get stuck on the science. But <b>do say plainly that chocolate is dangerous for dogs</b>, because a child might try it. For lightning, a science book is the answer, and the claim is false: tall buildings get struck again and again." },

  { at:"after", kind:"do", scene:"recipe", eyebrow:"Say it with me",
    title:"Not for you?<br>Three calm taps.",
    recipe:{ slots:["PAUSE","BACK","TELL"],
      test:"Landing on it is never your fault. Leaving is strong." },
    say:"&ldquo;Sometimes the belt rolls in a video that is <b>not for children</b>. Too scary, too grown-up, or just horrible. If that happens, listen to me.&rdquo; Say the next part slowly, to the whole room. &ldquo;<b>That is never your fault.</b> The machine rolled it in. And leaving is strong, not scared.&rdquo; Then the three, with actions, twice. &ldquo;<b>PAUSE</b>, so it stops. <b>BACK</b>, so you are out of it. <b>TELL</b> a grown-up, at home or here at school.&rdquo;",
    hear:[
      ["&ldquo;Would I get told off?&rdquo;", "&ldquo;Not by me. <b>You will never be in trouble with me for telling me.</b>&rdquo;"],
      ["&ldquo;Why not just skip it?&rdquo;", "&ldquo;Pause stops it. Back gets you out. And telling means a grown-up can stop it coming back.&rdquo;"],
      ["A child starts describing what they saw", "&ldquo;Thank you for telling me. Come and tell me properly in a minute.&rdquo; Move the class on, and make sure you do."],
    ],
    warn:"<b>The biggest reason children do not tell is fear of losing the tablet.</b> You cannot promise what happens at home, so do not. Promise what you can: that they are not in trouble with you. Next week, week 11, teaches the full four step version; this week&rsquo;s three taps are the video-sized one, and you do not need to teach ahead." },

  { at:"after", kind:"tell", scene:"risks", safe:true, stamp:"spotted", id:"safe", cards:RISKS, eyebrow:"Look what you did",
    title:"All three.<br>Spotted.",
    say:"&ldquo;Remember these three from before? Look at them now.&rdquo; Go along the three. &ldquo;You saw the belt, and you chose. You weighed the wild claim against somebody who would really know. And you named what the comment wanted and gave it <b>nothing</b>. Out of the burrow and into the daylight.&rdquo;",
    hear:[
      ["Somebody looks pleased", "Let them. They climbed out."],
    ],
    warn:"Same three cards, same order as before the break. Point at them rather than describing them again, and let the class notice what has changed." },

  { at:"after", kind:"ask", scene:"solo", art:ART.speech, eyebrow:"What would you do?",
    title:"&ldquo;Reply and I&rsquo;ll<br>shout you out!&rdquo;",
    say:"&ldquo;Last one. Under a video on your favourite channel, a comment says: <em>reply with your age and I will shout you out in my next video!</em> What do you do?&rdquo;",
    hear:[
      ["&ldquo;That would be so cool!&rdquo;", "&ldquo;It would feel cool. So what does it want from you? Your age, and a reply.&rdquo;"],
      ["&ldquo;What if it is really the person from the channel?&rdquo;", "&ldquo;Anybody can type that name. Remember week 4: almost-right names. And even if it is them, a stranger still does not need your age.&rdquo;"],
      ["&ldquo;Can I reply without my age?&rdquo;", "&ldquo;You never have to reply. <b>Not once.</b> Not replying is always allowed.&rdquo;"],
    ],
    warn:"A shout-out feels like being famous to a seven year old, which is exactly why it works as bait. The rule from the game is simple and worth saying twice: <b>a comment that wants something about you gets nothing.</b>" },

  { at:"after", kind:"tell", scene:"tonight", art:ART.swirl, eyebrow:"Tonight",
    title:"Catch the<br>belt once.",
    under:"When the next one starts by itself, say: the belt picked that.",
    say:"&ldquo;One job tonight. Next time you are watching and a video ends and the next one starts all by itself, say it out loud: <b>the belt picked that.</b> Then ask yourself: do I want this one? If yes, watch it. If no, <b>you</b> choose what happens next.&rdquo;",
    hear:[
      ["&ldquo;Do I have to stop watching?&rdquo;", "&ldquo;No. This is not about stopping. It is about noticing who chose.&rdquo;"],
      ["&ldquo;We do not have autoplay.&rdquo;", "&ldquo;Then teach your grown-up the word. Lots of grown-ups have never noticed it is a machine.&rdquo;"],
    ],
    warn:"<b>Deliberately not a rule about how much to watch.</b> That is each family&rsquo;s business, and it is week 13. This is a noticing job, which every child can do whatever the rules are at home. Saying it <em>out loud</em> is half the point: a grown-up in the room overhears it, and the conversation starts by itself." },
];

export const WEEK_10: Pack = {
  n: 10,
  title: "Escape the Rabbit Hole",
  sub: "Videos and Channels",
  five: FIVE,
  slides: SLIDES,
  games: "The Great Climb-Out, Who Would Know?, The Back-Out Panel, The Comment Pond, Pause Power, The Ladder Out",
  brief: {
    head: "Read this before you teach it",
    body: [
      "<b>One game this week is about videos that are not for children</b>, and it may bring a real one to mind. The Back-Out Panel describes three in words only (a scream and a dark hallway, something made for grown-ups, a video saying horrible things about people), and nothing is shown. But some children in your room will already have seen something like that, often by autoplay, and you may be the first adult to tell them it was not their fault.",
      "<b>Never ask the class what they have seen</b>, not as a show of hands and not as an example. A description in front of the room hands it to every child who had not seen it.",
      "<b>If a child tells you, listen.</b> Do not investigate, and do not ask them to describe it. Say: &ldquo;Thank you for telling me. It was not your fault.&rdquo;",
      "<b>The biggest reason children do not tell is fear of losing the tablet.</b> Promise only what you can: that they are not in trouble with you.",
      "<b>Never promise to keep it secret.</b> If a child says somebody sent it to them, showed it to them, or asked them to watch it, that is a safeguarding concern, not a screen-time one. Write down what they said in their own words and pass it to whoever is responsible for child protection at your school <b>the same day</b>.",
      "Your own setting&rsquo;s safeguarding policy overrides anything on these slides.",
    ],
  },
};
