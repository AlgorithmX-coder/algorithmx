/**
 * WREN's spoken scripts for Mission 03 ("The Guessing Game"). See
 * mission01.mjs for why this is a separate file from the on-screen text.
 * catchThem.voice.pass/fail reuse the shared m01-catch-pass/fail.mp3,
 * not included here.
 *
 * Re-scripted 2026-11-08 to the WREN script standard (see mission01.mjs):
 * one tag per line by role, complete sentences, no quote marks, no capitals
 * for stress.
 */
export const mission03VoiceScripts = {
  "/audio/wren/m03-transmission.mp3":
    "[serious] Agent, a password-guessing rig just lit up ARC's board, aimed straight at student accounts. There's no bait, no lies, and no clever message. It's just cold guessing, millions a second, all night long. The owner calls himself SKELETON KEY, and he says every lock talks eventually. Let's prove him wrong.",

  "/audio/wren/m03-briefing.mp3":
    "[warm] You'll learn seven skills, then take a test to close the case. There's one rule tonight, Agent. His rig never sleeps, so your locks had better hold. Ready?",

  // cycle 1 — how the rig guesses
  "/audio/wren/m03-c1-b1.mp3":
    "[warm] Behind that glass is SKELETON KEY's rig. It's guessing passwords, millions a second, and it never gets tired, hungry, or bored.",
  "/audio/wren/m03-c1-b2.mp3":
    "[warm] But here's the secret. It isn't guessing at random. It works down a list, most common first. That means real words, names, pets, birthdays, 123456, password, and keyboard rows like qwerty.",
  "/audio/wren/m03-c1-b3.mp3":
    "[warm] So a password like Millie2013! feels personal to you. To the rig, it's just a name, a year and a symbol. That exact shape sits near the top of the list, so it's gone in under a second.",
  "/audio/wren/m03-c1-b4.mp3":
    "[warm] The rig never met Millie. It didn't have to. Anything on its list falls fast. Anything not on the list makes it grind for years. That's the whole game.",
  "/audio/wren/m03-c1-chk1-ok.mp3":
    "[warm] Right. Football is a common word sitting near the top of the rig's list, so it falls in the first second.",
  "/audio/wren/m03-c1-chk2-ok.mp3":
    "[warm] Exactly. Random, unrelated words are on no list, so the rig has nothing to grab and has to grind for years.",
  "/audio/wren/m03-c1-practice.mp3":
    "[warm] Now let's put it to work, Agent. A fresh batch of passwords is waiting on the next screen. Sort each one. Is it already on the rig's list and gone in seconds, or is it long and random enough to make the rig actually work?",
  "/audio/wren/m03-c1-play.mp3":
    "[warm] Here's a batch of passwords. Sort each one. Is it already on the rig's list, so it falls fast, or does it make the rig work?",

  // cycle 2 — the ingredients
  "/audio/wren/m03-c2-b1.mp3":
    "[warm] Where does a password like Jake2014! even come from? It comes from Jake. It's his name, his birth year, and an exclamation mark to feel safe. Every bit of it is about him.",
  "/audio/wren/m03-c2-b2.mp3":
    "[warm] And the rig can read Jake. His name's on his profile. His birthday is in a happy birthday post. His dog Biscuit is in every photo he's tagged in.",
  "/audio/wren/m03-c2-b3.mp3":
    "[warm] So each personal bit isn't a secret. It's a clue he handed over. And the rig knows swaps like an at sign for the letter A, or a zero for the letter O. Swapping letters in the word password isn't clever. It's right there on the list.",
  "/audio/wren/m03-c2-b4.mp3":
    "[warm] Read a password the way the rig does. Strip out everything it could look up or guess about you, and see what's actually left. Usually, there's nothing.",
  "/audio/wren/m03-c2-chk1-ok.mp3":
    "[warm] That's it. His name and birth year are one quick search away, so none of it is actually a secret.",
  "/audio/wren/m03-c2-chk2-ok.mp3":
    "[warm] Right. Swapping the letter O for a zero is an old trick the rig checks by itself, so it doesn't slow it down at all.",
  "/audio/wren/m03-c2-practice.mp3":
    "[warm] Now let's put it to work, Agent. Jake's agreed to an audit of his own passwords. Tap every one the rig would crack just from knowing him, plus the one mistake that puts all of them at risk.",
  "/audio/wren/m03-c2-play.mp3":
    "[warm] Jake let us audit his passwords. Tap every one the rig would crack from knowing Jake, plus the mistake that puts them all at risk.",
  "/audio/wren/m03-c2-review.mp3":
    "[warm] There were three easy locks, and the reuse that chains them together. That library one, made of four random words, is the only thing here the rig would actually sweat over.",

  // cycle 3 — one key, every door
  "/audio/wren/m03-c3-b1.mp3":
    "[warm] Last month a little game forum got breached, and its whole list of passwords spilled out. SKELETON KEY bought that list for pennies.",
  "/audio/wren/m03-c3-b2.mp3":
    "[warm] Now he does the obvious thing. He takes each leaked password and tries it on every other site, because it's the same person, with the same email, playing the same games.",
  "/audio/wren/m03-c3-b3.mp3":
    "[warm] If you reused that password, every door with that key just swung open at once. And one of those doors is the master, which is your email.",
  "/audio/wren/m03-c3-b4.mp3":
    "[warm] Why email? Because the forgot password button sends a reset link straight to your email. Own the email, and you own everything. So when a key leaks, the email lock is the one you save first.",
  "/audio/wren/m03-c3-chk1-ok.mp3":
    "[warm] Exactly. One reused key means a single leak swings open every door that shares it.",
  "/audio/wren/m03-c3-chk2-ok.mp3":
    "[warm] Right. The forgot password button sends a reset link to your email, so owning the email means owning everything.",
  "/audio/wren/m03-c3-practice.mp3":
    "[warm] Now let's put it to work, Agent. Jake's reused password just leaked, and he's only got time to fix one account before dinner. Read what's at stake, then make the call.",
  "/audio/wren/m03-c3-play.mp3":
    "[warm] Jake's reused password just leaked, and he can fix one account first. Make the call.",

  // cycle 4 — length beats cleverness
  "/audio/wren/m03-c4-b1.mp3":
    "[warm] Here's the thing nobody tells you. The rig doesn't care how clever your password looks. It cares how long it is.",
  "/audio/wren/m03-c4-b2.mp3":
    "[warm] A password full of symbol swaps looks tough. But it's short, and every swap in it is on the rig's list. It falls in minutes.",
  "/audio/wren/m03-c4-b3.mp3":
    "[warm] Now add length. Every extra character doesn't just add to the rig's work. It multiplies it. A few more characters, and minutes turn into centuries.",
  "/audio/wren/m03-c4-b4.mp3":
    "[warm] That's the real lever. It isn't symbols, a capital, or an exclamation mark. It's length. Watch what happens to the rig's own clock when you slide it up.",
  "/audio/wren/m03-c4-chk1-ok.mp3":
    "[warm] Yes. It has no symbols at all, but it's long, and length is what buries the rig for centuries.",
  "/audio/wren/m03-c4-chk2-ok.mp3":
    "[warm] That's the real lever. Length multiplies the rig's work, while a lone symbol or swap barely slows it down.",
  "/audio/wren/m03-c4-practice.mp3":
    "[warm] Now let's put it to work, Agent. The rig's own clock is live on the next screen. Drag the length up and watch its crack-time move, then park it where the rig finally gives up.",
  "/audio/wren/m03-c4-play.mp3":
    "[warm] This is the rig's own clock. Drag the password length up and watch how long the rig would need. Park it where the rig gives up, then lock it in.",
  "/audio/wren/m03-c4-review.mp3":
    "[warm] There it is. You didn't add a single symbol. You just made it longer, and the rig's clock jumped from an instant to centuries. Length is the whole trick.",

  // cycle 5 — three random words
  "/audio/wren/m03-c5-b1.mp3":
    "[warm] Long is great, but who remembers twenty random letters? Nobody does. So here's the trick the pros actually use, which is random words.",
  "/audio/wren/m03-c5-b2.mp3":
    "[warm] Pick three or four words that have nothing to do with each other, and nothing to do with you, like otter, cannon, and velvet. Then stick them together.",
  "/audio/wren/m03-c5-b3.mp3":
    "[warm] It's long, so the rig's clock explodes. It's random, so it's on no list. And it's made of words, so your brain can picture it, like a cannon-firing otter in a velvet coat. You will not forget that.",
  "/audio/wren/m03-c5-b4.mp3":
    "[warm] What's the trap? It's words that are about you, like your dog, your town, or a song lyric everyone knows. Random has to mean random, with no shortcuts the rig could ever guess.",
  "/audio/wren/m03-c5-chk1-ok.mp3":
    "[warm] Perfect. It's four random, unrelated words that have nothing to do with you. It's long, unguessable, and easy to picture.",
  "/audio/wren/m03-c5-chk2-ok.mp3":
    "[warm] Right. A well-known lyric is on the list the rig already tries, so random has to mean truly random.",
  "/audio/wren/m03-c5-practice.mp3":
    "[warm] Now let's put it to work, Agent. Time to build Jake a passphrase the rig can't touch. For each slot, pick the part that's long, random, and has nothing to do with him.",
  "/audio/wren/m03-c5-play.mp3":
    "[warm] Build Jake a passphrase the rig can't touch. For each slot, pick the part that's long, random, and has nothing to do with him.",

  // cycle 6 — know SKELETON KEY's play
  "/audio/wren/m03-c6-b1.mp3":
    "[warm] Let's name SKELETON KEY's game so you see it coming. Move one is the list. He starts with a list of millions of the most common passwords, like 123456, real words, and names. Most people are somewhere on it.",
  "/audio/wren/m03-c6-b2.mp3":
    "[warm] Move two is your life. He scrapes your posts for the personal stuff, like your pet, your team, and your birthday, and feeds all of it into the rig too.",
  "/audio/wren/m03-c6-b3.mp3":
    "[warm] Move three is patience. His rig guesses millions a second, day and night, and it only has to get lucky once.",
  "/audio/wren/m03-c6-b4.mp3":
    "[warm] And what's the counter to all of it? Take yourself off his list. Make every key long, random, and unique for every door. He can't guess what isn't a word and isn't about you.",
  "/audio/wren/m03-c6-chk1-ok.mp3":
    "[warm] Yes. Feeding your own life into the rig is move two. He doesn't trick you. He studies you.",
  "/audio/wren/m03-c6-chk2-ok.mp3":
    "[warm] Exactly. He can't guess what isn't a word and isn't about you, and a unique key stops one lucky hit spreading.",
  "/audio/wren/m03-c6-practice.mp3":
    "[warm] Now let's put it to work, Agent. Here's tonight's evidence, laid out on the next screen. Tap the three moves that are really SKELETON KEY's, no more, no less.",
  "/audio/wren/m03-c6-play.mp3":
    "[warm] Here's the evidence from tonight. Tap the three moves that are really SKELETON KEY's.",

  // cycle 7 — lock every door
  "/audio/wren/m03-c7-b1.mp3":
    "[warm] So how do you actually lock every door, without a genius memory? You follow a real plan, in five steps.",
  "/audio/wren/m03-c7-b2.mp3":
    "[warm] Step one is the emergency. Change your most reused password today, starting with your email. That snaps the master key in half.",
  "/audio/wren/m03-c7-b3.mp3":
    "[warm] Steps two and three are to go long and go unique. Use three random words each, with a different set for every important door. Never use the same key twice.",
  "/audio/wren/m03-c7-b4.mp3":
    "[warm] Step four is the cheat code. A password manager remembers all of them, so you only remember one. That's how the pros run forty strong passwords without breaking a sweat.",
  "/audio/wren/m03-c7-b5.mp3":
    "[warm] Step five is a second lock. Turn on two-step verification wherever you can. Then even a guessed password isn't enough, because the rig still needs the code sent to your phone. And nobody real will ever ask you for that code.",
  "/audio/wren/m03-c7-chk1-ok.mp3":
    "[warm] Right. Snapping the most reused key first, at the master door, does the most good the fastest.",
  "/audio/wren/m03-c7-chk2-ok.mp3":
    "[warm] That's the cheat code. A manager holds every strong key, so you only have to remember one.",
  "/audio/wren/m03-c7-practice.mp3":
    "[warm] Now let's put it to work, Agent. Time to build Jake's lock-down plan properly. For each step, pick the move that actually holds, not just the one that sounds safe.",
  "/audio/wren/m03-c7-play.mp3":
    "[warm] Build Jake's lock-down plan. For each step, pick the move that actually holds.",

  // the test
  "/audio/wren/m03-catch-intro.mp3":
    "[warm] Okay, Agent, this is the real test. There are nineteen questions, and none of them just ask you to repeat what I said. Every single one makes you think. Use what you've learned about the rig to work out answers you've never seen before. I won't tell you how you're doing until the very end. Get fifteen right, and you close the case. If you get fewer than fifteen, you'll play the whole case again. So take your time, and good luck.",

  // debrief
  "/audio/wren/m03-debrief.mp3":
    "[proud] Ten thousand doors are all still locked. The rules are yours now, Agent, not his.",

  // boss: WREN reads each phase's instruction (the villain's taunts stay text)
  "/audio/wren/m03-boss-p1.mp3":
    "[determined] Phase one, the doors. The rig is hammering four doors at once, and it always cracks the weakest first. Tap the doors in the order they'll fall.",
  "/audio/wren/m03-boss-p2.mp3":
    "[determined] Phase two, cut the master key. One move stops one leak opening every door. Make your call, then submit.",
  "/audio/wren/m03-boss-p3.mp3":
    "[determined] Phase three, hold the wall. Pick the new key that actually stops the rig, then raise it.",
};

// Shown as typed on screen, said as words (see generate-explorers-wren-mission.mjs).
export const mission03Say = {
  "Millie2013!": "Millie twenty thirteen with an exclamation mark",
  "Jake2014!": "Jake twenty fourteen with an exclamation mark",
  "123456": "one two three four five six",
};
