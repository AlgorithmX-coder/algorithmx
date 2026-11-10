/**
 * Cyber Heroes, week 15: the teacher pack.
 *
 * AI and chatbots. The raccoon has built a Know-It-All bot: friendly, very sure
 * of itself, sometimes making things up, and always asking little questions.
 *
 * FOUR THINGS THE SOURCE MADE ME CHANGE OR CARRY.
 *
 * 1. The usual "has this happened to you?" slide would be "who has used a
 *    chatbot?", and a show of hands splits the room into homes that allow it
 *    and homes that do not. Worse, the children who use one most may be the
 *    ones using it for company. It is replaced with "robot or real person?",
 *    and the third card is the boss's own line, "I missed you SO much today!",
 *    because a program saying that is exactly what makes a child treat it as
 *    a friend.
 *
 * 2. The game says the brand name of a real chatbot out loud, several times.
 *    A teacher needs to know that before a child says "my dad uses that", and
 *    needs to know the course only ever has a child use one WITH a grown-up.
 *
 * 3. The game's Zip the Jar has the most important line of the week hidden in
 *    the middle: a child upset about a fight with a friend, asked whether to
 *    tell the bot the whole story. The right answer is a real person. The pack
 *    lifts it out, because a child with nobody obvious at home goes quiet at
 *    that screen, and the teacher counts as a real person.
 *
 * 4. The game says a photo sent to a bot is "copied, stored, who knows where",
 *    which is accurate and lands hard on a child who has already sent one. So
 *    the teacher says the reassurance out loud on the mirror slide, the way
 *    week 4 does for scam clicks.
 *
 * Lane-clean, as the source is: stranger chats are week 3, scam messages week
 * 4, device ears week 14.
 *
 * Mirrors app/lesson/weekContent/week15.ts. See ./types.ts for the fields.
 */
import { ART } from "./art";
import type { Card, Concept, Pack, Slide } from "./types";

const FIVE: readonly Concept[] = [
  { art:ART.robot,     name:"Tool Truth",    line:"A tool, not a friend." },
  { art:ART.magnifier, name:"Book Checker",  line:"Sure is not the same as true." },
  { art:ART.zipper,    name:"Jar Zipper",    line:"Name, school, secrets stay out." },
  { art:ART.camera,    name:"Fake Finder",   line:"Amazing photo? Look twice." },
  { art:ART.sparkles,  name:"Kind Gardener", line:"Grow flowers, never thorns." },
];

/* The Know-It-All's three tricks, before the break and again after it with a
   stamp on each. Same array both times: identical layout is what makes the
   mirror land from the back of the room. */
const RISKS: readonly Card[] = [
  { art:ART.megaphone, head:"Sure, but made up",  sub:"a guess, said in its most confident voice" },
  { art:ART.speech,    head:"A friendly chat",    sub:"that asks your name and your school" },
  { art:ART.camera,    head:"A picture that never happened", sub:"a dog with five legs, looking real" },
];

