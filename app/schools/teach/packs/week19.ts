/**
 * Cyber Heroes, week 19: the teacher pack.
 *
 * Protecting family. The raccoon gives up on the child and turns the same
 * tricks on the grown-ups at home, and the roles flip: the child is the expert
 * now. The week is not about spotting tricks (that was week 4). It is about
 * HANDING that skill to somebody else without making them feel small.
 *
 * WHAT THE SOURCE MADE ME CHANGE, and why this week carries a briefing.
 *
 * 1. Every family in the game is Gran, Mum, Dad and a little brother, and
 *    every grown-up has a phone. Plenty of children in the room have one
 *    grown-up, or a carer, or nobody at home with a phone at all. The board
 *    says "a grown-up you know", and the take-home job needs no device.
 *
 * 2. "You're the expert now" is lovely for most children and heavy for some.
 *    A child who already translates for a parent, or does all the tech for an
 *    adult who cannot, is a young carer in all but name, and this week tells
 *    them the family's safety is theirs to hold. The pack says the other half
 *    out loud: keeping the family safe is the grown-ups' job, and if a trick
 *    gets through it is never the child's fault.
 *
 * 3. The fairness game calls two rules unfair: "Mum can read everybody's
 *    messages" and "children put devices away at eight, grown-ups keep theirs".
 *    Taken home as "my teacher says your rules are unfair", that is a phone
 *    call, and a parent checking a young child's messages is ordinary good
 *    parenting. The teacher gets the line that keeps the game's point (the
 *    grown-ups join in) without arming anybody against their own house.
 *
 * 4. Beat 5 asks a child to interrupt a grown-up. The game offers "say
 *    nothing" every round and never punishes it. Not every home is one where
 *    interrupting an adult is safe, so the pack keeps that exit open and tells
 *    the teacher what to notice.
 *
 * And no "has your family ever been scammed?" slide. That question asks a
 * child to report their family's money in front of the class. Beat 4 is about
 * the morning after a scam, so the teacher says once, to the room, that a
 * grown-up who got tricked is not silly.
 *
 * Mirrors app/lesson/weekContent/week19.ts. See ./types.ts for the fields.
 */
import { ART } from "./art";
import type { Card, Concept, Pack, Slide } from "./types";

const FIVE: readonly Concept[] = [
  { art:ART.gradcap, name:"The Explainer", line:"Words they can use without you." },
  { art:ART.magnifier, name:"Tell Spotter", line:"Point at it. Let them see it." },
  { art:ART.puzzle,  name:"Quilt Maker",   line:"Fair rules cover everybody." },
  { art:ART.brick,   name:"Wall Builder",  line:"Tell somebody. Never I told you so." },
  { art:ART.hand,    name:"Moment Freezer", line:"Short. Kind. Asked, not told." },
];

/* Three ways a child can be RIGHT and still lose the grown-up. Before the
   break they are the trap; after it, the same three, binned. Same array both
   times, so the mirror lands from the back of the room. */
const RISKS: readonly Card[] = [
  { art:ART.letters,   head:"Big clever words",  sub:"right, and nobody can use them" },
  { art:ART.megaphone, head:"A telling-off",     sub:"right, and now they feel silly" },
  { art:ART.speech,    head:"&ldquo;I told you so&rdquo;", sub:"right, and they never tell you again" },
];

