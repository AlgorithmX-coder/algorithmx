/**
 * Cyber Heroes, week 8: the teacher pack.
 *
 * Photos and videos. The Darkroom, and the week where a photo stops being
 * "just a photo" and becomes copies, faces, clues and doors. It is the home
 * of "once it's out, it's out" (see the lanes in
 * docs/cyberheroes/curriculum-buildsheet.md).
 *
 * WHY THIS WEEK CARRIES A BRIEFING. The fourth lesson teaches, calmly and
 * correctly, that photos of your body ("bath time or getting changed") are
 * Just Me photos and go through no door at all. That is body safety, and a
 * child who has been asked for a photo, or has sent one, or knows one of them
 * exists, may recognise it and tell you. The source already moved that item
 * out of a timed sort into a calm Learn; the pack keeps the teacher in the
 * same calm voice.
 *
 * THREE THINGS THE SOURCE MADE ME CHANGE.
 *
 * 1. The spine of the week is "delete only deletes your copy". That is good
 *    teaching aimed at the moment BEFORE sharing, and it lands like a
 *    sentence on a child for whom the photo is already out. The source does
 *    carry the repair, once, in the consent Learn ("if a photo of YOU goes up
 *    and you don't like it, you can ask for it to come down"), so the pack
 *    puts that line on the board early and gives the teacher a sentence for
 *    the room: it is never too late to tell, and getting things taken down is
 *    a grown-up's job.
 *
 * 2. No "have you ever shared a photo you wish you hadn't?" slide, for the
 *    obvious reason. The relatable slide picks doors for three harmless
 *    photos instead.
 *
 * 3. Two real-life rules the game brushes against and the teacher has to
 *    hold. Ava's "Mum says no party photos online" is the rule some children
 *    live under for serious reasons (a child who is looked after or adopted,
 *    where a photo online can be a safety risk); the class must not end up
 *    discussing who is allowed. And a child will say "my mum posts photos of
 *    me": the answer keeps that a conversation at home, not a complaint.
 *
 * Mirrors app/lesson/weekContent/week8.ts. See ./types.ts for the fields.
 */
import { ART } from "./art";
import type { Card, Concept, Pack, Slide } from "./types";

const FIVE: readonly Concept[] = [
  { art:ART.trash,     name:"Copy Watcher",     line:"Delete only deletes your copy." },
  { art:ART.thumbsup,  name:"Ask-First Poster", line:"Their face, their call." },
  { art:ART.magnifier, name:"Corner Checker",   line:"Backgrounds talk." },
  { art:ART.door,      name:"Door Picker",      line:"The smallest door that fits." },
  { art:ART.brain,     name:"Look, Think, Ask", line:"Three seconds before every share." },
];

/* The three ways a photo says too much, before the break and again after it
   with a stamp on each. Same array both times: identical layout is what makes
   the mirror land from the back of the room. */
const RISKS: readonly Card[] = [
  { art:ART.trash,  head:"&ldquo;I&rsquo;ll just delete it&rdquo;", sub:"but your friends still have their copies" },
  { art:ART.pin,    head:"A clue in the corner",       sub:"a door number, a school name on a jumper" },
  { art:ART.camera, head:"A friend who never said yes", sub:"their face, posted anyway" },
];

