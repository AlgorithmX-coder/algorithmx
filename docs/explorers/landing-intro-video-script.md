# Cyber Explorers — Landing Intro Video (Marketing Cut)

**Purpose:** the video that autoplays in the `/cyberexplorers` hero for a **cold visitor** — a parent (the buyer) or a child (the demand). Not the in-fiction recruitment scene; this one has to *sell*.

## Strategy in one line
**Scare the parent a little, then make the kid want it.** The parent justifies the £99; the kid pesters for it. So the voice-over talks to the **parent** ("your kid"), while the **on-screen footage** talks to the kid (real gameplay that looks like a game they'd beg to play).

## Spec
| | |
|---|---|
| Length | **60s** (a 30s cut is trivial to pull from this — beats marked ✂) |
| Aspect | 16:10, sits in the terminal frame; also export a 9:16 for socials later |
| Autoplay | muted-first, **captions burned in** (most people watch the hero muted) |
| Voice | **WREN** (the handler) — cool for the kid, authoritative for the parent |
| Music | tense → triumphant hacker score (ElevenLabs) |
| Tone | hacker-thriller, terminal green/neon, matches the matrix-terminal identity |

## Shot list

### ACT 1 — THE HOOK · parent's fear (0–8s) ✂
| # | Time | Visual | On-screen | WREN VO | Audio |
|---|---|---|---|---|---|
| 1 | 0–3s | Close on a kid's phone on a bedside table, dark room. A message slides in: *"Hi love, lost my card — can you send me the code that just came? x Mum"* | `03:14` | "This is the message that gets your kid. It looks like it came from you." | notification chime, low bass |
| 2 | 3–8s | Thumb hovers over **Reply**. Freeze. Glitch to black. | (glitch) | "By the time you'd find out, it's already done." | glitch swell |

> **Optional stat card here** — only if we can source it. Do **not** invent a number (legal risk, per the sourced-stats rule). Safe fallback = keep it a scenario, no stat.

### ACT 2 — THE TURN · promise (8–16s)
| # | Time | Visual | On-screen | WREN VO | Audio |
|---|---|---|---|---|---|
| 3 | 8–12s | Hard cut to black terminal. Cursor types `> initialize: CYBER EXPLORERS`. Wordmark ignites, matrix rain behind. | `> initialize: CYBER EXPLORERS` | "You can't be there every time. So we trained the one person who always is." | keystrokes, ignite |
| 4 | 12–16s | Tagline resolves over the mission map. | **Raise a kid scammers can't fool.** | "Them." | beat drop |

### ACT 3 — THE PRODUCT · the kid hook + proof it's real · REAL APP FOOTAGE (16–42s) ✂(16–30 only)
| # | Time | Visual | On-screen | WREN VO | Audio |
|---|---|---|---|---|---|
| 5 | 16–22s | Screen-capture: `/explorers` matrix-terminal mission map, push in on Case 01 | **20 missions. One spy thriller.** | "It's not a lecture. It's a spy thriller they actually want to play." | UI ticks |
| 6 | 22–30s | Fast cuts of real gameplay: inspecting a phishing email (fake domain highlights), a password-crack minigame, closing a case | `SPOT THE PHISH` / `CRACK THE CODE` / `CATCH THE LIAR` | "Real attacks — phishing, deepfakes, password cracking — become skills they own for life." | rapid cuts |
| 7 | 30–38s | A boss beat: the attacker taunts, kid wins, **CLEARANCE** bar fills, badge unlocks | `LEVEL UP` | "Every case they close, they level up — for real." | victory sting |
| 8 | 38–42s | Micro-montage of different villains/cases across weeks (shows depth) | **20 weeks · 6 threat actors** | "One operative, in training." | rising |

### ACT 4 — THE PROOF · parent trust (42–52s)
| # | Time | Visual | On-screen | WREN VO | Audio |
|---|---|---|---|---|---|
| 9 | 42–52s | Clean credential card over faded rain; badges tick in | ✓ Built to the ICO Children's Code · ✓ From the team behind Cyber Heroes · ✓ No ads, no loot boxes · ✓ Sessions end on purpose | "Built by the team behind Cyber Heroes. Aligned to the ICO Children's Code. No ads, no loot boxes — and every session ends on purpose." | calm confidence |

### ACT 5 — CTA (52–60s) ✂
| # | Time | Visual | On-screen | WREN VO | Audio |
|---|---|---|---|---|---|
| 10 | 52–60s | Wordmark + price + button; matrix rain settles | **CYBER EXPLORERS · £99 lifetime · Start their first case today** | "Cyber Explorers. Ninety-nine pounds, lifetime access. Start their first case today." | synth resolve |

## Production plan (how each shot gets made)
- **Cinematic (AI):** shots 1–2 — OpenArt image→video (the phone/message scene). The only "shot" footage.
- **Real app capture:** shots 5–8 — recorded from the live build (the map, a phishing inspect, a boss, badges). This is the meat and the strongest converter.
- **Motion graphics:** shots 3–4, 9–10 — terminal, wordmark, credential card, CTA — built as HTML/canvas and screen-captured, so they're pixel-matched to the site.
- **VO:** WREN via ElevenLabs (confirm/lock the voice first).
- **Music + SFX:** ElevenLabs. **Captions:** burned in.
- **Assembly:** ffmpeg.

## 30-second cut
Shots 1 → 3/4 (compressed) → 5–6 → 10. Same message, hook + product + CTA.

## Open decisions before production
1. **Stat in Act 1?** yes-with-a-real-source, or no (scenario only). Recommend: no, unless we source one.
2. **WREN voice** — confirm the locked voice / quick audition.
3. **60s only, or 60s + 30s + 9:16 social** cuts.