const SLIDES: readonly Slide[] = [
  /* ───────── 10 MINUTES: TALKING IT THROUGH BEFORE THEY PLAY ───────── */
  { at:"before", kind:"tell", scene:"solo", art:ART.gradcap, eyebrow:"Week 19 &middot; Family Firewall",
    title:"You know more than<br>most grown-ups now.",
    say:"&ldquo;Eyes up. Something has happened over the last eighteen weeks. You now know more about online tricks than <b>most grown-ups</b>. That is just true.&rdquo; Let that land; some of them will grin. &ldquo;But here is the hard part. Knowing something and <b>explaining it</b> so somebody else can use it are two different skills. This week is the second one.&rdquo;",
    warn:"Say it warmly, and keep it about knowledge, not about grown-ups being silly. The whole week depends on children helping adults <b>without</b> making them feel small, and the tone you set here is the one they copy." },

  { at:"before", kind:"ask", scene:"racc", eyebrow:"Ask the class",
    title:"He has given up<br>on you.",
    bubble:"Same tricks. Bigger letters.",
    say:"&ldquo;He cannot trick you any more, so he has had a new idea.&rdquo; Read the bubble. &ldquo;He is sending the same tricks to the <b>grown-ups</b>. Why do you think grown-ups might fall for them?&rdquo;",
    hear:[
      ["&ldquo;Because they are old.&rdquo;", "&ldquo;Not really. Because <b>nobody ever taught them</b>. You have had eighteen weeks of this. Most grown-ups have had none.&rdquo;"],
      ["&ldquo;Because they are busy.&rdquo;", "&ldquo;Yes. A grown-up in a hurry is exactly who he wants. Remember the countdown in week 4?&rdquo;"],
      ["&ldquo;My nan fell for one.&rdquo;", "&ldquo;Loads of people do. These tricks are made by people who are very good at it.&rdquo; Keep it light and move on; do not ask what happened."],
    ],
    warn:"<b>Steer away from &ldquo;grown-ups are silly&rdquo;.</b> The honest reason is that nobody taught them, and that reason is what makes the child's job make sense: you teach them. Do not invite stories about family members who got caught." },

  { at:"before", kind:"ask", scene:"risks", id:"risks", cards:RISKS, eyebrow:"Talk about it",
    title:"Being right is<br>the easy half.",
    say:"&ldquo;Here is the strange thing about this week. You can be completely <b>right</b> and still make it worse.&rdquo; Walk the three. &ldquo;Use big clever words, and nobody can use them. Tell somebody off, and they feel silly. Say <b>I told you so</b>, and next time they do not show you at all.&rdquo; Then: &ldquo;Why does that last one matter so much?&rdquo;",
    hear:[
      ["&ldquo;Because they will hide it.&rdquo;", "&ldquo;Exactly. And then the next trick arrives with nobody to ask.&rdquo;"],
      ["&ldquo;But I was right!&rdquo;", "&ldquo;You were. And being right is not the prize this week. Them asking you again is the prize.&rdquo;"],
    ],
    link:{ to:"safe", text:"You come back to these same three on slide %s, after they have played, and show them binned." },
    warn:"This is the idea the whole week turns on, and children find it genuinely surprising, because school mostly rewards being right. In the first game <b>every answer is true</b>; only one of them helps. Tell them that now, or they will hunt for the &ldquo;correct&rdquo; one." },

  { at:"before", kind:"ask", scene:"heroes", eyebrow:"Ask the class",
    title:"Has a grown-up ever<br>asked you for help?",
    say:"&ldquo;Hands up if a grown-up you know has ever asked <b>you</b> to help with a phone, a tablet, the telly, anything with a screen.&rdquo; Lots of hands. &ldquo;What did they ask?&rdquo; Take two or three.",
    hear:[
      ["&ldquo;My nan cannot work her phone.&rdquo;", "&ldquo;So you are already her expert. This week is about doing it so she can manage on her own next time.&rdquo;"],
      ["&ldquo;I do everything on my mum&rsquo;s phone for her.&rdquo;", "&ldquo;That is really helpful of you.&rdquo; Then see below."],
      ["&ldquo;Nobody at mine has a phone.&rdquo;", "&ldquo;Then you are the expert for whoever does. A neighbour, a cousin, me. Everybody knows somebody.&rdquo;"],
    ],
    warn:"<b>Listen for the child who does all of it.</b> A child who translates for a parent, or runs a grown-up&rsquo;s phone because the grown-up cannot, is carrying more than most. This week tells them the family is theirs to protect. Later in the lesson you say the other half to the room: <em>keeping the family safe is the grown-ups&rsquo; job</em>. If a child&rsquo;s answer here worries you, follow your usual process. See the briefing." },

  { at:"before", kind:"do", scene:"five", eyebrow:"Now it is your turn",
    title:"Log on and<br>have a go.",
    under:"We all come back together 10 minutes before the end.",
    say:"&ldquo;Right. Week 19, and this time you are the expert. <b>Five things</b> to learn.&rdquo; Read the five off the board. &ldquo;One more thing: in the first game, every answer is true. You are looking for the one that would actually <b>help</b>. We come back together <b>10 minutes before the end</b>.&rdquo;",
    hear:[
      ["&ldquo;Is there a timer?&rdquo;", "&ldquo;One speed question has a clock on it. It is just for fun; it never runs out on you.&rdquo;"],
      ["Somebody cannot log in", "Get them going before you sit down. A child stuck on the login learns nothing for forty-five minutes."],
    ],
    handover:true,
    warn:"Two heads-ups. <b>Saying nothing is on offer in the last game</b>, every round, and it is never marked wrong: the game says &ldquo;that is what most people do&rdquo; and gives the sentence to try. Leave it that way. And one game is about <b>the morning after Dad typed his password into a fake page</b>, including ringing the bank. A child whose family has lost money that way may go quiet; you do not need to do anything except notice." },

  /* ───────── 45 MINUTES ON THE COMPUTERS ───────── */

  /* ───────── 10 MINUTES: TALKING IT THROUGH AFTERWARDS ───────── */
  { at:"after", kind:"ask", scene:"racc", eyebrow:"Talk about it",
    title:"How did you get on?",
    bubble:"Outsmarted by the kid!",
    say:"&ldquo;So, the whole house is closed for raccoon business. Which game was the hardest?&rdquo; Let them argue. &ldquo;And the quilt game: was anything in it a surprise?&rdquo;",
    hear:[
      ["&ldquo;All the answers were right, it was confusing!&rdquo;", "&ldquo;<b>That was the lesson.</b> Being right was never the question. Being useful was.&rdquo;"],
      ["&ldquo;It said Mum reading messages is unfair!&rdquo;", "&ldquo;In that game, the problem was Mum making a rule that everybody follows except her. A grown-up checking your tablet to keep you safe is different. That is their job.&rdquo;"],
      ["&ldquo;So my bedtime is unfair?&rdquo;", "&ldquo;Bedtimes are different because bodies are different. The game&rsquo;s point is smaller: rules about screens work best when grown-ups join in too.&rdquo;"],
    ],
    warn:"<b>Get ahead of the quilt game before they go home.</b> It marks &ldquo;Mum can read everybody&rsquo;s messages&rdquo; and &ldquo;children put devices away at eight, grown-ups keep theirs&rdquo; as unfair. The point is that a rule covering everybody lasts. Make sure nobody leaves thinking school has said their family&rsquo;s rules are wrong. Check your register too: the game&rsquo;s left-out child is called <b>Sam</b>." },

  { at:"after", kind:"ask", scene:"scenarios", eyebrow:"Ask the class",
    cards:[
      { art:ART.letters, sub:"&ldquo;It is a phishing campaign with a spoofed sender.&rdquo;" },
      { art:ART.bulb,    sub:"&ldquo;You cannot win something you never entered.&rdquo;" },
      { art:ART.megaphone, sub:"&ldquo;Honestly, Gran, everyone knows those are fake.&rdquo;" },
    ],
    title:"All three are true.<br>Which one helps?",
    say:"&ldquo;Gran shows you a text saying she has won a prize draw. Here are three things you could say back, and <b>all three are true</b>.&rdquo; Read them out. &ldquo;Which one could Gran use <b>tomorrow</b>, when you are at school and the next one arrives?&rdquo;",
    hear:[
      ["&ldquo;The middle one.&rdquo;", "&ldquo;Why? What does it give her?&rdquo; You want: a test she can do on her own."],
      ["&ldquo;The first one sounds clever.&rdquo;", "&ldquo;It is clever. Could Gran do anything with those words? That is the test.&rdquo;"],
      ["&ldquo;The last one is true though.&rdquo;", "&ldquo;Completely true. How would Gran feel? And would she show you the next one?&rdquo;"],
    ],
    warn:"The test to leave them with is <b>could they do it without me tomorrow?</b> It works on every explanation a child will ever give, including to a younger brother or sister." },

  { at:"after", kind:"do", scene:"recipe", eyebrow:"Do it together",
    title:"Six words.<br>Say it with me.",
    recipe:{ slots:["SHORT","ABOUT THE THING","ASK, DO NOT TELL"],
      test:"&ldquo;Wait. Can I look at that with you?&rdquo;" },
    say:"&ldquo;The hardest moment is when a grown-up is about to tap it <b>right now</b>. You get about two seconds. So you need a sentence ready.&rdquo; Point at the three slots. &ldquo;Short. About the thing, not about them. And a question, not an order. Say it with me: <b>Wait. Can I look at that with you?</b>&rdquo; Then play the grown-up: pretend to tap your phone, and let the class stop you. Twice.",
    hear:[
      ["&ldquo;What if they say no?&rdquo;", "&ldquo;Then you have done your bit. You can tell another grown-up later. You do not have to win.&rdquo;"],
      ["&ldquo;What if they get cross?&rdquo;", "&ldquo;Then you do not have to say it. Saying nothing is allowed, and you can tell somebody afterwards instead.&rdquo;"],
    ],
    warn:"Role-playing it is the point: a sentence a child has said out loud is one they can find in two seconds. Answer &ldquo;what if they get cross?&rdquo; exactly as above. <b>Not every home is one where a child can safely interrupt an adult</b>, and the game is built so that saying nothing is never failing. If a child&rsquo;s answer here worries you, note it and follow your safeguarding policy." },

  { at:"after", kind:"tell", scene:"risks", safe:true, stamp:"binned", id:"safe", cards:RISKS, eyebrow:"Look what you did",
    title:"All three traps.<br>Binned.",
    say:"&ldquo;Remember the three ways to be right and still make it worse? Look at them now.&rdquo; Go along the three. &ldquo;No big words. No telling-off. And not one <b>I told you so</b>, even when Dad typed his password in. That is a Family Firewall.&rdquo; Then, to the whole room, not to anybody in particular:",
    hear:[
      ["Somebody looks pleased", "Let them. They earned it."],
      ["Somebody looks thoughtful", "That is who the sentences below are for. Say them to the room."],
    ],
    warn:"<b>Say both of these out loud, whether or not anybody asks.</b> First: <em>if a grown-up you know has ever been tricked, that does not make them silly. These tricks are made by people who are very good at it.</em> Second: <em>keeping your family safe is the grown-ups&rsquo; job, not yours. You help. You are never the one to blame if something gets through.</em> The second one is for the child who already does all of it." },

  { at:"after", kind:"ask", scene:"solo", art:ART.brick, eyebrow:"What would you do?",
    title:"&ldquo;I think I just<br>got tricked.&rdquo;",
    say:"&ldquo;Last one. A grown-up you know says: I think I just typed my password into a fake page. What do you say, and what do you do?&rdquo;",
    hear:[
      ["&ldquo;I told you so!&rdquo;", "&ldquo;Tempting. And then next time, do they tell you?&rdquo; Let the room answer."],
      ["&ldquo;Change the password.&rdquo;", "&ldquo;Yes, fast. Who does that, you or the grown-up?&rdquo; The grown-up, with somebody beside them."],
      ["&ldquo;Tell somebody.&rdquo;", "&ldquo;First, and fast. Another grown-up who can help. And if money went anywhere, the grown-up rings the bank.&rdquo;"],
      ["&ldquo;Sit with them.&rdquo;", "&ldquo;Lovely. Nobody checks things properly on their own when they are embarrassed.&rdquo;"],
    ],
    warn:"Make sure the jobs land in the right hands. <b>The child&rsquo;s job is to be kind and make sure somebody who can help knows.</b> Changing passwords and ringing the bank are grown-up jobs. The game puts all of it on one wall, and a child should not leave thinking they have to fix a family&rsquo;s bank account." },

  { at:"after", kind:"tell", scene:"tonight", art:ART.team, eyebrow:"Tonight",
    title:"Take Gran&rsquo;s rule<br>home.",
    under:"Anybody can say they got tricked, and nobody laughs.",
    say:"&ldquo;One job tonight. In the quilt game, Gran made the best rule of all.&rdquo; Read it off the board. &ldquo;<b>Anybody can say they got tricked, and nobody laughs.</b> Tonight, tell a grown-up about that rule and ask if your house can have it. That is all. It works in every house, and it is the rule that makes all the others work.&rdquo;",
    hear:[
      ["&ldquo;What if they say we do not need it?&rdquo;", "&ldquo;Then you have still told them about it. That is the job done.&rdquo;"],
      ["&ldquo;Can I check everyone&rsquo;s settings?&rdquo;", "&ldquo;Only with a grown-up, on their phone, if they ask you to. Tonight&rsquo;s job is just the rule.&rdquo;"],
    ],
    warn:"This job is chosen because it needs <b>no device and no particular family</b>. One grown-up, a carer, a grandparent: it works for all of them. It also sends home the one thing the course most needs adults to hear: if a child tells you they got tricked, do not laugh. That is the rule that keeps children telling." },
];

