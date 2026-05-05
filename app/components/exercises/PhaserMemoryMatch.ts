import * as Phaser from "phaser";
import type { MutableRefObject } from "react";
import type { PhaserExerciseCallbacks } from "./PhaserExercise";

/* ───────────────────────── DATA SHAPE ─────────────────────────
 * Same shape the React MemoryMatch consumed, so swapping is a
 * one-line change in the lesson player.
 */

export interface PhaserMemoryPair {
  term: string;
  match: string;
  /** Hex accent for the pair (used on borders + match particles). */
  colour: string;
}

export interface PhaserMemoryMatchData {
  pairs: PhaserMemoryPair[];
}

/* ───────────────────────── INTERNAL TYPES ───────────────────── */

interface CardSlot {
  /** Pair this card belongs to (0..N-1). */
  pairId: number;
  /** Which side of the pair: term or match. */
  side: "term" | "match";
  /** The text shown on the card front. */
  text: string;
  /** Pair accent colour (hex string with leading #). */
  colour: string;
  /** Pair accent as a 0xRRGGBB Phaser-friendly number. */
  colourInt: number;
}

interface CardObj {
  /** Container holding both faces — what we tween + tap. */
  container: Phaser.GameObjects.Container;
  /** Back face (the "Cyber Card" side, hides front when face-down). */
  back: Phaser.GameObjects.Container;
  /** Front face (the side with text — hidden until flipped). */
  front: Phaser.GameObjects.Container;
  slot: CardSlot;
  /** Position in the cards[] array — used for state lookups. */
  index: number;
  /** Currently in the flipped-up pile (waiting for match check). */
  flipped: boolean;
  /** Permanently matched — locked face-up, ignores taps. */
  matched: boolean;
}

/* ───────────────────────── PALETTE ─────────────────────────── */

const COLOR = {
  abyss: 0x04050d,
  midnight: 0x0f1530,
  twilight: 0x1a2147,
  cyan: 0x00e5ff,
  cyanSoft: 0x7df0ff,
  cosmic: 0x7c5cff,
  cream: 0xe8edff,
  mossLight: 0xa0ffb0,
  cardCream: 0xfffaf0,
  cardCreamShadow: 0xfdebcb,
  cardInk: 0x3b2615,
};

/* ───────────────────────── SCENE ──────────────────────────── */

export default class PhaserMemoryMatch extends Phaser.Scene {
  private cards: CardObj[] = [];
  private flippedStack: CardObj[] = [];
  private matchedPairs = 0;
  private totalPairs = 0;
  private wrongTries = 0;
  /** Locks input while a flip + check sequence is mid-flight. */
  private locked = false;

  private callbacksRef!: MutableRefObject<PhaserExerciseCallbacks | undefined>;

  constructor() {
    super({ key: "PhaserMemoryMatch" });
  }

  init() {
    const data = this.game.registry.get("sceneData") as PhaserMemoryMatchData | undefined;
    this.callbacksRef = this.game.registry.get("callbacks") as MutableRefObject<
      PhaserExerciseCallbacks | undefined
    >;

    if (!data?.pairs?.length) {
      console.warn("[PhaserMemoryMatch] no pairs supplied");
      return;
    }

    this.totalPairs = data.pairs.length;
    this.matchedPairs = 0;
    this.wrongTries = 0;
    this.flippedStack = [];
    this.locked = false;

    // Build a flat shuffled card list of 2N cards (one term + one match per pair).
    const slots: CardSlot[] = [];
    data.pairs.forEach((p, pairId) => {
      const colourInt = parseInt(p.colour.replace("#", ""), 16);
      slots.push({ pairId, side: "term", text: p.term, colour: p.colour, colourInt });
      slots.push({ pairId, side: "match", text: p.match, colour: p.colour, colourInt });
    });

    // Shuffle (Fisher-Yates).
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }

