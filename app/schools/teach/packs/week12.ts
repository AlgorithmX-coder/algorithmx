/**
 * Cyber Heroes, week 12: the teacher pack.
 *
 * Digital footprint. A snowfield where every print shows and nothing melts,
 * and the week where the raccoon does not ask anybody anything: he just
 * follows the trail and reads it off the ground.
 *
 * WHAT THE SOURCE MADE ME CHANGE.
 *
 * 1. "Too late" is the danger in this week. It teaches that copies cannot be
 *    gathered back and that snow never melts, which is true and is exactly
 *    what a child who has already posted something will hear as "nothing can
 *    be done". The game's own answer is calm (tidy what you can with a
 *    grown-up, hand over what you cannot reach), so the pack says it to the
 *    room on the mirror slide, and the briefing covers the child for whom it
 *    is not a bike photo.
 *
 * 2. Most social apps are for thirteen and over, and the week is full of
 *    bios, captions and posts. Some of this class will have a profile and
 *    most will not. "Who has an account?" puts a child on the spot about
 *    home rules, so the relatable slide asks about copies instead (one photo,
 *    one friend, how many?), which every child can answer and nobody is
 *    exposed by.
 *
 * 3. The Snowball Problem is the engine week 5 used for the Ember Chase, and
 *    it is DESIGNED TO BE LOST in the same way: the copies always get away
 *    and every child gets full stars. A teacher who does not know will
 *    comfort a class for failing a demonstration.
 *
 * 4. Week 11 came first, so this week is allowed to lean on it: "a grown-up
 *    helps" can point back at the team they named last week.
 *
 * Mirrors app/lesson/weekContent/week12.ts. See ./types.ts for the fields.
 */
import { ART } from "./art";
import type { Card, Concept, Pack, Slide } from "./types";

const FIVE: readonly Concept[] = [
  { art:ART.bulb,      name:"Track Seer",     line:"Every tap leaves a print." },
  { art:ART.share,     name:"Copy Counter",   line:"Delete only empties your pocket." },
  { art:ART.eye,       name:"Future Friend",  line:"Would older me be glad?" },
  { art:ART.medal,     name:"Golden Stamper", line:"Proud and kind, helper named." },
  { art:ART.magnifier, name:"Trail Reader",   line:"Ten calm minutes, with a grown-up." },
];

/* The three prints the raccoon loves to find, straight from the week's
   incident report. Before the break they are the trail he reads; after it,
   the same three tidied. Same array both times, so the mirror lands from the
   back of the room. */
const RISKS: readonly Card[] = [
  { art:ART.school, head:"A school in a bio",  sub:"age, school and class: one room, all day" },
  { art:ART.pin,    head:"A where and a when", sub:"&ldquo;the park, same time every Saturday!&rdquo;" },
  { art:ART.fist,   head:"A grumpy post",      sub:"sent hot, and it never cools down" },
];

