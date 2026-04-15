import { Howl, Howler } from "howler";

type Category = "sfx" | "music" | "voice";

const SFX_KEYS = [
  "click",
  "correct",
  "wrong",
  "transition",
  "whoosh",
  "pop",
  "badge-earned",
  "boss-appear",
  "boss-hit",
  "boss-defeated",
  "celebration",
  "countdown",
  "hover",
  "lock",
  "unlock",
  "star",
  "level-up",
  "raccoon-laugh",
] as const;

type SfxKey = (typeof SFX_KEYS)[number];

const MUTE_STORAGE_KEY = "algorithmx-muted";
const CROSSFADE_MS = 1000;
const VOICE_DUCK_VOLUME = 0.3;

export class SoundManager {
  private static instance: SoundManager | null = null;

  private sfx: Map<string, Howl> = new Map();
  private currentBGM: Howl | null = null;
  private currentBGMTrack: string | null = null;
  private currentVoice: Howl | null = null;
  private preloaded = false;

  private volumes: Record<Category, number> = {
    sfx: 0.5,
    music: 0.4,
    voice: 0.9,
  };

  private bgmTargetVolume = this.volumes.music;
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

  preloadSFX(): void {
    if (this.preloaded || typeof window === "undefined") return;
    this.preloaded = true;
    for (const key of SFX_KEYS) {
      const howl = new Howl({
        src: [`/audio/sfx/${key}.mp3`],
        preload: true,
        volume: this.volumes.sfx,
        onloaderror: () => {
          /* silently ignore missing files */
        },
        onplayerror: () => {
          /* silently ignore play errors */
        },
      });
      this.sfx.set(key, howl);
    }
  }

  play(key: string): void {
    if (this.muted) return;
    const howl = this.sfx.get(key);
    if (!howl) return;
    try {
      howl.volume(this.volumes.sfx);
      howl.play();
    } catch {
      /* ignore */
    }
  }

  playBGM(track: string): void {
    if (typeof window === "undefined") return;
    if (this.currentBGMTrack === track && this.currentBGM?.playing()) return;

    const nextTarget = this.volumes.music;
    this.bgmTargetVolume = nextTarget;

    const previous = this.currentBGM;
    const next = new Howl({
      src: [`/audio/music/${track}.mp3`],
      loop: true,
      volume: 0,
      onloaderror: () => {
        /* file missing — clean up without throwing */
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
    next.fade(0, nextTarget, CROSSFADE_MS);

    this.currentBGM = next;
    this.currentBGMTrack = track;

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

    // Stop any currently playing voice line first
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
      // Duck BGM while voice plays
      const bgm = this.currentBGM;
      const duckFrom = bgm ? bgm.volume() : 0;
      const duckTarget = this.muted ? 0 : this.bgmTargetVolume * VOICE_DUCK_VOLUME;
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
          currentBgm.fade(currentBgm.volume(), this.bgmTargetVolume, 350);
        } catch {
          /* ignore */
        }
      };

      const howl = new Howl({
        src: [path],
        volume: this.muted ? 0 : this.volumes.voice,
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
    const clamped = Math.max(0, Math.min(1, vol));
    this.volumes[category] = clamped;
    if (category === "sfx") {
      this.sfx.forEach((h) => {
        try {
          h.volume(clamped);
        } catch {
          /* ignore */
        }
      });
    } else if (category === "music") {
      this.bgmTargetVolume = clamped;
      if (this.currentBGM) {
        try {
          this.currentBGM.volume(clamped);
        } catch {
          /* ignore */
        }
      }
    } else if (category === "voice") {
      if (this.currentVoice) {
        try {
          this.currentVoice.volume(clamped);
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

export type { Category, SfxKey };
export { SFX_KEYS };
