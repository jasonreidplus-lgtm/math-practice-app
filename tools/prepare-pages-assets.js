const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const questionDataPath = path.join(root, "data", "questions.js");
const solutionDataPath = path.join(root, "data", "solutions.js");
const assetsRoot = path.join(root, "assets");

const imageRe = /!\[([^\]]*)\]\(([^)]+)\)/g;

function loadQuestions() {
  const text = fs.readFileSync(questionDataPath, "utf8");
  const match = text.match(/window\.QUESTION_DATA\s*=\s*([\s\S]*);\s*$/);
  if (!match) throw new Error("Cannot parse QUESTION_DATA");
  return JSON.parse(match[1]);
}

function loadSolutions() {
  const text = fs.readFileSync(solutionDataPath, "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(text, sandbox);
  return {
    solutionData: sandbox.window.SOLUTION_DATA || {},
    solutionSources: sandbox.window.SOLUTION_SOURCES || {},
    solutionById: sandbox.window.SOLUTION_BY_ID || {}
  };
}

function saveQuestions(questions) {
  fs.writeFileSync(questionDataPath, `window.QUESTION_DATA = ${JSON.stringify(questions)};\n`, "utf8");
}

function saveSolutions({ solutionData, solutionSources, solutionById }) {
  const output = [
    `window.SOLUTION_DATA = ${JSON.stringify(solutionData)};`,
    `window.SOLUTION_SOURCES = ${JSON.stringify(solutionSources)};`,
    `window.SOLUTION_BY_ID = ${JSON.stringify(solutionById)};`,
    ""
  ].join("\n");
  fs.writeFileSync(solutionDataPath, output, "utf8");
}

function isExternalOrPublic(src) {
  return /^[a-z]+:/i.test(src) || src.startsWith("/") || src.startsWith("assets/");
}

function safeName(value) {
  return String(value).replace(/[^\w.-]+/g, "_");
}

function sourceDir(row) {
  const sourcePath = row.source_path || "";
  if (!sourcePath) return "";
  return path.dirname(sourcePath);
}

function copyAsset(absSource, relTarget) {
  const target = path.join(root, relTarget);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(absSource, target);
}

function rewriteImages(row, makeRelTarget, report) {
  const sourceBase = sourceDir(row);
  if (!sourceBase || !row.content_md) return row;
  const publicRefs = [];
  const next = row.content_md.replace(imageRe, (full, alt, src) => {
    if (isExternalOrPublic(src)) {
      publicRefs.push(src);
      return full;
    }
    const normalizedSrc = src.replace(/\\/g, "/");
    const absSource = path.resolve(sourceBase, ...normalizedSrc.split("/"));
    if (!fs.existsSync(absSource)) {
      report.missing.push({ id: row.question_id || `${row.year}:${row.question_no}`, src, source_path: row.source_path });
      return full;
    }
    const relTarget = makeRelTarget(row, safeName(path.basename(normalizedSrc)));
    copyAsset(absSource, relTarget);
    report.copied.add(relTarget);
    publicRefs.push(relTarget.replace(/\\/g, "/"));
    return `![${alt}](${relTarget.replace(/\\/g, "/")})`;
  });
  row.content_md = next;
  if (publicRefs.length) row.public_asset_refs = Array.from(new Set(publicRefs));
  return row;
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

const report = {
  questionRows: 0,
  solutionRows: 0,
  copied: new Set(),
  missing: []
};

const questions = loadQuestions();
for (const question of questions) {
  const before = question.content_md;
  rewriteImages(
    question,
    (row, fileName) => path.join("assets", "questions", safeName(row.question_id), fileName),
    report
  );
  if (question.content_md !== before) report.questionRows += 1;
}
saveQuestions(questions);

const solutions = loadSolutions();
for (const solution of Object.values(solutions.solutionData)) {
  const before = solution.content_md;
  rewriteImages(
    solution,
    (row, fileName) => path.join("assets", "solutions", String(row.year), `q${pad2(row.question_no)}`, fileName),
    report
  );
  if (solution.content_md !== before) report.solutionRows += 1;
}
for (const solution of Object.values(solutions.solutionById)) {
  rewriteImages(
    solution,
    (row, fileName) => path.join("assets", "solutions", String(row.year), `q${pad2(row.question_no)}`, fileName),
    report
  );
}
saveSolutions(solutions);

const summary = {
  questionRowsRewritten: report.questionRows,
  solutionRowsRewritten: report.solutionRows,
  copiedAssets: report.copied.size,
  missingAssets: report.missing
};

console.log(JSON.stringify(summary, null, 2));
