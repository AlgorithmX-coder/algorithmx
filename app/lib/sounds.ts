import { Howl, Howler } from "howler";

type Category = "sfx" | "music" | "voice";

interface SoundEntry {
  path: string;
  volume: number;
}

/**
 * SFX_REGISTRY - canonical keys used throughout the app.
 *
 * Keys are camelCase. A few legacy hyphenated aliases are registered at the
 * bottom so older call sites keep working without edits.
 *
 * Volume tiers:
 *   0.6 - routine UI + battle SFX
 *   0.8 - feedback (correct/wrong/streaks)
 *   0.9 - big moments (victory/defeat)
 */
const SFX_REGISTRY: Record<string, SoundEntry> = {
  // UI
  click: { path: "/audio/sfx/click.mp3", volume: 0.6 },
  hover: { path: "/audio/sfx/hover.mp3", volume: 0.6 },
  select: { path: "/audio/sfx/select.mp3", volume: 0.6 },
  back: { path: "/audio/sfx/back.mp3", volume: 0.6 },
  transition: { path: "/audio/sfx/transition.mp3", volume: 0.6 },
  pop: { path: "/audio/sfx/pop.mp3", volume: 0.6 },

  // Feedback
  correct: { path: "/audio/sfx/correct.mp3", volume: 0.8 },
  wrong: { path: "/audio/sfx/wrong.mp3", volume: 0.8 },
  streak3: { path: "/audio/sfx/streak-3.mp3", volume: 0.8 },
  streak5: { path: "/audio/sfx/streak-5.mp3", volume: 0.8 },
  streak7: { path: "/audio/sfx/streak-7.mp3", volume: 0.8 },
  xpGain: { path: "/audio/sfx/coin.mp3", volume: 0.6 },

  // Boss battle
  heroAttack: { path: "/audio/sfx/hero-attack.mp3", volume: 0.6 },
  bossAttack: { path: "/audio/sfx/boss-attack.mp3", volume: 0.6 },
  hitImpact: { path: "/audio/sfx/hit-impact.mp3", volume: 0.6 },
  bossHurt: { path: "/audio/sfx/boss-hurt.mp3", volume: 0.6 },
  bossRoar: { path: "/audio/sfx/boss-roar.mp3", volume: 0.6 },
  bossDefeated: { path: "/audio/sfx/boss-defeated.mp3", volume: 0.6 },
  shieldBlock: { path: "/audio/sfx/shield-block.mp3", volume: 0.6 },
  phaseChange: { path: "/audio/sfx/phase-change.mp3", volume: 0.6 },
  screenShake: { path: "/audio/sfx/screen-shake.mp3", volume: 0.6 },
  projectile: { path: "/audio/sfx/projectile.mp3", volume: 0.6 },

  // Celebration
  victory: { path: "/audio/sfx/victory.mp3", volume: 0.9 },
  defeat: { path: "/audio/sfx/defeat.mp3", volume: 0.9 },
  confetti: { path: "/audio/sfx/confetti.mp3", volume: 0.6 },
  badgeEarned: { path: "/audio/sfx/badge-earned.mp3", volume: 0.6 },
  levelUp: { path: "/audio/sfx/level-up.mp3", volume: 0.6 },
  starEarned: { path: "/audio/sfx/star-earned.mp3", volume: 0.6 },

  // Lesson flow - lessonStart/emailOpen have no dedicated files yet,
  // so substitute close-intent sounds until art delivers them.
  lessonStart: { path: "/audio/sfx/reveal.mp3", volume: 0.6 },
  lessonComplete: { path: "/audio/sfx/lesson-complete.mp3", volume: 0.6 },
  timerTick: { path: "/audio/sfx/time-tick.mp3", volume: 0.6 },
  timerWarning: { path: "/audio/sfx/time-warning.mp3", volume: 0.6 },
  reveal: { path: "/audio/sfx/reveal.mp3", volume: 0.6 },
  typing: { path: "/audio/sfx/typing.mp3", volume: 0.5 },

  // Exercise
  sortCorrect: { path: "/audio/sfx/sort-correct.mp3", volume: 0.8 },
  sortWrong: { path: "/audio/sfx/sort-wrong.mp3", volume: 0.8 },
  emailOpen: { path: "/audio/sfx/pop.mp3", volume: 0.6 },
  chatReceive: { path: "/audio/sfx/chat-receive.mp3", volume: 0.6 },
  lock: { path: "/audio/sfx/lock.mp3", volume: 0.6 },
  pour: { path: "/audio/sfx/pour.mp3", volume: 0.6 },
  // Game-interaction SFX (ElevenLabs sound-gen, see
  // scripts/elevenlabs-generate-game-sfx.mjs)
  cardFlip: { path: "/audio/sfx/card-flip.mp3", volume: 0.45 },
  drop: { path: "/audio/sfx/drop.mp3", volume: 0.45 },
  heal: { path: "/audio/sfx/heal.mp3", volume: 0.6 },

  // - legacy aliases (older call sites) -
  "badge-earned": { path: "/audio/sfx/badge-earned.mp3", volume: 0.6 },
  "boss-appear": { path: "/audio/sfx/boss-roar.mp3", volume: 0.6 },
  "boss-hit": { path: "/audio/sfx/hit-impact.mp3", volume: 0.6 },
  "boss-defeated": { path: "/audio/sfx/boss-defeated.mp3", volume: 0.6 },
  "raccoon-laugh": { path: "/audio/sfx/boss-roar.mp3", volume: 0.6 },
  "level-up": { path: "/audio/sfx/level-up.mp3", volume: 0.6 },
  celebration: { path: "/audio/sfx/confetti.mp3", volume: 0.6 },
  star: { path: "/audio/sfx/star-earned.mp3", volume: 0.6 },
  countdown: { path: "/audio/sfx/time-tick.mp3", volume: 0.6 },
  whoosh: { path: "/audio/sfx/transition.mp3", volume: 0.6 },
  unlock: { path: "/audio/sfx/lock.mp3", volume: 0.6 },
};

