/**
 * Cyber Heroes, week 11: the teacher pack.
 *
 * Moved verbatim from the reviewed prototype. The copy in here has been
 * through the owner and IS the product: change it deliberately, not in
 * passing. See ./types.ts for what each field is for, and note that several
 * of them carry authored HTML on purpose.
 */
import { ART } from "./art";
import type { Concept, Pack, Slide } from "./types";

const FIVE: readonly Concept[] = [
  { art:ART.muscle,    name:"Never Your Fault", line:"Their choice. Not yours." },
  { art:ART.team,      name:"My Team",          line:"Named before you need them." },
  { art:ART.noentry,   name:"Stop &amp; Block", line:"No replies. No firing back." },
  { art:ART.camera,    name:"Camera, Not Trash",line:"Screenshot first." },
  { art:ART.rocket,    name:"The Protocol",     line:"Stop. Screenshot. Block. Tell." },
];

const SLIDES: readonly Slide[] = [
  { at:"before", kind:"tell", scene:"heroes", eyebrow:"Week 11",
    title:"Something wrong?<br>Here is what you do.",
    say:"&ldquo;Okay everyone. This week is a bit different. Sometimes something happens online that makes you feel funny in your tummy. Somebody says something unkind, or sends you something you did not want to see. It happens to <b>lots</b> of people, and it is a completely normal thing to talk about. By the end of today you will know <b>exactly</b> what to do.&rdquo;",
    warn:"Set the tone in the first thirty seconds: calm, ordinary, no drama. <b>The Hacker Raccoon is deliberately absent this week</b>, in the game as well as here. The children are not fighting a villain, they are learning what to do when they feel bad, and a cartoon baddie gets in the way of that." },

  { at:"before", kind:"tell", scene:"solo", art:ART.muscle, eyebrow:"The most important one",
    title:"It is never<br>your fault.",
    say:"&ldquo;If somebody is unkind to you online, <b>that was their choice. Not yours.</b> Not because of what you posted. Not because of what you were playing, or wearing, or saying. Not because you clicked something. Their choice. Never, ever yours to carry.&rdquo;",
    warn:"<b>Tell them this one, do not ask them.</b> It is the idea that has to land whether or not anything else does, and a child who is already carrying something needs to hear an adult say it out loud, not work it out from a question." },

  { at:"before", kind:"ask", scene:"team", eyebrow:"Ask the class",
    title:"Who is on<br>your team?",
    say:"&ldquo;Your team is the grown-ups you would tell. Not after something happens. <b>Now, before anything does.</b> Who is on yours?&rdquo;",
    hear:[
      ["&ldquo;My mum.&rdquo; &ldquo;My dad.&rdquo;", "&ldquo;Good. And who else? A team is more than one person, so you are never stuck.&rdquo;"],
      ["&ldquo;My teacher.&rdquo;", "&ldquo;Yes. Any grown-up here counts, and you can always come to me.&rdquo;"],
      ["A child cannot name anybody", "Do not let it sit. &ldquo;Everyone in this room has me, and everyone has the number on the board.&rdquo; Then check in with them privately, today."],
    ],
    warn:"If a child cannot name anyone at home, note it and follow it up quietly the same day. And leave your country's child line service on the board beside the names: it is free, it is open any hour, and a child can ring it <em>without telling anybody first</em>, which is exactly why it belongs on the list rather than instead of it." },

  { at:"before", kind:"tell", scene:"protocol", eyebrow:"The four steps",
    title:"Stop. Screenshot.<br>Block. Tell.",
    say:"&ldquo;Four steps, and the order matters. <b>Stop</b>: hands off, do not reply. <b>Screenshot</b>: take a picture of it first, because blocking somebody can make the message disappear. <b>Block</b>: now shut the door. <b>Tell</b>: show somebody on your team.&rdquo;",
    warn:"Screenshot before block is the bit adults get wrong too, so say it twice. Everything else this week is feelings; this is the one piece of procedure, and it is worth them knowing it by heart." },

  { at:"before", kind:"do", scene:"five", eyebrow:"Now it is your turn",
    title:"Log on and<br>have a go.",
    under:"We all come back together 10 minutes before the end.",
    say:"&ldquo;Right. In a minute you are going to log on and play Week 11, and you are going to learn <b>five things</b>.&rdquo; Read the five off the board. &ldquo;Sarah will talk you through every screen. And we will all come back together <b>10 minutes before the end of the lesson</b>.&rdquo;",
    handover:true,
    warn:"Read the five names off the board before they go, then <b>watch the clock</b> and set an alarm for 10 minutes before the end. <b>Walk the room this week rather than sitting down.</b> A child who is going to tell you something will usually do it quietly while everybody else is busy." },

  { at:"after", kind:"ask", scene:"heroes", eyebrow:"Talk about it",
    title:"How did you get on?",
    say:"&ldquo;Come and sit down. Tell me about it. Was there anything in there you were not sure about?&rdquo;",
    hear:[
      ["&ldquo;It was a bit sad.&rdquo;", "&ldquo;It is a bit sad, that one. But you now know what to do, and that is the opposite of sad.&rdquo;"],
      ["&ldquo;That happened to me.&rdquo;", "&ldquo;Thank you for telling me. Let us talk about it properly in a minute.&rdquo; Then make sure you do."],
      ["Nobody wants to start", "&ldquo;Hands up if you would know what to do now.&rdquo; Most hands go up. &ldquo;That is the whole lesson.&rdquo;"],
    ],
    warn:"Do not press anybody. If a child discloses, acknowledge it warmly, move the class on, and speak to them before the lesson ends. <b>See the briefing at the top of this pack.</b>" },

  { at:"after", kind:"ask", scene:"protocol", eyebrow:"Talk about it",
    title:"Why screenshot<br>before you block?",
    say:"&ldquo;This is the one that catches everybody, grown-ups included. Why does the camera come before the door?&rdquo;",
    hear:[
      ["&ldquo;So you have proof.&rdquo;", "&ldquo;Exactly. Proof is how a grown-up can actually do something about it.&rdquo;"],
      ["&ldquo;Because it disappears.&rdquo;", "&ldquo;Spot on. Block them first and the message can vanish with them.&rdquo;"],
      ["Blank looks", "&ldquo;What happens to somebody's messages when you block them?&rdquo; That gets them there."],
    ],
    warn:"If they get this one, they have got the week. It is the only step whose reason is not obvious, which is exactly why it is the one people skip." },

  { at:"after", kind:"do", scene:"protocol", eyebrow:"Now you do it",
    title:"Say the four steps<br>with me.",
    say:"&ldquo;All together, and do the actions with me. <b>STOP</b>, hands up. <b>SCREENSHOT</b>, click. <b>BLOCK</b>, push the door shut. <b>TELL</b>, point at a grown-up.&rdquo; Then again, faster.",
    warn:"Three times through with the actions. It takes forty seconds, and it is the difference between knowing the four steps and having them when you are upset and cannot think straight." },

  { at:"after", kind:"tell", scene:"team", eyebrow:"Take this home",
    title:"Put your team<br>where you can see it.",
    say:"&ldquo;Tonight, write your team down. Two or three grown-ups you would tell. Stick it up somewhere you can see it. And copy the number off the board onto it too: it is free, it is open any time of the day or night, and you do not have to tell anybody you are ringing.&rdquo;",
    warn:"Make sure your country's number is on the board before you say this, and hand out the team card if your centre has one. A child is far more likely to use a number already on their wall than one they have to go looking for when they are upset." },

  { at:"after", kind:"ask", scene:"heroes", eyebrow:"Talk about it",
    title:"What if it happens<br>to a friend?",
    say:"&ldquo;Last one. Your friend shows you a message and they are upset. What do you do?&rdquo;",
    hear:[
      ["&ldquo;Tell them to block it.&rdquo;", "&ldquo;Good. And what comes before that?&rdquo; Screenshot."],
      ["&ldquo;Tell a grown-up.&rdquo;", "&ldquo;Yes. <b>Even if your friend asks you not to.</b>&rdquo;"],
      ["&ldquo;I would message the person back.&rdquo;", "&ldquo;I know you would want to. But that is the one thing that helps the unkind person, not your friend.&rdquo;"],
    ],
    warn:"The &ldquo;even if your friend asks you not to&rdquo; line matters more than anything else on this slide. Children keep each other's secrets loyally, and that loyalty is exactly how something serious goes unreported for months." },

  { at:"after", kind:"tell", scene:"solo", art:ART.muscle, eyebrow:"Before you go",
    title:"You would know<br>what to do.",
    say:"&ldquo;That is it. If something ever feels wrong, you are not stuck and you are not on your own. Stop, screenshot, block, tell. And whatever happened, <b>it is never, ever your fault.</b>&rdquo;",
    warn:"End on the fault line, not on the protocol. The steps are what they will use; that sentence is what they will carry." },
];

