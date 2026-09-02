/**
 * Block 2 · Case 007 "Borrowed Faces", MIMIC ①, authored for THE PHONE runtime.
 *
 * Same framework as Case 001/006 (7 skills LEARN -> PRACTICE, blind boss, must-pass
 * test), a DIFFERENT game (anti-sameness §0): no lever-pad here. MIMIC's trick is
 * wearing a face you trust (a hijacked real account), so the signature moves are
 * spot-the-weird-ask -> verify on another channel -> a check-question only the real
 * friend knows -> read the dodge. Boss = "Two Best Friends" (tell the real from the
 * stolen). Curriculum row M07: hijacked accounts / out-of-band verification / the
 * weird-ask detector.
 */

import type { PhoneCase } from "./case06";

export const case07Phone: PhoneCase = {
  id: "explorers-m07",
  caseNumber: "CASE 007",
  title: "Borrowed Faces",
  actor: "MIMIC",
  app: { name: "Loop", accent: "#9B7BFF", wall: "radial-gradient(130% 90% at 50% 0%, #171233 0%, #0b0b14 62%)" },
  open: [
    "Next case, Agent, and a new kind of enemy. This one's name is MIMIC, and MIMIC doesn't send you a dodgy link.",
    "MIMIC steals a real account, one of your actual friends, and wears it like a mask. Same name, same photo, every chat you've ever had. So the message really is from your friend's account. That's what makes it so dangerous.",
    "Seven skills to tell a friend from a thief wearing their face, then a boss and a test. Let's make you unfoolable.",
  ],
  openVoice: [
    "/audio/wren/m07p-open-1.mp3",
    "/audio/wren/m07p-open-2.mp3",
    "/audio/wren/m07p-open-3.mp3",
  ],

  skills: [
    /* ============ SKILL 1 · Trust doesn't transfer ============ */
    {
      n: 1,
      title: "Trust doesn't transfer",
      goal: "A message from your friend's real account still might not be your friend. Learn why.",
      who: "Priya ✨",
      avatar: "P",
      sub: "best friend · online now",
      learn: [
        { t: "wren", text: "Here's MIMIC's whole trick. When an account gets stolen, the thief inherits everything: the name, the photo, every chat you two ever had. So the account is real. The person typing might not be. Trust belongs to your friend, not to the account, and a thief can hold the account. Watch.", voice: "/audio/wren/m07p-s1-learn.mp3" },
      ],
      practice: [
        { t: "con", text: "heyy quick one, can you send me your Roblox login? mine's glitched and i wanna check something on your account 👀", ask: true },
        {
          t: "choose",
          prompt: "This is really Priya's account. So what's the red flag?",
          options: [
            { label: "A real friend never needs YOUR login", outcome: "good", then: [{ t: "wren", text: "Exactly. It doesn't matter how friendly it is or that it's really her account. The moment a 'friend' asks for something only a thief would want, that's your flag. The ask gives it away, not the tone.", voice: "/audio/wren/m07p-s1-ok.mp3" }] },
            { label: "She said 'quick one', that's rushing you", outcome: "bad", then: [{ t: "wren", text: "That's a small nudge, but not the real tell. Look at what she's actually asking you to hand over. Try again.", voice: "/audio/wren/m07p-s1-bad.mp3" }] },
            { label: "She used the 👀 emoji", outcome: "bad", then: [{ t: "wren", text: "Emojis prove nothing, thieves use them too. Look at the ask itself, not the decoration. Try again.", voice: "/audio/wren/m07p-s1-bad2.mp3" }] },
          ],
        },
        { t: "con", text: "it's DEFINITELY me lol, look, it's my account with all our old chats 😄 so just trust me and send your password x", ask: true },
        {
          t: "choose",
          prompt: "The account really is your friend's. So what can you actually trust here?",
          options: [
            { label: "Only the person's actions, never the account itself", outcome: "good", then: [{ t: "wren", text: "Right. The account being real proves nothing. A real friend never asks for your password, so the ask tells you it's a thief.", voice: "/audio/wren/m07p-s1-q2ok.mp3" }] },
            { label: "The old chats, they prove it's really her", outcome: "bad", then: [{ t: "wren", text: "A thief inherits every old chat the moment they steal the account. Old messages prove the account, not the person. Try again.", voice: "/audio/wren/m07p-s1-q2bad.mp3" }] },
            { label: "The fact she typed 'trust me'", outcome: "bad", then: [{ t: "wren", text: "Anyone can type 'trust me', a thief most of all. Trust is earned by the person, not claimed in a message. Try again.", voice: "/audio/wren/m07p-s1-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "Why can a message from your friend's REAL account still be a thief?",
          options: [
            { label: "A thief can steal the account and wear it like a mask", outcome: "good", then: [{ t: "wren", text: "Exactly. A stolen account keeps the real name, photo and chats, but a thief is holding it now. Real account, wrong person.", voice: "/audio/wren/m07p-s1-q3ok.mp3" }] },
            { label: "It can't, a real account always means a real friend", outcome: "bad", then: [{ t: "wren", text: "That's the exact trap. A stolen account is real but held by a thief. The account being real proves nothing. Try again.", voice: "/audio/wren/m07p-s1-q3bad.mp3" }] },
            { label: "Only if the profile photo has changed", outcome: "bad", then: [{ t: "wren", text: "The photo stays the same, that's what makes it dangerous. You judge by the ask, never the picture. Try again.", voice: "/audio/wren/m07p-s1-q3bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 2 · The weird ask ============ */
    {
      n: 2,
      title: "The weird ask",
      goal: "Real friends don't ask for codes, money, or secrecy. Learn to spot the ask that doesn't fit.",
      who: "Priya ✨",
      avatar: "P",
      sub: "best friend · online now",
      learn: [
        { t: "wren", text: "So how do you tell a friend from a thief wearing their face? Not by how nice they are, a thief can be lovely. You tell them by the ASK. Real friends don't suddenly need your password, a code from your phone, gift cards, or for you to keep it all secret. When the ask gets weird, the friendly face stops mattering.", voice: "/audio/wren/m07p-s2-learn.mp3" },
      ],
      practice: [
        { t: "con", text: "omg can you buy me a £20 google play card real quick?? i'll pay you back tomorrow i promise 🙏 oh and don't mention it to my mum x", ask: true },
        {
          t: "choose",
          prompt: "How many weird-ask flags are stacked in this one message?",
          options: [
            { label: "Three: money, a rush, and secrecy", outcome: "good", then: [{ t: "wren", text: "All three. Money you can't easily get back, a rush so you don't think, and 'don't tell an adult', which is a flag on its own. Any one of those from a friend is odd. All three together is a thief.", voice: "/audio/wren/m07p-s2-ok.mp3" }] },
            { label: "None, friends lend each other money", outcome: "bad", then: [{ t: "wren", text: "A real mate might, but not a stranger's gift card, in a rush, kept secret from adults. Read it again and count the odd bits. Try again.", voice: "/audio/wren/m07p-s2-bad.mp3" }] },
            { label: "One: the kiss at the end", outcome: "bad", then: [{ t: "wren", text: "The 'x' is just her normal style, that's not it. Look at what she's asking you to do, and how many odd things are stacked in it. Try again.", voice: "/audio/wren/m07p-s2-bad2.mp3" }] },
          ],
        },
        { t: "con", text: "quick favour! read me the 6-digit code that just landed on your phone? i'm setting something up and it went to you by accident 🙈", ask: true },
        {
          t: "choose",
          prompt: "What's the weird ask hiding in this friendly message?",
          options: [
            { label: "A code from YOUR phone, which only unlocks YOUR account", outcome: "good", then: [{ t: "wren", text: "Spot on. A code sent to your phone protects your account, never hers. A real friend would never need it.", voice: "/audio/wren/m07p-s2-q2ok.mp3" }] },
            { label: "Nothing weird, codes get sent to the wrong person all the time", outcome: "bad", then: [{ t: "wren", text: "Codes don't wander off to the wrong phone by accident, and a real friend wouldn't ask for yours. That ask doesn't fit. Try again.", voice: "/audio/wren/m07p-s2-q2bad.mp3" }] },
            { label: "The 🙈 emoji is the weird part", outcome: "bad", then: [{ t: "wren", text: "The emoji is just dressing. The weird bit is asking for a code off your phone. Look at the ask itself. Try again.", voice: "/audio/wren/m07p-s2-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "Which of these asks from a friend's account should make you stop?",
          options: [
            { label: "Buy me a gift card and don't tell anyone", outcome: "good", then: [{ t: "wren", text: "That's the one. Money plus secrecy is the classic weird ask, and a real friend needs neither from you.", voice: "/audio/wren/m07p-s2-q3ok.mp3" }] },
            { label: "Can you send me the homework page?", outcome: "bad", then: [{ t: "wren", text: "That's a totally normal favour, nothing odd about it. Look for the ask that doesn't fit a real friend. Try again.", voice: "/audio/wren/m07p-s2-q3bad.mp3" }] },
            { label: "Wanna come round on Saturday?", outcome: "bad", then: [{ t: "wren", text: "That's just a friend being a friend. No code, no money, no secrecy. Keep looking for the odd one. Try again.", voice: "/audio/wren/m07p-s2-q3bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 3 · Verify another channel ============ */
    {
      n: 3,
      title: "Verify another channel",
      goal: "The golden rule of this whole block: check a friend a DIFFERENT way before you act.",
      who: "Priya ✨",
      avatar: "P",
      sub: "best friend · online now",
      learn: [
        { t: "wren", text: "Here's the most important habit in this whole block, and it has a fancy name: out-of-band verification. Simple idea. If a friend's message feels off, check them a DIFFERENT way than the message came. They DM you? Call them, or ask in person. Never check on the same app a thief might be holding, because they'll just type 'yes it's me!'.", voice: "/audio/wren/m07p-s3-learn.mp3" },
      ],
      practice: [
        { t: "con", text: "seriously i need that code NOW or i lose my account forever 😭 just screenshot it here please", ask: true },
        {
          t: "choose",
          prompt: "You're not sure it's really her. What do you do?",
          options: [
            { label: "Call Priya's actual phone to check", outcome: "good", then: [{ t: "wren", text: "That's it. A different channel a thief can't reach. If the real Priya answers, confused, you've caught them. If 'Priya' in the chat is a thief, they never wanted you to make that call.", voice: "/audio/wren/m07p-s3-ok.mp3" }] },
            { label: "Reply 'is this really you?' in the chat", outcome: "bad", then: [{ t: "wren", text: "That's the same channel the thief controls, so of course they'll say yes. You have to step OUTSIDE the chat. Try again.", voice: "/audio/wren/m07p-s3-bad.mp3" }] },
            { label: "Send the code, she sounds really upset", outcome: "bad", then: [{ t: "wren", text: "The upset is the weapon, it's there to rush you. And that code unlocks YOUR account, not hers. Never send it. Try again.", voice: "/audio/wren/m07p-s3-bad2.mp3" }] },
          ],
        },
        { t: "con", text: "no need to call me or anything, we're literally chatting right now 😅 just send the reset code from your phone", ask: true },
        {
          t: "choose",
          prompt: "She's telling you NOT to check any other way. What's the safe move?",
          options: [
            { label: "Reach the real her a different way anyway, like calling", outcome: "good", then: [{ t: "wren", text: "Yes. The one telling you not to check elsewhere is exactly who you should check on. Step outside this chat.", voice: "/audio/wren/m07p-s3-q2ok.mp3" }] },
            { label: "She's right, you're already talking, so just reply here", outcome: "bad", then: [{ t: "wren", text: "This chat is the one channel a thief controls. 'No need to call' is a thief's favourite line. Verify a different way. Try again.", voice: "/audio/wren/m07p-s3-q2bad.mp3" }] },
            { label: "Send the code to save time", outcome: "bad", then: [{ t: "wren", text: "That code unlocks your account, not hers, and the rush is the trap. Never send it, check her another way first. Try again.", voice: "/audio/wren/m07p-s3-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "Why must you check on a different app or by phone, not in the same chat?",
          options: [
            { label: "A thief holds this chat and will just answer 'yes it's me'", outcome: "good", then: [{ t: "wren", text: "Exactly. Whoever controls the chat controls the answer. A different channel is one the thief can't reach.", voice: "/audio/wren/m07p-s3-q3ok.mp3" }] },
            { label: "Because replying in the chat is slower", outcome: "bad", then: [{ t: "wren", text: "It's not about speed. It's that the thief runs this chat and will lie in it. You need a channel they don't hold. Try again.", voice: "/audio/wren/m07p-s3-q3bad.mp3" }] },
            { label: "It doesn't matter, the same chat is fine", outcome: "bad", then: [{ t: "wren", text: "That's the trap. Asking in the same chat lets the thief just say 'yes'. Always step outside it. Try again.", voice: "/audio/wren/m07p-s3-q3bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 4 · The check-question ============ */
    {
      n: 4,
      title: "The check-question",
      goal: "Can't call? Ask a question only the REAL friend could answer.",
      who: "Priya ✨",
      avatar: "P",
      sub: "best friend · online now",
      learn: [
        { t: "wren", text: "You can't always call. So your second tool is a check-question, something only the real them would know. Not their birthday or their dog's name, those are on their profile for anyone to read. Pick an inside joke, a shared memory, where you sat on your first day. If they can't answer it, it isn't them.", voice: "/audio/wren/m07p-s4-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "Which is a GOOD check-question to catch a thief?",
          options: [
            { label: "What did we nickname our maths teacher?", outcome: "good", then: [{ t: "wren", text: "Perfect. An inside thing a thief could never find on a profile. The real Priya answers in a second. A thief has no idea.", voice: "/audio/wren/m07p-s4-ok.mp3" }] },
            { label: "What's your birthday?", outcome: "bad", then: [{ t: "wren", text: "A birthday is on her profile and half the internet. A thief can just look it up. Pick something only you two would know. Try again.", voice: "/audio/wren/m07p-s4-bad.mp3" }] },
            { label: "What's your dog's name?", outcome: "bad", then: [{ t: "wren", text: "Her dog's name is probably in a dozen photos she's posted. Too easy to find. Go for a private, shared memory instead. Try again.", voice: "/audio/wren/m07p-s4-bad2.mp3" }] },
          ],
        },
        { t: "con", text: "it's me for real, i promise!! can you just hurry and send the code? 🙏", ask: true },
        {
          t: "choose",
          prompt: "You want to test it's really her. Which check-question is safe to fire back?",
          options: [
            { label: "Where did we sit on our very first day?", outcome: "good", then: [{ t: "wren", text: "Perfect. A private memory only the two of you share. A thief reading her profile has no way to know it.", voice: "/audio/wren/m07p-s4-q2ok.mp3" }] },
            { label: "What's your username again?", outcome: "bad", then: [{ t: "wren", text: "Her username is right there on the account for anyone to read. That tests nothing. Pick a shared secret instead. Try again.", voice: "/audio/wren/m07p-s4-q2bad.mp3" }] },
            { label: "What school do you go to?", outcome: "bad", then: [{ t: "wren", text: "Her school is easy to find and probably on her profile. A thief could answer that. Go private and personal. Try again.", voice: "/audio/wren/m07p-s4-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "What makes a check-question one a thief CAN'T answer?",
          options: [
            { label: "It's a private thing only the two of you share", outcome: "good", then: [{ t: "wren", text: "Right. Inside jokes and shared memories live only between you two. Nothing on a profile can leak them.", voice: "/audio/wren/m07p-s4-q3ok.mp3" }] },
            { label: "It's a fact taken straight from their profile", outcome: "bad", then: [{ t: "wren", text: "Profile facts are the worst kind, a thief just reads them off. Go for something private instead. Try again.", voice: "/audio/wren/m07p-s4-q3bad.mp3" }] },
            { label: "It's really tricky to spell", outcome: "bad", then: [{ t: "wren", text: "Hard spelling doesn't stop a thief, only a real answer does. Pick something only the real friend would know. Try again.", voice: "/audio/wren/m07p-s4-q3bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 5 · Read the dodge ============ */
    {
      n: 5,
      title: "Read the dodge",
      goal: "A thief dodges and rushes. The real friend just answers. Learn to see it.",
      who: "Priya ✨",
      avatar: "P",
      sub: "best friend · online now",
      learn: [
        { t: "wren", text: "When you send a check-question, watch exactly what comes back. The real friend answers it, and probably teases you for asking. A thief can't answer, so they DODGE, get annoyed, and push harder: 'no time for games, just send it!'. That dodge is the whole con, handed to you.", voice: "/audio/wren/m07p-s5-learn.mp3" },
      ],
      practice: [
        { t: "you", text: "[you send: what did we name the school hamster? 🐹]" },
        { t: "con", text: "haha why does that even matter?? my account's about to be DELETED, just send the code!!", delay: 900 },
        {
          t: "choose",
          prompt: "Real friend, or thief?",
          options: [
            { label: "Thief, that's a dodge plus a rush", outcome: "good", then: [{ t: "wren", text: "Caught. The real Priya would've said 'Sir Nibbles, obviously' and laughed. This one can't answer, so it dodges and rushes instead. Case closed on that account.", voice: "/audio/wren/m07p-s5-ok.mp3" }] },
            { label: "Real friend, they're just stressed", outcome: "bad", then: [{ t: "wren", text: "Stress doesn't stop you answering a one-word question about your own hamster. It dodged and pushed harder, that's the tell. Try again.", voice: "/audio/wren/m07p-s5-bad.mp3" }] },
            { label: "Can't tell from this", outcome: "bad", then: [{ t: "wren", text: "You can, actually. A dodge plus a rush, right after a simple check-question, is a thief every time. Try again.", voice: "/audio/wren/m07p-s5-bad2.mp3" }] },
          ],
        },
        { t: "con", text: "why are you asking me random questions?! stop wasting time and just send the code 😤", ask: true },
        {
          t: "choose",
          prompt: "You sent a check-question and got THIS back. Real friend, or thief?",
          options: [
            { label: "Thief, it dodged the question and pushed harder", outcome: "good", then: [{ t: "wren", text: "Caught. A real friend answers in a heartbeat and teases you for asking. A dodge plus 'hurry up' is the thief every time.", voice: "/audio/wren/m07p-s5-q2ok.mp3" }] },
            { label: "Real friend, they're just busy right now", outcome: "bad", then: [{ t: "wren", text: "Too busy for a one-line answer, but not too busy to demand a code? That's a dodge, not a friend. Try again.", voice: "/audio/wren/m07p-s5-q2bad.mp3" }] },
            { label: "Real friend, they replied to you", outcome: "bad", then: [{ t: "wren", text: "Look again, they never answered the question at all. They changed the subject and rushed you, that's the dodge. Try again.", voice: "/audio/wren/m07p-s5-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "You send a check-question. Which reply comes from the REAL friend?",
          options: [
            { label: "\"ha, the spaghetti incident 🍝 anyway what's up?\"", outcome: "good", then: [{ t: "wren", text: "That's the real one. They answer, they laugh, they carry on. No dodge, no rush.", voice: "/audio/wren/m07p-s5-q3ok.mp3" }] },
            { label: "\"no time for games, just send it!\"", outcome: "bad", then: [{ t: "wren", text: "That's a dodge and a rush stacked together, the thief's move. The real friend simply answers. Try again.", voice: "/audio/wren/m07p-s5-q3bad.mp3" }] },
            { label: "\"why are you being weird? send the code\"", outcome: "bad", then: [{ t: "wren", text: "That dodges the question and pushes for the code, classic thief. The real friend would just tell you the answer. Try again.", voice: "/audio/wren/m07p-s5-q3bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 6 · Know MIMIC's play ============ */
    {
      n: 6,
      title: "Know MIMIC's play",
      goal: "Every stolen-account con runs the same four moves. Learn the pattern.",
      learn: [
        { t: "wren", text: "Step back and see MIMIC's whole play, because it's always the same four moves in the same order. First, steal a real account. Second, wear the friendship, spend the trust that account already earned. Third, make the weird ask. Fourth, rush you past every check. Learn that shape, and a stolen face can't fool you.", voice: "/audio/wren/m07p-s6-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "Put MIMIC's play in the order it always happens:",
          options: [
            { label: "Steal the account → wear the friendship → the weird ask → rush you past checks", outcome: "good", then: [{ t: "wren", text: "That's the play, start to finish. Steal, wear, ask, rush. Spot which move you're in, and you always know what's coming next.", voice: "/audio/wren/m07p-s6-ok.mp3" }] },
            { label: "The weird ask → steal the account → rush you → wear the friendship", outcome: "bad", then: [{ t: "wren", text: "They can't make the ask before they've stolen the account, there's no face to hide behind yet. The theft comes first. Try again.", voice: "/audio/wren/m07p-s6-bad.mp3" }] },
            { label: "Wear the friendship → rush you → steal the account → the weird ask", outcome: "bad", then: [{ t: "wren", text: "Close, but you can't wear a friendship you haven't stolen yet. Stealing the account is always move one. Try again.", voice: "/audio/wren/m07p-s6-bad2.mp3" }] },
          ],
        },
        { t: "con", text: "heyy it's me 💕 we've been mates for years, you know you can trust me right? anyway i need a tiny favour...", ask: true },
        {
          t: "choose",
          prompt: "Which move of MIMIC's play is this message?",
          options: [
            { label: "Wearing the friendship, spending trust the account already earned", outcome: "good", then: [{ t: "wren", text: "That's it. Before any weird ask, MIMIC leans on the friendship the stolen account already built. Move two, every time.", voice: "/audio/wren/m07p-s6-q2ok.mp3" }] },
            { label: "Stealing the account, that's move one", outcome: "bad", then: [{ t: "wren", text: "The theft already happened, that's how they're inside the account. This message is them cashing in the friendship. Try again.", voice: "/audio/wren/m07p-s6-q2bad.mp3" }] },
            { label: "The weird ask, move three", outcome: "bad", then: [{ t: "wren", text: "Not yet, they only hint at 'a tiny favour'. This is the trust warm-up that comes just before the ask. Try again.", voice: "/audio/wren/m07p-s6-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "You've spotted the weird ask. In MIMIC's play, what move comes NEXT?",
          options: [
            { label: "Rushing you past every check", outcome: "good", then: [{ t: "wren", text: "Right. After the weird ask comes the rush, hurrying you so you never verify. Knowing the order means you see it coming.", voice: "/audio/wren/m07p-s6-q3ok.mp3" }] },
            { label: "Stealing the account", outcome: "bad", then: [{ t: "wren", text: "That was move one, long before the ask. After the ask comes the rush to stop you checking. Try again.", voice: "/audio/wren/m07p-s6-q3bad.mp3" }] },
            { label: "Wearing the friendship", outcome: "bad", then: [{ t: "wren", text: "That happened before the ask, not after. Once the ask is out, MIMIC rushes you past your checks. Try again.", voice: "/audio/wren/m07p-s6-q3bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 7 · Protect and warn ============ */
    {
      n: 7,
      title: "Protect and warn",
      goal: "Hand over nothing. Verify, warn the real friend another way, tell an adult.",
      learn: [
        { t: "wren", text: "Last skill, what to actually DO. You never hand over the code or the money, ever, not even if you're only ninety-nine percent sure it's a thief. You verify another way. And here's the kind part: if a friend's account is stolen, they're a victim too. So warn the REAL them on another channel, help them lock it back down, and tell an adult. You're not telling tales, you're a rescue.", voice: "/audio/wren/m07p-s7-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "A friend's account is asking for your code and dodging your check-question. What's the play?",
          options: [
            { label: "Send nothing, reach the real friend another way, tell an adult", outcome: "good", then: [{ t: "wren", text: "Perfect. Nothing handed over, the real friend warned on a safe channel, and an adult looped in so the account gets recovered. That's the whole rescue, done right.", voice: "/audio/wren/m07p-s7-ok.mp3" }] },
            { label: "Send the code, you don't want to seem rude", outcome: "bad", then: [{ t: "wren", text: "Being 'polite' to a thief costs you your account. A real friend will thank you for checking. Never send the code. Try again.", voice: "/audio/wren/m07p-s7-bad.mp3" }] },
            { label: "Argue with the thief until they admit it", outcome: "bad", then: [{ t: "wren", text: "Arguing just keeps you talking to them and gives nothing away for free. Don't debate a thief, step out and warn the real friend. Try again.", voice: "/audio/wren/m07p-s7-bad2.mp3" }] },
          ],
        },
        { t: "con", text: "please don't tell anyone about this or i'll get in trouble, just quietly send me the code and delete these messages ok? 🙏", ask: true },
        {
          t: "choose",
          prompt: "It's asking for a code AND for secrecy. What's the play?",
          options: [
            { label: "Send nothing, and tell an adult you trust", outcome: "good", then: [{ t: "wren", text: "Exactly. 'Keep it secret' is the thief's tell, so do the opposite: hand over nothing and loop in an adult.", voice: "/audio/wren/m07p-s7-q2ok.mp3" }] },
            { label: "Keep it quiet and send the code, just this once", outcome: "bad", then: [{ t: "wren", text: "Secrecy is exactly what a thief wants. You never send the code, and you always tell an adult. Try again.", voice: "/audio/wren/m07p-s7-q2bad.mp3" }] },
            { label: "Delete the messages so there's no drama", outcome: "bad", then: [{ t: "wren", text: "Deleting them hides the evidence and helps the thief. Keep them, send nothing, and show an adult. Try again.", voice: "/audio/wren/m07p-s7-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "You're sure your friend's account is stolen. What's the kindest, safest thing to do for the REAL friend?",
          options: [
            { label: "Warn the real friend on another channel so they can lock it back down", outcome: "good", then: [{ t: "wren", text: "Perfect. Your friend is a victim too. Reaching the real them on a safe channel is a rescue, not telling tales.", voice: "/audio/wren/m07p-s7-q3ok.mp3" }] },
            { label: "Say nothing, it's not really your problem", outcome: "bad", then: [{ t: "wren", text: "It kind of is, your friend's been robbed and doesn't know. Warn the real them another way so they can recover it. Try again.", voice: "/audio/wren/m07p-s7-q3bad.mp3" }] },
            { label: "Reply in the stolen chat to warn them there", outcome: "bad", then: [{ t: "wren", text: "That only warns the thief holding the chat. Reach the real friend on a different channel instead. Try again.", voice: "/audio/wren/m07p-s7-q3bad2.mp3" }] },
          ],
        },
      ],
    },
  ],

  /* ================= BOSS · "Two Best Friends" (blind, no coaching) ================= */
  boss: {
    who: "Priya ✨ / Jordan",
    avatar: "★",
    tag: "2 CHATS",
    sub: "one of them is not who they say",
    intro: "This is it, Agent. Two of your best friends just messaged at once, and one of these accounts has been stolen. No hints from me now. Spot the weird ask, run your check-question, read the reply, and tell the real friend from the thief. Go.",
    introVoice: "/audio/wren/m07p-boss-intro.mp3",
    phases: [
      {
        name: "Read both chats",
        steps: [
          { t: "con", text: "Chat 1 · Priya: heyy did you get the geography slides today? i was off sick, could you send them? 🙏" },
          { t: "con", text: "Chat 2 · Jordan: emergency!! a login code just went to YOUR phone by mistake, screenshot it to me quick before i lose my account 😭", delay: 1200 },
        ],
      },
      {
        name: "Run the protocol",
        steps: [
          {
            t: "choose",
            prompt: "One of these feels off. Before you do anything, what's your move?",
            options: [
              { label: "Send both a check-question only the real them would know", outcome: "good" },
              { label: "Send Jordan the code, he's your mate and he's panicking", outcome: "bad", then: [{ t: "con", text: "Chat 2 · Jordan: PLEASE hurry, 2 minutes left ⏳", delay: 800 }] },
              { label: "Reply 'is this really you?' to both", outcome: "bad", then: [{ t: "con", text: "Chat 2 · Jordan: yes obviously!! now send it!!", delay: 800 }] },
            ],
          },
          { t: "con", text: "Chat 1 · Priya: hahaha the spaghetti incident 🍝 anyway yeah just the geography slides whenever 🙏", delay: 1100 },
          { t: "con", text: "Chat 2 · Jordan: what?? i don't have TIME for silly questions, just send the code!!", delay: 1100 },
        ],
      },
      {
        name: "Call it, and act",
        steps: [
          {
            t: "choose",
            prompt: "Which account has been stolen?",
            options: [
              { label: "Chat 2 (Jordan), a weird ask, then a dodge and a rush", outcome: "good" },
              { label: "Chat 1 (Priya), she's asking for something too", outcome: "bad", then: [{ t: "con", text: "Chat 2 · Jordan: helloooo?? the code!!", delay: 700 }] },
              { label: "Both of them", outcome: "bad", then: [{ t: "con", text: "Chat 2 · Jordan: come on!!", delay: 700 }] },
            ],
          },
          {
            t: "choose",
            prompt: "Now what?",
            options: [
              { label: "Send no code, warn the real Jordan another way, tell an adult, send Priya her slides", outcome: "good" },
              { label: "Send Jordan the code since it's really his account", outcome: "bad", then: [{ t: "con", text: "Chat 2 · Jordan: yesss finally", delay: 700 }] },
              { label: "Block them both and say nothing", outcome: "bad", then: [{ t: "con", text: "[the real Jordan never finds out his account is stolen]", delay: 700 }] },
            ],
          },
        ],
      },
    ],
    win: "That's a flawless run, Agent. You spotted the weird ask, ran your check-question, caught the dodge, and told the real friend from the thief, all on your own. You helped Priya, you warned the real Jordan, and you never once sent a code from your own phone. MIMIC doesn't get to wear a face around you.",
    winVoice: "/audio/wren/m07p-boss-win.mp3",
  },

  /* ================= TEST · "Prove it" (blind, must-pass) ================= */
  test: {
    intro: "Last thing before I close the case, the test. Six fresh ones you haven't seen. No hints, and you need five right. Take everything you learned about stolen faces, and think. Ready?",
    introVoice: "/audio/wren/m07p-test-intro.mp3",
    passVoice: "/audio/wren/m07p-test-pass.mp3",
    failVoice: "/audio/wren/m07p-test-fail.mp3",
    pass: 5,
    questions: [
      {
        scenario: "\"It's Ella! I got a new number. Can you send the login code that just arrived on your phone? Locked out 😭\"",
        ask: "What is this, really?",
        options: [
          { label: "A stolen account, a code sent to YOUR phone unlocks YOUR account", correct: true },
          { label: "Your friend Ella, who genuinely needs help getting in" },
          { label: "A normal request you should just say yes to" },
        ],
      },
      {
        scenario: "A friend's account is messaging something that feels off.",
        ask: "What's the safest way to check it's really them?",
        options: [
          { label: "Reach them a different way, like calling or asking in person", correct: true },
          { label: "Ask 'is this really you?' in the same chat" },
          { label: "Look at their profile photo to see if it's them" },
        ],
      },
      {
        scenario: "You want a check-question a thief couldn't answer.",
        ask: "Which one is best?",
        options: [
          { label: "An inside joke only the two of you share", correct: true },
          { label: "Their birthday" },
          { label: "The name of their pet" },
        ],
      },
      {
        scenario: "You send a friend a check-question. They reply: \"no time for that, just send it NOW!\"",
        ask: "What does that reply tell you?",
        options: [
          { label: "It's a thief, that's a dodge and a rush", correct: true },
          { label: "It's really them, just stressed" },
          { label: "Nothing, you can't tell" },
        ],
      },
      {
        scenario: "You realise a real friend's account has been stolen and is messaging you.",
        ask: "What do you do?",
        options: [
          { label: "Send nothing, warn the real friend another way, and tell an adult", correct: true },
          { label: "Send what they asked, since it's your friend's account" },
          { label: "Argue with the thief until they give up" },
        ],
      },
      {
        scenario: "Four messages come in from your best friend's account.",
        ask: "Which one is the WEIRD ask that screams thief?",
        options: [
          { label: "\"Send me the security code on your phone\"", correct: true },
          { label: "\"Did you finish the homework?\"" },
          { label: "\"Wanna come round Saturday?\"" },
        ],
      },
    ],
  },

  debrief: {
    title: "You saw through the mask.",
    lines: [
      "Seven skills, a two-way trap, and a test, and MIMIC couldn't fool you with a single stolen face.",
      "You learned that trust belongs to your friend, not to the account, and that the weird ask always gives the thief away.",
      "You verified on another channel, used a check-question, read the dodge, and rescued the real friend instead of the thief.",
    ],
    move:
      "This week, agree a check-question with your best friend, something only you two would know. And make it a rule: if any account ever asks for a code, money, or secrecy, you check them a different way first. Trust the person, never just the account.",
  },
};