const SLIDES: readonly Slide[] = [
  /* ───────── 10 MINUTES: TALKING IT THROUGH BEFORE THEY PLAY ───────── */
  { at:"before", kind:"tell", scene:"solo", art:ART.pin, eyebrow:"Week 12 &middot; Tracks in the Snow",
    title:"Every tap leaves<br>a print.",
    say:"&ldquo;Eyes up. Picture a field of fresh snow. Walk across it and you leave footprints. You know that already.&rdquo; Then the part they do not know. &ldquo;The internet is snow too. A search, a like, a comment: <b>every tap presses a print</b>. You never feel it happen. And out there, the snow never melts.&rdquo; Then set the tone. &ldquo;This is not a scary week. Most prints are completely fine, and some are brilliant. This week is about learning to <b>see</b> them.&rdquo;",
    warn:"The week&rsquo;s own test is <b>glad, not scared</b>, and children this age can tip into panic (&ldquo;so everything I have ever done is out there?&rdquo;). Keep it like a nature walk. If a child asks who can see their searches, the honest answer is: not everybody, but the search is kept, by the company that runs it and often on the device. Do not make it bigger than that." },

  { at:"before", kind:"ask", scene:"racc", eyebrow:"Ask the class",
    title:"How did he<br>find all that?",
    bubble:"I never had to crack a thing!",
    say:"&ldquo;He found out one child&rsquo;s favourite game, their team, where they go on Saturdays, their class and their street. Nobody told him a thing.&rdquo; Read the bubble. &ldquo;So how did he do it?&rdquo;",
    hear:[
      ["&ldquo;He hacked them.&rdquo;", "&ldquo;No hacking at all. He just followed the trail and read it.&rdquo;"],
      ["&ldquo;They told him.&rdquo;", "&ldquo;Not on purpose. Five ordinary taps: a search, a like, a comment, a bio, a photo. <b>Each one tiny.</b>&rdquo;"],
      ["&ldquo;From a photo.&rdquo;", "&ldquo;Yes. A photo of a new bike, outside the house. The front door in the background is a print too.&rdquo;"],
    ],
    warn:"The point of the week&rsquo;s first game is that prints <b>add up</b>. Each one on its own is small and harmless; together they are a map. If the class leaves this slide with &ldquo;it adds up&rdquo;, the game will land." },

  { at:"before", kind:"ask", scene:"risks", id:"risks", cards:RISKS, eyebrow:"Talk about it",
    title:"Three prints he<br>loves to find.",
    say:"&ldquo;There are three prints he loves best.&rdquo; Walk the three. &ldquo;A school in a bio: age, school and class tells him <b>one room</b>, every weekday. A where and a when, like <em>the park, every Saturday</em>. And a grumpy post, typed while you were cross, that stays exactly as cross long after you have calmed down.&rdquo;",
    hear:[
      ["&ldquo;What is a bio?&rdquo;", "&ldquo;The little bit about you at the top of a profile. Game profiles have them too.&rdquo;"],
      ["&ldquo;But my friends need to know my school.&rdquo;", "&ldquo;Your friends already know it. A school in a bio only helps somebody who <b>does not</b> know you.&rdquo;"],
      ["&ldquo;Is the park bad?&rdquo;", "&ldquo;The park is lovely. It is the <em>every Saturday</em> that turns a photo into a plan somebody else could join.&rdquo;"],
    ],
    link:{ to:"safe", text:"You come back to these same three on slide %s, after they have played, and show them tidied." },
    warn:"<b>Do not ask who has a profile.</b> Most social apps are for thirteen and over, so some of this room will have one and most will not, and a show of hands puts a child on the spot about home rules. Teach it as what to know for later, and mention game profiles, which many of them do have." },

  { at:"before", kind:"ask", scene:"solo", art:ART.share, eyebrow:"Ask the class",
    title:"One photo, one friend.<br>How many copies?",
    say:"&ldquo;Quick guess, hands up. You send <b>one</b> photo to <b>one</b> friend. How many copies of it are there now?&rdquo; Take a few guesses before you answer. &ldquo;At least three. Yours stays on your phone. Theirs arrives on theirs. And the app keeps one too. <b>Sending does not move a thing. It copies it.</b>&rdquo;",
    hear:[
      ["&ldquo;One!&rdquo;", "&ldquo;That is what it feels like. But did it leave your phone? No. So it was copied, not moved.&rdquo;"],
      ["&ldquo;I can just delete it.&rdquo;", "&ldquo;Delete empties your own pocket. It cannot reach your friend&rsquo;s phone, or anybody they sent it on to.&rdquo;"],
      ["&ldquo;What if it is a nice photo?&rdquo;", "&ldquo;Then no problem at all! Copies are only a worry when the thing is a worry.&rdquo;"],
    ],
    warn:"Deliberately <b>not</b> &ldquo;has anybody sent something they wish they had not?&rdquo;. Counting copies gets every child thinking about the same idea and exposes nobody. And keep the &ldquo;nice photo&rdquo; answer in: the week is careful that the snowball post is a perfectly lovely bike photo, because the lesson is the arithmetic, not that sharing is bad." },

  { at:"before", kind:"do", scene:"five", eyebrow:"Now it is your turn",
    title:"Log on and<br>have a go.",
    under:"We all come back together 10 minutes before the end.",
    say:"&ldquo;Right. Week 12, and you are a Trail Ranger with a lamp, a mirror and a gold stamp. <b>Five things</b> to learn.&rdquo; Read the five off the board. &ldquo;We come back together <b>10 minutes before the end</b>.&rdquo;",
    hear:[
      ["&ldquo;Is there a timer?&rdquo;", "&ldquo;One quick question has a five second bar. Nothing happens when it runs out.&rdquo;"],
      ["Somebody cannot log in", "Get them going before you sit down. A child stuck on the login learns nothing for forty-five minutes."],
    ],
    handover:true,
    warn:"<b>One game is meant to be lost.</b> In the Snowball Problem they share one post and then try to gather every copy back, and they cannot: the copies get away from every child, every time, and everybody still gets full stars. It is a demonstration, not a test. And <b>check your register for a Priya</b>: the game has a post laughing at what Priya wore to the disco, and a class will turn round and look. If you have one, say at the start that the names belong to the game." },

  /* ───────── 45 MINUTES ON THE COMPUTERS ───────── */

  /* ───────── 10 MINUTES: TALKING IT THROUGH AFTERWARDS ───────── */
  { at:"after", kind:"ask", scene:"racc", eyebrow:"Talk about it",
    title:"How did you get on?",
    bubble:"My map room is completely useless!",
    say:"&ldquo;So his map room is useless now. Be honest with me: <b>did anybody gather back all the snowballs?</b>&rdquo;",
    hear:[
      ["&ldquo;Nobody could!&rdquo;", "&ldquo;<b>Nobody can.</b> Not you, not me, not anybody. That is the whole point of that game. You did not fail it, it was showing you something.&rdquo;"],
      ["&ldquo;But the bike post was nice.&rdquo;", "&ldquo;It was! Even a lovely thing cannot be gathered back up. So the moment you are in charge of is the tap at the top of the hill.&rdquo;"],
      ["&ldquo;The mirror one was hard.&rdquo;", "&ldquo;It is a different question from <em>is it funny?</em>, and that is why it is hard. We are doing it next.&rdquo;"],
    ],
    warn:"<b>Say the &ldquo;nobody can&rdquo; line even if nobody raises it.</b> Some of them will have gone quiet thinking they were too slow. They all got full stars." },

  { at:"after", kind:"ask", scene:"scenarios", eyebrow:"Ask the class",
    cards:[
      { art:ART.palette, sub:"&ldquo;Finished my volcano model. Took all weekend!&rdquo;" },
      { art:ART.fist,    sub:"&ldquo;Worst teacher EVER. So unfair!!&rdquo;" },
      { art:ART.camera,  sub:"&ldquo;Look at my brother asleep on the sofa lol&rdquo;" },
    ],
    title:"Would older you<br>be glad?",
    say:"&ldquo;Older you will walk this snow one day. The one who tries out for a team, or starts a new school. So hold each of these up to the mirror. Not <em>is it funny?</em> but <b>would older me be glad this is still here?</b>&rdquo; Go along the three.",
    hear:[
      ["&ldquo;The teacher one is funny.&rdquo;", "&ldquo;Tonight it is. Would you be glad your new teacher reads it in September? <b>Feelings fade. Prints do not.</b>&rdquo;"],
      ["&ldquo;My brother would laugh.&rdquo;", "&ldquo;Maybe. Did he say yes to being on your trail? He is the one who has to walk past it.&rdquo;"],
      ["&ldquo;So never post anything?&rdquo;", "&ldquo;No! The volcano one is brilliant, and it still reads well in ten years. <b>Glad, not scared.</b>&rdquo;"],
    ],
    warn:"Enjoy the second card: it is aimed at you, which makes the room laugh and makes the point stick. On the third, keep to &ldquo;did he say yes?&rdquo; and no further; asking before you post somebody is week 8, and this week only needs the reminder." },

  { at:"after", kind:"do", scene:"recipe", eyebrow:"Do it together",
    title:"Stamp it gold.",
    recipe:{ slots:["Who else is in it?","Would older me be glad?","Name who helped"],
      test:"Then stamp it, and be proud of it." },
    say:"&ldquo;Now the happy half. Prints lasting is only bad news if the print is a bad one. <b>Rangers do not tiptoe. Rangers stamp.</b> Here is the golden check, in order. Say it with me.&rdquo; Do it twice. &ldquo;<b>Who else is in it?</b> They did not choose to be on your trail. <b>Would older me be glad?</b> <b>Name who helped</b>, like <em>what a save, Jaya!</em> And then stamp it, and be proud.&rdquo;",
    hear:[
      ["&ldquo;What does name who helped mean?&rdquo;", "&ldquo;If your friend made the save, say so. A win with their name in it reads well forever.&rdquo;"],
      ["&ldquo;What if nobody helped?&rdquo;", "&ldquo;Then skip that one and stamp it. It is your own work.&rdquo;"],
    ],
    warn:"Give this slide your energy. A week made only of care teaches children to tiptoe, and the game says the opposite out loud: lasting is a <b>gift</b> when the print is a good one. A child should leave wanting to post the volcano, not afraid to." },

  { at:"after", kind:"tell", scene:"risks", safe:true, stamp:"tidied", id:"safe", cards:RISKS, eyebrow:"Look what you did",
    title:"All three prints.<br>Tidied.",
    say:"&ldquo;Remember the three prints he loves? Look at them now.&rdquo; Go along the three. &ldquo;The school comes out of the bio. The <em>every Saturday</em> comes out of the caption, and you keep the photo. And the grumpy post gets one look in the mirror before it is ever sent. <b>His map room is empty.</b>&rdquo; Then, to the whole room, not to anybody in particular:",
    hear:[
      ["Somebody looks worried", "That is who the sentence below is for. Say it to the room, not to them."],
    ],
    warn:"<b>Say this out loud, whether or not anybody asks.</b> Something like: <em>if you have already posted something like these, you are not in trouble and it is not too late. You tidy what you can with a grown-up, and if it is somewhere you cannot reach, a grown-up helps. That is what the team you named last week is for.</em> A week about prints that never melt lands as &ldquo;too late&rdquo; on a child who has already left one." },

  { at:"after", kind:"ask", scene:"solo", art:ART.magnifier, eyebrow:"What would you do?",
    title:"You find an old post<br>you forgot about.",
    say:"&ldquo;Last one. You and a grown-up do a trail check, and you find a post from last year: you in your school jumper, at the park gate, with the words <em>here every Saturday!</em> What do you do?&rdquo;",
    hear:[
      ["&ldquo;Delete everything!&rdquo;", "&ldquo;A trail check is not a clear-out. Take out the pointy bit. What is pointy here?&rdquo; You want: <b>every Saturday, and the school badge.</b>"],
      ["&ldquo;Pretend I did not see it.&rdquo;", "&ldquo;It is still being read, though. Ten calm minutes now fixes it.&rdquo;"],
      ["&ldquo;What if I cannot delete it?&rdquo;", "&ldquo;If it is on somebody else&rsquo;s page, that is a grown-up&rsquo;s job. You hand it over.&rdquo;"],
      ["&ldquo;Would I get told off?&rdquo;", "&ldquo;Not for finding it. <b>Finding it is the whole point.</b>&rdquo;"],
    ],
    warn:"The school jumper is there on purpose. A badge on a uniform is a school-name print that most children, and plenty of adults, never notice. Point it out. And keep the tone calm: the game&rsquo;s words are <em>ten calm minutes, not a panic</em>." },

  { at:"after", kind:"tell", scene:"tonight", art:ART.magnifier, eyebrow:"Tonight",
    title:"Ten calm minutes<br>with a grown-up.",
    under:"Check one bio. A school? A where? A when?",
    say:"&ldquo;One job tonight. Sit down with a grown-up for ten calm minutes and look at one profile of yours, together. A game profile counts. Look at the bio and ask: is my <b>school</b> in it? A <b>where</b>? A <b>when</b>? Tidy anything pointy, and leave the golden bits shining.&rdquo; Then the fallback. &ldquo;No profile? Then teach your grown-up the mirror question: <em>would older me be glad this is still here?</em>&rdquo;",
    hear:[
      ["&ldquo;I do not have any profiles.&rdquo;", "&ldquo;Then you have the other job. Teach a grown-up the mirror question. They will use it.&rdquo;"],
      ["&ldquo;What if my grown-up finds something?&rdquo;", "&ldquo;Then you tidy it together. That is exactly what the ten minutes are for.&rdquo;"],
    ],
    warn:"Give the fallback out loud, because most of the room will not have a profile. And be ready for a grown-up to find an account they did not know about. That is a conversation for the family, and a good one to have started, which is why the job is done with a grown-up rather than alone." },
];

