"use client";

/**
 * BossBattle — raw PixiJS quiz-battle for ages 6-10.
 * Manual Application.init() + canvas append; no framework wrappers.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Application,
  Assets,
  type Container,
  Graphics,
  Sprite,
  Text,
  type Texture,
  type Ticker,
} from "pixi.js";

export interface Question {
  question: string;
  answers: string[];
  correctIndex: number;
}

export interface BossBattleProps {
  questions?: Question[];
  bossName?: string;
  onEnd?: (
    won: boolean,
    stats: { combo: number; accuracy: number; xp: number }
  ) => void;
}

const DEFAULT_QUESTIONS: Question[] = [
  { question: "What makes a strong password?", answers: ["Mix of letters, numbers & symbols", "Your pet's name", "123456", "Your birthday"], correctIndex: 0 },
  { question: "Someone you don't know sends a link. What do you do?", answers: ["Click it to see", "Tell a trusted adult", "Share it with friends", "Reply to them"], correctIndex: 1 },
  { question: "What is phishing?", answers: ["A fishing game", "Tricking people to share info", "A computer virus", "Sending photos"], correctIndex: 1 },
  { question: "Your friend asks for your password. You should...", answers: ["Tell them", "Write it down", "Never share it", "Share it once"], correctIndex: 2 },
  { question: "Someone is being mean online. What do you do?", answers: ["Be mean back", "Ignore it", "Block, screenshot, tell adult", "Delete your account"], correctIndex: 2 },
  { question: "Which password is safest?", answers: ["password123", "Tr0pic4l$unR1se!", "myname2024", "qwerty"], correctIndex: 1 },
  { question: "What is a digital footprint?", answers: ["Your shoe size", "Everything you do online", "A game", "Your email"], correctIndex: 1 },
  { question: "A pop-up says 'You won!' What do you do?", answers: ["Click to claim", "Close it — it's a scam", "Share it", "Enter your details"], correctIndex: 1 },
  { question: "Who should you share your password with?", answers: ["Best friend", "Nobody except parents", "Teacher", "Everyone"], correctIndex: 1 },
  { question: "What does a firewall do?", answers: ["Starts fires", "Blocks bad traffic", "Speeds up internet", "Stores passwords"], correctIndex: 1 },
];

const HP_MAX = 100;
const HERO_HEIGHT = 300;
const BOSS_HEIGHT = 350;

const ASSET_PATHS = {
  bg: "/game/backgrounds/cyber-classroom.png",
  adamIdle: "/game/characters/adam-idle.png",
  adamAttack: "/game/characters/adam-attack.png",
  adamHurt: "/game/characters/adam-hurt.png",
  adamCelebrate: "/game/characters/adam-celebrate.png",
  laylaIdle: "/game/characters/layla-idle.png",
  laylaAttack: "/game/characters/layla-attack.png",
  laylaHurt: "/game/characters/layla-hurt.png",
  laylaCelebrate: "/game/characters/layla-celebrate.png",
  bossIdle: "/game/characters/raccoon-idle.png",
  bossAttack: "/game/characters/raccoon-attack.png",
  bossHurt: "/game/characters/raccoon-hurt.png",
  bossTaunt: "/game/characters/raccoon-taunt.png",
  bossDefeated: "/game/characters/raccoon-defeated.png",
} as const;

type HeroId = "adam" | "layla";

type HeroAnim = "idle" | "attack" | "hurt" | "celebrate";
type BossAnim = "idle" | "attack" | "hurt" | "taunt" | "defeated";

interface HeroTexSet {
  idle: Texture;
  attack: Texture;
  hurt: Texture;
  celebrate: Texture;
}

interface BossTexSet {
  idle: Texture;
  attack: Texture;
  hurt: Texture;
  taunt: Texture;
  defeated: Texture;
}

interface TextureBundle {
  bg: Texture;
  adam: HeroTexSet;
  layla: HeroTexSet;
  boss: BossTexSet;
}

interface Particle {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  gfx: Graphics;
}

interface FloatText {
  text: Text;
  vy: number;
  life: number;
  maxLife: number;
}

interface Tween {
  from: number;
  to: number;
  duration: number;
  elapsed: number;
  delay: number;
  onUpdate: (v: number) => void;
  onComplete?: () => void;
  ease?: (t: number) => number;
}

interface Timer {
  delay: number;
  fn: () => void;
}

interface GameState {
  app: Application | null;
  stage: Container | null;
  textures: TextureBundle | null;
  selectedHero: HeroId;
  hero: Sprite | null;
  boss: Sprite | null;
  bg: Sprite | null;
  baseHeroX: number;
  baseHeroY: number;
  baseBossX: number;
  baseBossY: number;
  heroAnim: HeroAnim;
  bossAnim: BossAnim;
  heroAnimTimer: number;
  bossAnimTimer: number;
  heroLocked: boolean;
  bossLocked: boolean;
  heroOffsetX: number;
  bossOffsetX: number;
  heroScaleMul: number;
  bossScaleMul: number;
  bossRotation: number;
  shakeIntensity: number;
  shakeDuration: number;
  particles: Particle[];
  floatTexts: FloatText[];
  tweens: Tween[];
  timers: Timer[];
  time: number;
}

function easeOutQuad(t: number) {
  return 1 - (1 - t) * (1 - t);
}
function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
function easeInQuad(t: number) {
  return t * t;
}

function addTween(g: GameState, t: Omit<Tween, "elapsed">) {
  g.tweens.push({ ...t, elapsed: 0 });
}
function schedule(g: GameState, delay: number, fn: () => void) {
  g.timers.push({ delay, fn });
}

function spawnParticles(
  g: GameState,
  x: number,
  y: number,
  count: number,
  colors: number[]
) {
  if (!g.stage) return;
  for (let i = 0; i < count; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 2 + Math.random() * 4;
    const gfx = new Graphics();
    gfx.circle(0, 0, size).fill(color);
    gfx.x = x;
    gfx.y = y;
    g.stage.addChild(gfx);
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 6;
    g.particles.push({
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      life: 1,
      maxLife: 1,
      gfx,
    });
  }
}

function spawnFloatText(
  g: GameState,
  x: number,
  y: number,
  text: string,
  color: number
) {
  if (!g.stage) return;
  const t = new Text({
    text,
    style: {
      fontFamily: "Space Grotesk, Arial, sans-serif",
      fontSize: 36,
      fontWeight: "700",
      fill: color,
      stroke: { color: 0x0f172a, width: 4 },
    },
  });
  t.anchor.set(0.5, 0.5);
  t.x = x;
  t.y = y;
  g.stage.addChild(t);
  g.floatTexts.push({ text: t, vy: -2, life: 0, maxLife: 800 });
}

function triggerShake(g: GameState, intensity: number, duration: number) {
  g.shakeIntensity = Math.max(g.shakeIntensity, intensity);
  g.shakeDuration = Math.max(g.shakeDuration, duration);
}

function playerAttack(g: GameState, damage: number) {
  if (!g.hero || !g.boss) return;
  g.heroAnim = "attack";
  g.heroAnimTimer = 500;

  addTween(g, {
    from: 0, to: 60, duration: 150, delay: 0,
    onUpdate: (v) => { g.heroOffsetX = v; },
    ease: easeOutBack,
  });
  addTween(g, {
    from: 60, to: 0, duration: 200, delay: 150,
    onUpdate: (v) => { g.heroOffsetX = v; },
    ease: easeOutQuad,
  });

  schedule(g, 150, () => {
    if (!g.boss) return;
    g.bossAnim = "hurt";
    g.bossAnimTimer = 500;
    addTween(g, {
      from: 0, to: 20, duration: 100, delay: 0,
      onUpdate: (v) => { g.bossOffsetX = v; },
      ease: easeOutQuad,
    });
    addTween(g, {
      from: 20, to: 0, duration: 200, delay: 100,
      onUpdate: (v) => { g.bossOffsetX = v; },
      ease: easeOutQuad,
    });
    spawnParticles(g, g.boss.x, g.boss.y, 22, [0x3b82f6, 0x10b981, 0xffffff, 0x60a5fa]);
    spawnFloatText(g, g.boss.x, g.boss.y - 60, `-${damage}`, 0x10b981);
    triggerShake(g, 5, 200);
  });
}

function bossAttack(g: GameState, damage: number) {
  if (!g.hero || !g.boss) return;
  g.bossAnim = "attack";
  g.bossAnimTimer = 500;

  addTween(g, {
    from: 0, to: -60, duration: 150, delay: 0,
    onUpdate: (v) => { g.bossOffsetX = v; },
    ease: easeOutBack,
  });
  addTween(g, {
    from: -60, to: 0, duration: 200, delay: 150,
    onUpdate: (v) => { g.bossOffsetX = v; },
    ease: easeOutQuad,
  });

  schedule(g, 150, () => {
    if (!g.hero) return;
    g.heroAnim = "hurt";
    g.heroAnimTimer = 500;
    addTween(g, {
      from: 0, to: -15, duration: 100, delay: 0,
      onUpdate: (v) => { g.heroOffsetX = v; },
      ease: easeOutQuad,
    });
    addTween(g, {
      from: -15, to: 0, duration: 200, delay: 100,
      onUpdate: (v) => { g.heroOffsetX = v; },
      ease: easeOutQuad,
    });
    spawnParticles(g, g.hero.x, g.hero.y, 18, [0xef4444, 0xf97316, 0xfde047]);
    spawnFloatText(g, g.hero.x, g.hero.y - 60, `-${damage}`, 0xef4444);
    triggerShake(g, 6, 250);
  });
}

function triggerVictory(g: GameState) {
  if (!g.hero || !g.boss) return;
  g.heroAnim = "celebrate";
  g.heroLocked = true;
  g.bossAnim = "defeated";
  g.bossLocked = true;

  addTween(g, {
    from: 0, to: Math.PI * 2, duration: 1000, delay: 0,
    onUpdate: (v) => { g.bossRotation = v; },
  });
  addTween(g, {
    from: 1, to: 0, duration: 1000, delay: 0,
    onUpdate: (v) => { g.bossScaleMul = v; },
    ease: easeInQuad,
  });

  spawnParticles(g, g.boss.x, g.boss.y, 60, [0xfde047, 0x10b981, 0x3b82f6, 0xf97316, 0xffffff, 0xec4899]);
  triggerShake(g, 8, 500);

  for (let i = 0; i < 3; i++) {
    const base = i * 250;
    addTween(g, {
      from: 1, to: 1.2, duration: 120, delay: base,
      onUpdate: (v) => { g.heroScaleMul = v; },
      ease: easeOutBack,
    });
    addTween(g, {
      from: 1.2, to: 1, duration: 120, delay: base + 120,
      onUpdate: (v) => { g.heroScaleMul = v; },
      ease: easeOutQuad,
    });
  }
}

function triggerDefeat(g: GameState) {
  if (!g.hero || !g.boss) return;
  g.heroAnim = "hurt";
  g.heroLocked = true;
  g.bossAnim = "taunt";
  g.bossLocked = true;

  addTween(g, {
    from: 1, to: 0.8, duration: 500, delay: 0,
    onUpdate: (v) => { g.heroScaleMul = v; },
    ease: easeInQuad,
  });
  spawnParticles(g, g.hero.x, g.hero.y, 20, [0xef4444, 0x94a3b8, 0x475569]);
  triggerShake(g, 10, 400);
}

function tickFrame(g: GameState, dt: number) {
  g.time += dt;

  // Timers
  for (let i = g.timers.length - 1; i >= 0; i--) {
    const t = g.timers[i];
    t.delay -= dt;
    if (t.delay <= 0) {
      t.fn();
      g.timers.splice(i, 1);
    }
  }

  // Tweens
  for (let i = g.tweens.length - 1; i >= 0; i--) {
    const tw = g.tweens[i];
    if (tw.delay > 0) {
      tw.delay -= dt;
      if (tw.delay > 0) continue;
    }
    tw.elapsed += dt;
    const raw = Math.min(1, tw.elapsed / tw.duration);
    const eased = tw.ease ? tw.ease(raw) : raw;
    tw.onUpdate(tw.from + (tw.to - tw.from) * eased);
    if (raw >= 1) {
      tw.onComplete?.();
      g.tweens.splice(i, 1);
    }
  }

  // Animation state decay
  if (!g.heroLocked && g.heroAnimTimer > 0) {
    g.heroAnimTimer -= dt;
    if (g.heroAnimTimer <= 0) {
      g.heroAnim = "idle";
      g.heroAnimTimer = 0;
    }
  }
  if (!g.bossLocked && g.bossAnimTimer > 0) {
    g.bossAnimTimer -= dt;
    if (g.bossAnimTimer <= 0) {
      g.bossAnim = "idle";
      g.bossAnimTimer = 0;
    }
  }

  // Hero transform + texture
  if (g.hero && g.textures) {
    const heroSet = g.textures[g.selectedHero];
    const next = heroSet[g.heroAnim];
    if (g.hero.texture !== next) g.hero.texture = next;
    g.hero.anchor.set(0.5, 0.5);
    const baseScale = HERO_HEIGHT / (g.hero.texture.height || 1);
    g.hero.scale.set(baseScale * g.heroScaleMul);
    const bob = Math.sin(g.time / 500) * 4;
    g.hero.x = g.baseHeroX + g.heroOffsetX;
    g.hero.y = g.baseHeroY + bob;
  }

  // Boss transform + texture
  if (g.boss && g.textures) {
    const next = g.textures.boss[g.bossAnim];
    if (g.boss.texture !== next) g.boss.texture = next;
    g.boss.anchor.set(0.5, 0.5);
    const baseScale = BOSS_HEIGHT / (g.boss.texture.height || 1);
    g.boss.scale.set(baseScale * g.bossScaleMul);
    g.boss.rotation = g.bossRotation;
    const sway = Math.sin(g.time / 700) * 6;
    g.boss.x = g.baseBossX + g.bossOffsetX + sway;
    g.boss.y = g.baseBossY + Math.sin(g.time / 900) * 3;
  }

  // Particles
  for (let i = g.particles.length - 1; i >= 0; i--) {
    const p = g.particles[i];
    p.gfx.x += p.vx;
    p.gfx.y += p.vy;
    p.vy += 0.2;
    p.life -= dt / 1000;
    p.gfx.alpha = Math.max(0, p.life);
    if (p.life <= 0) {
      if (g.stage) g.stage.removeChild(p.gfx);
      if (!p.gfx.destroyed) p.gfx.destroy();
      g.particles.splice(i, 1);
    }
  }

  // Float texts
  for (let i = g.floatTexts.length - 1; i >= 0; i--) {
    const ft = g.floatTexts[i];
    ft.life += dt;
    ft.text.y += ft.vy;
    ft.text.alpha = Math.max(0, 1 - ft.life / ft.maxLife);
    if (ft.life >= ft.maxLife) {
      if (g.stage) g.stage.removeChild(ft.text);
      if (!ft.text.destroyed) ft.text.destroy();
      g.floatTexts.splice(i, 1);
    }
  }

  // Screen shake
  if (g.stage) {
    if (g.shakeDuration > 0) {
      g.stage.x = (Math.random() - 0.5) * g.shakeIntensity * 2;
      g.stage.y = (Math.random() - 0.5) * g.shakeIntensity * 2;
      g.shakeDuration -= dt;
      g.shakeIntensity *= 0.95;
    } else {
      g.stage.x = 0;
      g.stage.y = 0;
      g.shakeIntensity = 0;
    }
  }
}

export default function BossBattle({
  questions,
  bossName = "HACKER RACCOON",
  onEnd,
}: BossBattleProps) {
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const questionList = useMemo(
    () => (questions && questions.length > 0 ? questions : DEFAULT_QUESTIONS),
    [questions]
  );

  const [heroHp, setHeroHp] = useState(HP_MAX);
  const [bossHp, setBossHp] = useState(HP_MAX);
  const [combo, setCombo] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [feedback, setFeedback] = useState<{ index: number; correct: boolean } | null>(null);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState<null | "won" | "lost">(null);
  const [stats, setStats] = useState({ totalAsked: 0, correct: 0, maxCombo: 0 });
  const [gameKey, setGameKey] = useState(0);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [selectedHero, setSelectedHero] = useState<HeroId | null>(null);
  const [selecting, setSelecting] = useState<HeroId | null>(null);

  const gameRef = useRef<GameState>({
    app: null, stage: null, textures: null,
    selectedHero: "adam",
    hero: null, boss: null, bg: null,
    baseHeroX: 0, baseHeroY: 0, baseBossX: 0, baseBossY: 0,
    heroAnim: "idle", bossAnim: "idle",
    heroAnimTimer: 0, bossAnimTimer: 0,
    heroLocked: false, bossLocked: false,
    heroOffsetX: 0, bossOffsetX: 0,
    heroScaleMul: 1, bossScaleMul: 1,
    bossRotation: 0,
    shakeIntensity: 0, shakeDuration: 0,
    particles: [], floatTexts: [],
    tweens: [], timers: [],
    time: 0,
  });

  const chooseHero = (h: HeroId) => {
    if (selecting || selectedHero) return;
    setSelecting(h);
    window.setTimeout(() => setSelectedHero(h), 500);
  };

  useEffect(() => {
    if (!selectedHero) return;
    let cancelled = false;
    const app = new Application();
    let tickerFn: ((ticker: Ticker) => void) | null = null;

    const resizeHandler = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const g = gameRef.current;
      if (g.app) g.app.renderer.resize(w, h);
      if (g.bg) {
        g.bg.width = w;
        g.bg.height = h;
        g.bg.x = 0;
        g.bg.y = 0;
      }
      g.baseHeroX = w * 0.22;
      g.baseHeroY = h * 0.38;
      g.baseBossX = w * 0.72;
      g.baseBossY = h * 0.35;
    };

    (async () => {
      try {
        await app.init({
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundAlpha: 0,
          antialias: true,
          autoDensity: true,
          resolution: window.devicePixelRatio || 1,
        });
        if (cancelled) {
          app.destroy(true);
          return;
        }

        const canvas = app.canvas;
        canvas.style.position = "fixed";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";
        canvas.style.display = "block";
        canvas.style.zIndex = "0";

        if (!canvasHostRef.current) {
          app.destroy(true);
          return;
        }
        canvasHostRef.current.appendChild(canvas);

        console.log("[BossBattle] loading assets", ASSET_PATHS);
        const [
          bg,
          adamIdle, adamAttack, adamHurt, adamCelebrate,
          laylaIdle, laylaAttack, laylaHurt, laylaCelebrate,
          bossIdle, bossAttack, bossHurt, bossTaunt, bossDefeated,
        ] = await Promise.all([
          Assets.load<Texture>(ASSET_PATHS.bg),
          Assets.load<Texture>(ASSET_PATHS.adamIdle),
          Assets.load<Texture>(ASSET_PATHS.adamAttack),
          Assets.load<Texture>(ASSET_PATHS.adamHurt),
          Assets.load<Texture>(ASSET_PATHS.adamCelebrate),
          Assets.load<Texture>(ASSET_PATHS.laylaIdle),
          Assets.load<Texture>(ASSET_PATHS.laylaAttack),
          Assets.load<Texture>(ASSET_PATHS.laylaHurt),
          Assets.load<Texture>(ASSET_PATHS.laylaCelebrate),
          Assets.load<Texture>(ASSET_PATHS.bossIdle),
          Assets.load<Texture>(ASSET_PATHS.bossAttack),
          Assets.load<Texture>(ASSET_PATHS.bossHurt),
          Assets.load<Texture>(ASSET_PATHS.bossTaunt),
          Assets.load<Texture>(ASSET_PATHS.bossDefeated),
        ]);
        if (cancelled) {
          app.destroy(true);
          return;
        }

        const textures: TextureBundle = {
          bg,
          adam: { idle: adamIdle, attack: adamAttack, hurt: adamHurt, celebrate: adamCelebrate },
          layla: { idle: laylaIdle, attack: laylaAttack, hurt: laylaHurt, celebrate: laylaCelebrate },
          boss: { idle: bossIdle, attack: bossAttack, hurt: bossHurt, taunt: bossTaunt, defeated: bossDefeated },
        };

        const W = window.innerWidth;
        const H = window.innerHeight;

        const bgSprite = new Sprite(textures.bg);
        bgSprite.anchor.set(0, 0);
        bgSprite.x = 0;
        bgSprite.y = 0;
        bgSprite.width = W;
        bgSprite.height = H;
        app.stage.addChild(bgSprite);

        const heroSet = textures[selectedHero];
        const hero = new Sprite(heroSet.idle);
        hero.anchor.set(0.5, 0.5);
        hero.x = W * 0.22;
        hero.y = H * 0.38;
        hero.scale.set(HERO_HEIGHT / hero.texture.height);
        app.stage.addChild(hero);

        const boss = new Sprite(textures.boss.idle);
        boss.anchor.set(0.5, 0.5);
        boss.x = W * 0.72;
        boss.y = H * 0.35;
        boss.scale.set(BOSS_HEIGHT / boss.texture.height);
        app.stage.addChild(boss);

        const g = gameRef.current;
        g.app = app;
        g.stage = app.stage;
        g.textures = textures;
        g.selectedHero = selectedHero;
        g.hero = hero;
        g.boss = boss;
        g.bg = bgSprite;
        g.baseHeroX = W * 0.22;
        g.baseHeroY = H * 0.38;
        g.baseBossX = W * 0.72;
        g.baseBossY = H * 0.35;

        window.addEventListener("resize", resizeHandler);

        tickerFn = (ticker: Ticker) => {
          const dt = Math.min(ticker.deltaMS, 50);
          tickFrame(g, dt);
        };
        app.ticker.add(tickerFn);

        console.log("[BossBattle] ready", {
          W, H, selectedHero,
          canvas: { cssW: canvas.clientWidth, cssH: canvas.clientHeight, bufW: canvas.width, bufH: canvas.height },
          bossIdle: { w: textures.boss.idle.width, h: textures.boss.idle.height },
        });
        setReady(true);
      } catch (err) {
        console.error("[BossBattle] init failed", err);
        if (!cancelled) setLoadError(err instanceof Error ? err.message : String(err));
      }
    })();

    return () => {
      cancelled = true;
      window.removeEventListener("resize", resizeHandler);
      try {
        if (tickerFn && app.ticker) app.ticker.remove(tickerFn);
        app.ticker?.stop();
        app.destroy(true, { children: true, texture: false });
      } catch (e) {
        console.warn("[BossBattle] cleanup error", e);
      }
      const g = gameRef.current;
      g.app = null;
      g.stage = null;
      g.textures = null;
      g.hero = null;
      g.boss = null;
      g.bg = null;
      g.particles.length = 0;
      g.floatTexts.length = 0;
      g.tweens.length = 0;
      g.timers.length = 0;
      g.heroLocked = false;
      g.bossLocked = false;
      g.heroAnim = "idle";
      g.bossAnim = "idle";
      g.heroAnimTimer = 0;
      g.bossAnimTimer = 0;
      g.heroOffsetX = 0;
      g.bossOffsetX = 0;
      g.heroScaleMul = 1;
      g.bossScaleMul = 1;
      g.bossRotation = 0;
      g.shakeIntensity = 0;
      g.shakeDuration = 0;
      g.time = 0;
    };
  }, [gameKey, selectedHero]);

  const q = questionList[questionIdx % questionList.length];
  const bossPct = bossHp / HP_MAX;
  const heroPct = heroHp / HP_MAX;

  const handleAnswer = useCallback(
    (idx: number) => {
      if (locked || result || !ready) return;
      const cq = questionList[questionIdx % questionList.length];
      const correct = idx === cq.correctIndex;
      setLocked(true);
      setFeedback({ index: idx, correct });
      const g = gameRef.current;

      if (correct) {
        const newCombo = combo + 1;
        const damage = Math.min(30, 8 + combo * 3);
        const newBossHp = Math.max(0, bossHp - damage);
        setCombo(newCombo);
        setBossHp(newBossHp);
        setStats((s) => ({
          totalAsked: s.totalAsked + 1,
          correct: s.correct + 1,
          maxCombo: Math.max(s.maxCombo, newCombo),
        }));
        playerAttack(g, damage);

        if (newBossHp <= 0) {
          window.setTimeout(() => triggerVictory(g), 300);
          window.setTimeout(() => setResult("won"), 2200);
          return;
        }
      } else {
        const damage = 12;
        const newHeroHp = Math.max(0, heroHp - damage);
        setHeroHp(newHeroHp);
        setCombo(0);
        setStats((s) => ({ ...s, totalAsked: s.totalAsked + 1 }));
        bossAttack(g, damage);
        setShakeWrong(true);
        window.setTimeout(() => setShakeWrong(false), 400);

        if (newHeroHp <= 0) {
          window.setTimeout(() => triggerDefeat(g), 300);
          window.setTimeout(() => setResult("lost"), 1800);
          return;
        }
      }

      window.setTimeout(() => {
        setQuestionIdx((i) => i + 1);
        setFeedback(null);
        setLocked(false);
      }, 1300);
    },
    [locked, result, ready, questionList, questionIdx, combo, bossHp, heroHp]
  );

  useEffect(() => {
    if (!result || !onEnd) return;
    const accuracy =
      stats.totalAsked > 0 ? Math.round((stats.correct / stats.totalAsked) * 100) : 0;
    const xp = 100 + stats.correct * 15 + stats.maxCombo * 25;
    onEnd(result === "won", { combo: stats.maxCombo, accuracy, xp });
  }, [result, stats, onEnd]);

  const restart = () => {
    setHeroHp(HP_MAX);
    setBossHp(HP_MAX);
    setCombo(0);
    setQuestionIdx(0);
    setFeedback(null);
    setLocked(false);
    setResult(null);
    setStats({ totalAsked: 0, correct: 0, maxCombo: 0 });
    setReady(false);
    setGameKey((k) => k + 1);
  };

  const finalAccuracy =
    stats.totalAsked > 0 ? Math.round((stats.correct / stats.totalAsked) * 100) : 0;
  const finalXp = 100 + stats.correct * 15 + stats.maxCombo * 25;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "#080c18",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {!selectedHero && (
        <div className="bb-sel-screen">
          <div className="bb-sel-backdrop" />
          <h1 className="bb-sel-title">Choose Your Hero</h1>
          <p className="bb-sel-subtitle">Who will fight {bossName}?</p>
          <div className="bb-sel-cards">
            <button
              type="button"
              className={
                "bb-sel-card bb-sel-adam bb-sel-card-left" +
                (selecting === "adam" ? " bb-sel-chosen" : "") +
                (selecting && selecting !== "adam" ? " bb-sel-dim" : "")
              }
              onClick={() => chooseHero("adam")}
              disabled={!!selecting}
            >
              <div className="bb-sel-img-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ASSET_PATHS.adamIdle}
                  alt="Adam"
                  className="bb-sel-img"
                />
              </div>
              <h2 className="bb-sel-name bb-sel-name-adam">ADAM</h2>
              <p className="bb-sel-desc">
                Brave and strong. Uses his Cyber Shield to block attacks.
              </p>
            </button>

            <div className="bb-sel-vs" aria-hidden="true">
              OR
            </div>

            <button
              type="button"
              className={
                "bb-sel-card bb-sel-layla bb-sel-card-right" +
                (selecting === "layla" ? " bb-sel-chosen" : "") +
                (selecting && selecting !== "layla" ? " bb-sel-dim" : "")
              }
              onClick={() => chooseHero("layla")}
              disabled={!!selecting}
            >
              <div className="bb-sel-img-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ASSET_PATHS.laylaIdle}
                  alt="Layla"
                  className="bb-sel-img"
                />
              </div>
              <h2 className="bb-sel-name bb-sel-name-layla">LAYLA</h2>
              <p className="bb-sel-desc">
                Smart and quick. Uses her Tech Tablet to blast enemies.
              </p>
            </button>
          </div>
        </div>
      )}

      {selectedHero && (
        <div
          ref={canvasHostRef}
          style={{ position: "absolute", inset: 0, zIndex: 0 }}
        />
      )}

      {selectedHero && !ready && !loadError && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#cbd5e1",
            fontSize: 14,
            letterSpacing: "0.08em",
            zIndex: 2,
          }}
        >
          Loading arena…
        </div>
      )}

      {selectedHero && loadError && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fca5a5",
            fontSize: 14,
            padding: 24,
            textAlign: "center",
            zIndex: 2,
          }}
        >
          Failed to load game: {loadError}
        </div>
      )}

      {/* HP bars */}
      {selectedHero && (
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 20,
          right: 20,
          display: "flex",
          gap: 24,
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #1e3a8a)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid #60a5fa",
              boxShadow: "0 0 10px rgba(59,130,246,0.5)",
              flexShrink: 0, fontSize: 14,
            }}
          >
            <span style={{ color: "#fff", fontWeight: 700 }}>H</span>
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: "#cbd5e1",
                letterSpacing: "0.08em",
                marginBottom: 4,
                textShadow: "0 1px 2px rgba(0,0,0,0.6)",
              }}
            >
              <span>{selectedHero === "layla" ? "LAYLA" : "ADAM"}</span>
              <span>{heroHp} / {HP_MAX}</span>
            </div>
            <div
              className={heroPct < 0.25 ? "bb-hp-bar bb-hp-low" : "bb-hp-bar"}
              style={{
                height: 20,
                background: "rgba(15,23,42,0.8)",
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid rgba(148,163,184,0.25)",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${heroPct * 100}%`,
                  background:
                    heroPct > 0.3
                      ? "linear-gradient(90deg, #3b82f6 0%, #10b981 100%)"
                      : "linear-gradient(90deg, #f97316 0%, #ef4444 100%)",
                  transition: "width 0.3s ease-out",
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: "#cbd5e1",
                letterSpacing: "0.08em",
                marginBottom: 4,
                textShadow: "0 1px 2px rgba(0,0,0,0.6)",
              }}
            >
              <span>{bossName}</span>
              <span>{bossHp} / {HP_MAX}</span>
            </div>
            <div
              className={bossPct < 0.25 ? "bb-hp-bar bb-hp-low" : "bb-hp-bar"}
              style={{
                height: 20,
                background: "rgba(15,23,42,0.8)",
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid rgba(148,163,184,0.25)",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${bossPct * 100}%`,
                  background: "linear-gradient(90deg, #ef4444 0%, #f97316 100%)",
                  transition: "width 0.3s ease-out",
                }}
              />
            </div>
          </div>
          <div
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #4c1d95)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid #a78bfa",
              boxShadow: "0 0 10px rgba(139,92,246,0.5)",
              flexShrink: 0, fontSize: 14,
            }}
          >
            <span style={{ color: "#fff", fontWeight: 700 }}>R</span>
          </div>
        </div>
      </div>
      )}

      {/* Combo counter */}
      {selectedHero && combo > 1 && (
        <div
          key={combo}
          style={{
            position: "absolute",
            top: 70,
            right: 20,
            pointerEvents: "none",
            animation: "bbComboPop 0.45s ease-out",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: Math.min(48, 24 + combo * 4),
            fontWeight: 700,
            color: "#fde047",
            textShadow: "0 0 14px rgba(250,204,21,0.7), 2px 2px 0 rgba(0,0,0,0.6)",
            letterSpacing: "-0.02em",
            zIndex: 2,
          }}
        >
          {combo}× COMBO
        </div>
      )}

      {/* Question panel */}
      {selectedHero && !result && q && (
        <div
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 16,
            background:
              "linear-gradient(180deg, rgba(15,23,42,0.96), rgba(30,27,75,0.96))",
            backdropFilter: "blur(10px)",
            border: "2px solid rgba(99,102,241,0.25)",
            borderRadius: 18,
            padding: "20px 22px",
            boxShadow: "0 -10px 40px rgba(59,130,246,0.1)",
            zIndex: 2,
          }}
        >
          <p
            style={{
              color: "#f1f5f9",
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 19,
              fontWeight: 700,
              marginBottom: 16,
              lineHeight: 1.3,
              textAlign: "center",
            }}
          >
            {q.question}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {q.answers.map((a, i) => {
              const isSelected = feedback?.index === i;
              const isCorrect = locked && i === q.correctIndex;
              const wrongHere = isSelected && !feedback?.correct;
              const classes =
                "bb-answer" +
                (isCorrect ? " bb-answer-correct" : "") +
                (wrongHere ? " bb-answer-wrong" : "") +
                (shakeWrong && wrongHere ? " bb-answer-shake" : "");
              const letter = ["A", "B", "C", "D"][i];
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={locked || !ready}
                  className={classes}
                >
                  <span className="bb-answer-letter">{letter}</span>
                  <span className="bb-answer-text">{a}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* End screen */}
      {selectedHero && result && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background:
              "radial-gradient(ellipse at center, rgba(10,14,26,0.86), rgba(10,14,26,0.96))",
            backdropFilter: "blur(6px)",
            animation: "bbFadeIn 0.5s ease-out",
            padding: 24,
            textAlign: "center",
            zIndex: 3,
          }}
        >
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 58,
              fontWeight: 700,
              color: result === "won" ? "#10b981" : "#ef4444",
              marginBottom: 8,
              letterSpacing: "-0.02em",
              textShadow:
                result === "won"
                  ? "0 0 30px rgba(16,185,129,0.6)"
                  : "0 0 30px rgba(239,68,68,0.6)",
            }}
          >
            {result === "won" ? "VICTORY!" : "DEFEATED"}
          </h2>
          <p style={{ color: "#cbd5e1", fontSize: 16, marginBottom: 32 }}>
            {result === "won"
              ? `You beat ${bossName}!`
              : `${bossName} got the better of you. Try again!`}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 24,
              marginBottom: 36,
              minWidth: 300,
            }}
          >
            {[
              { value: finalXp, label: "XP EARNED", color: "#3b82f6" },
              { value: `${finalAccuracy}%`, label: "ACCURACY", color: "#10b981" },
              { value: `${stats.maxCombo}×`, label: "MAX COMBO", color: "#fde047" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <p
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 36,
                    fontWeight: 700,
                    color: s.color,
                    textShadow: `0 0 12px ${s.color}55`,
                  }}
                >
                  {s.value}
                </p>
                <p style={{ color: "#94a3b8", fontSize: 11, letterSpacing: "0.06em" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={restart}
            style={{
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              color: "#fff",
              border: "none",
              padding: "14px 36px",
              borderRadius: 100,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(59,130,246,0.4)",
              letterSpacing: "0.02em",
            }}
          >
            Play Again
          </button>
        </div>
      )}

      <style>{`
        @keyframes bbFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes bbComboPop {
          0% { transform: scale(0.6); opacity: 0 }
          60% { transform: scale(1.15); opacity: 1 }
          100% { transform: scale(1); opacity: 1 }
        }
        @keyframes bbPulseLow {
          0%,100% { box-shadow: inset 0 1px 3px rgba(0,0,0,0.4) }
          50% { box-shadow: inset 0 1px 3px rgba(0,0,0,0.4), 0 0 14px rgba(239,68,68,0.7) }
        }
        @keyframes bbShakeWrong {
          0%,100% { transform: translateX(0) }
          20% { transform: translateX(-6px) }
          40% { transform: translateX(5px) }
          60% { transform: translateX(-4px) }
          80% { transform: translateX(3px) }
        }
        @keyframes bbCorrectPop {
          0% { transform: scale(1) }
          50% { transform: scale(1.04) }
          100% { transform: scale(1) }
        }
        .bb-hp-bar.bb-hp-low { animation: bbPulseLow 0.9s ease-in-out infinite }
        .bb-answer {
          display: flex; align-items: center; gap: 12px;
          background: rgba(15,23,42,0.95);
          color: #e2e8f0;
          border: 2px solid rgba(71,85,105,0.6);
          border-radius: 16px; padding: 14px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 600;
          cursor: pointer; text-align: left; line-height: 1.35;
          transition: background .2s ease, border-color .2s ease, transform .15s ease, box-shadow .2s ease;
        }
        .bb-answer:hover:not(:disabled) {
          border-color: #3b82f6;
          box-shadow: 0 0 18px rgba(59,130,246,0.35);
          transform: translateY(-1px);
        }
        .bb-answer:disabled { cursor: default }
        .bb-answer-letter {
          display: inline-flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(59,130,246,0.18);
          border: 1px solid rgba(96,165,250,0.4);
          color: #60a5fa;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700; font-size: 14px; flex-shrink: 0;
        }
        .bb-answer-text { flex: 1 }
        .bb-answer-correct {
          background: #10b981 !important; color: #fff !important;
          border-color: #34d399 !important;
          box-shadow: 0 0 24px rgba(16,185,129,0.55) !important;
          animation: bbCorrectPop .3s ease-out !important;
        }
        .bb-answer-correct .bb-answer-letter {
          background: rgba(255,255,255,0.25);
          border-color: #fff; color: #fff;
        }
        .bb-answer-wrong {
          background: #ef4444 !important; color: #fff !important;
          border-color: #fca5a5 !important;
          box-shadow: 0 0 24px rgba(239,68,68,0.55) !important;
        }
        .bb-answer-wrong .bb-answer-letter {
          background: rgba(255,255,255,0.25);
          border-color: #fff; color: #fff;
        }
        .bb-answer-shake { animation: bbShakeWrong .4s ease-in-out !important }

        /* — Character selection screen — */
        @keyframes bbSlideInLeft {
          from { transform: translateX(-120px); opacity: 0 }
          to { transform: translateX(0); opacity: 1 }
        }
        @keyframes bbSlideInRight {
          from { transform: translateX(120px); opacity: 0 }
          to { transform: translateX(0); opacity: 1 }
        }
        @keyframes bbVsPulse {
          0%,100% { transform: scale(1); text-shadow: 0 0 20px rgba(250,204,21,0.6), 0 0 40px rgba(250,204,21,0.3) }
          50% { transform: scale(1.12); text-shadow: 0 0 30px rgba(250,204,21,0.9), 0 0 60px rgba(250,204,21,0.5) }
        }
        @keyframes bbTitleGlow {
          0%,100% { text-shadow: 0 0 24px rgba(96,165,250,0.4), 0 0 48px rgba(167,139,250,0.25) }
          50% { text-shadow: 0 0 36px rgba(96,165,250,0.6), 0 0 72px rgba(167,139,250,0.45) }
        }
        @keyframes bbBackdrop {
          0% { background-position: 0% 0%, 100% 100% }
          100% { background-position: 100% 100%, 0% 0% }
        }

        .bb-sel-screen {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          background: #080c18;
          padding: 40px 24px;
          z-index: 5;
          overflow: hidden;
        }
        .bb-sel-backdrop {
          position: absolute; inset: 0;
          background:
            radial-gradient(circle at 20% 30%, rgba(59,130,246,0.18), transparent 45%),
            radial-gradient(circle at 80% 70%, rgba(16,185,129,0.15), transparent 45%);
          background-size: 120% 120%, 120% 120%;
          animation: bbBackdrop 12s ease-in-out infinite alternate;
          pointer-events: none;
        }
        .bb-sel-title {
          position: relative;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 40px; font-weight: 700;
          color: #fff;
          letter-spacing: -0.02em;
          margin: 0 0 8px;
          animation: bbTitleGlow 3s ease-in-out infinite;
        }
        .bb-sel-subtitle {
          position: relative;
          color: #94a3b8; font-size: 18px;
          margin: 0 0 40px;
          text-align: center;
        }
        .bb-sel-cards {
          position: relative;
          display: flex; align-items: center; justify-content: center;
          gap: 40px;
          flex-wrap: wrap;
        }
        .bb-sel-card {
          position: relative;
          width: 280px;
          background: #111827;
          border: 2px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 32px 28px;
          display: flex; flex-direction: column; align-items: center;
          color: #e2e8f0;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition:
            transform 0.3s ease-out,
            border-color 0.25s ease,
            box-shadow 0.25s ease,
            opacity 0.3s ease;
        }
        .bb-sel-card:disabled { cursor: default }
        .bb-sel-card-left { animation: bbSlideInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) both }
        .bb-sel-card-right { animation: bbSlideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) both }
        .bb-sel-adam:hover:not(:disabled) {
          border-color: #3b82f6;
          transform: translateY(-8px);
          box-shadow: 0 0 40px rgba(59,130,246,0.5);
        }
        .bb-sel-layla:hover:not(:disabled) {
          border-color: #34d399;
          transform: translateY(-8px);
          box-shadow: 0 0 40px rgba(52,211,153,0.5);
        }
        .bb-sel-chosen {
          transform: scale(1.05) !important;
        }
        .bb-sel-adam.bb-sel-chosen {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 60px rgba(59,130,246,0.7) !important;
        }
        .bb-sel-layla.bb-sel-chosen {
          border-color: #34d399 !important;
          box-shadow: 0 0 60px rgba(52,211,153,0.7) !important;
        }
        .bb-sel-dim { opacity: 0.4 }
        .bb-sel-img-wrap {
          height: 300px;
          display: flex; align-items: flex-end; justify-content: center;
          margin-bottom: 18px;
        }
        .bb-sel-img {
          height: 300px; width: auto;
          image-rendering: -webkit-optimize-contrast;
          filter: drop-shadow(0 8px 20px rgba(0,0,0,0.5));
          pointer-events: none;
        }
        .bb-sel-name {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 28px; font-weight: 700;
          margin: 0 0 10px; letter-spacing: -0.01em;
        }
        .bb-sel-name-adam { color: #3b82f6; text-shadow: 0 0 14px rgba(59,130,246,0.5) }
        .bb-sel-name-layla { color: #34d399; text-shadow: 0 0 14px rgba(52,211,153,0.5) }
        .bb-sel-desc {
          color: #cbd5e1; font-size: 14px; line-height: 1.45;
          margin: 0; text-align: center;
        }
        .bb-sel-vs {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 56px; font-weight: 700;
          color: #fde047;
          letter-spacing: -0.02em;
          animation: bbVsPulse 1.6s ease-in-out infinite;
          pointer-events: none;
        }

        @media (max-width: 740px) {
          .bb-sel-vs { font-size: 40px }
          .bb-sel-cards { gap: 20px }
          .bb-sel-card { width: 240px; padding: 22px 18px }
          .bb-sel-img, .bb-sel-img-wrap { height: 240px }
          .bb-sel-title { font-size: 32px }
          .bb-sel-subtitle { font-size: 15px; margin-bottom: 24px }
        }
      `}</style>
    </div>
  );
}
