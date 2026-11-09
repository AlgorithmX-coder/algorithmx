/* A tiny drawn window of the app each course part teaches, for the top
 * right of its card on the landing (owner 2026-11-09: "have like a
 * spreadsheet in the top right ... Outlook open ... SharePoint open"). Drawn
 * in code with the apps' own title-bar colours and no vendor artwork, like
 * the practice windows inside the course. Decorative only. Styles are in
 * PREVIEW_CSS, which the landing adds to its stylesheet. */

export type PreviewKind = "desktop" | "outlook" | "excel" | "sharepoint" | "copilot" | "word";

function Bar({ name, colour }: { name: string; colour: string }) {
  return (
    <span className="dr-pv-bar" style={{ background: colour }}>
      <i />
      {name}
    </span>
  );
}

export default function PartPreview({ kind }: { kind: PreviewKind }) {
  if (kind === "desktop")
    return (
      <span className="dr-pv dr-pv-desktop" aria-hidden>
        <span className="dr-pv-dwin">
          <Bar name="Files" colour="#c28a14" />
        </span>
        <span className="dr-pv-taskbar">
          <b />
          <b className="on" />
          <b />
        </span>
        <svg className="dr-pv-cursor" viewBox="0 0 24 24" width="16" height="16">
          <path d="M5 3 L5 19 L9.5 14.8 L12.6 21 L15.4 19.8 L12.4 13.6 L18.5 13.6 Z" fill="#ffffff" stroke="#14161d" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      </span>
    );

  if (kind === "outlook")
    return (
      <span className="dr-pv" aria-hidden>
        <Bar name="Outlook" colour="#0f6cbd" />
        <span className="dr-pv-body dr-pv-mail">
          {[true, false, false].map((unread, i) => (
            <span key={i} className={unread ? "dr-pv-mrow on" : "dr-pv-mrow"}>
              <span className="dr-pv-dot" />
              <span className="dr-pv-lines">
                <b style={{ width: ["58%", "44%", "52%"][i] }} />
                <s style={{ width: ["86%", "74%", "80%"][i] }} />
              </span>
            </span>
          ))}
        </span>
      </span>
    );

  if (kind === "excel")
    return (
      <span className="dr-pv" aria-hidden>
        <Bar name="Excel" colour="#107c41" />
        <span className="dr-pv-body dr-pv-grid">
          {Array.from({ length: 20 }, (_, i) => {
            const r = Math.floor(i / 5);
            const c = i % 5;
            const head = r === 0 || c === 0;
            const sel = r === 2 && c === 3;
            return <span key={i} className={head ? "h" : sel ? "sel" : r === 1 ? "b" : ""} />;
          })}
        </span>
      </span>
    );

  if (kind === "sharepoint")
    return (
      <span className="dr-pv" aria-hidden>
        <Bar name="SharePoint" colour="#038387" />
        <span className="dr-pv-body dr-pv-files">
          {[
            ["#f2b84b", "54%"],
            ["#f2b84b", "40%"],
            ["#185abd", "62%"],
            ["#107c41", "48%"],
          ].map(([colour, w], i) => (
            <span key={i} className="dr-pv-frow">
              <span className={i < 2 ? "dr-pv-folder" : "dr-pv-doc"} style={{ background: colour }} />
              <b style={{ width: w }} />
            </span>
          ))}
          <span className="dr-pv-share">Share</span>
        </span>
      </span>
    );

  if (kind === "copilot")
    return (
      <span className="dr-pv" aria-hidden>
        <Bar name="Copilot" colour="linear-gradient(90deg, #2b59c3, #7a5cf0)" />
        <span className="dr-pv-body dr-pv-chat">
          <span className="dr-pv-ask" />
          <span className="dr-pv-reply">
            <svg viewBox="0 0 24 24" width="10" height="10">
              <path d="M12 2l2.2 6.3L20.5 10l-6.3 2.2L12 18.5l-2.2-6.3L3.5 10l6.3-1.7z" fill="#7a5cf0" />
            </svg>
            <span className="dr-pv-lines">
              <s style={{ width: "92%" }} />
              <s style={{ width: "78%" }} />
              <s style={{ width: "60%" }} />
            </span>
          </span>
        </span>
      </span>
    );

  return (
    <span className="dr-pv" aria-hidden>
      <Bar name="Word · CV" colour="#185abd" />
      <span className="dr-pv-body dr-pv-doc-page">
        <b style={{ width: "52%" }} />
        <s style={{ width: "36%" }} />
        <em />
        <s style={{ width: "90%" }} />
        <s style={{ width: "82%" }} />
        <em />
        <s style={{ width: "86%" }} />
      </span>
    </span>
  );
}

