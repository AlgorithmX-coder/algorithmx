/**
 * Cyber Heroes, week 14: the teacher pack.
 *
 * Smart devices. The Listening House, and a raccoon with a lazy new trick: he
 * does not break in at all, he listens through the gadgets already sitting in
 * people's homes.
 *
 * THE TONE RULE, from the source and non-negotiable: CURIOUS, NEVER CREEPY.
 * The gadgets are helpers to know about, waiting for their name "like a dog by
 * the door". A six year old who leaves this lesson uneasy in their own bedroom
 * has learned the wrong thing, so the pack puts the reassurance (the kettle,
 * the lamp, the teddy hear nothing) on the very first slide, and answers "is
 * he in my house?" out loud on the second.
 *
 * THREE THINGS THE SOURCE MADE ME CHANGE.
 *
 * 1. The week carries one hard safeguarding line: a camera pointing at a bed
 *    is told to a grown-up, every time. The game's last corner is a bedroom
 *    with a camera on the shelf. That is exactly where a child thinks about
 *    their own room, and most of what they say will be a baby monitor. So the
 *    pack carries a briefing: what is ordinary, what is not, and what to do.
 *
 * 2. The usual "has this happened to you?" slide would be "what have you got
 *    in your bedroom?", which is an audit of thirty bedrooms and a list of
 *    which homes can afford gadgets. It is replaced with sorting things in
 *    general: ears on, or fast asleep.
 *
 * 3. Not every home has a smart speaker. A child without one can feel left out
 *    of a week built around them, so the take-home job works either way: count
 *    the things with no ears, and that is a list too.
 *
 * Lane-clean, as the source is: what a DEVICE senses in a room. Typed private
 * info is week 2, account privacy week 17.
 *
 * Mirrors app/lesson/weekContent/week14.ts. See ./types.ts for the fields.
 */
import { ART } from "./art";
import type { Card, Concept, Pack, Slide } from "./types";

const FIVE: readonly Concept[] = [
  { art:ART.home,      name:"Ears Finder",    line:"If it answers, it heard you." },
  { art:ART.clipboard, name:"Diary Reader",   line:"It keeps a copy. A grown-up can clear it." },
  { art:ART.eye,       name:"Lens Spotter",   line:"An awake lens shows a light." },
  { art:ART.shush,     name:"Moment Picker",  line:"Out loud counts too." },
  { art:ART.gear,      name:"Settings Scout", line:"Flip it with a grown-up." },
];

/* The raccoon's three open doors, before the break and again after it with a
   stamp on each. Same array both times: identical layout is what makes the
   mirror land from the back of the room. */
const RISKS: readonly Card[] = [
  { art:ART.robot,     head:"Ears nobody counted",   sub:"the telly, the headset, the talking toy" },
  { art:ART.megaphone, head:"Said out loud",         sub:"the wifi password, shouted across the kitchen" },
  { art:ART.gear,      head:"Switches never touched", sub:"wide open since the day it came out of the box" },
];

