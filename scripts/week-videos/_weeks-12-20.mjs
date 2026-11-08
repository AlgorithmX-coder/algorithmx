/* Weeks 12 to 20, on the shape week 11 proved.
 *
 * Kept out of _generate-week-files-v2.mjs so that file stays the SHAPE and
 * this file stays the CONTENT. The generator imports and emits these.
 *
 * Every week here obeys the rules week 11 arrived at the expensive way:
 *
 *  - ONE line and ONE action per shot, and the action has an unmistakable
 *    before and after. A beat whose two frames differ by "a lever turns a
 *    little" renders as drift however long or short the clip is.
 *  - Nine shots: five in the intro (villain, villain, his gloat, heroes,
 *    heroes) and four in the outro (villain, his gloat, heroes, heroes).
 *  - `chain: true` means the shot opens on the previous shot's END frame -
 *    the same picture - so it costs a clip rather than a frame and cannot
 *    drift off the set.
 *  - The Raccoon is ALONE in his shots and only speaks over them.
 *  - Light is the model's most reliable big change, so where a week has a
 *    choice, the action is something going bright or going dark.
 *
 * COSTUMES AND WORLDS ARE ALL DIFFERENT. Weeks 1-11 have already used
 * locksmith aprons, forge aprons, detective coats, fishing waders, artist
 * aprons, esports jerseys, security uniforms, photographer vests, inspector
 * coats, mountain rescue jackets and lighthouse keepers' coats, so none of
 * those, and no second forge, tunnel, mask-on-a-stick or fishing hook.
 *
 * CHILD SAFETY. Every scene shows the villain losing or a child simply being
 * capable. Never the bad thing happening to a child, and never a child
 * frightened. Weeks 14 and 19 are the ones to watch: the threat is the
 * Raccoon listening or creeping, never a child in danger.
 */

export const EMMA = "EMMA";
export const RACCOON = "CALLUM";

const DEN = "a dark cluttered junk den lit by a cold teal glow, full of old machines and cables";

