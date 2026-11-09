"use client";

import { useState } from "react";

/**
 * The class link, ready to go on the board.
 *
 * Shown without the https:// because a teacher writes what they see on a
 * whiteboard and nobody needs to copy that part out. The copy button hands
 * over the whole address, which is what a bookmark or an email wants.
 */
export default function ClassLink({ host, code }: { host: string; code: string }) {
  const [said, setSaid] = useState<string | null>(null);
  const shown = `${host}/c/${code}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${shown}`);
      setSaid("Copied");
    } catch {
      /* Refused in some browsers unless the page is focused. Selecting it is
         the honest fallback, and says so rather than claiming success. */
      setSaid("Select the link and copy it");
    }
    setTimeout(() => setSaid(null), 2200);
  };

  return (
    <div className="boardrow">
      <code className="boardlink">{shown}</code>
      <button type="button" className="axbtn" onClick={copy}>
        {said ?? "Copy link"}
      </button>
    </div>
  );
}
