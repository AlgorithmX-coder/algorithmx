/**
 * Mission 03 — "The Guessing Game" (Block 1: Signals, CONFIDENTIAL).
 * Actor: SKELETON KEY ①. Built to the LOCKED case framework
 * (see docs/explorers/case-framework-locked.md) — Case 001 is the reference.
 *
 * SEVEN skills, each LEARN -> PRACTICE, then ONE blind must-pass TEST. The
 * locks/doors/keys metaphor carries it: SKELETON KEY is a cocky lock-picker
 * with a guessing rig; your password is a key, email is the master door.
 *   1 how the rig guesses (beats + SORT)    — the rig runs LISTS, obvious first
 *   2 the ingredients      (beats + INSPECT) — a weak password is built from YOU
 *   3 one key, every door  (beats + DECIDE)  — reuse is a master key; save email
 *   4 length beats clever   (beats + METER)   — SIGNATURE: watch crack-time explode
 *   5 three random words   (beats + BUILD)   — a long passphrase you'll remember
 *   6 SKELETON KEY's play  (beats + PROFILE) — list + your life + patience
 *   7 lock every door      (beats + BUILD)   — the lock-down plan
 *
 * Signature per curriculum-map-v1: METER debut (the crack-time slider), the
 * "watch the rig run" teach hook, and a read-the-queue boss (Ten Thousand
 * Doors) — deliberately NOT Case 001's triage or Case 002's find-the-hub.
 *
 * Safety canon (Redoubt boundary): the child WATCHES and ANALYZES the rig; in
 * the fiction it runs inside ARC's sealed range. The child never operates it,
 * and audits are volunteer-authorized.
 */

import Mission03Incident from "../incidents/Mission03Incident";
import type { MissionManifest } from "../engine/types";

