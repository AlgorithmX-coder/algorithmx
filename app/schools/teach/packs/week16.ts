/**
 * Cyber Heroes, week 16: the teacher pack.
 *
 * QR codes and links. The Doorway Maze: every link and every code is a door,
 * the sign on it is paint, and the week is about what you can tell before you
 * walk through. It owns the MECHANISM of a click or a scan. Fake senders and
 * the hurry-up feeling were week 4, so the pack reinforces those and never
 * re-teaches them.
 *
 * THREE THINGS THE SOURCE MADE ME CHANGE.
 *
 * 1. The boss quiz tests a skill no game teaches. Its second question asks for
 *    the "press and hold" peek, under the label "Peek Before You Walk", but the
 *    Learn screen with that title was re-verbed to the keyring and never
 *    mentions pressing and holding. The teach-before-test rule is broken in the
 *    product, so the pack teaches the move out loud before the children log on,
 *    and again in the job for tonight.
 *
 * 2. The boss also contradicts the week. Beat 3's "catch the lie" says the
 *    Raccoon's fib is that stickers look crooked and bubbly; the boss then
 *    describes a crooked, bubbly sticker as the right answer. Both are true of
 *    SOME stickers, and a child who notices will ask. The pack gives the
 *    teacher the line that reconciles them: some are crooked, the good ones
 *    are not, which is why we press.
 *
 * 3. "A code always gets a grown-up" will meet a room full of children who
 *    watch their parents scan menus every weekend. Without care the week turns
 *    into "codes are dangerous" and "mum is doing it wrong". The pack keeps the
 *    source's real point: nobody can read a code, so a grown-up looks WITH you.
 *
 * And the usual week 4 care: the relatable slide asks where they have SEEN a
 * code, which everybody has, never whether they have tapped one.
 *
 * Mirrors app/lesson/weekContent/week16.ts. See ./types.ts for the fields.
 */
import { ART } from "./art";
import type { Card, Concept, Pack, Slide } from "./types";

const FIVE: readonly Concept[] = [
  { art:ART.door,  name:"Sign Reader",     line:"The sign is paint. The plate is the fact." },
  { art:ART.key,   name:"Keyring Keeper",  line:"It has to prove it is yours." },
  { art:ART.tap,   name:"Peel Tester",     line:"Press the corner. Do not stare." },
  { art:ART.swirl, name:"Pane Reader",     line:"Cannot read it? Say so." },
  { art:ART.hand,  name:"Barrier Wheeler", line:"Not sure? Barrier out." },
];

/* His three door tricks, before the break and again after it with a stamp on
   each. Same array both times: identical layout is what makes the mirror land
   from the back of the room. */
const RISKS: readonly Card[] = [
  { art:ART.door,  head:"A lovely painted sign",  sub:"it can promise anything, and open anywhere" },
  { art:ART.tap,   head:"A sticker on top",       sub:"his code stuck over the real one" },
  { art:ART.swirl, head:"A code nobody can read", sub:"not you, not me, not anybody" },
];

