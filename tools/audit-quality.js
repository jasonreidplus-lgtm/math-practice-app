const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");

const appRoot = "E:\\数学自用\\数学真题刷题小程序";
const questionsJs = path.join(appRoot, "data", "questions.js");
const solutionsJs = path.join(appRoot, "data", "solutions.js");
const reportPath = path.join(appRoot, "docs", "quality-audit.md");

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(questionsJs, "utf8"), context, { filename: questionsJs });
vm.runInContext(fs.readFileSync(solutionsJs, "utf8"), context, { filename: solutionsJs });

const questions = context.window.QUESTION_DATA || [];
const solutionData = context.window.SOLUTION_DATA || {};
const solutionById = context.window.SOLUTION_BY_ID || {};
const solutionSources = context.window.SOLUTION_SOURCES || {};

const sortedQuestions = [...questions].sort(sortQuestion);
const missing = [];
const manual = [];
const directMismatch = [];
const leadingMismatchOk = [];
const fallbackMappings = [];
const yearRows = [];

for (const question of sortedQuestions) {
  const solution = currentSolution(question);
  if (!solution) {
    missing.push(question);
  }
  if (hasManualRisk(question, solution)) {
    manual.push({ question, solution });
  }
  if (solution) {
    const direct = solutionData[`${Number(question.year)}:${Number(question.question_no)}`];
    if (direct && normalizeContent(direct.content_md) !== normalizeContent(solution.content_md)) {
      directMismatch.push({ question, solution, direct });
    }
    if (String(solution.map_method || "").startsWith("similarity_fallback")) {
      fallbackMappings.push({ question, solution });
    }
    if (Number(question.year) >= 2004 &&
        solution.chunk_no !== null &&
        solution.chunk_no !== undefined &&
        Number(solution.chunk_no) !== Number(question.question_no) &&
        solution.quality_status !== "manual_check") {
      leadingMismatchOk.push({ question, solution });
    }
  }
}

const duplicateGroups = findDuplicateSolutionGroups(sortedQuestions);

for (const group of groupBy(sortedQuestions, (question) => question.year)) {
  const items = group.items;
  const withSolutions = items.filter((question) => !!currentSolution(question)).length;
  const manualCount = items.filter((question) => hasManualRisk(question, currentSolution(question))).length;
  yearRows.push({
    year: group.key,
    total: items.length,
    withSolutions,
    missing: items.length - withSolutions,
    manual: manualCount
  });
}

const report = [
  "# 题库与解析质量审核报告",
  "",
  `- 生成时间：${new Date().toLocaleString("zh-CN", { hour12: false })}`,
  "- 审核对象：数学真题刷题小程序数据与解析索引。",
  "- 原则：宁缺毋错；无法可靠匹配的解析不强行展示，低置信度映射标为需校对。",
  "- 生成脚本：tools/audit-quality.js",
  "",
  "## 总览",
  "",
  `- 题目记录：${questions.length}`,
  `- 可显示解析的题目记录：${questions.length - missing.length}`,
  `- 待补写/待匹配解析：${missing.length}`,
  `- 题目级解析映射：${Object.keys(solutionById).length}`,
  `- 题号级解析键：${Object.keys(solutionData).length}`,
  `- 已发现解析源年份：${Object.keys(solutionSources).length}`,
  `- 需校对解析或题目：${manual.length}`,
  `- 相似度兜底映射：${fallbackMappings.length}`,
  `- BY_ID 与同题号 direct 解析不一致：${directMismatch.length}`,
  `- 2004 年后题号不一致但仍标 ok：${leadingMismatchOk.length}`,
  `- 同卷多题复用同一解析可疑组：${duplicateGroups.length}`,
  "",
  "## 年份覆盖",
  "",
  "| 年份 | 题目记录 | 有解析 | 待补写 | 需校对 |",
  "|---|---:|---:|---:|---:|",
  ...yearRows.map((row) => `| ${row.year} | ${row.total} | ${row.withSolutions} | ${row.missing} | ${row.manual} |`),
  "",
  "## 待补写清单",
  "",
  ...formatMissingList(missing),
  "",
  "## 需校对清单",
  "",
  ...formatManualList(manual),
  "",
  "## 一致性检查",
  "",
  "### 相似度兜底映射",
  "",
  ...formatSolutionRiskList(fallbackMappings),
  "",
  "### BY_ID 与 Direct 不一致",
  "",
  ...formatDirectMismatchList(directMismatch),
  "",
  "### 题号不一致但仍标 ok",
  "",
  ...formatSolutionRiskList(leadingMismatchOk),
  "",
  "### 同卷多题复用同一解析",
  "",
  ...formatDuplicateGroups(duplicateGroups),
  "",
  "## 审核结论",
  "",
  "- 程序只使用题目 ID 级解析映射展示单题解析，避免早期年份大题/小题混排导致的单纯题号错配。",
  "- 构建脚本优先使用明确题号 direct 解析；相似度兜底只作为需校对候选展示。",
  "- 2004 年后的题号不一致解析若仍标 ok，会在一致性检查中单独暴露。",
  "- 解析质量为 manual_check 的题目会在小程序筛选、统计、题库表和复习队列中统一计入“需校对”。",
  "- 解析源中的相对图片路径按解析 Markdown 所在目录解析；题目源中的相对图片路径按题目 Markdown 所在目录解析。",
  "- 2025 年当前没有本地解析源，保留为待补写，不自动编造答案。"
].join("\n");

