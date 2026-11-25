/**
 * Cyber Heroes, week 17: the teacher pack.
 *
 * Social media. The Hall of Mirrors: a profile is a mirror anybody can stare
 * into, the follower number only ever goes up, and every feed is somebody's
 * shiniest minute. The source is careful never to be anti social media and
 * never to say "post less"; the pack keeps both.
 *
 * THE AGE PROBLEM, AND HOW THE PACK HANDLES IT. The class is six to nine and
 * the big apps are thirteen and up. The source answers it well for the 13+
 * sign itself (a label on the ROOM, never a verdict on the child) and then
 * spends four beats talking about "your profile" and "your post" as if every
 * child has one. Some will have nothing. Some will already be on a 13+ app,
 * very often because a parent set it up. So:
 *
 * 1. The teacher says early, in so many words, that "your profile" means any
 *    profile: a game, a children's app, one day the big ones, and that having
 *    one and not having one are both completely fine.
 *
 * 2. There is NO "who has social media?" slide. A show of hands outs every
 *    under-13 on a 13+ app to the room and to the teacher, and makes the rest
 *    feel left behind. The relatable slide is about numbers on films, games
 *    and toys instead, which everybody has seen and which teaches the 13+ idea
 *    better than the apps would.
 *
 * 3. The review game marks Bo, who is on "the big talk app", as STILL OPEN.
 *    A child in the room may be Bo. The pack has the teacher say once, to the
 *    room, that being on one already is not trouble; the job is to sit with a
 *    grown-up and frost the panes.
 *
 * The backstage beat touches feeling not good enough, so the source keeps the
 * Raccoon off it entirely. The pack does the same: that slide has no villain
 * and no jokes at his expense. The job tonight has two routes, so a child with
 * no profile anywhere still has something real to do.
 *
 * Mirrors app/lesson/weekContent/week17.ts. See ./types.ts for the fields.
 */
import { ART } from "./art";
import type { Card, Concept, Pack, Slide } from "./types";

const FIVE: readonly Concept[] = [
  { art:ART.numbers,   name:"Room Reader",    line:"The number is about the room, not you." },
  { art:ART.locked,    name:"Mirror Froster", line:"You choose who looks." },
  { art:ART.diamond,   name:"Gold Panner",    line:"Where do I know them from?" },
  { art:ART.magnifier, name:"Draft Checker",  line:"Take the map out. Keep the news." },
  { art:ART.camera,    name:"Backstage Pass", line:"A shiny minute, not a whole day." },
];

/* The three mirrors in his hall, before the break and again after it with a
   stamp on each. Same array both times, so the mirror lands from the back of
   the room. */
const RISKS: readonly Card[] = [
  { art:ART.eye,     head:"A mirror left open", sub:"anybody walking past can stand and stare" },
  { art:ART.numbers, head:"A big number",       sub:"that feels like friends, and is only people watching" },
  { art:ART.star,    head:"Perfect posts",      sub:"that make your ordinary day feel small" },
];

