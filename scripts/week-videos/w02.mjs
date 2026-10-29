/* WEEK 2 bookend videos - "Private Info: Guard Your Secrets".
 *
 * One file per week. The two generic scripts read it:
 *   scripts/week-video-vo.mjs    --week=2   records every line
 *   scripts/week-video-build.mjs --week=2   paces them and assembles
 *
 * ── WHY THE CUES HAVE NO TIMES ───────────────────────────────────────────
 * Owner, 2026-10-28: "Pace it out. Make it clear when the video is speaking
 * and when 11 Labs is speaking. When you're doing the voiceover, you don't
 * want them to counteract each other, because that's the mistake that was in
 * week one."
 *
 * He is right, and it is in the week 1 data in black and white. Its intro
 * placed Callum at 13.9s (2.85s long, so out at 16.75) and Emma at 14.9s.
 * Those two lines talk over each other for 1.85 seconds, and because the mix
 * uses normalize=0 both play at full volume. Two voices, one ear.
 *
 * That happened because week 1 wrote the start second of every line BY HAND,
 * from the measured length of the one before it. Do that nine more times and
 * you will get it wrong again.
 *
 * So no line here carries a start time. The build script measures each
 * recorded mp3 and lays the lines END TO END with a gap between them, so an
 * overlap is not something to be careful about, it is something that cannot
 * be expressed. Where a line must wait for its picture - the forge line has
 * to land on the forge, not on the den before it - that is said as `notBefore`,
 * which delays a line but can never pull it on top of its neighbour.
 *
 * ── A SECOND WAY THE SAME BUG ARRIVES ────────────────────────────────────
 * The first build of this week passed the overlap guard and was still wrong.
 * The printed timeline said:
 *
 *     intro-3    CALLUM    7.64   11.69   0.40   shot 2
 *
 * No two voices spoke at once, but the Raccoon's line played over the FORGE,
 * a shot he is not in. Non-overlapping is not the same as clear. A line also
 * has to land on the picture of whoever is saying it.
 *
 * Two lines plus a villain line do not fit in 7 seconds, so shot 1 is 10s and
 * shot 2 is 7s, and his line was cut to "All MINE!". The build prints the
 * shot number beside every line for exactly this reason: so the mistake is
 * visible instead of audible.
 *
 * ── THE SHOTS ────────────────────────────────────────────────────────────
 * Four shots, 7s each: two per video, so each bookend is about 15 seconds
 * against week 1's 20 and 18. 7s was chosen by MEASURING the recorded voice
 * rather than guessing: the intro's four lines plus their gaps run 14.9s, so
 * 14s of footage leaves roughly a second of held frame to fade on instead of
 * the 6-second dead hold that 5s shots would have forced. Owner: "they need to be short and sweet... the
 * longer the videos, the more errors there are." Short also means fewer
 * seconds for a model to hallucinate in.
 *
 * Every shot obeys the nine rules proved in week 1 (PR #690): one action per
 * shot, no cuts inside a shot, both ends pinned by a still that was inspected
 * first, characters from our own sprites rather than a description, ZERO text
 * in frame, no lip sync, no fine hand work, every frame looked at before
 * install, and no children in a Veo frame - shots with Adam and Layla go to
 * PixVerse, which took them first time.
 *
 * "No text in frame" is why the Raccoon's wish list is a CHEST of glowing
 * trinkets rather than a written list: a list means lettering, and lettering
 * is where AI video looks worst. The week's own script already calls them
 * treasure - "I collect those like shiny treasure!" - so the chest is the
 * week's own idea, not a workaround.
 */

export const WEEK = 2;
export const TITLE = "Private Info: Guard Your Secrets";

/* Voices. Emma narrates the whole product; Callum is the Hacker Raccoon and
 * is the only other voice allowed in a bookend. Same two as week 1. */
export const EMMA = "oClOrzqamOXmtcB8iqTj";
export const CALLUM = "N2lVS1w4EtoT3dr4eOWO";

