/**
 * Cyber Heroes, week 3: the teacher pack.
 *
 * Friend or foe. This is the grooming-awareness week, and it carries a
 * briefing for the same reason week 11 does: a child may recognise themselves
 * in it and tell you something.
 *
 * ONE THING THE GAME DOES NOT DO, AND THE TEACHER HAS TO. Week 3 teaches
 * that "don't tell your parents" is the biggest warning sign there is, but it
 * contains no "it was not your fault" line: the blame-free reassurance is
 * deliberately held back for week 11, eight weeks later. A child who has
 * already sent a photo or given away their school needs to hear that TODAY,
 * out loud, from the adult in the room. That is the whole reason the briefing
 * below exists, and it is the most useful thing in this file.
 *
 * Mirrors app/lesson/weekContent/week3.ts. See ./types.ts for the fields, and
 * note that several carry authored HTML on purpose.
 */
import { ART } from "./art";
import type { Card, Concept, Pack, Slide } from "./types";

const FIVE: readonly Concept[] = [
  { art:ART.eye,       name:"Disguise-Proof",   line:"Judge the proof, not the mask." },
  { art:ART.detective, name:"Profile Detective", line:"Four clues on every profile." },
  { art:ART.warning,   name:"Red-Flag Radar",   line:"Secrets, photos, gifts." },
  { art:ART.hand,      name:"The Two Nevers",   line:"Never meet. Never send." },
  { art:ART.brain,     name:"The Uh-Oh Power",  line:"Feel it. Stop. Tell." },
];

/* What he is actually after, shown before the break and again after it with a
   stamp on each. Same array both times: identical layout is what makes the
   mirror land from the back of the room. */
const RISKS: readonly Card[] = [
  { art:ART.camera,  head:"Asks for a photo",      sub:"and if you say no, asks again a different way" },
  { art:ART.pin,     head:"Works out where you are", sub:"your school, your park, your street" },
  { art:ART.warning, head:"Asks you to keep it secret", sub:"&ldquo;do not tell your parents&rdquo;" },
];