export const WEEKS_12_20 = [
  /* ── 12 ───────────────────────────────────────────────────────────── */
  {
    w: 12,
    title: "Digital Footprint: Tracks in the Snow",
    costume: "thick scarlet arctic parkas with fur-lined hoods down and snow goggles pushed up on their foreheads",
    den: DEN,
    denLight: "Deep shadows, teal and cold blue rim light.",
    world: "a wide moonlit snowfield with dark pine trees and a small log cabin with warm lit windows in the distance",
    worldLight: "Cold blue moonlight on snow, warm gold from the cabin windows.",
    intro: [
      {
        who: "villain", floor: 4,
        beat: "He finds the trail of glowing footprints.",
        pose: "crouching low over a line of small glowing blue child-sized SHOE prints with flat soles, clearly made by a child in boots and not by any animal paw, that run across the floor of his den, holding an old lantern down close to them, following them with his eyes",
        end: "he has stood right up with the lantern held high above his head, and the line of glowing blue shoe prints has lit up much brighter all the way across the den behind him",
        move: "The raccoon straightens up fast and lifts the lantern high, and the whole line of glowing blue footprints flares up bright across the den floor behind him.",
        say: [[EMMA, "Everything you do online leaves a little TRACK."]],
      },
      {
        who: "villain", chain: true, floor: 5,
        beat: "He follows them to a picture of a cabin.",
        end: "he has followed the glowing shoe prints to the far wall and is holding the lantern up against a small painted picture of a log cabin hanging there, tapping it with one claw",
        move: "The raccoon hurries along the glowing trail to the far wall and holds his lantern up against a small painted picture of a log cabin, tapping it with a claw.",
        say: [[EMMA, "Put enough of them together and they lead somewhere REAL."]],
      },
      {
        who: "villain", chain: true, floor: 4,
        beat: "His gloat.",
        end: "he has swung round towards the camera and leaned in much closer, filling more of the frame, grinning widely with the lantern lifted beside his face",
        move: "The raccoon swings round to the camera and leans in close with the lantern beside his face, grinning.",
        say: [[RACCOON, "Found you. I just followed your CRUMBS."]],
      },
      {
        who: "heroes", floor: 4,
        beat: "They see their own tracks in the snow.",
        pose: "standing together in deep snow looking back at a long line of their own boot prints stretching away behind them towards the dark pines",
        end: "both children have turned right round to face the camera and have lifted a wide flat snow-board between them, holding it up ready",
        move: "The two children turn right round from their own footprints to face the camera and lift a wide flat snow-board up between them.",
        say: [[EMMA, "So this week we learn to walk LIGHTLY."]],
      },
      {
        who: "heroes", chain: true, floor: 5,
        beat: "They sweep the tracks away.",
        end: "the children have swept the wide board down across the snow and the long line of shoe prints behind them has been wiped away into smooth clean snow, with only soft moonlight on it",
        move: "The two children sweep the wide board down across the snow in one go, and the long line of shoe prints behind them is wiped away into smooth clean snow.",
        say: [[EMMA, "You choose what you leave behind."]],
      },
    ],
    outro: [
      {
        who: "villain", floor: 5,
        beat: "The trail goes out under his lantern.",
        pose: "standing in the middle of his den holding the lantern down low over the floor where the glowing blue shoe prints used to be, staring at bare empty floor",
        end: "he has dropped right down onto his knees and set the lantern on the bare floor in front of him, and the lantern flame has guttered down to a tiny dying spark so the whole den has gone much darker around him",
        move: "The raccoon drops onto his knees and sets the lantern down on the bare floor, and its flame gutters away to a tiny spark as the den goes dark around him.",
        say: [[EMMA, "He followed your tracks all week."]],
      },
      {
        who: "villain", chain: true, floor: 4,
        beat: "Beaten.",
        end: "he has let the lantern fall over onto the bare floor beside him, his arms hang at his sides and his shoulders and ears have drooped right down in defeat",
        move: "The raccoon lets the lantern tip over onto the bare floor, his arms drop and his shoulders and ears droop right down.",
        say: [[RACCOON, "The trail just STOPS!"]],
      },
      {
        who: "heroes", floor: 4,
        beat: "Clean snow behind them.",
        pose: "standing side by side in the moonlit snowfield with smooth unmarked snow stretching away behind them, both smiling, the lit cabin small in the distance",
        end: "thick fresh snow is now falling heavily all through the air in big soft flakes, filling the whole picture and settling over the smooth snow behind them, and both children have tipped their heads right back to look up at it with big open smiles",
        move: "Thick snow starts falling heavily right across the whole picture and settles over the smooth snow behind the two children, and both tip their heads back to look up at it, smiling.",
        say: [[EMMA, "[proud] Nothing back there to follow."]],
      },
      {
        who: "heroes", chain: true, floor: 5,
        beat: "Home, with the cabin lit.",
        end: "both children have turned towards the little log cabin in the distance and are pointing at it together, and its windows have lit up much warmer and brighter across the snow",
        move: "The two children turn and point together at the little cabin, and its windows glow up much warmer and brighter across the snow.",
        say: [[EMMA, "Your tracks are yours, Cyber Hero. Week twelve, done."]],
      },
    ],
  },

  /* ── 13 ───────────────────────────────────────────────────────────── */
  {
    w: 13,
    title: "Screen Time: Balance Your Power",
    costume: "green gardening dungarees over cream shirts, with wide straw sun hats on their backs on cords",
    den: DEN,
    denLight: "Deep shadows, teal and harsh white rim light.",
    world: "a big glass greenhouse with rows of terracotta pots of drooping wilting plants, and a big brass dial on a post in the middle, everything washed out under a harsh glaring white light",
    worldLight: "Harsh glaring white light through the glass, colour bleached out of everything.",
    intro: [
      {
        who: "villain", floor: 4,
        beat: "He cranks the lamp to maximum.",
        pose: "standing at a big brass dial on a post with both paws on its handle, beside a small potted plant that is standing under a harsh white lamp, the dial turned down low",
        end: "he has cranked the dial all the way round to the top and the harsh white lamp above the little plant has blazed up to a glaring brightness, washing the whole den white",
        move: "The raccoon cranks the big dial all the way round, and the harsh white lamp above the little plant blazes up until it washes the whole den white.",
        say: [[EMMA, "Screens are brilliant. Until there is nothing ELSE."]],
      },
      {
        who: "villain", chain: true, floor: 5,
        beat: "The plant wilts under it.",
        end: "the little potted plant under the glaring lamp has wilted right over with its leaves drooping and curled, and he has folded his arms and is watching it",
        move: "The little plant under the glaring lamp wilts right over with its leaves curling down, and the raccoon folds his arms and watches it.",
        say: [[EMMA, "Too much of anything, and the rest of you goes QUIET."]],
      },
      {
        who: "villain", chain: true, floor: 4,
        beat: "His gloat.",
        end: "he has turned to the camera and leaned in much closer, filling more of the frame, grinning widely with one paw still resting on the dial",
        move: "The raccoon turns to the camera and leans in close with a paw still on the dial, grinning.",
        say: [[RACCOON, "[laughs] Leave it on. Leave it ON!"]],
      },
      {
        who: "heroes", floor: 4,
        beat: "They take the dial back.",
        pose: "standing either side of a big brass dial on a post in the middle of the greenhouse, both reaching out to put their hands on its handle, with wilting plants around them",
        end: "both children have turned the big brass dial back down to the middle together, the harsh white glare has gone and the whole greenhouse has softened into warm golden late-afternoon sunlight, with colour back in everything",
        move: "The two children turn the big brass dial back down to the middle together, and the harsh white glare drops away into warm golden sunlight right across the greenhouse.",
        say: [[EMMA, "You hold the dial, Cyber Hero."]],
      },
      {
        who: "heroes", chain: true, floor: 5,
        beat: "Everything grows.",
        end: "all the plants around the two children have lifted and opened out into full healthy green leaves, and both children are looking round at them with big open smiles",
        move: "Every plant around the two children lifts and opens out into full green leaves, and both children look round at them, smiling.",
        say: [[EMMA, "This week we learn where to set it."]],
      },
    ],
    outro: [
      {
        who: "villain", floor: 5,
        beat: "The dial snaps off in his paw.",
        pose: "gripping the big brass dial with both paws and straining to force it round further, the harsh lamp above flickering, and the little potted plant beneath it now wilted right over with brown curled leaves",
        end: "the dial handle has snapped clean off in his paw and the harsh white lamp above has gone right out, leaving his den dark teal again",
        move: "The dial handle snaps clean off in the raccoon's paw and the harsh lamp above goes right out, dropping the den back to dark teal.",
        say: [[EMMA, "He kept that lamp blazing all week."]],
      },
      {
        who: "villain", chain: true, floor: 4,
        beat: "Beaten.",
        end: "he has dropped the snapped handle on the floor, his arms hang at his sides and his shoulders and ears have drooped right down in defeat in the dark",
        move: "The raccoon drops the snapped handle, his arms fall to his sides and his shoulders and ears droop right down in the dark.",
        say: [[RACCOON, "Who turned it DOWN?"]],
      },
      {
        who: "heroes", floor: 4,
        beat: "They open the greenhouse door.",
        pose: "standing together with their hands on the handle of the tall glass greenhouse door, which is still closed, warm daylight waiting outside it",
        end: "the children have swung the tall glass door wide open and bright warm daylight is pouring in across them and all the plants",
        move: "The two children swing the tall glass door wide open and warm daylight floods in across them and all the plants.",
        say: [[EMMA, "[proud] You put it down and went outside."]],
      },
      {
        who: "heroes", chain: true, floor: 5,
        beat: "Out into the light.",
        end: "both children have stepped right out through the open door into the full golden daylight and have thrown their arms out wide, with big open smiles",
        move: "The two children step right out through the open door into full golden daylight and throw their arms out wide, smiling.",
        say: [[EMMA, "Balance is power, Cyber Hero. Week thirteen, done."]],
      },
    ],
  },

  /* ── 14 ───────────────────────────────────────────────────────────── */
  {
    w: 14,
    title: "Smart Devices: Who's Listening?",
    costume: "deep burgundy studio engineer smocks with big padded over-ear headphones hanging round their necks",
    den: DEN,
    denLight: "Deep shadows, teal and warm orange rim light.",
    world: "a cosy radio listening room with a wall of brass dials and switches and a wide window looking out over a field of white dish antennas at dusk",
    worldLight: "Warm orange dial-light inside, deep violet dusk through the window.",
    intro: [
      {
        who: "villain", floor: 4,
        beat: "He presses an ear-trumpet to a little speaker.",
        pose: "kneeling right beside a small plain matte grey cylinder speaker on the floor with a single plain glowing ring around its top, holding a huge brass ear-trumpet so that its WIDE BELL END is pressed down directly over the top of that speaker and its narrow end is held tight against his own ear, leaning in and listening hard with his eyes wide. The speaker is a plain featureless cylinder that does not resemble any real product and carries no markings of any kind",
        end: "a ring of bright orange sound-rings has burst out of the little speaker into the wide end of the ear-trumpet, lighting his face warm orange, and he has leaned in hard against it",
        move: "A ring of bright orange sound-rings bursts out of the little speaker into the brass ear-trumpet, lighting the raccoon's face orange as he leans hard into it.",
        say: [[EMMA, "Some things in your house are always LISTENING."]],
      },
      {
        who: "villain", chain: true, floor: 5,
        beat: "He scribbles nothing down, delighted.",
        end: "he has pulled the ear-trumpet away from the speaker and is hugging it against his chest with both paws, and the orange sound-rings are now spilling out of its narrow end all around him",
        move: "The raccoon pulls the ear-trumpet away and hugs it to his chest, and bright orange sound-rings spill out of its narrow end all around him.",
        say: [[EMMA, "Not to be nosy. Just because nobody ever told them to STOP."]],
      },
      {
        who: "villain", chain: true, floor: 4,
        beat: "His gloat.",
        end: "he has turned to the camera and leaned in much closer, filling more of the frame, grinning widely with one paw cupped behind his ear",
        move: "The raccoon turns to the camera and leans in close with a paw cupped behind his ear, grinning.",
        say: [[RACCOON, "Keep talking. I'm all EARS."]],
      },
      {
        who: "heroes", floor: 4,
        beat: "They find the switch.",
        pose: "standing at a wall of brass dials and switches, both looking up at one big switch near the top that is glowing orange, reaching up towards it together",
        end: "both children have got their hands onto the big glowing switch together and have pushed it right down, and it has turned from orange to calm deep blue",
        move: "The two children get their hands onto the big glowing switch together and push it right down, and it turns from orange to calm deep blue.",
        say: [[EMMA, "But you can always turn them OFF."]],
      },
      {
        who: "heroes", chain: true, floor: 5,
        beat: "The whole wall goes quiet.",
        end: "every dial and switch along the whole wall has turned from orange to calm deep blue, the room has gone quiet and cool, and both children are looking along the wall with big open smiles",
        move: "Every dial along the whole wall turns from orange to calm deep blue one after another, and the two children look along it, smiling.",
        say: [[EMMA, "This week we learn where the off switch lives."]],
      },
    ],
    outro: [
      {
        who: "villain", floor: 5,
        beat: "Nothing comes out of the trumpet.",
        pose: "sitting on the floor with the huge brass ear-trumpet pressed hard against the small round speaker again, straining to hear, his ear jammed against the narrow end",
        end: "the little speaker has gone completely dark and silent, no sound-rings at all, and he has pulled the ear-trumpet away and is peering down into its wide end",
        move: "The little speaker goes dark and silent with no sound-rings at all, and the raccoon pulls the trumpet away and peers down into its wide end.",
        say: [[EMMA, "He listened at that speaker all week."]],
      },
      {
        who: "villain", chain: true, floor: 4,
        beat: "Beaten.",
        end: "he has let the huge brass ear-trumpet clatter down onto the floor beside him, his arms hang at his sides and his shoulders and ears have drooped right down in defeat",
        move: "The raccoon lets the big brass ear-trumpet clatter down onto the floor, his arms drop and his shoulders and ears droop right down.",
        say: [[RACCOON, "It's gone QUIET in here!"]],
      },
      {
        who: "heroes", floor: 4,
        beat: "The quiet room.",
        pose: "standing together in front of the wall of calm blue dials, both with their headphones lifted off and held in their hands, the dusk window behind them",
        end: "both children have hung their headphones up on two hooks on the wall and have turned to face the camera, with big open smiles",
        move: "The two children hang their headphones up on the wall hooks and turn to face the camera, smiling.",
        say: [[EMMA, "[proud] You checked what was listening."]],
      },
      {
        who: "heroes", chain: true, floor: 5,
        beat: "Dusk through the window.",
        end: "both children have turned to the wide window and the field of white dish antennas beyond it has tipped right over to point down at the ground, with the violet dusk sky clear above them",
        move: "The two children turn to the wide window, and every white dish antenna beyond it tips right over to point down at the ground under a clear violet sky.",
        say: [[EMMA, "Your house, your rules. Week fourteen, done."]],
      },
    ],
  },

  /* ── 15 ───────────────────────────────────────────────────────────── */
  {
    w: 15,
    title: "AI & Chatbots: Robot or Real?",
    costume: "bright orange robotics-workshop dungarees over grey shirts, with small tool belts round their waists",
    den: DEN,
    denLight: "Deep shadows, teal and cold white rim light.",
    world: "a bright robot workshop with a friendly half-built robot standing on a bench, open parts bins and coils of cable on the walls",
    worldLight: "Clean white worklight, warm orange bounce from the dungarees.",
    intro: [
      {
        who: "villain", floor: 4,
        beat: "He climbs inside a cardboard robot shell.",
        pose: "standing beside a tall empty cardboard robot shell with a round head and a friendly painted smile, holding its front panel open with one paw and lifting a leg to step inside",
        end: "he has climbed right inside the cardboard robot shell and pulled the front panel shut, so only the friendly painted robot stands there with his striped tail still poking out at the bottom",
        move: "The raccoon climbs right inside the cardboard robot shell and pulls the panel shut, leaving a friendly painted robot standing there with his striped tail poking out below.",
        say: [[EMMA, "Some things online TALK like a person."]],
      },
      {
        who: "villain", chain: true, floor: 5,
        beat: "The shell lights up and waves.",
        end: "the cardboard robot's round head has lit up with a warm friendly glow and one of its stiff arms has swung right up into a wave, with the striped tail still poking out underneath",
        move: "The cardboard robot's head lights up warm and friendly and its stiff arm swings right up into a wave, the striped tail still poking out underneath.",
        say: [[EMMA, "They are good at it. That does not make them REAL."]],
      },
      {
        who: "villain", chain: true, floor: 4,
        beat: "His gloat, head tipped back.",
        end: "the cardboard robot head has tipped right back on a hinge and the raccoon has pushed his own grinning face out through the opening, leaning in close to the camera",
        move: "The cardboard robot head tips right back on its hinge and the raccoon pushes his grinning face out through the opening, leaning in close to the camera.",
        say: [[RACCOON, "Beep boop. I have FEELINGS, you know."]],
      },
      {
        who: "heroes", floor: 4,
        beat: "They open the robot's panel.",
        pose: "standing either side of a friendly half-built robot on a workbench, both reaching out for a small panel on its chest with a screwdriver each",
        end: "both children have swung the little chest panel wide open and a bright clean white light is spilling out of it, showing neat gears and wires packed inside",
        move: "The two children swing the robot's little chest panel wide open and clean white light spills out, showing the neat gears and wires packed inside.",
        say: [[EMMA, "So we look INSIDE."]],
      },
      {
        who: "heroes", chain: true, floor: 5,
        beat: "They hold up a gear.",
        end: "one child has lifted a single bright brass gear out of the robot's chest and both children are holding it up between them towards the camera, with big open smiles",
        move: "One child lifts a single bright brass gear out of the robot's chest and the two of them hold it up between them towards the camera, smiling.",
        say: [[EMMA, "Gears, not feelings. This week we learn to tell."]],
      },
    ],
    outro: [
      {
        who: "villain", floor: 5,
        beat: "The shell collapses around him.",
        pose: "standing inside the cardboard robot shell with its friendly painted smile, both of its stiff arms raised, the head beginning to tip sideways",
        end: "the whole cardboard robot shell has collapsed into a flat heap of panels around his feet and he is standing in the middle of it with nothing to hide behind",
        move: "The cardboard robot shell collapses into a flat heap of panels around the raccoon's feet, leaving him standing in the middle of it with nothing to hide behind.",
        say: [[EMMA, "He wore that robot suit all week."]],
      },
      {
        who: "villain", chain: true, floor: 4,
        beat: "Beaten.",
        end: "he has kicked one flat cardboard panel away, his arms hang at his sides and his shoulders and ears have drooped right down in defeat among the heap",
        move: "The raccoon kicks a flat cardboard panel away, his arms drop to his sides and his shoulders and ears droop right down among the heap.",
        say: [[RACCOON, "You opened me UP?"]],
      },
      {
        who: "heroes", floor: 4,
        beat: "The robot is finished, and friendly.",
        pose: "standing either side of the finished friendly robot on the workbench, both with a hand resting on it, its chest panel still open and lit",
        end: "both children have closed the robot's chest panel and its round face has lit up with a warm friendly glow, and both are looking at it with big open smiles",
        move: "The two children close the robot's chest panel and its round face lights up warm and friendly, and both look at it, smiling.",
        say: [[EMMA, "[proud] You asked what it really was."]],
      },
      {
        who: "heroes", chain: true, floor: 5,
        beat: "A machine, and that is fine.",
        end: "the finished robot has lifted one arm into a friendly wave and both children have raised a hand and waved back at it, all three in bright clean worklight",
        move: "The finished robot lifts an arm into a friendly wave and both children raise a hand and wave back at it in the bright worklight.",
        say: [[EMMA, "A helpful machine, Cyber Hero. Week fifteen, done."]],
      },
    ],
  },

  /* ── 16 ───────────────────────────────────────────────────────────── */
  {
    w: 16,
    title: "QR Codes & Links: Don't Take the Bait",
    /* Week 4 already used a fishing hook for "bait", so this week is about
     * DOORS instead: a link is a door, and the Raccoon repaints the colour
     * above it so you walk through the wrong one. */
    costume: "deep plum usher's coats with double rows of small silver buttons, each carrying a small brass lantern",
    den: DEN,
    denLight: "Deep shadows, teal and emerald rim light.",
    world: "a tall grand hall lined with identical stone archways, each one lit by a glowing coloured lamp above it, polished floor reflecting the colours",
    worldLight: "Pools of coloured lamplight on dark polished stone.",
    intro: [
      {
        who: "villain", floor: 4,
        beat: "He repaints the lamp above a doorway.",
        pose: "balanced on a rickety stool beside a dark stone archway, reaching up with a dripping brush to a dull grey lamp above it, a paint pot hooked over one arm",
        end: "he has painted the lamp above the archway a bright inviting emerald green and it has lit right up, throwing green light down the whole archway and across his face",
        move: "The raccoon slaps green paint across the lamp above the archway and it lights right up emerald, throwing green light down the arch and across his face.",
        say: [[EMMA, "A link is a DOOR. You cannot see where it goes."]],
      },
      {
        who: "villain", chain: true, floor: 5,
        beat: "Behind the green arch, a long drop.",
        end: "he has stepped down off the stool and pulled a heavy curtain aside from the green archway, showing nothing behind it but a dark empty drop going down into shadow",
        move: "The raccoon steps down and sweeps the curtain aside from the green archway, showing a dark empty drop going down into shadow behind it.",
        say: [[EMMA, "He makes the wrong one look the most INVITING."]],
      },
      {
        who: "villain", chain: true, floor: 4,
        beat: "His gloat.",
        end: "he has turned to the camera and leaned in much closer, filling more of the frame, grinning widely and holding the dripping green brush up beside his face",
        move: "The raccoon turns to the camera and leans in close, holding the dripping green brush up beside his face, grinning.",
        say: [[RACCOON, "After you. It's perfectly SAFE."]],
      },
      {
        who: "heroes", floor: 4,
        beat: "They hold a lantern up to the arch.",
        pose: "standing together in front of a glowing green stone archway in the grand hall, both lifting their small brass lanterns up towards the lamp above it",
        end: "both children have raised their lanterns right up against the lamp and the green has washed away under the clean white lantern light, leaving the lamp a dull honest grey",
        move: "The two children raise their lanterns right up to the lamp and the green washes away under the clean white light, leaving the lamp a dull honest grey.",
        say: [[EMMA, "So we hold a light up to it FIRST."]],
      },
      {
        who: "heroes", chain: true, floor: 5,
        beat: "The right door lights itself.",
        end: "a different archway further along the hall has lit up on its own with a steady warm gold lamp, and both children have turned and are pointing at it together with big open smiles",
        move: "A different archway further down the hall lights up on its own with a steady warm gold lamp, and the two children turn and point at it together, smiling.",
        say: [[EMMA, "This week we learn to check the door."]],
      },
    ],
    outro: [
      {
        who: "villain", floor: 5,
        beat: "Every lamp he painted goes grey.",
        pose: "standing in his den in front of a row of small lamps he has painted bright green, holding the paint pot, all of them still glowing",
        end: "every lamp in the row has gone out and washed back to dull honest grey one after another, and he is holding the empty paint pot upside down over them",
        move: "Every green lamp in the row goes out and washes back to dull grey one after another, and the raccoon holds the empty paint pot upside down over them.",
        say: [[EMMA, "He painted every door green this week."]],
      },
      {
        who: "villain", chain: true, floor: 4,
        beat: "Beaten.",
        end: "he has dropped the paint pot on the floor, his arms hang at his sides and his shoulders and ears have drooped right down in defeat in front of the grey lamps",
        move: "The raccoon drops the paint pot, his arms fall to his sides and his shoulders and ears droop right down in front of the grey lamps.",
        say: [[RACCOON, "Nobody walked THROUGH?"]],
      },
      {
        who: "heroes", floor: 4,
        beat: "They stand at the honest door.",
        pose: "standing together at the foot of the warm gold archway in the grand hall, lanterns lowered at their sides, looking up at its steady lamp",
        end: "both children have stepped right up into the gold archway and warm golden light has flooded down over them from above",
        move: "The two children step right up into the gold archway and warm golden light floods down over them from above.",
        say: [[EMMA, "[proud] You checked before you stepped."]],
      },
      {
        who: "heroes", chain: true, floor: 5,
        beat: "The hall lights up behind them.",
        end: "every other archway down the length of the hall has lit up warm gold behind the two children, and both have turned to the camera with big open smiles",
        move: "Every archway down the hall lights up warm gold behind the two children, and both turn to the camera, smiling.",
        say: [[EMMA, "Look before you go, Cyber Hero. Week sixteen, done."]],
      },
    ],
  },

  /* ── 17 ───────────────────────────────────────────────────────────── */
  {
    w: 17,
    title: "Social Media: The Profile Shield",
    costume: "royal blue heralds' tabards with gold trim over white sleeves",
    den: DEN,
    denLight: "Deep shadows, teal and pale gold rim light.",
    world: "the stone battlements of a castle at dusk, with tall banners on poles along the wall and a wide valley below",
    worldLight: "Low pink and gold dusk light on stone, deep blue shadow.",
    intro: [
      {
        who: "villain", floor: 4,
        beat: "He spies on an open banner.",
        pose: "crouching behind a low wall with a long brass spyglass raised to one eye, pointed across at a tall banner hanging fully open and brightly lit on the far side",
        end: "he has pushed the spyglass right out to its full length and leaned far over the low wall, and the open banner across from him has lit up much brighter",
        move: "The raccoon pushes the spyglass out to full length and leans far over the low wall, and the open banner across from him lights up much brighter.",
        say: [[EMMA, "Your profile is a BANNER. Everyone can see it."]],
      },
      {
        who: "villain", chain: true, floor: 5,
        beat: "He copies what is on it.",
        end: "he has lowered the spyglass and is holding up a small cloth copy of the same banner that he has made, comparing it with the bright one across the way",
        move: "The raccoon lowers the spyglass and holds up a small cloth copy of the same banner he has made, comparing it with the bright one across the way.",
        say: [[EMMA, "And anything on it can be COPIED."]],
      },
      {
        who: "villain", chain: true, floor: 4,
        beat: "His gloat.",
        end: "he has turned to the camera and leaned in much closer, filling more of the frame, grinning widely with the little copied banner held up beside his face",
        move: "The raccoon turns to the camera and leans in close with the little copied banner held up beside his face, grinning.",
        say: [[RACCOON, "Thanks for POSTING that."]],
      },
      {
        who: "heroes", floor: 4,
        beat: "They raise the shield.",
        pose: "standing either side of a tall bright banner on the battlements, both gripping the edges of a large blue and gold shield between them down at knee height",
        end: "both children have lifted the big shield right up in front of the banner and it has covered it completely, the shield's gold trim catching the dusk light",
        move: "The two children lift the big shield right up in front of the banner until it covers it completely, its gold trim catching the dusk light.",
        say: [[EMMA, "So we put a SHIELD in front of it."]],
      },
      {
        who: "heroes", chain: true, floor: 5,
        beat: "The whole wall is shielded.",
        end: "a shield has risen in front of every banner along the whole length of the battlements, and both children are looking down the wall at them with big open smiles",
        move: "A shield rises in front of every banner along the whole battlement wall one after another, and the two children look down the wall at them, smiling.",
        say: [[EMMA, "This week we learn who gets to look."]],
      },
    ],
    outro: [
      {
        who: "villain", floor: 5,
        beat: "His spyglass shows nothing.",
        pose: "standing on a crate with the long brass spyglass jammed against his eye, aimed across at the battlements, straining",
        end: "he has pulled the spyglass away from his eye and is peering down the wrong end of it, and the little copied banner in his other paw has gone completely blank",
        move: "The raccoon pulls the spyglass away and peers down the wrong end of it, and the little copied banner in his other paw goes completely blank.",
        say: [[EMMA, "He watched that wall all week."]],
      },
      {
        who: "villain", chain: true, floor: 4,
        beat: "Beaten.",
        end: "he has let the spyglass and the blank banner drop to the floor, his arms hang at his sides and his shoulders and ears have drooped right down in defeat",
        move: "The raccoon lets the spyglass and the blank banner drop to the floor, his arms fall and his shoulders and ears droop right down.",
        say: [[RACCOON, "There's NOTHING on it!"]],
      },
      {
        who: "heroes", floor: 4,
        beat: "They lower the shield for a friend.",
        pose: "standing together behind the big blue and gold shield on the battlements at dusk, both with their hands on its top edge",
        end: "both children have tilted the shield down just a little and warm gold dusk light has come through the gap onto their faces, and both are smiling",
        move: "The two children tilt the big shield down just a little and warm gold dusk light comes through the gap onto their faces.",
        say: [[EMMA, "[proud] You chose who could see."]],
      },
      {
        who: "heroes", chain: true, floor: 5,
        beat: "Their own banner, flying.",
        end: "a tall banner has risen on the pole above the two children and is flying out in the wind in bright blue and gold, and both have looked up at it with big open smiles",
        move: "A tall blue and gold banner rises on the pole above the two children and flies out in the wind, and both look up at it, smiling.",
        say: [[EMMA, "You pick who sees, Cyber Hero. Week seventeen, done."]],
      },
    ],
  },

  /* ── 18 ───────────────────────────────────────────────────────────── */
  {
    w: 18,
    title: "Sharing Devices: Lock Before You Leave",
    /* Week 1 is about what a lock is MADE of. This week is about actually
     * turning it before you walk away, so the prop is a row of lockers
     * rather than week 1's padlock and ring of keys. */
    costume: "charcoal grey porter's waistcoats over white shirts, with bright red armbands on one sleeve",
    den: DEN,
    denLight: "Deep shadows, teal and warm yellow rim light.",
    world: "a left-luggage room with long rows of tall metal lockers in soft green enamel, a worn tiled floor and a high window",
    worldLight: "Warm daylight from the high window, cool green bounce off the lockers.",
    intro: [
      {
        who: "villain", floor: 4,
        beat: "He walks the row trying handles.",
        pose: "walking along a row of tall metal lockers in his den, running one paw along their handles, every locker shut tight",
        end: "he has stopped dead at one locker whose door is standing half open with warm yellow light spilling out of it, and has both paws on its edge",
        move: "The raccoon walks the row of lockers trying handles, then stops dead at one standing half open with warm yellow light spilling out, and grabs its edge.",
        say: [[EMMA, "You step away for ONE minute."]],
      },
      {
        who: "villain", chain: true, floor: 5,
        beat: "He swings it wide.",
        end: "he has swung the locker door right open and the warm yellow light is flooding out over him, and he is leaning right into the opening with both paws on the frame",
        move: "The raccoon swings the locker door right open and warm yellow light floods out over him as he leans into the opening with both paws on the frame.",
        say: [[EMMA, "And a door you left open is an INVITATION."]],
      },
      {
        who: "villain", chain: true, floor: 4,
        beat: "His gloat.",
        end: "he has turned out of the locker towards the camera and leaned in much closer, filling more of the frame, grinning widely with the warm light behind him",
        move: "The raccoon turns out of the locker towards the camera and leans in close, grinning, the warm light behind him.",
        say: [[RACCOON, "You didn't LOCK it. Thank you."]],
      },
      {
        who: "heroes", floor: 4,
        beat: "They swing the door shut.",
        pose: "standing together at a tall green locker whose door is wide open with warm light inside, both with their hands flat on the open door, ready to push",
        end: "both children have pushed the locker door right shut and a big brass bolt across it has slid closed, and the warm light inside has gone",
        move: "The two children push the locker door right shut and a big brass bolt slides closed across it, and the warm light inside is gone.",
        say: [[EMMA, "So we close it BEFORE we go."]],
      },
      {
        who: "heroes", chain: true, floor: 5,
        beat: "The whole row locks.",
        end: "a brass bolt has slid closed across every locker down the whole row behind the two children, and both are looking along it with big open smiles",
        move: "A brass bolt slides closed across every locker down the whole row one after another, and the two children look along it, smiling.",
        say: [[EMMA, "This week we learn to lock up behind us."]],
      },
    ],
    outro: [
      {
        who: "villain", floor: 5,
        beat: "Every handle holds.",
        pose: "hauling on the handle of a shut locker with both paws and one foot braced against the next one, straining hard",
        end: "his paws have slipped right off the handle and he has sat down hard on the floor, and the whole row of lockers stands shut and still above him",
        move: "The raccoon's paws slip off the handle and he sits down hard on the floor, with the whole row of lockers shut and still above him.",
        say: [[EMMA, "He tried every door this week."]],
      },
      {
        who: "villain", chain: true, floor: 4,
        beat: "Beaten.",
        end: "he is still sitting on the floor but his arms have dropped into his lap and his shoulders and ears have drooped right down in defeat under the shut lockers",
        move: "The raccoon's arms drop into his lap and his shoulders and ears droop right down as he sits under the shut lockers.",
        say: [[RACCOON, "Every single one is LOCKED!"]],
      },
      {
        who: "heroes", floor: 4,
        beat: "They hand over the key.",
        pose: "standing together in front of the row of bolted green lockers, one child holding a single brass key up between them, both looking at it",
        end: "both children have dropped the brass key into a small pocket on one of their waistcoats and have patted the pocket flat, both smiling",
        move: "The two children drop the brass key into a waistcoat pocket and pat the pocket flat, smiling.",
        say: [[EMMA, "[proud] One turn, every time."]],
      },
      {
        who: "heroes", chain: true, floor: 5,
        beat: "Out into the daylight.",
        end: "both children have turned and walked to the open doorway at the end of the row, where bright daylight is pouring in, and are standing in it looking back with big open smiles",
        move: "The two children turn and walk to the open doorway where bright daylight is pouring in, and stand in it looking back, smiling.",
        say: [[EMMA, "Lock before you leave. Week eighteen, done."]],
      },
    ],
  },

  /* ── 19 ───────────────────────────────────────────────────────────── */
  {
    w: 19,
    title: "Protecting Family: Family Firewall",
    /* The threat is the Raccoon trying to GET IN, never anything happening
     * to the family. The far bank stays warm and lit the whole way through. */
    costume: "terracotta orange bridge-keepers' coats with wide leather belts and small brass whistles on cords",
    den: DEN,
    denLight: "Deep shadows, teal and warm amber rim light.",
    world: "a stone bridge gatehouse at dusk, with a river running below and a small warm lit cottage on the far bank",
    worldLight: "Deep blue dusk over the river, warm gold from the cottage windows.",
    intro: [
      {
        who: "villain", floor: 4,
        beat: "He props a plank across the gap.",
        pose: "dragging a long wooden plank towards a gap in a low stone wall, with warm gold light showing through the gap from the other side",
        end: "he has dropped the plank right across the gap in the wall so it makes a little bridge, and is standing on the near end of it with both paws on his hips",
        move: "The raccoon drops the long plank right across the gap in the wall to make a little bridge, and plants both paws on his hips at the near end of it.",
        say: [[EMMA, "He does not only come for YOU."]],
      },
      {
        who: "villain", chain: true, floor: 5,
        beat: "He steps onto it.",
        end: "he has put one foot right out onto the middle of the plank with both arms out for balance, leaning towards the warm gold light on the far side",
        move: "The raccoon steps right out onto the middle of the plank with both arms out for balance, leaning towards the warm gold light beyond.",
        say: [[EMMA, "He comes for whoever leaves a way IN."]],
      },
      {
        who: "villain", chain: true, floor: 4,
        beat: "His gloat.",
        end: "he has turned back towards the camera from the middle of the plank and leaned in much closer, filling more of the frame, grinning widely",
        move: "The raccoon turns back towards the camera from the middle of the plank and leans in close, grinning.",
        say: [[RACCOON, "One little gap. That's ALL I need."]],
      },
      {
        who: "heroes", floor: 4,
        beat: "They raise the bridge.",
        pose: "standing either side of a big iron wheel on the gatehouse wall, both with their hands on its spokes, the stone bridge still lying flat in front of them",
        end: "both children have turned the iron wheel right round together and the near span of the stone bridge has lifted up into a tall solid wall in front of them",
        move: "The two children turn the big iron wheel right round together and the near span of the bridge lifts up into a tall solid wall in front of them.",
        say: [[EMMA, "So we close the gap for ALL of us."]],
      },
      {
        who: "heroes", chain: true, floor: 5,
        beat: "A wall of light, and the cottage safe.",
        end: "a warm golden wall of light has risen the whole width of the raised bridge in front of the two children, and the little cottage on the far bank is glowing warmly behind them",
        move: "A warm golden wall of light rises the whole width of the raised bridge in front of the two children, with the little cottage glowing warmly behind them.",
        say: [[EMMA, "This week we learn to guard the whole house."]],
      },
    ],
    outro: [
      {
        who: "villain", floor: 5,
        beat: "The plank gives way under him.",
        pose: "standing in the middle of the long plank with both arms out for balance, the plank visibly bending under him",
        end: "the plank has snapped in half and dropped away and he has landed flat on his back on the near side, with the gap in the wall now filled by solid stone",
        move: "The plank snaps in half and drops away, and the raccoon lands flat on his back on the near side, the gap in the wall now solid stone.",
        say: [[EMMA, "He looked for a way in all week."]],
      },
      {
        who: "villain", chain: true, floor: 4,
        beat: "Beaten.",
        end: "he has sat up on the floor among the broken pieces of plank, his arms hang at his sides and his shoulders and ears have drooped right down in defeat",
        move: "The raccoon sits up among the broken pieces of plank, his arms hanging and his shoulders and ears drooped right down.",
        say: [[RACCOON, "There's no gap LEFT!"]],
      },
      {
        who: "heroes", floor: 4,
        beat: "They look across at the cottage.",
        pose: "standing together on the gatehouse wall at dusk, both looking across the river at the small warm lit cottage on the far bank",
        end: "both children have lifted a hand and waved across the river at the cottage, and two more warm lights have come on in its windows",
        move: "The two children lift a hand and wave across the river at the cottage, and two more warm lights come on in its windows.",
        say: [[EMMA, "[proud] You looked after everyone, not just you."]],
      },
      {
        who: "heroes", chain: true, floor: 5,
        beat: "The whole bank lights up.",
        end: "warm golden lights have come on all along the far bank of the river behind the cottage, and both children have turned to the camera with big open smiles",
        move: "Warm golden lights come on all along the far bank behind the cottage, and the two children turn to the camera, smiling.",
        say: [[EMMA, "That is a family firewall. Week nineteen, done."]],
      },
    ],
  },

  /* ── 20 ───────────────────────────────────────────────────────────── */
  {
    w: 20,
    title: "Graduation Day: The Final Mission",
    /* The only week the Raccoon is actually beaten rather than escaping, so
     * his last shot is him handing something over rather than drooping, and
     * the heroes' world is the Academy rather than a job site. */
    costume: "deep indigo Cyber Hero dress uniforms with gold braid across the chest and short gold-lined capes",
    den: DEN,
    denLight: "Deep shadows, teal and gold rim light.",
    world: "a great academy hall with a high vaulted ceiling, tall windows, and a long curved wall set with twenty small glowing emblems",
    worldLight: "Bright gold light from the emblems against deep blue stone.",
    intro: [
      {
        who: "villain", floor: 4,
        beat: "He lays out every trick he has left.",
        pose: "standing over a heap of all his old gear piled on the floor, a mask on a stick, a tangle of thin keys, a grey blanket, a paint pot and a brass spyglass, picking one up in each paw",
        end: "he has swept the whole heap of old gear up into his arms in one big armful and is holding it all against his chest, with bits sticking out everywhere",
        move: "The raccoon sweeps the whole heap of old gear up into one big armful against his chest, with bits sticking out everywhere.",
        say: [[EMMA, "Twenty weeks. He has tried EVERYTHING."]],
      },
      {
        who: "villain", chain: true, floor: 5,
        beat: "He throws it all at the camera.",
        end: "he has hurled the whole armful of gear up into the air so it is flying apart above him, and is standing underneath with both paws empty and raised",
        move: "The raccoon hurls the whole armful of gear up into the air so it flies apart above him, and stands underneath with both paws empty and raised.",
        say: [[EMMA, "Every mask, every hook, every locked door."]],
      },
      {
        who: "villain", chain: true, floor: 4,
        beat: "His last gloat.",
        end: "he has turned to the camera and leaned in much closer, filling more of the frame, grinning widely with the old gear still falling around him",
        move: "The raccoon turns to the camera and leans in close, grinning, with the old gear still falling around him.",
        say: [[RACCOON, "One LAST trick. Watch THIS."]],
      },
      {
        who: "heroes", floor: 4,
        beat: "They stand before the wall of emblems.",
        pose: "standing together in the great academy hall facing a long curved wall set with twenty small emblems, most of them glowing gold and the last one still dark",
        end: "both children have reached up and pressed their hands onto the last dark emblem together, and it has lit up bright gold under their palms",
        move: "The two children reach up and press their hands onto the last dark emblem together, and it lights up bright gold under their palms.",
        say: [[EMMA, "And you have an answer for ALL of it."]],
      },
      {
        who: "heroes", chain: true, floor: 5,
        beat: "All twenty blaze.",
        end: "all twenty emblems along the curved wall are blazing bright gold at once and the whole hall is flooded with golden light, and both children are standing in it with big open smiles",
        move: "All twenty emblems along the wall blaze up bright gold at once and flood the whole hall with golden light, with the two children standing in it, smiling.",
        say: [[EMMA, "This week, Cyber Hero, you finish it."]],
      },
    ],
    outro: [
      {
        who: "villain", floor: 5,
        beat: "Nothing left in his paws.",
        pose: "standing in his den with both paws held out open and completely empty, the last of his old gear lying broken and dull around his feet",
        end: "he has turned both empty paws over and looked down at them, and every piece of old gear around his feet has faded from colour to dull grey",
        move: "The raccoon turns both empty paws over and looks down at them, and every piece of old gear around his feet fades from colour to dull grey.",
        say: [[EMMA, "He has run out of tricks."]],
      },
      {
        who: "villain", chain: true, floor: 4,
        beat: "He gives it up.",
        end: "he has pulled his hood right back off his head for the first time, and is holding it in both paws down in front of him with his ears flat and his head lowered",
        move: "The raccoon pulls his hood right back off his head for the first time and holds it in both paws in front of him, ears flat and head lowered.",
        say: [[RACCOON, "All right. You WIN."]],
      },
      {
        who: "heroes", floor: 4,
        beat: "They take the badge.",
        pose: "standing side by side in the golden academy hall, both holding the edges of a single large gold badge between them at chest height",
        end: "both children have pinned the large gold badge onto the chest of the uniform between them and have taken their hands away, and it is shining in the golden light",
        move: "The two children pin the large gold badge onto the uniform between them and take their hands away, and it shines in the golden light.",
        say: [[EMMA, "[proud] Twenty weeks. You did every one."]],
      },
      {
        who: "heroes", chain: true, floor: 5,
        beat: "Capes out, hall blazing.",
        end: "both children have turned to face the camera square on with their gold-lined capes swept out behind them and their chins up, the whole hall blazing gold around them, with big open smiles",
        move: "The two children turn square to the camera with their gold-lined capes sweeping out behind them and their chins up, the whole hall blazing gold.",
        say: [[EMMA, "You are a Cyber Hero. Week twenty, done."]],
      },
    ],
  },
];