const SLIDES: readonly Slide[] = [
  /* ───────── 10 MINUTES: TALKING IT THROUGH BEFORE THEY PLAY ───────── */
  { at:"before", kind:"tell", scene:"solo", art:ART.camera, eyebrow:"Week 8 &middot; Think Before You Share",
    title:"Delete only deletes<br>your copy.",
    say:"&ldquo;Eyes up. Here is the biggest photo secret there is. When you share a photo, copies land on your friend&rsquo;s phone, in the group chat, and on the app&rsquo;s computers. Your friend can screenshot it, or send it on.&rdquo; Slow down. &ldquo;So when you press delete, <b>it only deletes your copy</b>. That is not scary, as long as you remember it <b>before</b> you share. That is what this week is for.&rdquo;",
    warn:"Keep this one firmly about <em>before</em>. Said as &ldquo;once it&rsquo;s out, there is nothing you can do&rdquo;, it lands like a sentence on any child for whom a photo is already out. The repair (you can ask for it to come down, and a grown-up can help) is on the next slide. Read the briefing before you teach this week." },

  { at:"before", kind:"ask", scene:"racc", eyebrow:"Ask the class",
    title:"Why does he love<br>the delete button?",
    bubble:"Delete is my favourite button!",
    say:"&ldquo;He says this.&rdquo; Read the bubble, delighted. &ldquo;Why would a thief <b>love</b> the delete button?&rdquo;",
    hear:[
      ["&ldquo;Because it does not work.&rdquo;", "&ldquo;It works on <b>your</b> phone. It just never touches anybody else&rsquo;s, and by the time you press it, he has his copy.&rdquo;"],
      ["&ldquo;Vanishing photos disappear though.&rdquo;", "&ldquo;Only from the app. A screenshot is a brand new copy that the timer never touches.&rdquo;"],
      ["&ldquo;So it stays forever?&rdquo;", "&ldquo;Copies can. And here is the other half: if a photo of you is out there and you do not like it, you can ask for it to come down, and a grown-up can help. <b>It is never too late to tell somebody.</b>&rdquo;"],
    ],
    warn:"<b>Do not skip the last answer.</b> Without it the week says &ldquo;too late&rdquo; to exactly the child who needs to hear &ldquo;not too late&rdquo;. If nobody asks, say it anyway before you move on." },

  { at:"before", kind:"ask", scene:"risks", id:"risks", cards:RISKS, eyebrow:"Talk about it",
    title:"Three ways a photo<br>says too much.",
    say:"&ldquo;He goes looking for three things in every photo.&rdquo; Walk the three. &ldquo;Copies you cannot take back. A <b>clue in the corner</b>, like a door number or a school name. And a friend in the picture who <b>never said yes</b>.&rdquo; Then the middle one again. &ldquo;Everybody looks at the big smile in the middle. He reads the corners.&rdquo;",
    hear:[
      ["&ldquo;What counts as a clue?&rdquo;", "&ldquo;Anything that says where you live or where you are all day. A house number. A street sign. A school name on a wall or a jumper.&rdquo;"],
      ["&ldquo;Why does my friend have to say yes?&rdquo;", "&ldquo;Because it is their face. Their face, their call.&rdquo;"],
    ],
    link:{ to:"safe", text:"You come back to these same three on slide %s, after they have played, and show them checked." },
    warn:"Never ask children to show or bring in their own photos for this week, even to look for clues together. A real photo on the board puts a real child&rsquo;s home or school in front of the class, which is the very thing the week is teaching them not to do." },

  { at:"before", kind:"ask", scene:"scenarios", eyebrow:"Ask the class",
    cards:[
      { art:ART.palette, sub:"Your dragon drawing, for the online art show" },
      { art:ART.school,  sub:"The class volcano project, everybody in uniform" },
      { art:ART.home,    sub:"A selfie by your front door, with the big number" },
    ],
    title:"Who should see<br>this one?",
    under:"Just Me &middot; Friends &middot; School &middot; Everyone",
    say:"&ldquo;Every photo goes through a door. There are four: <b>Just Me</b>, Friends, School and Everyone. Which door fits each of these?&rdquo; Go along the three. Then say the last part plainly, in the same voice as the rest. &ldquo;And some photos are Just Me. Photos of your body, like bath time or getting changed, and photos of your secrets. They go through <b>no door at all</b>.&rdquo;",
    hear:[
      ["&ldquo;The dragon can go to everyone.&rdquo;", "&ldquo;Yes. No faces, no names, no clues, and it was made to be shown off. Some photos are fine for the biggest door.&rdquo;"],
      ["&ldquo;School for the volcano.&rdquo;", "&ldquo;Right. The uniforms name your school, and your school already knows that. Strangers do not need to.&rdquo;"],
      ["&ldquo;Not the door one!&rdquo;", "&ldquo;Not with that number in it. Take it somewhere else, or keep it for you.&rdquo;"],
      ["&ldquo;What if somebody asks for a Just Me photo?&rdquo;", "&ldquo;You never send it, and you tell a grown-up straight away. You are never in trouble for telling.&rdquo;"],
    ],
    warn:"<b>Say the Just Me sentence calmly and plainly, then move on.</b> The game teaches it in exactly that voice, in a calm lesson with no timer. A giggle is normal at this age; do not tell anybody off for it, just carry on. If the question about somebody asking comes up, that answer is week 3&rsquo;s rule and it is fine to give it in full." },

  { at:"before", kind:"do", scene:"five", eyebrow:"Now it is your turn",
    title:"Log on and<br>have a go.",
    under:"We all come back together 10 minutes before the end.",
    say:"&ldquo;Right. Week 8 is the Darkroom, and you are the photo detectives. <b>Five things</b> to learn.&rdquo; Read the five off the board. &ldquo;We come back together <b>10 minutes before the end</b>.&rdquo;",
    hear:[
      ["&ldquo;Do we take photos?&rdquo;", "&ldquo;No real photos today. Every photo in there is pretend, so you can check it as hard as you like.&rdquo;"],
      ["Somebody cannot log in", "Get them going before you sit down. A child stuck on the login learns nothing for forty-five minutes."],
    ],
    handover:true,
    warn:"Two heads-ups. In <b>The Undo Test</b> the copies never come back, for any child, however they play it: that is the lesson, not a failure. And in <b>The Ask Ring</b> one friend says &ldquo;Mum says no party photos online&rdquo;. Some children live under exactly that rule for serious reasons, and you will know who they are; do not let a conversation start about who is and is not allowed. The quick check with a moving bar is for show and never runs out on them." },

  /* ───────── 45 MINUTES ON THE COMPUTERS ───────── */

  /* ───────── 10 MINUTES: TALKING IT THROUGH AFTERWARDS ───────── */
  { at:"after", kind:"ask", scene:"racc", eyebrow:"Talk about it",
    title:"How did you get on?",
    bubble:"Not one clue?! What am I meant to steal?!",
    say:"&ldquo;So, did he get anything out of your photos?&rdquo; Enjoy the answer. &ldquo;Which clue was the sneakiest?&rdquo;",
    hear:[
      ["&ldquo;The friends still had it on their phones.&rdquo;", "&ldquo;Every time. That is why the thinking happens <b>before</b>.&rdquo;"],
      ["&ldquo;Zara said no.&rdquo;", "&ldquo;And what did you do? Cropped her out. Her no was about her own face. Ava&rsquo;s no was about the whole photo, so that one stayed off.&rdquo;"],
      ["&ldquo;Door 42!&rdquo;", "&ldquo;The house number talks loudest. A happy photo can still say far too much.&rdquo;"],
    ],
    warn:"<b>Check your register before you teach this</b> for a Maya, Leo, Zara, Sam, Ava or Kai. Zara is the child in pyjamas at a sleepover, and a class will turn round and look. If you have one, say at the start that these are the names in the game and nothing to do with anybody here." },

  { at:"after", kind:"tell", scene:"risks", eyebrow:"The four doors",
    cards:[
      { art:ART.locked, head:"Just Me",  sub:"your body and your secrets: no door at all" },
      { art:ART.team,   head:"Friends",  sub:"who can still screenshot it" },
      { art:ART.school, head:"School",   sub:"the whole school, not just your class" },
      { art:ART.globe,  head:"Everyone", sub:"the whole world, forever" },
    ],
    title:"Pick the smallest<br>door that fits.",
    say:"&ldquo;Four doors, from smallest to biggest.&rdquo; Point at each. &ldquo;Just Me. Friends. School. Everyone. Faces and clues get the <b>smallest door that fits</b>. A drawing with no faces and no clues can go through the biggest one.&rdquo; Then the one he lies about. &ldquo;He says a private account means your photos can never escape. True or not?&rdquo;",
    hear:[
      ["&ldquo;True, it is private.&rdquo;", "&ldquo;Private makes the door <b>smaller</b>. It does not lock it. Your friends can still screenshot.&rdquo;"],
      ["&ldquo;Not true.&rdquo;", "&ldquo;Right. Private is good, and it is not a forcefield.&rdquo;"],
    ],
    warn:"&ldquo;Private means safe forever&rdquo; is the belief most adults hold too, which is why the game makes it the lie to catch. Land it as &ldquo;private is good, and it is not a forcefield&rdquo;, so nobody goes home thinking privacy settings are pointless." },

  { at:"after", kind:"do", scene:"recipe", eyebrow:"Say it with me",
    title:"Before any photo<br>goes anywhere.",
    recipe:{ slots:["LOOK","THINK","ASK"],
      test:"Happy for anyone to see it, forever? If not, keep it." },
    say:"&ldquo;The whole week in three words, and it takes three seconds. Say them with me and do the actions.&rdquo; Do it three times. &ldquo;<b>LOOK</b>: hands round your eyes, check every corner. <b>THINK</b>: finger on your head, where is it going? <b>ASK</b>: hand up, ask the people in it, and a grown-up if you are not sure.&rdquo;",
    hear:[
      ["&ldquo;Even my little brother?&rdquo;", "&ldquo;Even your little brother. His wobbly bike ride, his face, his call.&rdquo;"],
      ["&ldquo;What if they say no?&rdquo;", "&ldquo;Then you listen. Leave them out, or keep it. A no about their face is the end of it.&rdquo;"],
    ],
    warn:"&ldquo;Ask both ways&rdquo; is in the game: if somebody posts a photo of <em>you</em> that you do not like, you can ask for it to come down. Make sure it gets said, because it is the half of consent that protects the child in front of you." },

  { at:"after", kind:"tell", scene:"risks", safe:true, stamp:"checked", id:"safe", cards:RISKS, eyebrow:"Look what you did",
    title:"Every corner<br>checked.",
    say:"&ldquo;Remember his three from the start? Look at them now.&rdquo; Go along the three. &ldquo;You think before you share, because delete only deletes your copy. You read the corners first. And you ask everybody in the picture. <b>His darkroom is empty.</b>&rdquo; Then, to the whole room, not to anybody in particular:",
    hear:[
      ["Somebody looks pleased", "Let them. They earned it."],
      ["Somebody looks worried", "That is who the sentence below is for. Say it to the room, not to them."],
    ],
    warn:"<b>Say this out loud, whether or not anybody asks.</b> Something like: <em>if there is a photo of you out there, or one you sent, that you wish was not, you are not in trouble, and it is never too late to tell a grown-up. Getting photos taken down is a grown-up&rsquo;s job, not yours.</em> A whole lesson about copies you cannot get back lands hard on a child for whom it has already happened. One sentence from you is the way out." },

  { at:"after", kind:"ask", scene:"solo", art:ART.camera, eyebrow:"What would you do?",
    title:"Somebody posts<br>a photo of you.",
    say:"&ldquo;Last one, and it is the other way round. Somebody posts a photo of <b>you</b>. You never said yes, and you do not like it. What do you do?&rdquo;",
    hear:[
      ["&ldquo;Ask them to take it down.&rdquo;", "&ldquo;Yes. Your face, your call. That rule works both ways.&rdquo;"],
      ["&ldquo;Tell a grown-up.&rdquo;", "&ldquo;Yes, and straight away if they say no, or if it is somebody you do not know.&rdquo;"],
      ["&ldquo;Post a silly one of them back.&rdquo;", "&ldquo;I know it is tempting. But that makes two photos nobody wanted, not zero.&rdquo;"],
      ["&ldquo;My mum posts photos of me.&rdquo;", "&ldquo;Lots of grown-ups do, and most of the time that is fine. If there is one you do not like, you can tell her. Grown-ups usually want to know.&rdquo;"],
    ],
    warn:"Keep the parent answer warm. It must stay a conversation at home, never a complaint about a family in front of the class. And know your own school&rsquo;s photo policy before you teach this: a child may ask about the photos the school itself puts online." },

  { at:"after", kind:"tell", scene:"tonight", art:ART.magnifier, eyebrow:"Tonight",
    title:"Check one photo<br>with a grown-up.",
    under:"Look at every corner. What does it give away?",
    say:"&ldquo;One job tonight. Ask a grown-up to pick <b>one</b> photo on their phone, and be the photo detective together. Look at every corner. Is there a house number? A street sign? A school name? If there is, you found it before a stranger did.&rdquo;",
    hear:[
      ["&ldquo;What if there is a clue?&rdquo;", "&ldquo;Then ask the grown-up if they want to crop it out. They will probably be impressed.&rdquo;"],
      ["&ldquo;Can I use my own phone?&rdquo;", "&ldquo;Do it with a grown-up, on theirs. That is the job.&rdquo;"],
    ],
    warn:"Deliberately a grown-up&rsquo;s phone, chosen by the grown-up, with them sitting there. A child should not be going through their own photos alone on the back of this lesson, and nobody should bring a photo into school to show you." },
];