export const mission03: MissionManifest = {
  id: "explorers-m03",
  caseNumber: "CASE 003",
  title: "The Guessing Game",
  block: 1,
  classification: "CONFIDENTIAL",
  actor: {
    codename: "SKELETON KEY",
    mo: "Doesn't trick you. He guesses you. Swears every lock talks eventually.",
    portrait: "/explorers/actors/skeleton-key.png",
  },

  hook: "Someone's guessing student passwords. Millions of tries a second, no coffee breaks. Let's beat him at his own game.",
  scene: "/explorers/scenes/m03-cold-open.jpg",

  transmission: {
    headline: "RIG DETECTED",
    lines: [
      "Agent, a password-guessing rig just lit up ARC's board, aimed straight at student accounts.",
      "No bait, no lies, no clever message. Just cold guessing, millions a second, all night long.",
      "The owner calls himself SKELETON KEY. Says every lock talks eventually. Let's prove him wrong.",
    ],
  },

  briefing: {
    summary:
      "SKELETON KEY doesn't fool people, he guesses them. He runs a list, feeds in your own life, and waits. Tonight we learn his math and build a lock his rig can't open.",
    objectives: [
      "See how the rig actually guesses, and why weak keys fall first",
      "Snap the reuse chain, and build a passphrase that holds",
      "Learn SKELETON KEY's play, and lock every door for good",
    ],
    wrenLine: "Seven skills, then a test to close the case. One rule tonight, Agent. His rig never sleeps, so your locks had better hold. Ready?",
  },

  cycles: [
    /* --------------------------------------------- cycle 1: how the rig guesses */
    {
      id: "rig",
      title: "How the rig guesses",
      concept: "A guessing rig isn't magic; it runs lists, and the obvious stuff falls first",
      checkpoint: {
        questions: [
          { id: "m03-c1-chk1", question: "The rig works down a list, most common first. Which of these would it reach almost instantly?", options: ["football", "wobble-tractor-lemon-glow", "kv83-quartz-hollow"], answer: 0, ok: "Right. 'football' is a common word sitting near the top of the rig's list, so it falls in the first second.", okVoice: "/audio/wren/m03-c1-chk1-ok.mp3" },
          { id: "m03-c1-chk2", question: "Which of these would make the rig grind the LONGEST?", options: ["password2024", "iloveyou", "kettle-marble-fox-73"], answer: 2, ok: "Exactly. Random, unrelated words are on no list, so the rig has nothing to grab and has to grind for years.", okVoice: "/audio/wren/m03-c1-chk2-ok.mp3" },
        ],
      },
      promise: "You'll learn why a weak password falls in seconds and a strong one doesn't.",
      instruction: "Sort each password: is it already on the rig's list, or does it make the rig work?",
      intel: {
        beats: [
          "Behind that glass is SKELETON KEY's rig. It's guessing passwords, millions a second, and it never gets tired, hungry, or bored.",
          "But here's the secret. It isn't guessing at random. It works down a LIST, most common first. Real words, names, pets, birthdays, 123456, password, keyboard rows like qwerty.",
          "So Millie2013! feels personal to you. To the rig it's just a name, plus a year, plus a !. That exact shape sits near the top of the list. Gone in under a second.",
          "The rig never met Millie. It didn't have to. Anything on its list falls fast. Anything NOT on the list makes it grind for years. That's the whole game.",
        ],
        beatAudio: [
          "/audio/wren/m03-c1-b1.mp3",
          "/audio/wren/m03-c1-b2.mp3",
          "/audio/wren/m03-c1-b3.mp3",
          "/audio/wren/m03-c1-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "SORT",
        payload: {
          intro: "A batch of passwords. Sort each one: is it already on the rig's list (falls fast), or does it make the rig work?",
          buckets: [
            { id: "list", label: "ON THE LIST", hint: "falls in seconds" },
            { id: "work", label: "MAKES IT WORK", hint: "the rig grinds" },
          ],
          items: [
            { id: "s1", label: "123456", bucket: "list", why: "The single most-guessed password on earth. It's guess number one." },
            { id: "s2", label: "password1", bucket: "list", why: "'password' with a 1 stuck on the end. The rig tries that before its first coffee." },
            { id: "s3", label: "Emma2015!", bucket: "list", why: "A name, plus a year, plus a !. The rig's favourite shape. Down in under a second." },
            { id: "s4", label: "qwerty", bucket: "list", why: "A row of keys. The rig knows every keyboard walk by heart." },
            { id: "s5", label: "Liverpool2024", bucket: "list", why: "A popular team plus a year. The rig has a list of teams too." },
            { id: "s6", label: "purple-otter-cannon-14", bucket: "work", why: "Four random, unrelated words. Not on any list. The rig would grind for centuries." },
            { id: "s7", label: "tromboneglaciermuffin", bucket: "work", why: "Long, random, and about nothing. There's nothing for the list to grab." },
          ],
          doneLine: "See the split? Real words, names, years, key-rows, anything the rig already has a note for, falls in seconds. Long, random, and about-nothing is what makes it work.",
        },
      },
      playAudio: "/audio/wren/m03-c1-play.mp3",
    },

    /* --------------------------------------------- cycle 2: the ingredients */
    {
      id: "ingredients",
      title: "The ingredients you hand it",
      concept: "A weak password is built from YOU, and the rig can read your life",
      checkpoint: {
        questions: [
          { id: "m03-c2-chk1", question: "Why isn't Leo's password as personal and safe as he thinks?", evidence: "Leo's password: Leo2011!", options: ["The symbols make it really strong", "Every part is his name and birth year, both easy to look up", "It's far too long for the rig to bother with"], answer: 1, ok: "That's it. His name and birth year are one quick search away, so none of it is actually a secret.", okVoice: "/audio/wren/m03-c2-chk1-ok.mp3" },
          { id: "m03-c2-chk2", question: "Does writing 'Passw0rd' with a zero instead of an o fool the rig?", options: ["No, the rig already tries that swap automatically", "Yes, zeros are impossible to guess", "Yes, it becomes a brand-new word"], answer: 0, ok: "Right. Swapping o for 0 is an old trick the rig checks by itself, so it doesn't slow it down at all.", okVoice: "/audio/wren/m03-c2-chk2-ok.mp3" },
        ],
      },
      promise: "You'll learn to spot the guessable bits you've baked into a password.",
      instruction: "Tap every password the rig would crack from knowing Jake, plus the mistake that links them.",
      intel: {
        beats: [
          "Where does a password like Jake2014! even come from? From Jake. His name, his birth year, a ! to feel safe. Every bit of it is about him.",
          "And the rig can READ Jake. His name's on his profile. His birthday is in a 'happy birthday' post. His dog Biscuit is in every photo he's tagged in.",
          "So each 'personal' bit isn't a secret. It's a clue he handed over. And swaps like a-to-@ or o-to-0? The rig knows those too. P@ssw0rd isn't clever, it's right there on the list.",
          "Read a password the way the rig does. Strip out everything it could look up or guess about you, and see what's actually left. Usually? Nothing.",
        ],
        beatAudio: [
          "/audio/wren/m03-c2-b1.mp3",
          "/audio/wren/m03-c2-b2.mp3",
          "/audio/wren/m03-c2-b3.mp3",
          "/audio/wren/m03-c2-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "Jake let us audit his passwords. Tap every one the rig would crack from knowing Jake, plus the mistake that puts them all at risk.",
          device: { app: "NOTES", owner: "JAKE'S PHONE (audit: he said yes)" },
          header: [
            { label: "NOTE:", seg: { id: "title", text: "my logins (don't tell anyone lol)" } },
            { label: "AUDIT:", seg: { id: "audit", text: "authorized by Jake · ARC volunteer check" } },
          ],
          body: [
            [{ id: "e1", text: "GameHub: Biscuit2013 (my dog + my bday)", tellId: "pet", mono: true }],
            [{ id: "e2", text: "School email: Biscuit2013 (same one, it's easier!)", tellId: "reuse", mono: true }],
            [{ id: "e3", text: "TikTok: Liverpool!23 (best team ever)", tellId: "team", mono: true }],
            [{ id: "e4", text: "Library: violin-comet-pickle-88", mono: true }],
          ],
          tells: [
            { id: "pet", label: "Pet + birthday", why: "Biscuit's his dog, tagged in every photo, and 2013's his birth year. Both are one search away." },
            { id: "reuse", label: "The same key twice", why: "The exact same key on his email as his game. One leak and the master door opens too. The worst mistake here." },
            { id: "team", label: "Team + a swap", why: "His favourite team plus a swap. The rig has a list of teams, and it knows ! and 3-for-E cold." },
          ],
          doneLine: "Three easy locks, and the reuse that chains them together. That library one, four random words, is the only thing here the rig would actually sweat over.",
          doneAudio: "/audio/wren/m03-c2-review.mp3",
        },
      },
      playAudio: "/audio/wren/m03-c2-play.mp3",
    },

    /* --------------------------------------------- cycle 3: one key, every door */
    {
      id: "reuse",
      title: "One key, every door",
      concept: "A reused password is a master key; one leak opens every door, and email is the master door",
      checkpoint: {
        questions: [
          { id: "m03-c3-chk1", question: "Sara uses the same password on her game, her socials, and her email. That one password leaks. What can the attacker do?", options: ["Only open the game it leaked from", "Try that one key on every other account too", "Nothing, a leaked password is harmless"], answer: 1, ok: "Exactly. One reused key means a single leak swings open every door that shares it.", okVoice: "/audio/wren/m03-c3-chk1-ok.mp3" },
          { id: "m03-c3-chk2", question: "Why is the email account the very first one to protect?", options: ["It can reset the passwords on your other accounts", "It just holds your oldest messages", "It collects the most adverts"], answer: 0, ok: "Right. 'Forgot password' sends a reset link to your email, so owning the email means owning everything.", okVoice: "/audio/wren/m03-c3-chk2-ok.mp3" },
        ],
      },
      promise: "You'll learn why one leak can take every account, and which door to save first.",
      instruction: "Jake's reused password just leaked. Make the call.",
      intel: {
        beats: [
          "Last month a little game forum got breached, and its whole list of passwords spilled out. SKELETON KEY bought that list for pennies.",
          "Now he does the obvious thing. He takes each leaked password and tries it on every OTHER site. Same person, same email, same games.",
          "If you reused that password, every door with that key just swung open at once. And one of those doors is the master. Your email.",
          "Why email? Because 'forgot my password' sends a reset link straight to your email. Own the email, own everything. So when a key leaks, the email lock is the one you save first.",
        ],
        beatAudio: [
          "/audio/wren/m03-c3-b1.mp3",
          "/audio/wren/m03-c3-b2.mp3",
          "/audio/wren/m03-c3-b3.mp3",
          "/audio/wren/m03-c3-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Jake's reused password just leaked. He can fix ONE account first. Make the call.",
          situation:
            "Jake's forum password just leaked, and he reused it in three places: his game, his socials, and his email. He only has time to fix ONE account before dinner. Where does he start?",
          prompt: "YOUR CALL, AGENT:",
          options: [
            {
              id: "game",
              label: "The game account, since the leak came from there",
              outcome:
                "The leak started there, sure, but SKELETON KEY already copied the password and moved on. The game is the least of Jake's worries now.",
            },
            {
              id: "email",
              label: "The email, since it can reset everything else",
              correct: true,
              outcome:
                "Right. Email is the master door, it can reset every other lock in the house. Save it first, then work down the list. That's triage.",
            },
            {
              id: "social",
              label: "The socials, because losing those would be so embarrassing",
              outcome:
                "Embarrassing, yeah. But from inside his email, SKELETON KEY could reset the socials anyway. Lock the master door first.",
            },
          ],
        },
      },
      playAudio: "/audio/wren/m03-c3-play.mp3",
    },

    /* --------------------------------------------- cycle 4: length beats cleverness (METER — signature) */
    {
      id: "length",
      title: "Length beats cleverness",
      concept: "What actually costs the rig time is length, not clever symbol swaps",
      checkpoint: {
        questions: [
          { id: "m03-c4-chk1", question: "Which of these would take the rig the LONGEST to crack?", options: ["Xy7$!q", "coppertunnelmangoladder", "P@ss1"], answer: 1, ok: "Yes. It has no symbols at all, but it's long, and length is what buries the rig for centuries.", okVoice: "/audio/wren/m03-c4-chk1-ok.mp3" },
          { id: "m03-c4-chk2", question: "You can change ONE thing about a short password. Which helps most against the rig?", options: ["Add several more characters to make it longer", "Add a single ! at the end", "Change an e to a 3"], answer: 0, ok: "That's the real lever. Length multiplies the rig's work, while a lone symbol or swap barely slows it down.", okVoice: "/audio/wren/m03-c4-chk2-ok.mp3" },
        ],
      },
      promise: "You'll SEE why a long dull password beats a short clever one.",
      instruction: "Drag the length up until the rig would give up, then lock it in.",
      intel: {
        beats: [
          "Here's the thing nobody tells you. The rig doesn't care how CLEVER your password looks. It cares how LONG it is.",
          "P@ssw0rd! looks tough, all those symbols. But it's short, and every swap in it is on the rig's list. It falls in minutes.",
          "Now add length. Every extra character doesn't ADD to the rig's work, it MULTIPLIES it. A few more characters, and 'minutes' becomes 'centuries'.",
          "That's the real lever. Not symbols, not a capital, not a !. Length. Watch what happens to the rig's own clock when you slide it up.",
        ],
        beatAudio: [
          "/audio/wren/m03-c4-b1.mp3",
          "/audio/wren/m03-c4-b2.mp3",
          "/audio/wren/m03-c4-b3.mp3",
          "/audio/wren/m03-c4-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "METER",
        payload: {
          intro: "This is the rig's own clock. Drag the password LENGTH up and watch how long the rig would need. Park it where the rig gives up, then lock it in.",
          prompt: "Password length",
          minLabel: "4 characters",
          maxLabel: "20+ characters",
          readoutLabel: "Rig cracks it in:",
          zones: [
            { upTo: 25, label: "Short: it's on the list, gone at once.", caption: "an instant", good: false },
            { upTo: 50, label: "Still short: a rig chews through this in an afternoon.", caption: "a few hours", good: false },
            { upTo: 74, label: "Getting there, but a patient rig still wins in the end.", caption: "a few weeks", good: false },
            { upTo: 100, label: "Long enough that the rig gives up. This is the safe zone.", caption: "centuries", good: true },
          ],
          doneLine: "There it is. You didn't add a single symbol. You just made it LONGER, and the rig's clock jumped from 'an instant' to 'centuries'. Length is the whole trick.",
          doneAudio: "/audio/wren/m03-c4-review.mp3",
        },
      },
      playAudio: "/audio/wren/m03-c4-play.mp3",
    },

    /* --------------------------------------------- cycle 5: three random words (BUILD) */
    {
      id: "phrase",
      title: "Three random words",
      concept: "Three or four random, unrelated words make a long password you can actually remember",
      checkpoint: {
        questions: [
          { id: "m03-c5-chk1", question: "Which of these is the best passphrase?", options: ["badger-lantern-syrup-cloud", "MyTownIsLeeds2012", "summer-holiday-fun"], answer: 0, ok: "Perfect. Four random, unrelated words that are nothing to do with you: long, unguessable, and easy to picture.", okVoice: "/audio/wren/m03-c5-chk1-ok.mp3" },
          { id: "m03-c5-chk2", question: "Why NOT build your passphrase from a line of your favourite song?", options: ["Song words are too short to use", "The words rhyme and confuse the rig", "Famous lines are already on the rig's list"], answer: 2, ok: "Right. A well-known lyric is on the list the rig already tries, so random has to mean truly random.", okVoice: "/audio/wren/m03-c5-chk2-ok.mp3" },
        ],
      },
      promise: "You'll build a passphrase that's long, strong, and sticks in your head.",
      instruction: "Build a passphrase the rig can't guess. Pick the safe part for each slot.",
      intel: {
        beats: [
          "'Long' is great, but who remembers twenty random letters? Nobody. So here's the trick the pros actually use. Random WORDS.",
          "Pick three or four words that have nothing to do with each other, and nothing to do with you. Otter. Cannon. Velvet. Stick them together.",
          "It's long, so the rig's clock explodes. It's random, so it's on no list. And it's WORDS, so your brain can picture it. A cannon-firing otter in a velvet coat. You will not forget that.",
          "The trap? Words that ARE about you. Your dog, your town, a song lyric everyone knows. Random has to mean random. No shortcuts the rig could ever guess.",
        ],
        beatAudio: [
          "/audio/wren/m03-c5-b1.mp3",
          "/audio/wren/m03-c5-b2.mp3",
          "/audio/wren/m03-c5-b3.mp3",
          "/audio/wren/m03-c5-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "BUILD",
        payload: {
          intro: "Build Jake a passphrase the rig can't touch. For each slot, pick the part that's long, random, and nothing to do with him.",
          target: "A passphrase that holds",
          slots: [
            {
              id: "w1",
              label: "First word",
              options: [
                { id: "w1a", label: "otter", good: true, why: "Random, and about nothing. A perfect first word." },
                { id: "w1b", label: "Jake", good: false, why: "His own name, right there on his profile. The first thing the rig tries." },
              ],
            },
            {
              id: "w2",
              label: "Second word",
              options: [
                { id: "w2a", label: "cannon", good: true, why: "Unrelated to word one, and unrelated to Jake. Exactly right." },
                { id: "w2b", label: "Liverpool", good: false, why: "His favourite team is on the rig's word list. Skip it." },
              ],
            },
            {
              id: "w3",
              label: "Third word",
              options: [
                { id: "w3a", label: "velvet", good: true, why: "Nothing links these three words. That randomness is the whole point." },
                { id: "w3b", label: "password", good: false, why: "'password' sits at the very top of the rig's list. Never." },
              ],
            },
            {
              id: "w4",
              label: "One more, for length",
              options: [
                { id: "w4a", label: "thunder (a 4th random word)", good: true, why: "More length means more centuries. The rig hates every extra word." },
                { id: "w4b", label: "2013 (his birth year)", good: false, why: "A year is guessable and barely adds length. Another random word is far stronger." },
              ],
            },
          ],
          testLine: "otter-cannon-velvet-thunder. Long, random, unrelated, and you can SEE it in your head. The rig would grind for centuries.",
          doneLine: "That's a passphrase that holds. Four random words beat every clever symbol trick, and you will actually remember it.",
        },
      },
      playAudio: "/audio/wren/m03-c5-play.mp3",
    },

    /* --------------------------------------------- cycle 6: know SKELETON KEY's play (PROFILE) */
    {
      id: "play",
      title: "Know SKELETON KEY's play",
      concept: "Every guessing attack is a list, plus your own life, plus endless patience",
      checkpoint: {
        questions: [
          { id: "m03-c6-chk1", question: "Which of these is one of SKELETON KEY's three real moves?", options: ["Sending a fake 'you won a prize!' message", "Building a copycat login page", "Scraping your posts for your pet and birthday"], answer: 2, ok: "Yes. Feeding your own life into the rig is move two. He doesn't trick you, he studies you.", okVoice: "/audio/wren/m03-c6-chk1-ok.mp3" },
          { id: "m03-c6-chk2", question: "What single habit beats every part of his guessing game?", options: ["Changing your username often", "Long, random, unique passwords for each door", "A trickier secret question"], answer: 1, ok: "Exactly. He can't guess what isn't a word and isn't about you, and a unique key stops one lucky hit spreading.", okVoice: "/audio/wren/m03-c6-chk2-ok.mp3" },
        ],
      },
      promise: "You'll learn SKELETON KEY's whole game, and the one thing that beats it.",
      instruction: "Tap the 3 moves that are really SKELETON KEY's.",
      intel: {
        beats: [
          "Let's name SKELETON KEY's game so you see it coming. Move one, THE LIST. He starts with the millions of most-common passwords. 123456, real words, names. Most people are somewhere on it.",
          "Move two, YOUR LIFE. He scrapes your posts for the personal stuff, your pet, your team, your birthday, and feeds all of it into the rig too.",
          "Move three, PATIENCE. His rig guesses millions a second, day and night, and it only has to get lucky once.",
          "And the counter to all of it? Take yourself OFF his list. Long, random, and unique for every door. He can't guess what isn't a word and isn't about you.",
        ],
        beatAudio: [
          "/audio/wren/m03-c6-b1.mp3",
          "/audio/wren/m03-c6-b2.mp3",
          "/audio/wren/m03-c6-b3.mp3",
          "/audio/wren/m03-c6-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "PROFILE",
        payload: {
          intro: "Here's the evidence from tonight. Tap the 3 moves that are really SKELETON KEY's.",
          evidence: [
            "Emma2015! fell in under a second",
            "The same key opened her email as her game",
            "None of it needed a single trick, link, or lie",
          ],
          behaviors: [
            { id: "list", label: "Runs the millions-of-common-passwords list first", matches: true },
            { id: "scrape", label: "Feeds in your pet, team and birthday from your posts", matches: true },
            { id: "patience", label: "Guesses day and night until one finally hits", matches: true },
            { id: "prize", label: "Sends a fake 'you won a prize!' giveaway", matches: false },
            { id: "lookalike", label: "Builds a fake look-alike login page", matches: false },
            { id: "rush", label: "Warns your account shuts in 24 hours", matches: false },
          ],
          picks: 3,
          doneLine: "That's his whole game. A list, your life, and endless patience. No tricks anywhere. So beat him with the three things he can't guess: long, random, unique.",
        },
      },
      playAudio: "/audio/wren/m03-c6-play.mp3",
    },

    /* --------------------------------------------- cycle 7: lock every door (BUILD) */
    {
      id: "plan",
      title: "Lock every door",
      concept: "The fix-it plan: change the reused one, go long, make each unique, let a manager remember",
      checkpoint: {
        questions: [
          { id: "m03-c7-chk1", question: "You're locking down all your accounts. What's the very FIRST move?", options: ["Buy a brand-new device first", "Change your least-used account first", "Change your most-reused password, starting with email"], answer: 2, ok: "Right. Snapping the most-reused key first, at the master door, does the most good the fastest.", okVoice: "/audio/wren/m03-c7-chk1-ok.mp3" },
          { id: "m03-c7-chk2", question: "How do the pros remember forty different strong passwords?", options: ["They reuse one clever password everywhere", "A password manager remembers them all", "They write them in a note called 'passwords'"], answer: 1, ok: "That's the cheat code. A manager holds every strong key, so you only have to remember one.", okVoice: "/audio/wren/m03-c7-chk2-ok.mp3" },
        ],
      },
      promise: "You'll build the exact plan to lock every door for good.",
      instruction: "Build the lock-down plan. Pick the right move for each step.",
      intel: {
        beats: [
          "So how do you actually lock every door, without a genius memory? A real plan, in four steps.",
          "Step one, the emergency. Change your ONE most-reused password today, starting with your email. That snaps the master key in half.",
          "Steps two and three, go long and go unique. Three random words each, a different set for every important door. Never the same key twice.",
          "Step four, the cheat code. A password manager remembers all of them, so you only remember one. That's how the pros run forty strong passwords without breaking a sweat.",
        ],
        beatAudio: [
          "/audio/wren/m03-c7-b1.mp3",
          "/audio/wren/m03-c7-b2.mp3",
          "/audio/wren/m03-c7-b3.mp3",
          "/audio/wren/m03-c7-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "BUILD",
        payload: {
          intro: "Build Jake's lock-down plan. For each step, pick the move that actually holds.",
          target: "Jake's lock-down plan",
          slots: [
            {
              id: "first",
              label: "Do this first",
              options: [
                { id: "f1", label: "Change the reused email password now", good: true, why: "The master door, and the most-reused key. That's exactly where you start." },
                { id: "f2", label: "Change the least-important account first", good: false, why: "Backwards. The master door and the reused key are what matter most." },
              ],
            },
            {
              id: "make",
              label: "Make each key",
              options: [
                { id: "m1", label: "Long, and different for every door", good: true, why: "Unique means one leak can never open a second door." },
                { id: "m2", label: "One strong password used everywhere", good: false, why: "Even a strong key, reused, is one leak away from opening everything." },
              ],
            },
            {
              id: "remember",
              label: "Remember them with",
              options: [
                { id: "r1", label: "A password manager", good: true, why: "It remembers forty strong passwords so you only remember one." },
                { id: "r2", label: "A notes file called 'passwords'", good: false, why: "One peek and it's all gone. That's not a vault, it's a gift." },
              ],
            },
            {
              id: "second",
              label: "Add a second lock",
              options: [
                { id: "s1", label: "Turn on 2-step login where you can", good: true, why: "Even a guessed password fails without the second code. And nobody legit ever asks you for that code." },
                { id: "s2", label: "Just add a ! to each password", good: false, why: "A ! is on the rig's list. It's not a second lock, it's decoration." },
              ],
            },
          ],
          testLine: "Reused key snapped, every door long and unique, a manager holding the whole ring, and a second lock on top. Ten thousand doors, all held.",
          doneLine: "That's the plan. Do the email one this week, and SKELETON KEY's rig spends the rest of its life guessing at nothing.",
        },
      },
      playAudio: "/audio/wren/m03-c7-play.mp3",
    },
  ],

  incident: {
    title: "Ten Thousand Doors",
    phases: 3,
    phaseNames: ["Read the rig's queue", "Cut the master key", "Hold the wall"],
    component: Mission03Incident,
  },

  catchThem: {
    intro:
      "Okay Agent, this is the real test. Nineteen questions, and not one of them is “what did I say”. Every single one makes you THINK. Take what you learned about the rig and work out an answer you've never seen before. I won't tell you how you're doing until the very end. Get fifteen right to close the case. Miss it, and you sit the whole case again. Take your time.",
    pass: 15,
    voice: {
      intro: "/audio/wren/m03-catch-intro.mp3",
      pass: "/audio/wren/m01-catch-pass.mp3",
      fail: "/audio/wren/m01-catch-fail.mp3",
    },
    // 19 fresh, think-for-yourself questions across the 7 skills. Options shuffle
    // at render; lengths balanced so the correct one is never the giveaway-longest.
    // skill: 0 how-the-rig-guesses · 1 ingredients · 2 reuse · 3 length
    //        4 three-random-words · 5 SKELETON-KEY's-play · 6 lock-down-plan.
    scenarios: [
      { id: "cq1", skill: 0, prompt: "A guessing rig works down a list, most common first. Which does it try earliest?", options: ["password123", "a 16-letter random jumble", "four unrelated random words", "a long line of nonsense"], answer: 0 },
      { id: "cq2", skill: 0, prompt: "Why does “qwerty” fall almost instantly?", options: ["A keyboard row the rig knows", "It is simply far too short", "It has no numbers at all in it", "It isn't a real dictionary word"], answer: 0 },
      { id: "cq3", skill: 0, prompt: "A friend says his password “dinosawr” is safe because he spelled it wrong. Is he right?", options: ["No, it's still near a real word", "Yes, misspelling makes it unbreakable", "Yes, made-up words are always safe", "Only if he also adds a capital"], answer: 0 },
      { id: "cq4", skill: 1, prompt: "Which password could the rig most likely guess just from your posts?", options: ["Your dog's name and birth year", "Four random unrelated words", "A long jumble of random letters", "A line from your private diary"], answer: 0 },
      { id: "cq5", skill: 1, prompt: "Why doesn't swapping “a” for “@” make a password much stronger?", options: ["The rig already tries those swaps", "Symbols jam the rig for hours", "It makes the whole thing too long", "Numbers matter far more than that"], answer: 0 },
      { id: "cq6", skill: 1, prompt: "Which of these is the WEAKEST, even though it looks careful?", options: ["Emma-2010!", "grapefruit-anchor-piano-6", "a manager's 20 random letters", "four random words joined up"], answer: 0 },
      { id: "cq7", skill: 2, prompt: "You reuse one password everywhere and one site gets breached. What's the danger?", options: ["That key now opens all your doors", "Only that single site is affected", "Nothing, breaches get cleaned up", "You just change it there next year"], answer: 0 },
      { id: "cq8", skill: 2, prompt: "Why guard your email password hardest of all?", options: ["It can reset your other accounts", "It holds the most old messages", "It is usually your oldest account", "It gets the most spam of them all"], answer: 0 },
      { id: "cq9", skill: 2, prompt: "A game forum you use gets breached. Best move?", options: ["Change it where you reused it", "Wait for the forum to apologise", "Delete the forum and just move on", "Add one number to that password"], answer: 0 },
      { id: "cq10", skill: 3, prompt: "What makes a password hardest of all for the rig?", options: ["Being long", "Having a capital letter", "Ending it with a !", "Swapping an o for a 0"], answer: 0 },
      { id: "cq11", skill: 3, prompt: "P@ssw0rd! or pineapple-ladder-comet. Which holds longer against the rig?", options: ["pineapple-ladder-comet", "P@ssw0rd!, it has symbols", "They are both about the same", "P@ssw0rd!, it has a capital"], answer: 0 },
      { id: "cq12", skill: 3, prompt: "You can improve a password ONE way. Which helps the most?", options: ["Make it a lot longer", "Add one exclamation mark", "Capitalise the first letter", "Swap a letter for a number"], answer: 0 },
      { id: "cq13", skill: 4, prompt: "Which is the best passphrase?", options: ["walrus-forest-trumpet-echo", "Manchester-United-forever-2013", "MyNameIsJake2011", "Summer-Holiday-Fun!"], answer: 0 },
      { id: "cq14", skill: 4, prompt: "Why pick RANDOM words instead of a favourite song lyric?", options: ["Known lines are on the list", "Lyrics are far too long to type", "Songs change too often to trust", "Rhyming words confuse the rig"], answer: 0 },
      { id: "cq15", skill: 4, prompt: "Three random words are strong, and also:", options: ["easy for you to remember", "impossible to ever type fast", "only safe on one account", "weaker than a short one"], answer: 0 },
      { id: "cq16", skill: 5, prompt: "SKELETON KEY guesses instead of tricking. What actually beats him?", options: ["Long, random, unique passwords", "Never clicking a link ever again", "A cleverer secret question", "Changing your username a lot"], answer: 0 },
      { id: "cq17", skill: 5, prompt: "Which is NOT one of SKELETON KEY's moves?", options: ["Faking a 'you won!' prize message", "Running a list of common passwords", "Scraping your posts for clues", "Guessing millions of times a second"], answer: 0 },
      { id: "cq18", skill: 6, prompt: "What's the FIRST step to lock down your accounts?", options: ["Change your reused password", "Buy a brand-new laptop first", "Delete all of your old accounts", "Tell everyone your new rules"], answer: 0 },
      { id: "cq19", skill: 6, prompt: "What does a password manager actually do for you?", options: ["Remembers strong passwords for you", "Guesses passwords like the rig does", "Shares your passwords with sites", "Makes one password work anywhere"], answer: 0 },
    ],
  },

  debrief: {
    report: [
      "You took the guessing rig apart: it's a list, it's your own life, it's patience. No magic anywhere.",
      "You snapped the reuse chain by locking the master door first, then built a passphrase, long and random, the rig can't touch.",
      "You named SKELETON KEY's three moves and built the plan to hold every door, and his rig bounced right off the wall.",
    ],
    realWorldMove:
      "This week: find your one most-reused password and change it, starting with your email. Make the new one three random words that have nothing to do with you. If an account is shared with family, do it together with a parent. And if you can, turn on 2-step login on your most important account.",
    wrenLine: "Ten thousand doors, all still locked. Your rules now, Agent, not his. Sign out.",
  },

  voice: {
    transmission: "/audio/wren/m03-transmission.mp3",
    briefing: "/audio/wren/m03-briefing.mp3",
    debrief: "/audio/wren/m03-debrief.mp3",
  },

  dossier: {
    mo: "Doesn't trick you, he guesses you. Names, pets, birthdays, then every stolen key on every door. Guesses millions a second and swears every lock talks eventually.",
    defeatedBy: "Long, random passphrases, never reused, with the master door (email) locked first. The rig does the math, sulks, and gives up.",
  },
};
