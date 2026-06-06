import { readFileSync } from "node:fs";
const f = "C:/Users/ASADJA~1/AppData/Local/Temp/claude/c--Users-Asad-Jalal-code-algorithmx/2aee303f-542f-4b16-ae53-8a017deab769/tasks/wyh1945th.output";
const data = JSON.parse(readFileSync(f, "utf8")).result;
const rows = data.map(({ concept, verdict }) => ({
  name: concept.name.replace(/^Concept\s+[A-D]\s*[—-]\s*/, "").replace(/"/g, "").slice(0, 36),
  total: verdict.total, ...verdict.scores,
}));
rows.sort((a, b) => b.total - a.total);
console.table(rows);
for (const { concept, verdict } of data) {
  console.log("\n#### " + concept.name + "  (total " + verdict.total + ")");
  console.log("VERDICT:", verdict.verdict);
  console.log("WEAK:", verdict.weaknesses);
}
