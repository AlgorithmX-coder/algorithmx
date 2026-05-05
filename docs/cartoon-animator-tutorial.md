# Cartoon Animator 5 — workflow for AlgorithmX

Step-by-step guide to taking Adam (or any of your OpenArt PNGs) from
"static image" to "animated character that drops into the lesson."

You operate Cartoon Animator 5; I integrate whatever it spits out.

---

## Before you buy — the free sanity check

Spend 10 minutes on this BEFORE paying $129.

1. Visit https://sketch.metademolab.com (Meta's Animated Drawings, free)
2. Click "Get Started" → upload Adam's PNG
3. The tool tries to auto-detect the character outline. It's not perfect — adjust the bounding box if it cuts off Adam's head/feet.
4. Confirm joints (head, hands, feet, knees) are placed correctly. Drag any wonky ones.
5. Pick a stock motion (wave, dance, jump) and watch it play.

**If Adam looks recognizable + moves cleanly** → Cartoon Animator 5 will work. Buy it.

**If Adam's outline gets butchered or limbs warp horribly** → your character art might be too stylized for auto-rigging. Switch to Path C (AI video) or simplify Adam's PNG first (e.g. flatten poses, remove busy backgrounds).

---

## Buy + install (15 min)

1. https://www.reallusion.com/cartoon-animator/ — buy **Standard edition $99** OR **Pro edition $129** (Pro adds Spine export, which is what we want for cleanest integration). Pro is the right pick.
2. Download installer → install.
3. First launch — sign in with the account you bought with.
4. Watch their **5-minute Quick Start video** (linked from the welcome screen). It shows the core workflow.

---

## Rig your first character — Adam (~30 min)

This is the longest single step. Subsequent characters are 10 min each.

### 1. Prep Adam's PNG

Cartoon Animator works best when:
- The character is on a transparent background (no checker pattern, true alpha)
- The character is full-body (head to feet visible) OR upper-body (head to waist) — pick one and stick with it across all four characters
- The character is facing forward (3/4 view also works, profile is harder)

If Adam's existing OpenArt PNG has a background, remove it:
- https://www.remove.bg (free for one image at a time)
- Or use Photopea (free Photoshop clone in browser)

Save the cleaned PNG as `adam-base.png`.

### 2. Import into Cartoon Animator

- File → New → 1080×1080 stage size (matches our component sizing)
- Drag `adam-base.png` into the stage
- It lands as a single static "Free-Form Object"

### 3. Run AI Auto-Rig

CA5 calls this the **Smart IK** or **Auto-Pose** feature depending on version:

- Right-click the imported character → "Convert to Free Bone Actor" (older versions) OR "AI Auto-Rig" (CA5+)
- Select the rig type: **G3 Free Bone** (most flexible for AI-generated characters)
- The tool detects head/torso/limbs and adds bones automatically
- A skeleton overlay appears on Adam

### 4. Fix any wonky bones

The AI usually gets ~80% right. Common fixes:
- Knees / elbows in the wrong place → click the joint, drag to actual joint location
- Hands too high / low → drag wrist joints
- Head separation line — make sure the head is one segment, not split across forehead

Spend ~10 minutes here. Don't perfect it; "good enough" is enough.

### 5. Apply a motion

Right panel → **Content Manager** → **Motion** library:
- Free starter motions are included (Idle, Wave, Excited, etc.)
- Drag "Idle Loop" onto Adam → he starts breathing/swaying
- The timeline at the bottom now shows the animation

### 6. Tweak the motion

- Drag the timeline scrubber to preview different frames
- If Adam's head twitches weirdly, it's usually a bone-anchor issue from step 4 — go fix the bones, motion replays cleanly

### 7. Export as image sequence (sprite sheet)

This is the format we'll integrate first. Spine export comes later if you want.

- File → Export → **Image Sequence**
- Settings:
  - Format: **PNG**
  - Background: **Transparent**
  - Range: **Full animation**
  - FPS: **24**
  - Resolution: 50% of project size (saves bundle weight)
- Save destination: a temporary folder
- Click Export

