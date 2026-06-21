# Cyber Heroes — Image Asset Log

The complete list of generated images, the **style** each should use, and the **exact save path**. This is also the manifest the generator script (`scripts/openart-generate.mjs`) reads.

Paths are relative to project root; anything under `public/` serves at the matching URL (`public/cyberheroes/alerts/week-01.png` → `/cyberheroes/alerts/week-01.png`).

- **DROP-IN** = same path as an existing asset, so swapping the file upgrades the product with **no code change**.
- **NEW SLOT** = needs a one-line `src`/`background` wire-up after the file lands (I'll do that pass).

## Style system (match style to job — this is what keeps it premium, not busy)
- **3D render** → the villain + climax only (Hacker Raccoon, boss arena). Gives menace/weight.
- **2D Pixar cutout, transparent bg** → UI avatars + characters that sit inside existing frames (HUD, portraits, celebration sidekicks, card emblems).
- **Full scene illustration, 2D Pixar** → backgrounds (per-week alerts, optional Learn/HQ backdrops).

## House style (every asset)
- **Keep the locked character designs** — reuse the Adam, Layla and Hacker Raccoon look from the OpenArt characters. Reference renders: `public/characters/adam.png`, `layla.png`, `raccoon.png`. Don't redesign faces.
- **Tone (ages 6–9):** show the threat but stay **empowering, never frightening.** Raccoon is sneaky/silly, not scary.
- **Format:** PNG. Cutouts/avatars = **transparent** background. Scenes/backgrounds = full illustration.

---

## 1 · Character cutouts — *2D Pixar, transparent*

| What | Save as | Spec | Status |
|---|---|---|---|
| Adam head/shoulders | `public/game/characters/adam-head.png` | 512², transparent, forward, friendly | NEW SLOT (HUD + Mission Brief) |
| Layla head/shoulders | `public/game/characters/layla-head.png` | 512², transparent, forward, friendly | NEW SLOT (HUD + Mission Brief) |
| Raccoon head | `public/game/characters/raccoon-head.png` | 256², transparent, sneaky grin | NEW SLOT (dashboard "Raccoon Power" hex, boss HUD) |
| Adam celebrating | `public/cyberheroes/characters/adam-cheer.png` | ~700×900, transparent, knee-up cheer | NEW SLOT (Sticker Unlock, left) |
| Layla celebrating | `public/cyberheroes/characters/layla-cheer.png` | ~700×900, transparent, knee-up cheer | NEW SLOT (Sticker Unlock, right) |
| Adam + Layla duo | `public/cyberheroes/characters/adam-layla-duo.png` | ~900×600, transparent, side-by-side friendly | NEW SLOT (hub/product/track-card emblem, parent empty-state) |

## 2 · Villain — *3D render, transparent*

| What | Save as | Spec | Status |
|---|---|---|---|
| Raccoon — idle/menacing | `public/game/characters/raccoon-idle.png` | ~1024², transparent, facing left | **DROP-IN** (upgrades boss sprite) |
| Raccoon — attack | `public/game/characters/raccoon-attack.png` | ~1024², transparent, lunge | **DROP-IN** |
| Raccoon — hurt | `public/game/characters/raccoon-hurt.png` | ~1024², transparent, recoil | **DROP-IN** |
| Raccoon — taunt | `public/game/characters/raccoon-taunt.png` | ~1024², transparent, mocking | **DROP-IN** |
| Raccoon — defeated | `public/game/characters/raccoon-defeated.png` | ~1024², transparent, collapsed | **DROP-IN** |
| Raccoon — villain pose | `public/cyberheroes/characters/raccoon-villain.png` | ~600², transparent, upper-body menacing | NEW SLOT (replaces 🦝 emoji on the "Alert Incoming" card) |

## 3 · Scene backgrounds — *2D Pixar full illustration*

| What | Save as | Spec | Status |
|---|---|---|---|
| Boss arena | `public/game/backgrounds/cyber-classroom.png` | 1920×1080, futuristic cyber-lab, neon + data streams, calm centre | **DROP-IN** (upgrades flat boss bg) |
| Learn command-center *(optional)* | `public/cyberheroes/scenes/learn-command-center.png` | 16:9 ~1920×1080, desk/window/books, **calm centre** for the text frame | NEW SLOT (`InfoScene` `background`) |
| Cyber HQ — week complete *(optional)* | `public/cyberheroes/scenes/cyber-hq.png` | 16:9 ~1920×1080, Adam & Layla in HQ, badge on a pedestal | NEW SLOT (Completion backdrop) |

### 3a · Per-week "Alert Incoming" intro photos — *2D Pixar scene, 4:3 (~1200×900)*
Feature Adam and/or Layla reacting + the Raccoon where it fits. Topic-relevant, still upbeat. *(Wiring: per-week `photoSrc` on the Alert card — I'll add that intro beat to the DynamicLesson flow when week-01 lands.)*

| Wk | Topic | Save as | Image concept |
|---|---|---|---|
| 1 | Passwords | `public/cyberheroes/alerts/week-01.png` | Broken padlock on their device; Raccoon yanking a glowing "PASSWORD" key away |
| 2 | Private Info | `public/cyberheroes/alerts/week-02.png` | Raccoon peeking at an "About Me" form spilling name / address / school |
| 3 | Stranger Danger | `public/cyberheroes/alerts/week-03.png` | A smiley profile pic with the Raccoon hiding behind the mask, reaching through the screen |
| 4 | Scams & Tricks | `public/cyberheroes/alerts/week-04.png` | A flashy "YOU WON!" popup; Raccoon dangling a too-good-to-be-true golden prize |
| 5 | Cyberbullying | `public/cyberheroes/alerts/week-05.png` | Mean message bubbles raining down; one kid sad, the other steps in to help (gentle) |
| 6 | Gaming Safety | `public/cyberheroes/alerts/week-06.png` | A game chat; Raccoon as a fake player offering a "free skin" to lure them off-platform |
| 7 | In-Game Spending | `public/cyberheroes/alerts/week-07.png` | A loot box + coins; Raccoon at a slot machine flashing "FREE V-BUCKS" |
| 8 | Photos & Videos | `public/cyberheroes/alerts/week-08.png` | A photo escaping into the wild; Raccoon grabbing one showing a school uniform / street sign |
| 9 | Apps & Downloads | `public/cyberheroes/alerts/week-09.png` | A copycat app icon; Raccoon offering a "FREE download" with sneaky camera/mic permission icons |
| 10 | YouTube & Videos | `public/cyberheroes/alerts/week-10.png` | An autoplay rabbit-hole of thumbnails swirling down; Raccoon tugging them in |
| 11 | Emergency Protocol | `public/cyberheroes/alerts/week-11.png` | A big red BLOCK/REPORT button + a trusted grown-up's hand; a kid screenshotting as the Raccoon retreats |
| 12 | Digital Footprint | `public/cyberheroes/alerts/week-12.png` | Glowing footprints across the internet; Raccoon following the trail |
| 13 | Screen Time | `public/cyberheroes/alerts/week-13.png` | Clock + moon, tired eyes, a screen-vs-play balance scale; a kid gently powering off |
| 14 | Smart Devices | `public/cyberheroes/alerts/week-14.png` | Smart speaker / TV / watch / doorbell with listening ears + eyes; Raccoon hiding in the speaker |
| 15 | AI & Chatbots | `public/cyberheroes/alerts/week-15.png` | A friendly-but-fake robot chatbot; Raccoon puppeteering it, a "confidently wrong" speech bubble |
| 16 | QR Codes & Links | `public/cyberheroes/alerts/week-16.png` | A QR code as a glowing doorway; Raccoon slapping a fake QR sticker over a real one |
| 17 | Social Media | `public/cyberheroes/alerts/week-17.png` | A phone feed with a "13+" gate and follower counts; Raccoon as a fake follower |
| 18 | Sharing Devices | `public/cyberheroes/alerts/week-18.png` | A shared family tablet still "logged in"; Raccoon sneaking onto the un-logged-out device |
| 19 | Protecting Family | `public/cyberheroes/alerts/week-19.png` | Adam & Layla as the experts helping grown-ups spot a scam; the family foiling the Raccoon |
| 20 | Graduation | `public/cyberheroes/alerts/week-20.png` | Adam & Layla in hero capes with a Cyber Hero certificate/trophy; Raccoon defeated; celebratory |

---

## Wiring map (the fast-follow once files land)
| Asset | File to wire |
|---|---|
| `adam-head.png` / `layla-head.png` | `app/components/LessonHUD.tsx`, `app/components/game/MissionBriefScene.tsx` |
| `raccoon-head.png` | `app/dashboard/DashboardView.tsx` (Raccoon Power), `app/components/game/BossBattle.tsx` (HUD) |
| `adam-cheer.png` / `layla-cheer.png` | `app/components/lesson/StickerUnlock.tsx` |
| `adam-layla-duo.png` | `app/components/hub/ProductCard.tsx` / `HubTrackCard.tsx`, `app/parent/ParentView.tsx` |
| `raccoon-villain.png` | `app/components/game/WelcomeScene.tsx` (replaces 🦝) |
| `raccoon-*.png`, `cyber-classroom.png` | **none — drop-in** |
| `learn-command-center.png` | `app/components/lesson/InfoScene.tsx` (`background`) |
| `week-NN.png` | `WelcomeScene` `photoSrc` (+ add the intro beat to `DynamicLesson`) |

## Already exists — reuse, don't recreate
- `public/characters/` — adam, layla, raccoon + adam-layla-happy/-hacked/-raccoon, heroic, celebrating, graduation, waving, raccoon-sneaking/-defeated.
- `public/game/characters/` — full Adam/Layla sprite sets (idle, attack, hurt, celebrate, select, …) — **keep** (already solid; only the Raccoon set gets the 3D upgrade).
