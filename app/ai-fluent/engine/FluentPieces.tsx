"use client";

import { K } from "@/app/ai-cleared/engine/tokens";
import { RUBRIC_LABEL } from "@/app/ai-cleared/engine/types";
import { FLUENT_LABEL, FLUENT_LINE, MOVE_LABEL, type FluentGrade, type FluentVerdict } from "./grading";

/* The pieces the player mounts for AI Fluent: the rubric panel under a
 * learner's send, and the reply-with-a-planted-mistake view. Styles use
 * the player's cl- classes plus a few fl- ones defined here. */

export const FLUENT_COLOUR: Record<FluentVerdict, { ink: string; soft: string }> = {
  fluent: { ink: K.ok, soft: K.okSoft },
  nearly: { ink: K.warn, soft: K.warnSoft },
  notyet: { ink: K.crit, soft: K.critSoft },
};

export function FluentPanel({ grade, turnLabel }: { grade: FluentGrade; turnLabel?: string }) {
  const v = FLUENT_COLOUR[grade.verdict];
  const latestTurn = grade.turns.length ? grade.turns[grade.turns.length - 1] : null;
  return (
    <div className="cl-grader fl-panel" style={{ borderColor: v.ink }}>
      <div className="cl-grader-top">
        <span className="cl-pill" style={{ background: v.soft, color: v.ink, borderColor: v.ink }}>{FLUENT_LABEL[grade.verdict]}</span>
        <span>{turnLabel ? `${turnLabel}: ` : ""}{FLUENT_LINE[grade.verdict]}</span>
        <span className="fl-score">{grade.score}%</span>
      </div>
      {grade.elements.length > 0 && (
        <div className="fl-els">
          {grade.elements.map((e) => (
            <div key={e.key} className={`fl-el s${e.score}`}>
              <span className="fl-dots" aria-label={`${e.score} of 2`}><i /><i /></span>
              <span className="fl-el-body"><b>{RUBRIC_LABEL[e.key]}</b> <span className="cl-why">{e.why}</span></span>
            </div>
          ))}
        </div>
      )}
      {latestTurn && latestTurn.i > 0 && (
        <div className={`fl-turn ${latestTurn.move}`}>
          <b>{MOVE_LABEL[latestTurn.move]}.</b> <span className="cl-why">{latestTurn.why}</span>
        </div>
      )}
      <p className="cl-coach">{grade.coach}</p>
      <style jsx global>{`
        .fl-panel .fl-score { margin-left: auto; font-family: ${K.mono}; font-size: 12px; color: ${K.muted}; }
        .fl-els { display: flex; flex-direction: column; gap: 7px; margin-top: 4px; }
        .fl-el { display: flex; gap: 10px; align-items: flex-start; font-size: 13.5px; }
        .fl-el b { color: ${K.ink}; font-weight: 600; }
        .fl-dots { flex-shrink: 0; display: inline-flex; gap: 3px; margin-top: 6px; }
        .fl-dots i { width: 8px; height: 8px; border-radius: 50%; border: 1px solid ${K.edge}; background: transparent; }
        .fl-el.s1 .fl-dots i:first-child { background: ${K.warn}; border-color: ${K.warn}; }
        .fl-el.s2 .fl-dots i { background: ${K.ok}; border-color: ${K.ok}; }
        .fl-el.s0 .fl-dots i { border-color: ${K.crit}; }
        .fl-turn { margin-top: 10px; font-size: 13.5px; padding: 8px 10px; border-radius: 8px; background: ${K.sunk}; }
        .fl-turn b { color: ${K.ink}; }
        .fl-turn.repeated, .fl-turn.wandered { background: ${K.warnSoft}; }
        .fl-turn.moved { background: ${K.okSoft}; }
      `}</style>
    </div>
  );
}

/* A scripted reply shown sentence by sentence; each is a button until the
 * planted mistake is found or two tries are used. */
export function SpotReply({ sentences, errorIndex, picked, onPick, tool }: { sentences: string[]; errorIndex: number; picked: number[]; onPick: (i: number) => void; tool: string }) {
  const found = picked.includes(errorIndex);
  const done = found || picked.length >= 2;
  return (
    <div className="fl-spot">
      <div className="fl-spot-head"><span className="fl-spot-mark" aria-hidden />{tool}</div>
      {sentences.map((s, i) => {
        const state = !done ? (picked.includes(i) ? "wrong" : "") : i === errorIndex ? "right" : picked.includes(i) ? "wrong" : "";
        return (
          <button key={i} type="button" className={`cl-para pickable ${state}`} disabled={done || picked.includes(i)} onClick={() => onPick(i)}>
            {s}
          </button>
        );
      })}
      <style jsx global>{`
        .fl-spot { border: 1px solid ${K.edge}; border-radius: 12px; background: ${K.panel}; padding: 14px 16px; font-size: 14.5px; line-height: 1.6; color: ${K.body}; }
        .fl-spot-head { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: ${K.muted}; margin-bottom: 8px; }
        .fl-spot-mark { width: 18px; height: 18px; border-radius: 5px; background: ${K.grad}; }
      `}</style>
    </div>
  );
}