const SLIDES: readonly Slide[] = [
  /* ───────── 10 MINUTES: TALKING IT THROUGH BEFORE THEY PLAY ───────── */
  { at:"before", kind:"tell", scene:"solo", art:ART.home, eyebrow:"Week 14 &middot; Who&rsquo;s Listening?",
    title:"Some things in your<br>house have ears.",
    say:"&ldquo;Eyes up. Some of the things in your house have <b>ears</b>. A smart speaker, obviously. But also a telly with a voice button on the remote, a games console with a headset, a tablet, and quite often a talking toy.&rdquo; Then, warmly. &ldquo;They are not spying on you. They are waiting for their name, like a dog lying by the door waiting for its walk. And a kettle, a lamp and an ordinary teddy? They hear <b>nothing</b> at all.&rdquo;",
    warn:"The course&rsquo;s tone rule for this week: <b>curious, never creepy.</b> These are helpers worth knowing about, not monsters. Nothing in this lesson should leave a six year old uneasy in their own bedroom, so if you only land one line on this slide, make it the teddy." },

  { at:"before", kind:"ask", scene:"racc", eyebrow:"Ask the class",
    title:"How is he<br>listening in?",
    bubble:"Nobody EVER counts the ears!",
    say:"&ldquo;The Raccoon has found a lazy new trick. He does not break in at all. He listens through gadgets that are already sitting in people&rsquo;s houses.&rdquo; Point at the bubble. &ldquo;So how could a speaker help <b>him</b>?&rdquo;",
    hear:[
      ["&ldquo;Is he in my house?&rdquo;", "&ldquo;No. He is a cartoon raccoon, and nobody is listening at your house. The point is that a gadget <b>can</b> hear, and a Scout knows which ones.&rdquo;"],
      ["&ldquo;Because it hears you.&rdquo;", "&ldquo;Right. So what if you said something private near it?&rdquo;"],
      ["&ldquo;We have one of those!&rdquo;", "&ldquo;Lots of people do, and they are really handy. You are about to find out how to be the boss of it.&rdquo;"],
    ],
    warn:"Answer the first one properly if it comes, and it often does. A young child can hear &ldquo;he listens through your speaker&rdquo; as a raccoon in their living room. The repair is plain: <em>he is pretend, the gadgets are real, and they are helpers</em>." },

  { at:"before", kind:"ask", scene:"risks", id:"risks", cards:RISKS, eyebrow:"Talk about it",
    title:"His three<br>open doors.",
    say:"&ldquo;He has three open doors.&rdquo; Walk the three. &ldquo;Ears nobody counted, because most people only ever think of the speaker. Something said out loud, like the wifi password shouted across the kitchen. And switches nobody ever touched, wide open since the box.&rdquo; Then. &ldquo;Every one of those is a door left open, and <b>every one of them can be shut</b>.&rdquo;",
    hear:[
      ["&ldquo;What does switches mean?&rdquo;", "&ldquo;Settings. Like the mute button on top of a speaker. There are six in the game.&rdquo;"],
      ["&ldquo;Is it bad to have a speaker?&rdquo;", "&ldquo;Not at all. It is handy. It just helps to know what it does.&rdquo;"],
    ],
    link:{ to:"safe", text:"You come back to these same three on slide %s, after they have played, and show them sorted." },
    warn:"Keep the third card firmly in <b>with a grown-up</b> territory. The game never has a child change a setting alone, and you do not want anybody going home and quietly muting the family speaker tonight." },

  { at:"before", kind:"ask", scene:"scenarios", eyebrow:"Ask the class",
    cards:[
      { art:ART.robot, sub:"The talking robot toy that answers back" },
      { art:ART.bulb,  sub:"The reading lamp beside the chair" },
      { art:ART.bell,  sub:"The telly, with a voice button on the remote" },
    ],
    title:"Ears on, or<br>fast asleep?",
    say:"&ldquo;Quick game. For each one: ears on, or fast asleep? Here is the trick for working it out. <b>Can you talk to it?</b> If it answers you, it heard you.&rdquo; Go along the three. The toy and the telly have ears; the lamp has none.",
    hear:[
      ["&ldquo;The toy is just a toy.&rdquo;", "&ldquo;Does it answer back? Then it heard you first. Most grown-ups are surprised by that one.&rdquo;"],
      ["&ldquo;The telly cannot hear.&rdquo;", "&ldquo;Look at the little voice button on the remote. You talk into it, so there is a microphone behind it.&rdquo;"],
      ["&ldquo;What about my teddy?&rdquo;", "&ldquo;An ordinary teddy is stuffing and stitching. No batteries, no ears. It hears nothing at all.&rdquo;"],
    ],
    warn:"<b>Deliberately not &ldquo;what have you got in your bedroom?&rdquo;</b> That turns a curious lesson into an audit of thirty bedrooms, shows up which homes have expensive gadgets, and the camera rule is coming in the game. Keep the class sorting things in general, not listing their own houses." },

  { at:"before", kind:"do", scene:"five", eyebrow:"Now it is your turn",
    title:"Log on and<br>have a go.",
    under:"We all come back together 10 minutes before the end.",
    say:"&ldquo;Right. Week 14 is the Listening House, and you are the Settings Scout. <b>Five things</b> to learn.&rdquo; Read the five off the board. &ldquo;We come back together <b>10 minutes before the end</b>.&rdquo;",
    hear:[
      ["&ldquo;Is this one scary?&rdquo;", "&ldquo;Not a bit. It is a house full of gadgets, and you are the one who knows what they all do.&rdquo;"],
      ["Somebody cannot log in", "Get them going before you sit down. A child stuck on the login learns nothing for forty-five minutes."],
    ],
    handover:true,
    warn:"Read the briefing at the top first. In <b>Little Glass Eyes</b> the last corner is a bedroom with a small camera on a shelf pointing at the bed, and the rule is <em>tell a grown-up, every time</em>. That is the moment a child may think about their own room, so <b>walk the room during that game</b> rather than sitting down. There is also one speed round with a bar that runs down: it is for fun, and nobody fails when it empties." },

  /* ───────── 45 MINUTES ON THE COMPUTERS ───────── */

  /* ───────── 10 MINUTES: TALKING IT THROUGH AFTERWARDS ───────── */
  { at:"after", kind:"ask", scene:"racc", eyebrow:"Talk about it",
    title:"How did you get on?",
    bubble:"Muted?! By a KID?!",
    say:"&ldquo;So, his listening trick has stopped working. Did anything surprise you?&rdquo; Let them tell you.",
    hear:[
      ["&ldquo;The telly!&rdquo;", "&ldquo;It catches everybody out. If it has a voice button, it has a microphone.&rdquo;"],
      ["&ldquo;It is a bit creepy.&rdquo;", "&ldquo;It can feel like that at first. But remember what it is doing: waiting for its name, so it can help. And now you know how to be the boss of it.&rdquo;"],
      ["&ldquo;Is our speaker listening to me right now?&rdquo;", "&ldquo;It is half asleep, waiting for its name. It only keeps anything after it wakes up, and a grown-up can open that and empty it.&rdquo;"],
    ],
    warn:"If a child mentions a camera in their own room, answer calmly and ordinarily in front of the class: <em>lots of families have one, and the grown-ups at home will know about it</em>. Then see the briefing, and come back to it with them quietly if anything about it worried you." },

  { at:"after", kind:"ask", scene:"scenarios", eyebrow:"Ask the class",
    cards:[
      { art:ART.tap,    sub:"&ldquo;Hey Nova, play my favourite song&rdquo;" },
      { art:ART.bell,   sub:"&ldquo;&hellip;ova, and the weather tomorrow&rdquo; off the telly" },
      { art:ART.speech, sub:"&ldquo;Nova, stop! No, YOU said you would do it!&rdquo; in a row about the washing up" },
    ],
    title:"Why is each one<br>in the diary?",
    say:"&ldquo;Here is the idea from the game, made real. A smart speaker listens so it can help. It stays half awake for its name, and when it wakes, it keeps a copy of what came next. A <b>diary</b>. These three are in Nova&rsquo;s diary. Why is each one there?&rdquo; Take answers. Then the best bit: &ldquo;A grown-up can open that diary on their phone and empty it in about four taps.&rdquo;",
    hear:[
      ["&ldquo;Somebody asked it for a song.&rdquo;", "&ldquo;Right. That is the helping part, working exactly as it should.&rdquo;"],
      ["&ldquo;Nobody said its name in the middle one!&rdquo;", "&ldquo;The telly said something close enough. So it woke up by mistake.&rdquo;"],
      ["&ldquo;It recorded the whole argument!&rdquo;", "&ldquo;Not the whole thing. It woke on its name and kept what came next. It cannot tell a row from a song request.&rdquo;"],
    ],
    warn:"End on the delete: <b>a grown-up can open it and clear it.</b> That is the line that takes the spooky out, and it is the exact line the Raccoon lies about in the game. If the row gets giggles or a story about home, keep it light: <em>every house has those</em>." },

  { at:"after", kind:"do", scene:"recipe", eyebrow:"Do it together",
    title:"The Scout&rsquo;s<br>ten minutes.",
    recipe:{ slots:["A GROWN-UP","LOOK","FLIP"],
      thenLabel:"leave alone",
      add:["the doorbell","the night-light"],
      test:"Ten minutes, and the house is set for years." },
    say:"&ldquo;These gadgets have switches, and you are allowed to use them. With a grown-up. Here is the whole job.&rdquo; Point at each slot. &ldquo;<b>A grown-up</b> first, because you do it together. Then <b>look</b>: walk the rooms and list what has ears and eyes. Then <b>flip</b>: the microphone off when nobody is using it, the diary set to empty itself.&rdquo; Point at the pills. &ldquo;And leave alone the ones already doing their job. A doorbell watching the front step is fine. A night-light has no ears at all.&rdquo; Then: &ldquo;Let us do the look part right now, on this room.&rdquo;",
    hear:[
      ["&ldquo;Can I do it on my own?&rdquo;", "&ldquo;No, this one is always with a grown-up. It is their gadget too, and two of you are better at it.&rdquo;"],
      ["&ldquo;The laptop has a camera!&rdquo;", "&ldquo;Well spotted. Is it awake? How would we know?&rdquo; A little light, or a cover slid back."],
    ],
    warn:"Check your own room before the lesson, so you know where the lenses and microphones are: the laptop on the board, a visualiser, a speaker. Point them out cheerfully. A teacher saying <em>&ldquo;yes, that has a camera, and the little light tells us when it is on&rdquo;</em> is the whole tone of this week in one sentence." },

  { at:"after", kind:"tell", scene:"risks", safe:true, stamp:"sorted", id:"safe", cards:RISKS, eyebrow:"Look what you did",
    title:"All three doors.<br>Shut.",
    say:"&ldquo;Remember his three open doors? Look at them now.&rdquo; Go along the three. &ldquo;Ears nobody counted? You counted them. Said out loud? You move a room, type it, or wait. Switches never touched? Ten minutes with a grown-up. <b>His lazy trick has stopped working.</b>&rdquo;",
    hear:[
      ["Somebody looks pleased", "Let them. They earned it."],
      ["&ldquo;We say the wifi password out loud all the time.&rdquo;", "&ldquo;Most houses do. Next time, walk through to the other room. Same answer, different room.&rdquo;"],
    ],
    warn:"Say out loud that the middle card is about <b>picking your moment, not being secretive at home</b>. The game&rsquo;s last example is Gran on the speakerphone asking which class you are in, and the right answer is just to tell her. Without that, the keenest children go home and refuse to speak in the kitchen." },

  { at:"after", kind:"ask", scene:"solo", art:ART.question, eyebrow:"What would you do?",
    title:"A new toy with a<br>little glass circle.",
    say:"&ldquo;Last one, and it is new. Layla gets a new talking doll. On its head is a small, round, shiny circle that nobody mentioned. What is her first move?&rdquo;",
    hear:[
      ["&ldquo;Put a sticker over it.&rdquo;", "&ldquo;Then it is still a mystery, and the grown-up who could find out never hears about it. What else could she do?&rdquo;"],
      ["&ldquo;Show a grown-up.&rdquo;", "&ldquo;<b>Show it and ask what it is.</b> It might be a camera, it might just be a shiny button. A grown-up can find out for sure.&rdquo;"],
      ["&ldquo;Throw it away!&rdquo;", "&ldquo;No need. Most toys are lovely. She is just finding out what it does, the same as the speaker.&rdquo;"],
    ],
    warn:"This tests whether the lens power travels to something new. The instinct to watch for is <b>hiding it</b>: covering it quietly and keeping it to themselves. The game is clear that covering it in secret is the wrong move. Asking out loud is the right one." },

  { at:"after", kind:"tell", scene:"tonight", art:ART.eye, eyebrow:"Tonight",
    title:"Do the ears check<br>with a grown-up.",
    under:"What has ears? What has eyes?",
    say:"&ldquo;One job tonight. Find a grown-up and walk round your home together. Count the things with ears, and the things with eyes. You do not have to change anything tonight. <b>Just make the list.</b>&rdquo; Then. &ldquo;And if you find something you are not sure about, you know what to do. Ask.&rdquo;",
    hear:[
      ["&ldquo;We do not have any of those.&rdquo;", "&ldquo;Then count the things with <b>no</b> ears. The kettle, the lamp, the teddy. That is a list too.&rdquo;"],
      ["&ldquo;Can I turn the speaker off?&rdquo;", "&ldquo;Only with your grown-up, and only if they want to. It is their gadget as well.&rdquo;"],
    ],
    warn:"A looking job, not a changing job, on purpose: a child muting the family speaker alone is not what the course teaches. The first answer matters too. Not every home has these gadgets, and a child without them still has a job tonight, and will meet the gadgets at friends&rsquo; houses anyway." },
];