export const WEEK_19: Pack = {
  n: 19,
  title: "Family Firewall",
  sub: "Protecting Family",
  five: FIVE,
  slides: SLIDES,
  games: "You&rsquo;re the Expert Now, The Kitchen Table, The Family Quilt, The Morning After Wall, Freeze the Moment, The Family Rescue Board",
  brief: {
    head: "Read this before you teach it",
    body: [
      "<b>This week asks children to help the grown-ups at home</b>, and not every child has the home the game draws. Gran, Mum, Dad and a little brother, each with a phone, is one family out of many. Say &ldquo;a grown-up you know&rdquo; and the week works for everybody.",
      "<b>Some children already do all of it.</b> A child who translates for a parent, or runs a grown-up&rsquo;s phone because they cannot, is carrying more than most, and this week tells them the family&rsquo;s safety is theirs. Say the other half out loud: <em>keeping the family safe is the grown-ups&rsquo; job, and if a trick gets through it is never your fault.</em> The script tells you where.",
      "<b>One game asks a child to interrupt a grown-up.</b> Saying nothing is offered every round and is never marked wrong. Keep it that way in the talk: not every home is one where a child can safely stop an adult. If what a child says about home worries you, follow your safeguarding policy.",
      "<b>The quilt game calls two rules unfair:</b> &ldquo;Mum can read everybody&rsquo;s messages&rdquo; and &ldquo;children put devices away at eight, grown-ups keep theirs&rdquo;. The point is that a rule covering everybody lasts. Do not let a child go home saying school called their family&rsquo;s rules unfair; a parent checking a young child&rsquo;s messages is ordinary, good parenting. The debrief has the line.",
      "<b>One game is the morning after a scam</b>, including ringing the bank. A child whose family has lost money may go quiet. Do not ask the class whether it has happened at home.",
      "Your own setting&rsquo;s safeguarding policy overrides anything on these slides.",
    ],
  },
};