const SLIDES: readonly Slide[] = [
  /* ───────── 10 MINUTES: TALKING IT THROUGH BEFORE THEY PLAY ───────── */
  { at:"before", kind:"tell", scene:"solo", art:ART.door, eyebrow:"Week 16 &middot; Don&rsquo;t Take the Bait",
    title:"Every link is a door.<br>The sign is just paint.",
    say:"&ldquo;Eyes up. This week, every link you tap and every code you scan is a <b>door</b>. Here is the thing about doors. The sign on one is painted by whoever put it there. A door can say FREE PUPPIES in beautiful letters and open onto a broom cupboard.&rdquo; Pause. &ldquo;So we never judge a door by its sign. We look at where it <b>actually goes</b>.&rdquo;",
    warn:"&ldquo;The sign is just paint&rdquo; is the sentence to keep coming back to. Every game this week is a version of it, and it is the bit a seven year old can actually use on a tablet tonight." },

  { at:"before", kind:"ask", scene:"racc", eyebrow:"Ask the class",
    title:"So where does<br>this door go?",
    bubble:"FREE PUPPIES! Tap here!",
    say:"Read the bubble as if it is the best news you have ever had. &ldquo;Free puppies! Who wants one? Right. Question. Where does this door <b>go</b>?&rdquo; Let them guess, then: &ldquo;We have no idea. All we know is what <b>he</b> painted on it.&rdquo;",
    hear:[
      ["&ldquo;To the puppies!&rdquo;", "&ldquo;That is what the sign says. And who painted the sign? He did. So what does it actually prove?&rdquo;"],
      ["&ldquo;Somewhere bad.&rdquo;", "&ldquo;Maybe. Maybe not. The honest answer is we cannot tell from the sign, and that is the whole point.&rdquo;"],
      ["&ldquo;You could just tap it and see.&rdquo;", "&ldquo;That is his favourite sentence in the whole world. Tapping a door IS walking through it. There is no peeking.&rdquo;"],
    ],
    warn:"Push for <b>&ldquo;we cannot tell&rdquo;</b> rather than &ldquo;somewhere bad&rdquo;. The week is not teaching that links are bad. It is teaching that the sign is not evidence, which is a much more useful idea and does not leave them scared of every button." },

  { at:"before", kind:"ask", scene:"risks", id:"risks", cards:RISKS, eyebrow:"Talk about it",
    title:"He has three<br>door tricks.",
    say:"&ldquo;He has three tricks with doors.&rdquo; Walk the three. &ldquo;One: a lovely sign on a door that goes somewhere else. Two: he sticks his <b>own</b> code over a real one, on a menu or a poster. Three: a code is a pattern for a machine, and <b>no person can read it</b>. Not you. Not me. Not anybody in this building.&rdquo;",
    hear:[
      ["&ldquo;Can you not read it if you look really hard?&rdquo;", "&ldquo;Nope. Not even grown-ups. Which means saying &lsquo;I cannot read this&rsquo; is not you being bad at reading. It is just true.&rdquo;"],
      ["&ldquo;How do you spot a sticker?&rdquo;", "&ldquo;You do not spot it, you <b>test</b> it. You will see how in the game.&rdquo;"],
    ],
    link:{ to:"safe", text:"You come back to these same three on slide %s, after they have played, and show them checked." },
    warn:"Trick three is the comforting one for your youngest readers. A code is unreadable for <em>everybody</em>, so a child who struggles with the long web addresses in the first game has one door this week where nobody is ahead of them." },

  { at:"before", kind:"ask", scene:"scenarios", eyebrow:"Ask the class",
    cards:[
      { art:ART.pizza,   sub:"on the menu at a caf&eacute;" },
      { art:ART.pushpin, sub:"on a poster, or at the bus stop" },
      { art:ART.gift,    sub:"on a cereal box or a toy packet" },
    ],
    title:"Where have you seen<br>one of these?",
    say:"&ldquo;Everybody has seen one of these little black and white squares. Where?&rdquo; Take a few from each card. &ldquo;They are <b>everywhere</b>, and most of them are completely fine. This week is about the ones that are not, and how you would ever know.&rdquo;",
    hear:[
      ["&ldquo;My mum scans them at restaurants.&rdquo;", "&ldquo;Lots of grown-ups do. And this week you find out why it is the <b>grown-up</b> who scans it.&rdquo;"],
      ["&ldquo;I scanned one!&rdquo;", "&ldquo;Loads of people have.&rdquo; Keep it ordinary and move on. Do not ask what happened."],
    ],
    warn:"<b>Deliberately &ldquo;where have you seen one&rdquo;</b>, not &ldquo;have you ever scanned one&rdquo;. Everybody has seen a code, so every hand is safe to go up. Asking who has scanned or tapped something invites a child to tell the room about the one that went wrong." },

  { at:"before", kind:"do", scene:"five", eyebrow:"Now it is your turn",
    title:"Log on and<br>have a go.",
    under:"We all come back together 10 minutes before the end.",
    say:"&ldquo;Right. You are going into the Doorway Maze, and there are <b>five things</b> to learn.&rdquo; Read the five off the board. Then one extra trick before they go: &ldquo;On a tablet, if you want to see where a link goes, do not tap it. <b>Press and hold</b> it, and the real address pops up. Everybody show me press and hold on the table.&rdquo; &ldquo;We come back together <b>10 minutes before the end</b>.&rdquo;",
    hear:[
      ["&ldquo;Is there a timer?&rdquo;", "&ldquo;One quick question has a little clock bar. Nothing happens when it runs out, so take your time.&rdquo;"],
      ["Somebody cannot log in", "Get them going before you sit down. A child stuck on the login learns nothing for forty-five minutes."],
    ],
    handover:true,
    warn:"<b>Teach press and hold now, out loud.</b> The boss quiz at the end asks for it, and no game in the week teaches it, so without this a child gets a question on something they were never shown. And a heads-up: the speed question in the last beat shows a <b>five second clock bar</b> in a beat that is all about not rushing. The bar is for show and nothing fails when it empties, so tell them that before they meet it." },

  /* ───────── 45 MINUTES ON THE COMPUTERS ───────── */

  /* ───────── 10 MINUTES: TALKING IT THROUGH AFTERWARDS ───────── */
  { at:"after", kind:"ask", scene:"racc", eyebrow:"Talk about it",
    title:"How did you get on?",
    bubble:"Just tap it and find out!",
    say:"&ldquo;He is still saying it. Just tap it and find out. So, which of his doors was the sneakiest?&rdquo; Let them argue. &ldquo;And which game was the hardest?&rdquo;",
    hear:[
      ["&ldquo;The stickers! They looked real.&rdquo;", "&ldquo;Exactly. A good sticker looks perfectly flat. That is why you press the corner instead of staring.&rdquo;"],
      ["&ldquo;But the quiz said stickers are crooked.&rdquo;", "&ldquo;Some are. The good ones are not, and those are the ones that fool people. So we never rely on looking. We press.&rdquo;"],
      ["&ldquo;Gran&rsquo;s photos were fine.&rdquo;", "&ldquo;They were. Plenty of doors are fine. The trick is knowing <b>which</b> ones, not saying no to all of them.&rdquo;"],
    ],
    warn:"Expect the sticker question. The boss quiz describes a crooked, bubbly sticker as the giveaway, while one of the earlier checks says that is the Raccoon&rsquo;s lie. Both are true of some stickers. The answer above settles it without telling a child they were marked wrong." },

  { at:"after", kind:"ask", scene:"solo", art:ART.swirl, eyebrow:"Try it for real",
    title:"Who in this room<br>can read this?",
    say:"Hold up a real QR code: any packet, letter or poster will do. &ldquo;Who can tell me where this one goes?&rdquo; Wait. &ldquo;Me neither. Nobody in this room can, and nobody in this school. So what is the honest answer?&rdquo; Get them to say it: &ldquo;<b>I cannot read this one.</b> And that is a complete answer. It means a grown-up looks with you.&rdquo;",
    hear:[
      ["&ldquo;You could scan it on your phone!&rdquo;", "&ldquo;I could. And that is me walking through the door to find out where it goes. A grown-up can choose to do that. The point is that I cannot <b>read</b> it first.&rdquo;"],
      ["&ldquo;So codes are bad?&rdquo;", "&ldquo;No. Most are fine. Nobody can read them, that is all, so they get a grown-up.&rdquo;"],
    ],
    warn:"Bring a real code. Holding one up and having thirty children fail to read it, including you, does more than any slide. If the room is keen, a sticker stuck over the corner of a printed code makes a good peel test to pass round." },

  { at:"after", kind:"do", scene:"recipe", eyebrow:"Do it together",
    title:"Check a door<br>with me.",
    recipe:{ slots:["Ignore the sign","Read the plate","On my ring?"],
      thenLabel:"cannot tell?", add:["Barrier out","Fetch a grown-up"],
      test:"A door you never opened cannot do anything." },
    say:"&ldquo;Say it with me.&rdquo; Point at each box. &ldquo;<b>Ignore the sign</b>, because it is paint. <b>Read the plate</b>, the address that says where it really goes. <b>Is it on my ring?</b> Somebody I actually know. And if you cannot tell?&rdquo; Let them shout it. &ldquo;<b>Barrier out. Fetch a grown-up.</b>&rdquo; Do it twice, faster.",
    hear:[
      ["&ldquo;What if it is a code and there is no plate?&rdquo;", "&ldquo;Then you cannot tell. And when you cannot tell?&rdquo; Barrier out."],
      ["&ldquo;What if the grown-up is busy?&rdquo;", "&ldquo;Then the door waits. A door that waits cannot do a single thing to you.&rdquo;"],
    ],
    warn:"Finish on the last line, and say it slowly. &ldquo;A door you never opened cannot do anything&rdquo; is the reason waiting is always safe, and it takes the panic out of the countdowns they met in week 4." },

  { at:"after", kind:"tell", scene:"risks", safe:true, stamp:"checked", id:"safe", cards:RISKS, eyebrow:"Look what you did",
    title:"All three doors.<br>Checked.",
    say:"&ldquo;Remember his three tricks from the start? Look at them now.&rdquo; Go along the three. &ldquo;You read the plate, not the sign. You pressed the corner. And you said &lsquo;I cannot read this one&rsquo; out loud, which is the hardest of the lot. <b>His maze does not work on you.</b>&rdquo; Then, to the whole room:",
    hear:[
      ["Somebody looks pleased", "Let them. They earned it."],
      ["Somebody looks worried", "That is who the sentence below is for. Say it to the room, not to them."],
    ],
    warn:"<b>Say this out loud, whether or not anybody asks.</b> Something like: <em>if you have ever tapped a link or scanned a code that turned out to be one of his, you are not in trouble. Grown-ups do it all the time. The only thing to do is tell somebody.</em> One sentence from you is enough." },

  { at:"after", kind:"ask", scene:"solo", art:ART.link, eyebrow:"What would you do?",
    title:"Your best friend sends<br>you a link.",
    under:"&ldquo;You HAVE to watch this!&rdquo;",
    say:"&ldquo;Last one. Your best friend sends you a link. You have to watch this! Your friend is definitely on your ring. So do you tap it?&rdquo; Take votes, then: &ldquo;Your friend is yours. But did your friend <b>build</b> that door?&rdquo;",
    hear:[
      ["&ldquo;Yes, it is my friend!&rdquo;", "&ldquo;It is. And your friend got it from somewhere. They are passing on a door, not building one. So what do you still do?&rdquo; Read the plate."],
      ["&ldquo;Ask them what it is.&rdquo;", "&ldquo;Brilliant. Ask, then read the plate. And if you still cannot tell?&rdquo; Barrier out."],
      ["&ldquo;So I cannot trust my friends?&rdquo;", "&ldquo;You can trust your friend. You just cannot trust that they checked the door. Nobody can check every door they pass on.&rdquo;"],
    ],
    warn:"This one moves the keyring on a step and needs care. The ring tells you <b>who sent it</b>; the plate still tells you <b>where it goes</b>. Do not let it undo the game, where Mum&rsquo;s photos and the school letter rightly opened. A friend forwarding something is the only case where the two answers can disagree." },

  { at:"after", kind:"tell", scene:"tonight", art:ART.swirl, eyebrow:"Tonight",
    title:"Find one code<br>at home.",
    under:"Show a grown-up. Then show them press and hold.",
    say:"&ldquo;One job tonight. Find one of these codes at home: on a box, a packet, a letter. Show it to a grown-up and ask them: <b>can you read where this goes?</b>&rdquo; Pause. &ldquo;They cannot. Nobody can. Then show them press and hold on a link, because I bet some of them do not know that one.&rdquo;",
    hear:[
      ["&ldquo;What if they scan it?&rdquo;", "&ldquo;That is fine. They are the grown-up. You can ask them where it went.&rdquo;"],
      ["&ldquo;We have loads at home.&rdquo;", "&ldquo;Everybody does. That is the point. Just pick one.&rdquo;"],
    ],
    warn:"This job sends the week&rsquo;s best idea home: nobody can read a code, adults included. It also hands the grown-up press and hold, which a surprising number of adults do not use, so the child gets to be the one who knows something." },
];

export const WEEK_16: Pack = {
  n: 16,
  title: "Don’t Take the Bait",
  sub: "QR Codes and Links",
  five: FIVE,
  slides: SLIDES,
  games: "The Address Plate, Your Keyring, The Peel Test, Clear Glass, Frosted Glass, The Barrier, The Power Board",
};
