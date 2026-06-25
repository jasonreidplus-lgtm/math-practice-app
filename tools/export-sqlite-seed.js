const fs = require("fs");
const path = require("path");
const vm = require("vm");

const appRoot = "E:\\数学自用\\数学真题刷题小程序";
const outputDir = path.join(appRoot, "database");
const outputSql = path.join(outputDir, "seed.sql");
const outputSummary = path.join(outputDir, "seed-summary.md");

const tagRules = [
  { name: "极限", patterns: ["极限", "lim", "\\lim"] },
  { name: "连续", patterns: ["连续"] },
  { name: "导数", patterns: ["导数", "可导", "偏导", "导函数", "f'"] },
  { name: "积分", patterns: ["积分", "\\int", "面积"] },
  { name: "级数", patterns: ["级数", "\\sum"] },
  { name: "线性代数", patterns: ["矩阵", "向量", "特征值", "线性"] },
  { name: "概率", patterns: ["概率", "随机变量", "密度", "分布"] },
  { name: "微分方程", patterns: ["微分方程"] },
  { name: "多元函数", patterns: ["二重积分", "曲面积分", "偏导数"] }
];

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(appRoot, "data", "questions.js"), "utf8"), context);
vm.runInContext(fs.readFileSync(path.join(appRoot, "data", "solutions.js"), "utf8"), context);

const questions = context.window.QUESTION_DATA || [];
const solutions = context.window.SOLUTION_BY_ID || {};
const sourceFiles = new Map();
const statements = [];
const reviewTasks = [];
let assetCount = 0;
let tagLinkCount = 0;

push("BEGIN TRANSACTION;");
push("INSERT OR REPLACE INTO subjects(subject_id, name, description) VALUES ('math1', '数学一', '全国硕士研究生招生考试数学（一）真题');");

for (const rule of tagRules) {
  push(`INSERT OR IGNORE INTO tags(tag_id, name) VALUES (${sql(tagId(rule.name))}, ${sql(rule.name)});`);
}

for (const question of questions) {
  addSource(question.source_path, "question", question.year, question.paper);
  push(`INSERT OR REPLACE INTO questions(question_id, subject_id, year, paper, paper_slug, question_no, content_md, source_path, relative_source_path, has_assets, quality_status, search_text) VALUES (${[
    sql(question.question_id),
    sql(question.subject || "math1"),
    num(question.year),
    sql(question.paper),
    sql(question.paper_slug),
    num(question.question_no),
    sql(question.content_md || ""),
    sql(question.source_path || ""),
    sql(question.relative_source_path || ""),
    question.has_assets ? 1 : 0,
    sql(question.quality_status || "ok"),
    sql(makeSearchText(question))
  ].join(", ")});`);

  for (const assetRef of question.asset_refs || []) {
    assetCount += 1;
    const assetId = `${question.question_id}_asset_${String(assetCount).padStart(4, "0")}`;
    push(`INSERT OR REPLACE INTO question_assets(asset_id, question_id, asset_ref, resolved_path) VALUES (${sql(assetId)}, ${sql(question.question_id)}, ${sql(assetRef)}, ${sql(resolveAssetPath(question.source_path, assetRef))});`);
  }

  for (const tag of inferTags(question.content_md || "")) {
    tagLinkCount += 1;
    push(`INSERT OR IGNORE INTO question_tags(question_id, tag_id) VALUES (${sql(question.question_id)}, ${sql(tagId(tag))});`);
  }

  const solution = solutions[question.question_id];
  if (solution) {
    addSource(solution.source_path, "solution", question.year, question.paper);
    push(`INSERT OR REPLACE INTO solutions(solution_id, question_id, year, question_no, chunk_no, source_chunk_index, content_md, source_path, quality_status, map_method, match_score, direct_key, best_chunk_no, best_score) VALUES (${[
      sql(`sol_${question.question_id}`),
      sql(question.question_id),
      num(solution.year),
      num(solution.question_no),
      nullableNum(solution.chunk_no),
      nullableNum(solution.source_chunk_index),
      sql(solution.content_md || ""),
      sql(solution.source_path || ""),
      sql(solution.quality_status || "ok"),
      sql(solution.map_method || ""),
      nullableNum(solution.match_score),
      sql(solution.direct_key || ""),
      nullableNum(solution.best_chunk_no),
      nullableNum(solution.best_score)
    ].join(", ")});`);
  }

  if (!solution) {
    reviewTasks.push([question, "missing_solution", "pending", "缺少题目级解析"]);
  }
  if (question.quality_status === "manual_check" || solution?.quality_status === "manual_check") {
    reviewTasks.push([question, "manual_check", "pending", auditReason(question, solution)]);
  }
}

