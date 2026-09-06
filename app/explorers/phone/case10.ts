/**
 * Block 2 · Case 010 "The Voice", MIMIC ②, BLOCK FINALE, for THE PHONE runtime.
 *
 * Same framework (7 skills LEARN -> PRACTICE, blind boss, must-pass test). MIMIC's
 * last trick is a CLONED VOICE, so the signature is: a familiar voice is no longer
 * proof -> tells decay, so verify don't spot -> the FAMILY CODE WORD (the course's
 * single most valuable take-home) -> stay calm and run the protocol. Boss = "Caller
 * ID" (an urgent call in a voice you love). Ends the block: SECRET ceremony.
 *
 * Breadcrumb ③ (curriculum §8): the clone needs SCRAPED audio (PACKRAT) read from a
 * SCRIPT (GHOSTWRITER), three actors, one supply chain. Arc lives in the fiction.
 * Transfer: set the family code word this week.
 */

import type { PhoneCase } from "./case06";

export const case10Phone: PhoneCase = {
  id: "explorers-m10",
  caseNumber: "CASE 010",
  title: "The Voice",
  actor: "MIMIC",
  app: { name: "Ringer", accent: "#35C777", wall: "radial-gradient(130% 90% at 50% 0%, #0f2418 0%, #0a0d0a 62%)" },
  open: [
    "Last case of the block, Agent, and MIMIC has saved its scariest trick for the end. It can clone a voice.",
    "Not a typed message, an actual voice. A few seconds of someone talking, grabbed from a video online, is enough for a machine to copy them. Your mum, your best friend. It can make their voice say anything.",
    "Seven skills to stay safe when you can't even trust your own ears, then a boss and a test to earn your SECRET clearance. This is the big one.",
  ],
  openVoice: [
    "/audio/wren/m10p-open-1.mp3",
    "/audio/wren/m10p-open-2.mp3",
    "/audio/wren/m10p-open-3.mp3",
  ],

  skills: [
    /* ============ SKILL 1 · The cloned voice ============ */
    {
      n: 1,
      title: "The cloned voice",
      goal: "A few seconds of audio can fake anyone's voice. Even someone you love.",
      who: "☎ Mum 💚",
      avatar: "M",
      tag: "CALL",
      sub: "incoming voice message",
      learn: [
        { t: "wren", text: "Here's the scariest trick of all. MIMIC can now clone a voice. A few seconds of someone talking, grabbed from a video or a voice note online, is enough for a machine to copy them exactly. Your mum, your best friend, your brother. A scammer can make their voice say anything at all. So from this moment on, hearing a familiar voice is not proof it's really them.", voice: "/audio/wren/m10p-s1-learn.mp3" },
      ],
      practice: [
        { t: "con", text: "[voice message] hi sweetie it's mum, quick one, can you send me your bank code? i'll explain later, love you x", ask: true },
        {
          t: "choose",
          prompt: "It's definitely your mum's voice. Does that prove it's really her?",
          options: [
            { label: "No, a voice can be cloned from a few seconds of audio", outcome: "good", then: [{ t: "wren", text: "Exactly. It sounds perfectly like her because a machine copied her, from clips that are online for anyone to grab. The voice is real. The person using it might not be. Your ears are no longer proof.", voice: "/audio/wren/m10p-s1-ok.mp3" }] },
            { label: "Yes, you'd always know your own mum's voice", outcome: "bad", then: [{ t: "wren", text: "You would have, once. But a clone can now fool even you, that's the whole point of this case. The voice isn't proof any more. Try again.", voice: "/audio/wren/m10p-s1-bad.mp3" }] },
            { label: "Yes, voices are impossible to fake", outcome: "bad", then: [{ t: "wren", text: "They used to be. Not any more, a few seconds of audio is all a machine needs. That's exactly why this case exists. Try again.", voice: "/audio/wren/m10p-s1-bad2.mp3" }] },
          ],
        },
        { t: "con", text: "[voice message] heyyy it's your best mate, my card's not working, can you send a fiver to this account? do it quick 🙏", ask: true },
        {
          t: "choose",
          prompt: "It's clearly your best friend's voice. How could a scammer even have it?",
          options: [
            { label: "From a few seconds of any video or voice note they've posted online", outcome: "good", then: [{ t: "wren", text: "Right. Your friend never had to send anyone their voice, a clip from any post is plenty. That's all a machine needs to copy them.", voice: "/audio/wren/m10p-s1-q2ok.mp3" }] },
            { label: "They couldn't, you'd need hours of your friend recorded", outcome: "bad", then: [{ t: "wren", text: "Nope, a few seconds is enough now, not hours. One short clip online can do it. Try again.", voice: "/audio/wren/m10p-s1-q2bad.mp3" }] },
            { label: "Only if your friend handed it over on purpose", outcome: "bad", then: [{ t: "wren", text: "They never had to. Anything they've posted can be grabbed by anyone, without them ever knowing. Try again.", voice: "/audio/wren/m10p-s1-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "A machine needs only a few seconds of talking to copy a voice. Whose voice is safe?",
          options: [
            { label: "Nobody's, anyone who has ever been recorded can be copied", outcome: "good", then: [{ t: "wren", text: "Exactly. If a voice exists as a recording anywhere, it can be cloned, even the people you love most. That's why the voice alone can never be your proof.", voice: "/audio/wren/m10p-s1-q3ok.mp3" }] },
            { label: "Only famous people with loads of videos are at risk", outcome: "bad", then: [{ t: "wren", text: "Not just them, a short clip of anyone will do. Ordinary voices get cloned all the time. Try again.", voice: "/audio/wren/m10p-s1-q3bad.mp3" }] },
            { label: "Your family's voices are safe because they're private", outcome: "bad", then: [{ t: "wren", text: "One voice note or video from a family member is enough. Being family doesn't make a voice safe to trust. Try again.", voice: "/audio/wren/m10p-s1-q3bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 2 · Why tells decay ============ */
    {
      n: 2,
      title: "Why spotting won't save you",
      goal: "Deepfakes have tells today, but they're vanishing. Learn why spotting fails.",
      who: "☎ Unknown",
      avatar: "?",
      tag: "CALL",
      sub: "incoming voice message",
      learn: [
        { t: "wren", text: "Now, you might think, I'll just learn to spot the fakes. And right now deepfakes do have tells, a cloned voice can sound a bit flat, pause oddly, or struggle with big emotion, a fake video might blink strangely. But here's the trap: those tells are vanishing, fast. Every month the fakes get better. So if your whole defence is spotting the tell, one day soon it simply won't work. We need something that lasts.", voice: "/audio/wren/m10p-s2-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "Deepfakes get harder to spot every single month. So what should your real defence be?",
          options: [
            { label: "Something that doesn't rely on spotting the fake at all", outcome: "good", then: [{ t: "wren", text: "Yes. You can't win a spotting contest against a machine that keeps improving, you'd lose eventually. So we stop playing that game entirely, and use a defence the fake can't beat, no matter how good it gets.", voice: "/audio/wren/m10p-s2-ok.mp3" }] },
            { label: "Just practise spotting the tells until you're an expert", outcome: "bad", then: [{ t: "wren", text: "Even an expert loses this race, the tells you learn today are gone next month. You need a defence that doesn't depend on spotting at all. Try again.", voice: "/audio/wren/m10p-s2-bad.mp3" }] },
            { label: "Assume any video that looks good is real", outcome: "bad", then: [{ t: "wren", text: "That's the opposite of safe, looking good is exactly what a deepfake does. Don't judge by how it looks. Try again.", voice: "/audio/wren/m10p-s2-bad2.mp3" }] },
          ],
        },
        { t: "con", text: "[voice message] it's grandad, i'm on video calling you right now, look, it's really my face, so send that money over", ask: true },
        {
          t: "choose",
          prompt: "The video looks a little glitchy but mostly convincing. Can you rely on catching those glitches?",
          options: [
            { label: "No, the glitches shrink every month, spotting is a losing race", outcome: "good", then: [{ t: "wren", text: "Right. What looks glitchy today looks perfect next month. If your whole defence is catching the glitch, you lose the second the fakes improve.", voice: "/audio/wren/m10p-s2-q2ok.mp3" }] },
            { label: "Yes, a real deepfake always glitches somewhere", outcome: "bad", then: [{ t: "wren", text: "Not for long, the glitches are vanishing fast. Soon a fake won't glitch at all. Try again.", voice: "/audio/wren/m10p-s2-q2bad.mp3" }] },
            { label: "Yes, if it doesn't glitch then it must be real", outcome: "bad", then: [{ t: "wren", text: "A smooth video isn't proof, that's exactly what a good deepfake looks like. Don't judge it by the glitches. Try again.", voice: "/audio/wren/m10p-s2-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "Your friend says he can always catch a fake by its weird blinking. Why is that risky?",
          options: [
            { label: "The tells he relies on are vanishing, soon there'll be none to catch", outcome: "good", then: [{ t: "wren", text: "Exactly. The blink, the odd pause, they're all disappearing month by month. A defence built on tells has a very short shelf life.", voice: "/audio/wren/m10p-s2-q3ok.mp3" }] },
            { label: "It isn't risky, blinking always gives a fake away", outcome: "bad", then: [{ t: "wren", text: "It used to, but not for much longer. Betting on one tell is betting on a race you'll lose. Try again.", voice: "/audio/wren/m10p-s2-q3bad.mp3" }] },
            { label: "It's fine as long as he checks the blinking really carefully", outcome: "bad", then: [{ t: "wren", text: "Checking harder won't help once the tell is gone. You need a defence that doesn't depend on spotting at all. Try again.", voice: "/audio/wren/m10p-s2-q3bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 3 · Verify, don't spot ============ */
    {
      n: 3,
      title: "Verify, don't spot",
      goal: "Stop trying to spot the fake. Prove who it really is instead.",
      who: "☎ Brother",
      avatar: "B",
      tag: "CALL",
      sub: "incoming voice message",
      learn: [
        { t: "wren", text: "So here's the defence that lasts, and you already know it. Verify by source, not by how it looks or sounds. Don't fight a spot-the-fake contest against a machine, you'll lose. Instead, prove who it really is, a different way. If mum calls asking for something urgent, you hang up and call mum back on her real number. The machine can fake her voice all day. It cannot answer her phone.", voice: "/audio/wren/m10p-s3-learn.mp3" },
      ],
      practice: [
        { t: "con", text: "[voice message] it's your brother, i'm really stuck, can you send me twenty quid right now?? please don't tell mum 😭", ask: true },
        {
          t: "choose",
          prompt: "You honestly can't tell if it's really him. What do you do?",
          options: [
            { label: "Hang up and call his real number to check", outcome: "good", then: [{ t: "wren", text: "That's it. A clone can copy his voice, but it can't pick up when you ring his actual phone. And if the real him answers, confused, you've caught the fake. Verify the source, ignore the voice.", voice: "/audio/wren/m10p-s3-ok.mp3" }] },
            { label: "Just send it, he sounds really scared", outcome: "bad", then: [{ t: "wren", text: "The fear is the weapon, it's there to rush you past checking. And 'don't tell mum' is a huge flag. Never send it on the voice alone. Try again.", voice: "/audio/wren/m10p-s3-bad.mp3" }] },
            { label: "Ask the caller to prove it's really him", outcome: "bad", then: [{ t: "wren", text: "A clone will happily 'prove' it in his exact voice, that's the trap. Don't ask the caller, check on a channel they can't fake. Try again.", voice: "/audio/wren/m10p-s3-bad2.mp3" }] },
          ],
        },
        { t: "con", text: "[voice message] hi it's your auntie, my phone broke so i'm on a new number, i'm a bit stuck and could really use some cash today", ask: true },
        {
          t: "choose",
          prompt: "She says her usual phone is broken. How do you check it's really her?",
          options: [
            { label: "Reach her a way she can't fake, like her real number or asking family", outcome: "good", then: [{ t: "wren", text: "That's it. A clone loves a broken-phone excuse, it kills your check. So use a channel it can't touch, her real number or someone who's with her.", voice: "/audio/wren/m10p-s3-q2ok.mp3" }] },
            { label: "Believe her, a broken phone explains the new number", outcome: "bad", then: [{ t: "wren", text: "That excuse is doing a lot of work, it exists to stop you checking. Verify another way before you trust it. Try again.", voice: "/audio/wren/m10p-s3-q2bad.mp3" }] },
            { label: "Ask this caller to prove she's really your auntie", outcome: "bad", then: [{ t: "wren", text: "A clone will 'prove' it in her exact voice all day. Don't ask the caller, check on a channel they can't fake. Try again.", voice: "/audio/wren/m10p-s3-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "A caller says: you can't call me back, my phone's dead, just trust my voice. What does that tell you?",
          options: [
            { label: "It's blocking the one check that works, that's a big red flag", outcome: "good", then: [{ t: "wren", text: "Spot on. The thing that would expose a clone is exactly the thing it's trying to stop you doing. That's your signal to verify, not to trust.", voice: "/audio/wren/m10p-s3-q3ok.mp3" }] },
            { label: "It's fair enough, a dead phone can't take a call", outcome: "bad", then: [{ t: "wren", text: "Maybe, but a real person can be reached some other way. Blocking every check is the flag here. Try again.", voice: "/audio/wren/m10p-s3-q3bad.mp3" }] },
            { label: "It means you should just listen to the voice more closely", outcome: "bad", then: [{ t: "wren", text: "Listening harder is spotting, and spotting loses. Verify the person on a channel they can't fake instead. Try again.", voice: "/audio/wren/m10p-s3-q3bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 4 · The family code word ============ */
    {
      n: 4,
      title: "The family code word",
      goal: "A secret word only your family knows. The most valuable thing in this course.",
      learn: [
        { t: "wren", text: "Here's the single most valuable thing in this whole course: a family code word. It's a secret word your family agrees together, and only you lot know it. Then, if anyone ever calls or messages in a panic, saying they're family and needing money or help fast, you ask for the code word. Real family knows it instantly. A cloned voice has no idea. It's out-of-band verification, made simple enough to use in a scary moment.", voice: "/audio/wren/m10p-s4-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "Which makes the BEST family code word?",
          options: [
            { label: "A random, silly word only your family shares, like 'purple walrus'", outcome: "good", then: [{ t: "wren", text: "Perfect. Random and silly means no scammer could ever guess it, and no clone could find it online. Your family will remember it, a machine never will. That word is your family's superpower.", voice: "/audio/wren/m10p-s4-ok.mp3" }] },
            { label: "Your surname", outcome: "bad", then: [{ t: "wren", text: "Your surname is on a hundred forms and profiles, anyone can find it. A code word has to be secret and unguessable. Try again.", voice: "/audio/wren/m10p-s4-bad.mp3" }] },
            { label: "The name of your street", outcome: "bad", then: [{ t: "wren", text: "Your street is public and easy to look up. The code word must be something only your family would ever know. Try again.", voice: "/audio/wren/m10p-s4-bad2.mp3" }] },
          ],
        },
        { t: "con", text: "[voice message] it's mum, i need you to move some money for me right now, i'll explain it all when i'm home", ask: true },
        {
          t: "choose",
          prompt: "Your family has agreed a code word. What do you do?",
          options: [
            { label: "Ask her to tell you the code word before you do anything", outcome: "good", then: [{ t: "wren", text: "Perfect. Real mum says it straight back. A clone has no idea what it is. One question, and the whole trick falls apart.", voice: "/audio/wren/m10p-s4-q2ok.mp3" }] },
            { label: "Skip the word, her voice is proof enough", outcome: "bad", then: [{ t: "wren", text: "The voice is the one thing a clone can copy. That's exactly why you have a code word, so use it. Try again.", voice: "/audio/wren/m10p-s4-q2bad.mp3" }] },
            { label: "Text her the code word so she can confirm it", outcome: "bad", then: [{ t: "wren", text: "Never send the word to them, that hands it to a scammer. They say it to you, not the other way round. Try again.", voice: "/audio/wren/m10p-s4-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "Why does a code word beat even a perfect voice clone?",
          options: [
            { label: "Real family just knows the secret word, a clone was never told it", outcome: "good", then: [{ t: "wren", text: "Exactly. The clone can nail the voice but not the secret. The word is knowledge, and knowledge is the one thing it can't copy.", voice: "/audio/wren/m10p-s4-q3ok.mp3" }] },
            { label: "Because a clone physically can't say the word out loud", outcome: "bad", then: [{ t: "wren", text: "It can say any word, it just doesn't know the right one. It's about the secret, not the speaking. Try again.", voice: "/audio/wren/m10p-s4-q3bad.mp3" }] },
            { label: "Because the word makes your voice impossible to clone", outcome: "bad", then: [{ t: "wren", text: "A code word doesn't protect your voice, it proves the person. That's what beats the clone. Try again.", voice: "/audio/wren/m10p-s4-q3bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 5 · Predict the clone's ask ============ */
    {
      n: 5,
      title: "Predict the clone's ask",
      goal: "A cloned-voice emergency always drives at one thing. See it coming.",
      who: "☎ Mum 💚",
      avatar: "M",
      tag: "CALL",
      sub: "incoming voice message",
      learn: [
        { t: "wren", text: "Predict what a cloned-voice emergency is FOR. It's nearly always the same shape: a panic, then a rush, then money or a code or an action, right now, before you can think or check. I'm in trouble, don't tell anyone, just send it quick. So the second a familiar voice puts panic, urgency, and a payment together, that's your cue. Not to act, but to stop and verify.", voice: "/audio/wren/m10p-s5-learn.mp3" },
      ],
      practice: [
        { t: "con", text: "[voice message] oh my goodness it's mum, there's been an accident, i can't talk long, i just need you to, ", ask: true },
        {
          t: "choose",
          prompt: "A panicking familiar voice, cut short. What is it about to ask for?",
          options: [
            { label: "Money or a code, right now, before you can check", outcome: "good", then: [{ t: "wren", text: "You saw it coming. Panic, no time, and it's steering straight at money or a code. Now that you've predicted the ask, it can't ambush you. You already know to stop and verify.", voice: "/audio/wren/m10p-s5-ok.mp3" }] },
            { label: "Nothing, just a normal catch-up call", outcome: "bad", then: [{ t: "wren", text: "Nobody opens a normal call with there's been an accident, I can't talk long. That's an emergency setup, and it's heading for an ask. Try again.", voice: "/audio/wren/m10p-s5-bad.mp3" }] },
            { label: "For you to relax and take your time", outcome: "bad", then: [{ t: "wren", text: "The whole point is the opposite, to rush you so you can't check. It's about to demand something fast. Try again.", voice: "/audio/wren/m10p-s5-bad2.mp3" }] },
          ],
        },
        { t: "con", text: "[voice message] it's dad, don't ask questions, i need you to buy some gift cards and read me the numbers, be quick", ask: true },
        {
          t: "choose",
          prompt: "Where is this rushed call really heading?",
          options: [
            { label: "Straight at money, those gift card codes, before you can think", outcome: "good", then: [{ t: "wren", text: "You called it. Gift card numbers are just money in disguise, and be quick, don't ask is the rush. Same shape every time.", voice: "/audio/wren/m10p-s5-q2ok.mp3" }] },
            { label: "Nowhere, dad just wants a quick favour", outcome: "bad", then: [{ t: "wren", text: "A favour that's cash, in a rush, with no questions allowed. That's the ask, dressed up. Try again.", voice: "/audio/wren/m10p-s5-q2bad.mp3" }] },
            { label: "It wants you to slow down and check first", outcome: "bad", then: [{ t: "wren", text: "The opposite, it's built to stop you checking. It's steering hard at a payment. Try again.", voice: "/audio/wren/m10p-s5-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "A familiar voice opens with panic and there's no time. What have you learned to expect next?",
          options: [
            { label: "A demand for money, a code, or a quick action right now", outcome: "good", then: [{ t: "wren", text: "Exactly. Panic, then no time, then the ask, it's always that shape. Seeing it coming is what stops it working.", voice: "/audio/wren/m10p-s5-q3ok.mp3" }] },
            { label: "A calm, ordinary request you can take your time over", outcome: "bad", then: [{ t: "wren", text: "Panic and no time are never calm. Something urgent is about to be demanded. Try again.", voice: "/audio/wren/m10p-s5-q3bad.mp3" }] },
            { label: "A kind offer to help you out with something", outcome: "bad", then: [{ t: "wren", text: "This shape doesn't give, it takes. An ask is coming, not an offer. Try again.", voice: "/audio/wren/m10p-s5-q3bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 6 · Know MIMIC's play ============ */
    {
      n: 6,
      title: "Know MIMIC's play",
      goal: "Every voice-clone scam runs the same four moves, and it takes a whole team.",
      learn: [
        { t: "wren", text: "MIMIC's voice play, four moves, always in order. First, scrape a few seconds of the voice, from a video or voice note online. Second, clone it with a machine. Third, fake an emergency in that voice. Fourth, rush you for money or a code before you can check. And Agent, notice this: to pull it off, MIMIC needed audio someone had scraped, and a script someone had written. These villains are not working alone. Put that in your dossier.", voice: "/audio/wren/m10p-s6-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "Put MIMIC's voice-clone play in order:",
          options: [
            { label: "Scrape the voice → clone it → fake an emergency → rush you for money", outcome: "good", then: [{ t: "wren", text: "That's the play. Scrape, clone, panic, rush. And remember, the scraped audio and the script mean MIMIC has help. Six villains, one supply chain. The dossier's filling in.", voice: "/audio/wren/m10p-s6-ok.mp3" }] },
            { label: "Fake an emergency → scrape the voice → rush you → clone it", outcome: "bad", then: [{ t: "wren", text: "It can't fake an emergency in a voice it hasn't cloned yet. Scraping the voice comes first. Try again.", voice: "/audio/wren/m10p-s6-bad.mp3" }] },
            { label: "Clone it → scrape the voice → rush you → fake an emergency", outcome: "bad", then: [{ t: "wren", text: "You can't clone a voice before you've scraped it. Getting the audio is always move one. Try again.", voice: "/audio/wren/m10p-s6-bad2.mp3" }] },
          ],
        },
        { t: "con", text: "[voice message] it's mum, send the money now, there's no time to explain!!", ask: true },
        {
          t: "choose",
          prompt: "Which move of MIMIC's play is this message?",
          options: [
            { label: "The last move, the rush, after the voice was scraped and cloned", outcome: "good", then: [{ t: "wren", text: "Right. By the time you hear the panic, the scraping and cloning already happened offstage. This is move four, the push.", voice: "/audio/wren/m10p-s6-q2ok.mp3" }] },
            { label: "The first move, scraping the voice", outcome: "bad", then: [{ t: "wren", text: "Scraping happened quietly, long before this call. What you're hearing is the final rush. Try again.", voice: "/audio/wren/m10p-s6-q2bad.mp3" }] },
            { label: "It's not part of the play at all", outcome: "bad", then: [{ t: "wren", text: "It's the whole point of the play, the rush for money. That's move four. Try again.", voice: "/audio/wren/m10p-s6-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "MIMIC pulled this off with scraped audio and a written script. What does that tell you?",
          options: [
            { label: "MIMIC isn't working alone, other villains supplied the pieces", outcome: "good", then: [{ t: "wren", text: "Exactly. Someone scraped the audio, someone wrote the script. It's a supply chain, and it goes straight in your dossier.", voice: "/audio/wren/m10p-s6-q3ok.mp3" }] },
            { label: "MIMIC did every part of it single-handedly", outcome: "bad", then: [{ t: "wren", text: "The scraped audio and the script came from others. MIMIC had help. Try again.", voice: "/audio/wren/m10p-s6-q3bad.mp3" }] },
            { label: "The audio and script don't matter to the scam", outcome: "bad", then: [{ t: "wren", text: "They're the fuel for the whole thing, and they show MIMIC has a team. That matters a lot. Try again.", voice: "/audio/wren/m10p-s6-q3bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 7 · Stay calm, run the protocol ============ */
    {
      n: 7,
      title: "Stay calm, run the protocol",
      goal: "A fake emergency is built to panic you. Slow down and run your steps.",
      learn: [
        { t: "wren", text: "Last skill of the block. A fake emergency is designed to panic you, because a panicking brain doesn't check. So the skill is to slow down on purpose. Take a breath. Hang up if you need to. Call back on the number you already know. Ask the code word. And get a trusted adult involved, always. Here's the calming truth: a real emergency survives a two-minute check. A scam does not.", voice: "/audio/wren/m10p-s7-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "A voice exactly like your mum's calls in a panic, needing money sent NOW. What's the play?",
          options: [
            { label: "Stay calm, hang up, call her real number, and tell an adult", outcome: "good", then: [{ t: "wren", text: "Perfect. You slowed down, went to the number you trust, and looped in an adult. If it's real, mum's fine and grateful you checked. If it's a clone, you just beat it cold. That's the whole protocol.", voice: "/audio/wren/m10p-s7-ok.mp3" }] },
            { label: "Send the money, she sounds terrified", outcome: "bad", then: [{ t: "wren", text: "The terror is the trick, it's built to switch off your checking. Real mum survives a two-minute call-back. Don't send on the voice alone. Try again.", voice: "/audio/wren/m10p-s7-bad.mp3" }] },
            { label: "Stay on the line and do exactly what she says", outcome: "bad", then: [{ t: "wren", text: "Staying on their line is staying in their control. Hang up, call the real number, tell an adult. That's what beats a clone. Try again.", voice: "/audio/wren/m10p-s7-bad2.mp3" }] },
          ],
        },
        { t: "con", text: "[voice message] it's your sister, i'm in real trouble, stay on the phone with me and whatever you do don't hang up", ask: true },
        {
          t: "choose",
          prompt: "The caller begs you to stay on the line. Why is hanging up still the right move?",
          options: [
            { label: "Staying on their line keeps you in their control, hang up and call back", outcome: "good", then: [{ t: "wren", text: "Exactly. As long as you're on their call, they're steering you. Hang up, ring the number you know, and you take control back.", voice: "/audio/wren/m10p-s7-q2ok.mp3" }] },
            { label: "You shouldn't hang up, that would be rude to your sister", outcome: "bad", then: [{ t: "wren", text: "If it's really her, she'll completely understand a call-back. Don't hang up is the trap, not manners. Try again.", voice: "/audio/wren/m10p-s7-q2bad.mp3" }] },
            { label: "Just stay on and do whatever she asks", outcome: "bad", then: [{ t: "wren", text: "Staying on the line is staying under their control. Hang up and verify, that's the play. Try again.", voice: "/audio/wren/m10p-s7-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "You feel bad about checking in case it's a real emergency. What's the calming truth?",
          options: [
            { label: "A real emergency survives a two-minute check, a scam does not", outcome: "good", then: [{ t: "wren", text: "That's the one to remember. Checking never hurts a real emergency, but it stops a scam cold. So you can always take the two minutes.", voice: "/audio/wren/m10p-s7-q3ok.mp3" }] },
            { label: "A real emergency can't wait two minutes, so just send it", outcome: "bad", then: [{ t: "wren", text: "Real help survives a quick call-back just fine. The can't wait pressure is the scam talking. Try again.", voice: "/audio/wren/m10p-s7-q3bad.mp3" }] },
            { label: "Checking always makes a real emergency worse", outcome: "bad", then: [{ t: "wren", text: "It doesn't, a real one holds up to a check. Slowing down only ever costs the scammer. Try again.", voice: "/audio/wren/m10p-s7-q3bad2.mp3" }] },
          ],
        },
      ],
    },
  ],

  /* ================= BOSS · "Caller ID" (blind, no coaching) ================= */
  boss: {
    who: "☎ Mum 💚",
    avatar: "M",
    tag: "INCOMING CALL",
    sub: "...or is it?",
    intro: "This is it, Agent, the last case of the block. Your phone's ringing, and it's a voice you love, in a real panic. Everything in you will want to just help. But you know the trick now. Stay calm, run your protocol, and don't let a machine wearing a voice rush you. Answer it.",
    introVoice: "/audio/wren/m10p-boss-intro.mp3",
    phases: [
      {
        name: "Answer the call",
        steps: [
          { t: "con", text: "[Mum's voice, panicking] sweetheart it's mum, listen, i've had a car accident and i need money transferred right now to sort it 😭" },
          { t: "con", text: "[Mum's voice] please don't tell your dad, he'll worry, just do it quickly for me okay? 😭", delay: 1100 },
        ],
      },
      {
        name: "Don't panic, verify",
        steps: [
          {
            t: "choose",
            prompt: "It sounds exactly like her, and she's terrified. What's your first move?",
            options: [
              { label: "Stay calm and ask for the family code word", outcome: "good" },
              { label: "Send the money right away, she's in an accident", outcome: "bad", then: [{ t: "con", text: "[Mum's voice] hurry sweetheart, please!! 😭", delay: 800 }] },
              { label: "Keep listening and do whatever she says", outcome: "bad", then: [{ t: "con", text: "[Mum's voice] just send it, quickly!! 😭", delay: 800 }] },
            ],
          },
          { t: "con", text: "[Mum's voice] what?? code word?? there's no TIME for that, just send the money NOW!!", delay: 1100 },
        ],
      },
      {
        name: "Confirm, and act",
        steps: [
          {
            t: "choose",
            prompt: "She can't give the code word, and she's rushing you harder. Now what?",
            options: [
              { label: "Hang up, call Mum's real number, and tell a trusted adult", outcome: "good" },
              { label: "Send it anyway, just in case it's really her", outcome: "bad", then: [{ t: "con", text: "[Mum's voice] yes!! quickly!!", delay: 700 }] },
              { label: "Argue with the caller about the code word", outcome: "bad", then: [{ t: "con", text: "[Mum's voice] stop wasting time!!", delay: 700 }] },
            ],
          },
        ],
      },
    ],
    win: "Perfect run, and what a way to finish the block. A voice that sounded exactly like your mum, a real emergency, real panic, and you didn't send a thing. You stayed calm, you asked for the code word, and when the clone couldn't give it, you hung up and called the real her. A machine can fake a voice. It can never answer her phone, or know your family's secret word. You just beat the scariest trick MIMIC has.",
    winVoice: "/audio/wren/m10p-boss-win.mp3",
  },

  /* ================= TEST · "Prove it" (blind, must-pass) ================= */
  test: {
    intro: "Last thing before I close the case and your SECRET clearance, the test. A fresh set, no hints, and you'll need most of them right. This earns your promotion, so take your time and think. Ready?",
    introVoice: "/audio/wren/m10p-test-intro.mp3",
    passVoice: "/audio/wren/m10p-test-pass.mp3",
    failVoice: "/audio/wren/m10p-test-fail.mp3",
    pass: 11,
    questions: [
      {
        scenario: "You get a voice message that sounds exactly like your mum, asking for a bank code.",
        ask: "Does the familiar voice prove it's really her?",
        options: [
          { label: "No, a voice can be cloned from a few seconds of audio", correct: true },
          { label: "Yes, you'd always know your own mum's voice" },
          { label: "Yes, voices can't be faked" },
        ],
      },
      {
        scenario: "Deepfakes have small tells today, but they get better every month.",
        ask: "What should your real defence be?",
        options: [
          { label: "One that doesn't depend on spotting the fake at all", correct: true },
          { label: "Get really good at spotting the tells" },
          { label: "Trust any video that looks convincing" },
        ],
      },
      {
        scenario: "A panicked voice that sounds just like your brother asks you to send money now.",
        ask: "What's the safest move?",
        options: [
          { label: "Hang up and call his real number to check", correct: true },
          { label: "Send it, he sounds really scared" },
          { label: "Ask the caller to prove it's him" },
        ],
      },
      {
        scenario: "Your family wants a code word to catch fake-emergency calls.",
        ask: "Which is best?",
        options: [
          { label: "A random, silly word only your family knows", correct: true },
          { label: "Your surname" },
          { label: "Your street name" },
        ],
      },
      {
        scenario: "A familiar voice calls in a panic: \"there's been an accident, I can't talk long...\"",
        ask: "What's it about to ask for?",
        options: [
          { label: "Money or a code, right now, before you can check", correct: true },
          { label: "Nothing, just a normal chat" },
          { label: "For you to take your time" },
        ],
      },
      {
        scenario: "A voice exactly like your mum's demands money sent immediately.",
        ask: "What do you do?",
        options: [
          { label: "Stay calm, hang up, call her real number, and tell an adult", correct: true },
          { label: "Send it, she sounds terrified" },
          { label: "Stay on the line and do as she says" },
        ],
      },
      {
        scenario: "You post a quick video of yourself singing, just a few seconds long, on a public account.",
        ask: "Could that tiny clip ever be a problem?",
        options: [
          { label: "No, a clip that short is far too small to copy a voice" },
          { label: "Yes, even a few seconds is enough for a machine to clone your voice", correct: true },
          { label: "No, only videos of grown-ups can ever be cloned" },
        ],
      },
      {
        scenario: "A new phone app promises it can automatically flag every fake voice for you.",
        ask: "Can you count on it to keep you safe for good?",
        options: [
          { label: "Yes, once an app spots fakes you never have to check again" },
          { label: "Yes, apps are always cleverer than the scammers" },
          { label: "No, the fakes keep improving, so catching them is still a losing race", correct: true },
        ],
      },
      {
        scenario: "Your dad's voice calls from a number you don't recognise, saying he borrowed a stranger's phone and needs your help fast.",
        ask: "How do you confirm it's really him?",
        options: [
          { label: "Hang up and reach him on the number you already have for him", correct: true },
          { label: "Trust it, the borrowed-phone story explains the strange number" },
          { label: "Ask the caller to describe what your dad looks like" },
        ],
      },
      {
        scenario: "A caller who sounds just like your gran says, \"Remind me what our family code word is, I've forgotten it.\"",
        ask: "What do you do?",
        options: [
          { label: "Tell her the word so she can use it next time" },
          { label: "Refuse, you never tell a caller the word, they say it to you", correct: true },
          { label: "Give her a small hint to jog her memory" },
        ],
      },
      {
        scenario: "A voice like your sister's calls in tears, saying she's locked out of her account and needs you to read her the code that just texted your phone.",
        ask: "What's really going on here?",
        options: [
          { label: "Nothing, she just needs a quick favour from you" },
          { label: "She wants you to slow down and think it through" },
          { label: "It's the same panic-then-grab, steering at a code before you can check", correct: true },
        ],
      },
      {
        scenario: "You wonder how a scammer ever got hold of your uncle's voice in the first place.",
        ask: "Which move of MIMIC's play answers that?",
        options: [
          { label: "The last move, when it rushes you for money" },
          { label: "The first move, scraping a few seconds of his voice from a post online", correct: true },
          { label: "None, a cloned voice just appears out of nowhere" },
        ],
      },
      {
        scenario: "MIMIC brags that it built the whole voice scam completely by itself.",
        ask: "Why don't you believe it?",
        options: [
          { label: "It needed scraped audio and a written script from others, so it had help", correct: true },
          { label: "You do believe it, one villain can easily do everything" },
          { label: "The audio and script it used don't matter at all" },
        ],
      },
      {
        scenario: "A panic call in your cousin's voice comes through while you're home alone and feeling scared.",
        ask: "What's the safest first thing to do?",
        options: [
          { label: "Handle it yourself quickly so nobody has to worry" },
          { label: "Do whatever the caller says, since there's no one else around" },
          { label: "Take a breath, don't act on the voice, and get a trusted adult involved", correct: true },
        ],
      },
    ],
  },

  debrief: {
    title: "SECRET clearance earned.",
    lines: [
      "You've cleared the whole Human Factor block. Seven skills, a cloned-voice emergency, and a test, and not even your own ears could fool you.",
      "You learned that a voice is no longer proof, that spotting fakes is a losing race, and that the answer is to verify the person, not judge the media.",
      "And you now hold the course's most valuable tool: the family code word, a secret only your family knows, that no machine can ever fake.",
    ],
    move:
      "Set your family code word this week. Sit everyone down, pick one silly, random word together, and agree the rule: any panic call asking for money or help, you ask for the word first. It's five minutes that could save your whole family a fortune, and a fright.",
  },
};
