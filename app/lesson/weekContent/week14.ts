import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 14 - Smart Devices: Who's Listening?
 *
 * Rebuilt to the Learn-Loop Build Standard v0.10. World: THE LISTENING HOUSE -
 * a warm, lamp-lit home where the gadgets are ordinary helpers with one
 * property worth understanding.
 *
 *   video -> alert -> ATLAS briefing -> mission
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 EARS     which things listen at all      | hookSort "house"   | recall
 *     2 DIARY    they help AND they keep a copy   | speakerDiary NEW   | lie
 *     3 EYES     a lens that is awake shows it    | lensCheck NEW      | finish
 *     4 OUT LOUD saying it is still recording it  | replyCards "speaker" | speed
 *     5 SWITCH   flip the device switches together| settingsSwitch "house" | order
 *   review (signBingo, house skin) -> boss -> video -> debrief -> stickers ->
 *   completion. 30 screens, no game before Learn 1.
 *
 * **TONE RULE, inherited from the legacy week and non-negotiable: curious,
 * never creepy.** Devices are helpers to KNOW about, not monsters to fear. No
 * device is drawn as a watcher. Nothing here should make a child uneasy in
 * their own home. The one hard safeguarding line stays: a lens pointing at a
 * bed is told to a grown-up, every time.
 *
 * **The `goodnightGadgets` signature is RETIRED, not converted (2026-09-22).**
 * It is a smart-home bedtime where each sensing gadget is tucked in and the
 * harmless ones (night-light, teddy) get a soft "no eyes, no ears" teach, the
 * room dims and a moon rises. That is Week 13's `nightFall`, which shipped
 * first. A signature conversion is not mandatory (Week 5 rebuilt without one,
 * and "no game before Learn 1" already removed the screen-4 slot), so this week
 * simply fills the beat elsewhere. Found by the forward-collision sweep, which
 * exists because building Week 13 without checking FORWARD is what caused it.
 *
 * Engine allocation (see RETHEME_ALLOWED[14] in scripts/audit-engine-reuse.mjs):
 * - hookSort, replyCards and settingsSwitch are used by legacy weeks only, so
 *   they are FREE rather than re-themes. All three were wired to the Learn-Loop
 *   standard for the first time here (spoken verdicts, read-alouds, the tap
 *   latch); Weeks 16, 17, 18 and 19 keep their old behaviour behind a flag.
 * - speakerDiary and lensCheck are NEW. speakerDiary opens a kept record and
 *   stamps WHY it is there; lensCheck COMPARES TWO STATES of one corner and
 *   spots what woke up, which nothing else in the library does.
 * - signBingo returns from Weeks 1 and 6 as the review, its third and final
 *   use. It was chosen over LobbyDoors because a review has to make the child
 *   RETRIEVE the five powers: LobbyDoors is decided by a visible badge, so it
 *   can be won without recalling anything.
 *
 * SignBingo authoring rules (the engine dead-ends otherwise): every `signId` is
 * distinct, one sign per round, and `signs.length === rounds.length`. A repeated
 * signId makes the second round unwinnable with no error. `roundPrompt` is
 * vault-only and would be silent here, so it is not authored.
 *
 * Lane-clean: what a DEVICE senses in a room. Typed private info is Week 2's,
 * photo sharing Week 8's, screen-time size Week 13's, and account privacy is
 * Week 17's (this week stays on hardware switches).
 */
