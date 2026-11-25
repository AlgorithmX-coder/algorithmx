/**
 * Cyber Heroes, week 6: the teacher pack.
 *
 * Gaming safety. The Neon Arcade, and an APPLICATION week: week 2's private
 * info rule and week 3's stranger rule go to work inside a game lobby, and
 * the lobby setting, the two power buttons and the download trap are its own
 * three lessons.
 *
 * WHY THIS WEEK CARRIES A BRIEFING. It looks like the friendly gaming week,
 * and it puts a real grooming route on the screen: a stranger with a friendly
 * username fishing for a school, asking a child to "chat somewhere else", and
 * (in The Power Panel) a player offering a free skin for a photo. Online games
 * are where a stranger is most likely to reach a child of this age, so a child
 * in the room may recognise one of these and tell you. Week 3 owns dangerous
 * people; this week shows where they turn up, and the teacher needs the same
 * preparation week 3 gives.
 *
 * THREE THINGS THE SOURCE MADE ME ADD.
 *
 * 1. The relatable slide is NOT "who do you play with?". In a class of seven
 *    year olds that question gets you games rated well above their age and
 *    strangers in voice chat, said out loud in front of everybody, and a
 *    teacher who reacts teaches the class to stop telling adults about games.
 *    It sorts three chat messages instead, which is the week's first game.
 *
 * 2. "I'm home alone till 6" is one of the chat messages. A child in the room
 *    may be, so the teacher is told to note it rather than react.
 *
 * 3. The week teaches report, block, tell. Week 11 will teach stop,
 *    screenshot, block, tell, which owns the protocol. They do not clash (an
 *    in-game report captures the evidence itself), but a sharp child will ask
 *    about screenshots, so the teacher gets an answer that does not teach
 *    week 11 early.
 *
 * Mirrors app/lesson/weekContent/week6.ts. See ./types.ts for the fields.
 */
import { ART } from "./art";
import type { Card, Concept, Pack, Slide } from "./types";

const FIVE: readonly Concept[] = [
  { art:ART.gamepad, name:"Chat Fixer",           line:"Game talk in. Real life out." },
  { art:ART.locked,  name:"Lobby Lock",           line:"Friends only. Set it once." },
  { art:ART.door,    name:"Stay With the Guards", line:"Somewhere else is a red flag." },
  { art:ART.bell,    name:"Power Buttons",        line:"Report. Block. Tell." },
  { art:ART.trap,    name:"Trap Closer",          line:"Real games sell inside the game." },
];

/* The three moves the raccoon makes in every lobby, before the break and
   again after it with a stamp on each. Same array both times: identical
   layout is what makes the mirror land from the back of the room. */
const RISKS: readonly Card[] = [
  { art:ART.school, head:"Fishing for your school", sub:"&ldquo;What school do you go to? I bet I know you!&rdquo;" },
  { art:ART.door,   head:"&ldquo;Chat somewhere else&rdquo;", sub:"away from the guards, where nobody can see" },
  { art:ART.gift,   head:"A free skin to download", sub:"and all it needs is your login" },
];

