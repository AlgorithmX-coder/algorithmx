/**
 * Animated elements that try to carry their own centring transform.
 *
 * Motion owns `transform` on any element whose animation touches a transform
 * property, so a static `transform: translate(-50%, -50%)` in that element's
 * `style` is silently dropped and it hangs off its own top-left corner. No
 * error, no type complaint - it just sits half its own size down and right.
 *
 * Two reported bugs so far: the reveal pedestals (UAT W9 7a, badge ring 65px
 * off the shield) and the encore ring (UAT W20 8a/8b, ~55px off the stage
 * circle). Both had been "fixed" earlier by adding the very transform that
 * cannot survive.
 *
 * An opacity-only animation leaves a static translate alone, so this reports
 * ONLY elements whose animation actually touches scale/x/y/rotate/skew.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";

const ROOTS = ["app/components", "app/lesson"];
const files = [];
function walk(dir) {
  for (const e of readdirSync(dir)) {
    const q = `${dir}/${e}`;
    if (statSync(q).isDirectory()) walk(q);
    else if (q.endsWith(".tsx")) files.push(q);
  }
}
for (const r of ROOTS) walk(r);

const TRANSFORM_PROPS = /\b(scale|scaleX|scaleY|x|y|rotate|rotateX|rotateY|rotateZ|skew|skewX|skewY)\s*:/;
const ANIM_PROP = /\b(animate|initial|whileTap|whileHover|whileInView|exit)\s*=\s*\{/g;

const hits = [];
for (const f of files) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/<motion\.[a-zA-Z]+\b([\s\S]*?)\/?>/g)) {
    const tag = m[1];
    if (tag.length > 4000) continue;
    if (!/transform:\s*[`"']translate/.test(tag)) continue;

    // Collect the text of every animation prop on this tag.
    let anim = "";
    ANIM_PROP.lastIndex = 0;
    let a;
    while ((a = ANIM_PROP.exec(tag))) anim += tag.slice(a.index, a.index + 320) + " ";
    if (!TRANSFORM_PROPS.test(anim)) continue;

    const line = src.slice(0, m.index).split("\n").length;
    const snippet = (tag.match(/transform:\s*[`"'][^`"']*[`"']/) || [""])[0];
    const props = [...new Set((anim.match(TRANSFORM_PROPS) || []).concat((anim.match(/\b(scale|rotate|x|y)\s*:/g) || [])))].join(" ");
    hits.push({ f: f.replace("app/components/", "").replace("app/", ""), line, snippet, props });
  }
}

console.log(`${files.length} files scanned.`);
console.log(`${hits.length} element(s) animate a transform AND carry a static translate:\n`);
for (const h of hits) console.log(`  ${h.f}:${h.line}\n     ${h.snippet}\n     animates: ${h.props}`);