export const WEEK_8: Pack = {
  n: 8,
  title: "Think Before You Share",
  sub: "Photos and Videos",
  five: FIVE,
  slides: SLIDES,
  games: "The Undo Test, The Ask Ring, The Developing Tray, The Door Dial, The Photo Detective, The Share Maze",
  brief: {
    head: "Read this before you teach it",
    body: [
      "<b>This week talks about photos of children&rsquo;s bodies.</b> It teaches, calmly and correctly, that photos of your body, like bath time or getting changed, are Just Me photos and go nowhere. That is body safety. A child who has been asked for a photo, or has sent one, or knows one exists, may recognise it and may tell you. That is the lesson working, not the lesson going wrong.",
      "<b>Listen.</b> Do not investigate, and never ask a child to describe what happened in front of the class.",
      "<b>Never promise to keep it secret.</b> Say: &ldquo;I am really glad you told me. I need to tell somebody who can help.&rdquo;",
      "<b>The spine of the week is &ldquo;delete only deletes your copy&rdquo;.</b> That is aimed at the moment before sharing, and it lands like a sentence on a child for whom the photo is already out. If a child tells you something, tell them they are not in trouble and that it is never too late to tell: getting photos taken down is a grown-up&rsquo;s job. &ldquo;It was not your fault&rdquo; is taught properly in week 11, so do not teach week 11 early, but that child needs it <b>today</b>. It is on the stamped slide so you do not forget.",
      "<b>Some children live under a strict no-photos-online rule</b>, for example a child who is looked after or adopted, where a photo online can be a real safety risk. One friend in the game says &ldquo;Mum says no party photos online&rdquo;. Do not let the class discuss who is and is not allowed.",
      "<b>Check your register for a Maya, Leo, Zara, Sam, Ava or Kai.</b> Zara is the child in pyjamas at a sleepover, and a class will turn round and look.",
      "<b>Never ask children to show or bring in their own photos</b> for this lesson.",
      "<b>Write down what they said in their own words</b> as soon as you can, and pass it to whoever is responsible for child protection at your school <b>the same day</b>.",
      "Your own setting&rsquo;s safeguarding policy overrides anything on these slides.",
    ],
  },
};