fs.writeFileSync(reportPath, report, "utf8");
console.log(reportPath);
console.log(`questions=${questions.length}`);
console.log(`withSolutions=${questions.length - missing.length}`);
console.log(`missing=${missing.length}`);
console.log(`manual=${manual.length}`);

function currentSolution(question) {
  return solutionById[question.question_id] || null;
}

function hasManualRisk(question, solution) {
  return question.quality_status === "manual_check" ||
    solution?.quality_status === "manual_check";
}

function formatMissingList(items) {
  if (!items.length) return ["- 无"];
  return items.map((question) => `- ${formatQuestion(question)}：${question.question_id}；${snippet(question.content_md)}`);
}

function formatManualList(items) {
  if (!items.length) return ["- 无"];
  return items.map(({ question, solution }) => {
    const reason = [
      question.quality_status === "manual_check" ? "题目源需校对" : "",
      solution?.quality_status === "manual_check" ? `解析需校对${solution.map_method ? ` (${solution.map_method})` : ""}` : ""
    ].filter(Boolean).join("；");
    return `- ${formatQuestion(question)}：${question.question_id}；${reason}`;
  });
}

function formatSolutionRiskList(items) {
  if (!items.length) return ["- 无"];
  return items.slice(0, 80).map(({ question, solution }) => (
    `- ${formatQuestion(question)}：${question.question_id}；` +
    `method=${solution.map_method || "-"}；chunk=${solution.chunk_no ?? "-"}；score=${solution.match_score ?? "-"}；quality=${solution.quality_status || "-"}`
  )).concat(items.length > 80 ? [`- 其余 ${items.length - 80} 条略。`] : []);
}

function formatDirectMismatchList(items) {
  if (!items.length) return ["- 无"];
  return items.slice(0, 80).map(({ question, solution }) => (
    `- ${formatQuestion(question)}：${question.question_id}；` +
    `BY_ID method=${solution.map_method || "-"}；chunk=${solution.chunk_no ?? "-"}；` +
    `direct chunk=${solutionData[`${Number(question.year)}:${Number(question.question_no)}`]?.chunk_no ?? "-"}`
  )).concat(items.length > 80 ? [`- 其余 ${items.length - 80} 条略。`] : []);
}

function formatDuplicateGroups(groups) {
  if (!groups.length) return ["- 无"];
  return groups.slice(0, 80).map((group) => (
    `- ${group.year} ${group.paper}：${group.questions.map((question) => `第${pad2(question.question_no)}题`).join("、")} 复用同一解析`
  )).concat(groups.length > 80 ? [`- 其余 ${groups.length - 80} 组略。`] : []);
}

function formatQuestion(question) {
  return `${question.year} ${question.paper} 第${pad2(question.question_no)}题`;
}

function snippet(markdown) {
  return String(markdown || "")
    .replace(/\s+/g, " ")
    .replace(/\|/g, "/")
    .trim()
    .slice(0, 160);
}

function sortQuestion(a, b) {
  return Number(a.year) - Number(b.year) ||
    String(a.paper).localeCompare(String(b.paper), "zh-CN") ||
    Number(a.question_no) - Number(b.question_no);
}

function groupBy(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return [...map.entries()].map(([key, groupItems]) => ({ key, items: groupItems }));
}

function findDuplicateSolutionGroups(items) {
  const map = new Map();
  for (const question of items) {
    const solution = currentSolution(question);
    if (!solution?.content_md) continue;
    const hash = crypto.createHash("sha1").update(normalizeContent(solution.content_md)).digest("hex");
    const key = `${question.year}|${question.paper}|${hash}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(question);
  }
  return [...map.values()]
    .filter((group) => new Set(group.map((question) => Number(question.question_no))).size > 1)
    .map((group) => ({
      year: group[0].year,
      paper: group[0].paper,
      questions: group.sort(sortQuestion)
    }));
}

function normalizeContent(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function pad2(value) {
  return String(value).padStart(2, "0");
}