export const WEEK_14: Pack = {
  n: 14,
  title: "Who&rsquo;s Listening?",
  sub: "Smart Devices",
  five: FIVE,
  slides: SLIDES,
  games: "The Ears Check, The Speaker Diary, Little Glass Eyes, The Megaphone Rule, Flip It Together, The Scout&rsquo;s Check-Card",
  brief: {
    head:"Read this before you teach it",
    body:[
      "<b>This week has one safeguarding rule in it:</b> a camera pointing at a bed is told to a grown-up, every time. The game shows a bedroom with a small camera on a shelf, and some children will think about their own room.",
      "<b>Most of what you hear will be ordinary.</b> Plenty of families use a baby monitor or a pet camera, and &ldquo;there is a camera in my room&rdquo; usually describes one a parent put there. Do not react with alarm in front of the class, and do not ask the child to describe it.",
      "<b>Listen for what is not ordinary:</b> a camera somebody told them to keep secret, one from somebody outside the family, being asked to go on a video call in their bedroom, or a child who seems frightened talking about it.",
      "<b>Never promise to keep it secret.</b> If anything worries you, write down what they said in their own words and pass it to whoever is responsible for child protection at your school <b>the same day</b>.",
      "Your own setting&rsquo;s safeguarding policy overrides anything on these slides.",
    ] },
};
