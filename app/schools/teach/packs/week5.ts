/**
 * Cyber Heroes, week 5: the teacher pack.
 *
 * Cyberbullying. The warm campfire week, and the gentlest one in the course:
 * nothing is timed against the child, nothing can be failed, and no beat ever
 * suggests they brought it on themselves. The game's own header says so.
 *
 * THE OTHER END OF THE SAME LANE. The course gives every concept one owning
 * week (docs/cyberheroes/curriculum-buildsheet.md). Week 5 owns the EMOTIONAL
 * frame, and it says "it is never your fault" eighteen times: that is the
 * centre of the week. Week 11 owns the PROTOCOL, so reporting, blocking and
 * keeping evidence are deliberately not here.
 *
 * Which is fine as curriculum and awkward on the day: a child who discloses
 * in this lesson gets their feelings met properly and no next step, and will
 * ask how to report it six weeks before the course answers. The briefing
 * tells the teacher to have their own school's answer ready rather than
 * teaching week 11 early.
 *
 * AND ONE PRACTICAL THING A TEACHER MUST KNOW BEFORE THEY WATCH. The Ember
 * Chase is DESIGNED to be lost. Every child gets full stars and the embers
 * still get away, because that is the lesson about forwarding. A teacher who
 * does not know will comfort a child for failing a demonstration.
 *
 * Mirrors app/lesson/weekContent/week5.ts. See ./types.ts for the fields.
 */
import { ART } from "./art";
import type { Card, Concept, Pack, Slide } from "./types";

const FIVE: readonly Concept[] = [
  { art:ART.speech, name:"The Laugh Test",   line:"Both laughing, or one hurting?" },
  { art:ART.shield, name:"Never Your Fault", line:"Their choice. Never yours." },
  { art:ART.hand,   name:"Fire Starver",     line:"Do not feed it." },
  { art:ART.share,  name:"Stop the Chain",   line:"Forwarding is joining in." },
  { art:ART.team,   name:"Never Alone",      line:"Do not reply. Keep it. Tell." },
];

/* The three ways to join a pile-on without typing a single mean word. Before
   the break they are the trap; after it, the same three stopped. Same array
   both times, so the mirror lands from the back of the room. */
const RISKS: readonly Card[] = [
  { art:ART.share,    head:"Forwarding it on",  sub:"one more copy, and you can never catch it back" },
  { art:ART.laughing, head:"Laughing along",    sub:"the person who wrote it is watching who laughs" },
  { art:ART.speech,   head:"One laughing emoji", sub:"it says: more, please" },
];

