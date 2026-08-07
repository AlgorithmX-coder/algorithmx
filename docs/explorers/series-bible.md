# Cyber Explorers — Series Bible & Video Production Canon

Ages 10–13. The animated story spine that wraps the 20-mission course.
Status: look + pipeline locked and owner-approved 2026-08-07 (the
"save the day → scouted" proof). This doc is the single source of truth
for characters, style, and the season storyline. Keep it updated.

---

## 1. Premise

When a crew of hackers called **STATIC** starts hunting the kids of one
ordinary town, a secret youth division of cyber-defenders, **ARC**,
recruits the one kid who noticed the trap. He builds a team and learns
to outthink the internet's cleverest tricksters, one case at a time,
before STATIC's hidden mastermind pulls off something no one can undo.

- **Theme:** you don't have to be the strongest, you have to be the one
  who notices. Empowerment, never fear.
- **Tone:** *Spy Kids* meets a heist crew, with the heart of *Big Hero 6*.
- **Rule:** show the story through action; keep spoken lines sparse and
  motivated (owner note: "too direct" = no talking-to-camera exposition).

---

## 2. Visual canon (LOCKED)

- **Register:** premium stylized 3D CG, "Pixar craft but older, not
  childish": Spider-Verse / Big Hero 6 / The Bad Guys.
