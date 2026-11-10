/**
 * Cyber Heroes, week 9: the teacher pack.
 *
 * Apps and downloads. An app warehouse, and the week where the raccoon stops
 * sending messages and starts dressing up a whole app: same icon, one letter
 * different, and a greedy key hidden on the back of the box.
 *
 * WHAT THE SOURCE MADE ME CHANGE.
 *
 * 1. The usual "has this happened to you?" slide is wrong here. The honest
 *    version is "who has downloaded a game on their own?", and the answer
 *    depends entirely on the rules in a child's house. A show of hands puts
 *    a child on the spot about their family. It is reframed as "your friend
 *    says get this game, where do you get it?", which gets the same thinking
 *    with nobody's home on display.
 *
 * 2. The week's rule is "install together with a grown-up", and plenty of
 *    the class already have apps they got on their own, some of them from
 *    exactly the places the game sends back. Nothing in the source says that
 *    is fine to fix. So the mirror slide carries one sentence to the room, the
 *    way week 4 does, and the job tonight is the fix itself: one app, checked
 *    together.
 *
 * 3. The source never names a real app store ("the official app store on
 *    your device") and only ever uses invented apps. The pack keeps to that,
 *    and tells the teacher they do not need to name one either.
 *
 * 4. "FREE isn't free" can tip into "nothing free is real". The game is
 *    careful (the library app really is free), so the pack says it out loud
 *    on the slide where the trick is introduced.
 *
 * Mirrors app/lesson/weekContent/week9.ts. See ./types.ts for the fields.
 */
import { ART } from "./art";
import type { Card, Concept, Pack, Slide } from "./types";

const FIVE: readonly Concept[] = [
  { art:ART.phone, name:"One Real Shop", line:"Not in the real shop? Not coming home." },
  { art:ART.mask,  name:"Copycat Eyes",  line:"Name. Maker. Downloads." },
  { art:ART.key,   name:"Key Checker",   line:"Job keys yes, greedy keys no." },
  { art:ART.gift,  name:"Price Finder",  line:"FREE gets paid another way." },
  { art:ART.team,  name:"Four Eyes",     line:"Check it together, install it together." },
];

/* The three ways a fake gets onto a tablet. Before the break they are the
   tricks; after it, the same three caught. Same array both times, so the
   mirror lands from the back of the room. */
const RISKS: readonly Card[] = [
  { art:ART.mask, head:"The copycat",   sub:"the same picture, and one letter different" },
  { art:ART.key,  head:"The greedy key", sub:"a torch app that wants your contacts" },
  { art:ART.gift, head:"The FREE tag",  sub:"paid for with your time, your coins or your info" },
];

