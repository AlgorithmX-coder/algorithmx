"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { W } from "../../tokens";
import type { WordBlock, WordComment, WordDoc, WordStyle } from "../types";
import { PLACEHOLDER, STYLES, WORD, blockId, changeIssue, ignoreIssue, issues as allIssues, opsOf, revisions, settleAll, settleIn, sizeOf, withText, wordCount, type Issue, type Revision } from "../word";
import { Footer, Icon, LINE, Letterhead, WORD_CSS, blockCss, blockMargin, listNumbers } from "./WordParts";

/* Word's window around one document: the title bar, the ribbon (Home,
 * Insert, Review, and File for the app to fill), the page, the panes for
 * spelling and comments, and the status bar with the word count and zoom.
 *
 * The document is data (a list of styled paragraphs, tables and form
 * fields, office/types). Each paragraph is its own small editable box, and
 * every keystroke is turned into a change to that data rather than left to
 * the browser, so styles, tracked changes and placeholders stay exact and a
 * check can read them. Typing feels like Word: Enter starts a new
 * paragraph (and a new bullet in a list), Backspace at the start of a
 * bullet takes the bullet off, a click on a [placeholder] selects all of it
 * so typing replaces it, Tab moves round a table and adds a row at the end,
 * and Ctrl+Z, Ctrl+Y, Ctrl+B, Ctrl+I, Ctrl+U and Ctrl+S work.
 *
 * Bold, italic, underline and size apply to the whole paragraph the cursor
 * is in: the simplification that lets a check tell "Heading 1" from Normal
 * text made bold and bigger (criteria WD-1). */

export interface WordEditorProps {
  doc: WordDoc;
  onChange: (doc: WordDoc) => void;
  /* Changes when another document is opened, to start undo afresh. */
  docKey: string | number;
  name: string;
  status?: string;
  /* The File tab; left off when there is nowhere to save (some practice). */
  onFile?: () => void;
  onSave?: () => void;
  /* Buttons at the right of the title bar (Close). */
  extra?: ReactNode;
  /* The ribbon tab to open on. */
  startTab?: Tab;
}

type Tab = "home" | "insert" | "review";

type EditOp =
  | { kind: "insert"; start: number; end: number; text: string }
  | { kind: "delete"; start: number; end: number; dir: "back" | "fwd" | "wordBack" | "wordFwd" }
  | { kind: "enter"; start: number; end: number }
  | { kind: "sync"; text: string; start: number; end: number };

interface Caret {
  target: string;
  start: number;
  end: number;
}

/* A target is a paragraph ("id") or a table cell ("id:row:col"). */
const cellTarget = (id: string, r: number, c: number) => `${id}:${r}:${c}`;
function parseTarget(t: string): { id: string; cell?: [number, number] } {
  const m = t.match(/^(.*):(\d+):(\d+)$/);
  return m ? { id: m[1], cell: [Number(m[2]), Number(m[3])] } : { id: t };
}

const SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36];
const GALLERY: WordStyle[] = ["normal", "title", "h1", "h2"];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* Someone else's changes are dealt with by Accept and Reject, not typed
 * over, so a paragraph holding them can't be typed in until they are. */
const lockedBy = (b: WordBlock) => (b.base !== undefined && b.revBy !== "You" ? b.revBy : undefined);

/* ── the caret, counted in the paragraph's own letters ───────────────── */

/* Text struck through as deleted is on show but isn't in the paragraph, so
 * it never counts. */
function offsetIn(el: HTMLElement, node: Node, off: number): number {
  if (!el.contains(node)) return node.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING ? 0 : (readText(el)?.length ?? 0);
  const r = document.createRange();
  r.setStart(el, 0);
  r.setEnd(node, off);
  const frag = r.cloneContents();
  frag.querySelectorAll("[data-del]").forEach((n) => n.remove());
  return (frag.textContent ?? "").length;
}

function readText(el: HTMLElement): string {
  const c = el.cloneNode(true) as HTMLElement;
  c.querySelectorAll("[data-del]").forEach((n) => n.remove());
  return (c.textContent ?? "").replace(/ /g, " ").replace(/\n/g, " ");
}

function getSel(el: HTMLElement): { start: number; end: number } | null {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return null;
  const r = sel.getRangeAt(0);
  if (!el.contains(r.startContainer) && !el.contains(r.endContainer)) return null;
  const a = offsetIn(el, r.startContainer, r.startOffset);
  const b = offsetIn(el, r.endContainer, r.endOffset);
  return { start: Math.min(a, b), end: Math.max(a, b) };
}

function pointAt(el: HTMLElement, pos: number): [Node, number] {
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let left = pos;
  let last: Text | null = null;
  for (let n = walk.nextNode() as Text | null; n; n = walk.nextNode() as Text | null) {
    if ((n.parentElement as HTMLElement | null)?.closest("[data-del]")) continue;
    if (left <= n.length) return [n, left];
    left -= n.length;
    last = n;
  }
  return last ? [last, last.length] : [el, 0];
}

function setSel(el: HTMLElement, start: number, end = start) {
  const sel = window.getSelection();
  if (!sel) return;
  const r = document.createRange();
  const [a, ao] = pointAt(el, start);
  const [b, bo] = pointAt(el, end);
  try {
    r.setStart(a, ao);
    r.setEnd(b, bo);
    sel.removeAllRanges();
    sel.addRange(r);
  } catch {
    /* the paragraph changed under the caret: leave it */
  }
}

/* Where the caret sits in its box: on the first line, the last, both. */
function caretLines(el: HTMLElement): { first: boolean; last: boolean } {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return { first: true, last: true };
  const rect = sel.getRangeAt(0).getClientRects()[0];
  if (!rect) return { first: true, last: true };
  const box = el.getBoundingClientRect();
  return { first: rect.top < box.top + rect.height * 0.8, last: rect.bottom > box.bottom - rect.height * 0.8 };
}

/* Bring something on the page into view by scrolling the page's own
 * canvas, never the course page around the window. */
function reveal(canvas: HTMLElement | null, el: Element | null | undefined, rect?: DOMRect) {
  if (!canvas || !el) return;
  const r = rect ?? el.getBoundingClientRect();
  const box = canvas.getBoundingClientRect();
  if (r.top < box.top + 30) canvas.scrollTop -= box.top + 60 - r.top;
  else if (r.bottom > box.bottom - 30) canvas.scrollTop += r.bottom - box.bottom + 60;
}

/* ── one editable box: a paragraph or a table cell ─────────────────────── */

function Editable({
  target,
  html,
  editable,
  style,
  className,
  label,
  onOp,
  onKey,
  onFocus,
}: {
  target: string;
  html: string;
  editable: boolean;
  style?: CSSProperties;
  className?: string;
  label: string;
  onOp: (target: string, op: EditOp) => void;
  onKey: (target: string, e: ReactKeyboardEvent<HTMLDivElement>, el: HTMLDivElement) => void;
  onFocus: (target: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const written = useRef<string | null>(null);
  const dirty = useRef(false);
  const composing = useRef(false);
  const live = useRef({ onOp, target });
  useLayoutEffect(() => {
    live.current = { onOp, target };
  });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || (written.current === html && !dirty.current)) return;
    const keep = document.activeElement === el ? getSel(el) : null;
    el.innerHTML = html;
    written.current = html;
    dirty.current = false;
    if (keep) setSel(el, keep.start, keep.end);
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const send = (op: EditOp) => live.current.onOp(live.current.target, op);
    const before = (e: InputEvent) => {
      if (e.isComposing || composing.current) return;
      const s = getSel(el);
      if (!s) return;
      const t = e.inputType;
      const data = e.data ?? e.dataTransfer?.getData("text/plain") ?? "";
      if (t === "insertText" || t === "insertReplacementText" || t === "insertFromPaste" || t === "insertFromDrop" || t === "insertFromYank") {
        e.preventDefault();
        if (data) send({ kind: "insert", ...s, text: data });
      } else if (t === "insertParagraph" || t === "insertLineBreak") {
        e.preventDefault();
        send({ kind: "enter", ...s });
      } else if (t.startsWith("delete")) {
        e.preventDefault();
        const dir = t === "deleteWordBackward" ? "wordBack" : t === "deleteWordForward" ? "wordFwd" : /Forward$/.test(t) ? "fwd" : "back";
        send({ kind: "delete", ...s, dir });
      } else if (t.startsWith("format") || t.startsWith("history")) {
        /* Ctrl+B and Ctrl+Z are handled by the window's own keys */
        e.preventDefault();
      }
    };
    const input = () => {
      dirty.current = true;
      if (composing.current) return;
      const s = getSel(el) ?? { start: 0, end: 0 };
      send({ kind: "sync", text: readText(el), ...s });
    };
    const compStart = () => (composing.current = true);
    const compEnd = () => {
      composing.current = false;
      input();
    };
    el.addEventListener("beforeinput", before);
    el.addEventListener("input", input);
    el.addEventListener("compositionstart", compStart);
    el.addEventListener("compositionend", compEnd);
    return () => {
      el.removeEventListener("beforeinput", before);
      el.removeEventListener("input", input);
      el.removeEventListener("compositionstart", compStart);
      el.removeEventListener("compositionend", compEnd);
    };
  }, []);

  return (
    <div
      ref={ref}
      role="textbox"
      aria-multiline="true"
      aria-label={label}
      data-target={target}
      contentEditable={editable}
      suppressContentEditableWarning
      spellCheck={false}
      className={className}
      onFocus={() => onFocus(target)}
      onKeyDown={(e) => onKey(target, e, e.currentTarget)}
      onClick={(e) => {
        /* a click on a placeholder selects all of it, as Word does */
        const ph = (e.target as HTMLElement).closest("[data-ph]");
        const sel = window.getSelection();
        if (ph && sel?.isCollapsed) {
          const r = document.createRange();
          r.selectNodeContents(ph);
          sel.removeAllRanges();
          sel.addRange(r);
        }
      }}
      style={{ whiteSpace: "pre-wrap", minHeight: `${LINE}em`, tabSize: 4, ...style }}
    />
  );
}

