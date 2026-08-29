/**
 * Per-week VISUAL THEME ("world") — an optional re-skin layer that gives a week
 * its own palette/background/backdrop WITHOUT touching the learning flow or the
 * exercise logic. Same per-week-map pattern as weekIntros.ts.
 *
 * KEY RULE: a week with NO entry here renders EXACTLY as before (theme = null →
 * every component keeps its current hardcoded cosmic look). Only weeks listed
 * below are re-skinned, so this is safe to roll out one week at a time.
 *
 * A theme only ever changes NEUTRAL chrome — deep background, stage gradient,
 * exercise-card background, 3D-backdrop lights, ambience glows, HUD accent. It
 * must NEVER change semantic colours (green = correct, red = wrong, gold =
 * reward); those stay hardcoded in the exercises so feedback keeps its meaning.
 */

export interface WeekTheme {
  /** Page-root colour behind the whole lesson. */
  deepBg: string;
  /** LessonStage background (overrides the per-screen gradients for this week). */
  bgGradient: string;
  /** LessonStage decorative glow blob. */
  glow: string;
  /** Exercise-card background (ExerciseFrame) for this week. */
  frameBg: string;
  /** Accent hex used by chrome (HUD, frame decor, glows). */
  accent: string;
  /** Accent as "r,g,b" for rgba() tints. */
  accentRGB: string;
  /** 3D backdrop (LessonArena3D) light colours for the calm "normal" mood. */
  arena: {
    ambient: string;
    key: string;
    spot: string;
    fill: string;
    /** Drifting-code particle colours (hex numbers). */
    particles: number[];
  };
  /** LessonAmbience corner-glow colours (rgba strings), 4 entries. */
  ambienceGlows: string[];
}