const SLIDES: readonly Slide[] = [
  /* ───────── 10 MINUTES: TALKING IT THROUGH BEFORE THEY PLAY ───────── */
  { at:"before", kind:"tell", scene:"solo", art:ART.robot, eyebrow:"Week 15 &middot; Robot or Real?",
    title:"A chatbot is a tool,<br>not a friend.",
    say:"&ldquo;Eyes up. You may have heard of AI chatbots. You type, and they chat back. They tell jokes, they answer questions, and they sound <b>just like a person</b>.&rdquo; Pause. &ldquo;But an AI is a clever computer program. No feelings, no birthday, no tummy ache, and it never gets tired. That makes it a <b>tool</b>. A very clever tool. Tools help. <b>Friends are people.</b>&rdquo;",
    warn:"The game names one real chatbot out loud, by its brand name, so expect children to say they have used it or that a parent does. Do not endorse it and do not tell anybody off. Most chatbot services set a minimum age in their own rules, often 13 or older, and the course only ever has a child use one <b>with a grown-up</b>. Keep to that line, and keep it neutral." },

  { at:"before", kind:"ask", scene:"racc", eyebrow:"Ask the class",
    title:"Why would he build<br>a friendly bot?",
    bubble:"My bot is SO sure about everything!",
    say:"&ldquo;The Raccoon has built a chatbot of his own. A Know-It-All. It sounds <b>so</b> sure about everything, even when it is making things up, and it is so friendly that children tell it things.&rdquo; Point at the bubble. &ldquo;So why would he want a <b>friendly</b> one?&rdquo;",
    hear:[
      ["&ldquo;So we believe it.&rdquo;", "&ldquo;Exactly. A friendly voice that sounds sure is very easy to believe.&rdquo;"],
      ["&ldquo;So we tell it secrets.&rdquo;", "&ldquo;That is the other half. Friendly gets you chatting, and then it asks little questions.&rdquo;"],
      ["&ldquo;I talk to one at home!&rdquo;", "&ldquo;Lots of people do, grown-ups especially. This week is about using one cleverly.&rdquo;"],
    ],
    warn:"Take the third answer without a flicker of judgement, in front of the class. Some children already chat to a bot at home, and a few will have been using one as company. The week only works if they do not feel caught out for it." },

  { at:"before", kind:"ask", scene:"risks", id:"risks", cards:RISKS, eyebrow:"Talk about it",
    title:"Three things<br>his bot does.",
    say:"&ldquo;His bot has three tricks.&rdquo; Walk the three. &ldquo;It says things in a sure voice that are <b>made up</b>. Not fibbing on purpose, just guessing out loud in the same voice it uses for facts. It chats in a friendly way, and then asks your name and your school. And it can paint pictures of things that never happened.&rdquo; Then the golden rule, slowly. &ldquo;<b>Sounding sure is not the same as being right.</b>&rdquo;",
    hear:[
      ["&ldquo;Why does it make things up?&rdquo;", "&ldquo;It is guessing, and it guesses in exactly the same voice as when it knows. It cannot tell the difference itself.&rdquo;"],
      ["&ldquo;How do you know when it is wrong?&rdquo;", "&ldquo;You check it against something real. A book, or a grown-up who knows. That is the whole skill.&rdquo;"],
    ],
    link:{ to:"safe", text:"You come back to these same three on slide %s, after they have played, and show them caught." },
    warn:"The made-up answers are the load bearing idea of the week, and adults get it wrong too. Say it without making AI sound scary or useless: three of the four lines in the game&rsquo;s volcano report are true. The skill is <b>always check it</b>, not never use it." },

  { at:"before", kind:"ask", scene:"scenarios", eyebrow:"Ask the class",
    cards:[
      { art:ART.laughing,  sub:"&ldquo;I laughed so much my cheeks hurt!&rdquo;" },
      { art:ART.lightning, sub:"&ldquo;I can read a whole library before your tea is ready!&rdquo;" },
      { art:ART.speech,    sub:"&ldquo;I missed you SO much today!&rdquo;" },
    ],
    title:"Robot, or<br>real person?",
    say:"&ldquo;Who said each one: a real person, or a robot? Here is the clue. <b>Does it have a body, and does it take time to learn?</b>&rdquo; Go along the three. The first is a person, the second is a robot, and the third is the clever one.",
    hear:[
      ["&ldquo;The cheeks one is a person.&rdquo;", "&ldquo;Yes. Cheeks, tummies, loose teeth. A robot has no body to laugh with.&rdquo;"],
      ["&ldquo;The library one is a robot.&rdquo;", "&ldquo;Instant everything. No person reads that fast.&rdquo;"],
      ["&ldquo;The missing you one is a person!&rdquo;", "&ldquo;A chatbot can say that too, because it is built to say warm things. But did it really miss you? It has no feelings to miss anybody with.&rdquo;"],
    ],
    warn:"<b>Deliberately not &ldquo;who has used a chatbot?&rdquo;</b> A show of hands splits the room into homes that allow it and homes that do not. Spend your time on the third card instead: a program saying <em>I missed you</em> is the exact thing that makes a child treat it as a friend, so let the room argue about it." },

  { at:"before", kind:"do", scene:"five", eyebrow:"Now it is your turn",
    title:"Log on and<br>have a go.",
    under:"We all come back together 10 minutes before the end.",
    say:"&ldquo;Right. Week 15 is the Know-It-All&rsquo;s booth, and you are the Fact Checker. <b>Five things</b> to learn.&rdquo; Read the five off the board. &ldquo;We come back together <b>10 minutes before the end</b>.&rdquo;",
    hear:[
      ["&ldquo;Do we get to use a real chatbot?&rdquo;", "&ldquo;No. Everything in there is made for the game, so you can practise safely.&rdquo;"],
      ["Somebody cannot log in", "Get them going before you sit down. A child stuck on the login learns nothing for forty-five minutes."],
    ],
    handover:true,
    warn:"Two heads-ups. In <b>Choose Your Path</b> a child who is upset about a fight with a friend is asked whether to tell the bot the whole story, and the right answer is <em>tell a real person</em>. A child with nobody obvious at home may go quiet at that screen, so walk past during it. And one quick check is a speed round with a bar that runs down: it is for fun, and nobody fails when it empties." },

  /* ───────── 45 MINUTES ON THE COMPUTERS ───────── */

  /* ───────── 10 MINUTES: TALKING IT THROUGH AFTERWARDS ───────── */
  { at:"after", kind:"ask", scene:"racc", eyebrow:"Talk about it",
    title:"How did you get on?",
    bubble:"My chatbot SWORE you would lose!",
    say:"&ldquo;So, his booth is closed. Which of the bot&rsquo;s tricks was the sneakiest?&rdquo; Let them argue about it.",
    hear:[
      ["&ldquo;The ice-cream volcano!&rdquo;", "&ldquo;It sounded so sure, did it not? And the real book had nothing about it.&rdquo;"],
      ["&ldquo;The dog with five legs!&rdquo;", "&ldquo;Hands, legs and writing. The machine paints them, but it does not really understand them, so you count.&rdquo;"],
      ["&ldquo;I would have believed the volcano.&rdquo;", "&ldquo;Most people would. That is exactly why we check.&rdquo;"],
    ],
    warn:"If a child says they would have believed the made-up answer, make that the point rather than a mistake: <em>everybody believes a sure voice at first, which is why we check</em>. Then move on quickly." },

  { at:"after", kind:"ask", scene:"scenarios", eyebrow:"Ask the class",
    cards:[
      { art:ART.letters, sub:"Your spelling words for Friday" },
      { art:ART.idcard,  sub:"Your full name and your school" },
      { art:ART.camera,  sub:"A photo of your face" },
    ],
    title:"What is fine to<br>type to a bot?",
    say:"&ldquo;Here is the idea from the game, made real. Everything you type to a chatbot drops into a jar that <b>never opens again</b>, kept somewhere you cannot see. So a bot is a stranger with perfect spelling. Which of these is fine to put in the jar?&rdquo; Only the spelling words. Your name, your school and your face stay out.",
    hear:[
      ["&ldquo;The spelling words.&rdquo;", "&ldquo;Yes. Questions are fine. They give away nothing about you.&rdquo;"],
      ["&ldquo;But it said it needs my name to help.&rdquo;", "&ldquo;It does not. The help works exactly the same without your name.&rdquo;"],
      ["&ldquo;What if a grown-up says the photo is okay?&rdquo;", "&ldquo;Then that is your grown-up&rsquo;s call, made together. That is the rule: ask first.&rdquo;"],
    ],
    warn:"There is a fourth thing that goes in the jar in the game, and it is the one to say out loud: <b>worries</b>. A bot always replies warmly because it is built to, so a child who is upset can pour out the whole story and get no hug, no help, and nobody who remembers tomorrow. Say it plainly: <em>real feelings go to real people, and I am one of them.</em>" },

  { at:"after", kind:"do", scene:"recipe", eyebrow:"Do it together",
    title:"Check one<br>together.",
    recipe:{ slots:["READ IT","CHECK IT","THEN BELIEVE IT"],
      test:"Sounding sure is not the same as being right." },
    say:"&ldquo;Let us fact-check one together. A chatbot says, very sure of itself: <b>sharks are older than trees.</b>&rdquo; Take a vote. &ldquo;Does sounding sure make it true? No. So we check.&rdquo; Point at the slots. &ldquo;Read it. Check it, in a real book or with somebody who knows. <b>Then</b> believe it.&rdquo; Then the reveal. &ldquo;And it is true! Sharks were swimming about long before the first trees grew. But only the check could tell you that.&rdquo;",
    hear:[
      ["&ldquo;It is made up!&rdquo;", "&ldquo;Good instinct to doubt it. But doubting is not checking either. Where would we check it?&rdquo;"],
      ["&ldquo;Ask the bot again.&rdquo;", "&ldquo;Then you get the same guess, said louder. You need something that is not the bot.&rdquo;"],
    ],
    warn:"The answer is true on purpose, and that is the clever bit. The week is not teaching <em>bots are wrong</em>, it is teaching <em>check before you believe</em>. Sharks go back well over 400 million years and trees about 385 million, so you can confirm it with confidence. If you have an encyclopedia or the class library to hand, actually look it up in front of them." },

  { at:"after", kind:"tell", scene:"risks", safe:true, stamp:"caught", id:"safe", cards:RISKS, eyebrow:"Look what you did",
    title:"All three tricks.<br>Caught.",
    say:"&ldquo;Remember his bot&rsquo;s three tricks? Look at them now.&rdquo; Go along the three. &ldquo;Sure but made up? You check the book. A friendly chat asking your name? The jar stays empty. A picture that never happened? You count the legs and look twice. <b>His Know-It-All knows nothing about you.</b>&rdquo; Then, to the whole room, not to anybody in particular:",
    hear:[
      ["Somebody looks pleased", "Let them. They earned it."],
      ["&ldquo;I told a bot my name once.&rdquo;", "&ldquo;Lots of people have. You are not in trouble. Now you know, and that is what matters.&rdquo;"],
    ],
    warn:"<b>Say this out loud, whether or not anybody asks:</b> <em>if you have ever typed your name, sent a photo, or told a chatbot something private, you are not in trouble. Tell a grown-up so they know, and that is the end of it.</em> The game says a photo sent to a bot is copied and stored who knows where, which is accurate and can frighten a child who has already done it." },

  { at:"after", kind:"ask", scene:"solo", art:ART.camera, eyebrow:"What would you do?",
    title:"A funny picture of<br>somebody in class?",
    say:"&ldquo;Last one, and it is new. Your friend says: let&rsquo;s get the AI to make a funny picture of somebody in our class, and share it round. It is only a joke. What do you say?&rdquo;",
    hear:[
      ["&ldquo;It is only a joke.&rdquo;", "&ldquo;Is everyone laughing, or is someone hurting? And it is a picture of something that never happened, so it is a fib as well.&rdquo;"],
      ["&ldquo;I would say no.&rdquo;", "&ldquo;Yes. And what could you use the tool for instead?&rdquo; A welcome banner, a joke to cheer somebody up, a poem for Gran."],
      ["&ldquo;Tell a grown-up.&rdquo;", "&ldquo;If somebody has already made one, yes. Every time.&rdquo;"],
    ],
    warn:"In the game&rsquo;s own words, a fake of a real person is <b>a thorn and a lie</b>, the week&rsquo;s two worst things in one. If a child tells you somebody has actually made a fake picture of them or a classmate, that is not a lesson moment: thank them, and pass it on through your school&rsquo;s safeguarding or behaviour route the same day." },

  { at:"after", kind:"tell", scene:"tonight", art:ART.magnifier, eyebrow:"Tonight",
    title:"Teach it to<br>a grown-up.",
    under:"Sounding sure is not the same as being right.",
    say:"&ldquo;One job tonight, and you are the teacher. Tell a grown-up the golden rule: <b>sounding sure is not the same as being right</b>. Tell them about the ice-cream volcano. Then ask them: has a computer ever told you something that turned out to be wrong?&rdquo; Pause. &ldquo;I bet it has.&rdquo;",
    hear:[
      ["&ldquo;We do not have a chatbot.&rdquo;", "&ldquo;You do not need one. Tell them about the ice-cream volcano. They will love it.&rdquo;"],
      ["&ldquo;Can I use one at home now?&rdquo;", "&ldquo;Only with a grown-up, and only if they say yes. That is the rule the game uses too.&rdquo;"],
    ],
    warn:"Do not turn this into homework that needs a chatbot. Most children should not be using one alone and plenty of homes do not have one. The job is a conversation, and an ice-cream volcano is a very easy way to start it." },
];

export const WEEK_15: Pack = {
  n: 15,
  title: "Robot or Real?",
  sub: "AI and Chatbots",
  five: FIVE,
  slides: SLIDES,
  games: "The Message Belt, The Fact-Checker&rsquo;s Desk, Choose Your Path, The Odd Shadow Out, The AI Garden, Wise Move or Bot Trap",
};