You now have ~24-72 numbered PNGs (one per frame).

### 8. Composite into a single sprite sheet

CA5 might offer "Single Sprite Sheet" export option. If so, use that.

If not, use a free tool to combine the PNG sequence into one strip:

- **TexturePacker Free** (https://www.codeandweb.com/texturepacker) — drag PNGs in, export as single PNG
- OR **Photopea online** — open all PNGs as layers, arrange in a horizontal strip, export

Settings:
- All frames in **one horizontal row** (simpler for our component)
- Tight packing (no gaps between frames)
- Export as PNG with transparency

Save final file as `public/sprites/adam-idle.png` in your repo.

### 9. Tell me the metadata

After step 8 you have:
- One PNG file in the right place
- Two numbers: **frame width** (the width of one Adam) and **frame count** (how many frames)

Tell me both. I update `lib/lottie-manifest.ts` to:

```ts
export const SPRITE_CHARACTERS = {
  adam: {
    idle: {
      src: "/sprites/adam-idle.png",
      frameWidth: 400,    // ← whatever you measured
      frameHeight: 500,   // ← whatever you measured
      frameCount: 24,     // ← number of frames
      fps: 24,
    },
  },
  // ...
};
```

The lesson player picks it up immediately.

---

## Add more motions to Adam (5 min each)

Once Adam is rigged, adding new motions is fast:

1. Same file in CA5 (Adam still rigged from before)
2. Drag a different motion from the library — "Talking," "Excited," "Worried," etc.
3. Export image sequence (step 7-8 above)
4. Save with name matching state: `adam-talk.png`, `adam-excited.png`, `adam-worried.png`
5. Tell me the metadata for each → I add them to manifest

You don't re-rig. The same skeleton drives every motion.

---

## Repeat for Layla, Robo, Raccoon

Each takes ~20 min total once you've done Adam (you've seen the workflow now):
- Prep PNG (transparent bg)
- Import
- Auto-rig
- Apply motions
- Export

Total time for all four characters × ~3 motions each: **~6 hours of GUI work** spread over 2-3 evenings.

---

## Motion library — what to grab from Reallusion's store

CA5 Pro comes with starter motions but the good stuff is in their content store:

- **Boy Cartoon Series Motion Pack** — ~$30, has wave, jump, talk, excited, worried, etc. Designed for kid characters.
- **Girl Cartoon Series Motion Pack** — same idea for Layla.
- **Skull / Villain Motion Pack** — for the Raccoon's taunt/defeated states.

Total motion-pack budget: ~$60-90 if you want fully custom motions. Or stick with the free starter set and accept fewer variations.

---

## When Auto-Rig fails

If CA5's AI can't rig your character (some stylized art breaks it):

**Option A** — manual bone placement. Right-click character → "Add Bones Manually." Place head/torso/upper-arm/lower-arm/hand/upper-leg/lower-leg/foot bones one by one. ~20 min per character but always works.

**Option B** — split the character into parts in Photopea (head as separate PNG, torso, arms, legs) and import each part separately. CA5 then rigs them as a multi-part actor. More work, more control.

Send me a screenshot of the failed rig if you get stuck — I'll diagnose and tell you which path to take.

---

## Once a character is in the repo

I do these on my end:

1. Update `SPRITE_CHARACTERS` manifest with the metadata
2. Replace static PNG references in lesson cases (e.g., the Mission Brief portraits) with `<SpriteCharacter>` calls
3. Wire excited/worried states to fire on correct/wrong answers automatically
4. Test on dev, screenshot to you, iterate

You don't touch any code. You just send PNG sprite sheets + 3 numbers per motion.

---

## Realistic timeline

- **Tonight (10 min)**: Animated Drawings sanity check
- **This week (1-2 evenings)**: buy CA5, install, rig + export Adam idle. Drop in repo. See it move on screen.
- **Next week (2-3 evenings)**: Layla, Robo, Raccoon — all base idle states.
- **Following week**: excited / worried / talk states for the ones that need them.
- **Total**: ~10-15 hours of GUI work spread over 2 weeks for full character coverage.