export const WEEK_THEMES: Record<number, WeekTheme> = {
  // ─── Week 1 · Passwords → "THE VAULT" ───────────────────────────────────
  // A secure-facility world: brushed graphite steel lit by warm brass-gold
  // vault lamps — heavy, safe, and metallic instead of cosmic.
  1: {
    deepBg: "#0a0c10",
    bgGradient: "linear-gradient(180deg, #171c26 0%, #232a38 52%, #0c0f15 100%)",
    glow: "radial-gradient(circle, rgba(227,179,65,0.36), transparent 70%)",
    frameBg: "linear-gradient(180deg, #1c222e 0%, #131820 60%, #0e1219 100%)",
    accent: "#e3b341",
    accentRGB: "227,179,65",
    arena: {
      ambient: "#8a94a8",
      key: "#ffd97a",
      spot: "#b8c4d8",
      fill: "#e3b341",
      particles: [0xe3b341, 0x8fa3c0, 0xffd97a, 0x5c6c85],
    },
    ambienceGlows: [
      "rgba(227,179,65,0.42)",
      "rgba(143,163,192,0.34)",
      "rgba(255,217,122,0.28)",
      "rgba(92,108,133,0.4)",
    ],
  },

  // ─── Week 2 · Private Info → "THE SAFEHOUSE" ────────────────────────────
  // A locked hideout deep underwater-teal, with soft violet security light
  // seeping through the shutters — hushed, hidden, and calm.
  2: {
    deepBg: "#041518",
    bgGradient: "linear-gradient(180deg, #062b30 0%, #0b3f46 52%, #041a1e 100%)",
    glow: "radial-gradient(circle, rgba(157,123,255,0.38), transparent 70%)",
    frameBg: "linear-gradient(180deg, #0a343a 0%, #072428 60%, #051b1f 100%)",
    accent: "#9d7bff",
    accentRGB: "157,123,255",
    arena: {
      ambient: "#3a8a8f",
      key: "#b79bff",
      spot: "#2dd4bf",
      fill: "#9d7bff",
      particles: [0x9d7bff, 0x2dd4bf, 0x67e8f9, 0x7c5cff],
    },
    ambienceGlows: [
      "rgba(157,123,255,0.44)",
      "rgba(45,212,191,0.36)",
      "rgba(103,232,249,0.28)",
      "rgba(124,92,255,0.38)",
    ],
  },

  // ─── Week 3 · Stranger Danger → "MASQUERADE STREET" ─────────────────────
  // A moody night street of deep indigo, hung with warm amber lanterns —
  // beautiful but shadowy, where every face might be a mask.
  3: {
    deepBg: "#0a0920",
    bgGradient: "linear-gradient(180deg, #141234 0%, #1e1a4a 52%, #0c0a24 100%)",
    glow: "radial-gradient(circle, rgba(245,166,35,0.36), transparent 70%)",
    frameBg: "linear-gradient(180deg, #1b1840 0%, #12102e 60%, #0d0b22 100%)",
    accent: "#f5a623",
    accentRGB: "245,166,35",
    arena: {
      ambient: "#5c55b8",
      key: "#ffc55e",
      spot: "#8d84e8",
      fill: "#f5a623",
      particles: [0xf5a623, 0x8d84e8, 0xffd58a, 0x4c46a8],
    },
    ambienceGlows: [
      "rgba(245,166,35,0.42)",
      "rgba(141,132,232,0.38)",
      "rgba(255,213,138,0.28)",
      "rgba(76,70,168,0.42)",
    ],
  },

  // ─── Week 4 · Scams & Tricks → "CARNIVAL OF FAKES" ──────────────────────
  // A garish funfair after dark: hot magenta-maroon tents strung with golden
  // bulbs and fuchsia neon — dazzling on purpose, and not to be trusted.
  4: {
    deepBg: "#1c0418",
    bgGradient: "linear-gradient(180deg, #33082b 0%, #4a0c3e 52%, #1e0519 100%)",
    glow: "radial-gradient(circle, rgba(232,77,255,0.4), transparent 70%)",
    frameBg: "linear-gradient(180deg, #3c0a33 0%, #260721 60%, #1c0518 100%)",
    accent: "#e84dff",
    accentRGB: "232,77,255",
    arena: {
      ambient: "#c058d8",
      key: "#ffd166",
      spot: "#e84dff",
      fill: "#ff4fa8",
      particles: [0xe84dff, 0xffd166, 0xff4fa8, 0x9b2ee6],
    },
    ambienceGlows: [
      "rgba(232,77,255,0.44)",
      "rgba(255,209,102,0.3)",
      "rgba(255,79,168,0.34)",
      "rgba(155,46,230,0.4)",
    ],
  },

  // ─── Week 5 · Cyberbullying → "WARM CAMPFIRE" ───────────────────────────
  // A kind, gentle clearing at night: mossy forest greens around a soft
  // coral firelight — the safest-feeling world in the course.
  5: {
    deepBg: "#0c1410",
    bgGradient: "linear-gradient(180deg, #14251c 0%, #1d3326 52%, #0d1812 100%)",
    glow: "radial-gradient(circle, rgba(255,142,110,0.38), transparent 70%)",
    frameBg: "linear-gradient(180deg, #1a2e22 0%, #12241a 60%, #0d1a13 100%)",
    accent: "#ff8e6e",
    accentRGB: "255,142,110",
    arena: {
      ambient: "#4a7d5f",
      key: "#ffb08a",
      spot: "#7fc79b",
      fill: "#ff8e6e",
      particles: [0xff8e6e, 0xffc49b, 0x7fc79b, 0x4a7d5f],
    },
    ambienceGlows: [
      "rgba(255,142,110,0.4)",
      "rgba(127,199,155,0.3)",
      "rgba(255,196,155,0.3)",
      "rgba(74,125,95,0.38)",
    ],
  },

  // ─── Week 6 · Gaming Safety → "NEON ARCADE" ─────────────────────────────
  // A bright retro-arcade world: hot-pink + cyan neon over deep violet, a
  // hard contrast with the default cool cosmic look — the prototype week.
  6: {
    deepBg: "#0b0420",
    bgGradient: "linear-gradient(180deg, #1c0838 0%, #2c0b52 52%, #100522 100%)",
    glow: "radial-gradient(circle, rgba(255,60,180,0.42), transparent 70%)",
    frameBg: "linear-gradient(180deg, #2a0f4d 0%, #1a0836 60%, #140528 100%)",
    accent: "#ff3cb4",
    accentRGB: "255,60,180",
    arena: {
      ambient: "#a95cff",
      key: "#ff8ad4",
      spot: "#00e5ff",
      fill: "#ff3cb4",
      particles: [0xff3cb4, 0x00e5ff, 0xffd23f, 0x9b5cff],
    },
    ambienceGlows: [
      "rgba(255,60,180,0.5)",
      "rgba(0,229,255,0.42)",
      "rgba(255,210,63,0.32)",
      "rgba(155,92,255,0.42)",
    ],
  },

  // ─── Week 7 · In-Game Spending → "THE LOOT SHOP" ────────────────────────
  // A casino-glow world: deep wine-red velvet lit by golden coin shine and
  // ruby neon — everything sparkles because it wants your money.
  7: {
    deepBg: "#180307",
    bgGradient: "linear-gradient(180deg, #2e060f 0%, #45091a 52%, #1a0409 100%)",
    glow: "radial-gradient(circle, rgba(255,78,106,0.42), transparent 70%)",
    frameBg: "linear-gradient(180deg, #380a16 0%, #24060e 60%, #1a0409 100%)",
    accent: "#ff4e6a",
    accentRGB: "255,78,106",
    arena: {
      ambient: "#a8434f",
      key: "#ffd166",
      spot: "#ff4e6a",
      fill: "#ffb347",
      particles: [0xff4e6a, 0xffd166, 0xff9d2e, 0xd63960],
    },
    ambienceGlows: [
      "rgba(255,78,106,0.44)",
      "rgba(255,209,102,0.32)",
      "rgba(255,157,46,0.28)",
      "rgba(214,57,96,0.4)",
    ],
  },

  // ─── Week 8 · Photos & Videos → "THE DARKROOM" ──────────────────────────
  // A photographer's darkroom: near-black amber-brown shadows under a warm
  // safelight glow — a place where you stop and think before developing.
  8: {
    deepBg: "#120705",
    bgGradient: "linear-gradient(180deg, #241009 0%, #38160c 52%, #140805 100%)",
    glow: "radial-gradient(circle, rgba(255,107,61,0.4), transparent 70%)",
    frameBg: "linear-gradient(180deg, #2a130b 0%, #1c0c07 60%, #140805 100%)",
    accent: "#ff6b3d",
    accentRGB: "255,107,61",
    arena: {
      ambient: "#8a5240",
      key: "#ff9d6e",
      spot: "#ffc49b",
      fill: "#ff6b3d",
      particles: [0xff6b3d, 0xff9d6e, 0xe0502e, 0xffc49b],
    },
    ambienceGlows: [
      "rgba(255,107,61,0.42)",
      "rgba(255,157,110,0.32)",
      "rgba(224,80,46,0.3)",
      "rgba(138,82,64,0.38)",
    ],
  },

  // ─── Week 9 · Apps & Downloads → "THE CONVEYOR" ─────────────────────────
  // An app-factory world: saturated tech blue with orange conveyor lights
  // sorting the real apps from the fakes — busy, bright, industrial.
  9: {
    deepBg: "#041022",
    bgGradient: "linear-gradient(180deg, #082044 0%, #0c2f60 52%, #051428 100%)",
    glow: "radial-gradient(circle, rgba(43,127,255,0.42), transparent 70%)",
    frameBg: "linear-gradient(180deg, #0a2650 0%, #071b3a 60%, #051228 100%)",
    accent: "#2b7fff",
    accentRGB: "43,127,255",
    arena: {
      ambient: "#4a6fd8",
      key: "#66a9ff",
      spot: "#ff9d3d",
      fill: "#2b7fff",
      particles: [0x2b7fff, 0x66c2ff, 0xff9d3d, 0x3d5be0],
    },
    ambienceGlows: [
      "rgba(43,127,255,0.44)",
      "rgba(255,157,61,0.3)",
      "rgba(102,194,255,0.32)",
      "rgba(61,91,224,0.4)",
    ],
  },

  // ─── Week 10 · YouTube Rabbit Hole → "THE GLOWING BURROW" ───────────────
  // A hypnotic tunnel world: deepest warm purple walls veined with
  // bioluminescent lime light pulling you further down — until you choose to stop.
  10: {
    deepBg: "#10041e",
    bgGradient: "linear-gradient(180deg, #1e0a38 0%, #2b1050 52%, #120522 100%)",
    glow: "radial-gradient(circle, rgba(184,227,75,0.35), transparent 70%)",
    frameBg: "linear-gradient(180deg, #251043 0%, #180a30 60%, #110521 100%)",
    accent: "#b8e34b",
    accentRGB: "184,227,75",
    arena: {
      ambient: "#6b4ba8",
      key: "#cdf06e",
      spot: "#8a5cff",
      fill: "#b8e34b",
      particles: [0xb8e34b, 0x8a5cff, 0xd9ff7a, 0x5c3d99],
    },
    ambienceGlows: [
      "rgba(184,227,75,0.36)",
      "rgba(138,92,255,0.4)",
      "rgba(217,255,122,0.26)",
      "rgba(92,61,153,0.42)",
    ],
  },

  // ─── Week 11 · Emergency Protocol → "CALM ALERT CENTRE" ─────────────────
  // A steady ops room: dark red-slate walls with a firm amber signal glow —
  // urgent but never panicked, the light of knowing exactly what to do.
  11: {
    deepBg: "#170608",
    bgGradient: "linear-gradient(180deg, #2a0c10 0%, #3d1216 52%, #180709 100%)",
    glow: "radial-gradient(circle, rgba(255,149,40,0.38), transparent 70%)",
    frameBg: "linear-gradient(180deg, #301014 0%, #200a0d 60%, #180709 100%)",
    accent: "#ff9528",
    accentRGB: "255,149,40",
    arena: {
      ambient: "#8f4a45",
      key: "#ffb066",
      spot: "#ff9528",
      fill: "#ff7a5c",
      particles: [0xff9528, 0xffb066, 0xe05c48, 0xffd9a0],
    },
    ambienceGlows: [
      "rgba(255,149,40,0.42)",
      "rgba(224,92,72,0.34)",
      "rgba(255,217,160,0.26)",
      "rgba(143,74,69,0.4)",
    ],
  },

  // ─── Week 12 · Digital Footprint → "THE SNOWFIELD" ──────────────────────
  // A hushed icy-blue snowfield at dusk: pale white-ice light over deep
  // frozen navy — every step you take leaves a visible track.
  12: {
    deepBg: "#06121f",
    bgGradient: "linear-gradient(180deg, #0b2338 0%, #123754 52%, #081724 100%)",
    glow: "radial-gradient(circle, rgba(168,228,255,0.4), transparent 70%)",
    frameBg: "linear-gradient(180deg, #10304a 0%, #0a2136 60%, #071826 100%)",
    accent: "#a8e4ff",
    accentRGB: "168,228,255",
    arena: {
      ambient: "#6fa8cc",
      key: "#d8f3ff",
      spot: "#a8e4ff",
      fill: "#7cc4ee",
      particles: [0xa8e4ff, 0xffffff, 0x7cc4ee, 0x4f8ab8],
    },
    ambienceGlows: [
      "rgba(168,228,255,0.42)",
      "rgba(255,255,255,0.24)",
      "rgba(124,196,238,0.34)",
      "rgba(79,138,184,0.38)",
    ],
  },

  // ─── Week 13 · Screen Time → "SUNRISE BALANCE" ──────────────────────────
  // A dawn world split in two: cool teal night above melting into warm
  // sunrise embers below — the exact moment of balance between them.
  13: {
    deepBg: "#051614",
    bgGradient: "linear-gradient(180deg, #093029 0%, #1e3c33 50%, #332612 100%)",
    glow: "radial-gradient(circle, rgba(46,196,182,0.38), transparent 70%)",
    frameBg: "linear-gradient(180deg, #10382f 0%, #0a2822 60%, #1e1810 100%)",
    accent: "#2ec4b6",
    accentRGB: "46,196,182",
    arena: {
      ambient: "#3d8a7d",
      key: "#ffab5e",
      spot: "#2ec4b6",
      fill: "#ff9e58",
      particles: [0x2ec4b6, 0xff9e58, 0x67e0d0, 0xffc98a],
    },
    ambienceGlows: [
      "rgba(46,196,182,0.42)",
      "rgba(255,158,88,0.34)",
      "rgba(103,224,208,0.28)",
      "rgba(255,201,138,0.3)",
    ],
  },

  // ─── Week 14 · Smart Devices → "THE SMART HOME" ─────────────────────────
  // A cosy lamp-lit living room in warm amber-brown — except for the cold
  // cyan LED eyes of the devices, quietly listening from every corner.
  14: {
    deepBg: "#140d06",
    bgGradient: "linear-gradient(180deg, #291a0c 0%, #3b2712 52%, #170e07 100%)",
    glow: "radial-gradient(circle, rgba(69,227,255,0.35), transparent 70%)",
    frameBg: "linear-gradient(180deg, #2f1f10 0%, #20150a 60%, #170e07 100%)",
    accent: "#45e3ff",
    accentRGB: "69,227,255",
    arena: {
      ambient: "#8a6a45",
      key: "#ffc98a",
      spot: "#45e3ff",
      fill: "#45b8d1",
      particles: [0x45e3ff, 0xffc98a, 0x2da8c9, 0xffe0b3],
    },
    ambienceGlows: [
      "rgba(69,227,255,0.38)",
      "rgba(255,201,138,0.34)",
      "rgba(45,168,201,0.32)",
      "rgba(255,224,179,0.26)",
    ],
  },

  // ─── Week 15 · AI & Chatbots → "THE ROBOT LAB" ──────────────────────────
  // A circuit-board laboratory: near-black board green etched with glowing
  // mint traces and cyan status lights — humming, precise, not quite human.
  15: {
    deepBg: "#02120c",
    bgGradient: "linear-gradient(180deg, #04231a 0%, #063325 52%, #021710 100%)",
    glow: "radial-gradient(circle, rgba(61,255,196,0.35), transparent 70%)",
    frameBg: "linear-gradient(180deg, #05291e 0%, #031d15 60%, #021710 100%)",
    accent: "#3dffc4",
    accentRGB: "61,255,196",
    arena: {
      ambient: "#1e7a5f",
      key: "#7affdd",
      spot: "#35e0ff",
      fill: "#3dffc4",
      particles: [0x3dffc4, 0x35e0ff, 0x2ea87f, 0x8affdf],
    },
    ambienceGlows: [
      "rgba(61,255,196,0.36)",
      "rgba(53,224,255,0.32)",
      "rgba(46,168,127,0.34)",
      "rgba(138,255,223,0.24)",
    ],
  },

  // ─── Week 16 · QR Codes & Links → "THE DOORWAY MAZE" ────────────────────
  // A twilight maze of violet corridors where every door hums orchid neon —
  // and the odd one leaks suspicious lime light from underneath.
  16: {
    deepBg: "#0e0a24",
    bgGradient: "linear-gradient(180deg, #1a1348 0%, #251d66 52%, #100b2b 100%)",
    glow: "radial-gradient(circle, rgba(180,77,255,0.4), transparent 70%)",
    frameBg: "linear-gradient(180deg, #221650 0%, #170f3a 60%, #110c2c 100%)",
    accent: "#b44dff",
    accentRGB: "180,77,255",
    arena: {
      ambient: "#7a4fc9",
      key: "#cd8aff",
      spot: "#d4e94f",
      fill: "#b44dff",
      particles: [0xb44dff, 0xd4e94f, 0x8a5cf0, 0xe6a8ff],
    },
    ambienceGlows: [
      "rgba(180,77,255,0.44)",
      "rgba(212,233,79,0.26)",
      "rgba(230,168,255,0.3)",
      "rgba(138,92,240,0.4)",
    ],
  },

  // ─── Week 17 · Social Media → "THE FEED" ────────────────────────────────
  // An ink-navy scrolling feed lit by electric sky-blue shield light, with
  // hot pink notification sparks drifting past — guarded, not swallowed.
  17: {
    deepBg: "#05081c",
    bgGradient: "linear-gradient(180deg, #0a1440 0%, #14205e 52%, #070d28 100%)",
    glow: "radial-gradient(circle, rgba(56,182,255,0.4), transparent 70%)",
    frameBg: "linear-gradient(180deg, #101c4e 0%, #0a1338 60%, #060b24 100%)",
    accent: "#38b6ff",
    accentRGB: "56,182,255",
    arena: {
      ambient: "#4a63d8",
      key: "#6ec8ff",
      spot: "#ff5fd2",
      fill: "#38b6ff",
      particles: [0x38b6ff, 0xff5fd2, 0x5c7cff, 0x9be0ff],
    },
    ambienceGlows: [
      "rgba(56,182,255,0.44)",
      "rgba(255,95,210,0.3)",
      "rgba(155,224,255,0.28)",
      "rgba(92,124,255,0.4)",
    ],
  },

  // ─── Week 18 · Sharing Devices → "THE LOCKER ROOM" ──────────────────────
  // A cool steel locker room: brushed slate-grey rows under muted teal
  // strip-lights — everything shared, so everything gets locked.
  18: {
    deepBg: "#0a0f12",
    bgGradient: "linear-gradient(180deg, #142026 0%, #1e2f36 52%, #0c1316 100%)",
    glow: "radial-gradient(circle, rgba(98,182,203,0.38), transparent 70%)",
    frameBg: "linear-gradient(180deg, #182830 0%, #101c22 60%, #0c1417 100%)",
    accent: "#62b6cb",
    accentRGB: "98,182,203",
    arena: {
      ambient: "#5c7885",
      key: "#9fd4e0",
      spot: "#62b6cb",
      fill: "#4a99ad",
      particles: [0x62b6cb, 0x9fd4e0, 0x3d7d8f, 0xc9e8ee],
    },
    ambienceGlows: [
      "rgba(98,182,203,0.4)",
      "rgba(159,212,224,0.28)",
      "rgba(61,125,143,0.36)",
      "rgba(201,232,238,0.22)",
    ],
  },

  // ─── Week 19 · Protecting Family → "THE HEARTH" ─────────────────────────
  // A warm family hearth glowing peach-ember, wrapped in a faint protective
  // blue shield-light at the edges — the cosiest world, worth defending.
  19: {
    deepBg: "#160c06",
    bgGradient: "linear-gradient(180deg, #301408 0%, #48200e 52%, #1a0c06 100%)",
    glow: "radial-gradient(circle, rgba(255,178,107,0.4), transparent 70%)",
    frameBg: "linear-gradient(180deg, #37190b 0%, #241107 60%, #1a0c06 100%)",
    accent: "#ffb26b",
    accentRGB: "255,178,107",
    arena: {
      ambient: "#96603d",
      key: "#ffcf9b",
      spot: "#4c8dff",
      fill: "#ff9d5c",
      particles: [0xffb26b, 0x4c8dff, 0xffd9a8, 0xe0854a],
    },
    ambienceGlows: [
      "rgba(255,178,107,0.42)",
      "rgba(76,141,255,0.3)",
      "rgba(255,217,168,0.3)",
      "rgba(224,133,74,0.36)",
    ],
  },

  // ─── Week 20 · Graduation Day → "THE CEREMONY STAGE" ────────────────────
  // A grand graduation stage: royal midnight-blue drapes swept by golden
  // spotlights and drifting white confetti — the finale world.
  20: {
    deepBg: "#060a24",
    bgGradient: "linear-gradient(180deg, #0e1a5c 0%, #1b2a8a 52%, #080e30 100%)",
    glow: "radial-gradient(circle, rgba(255,203,94,0.4), transparent 70%)",
    frameBg: "linear-gradient(180deg, #131f66 0%, #0c144a 60%, #080e30 100%)",
    accent: "#5b76ff",
    accentRGB: "91,118,255",
    arena: {
      ambient: "#4a5cc9",
      key: "#ffd97a",
      spot: "#f0f4ff",
      fill: "#5b76ff",
      particles: [0x5b76ff, 0xffd97a, 0xffffff, 0x8a9dff],
    },
    ambienceGlows: [
      "rgba(255,217,122,0.4)",
      "rgba(91,118,255,0.42)",
      "rgba(240,244,255,0.26)",
      "rgba(138,157,255,0.36)",
    ],
  },
};