/**
 * BGM_REGISTRY - looped background music tracks.
 *
 * Two tiers:
 *  - Under-narration beds (bgmLesson/Battle/Victory) are capped at
 *    BGM_MAX_VOLUME so the spoken voice + SFX always sit clearly on top.
 *  - Standalone beds that play where NOTHING is talking (bgmHub - the
 *    Cyber HQ hub) run louder: still below the lowest SFX (0.45) so
 *    interaction sounds stay on top, but actually audible.
 * playBGM hard-caps each track at its own `volume`, so these values are
 * ceilings, not just starting points.
 */
// 0.02 = whisper-faint background bed. The narration voice (George /
// Sarah) is the primary audio; music sits underneath as room tone,
// not as a competing layer. Halved from the previous 0.04 after
// narration was added - the voice needs to dominate the mix without
// fighting the music for attention. BGM is disabled below regardless; if it is
// ever re-enabled, playBGM hard-caps at this very low level. The earlier
// "loud" was a stale dev server ignoring volume changes, since fixed.
const BGM_MAX_VOLUME = 0.012;
const BGM_REGISTRY: Record<string, SoundEntry> = {
  bgmLesson: { path: "/audio/sfx/bgm-lesson.mp3", volume: BGM_MAX_VOLUME },
  bgmBattle: { path: "/audio/sfx/bgm-battle.mp3", volume: BGM_MAX_VOLUME },
  bgmVictory: { path: "/audio/sfx/bgm-victory.mp3", volume: BGM_MAX_VOLUME },
  // Cyber HQ hub bed ("Guardian Calm", ElevenLabs Music). PILOT
  // FEEDBACK (global, 2026-07-08): ALL music plays very very faint -
  // felt as atmosphere, never listened to. Was 0.18.
  bgmHub: { path: "/audio/sfx/bgm-hq.mp3", volume: 0.05 },
  // Boss bed (a cappella - voices only, ElevenLabs Music). Same rule:
  // very very faint under the villain/narrator voices + SFX. Was 0.09.
  bgmBoss: { path: "/audio/sfx/bgm-boss.mp3", volume: 0.03 },
  // Dashboard ambient bed: the Week-1 lesson track (bgm-lesson.mp3) brought
  // back as faint atmosphere on /dashboard, where no narration competes for
  // the mix. Deliberately a SEPARATE key from bgmLesson - the lesson bed was
  // dropped from the allowlist so it stays silent under the narration voice,
  // and this must not re-enable it. 0.04 matches the pilot-tuned hub bed's
  // perceived loudness: bgm-lesson measures ~2.4 dB louder than bgm-hq, so
  // 0.05 x 10^(-2.4/20) ~= 0.04.
  bgmDashboard: { path: "/audio/sfx/bgm-lesson.mp3", volume: 0.04 },
};

const SFX_KEYS = Object.keys(SFX_REGISTRY);
type SfxKey = keyof typeof SFX_REGISTRY;

const MUTE_STORAGE_KEY = "algorithmx-muted";
const CROSSFADE_MS = 1000;
const VOICE_DUCK_VOLUME = 0.3;

export class SoundManager {
  private static instance: SoundManager | null = null;

  private sfx: Map<string, Howl> = new Map();
  private sfxBaseVolume: Map<string, number> = new Map();
  private currentBGM: Howl | null = null;
  private currentBGMTrack: string | null = null;
  private currentBGMTargetVolume: number = BGM_MAX_VOLUME;
  private currentVoice: Howl | null = null;
  private preloaded = false;