/* A paragraph as marked-up HTML: tracked changes coloured, struck or
 * underlined; spelling and grammar underlined; placeholders shaded. */
function blockHtml(b: WordBlock, iss: Issue[], onIssue: Issue | null, onHunk: number | null): string {
  const ops = opsOf(b);
  const who = b.revBy === "You" ? "wd-you" : "wd-them";
  const text = b.text;
  const n = text.length;
  const issueAt = new Array<number>(n).fill(-1);
  iss.forEach((x, k) => {
    for (let p = x.start; p < x.end && p < n; p++) issueAt[p] = k;
  });
  const ph = new Array<boolean>(n).fill(false);
  for (const m of text.matchAll(PLACEHOLDER)) for (let p = m.index!; p < m.index! + m[0].length; p++) ph[p] = true;
  let pos = 0;
  let html = "";
  for (const o of ops) {
    if (o.t === "del") {
      html += `<span data-del="1" contenteditable="false" class="wd-del ${who}${o.hunk === onHunk ? " wd-cur" : ""}" data-rev="${esc(b.id)}:${o.hunk}" title="Deleted: ${esc(b.revBy ?? "")}">${esc(o.s)}</span>`;
      continue;
    }
    const end = pos + o.s.length;
    let k = pos;
    while (k < end) {
      let j = k + 1;
      while (j < end && issueAt[j] === issueAt[k] && ph[j] === ph[k]) j++;
      const cls: string[] = [];
      const attrs: string[] = [];
      if (o.t === "ins") {
        cls.push("wd-ins", who);
        if (o.hunk === onHunk) cls.push("wd-cur");
        attrs.push(`data-rev="${esc(b.id)}:${o.hunk}"`, `title="Inserted: ${esc(b.revBy ?? "")}"`);
      }
      const ik = issueAt[k];
      if (ik >= 0) {
        const is = iss[ik];
        cls.push(is.kind === "spelling" ? "wd-sp" : "wd-gr");
        if (onIssue && onIssue.blockId === b.id && onIssue.start === is.start) cls.push("wd-on");
        attrs.push(`data-issue="${is.start}"`);
      }
      if (ph[k]) {
        cls.push("wd-ph");
        attrs.push('data-ph="1"');
      }
      const t = esc(text.slice(k, j));
      html += cls.length || attrs.length ? `<span class="${cls.join(" ")}" ${attrs.join(" ")}>${t}</span>` : t;
      k = j;
    }
    pos = end;
  }
  return html || "<br>";
}

const prevBoundary = (s: string, i: number) => {
  let k = i;
  while (k > 0 && /\s/.test(s[k - 1])) k--;
  while (k > 0 && !/\s/.test(s[k - 1])) k--;
  return k;
};
const nextBoundary = (s: string, i: number) => {
  let k = i;
  while (k < s.length && !/\s/.test(s[k])) k++;
  while (k < s.length && /\s/.test(s[k])) k++;
  return k;
};
const placeholderAt = (s: string, i: number) => {
  for (const m of s.matchAll(PLACEHOLDER)) if (i > m.index! && i < m.index! + m[0].length) return [m.index!, m.index! + m[0].length] as const;
  return null;
};

/* ── the window ─────────────────────────────────────────────────────── */

