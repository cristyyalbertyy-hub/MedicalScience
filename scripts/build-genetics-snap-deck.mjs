import fs from "node:fs";
import path from "node:path";

const dir = "C:/Users/crist/Documents/Solitaire/Genetics/public";
const outDir = "C:/Users/crist/Documents/Solitaire/Site Medical/snap/decks";
const files = fs.readdirSync(dir).filter((f) => f.endsWith("_Q.csv"));

function parseCsv(text) {
  const rows = [];
  let i = 0;
  let field = "";
  let row = [];
  let inQ = false;
  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    if (row.some((c) => c.trim())) rows.push(row);
    row = [];
  };
  while (i < text.length) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i += 2;
        continue;
      }
      if (c === '"') {
        inQ = false;
        i += 1;
        continue;
      }
      field += c;
      i += 1;
      continue;
    }
    if (c === '"') {
      inQ = true;
      i += 1;
      continue;
    }
    if (c === ",") {
      pushField();
      i += 1;
      continue;
    }
    if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i += 1;
      pushField();
      pushRow();
      i += 1;
      continue;
    }
    field += c;
    i += 1;
  }
  if (field.length || row.length) {
    pushField();
    pushRow();
  }
  return rows;
}

const topicMap = {
  BG_MP: "Mendelian principles",
  BG_T: "Transmission",
  BG_PG: "Population genetics",
  CA_GD: "Genetic diagnosis",
  CA_PA: "Pedigree analysis",
  CA_RC: "Risk calculation",
  IM_C: "Chromosomes",
  IM_M: "Mutation",
  IM_Mi: "Mitochondrial inheritance",
  IM_Mu: "Multifactorial inheritance",
};

const cards = [];
for (const file of files) {
  const id = file.replace("_Q.csv", "");
  const topic = topicMap[id] || id;
  const rows = parseCsv(fs.readFileSync(path.join(dir, file), "utf8"));
  for (const r of rows) {
    if (r.length < 2) continue;
    let q = String(r[0] || "").trim();
    let a = String(r[1] || "").trim();
    if (!q || !a) continue;
    if (a.length > 72) continue;
    if (q.length > 160) q = `${q.slice(0, 157)}...`;
    a = a.replace(/\.$/, "");
    cards.push({
      id: `${id}_${cards.length}`,
      topic,
      prompt: q,
      answer: a,
    });
  }
}

const byTopic = {};
const picked = [];
for (const c of cards) {
  byTopic[c.topic] = byTopic[c.topic] || [];
  if (byTopic[c.topic].length < 8) {
    byTopic[c.topic].push(c);
    picked.push(c);
  }
}

fs.mkdirSync(outDir, { recursive: true });
const deck = {
  packageId: "genetics",
  title: "Genetics",
  version: 1,
  timerSeconds: 10,
  roundsPerSession: 10,
  cards: picked,
};
fs.writeFileSync(path.join(outDir, "genetics.json"), JSON.stringify(deck, null, 2));
console.log(
  JSON.stringify(
    {
      eligible: cards.length,
      picked: picked.length,
      topics: Object.fromEntries(Object.entries(byTopic).map(([k, v]) => [k, v.length])),
    },
    null,
    2,
  ),
);