const SLIDES: readonly Slide[] = [
  /* ───────── 10 MINUTES: TALKING IT THROUGH BEFORE THEY PLAY ───────── */
  { at:"before", kind:"tell", scene:"solo", art:ART.speech, eyebrow:"Week 5 &middot; Words Have Power",
    title:"Is everyone laughing,<br>or is someone hurting?",
    say:"&ldquo;Eyes up, and this week is a bit different. It is about words.&rdquo; Let the room settle properly before you go on. &ldquo;Friends joke around all the time, and when <b>both</b> of you are laughing, that is just fun. Bullying is different. It is mean on purpose, it happens again and again, and only one side is laughing. So there is one question you can ask about anything: <b>is everyone laughing, or is someone hurting?</b>&rdquo;",
    warn:"Say the question slowly and say it often. It is the one sentence from this week that works in the playground the same afternoon, and it is the one you want them to leave with." },

  { at:"before", kind:"ask", scene:"scenarios", eyebrow:"Ask the class",
    cards:[
      { art:ART.gamepad,  sub:"&ldquo;Haha, you fell in the lava again!&rdquo; and you are both laughing" },
      { art:ART.laughing, sub:"&ldquo;Everyone laugh at Sam&rsquo;s drawing!&rdquo; in the class chat" },
      { art:ART.team,     sub:"&ldquo;Do not let Maya join. Nobody likes her.&rdquo;" },
    ],
    title:"Joke, or not?",
    say:"&ldquo;Three things that happened in a chat. Use the question on each one.&rdquo; Go along them. &ldquo;Everyone laughing, or someone hurting?&rdquo; Take the votes. On the third: &ldquo;Nobody typed a single rude word there. Is it still bullying?&rdquo;",
    hear:[
      ["&ldquo;The last one is not bullying, they were not rude.&rdquo;", "&ldquo;<b>Bullying does not need rude words.</b> Shutting Maya out on purpose is enough. Somebody is hurting.&rdquo;"],
      ["&ldquo;The first one is mean too.&rdquo;", "&ldquo;Could be. So ask the question. Are they both laughing? If the person it is about is laughing, it is a joke. If they are not, it stopped being one.&rdquo;"],
      ["&ldquo;What if you did not mean it?&rdquo;", "&ldquo;Then you say sorry and you stop. Not meaning it explains it. It does not undo it.&rdquo;"],
    ],
    warn:"<b>Check your register for a Sam or a Maya before you teach this.</b> The game uses both names and a class will turn round and look. If you have one, say at the start that these are the names in the game and nothing to do with anybody here. The exclusion card will also land on both sides of any live friendship fallout, so expect &ldquo;but we were only&hellip;&rdquo; and have the line ready." },

  { at:"before", kind:"tell", scene:"racc", eyebrow:"His sneakiest trick",
    title:"This is the lie<br>he wants you to believe.",
    bubble:"Maybe it was YOUR fault.",
    say:"&ldquo;He has one trick this week and it is the nastiest thing he does. After somebody is mean to you, he whispers this.&rdquo; Read the bubble quietly. &ldquo;And the horrible bit is that people believe it all by themselves. So listen to me.&rdquo; Stop. Say the next part flat, to the whole room, with no joking. &ldquo;<b>If somebody is mean to you online, it is not your fault.</b> Not because of what you posted. Not because of your drawing, or your game, or your face, or your name. Mean words say everything about the person typing them and <b>nothing</b> about you. You never deserve it. Full stop.&rdquo;",
    hear:[
      ["Nobody says anything", "That is normal and it is fine. Let the quiet sit for a second, then move on. Some of them are thinking about something."],
      ["&ldquo;But what if you started it?&rdquo;", "&ldquo;Then two things are true. You sort out your bit. And being mean back is still the other person&rsquo;s choice, not yours.&rdquo;"],
    ],
    warn:"<b>Say this one flat and mean it.</b> No jokes, no hedging, no &ldquo;well, sometimes&rdquo;. It is the most important sentence in the whole twenty weeks and it is worth the silence afterwards. A child who is currently being picked on is in the room, and this is the moment they find out whether you actually believe it." },

  { at:"before", kind:"ask", scene:"risks", id:"risks", cards:RISKS, eyebrow:"Talk about it",
    title:"Three ways to join in<br>without typing a word.",
    say:"&ldquo;Here is the thing most people have never thought about. You do not have to <b>write</b> a mean message to spread one.&rdquo; Walk the three. &ldquo;Forward it. Laugh along. Or add one little laughing face. All three tell the person who wrote it the same thing: <b>more, please</b>.&rdquo;",
    hear:[
      ["&ldquo;But I only laughed.&rdquo;", "&ldquo;And that is the point of this slide. Laughing is a vote. It does not feel like joining in, and it is.&rdquo; Keep it matter of fact, not accusing."],
      ["&ldquo;What should you do instead?&rdquo;", "&ldquo;Brilliant question, and it is the last thing we do today. One kind message can turn a whole chat round.&rdquo;"],
    ],
    link:{ to:"safe", text:"You come back to these same three on slide %s, after they have played, and show them stopped." },
    warn:"<b>Somebody in the room added a laughing emoji this week.</b> They have just worked that out. Do not hunt for them and do not let the class hunt either: go straight to what to do instead, which is on the last two slides. The aim is repair, not guilt." },

  { at:"before", kind:"do", scene:"five", eyebrow:"Now it is your turn",
    title:"Log on and<br>have a go.",
    under:"We all come back together 10 minutes before the end.",
    say:"&ldquo;Right. Week 5, and <b>five things</b> to learn.&rdquo; Read the five off the board. &ldquo;Nothing in this one is timed and nothing can be failed. It is a gentler week than usual, on purpose.&rdquo;",
    hear:[
      ["&ldquo;Is there a boss?&rdquo;", "&ldquo;There is, and kindness jams his machine. You will enjoy it.&rdquo;"],
      ["Somebody cannot log in", "Get them going before you sit down. A child stuck on the login learns nothing for forty-five minutes."],
    ],
    handover:true,
    warn:"<b>One game is meant to be lost and you need to know which.</b> In the Ember Chase they tap &ldquo;pass it on&rdquo; once and then try to catch every copy, and they cannot: the embers get away every time, for every child, and everybody still gets full stars. That is the lesson about forwarding, not a failure. If you do not know that, you will spend the debrief comforting children who did exactly what they were supposed to." },

  /* ───────── 45 MINUTES ON THE COMPUTERS ───────── */

  /* ───────── 10 MINUTES: TALKING IT THROUGH AFTERWARDS ───────── */
  { at:"after", kind:"ask", scene:"racc", eyebrow:"Talk about it",
    title:"How did you get on?",
    bubble:"All that kindness gummed up my speakers!",
    say:"&ldquo;So, what happened to his machine?&rdquo; Enjoy the answer. &ldquo;And be honest with me: <b>did anybody catch all the embers?</b>&rdquo;",
    hear:[
      ["&ldquo;Nobody could catch them!&rdquo;", "&ldquo;<b>Nobody can.</b> Not you, not me, not anybody. That is the whole point of that game. Once a message is forwarded, it is gone. You did not fail it, it was showing you something.&rdquo;"],
      ["&ldquo;I felt bad about that one.&rdquo;", "&ldquo;You were meant to feel that. And you still got full stars, because the game was making a point, not testing you.&rdquo;"],
      ["&ldquo;The campfire one was nice.&rdquo;", "&ldquo;Good. There are four true things on those stones and not one of them is your fault.&rdquo;"],
    ],
    warn:"<b>Say the &ldquo;nobody can catch them&rdquo; line out loud even if nobody raises it.</b> Some children will have gone quiet thinking they were bad at it. It was a demonstration and they all got full marks." },

  { at:"after", kind:"tell", scene:"solo", art:ART.hand, eyebrow:"The clever move",
    title:"Mean messages are a fire.<br>Angry replies are wood.",
    say:"&ldquo;When somebody is mean, every single bit of you wants to fire back something <b>meaner</b>. That is completely normal and it is also exactly what he wants.&rdquo; Then the picture. &ldquo;A mean message is a fire. An angry reply is wood. Fight back and it grows, and now there are two mean messages and you feel worse. Do not reply, and it cannot grow. And <b>telling a grown-up is what puts it out.</b>&rdquo;",
    hear:[
      ["&ldquo;But they started it.&rdquo;", "&ldquo;They did. And firing back does not make them stop, it makes the fire bigger. Not replying is not losing. It is starving it.&rdquo;"],
      ["&ldquo;So you just let them?&rdquo;", "&ldquo;No. You do not reply, and then you tell somebody, and then it actually stops. That is doing something. It is just not doing the thing that feels good for four seconds.&rdquo;"],
    ],
    warn:"The &ldquo;so you just let them&rdquo; objection is the one that decides whether this lands, because not replying can feel like surrender to a nine year old. Make the distinction out loud: not replying is not doing nothing, it is step one of three." },

  { at:"after", kind:"do", scene:"recipe", eyebrow:"Say it with me",
    title:"Three steps,<br>in this order.",
    recipe:{ slots:["Do not reply","Keep it","Tell someone"],
      test:"Telling is not snitching. It is how it stops." },
    say:"&ldquo;Three steps, and the order matters. Say them with me.&rdquo; Do it twice. &ldquo;<b>Do not reply</b>, so the fire cannot grow. <b>Keep it</b>, do not delete it, because a grown-up needs to see it to help. And <b>tell somebody you trust</b>. At home, or here, or both.&rdquo; Then the one that unlocks it. &ldquo;And listen: <b>snitching gets somebody into trouble. Telling gets somebody out of it.</b>&rdquo;",
    hear:[
      ["&ldquo;Why keep it? I want it gone.&rdquo;", "&ldquo;Completely understand. But deleting it feels better for about a minute and then the proof is gone too, and a grown-up cannot help with something they cannot see.&rdquo;"],
      ["&ldquo;Is telling a teacher snitching?&rdquo;", "&ldquo;No, and say that line back to me. Snitching gets somebody <em>into</em> trouble. Telling gets somebody <em>out</em> of it.&rdquo;"],
      ["&ldquo;How do I report it though?&rdquo;", "See the warning below. This week does not answer that one and you will have to."],
    ],
    warn:"<b>&ldquo;Telling is not snitching&rdquo; removes the single biggest barrier to a child telling you anything.</b> Say it, then make them say it back. And be ready for &ldquo;how do you actually report it?&rdquo;, because this week genuinely has no answer: blocking, reporting and screenshots are week 11, six weeks away. Give them <b>your school&rsquo;s</b> answer instead, in one sentence, and move on." },

  { at:"after", kind:"tell", scene:"risks", safe:true, id:"safe", cards:RISKS, eyebrow:"Look what you did",
    title:"You broke<br>the chain.",
    say:"&ldquo;Remember these three from before? Every one of them spreads it, and every one of them stopped with you.&rdquo; Go along them. &ldquo;You did not forward it. You did not laugh along. You did not add the little face. <b>A pile-on starves when nobody joins in</b>, and that is what you did.&rdquo;",
    hear:[
      ["&ldquo;What if everyone else does it?&rdquo;", "&ldquo;Then you are the one who did not, and the person it is about will remember that for years. I promise you they will.&rdquo;"],
    ],
    warn:"Same three cards, same order as before the break. Point at them rather than describing them again, and let the class notice what has changed." },

  { at:"after", kind:"ask", scene:"solo", art:ART.star, eyebrow:"What would you do?",
    title:"Your friend is<br>getting piled on.",
    say:"&ldquo;Last one, and this is the one that actually changes things. It is not happening to you. It is happening to your friend, and everybody is joining in. What do you do?&rdquo;",
    hear:[
      ["&ldquo;Tell them to stop.&rdquo;", "&ldquo;You can. And if that feels too big, there is something smaller that works just as well.&rdquo;"],
      ["&ldquo;Message my friend.&rdquo;", "&ldquo;<b>That.</b> Just &lsquo;you all right?&rsquo; on its own. One kind message can turn a whole chat round, and even if it does not, your friend knows somebody saw them.&rdquo;"],
      ["&ldquo;Tell a teacher.&rdquo;", "&ldquo;Yes. And you can do both. Check on your friend, and tell somebody.&rdquo;"],
      ["&ldquo;I would be scared to.&rdquo;", "&ldquo;That is honest and it is normal. Which is why the quiet one counts: a private message to your friend takes no bravery at all and it still works.&rdquo;"],
    ],
    warn:"<b>Give them the small version as well as the brave version.</b> Most children in any class are watchers, not typers, and &ldquo;stand up to everybody&rdquo; is too big an ask for most of them. A private &ldquo;you all right?&rdquo; is something almost any child can actually do, and it is the move that changes the most." },

  { at:"after", kind:"tell", scene:"tonight", art:ART.star, eyebrow:"Tonight",
    title:"Send one<br>kind message.",
    under:"To anybody. It does not have to be about any of this.",
    say:"&ldquo;One job, and it is the easiest one you have ever had. Send <b>one kind message</b> to somebody. Anybody. It does not have to be about bullying, it does not have to be a big thing. &lsquo;That was a good goal.&rsquo; &lsquo;I liked your picture.&rsquo; &lsquo;You all right?&rsquo; That is it.&rdquo; Then land it. &ldquo;Because that is the actual superpower from this week. He has a machine for being mean and it only knows one move. You can be kind in a hundred different ways, and it jams him every time.&rdquo;",
    hear:[
      ["&ldquo;What if they do not reply?&rdquo;", "&ldquo;Does not matter. You are not doing it for the reply.&rdquo;"],
      ["&ldquo;Can it be to you?&rdquo;", "&ldquo;It absolutely can.&rdquo; Some of them will, and it will tell you something about who needs it."],
    ],
    warn:"Ending on something to <b>do</b> rather than something to avoid is the whole point of this slide. Every other week ends with a check or a change; this one ends with a kindness, because that is what the week is for." },
];