export default function WordEditor({ doc, onChange, docKey, name, status, onFile, onSave, extra, startTab = "home" }: WordEditorProps) {
  const [tab, setTab] = useState<Tab>(startTab);
  const [active, setActive] = useState<string | null>(null);
  const [pane, setPane] = useState<"spelling" | null>(null);
  const [issueAt, setIssueAt] = useState(0);
  const [pick, setPick] = useState(0);
  const [rev, setRev] = useState<{ blockId: string; hunk: number } | null>(null);
  const [draft, setDraft] = useState<{ blockId: string; text: string } | null>(null);
  const [menu, setMenu] = useState<"table" | "accept" | "reject" | null>(null);
  const [hover, setHover] = useState<[number, number]>([0, 0]);
  const [zoom, setZoom] = useState<number | null>(null);
  const [canvasW, setCanvasW] = useState(900);
  const [rootW, setRootW] = useState(1000);
  const [ctx, setCtx] = useState<{ x: number; y: number; issue: Issue } | null>(null);
  const [pages, setPages] = useState(1);
  const [focusComment, setFocusComment] = useState<string | null>(null);

  const docRef = useRef(doc);
  useLayoutEffect(() => {
    docRef.current = doc;
  }, [doc]);
  /* whether Undo and Redo have anything to do, for their buttons */
  const [history, setHistory] = useState({ back: 0, fwd: 0 });
  const past = useRef<WordDoc[]>([]);
  const future = useRef<WordDoc[]>([]);
  const lastGroup = useRef<{ key: string; at: number } | null>(null);
  const caretReq = useRef<Caret | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    past.current = [];
    future.current = [];
    lastGroup.current = null;
    setHistory({ back: 0, fwd: 0 });
    /* the cursor starts at the top, as Word's does */
    const first = docRef.current.blocks.find((b) => !b.table && !b.field && !lockedBy(b) && b.revPara !== "del");
    setActive(first?.id ?? null);
    setRev(null);
    setDraft(null);
    setPane(null);
  }, [docKey]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const root = rootRef.current;
    const ro = new ResizeObserver(() => {
      setCanvasW(el.clientWidth);
      if (root) setRootW(root.clientWidth);
    });
    ro.observe(el);
    if (root) ro.observe(root);
    setCanvasW(el.clientWidth);
    if (root) setRootW(root.clientWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = pageRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setPages(Math.max(1, Math.ceil((el.offsetHeight - 2) / WORD.pageH))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* after every change, put the caret where the change left it */
  useLayoutEffect(() => {
    const c = caretReq.current;
    if (!c) return;
    caretReq.current = null;
    const el = rootRef.current?.querySelector<HTMLElement>(`[data-target="${CSS.escape(c.target)}"]`);
    if (!el) return;
    el.focus({ preventScroll: true });
    setSel(el, c.start, c.end);
    const r = window.getSelection()?.rangeCount ? window.getSelection()!.getRangeAt(0).getBoundingClientRect() : null;
    reveal(canvasRef.current, el, r && r.height ? r : undefined);
  });

  /* a narrow window (a phone) shows the page the width of the screen, as
   * Word's mobile view does, with any pane below it */
  const mobile = rootW < 640;
  const fit = Math.max(0.5, Math.min(1, (canvasW - 32) / WORD.pageW));
  const z = mobile ? 1 : (zoom ?? fit);
  const pageW = mobile ? Math.max(260, canvasW - 16) : WORD.pageW;
  const pad = mobile ? 20 : WORD.margin;

  const commit = (next: WordDoc, caret?: Caret, group?: string) => {
    const now = Date.now();
    const same = group && lastGroup.current?.key === group && now - lastGroup.current.at < 1500;
    if (!same) {
      past.current.push(docRef.current);
      if (past.current.length > 300) past.current.shift();
    }
    lastGroup.current = group ? { key: group, at: now } : null;
    future.current = [];
    setHistory({ back: past.current.length, fwd: 0 });
    if (caret) caretReq.current = caret;
    docRef.current = next;
    onChange(next);
  };

  const undo = (redo = false) => {
    const from = redo ? future.current : past.current;
    const to = redo ? past.current : future.current;
    const prev = from.pop();
    if (!prev) return;
    to.push(docRef.current);
    lastGroup.current = null;
    setHistory({ back: past.current.length, fwd: future.current.length });
    if (active && prev.blocks.some((b) => b.id === parseTarget(active).id)) {
      const t = parseTarget(active);
      const b = prev.blocks.find((x) => x.id === t.id)!;
      const len = t.cell ? (b.table?.[t.cell[0]]?.[t.cell[1]] ?? "").length : b.text.length;
      caretReq.current = { target: active, start: len, end: len };
    }
    docRef.current = prev;
    onChange(prev);
  };

  const blocks = doc.blocks;
  const replace = (d: WordDoc, nb: WordBlock): WordDoc => ({ ...d, blocks: d.blocks.map((b) => (b.id === nb.id ? nb : b)) });
  const by = doc.tracking ? "You" : undefined;
  const activeBlock = active ? (blocks.find((b) => b.id === parseTarget(active).id) ?? null) : null;
  const activeIsPara = !!activeBlock && !activeBlock.table && !activeBlock.field && !(active && parseTarget(active).cell);

  /* every box the caret can move between, in reading order */
  const targets: string[] = [];
  for (const b of blocks) {
    if (b.field || b.revPara === "del") continue;
    if (b.table) b.table.forEach((r, ri) => r.forEach((_, ci) => targets.push(cellTarget(b.id, ri, ci))));
    else if (!lockedBy(b)) targets.push(b.id);
  }
  const textOf = (t: string) => {
    const p = parseTarget(t);
    const b = blocks.find((x) => x.id === p.id);
    return !b ? "" : p.cell ? (b.table?.[p.cell[0]]?.[p.cell[1]] ?? "") : b.text;
  };
  const goTo = (t: string | undefined, where: "start" | "end") => {
    if (!t) return false;
    const el = rootRef.current?.querySelector<HTMLElement>(`[data-target="${CSS.escape(t)}"]`);
    if (!el) return false;
    el.focus({ preventScroll: true });
    const n = where === "start" ? 0 : textOf(t).length;
    setSel(el, n, n);
    reveal(canvasRef.current, el);
    return true;
  };

  /* ── typing ── */
  const onOp = (target: string, op: EditOp) => {
    const d = docRef.current;
    const { id, cell } = parseTarget(target);
    const b = d.blocks.find((x) => x.id === id);
    if (!b) return;
    const cur = cell ? (b.table?.[cell[0]]?.[cell[1]] ?? "") : b.text;
    const setText = (next: string, at: number, group?: string) => {
      const nb: WordBlock = cell ? { ...b, table: b.table!.map((row, ri) => row.map((x, ci) => (ri === cell[0] && ci === cell[1] ? next : x))) } : withText(b, next, d.tracking ? "You" : undefined);
      commit(replace(d, nb), { target, start: at, end: at }, group ? `${group}:${target}` : undefined);
    };
    const index = d.blocks.indexOf(b);

    if (op.kind === "sync") return setText(op.text, op.start, "type");

    if (op.kind === "insert") {
      let { start, end } = op;
      if (start === end && !cell) {
        const p = placeholderAt(cur, start);
        if (p) [start, end] = p;
      }
      const text = op.text.replace(/\r/g, "");
      const paras = text.split("\n");
      if (paras.length === 1 || cell) return setText(cur.slice(0, start) + text.replace(/\n/g, " ") + cur.slice(end), start + text.replace(/\n/g, " ").length, "type");
      /* pasting several paragraphs makes several paragraphs */
      const lastText = paras[paras.length - 1];
      const first = withText(b, cur.slice(0, start) + paras[0], by);
      const made: WordBlock[] = paras.slice(1).map((p, i, all) => {
        const t = i === all.length - 1 ? p + cur.slice(end) : p;
        const nb: WordBlock = { id: blockId(), style: b.style === "bullet" || b.style === "number" ? b.style : "normal", text: "" };
        return by && t ? { ...withText(nb, t, by), revPara: "ins" } : { ...nb, text: t };
      });
      const all = [...d.blocks.slice(0, index), first, ...made, ...d.blocks.slice(index + 1)];
      return commit({ ...d, blocks: all }, { target: made[made.length - 1].id, start: lastText.length, end: lastText.length });
    }

    if (op.kind === "delete") {
      const { start, end, dir } = op;
      if (start !== end) return setText(cur.slice(0, start) + cur.slice(end), start, "del");
      const back = dir === "back" || dir === "wordBack";
      if (back) {
        if (start === 0) return cell ? undefined : mergeBack(b);
        const p = !cell ? (placeholderAt(cur, start) ?? (cur[start - 1] === "]" ? placeholderAt(cur, start - 1) : null)) : null;
        const from = p ? p[0] : dir === "wordBack" ? prevBoundary(cur, start) : start - 1;
        const to = p ? p[1] : start;
        return setText(cur.slice(0, from) + cur.slice(to), from, "del");
      }
      if (start >= cur.length) return cell ? undefined : mergeForward(b);
      const p = !cell ? placeholderAt(cur, start + (cur[start] === "[" ? 1 : 0)) : null;
      const from = p ? p[0] : start;
      const to = p ? p[1] : dir === "wordFwd" ? nextBoundary(cur, start) : start + 1;
      return setText(cur.slice(0, from) + cur.slice(to), from, "del");
    }

    /* Enter */
    if (cell) {
      const next = cellTarget(b.id, cell[0] + 1, cell[1]);
      if (cell[0] + 1 < b.table!.length) goTo(next, "start");
      return;
    }
    const { start, end } = op;
    const list = b.style === "bullet" || b.style === "number";
    if (list && cur.trim() === "") return commit(replace(d, { ...b, style: "normal" }), { target, start: 0, end: 0 });
    const left = cur.slice(0, start);
    const right = cur.slice(end);
    const carry: Partial<WordBlock> = b.style === "normal" ? { bold: b.bold, italic: b.italic, underline: b.underline, size: b.size, align: b.align } : list ? { align: b.align } : {};
    const fresh: WordBlock = { id: blockId(), style: list ? b.style : "normal", text: "", ...carry };
    const nb: WordBlock = by && right ? { ...withText(fresh, right, by), revPara: "ins" } : { ...fresh, text: right };
    const lb = withText(b, left, by);
    commit({ ...d, blocks: [...d.blocks.slice(0, index), lb, nb, ...d.blocks.slice(index + 1)] }, { target: nb.id, start: 0, end: 0 });
  };

  const mergeBack = (b: WordBlock) => {
    const d = docRef.current;
    const i = d.blocks.indexOf(b);
    if (b.style === "bullet" || b.style === "number") return commit(replace(d, { ...b, style: "normal" }), { target: b.id, start: 0, end: 0 });
    const prev = d.blocks[i - 1];
    if (!prev) return;
    const prevOk = !prev.table && !prev.field && prev.revPara !== "del" && !lockedBy(prev);
    if (b.text === "" && b.base === undefined) {
      const rest = d.blocks.filter((x) => x.id !== b.id);
      const to = prevOk ? prev.id : prev.table ? cellTarget(prev.id, prev.table.length - 1, prev.table[0].length - 1) : null;
      return commit({ ...d, blocks: rest, comments: (d.comments ?? []).filter((c) => c.blockId !== b.id) }, to ? { target: to, start: textOf(to).length, end: textOf(to).length } : undefined);
    }
    if (!prevOk || d.tracking || prev.base !== undefined || b.base !== undefined) return;
    const merged: WordBlock = { ...prev, text: prev.text + b.text };
    commit({ ...d, blocks: d.blocks.filter((x) => x.id !== b.id).map((x) => (x.id === prev.id ? merged : x)), comments: (d.comments ?? []).map((c) => (c.blockId === b.id ? { ...c, blockId: prev.id } : c)) }, { target: prev.id, start: prev.text.length, end: prev.text.length });
  };

  const mergeForward = (b: WordBlock) => {
    const d = docRef.current;
    const i = d.blocks.indexOf(b);
    const next = d.blocks[i + 1];
    if (!next || next.table || next.field || next.revPara === "del" || lockedBy(next) || d.tracking || next.base !== undefined || b.base !== undefined) return;
    commit({ ...d, blocks: d.blocks.filter((x) => x.id !== next.id).map((x) => (x.id === b.id ? { ...b, text: b.text + next.text } : x)), comments: (d.comments ?? []).map((c) => (c.blockId === next.id ? { ...c, blockId: b.id } : c)) }, { target: b.id, start: b.text.length, end: b.text.length });
  };

  /* ── keys the browser doesn't turn into an edit ── */
  const onKey = (target: string, e: ReactKeyboardEvent<HTMLDivElement>, el: HTMLDivElement) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const { id, cell } = parseTarget(target);
    const i = targets.indexOf(target);
    if (e.key === "Tab") {
      e.preventDefault();
      if (cell) {
        const b = blocks.find((x) => x.id === id)!;
        const cols = b.table![0].length;
        const flat = cell[0] * cols + cell[1] + (e.shiftKey ? -1 : 1);
        if (flat < 0) return;
        if (flat >= b.table!.length * cols) {
          /* Tab in the last cell adds a row, as Word does */
          const nb = { ...b, table: [...b.table!, Array(cols).fill("")] };
          return commit(replace(docRef.current, nb), { target: cellTarget(b.id, b.table!.length, 0), start: 0, end: 0 });
        }
        goTo(cellTarget(b.id, Math.floor(flat / cols), flat % cols), "end");
        return;
      }
      if (!e.shiftKey) onOp(target, { kind: "insert", ...(getSel(el) ?? { start: 0, end: 0 }), text: "\t" });
      return;
    }
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) || e.shiftKey) return;
    const s = getSel(el);
    if (!s || s.start !== s.end) return;
    const len = textOf(target).length;
    const lines = caretLines(el);
    if ((e.key === "ArrowLeft" && s.start === 0) || (e.key === "ArrowUp" && lines.first)) {
      if (goTo(targets[i - 1], "end")) e.preventDefault();
    } else if ((e.key === "ArrowRight" && s.start >= len) || (e.key === "ArrowDown" && lines.last)) {
      if (goTo(targets[i + 1], "start")) e.preventDefault();
    }
  };

  const onRootKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
    const tag = (e.target as HTMLElement).tagName;
    const inForm = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
    const k = e.key.toLowerCase();
    if (k === "s") {
      e.preventDefault();
      onSave?.();
    } else if (inForm) return;
    else if (k === "z" || k === "y") {
      e.preventDefault();
      undo(k === "y" || e.shiftKey);
    } else if (k === "b" || k === "i" || k === "u") {
      e.preventDefault();
      format(k === "b" ? "bold" : k === "i" ? "italic" : "underline");
    }
  };

  /* ── the ribbon's actions, on the paragraph the cursor is in ── */
  const keepCaret = (): Caret | undefined => {
    if (!active) return undefined;
    const el = rootRef.current?.querySelector<HTMLElement>(`[data-target="${CSS.escape(active)}"]`);
    const s = el ? getSel(el) : null;
    return { target: active, start: s?.start ?? 0, end: s?.end ?? 0 };
  };
  const onPara = (fn: (b: WordBlock) => WordBlock) => {
    if (!activeIsPara || !activeBlock) return;
    commit(replace(docRef.current, fn(activeBlock)), keepCaret());
  };
  const format = (which: "bold" | "italic" | "underline") => onPara((b) => ({ ...b, [which]: !b[which] }));
  const setStyle = (style: WordStyle) =>
    onPara((b) => {
      const plain = { ...b, style };
      delete plain.bold;
      delete plain.italic;
      delete plain.underline;
      delete plain.size;
      return plain;
    });
  const toggleList = (style: "bullet" | "number") => onPara((b) => ({ ...b, style: b.style === style ? "normal" : style }));
  const setSize = (pt: number) => onPara((b) => ({ ...b, size: pt === STYLES[b.style].pt ? undefined : pt }));
  const setAlign = (align: "left" | "center" | "right") => onPara((b) => ({ ...b, align: align === "left" ? undefined : align }));

  const insertTable = (rows: number, cols: number) => {
    setMenu(null);
    const d = docRef.current;
    const at = activeBlock ? d.blocks.indexOf(activeBlock) + 1 : d.blocks.length;
    const t: WordBlock = { id: blockId(), style: "normal", text: "", table: Array.from({ length: rows }, () => Array(cols).fill("")) };
    const after: WordBlock = { id: blockId(), style: "normal", text: "" };
    const needAfter = !d.blocks[at] || !!d.blocks[at].table;
    commit({ ...d, blocks: [...d.blocks.slice(0, at), t, ...(needAfter ? [after] : []), ...d.blocks.slice(at)] }, { target: cellTarget(t.id, 0, 0), start: 0, end: 0 });
  };

  /* ── review ── */
  const revs = revisions(doc);
  const curRev: Revision | null = (rev && revs.find((r) => r.blockId === rev.blockId && r.hunk === rev.hunk)) || (activeBlock ? (revs.find((r) => r.blockId === activeBlock.id) ?? null) : null);
  const step = (dir: 1 | -1, from = curRev) => {
    if (!revs.length) return;
    const i = from ? revs.findIndex((r) => r.blockId === from.blockId && r.hunk === from.hunk) : -1;
    const next = revs[(i + dir + revs.length) % revs.length] ?? revs[0];
    setRev({ blockId: next.blockId, hunk: next.hunk });
    reveal(canvasRef.current, rootRef.current?.querySelector(`[data-rev="${CSS.escape(`${next.blockId}:${next.hunk}`)}"]`));
  };
  const settle = (accept: boolean, all = false) => {
    setMenu(null);
    if (all) {
      commit(settleAll(docRef.current, accept));
      setRev(null);
      return;
    }
    if (!curRev) return;
    const at = revs.findIndex((r) => r.blockId === curRev.blockId && r.hunk === curRev.hunk);
    const next = settleIn(docRef.current, curRev, accept);
    commit(next);
    /* and on to the next change, as Word does */
    const left = revisions(next);
    const go = left[Math.min(at, left.length - 1)];
    setRev(go ? { blockId: go.blockId, hunk: go.hunk } : null);
  };

  const comments = doc.comments ?? [];
  const commentOn = rev?.blockId ?? (activeBlock && !activeBlock.field ? activeBlock.id : null);
  const startComment = () => {
    const at = curRev?.blockId ?? commentOn;
    if (!at) return;
    setDraft({ blockId: at, text: "" });
    setFocusComment(null);
  };
  const postComment = () => {
    if (!draft || !draft.text.trim()) return;
    const c: WordComment = { id: blockId(), blockId: draft.blockId, by: "You", time: "Just now", text: draft.text.trim() };
    commit({ ...docRef.current, comments: [...comments, c] });
    setDraft(null);
    setFocusComment(c.id);
  };

  /* ── spelling ── */
  const iss = allIssues(doc);
  const curIssue = pane === "spelling" ? (iss[Math.min(issueAt, iss.length - 1)] ?? null) : null;
  useEffect(() => {
    if (!curIssue) return;
    reveal(canvasRef.current, rootRef.current?.querySelector(`[data-target="${CSS.escape(curIssue.blockId)}"] [data-issue="${curIssue.start}"]`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curIssue?.blockId, curIssue?.start]);
  const fixIssue = (i: Issue, to: string) => {
    commit(changeIssue(docRef.current, i, to));
    setPick(0);
    setCtx(null);
  };
  const ignore = (i: Issue) => {
    commit(ignoreIssue(docRef.current, i));
    setPick(0);
    setCtx(null);
  };

  /* ── the page ── */
  const nums = listNumbers(blocks, true);
  const issuesFor = (id: string) => iss.filter((x) => x.blockId === id);
  const commented = new Set(comments.map((c) => c.blockId));
  const lit = focusComment ? comments.find((c) => c.id === focusComment)?.blockId : draft?.blockId;
  const showComments = comments.length > 0 || !!draft;
  const side = pane === "spelling" || showComments;

  const page: ReactNode[] = [];
  let form: WordBlock[] = [];
  const flush = () => {
    if (!form.length) return;
    const group = form;
    form = [];
    page.push(<FormTable key={`f-${group[0].id}`} fields={group} onSet={(b, v) => commit(replace(docRef.current, { ...b, text: v }), undefined, `field:${b.id}`)} onFocus={(id) => setActive(id)} />);
  };
  for (const b of blocks) {
    if (b.field) {
      form.push(b);
      continue;
    }
    flush();
    if (b.table) {
      page.push(
        <table key={b.id} style={{ width: "100%", borderCollapse: "collapse", margin: "6px 0 12px", tableLayout: "fixed" }}>
          <tbody>
            {b.table.map((r, ri) => (
              <tr key={ri}>
                {r.map((c, ci) => (
                  <td key={ci} style={{ border: "1px solid #000000", padding: "4px 7px", verticalAlign: "top" }}>
                    <Editable
                      target={cellTarget(b.id, ri, ci)}
                      html={c ? esc(c) : "<br>"}
                      editable
                      label={`Table, row ${ri + 1}, column ${ci + 1}`}
                      onOp={onOp}
                      onKey={onKey}
                      onFocus={setActive}
                      style={{ fontFamily: WORD.body, fontSize: px11, fontWeight: ri === 0 ? 700 : 400, color: "#000" }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>,
      );
      continue;
    }
    const list = b.style === "bullet" || b.style === "number";
    const locked = lockedBy(b);
    const changed = b.base !== undefined;
    const curHunk = curRev && curRev.blockId === b.id ? curRev.hunk : null;
    page.push(
      <div
        key={b.id}
        className={changed ? "wd-changed" : undefined}
        data-block={b.id}
        style={{
          position: "relative",
          margin: blockMargin(b),
          paddingLeft: list ? 30 : 0,
          background: lit === b.id ? WORD.comment : commented.has(b.id) ? "#fdf8e4" : undefined,
          borderRadius: 2,
        }}
      >
        {list && (
          <span aria-hidden style={{ position: "absolute", left: 8, top: 0, ...blockCss(b), fontWeight: 400, textDecoration: b.revPara === "del" ? "line-through" : "none", color: b.revPara ? (b.revBy === "You" ? WORD.you : WORD.them) : "#000" }}>
            {b.style === "bullet" ? "•" : `${nums[b.id] ?? ""}.`}
          </span>
        )}
        <Editable
          target={b.id}
          html={blockHtml(b, issuesFor(b.id), curIssue, curHunk)}
          editable={!locked && b.revPara !== "del"}
          label={`${STYLES[b.style].label} paragraph`}
          onOp={onOp}
          onKey={onKey}
          onFocus={setActive}
          style={{ ...blockCss(b), cursor: locked ? "default" : undefined }}
        />
      </div>,
    );
  }
  flush();

  const tile = (s: WordStyle) => {
    const spec = STYLES[s];
    return (
      <button
        key={s}
        type="button"
        className="wd-tile"
        aria-pressed={activeIsPara && activeBlock?.style === s}
        title={`Style: ${spec.label}`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setStyle(s)}
        disabled={!activeIsPara}
      >
        <span style={{ fontFamily: spec.font, fontSize: s === "title" ? 20 : s === "h1" ? 16 : s === "h2" ? 14 : 13, color: spec.colour, lineHeight: 1.1, whiteSpace: "nowrap" }}>AaBbCc</span>
        <span style={{ fontSize: 12, color: W.ink }}>{spec.label}</span>
      </button>
    );
  };
  const rb = (label: string, icon: ReactNode, onClick: () => void, opts: { pressed?: boolean; disabled?: boolean; title?: string; small?: boolean; wide?: boolean } = {}) => (
    <button
      key={label}
      type="button"
      className={opts.small ? "wd-rb sm" : "wd-rb"}
      aria-pressed={opts.pressed}
      aria-label={opts.small && !opts.wide ? label : undefined}
      title={opts.title ?? label}
      disabled={opts.disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {icon}
      {(!opts.small || opts.wide) && <span>{label}</span>}
    </button>
  );
  const group = (label: string, children: ReactNode, style?: CSSProperties) => (
    <div role="group" aria-label={label} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "4px 10px 2px", borderRight: `1px solid ${W.edge}`, flexShrink: 0, ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>{children}</div>
      <div style={{ fontSize: 11.5, color: W.muted, textAlign: "center", paddingTop: 2 }}>{label}</div>
    </div>
  );
  const nothing = !activeIsPara;
  const curSize = activeIsPara && activeBlock ? sizeOf(activeBlock) : 12;

  const ribbon =
    tab === "home" ? (
      <>
        {group(
          "Font",
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ display: "flex", gap: 4 }}>
              <span aria-label="Font" title="Font" style={{ display: "inline-flex", alignItems: "center", width: 128, height: 36, padding: "0 8px", border: `1px solid ${W.edge}`, borderRadius: 3, background: "#fff", fontSize: 14, color: nothing ? W.faint : W.ink, boxSizing: "border-box", overflow: "hidden", whiteSpace: "nowrap" }}>
                {activeBlock && (activeBlock.style === "title" || activeBlock.style === "h1" || activeBlock.style === "h2") ? "Aptos Display" : "Aptos (Body)"}
              </span>
              <select
                aria-label="Font size"
                title="Font size"
                value={String(curSize)}
                disabled={nothing}
                onChange={(e) => setSize(Number(e.target.value))}
                style={{ width: 62, height: 36, border: `1px solid ${W.edge}`, borderRadius: 3, background: "#fff", fontFamily: W.font, fontSize: 14, color: W.ink, padding: "0 4px" }}
              >
                {[...new Set([...SIZES, curSize])].sort((a, b) => a - b).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: 2 }}>
              {rb("Bold (Ctrl+B)", <b style={{ fontFamily: "Georgia, serif", fontSize: 17 }}>B</b>, () => format("bold"), { small: true, pressed: !!activeBlock?.bold && activeIsPara, disabled: nothing })}
              {rb("Italic (Ctrl+I)", <i style={{ fontFamily: "Georgia, serif", fontSize: 17 }}>I</i>, () => format("italic"), { small: true, pressed: !!activeBlock?.italic && activeIsPara, disabled: nothing })}
              {rb("Underline (Ctrl+U)", <u style={{ fontFamily: "Georgia, serif", fontSize: 17 }}>U</u>, () => format("underline"), { small: true, pressed: !!activeBlock?.underline && activeIsPara, disabled: nothing })}
            </div>
          </div>,
        )}
        {group(
          "Paragraph",
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ display: "flex", gap: 2 }}>
              {rb("Bullets", Icon.bullets(), () => toggleList("bullet"), { small: true, pressed: activeIsPara && activeBlock?.style === "bullet", disabled: nothing })}
              {rb("Numbering", Icon.numbering(), () => toggleList("number"), { small: true, pressed: activeIsPara && activeBlock?.style === "number", disabled: nothing })}
            </div>
            <div style={{ display: "flex", gap: 2 }}>
              {(["left", "center", "right"] as const).map((a) => rb(a === "center" ? "Centre" : a === "left" ? "Align left" : "Align right", Icon.align(a), () => setAlign(a), { small: true, pressed: activeIsPara && (activeBlock?.align ?? "left") === a, disabled: nothing }))}
            </div>
          </div>,
        )}
        {group("Styles", <div style={{ display: "flex", gap: 4 }}>{GALLERY.map(tile)}</div>, { borderRight: "none" })}
      </>
    ) : tab === "insert" ? (
      <>
        {group(
          "Tables",
          <span style={{ position: "relative" }}>
            {rb("Table", Icon.table(), () => setMenu(menu === "table" ? null : "table"), { pressed: menu === "table" })}
            {menu === "table" && (
              <div role="dialog" aria-label="Insert a table" style={{ position: "absolute", top: "100%", left: 0, zIndex: 30, marginTop: 4, padding: 10, background: "#fff", border: `1px solid ${W.edge}`, borderRadius: 6, boxShadow: W.float }}>
                <div style={{ fontSize: 13, color: W.muted, marginBottom: 8 }}>{hover[0] ? `${hover[1]} x ${hover[0]} table` : "Insert table"}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 24px)", gap: 3 }} onMouseLeave={() => setHover([0, 0])}>
                  {Array.from({ length: 48 }, (_, k) => {
                    const r = Math.floor(k / 8) + 1;
                    const c = (k % 8) + 1;
                    const on = r <= hover[0] && c <= hover[1];
                    return (
                      <button
                        key={k}
                        type="button"
                        aria-label={`${c} columns, ${r} rows`}
                        onMouseDown={(e) => e.preventDefault()}
                        onMouseEnter={() => setHover([r, c])}
                        onFocus={() => setHover([r, c])}
                        onClick={() => insertTable(r, c)}
                        style={{ width: 24, height: 24, padding: 0, border: `1px solid ${on ? W.word : "#c8c6c4"}`, background: on ? "#cfe0f7" : "#fff", cursor: "pointer" }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </span>,
        )}
        {group("Comments", rb("Comment", Icon.comment(), startComment, { disabled: !commentOn && !curRev, title: "Add a comment on the paragraph the cursor is in" }), { borderRight: "none" })}
      </>
    ) : (
      <>
        {group(
          "Proofing",
          rb(
            "Spelling & Grammar",
            Icon.spelling(),
            () => {
              setPane("spelling");
              setIssueAt(0);
              setPick(0);
            },
            { pressed: pane === "spelling" },
          ),
        )}
        {group("Comments", rb("New Comment", Icon.comment(), startComment, { disabled: !commentOn && !curRev, title: "Add a comment on the paragraph the cursor is in" }))}
        {group("Tracking", rb(doc.tracking ? "Track Changes: On" : "Track Changes: Off", Icon.track(), () => commit({ ...docRef.current, tracking: !docRef.current.tracking }), { pressed: !!doc.tracking }))}
        {group(
          "Changes",
          <>
            {(["accept", "reject"] as const).map((k) => (
              <span key={k} style={{ position: "relative", display: "inline-flex" }}>
                {rb(k === "accept" ? "Accept" : "Reject", k === "accept" ? Icon.accept() : Icon.reject(), () => settle(k === "accept"), { disabled: !curRev, title: k === "accept" ? "Accept this change and move to the next" : "Reject this change and move to the next" })}
                <button type="button" aria-label={k === "accept" ? "More ways to accept" : "More ways to reject"} className="wd-rb" style={{ minWidth: 22, padding: 0 }} disabled={!revs.length} onMouseDown={(e) => e.preventDefault()} onClick={() => setMenu(menu === k ? null : k)}>
                  ▾
                </button>
                {menu === k && (
                  <span role="menu" style={{ position: "absolute", top: "100%", left: 0, zIndex: 30, marginTop: 4, width: 230, padding: 4, background: "#fff", border: `1px solid ${W.edge}`, borderRadius: 6, boxShadow: W.float }}>
                    {[
                      [`${k === "accept" ? "Accept" : "Reject"} This Change`, () => settle(k === "accept"), !curRev],
                      [`${k === "accept" ? "Accept" : "Reject"} All Changes`, () => settle(k === "accept", true), false],
                    ].map(([label, fn, off]) => (
                      <button key={label as string} type="button" role="menuitem" className="of-row" disabled={off as boolean} onMouseDown={(e) => e.preventDefault()} onClick={fn as () => void} style={{ width: "100%", minHeight: 40, textAlign: "left", padding: "6px 12px", border: "none", background: "transparent", fontFamily: W.font, fontSize: 14.5, borderRadius: 4, opacity: off ? 0.4 : 1 }}>
                        {label as string}
                      </button>
                    ))}
                  </span>
                )}
              </span>
            ))}
            <div style={{ display: "grid", gap: 2, marginLeft: 2 }}>
              {rb("Previous", Icon.prev(), () => step(-1), { small: true, wide: true, disabled: !revs.length, title: "Go to the previous change" })}
              {rb("Next", Icon.next(), () => step(1), { small: true, wide: true, disabled: !revs.length, title: "Go to the next change" })}
            </div>
          </>,
          { borderRight: "none" },
        )}
      </>
    );

  return (
    <div ref={rootRef} className="wd-root" onKeyDown={onRootKey} onClick={() => ctx && setCtx(null)} style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", background: W.page, fontFamily: W.font, color: W.ink }}>
      {/* title bar, with the quick-access buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 40, padding: "0 6px 0 10px", background: W.word, color: "#fff", fontSize: 14, flexShrink: 0 }}>
        <span aria-hidden style={{ width: 22, height: 22, borderRadius: 4, background: "#fff", color: W.word, fontWeight: 800, fontSize: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "Segoe UI, sans-serif" }}>
          W
        </span>
        {onSave && (
          <button type="button" className="of-btn" aria-label="Save (Ctrl+S)" title="Save (Ctrl+S)" onMouseDown={(e) => e.preventDefault()} onClick={onSave} style={qa}>
            {Icon.save()}
          </button>
        )}
        <button type="button" className="of-btn" aria-label="Undo (Ctrl+Z)" title="Undo (Ctrl+Z)" disabled={!history.back} onMouseDown={(e) => e.preventDefault()} onClick={() => undo()} style={{ ...qa, opacity: history.back ? 1 : 0.45 }}>
          {Icon.undo()}
        </button>
        <button type="button" className="of-btn" aria-label="Redo (Ctrl+Y)" title="Redo (Ctrl+Y)" disabled={!history.fwd} onMouseDown={(e) => e.preventDefault()} onClick={() => undo(true)} style={{ ...qa, opacity: history.fwd ? 1 : 0.45 }}>
          {Icon.redo()}
        </button>
        <span style={{ flex: 1, minWidth: 0, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          <b style={{ fontWeight: 600 }}>{name}</b>
          {status && <span style={{ opacity: 0.85 }}> · {status}</span>}
        </span>
        {extra}
      </div>

      {/* ribbon tabs */}
      <div role="tablist" aria-label="Ribbon" style={{ display: "flex", alignItems: "flex-end", gap: 2, padding: "0 8px", background: W.word, flexShrink: 0, overflowX: "auto" }}>
        {onFile && (
          <button type="button" role="tab" aria-selected={false} className="wd-tab" onClick={onFile} style={{ background: "rgba(0,0,0,0.18)", fontWeight: 600 }}>
            File
          </button>
        )}
        {(["home", "insert", "review"] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} className="wd-tab" onMouseDown={(e) => e.preventDefault()} onClick={() => setTab(t)}>
            {t === "home" ? "Home" : t === "insert" ? "Insert" : "Review"}
          </button>
        ))}
        {doc.tracking && <span style={{ marginLeft: "auto", alignSelf: "center", fontSize: 12.5, color: "#fff", opacity: 0.92, whiteSpace: "nowrap", padding: "0 6px" }}>Track Changes is on</span>}
      </div>
      <div role="tabpanel" aria-label="Ribbon commands" style={{ display: "flex", alignItems: "stretch", minHeight: 96, padding: "4px 4px 2px", background: WORD.ribbon, borderBottom: `1px solid ${W.edge}`, flexShrink: 0, overflowX: "auto", overflowY: "visible", position: "relative", zIndex: 5 }}>
        {ribbon}
      </div>

      {/* the page, and the panes beside it */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: mobile && side ? "column" : "row" }}>
        <div ref={canvasRef} className="wd-page" onClick={(e) => pageClick(e.target as HTMLElement)} onContextMenu={(e) => contextMenu(e)} style={{ flex: 1, minWidth: 0, minHeight: 0, overflow: "auto", background: WORD.canvas, padding: mobile ? "8px 8px 24px" : "20px 16px 40px" }}>
          <div style={{ zoom: z, width: pageW, margin: "0 auto" } as CSSProperties}>
            <div ref={pageRef} style={{ width: pageW, minHeight: mobile ? 400 : WORD.pageH, boxSizing: "border-box", padding: pad, background: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.16), 0 8px 24px -10px rgba(0,0,0,0.25)", color: "#000", position: "relative" }}>
              {doc.header && (
                <div title="The letterhead is part of the template. It prints on every page." style={{ opacity: 0.92, userSelect: "none" }}>
                  <Letterhead header={doc.header} />
                </div>
              )}
              {page}
              {doc.footer && (
                <div style={{ opacity: 0.85, userSelect: "none" }}>
                  <Footer text={doc.footer} />
                </div>
              )}
            </div>
          </div>
        </div>

        {pane === "spelling" ? (
          <SpellPane mobile={mobile} doc={doc} issue={curIssue} left={iss.length} pick={pick} setPick={setPick} onChange={fixIssue} onIgnore={ignore} onClose={() => setPane(null)} />
        ) : (
          showComments && (
            <aside aria-label="Comments" style={{ width: mobile ? "auto" : 236, maxHeight: mobile ? "42%" : undefined, flexShrink: 0, overflowY: "auto", background: "#faf9f8", borderLeft: mobile ? "none" : `1px solid ${W.edge}`, borderTop: mobile ? `1px solid ${W.edge}` : "none", padding: 10, display: "grid", alignContent: "start", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <b style={{ fontSize: 15, fontWeight: 600 }}>Comments</b>
                <span style={{ fontSize: 12.5, color: W.muted }}>{comments.length}</span>
              </div>
              {blocks
                .flatMap((b) => comments.filter((c) => c.blockId === b.id))
                .map((c) => (
                  <CommentCard
                    key={c.id}
                    c={c}
                    on={focusComment === c.id}
                    quote={blocks.find((b) => b.id === c.blockId)?.text ?? ""}
                    onFocus={() => setFocusComment(focusComment === c.id ? null : c.id)}
                    onDelete={c.by === "You" ? () => commit({ ...docRef.current, comments: comments.filter((x) => x.id !== c.id) }) : undefined}
                  />
                ))}
              {draft && (
                <div style={{ padding: 10, borderRadius: 8, background: "#fff", border: `2px solid ${W.word}`, display: "grid", gap: 8 }}>
                  <Who name="You" />
                  <span style={{ fontSize: 12.5, color: W.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>On: {blocks.find((b) => b.id === draft.blockId)?.text || "this paragraph"}</span>
                  <textarea
                    autoFocus
                    aria-label="Your comment"
                    value={draft.text}
                    onChange={(e) => setDraft({ ...draft, text: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) postComment();
                    }}
                    placeholder="Say what you think, and why"
                    rows={3}
                    style={{ width: "100%", boxSizing: "border-box", resize: "vertical", padding: "6px 8px", border: `1px solid ${W.faint}`, borderRadius: 4, fontFamily: W.font, fontSize: 14.5, color: W.ink }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                    <button type="button" className="of-btn" onClick={() => setDraft(null)} style={smallBtn}>
                      Cancel
                    </button>
                    <button type="button" className="of-btn" onClick={postComment} disabled={!draft.text.trim()} style={{ ...smallBtn, background: W.word, color: "#fff", border: "none", opacity: draft.text.trim() ? 1 : 0.5 }}>
                      Post
                    </button>
                  </div>
                </div>
              )}
            </aside>
          )
        )}
      </div>

      {/* status bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 30, padding: "0 10px", background: WORD.ribbon, borderTop: `1px solid ${W.edge}`, fontSize: 12.5, color: W.body, flexShrink: 0, overflowX: "auto", whiteSpace: "nowrap" }}>
        <span>
          Page 1 of {pages}
        </span>
        <span>{wordCount(doc)} words</span>
        <button
          type="button"
          className="of-btn"
          title={iss.length ? `${iss.length} spelling or grammar ${iss.length === 1 ? "mistake" : "mistakes"} found. Click to check.` : "No spelling or grammar mistakes found"}
          aria-label="Spelling and grammar"
          onClick={() => {
            setPane("spelling");
            setIssueAt(0);
          }}
          style={{ display: "inline-flex", alignItems: "center", gap: 4, minHeight: 28, border: "none", background: "transparent", cursor: "pointer", fontFamily: W.font, fontSize: 12.5, color: W.body, padding: "0 4px" }}
        >
          {Icon.book(iss.length === 0)}
        </button>
        <span>English (United Kingdom)</span>
        {doc.tracking && <span>Track Changes: On</span>}
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <button type="button" aria-label="Zoom out" disabled={mobile} onClick={() => setZoom(Math.max(0.5, Math.round((z - 0.1) * 10) / 10))} style={zoomBtn}>
            −
          </button>
          <input aria-label="Zoom" type="range" min={50} max={200} step={10} disabled={mobile} value={Math.round(z * 100)} onChange={(e) => setZoom(Number(e.target.value) / 100)} style={{ width: 100 }} />
          <button type="button" aria-label="Zoom in" disabled={mobile} onClick={() => setZoom(Math.min(2, Math.round((z + 0.1) * 10) / 10))} style={zoomBtn}>
            +
          </button>
          <button type="button" title="Fit the page to the window" onClick={() => setZoom(null)} style={{ ...zoomBtn, width: "auto", padding: "0 4px" }}>
            {Math.round(z * 100)}%
          </button>
        </span>
      </div>

      {ctx && (
        <div role="menu" aria-label="Spelling suggestions" style={{ position: "fixed", left: ctx.x, top: ctx.y, zIndex: 80, width: 220, padding: 4, background: "#fff", border: `1px solid ${W.edge}`, borderRadius: 6, boxShadow: W.float }} onClick={(e) => e.stopPropagation()}>
          {ctx.issue.suggestions.map((s) => (
            <button key={s || "delete"} type="button" role="menuitem" className="of-row" onClick={() => fixIssue(ctx.issue, s)} style={{ ...menuItem, fontWeight: 600 }}>
              {s || "Delete the repeated word"}
            </button>
          ))}
          <button type="button" role="menuitem" className="of-row" onClick={() => ignore(ctx.issue)} style={menuItem}>
            Ignore All
          </button>
        </div>
      )}
      <style>{WORD_CSS}</style>
    </div>
  );

  function pageClick(t: HTMLElement) {
    setMenu(null);
    const r = t.closest("[data-rev]")?.getAttribute("data-rev");
    if (r) {
      const k = r.lastIndexOf(":");
      setRev({ blockId: r.slice(0, k), hunk: Number(r.slice(k + 1)) });
      return;
    }
    if (rev && !t.closest("[data-rev]")) setRev(null);
  }

  function contextMenu(e: ReactMouseEvent) {
    const span = (e.target as HTMLElement).closest("[data-issue]");
    const host = span?.closest("[data-target]")?.getAttribute("data-target");
    if (!span || !host) return;
    const i = iss.find((x) => x.blockId === host && x.start === Number(span.getAttribute("data-issue")));
    if (!i) return;
    e.preventDefault();
    setCtx({ x: e.clientX, y: e.clientY, issue: i });
  }
}

const px11 = 14.7;
const qa: CSSProperties = { width: 34, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "none", borderRadius: 4, background: "transparent", cursor: "pointer" };
const zoomBtn: CSSProperties = { width: 24, height: 24, border: "none", background: "transparent", cursor: "pointer", fontSize: 16, color: W.body, fontFamily: W.font };
const smallBtn: CSSProperties = { minHeight: 36, padding: "4px 14px", border: `1px solid ${W.edge}`, borderRadius: 4, background: "#fff", fontFamily: W.font, fontSize: 14, cursor: "pointer" };
const menuItem: CSSProperties = { width: "100%", minHeight: 38, textAlign: "left", padding: "6px 12px", border: "none", background: "transparent", fontFamily: W.font, fontSize: 14.5, borderRadius: 4 };

function Who({ name }: { name: string }) {
  const you = name === "You";
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span aria-hidden style={{ width: 26, height: 26, borderRadius: "50%", background: you ? "#8a4fd8" : WORD.them, color: "#fff", fontSize: 11.5, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        {name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()}
      </span>
      <b style={{ fontSize: 14, fontWeight: 600 }}>{name}</b>
    </span>
  );
}

function CommentCard({ c, on, quote, onFocus, onDelete }: { c: WordComment; on: boolean; quote: string; onFocus: () => void; onDelete?: () => void }) {
  return (
    <div style={{ padding: 10, borderRadius: 8, background: "#fff", border: `1px solid ${on ? W.word : W.edge}`, boxShadow: on ? "0 2px 8px rgba(0,0,0,0.12)" : "none", display: "grid", gap: 6 }}>
      <button type="button" onClick={onFocus} style={{ display: "grid", gap: 6, textAlign: "left", border: "none", background: "transparent", padding: 0, cursor: "pointer", fontFamily: W.font, color: W.ink }}>
        <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <Who name={c.by} />
          <span style={{ fontSize: 12, color: W.muted }}>{c.time}</span>
        </span>
        <span style={{ fontSize: 12.5, color: W.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>On: {quote}</span>
        <span style={{ fontSize: 14.5, lineHeight: 1.45 }}>{c.text}</span>
      </button>
      {onDelete && (
        <button type="button" className="of-btn" onClick={onDelete} style={{ ...smallBtn, justifySelf: "end", minHeight: 30, fontSize: 13 }}>
          Delete
        </button>
      )}
    </div>
  );
}

/* The spelling and grammar pane: one mistake at a time, in reading order. */
function SpellPane({ mobile, doc, issue, left, pick, setPick, onChange, onIgnore, onClose }: { mobile: boolean; doc: WordDoc; issue: Issue | null; left: number; pick: number; setPick: (n: number) => void; onChange: (i: Issue, to: string) => void; onIgnore: (i: Issue) => void; onClose: () => void }) {
  const b = issue ? doc.blocks.find((x) => x.id === issue.blockId) : null;
  const spelling = issue?.kind === "spelling";
  const colour = spelling ? WORD.spelling : WORD.grammar;
  const sugg = issue?.suggestions ?? [];
  const chosen = sugg[Math.min(pick, sugg.length - 1)];
  return (
    <aside aria-label="Spelling and grammar" style={{ width: mobile ? "auto" : 264, maxHeight: mobile ? "48%" : undefined, flexShrink: 0, overflowY: "auto", background: "#fff", borderLeft: mobile ? "none" : `1px solid ${W.edge}`, borderTop: mobile ? `1px solid ${W.edge}` : "none", padding: "12px 14px", display: "grid", alignContent: "start", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <b style={{ fontSize: 16, fontWeight: 600 }}>Spelling and grammar</b>
        <button type="button" aria-label="Close the pane" onClick={onClose} className="of-btn" style={{ width: 36, height: 36, border: "none", background: "transparent", cursor: "pointer", fontSize: 16, color: W.muted }}>
          ✕
        </button>
      </div>
      {issue && b ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span aria-hidden style={{ width: 4, alignSelf: "stretch", borderRadius: 2, background: colour }} />
            <span>
              <b style={{ display: "block", fontSize: 14.5, color: colour }}>{spelling ? "Spelling" : "Grammar"}</b>
              <span style={{ fontSize: 13.5, color: W.muted }}>{issue.message}</span>
            </span>
          </div>
          <p style={{ margin: 0, padding: "10px 12px", borderRadius: 6, background: "#f5f5f5", fontFamily: WORD.body, fontSize: 15, lineHeight: 1.5 }}>
            {b.text.slice(Math.max(0, issue.start - 40), issue.start).replace(/^\S*\s/, issue.start > 40 ? "… " : "")}
            <span className={spelling ? "wd-sp" : "wd-gr"} style={{ fontWeight: 700 }}>
              {issue.word}
            </span>
            {b.text.length > issue.end + 40 ? `${b.text.slice(issue.end, issue.end + 40).replace(/\s+\S*$/, "")} …` : b.text.slice(issue.end)}
          </p>
          <div role="listbox" aria-label="Suggestions" style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: 13, color: W.muted }}>Suggestions</span>
            {sugg.map((s, i) => (
              <button key={s || "delete"} type="button" role="option" aria-selected={i === pick} className="of-row" onClick={() => setPick(i)} onDoubleClick={() => onChange(issue, s)} style={{ minHeight: 40, textAlign: "left", padding: "6px 12px", border: `1px solid ${i === pick ? W.word : W.edge}`, borderRadius: 4, background: i === pick ? "#eef4fc" : "#fff", fontFamily: WORD.body, fontSize: 15.5, fontWeight: 600, cursor: "pointer" }}>
                {s || "Delete the repeated word"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="of-btn" onClick={() => onChange(issue, chosen ?? "")} style={{ ...smallBtn, minHeight: 40, background: W.word, color: "#fff", border: "none", fontWeight: 600 }}>
              Change
            </button>
            <button type="button" className="of-btn" onClick={() => onIgnore(issue)} style={{ ...smallBtn, minHeight: 40 }}>
              Ignore
            </button>
          </div>
          <span style={{ fontSize: 12.5, color: W.muted }}>
            {left} {left === 1 ? "mistake" : "mistakes"} left to look at
          </span>
        </>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>
            <b style={{ display: "block" }}>The spelling and grammar check is complete.</b>
            You&apos;re good to go.
          </p>
          <p style={{ margin: 0, padding: "10px 12px", borderRadius: 6, background: "#fff4ce", fontSize: 14, lineHeight: 1.5 }}>A spelling check doesn&apos;t know people&apos;s names, and can&apos;t tell a wrong number or date. Read those back against where you got them.</p>
          <button type="button" className="of-btn" onClick={onClose} style={{ ...smallBtn, justifySelf: "start", minHeight: 40 }}>
            Close
          </button>
        </div>
      )}
    </aside>
  );
}

/* Form fields as Word draws them: a two-column table, the question on the
 * left, a grey "Click or tap here" box on the right that you click and
 * type in, a date picker, a drop-down list or a tick box. */
function FormTable({ fields, onSet, onFocus }: { fields: WordBlock[]; onSet: (b: WordBlock, v: string) => void; onFocus: (id: string) => void }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", margin: "4px 0 14px", fontFamily: WORD.body, fontSize: px11 }}>
      <tbody>
        {fields.map((b) => (
          <tr key={b.id} className="wd-field">
            <td style={{ width: "38%", padding: "8px 10px", border: "1px solid #bfbfbf", background: "#f2f2f2", fontWeight: 600, verticalAlign: "middle" }}>
              <label htmlFor={`fld-${b.id}`}>
                {b.field!.label}
                {b.field!.required && <span style={{ color: "#c50f1f" }}> *</span>}
              </label>
            </td>
            <td style={{ padding: "5px 8px", border: "1px solid #bfbfbf", verticalAlign: "middle" }}>
              <Control b={b} onSet={(v) => onSet(b, v)} onFocus={() => onFocus(b.id)} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function Control({ b, onSet, onFocus }: { b: WordBlock; onSet: (v: string) => void; onFocus: () => void }) {
  const f = b.field!;
  const [open, setOpen] = useState(false);
  const pop = useRef<HTMLSpanElement>(null);
  /* a list or calendar that opens below the bottom of the window scrolls into view */
  useEffect(() => {
    if (open) reveal(pop.current?.closest<HTMLElement>(".wd-page") ?? null, pop.current);
  }, [open]);
  const parsed = b.text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const [month, setMonth] = useState<[number, number]>(() => (parsed ? [Number(parsed[2]) - 1, Number(parsed[3])] : [10, 2026]));
  const box: CSSProperties = { display: "flex", alignItems: "center", gap: 4, minHeight: 32, borderRadius: 2, position: "relative" };
  const empty = !b.text;
  const shade = empty ? WORD.placeholder : "transparent";

  if (f.kind === "check")
    return (
      <span className="wd-ctl" style={box}>
        <button id={`fld-${b.id}`} type="button" role="checkbox" aria-checked={!!b.text} onFocus={onFocus} onClick={() => onSet(b.text ? "" : "yes")} style={{ minWidth: 34, minHeight: 32, border: "none", background: "transparent", fontSize: 20, cursor: "pointer", fontFamily: "Segoe UI Symbol, Segoe UI, sans-serif", color: "#000" }}>
          {b.text ? "☒" : "☐"}
        </button>
      </span>
    );

  if (f.kind === "choice")
    return (
      <span className="wd-ctl" style={box}>
        <button id={`fld-${b.id}`} type="button" aria-haspopup="listbox" aria-expanded={open} onFocus={onFocus} onClick={() => setOpen((o) => !o)} style={{ flex: 1, minHeight: 32, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "0 6px", border: "none", background: shade, fontFamily: WORD.body, fontSize: px11, color: empty ? "#6b6b6b" : "#000", cursor: "pointer", textAlign: "left" }}>
          {b.text || "Choose an item."}
          <span aria-hidden style={{ color: W.muted, fontSize: 12 }}>
            ▼
          </span>
        </button>
        {open && (
          <span ref={pop} role="listbox" aria-label={f.label} style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20, background: "#fff", border: `1px solid ${W.faint}`, boxShadow: W.float, padding: 2 }}>
            {(f.options ?? []).map((o) => (
              <button
                key={o}
                type="button"
                role="option"
                aria-selected={b.text === o}
                className="of-row"
                onClick={() => {
                  onSet(o);
                  setOpen(false);
                }}
                style={{ display: "block", width: "100%", minHeight: 36, textAlign: "left", padding: "4px 8px", border: "none", background: b.text === o ? W.select : "transparent", fontFamily: WORD.body, fontSize: px11 }}
              >
                {o}
              </button>
            ))}
          </span>
        )}
      </span>
    );

  const days = (() => {
    const [m, y] = month;
    const first = (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7; // Monday first
    const n = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    return [...Array(first).fill(0), ...Array.from({ length: n }, (_, i) => i + 1)];
  })();
  return (
    <span className="wd-ctl" style={box}>
      <input
        id={`fld-${b.id}`}
        value={b.text}
        onFocus={onFocus}
        onChange={(e) => onSet(e.target.value)}
        placeholder={f.kind === "date" ? "Click or tap to enter a date." : "Click or tap here to enter text."}
        style={{ flex: 1, minWidth: 0, minHeight: 32, padding: "0 6px", border: "none", outline: "none", background: shade, fontFamily: WORD.body, fontSize: px11, color: "#000" }}
      />
      {f.kind === "date" && (
        <button type="button" aria-label={`Pick a date for ${f.label}`} aria-expanded={open} onClick={() => setOpen((o) => !o)} style={{ width: 30, minHeight: 32, border: `1px solid ${W.edge}`, background: "#fff", cursor: "pointer", fontSize: 11, color: W.muted }}>
          ▼
        </button>
      )}
      {open && f.kind === "date" && (
        <span ref={pop} role="dialog" aria-label="Pick a date" style={{ position: "absolute", top: "100%", right: 0, zIndex: 20, width: 252, background: "#fff", border: `1px solid ${W.faint}`, boxShadow: W.float, padding: 8, fontFamily: W.font }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <button type="button" aria-label="Previous month" onClick={() => setMonth(([m, y]) => (m === 0 ? [11, y - 1] : [m - 1, y]))} style={calNav}>
              ‹
            </button>
            <b style={{ fontSize: 14 }}>
              {MONTHS[month[0]]} {month[1]}
            </b>
            <button type="button" aria-label="Next month" onClick={() => setMonth(([m, y]) => (m === 11 ? [0, y + 1] : [m + 1, y]))} style={calNav}>
              ›
            </button>
          </span>
          <span style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, fontSize: 12, textAlign: "center" }}>
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
              <span key={d} style={{ color: W.muted, padding: "2px 0" }}>
                {d}
              </span>
            ))}
            {days.map((d, i) =>
              d ? (
                <button
                  key={i}
                  type="button"
                  aria-label={`${d} ${MONTHS[month[0]]} ${month[1]}`}
                  onClick={() => {
                    onSet(`${String(d).padStart(2, "0")}/${String(month[0] + 1).padStart(2, "0")}/${month[1]}`);
                    setOpen(false);
                  }}
                  style={{ height: 30, border: "none", borderRadius: 3, background: parsed && Number(parsed[1]) === d && Number(parsed[2]) === month[0] + 1 && Number(parsed[3]) === month[1] ? W.word : "transparent", color: parsed && Number(parsed[1]) === d && Number(parsed[2]) === month[0] + 1 && Number(parsed[3]) === month[1] ? "#fff" : W.ink, cursor: "pointer", fontSize: 13, fontFamily: W.font }}
                >
                  {d}
                </button>
              ) : (
                <span key={i} />
              ),
            )}
          </span>
        </span>
      )}
    </span>
  );
}

const calNav: CSSProperties = { width: 32, height: 30, border: "none", background: "transparent", cursor: "pointer", fontSize: 18, color: W.ink };