export const EMMA_SETTINGS = { stability: 0.6, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true, speed: 0.9 };
export const VILLAIN_SETTINGS = { stability: 0.25, similarity_boost: 0.75, style: 0.6, use_speaker_boost: true, speed: 0.95 };

/** Seconds of footage per shot. */
export const SHOT_SECONDS = 7;

export const VIDEOS = [
  {
    name: "module-02-intro",
    /* 7s + 7s of footage, then the last frame held and faded. The hold is
     * sized by the build script to whatever the closing line needs, which is
     * what stops a line being cut off mid-sentence. */
    shots: [
      {
        file: "intro-shot1",
        /* Raccoon alone: safe for any model, and it is his scene. */
        beat: "The Raccoon gloats over a chest of stolen secrets.",
        /* 10s, not 7: three lines have to land before we cut away from him. */
        seconds: 10,
      },
      {
        file: "intro-shot2",
        beat: "The forge: a mask is being hammered into being.",
        seconds: 7,
      },
    ],
    lines: [
      { file: "intro-1", shot: 1, voice: "EMMA", text: "The Hacker Raccoon collects secrets like shiny treasure." },
      { file: "intro-2", shot: 1, voice: "EMMA", text: "Your name. Your street. Your school." },
      { file: "intro-3", shot: 1, voice: "CALLUM", text: "[laughs] All MINE!" },
      { file: "intro-4", shot: 2, voice: "EMMA", text: "Not a chance, Cyber Hero. This week we forge you a mask." },
    ],
  },
  {
    name: "module-02-outro",
    shots: [
      { file: "outro-shot1", beat: "The Raccoon shakes the chest. Nothing comes out." },
      { file: "outro-shot2", beat: "The heroes hold up the finished mask.", seconds: 7 },
    ],
    lines: [
      { file: "outro-1", shot: 1, voice: "EMMA", text: "He shook that chest all week long." },
      { file: "outro-2", shot: 1, voice: "CALLUM", text: "Empty? It's EMPTY!" },
      { file: "outro-3", shot: 2, voice: "EMMA", text: "[proud] Not one single secret got out." },
      { file: "outro-4", shot: 2, voice: "EMMA", text: "Because you wore the mask, Cyber Hero. Week two, done." },
    ],
  },
];

/* ── The pictures ────────────────────────────────────────────────────────
 * Each shot is pinned by two stills: the frame it starts on and the frame it
 * ends on. The end frame is generated FROM the start frame so the model
 * interpolates between two pictures of the same set, rather than inventing
 * its way out of one.
 *
 * Kept here beside the voice so a week is one file, and so the picture and
 * the words can be read against each other. */