for (const [sourcePath, source] of sourceFiles) {
  push(`INSERT OR IGNORE INTO source_files(source_id, source_path, source_type, year, paper) VALUES (${[
    sql(sourceId(sourcePath)),
    sql(sourcePath),
    sql(source.source_type),
    nullableNum(source.year),
    sql(source.paper || "")
  ].join(", ")});`);
}

for (const [index, [question, taskType, status, note]] of reviewTasks.entries()) {
  const taskId = `${question.question_id}_${taskType}_${String(index + 1).padStart(4, "0")}`;
  push(`INSERT OR REPLACE INTO review_tasks(task_id, question_id, task_type, status, note, priority) VALUES (${[
    sql(taskId),
    sql(question.question_id),
    sql(taskType),
    sql(status),
    sql(note),
    taskType === "missing_solution" ? 20 : 10
  ].join(", ")});`);
}

push("COMMIT;");

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputSql, statements.join("\n"), "utf8");
fs.writeFileSync(outputSummary, [
  "# SQLite 种子数据生成摘要",
  "",
  `- 生成时间：${new Date().toLocaleString("zh-CN", { hour12: false })}`,
  `- 题目：${questions.length}`,
  `- 题目级解析：${Object.keys(solutions).length}`,
  `- 资源引用：${assetCount}`,
  `- 标签关联：${tagLinkCount}`,
  `- 源文件：${sourceFiles.size}`,
  `- 校对任务：${reviewTasks.length}`,
  `- 输出：${outputSql}`
].join("\n"), "utf8");

console.log(outputSql);
console.log(`questions=${questions.length}`);
console.log(`solutions=${Object.keys(solutions).length}`);
console.log(`reviewTasks=${reviewTasks.length}`);

function push(statement) {
  statements.push(statement);
}

function sql(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? String(n) : "0";
}

function nullableNum(value) {
  if (value === null || value === undefined || value === "") return "NULL";
  const n = Number(value);
  return Number.isFinite(n) ? String(n) : "NULL";
}

function tagId(name) {
  return `tag_${name}`;
}

function sourceId(sourcePath) {
  return `src_${hash(sourcePath).slice(0, 16)}`;
}

function hash(value) {
  let h = 2166136261;
  for (const ch of String(value)) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function addSource(sourcePath, sourceType, year, paper) {
  if (!sourcePath || sourceFiles.has(sourcePath)) return;
  sourceFiles.set(sourcePath, { source_type: sourceType, year, paper });
}

function inferTags(content) {
  const text = content.toLowerCase();
  return tagRules
    .filter((tag) => tag.patterns.some((pattern) => text.includes(pattern.toLowerCase())))
    .map((tag) => tag.name)
    .slice(0, 4);
}

function makeSearchText(question) {
  return `${question.year} ${question.paper} 第${question.question_no}题 ${question.content_md || ""}`.toLowerCase();
}

function resolveAssetPath(sourcePath, assetRef) {
  if (!sourcePath || /^[a-z]+:/i.test(assetRef) || String(assetRef).startsWith("/")) return assetRef;
  return path.join(path.dirname(sourcePath), assetRef);
}

function auditReason(question, solution) {
  const reasons = [];
  if (question.quality_status === "manual_check") reasons.push("题目源需校对");
  if (solution?.quality_status === "manual_check") reasons.push(`解析需校对：${solution.map_method || "unknown"}`);
  return reasons.join("；");
}
