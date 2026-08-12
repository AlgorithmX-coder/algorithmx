"use client";

import CodeRainBackground from "@/app/components/landing-v3/CodeRainBackground";

/**
 * landing-v3 - the rebuilt homepage (sales-first).
 *
 * Built section by section. This pass ships the foundation: the live-code
 * backdrop, a clean nav (no status-bar gimmick), and the hero. Scoped under
 * `.axv3` with one <style> block (SSR-safe, no styled-jsx registry).
 */
export default function LandingV3() {
  return (
    <div className="axv3">
      <style>{CSS}</style>
      <CodeRainBackground />
      <div className="veil" aria-hidden="true" />

      <nav className="nav">
        <div className="wrap navrow">
          <a href="/" className="brand"><span className="mark" />AlgorithmX</a>
          <div className="navlinks">
            <a href="/courses">Courses</a>
            <a href="#offer">Cyber Security</a>
            <a href="/login">Log in</a>
          </div>
          <a href="/courses" className="btn primary sm">Get started <span className="ar">-&gt;</span></a>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="wrap">
            <div className="eyebrow"><span className="dot" />Cyber security &middot; ages 6 to 17 &middot; live today</div>
            <h1>
              From spotting scams at six<br />
              to a <span className="grad">&pound;60K career.</span>
            </h1>
            <p className="lead">
              AlgorithmX teaches real cyber security as one path from age 6 to adult, project by
              project, at your child&rsquo;s own pace. Not videos to watch, real skills they build and keep.
            </p>
            <div className="ctas">
              <a href="/courses" className="btn primary">Explore Cyber Security <span className="ar">-&gt;</span></a>
              <a href="#how" className="btn ghost">See how it works</a>
            </div>
            <div className="trust">
              <span>Ages 6 to 17</span><i />
              <span>Real projects, not passive videos</span><i />
              <span>One payment, lifetime access</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const CSS = `
.axv3{
  --bg:#05070d; --panel:#0b0f18; --raise:#111726;
  --ink:#eaf0ff; --soft:#aeb8d4; --mute:#71809f; --faint:#3c465f;
  --cyan:#4fe0ff; --cyan-deep:#1ea7c9; --indigo:#8b7bff; --green:#4ade80;
  --line:rgba(120,180,255,.14); --line-soft:rgba(120,180,255,.08);
  --disp:var(--font-chakra),'Chakra Petch','Segoe UI',system-ui,sans-serif;
  --mono:var(--font-plex-mono),'IBM Plex Mono',ui-monospace,Menlo,Consolas,monospace;
  --sans:var(--font-plex-sans),'IBM Plex Sans',system-ui,-apple-system,'Segoe UI',sans-serif;
  position:relative; min-height:100vh; background:var(--bg); color:var(--ink);
  font-family:var(--sans); overflow-x:hidden;
}
.axv3 *{box-sizing:border-box}
.axv3 .veil{position:fixed;inset:0;z-index:0;pointer-events:none;
  background:
    radial-gradient(1200px 760px at 20% 26%, rgba(5,7,13,.78), rgba(5,7,13,.40) 58%, rgba(5,7,13,0) 100%),
    linear-gradient(180deg, rgba(5,7,13,.42), rgba(5,7,13,.30) 40%, rgba(5,7,13,.66));
}
.axv3 .wrap{width:100%;max-width:1200px;margin:0 auto;padding:0 clamp(20px,4vw,44px);position:relative;z-index:1}

/* nav */
.axv3 .nav{position:sticky;top:0;z-index:20;backdrop-filter:blur(10px);
  background:linear-gradient(180deg,rgba(5,7,13,.82),rgba(5,7,13,.5));border-bottom:1px solid var(--line-soft)}
.axv3 .navrow{display:flex;align-items:center;gap:26px;height:66px}
.axv3 .brand{display:flex;align-items:center;gap:11px;font-family:var(--disp);font-weight:700;letter-spacing:.12em;
  font-size:17px;color:var(--ink);text-decoration:none;text-transform:uppercase}
.axv3 .brand .mark{width:19px;height:19px;border-radius:5px;background:linear-gradient(135deg,var(--cyan),var(--indigo));
  box-shadow:0 0 14px -2px var(--cyan)}
.axv3 .navlinks{display:flex;gap:26px;margin-left:14px}
.axv3 .navlinks a{font-family:var(--mono);font-size:13px;letter-spacing:.04em;color:var(--soft);text-decoration:none}
.axv3 .navlinks a:hover{color:var(--ink)}
.axv3 .nav .btn{margin-left:auto}
@media(max-width:720px){.axv3 .navlinks{display:none}}

/* buttons */
.axv3 .btn{display:inline-flex;align-items:center;gap:9px;font-family:var(--disp);font-weight:700;letter-spacing:.06em;
  text-decoration:none;border-radius:11px;padding:14px 24px;font-size:14.5px;cursor:pointer;transition:transform .12s,filter .12s,border-color .15s}
.axv3 .btn.sm{padding:10px 18px;font-size:13px;border-radius:9px}
.axv3 .btn.primary{color:#04121a;background:linear-gradient(180deg,#7ceaff,var(--cyan));
  box-shadow:0 0 0 1px rgba(120,224,255,.4),0 12px 34px -12px rgba(79,224,255,.6)}
.axv3 .btn.primary:hover{filter:brightness(1.06);transform:translateY(-1px)}
.axv3 .btn.ghost{color:var(--ink);background:rgba(120,180,255,.05);border:1px solid var(--line)}
.axv3 .btn.ghost:hover{border-color:var(--cyan);color:var(--cyan)}
.axv3 .btn .ar{font-family:var(--mono);font-weight:600}

/* hero */
.axv3 .hero{min-height:calc(100vh - 66px);display:flex;align-items:center;padding:60px 0 84px}
.axv3 .eyebrow{display:inline-flex;align-items:center;gap:10px;font-family:var(--mono);font-size:12.5px;letter-spacing:.16em;
  text-transform:uppercase;color:var(--cyan);margin-bottom:26px}
.axv3 .eyebrow .dot{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 10px var(--green)}
.axv3 .hero h1{font-family:var(--disp);font-weight:700;line-height:1.02;letter-spacing:-.015em;
  font-size:clamp(2.6rem,6.4vw,5rem);margin:0 0 24px;max-width:16ch;text-wrap:balance}
.axv3 .hero h1 .grad{background:linear-gradient(100deg,var(--cyan),var(--indigo));-webkit-background-clip:text;background-clip:text;color:transparent}
.axv3 .lead{font-size:clamp(16px,1.5vw,19px);line-height:1.65;color:var(--soft);max-width:60ch;margin:0 0 34px}
.axv3 .ctas{display:flex;flex-wrap:wrap;gap:14px;margin-bottom:30px}
.axv3 .trust{display:flex;flex-wrap:wrap;align-items:center;gap:14px;font-family:var(--mono);font-size:12.5px;color:var(--mute);letter-spacing:.02em}
.axv3 .trust i{width:4px;height:4px;border-radius:50%;background:var(--faint)}
`;