const SLIDES: readonly Slide[] = [
  /* ───────── 10 MINUTES: TALKING IT THROUGH BEFORE THEY PLAY ───────── */
  { at:"before", kind:"tell", scene:"solo", art:ART.phone, eyebrow:"Week 9 &middot; Spot the Fakes",
    title:"Check it before<br>it comes home.",
    say:"&ldquo;Eyes up. This week you are working in an app warehouse. An app is like a parcel: once you open it, it lives on your tablet. So before it comes home, a hero checks it.&rdquo; Then the rule for the whole week. &ldquo;New apps come from <b>one</b> place: the shop that came built into your tablet or phone. That shop checks every app before it goes on the shelf. A button on a website, a pop-up, a link in the comments? Nobody checked those. <b>Not in the real shop? Not coming home.</b>&rdquo;",
    warn:"The game never names a real app shop. It always says &ldquo;the official app store on your device&rdquo;, and it only uses made-up apps. You do not need to name one either. Children will call out the ones they know, which is fine: just agree that it is the one that came on the device." },

  { at:"before", kind:"ask", scene:"racc", eyebrow:"Ask the class",
    title:"Spot what<br>he changed.",
    bubble:"Get Blast Birdz! The REAL one!",
    say:"&ldquo;He made a copy of the most popular game in the city. Same picture. Same colours.&rdquo; Read the bubble like a market trader. &ldquo;So, what did he change?&rdquo;",
    hear:[
      ["&ldquo;The z!&rdquo;", "&ldquo;One letter. That is all it took. Most people never read past the picture.&rdquo;"],
      ["&ldquo;It looks exactly the same.&rdquo;", "&ldquo;<b>That is the trick.</b> He copied the picture perfectly, so the picture proves nothing. The letters are where he slips up.&rdquo;"],
      ["&ldquo;How would you know it is fake?&rdquo;", "&ldquo;Three things. The name, letter by letter. Who made it. And how many people have it: the real one has millions, his has twelve, since yesterday.&rdquo;"],
    ],
    warn:"If you have a board to write on, put <b>Blast Birds</b> and <b>Blast Birdz</b> one above the other. A class spots the z far faster on a board than they hear it, and it shows them what &ldquo;letter by letter&rdquo; means before the game asks them to do it." },

  { at:"before", kind:"ask", scene:"risks", id:"risks", cards:RISKS, eyebrow:"Talk about it",
    title:"Three ways a fake<br>gets in.",
    say:"&ldquo;He has three tricks for getting a fake onto your tablet.&rdquo; Walk the three. &ldquo;The copycat: same picture, one letter wrong. The greedy key: an app asking for bits of your tablet it does not need, like a torch that wants your contacts. And the FREE tag.&rdquo; Then the important part. &ldquo;Making an app costs money, so a FREE app gets paid <b>another way</b>. Ads every minute, and you pay with your time. A coin shop inside, and you pay with coins. Questions about you, and you pay with your info. <b>And some free really is free</b>, like your library&rsquo;s story app.&rdquo;",
    hear:[
      ["&ldquo;What is a key?&rdquo;", "&ldquo;A permission. The app has to ask before it can use your camera, your microphone, your photos or your contacts. Each one is a key to part of your tablet.&rdquo;"],
      ["&ldquo;But all my games are free.&rdquo;", "&ldquo;Lots are, to start. So ask how it gets paid. That is a detective question, not a telling-off.&rdquo;"],
    ],
    link:{ to:"safe", text:"You come back to these same three on slide %s, after they have played, and show them caught." },
    warn:"<b>Do not skip &ldquo;some free really is free&rdquo;.</b> Without it the week teaches that nothing free can be trusted, and the game is careful about this: the last app in the FREE game is a library app with no ads, no coins and no questions, and it is the right answer. Spending real money on coins belongs to week 7, so you only need to name it here." },

  { at:"before", kind:"ask", scene:"scenarios", eyebrow:"Ask the class",
    cards:[
      { art:ART.link,   sub:"A big DOWNLOAD NOW button on a website" },
      { art:ART.phone,  sub:"The shop that came on your tablet" },
      { art:ART.speech, sub:"A link somebody left in the comments" },
    ],
    title:"Your friend says<br>get this game.",
    say:"&ldquo;Your friend tells you about a brilliant new game. Here are three places you could get it. Which one?&rdquo; Take votes, then ask why.",
    hear:[
      ["&ldquo;The tablet shop.&rdquo;", "&ldquo;Why that one?&rdquo; You want: <b>because it checks apps first.</b>"],
      ["&ldquo;The website is quicker.&rdquo;", "&ldquo;Quicker, and nobody checked what is inside. Quicker is not safer.&rdquo;"],
      ["&ldquo;What if my cousin sends me the link?&rdquo;", "&ldquo;Brilliant question. Hold on to it, because it is the last thing we do today.&rdquo;"],
    ],
    link:{ to:"cousin", text:"The cousin question is answered properly on slide %s." },
    warn:"<b>Deliberately not &ldquo;who has downloaded a game on their own?&rdquo;</b> The rules about apps are different in every house, and a show of hands puts a child on the spot about their family. Asking where a friend should get it gets you the same thinking with nobody&rsquo;s home on display." },

  { at:"before", kind:"do", scene:"five", eyebrow:"Now it is your turn",
    title:"Log on and<br>have a go.",
    under:"We all come back together 10 minutes before the end.",
    say:"&ldquo;Right. Week 9, and the warehouse is full of parcels to check. <b>Five things</b> to learn.&rdquo; Read the five off the board. &ldquo;We come back together <b>10 minutes before the end</b>.&rdquo;",
    hear:[
      ["&ldquo;Is there a timer?&rdquo;", "&ldquo;One quick question has a five second bar. Nothing happens when it runs out, so take your time and read the letters.&rdquo;"],
      ["Somebody cannot log in", "Get them going before you sit down. A child stuck on the login learns nothing for forty-five minutes."],
    ],
    handover:true,
    warn:"Two heads-ups. <b>The five second bar on the copycat question is for show</b>: it drains and nothing happens, which matters in a week about slowing down to read. And the last game, Four Eyes, has a big CALL MY GROWN-UP button. It is pretend, and their grown-up&rsquo;s side opens on the screen, but a six year old may read it literally and come to fetch you. Enjoy it, and send them back to tap the button." },

  /* ───────── 45 MINUTES ON THE COMPUTERS ───────── */

  /* ───────── 10 MINUTES: TALKING IT THROUGH AFTERWARDS ───────── */
  { at:"after", kind:"ask", scene:"racc", eyebrow:"Talk about it",
    title:"How did you get on?",
    bubble:"I&rsquo;m closing the warehouse!",
    say:"&ldquo;So, his warehouse is shut. Which fake nearly got you?&rdquo; Let a few of them tell you.",
    hear:[
      ["&ldquo;The zero in Robo Racers!&rdquo;", "&ldquo;That is the hardest kind, because a zero and an O look almost the same. Slow down and you see it.&rdquo;"],
      ["&ldquo;The torch one looked fine.&rdquo;", "&ldquo;It did. The maker was real and the reviews were good. The trick was only on the keys side. <b>A real app can still ask for too much.</b>&rdquo;"],
      ["&ldquo;I put a bad one on the shelf.&rdquo;", "&ldquo;Good. That is exactly what the game is for, and it is a much better place to get it wrong than your tablet.&rdquo;"],
    ],
    warn:"Torchy Light in Flip the Box catches the most children, because three sides of the box are fine and only the keys are wrong. If somebody says so, use it: it is the clearest proof in the week that checking one thing is not enough." },

  { at:"after", kind:"ask", scene:"scenarios", eyebrow:"Ask the class",
    cards:[
      { art:ART.camera,  sub:"A camera app wants your <b>camera</b>" },
      { art:ART.puzzle,  sub:"A jigsaw game wants to know <b>where you are</b>" },
      { art:ART.palette, sub:"A drawing app wants your <b>contacts</b>" },
    ],
    title:"Job key, or<br>greedy key?",
    say:"&ldquo;One question does all the work this week: <b>does its job need that key?</b>&rdquo; Go along the three. &ldquo;What is the app&rsquo;s job? And does the job need that?&rdquo;",
    hear:[
      ["&ldquo;The camera one is greedy!&rdquo;", "&ldquo;Ask the question. What is a camera app&rsquo;s job? Taking pictures. So the camera key <b>is</b> its job. That one is fine.&rdquo;"],
      ["&ldquo;What if it says it needs it?&rdquo;", "&ldquo;Lots of apps say that. Ask whether the job would still work without it. A jigsaw works perfectly well without knowing where you are.&rdquo;"],
      ["&ldquo;What do you do if it asks?&rdquo;", "&ldquo;You can say no to a key. Do it with your grown-up, and the app nearly always carries on working.&rdquo;"],
    ],
    warn:"The camera card is there on purpose. A class on a roll will call every key greedy, and that is the wrong lesson. Keys are not bad; a key has to <b>match the job</b>. If they get the camera one right, they have understood the week." },

  { at:"after", kind:"do", scene:"recipe", eyebrow:"Do it together",
    title:"Say it with me.",
    recipe:{ slots:["Real shop","Check it together","Install together"],
      thenLabel:"check", add:["the name","the maker","the downloads","the keys"],
      test:"Not in the real shop? Not coming home." },
    say:"&ldquo;Three steps for every new app, in this order. Say them with me.&rdquo; Do it twice. &ldquo;<b>Real shop.</b> It comes from the shop on your tablet and nowhere else. <b>Check it together</b>, with a grown-up: the name, the maker, the downloads, the keys. <b>Install together.</b>&rdquo; Then the line the game uses. &ldquo;Four eyes catch what two miss. That is not babyish. <b>It is what smart teams do.</b>&rdquo;",
    hear:[
      ["&ldquo;My mum says just do it yourself.&rdquo;", "&ldquo;Then ask her to look for ten seconds. Four eyes still means four eyes.&rdquo;"],
      ["&ldquo;I already have loads of apps.&rdquo;", "&ldquo;Most of them will be completely fine. And tonight&rsquo;s job is about exactly that.&rdquo;"],
    ],
    warn:"Say <b>&ldquo;a grown-up at home, or one here at school&rdquo;</b> out loud. A child whose grown-up is never free should still have a way to check, and they can always bring the name of an app to you." },

  { at:"after", kind:"tell", scene:"risks", safe:true, stamp:"caught", id:"safe", cards:RISKS, eyebrow:"Look what you did",
    title:"All three tricks.<br>Caught.",
    say:"&ldquo;Remember his three tricks from the start? Look at them now.&rdquo; Go along the three. &ldquo;You read the copycat letter by letter. You turned the box over and checked the keys. And you flipped the FREE tag to find the real price. <b>His warehouse is shut.</b>&rdquo; Then, to the whole room, not to anybody in particular:",
    hear:[
      ["Somebody looks worried", "That is who the sentence below is for. Say it to the room, not to them."],
    ],
    warn:"<b>Say this out loud, whether or not anybody asks.</b> Something like: <em>if you already have an app you got on your own, or one with a greedy key, you are not in trouble. Lots of grown-ups have exactly the same. The fix is five minutes with a grown-up, and that is tonight&rsquo;s job.</em> The week asks them to install together, and a child who already has not will otherwise sit with it." },

  { at:"after", kind:"ask", scene:"solo", art:ART.link, id:"cousin", eyebrow:"What would you do?",
    title:"Someone you love<br>sends you a link.",
    say:"&ldquo;Last one, and it is the question from earlier. Your cousin messages you: <em>skip the app shop, get my favourite game straight from this link!</em> What do you do?&rdquo;",
    hear:[
      ["&ldquo;It is fine, it is my cousin.&rdquo;", "&ldquo;Your cousin is lovely. But your cousin did not check that app, and nobody else did either. <b>A link skips the check, whoever sends it.</b>&rdquo;"],
      ["&ldquo;Find it in the real shop.&rdquo;", "&ldquo;Exactly that. Say thanks, then go and find it in the shop on your tablet, with your grown-up.&rdquo;"],
      ["&ldquo;What if it is not in the shop?&rdquo;", "&ldquo;Then it does not come home. Not in the real shop, not coming home.&rdquo;"],
      ["&ldquo;Could it be him pretending to be my cousin?&rdquo;", "&ldquo;It could, that is week 4. But even if it really is your cousin, the answer is the same.&rdquo;"],
    ],
    warn:"This tests whether the rule holds when the person is somebody they trust. <b>Keep the cousin innocent.</b> The lesson is not that family might be fake. It is that a link skips the shop&rsquo;s check, however kind the person sending it." },

  { at:"after", kind:"tell", scene:"tonight", art:ART.key, eyebrow:"Tonight",
    title:"Check one app<br>with a grown-up.",
    under:"Pick one. Does its job need every key?",
    say:"&ldquo;One job tonight. Pick <b>one</b> app you already have, your favourite. Sit down with a grown-up and look at what keys it has: the camera, the microphone, your photos, where you are. Then ask the question: <b>does its job need that?</b> If you find a greedy key, switch it off together.&rdquo;",
    hear:[
      ["&ldquo;I do not know where the keys are.&rdquo;", "&ldquo;Your grown-up might not either. They are in the settings, and finding them together is part of the job.&rdquo;"],
      ["&ldquo;We do not have a tablet.&rdquo;", "&ldquo;Then teach a grown-up the three whiskers: name, maker, downloads. They will use it on their own phone.&rdquo;"],
    ],
    warn:"Give the fallback out loud: not every home has a device or a grown-up who will sit down for it. And do not promise it is one tap. Every phone hides permissions somewhere different, which is exactly why the job is done with a grown-up rather than alone." },
];

export const WEEK_9: Pack = {
  n: 9,
  title: "Spot the Fakes",
  sub: "Apps and Downloads",
  five: FIVE,
  slides: SLIDES,
  games: "The Delivery Dock, The Whisker Check, Flip the Box, The Test Drive, Four Eyes, The Warehouse",
};
