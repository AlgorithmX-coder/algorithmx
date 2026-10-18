/**
 * WREN's spoken scripts for Mission 03 ("The Guessing Game"). See
 * mission01.mjs for why this is a separate file from the on-screen text.
 * catchThem.voice.pass/fail reuse the shared m01-catch-pass/fail.mp3,
 * already regenerated — not included here.
 */
export const mission03VoiceScripts = {
  "/audio/wren/m03-transmission.mp3":
    "[serious] Agent, a password-guessing rig just lit up ARC's board, aimed straight at student accounts. [determined] No bait, no lies, no clever message. Just cold guessing, millions a second, all night long. [excited] The owner calls himself SKELETON KEY. Says every lock talks eventually. Let's prove him wrong.",

  "/audio/wren/m03-briefing.mp3":
    "[warm] Seven skills, then a test to close the case. [serious] One rule tonight, Agent. His rig never sleeps, so your locks had better hold. [excited] Ready?",

  // cycle 1 — how the rig guesses
  "/audio/wren/m03-c1-b1.mp3":
    "[curious] Behind that glass is SKELETON KEY's rig. It's guessing passwords, millions a second, and it never gets tired, hungry, or bored.",
  "/audio/wren/m03-c1-b2.mp3":
    "[serious] But here's the secret. It isn't guessing at random. It works down a LIST, most common first. Real words, names, pets, birthdays, 123456, password, keyboard rows like qwerty.",
  "/audio/wren/m03-c1-b3.mp3":
    "[warm] So Millie2013! feels personal to you. To the rig it's just a name, plus a year, plus a exclamation mark. That exact shape sits near the top of the list. Gone in under a second.",
  "/audio/wren/m03-c1-b4.mp3":
    "[determined] The rig never met Millie. It didn't have to. Anything on its list falls fast. Anything NOT on the list makes it grind for years. That's the whole game.",
  "/audio/wren/m03-c1-chk1-ok.mp3":
    "[proud] Right. 'football' is a common word sitting near the top of the rig's list, so it falls in the first second.",
  "/audio/wren/m03-c1-chk2-ok.mp3":
    "[proud] Exactly. Random, unrelated words are on no list, so the rig has nothing to grab and has to grind for years.",
  "/audio/wren/m03-c1-practice.mp3":
    "[excited] Now let's put it to work, Agent. A fresh batch of passwords is waiting on the next screen. [encouraging] Sort each one, already on the rig's list and gone in seconds, or long and random enough to make it actually work.",
  "/audio/wren/m03-c1-play.mp3":
    "[curious] A batch of passwords. [determined] Sort each one, is it already on the rig's list, it falls fast, or does it make the rig work?",

  // cycle 2 — the ingredients
  "/audio/wren/m03-c2-b1.mp3":
    "[curious] Where does a password like Jake2014! even come from? From Jake. His name, his birth year, a exclamation mark to feel safe. Every bit of it is about him.",
  "/audio/wren/m03-c2-b2.mp3":
    "[serious] And the rig can READ Jake. His name's on his profile. His birthday is in a 'happy birthday' post. His dog Biscuit is in every photo he's tagged in.",
  "/audio/wren/m03-c2-b3.mp3":
    "[warm] So each 'personal' bit isn't a secret. It's a clue he handed over. And swaps like a-to-@ or o-to-0? The rig knows those too. P@ssw0rd isn't clever, it's right there on the list.",
  "/audio/wren/m03-c2-b4.mp3":
    "[determined] Read a password the way the rig does. Strip out everything it could look up or guess about you, and see what's actually left. Usually? Nothing.",
  "/audio/wren/m03-c2-chk1-ok.mp3":
    "[proud] That's it. His name and birth year are one quick search away, so none of it is actually a secret.",
  "/audio/wren/m03-c2-chk2-ok.mp3":
    "[proud] Right. Swapping o for 0 is an old trick the rig checks by itself, so it doesn't slow it down at all.",
  "/audio/wren/m03-c2-practice.mp3":
    "[excited] Now let's put it to work, Agent. Jake's agreed to an audit of his own passwords. [encouraging] Tap every one the rig would crack just from knowing him, plus the one mistake that puts all of them at risk.",
  "/audio/wren/m03-c2-play.mp3":
    "[curious] Jake let us audit his passwords. [determined] Tap every one the rig would crack from knowing Jake, plus the mistake that puts them all at risk.",
  "/audio/wren/m03-c2-review.mp3":
    "[proud] Three easy locks, and the reuse that chains them together. [warm] That library one, four random words, is the only thing here the rig would actually sweat over.",

  // cycle 3 — one key, every door
  "/audio/wren/m03-c3-b1.mp3":
    "[serious] Last month a little game forum got breached, and its whole list of passwords spilled out. SKELETON KEY bought that list for pennies.",
  "/audio/wren/m03-c3-b2.mp3":
    "[serious] Now he does the obvious thing. He takes each leaked password and tries it on every OTHER site. Same person, same email, same games.",
  "/audio/wren/m03-c3-b3.mp3":
    "[concerned] If you reused that password, every door with that key just swung open at once. And one of those doors is the master. Your email.",
  "/audio/wren/m03-c3-b4.mp3":
    "[determined] Why email? Because 'forgot my password' sends a reset link straight to your email. Own the email, own everything. So when a key leaks, the email lock is the one you save first.",
  "/audio/wren/m03-c3-chk1-ok.mp3":
    "[proud] Exactly. One reused key means a single leak swings open every door that shares it.",
  "/audio/wren/m03-c3-chk2-ok.mp3":
    "[proud] Right. 'Forgot password' sends a reset link to your email, so owning the email means owning everything.",
  "/audio/wren/m03-c3-practice.mp3":
    "[excited] Now let's put it to work, Agent. Jake's reused password just leaked, and he's only got time to fix one account before dinner. [encouraging] Read what's at stake, then make the call.",
  "/audio/wren/m03-c3-play.mp3":
    "[serious] Jake's reused password just leaked. He can fix ONE account first. Make the call.",

  // cycle 4 — length beats cleverness
  "/audio/wren/m03-c4-b1.mp3":
    "[curious] Here's the thing nobody tells you. The rig doesn't care how CLEVER your password looks. It cares how LONG it is.",
  "/audio/wren/m03-c4-b2.mp3":
    "[serious] P@ssw0rd! looks tough, all those symbols. But it's short, and every swap in it is on the rig's list. It falls in minutes.",
  "/audio/wren/m03-c4-b3.mp3":
    "[excited] Now add length. Every extra character doesn't ADD to the rig's work, it MULTIPLIES it. A few more characters, and 'minutes' becomes 'centuries'.",
  "/audio/wren/m03-c4-b4.mp3":
    "[encouraging] That's the real lever. Not symbols, not a capital, not a exclamation mark. Length. Watch what happens to the rig's own clock when you slide it up.",
  "/audio/wren/m03-c4-chk1-ok.mp3":
    "[proud] Yes. It has no symbols at all, but it's long, and length is what buries the rig for centuries.",
  "/audio/wren/m03-c4-chk2-ok.mp3":
    "[proud] That's the real lever. Length multiplies the rig's work, while a lone symbol or swap barely slows it down.",
  "/audio/wren/m03-c4-practice.mp3":
    "[excited] Now let's put it to work, Agent. The rig's own clock is live on the next screen. Drag the length up and watch its crack-time move, then park it where the rig finally gives up.",
  "/audio/wren/m03-c4-play.mp3":
    "[curious] This is the rig's own clock. [determined] Drag the password LENGTH up and watch how long the rig would need. Park it where the rig gives up, then lock it in.",
  "/audio/wren/m03-c4-review.mp3":
    "[excited] There it is. You didn't add a single symbol. You just made it LONGER, and the rig's clock jumped from 'an instant' to 'centuries'. [proud] Length is the whole trick.",

  // cycle 5 — three random words
  "/audio/wren/m03-c5-b1.mp3":
    "[curious] 'Long' is great, but who remembers twenty random letters? Nobody. So here's the trick the pros actually use. Random WORDS.",
  "/audio/wren/m03-c5-b2.mp3":
    "[warm] Pick three or four words that have nothing to do with each other, and nothing to do with you. Otter. Cannon. Velvet. Stick them together.",
  "/audio/wren/m03-c5-b3.mp3":
    "[excited] It's long, so the rig's clock explodes. It's random, so it's on no list. And it's WORDS, so your brain can picture it. A cannon-firing otter in a velvet coat. You will not forget that.",
  "/audio/wren/m03-c5-b4.mp3":
    "[serious] The trap? Words that ARE about you. Your dog, your town, a song lyric everyone knows. Random has to mean random. No shortcuts the rig could ever guess.",
  "/audio/wren/m03-c5-chk1-ok.mp3":
    "[proud] Perfect. Four random, unrelated words that are nothing to do with you, long, unguessable, and easy to picture.",
  "/audio/wren/m03-c5-chk2-ok.mp3":
    "[proud] Right. A well-known lyric is on the list the rig already tries, so random has to mean truly random.",
  "/audio/wren/m03-c5-practice.mp3":
    "[excited] Now let's put it to work, Agent. Time to build Jake a passphrase the rig can't touch. [encouraging] For each slot, pick the part that's long, random, and has nothing to do with him.",
  "/audio/wren/m03-c5-play.mp3":
    "[determined] Build Jake a passphrase the rig can't touch. For each slot, pick the part that's long, random, and nothing to do with him.",

  // cycle 6 — know SKELETON KEY's play
  "/audio/wren/m03-c6-b1.mp3":
    "[warm] Let's name SKELETON KEY's game so you see it coming. Move one, THE LIST. He starts with the millions of most-common passwords. 123456, real words, names. Most people are somewhere on it.",
  "/audio/wren/m03-c6-b2.mp3":
    "[serious] Move two, YOUR LIFE. He scrapes your posts for the personal stuff, your pet, your team, your birthday, and feeds all of it into the rig too.",
  "/audio/wren/m03-c6-b3.mp3":
    "[serious] Move three, PATIENCE. His rig guesses millions a second, day and night, and it only has to get lucky once.",
  "/audio/wren/m03-c6-b4.mp3":
    "[determined] And the counter to all of it? Take yourself OFF his list. Long, random, and unique for every door. He can't guess what isn't a word and isn't about you.",
  "/audio/wren/m03-c6-chk1-ok.mp3":
    "[proud] Yes. Feeding your own life into the rig is move two. He doesn't trick you, he studies you.",
  "/audio/wren/m03-c6-chk2-ok.mp3":
    "[proud] Exactly. He can't guess what isn't a word and isn't about you, and a unique key stops one lucky hit spreading.",
  "/audio/wren/m03-c6-practice.mp3":
    "[excited] Now let's put it to work, Agent. Here's tonight's evidence, laid out on the next screen. [determined] Tap the three moves that are really SKELETON KEY's, no more, no less.",
  "/audio/wren/m03-c6-play.mp3":
    "[determined] Here's the evidence from tonight. Tap the 3 moves that are really SKELETON KEY's.",

  // cycle 7 — lock every door
  "/audio/wren/m03-c7-b1.mp3":
    "[curious] So how do you actually lock every door, without a genius memory? A real plan, in four steps.",
  "/audio/wren/m03-c7-b2.mp3":
    "[determined] Step one, the emergency. Change your ONE most-reused password today, starting with your email. That snaps the master key in half.",
  "/audio/wren/m03-c7-b3.mp3":
    "[warm] Steps two and three, go long and go unique. Three random words each, a different set for every important door. Never the same key twice.",
  "/audio/wren/m03-c7-b4.mp3":
    "[encouraging] Step four, the cheat code. A password manager remembers all of them, so you only remember one. That's how the pros run forty strong passwords without breaking a sweat.",
  "/audio/wren/m03-c7-chk1-ok.mp3":
    "[proud] Right. Snapping the most-reused key first, at the master door, does the most good the fastest.",
  "/audio/wren/m03-c7-chk2-ok.mp3":
    "[proud] That's the cheat code. A manager holds every strong key, so you only have to remember one.",
  "/audio/wren/m03-c7-practice.mp3":
    "[excited] Now let's put it to work, Agent. Time to build Jake's lock-down plan properly. [encouraging] For each step, pick the move that actually holds, not just the one that sounds safe.",
  "/audio/wren/m03-c7-play.mp3":
    "[determined] Build Jake's lock-down plan. For each step, pick the move that actually holds.",

  // the test
  "/audio/wren/m03-catch-intro.mp3":
    "[warm] Okay Agent, this is the real test. [serious] Nineteen questions, and not one of them is “what did I say”. Every single one makes you THINK. Take what you learned about the rig, and work out an answer you've never seen before. [determined] I won't tell you how you're doing until the very end. Get fifteen right to close the case. Miss it, and you sit the whole case again. [encouraging] Take your time.",

  // debrief
  "/audio/wren/m03-debrief.mp3":
    "[proud] Ten thousand doors, all still locked. [excited] Your rules now, Agent, not his. [warm] Sign out.",
};