- **Palette:** dark ops-room base, cyan (#37dbef) + amber (#ffb02e)
  accents, brass for clearance.
- One render style only. Everything must cut together.

### Locked characters (reference art in `characters/`)

**THE EYE** — the hero, a 12-year-old boy. Sharp, observant, a little
outsider. Warm mid-brown skin, short textured dark curly hair, freckles,
quick clever eyes. Everyday cool clothes (pre-recruitment): grey hoodie
under an olive-green bomber, backpack strap, joggers, chunky sneakers,
and his signature **cyan-accented headphones around his neck** (ties to
the "signals" theme). Codename THE EYE. Reference: `characters/the-eye_hero_sheet.png`.
*(Owner picked a boy lead on 2026-08-07; a girl "the Eye" variant also exists if ever needed.)*

**WREN** — the handler, a young-adult woman, early 20s. Wry, cool,
ex-prodigy ARC agent, older-sibling energy. Medium-dark skin, **full
tousled dark hair with a single teal streak** (owner note: full head of
hair, not an undercut), slim tactical earpiece, charcoal-and-cyan ARC
field jacket, fingerless gloves. Voice + presence; has a personal
history with ZERO (the finale fuse). Reference: `characters/wren_portrait.png`, `characters/wren_sheet.png`.

**BIT** — ARC's pocket AI companion the crew carries. Comic relief +
in-world explainer (a natural way to teach a concept). *(Design TBD.)*

**The crew** (assemble across Block 1): **Priya "TRACE"** (OSINT /
people), **Leo "CIPHER"** (crypto / logic), **Jake "BOLT"** (systems /
builds), **Zaid "GHOST"** (privacy / conscience). **Maya** is the hero's
best friend and the first person STATIC targets (his personal stakes).
*(Designs TBD; lock each before its first film, same recipe.)*

### Villains — STATIC

- **PHANTOM HOOK** "the Angler" — phishing (Block 1). LOCKED: `characters/phantom-hook_sheet.png` (hooded rogue, domino mask, coat of glowing green lures, casts a hook-of-light)
- **SIREN** "the Voice" — social engineering (Block 2)
- **PACKRAT** "the Collector" — OSINT / data theft (Block 2)
- **SKELETON KEY** "the Locksmith" — passwords / access (Block 3)
- **MIMIC** "the Faceless" — impersonation / deepfakes (Block 3)
- **GHOSTWRITER** "the Liar" — misinformation (Block 4)
- **ZERO** "the One in the Dark" — mastermind. Ex-ARC, WREN's former
  mentor, went dark to "protect everyone by controlling everything."
  Endgame: **Signal Zero**. Reveal + defeat in the finale.

---

## 3. Production pipeline (LOCKED, AI-first)

Proven end-to-end on 2026-08-07. Reproduce every shot from the locked
reference so characters stay consistent.

1. **Design → lock.** `nano-banana-pro` (OpenArt MCP), text2image for a
   character sheet, 16:9, 2K. Upload the winner as the reusable reference.
2. **Per-shot stills.** `nano-banana-pro` **image2image** with the locked
   character as `visualReferences`, one prompt per shot (composition +
   emotion). 1K is enough for 720p video.
3. **Motion.** `pixverseV6` **image2video**, 720p, subtle motion per shot
   (the still already carries composition + consistency). For a character
   **talking with lip-sync**, use `byte-plus-seedance-2` **element2video**
   with an image element + an audio element (needs metadata via
   `openart_upload_metadata_get`).
4. **Voice.** ElevenLabs `text_to_speech`. **WREN voice id
   `trTZq8BsN25LRj9YD7fR`** (model `eleven_multilingual_v2`, stability
   0.5, similarity 0.75). Lead + crew voices: audition per narrator spec.
5. **Score.** ElevenLabs `compose_music` (music_v2, force_instrumental),
   one evolving cue per film.
6. **Edit.** ffmpeg (ffmpeg-static): per-shot scale 1920x1080 / fps30 /
   trim, concat demuxer, drawtext captions + subtitles (copy the font
   local, use relative paths — a space in the path breaks the filtergraph),
   VO via adelay, music ducked under VO, fades, `+faststart`.

**Consistency rules:** lock every recurring character before its first
film and always drive shots from that reference. One-off background kids
need no lock. Never mix render styles.

---

## 4. The season arc — 8 films (4 blocks × intro + outro)

Each film ~30–45s, story-first, one WREN/story voice moment max. The
arc must build; keep it creative, no repeated beats.

**BLOCK 1 — SIGNALS (phishing / spotting deception)**
- **1A Intro "The Save" (DONE, approved).** He spots a scam spreading at
  school, stops a friend from tapping it, and ARC scouts him. → recruited.
- **1B Outro "The Mark."** Now trained, the crew (forming) shuts down
  PHANTOM HOOK's whole lure network. But on the takedown they find a
  symbol burned into every attack: the STATIC sigil. It was never random.
  WREN goes quiet. Hook to Block 2.

**BLOCK 2 — HUMAN FACTOR (social engineering / data)**
- **2A Intro "Puppet Strings."** It gets personal: SIREN's voice and
  PACKRAT's stolen files turn a friend against the group and nearly con
  Maya's mum. The lesson lands: people are the real target.
- **2B Outro "Someone Who Knows."** They beat SIREN, but a message finds
  the hero on a channel that shouldn't exist. ZERO, first contact. It
  knows his name, and it knows WREN's.

**BLOCK 3 — SYSTEMS (passwords / access / deepfakes)**
- **3A Intro "Break the Locks."** SKELETON KEY and MIMIC hit the school's
  systems: a deepfaked teacher, a locked-out account, chaos. Seeing is no
  longer believing; the crew learns to verify, not trust.
- **3B Outro "The Offer."** They hold the line, but ZERO makes the hero
  an offer aimed straight at his flaw. He almost takes it. He chooses the
  crew. The name of the endgame surfaces: Signal Zero.

**BLOCK 4 — LONG GAME (misinformation / the finale)**
- **4A Intro "The Liar."** GHOSTWRITER floods the school with fake
  screenshots and rumours, fracturing the team from the inside. Truth
  becomes the mission.
- **4B Finale "Signal Zero."** STATIC hits everything at once; the crew
  unites. ZERO is unmasked (WREN's history pays off) and Signal Zero is
  stopped. The hero reaches ULTRA. Season resolves; a quiet hook for S2.

---

## 5. Build status

- [x] Look + characters locked (THE EYE, WREN)
- [x] Pipeline proven (WREN lip-sync test; "The Save" scene)
- [x] Film 1A (Block 1 intro) — `public/explorers/scene-save-the-day.mp4`
- [ ] Films 1B, 2A, 2B, 3A, 3B, 4A, 4B — in production, block by block
- [ ] Lock crew + villain designs before each film that needs them
- [ ] Wire block intro/outro players into the mission flow
