import Link from "next/link";
import DeadEnd from "@/app/components/dead-end/DeadEnd";

/* Why a shared teacher-pack link does not open: the round 8 dead end
 * (landing lab r8-state.html?s=pack-share) in the light house. The words are
 * the page's own TROUBLE entries, passed in. */
export default function PackTrouble({ head, body, link }: { head: string; body: string; link: boolean }) {
  return (
    <DeadEnd
      tone="school"
      lockup="school"
      back={{ href: "/schools", label: "AlgorithmX for Schools" }}
      err
      eyebrow="Teacher pack"
      title={head}
      glyph="unlink"
      actions={
        link ? (
          <Link className="r8-btn" data-kind="ghost" href="/schools">
            See what a school licence includes
          </Link>
        ) : undefined
      }
    >
      <p>{body}</p>
    </DeadEnd>
  );
}