export const WEEK_5: Pack = {
  n: 5,
  title: "Words Have Power",
  sub: "Cyberbullying",
  five: FIVE,
  slides: SLIDES,
  games: "The Laughing Scales, The Campfire Ring, Don&rsquo;t Feed the Fire, The Ember Chase, The Stepping Stones, The Kind Moves Board",
  brief: {
    head: "Read this before you teach it",
    body: [
      "<b>This week is written to be recognised, and that is both the point and the risk.</b> A child who is currently being picked on will hear their own week in it, and may tell you. That is the lesson working, not the lesson going wrong.",
      "<b>Listen.</b> Do not investigate, and never ask a child to describe what happened in front of the class.",
      "<b>Never promise to keep it secret.</b> Say: &ldquo;I am really glad you told me. I need to tell somebody who can help.&rdquo;",
      "<b>This week covers the feelings and gives no route.</b> It says &ldquo;it is never your fault&rdquo; better than any other week in the course, but blocking, reporting and keeping evidence are deliberately held for week 11, six weeks away. A child who asks &ldquo;so how do I report it?&rdquo; will not get an answer from the game. Have your school&rsquo;s answer ready in one sentence.",
      "<b>One game is meant to be lost.</b> In the Ember Chase the copies get away from every child, every time, and everybody still gets full stars. It is a demonstration of what forwarding does, not a test. Say so in the debrief, because some of them will think they were bad at it.",
      "<b>Check your register for a Sam or a Maya.</b> Both names are used for children who get picked on, and a class will turn round and look.",
      "<b>Somebody in the room has laughed along at something this week</b> and is about to realise it counts as joining in. Aim for repair, not guilt: the week gives you the exit, which is that one kind message can turn a whole chat around.",
      "<b>Write down what they said in their own words</b> as soon as you can, and pass it to whoever is responsible for child protection at your school <b>the same day</b>.",
      "Your own setting&rsquo;s safeguarding policy overrides anything on these slides.",
    ],
  },
};