    // Stash on registry for create() to consume — we only finalise positions
    // once we know the canvas size.
    this.registry.set("__mm_slots", slots);
  }

  create() {
    const slots = this.registry.get("__mm_slots") as CardSlot[];
    if (!slots) return;

    /* ── Cosmic background ── */
    this.drawBackground();

    /* ── HUD ── */
    this.drawHud();

    /* ── Card grid ── */
    this.layoutCards(slots);

    /* ── Input ── */
    this.input.on("pointerdown", this.handlePointerDown, this);
  }

  /* ───────────────────────── BACKGROUND ───────────────────── */

  private drawBackground() {
    const { width, height } = this.scale;

    // Deep cosmic gradient — abyss → midnight → twilight at top
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x04050d, 0x04050d, 0x0f1530, 0x1a2147, 1);
    bg.fillRect(0, 0, width, height);

    // Faint stars — 60 specks at deterministic positions (fast loop, no perf hit)
    for (let i = 0; i < 60; i++) {
      const x = (i * 73.7) % width;
      const y = (i * 137.3) % height;
      const r = ((i * 7) % 3) / 2 + 0.4;
      const star = this.add.circle(x, y, r, 0xfff7e6);
      star.setAlpha(0.3 + ((i * 11) % 5) / 10);
      // Subtle twinkle
      this.tweens.add({
        targets: star,
        alpha: 0.7 + ((i * 11) % 4) / 10,
        duration: 1500 + (i * 41) % 1500,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
        delay: (i * 53) % 2000,
      });
    }

    // Two cosmic blobs — top-left cyan, bottom-right cosmic-violet
    const blobA = this.add.graphics();
    blobA.fillStyle(COLOR.cyan, 0.12);
    blobA.fillCircle(width * 0.15, height * 0.18, 220);
    blobA.setBlendMode(Phaser.BlendModes.ADD);

    const blobB = this.add.graphics();
    blobB.fillStyle(COLOR.cosmic, 0.14);
    blobB.fillCircle(width * 0.85, height * 0.82, 240);
    blobB.setBlendMode(Phaser.BlendModes.ADD);
  }

  /* ───────────────────────── HUD ──────────────────────────── */

  private hudPairsText!: Phaser.GameObjects.Text;
  private hudTriesText!: Phaser.GameObjects.Text;

  private drawHud() {
    const { width } = this.scale;

    // Top-centre title
    this.add
      .text(width / 2, 36, "MEMORY MATCH", {
        fontFamily: "ui-monospace, JetBrains Mono, monospace",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#7df0ff",
      })
      .setOrigin(0.5)
      .setLetterSpacing(8);

    // Sub-instruction
    this.add
      .text(width / 2, 64, "Match each term to its meaning", {
        fontFamily: "ui-rounded, Fredoka, system-ui, sans-serif",
        fontSize: "20px",
        color: "#e8edff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Top-left pair counter chip
    const chipBg = this.add.graphics();
    chipBg.fillStyle(0x0f1530, 0.78);
    chipBg.fillRoundedRect(20, 18, 130, 36, 18);
    chipBg.lineStyle(1, COLOR.cyanSoft, 0.45);
    chipBg.strokeRoundedRect(20, 18, 130, 36, 18);

    this.hudPairsText = this.add
      .text(85, 36, `0/${this.totalPairs} pairs`, {
        fontFamily: "ui-rounded, Fredoka, system-ui, sans-serif",
        fontSize: "14px",
        color: "#7df0ff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Top-right tries chip
    const triesChipBg = this.add.graphics();
    triesChipBg.fillStyle(0x0f1530, 0.78);
    triesChipBg.fillRoundedRect(width - 150, 18, 130, 36, 18);
    triesChipBg.lineStyle(1, 0xff5fb3, 0.45);
    triesChipBg.strokeRoundedRect(width - 150, 18, 130, 36, 18);

    this.hudTriesText = this.add
      .text(width - 85, 36, "0 tries", {
        fontFamily: "ui-rounded, Fredoka, system-ui, sans-serif",
        fontSize: "14px",
        color: "#ff9bcb",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
  }

  private updateHud() {
    this.hudPairsText.setText(`${this.matchedPairs}/${this.totalPairs} pairs`);
    this.hudTriesText.setText(`${this.wrongTries} ${this.wrongTries === 1 ? "miss" : "misses"}`);
  }

  /* ───────────────────────── CARD GRID ────────────────────── */

  private layoutCards(slots: CardSlot[]) {
    const { width, height } = this.scale;
    const cols = slots.length <= 8 ? 4 : slots.length <= 12 ? 4 : 5;
    const rows = Math.ceil(slots.length / cols);

    // Reserve space for HUD top + padding bottom
    const playTop = 110;
    const playBottom = height - 40;
    const playHeight = playBottom - playTop;

    const cardW = Math.min(180, (width - 80 - (cols - 1) * 18) / cols);
    const cardH = Math.min(220, (playHeight - (rows - 1) * 18) / rows);

    const gridW = cols * cardW + (cols - 1) * 18;
    const gridH = rows * cardH + (rows - 1) * 18;
    const startX = (width - gridW) / 2 + cardW / 2;
    const startY = playTop + (playHeight - gridH) / 2 + cardH / 2;

    slots.forEach((slot, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = startX + col * (cardW + 18);
      const y = startY + row * (cardH + 18);
      const card = this.makeCard(slot, idx, x, y, cardW, cardH);
      this.cards.push(card);

      // Stagger reveal — cards drop in from above
      card.container.setAlpha(0);
      card.container.y -= 30;
      this.tweens.add({
        targets: card.container,
        alpha: 1,
        y: y,
        duration: 450,
        delay: idx * 60,
        ease: "Back.out",
      });
    });
  }

  private makeCard(
    slot: CardSlot,
    index: number,
    x: number,
    y: number,
    w: number,
    h: number,
  ): CardObj {
    const container = this.add.container(x, y);

    // Back face — cyber chrome card
    const back = this.add.container(0, 0);
    {
      // Outer glow halo
      const halo = this.add.graphics();
      halo.fillStyle(slot.colourInt, 0.32);
      halo.fillRoundedRect(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12, 18);
      halo.setBlendMode(Phaser.BlendModes.ADD);

      // Card body — dark navy gradient
      const body = this.add.graphics();
      body.fillGradientStyle(0x1a2147, 0x1a2147, 0x0f1530, 0x0f1530, 1);
      body.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
      body.lineStyle(2, slot.colourInt, 0.55);
      body.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);

      // Inner cyan line — accent rim
      body.lineStyle(1, COLOR.cyanSoft, 0.18);
      body.strokeRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, 11);

      // Centre glyph — diamond pulse
      const glyph = this.add
        .text(0, 0, "◇", {
          fontFamily: "ui-monospace, JetBrains Mono, monospace",
          fontSize: "44px",
          color: "#7df0ff",
        })
        .setOrigin(0.5);
      glyph.setShadow(0, 0, "#00e5ff", 12, true, true);

      this.tweens.add({
        targets: glyph,
        scale: 1.1,
        duration: 1400,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });

      back.add([halo, body, glyph]);
    }

    // Front face — parchment with text (hidden initially)
    const front = this.add.container(0, 0);
    {
      const body = this.add.graphics();
      body.fillStyle(COLOR.cardCream, 1);
      body.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
      body.lineStyle(3, slot.colourInt, 1);
      body.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);

      // Coloured top accent stripe
      const stripe = this.add.graphics();
      stripe.fillStyle(slot.colourInt, 1);
      stripe.fillRoundedRect(-w / 2, -h / 2, w, 8, { tl: 14, tr: 14, bl: 0, br: 0 });

      // Side label — "TERM" or "MATCH"
      const sideLabel = this.add
        .text(0, -h / 2 + 22, slot.side === "term" ? "TERM" : "MATCH", {
          fontFamily: "ui-monospace, JetBrains Mono, monospace",
          fontSize: "10px",
          color: slot.colour,
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setLetterSpacing(4);

      // The text — wrapped to fit
      const text = this.add
        .text(0, 12, slot.text, {
          fontFamily: "ui-rounded, Fredoka, system-ui, sans-serif",
          fontSize: slot.text.length > 28 ? "13px" : slot.text.length > 18 ? "15px" : "17px",
          color: "#3b2615",
          fontStyle: "bold",
          align: "center",
          wordWrap: { width: w - 22, useAdvancedWrap: true },
        })
        .setOrigin(0.5);

      front.add([body, stripe, sideLabel, text]);
      front.setVisible(false);
    }

    container.add([back, front]);

    // Hit area sized to the card body
    container.setSize(w, h);
    container.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains);

    // Hover lift — only when face-down + game unlocked
    container.on("pointerover", () => {
      if (this.locked) return;
      const c = this.cards[index];
      if (!c || c.matched || c.flipped) return;
      this.tweens.add({
        targets: container,
        scale: 1.04,
        y: y - 4,
        duration: 180,
        ease: "Sine.out",
      });
    });
    container.on("pointerout", () => {
      const c = this.cards[index];
      if (!c) return;
      if (c.flipped || c.matched) return;
      this.tweens.add({
        targets: container,
        scale: 1,
        y,
        duration: 240,
        ease: "Sine.out",
      });
    });

    return {
      container,
      back,
      front,
      slot,
      index,
      flipped: false,
      matched: false,
    };
  }

  /* ───────────────────────── INPUT ────────────────────────── */

  private handlePointerDown(_pointer: Phaser.Input.Pointer, targets: Phaser.GameObjects.GameObject[]) {
    if (this.locked) return;
    if (!targets || !targets.length) return;
    const hit = targets[0];
    const card = this.cards.find((c) => c.container === hit);
    if (!card) return;
    if (card.flipped || card.matched) return;
    this.flipUp(card);
  }

  /* ───────────────────────── FLIP + MATCH LOGIC ───────────── */

  private flipUp(card: CardObj) {
    card.flipped = true;
    this.flippedStack.push(card);
    this.tapPulse(card);
    this.flipAnimation(card, true);

    if (this.flippedStack.length === 2) {
      this.locked = true;
      this.time.delayedCall(420, () => this.checkMatch());
    }
  }

  private tapPulse(card: CardObj) {
    // Brief scale pop on tap — visceral feedback
    this.tweens.add({
      targets: card.container,
      scale: 0.96,
      duration: 80,
      yoyo: true,
      ease: "Sine.out",
    });
  }

  private flipAnimation(card: CardObj, toFront: boolean) {
    const { container, front, back } = card;
    // Squash X to 0, swap visibility, scale back to 1.
    this.tweens.add({
      targets: container,
      scaleX: 0,
      duration: 160,
      ease: "Cubic.in",
      onComplete: () => {
        front.setVisible(toFront);
        back.setVisible(!toFront);
      },
    });
    this.tweens.add({
      targets: container,
      scaleX: 1,
      delay: 160,
      duration: 200,
      ease: "Back.out",
    });
  }

  private checkMatch() {
    const [a, b] = this.flippedStack;
    if (!a || !b) {
      this.locked = false;
      return;
    }

    // Pair matches when both are from the same pairId AND opposite sides.
    const isMatch = a.slot.pairId === b.slot.pairId && a.slot.side !== b.slot.side;

    if (isMatch) {
      this.onPairMatched(a, b);
    } else {
      this.onPairMismatched(a, b);
    }
  }

  private onPairMatched(a: CardObj, b: CardObj) {
    a.matched = true;
    b.matched = true;
    this.matchedPairs += 1;
    this.flippedStack = [];
    this.locked = false;
    this.updateHud();

    // Glow + scale pop — "you matched these"
    [a, b].forEach((card) => {
      this.tweens.add({
        targets: card.container,
        scale: 1.1,
        duration: 220,
        yoyo: true,
        ease: "Sine.out",
      });
      this.matchSparkle(card.container.x, card.container.y, card.slot.colourInt);
    });

    this.callbacksRef.current?.onCorrect?.();

    // Win condition
    if (this.matchedPairs >= this.totalPairs) {
      this.time.delayedCall(900, () => this.onWin());
    }
  }

  private onPairMismatched(a: CardObj, b: CardObj) {
    this.wrongTries += 1;
    this.updateHud();

    // Subtle shake + colour flash on both cards
    [a, b].forEach((card) => {
      this.tweens.add({
        targets: card.container,
        x: card.container.x - 6,
        duration: 50,
        yoyo: true,
        repeat: 3,
        ease: "Sine.inOut",
        onComplete: () => {
          card.container.x = (a === card)
            ? card.container.x  // already settled
            : card.container.x;
        },
      });
    });

    this.cameras.main.shake(180, 0.003);
    this.callbacksRef.current?.onWrong?.();

    // After ~900ms flip them back face-down
    this.time.delayedCall(900, () => {
      [a, b].forEach((card) => {
        card.flipped = false;
        this.flipAnimation(card, false);
      });
      this.flippedStack = [];
      this.locked = false;
    });
  }

  /* ───────────────────────── PARTICLES ────────────────────── */

  private matchSparkle(x: number, y: number, colour: number) {
    // Spawn 12 little stars that burst outward + fade.
    const starColours = [colour, COLOR.cyan, COLOR.cosmic, COLOR.cream];

    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.4;
      const speed = 90 + Math.random() * 80;
      const c = starColours[i % starColours.length];

      const star = this.add.star(x, y, 5, 4, 8, c);
      star.setAlpha(1);
      star.setScale(0.5 + Math.random() * 0.5);
      star.setBlendMode(Phaser.BlendModes.ADD);

      this.tweens.add({
        targets: star,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed - 30, // bias upward
        scale: 0,
        alpha: 0,
        duration: 700 + Math.random() * 300,
        ease: "Cubic.out",
        onComplete: () => star.destroy(),
      });
    }

    // Halo flash
    const halo = this.add.circle(x, y, 30, colour, 0.6);
    halo.setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: halo,
      radius: 80,
      alpha: 0,
      scale: 1.4,
      duration: 500,
      ease: "Cubic.out",
      onComplete: () => halo.destroy(),
    });
  }

  /* ───────────────────────── WIN ──────────────────────────── */

  private onWin() {
    // Stars based on misses: 0 → 3 stars, 1-2 → 2 stars, 3+ → 1 star
    const stars: 1 | 2 | 3 = this.wrongTries === 0 ? 3 : this.wrongTries <= 2 ? 2 : 1;

    // Big celebratory burst at centre
    const { width, height } = this.scale;
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 200 + Math.random() * 200;
      const colour = [COLOR.cyan, COLOR.cosmic, 0xff5fb3, 0xffd158][i % 4];
      const star = this.add.star(width / 2, height / 2, 5, 6, 12, colour);
      star.setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: star,
        x: width / 2 + Math.cos(angle) * speed,
        y: height / 2 + Math.sin(angle) * speed,
        scale: 0,
        alpha: 0,
        duration: 1200,
        ease: "Cubic.out",
        onComplete: () => star.destroy(),
      });
    }

    // Win banner
    const bannerBg = this.add.graphics();
    bannerBg.fillStyle(0x0f1530, 0.92);
    bannerBg.fillRoundedRect(width / 2 - 200, height / 2 - 60, 400, 120, 18);
    bannerBg.lineStyle(2, COLOR.cyanSoft, 0.7);
    bannerBg.strokeRoundedRect(width / 2 - 200, height / 2 - 60, 400, 120, 18);
    bannerBg.setAlpha(0);

    const winText = this.add
      .text(width / 2, height / 2 - 18, "ALL MATCHED!", {
        fontFamily: "ui-rounded, Fredoka, system-ui, sans-serif",
        fontSize: "32px",
        color: "#7df0ff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setAlpha(0);
    winText.setLetterSpacing(2);

    const starsText = this.add
      .text(width / 2, height / 2 + 22, "★ ".repeat(stars).trim(), {
        fontFamily: "ui-rounded, Fredoka, system-ui, sans-serif",
        fontSize: "28px",
        color: "#ffd158",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: [bannerBg, winText, starsText],
      alpha: 1,
      duration: 360,
      ease: "Cubic.out",
    });

    // Hand off to React after a beat
    this.time.delayedCall(1800, () => {
      this.callbacksRef.current?.onComplete?.(stars);
    });
  }
}
