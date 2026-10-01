import { RUBRIC_ELEMENTS, type Rubric, type RubricElement } from "@/app/ai-cleared/engine/types";
import { ELEMENT_WHY, FLUENT_COACH, type ElementScore, type FluentGrade, type FluentVerdict, type Move, type TurnScore } from "./grading";

/* The rules layer of the Fluent grader: element presence from the text,
 * repeated turns from word overlap, and the verdict arithmetic. Pure
 * functions; the browser runs them for an instant panel and the server
 * runs them again under the model. */

const PATTERNS: Record<RubricElement, RegExp[]> = {
  role: [/\byou are (a|an|the|my|our)\b/i, /\byou are (writing|drafting|acting|working|replying|answering|speaking|preparing)\b/i, /\b(write|draft|answer|reply|respond|speak) as (a|an|the|my|our)\b/i, /\bas (a|an|the|my|our) [a-z\s-]{2,40}?(,|:|\bwrite|\bdraft|\bsummar|\bexplain|\bprepare)/i, /\bact(ing)? as\b/i, /\bin the role of\b/i, /\bfrom the (perspective|point of view) of\b/i, /\bin the voice of\b/i],
  reader: [/\bfor (the|our|my|a|an) ([a-z-]+ ){0,3}(board|partner|partners|client|clients|manager|team|director|directors|ceo|cfo|coo|finance director|committee|trustees|customer|customers|staff|colleague|colleagues|reader|readers|audience|auditor|auditors|regulator|investor|investors|supplier|non-technical|new starter|new joiner)s?\b/i, /\b(who|which) will (read|use|see) (it|this)\b/i, /\b(reader|audience) (is|are|will be)\b/i, /\bto (the|our|my|a|an) ([a-z-]+ ){0,2}(board|partner|client|manager|director|customer|team)s?\b/i, /\bfor someone who\b/i, /\bfor a (non-|lay)/i],
  task: [/\b(summari[sz]e|draft|write|rewrite|list|compare|explain|extract|produce|prepare|create|turn .{3,60} into|convert|translate|analy[sz]e|rank|sort|identify|find|check|review|outline|plan|recommend|calculate|highlight|flag|classify|group|reply|respond|answer|give me|tell me|suggest|propose|describe|recap|minute|note)\b/i],
  format: [/\b(table|bullet(s|ed)?|bullet points?|numbered list|list of|memo|email|letter|headings?|sections?|paragraphs?|one-pager|one pager|slide|slides|summary box|checklist|q&a|faq|columns?|rows?|json|csv|subject line|two columns|three columns|in the form of|formatted as|as a (short )?(note|report|brief|table|list))\b/i],
  length: [/\b\d+\s*(words?|bullets?|points?|lines?|sentences?|paragraphs?|pages?|items?|rows?|slides?)\b/i, /\b(one|two|three|four|five|six|seven|eight|nine|ten|half a|a single)\s*(words?|bullets?|points?|lines?|sentences?|paragraphs?|pages?|items?|rows?|page|slide|slides)\b/i, /\b(under|no more than|at most|maximum of|max\.?|up to|within|not more than|no longer than)\s*(\d+|one|two|three|four|five|ten|twenty|fifty|a hundred|100|200|300)\b/i, /\b(one|a|single)[-\s]page\b/i, /\b(short|brief|concise|one-line|one line|two-line)\b/i],
  constraints: [/\b(tone|formal|informal|plain english|plain language|polite|firm|friendly|professional|neutral|no jargon|avoid|do not|don't|must (include|not|mention|say|cover|flag|state)|include|exclude|leave out|only use|use only|british (english|spelling)|uk spelling|no exclamation|keep .{2,30} out|without|deadline|by (monday|tuesday|wednesday|thursday|friday|end of|close of|noon|5pm|\d)|jurisdiction|in the style of|house style|our style|match the tone|flag anything|highlight any|point out|mention)\b/i],
  material: [/\b(attached|the attached|below|following|pasted|this (document|report|sheet|spreadsheet|table|email|thread|transcript|file|data|export|statement|letter|note|page)|the (document|report|sheet|spreadsheet|table|email|thread|transcript|file|data|export|statement|letter)|using the|based on the|from the|in the (report|sheet|document|file|data|export|thread|transcript)|selected text|this selection|what follows|here is|here's)\b/i, /\[[^\]]{2,40}\]/],
  scope: [/./],
};

/* More than one request in one prompt: two or more task verbs joined by
 * "and" or "also" or "then", or two questions. A heuristic, so the model
 * has the last word on scope. */
const SECOND_ASK = /\b(and (then|also)|also|as well as|then)\b\s+(summari[sz]e|draft|write|rewrite|list|compare|explain|extract|produce|prepare|create|translate|analy[sz]e|rank|identify|find|check|review|outline|plan|recommend|calculate|classify|reply|suggest|propose|describe)\b/i;

export function detectElements(prompt: string): Record<RubricElement, boolean> {
  const out = {} as Record<RubricElement, boolean>;
  for (const key of RUBRIC_ELEMENTS) {
    if (key === "scope") {
      const questions = (prompt.match(/\?/g) ?? []).length;
      out.scope = !(SECOND_ASK.test(prompt) || questions >= 2);
    } else {
      out[key] = PATTERNS[key].some((re) => re.test(prompt));
    }
  }
  return out;
}

const STOP = new Set(["the", "a", "an", "and", "or", "of", "to", "for", "in", "on", "it", "this", "that", "is", "are", "be", "with", "as", "at", "by", "from", "i", "me", "my", "we", "our", "you", "your", "please", "can", "could", "would", "into", "so", "if", "then"]);

function words(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9£\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1 && !STOP.has(w)),
  );
}

/* Jaccard overlap of the two texts' word sets, 0 to 1. */
export function similarity(a: string, b: string): number {
  const A = words(a);
  const B = words(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / (A.size + B.size - inter);
}

export const REPEAT_THRESHOLD = 0.7;

/* Rules mark a turn repeated when its words overlap an earlier turn by
 * seventy percent or more; every other turn is "moved" until the model
 * says otherwise. Turn one is always moved. */
export function classifyTurns(turns: string[]): Move[] {
  return turns.map((t, i) => {
    if (i === 0) return "moved";
    for (let j = 0; j < i; j++) if (similarity(t, turns[j]) >= REPEAT_THRESHOLD) return "repeated";
    return "moved";
  });
}

/* The verdict arithmetic from the design: the prompt half and the turn
 * half each give a verdict; the worse one stands. */
export function verdictFrom(requires: RubricElement[], elements: ElementScore[], turns: TurnScore[]): FluentVerdict {
  const byKey = new Map(elements.map((e) => [e.key, e.score]));
  let missing = 0;
  let weak = 0;
  for (const k of requires) {
    const s = byKey.get(k) ?? 0;
    if (s === 0) missing++;
    else if (s === 1) weak++;
  }
  const promptVerdict: FluentVerdict = requires.length === 0 ? "fluent" : missing === 0 && weak <= 1 ? "fluent" : missing <= 1 && weak <= 2 ? "nearly" : "notyet";
  const bad = turns.filter((t) => t.move !== "moved").length;
  const turnVerdict: FluentVerdict = bad === 0 ? "fluent" : bad === 1 ? "nearly" : "notyet";
  const rank: Record<FluentVerdict, number> = { fluent: 0, nearly: 1, notyet: 2 };
  return rank[promptVerdict] >= rank[turnVerdict] ? promptVerdict : turnVerdict;
}

/* Marks earned out of marks available: two per required element, two
 * per turn after the first. */
export function scoreFrom(requires: RubricElement[], elements: ElementScore[], turns: TurnScore[]): number {
  const byKey = new Map(elements.map((e) => [e.key, e.score]));
  let earned = 0;
  let available = 0;
  for (const k of requires) {
    available += 2;
    earned += byKey.get(k) ?? 0;
  }
  for (const t of turns) {
    if (t.i === 0) continue;
    available += 2;
    earned += t.move === "moved" ? 2 : t.move === "wandered" ? 1 : 0;
  }
  return available ? Math.round((earned / available) * 100) : 100;
}

/* The instant grade: presence from the rules, repeats from overlap, the
 * default lines. The model refines it. */
export function rulesGrade(args: { turns: string[]; rubric?: Rubric; followUp: boolean }): FluentGrade {
  const latest = args.turns[args.turns.length - 1] ?? "";
  const requires = args.rubric?.requires ?? [];
  /* In a kept conversation an element stated on an earlier send carries
   * forward: a follow-up that only fixes the length has not lost the
   * reader. Scope is judged on the latest send alone. */
  const present = detectElements(latest);
  if (args.followUp) {
    for (const earlier of args.turns.slice(0, -1)) {
      const e = detectElements(earlier);
      for (const key of RUBRIC_ELEMENTS) if (key !== "scope" && e[key]) present[key] = true;
    }
  }
  const elements: ElementScore[] = requires.map((key) => ({ key, score: present[key] ? 2 : 0, why: ELEMENT_WHY[key][present[key] ? 2 : 0] }));
  const moves = args.followUp ? classifyTurns(args.turns) : args.turns.map(() => "moved" as Move);
  const turns: TurnScore[] = moves.map((move, i) => ({ i, move, why: move === "repeated" ? "This turn restates an earlier one almost word for word." : i === 0 ? "The opening send." : "This turn changed something." }));
  const verdict = verdictFrom(requires, elements, turns);
  return { verdict, score: scoreFrom(requires, elements, turns), elements, turns, coach: FLUENT_COACH[verdict], source: "rules" };
}
