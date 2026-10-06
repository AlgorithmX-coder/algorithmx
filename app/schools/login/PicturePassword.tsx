"use client";

import { useMemo, useState } from "react";
import {
  PICTURE_FILE,
  PICTURE_KEYS,
  PICTURE_LABEL,
  SEQUENCE_LENGTH,
  type PictureKey,
} from "@/app/lib/pictures";

/**
 * A password a six year old can use.
 *
 * Twelve pictures, tap three. No spelling, no keyboard, nothing to say out
 * loud. The owner rule that a child is never asked to say, write or type a
 * password in front of others is the whole reason this exists rather than a
 * text box.
 *
 * THE GRID IS SHUFFLED EVERY TIME. A child who watches a classmate tap the
 * top-left corner three times learns nothing, because next time the rocket is
 * somewhere else. It does not stop somebody watching WHICH pictures, and
 * nothing can at this age on a shared screen: that is why a teacher can reset
 * a child's pictures in one click.
 *
 * Progress shows as filled dots rather than the chosen pictures, so the
 * screen never displays the answer back at the room.
 */

/** Fisher-Yates, seeded by nothing: a fresh order on every mount and after
 *  every wrong attempt. */
function shuffled<T>(xs: readonly T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PicturePassword({
  pupilName,
  setup,
  busy,
  error,
  onDone,
  onBack,
}: {
  pupilName: string;
  /** First time in: the child picks their pictures, then taps them again to
   *  be sure they remember. */
  setup: boolean;
  busy: boolean;
  error: string | null;
  onDone: (sequence: string[]) => void;
  onBack: () => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const [first, setFirst] = useState<string[] | null>(null);
  const [mismatch, setMismatch] = useState(false);
  const [round, setRound] = useState(0);

  /* re-shuffles whenever the round changes, which is every attempt */
  const grid = useMemo(() => shuffled(PICTURE_KEYS), [round]);

  const confirming = setup && first !== null;

  const tap = (k: string) => {
    if (busy) return;
    setMismatch(false);
    const next = [...picked, k];
    if (next.length < SEQUENCE_LENGTH) { setPicked(next); return; }

    setPicked([]);
    setRound((r) => r + 1);

    if (!setup) { onDone(next); return; }
    if (first === null) { setFirst(next); return; }

    if (first.join(".") === next.join(".")) { onDone(next); return; }
    /* not the same three: start the choosing over, because a child who
       cannot repeat them now will not remember them next week */
    setFirst(null);
    setMismatch(true);
  };

  const heading = !setup
    ? "Tap your three pictures"
    : confirming
      ? "Tap the same three again"
      : "Choose three pictures";

  const under = !setup
    ? "The three you chose, in the same order."
    : confirming
      ? "So we know you will remember them."
      : "Pick three you will remember. The order matters.";

  return (
    <div className="pp">
      <button type="button" className="ppback" onClick={onBack} disabled={busy}>
        &larr; Not {pupilName}?
      </button>

      <h2 className="pphead">{heading}</h2>
      <p className="ppunder">{under}</p>

      <div className="ppdots" aria-label={`${picked.length} of ${SEQUENCE_LENGTH} chosen`}>
        {Array.from({ length: SEQUENCE_LENGTH }, (_, i) => (
          <span key={i} className={"ppdot" + (i < picked.length ? " on" : "")} />
        ))}
      </div>

      {mismatch && <p className="pperr">Those were not the same three. Have another go.</p>}
      {error && <p className="pperr">{error}</p>}

      <div className="ppgrid">
        {grid.map((k) => (
          <button
            key={k}
            type="button"
            className="ppcell"
            onClick={() => tap(k)}
            disabled={busy}
            aria-label={PICTURE_LABEL[k]}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/cyberheroes/icons/${PICTURE_FILE[k]}.png`} alt="" />
          </button>
        ))}
      </div>

      {busy && <p className="ppbusy">Signing you in&hellip;</p>}
    </div>
  );
}