export const WEEK_11: Pack = {
  n: 11,
  title: "Something Wrong?",
  sub: "Emergency Protocol",
  five: FIVE,
  slides: SLIDES,
  games: "Reveal, Team Poster, Button Hunt, Reply Cards, Step Order, Drill Run",
  /* Country neutral by design: the board teaches the IDEA of a free line for
     children and never a number, because the number is different everywhere
     this course is sold and a wrong one in a safeguarding lesson is worse than
     none at all. The number is the school's to supply.

     CHANGED IN THE PORT: the prototype's last sentence told the teacher to
     "put it in HELPLINE at the top of this pack". That was an editable
     constant in a single HTML file and it does not exist here, so the
     instruction pointed at nothing. Until a school can store its own number
     (it belongs on the school record, which arrives with phase 3), the board
     is the right place for it and the copy now says so. */
  helpline: {
         label:"The child line service",
         note:"free &middot; any hour &middot; and you do not have to tell anybody you are ringing",
         setup:"<b>Write your country's child line service number on the board before you teach "
           + "this.</b> Your safeguarding lead will have it, and most countries have a free line "
           + "just for children. Once you know it, leave it up where the class can see it for the "
           + "rest of the week.",
       },
  brief: {
         head:"Read this before you teach it",
         body:[
           "<b>This is a safeguarding lesson, and a child may tell you something during it.</b> That is the lesson working, not the lesson going wrong.",
           "<b>Listen.</b> Do not investigate, and never ask a child to describe what happened in front of the class.",
           "<b>Never promise to keep it secret.</b> Say: &ldquo;I am really glad you told me. I need to tell somebody who can help.&rdquo;",
           "<b>Write down what they said in their own words</b> as soon as you can, and pass it to your designated safeguarding lead <b>the same day</b>.",
           "Your own setting's safeguarding policy overrides anything on these slides.",
         ] },
};