const SLIDES: readonly Slide[] = [
  /* ───────── 10 MINUTES: TALKING IT THROUGH BEFORE THEY PLAY ───────── */
  { at:"before", kind:"tell", scene:"solo", art:ART.gamepad, eyebrow:"Week 6 &middot; Defend Your Game Zone",
    title:"Game talk in.<br>Real life out.",
    say:"&ldquo;Eyes up. This week we are going into a game. Game chat is brilliant for game talk: tactics, rematches, &lsquo;nice shot!&rsquo;. But a game lobby is full of people you have <b>never met</b>, even the friendly ones. So here is the rule.&rdquo; Slow down. &ldquo;<b>Game talk in. Real life out.</b> Your real name, your age, your school, where you live: none of it goes in the chat. Not ever.&rdquo;",
    warn:"Some children in the room will not play online games at all, and some will play games rated well above their age. Treat both as completely ordinary. A child who gets a reaction about <em>which</em> game they play stops telling adults about the <em>people</em> in it, and the people are what this week is about." },

  { at:"before", kind:"ask", scene:"racc", eyebrow:"Ask the class",
    title:"Why does he<br>want to know?",
    bubble:"What school do you go to? I bet I know you!",
    say:"&ldquo;He has slipped into a game lobby with a friendly username, and he types this.&rdquo; Read the bubble in your friendliest voice. &ldquo;Sounds nice, does it not? So why does a stranger in a game want to know your <b>school</b>?&rdquo;",
    hear:[
      ["&ldquo;To be friends.&rdquo;", "&ldquo;That is what he wants you to think. But a school is where you are every single weekday. That is a map, not a friendship.&rdquo;"],
      ["&ldquo;To find you.&rdquo;", "&ldquo;Exactly. One crumb at a time. A school here, a street there.&rdquo;"],
      ["&ldquo;I would just say my town.&rdquo;", "&ldquo;Still a crumb, and he collects crumbs. The hero answer is &lsquo;Nice try! Game talk only&rsquo;, and you keep playing.&rdquo;"],
      ["&ldquo;What if they really go to my school?&rdquo;", "&ldquo;Then you will see them at school, and you can talk about it there.&rdquo;"],
    ],
    warn:"&ldquo;I would just say my town&rdquo; is the answer most of the class will think is clever, and the end-of-week quiz has it as a wrong answer on purpose. Half an answer is still a clue. Get &ldquo;Nice try! Game talk only&rdquo; said out loud by a few of them." },

  { at:"before", kind:"ask", scene:"risks", id:"risks", cards:RISKS, eyebrow:"Talk about it",
    title:"Three moves in<br>every lobby.",
    say:"&ldquo;He does the same three things in every game he gets into.&rdquo; Walk the three. &ldquo;He fishes for where you are. He asks you to <b>chat somewhere else</b>. And he offers you something free to download.&rdquo; Then the middle one again. &ldquo;Why would he want to move you to a different app? Because the game has guards: rules, report buttons, grown-ups who can see. <b>Over there, the guards cannot see a thing.</b>&rdquo;",
    hear:[
      ["&ldquo;What if the chat really is laggy?&rdquo;", "&ldquo;Then it is laggy for both of you, and you play on. Real gaming friends are happy right here.&rdquo;"],
      ["&ldquo;What is a mod?&rdquo;", "&ldquo;Something extra you download to change a game. Real games sell their extras <b>inside</b> the game. A download from somewhere else is how a trick gets in.&rdquo;"],
      ["&ldquo;We did this in week 3!&rdquo;", "&ldquo;We did. Moving the chat was a red flag then and it is a red flag now. This week is about where it happens.&rdquo;"],
    ],
    link:{ to:"safe", text:"You come back to these same three on slide %s, after they have played, and show them guarded." },
    warn:"<b>The middle card matters most.</b> Moving the chat is the step that gets a child away from every protection the game has, and it is the week 3 red flag turning up where children actually meet strangers. If you only have time to land one card, land that one." },

  { at:"before", kind:"ask", scene:"scenarios", eyebrow:"Ask the class",
    cards:[
      { art:ART.gamepad, sub:"&ldquo;gg! Rematch tomorrow?&rdquo;" },
      { art:ART.home,    sub:"&ldquo;I&rsquo;m home alone till 6, voice chat?&rdquo;" },
      { art:ART.party,   sub:"&ldquo;It&rsquo;s my birthday on June 12th!&rdquo;" },
    ],
    title:"Send it,<br>or swap a word?",
    say:"&ldquo;Three messages about to go into game chat. Which ones are fine to send, and which word would you swap?&rdquo; Go along the three and take a couple of answers each.",
    hear:[
      ["&ldquo;The first one is fine.&rdquo;", "&ldquo;Pure game talk. It says nothing about who you are or where you are, so it flies.&rdquo;"],
      ["&ldquo;Not home alone!&rdquo;", "&ldquo;Right. That one tells a stranger there is no grown-up with you. Swap it for &lsquo;I&rsquo;m free till 6&rsquo;, which says the same about the game and nothing about you.&rdquo;"],
      ["&ldquo;What is wrong with a birthday?&rdquo;", "&ldquo;The date is a real-life clue. People use it to guess passwords and to pretend they know you. &lsquo;It&rsquo;s my birthday this week!&rsquo; keeps the happy news and drops the date.&rdquo;"],
    ],
    warn:"<b>Deliberately not &ldquo;who do you play with?&rdquo;</b> That question gets you games rated above their age and strangers in voice chat, said out loud in front of everybody. And watch the home alone card: a child may say &ldquo;I am home alone after school&rdquo;. Do not react in front of the class. Note it, and pass it on afterwards if it concerns you, the way your school normally would." },

  { at:"before", kind:"do", scene:"five", eyebrow:"Now it is your turn",
    title:"Log on and<br>have a go.",
    under:"We all come back together 10 minutes before the end.",
    say:"&ldquo;Right. Week 6 is the Neon Arcade, and you are guarding the lobby. <b>Five things</b> to learn.&rdquo; Read the five off the board. &ldquo;We come back together <b>10 minutes before the end</b>.&rdquo;",
    hear:[
      ["&ldquo;Is it a real game?&rdquo;", "&ldquo;It is a pretend lobby, so you can practise the tricky moments without anybody real on the other end.&rdquo;"],
      ["Somebody cannot log in", "Get them going before you sit down. A child stuck on the login learns nothing for forty-five minutes."],
    ],
    handover:true,
    warn:"Two heads-ups. In <b>The Power Panel</b> one of the nasty players offers a free skin for a photo. That is on purpose, it is the week 3 red flag, and the right answer is report, block, tell; watch faces on that screen. And the menu moves every round, deliberately, so they learn to look for the words and not the spot. The quick check with a moving bar is for show: the bar never runs out on them." },

  /* ───────── 45 MINUTES ON THE COMPUTERS ───────── */

  /* ───────── 10 MINUTES: TALKING IT THROUGH AFTERWARDS ───────── */
  { at:"after", kind:"ask", scene:"racc", eyebrow:"Talk about it",
    title:"How did you get on?",
    bubble:"This lobby has way too many guards!",
    say:"&ldquo;So, is he still in your lobby?&rdquo; Enjoy the answer. &ldquo;Which bit was the trickiest?&rdquo;",
    hear:[
      ["&ldquo;The buttons kept moving!&rdquo;", "&ldquo;On purpose. Every real game hides them somewhere different, so you learned to look for the words, not the spot.&rdquo;"],
      ["&ldquo;I let GoldRush Gary in.&rdquo;", "&ldquo;He had a very friendly name, did he not? That is the lesson. A friendly name is not a team badge.&rdquo;"],
      ["&ldquo;The one who wanted a photo.&rdquo;", "&ldquo;Yes. A stranger asking for a photo is a red flag every time, whatever they offer you. Report, block, tell.&rdquo;"],
    ],
    warn:"If the photo player comes up and a child adds something about themselves, acknowledge it warmly, move the class on, and speak to them before the lesson ends. <b>See the briefing at the top of this pack.</b>" },

  { at:"after", kind:"tell", scene:"risks", eyebrow:"Count the guards",
    cards:[
      { art:ART.bell,    head:"Report button", sub:"calls the game&rsquo;s guards" },
      { art:ART.noentry, head:"Block button",  sub:"they vanish from your game" },
      { art:ART.locked,  head:"Friends only",  sub:"only people you know get in" },
      { art:ART.team,    head:"Grown-ups can see", sub:"your family can read it" },
    ],
    title:"Why he wants you<br>somewhere else.",
    say:"&ldquo;Here are the guards in a game lobby. Count them with me.&rdquo; Point at each. &ldquo;One, two, three, four. Now picture the other app he wants you on. How many of these are there?&rdquo; Let them answer. &ldquo;<b>None.</b> That is the whole reason he asks. Not because the chat is laggy. Because over there, nobody is watching.&rdquo;",
    hear:[
      ["&ldquo;My cousin uses that app.&rdquo;", "&ldquo;Lots of families do, with people they actually know. This rule is about somebody you met <b>in a game</b> asking you to move.&rdquo;"],
      ["&ldquo;What about party chat in the game?&rdquo;", "&ldquo;Still inside the game, so the guards are still there. That one is fine.&rdquo;"],
    ],
    warn:"The cousin answer matters. If this slide turns into &ldquo;that app is bad&rdquo;, children stop listening, because their families use it. The rule is about <em>who</em> is asking you to move, not about the app." },

  { at:"after", kind:"do", scene:"recipe", eyebrow:"Do it together",
    title:"Say it with me.",
    recipe:{ slots:["REPORT","BLOCK","TELL"],
      test:"Report first, so the guards can stop them for everyone." },
    say:"&ldquo;Somebody in a game turns nasty. Three steps, and the order matters. Say them with me and do the actions.&rdquo; Do it three times, faster each time. &ldquo;<b>REPORT</b>: ring the bell, call the guards. <b>BLOCK</b>: push the door shut. <b>TELL</b>: point at a grown-up.&rdquo;",
    hear:[
      ["&ldquo;Why not just block?&rdquo;", "&ldquo;Block clears <b>your</b> game. Report lets the guards clear it for <b>everybody</b>. That is why it goes first.&rdquo;"],
      ["&ldquo;What about mute?&rdquo;", "&ldquo;Mute only makes it quiet for you. The guards never hear about it.&rdquo;"],
      ["&ldquo;Should you screenshot it?&rdquo;", "&ldquo;Good thinking. We do that one properly in week 11.&rdquo; Leave it there."],
    ],
    warn:"Do not teach screenshots here, and do not say no to them either. Week 11 owns the full version (stop, screenshot, block, tell) and it fits on top of this cleanly. A child who asks has earned a &ldquo;yes, and we are coming to it&rdquo;." },

  { at:"after", kind:"tell", scene:"risks", safe:true, stamp:"guarded", id:"safe", cards:RISKS, eyebrow:"Look what you did",
    title:"All three moves.<br>Guarded.",
    say:"&ldquo;Remember his three moves from the start? Look at them now.&rdquo; Go along the three. &ldquo;You kept your school out of the chat. You stayed where the guards are. And you closed the free download. <b>Your lobby is locked.</b>&rdquo; Then, to the whole room, not to anybody in particular:",
    hear:[
      ["Somebody looks pleased", "Let them. They earned it."],
      ["Somebody looks worried", "That is who the sentence below is for. Say it to the room, not to them."],
    ],
    warn:"<b>Say this out loud, whether or not anybody asks.</b> Something like: <em>if you have ever told somebody in a game where you live, or moved to another app with them, you are not in trouble. Tell a grown-up, and they can help make it safe again.</em> Some children in the room have done exactly that, and one sentence from you is what makes telling possible. The course does the full version in week 11." },

  { at:"after", kind:"ask", scene:"solo", art:ART.gift, eyebrow:"What would you do?",
    title:"Your friend sends you<br>a free download.",
    say:"&ldquo;Last one. Not a stranger this time: your actual friend from class. They send you a link. &lsquo;Free skins mod, it works, I have tried it!&rsquo; What do you do?&rdquo;",
    hear:[
      ["&ldquo;Download it, it is my friend.&rdquo;", "&ldquo;Your friend is fine. The <b>download</b> is the problem. Your friend might have been tricked too.&rdquo;"],
      ["&ldquo;Check with a grown-up.&rdquo;", "&ldquo;Every time. Real games sell their stuff inside the game. Anything from outside gets a grown-up check first.&rdquo;"],
      ["&ldquo;It wants my password.&rdquo;", "&ldquo;Then it is a trap, full stop. Nothing that hands out free skins needs your password. The password is what it was after all along.&rdquo;"],
    ],
    warn:"This is the transfer: the trap does not always come from a stranger, it travels through real friends. Keep it about the download, never about the friend, or the lesson turns into &ldquo;your friends lie to you&rdquo;, which is the wrong one." },

  { at:"after", kind:"tell", scene:"tonight", art:ART.locked, eyebrow:"Tonight",
    title:"Lock your lobby<br>with a grown-up.",
    under:"Friends only. Hero name. Friends-only mic.",
    say:"&ldquo;One job tonight. Sit down with a grown-up and a game you play, and find the setting that says <b>who can join</b>. Switch it to <b>friends only</b>, together. Set it once, and it guards every game after.&rdquo;",
    hear:[
      ["&ldquo;I do not play online games.&rdquo;", "&ldquo;Then you have the easiest job. Tell a grown-up the four guards, and why a stranger wants you somewhere else.&rdquo;"],
      ["&ldquo;I cannot find the setting.&rdquo;", "&ldquo;That is fine. That is exactly why it is a job for two. Sometimes it lives in the grown-up settings.&rdquo;"],
    ],
    warn:"On a lot of consoles and tablets the setting sits behind parental controls a child cannot reach, which is why the job is to do it <b>with</b> a grown-up rather than on their own. If your centre sends a note home, this is the line to put in it." },
];

