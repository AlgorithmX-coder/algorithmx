/* Write the week data files for weeks 3-10 from one table.
 *
 *   node scripts/week-videos/_generate-week-files.mjs
 *
 * One table, eight files, so the SHAPE cannot drift between weeks: every
 * bookend is the same four beats, and every rule proved in week 2 is applied
 * by the templates below rather than retyped eight times and mistyped once.
 *
 * THE SHAPE, fixed for every week:
 *   intro shot 1  10s  the Raccoon alone, setting up this week's threat
 *   intro shot 2   7s  the heroes in this week's world, taking it on
 *   outro shot 1   7s  the Raccoon alone, foiled
 *   outro shot 2   7s  the heroes in this week's world, winning
 *
 * Shot 1 of the intro is 10 seconds and not 7 for one reason, learned the
 * hard way on week 2: two narrator lines plus the villain's line do not fit
 * in 7 seconds, so his line spilled onto the next shot and he was heard
 * talking over a picture he was not in.
 *
 * THE VILLAIN IS ALWAYS ALONE in his shots. That is not a style choice: on
 * week 1 Veo refused three times the moment Adam and Layla were in frame,
 * and accepted the identical shot with the Raccoon alone. Keeping the cast
 * separated keeps every shot renderable by any model.
 *
 * NO TEXT IN FRAME anywhere, which is why every object below is a glowing
 * SHAPE rather than anything with lettering on it: no written lists, no app
 * names, no brand marks, no scoreboards. Lettering is where AI video looks
 * worst, and a brand mark would be someone else's property.
 *
 * CHILD SAFETY: every scene shows the villain LOSING or a child simply being
 * capable. Never the bad thing happening to a child. Week 5 is the test of
 * that rule and it is why its cruelty is grey shapes shattering on a shield
 * rather than anything aimed at a person.
 */
import { writeFileSync } from "node:fs";

/* Naming the OBJECTS, not just "writing". The week 3 detective wall came back
 * covered in little cards of green pseudo-code: the model does not count a
 * screen full of glyphs as "writing", so it has to be told about screens. */
const NOTEXT =
  "CRITICAL: the picture fills the entire frame edge to edge, with no black bars, no letterboxing and no borders at any edge. No screens, no monitors, no displays, no pinned notes or cards, no diagrams, no icons, no code, no text, no letters, no numbers, no brand marks and no writing of any kind anywhere in the picture.";

const villain = ({ pose, set, light }) =>
  `Stylised 3D cartoon still, cinematic, for a children's cybersecurity cartoon. The striped grey raccoon villain from the reference image, wearing his purple circuit-patterned hoodie with the hood UP over his head and his cape, ${pose}, in ${set}. ${light} His mouth is closed. ${NOTEXT} No human characters. 16:9 cinematic framing, full scene, nothing cropped.`;

const heroes = ({ costume, pose, set, light }) =>
  `Stylised 3D cartoon still, cinematic, for a children's cybersecurity cartoon. The two child heroes from the reference images, a boy with short curly dark hair and a girl with two afro puffs, both wearing ${costume}, ${pose}, in ${set}. ${light} Both children fully in frame, mouths closed, eyes OPEN, calm and capable. ${NOTEXT} 16:9 cinematic framing, full scene, nothing cropped.`;

/* "Keep the costumes" is not enough on its own. Week 4's beaten Raccoon came
 * back bare-headed with a different cape: the model reads a defeated pose as
 * licence to restyle the character. So the end frame restates the costume as
 * a positive instruction rather than only a thing to preserve. */
const KEEP_VILLAIN =
  "The raccoon KEEPS his purple circuit-patterned hoodie with the hood UP over his head and his cape on: his costume does not change at all.";
/* Owner, 2026-10-29, on week 6's outro: "Adam and Layla laughing with their
 * eyes closed... recreate it with their eyes open." Asked to cheer, the model
 * reaches for a squeezed-shut laughing face, which on a still reads as a
 * blink. It had done it on weeks 3, 4 and 6. So every hero frame says it. */
const EYES = "Both children have their eyes OPEN, never closed or squeezed shut.";
const KEEP_HEROES = (costume) =>
  `Both children KEEP wearing ${costume}: their costumes do not change at all. ${EYES}`;