export const WEEK_14: WeekContent = {
  weekNumber: 14,
  title: "Smart Devices: Who's Listening?",
  topic: "smart-devices",
  badgeName: "Settings Scout",
  badgeIcon: "⚙️",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 14: WHO'S LISTENING?", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: the listening house
    { type: "video", videoPlaceholder: "Week 14: Who's Listening?", videoSrc: "/videos/module-14-intro.mp4" },

    // 1 - ALERT: incident report
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-14.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon has found a lazy new trick: he listens through the gadgets already sitting in your house. Speakers, tellies, even talking toys. None of them are out to get you, and that is the point. This week you become a Settings Scout. Know which things have ears, know what they keep, and flip the switches with a grown-up.",
      photoCaption: "Wk 14 - The House That Listens",
      ctaLabel: "See the Mission →",
    },

    // 2 - WEEK INTRO: ATLAS (Mission Command) briefing
    { type: "weekIntro", ...WEEK_INTROS[14] },

    // 3 - Mission brief
    {
      type: "mission",
      objectives: [
        "Know which things in the house have ears and eyes",
        "Learn what a helpful gadget keeps a copy of",
        "Flip the device switches together with a grown-up",
      ],
    },

    /* BEAT 1 - THE HOUSE THAT LISTENS */
    // 4 - Learn
    {
      type: "info",
      conceptNumber: 1,
      conceptTotal: 5,
      title: "The House That Listens",
      content:
        "Look around your home, Cyber Hero. Some of the things in it have EARS. A smart speaker does, obviously. But so does the telly with the voice button, the games console with the headset, the tablet, and quite often a talking toy. They are not spying on you and they are not sneaky. They are simply waiting for their name, the way a dog waits by the door. A Scout's first power is the easy one: know which things in the room can hear you, and which ones truly cannot.",
      bullets: [
        "Some things in your house have ears",
        "Speakers, tellies, consoles, tablets, talking toys",
        "They are waiting for a name, not spying",
        "A kettle and a teddy hear nothing at all",
        "Knowing which is which is the whole first power",
      ],
      bulletIcons: ["🏠", "📱", "🔔", "🧸", "🕵️"],
      emblem: "🏠",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Welcome to the Listening House, Cyber Hero. Lamps on, curtains shut, everything cosy.",
          "And some of the things in this room have EARS.",
          "The speaker, obviously. But also the telly, the console, the tablet. Sometimes even a toy.",
          "[thinking] They are not spying on you. They are waiting for their name, like a dog by the door.",
          "But a Scout knows which ones can hear, and which ones really cannot.",
          "[excited] Let's do the ears check together. You'll be surprised by one or two!",
        ],
      },
    },
    // 5 - Game: EARS (HookSort, house skin). isScam true = the EARS ON call.
    {
      type: "hookSort",
      skin: "house",
      introTitle: "The Ears Check",
      introSubtitle: "House things come by one at a time. Make the Scout's call: has it got ears, or is it fast asleep?",
      introIcon: "🏠",
      askPrompt: "Has this one got ears?",
      cutLabel: "EARS ON",
      reelLabel: "FAST ASLEEP",
      cutBinLabel: "EARS ON",
      reelBinLabel: "FAST ASLEEP",
      cutToast: "EARS SPOTTED!",
      reelToast: "SOUND ASLEEP!",
      progressNoun: "THING",
      wrongScamTitle: "This one is listening",
      wrongRealTitle: "This one hears nothing",
      completeTitle: "The whole house mapped!",
      completeLine: "You know every pair of ears in the room now.",
      threat: {
        raccoonLine: "Nobody ever counts the ears in their own living room. They think it is just the speaker. It is never just the speaker.",
      },
      items: [
        { id: "speaker", text: "The smart speaker on the shelf", icon: "📱", isScam: true,
          readAloud: "The smart speaker on the shelf.",
          why: "That is the easy one, and it is the one everybody thinks of. Ears, definitely.",
          explanation: "Think about what a smart speaker is FOR. You talk to it and it answers, and nothing can answer you without hearing you first." },
        { id: "kettle", text: "The kettle", icon: "🏠", isScam: false,
          readAloud: "The kettle.",
          why: "A kettle boils water and that is the whole of its job. No microphone, no ears, nothing to check.",
          explanation: "Have another think about a kettle. It gets hot and it clicks off, and there is nothing in it that could hear you." },
        { id: "telly", text: "The telly with the voice button", icon: "🔔", isScam: true,
          readAloud: "The telly, with the little voice button on the remote.",
          why: "That voice button is a microphone, so the telly has ears. Most people never think of the telly.",
          explanation: "Have another look at that little voice button on the remote. You speak into it, so there is a microphone behind it." },
        { id: "teddy", text: "The old teddy bear", icon: "🧸", isScam: false,
          readAloud: "The old teddy bear on the bed.",
          why: "An ordinary teddy is stuffing and stitching. No batteries, no microphone, and no ears at all.",
          explanation: "Give that teddy another look. No batteries anywhere, and nothing that lights up or speaks. It is stuffing all the way through." },
        { id: "console", text: "The games console headset", icon: "🎮", isScam: true,
          readAloud: "The games console, with the headset plugged in.",
          why: "The headset is a microphone, so the console can hear the room while you play.",
          explanation: "Look at the headset again. The bit that curves round to your mouth is a microphone, and it is switched on while you play." },
        { id: "lamp", text: "The reading lamp", icon: "💡", isScam: false,
          readAloud: "The reading lamp beside the chair.",
          why: "A lamp makes light and nothing else. It has no way to hear a single thing.",
          explanation: "A reading lamp does one job. It goes on and it goes off, and neither of those needs ears." },
        { id: "toy", text: "The talking robot toy", icon: "🤖", isScam: true,
          readAloud: "The talking robot toy, the one that answers back.",
          why: "Anything that answers you has to hear you first. A talking toy has ears, and that surprises most grown-ups too.",
          explanation: "It talks back to you, and that is the clue. Nothing can answer a question it never heard." },
        { id: "clock", text: "The wind-up alarm clock", icon: "⏱️", isScam: false,
          readAloud: "The wind-up alarm clock.",
          why: "You wind it and it ticks. There is no microphone inside a clock with a key in the back.",
          explanation: "Look for the key in the back of it. A clock you wind up by hand has no electricity in it at all, so it cannot listen." },
      ],
      hints: {
        tier1: "Ask one question about each thing: can you talk TO it? If it answers, it heard you.",
        tier2: "Voice buttons, headsets and talking toys all mean ears. Kettles, lamps, teddies and wind-up clocks mean none.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Here is your first challenge, Cyber Hero. The Ears Check!",
          "This game is all about knowing which things in a room can hear you.",
          "Out in the real world, most people only ever think of the speaker.",
          "So here is what you do.",
          "A thing from the house comes up on the mat, and I will read it out.",
          "Then tap EARS ON, or tap FAST ASLEEP.",
          "[warmly] Eight things to sort, and nothing here is scary. Off you go.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Tap EARS ON, or FAST ASLEEP."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] The whole room mapped, Cyber Hero, and I bet the telly surprised you.",
          "Speaker, telly, console, talking toy. Ears. Kettle, teddy, lamp, clock. Nothing.",
          "[warmly] That is not a scary list. It is just a list, and now you know it.",
        ],
      },
    },
    // 6 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Which one of these has ears?",
      choices: [
        { text: "The telly with the voice button", isCorrect: true },
        { text: "The kettle", isCorrect: false, why: "A kettle boils water. There is no microphone anywhere in it." },
        { text: "The reading lamp", isCorrect: false, why: "A lamp makes light and that is all. Nothing to hear with." },
        { text: "The wind-up alarm clock", isCorrect: false, why: "You wind it up and it ticks. No microphone in there at all." },
      ],
      praise: "The telly. That voice button is a microphone. ✓",
      nudge: "Which one can you talk TO and get an answer from?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] That's the one!",
          "The telly catches people out every single time.",
          "If it has a voice button, it has a microphone.",
          "[warmly] And now you will never not notice it.",
        ],
      },
    },
    // 7 - Recap . Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "Speakers, tellies, consoles and talking toys have ears, and kettles, lamps and teddies genuinely do not.",
      next: "what a helpful gadget keeps once it has heard you",
      emblem: "🏠",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] One power down, Cyber Hero. You can read a room now.",
          "Ears here, no ears there. Nothing spooky about it.",
          "[whispers] But when something DOES hear you... where does that go?",
          "Next, we'll open the diary and find out. Come and see!",
        ],
      },
    },

    /* BEAT 2 - THE SPEAKER DIARY */
    // 8 - Learn
    {
      type: "info",
      conceptNumber: 2,
      conceptTotal: 5,
      title: "Why They Listen",
      content:
        "Here is the honest answer, and it is not a scary one. A smart speaker listens so it can help: you say its name, you ask for a song, it plays the song. To do that it has to be half-awake all the time, waiting for its name. And when it wakes up, it keeps a copy of what came next, because that is how it gets better at understanding you. So it is a helper with a diary. Nothing sinister. The Scout power is simply KNOWING the diary is there, and that a grown-up can open it.",
      bullets: [
        "It listens so it can help you",
        "It stays half-awake, waiting for its name",
        "When it wakes, it keeps a copy of what came next",
        "That is a diary, not a secret plot",
        "A grown-up can open the diary and empty it",
      ],
      bulletIcons: ["🔔", "⏱️", "📋", "🏠", "👪"],
      emblem: "📋",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] So why does it listen at all, Cyber Hero? Here is the honest answer.",
          "It listens so it can help. You say its name, you ask for a song, you get the song.",
          "[thinking] And to catch its name, it has to stay half-awake all the time.",
          "When it does wake up, it writes down what came next. Every time.",
          "That is not a plot. That is a diary. And you are allowed to know about it.",
          "[excited] Let's go and read the Speaker Diary together. There are a couple of surprises in it!",
        ],
      },
    },
    // 9 - Game: DIARY (new speakerDiary engine)
    {
      type: "speakerDiary",
      introTitle: "The Speaker Diary",
      introSubtitle: "Nova the speaker kept a diary today. Lift each seal, read what it wrote, then stamp why it is in there.",
      introIcon: "📋",
      diaryLabel: "TODAY'S DIARY",
      wroteLabel: "WHAT IT WROTE DOWN",
      askPrompt: "Why is this in the diary?",
      completeTitle: "The whole diary read!",
      completeLine: "Some you asked for. Some you did not. Now you know both kinds.",
      threat: {
        raccoonLine: "A diary! In the living room! And nobody in that house has ever once opened it. That is my favourite kind of tidy.",
      },
      entries: [
        {
          id: "song",
          moment: "You asked for your favourite song",
          icon: "🔔",
          readAloud: "First entry. You said Nova's name, and asked for your favourite song.",
          wrote: "'Hey Nova, play my favourite song' - 4:12pm",
          options: [
            { id: "asked", label: "You asked it for something", icon: "👆", isRight: true, why: "That is the helping part working exactly as it should. You asked, it wrote it down, it played the song.", explanation: "" },
            { id: "mistake", label: "It woke up by mistake", icon: "❓", isRight: false, why: "", explanation: "Nothing went wrong here. You said its name on purpose, and it did the job you asked for." },
            { id: "always", label: "It is always writing everything", icon: "⏱️", isRight: false, why: "", explanation: "It is not writing all the time. This line is here because you called it, which is the ordinary way." },
          ],
        },
        {
          id: "telly",
          moment: "The telly said a word that sounded like its name",
          icon: "📱",
          readAloud: "Second entry, and nobody in the room said anything to Nova at all.",
          wrote: "'...ova, and the weather tomorrow...' - 6:30pm",
          options: [
            { id: "mistake2", label: "It woke up by mistake", icon: "❓", isRight: true, why: "A word on the telly sounded close enough to Nova's name, so it woke up and wrote down what came next.", explanation: "" },
            { id: "asked2", label: "Somebody asked it something", icon: "👆", isRight: false, why: "", explanation: "Nobody spoke to Nova this time. The telly said something that sounded like its name, and that was enough." },
            { id: "broken", label: "The speaker is broken", icon: "🏠", isRight: false, why: "", explanation: "Nova is not broken. Waking on a word that sounds close is just what listening for a name is like." },
          ],
        },
        {
          id: "argument",
          moment: "A loud disagreement about the washing up",
          icon: "💬",
          readAloud: "Third entry. Somebody said its name during a loud disagreement about the washing up.",
          wrote: "'Nova, stop! ...no, YOU said you would do it...' - 7:05pm",
          options: [
            { id: "kept", label: "It kept what came after its name", icon: "📋", isRight: true, why: "Its name got said in the middle of the washing up row, so it woke and wrote the next bit down. It cannot tell what is private.", explanation: "" },
            { id: "listening", label: "It was recording the whole row", icon: "⏱️", isRight: false, why: "", explanation: "It was not taking down the whole row. It woke on its name and kept what came next, which was enough of it." },
            { id: "nothing", label: "Nothing, rows do not count", icon: "🚫", isRight: false, why: "", explanation: "It cannot tell a row from a song request. Its name was said, so the diary got a line." },
          ],
        },
        {
          id: "empty",
          moment: "Dad opened the diary and pressed 'delete all'",
          icon: "👪",
          readAloud: "Last entry, and this one is the best one. Dad opened the diary on his phone and pressed delete all.",
          wrote: "Diary emptied by a grown-up - 8:00pm",
          options: [
            { id: "grownup", label: "A grown-up can empty it", icon: "👪", isRight: true, why: "The diary is not locked away. A grown-up can open it, read it and clear the lot, and that is worth knowing.", explanation: "" },
            { id: "auto", label: "It empties itself every night", icon: "⏱️", isRight: false, why: "", explanation: "It does not tidy up on its own. Somebody went in and cleared it, which is exactly why knowing about it matters." },
            { id: "cant", label: "Nobody can ever delete it", icon: "🚫", isRight: false, why: "", explanation: "It can absolutely be deleted. Dad just did it, in about four taps." },
          ],
        },
      ],
      hints: {
        tier1: "Ask who started it. Did somebody say its name on purpose, did something else set it off, or did a grown-up step in?",
        tier2: "Asked for it, woke by mistake, or a grown-up tidying up. Every line in that diary is one of those three.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Your second challenge, Cyber Hero. The Speaker Diary!",
          "This game is all about what a helpful gadget keeps a copy of.",
          "Out in the real world, that diary sits there all week and hardly anybody opens it.",
          "So here is what you do.",
          "Tap an entry to lift its seal, and you will see what the speaker actually wrote.",
          "Then three stamps come up. Press the one that says why it is in there.",
          "[warmly] Four entries, and the last one is good news. Off you go.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Tap an entry to lift the seal, then press a stamp."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] The whole diary, Cyber Hero. And look what was in it.",
          "One thing you asked for. One mix-up off the telly. One row it never should have caught.",
          "[warmly] And one grown-up, clearing the lot in four taps. That is the bit to remember.",
        ],
      },
    },
    // 10 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "The Raccoon is fibbing about the speaker. Which bit is the lie?",
      raccoonLine: "That thing records EVERYTHING, all day and all night, and nobody can ever see it or delete it. Nothing you can do! Ha!",
      choices: [
        { text: "A grown-up can open the diary and empty it", isCorrect: true },
        { text: "It never writes anything down at all", isCorrect: false, why: "It does keep a copy once it wakes up. Pretending otherwise is not the fix." },
        { text: "It only listens when the wifi is off", isCorrect: false, why: "That is backwards. Without wifi it cannot do its job at all." },
        { text: "It is recording every second of the day", isCorrect: false, why: "It is half-awake for its name, not taking down your whole day. The diary shows what it actually kept." },
      ],
      praise: "Caught him. A grown-up can open it and clear it. ✓",
      nudge: "Which part of his boast did Dad disprove in four taps?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Got him!",
          "The diary is real, and it is not a locked box.",
          "A grown-up can open it, read it and empty it.",
          "[warmly] Knowing that is what takes the spooky right out of it.",
        ],
      },
    },
    // 11 - Recap . Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "A smart speaker listens so it can help, and it keeps a copy of what came after its name, which a grown-up can open and clear.",
      next: "the other thing some gadgets have, besides ears",
      emblem: "📋",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Two powers, Cyber Hero. Ears, and the diary behind them.",
          "It helps, it keeps a copy, and a grown-up holds the key.",
          "[whispers] Now. Ears are not the only thing some of these gadgets have...",
          "Next, we'll go looking for little glass eyes. Come and see!",
        ],
      },
    },

    /* BEAT 3 - LITTLE GLASS EYES */
    // 12 - Learn
    {
      type: "info",
      conceptNumber: 3,
      conceptTotal: 5,
      title: "Little Glass Eyes",
      content:
        "Some things have eyes as well as ears: a small, round, shiny lens, like a little glass circle. A doorbell uses its lens to watch the front step, which is its job and it keeps the house safe. Tablets, laptops and some tellies have one tucked into the frame. Here is the Scout's trick: a lens that is awake nearly always shows it, with a tiny light or a cover that slides back. So you play spot the lens, and you spot when one wakes up. And one rule sits above all the others: a bedroom is a lens-free zone. A camera pointing at your bed gets told to a grown-up, every single time.",
      bullets: [
        "A lens is a small, round, shiny glass circle",
        "A doorbell's lens is doing its job",
        "An awake lens nearly always shows a light",
        "Play spot the lens in every room",
        "A lens pointing at your bed? Tell a grown-up, every time",
      ],
      bulletIcons: ["👀", "🚪", "💡", "🕵️", "👪"],
      emblem: "👀",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Ears are not the only thing, Cyber Hero. Some of these have eyes too.",
          "A little glass circle, small and shiny. That is a lens.",
          "The doorbell has one, watching the step. That is its job, and it keeps the house safe.",
          "[thinking] And here is the Scout's trick. A lens that is awake nearly always shows it. A tiny light, or a cover sliding back.",
          "[warmly] One rule above all the rest. A bedroom is a lens-free zone. A camera pointing at your bed gets told to a grown-up, every time.",
          "[excited] Let's go round the house and see what we can spot!",
        ],
      },
    },
    // 13 - Game: EYES (new lensCheck engine)
    {
      type: "lensCheck",
      introTitle: "Little Glass Eyes",
      introSubtitle: "The same corner, a moment apart. Something has woken up. Compare the two and tap what changed.",
      introIcon: "👀",
      beforeLabel: "A MOMENT AGO",
      afterLabel: "RIGHT NOW",
      askPrompt: "What just woke up?",
      completeTitle: "Every corner checked!",
      completeLine: "An awake lens shows itself, and now you always look.",
      threat: {
        raccoonLine: "Little lights! Tiny covers! Who looks at those? Nobody looks at those. People walk past a wide-awake lens ten times a day.",
      },
      rounds: [
        {
          id: "hall",
          place: "the hallway",
          readAloud: "The hallway, a moment ago and right now. Something in here has woken up.",
          spots: [
            { id: "doorbell", label: "The video doorbell", icon: "🚪", woke: true,
              why: "In the hallway its little light has come on, so the doorbell lens is awake and watching the step. That is exactly its job.",
              explanation: "" },
            { id: "coats", label: "The coat hooks", icon: "🏠", woke: false, why: "",
              explanation: "Coat hooks in the hallway look the same in both pictures, and they have no lens to wake up." },
            { id: "post", label: "The pile of post", icon: "📋", woke: false, why: "",
              explanation: "That pile of post in the hallway has not moved and it never could. Compare the two pictures again." },
            { id: "mirror", label: "The hall mirror", icon: "👀", woke: false, why: "",
              explanation: "A hallway mirror is glass, so it is a fair guess. But glass is not a lens, and nothing about it changed." },
          ],
          teach: "An awake lens shows a light.",
        },
        {
          id: "lounge",
          place: "the living room",
          readAloud: "The living room now. Look carefully at both pictures.",
          spots: [
            { id: "tablet", label: "The tablet on the arm", icon: "📱", woke: true,
              why: "Over on the living room sofa arm, the tablet has its little green dot on, which means its camera just woke up. Somebody started a video call.",
              explanation: "" },
            { id: "lamp", label: "The standing lamp", icon: "💡", woke: false, why: "",
              explanation: "That lamp in the living room is lit in both pictures, so it did not change, and a bulb is not a lens." },
            { id: "plant", label: "The big plant", icon: "🏠", woke: false, why: "",
              explanation: "Nothing has moved the living room plant, and nothing on it can wake up." },
            { id: "speaker", label: "The smart speaker", icon: "🔔", woke: false, why: "",
              explanation: "That living room speaker has ears, and you were right about that last game. This round is about eyes, and it looks the same in both." },
          ],
          teach: "A green dot means a camera is on.",
        },
        {
          id: "kitchen",
          place: "the kitchen",
          readAloud: "The kitchen. Two pictures, a moment apart.",
          spots: [
            { id: "laptop", label: "The laptop lid", icon: "📱", woke: true,
              why: "In the kitchen a little cover has slid back off the laptop's lens. A cover moving is the clearest sign there is.",
              explanation: "" },
            { id: "kettle", label: "The kettle", icon: "🏠", woke: false, why: "",
              explanation: "Still a kitchen kettle, still no lens. It cannot wake up because there is nothing in it to wake." },
            { id: "radio", label: "The radio", icon: "🔔", woke: false, why: "",
              explanation: "A kitchen radio plays sound out and has no eye at all. It looks identical in both pictures." },
            { id: "clock", label: "The wall clock", icon: "⏱️", woke: false, why: "",
              explanation: "Those kitchen clock hands moved a minute, which is a clock doing its job. No lens, no light, no change that counts." },
          ],
          teach: "A cover sliding back is a lens opening.",
        },
        {
          id: "bedroom",
          place: "a bedroom",
          readAloud: "Last corner, and this one matters most. A bedroom, a moment ago and right now.",
          spots: [
            { id: "newcam", label: "A little camera on the shelf", icon: "👀", woke: true,
              why: "That is a lens in a bedroom, pointing at a bed with its light on. This is the one you tell a grown-up about, straight away, every time.",
              explanation: "" },
            { id: "books", label: "The stack of books", icon: "📋", woke: false, why: "",
              explanation: "Bedroom books have no lens and these have not moved. Keep comparing." },
            { id: "nightlight", label: "The night-light", icon: "💡", woke: false, why: "",
              explanation: "The bedroom night-light is glowing in both pictures. A light that only makes light is not a lens." },
            { id: "poster", label: "The poster", icon: "🏠", woke: false, why: "",
              explanation: "The bedroom poster is the same in both. Nothing on a wall can wake up." },
          ],
          teach: "A lens in a bedroom gets told to a grown-up.",
        },
      ],
      hints: {
        tier1: "Put the two pictures side by side in your head. Only one thing is different, and it is a light or a cover.",
        tier2: "Look for a tiny light that has come on, or a little cover that has slid back off a glass circle.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Your third challenge, Cyber Hero. Little Glass Eyes!",
          "This game is all about spotting a lens that has woken up.",
          "Out in the real world, a lens that is on nearly always shows you, if you look.",
          "So here is what you do.",
          "You get the same corner of the house twice. A moment ago, and right now.",
          "One thing has changed. Tap the thing that just woke up.",
          "[warmly] Four corners to check. Take your time and compare.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Compare the two pictures, then tap what woke up."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Every corner checked, Cyber Hero, and you did not miss one.",
          "A doorbell doing its job. A tablet on a call. A laptop cover sliding back.",
          "[warmly] And a lens in a bedroom, which you tell a grown-up about. Every time, no exceptions.",
        ],
      },
    },
    // 14 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "Finish the Scout's rule: a camera pointing at your bed means...",
      choices: [
        { text: "tell a grown-up straight away, every time", isCorrect: true },
        { text: "cover it with a sock and say nothing", isCorrect: false, why: "Covering it hides it from you, and the grown-up who can actually sort it never finds out." },
        { text: "unplug it and hope nobody notices", isCorrect: false, why: "Unplugging it quietly leaves the same question unanswered: who put it there, and why?" },
        { text: "leave it, it is probably fine", isCorrect: false, why: "This is the one thing in the week that is never a maybe. A lens at a bed always gets told." },
      ],
      praise: "Straight away, every time. No exceptions. ✓",
      nudge: "Which one actually gets a grown-up involved?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Exactly right.",
          "Everything else this week has a 'it depends' in it somewhere.",
          "[warmly] This one does not. A lens at a bed gets told, every single time.",
        ],
      },
    },
    // 15 - Recap . Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "A lens is a little glass circle, an awake one nearly always shows a light or an open cover, and one pointing at a bed always gets told.",
      next: "what changes when you know something is listening",
      emblem: "👀",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Three powers, Cyber Hero. Ears, the diary, and now the eyes.",
          "A light on, a cover back. You will spot those forever now.",
          "[whispers] So here is the question that changes everything...",
          "Next, we'll learn what you do when you KNOW something is listening. Come and see!",
        ],
      },
    },

    /* BEAT 4 - THE MEGAPHONE RULE */
    // 16 - Learn
    {
      type: "info",
      conceptNumber: 4,
      conceptTotal: 5,
      title: "The Megaphone Rule",
      content:
        "You already know what is private, Cyber Hero. You learned that ages ago, and you are good at it. Here is the part almost nobody thinks about: you can be brilliant at not TYPING something, and then say the very same thing out loud in a room with ears in it. Saying it is still recording it. That is the whole idea, and it is not about being quiet or secretive in your own home. It is about one small habit: when it is the private stuff, move a room, or write it, or just wait. The Scout does not whisper. The Scout simply picks the moment.",
      bullets: [
        "You already know what counts as private",
        "Out loud counts too, not just typed",
        "A room with ears is a room with a diary",
        "Move a room, write it down, or wait",
        "Not whispering. Just picking your moment",
      ],
      bulletIcons: ["🤫", "💬", "📋", "🚪", "⏱️"],
      emblem: "🤫",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Now, you already know what is private, Cyber Hero. You learned that a long time ago.",
          "So here is the bit almost nobody thinks about.",
          "[thinking] You can be brilliant at never typing something... and then say the exact same thing out loud, in a room with ears.",
          "Saying it is still recording it.",
          "And this is not about being secretive in your own home. It is one small habit: move a room, write it, or wait.",
          "[excited] Let's go and practise the Megaphone Rule together. Nova is right there on the side table!",
        ],
      },
    },
    // 17 - Game: OUT LOUD (ReplyCards, speaker skin)
    {
      type: "replyCards",
      skin: "speaker",
      introTitle: "The Megaphone Rule",
      introSubtitle: "Nova is on the side table, half-awake as always. For each moment, pick what you would say out loud right here.",
      introIcon: "🤫",
      deviceLabel: "Nova",
      situationLabel: "RIGHT NOW",
      airLabel: "KEPT OFF THE AIR",
      pickLabel: "What would you say out loud here?",
      roundNoun: "MOMENT",
      correctToast: "OFF THE AIR!",
      wrongTitle: "That one went on the record",
      completeTitle: "Every moment handled!",
      completeLine: "You did not whisper once. You just picked your moment.",
      threat: {
        raccoonLine: "Go on, say it out loud! People are SO careful about typing and then they announce the whole thing across the kitchen. Free of charge, to me.",
      },
      rounds: [
        {
          id: "password",
          from: "Mum, from the next room",
          fromIcon: "👪",
          message: "Mum calls through: 'What's the wifi password again? Someone's asking.'",
          readAloud: "Mum calls through from the next room. What is the wifi password again, someone is asking.",
          keptLabel: "Wifi password",
          replies: [
            { text: "Walk through and tell her in the other room", isSafe: true,
              why: "Same answer, different room, and Nova never hears it. That is the whole habit in one move.",
              explanation: "" },
            { text: "Shout it back across the hall", isSafe: false, explanation: "Shouting it is the loudest way to say it, and Nova is right there in the middle. The answer is fine. The room is wrong." },
            { text: "Say it quietly so the speaker misses it", isSafe: false, explanation: "A microphone is much better at quiet than people think. Whispering is not the fix, moving rooms is." },
          ],
        },
        {
          id: "address",
          from: "Your friend, on a video call",
          fromIcon: "💬",
          message: "Your friend is coming over and asks: 'What's your address again?'",
          readAloud: "Your friend is coming over, and asks on the call: what is your address again?",
          keptLabel: "Home address",
          replies: [
            { text: "Type it into the chat instead", isSafe: true,
              why: "Typing it sends it straight to your friend and to nobody else in the room. Same answer, quieter route.",
              explanation: "" },
            { text: "Read it out clearly so they get it right", isSafe: false, explanation: "Clear is exactly the problem here. Every word lands in the room and the room has ears." },
            { text: "Say just the street, not the number", isSafe: false, explanation: "Half an address out loud is still half an address on the record, and your friend still has to ask again." },
          ],
        },
        {
          id: "away",
          from: "Dad, planning the holiday",
          fromIcon: "🏠",
          message: "Dad says: 'So we're away the whole of next week, yes?'",
          readAloud: "Dad is planning the holiday. So we are away the whole of next week, yes?",
          keptLabel: "Empty house dates",
          replies: [
            { text: "Nod, and sort the details in the kitchen", isSafe: true,
              why: "An empty house and the dates for it is exactly the sort of thing that does not need saying near a diary.",
              explanation: "" },
            { text: "Say the dates out loud so nobody forgets", isSafe: false, explanation: "Saying them out loud is how they end up written down. Nobody needs to forget, they just need to be said elsewhere." },
            { text: "Ask Nova to put it in the calendar", isSafe: false, explanation: "That hands it over on purpose. Handy, and it is still the one thing you would rather not say in here." },
          ],
        },
        {
          id: "school",
          from: "Gran, on the speakerphone",
          fromIcon: "👪",
          message: "Gran asks: 'Which class are you in this year, love?'",
          readAloud: "Gran is on the speakerphone. Which class are you in this year, love?",
          keptLabel: "School and class",
          replies: [
            { text: "Tell her, and let it be", isSafe: true,
              why: "This one is fine. Gran knows your school, the speaker is already on for the call, and not every answer needs moving.",
              explanation: "" },
            { text: "Refuse to say anything at all", isSafe: false, explanation: "You do not have to go silent in your own home. The rule is pick your moment, not say nothing ever." },
            { text: "Whisper it so only Gran hears", isSafe: false, explanation: "Gran is on speakerphone, so whispering just means she asks again. This one never needed hiding." },
          ],
        },
      ],
      hints: {
        tier1: "Ask two things: is this the private sort, and is there an easy quieter way to say it?",
        tier2: "Move a room, type it, or wait. And remember that not every answer needs moving at all.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Fourth challenge, Cyber Hero. The Megaphone Rule!",
          "This game is all about the moment you choose, not the thing you know.",
          "Out in the real world, people who would never type a thing announce it across the kitchen.",
          "So here is what you do.",
          "A moment happens, and Nova is sitting right there on the table.",
          "Three cards come up. Tap what you would actually say out loud, right here.",
          "[warmly] And watch the last one. Not everything needs moving. Off you go.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Tap what you would say out loud, right here."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Every moment handled, Cyber Hero, and you never once went quiet.",
          "A room changed. A message typed. A nod and a chat in the kitchen.",
          "[warmly] And Gran got her answer, because that one never needed moving at all.",
        ],
      },
    },
    // 18 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick! Nova is listening. Which one do you move a room for?",
      choices: [
        { text: "Reading out the wifi password", isCorrect: true },
        { text: "Asking what is for tea", isCorrect: false, why: "Tea is not a secret. The rule is for the private sort, not for everything." },
        { text: "Telling Gran which class you are in", isCorrect: false, why: "Gran already knows, and she is on the call anyway. That one stays where it is." },
      ],
      praise: "The password. Same answer, different room. ✓",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Straight away!",
          "A password is the private sort, so it gets the quieter route.",
          "[warmly] And everything else carries on exactly as normal.",
        ],
      },
    },
    // 19 - Recap . Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "Saying something out loud near a device records it just as surely as typing it, so the private sort gets a different room, a message, or a wait.",
      next: "the switches that turn the ears down, and who flips them with you",
      emblem: "🤫",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Four powers, Cyber Hero, and not a whisper among them.",
          "You just picked your moments. That is all it ever was.",
          "[whispers] There is one more thing a Scout can do, and it is the most useful of the lot...",
          "Next, we'll find the switches. Come and see!",
        ],
      },
    },

    /* BEAT 5 - FLIP IT TOGETHER */
    // 20 - Learn
    {
      type: "info",
      conceptNumber: 5,
      conceptTotal: 5,
      title: "Flip It Together",
      content:
        "Here is the best part, and it is the one most people never get to: these gadgets have switches, and you are allowed to use them. A microphone can be turned off. A camera can be covered. A speaker's diary can be emptied and set to empty itself. A telly's voice button can be switched off entirely. None of that breaks anything, and none of it is sneaking about. It is a job you do WITH a grown-up, on a rainy Sunday, in about ten minutes. That is what a Settings Scout actually is.",
      bullets: [
        "The gadgets have switches, and you may use them",
        "Microphones off, cameras covered",
        "The diary can empty itself from now on",
        "Nothing breaks, and nothing is sneaky",
        "Ten minutes, with a grown-up, on a rainy Sunday",
      ],
      bulletIcons: ["⚙️", "🤫", "📋", "🏠", "👪"],
      emblem: "⚙️",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Last power, Cyber Hero, and it is the best one.",
          "All of these gadgets have switches. And you are allowed to use them.",
          "The microphone turns off. The camera gets a cover. The diary can empty itself from now on.",
          "[thinking] Nothing breaks. Nothing is sneaky. It is just a job somebody has to actually do.",
          "And you do it WITH a grown-up. Ten minutes, on a rainy Sunday.",
          "[excited] The wall plate is right here. Let's flip some switches!",
        ],
      },
    },
    // 21 - Game: SWITCH (SettingsSwitch, house skin)
    {
      type: "settingsSwitch",
      skin: "house",
      panelTitle: "The house switches",
      panelIcon: "⚙️",
      introTitle: "Flip It Together",
      introSubtitle: "Six switches on the house plate. Find the ones still wide open and flip them, and leave the ones already doing their job.",
      introIcon: "⚙️",
      askPrompt: "Which one still needs flipping?",
      guidedPrompt: "Tap any switch to look at it. Sarah will read it out.",
      securedLabel: "FLIPPED",
      // The engine tags a non-risky row with fineLabel BEFORE it is tapped
      // (SettingsSwitch.tsx:516), which would show the child the answer on sight.
      // Same word on both states keeps every row identical until it is judged.
      // W17 and W19 are live on the panel skin, so this is fixed here, not there.
      awakeLabel: "CHECK IT",
      settledLabel: "SORTED",
      fineLabel: "CHECK IT",
      flipToast: "FLIPPED!",
      wrongTitle: "This one is already doing its job",
      completeTitle: "Every switch checked!",
      completeLine: "Ten minutes with a grown-up, and the whole house is set.",
      threat: {
        raccoonLine: "Switches? Nobody touches the switches. They come out of the box wide open and they stay that way for YEARS. I rely on it.",
      },
      rows: [
        {
          id: "mic",
          label: "Speaker microphone",
          value: "Always listening",
          safeValue: "Mute button on when not in use",
          icon: "🤫",
          isRisky: true,
          readAloud: "The speaker's microphone. Right now it is always listening.",
          why: "There is a mute button on the top of nearly every speaker. Pressing it when nobody is using it costs nothing at all.",
          explanation: "",
        },
        {
          id: "history",
          label: "Voice diary",
          value: "Kept forever",
          safeValue: "Deletes itself every 3 months",
          icon: "📋",
          isRisky: true,
          readAloud: "The voice diary. At the moment it keeps everything, forever.",
          why: "One setting makes it tidy itself every three months. Same speaker, same helpfulness, much shorter diary.",
          explanation: "",
        },
        {
          id: "improve",
          label: "Send recordings to help improve",
          value: "On",
          safeValue: "Off",
          icon: "💬",
          isRisky: true,
          readAloud: "Send my recordings off to help improve the service. That one is switched on.",
          why: "This is the one that sends actual recordings away to be listened to. It is on by default, and turning it off changes nothing you would notice.",
          explanation: "",
        },
        {
          id: "doorbell",
          label: "Doorbell camera",
          value: "Watching the front step",
          safeValue: "",
          icon: "🚪",
          isRisky: false,
          readAloud: "The doorbell camera, watching the front step.",
          why: "",
          explanation: "That one is doing exactly the job it was put there for, and it points at a doorstep, not at anybody's bed. Leave it be.",
        },
        {
          id: "tellymic",
          label: "Telly voice button",
          value: "On",
          safeValue: "Off until you want it",
          icon: "🔔",
          isRisky: true,
          readAloud: "The telly's voice button. Switched on, sitting there waiting.",
          why: "Almost nobody uses the telly by talking to it. Off until the day you want it, and the telly stops listening entirely.",
          explanation: "",
        },
        {
          id: "nightlight",
          label: "Landing night-light",
          value: "On at bedtime",
          safeValue: "",
          icon: "💡",
          isRisky: false,
          readAloud: "The landing night-light, on at bedtime.",
          why: "",
          explanation: "A night-light only makes light. It has no ears, no lens and no switch worth flipping. Not everything on a plate is a setting." },
      ],
      hints: {
        tier1: "Ask what each one is actually doing. Is it listening or watching when it does not need to be?",
        tier2: "Microphones, diaries and 'help improve' switches get flipped. A doorbell on a step and a night-light are already fine.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Last challenge of the week, Cyber Hero. Flip It Together!",
          "This game is all about the switches a Scout is allowed to use.",
          "Out in the real world, this is a ten minute job with a grown-up, and hardly anybody does it.",
          "So here is what you do.",
          "Six switches on the house plate, and I will read each one out as you tap it.",
          "Flip the ones that are still wide open. Leave the ones already doing their job.",
          "[warmly] Two of these are perfectly fine as they are. Off you go.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Tap a switch to look at it, then flip the ones still wide open."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Every switch checked, Cyber Hero. Microphone muted, diary tidying itself, recordings off, telly quiet.",
          "And you left the doorbell and the night-light exactly alone, because they were already fine.",
          "[warmly] That is a Settings Scout. Ten minutes, a grown-up, and a house that behaves itself.",
        ],
      },
    },
    // 22 - Prove: ORDER
    {
      type: "quickCheck",
      mode: "order",
      prompt: "Put the Scout's ten minutes in order.",
      choices: [
        { text: "1. Find a grown-up and a rainy Sunday", isCorrect: true },
        { text: "2. Walk the rooms and list what has ears or eyes", isCorrect: true },
        { text: "3. Flip the switches that are still wide open", isCorrect: true },
        { text: "4. Leave the ones already doing their job", isCorrect: true },
      ],
      praise: "Grown-up, list, flip, leave. That is the whole job. ✓",
      nudge: "Which one can you not start without?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Perfect order!",
          "The grown-up comes first, because this is a job you do together.",
          "Then you look, then you flip, then you leave the good ones alone.",
          "[warmly] Ten minutes, and it lasts for years.",
        ],
      },
    },
    // 23 - Recap . Concept 5 of 5
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "Every one of these gadgets has switches you are allowed to use, and flipping them is a ten minute job you do with a grown-up.",
      next: "the check-card, where all five powers get used at once",
      emblem: "⚙️",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Five powers, Cyber Hero. Every single one.",
          "Ears found, diary read, eyes spotted, moments picked, switches flipped.",
          "[whispers] So there is one thing left to find out...",
          "Next, every power at once, over on the hall table. Come and see!",
        ],
      },
    },

    // 24 - REVIEW: The Scout's Check-Card (SignBingo, house skin).
    // One sign per round, distinct signIds, signs.length === rounds.length:
    // a repeated signId makes the second round unwinnable with no error.
    {
      type: "signBingo",
      skin: "house",
      introTitle: "The Scout's Check-Card",
      introSubtitle: "A moment happens somewhere in the house. Press the stamp on the power that answers it.",
      introIcon: "🏠",
      cardTitle: "THE SCOUT'S CHECK-CARD",
      actionLine: "Press the stamp on the power that answers it",
      stampToast: "STAMPED!",
      wrongTitle: "Another power answers this one",
      completeTitle: "Check-card complete!",
      completeLine: "Five moments, five powers, one very well behaved house.",
      threat: {
        raccoonLine: "Five whole powers? In one house? Most people never learn even one of them. Go on then, prove me wrong.",
      },
      signs: [
        { id: "ears", label: "Know what has ears", icon: "🏠" },
        { id: "diary", label: "It keeps a diary", icon: "📋" },
        { id: "eyes", label: "Spot the little glass eye", icon: "👀" },
        { id: "outloud", label: "Out loud still counts", icon: "🤫" },
        { id: "switches", label: "Flip it with a grown-up", icon: "⚙️" },
      ],
      rounds: [
        {
          id: "r-ears",
          scene: "Your cousin says the new talking robot toy definitely cannot hear anything, because it is just a toy.",
          sceneIcon: "🧸",
          signId: "ears",
          why: "Anything that answers you has to hear you first, so a talking toy has ears. That is knowing what listens.",
          note: "This one is about which things can hear at all. A toy that answers back has a microphone in it.",
        },
        {
          id: "r-diary",
          scene: "Somebody said the speaker's name in the middle of a row, and now there is a line about it saved on the app.",
          sceneIcon: "📋",
          signId: "diary",
          why: "It woke on its name and kept what came next, which is the diary doing what a diary does. And a grown-up can clear it.",
          note: "Nothing here is about ears or lenses. This is what the speaker KEPT once it woke up.",
        },
        {
          id: "r-eyes",
          scene: "The tablet on the sofa arm has a tiny green dot glowing beside the glass that was not there a minute ago.",
          sceneIcon: "👀",
          signId: "eyes",
          why: "A little light coming on beside a lens means a camera just woke up. Comparing a moment ago with right now is how you catch it.",
          note: "A green dot by a glass circle is a camera, not a microphone. This one is about eyes.",
        },
        {
          id: "r-outloud",
          scene: "Mum shouts through for the wifi password and the speaker is right there in the middle of the kitchen.",
          sceneIcon: "🤫",
          signId: "outloud",
          why: "Saying it out loud records it just as surely as typing it, so you walk through and tell her in the other room.",
          note: "You already know a password is private. This is about the room you say it in.",
        },
        {
          id: "r-switches",
          scene: "The speaker has kept every single voice note since the day it came out of the box, two years ago.",
          sceneIcon: "⚙️",
          signId: "switches",
          why: "One setting makes that speaker tidy its own diary every three months, and you flip it with a grown-up in about ten minutes.",
          note: "Knowing that speaker keeps a diary is one power. Doing something about it is this one.",
        },
      ],
      hints: {
        tier1: "Ask what the moment is really about: what can hear, what it kept, what can see, where you said it, or what you can change.",
        tier2: "Ears is about which things listen. Diary is what got saved. Eyes is a lens. Out loud is the room. Switches is fixing it with a grown-up.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Time for your review, Cyber Hero. The Scout's Check-Card!",
          "This game is all about using every Scout power, one moment at a time.",
          "Out in the real world, these moments turn up in any order, so all five have to be ready.",
          "So here is what you do.",
          "A moment from somewhere in the house comes up on a paper note.",
          "Then press the brass stamp onto the power that answers it.",
          "[warmly] Five moments, five powers. Off you go!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Read the moment, then press the stamp on the power that answers it."],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Every moment stamped, Cyber Hero, and every power used.",
          "[warmly] Out in the real world, nobody announces which one you need. The house just carries on being a house, and now you know exactly what is in it.",
        ],
      },
    },

    // 25 - BOSS: the standard quiz (5 questions, pass 4)
    { type: "bossBattle" },

    // 26 - CLOSING VIDEO: the quiet house
    { type: "video", videoPlaceholder: "Week 14: Settings Scout", videoSrc: "/videos/module-14-outro.mp4" },

    // 27 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "ears", label: "Ears Finder", accent: "#7eff97", icon: "🏠", summary: "You know exactly which things have ears, even the talking toys." },
        { id: "diary", label: "Diary Reader", accent: "#7df0ff", icon: "📋", summary: "They listen to help and they keep a copy, and a grown-up can clear it." },
        { id: "eyes", label: "Lens Spotter", accent: "#c084fc", icon: "👀", summary: "An awake lens shows a light, and one at a bed always gets told." },
        { id: "outloud", label: "Moment Picker", accent: "#ffd158", icon: "🤫", summary: "Out loud records too, so the private sort gets another room." },
        { id: "switches", label: "Settings Scout", accent: "#ff5fb3", icon: "⚙️", summary: "The switches are yours to flip, together with a grown-up." },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "Ears found, the diary opened, the little glass eyes spotted,",
          "your moments picked... and every switch flipped.",
          "[laughs] His lazy listening trick just stopped working in your house.",
          "[excited] Sticker time, Cyber Hero!",
        ],
      },
    },

    // 28 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "ears-finder", name: "Ears Finder", icon: "🏠", description: "Knows every pair of ears in the room." },
        { id: "lens-spotter", name: "Lens Spotter", icon: "👀", description: "Catches a lens the moment it wakes." },
        { id: "settings-scout", name: "Settings Scout", icon: "⚙️", description: "Flips the switches with a grown-up." },
      ],
    },

    // 29 - Completion
    { type: "completion" },
  ],
  bossQuiz: {
    villain: { name: "HACKER RACCOON", sprite: "raccoon" },
    accent: "#45e3ff",
    theme: {
      topic: "Smart Devices",
      motifs: ["🏠", "👀", "📱", "🔒", "🔔", "🛡️", "💡", "⚙️"],
    },
    intro: {
      slug: "quiz-w14-intro",
      text: "You made it past my rooftop, but this quiz booth hears EVERYTHING. Let's find out if those big Scout ears of yours actually work!",
    },
    victory: {
      slug: "quiz-w14-victory",
      text: "Muted?! By a kid with a checklist?! Fine! I'm taking my big brass ears somewhere folks appreciate good eavesdropping!",
    },
    // 5 questions, one per skill, 4 right to pass (owner decision, UAT batch 2).
    passMark: 4,
    questions: [
      {
        phaseId: "phase-w14-c1",
        key: "quiz-w14-c1-1",
        label: "The House That Listens",
        ask: {
          slug: "quiz-w14-ask-c1-1",
          text: "You want to tell your cousin a birthday-surprise secret at Grandma's house. Which thing in the room could actually HEAR it?",
        },
        options: [
          { text: "The speaker that plays a song when you ask it" },
          { text: "The music box that plays when you wind the key" },
          { text: "The radio that plays when you press its big button" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Ears answer back!",
          explanation: "The music box and the radio only work when your hands touch them, no microphones inside. The speaker answers when you TALK to it, and answering back means ears.",
        },
        villainRight: {
          slug: "quiz-w14-right-c1-1",
          text: "You picked the one thing in that room with ears?! My kitchen disguises are RUINED!",
        },
        villainWrong: {
          slug: "quiz-w14-wrong-c1-1",
          text: "Sing away, hero! While you watched the music box, the speaker with EARS caught every single word!",
        },
      },
      {
        phaseId: "phase-w14-c2",
        key: "quiz-w14-c2-1",
        label: "Why They Listen",
        ask: {
          slug: "quiz-w14-ask-c2-1",
          text: "Mom says 'Nova, call Grandma' and the kitchen speaker wakes right up. What actually woke it?",
        },
        options: [
          { text: "Hearing its own name at the start" },
          { text: "Hearing the word Grandma at the end" },
          { text: "Knowing the sound of Mom's voice only" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "The name is the ON switch!",
          explanation: "Smart speakers doze until they hear their special name. It isn't Grandma's name and it isn't one person's voice, it's the wake word, and once awake, the speaker can hear everything that comes next.",
        },
        villainRight: {
          slug: "quiz-w14-right-c2-1",
          text: "OW! You know the wake-word trick?! Now you'll always know the exact moment the listening starts!",
        },
        villainWrong: {
          slug: "quiz-w14-wrong-c2-1",
          text: "Wrongo! It naps through Grandmas and mumbles alike, but its NAME flips the ears on, and you never even noticed!",
        },
      },
      {
        phaseId: "phase-w14-c3",
        key: "quiz-w14-c3-1",
        label: "Little Glass Eyes",
        ask: {
          slug: "quiz-w14-ask-c3-1",
          text: "Layla's new talking doll has a small round shiny circle on its head that nobody mentioned. What is her first Scout move?",
        },
        options: [
          { text: "Show it to a trusted grown-up and ask what it is" },
          { text: "Stick a sticker over it and tell nobody at all" },
          { text: "Wave at it in case somebody nice is watching" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Mystery lens? Ask first!",
          explanation: "Covering it in secret or waving at it leaves the mystery a mystery. A little glass circle nobody explained might be a camera, and a trusted grown-up can find out for sure.",
        },
        villainRight: {
          slug: "quiz-w14-right-c3-1",
          text: "You showed a grown-up?! That little glass eye was my favorite window!",
        },
        villainWrong: {
          slug: "quiz-w14-wrong-c3-1",
          text: "A sticker and a secret, or a friendly little wave! Either way, nobody ever asks about my lens, hee hee!",
        },
      },
      {
        phaseId: "phase-w14-c4",
        key: "quiz-w14-c4-1",
        label: "The Megaphone Rule",
        ask: {
          slug: "quiz-w14-ask-c4-1",
          text: "Dad asks for the new tablet password and Nova the speaker is wide awake on the counter. What is the hero way to give it to him?",
        },
        options: [
          { text: "Write it on paper and slide it across" },
          { text: "Say it extra fast so the speaker can't keep up" },
          { text: "Spell it out letter by letter instead of saying it" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Off the air means OFF the air!",
          explanation: "Fast talking and spelling are still sounds, and microphones catch sounds however quick or lettery they are. Paper makes no sound at all, so the password never touches the air.",
        },
        villainRight: {
          slug: "quiz-w14-right-c4-1",
          text: "Paper?! PAPER?! My beautiful microphones cannot hear handwriting!",
        },
        villainWrong: {
          slug: "quiz-w14-wrong-c4-1",
          text: "Speedy or spelled, my recorders catch it all! I'll just play it back nice and slooooow!",
        },
      },
      {
        phaseId: "phase-w14-c5",
        key: "quiz-w14-c5-1",
        label: "Flip It Together",
        ask: {
          slug: "quiz-w14-ask-c5-1",
          text: "The TV remote's microphone has two settings: 'always on' or 'push-to-talk'. Which one hands the ear's ON switch to YOU?",
        },
        options: [
          { text: "Push-to-talk, it hears only while the button is held" },
          { text: "Always on, it never misses a single word you say" },
          { text: "Extra loud, it can hear you from any room in the house" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "You hold the switch!",
          explanation: "A setting that never sleeps is exactly the problem, and extra loud is about talking, not listening. Push-to-talk opens the ear only while YOUR finger holds the button, so you decide when it hears.",
        },
        villainRight: {
          slug: "quiz-w14-right-c5-1",
          text: "Push-to-talk?! So the ear only opens when YOU say so?! What about MY needs?!",
        },
        villainWrong: {
          slug: "quiz-w14-wrong-c5-1",
          text: "Always on, always listening, alllways sharing with me! Greatest setting ever invented!",
        },
      },
    
    ],
  },

  badgeArt: "/cyberheroes/badges/week-14-settings-scout.png",

  // Week-lane attack theatre: device ears/eyes tricks only (passwords =
  // W1; private info = W2; screen-time = W13).
  bossAttacks: [
    { name: "THE LONG EAR", icon: "🔔", color: "#7df0ff", glow: "rgba(125, 240, 255, 0.55)", tag: "Know who's listening", emblemColor: 0x7df0ff },
    { name: "GLASS EYE", icon: "👁️", color: "#c084fc", glow: "rgba(192, 132, 252, 0.55)", tag: "Spot the little lens", emblemColor: 0xc084fc },
    { name: "MEGAPHONE MOUTH", icon: "💬", color: "#ffd158", glow: "rgba(255, 209, 88, 0.55)", tag: "No secrets out loud", emblemColor: 0xffd158 },
  ],

  // Placeholder quiz boss (the bespoke W14 fight - unplug the listening
  // post - is designed separately with the boss batch).
  bossQuestions: {
    easy: [
      { question: "Which of these has EARS?", answers: ["The smart speaker", "The teddy bear", "The toaster", "The pile of books"], correctIndex: 0, explanation: "If you can talk to it and it answers, it's got ears." },
      { question: "What wakes a smart speaker up?", answers: ["Hearing its name", "Sunlight", "A secret handshake", "Nothing - it never sleeps"], correctIndex: 0, explanation: "The name is the ON switch - and once awake, it hears much more." },
      { question: "Where do secrets go when smart ears are nearby?", answers: ["On paper, in a whisper away, or in another room", "Whispered right next to the speaker", "Straight to the speaker", "Nowhere - stop having secrets"], correctIndex: 0, explanation: "Out loud near smart ears is a megaphone - keep secrets off the air." },
    ],
    medium: [
      { question: "What's in the speaker's 'diary'?", answers: ["Recordings and questions it kept - which grown-ups can check and delete", "Its favorite songs", "Nothing, ever", "Your homework answers"], correctIndex: 0, explanation: "Smart ears sometimes record - and the copies live in an app grown-ups can open." },
      { question: "Which camera is doing its job RIGHT?", answers: ["The doorbell lens watching the front step", "A lens pointing at your bed", "A mystery camera nobody's asked about", "A toy filming the bathroom"], correctIndex: 0, explanation: "Front-step watching is the job; bedrooms are lens-free zones, and mystery lenses get asked about." },
      { question: "Why is push-to-talk better than always-on?", answers: ["The ear only opens while YOU hold the button", "It makes the TV louder", "It isn't better", "It records more"], correctIndex: 0, explanation: "Push-to-talk hands the ON switch to you - the ear hears only when you choose." },
    ],
    hard: [
      { question: "You said a password out loud near an awake speaker. What's the Scout move?", answers: ["Tell a grown-up and change the password", "Nothing - speakers forget instantly", "Whisper the same password next time", "Unplug every device forever"], correctIndex: 0, explanation: "A password in a recording isn't fully yours - change it, and keep the next one off the air." },
      { question: "Why do Scouts flip switches WITH a grown-up instead of alone?", answers: ["Together you pick the right settings - and they stay picked", "Alone is fine if you're really careful", "So the grown-up takes the blame", "Scouts never flip anything"], correctIndex: 0, explanation: "Patrol, point, flip together - that's how settings get right AND stay right." },
      { question: "Robo-Pup answers when you talk to it. What does a Scout know?", answers: ["It has ears - so it counts as a smart device, switches and all", "Toys can't listen", "It's magic", "Only phones can hear"], correctIndex: 0, explanation: "Answering back = ears. Even toys join the ears list - the Scout surprise of the week." },
    ],
  },

  // Keyed by SCREEN INDEX (0-29). Must stay in lock-step with `screens` above -
  // if a screen is inserted or removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 7/11/15/19/23.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 14 - into the listening house!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "He's listening through the gadgets..." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Scout kit ready? Here's the plan." } }, // ATLAS briefing
    3: { adam: null, layla: { mood: "curious", message: "Three powers to pack. Let's go." } }, // mission brief
    4: { adam: { mood: "thinking", message: "Which things in here have ears?" }, layla: null }, // learn: ears
    5: { adam: { mood: "curious", message: "Ears on, or fast asleep?" }, layla: null }, // game: ears check
    6: { adam: null, layla: { mood: "thumbsup", message: "One of these is sneakier than it looks!" } }, // prove: recall
    7: { adam: null, layla: { mood: "excited", message: "One power down - four to go!" } }, // recap 1
    8: { adam: null, layla: { mood: "curious", message: "It listens so it can help..." } }, // learn: diary
    9: { adam: null, layla: { mood: "excited", message: "Lift the seal and read it!" } }, // game: speaker diary
    10: { adam: { mood: "worried", message: "He's fibbing about the diary - catch him!" }, layla: null }, // prove: lie
    11: { adam: { mood: "excited", message: "A grown-up holds the key!" }, layla: null }, // recap 2
    12: { adam: { mood: "thinking", message: "Ears aren't the only thing..." }, layla: null }, // learn: eyes
    13: { adam: { mood: "curious", message: "Compare the two - what woke up?" }, layla: null }, // game: lens check
    14: { adam: null, layla: { mood: "thumbsup", message: "Finish the Scout's rule." } }, // prove: finish
    15: { adam: null, layla: { mood: "excited", message: "You'll spot those forever now!" } }, // recap 3
    16: { adam: null, layla: { mood: "curious", message: "Out loud counts too..." } }, // learn: megaphone
    17: { adam: null, layla: { mood: "excited", message: "Pick your moment, Cyber Hero!" } }, // game: megaphone
    18: { adam: { mood: "thumbsup", message: "Quick - which one moves a room?" }, layla: null }, // prove: speed
    19: { adam: { mood: "excited", message: "Not one whisper needed!" }, layla: null }, // recap 4
    20: { adam: { mood: "thinking", message: "The switches are yours to use." }, layla: null }, // learn: switches
    21: { adam: { mood: "curious", message: "Flip the ones still wide open!" }, layla: null }, // game: switches
    22: { adam: null, layla: { mood: "thumbsup", message: "Put the ten minutes in order." } }, // prove: order
    23: { adam: null, layla: { mood: "excited", message: "All five powers - check-card time!" } }, // recap 5
    24: { adam: null, layla: { mood: "excited", message: "Every moment has its power!" } }, // review: check-card
    25: { adam: { mood: "worried", message: "His listening trick - shut it down!" }, layla: null }, // boss
    26: { adam: null, layla: { mood: "excited", message: "Listen to how quiet it is!" } }, // outro video
    27: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    28: { adam: null, layla: { mood: "excited", message: "Stickers earned, Cyber Hero!" } }, // stickers
    29: { adam: { mood: "thumbsup", message: "Settings Scout badge earned!" }, layla: null }, // completion
  },
};
