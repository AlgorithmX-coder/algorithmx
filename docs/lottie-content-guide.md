# Lottie content acquisition guide

How to populate `app/lib/lottie-manifest.ts` with real animations and
get the lesson player feeling alive - without commissioning a single
custom animator.

## The pipeline

```
┌─────────────────┐      ┌──────────────────┐      ┌────────────────┐
│   LottieFiles   │ ──→  │ /public/lottie/  │ ──→  │  lesson-player │
│   (download)    │      │  (drop file in)  │      │  (just works)  │
└─────────────────┘      └──────────────────┘      └────────────────┘
                              ▲
                              │ register path in
                              │ lib/lottie-manifest.ts
```

You buy and download. I integrate. The manifest is the only file
that needs editing per new asset.

## Subscriptions to start

| What | URL | Cost | Why |
|---|---|---|---|
| **LottieFiles Pro** | https://lottiefiles.com/pricing | $19.99/mo | Required for commercial use of marketplace animations. Cancel after launch if you stop adding new content. |
| **Envato Elements** (optional) | https://elements.envato.com | $16.50/mo | Massive stock library - sound FX, BGM, video clips, plus some Lottie animations. Useful for the next round (audio). |

That's it. ~$36/mo for everything you'd otherwise commission for thousands.

## What to download - exact search terms that work

Search LottieFiles with these queries. Filter by "Free for commercial use"
once subscribed. Pick the one that visually matches the cyber palette
(cyan / cosmic violet / pink / gold) - most hits will be customisable.

### Tier 1 - must-haves for first deploy (replaces existing canvas-confetti)

| Manifest key | Search query | Save as | Used by |
|---|---|---|---|
| `correct` | `confetti star celebration` or `success burst` | `/public/lottie/correct.lottie` | Every correct answer |
| `correctBig` | `fireworks celebration` or `confetti explosion` | `/public/lottie/correct-big.lottie` | High streak (5+) |
| `wrong` | `wrong answer x mark` or `error shake` | `/public/lottie/wrong.lottie` | Wrong answer |
| `badge` | `trophy unlock` or `medal celebration` | `/public/lottie/badge.lottie` | Milestone/badge earned |

These four alone replace 70% of the canvas-confetti effects firing across the lesson. Drop them in, set the manifest paths, ~2 hours of integration work from me.

### Tier 2 - character life (lifts the whole player)

| Manifest key | Search query | Notes |
|---|---|---|
| `LOTTIE_CHARACTERS.adam.idle` | `kid waving boy` or `child idle loop` | Used as Adam's "alive" loop in mission brief, between cases. Replaces the static PNG with `animate={{y:[0,-8,0]}}` fake-breathing. |
| `LOTTIE_CHARACTERS.adam.excited` | `happy kid jump` or `excited child` | Plays when Adam reacts to a correct answer. |
| `LOTTIE_CHARACTERS.adam.worried` | `worried child` or `confused kid` | Plays on wrong answers. |
| `LOTTIE_CHARACTERS.layla.idle` | `girl waving` or `child girl idle` | Layla's alive loop. |
| `LOTTIE_CHARACTERS.layla.excited` | `happy girl child` | |
| `LOTTIE_CHARACTERS.raccoon.taunt` | `raccoon laughing` or `cartoon villain taunt` | Used in boss battle. |
| `LOTTIE_CHARACTERS.raccoon.defeated` | `defeated character` or `cartoon villain spinning fall` | Boss done. |

Heads-up: stock Lottie kids may not look exactly like Adam/Layla as drawn. Two options:
1. **Accept** they're new characters and treat existing PNGs as decorative.
2. **Composite** the Lottie character idle / talk over the existing PNG silhouette using opacity blend modes - ugly hack, sometimes works.

For Week 1 launch, option 1 is more honest. Long-term you commission custom Lotties that match your character art.

### Tier 3 - atmospheric / decorative

| Manifest key | Search query |
|---|---|
| `LOTTIE_DECORATIVE.cosmicAmbience` | `space stars loop` or `cosmic background` |
| `LOTTIE_DECORATIVE.sparkleField` | `sparkle dust loop` |
| `LOTTIE_DECORATIVE.graduation` | `graduation cap` or `diploma celebration` |

Tier 3 is "nice to have." Skip until launch is closer.

## Filename + filetype rules

- **Format**: pick `.lottie` (binary, ~70% smaller) over `.json`. The wrapper accepts both, but smaller bundles mean faster load on mobile.
- **Filename**: use kebab-case, no spaces (e.g. `correct-big.lottie`, `adam-idle.lottie`). The manifest paths are case-sensitive on Linux deploys.
- **Size**: aim for under 200KB per file. Anything bigger, look for an alternative or simplify.
- **Per scene budget**: ~5–10 Lotties on screen simultaneously is fine. More than that on a mid-range Android tablet starts to chug.

## Getting it working - ordered steps

1. Subscribe to LottieFiles Pro.
2. Search and download the four Tier 1 animations to your local Downloads.
3. Move them into the repo at `public/lottie/correct.lottie`, `correct-big.lottie`, `wrong.lottie`, `badge.lottie`.
4. Open `app/lib/lottie-manifest.ts` and set:
   ```ts
   export const LOTTIE_OVERLAYS = {
     correct: "/lottie/correct.lottie",
     correctBig: "/lottie/correct-big.lottie",
     wrong: "/lottie/wrong.lottie",
     badge: "/lottie/badge.lottie",
   };
   ```
5. Commit + push (or run dev locally).
6. Play through any lesson - every correct answer now triggers a real animator's celebration instead of CSS particles. **You'll feel the difference immediately.**
7. Iterate on Tier 2 + Tier 3 over the following days as you find ones you like.

## Customising without an animator

LottieFiles' web editor (free) lets you:
- Recolour any element (great for matching the cyber palette).
- Speed up / slow down.
- Trim length.
- Strip parts of the animation you don't need.

So if you find a celebration you love but it's pink/orange, you can swap it to cyan/cosmic-violet in their editor, then export. Five-minute job per asset.

## When you're ready for custom

If after a month you want bespoke character animations matching Adam/Layla's existing art, the next step is:

- Hire a Lottie animator on Toptal/Upwork (£300–600 per character × 4 = £1200–2400 total).
- They take your PNG art as reference, deliver custom Lotties.
- Drop into the same `/public/lottie/` directory, update the manifest, ship.

But that's a "post-launch" decision. Tier 1 + Tier 2 from stock is enough to ship a £99 product that doesn't feel AI-generated.