const SLIDES: readonly Slide[] = [
  /* ───────── 10 MINUTES: TALKING IT THROUGH BEFORE THEY PLAY ───────── */
  { at:"before", kind:"tell", scene:"solo", art:ART.mask, eyebrow:"Week 3 &middot; Friend or Foe?",
    title:"You cannot see<br>who is typing.",
    say:"&ldquo;Eyes up. Here is the big one for this week. When you are online, you <b>cannot see</b> who is typing. A photo can be copied from anywhere. An age takes one second to type. A name can be made up. Now, listen to this bit carefully: <b>most people online are exactly who they say they are.</b> But you cannot tell which is which just by looking, so heroes learn to check.&rdquo;",
    warn:"<b>Say the &ldquo;most people&rdquo; line and mean it.</b> Without it this week teaches children that everybody online is dangerous, which is both untrue and unhelpful: a child who believes it stops telling you about the friends they have made, which is the opposite of what you want." },

  { at:"before", kind:"ask", scene:"racc", eyebrow:"Ask the class",
    title:"What does that<br>actually prove?",
    bubble:"Hi! I&rsquo;m 9 too. What&rsquo;s your name?",
    say:"&ldquo;Look at this. A photo of a kid, an age of nine, and a friendly hello.&rdquo; Read the bubble. &ldquo;So. What does that prove about who is really typing?&rdquo;",
    hear:[
      ["&ldquo;Nothing!&rdquo;", "&ldquo;Nothing at all. He copied the photo, he typed the nine, and he picked the name. Not one of those is proof.&rdquo;"],
      ["&ldquo;But they know about my game.&rdquo;", "&ldquo;Tricksters do their homework. Anybody can learn which cartoons are popular. Knowing kid stuff is not proof either.&rdquo;"],
      ["&ldquo;So how do you ever know?&rdquo;", "&ldquo;Brilliant question. There is only one kind of real proof: <b>you know them offline too.</b> Your cousin. Somebody in this room. Somebody you have actually stood next to.&rdquo;"],
    ],
    warn:"The third answer is the one to fish for, because it is the whole week in a sentence. If nobody gets there, ask it directly: &ldquo;who do you know online that you are <em>certain</em> about, and why are you certain?&rdquo;" },

  { at:"before", kind:"ask", scene:"risks", id:"risks", cards:RISKS, eyebrow:"Talk about it",
    title:"So what is he<br>actually after?",
    say:"&ldquo;He is not after your password this week. He is after three things, and he will be very friendly while he asks.&rdquo; Walk the three. &ldquo;A photo of you. Where you are. And the big one: he wants it kept <b>secret from your grown-ups</b>.&rdquo;",
    hear:[
      ["&ldquo;Why does he want a photo?&rdquo;", "&ldquo;So he has something of yours that you cannot get back. That is enough of an answer at this age, and you do not need to go further.&rdquo;"],
      ["&ldquo;Why would you keep it secret?&rdquo;", "&ldquo;Because he will have been kind to you for weeks first. That is what makes it work, and it is why the secret one is the biggest warning sign of the lot.&rdquo;"],
      ["A child goes very quiet", "Note it, move on, and check in with them privately before the end of the day. Do not single them out now."],
    ],
    link:{ to:"safe", text:"You come back to these same three on slide %s, after they have played, and show them spotted." },
    warn:"<b>Keep it at this level and no further.</b> You are naming three asks, not describing what an adult might want. If a child pushes for more, &ldquo;because it gives him something of yours&rdquo; is a complete answer. This is also the slide most likely to produce a disclosure, so read the briefing above before you teach it." },

  { at:"before", kind:"ask", scene:"scenarios", eyebrow:"Ask the class",
    cards:[
      { art:ART.gamepad, sub:"Somebody in a game called you their best friend really quickly" },
      { art:ART.camera,  sub:"Somebody online asked you to send a photo of yourself" },
      { art:ART.speech,  sub:"Somebody asked you to keep your chats a secret" },
    ],
    title:"Has any of this<br>happened to you?",
    say:"&ldquo;Hands up if any of these has happened to you. Nobody is in trouble, I promise, I just want to know.&rdquo; Go along the three one at a time, and keep your own face calm on all three.",
    hear:[
      ["Lots of hands on the first one", "Very common in online games. &ldquo;And how quickly?&rdquo; is a good follow-up. Real friendship is slow."],
      ["A hand goes up on the second or third", "Stay completely level. &ldquo;Thank you for being honest.&rdquo; Move on, and speak to them privately today. Do not ask for details in front of the class."],
      ["Nobody puts a hand up", "That is fine and it does not mean nothing has happened. Say &ldquo;and if one of these happens later, you come and find me&rdquo; and move on."],
    ],
    warn:"<b>Watch your own face on the second and third cards.</b> A child deciding whether to tell you something is reading you, and a flicker of alarm will shut them down. Flat, warm, unbothered. The conversation happens afterwards, in private, not here." },

  { at:"before", kind:"do", scene:"five", eyebrow:"Now it is your turn",
    title:"Log on and<br>have a go.",
    under:"We all come back together 10 minutes before the end.",
    say:"&ldquo;Right. In a minute you play Week 3, and you learn <b>five things</b>.&rdquo; Read the five off the board. &ldquo;Sarah talks you through it. We come back together <b>10 minutes before the end</b>.&rdquo;",
    hear:[
      ["&ldquo;Is it scary?&rdquo;", "&ldquo;No. The baddie is a cartoon raccoon in a trench coat and he is mostly ridiculous.&rdquo;"],
      ["Somebody cannot log in", "Get them going before you sit down. A child stuck on the login learns nothing for forty-five minutes."],
    ],
    handover:true,
    warn:"Two things to know about this week&rsquo;s games. <b>One quick check is on a five second timer</b>, which a few children find stressful: tell them now that it can be retried and nothing is lost. And the Uh-Oh Chat deliberately gets uncomfortable, with a rising meter, because that is the feeling it is teaching them to notice. Both are fine. Neither is a surprise if you have said so first." },

  /* ───────── 45 MINUTES ON THE COMPUTERS ───────── */

  /* ───────── 10 MINUTES: TALKING IT THROUGH AFTERWARDS ───────── */
  { at:"after", kind:"ask", scene:"racc", eyebrow:"Talk about it",
    title:"How did you get on?",
    bubble:"You saw through the lot.",
    say:"&ldquo;So, how did you do? What was he pretending to be?&rdquo; Let them tell you. &ldquo;And did any of them nearly get you?&rdquo;",
    hear:[
      ["&ldquo;The birthday party one!&rdquo;", "That is the hardest one in the week and it is meant to be. Come back to it on the next slide but one."],
      ["&ldquo;I got the maze wrong first.&rdquo;", "&ldquo;Good. That is what it is for. Which reply did you pick, and what happened?&rdquo;"],
      ["&ldquo;The chat made me feel funny.&rdquo;", "&ldquo;<b>That is the whole lesson.</b> That funny feeling is the thing you are learning to notice. Well spotted.&rdquo;"],
    ],
    warn:"If a child says the Uh-Oh Chat made them uncomfortable, treat it as a success out loud, not an apology. The game is teaching them to recognise a feeling, and naming it in front of the class tells everybody else it is normal." },

  { at:"after", kind:"ask", scene:"risks", eyebrow:"Ask the class",
    cards:[
      { art:ART.stopwatch, head:"When did it join?", sub:"brand new, and already keen" },
      { art:ART.team,          head:"Who are its friends?", sub:"nobody you have ever met" },
      { art:ART.speech,        head:"How does it talk?", sub:"best friends in five minutes" },
      { art:ART.question,      head:"What does it ask for?", sub:"your school, or a private chat" },
    ],
    title:"Four clues on<br>every profile.",
    say:"&ldquo;You were detectives in that game. So tell me the four things you check on a profile.&rdquo; Get all four out of the room before you point at the board. &ldquo;When it joined. Who its friends are. How it talks. And what it asks for. Check all four <b>before</b> you trust, not after.&rdquo;",
    hear:[
      ["&ldquo;Best friends in five minutes.&rdquo;", "&ldquo;That one is the giveaway. Real friendship grows slowly. Think how long it took you and the person next to you.&rdquo;"],
      ["&ldquo;What if it passes all four?&rdquo;", "&ldquo;Then it is probably fine, and you still never meet and never send. The four clues make you careful, they do not make you certain.&rdquo;"],
    ],
    warn:"Say the four as a chant and they will keep them: <em>joined yesterday, nobody you know, best friends already, asking about you.</em> Four beats, four fingers." },

  { at:"after", kind:"tell", scene:"solo", art:ART.hand, eyebrow:"The two rules",
    title:"Never meet.<br>Never send.",
    under:"No exceptions. Not once. Not ever.",
    say:"&ldquo;Two rules, and these two have <b>no exceptions at all</b>. Never meet up with somebody you only know online. Never send photos of yourself. That is it.&rdquo; Then the hard one. &ldquo;In the game, somebody invited you to a birthday party with their mum there. Who said yes?&rdquo; Let hands go up. &ldquo;It sounds completely safe, does it not? But somebody&rsquo;s mum being there is <b>still just words on a screen</b>. You cannot see who is typing, so the answer is still no.&rdquo;",
    hear:[
      ["&ldquo;But my cousin lives far away and I only see her online.&rdquo;", "&ldquo;And that is different, because you know her offline as well. The rule is about people you have <b>only</b> met online.&rdquo;"],
      ["&ldquo;What if it is somewhere really busy?&rdquo;", "&ldquo;Not at the park, not at the library, not just quickly. The rule is not about the place.&rdquo;"],
      ["&ldquo;What if they send one first?&rdquo;", "&ldquo;Still no. Fair does not come into it. You never send photos of yourself, full stop.&rdquo;"],
    ],
    warn:"<b>The cousin question will come up and it is a fair one.</b> Have the distinction ready: the rule is about people you have <em>only</em> ever met online. Children with family abroad, or a family friend&rsquo;s child they game with, need to hear that their real relationships are not what this is about." },

  { at:"after", kind:"tell", scene:"risks", safe:true, stamp:"spotted", id:"safe", cards:RISKS, eyebrow:"Look what you did",
    title:"You spotted<br>all three.",
    say:"&ldquo;Remember these three from the start? Look at them now.&rdquo; Go along them. &ldquo;He asked for a photo, and you did not send one. He tried to work out where you were, and you did not tell him. And he asked you to keep it secret, and <b>that</b> is the one that told you everything. A friend who needs hiding from your grown-ups is not a friend.&rdquo;",
    hear:[
      ["&ldquo;The secret one is the worst.&rdquo;", "&ldquo;It is the biggest warning sign there is. If you only remember one thing from today, remember that one.&rdquo;"],
    ],
    warn:"Same three cards, same order as before the break. Point at them rather than explaining them again, and let the class notice what has changed." },

  { at:"after", kind:"ask", scene:"solo", art:ART.brain, eyebrow:"What would you do?",
    title:"It feels wrong<br>and you cannot say why.",
    say:"&ldquo;Last one. You are chatting to somebody and your tummy goes a bit funny. Nothing obviously bad has happened. You cannot explain it. What do you do?&rdquo;",
    hear:[
      ["&ldquo;Stop and tell someone.&rdquo;", "&ldquo;Exactly that. <b>Feel it. Stop. Tell.</b> In that order, every time.&rdquo;"],
      ["&ldquo;But what if I am wrong?&rdquo;", "&ldquo;Then you are wrong, and absolutely nothing bad happens. You never need a reason you can put into words. The feeling is enough.&rdquo;"],
      ["&ldquo;What if I already did something?&rdquo;", "See the warning below. Answer this one properly, out loud, before you move on."],
    ],
    warn:"<b>This is the most important thing you will say all lesson, and the game does not say it for you.</b> Week 3 never tells a child it was not their fault: that line is held back for week 11. So say it here, in your own words, to the whole room. Something like: <em>if you have already sent a photo, or told somebody where you go to school, you are not in trouble and it is never too late to tell a grown-up.</em> Say it even if nobody asks. The child who needs it will not be the one with their hand up." },

  { at:"after", kind:"tell", scene:"tonight", art:ART.team, eyebrow:"Tonight",
    title:"Name one grown-up.",
    under:"Somebody you would actually go to.",
    say:"&ldquo;One job tonight. Think of <b>one grown-up</b> you would go to if something online made you feel funny. Not a list, one. A parent, a carer, an auntie, a grandparent, a teacher. And here is the important bit: <b>tell them</b> that they are the one. Say &lsquo;you are who I would come to&rsquo;. Then it is already arranged, before you ever need it.&rdquo;",
    hear:[
      ["&ldquo;Can it be you?&rdquo;", "&ldquo;It can. Anybody in this school can be on your list, and I am happy to be on it.&rdquo; Mean it, and remember who asked."],
      ["&ldquo;What if I cannot think of anyone?&rdquo;", "&ldquo;Then come and see me at the end and we will sort one out together.&rdquo; Follow that up the same day, without fail."],
    ],
    warn:"<b>If a child cannot name anybody at home, do not let it pass.</b> Note it and follow it up quietly today, through your usual safeguarding route. Naming a grown-up is the point of the whole week, and a child who cannot do it has just told you something important without meaning to." },
];