export const WEEK_6: Pack = {
  n: 6,
  title: "Defend Your Game Zone",
  sub: "Gaming Safety",
  five: FIVE,
  slides: SLIDES,
  games: "The Chat Fixer, Lobby Doors, Guard Count, The Power Panel, The Download Dock, Game Zone Bingo",
  brief: {
    head: "Read this before you teach it",
    body: [
      "<b>This looks like the friendly gaming week, and it puts a real grooming route on the screen.</b> A stranger with a friendly name asks for a child&rsquo;s school, asks them to chat on another app, and in one game offers a free skin for a photo. Online games are where a stranger is most likely to reach a child of this age. A child who has had any of these may recognise it, and may tell you. That is the lesson working, not the lesson going wrong.",
      "<b>Listen.</b> Do not investigate, and never ask a child to describe what happened in front of the class.",
      "<b>Never promise to keep it secret.</b> Say: &ldquo;I am really glad you told me. I need to tell somebody who can help.&rdquo;",
      "<b>If a child tells you something, tell them they are not in trouble.</b> &ldquo;It was not your fault&rdquo; is taught properly in week 11, so do not start teaching week 11 early. But a child who has already moved a chat or sent a photo needs to hear <b>today</b> that it is never too late to tell. It is on the stamped slide so you do not forget.",
      "<b>Expect to hear about games rated well above their age.</b> Do not react in front of the class. A child who is told off about the game stops telling you about the people in it. Note it and follow it up the way your school normally would.",
      "<b>One chat message says &ldquo;I&rsquo;m home alone till 6&rdquo;.</b> If a child says that is them, note it quietly rather than reacting.",
      "<b>Write down what they said in their own words</b> as soon as you can, and pass it to whoever is responsible for child protection at your school <b>the same day</b>.",
      "Your own setting&rsquo;s safeguarding policy overrides anything on these slides.",
    ],
  },
};
