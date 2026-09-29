/**
 * Cyber Heroes, week 1: the teacher pack.
 *
 * Moved verbatim from the reviewed prototype. The copy in here has been
 * through the owner and IS the product: change it deliberately, not in
 * passing. See ./types.ts for what each field is for, and note that several
 * of them carry authored HTML on purpose.
 */
import { ART } from "./art";
import type { Concept, Pack, Slide } from "./types";

const FIVE: readonly Concept[] = [
  { art:ART.key,     name:"Secret Key",      line:"It proves you are you." },
  { art:ART.muscle,  name:"Long Is Strong",  line:"Longer beats trickier." },
  { art:ART.symbols, name:"Mix It Up",       line:"Capitals, numbers, symbols." },
  { art:ART.zipper,  name:"Keep It Secret",  line:"Never share it. Ever." },
  { art:ART.noentry, name:"Nothing Obvious", line:"No names. No birthdays." },
];

const SLIDES: readonly Slide[] = [
  /* ───────── 10 MINUTES: TALKING IT THROUGH BEFORE THEY PLAY ───────── */
  { at:"before", kind:"tell", scene:"meet", eyebrow:"Week 1 &middot; Passwords",
    title:"Meet the team.",
    say:"&ldquo;Okay everyone, eyes up here. This week we are doing passwords. This is <b>Adam</b>, and this is <b>Layla</b>, and they are who you play as. And that one, with the cape, is the <b>Hacker Raccoon</b>. He is the one trying to get in.&rdquo;",
    warn:"Thirty seconds on this. They will meet all three properly in the game, so you are only putting the names in the room." },

  { at:"before", kind:"ask", scene:"racc", eyebrow:"Ask the class",
    title:"He is a cartoon.<br>Who is he really?",
    bubble:"I want your password.",
    say:"&ldquo;Now, he is obviously a cartoon. But he <b>stands for</b> somebody real. Who do you reckon that is?&rdquo;",
    hear:[
      ["&ldquo;Robbers.&rdquo; &ldquo;Baddies.&rdquo; &ldquo;Hackers.&rdquo;", "&ldquo;Hackers is the word. These ones do it on a computer instead of breaking a window.&rdquo; Write it up if you have a board."],
      ["&ldquo;My brother goes on my tablet.&rdquo;", "&ldquo;Good reason to keep it to yourself. But the ones we mean are people you have <b>never met</b>, who want to take your things.&rdquo;"],
      ["Nobody puts a hand up", "&ldquo;Has anyone been playing a game and somebody you did not know started talking to you?&rdquo; That always gets hands."],
    ],
    warn:"The line you are drawing is <em>stranger</em>: somebody you have never met who wants your things. A brother borrowing your tablet is annoying, but he is not a hacker, and it is worth saying so plainly." },

  { at:"before", kind:"ask", scene:"risks", id:"risks", eyebrow:"Talk about it",
    title:"So what could<br>he actually do?",
    say:"&ldquo;Let us think about what that really means. If he had your password sitting in front of him right now, what could he do?&rdquo; Take a few, then walk through the three on the board. &ldquo;He takes everything you saved up for. He talks to your friends as if he <b>is</b> you, and they believe him. And then he changes it, so you can never get back in. That account is gone.&rdquo;",
    hear:[
      ["&ldquo;Play my game.&rdquo;", "&ldquo;He would. And what would he do to it while he was in there?&rdquo;"],
      ["&ldquo;Steal my stuff.&rdquo;", "&ldquo;Everything you saved up for. Every skin, every coin.&rdquo;"],
      ["Somebody says it happened to them", "&ldquo;Tell me about it.&rdquo; A real story from the room does more than anything you say."],
    ],
    link:{ to:"safe", text:"You come back to these same three on slide %s, after they have played, and show them stopped." },
    warn:"This is the slide that makes them care, so do not rush it. Then stop: do not add frightening things nobody asked about. If a child looks worried, tell them that is exactly why they are learning this today, and that by the end they will know how to stop all three." },

  { at:"before", kind:"ask", scene:"scenarios", eyebrow:"Ask the class",
    title:"Has any of this<br>happened to you?",
    say:"&ldquo;Hands up if any of these has ever happened to you. Be honest, there is nothing wrong with any of it.&rdquo; Go along the three one at a time.",
    hear:[
      ["Lots of hands on the first one", "Very common in online games. &ldquo;What did you do?&rdquo; is a good follow-up."],
      ["&ldquo;Someone said they would give me free stuff.&rdquo;", "&ldquo;That is the oldest trick there is. Nobody gives you free things for a password.&rdquo;"],
      ["A child looks uncomfortable", "Move on and check in with them afterwards. Never press a child in front of the room."],
    ],
    warn:"This is the slide that makes it their life rather than a story about a cartoon. Keep it light and quick: hands up, a comment, move on." },

  /* the slide the owner asked for by name */
  { at:"before", kind:"do", scene:"five", eyebrow:"Now it is your turn",
    title:"Log on and<br>have a go.",
    under:"We all come back together 10 minutes before the end.",
    say:"&ldquo;Right. In a minute you are going to log on and play Week 1 yourselves, and you are going to learn <b>five things</b>.&rdquo; Read the five off the board. &ldquo;Sarah will talk you through every screen, so you can just get going. And we will all come back together <b>10 minutes before the end of the lesson</b> to talk about what you found out.&rdquo;",
    hear:[
      ["&ldquo;How long do we get?&rdquo;", "&ldquo;About three quarters of an hour. I will give you a shout before we stop.&rdquo;"],
      ["Somebody cannot log in", "Get them going before you sit down. A child stuck on the login learns nothing for forty-five minutes."],
    ],
    handover:true,
    warn:"<b>Read the five names off the board before they go.</b> Without the words, the game is just clicking; with them, every screen they meet has a name they have already heard you say. Then <b>watch the clock</b>: set an alarm for 10 minutes before the end, stop them wherever they have got to, and bring everyone back. The rest of this deck is that last 10 minutes." },

  /* ───────── 45 MINUTES ON THE COMPUTERS ───────── */

  /* ───────── 10 MINUTES: TALKING IT THROUGH AFTERWARDS ───────── */
  { at:"after", kind:"ask", scene:"racc", eyebrow:"Talk about it",
    title:"How did you get on?", bubble:"I nearly had you.",
    say:"&ldquo;Right, come and sit down. You have just spent three quarters of an hour with him. Tell me about it. What was the hardest bit? Did anything surprise you?&rdquo;",
    hear:[
      ["&ldquo;It was easy.&rdquo;", "&ldquo;Go on then, which bit was easiest? And why was it easy?&rdquo;"],
      ["&ldquo;The one with the clock.&rdquo;", "&ldquo;That one gets everybody. What happened when the password got longer?&rdquo;"],
      ["Nobody wants to start", "&ldquo;Hands up if the Raccoon got in at least once.&rdquo; Lots of hands, and it loosens the room."],
    ],
    warn:"Let them tell you. They have just been tested by the game, so nothing here needs a right answer: this is where you find out what actually stuck." },

  { at:"after", kind:"ask", scene:"tiles", clocks:true, eyebrow:"Talk about it",
    title:"Long beats clever.",
    say:"&ldquo;You saw this clock in the game. <b>Seconds</b> means his computer would guess it before I finish this sentence. <b>Centuries</b> means it would still be guessing in a hundred years. Same silly words, just ten more letters. And which one could you still remember on Monday?&rdquo;",
    hear:[
      ["&ldquo;The long one is easier to remember.&rdquo;", "&ldquo;Exactly. A banana, a cloud and a pirate is a picture in your head.&rdquo;"],
      ["Somebody still thinks the short one is stronger", "&ldquo;Look at the clock again.&rdquo; Do not correct it flat, let the board do it."],
      ["They want to count the letters", "Let them. Count all seventeen out loud together, it takes fifteen seconds."],
    ],
    warn:"If they leave today with one thing, make it this. And keep saying <em>remember</em>: a password nobody can remember is no use, because a child who forgets theirs gets locked out or writes it on a note by the screen." },

  { at:"after", kind:"do", scene:"recipe", id:"build", eyebrow:"Now you do it",
    title:"Let&rsquo;s build one<br>together.",
    say:"&ldquo;Give me a word. Any word at all. Now somebody give me another one. And one more. Stick them together. Right, who can make that even stronger?&rdquo; Then cover it up. &ldquo;Nobody look. Who can say the whole thing back to me?&rdquo;",
    hear:[
      ["Silly words", "Perfect. Silly is easier to remember AND just as hard to guess. That is the whole trick."],
      ["Most of them can say it back", "&ldquo;See that? You made a password he would need centuries for, and you already know it by heart.&rdquo;"],
      ["&ldquo;I can't remember it.&rdquo;", "&ldquo;Then it is the wrong password. Give me three easier words and we will try again.&rdquo;"],
    ],
    warn:"Build it on the board out loud, all together, then cover it and make them say it back. That ten seconds teaches what a rule cannot. Say clearly that this one is pretend and nobody will use it." },

  { at:"after", kind:"tell", scene:"risks", safe:true, id:"safe", eyebrow:"Look what you did",
    title:"You just stopped<br>all three.",
    link:{ to:"risks", text:"The same three you talked about on slide %s, before they played." },
    say:"&ldquo;Remember these from the start of the lesson? A long password nobody can guess stops every single one. Your things stay yours. Nobody gets to pretend to be you. And nobody locks you out. <b>That is what you have just learned to do.</b>&rdquo;",
    hear:[
      ["&ldquo;What if he still guesses it?&rdquo;", "&ldquo;With seventeen letters? He would be guessing for hundreds of years.&rdquo;"],
      ["&ldquo;So I am safe now?&rdquo;", "&ldquo;From this one, yes. There are other tricks, and that is what the next weeks are for.&rdquo;"],
      ["Quiet, pleased faces", "Let it land. This is the moment the hour was building to."],
    ],
    warn:"This is the payoff of the whole lesson. Do not hurry past it to get to the homework." },

  { at:"after", kind:"ask", scene:"solo", art:ART.zipper, eyebrow:"Talk about it",
    title:"Someone asks you<br>for yours.",
    say:"&ldquo;Last thing worth talking about. It is not a stranger this time. It is your best friend, and they are asking you nicely. What do you actually say back?&rdquo;",
    hear:[
      ["&ldquo;No.&rdquo;", "&ldquo;Good. But what are the actual words? Give me the whole sentence.&rdquo;"],
      ["&ldquo;I would tell them, they are my friend.&rdquo;", "Do not tell them off. &ldquo;I get that. But what if they said it out loud by accident?&rdquo;"],
      ["Nobody has a sentence", "Give them one to borrow: &ldquo;I can't, it's like my toothbrush.&rdquo; Get them to say it back."],
    ],
    warn:"If a child says they have already shared one, thank them for telling you and move on. This whole lesson only works if admitting that feels safe." },

  { at:"after", kind:"tell", scene:"tonight", eyebrow:"Tonight",
    title:"Change one password.",
    say:"&ldquo;One job tonight. Pick one password you now know is rubbish, and change it to three silly words. Say it to yourself three times, because it is no good to you if you cannot remember it on Monday. And tell somebody at home one thing you found out today.&rdquo;",
    hear:[
      ["&ldquo;What if I forget it?&rdquo;", "&ldquo;Ask a grown-up at home to help you get back in. That is always allowed.&rdquo;"],
      ["&ldquo;Can I write it down?&rdquo;", "&ldquo;Not on a note by the computer. A grown-up at home can keep it safe.&rdquo;"],
    ],
    warn:"Which account, never the password. And telling someone at home is the best way to make it stick, as well as how a parent finds out what the centre is teaching." },
];

export const WEEK_1: Pack = {
  n: 1,
  title: "Passwords",
  sub: "The Secret Code",
  five: FIVE,
  slides: SLIDES,
  games: "Passphrase Forge, Password Hospital, Weak Sorter, Sign Bingo, Memory Match, Choose Your Path",
};