const SLIDES: readonly Slide[] = [
  /* ───────── 10 MINUTES: TALKING IT THROUGH BEFORE THEY PLAY ───────── */
  { at:"before", kind:"tell", scene:"solo", art:ART.shield, eyebrow:"Week 17 &middot; The Profile Shield",
    title:"Your profile is a mirror.<br>You choose who looks.",
    say:"&ldquo;Eyes up. Lots of things online give you a profile: a game, an app, and one day, when you are older, the big apps grown-ups use. A profile is like a <b>mirror</b> hanging in a corridor. Anybody walking past can stop and look in.&rdquo; Pause. &ldquo;Some of you have a profile somewhere and some of you do not, and <b>both are completely fine</b>. This week is about the shield you will want whenever you do: you choose who looks, you check what you post, and you know what you are really looking at.&rdquo;",
    warn:"Say the &ldquo;both are completely fine&rdquo; line in so many words. Every beat of the game talks about <em>your</em> profile and <em>your</em> post, and a child with nothing will otherwise spend forty-five minutes feeling left out, while a child already on a big app will feel caught." },

  { at:"before", kind:"ask", scene:"racc", eyebrow:"Ask the class",
    title:"Are they all<br>your friends?",
    bubble:"214 followers! So POPULAR!",
    say:"Read the bubble as if he is genuinely impressed. &ldquo;Two hundred and fourteen people follow you. Wow. So, question. Are they all your <b>friends</b>?&rdquo;",
    hear:[
      ["&ldquo;Yes!&rdquo;", "&ldquo;Could you tell me where you know every one of them from? School? Football? Next door?&rdquo; That is the test they learn today."],
      ["&ldquo;No, some are strangers.&rdquo;", "&ldquo;Right. A follower is just somebody watching. A friend is somebody you could say where you know them from.&rdquo;"],
      ["&ldquo;I have more followers than that.&rdquo;", "&ldquo;Lots of people do. Today is about how many of them you could actually name a place for.&rdquo;"],
    ],
    warn:"Do not turn this into a count of who has followers. Keep it about the idea: <b>watching is not knowing</b>. If a child volunteers a big number, take it lightly and move on." },

  { at:"before", kind:"ask", scene:"risks", id:"risks", cards:RISKS, eyebrow:"Talk about it",
    title:"His hall has<br>three mirrors.",
    say:"&ldquo;He has built a whole hall of mirrors, and three of them do the damage.&rdquo; Walk the three. &ldquo;A profile left <b>open</b>, so any stranger can stand and stare. A big follower <b>number</b> that feels like friends and is only people watching. And <b>perfect posts</b>, everybody having the best day ever, that make your own ordinary day feel small.&rdquo;",
    hear:[
      ["&ldquo;So should you not post anything?&rdquo;", "&ldquo;No! Post your dragon drawing. Post your news. This week is about choosing who sees it, not about hiding.&rdquo;"],
      ["&ldquo;How do you close a mirror?&rdquo;", "&ldquo;You frost it, so only your friends can see in. You will do it in the game.&rdquo;"],
    ],
    link:{ to:"safe", text:"You come back to these same three on slide %s, after they have played, and show them shielded." },
    warn:"<b>Answer the &ldquo;should you not post anything?&rdquo; question firmly.</b> The game is built on it: every pane it frosts leaves the nice ones clear, and every line it rewrites keeps the news. A child who leaves thinking &ldquo;say nothing&rdquo; has learned the wrong week." },

  { at:"before", kind:"ask", scene:"scenarios", eyebrow:"Ask the class",
    cards:[
      { art:ART.camera,  sub:"a film: U, PG, 12" },
      { art:ART.gamepad, sub:"a game box: 3, 7, 12" },
      { art:ART.puzzle,  sub:"a toy: not for under 3s" },
    ],
    title:"Where else have you<br>seen a number like this?",
    say:"&ldquo;Apps have a number on them. Lots of the big ones say 13. Where else have you seen a number like that?&rdquo; Take a few. Then the toy. &ldquo;Not for under threes. Is that because babies are silly?&rdquo; No. &ldquo;It is because there are tiny pieces <b>inside</b>. The number is about what is in the box. The same is true of 13 on an app. It is a label on the <b>room</b>, never a score for you.&rdquo;",
    hear:[
      ["&ldquo;I play 12 games.&rdquo;", "&ldquo;Some families decide that together, and that is up to them. The number is just telling them what is inside.&rdquo; Move on."],
      ["&ldquo;So what is inside a 13 app?&rdquo;", "&ldquo;Strangers who can talk to anybody, arguments, adverts asking for money. Grown-up sized things.&rdquo;"],
    ],
    warn:"<b>Deliberately not &ldquo;who has social media?&rdquo;</b> A show of hands tells the whole room, and you, which under-thirteens are on a thirteen-plus app, often one a parent set up. Films, games and toys teach the same idea with nobody exposed, and the toy is the one that lands: the label is about the box, not about the child." },

  { at:"before", kind:"do", scene:"five", eyebrow:"Now it is your turn",
    title:"Log on and<br>have a go.",
    under:"We all come back together 10 minutes before the end.",
    say:"&ldquo;Right. You are walking the Hall of Mirrors, and there are <b>five things</b> to learn.&rdquo; Read the five off the board. &ldquo;When the game says <em>your</em> profile, it means a pretend one, so everybody can play it. We come back together <b>10 minutes before the end</b>.&rdquo;",
    hear:[
      ["&ldquo;Is there a timer?&rdquo;", "&ldquo;One quick question has a little clock bar. Nothing happens when it runs out.&rdquo;"],
      ["Somebody cannot log in", "Get them going before you sit down. A child stuck on the login learns nothing for forty-five minutes."],
    ],
    handover:true,
    warn:"Two heads-ups. The review game near the end marks a pretend child called <b>Bo</b>, who is on &ldquo;the big talk app&rdquo;, as wide open, and a child in your room may recognise themselves; you cover that after the break. And the backstage game is the gentle one, about feeling not good enough, so it is worth walking the room while they play it." },

  /* ───────── 45 MINUTES ON THE COMPUTERS ───────── */

  /* ───────── 10 MINUTES: TALKING IT THROUGH AFTERWARDS ───────── */
  { at:"after", kind:"ask", scene:"racc", eyebrow:"Talk about it",
    title:"How did you get on?",
    bubble:"Who turned the lights on?!",
    say:"&ldquo;His hall has gone dark. So, which mirror was the hardest to see through?&rdquo; Let them argue. &ldquo;And which pane did you frost first?&rdquo;",
    hear:[
      ["&ldquo;The walk home one.&rdquo;", "&ldquo;That is the sneaky one. A place and a time together is somewhere to wait.&rdquo;"],
      ["&ldquo;I left my dragon clear.&rdquo;", "&ldquo;Good. A dragon tells a stranger nothing except that you can draw.&rdquo;"],
      ["&ldquo;Somebody I do not know messages me.&rdquo;", "&ldquo;Thank you for telling me. Let us have a proper chat about that after.&rdquo; Then make sure you do."],
    ],
    warn:"If a child says a stranger is messaging them, thank them, keep the class moving, and speak to them before the lesson ends. Pass it to whoever handles child protection at your school <b>the same day</b>. Being on an app that is too old for them is common and is not, by itself, a disclosure; a stranger making contact is." },

  { at:"after", kind:"ask", scene:"solo", art:ART.camera, eyebrow:"Try it for real",
    title:"How many photos<br>did that one take?",
    say:"&ldquo;Hands up if anybody has ever had their photo taken and said: no, take another one.&rdquo; Every hand. Put yours up too. &ldquo;So when you see one perfect photo, how many tries do you think are behind it?&rdquo; Let them guess. &ldquo;The cake that came out right. The goal that went in. Nobody posts the forty before it, or the wet Tuesday. So you are putting your <b>whole day</b> next to everybody else&rsquo;s <b>best minute</b>. That is not a fair race.&rdquo;",
    hear:[
      ["&ldquo;Sometimes it does make me feel rubbish.&rdquo;", "&ldquo;Me too. That feeling is the reel working, not something true about your day.&rdquo;"],
      ["&ldquo;Some people really are always on holiday.&rdquo;", "&ldquo;It can look like that. Three photos from one afternoon can be posted across a whole week. The game showed you that.&rdquo;"],
    ],
    warn:"<b>Keep the Raccoon out of this slide,</b> as the game does. It is the one part of the week about how children feel about themselves, and a villain joke here makes it about him. If a child says it makes them feel rubbish, do not fix it; agree that it does that to everybody, grown-ups included." },

  { at:"after", kind:"do", scene:"recipe", eyebrow:"Do it together",
    title:"Read it back.<br>Find the map.",
    recipe:{ slots:["WHERE","WHEN"],
      thenLabel:"swap it for", add:["at our pool","next week"],
      test:"Same news. No map." },
    say:"Read this draft out: &ldquo;<b>Best day ever at the pool on Mill Road! Back Saturday at ten!</b>&rdquo; Then: &ldquo;Hunt for two things. Where? And when?&rdquo; Let them find both. &ldquo;Where plus when makes a <b>map</b>. A stranger could be standing there. So we swap them.&rdquo; Rebuild it with them: &ldquo;Best day ever at our pool! Going again next week! Is it still happy news?&rdquo; Yes. &ldquo;Same news. No map.&rdquo;",
    hear:[
      ["&ldquo;What about the word pool?&rdquo;", "&ldquo;Lots of places have a pool. &lsquo;Our pool&rsquo; does not tell anybody which one.&rdquo;"],
      ["&ldquo;So you cannot say where you are?&rdquo;", "&ldquo;You can tell your friends anything. This is about a post anybody could read. Where plus when goes to people you know.&rdquo;"],
    ],
    warn:"Let the class do the swapping. The point is that the happy bit survives, so read the new version back with as much excitement as the first. If they want another, try <em>&ldquo;Party at Jump Zone, Station Road, Saturday at 2!&rdquo;</em>" },

  { at:"after", kind:"tell", scene:"risks", safe:true, stamp:"shielded", id:"safe", cards:RISKS, eyebrow:"Look what you did",
    title:"All three mirrors.<br>Shielded.",
    say:"&ldquo;Remember his three mirrors from the start? Look at them now.&rdquo; Go along the three. &ldquo;You frosted the panes that name a place or a time. You panned for the friends you can actually place. And you went backstage and saw the forty tries. <b>His hall does not work on you.</b>&rdquo; Then, to the whole room:",
    hear:[
      ["Somebody looks pleased", "Let them. They earned it."],
      ["Somebody looks worried", "That is who the sentence below is for. Say it to the room, not to them."],
    ],
    warn:"<b>Say this out loud, whether or not anybody asks.</b> Something like: <em>if you are already on one of the big apps, you are not in trouble. Lots of people are. Just sit down with a grown-up and frost your panes together.</em> The review game marked a child on the big app as wide open, and somebody in your room may have felt that was them." },

  { at:"after", kind:"ask", scene:"solo", art:ART.party, eyebrow:"What would you do?",
    title:"Your invite needs<br>a where and a when.",
    under:"&ldquo;Jump Zone, Saturday at 2. Everybody come!&rdquo;",
    say:"&ldquo;Last one. You are having a party. The invite has to say where and when, or nobody turns up. But where plus when is a map. So what do you do?&rdquo; Let them work at it. &ldquo;The invite is fine. The question is <b>who sees it</b>. It goes to the people you are inviting, not posted where anybody can read it.&rdquo;",
    hear:[
      ["&ldquo;Take the where out.&rdquo;", "&ldquo;Then your friends go to the wrong place! The where has to stay. So what else could change?&rdquo; Who sees it."],
      ["&ldquo;Only send it to my friends.&rdquo;", "&ldquo;Exactly. That is the frosted glass. Friends see everything; strangers see nothing.&rdquo;"],
      ["&ldquo;My mum sends the invites.&rdquo;", "&ldquo;Perfect. That is a grown-up choosing who sees it.&rdquo;"],
    ],
    warn:"This one joins two of the week&rsquo;s powers. Sometimes the map has to stay, and then the answer is the frosted pane: <b>who</b> sees it, not what it says. It stops the highlighter rule turning into &ldquo;never say where you are&rdquo;." },

  { at:"after", kind:"tell", scene:"tonight", art:ART.locked, eyebrow:"Tonight",
    title:"Check the panes<br>with a grown-up.",
    under:"Who can see it? Friends only, or anybody?",
    say:"&ldquo;One job tonight. If you have a profile anywhere, on a game or an app, sit down with a grown-up and check one setting together: <b>who can see it?</b> If you do not have one, even better. Ask a grown-up to show you <b>theirs</b>, and teach them where plus when.&rdquo;",
    hear:[
      ["&ldquo;I do not have one.&rdquo;", "&ldquo;Then you get to be the teacher. Check a grown-up&rsquo;s instead.&rdquo;"],
      ["&ldquo;My grown-up does not know how.&rdquo;", "&ldquo;Lots do not. Look for the word <b>privacy</b> or <b>settings</b> together. Finding it is half the job.&rdquo;"],
    ],
    warn:"Both routes are there on purpose, so no child is left without a job and no child is told to go and make an account. Doing it <em>with</em> a grown-up matters most for the ones already on an app too old for them: it gets an adult looking at the settings without the child having to own up to anything." },
];

export const WEEK_17: Pack = {
  n: 17,
  title: "The Profile Shield",
  sub: "Social Media",
  five: FIVE,
  slides: SLIDES,
  games: "The Number on the Room, Frost the Mirror, The Friend Panner, The Highlighter Check, The Backstage Pass, The Shield Check",
};