const endFrame = (change, keep) =>
  `Keep the set, the background, the lighting and the camera framing EXACTLY as they are in the reference image. ${keep} Change ONLY this: ${change}. Same characters, same costumes, same colours, same camera. ${NOTEXT}`;

const motion = (m) =>
  `Slow, smooth cinematic shot. ${m} ONE continuous shot, no cuts, camera almost still. Nobody speaks and no mouth moves to form words. No text, no captions, no subtitles.`;

/* ── the eight weeks ──────────────────────────────────────────────────── */
const WEEKS = [
  /* Week 1 was made before this pipeline existed and is the week the whole
   * no-overlap rule came from: its two voices talked over each other for 1.85
   * seconds. Rebuilt here to the same shape as the rest rather than patched.
   *
   * Its prop has to be a LOCK, not the week 2 chest of secrets: week 1 is
   * what the lock is made of, week 2 is what is kept behind it. So the
   * Raccoon works a ring of thin keys against a flimsy padlock, and the
   * children forge one long key instead. */
  {
    w: 1,
    title: "Passwords: The Secret Code",
    costume: "golden-yellow locksmith's aprons over navy shirts, with small brass keys on cords round their necks",
    den: "a dark cluttered junk den lit by a cold teal glow, full of old machines and cables",
    denLight: "Deep shadows, teal and warm gold rim light.",
    world: "a warm bright locksmith's workshop with a heavy wooden workbench, a metal vice and rows of blank key shapes hanging on hooks",
    worldLight: "Warm golden worklight against deep brown shadow.",
    i1: {
      pose: "holding up a ring of thin bent keys in one paw and poking one of them into a small flimsy glowing padlock that is already springing open, looking delighted with himself",
      end: "the flimsy padlock has sprung wide open in his paw and he is holding it up beside his head, grinning straight at the camera",
      move: "The raccoon twists the thin key and the flimsy padlock springs wide open, and he holds it up beside his head and grins at the camera.",
    },
    i2: {
      pose: "standing together at the workbench, the girl holding a long glowing golden key they have just finished and the boy resting a hand on the vice beside it",
      end: "the long golden key glows far more brightly in her hand, lighting both their faces warmly",
      move: "The long golden key glows brighter and brighter in the girl's hand until it lights both their faces.",
    },
    o1: {
      pose: "standing among his thin keys, every one of them snapped or bent on the floor around him, staring at one huge heavy glowing padlock that has not opened, furious and baffled",
      end: "he has dropped the last bent key on the pile, his empty paws hang at his sides and his shoulders and ears have drooped in defeat, the huge padlock still shut",
      move: "The raccoon drops his last bent key onto the pile, his arms fall to his sides and his shoulders and ears droop, the huge padlock still shut.",
    },
    o2: {
      pose: "standing side by side holding up the long glowing golden key between them, both smiling proudly",
      end: "both children have raised the long golden key high above their heads in celebration, arms stretched upward, cheering with big open smiles, warm golden sparks bursting around it",
      move: "The two children raise the long golden key high above their heads in celebration, arms stretching up, and golden sparks burst around it.",
    },
    lines: {
      i: [
        "A password is the lock on everything that is yours.",
        "Your name. Your birthday. One, two, three, four.",
        "[laughs] Too easy! I am IN!",
        "Not this time, Cyber Hero. This week we build a lock he cannot pick.",
      ],
      o: [
        "He tried every key he had.",
        "Nothing FITS!",
        "[proud] Long, strong, and yours alone.",
        "Locked tight. Week one, done.",
      ],
    },
  },
  {
    w: 3,
    title: "Stranger Danger: Friend or Foe?",
    costume: "brown detective trench coats and detective caps",
    den: "a dark cluttered junk den lit by a cold teal glow, full of old machines and cables",
    denLight: "Deep shadows, teal and violet rim light.",
    world: "a dim detective's office at night, with a single bright desk lamp, a plain bare painted wall and a plain filing cabinet",
    worldLight: "Warm amber lamplight against deep blue shadow.",
    i1: {
      /* Owner, 2026-10-29: the mask is a CHILD'S face, not a puppy's. The
       * case a child actually meets is a grown-up pretending to be a kid
       * their own age, and a puppy mask teaches them to look for the wrong
       * thing. Kept obviously a flat painted mask on a stick so the reveal
       * reads as "that was a mask" and never as something frightening. */
      pose: "crouched over a workbench holding up a flat cartoon face-mask on a stick in front of his own face: the mask is the cheerful smiling face of a friendly young CHILD with rosy cheeks and big happy eyes, obviously a flat painted mask on a wooden stick and not a real face, only one of the raccoon's own eyes peeking round the side of it",
      end: "he has lowered the child's face-mask away from his face and is grinning straight at the camera, holding the mask out to one side",
      move: "The raccoon lowers the smiling child's face-mask away from his face and grins straight at the camera, holding it out to one side.",
    },
    i2: {
      pose: "standing together at a desk under a bright lamp, the boy holding a large magnifying glass over a glowing amber mask shape lying on the desk, the girl leaning in to look",
      end: "the magnifying glass has moved directly over the glowing mask shape and the mask glows much brighter under it, lighting both their faces from below",
      move: "The boy moves the magnifying glass down over the glowing mask shape until it glows brightly, lighting both faces from below.",
    },
    o1: {
      pose: "caught standing in a harsh bright white spotlight beam, with a flat cartoon face-mask on a stick slipped off his face and dangling from one paw down by his side: the mask is the cheerful smiling face of a friendly young CHILD with rosy cheeks and big happy eyes, obviously a flat painted mask on a wooden stick and not a real face. He squints into the light, furious at being seen",
      end: "he has let the child's face-mask fall to the floor at his feet, his empty paws hang at his sides and his shoulders and ears have drooped in defeat, still lit by the spotlight",
      move: "The raccoon lets the child's face-mask fall from his paw to the floor, his arms drop to his sides and his shoulders and ears droop in defeat.",
    },
    o2: {
      pose: "standing side by side holding up a glowing amber mask shape between them at chest height, both smiling proudly",
      end: "both children have raised the glowing amber mask high above their heads in celebration, arms stretched upward, cheering with big open smiles, warm amber sparks bursting around it",
      move: "The two children raise the glowing amber mask high above their heads in celebration, arms stretching up, and amber sparks burst around it.",
    },
    lines: {
      i: [
        "Online, anybody can wear a friendly face.",
        "A kid your age. A brand new best friend. Someone who likes everything you like.",
        "[laughs] Say hello to your NEW friend!",
        "Not today, Cyber Hero. This week we learn to spot the mask.",
      ],
      o: [
        "He tried every disguise he had.",
        "How did you KNOW?",
        "[proud] You looked right past the smile.",
        "Friend or foe, you can tell now. Week three, done.",
      ],
    },
  },

  {
    w: 4,
    title: "Scams and Tricks: Real or Fake?",
    costume: "yellow fishing waders and waterproof jackets",
    den: "a dark junk den lit by a cold teal glow, full of old machines and tangled cables",
    denLight: "Deep shadows, teal and magenta rim light.",
    world: "a bright wooden pier over calm water at sunrise, with coils of rope and tackle boxes",
    worldLight: "Warm sunrise light with soft magenta highlights.",
    i1: {
      pose: "holding a fishing rod and dangling a big glittering magenta star-shaped lure on the line in front of him, eyeing it greedily",
      end: "he has swung the glittering magenta lure toward the camera so it fills more of the frame, and is grinning straight at the camera behind it",
      move: "The raccoon swings the glittering magenta lure toward the camera and grins at the camera from behind it.",
    },
    i2: {
      pose: "crouched together on the pier examining a glittering magenta star-shaped lure held carefully between them, the girl pointing at a sharp hook hidden underneath it",
      end: "the lure has been turned over to reveal the hook clearly underneath, and both children are looking at it with raised eyebrows, understanding",
      move: "The children turn the lure over to reveal the hook hidden underneath, and both raise their eyebrows as they understand.",
    },
    o1: {
      pose: "reeling in a fishing line that ends in a completely bare hook with nothing on it, staring at the empty hook in disbelief",
      end: "he has let the rod drop, the bare hook swings loose beside him and his shoulders and ears have drooped in defeat",
      move: "The raccoon lets the rod drop, the bare hook swings loose beside him and his shoulders and ears droop in defeat.",
    },
    o2: {
      pose: "standing side by side on the pier holding up the glittering magenta lure between them, hook clearly visible, both smiling proudly",
      end: "both children have raised the lure high above their heads in celebration, arms stretched upward, cheering with big open smiles, magenta sparks bursting around it",
      move: "The two children raise the lure high above their heads in celebration, arms stretching up, and magenta sparks burst around it.",
    },
    lines: {
      i: [
        "A free prize. A flashing pop-up. You have WON!",
        "Every single one is a hook with something shiny on it.",
        "[laughs] Go on, little hero. BITE!",
        "We are not biting, Cyber Hero. This week we find the hook.",
      ],
      o: [
        "He cast that line all week long.",
        "Not ONE bite?",
        "[proud] You checked before you clicked.",
        "Real or fake, you know now. Week four, done.",
      ],
    },
  },

  {
    w: 5,
    title: "Cyberbullying: Words Have Power",
    costume: "paint-splattered artist aprons over bright shirts",
    den: "a dark junk den lit by a cold teal glow, full of old machines and cables",
    denLight: "Deep shadows and cold grey light.",
    world: "a bright art studio full of colour, with easels, jars of brushes and paint",
    worldLight: "Warm sunlight through a big window, coral and gold highlights.",
    i1: {
      pose: "winding back one arm to hurl a handful of jagged dull grey stone shards into the darkness, snarling",
      end: "he has thrown the grey shards and they are flying away from him through the air, his arm extended after the throw",
      move: "The raccoon hurls the jagged grey shards into the darkness and they fly away through the air, his arm extended after the throw.",
    },
    i2: {
      pose: "standing at a big easel together painting a large glowing coral-coloured round shield, the girl holding the brush and the boy holding the palette",
      end: "the shield on the easel is now finished and glowing far more brightly in warm coral light, and both children have stepped back slightly to look at it",
      move: "The girl finishes the last brush stroke, the painted coral shield glows brightly, and both children step back slightly to look at it.",
    },
    o1: {
      pose: "staring at a glowing coral barrier in front of him with dull grey shards lying shattered and harmless in a pile at its base, furious and baffled",
      end: "he has turned away from the glowing barrier, shoulders and ears drooped in defeat, the shattered grey shards still lying harmless behind him",
      move: "The raccoon turns away from the glowing coral barrier, his shoulders and ears drooping, the shattered grey shards lying harmless behind him.",
    },
    o2: {
      pose: "standing side by side holding up the finished glowing coral shield between them, both smiling proudly",
      end: "both children have raised the glowing coral shield high above their heads in celebration, arms stretched upward, cheering with big open smiles, warm coral light spreading out around them",
      move: "The two children raise the glowing coral shield high above their heads in celebration, arms stretching up, and warm coral light spreads out around them.",
    },
    lines: {
      i: [
        "Words can be thrown like stones online.",
        "Cold ones. Grey ones. Ones that are meant to hurt.",
        "[laughs] Let's watch them LAND!",
        "They will not, Cyber Hero. This week we paint a shield of kindness.",
      ],
      o: [
        "He threw every cold word he had.",
        "Why will they not LAND?",
        "[proud] Every single one bounced off.",
        "Kindness is stronger. Week five, done.",
      ],
    },
  },

  {
    w: 6,
    title: "Gaming Safety: Defend Your Game Zone",
    costume: "bright pink and black esports team jerseys with headsets round their necks",
    den: "a dark junk den lit by a cold teal glow, full of old machines and cables",
    denLight: "Deep shadows, teal and hot pink rim light.",
    world: "a glowing esports arena booth with two gaming chairs and a wide curved desk, every screen switched off and dark",
    worldLight: "Hot pink and cyan stage light, dark background.",
    i1: {
      pose: "wearing a gaming headset over his hood and creeping sideways toward a tall glowing hot pink doorway of light, one paw reaching out toward it",
      end: "he has reached the glowing pink doorway and has one paw pressed against it, grinning straight at the camera over his shoulder",
      move: "The raccoon creeps to the glowing pink doorway, presses a paw against it and grins at the camera over his shoulder.",
    },
    i2: {
      pose: "sitting side by side in gaming chairs at the curved desk, both reaching up to a large glowing hot pink shield of light rising in front of them",
      end: "the glowing pink shield of light has risen much higher and brighter in front of the desk, completely filling the doorway behind it",
      move: "The glowing pink shield of light rises higher and brighter in front of the desk until it completely fills the doorway behind it.",
    },
    o1: {
      pose: "sitting on the floor having been bounced backwards away from a tall glowing hot pink barrier, his headset knocked sideways, looking furious",
      end: "he has got to his feet and turned away from the glowing pink barrier, shoulders and ears drooped in defeat, headset still sideways",
      move: "The raccoon gets to his feet and turns away from the glowing pink barrier, his shoulders and ears drooping, headset still knocked sideways.",
    },
    o2: {
      pose: "standing in front of the gaming chairs holding up a glowing hot pink shield shape between them, both smiling proudly",
      end: "both children have raised the glowing pink shield high above their heads in celebration, arms stretched upward, cheering with big open smiles, pink sparks bursting around it",
      move: "The two children raise the glowing pink shield high above their heads in celebration, arms stretching up, and pink sparks burst around it.",
    },
    lines: {
      i: [
        "Your game lobby is your place.",
        "But anybody at all can walk in wearing a headset.",
        "[laughs] Nice lobby. I'll take it!",
        "He cannot have it, Cyber Hero. This week we guard the zone.",
      ],
      o: [
        "He tried every door into that lobby.",
        "Let me BACK in!",
        "[proud] Blocked, reported, gone.",
        "Your zone, your rules. Week six, done.",
      ],
    },
  },

  {
    w: 7,
    title: "In-Game Spending: The Gem Bucks Trap",
    costume: "smart navy security guard uniforms with peaked caps",
    den: "a dark junk den lit by a cold teal glow, full of old machines and cables",
    denLight: "Deep shadows, teal and red rim light.",
    world: "a clean bright vault room with a huge round polished metal door set in the wall",
    worldLight: "Cool white light with warm red highlights.",
    i1: {
      pose: "standing beside a tall glowing machine that is spilling a stream of glowing red gem shapes into a pile, beckoning toward it with one paw",
      end: "he has scooped up a double pawful of the glowing red gems and is holding them up beside his head, grinning straight at the camera",
      move: "The raccoon scoops up a double pawful of glowing red gems from the pile and holds them up beside his head, grinning at the camera.",
    },
    i2: {
      pose: "standing to attention either side of the huge round vault door, the boy with one hand raised flat in a clear stop gesture",
      end: "the huge round vault door has swung fully shut behind them and a glowing red seal has lit up across its centre",
      move: "The huge round vault door swings fully shut behind the two children and a glowing red seal lights up across its centre.",
    },
    o1: {
      pose: "shaking a tall glowing machine that is completely empty, with not a single gem anywhere, looking furious and baffled",
      end: "he has stopped shaking the empty machine and let go of it, his arms at his sides, shoulders and ears drooped in defeat",
      move: "The raccoon stops shaking the empty machine, lets go of it and lowers his arms, his shoulders and ears drooping in defeat.",
    },
    o2: {
      pose: "standing side by side in front of the sealed vault door, both giving a confident thumbs up, smiling proudly",
      end: "both children have raised their arms high above their heads in celebration, cheering with big open smiles, warm red light from the vault seal glowing behind them",
      move: "The two children raise their arms high above their heads in celebration, cheering, with the red vault seal glowing behind them.",
    },
    lines: {
      i: [
        "One more gem. One more skin. Just one more.",
        "Every tap of that button spends somebody's real money.",
        "[laughs] Go on. Tap it AGAIN!",
        "Ask first, Cyber Hero. This week we guard the wallet.",
      ],
      o: [
        "He rattled that machine all week long.",
        "Not a single GEM?",
        "[proud] You asked a grown-up every time.",
        "Wallet guarded. Week seven, done.",
      ],
    },
  },

  {
    w: 8,
    title: "Photos & Videos: Think Before You Share",
    costume: "khaki photographer vests with cameras on straps round their necks",
    den: "a dark red-lit photographic darkroom hung with washing lines of blank glowing orange rectangles",
    denLight: "Deep red darkroom light and orange glow.",
    world: "a bright white photography studio with softbox lights and a backdrop roll",
    worldLight: "Clean white studio light with warm orange highlights.",
    i1: {
      pose: "reaching up to snatch one blank glowing orange rectangle down from a washing line of them strung across the darkroom",
      end: "he has pulled the glowing orange rectangle down off the line and is holding it up beside his head, grinning straight at the camera",
      move: "The raccoon pulls a glowing orange rectangle down off the washing line and holds it up beside his head, grinning at the camera.",
    },
    i2: {
      pose: "standing together in the studio, the girl holding up a blank glowing orange rectangle and both of them looking at it thoughtfully, the boy with one hand raised in a clear wait gesture",
      end: "the girl has lowered the glowing orange rectangle down to her side instead of sending it, and both children are nodding at each other",
      move: "The girl lowers the glowing orange rectangle to her side instead of sending it, and the two children nod at each other.",
    },
    o1: {
      pose: "standing under a completely empty washing line with nothing but bare pegs on it, holding his paws up, furious and baffled",
      end: "he has dropped his paws to his sides under the empty line, shoulders and ears drooped in defeat, bare pegs swinging above him",
      move: "The raccoon drops his paws to his sides under the empty washing line, shoulders and ears drooping, bare pegs swinging above him.",
    },
    o2: {
      pose: "standing side by side in the studio with their cameras lowered, holding a single glowing orange rectangle safely between them, both smiling proudly",
      end: "both children have raised the glowing orange rectangle high above their heads in celebration, arms stretched upward, cheering with big open smiles, orange sparks bursting around it",
      move: "The two children raise the glowing orange rectangle high above their heads in celebration, arms stretching up, and orange sparks burst around it.",
    },
    lines: {
      i: [
        "A photo takes one second to send.",
        "And then it can live forever, anywhere at all.",
        "[laughs] Send it! EVERYONE will see!",
        "Think first, Cyber Hero. This week we learn to pause.",
      ],
      o: [
        "He waited all week for one photo.",
        "My line is EMPTY!",
        "[proud] You stopped and thought, every time.",
        "Think, then share. Week eight, done.",
      ],
    },
  },

  {
    w: 9,
    title: "Apps & Downloads: Spot the Fakes",
    costume: "white inspector coats with clipboards and safety goggles pushed up on their heads",
    den: "a dark junk den lit by a cold teal glow, cluttered with old machines and cables",
    denLight: "Deep shadows, teal and electric blue rim light.",
    world: "a bright clean inspection bay with a conveyor belt of plain glowing blue rounded-square tiles, each tile completely blank with nothing drawn on it",
    worldLight: "Clean white light with electric blue highlights.",
    i1: {
      pose: "at a workbench holding up a glowing blue rounded-square tile he has just made, beside an identical one, comparing the two with a sly look",
      end: "he has lifted his copied glowing blue tile up beside his head and is grinning straight at the camera, the original tile still on the bench",
      move: "The raccoon lifts his copied glowing blue tile up beside his head and grins straight at the camera, the original still on the bench.",
    },
    i2: {
      pose: "standing either side of the conveyor belt, the boy holding a large magnifying glass over one glowing blue tile and the girl holding a clipboard",
      end: "the magnifying glass is now directly over the glowing blue tile and the tile glows much brighter under it, lighting both their faces",
      move: "The boy moves the magnifying glass down over the glowing blue tile until it glows brightly, lighting both faces.",
    },
    o1: {
      pose: "staring at his copied glowing blue tile as it crumbles into dull grey dust in his paws, furious and baffled",
      end: "the tile has crumbled away to nothing, his empty paws hang at his sides and his shoulders and ears have drooped in defeat",
      move: "The copied tile crumbles away to nothing in the raccoon's paws, his empty paws fall to his sides and his shoulders and ears droop.",
    },
    o2: {
      pose: "standing side by side at the conveyor holding up one glowing blue tile between them, both smiling proudly",
      end: "both children have raised the glowing blue tile high above their heads in celebration, arms stretched upward, cheering with big open smiles, blue sparks bursting around it",
      move: "The two children raise the glowing blue tile high above their heads in celebration, arms stretching up, and blue sparks burst around it.",
    },
    lines: {
      i: [
        "The Hacker Raccoon makes copies.",
        "Almost the right picture. Almost the right name.",
        "[laughs] Download me! I'm the REAL one!",
        "Almost is not real, Cyber Hero. This week we spot the fakes.",
      ],
      o: [
        "He built copy after copy after copy.",
        "That one was PERFECT!",
        "[proud] You checked before you downloaded.",
        "Copycat caught. Week nine, done.",
      ],
    },
  },

  {
    w: 10,
    title: "Videos & Channels: Escape the Rabbit Hole",
    costume: "high-visibility lime green mountain rescue jackets with climbing harnesses",
    den: "a dark junk den lit by a cold teal glow, with a huge swirling tunnel of plain blank glowing lime green rectangles, each one empty with nothing drawn on it, spiralling away into the dark",
    denLight: "Deep shadows, teal and lime green rim light.",
    world: "the solid rocky mouth of a glowing lime green tunnel, with daylight behind the children",
    worldLight: "Bright daylight behind, lime green glow from the tunnel.",
    i1: {
      pose: "at a control lever beside the mouth of a huge swirling tunnel made of glowing lime green rectangles, feeding an endless ribbon of them into it",
      end: "he has pulled the lever right down and the swirling tunnel of glowing lime rectangles behind him is spinning much faster and brighter, and he is grinning straight at the camera",
      move: "The raccoon pulls the lever down, the swirling tunnel of glowing lime rectangles spins faster and brighter behind him, and he grins at the camera.",
    },
    i2: {
      pose: "standing braced at the mouth of the glowing lime tunnel holding a thick climbing rope between them, leaning back against the pull",
      end: "both children have hauled the rope back a long way and have planted their feet firmly on solid rock, standing upright and steady",
      move: "The two children haul the rope back hard and plant their feet firmly on solid rock, standing upright and steady.",
    },
    o1: {
      pose: "beside a control lever that has snapped off in his paw, with the swirling tunnel behind him gone dark and still, looking furious and baffled",
      end: "he has dropped the snapped lever, his arms hang at his sides and his shoulders and ears have drooped in defeat, the tunnel dark and still behind him",
      move: "The raccoon drops the snapped lever, his arms fall to his sides and his shoulders and ears droop, the tunnel dark and still behind him.",
    },
    o2: {
      pose: "standing side by side on solid rock in bright daylight with the coiled climbing rope held between them, the dark tunnel mouth well behind them, both smiling proudly",
      end: "both children have raised the coiled rope high above their heads in celebration, arms stretched upward, cheering with big open smiles, bright daylight all around them",
      move: "The two children raise the coiled rope high above their heads in celebration, arms stretching up, in bright daylight.",
    },
    lines: {
      i: [
        "One more video. Then one more. Then one more.",
        "That tunnel never ends, because it was built not to.",
        "[laughs] Keep watching, little hero!",
        "You choose when to stop, Cyber Hero. This week we climb out.",
      ],
      o: [
        "He kept that tunnel spinning all week.",
        "Come BACK down here!",
        "[proud] You felt the pull, and you stopped.",
        "You are in charge. Week ten, done.",
      ],
    },
  },
];