export const WEEK_3: Pack = {
  n: 3,
  title: "Friend or Foe?",
  sub: "Stranger Danger",
  five: FIVE,
  slides: SLIDES,
  games: "The Mask Peek, The Clue Stamper, Red-Flag Requests, The Meet-Up Maze, The Uh-Oh Chat, The Case Board",
  brief: {
    head: "Read this before you teach it",
    body: [
      "<b>This week teaches children that &ldquo;do not tell your parents&rdquo; is the biggest warning sign there is.</b> A child who is currently being asked to keep something secret may recognise themselves in it, and may tell you. That is the lesson working, not the lesson going wrong.",
      "<b>Listen.</b> Do not investigate, and never ask a child to describe what happened in front of the class.",
      "<b>Never promise to keep it secret.</b> Say: &ldquo;I am really glad you told me. I need to tell somebody who can help.&rdquo;",
      "<b>The game never says &ldquo;it was not your fault&rdquo;. You have to.</b> That reassurance is held back until week 11, eight weeks away. A child who has already sent a photo or given away their school needs to hear today, out loud, that they are not in trouble and that it is never too late to tell. It is written into the last question slide so you do not forget.",
      "<b>Write down what they said in their own words</b> as soon as you can, and pass it to your designated safeguarding lead <b>the same day</b>.",
      "Your own setting&rsquo;s safeguarding policy overrides anything on these slides.",
    ],
  },
};