export const FRAMES = [
  {
    file: "intro-shot1-start",
    refs: ["public/game/characters/raccoon-idle.png"],
    prompt:
      "Stylised 3D cartoon still, cinematic, for a children's cybersecurity cartoon. The striped grey raccoon villain from the reference image, wearing his purple circuit-patterned hoodie, crouched in a dark cluttered den lit only by a cold teal glow. In front of him sits a small open wooden treasure chest spilling glowing violet trinkets: a little glowing house charm, a tiny glowing school-building charm, a blank glowing luggage tag. He is reaching into the chest with a greedy grin. Rich violet and teal rim light, deep shadows. ABSOLUTELY NO TEXT, NO LETTERS, NO NUMBERS, NO WRITING anywhere in the image. No human characters. 16:9 cinematic framing, full scene, nothing cropped.",
  },
  {
    file: "intro-shot1-end",
    fromPrevious: true,
    prompt:
      "Keep the set, the lighting, the den and the chest EXACTLY as they are. Change ONLY the raccoon's pose: he has now lifted one glowing violet trinket out of the chest, holding it up beside his head, and is grinning straight at the camera with wide eyes. Same costume, same colours, same framing. ABSOLUTELY NO TEXT, NO LETTERS, NO NUMBERS anywhere.",
  },
  {
    file: "intro-shot2-start",
    refs: [
      "public/game/characters/w02/adam-forgeapron-idle.png",
      "public/game/characters/w02/layla-forgeapron-idle.png",
    ],
    prompt:
      "Stylised 3D cartoon still, cinematic, for a children's cybersecurity cartoon. The two child heroes from the reference images, in their brown leather forge aprons, standing together at a glowing blacksmith's anvil in a warm workshop. Adam holds a large hammer raised above the anvil. On the anvil lies a half-formed glowing violet hero mask, white-hot at the edges. Orange forge fire behind them, violet sparks in the air, warm rim light on both children. Both children fully in frame, facing the anvil, calm and capable. ABSOLUTELY NO TEXT, NO LETTERS, NO NUMBERS, NO WRITING anywhere in the image. 16:9 cinematic framing, full scene, nothing cropped.",
  },
  {
    file: "intro-shot2-end",
    fromPrevious: true,
    prompt:
      "Keep the workshop, the anvil, the lighting and both children EXACTLY as they are. Change ONLY this: the hammer has come down onto the mask and a bright burst of violet sparks is flying upward from the anvil, and the mask on the anvil now glows brighter and more complete. Same costumes, same positions, same framing. ABSOLUTELY NO TEXT, NO LETTERS, NO NUMBERS anywhere.",
  },
  {
    file: "outro-shot1-start",
    refs: ["public/game/characters/raccoon-hurt.png"],
    prompt:
      "Stylised 3D cartoon still, cinematic, for a children's cybersecurity cartoon. The striped grey raccoon villain from the reference image, wearing his purple circuit-patterned hoodie, standing in the same dark cluttered den lit by a cold teal glow. He is holding the small wooden treasure chest upside down above his head with both paws, shaking it hard. Nothing is falling out of it. His expression is furious and baffled, mouth closed. Deep shadows, teal rim light. ABSOLUTELY NO TEXT, NO LETTERS, NO NUMBERS, NO WRITING anywhere in the image. No human characters. 16:9 cinematic framing, full scene, nothing cropped.",
  },
  {
    file: "outro-shot1-end",
    fromPrevious: true,
    prompt:
      "Keep the den, the lighting and the chest EXACTLY as they are. Change ONLY the raccoon's pose: he has dropped his arms, the empty chest now hangs from one paw at his side, his shoulders have slumped and his ears have drooped. Defeated, not sad. Same costume, same colours, same framing. ABSOLUTELY NO TEXT, NO LETTERS, NO NUMBERS anywhere.",
  },
  {
    file: "outro-shot2-start",
    refs: [
      "public/game/characters/w02/adam-forgeapron-celebrate.png",
      "public/game/characters/w02/layla-forgeapron-celebrate.png",
    ],
    prompt:
      "Stylised 3D cartoon still, cinematic, for a children's cybersecurity cartoon. The two child heroes from the reference images, in their brown leather forge aprons, standing side by side in the warm workshop beside the anvil. Between them they are holding up a finished glowing violet hero mask, complete and smooth, held at chest height. Both are smiling proudly. Orange forge fire behind them, violet glow on their faces, warm sparks drifting. Both children fully in frame. ABSOLUTELY NO TEXT, NO LETTERS, NO NUMBERS, NO WRITING anywhere in the image. 16:9 cinematic framing, full scene, nothing cropped.",
  },
  {
    file: "outro-shot2-end",
    fromPrevious: true,
    prompt:
      "Keep the workshop, the lighting and both children EXACTLY as they are. Change ONLY this: both children have raised the glowing violet mask higher above them in celebration, arms up, cheering with big smiles, and a shower of violet sparks bursts upward around the mask. Same costumes, same framing. ABSOLUTELY NO TEXT, NO LETTERS, NO NUMBERS anywhere.",
  },
];