/* ── emit ─────────────────────────────────────────────────────────────── */
for (const k of WEEKS) {
  const ww = String(k.w).padStart(2, "0");
  const shot = (id, spec, isVillain) => ({
    start: isVillain
      ? villain({ pose: spec.pose, set: k.den, light: k.denLight })
      : heroes({ costume: k.costume, pose: spec.pose, set: k.world, light: k.worldLight }),
    end: endFrame(spec.end, isVillain ? KEEP_VILLAIN : KEEP_HEROES(k.costume)),
    move: motion(spec.move),
  });

  const i1 = shot("i1", k.i1, true);
  const i2 = shot("i2", k.i2, false);
  const o1 = shot("o1", k.o1, true);
  const o2 = shot("o2", k.o2, false);

  const file = `/* WEEK ${k.w} bookend videos - "${k.title}".
 *
 * Generated by scripts/week-videos/_generate-week-files.mjs, which holds the
 * table every week 3-10 was written from. Edit there, not here, unless this
 * one week needs to differ.
 *
 * No line carries a start time. The build measures each recorded mp3 and
 * lays the lines end to end with a gap, so two voices CANNOT overlap: that
 * was week 1's fault.
 *
 * Every line NAMES the shot it is spoken over, and the build holds a shot on
 * its last frame until its own lines have finished. That is the other half
 * of the same bug: week 3 built with no overlap at all and still had the
 * Raccoon's line running 2.7 seconds into the detectives' shot, because the
 * line's picture was implied by a hand-written delay rather than stated.
 * \`seconds\` is the length asked of the video model, not a deadline the
 * voice has to fit inside.
 */

export const WEEK = ${k.w};
export const TITLE = ${JSON.stringify(k.title)};

export const VIDEOS = [
  {
    name: "module-${ww}-intro",
    shots: [
      { file: "intro-shot1", seconds: 10, beat: "The Raccoon sets up the week's threat." },
      { file: "intro-shot2", seconds: 7, beat: "The heroes take it on." },
    ],
    lines: [
      { file: "intro-1", shot: 1, voice: "EMMA", text: ${JSON.stringify(k.lines.i[0])} },
      { file: "intro-2", shot: 1, voice: "EMMA", text: ${JSON.stringify(k.lines.i[1])} },
      { file: "intro-3", shot: 1, voice: "CALLUM", text: ${JSON.stringify(k.lines.i[2])} },
      { file: "intro-4", shot: 2, voice: "EMMA", text: ${JSON.stringify(k.lines.i[3])} },
    ],
  },
  {
    name: "module-${ww}-outro",
    shots: [
      { file: "outro-shot1", seconds: 7, beat: "The Raccoon, foiled." },
      { file: "outro-shot2", seconds: 7, beat: "The heroes win." },
    ],
    lines: [
      { file: "outro-1", shot: 1, voice: "EMMA", text: ${JSON.stringify(k.lines.o[0])} },
      { file: "outro-2", shot: 1, voice: "CALLUM", text: ${JSON.stringify(k.lines.o[1])} },
      { file: "outro-3", shot: 2, voice: "EMMA", text: ${JSON.stringify(k.lines.o[2])} },
      { file: "outro-4", shot: 2, voice: "EMMA", text: ${JSON.stringify(k.lines.o[3])} },
    ],
  },
];

/* Each shot is pinned at BOTH ends: the end frame is generated FROM the start
 * frame, so the video model interpolates between two pictures of one set
 * instead of inventing its way out of one. */
export const FRAMES = [
  { file: "intro-shot1-start", refs: ["raccoon-idle"], prompt: ${JSON.stringify(i1.start)} },
  { file: "intro-shot1-end", fromPrevious: true, prompt: ${JSON.stringify(i1.end)} },
  { file: "intro-shot2-start", refs: ["adam", "layla"], prompt: ${JSON.stringify(i2.start)} },
  { file: "intro-shot2-end", fromPrevious: true, prompt: ${JSON.stringify(i2.end)} },
  { file: "outro-shot1-start", refs: ["raccoon-hurt", "raccoon-idle"], prompt: ${JSON.stringify(o1.start)} },
  { file: "outro-shot1-end", fromPrevious: true, prompt: ${JSON.stringify(o1.end)} },
  { file: "outro-shot2-start", refs: ["adam", "layla"], prompt: ${JSON.stringify(o2.start)} },
  { file: "outro-shot2-end", fromPrevious: true, prompt: ${JSON.stringify(o2.end)} },
];

/* What moves between the two pinned frames. One action per shot. */
export const MOTION = {
  "intro-shot1": ${JSON.stringify(i1.move)},
  "intro-shot2": ${JSON.stringify(i2.move)},
  "outro-shot1": ${JSON.stringify(o1.move)},
  "outro-shot2": ${JSON.stringify(o2.move)},
};
`;
  writeFileSync(`scripts/week-videos/w${ww}.mjs`, file);
  console.log(`w${ww}.mjs  ${k.title}`);
}
console.log(`\n${WEEKS.length} week files written.`);