export const PREVIEW_CSS = `
        .dr-pv {
          position: relative; flex-shrink: 0; display: flex; flex-direction: column; width: 136px; height: 86px; border-radius: 9px; overflow: hidden;
          background: #ffffff; border: 1px solid rgba(255,255,255,0.4);
          box-shadow: 0 14px 30px -12px rgba(0,0,0,0.75), 0 0 0 1px rgba(0,0,0,0.25), 0 0 26px -8px var(--dr-accent);
          transform: rotate(2deg); transition: transform .3s ease;
        }
        .dr-part:hover .dr-pv { transform: rotate(0deg) translateY(-3px) scale(1.04); }
        .dr-pv-bar { display: flex; align-items: center; gap: 5px; height: 16px; padding: 0 7px; flex-shrink: 0; color: #ffffff; font-family: var(--lv2-font-display); font-size: 8.5px; font-weight: 700; letter-spacing: 0.02em; white-space: nowrap; }
        .dr-pv-bar i { width: 6px; height: 6px; border-radius: 2px; background: rgba(255,255,255,0.75); }
        .dr-pv-body { flex: 1; min-height: 0; padding: 6px 7px; box-sizing: border-box; }
        .dr-pv-lines { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0; }
        .dr-pv b, .dr-pv s { display: block; height: 4px; border-radius: 2px; text-decoration: none; }
        .dr-pv b { background: #2a2e36; }
        .dr-pv s { background: #c9ced8; }
        /* outlook */
        .dr-pv-mail { display: flex; flex-direction: column; gap: 4px; padding: 5px 6px; }
        .dr-pv-mrow { display: flex; align-items: center; gap: 5px; padding: 3px 4px; border-radius: 4px; }
        .dr-pv-mrow.on { background: rgba(15,108,189,0.12); box-shadow: inset 2px 0 0 #0f6cbd; }
        .dr-pv-dot { width: 5px; height: 5px; border-radius: 50%; background: transparent; flex-shrink: 0; }
        .dr-pv-mrow.on .dr-pv-dot { background: #0f6cbd; }
        /* excel */
        .dr-pv-grid { display: grid; grid-template-columns: 9px repeat(4, 1fr); grid-auto-rows: 1fr; padding: 0; }
        .dr-pv-grid span { border-right: 1px solid #e3e6eb; border-bottom: 1px solid #e3e6eb; }
        .dr-pv-grid .h { background: #eef0f3; }
        .dr-pv-grid .b { background: linear-gradient(#2a2e36, #2a2e36) center / 70% 3px no-repeat; }
        .dr-pv-grid .sel { box-shadow: inset 0 0 0 1.5px #107c41; background: rgba(16,124,65,0.08); }
        /* sharepoint */
        .dr-pv-files { position: relative; display: flex; flex-direction: column; gap: 5px; }
        .dr-pv-frow { display: flex; align-items: center; gap: 5px; }
        .dr-pv-folder { width: 10px; height: 7px; border-radius: 1.5px; flex-shrink: 0; }
        .dr-pv-doc { width: 7px; height: 9px; border-radius: 1.5px; flex-shrink: 0; }
        .dr-pv-share { position: absolute; right: 6px; top: 5px; padding: 1px 5px; border-radius: 4px; background: #038387; color: #ffffff; font-family: var(--lv2-font-display); font-size: 7px; font-weight: 700; }
        /* copilot */
        .dr-pv-chat { display: flex; flex-direction: column; gap: 5px; background: #f6f5fd; }
        .dr-pv-ask { align-self: flex-end; width: 58%; height: 11px; border-radius: 6px 6px 2px 6px; background: #d9dcf5; }
        .dr-pv-reply { display: flex; align-items: flex-start; gap: 4px; padding: 5px 6px; border-radius: 6px 6px 6px 2px; background: #ffffff; box-shadow: 0 1px 3px rgba(20,22,29,0.12); }
        .dr-pv-reply svg { display: block; flex-shrink: 0; }
        /* word cv */
        .dr-pv-doc-page { display: flex; flex-direction: column; gap: 3px; padding: 7px 12px; background: #ffffff; }
        .dr-pv-doc-page b { height: 5px; background: #185abd; }
        .dr-pv-doc-page em { display: block; height: 2px; }
        /* desktop */
        .dr-pv-desktop { background: linear-gradient(160deg, #3b6fd1, #22468f); }
        .dr-pv-dwin { position: absolute; left: 12px; top: 10px; width: 78px; height: 46px; border-radius: 4px; overflow: hidden; background: #ffffff; box-shadow: 0 6px 12px rgba(0,0,0,0.3); }
        .dr-pv-taskbar { position: absolute; left: 0; right: 0; bottom: 0; height: 14px; display: flex; align-items: center; justify-content: center; gap: 4px; background: rgba(246,243,238,0.92); }
        .dr-pv-taskbar b { width: 14px; height: 5px; border-radius: 2px; background: #9aa3b2; }
        .dr-pv-taskbar b.on { background: #2b59c3; }
        .dr-pv-cursor { position: absolute; left: 84px; top: 34px; display: block; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.35)); }
        @media (max-width: 420px) { .dr-pv { width: 112px; height: 72px; } }
`;
