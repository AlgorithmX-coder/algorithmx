"use client";

/**
 * Lightweight wrapper around the browser Web Speech API (SpeechSynthesis).
 *
 * Differentiates three speaker types with pitch/rate so kids can tell the
 * characters apart:
 *   - adam   : slightly lower pitched, child-like
 *   - layla  : slightly higher pitched, child-like
 *   - raccoon: lower + slower, villain cadence
 *   - narrator: default adult voice for title cards
 *
 * The API is best-effort: the set of installed voices varies between
 * browsers/OSes, so we fall back gracefully when nothing matches.
 * SpeechSynthesis also requires a user gesture before it can speak — we
 * don't throw if it's blocked; audio just silently won't play.
 */

export type Speaker = "adam" | "layla" | "raccoon" | "narrator";

interface VoicePrefs {
  pitch: number;
  rate: number;
  /** Gender hint used when picking a voice by heuristic. */
  gender?: "female" | "male";
}

const PROFILES: Record<Speaker, VoicePrefs> = {
  adam: { pitch: 1.35, rate: 1.05, gender: "male" },
  layla: { pitch: 1.55, rate: 1.1, gender: "female" },
  raccoon: { pitch: 0.6, rate: 0.85, gender: "male" },
  narrator: { pitch: 1.0, rate: 1.0 },
};

let cachedVoices: SpeechSynthesisVoice[] | null = null;
function voices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  if (cachedVoices && cachedVoices.length > 0) return cachedVoices;
  const list = window.speechSynthesis.getVoices();
  if (list.length > 0) cachedVoices = list;
  return list;
}

function pickVoice(speaker: Speaker): SpeechSynthesisVoice | null {
  const v = voices();
  if (v.length === 0) return null;
  const prefs = PROFILES[speaker];
  // Prefer English voices.
  const en = v.filter((vv) => vv.lang.toLowerCase().startsWith("en"));
  const pool = en.length > 0 ? en : v;

  // Heuristic by voice name — Web Speech API doesn't expose gender directly.
  const nameHint = (v: SpeechSynthesisVoice) => v.name.toLowerCase();
  const female = ["female", "samantha", "victoria", "karen", "moira", "fiona", "susan", "tessa", "serena", "allison", "zira"];
  const male = ["male", "daniel", "alex", "fred", "oliver", "tom", "david", "rishi"];

  if (speaker === "raccoon") {
    // Pick a voice that sounds like a grumpy male if possible.
    const daniel = pool.find((vv) => nameHint(vv).includes("daniel"));
    if (daniel) return daniel;
    const anyMale = pool.find((vv) => male.some((m) => nameHint(vv).includes(m)));
    if (anyMale) return anyMale;
    return pool[0];
  }

  if (prefs.gender === "female") {
    const match = pool.find((vv) => female.some((f) => nameHint(vv).includes(f)));
    if (match) return match;
  }
  if (prefs.gender === "male") {
    const match = pool.find((vv) => male.some((m) => nameHint(vv).includes(m)));
    if (match) return match;
  }
  return pool[0];
}

/**
 * Speak `text` as `speaker`. Cancels any in-flight utterance first so a new
 * line doesn't queue behind the previous one.
 */
export function speak(text: string, speaker: Speaker = "narrator"): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  if (!text || !text.trim()) return;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    // Strip common markers that shouldn't be read out — emojis, quote chars.
    const clean = text
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
      .replace(/[☀-➿]/g, "")
      .replace(/[""''`]/g, "")
      .trim();
    if (!clean) return;
    const u = new SpeechSynthesisUtterance(clean);
    const prefs = PROFILES[speaker];
    u.pitch = prefs.pitch;
    u.rate = prefs.rate;
    u.volume = 1;
    const voice = pickVoice(speaker);
    if (voice) u.voice = voice;
    synth.speak(u);
  } catch {
    // Web Speech API is best-effort — silently fail on unsupported browsers.
  }
}

/** Stop any in-flight speech immediately. */
export function stopSpeaking(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* noop */
  }
}

/** Prime the voice list — some browsers load voices asynchronously. */
export function primeVoices(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const s = window.speechSynthesis;
  // Touch .getVoices() to trigger load.
  s.getVoices();
  if ("onvoiceschanged" in s) {
    s.onvoiceschanged = () => {
      cachedVoices = s.getVoices();
    };
  }
}
