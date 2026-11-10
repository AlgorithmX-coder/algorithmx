/**
 * Cyber Heroes, week 7: the teacher pack.
 *
 * In-game spending. The Loot Shop, and the week where game coins turn back
 * into real money in front of the child's eyes. It is also the home of every
 * "free currency" scam in the course (see the lanes in
 * docs/cyberheroes/curriculum-buildsheet.md), so it reinforces week 4's "a
 * real message wants nothing back" without re-teaching it.
 *
 * THREE THINGS THE SOURCE MADE ME CHANGE, all about money landing on a child
 * or on a family.
 *
 * 1. No "have you ever bought something in a game?" slide. A hand going up
 *    makes that child the one who spent a parent's money, sometimes a lot of
 *    it, sometimes the subject of a row at home. The relatable slide sorts
 *    real rewards from strings instead, which also keeps the week from
 *    teaching that everything in a game shop is evil (two of the three are
 *    real, as they are in Free-Coin Strings).
 *
 * 2. The source says coins are bought with "money someone in your family
 *    worked for". True, and in a room where some families are counting every
 *    pound it can land as a comment on them. The teacher keeps it to "real
 *    money" and is told never to ask what anybody's family spends.
 *
 * 3. A child in the room has almost certainly bought something without
 *    asking. The week never says what to do if you already have. The pack
 *    gives the teacher one sentence for the room (you are not in trouble,
 *    tell the grown-up whose money it is, the sooner the better), the same
 *    move week 4 makes for a child who has already clicked.
 *
 * AND TWO GAMES A TEACHER MUST UNDERSTAND BEFORE THEY WATCH. The Odds Jar
 * never pays out: every child spends the coins and gets grey marbles, because
 * that is the lesson. And The Coin Counter has an "I CAN'T AFFORD IT" button
 * that is a right answer, praised as a smart stop.
 *
 * Mirrors app/lesson/weekContent/week7.ts. See ./types.ts for the fields.
 */
import { ART } from "./art";
import type { Card, Concept, Pack, Slide } from "./types";

const FIVE: readonly Concept[] = [
  { art:ART.diamond,   name:"Real-Money Eyes", line:"Game coins are real money." },
  { art:ART.dice,      name:"Odds Seer",       line:"Boxes have no memory." },
  { art:ART.stopwatch, name:"Clock Freezer",   line:"Fair offers can wait." },
  { art:ART.team,      name:"Ask-First Rule",  line:"Not your money, not your call." },
  { art:ART.trap,      name:"Free-Coin Radar", line:"Free game money does not exist." },
];

/* The three shop tricks, before the break and again after it with a stamp on
   each. Same array both times: identical layout is what makes the mirror land
   from the back of the room. */
const RISKS: readonly Card[] = [
  { art:ART.dice,      head:"A mystery box",              sub:"you pay first, and find out what you got after" },
  { art:ART.stopwatch, head:"Gone forever in 3 minutes!", sub:"a countdown, and &ldquo;everyone has one&rdquo;" },
  { art:ART.gift,      head:"FREE 10,000 Gem Bucks!",     sub:"just log in here to claim" },
];