export const WEEK_12: Pack = {
  n: 12,
  title: "Tracks in the Snow",
  sub: "Digital Footprint",
  five: FIVE,
  slides: SLIDES,
  games: "Track Back, The Snowball Problem, The Future Mirror, Stamp It Gold, The Trail Planner, The Snow Maze",
  brief: {
    head: "Read this before you teach it",
    body: [
      "<b>This week can land as &ldquo;too late&rdquo;.</b> It teaches that copies cannot be gathered back and that prints never melt. That is true, and a child who has already posted or sent something will hear it as &ldquo;nothing can be done&rdquo;. The week&rsquo;s own answer is calm: tidy what you can with a grown-up, and hand over what you cannot reach. Say it out loud on the mirror slide whether or not anybody asks.",
      "<b>Most of the time it will be a bike photo.</b> Occasionally it will not. If a child is worried about a picture of themselves that somebody else has, or somebody is using something they sent to frighten or pressure them, that is a safeguarding concern.",
      "<b>Listen.</b> Do not investigate, do not ask to see it, and never ask a child to describe it in front of the class.",
      "<b>Never promise to keep it secret.</b> Say: &ldquo;I am really glad you told me. I need to tell somebody who can help.&rdquo; Write down what they said in their own words and pass it to whoever is responsible for child protection at your school <b>the same day</b>.",
      "<b>One game is meant to be lost.</b> In the Snowball Problem the copies get away from every child, every time, and everybody still gets full stars. Say so in the debrief.",
      "<b>Check your register for a Priya.</b> The game has a post laughing at what Priya wore to the disco, and a class will turn round and look.",
      "Your own setting&rsquo;s safeguarding policy overrides anything on these slides.",
    ],
  },
};
