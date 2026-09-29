/**
 * Cyber Heroes, week 20: the teacher pack.
 *
 * Moved verbatim from the reviewed prototype. The copy in here has been
 * through the owner and IS the product: change it deliberately, not in
 * passing. See ./types.ts for what each field is for, and note that several
 * of them carry authored HTML on purpose.
 */
import { ART } from "./art";
import type { Concept, Pack, Slide } from "./types";

const FIVE: readonly Concept[] = [
  { art:ART.key,       name:"Vault Holder",     line:"The fake door refused." },
  { art:ART.mask,      name:"Disguise Piercer", line:"Seen through in seconds." },
  { art:ART.trap,      name:"Trap Snapper",     line:"Free coins, ignored." },
  { art:ART.magnifier, name:"Leak Sealer",      line:"Clues scrubbed, pins off." },
  { art:ART.medal,     name:"Protocol Captain", line:"Stop, screenshot, block, tell." },
];

const SLIDES: readonly Slide[] = [
  { at:"before", kind:"tell", scene:"grad", eyebrow:"Week 20",
    title:"Twenty weeks.<br>Last one.",
    say:"&ldquo;Okay everyone. Week twenty. This is the last one. Twenty weeks ago most of you had never thought about what a password was worth, and today you are finishing a course that <b>most grown-ups have never done</b>.&rdquo;",
    warn:"Say the last bit and mean it. This is a graduation, not another lesson, and they should leave the room feeling like they finished something." },

  { at:"before", kind:"ask", eyebrow:"Ask the class",
    title:"What do you remember<br>from week one?",
    say:"&ldquo;Cast your mind all the way back. Week one. What was it about?&rdquo;",
    hear:[
      ["&ldquo;Passwords.&rdquo;", "&ldquo;Three random words. Has anybody actually still got theirs?&rdquo;"],
      ["&ldquo;The Raccoon.&rdquo;", "&ldquo;He has been after you for twenty weeks and he has not got in once.&rdquo;"],
      ["Somebody remembers one particular game", "Let them tell it. The remembering is the point, not the answer."],
    ],
    warn:"Ninety seconds, and let it be nostalgic. They are about to do a mission that uses everything, so making the distance visible first is what gives it weight." },

  { at:"before", kind:"tell", scene:"five", eyebrow:"What you collected",
    title:"Five powers.",
    say:"&ldquo;Everything from twenty weeks comes down to these five.&rdquo; Read them off the board.",
    warn:"None of this is new. Read them as a list of things they already own, not as a lesson: the tone is inventory, not instruction." },

  { at:"before", kind:"do", scene:"five", eyebrow:"Now it is your turn",
    title:"The final mission.",
    under:"We all come back together 10 minutes before the end.",
    say:"&ldquo;Right. This one is different. There is <b>nothing new to learn</b> today. The final mission throws everything from twenty weeks at you at once, and you already know all of it. Log on. We will come back together <b>10 minutes before the end</b>.&rdquo;",
    handover:true,
    warn:"<b>Do not pre-teach anything.</b> The entire point of the final mission is that they discover they already know it, and a reminder beforehand takes that away from them. Set an alarm for 10 minutes before the end." },

  { at:"after", kind:"ask", scene:"heroes", eyebrow:"Talk about it",
    title:"How did it go?",
    say:"&ldquo;Come and sit down. Tell me about the final mission. What did it throw at you?&rdquo;",
    hear:[
      ["&ldquo;It was hard.&rdquo;", "&ldquo;It was meant to be. Which bit nearly got you?&rdquo;"],
      ["&ldquo;I finished it.&rdquo;", "&ldquo;Twenty weeks ago you could not have done that.&rdquo;"],
      ["Somebody got caught by something", "&ldquo;Which one? And what would you do differently next time?&rdquo; No embarrassment: getting caught in a game is how you do not get caught for real."],
    ] },

  { at:"after", kind:"ask", scene:"five", eyebrow:"Talk about it",
    title:"Which one did<br>you use most?",
    say:"&ldquo;Look at the five. Which one did you reach for most today?&rdquo;",
    hear:[
      ["&ldquo;Spotting the fakes.&rdquo;", "&ldquo;That is the one you will use most in real life, too.&rdquo;"],
      ["&ldquo;All of them.&rdquo;", "&ldquo;That is the right answer, and that is why it was the final mission.&rdquo;"],
      ["They argue about it", "Let them. An argument about which power mattered most is twenty weeks of learning talking." ],
    ] },

  { at:"after", kind:"do", scene:"five", eyebrow:"Now you do it",
    title:"Teach me one.",
    say:"&ldquo;Pick one of the five. Stand up and teach it to the rest of us as if we had never heard of it. Thirty seconds.&rdquo;",
    warn:"Two or three children, no more. Teaching it is the strongest way there is to keep it, and this is the moment you will know whether five months stuck." },

  { at:"after", kind:"tell", scene:"solo", art:ART.trophy, eyebrow:"Look what you did",
    title:"You are certified<br>Cyber Heroes.",
    say:"&ldquo;Twenty weeks. Every power. You know more about staying safe online than most adults do, and you can prove it.&rdquo;",
    warn:"This is the payoff of five months, so do not hurry it. If your centre gives out certificates, this is the slide to hand them out on." },

  { at:"after", kind:"ask", scene:"heroes", eyebrow:"Talk about it",
    title:"Who are you<br>going to teach?",
    say:"&ldquo;Last question. Somebody at home does not know any of this. Who is it, and what are you going to tell them?&rdquo;",
    hear:[
      ["&ldquo;My mum.&rdquo; &ldquo;My dad.&rdquo;", "&ldquo;Brilliant. Which one of the five are you telling them?&rdquo;"],
      ["&ldquo;My little brother.&rdquo;", "&ldquo;He is lucky. He gets twenty weeks in one go.&rdquo;"],
      ["&ldquo;Nobody.&rdquo;", "&ldquo;Then you can teach me again next week.&rdquo; Keep it light."],
    ],
    warn:"This is also how a parent finds out what the centre taught their child, which is worth remembering when they ask you what the course was for." },

  { at:"after", kind:"tell", scene:"solo", art:ART.medal, eyebrow:"Tonight",
    title:"Teach one person<br>one thing.",
    say:"&ldquo;One job tonight. Teach one person at home one thing you learned. That is how you keep it, and that is how they get it too.&rdquo;" },
];

export const WEEK_20: Pack = {
  n: 20,
  title: "Graduation Day",
  sub: "The Final Mission",
  five: FIVE,
  slides: SLIDES,
  games: "the final mission, then the last showdown",
};