const SLIDES: readonly Slide[] = [
  /* ───────── 10 MINUTES: TALKING IT THROUGH BEFORE THEY PLAY ───────── */
  { at:"before", kind:"tell", scene:"solo", art:ART.diamond, eyebrow:"Week 7 &middot; The Gem Bucks Trap",
    title:"Game coins are<br>real money.",
    say:"&ldquo;Eyes up. Gem Bucks, Robo Coins, Blast Coins. Games give their money fun names and bright colours, so it <b>feels</b> like play money. Here is the secret.&rdquo; Slow down. &ldquo;Every coin pack is bought with <b>real money</b>, from a real grown-up&rsquo;s card. The gems are just wearing a costume. This week, we take the costume off.&rdquo;",
    warn:"The game says the coins are paid for with &ldquo;money someone in your family worked for&rdquo;. True, but keep it to <b>real money</b> in your own words, and <b>never ask what anybody&rsquo;s family spends</b> or whether they can afford things. Some families in the room are counting every pound, and this week is about tricks, not about who has money." },

  { at:"before", kind:"ask", scene:"racc", eyebrow:"Ask the class",
    title:"So what does it<br>want back?",
    bubble:"FREE 10,000 GEM BUCKS! Just log in HERE!",
    say:"&ldquo;Look what popped up in the game.&rdquo; Read the bubble far too excitedly. &ldquo;Ten thousand free coins! Remember week 4? A real message wants nothing back. So what does this one want <b>back</b>?&rdquo;",
    hear:[
      ["&ldquo;Your password.&rdquo;", "&ldquo;That is the whole trick. &lsquo;Log in here&rsquo; is the string, and your account is what is on the end of it.&rdquo;"],
      ["&ldquo;Nothing, it is free.&rdquo;", "&ldquo;Coins cost the game company real money, so nobody gives ten thousand of them away. <b>Free game money does not exist.</b>&rdquo;"],
      ["&ldquo;My friend got free coins from a website.&rdquo;", "&ldquo;Then it is worth your friend checking their account is still theirs. That is usually what those pages take.&rdquo;"],
    ],
    warn:"Week 4 owns spotting the trick, so this is a reminder, not a re-teach. &ldquo;What does it want back?&rdquo; is the same question they already know, pointed at a coin shop." },

  { at:"before", kind:"ask", scene:"risks", id:"risks", cards:RISKS, eyebrow:"Talk about it",
    title:"Three shop tricks.<br>That is all.",
    say:"&ldquo;The shop has three tricks, and once you know them you see them everywhere.&rdquo; Walk the three. &ldquo;A <b>mystery box</b>: you pay first and find out after. A <b>countdown</b> that says gone forever. And <b>free coins</b> that want your login.&rdquo; Then the important one. &ldquo;If your heart is racing at the shop, that is the trick working. <b>Freeze the clock</b>, and read the real price.&rdquo;",
    hear:[
      ["&ldquo;What is a loot box?&rdquo;", "&ldquo;A mystery box you pay for. You might get the thing you want, you probably will not, and that is built in on purpose.&rdquo;"],
      ["&ldquo;But the countdown is real.&rdquo;", "&ldquo;&lsquo;Gone forever&rsquo; things come back all the time. And a deal that cannot wait five minutes for a grown-up was never a real deal.&rdquo;"],
    ],
    link:{ to:"safe", text:"You come back to these same three on slide %s, after they have played, and show them closed." },
    warn:"Spend a moment on the mystery box. Children (and plenty of adults) believe that after lots of losses a win is <em>due</em>. It is not, and the game shows it with a jar of marbles. You do it together on the board after the break." },

  { at:"before", kind:"ask", scene:"scenarios", eyebrow:"Ask the class",
    cards:[
      { art:ART.gamepad, sub:"&ldquo;Daily reward: 50 coins for logging in&rdquo;, inside the game" },
      { art:ART.trap,    sub:"&ldquo;Coin DOUBLER! Install this and watch your coins grow!&rdquo;" },
      { art:ART.trophy,  sub:"&ldquo;Level 10 bonus: 100 coins&rdquo;, from the game itself" },
    ],
    title:"Real reward,<br>or a string?",
    say:"&ldquo;Three offers. Some coins really are free. Which of these are real, and which one has a string on it?&rdquo; Go along the three and take votes.",
    hear:[
      ["&ldquo;They are all scams!&rdquo;", "&ldquo;Careful. Two of these are real. They live <b>inside</b> the game, you earned them by playing, and they ask for nothing. That is what a real reward feels like.&rdquo;"],
      ["&ldquo;The doubler!&rdquo;", "&ldquo;Yes. Nothing outside the game can double game coins. &lsquo;Install this&rsquo; is the string, and the tap is how the thief gets in.&rdquo;"],
    ],
    warn:"<b>Deliberately not &ldquo;have you ever bought something in a game?&rdquo;</b> A hand going up makes that child the one who spent a grown-up&rsquo;s money, sometimes a lot of it, sometimes the cause of a row at home. Sorting offers gets the same thinking with nobody exposed. And do not let it become &ldquo;everything in a shop is a scam&rdquo;: real rewards exist, and the game is careful to say so." },

  { at:"before", kind:"do", scene:"five", eyebrow:"Now it is your turn",
    title:"Log on and<br>have a go.",
    under:"We all come back together 10 minutes before the end.",
    say:"&ldquo;Right. Week 7 is the Loot Shop, and you are the shop guards. <b>Five things</b> to learn.&rdquo; Read the five off the board. &ldquo;Nobody spends any real money today, I promise. We come back together <b>10 minutes before the end</b>.&rdquo;",
    hear:[
      ["&ldquo;Do we get real coins?&rdquo;", "&ldquo;No real coins, no real shop. Which is exactly why it is a good place to fall for a trick.&rdquo;"],
      ["Somebody cannot log in", "Get them going before you sit down. A child stuck on the login learns nothing for forty-five minutes."],
    ],
    handover:true,
    warn:"Two games to know before you watch. <b>The Odds Jar never pays out.</b> Every child spends the coins and gets grey marbles, every time, because that is the lesson; it is not bad luck and nobody is doing it wrong. And in <b>The Coin Counter</b> the &ldquo;I can&rsquo;t afford it&rdquo; button is a right answer, praised as a smart stop. One quick check has a moving bar in the week about not being rushed: the bar is for show and never runs out on them." },

  /* ───────── 45 MINUTES ON THE COMPUTERS ───────── */

  /* ───────── 10 MINUTES: TALKING IT THROUGH AFTERWARDS ───────── */
  { at:"after", kind:"ask", scene:"racc", eyebrow:"Talk about it",
    title:"How did you get on?",
    bubble:"Who reset my forever clock?!",
    say:"&ldquo;So, is his shop still open?&rdquo; Enjoy the answer. &ldquo;And be honest: <b>did anybody get the gold marble?</b>&rdquo;",
    hear:[
      ["&ldquo;I never got it!&rdquo;", "&ldquo;<b>Nobody did.</b> That is the point of that game. A real loot box is built the same way, and the only thing that goes up is the money spent.&rdquo;"],
      ["&ldquo;I said I can&rsquo;t afford it.&rdquo;", "&ldquo;That was a right answer. Walking away is always allowed.&rdquo;"],
      ["&ldquo;The lever was the best bit.&rdquo;", "&ldquo;Because the receipt never lies, and the countdown always does.&rdquo;"],
    ],
    warn:"<b>Say the &ldquo;nobody did&rdquo; line out loud even if nobody asks.</b> Some children will think they were unlucky or bad at the jar. It was a demonstration, and it is the most important thing they did today." },

  { at:"after", kind:"ask", scene:"solo", art:ART.dice, eyebrow:"The marble jar",
    title:"Box ten has the same<br>chance as box one.",
    say:"&ldquo;Picture a jar with a hundred marbles in it. Ninety-nine grey, <b>one</b> gold. You take one out, it is grey, and you put it back.&rdquo; Do it with your hand in an imaginary jar. &ldquo;Again. Grey. Back in. Nine times. Hands up if the <b>tenth</b> one has to be gold.&rdquo; Count the hands. &ldquo;Did the jar change? <b>Not one marble.</b> Boxes have no memory. The tenth go has exactly the same tiny chance as the first.&rdquo;",
    hear:[
      ["&ldquo;But you were so close!&rdquo;", "&ldquo;Close is a feeling the box is built to give you. A grey marble is a grey marble.&rdquo;"],
      ["&ldquo;So you might win on the first go.&rdquo;", "&ldquo;You might. And you might open a hundred and still not. That is why it is a gamble, and why it is built that way on purpose.&rdquo;"],
    ],
    warn:"Expect lots of hands for &ldquo;the tenth has to be gold&rdquo;. That is not a slow class, it is how human brains work, and it is exactly the feeling loot boxes are built to use. Keep it calm and mechanical: the jar, not &ldquo;gambling is wicked&rdquo;." },

  { at:"after", kind:"do", scene:"recipe", eyebrow:"Say it with me",
    title:"Before any buy.",
    recipe:{ slots:["PAUSE","ASK","WAIT FOR A YES"],
      test:"Saved does not mean allowed. One yes covers one buy." },
    say:"&ldquo;Here is the golden wallet rule. It is not your money, so it is not your call alone. Say it with me.&rdquo; Do it twice. &ldquo;<b>PAUSE</b> the game. <b>ASK</b> the grown-up whose money it is. <b>WAIT FOR A YES.</b>&rdquo; Then the two sneaky ones. &ldquo;A card that is already saved does <b>not</b> mean you are allowed. And a yes for one thing is not a yes for the next thing.&rdquo;",
    hear:[
      ["&ldquo;Even tiny ones?&rdquo;", "&ldquo;Even tiny ones. Tiny ones add up in secret until somebody gets a shock.&rdquo;"],
      ["&ldquo;What if it is my own birthday money?&rdquo;", "&ldquo;Ask anyway. It is still real money, and a grown-up spots shop tricks you might not.&rdquo;"],
      ["&ldquo;What if they say no?&rdquo;", "&ldquo;Then it is no, and the shop stays fun. And if they say yes, buying is completely fine. That is the point of asking.&rdquo;"],
    ],
    warn:"Make sure &ldquo;and if they say yes, buying is fine&rdquo; is heard. The week is careful not to make buying itself the crime; the crime is buying without the person whose money it is getting a say. The saved card is the trap most families do not know they have set." },

  { at:"after", kind:"tell", scene:"risks", safe:true, stamp:"closed", id:"safe", cards:RISKS, eyebrow:"Look what you did",
    title:"Three tricks.<br>Shop closed.",
    say:"&ldquo;Remember his three shop tricks from the start? Look at them now.&rdquo; Go along the three. &ldquo;You saw the odds in the jar. You froze the clock. And you followed the string on the free coins. <b>His shop is out of business.</b>&rdquo; Then, to the whole room, not to anybody in particular:",
    hear:[
      ["Somebody looks pleased", "Let them. They earned it."],
      ["Somebody looks worried", "That is who the sentence below is for. Say it to the room, not to them."],
    ],
    warn:"<b>Say this out loud, whether or not anybody asks.</b> Something like: <em>if you have ever bought something in a game without asking, or typed your password into a free coins page, you are not in trouble with me. Tell the grown-up whose money it is, and the sooner they know, the more they can sort out.</em> Somebody in this room has done it, and is sitting through a whole lesson about why it was wrong. One sentence from you is enough." },

  { at:"after", kind:"ask", scene:"solo", art:ART.team, eyebrow:"What would you do?",
    title:"Your friend says<br>&lsquo;just tap YES&rsquo;.",
    say:"&ldquo;Last one. You are at a friend&rsquo;s house, playing their game. A golden blaster pops up, and your friend says: &lsquo;Just tap yes, my mum&rsquo;s card is saved, she won&rsquo;t mind.&rsquo; What do you do?&rdquo;",
    hear:[
      ["&ldquo;Tap it, she won&rsquo;t mind.&rdquo;", "&ldquo;Then she won&rsquo;t mind being asked. Asking takes one minute.&rdquo;"],
      ["&ldquo;Ask the mum.&rdquo;", "&ldquo;Perfect. Her money, her call. And it is not even your family, so it is doubly not your call.&rdquo;"],
      ["&ldquo;My friend would say I am a baby.&rdquo;", "&ldquo;Asking is not babyish. It is what grown-ups do with money all the time. &lsquo;Nope, I ask first, every time&rsquo; is the coolest thing in that room.&rdquo;"],
    ],
    warn:"This is the transfer: the pressure comes from a friend, not a shop, and it is someone else&rsquo;s family&rsquo;s money. Give them the exact words to say, because a child under pressure does not have time to make up a sentence." },

  { at:"after", kind:"tell", scene:"tonight", art:ART.diamond, eyebrow:"Tonight",
    title:"Count it out<br>with a grown-up.",
    under:"What does a coin pack really cost?",
    say:"&ldquo;One job tonight. Sit with a grown-up and find a coin shop in a game you play. Work out together what the biggest pack costs in <b>real money</b>. Then ask them one question: does our game ask a grown-up to say yes <b>before</b> anybody can buy?&rdquo;",
    hear:[
      ["&ldquo;We do not have games with shops.&rdquo;", "&ldquo;Then teach a grown-up the marble jar. I promise most of them have never thought about it.&rdquo;"],
      ["&ldquo;What if it does not ask first?&rdquo;", "&ldquo;Then you have found something useful. Most games can be set to ask, and a grown-up can switch it on.&rdquo;"],
    ],
    warn:"The second question is the one that does the most good. Most families have never switched on ask-before-buying, and a child asking about it is often the first time it comes up. If your centre sends a note home, this is the line to put in it." },
];

export const WEEK_7: Pack = {
  n: 7,
  title: "The Gem Bucks Trap",
  sub: "In-Game Spending",
  five: FIVE,
  slides: SLIDES,
  games: "The Coin Counter, The Odds Jar, The True-Price Lever, The Buy Button, Free-Coin Strings, The Till Match",
};