  // Category multipliers (applied on top of per-key volume).
  private categoryScale: Record<Category, number> = {
    sfx: 1,
    music: 1,
    voice: 1,
  };
  private voiceBaseVolume = 0.9;

  private muted = false;

  private constructor() {
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem(MUTE_STORAGE_KEY);
        if (stored === "true") {
          this.muted = true;
          Howler.mute(true);
        }
      } catch {
        /* ignore storage errors */
      }
    }
  }

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /** Load every SFX in the registry. Idempotent. */
  preloadSFX(): void {
    if (this.preloaded || typeof window === "undefined") return;
    this.preloaded = true;
    for (const [key, entry] of Object.entries(SFX_REGISTRY)) {
      const howl = new Howl({
        src: [entry.path],
        preload: true,
        volume: entry.volume,
        onloaderror: () => {
          /* silently ignore missing files */
        },
        onplayerror: () => {
          /* silently ignore play errors */
        },
      });
      this.sfx.set(key, howl);
      this.sfxBaseVolume.set(key, entry.volume);
    }
  }

  play(key: string): void {
    if (this.muted) return;
    const howl = this.sfx.get(key);
    if (!howl) return;
    const base = this.sfxBaseVolume.get(key) ?? 0.6;
    try {
      howl.volume(base * this.categoryScale.sfx);
      howl.play();
    } catch {
      /* ignore */
    }
  }

  /**
   * Play a BGM track. Accepts either a BGM_REGISTRY key (e.g. "bgmLesson") or
   * a legacy bare track name that resolves to /audio/music/{track}.mp3.
   */
  playBGM(trackOrKey: string): void {
    if (typeof window === "undefined") return;
    if (this.currentBGMTrack === trackOrKey && this.currentBGM?.playing()) return;

    const registered = BGM_REGISTRY[trackOrKey];
    const src = registered ? registered.path : `/audio/music/${trackOrKey}.mp3`;
    const baseVolume = registered ? registered.volume : BGM_MAX_VOLUME;
    // Hardened volume. A non-finite categoryScale (e.g. a corrupt stored
    // volume pref) used to make `target` NaN, and Howler plays NaN volume at
    // FULL blast. Guard the scale, and HARD-CAP at the configured base so BGM
    // can never exceed its intended (faint) level whatever the input.
    const scale = Number.isFinite(this.categoryScale.music)
      ? this.categoryScale.music
      : 1;
    const target = Math.max(0, Math.min(baseVolume, baseVolume * scale));
    this.currentBGMTargetVolume = target;

    const previous = this.currentBGM;
    const next = new Howl({
      src: [src],
      loop: true,
      // Start AT target (not 0). If the fade-in below is ever missed or raced
      // (fade() called before the clip loads), the worst case is a hard start
      // at the faint target - never the Howl default of full volume.
      volume: target,
      onloaderror: () => {
        if (this.currentBGM === next) {
          this.currentBGM = null;
          this.currentBGMTrack = null;
        }
      },
      onplayerror: () => {
        /* ignore */
      },
    });

    next.play();
    // Cosmetic fade-in, fired once playback actually starts so it can't be
    // dropped by a fade()-before-load race.
    next.once("play", () => {
      try {
        next.volume(0);
        next.fade(0, target, CROSSFADE_MS);
      } catch {
        next.volume(target);
      }
    });

    this.currentBGM = next;
    this.currentBGMTrack = trackOrKey;

    if (previous) {
      try {
        previous.fade(previous.volume(), 0, CROSSFADE_MS);
        window.setTimeout(() => {
          try {
            previous.stop();
            previous.unload();
          } catch {
            /* ignore */
          }
        }, CROSSFADE_MS + 50);
      } catch {
        /* ignore */
      }
    }
  }

  stopBGM(fadeOut: number = 1000): void {
    const bgm = this.currentBGM;
    if (!bgm) return;
    try {
      const from = bgm.volume();
      bgm.fade(from, 0, fadeOut);
      window.setTimeout(() => {
        try {
          bgm.stop();
          bgm.unload();
        } catch {
          /* ignore */
        }
      }, fadeOut + 50);
    } catch {
      /* ignore */
    }
    this.currentBGM = null;
    this.currentBGMTrack = null;
  }

  playVoice(path: string): Promise<void> {
    if (typeof window === "undefined") return Promise.resolve();

    if (this.currentVoice) {
      try {
        this.currentVoice.stop();
        this.currentVoice.unload();
      } catch {
        /* ignore */
      }
      this.currentVoice = null;
    }

    return new Promise<void>((resolve) => {
      const bgm = this.currentBGM;
      const duckFrom = bgm ? bgm.volume() : 0;
      const duckTarget = this.muted
        ? 0
        : this.currentBGMTargetVolume * VOICE_DUCK_VOLUME;
      if (bgm) {
        try {
          bgm.fade(duckFrom, duckTarget, 250);
        } catch {
          /* ignore */
        }
      }

      const restoreBGM = () => {
        const currentBgm = this.currentBGM;
        if (!currentBgm) return;
        try {
          currentBgm.fade(
            currentBgm.volume(),
            this.currentBGMTargetVolume,
            350
          );
        } catch {
          /* ignore */
        }
      };

      const howl = new Howl({
        src: [path],
        volume: this.muted ? 0 : this.voiceBaseVolume * this.categoryScale.voice,
        onend: () => {
          restoreBGM();
          try {
            howl.unload();
          } catch {
            /* ignore */
          }
          if (this.currentVoice === howl) this.currentVoice = null;
          resolve();
        },
        onloaderror: () => {
          restoreBGM();
          if (this.currentVoice === howl) this.currentVoice = null;
          resolve();
        },
        onplayerror: () => {
          restoreBGM();
          if (this.currentVoice === howl) this.currentVoice = null;
          resolve();
        },
      });

      this.currentVoice = howl;
      try {
        howl.play();
      } catch {
        restoreBGM();
        if (this.currentVoice === howl) this.currentVoice = null;
        resolve();
      }
    });
  }

  setVolume(category: Category, vol: number): void {
    // Guard against a non-finite slider/pref value (undefined/NaN) - left
    // unchecked it propagates to Howler as NaN, which plays at full volume.
    const clamped = Number.isFinite(vol) ? Math.max(0, Math.min(1, vol)) : 1;
    this.categoryScale[category] = clamped;

    if (category === "sfx") {
      this.sfx.forEach((h, key) => {
        const base = this.sfxBaseVolume.get(key) ?? 0.6;
        try {
          h.volume(base * clamped);
        } catch {
          /* ignore */
        }
      });
    } else if (category === "music") {
      if (this.currentBGM) {
        const base =
          this.currentBGMTrack && BGM_REGISTRY[this.currentBGMTrack]
            ? BGM_REGISTRY[this.currentBGMTrack].volume
            : BGM_MAX_VOLUME;
        const target = Math.max(0, Math.min(base, base * clamped));
        this.currentBGMTargetVolume = target;
        try {
          this.currentBGM.volume(target);
        } catch {
          /* ignore */
        }
      }
    } else if (category === "voice") {
      if (this.currentVoice) {
        try {
          this.currentVoice.volume(this.voiceBaseVolume * clamped);
        } catch {
          /* ignore */
        }
      }
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    try {
      Howler.mute(muted);
    } catch {
      /* ignore */
    }
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(MUTE_STORAGE_KEY, muted ? "true" : "false");
      } catch {
        /* ignore */
      }
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  cleanup(): void {
    this.sfx.forEach((h) => {
      try {
        h.stop();
        h.unload();
      } catch {
        /* ignore */
      }
    });
    this.sfx.clear();
    this.sfxBaseVolume.clear();
    this.preloaded = false;

    if (this.currentBGM) {
      try {
        this.currentBGM.stop();
        this.currentBGM.unload();
      } catch {
        /* ignore */
      }
      this.currentBGM = null;
      this.currentBGMTrack = null;
    }

    if (this.currentVoice) {
      try {
        this.currentVoice.stop();
        this.currentVoice.unload();
      } catch {
        /* ignore */
      }
      this.currentVoice = null;
    }
  }
}

export function playSound(key: string): void {
  SoundManager.getInstance().play(key);
}

/**
 * BGM is globally OFF except for the tracks in this allowlist - an
 * allowlist rather than a boolean so a single surface can have music
 * without reviving the rest. The lesson stays silent (narration owns
 * it) and battle/victory stay off; only the Cyber HQ hub bed and the
 * Vault Boss battle bed play.
 *
 * Any track NOT listed is a no-op that also stops whatever is currently
 * playing (covers an SSR-hydrated track from a prior visit). playBGM is
 * hardened (per-track volume cap + NaN-safe), so re-enabling another
 * surface later is just adding its key here.
 */
const BGM_ALLOWLIST = new Set<string>(["bgmHub", "bgmBoss", "bgmDashboard"]);

export function playBGM(trackOrKey: string): void {
  if (!BGM_ALLOWLIST.has(trackOrKey)) {
    SoundManager.getInstance().stopBGM(0);
    return;
  }
  SoundManager.getInstance().playBGM(trackOrKey);
}

export function stopBGM(fadeOut?: number): void {
  SoundManager.getInstance().stopBGM(fadeOut);
}

export type { Category, SfxKey };
export { SFX_KEYS, SFX_REGISTRY, BGM_REGISTRY };
