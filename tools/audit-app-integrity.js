const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "docs", "audit-2026-06-26");
const questionDataPath = path.join(root, "data", "questions.js");
const solutionDataPath = path.join(root, "data", "solutions.js");

const questionTypes = [
  { key: "choice", label: "选择题" },
  { key: "blank", label: "填空题" },
  { key: "essay", label: "大题" }
];

const questionContentOverrides = {
  math1_2025_main_q10: {
    quality_status: "ok",
    content_md: `10．设 $X_1,X_2,\\cdots,X_n$ 为来自正态总体 $N(\\mu,2)$ 的简单随机样本。记 $\\overline X=\\frac1n\\sum_{i=1}^n X_i$，$Z_\\alpha$ 表示标准正态分布的上侧 $\\alpha$ 分位数。假设检验问题 $H_0:\\mu\\leq 1, H_1:\\mu>1$ 的显著性水平为 $\\alpha$ 的检验的拒绝域为

A． $\\left\\{(X_1,X_2,\\cdots,X_n)\\mid \\overline X>1+\\frac{2}{n}Z_\\alpha\\right\\}$.

B． $\\left\\{(X_1,X_2,\\cdots,X_n)\\mid \\overline X>1+\\frac{\\sqrt2}{n}Z_\\alpha\\right\\}$.

C． $\\left\\{(X_1,X_2,\\cdots,X_n)\\mid \\overline X>1+\\frac{2}{\\sqrt n}Z_\\alpha\\right\\}$.

D． $\\left\\{(X_1,X_2,\\cdots,X_n)\\mid \\overline X>1+\\sqrt{\\frac2n}Z_\\alpha\\right\\}$.

【答案】D

【解析】当 $\\mu=1$ 时，$\\frac{\\overline X-1}{\\sqrt{2/n}}\\sim N(0,1)$。右侧检验在显著性水平 $\\alpha$ 下的拒绝域为

$$
\\frac{\\overline X-1}{\\sqrt{2/n}}>Z_\\alpha,
$$

即 $\\overline X>1+\\sqrt{\\frac2n}Z_\\alpha$。`
  }
};

function loadQuestions() {
  const text = fs.readFileSync(questionDataPath, "utf8");
  const match = text.match(/window\.QUESTION_DATA\s*=\s*([\s\S]*);\s*$/);
  if (!match) throw new Error("Cannot parse QUESTION_DATA");
  return JSON.parse(match[1]).map(applyQuestionOverride);
}

function applyQuestionOverride(question) {
  const override = questionContentOverrides[question.question_id];
  return override ? { ...question, ...override } : question;
}

function loadSolutions() {
  const text = fs.readFileSync(solutionDataPath, "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(text, sandbox);
  return sandbox.window.SOLUTION_BY_ID || {};
}

function splitInlineContent(content) {
  const normalized = String(content || "").replace(/\r\n/g, "\n").trim();
  const marker = normalized.search(/(?:【答案】|【解析】|【解】|(?:^|\n)\s*(?:答案\s*[:：]|解析\s*[:：]|解\s*[:：]))/m);
  if (marker < 0) {
    const solveMarker = normalized.search(/(?:^|\n)\s*解[:：]/m);
    if (solveMarker < 0) return { question: normalized, solution: "" };
    return {
      question: normalized.slice(0, solveMarker).trim(),
      solution: normalized.slice(solveMarker).trim()
    };
  }
  return {
    question: normalized.slice(0, marker).trim(),
    solution: normalized.slice(marker).trim()
  };
}

function recoverStemFromSolution(question, inline, solution) {
  const shouldRecoverChoiceOptions = inferQuestionTypeFromStructure(question, inline.question) === "choice" &&
    choiceLabels(inline.question).length === 0;
  if (!needsStemRecovery(inline.question) && !shouldRecoverChoiceOptions) return "";
  if (!isUsableSolutionForStemRecovery(solution)) return "";
  const recovered = splitInlineContent(solution.content_md).question.trim();
  if (!needsStemRecovery(recovered) && recovered.length >= 20) return recovered;
  return "";
}

function needsStemRecovery(stem) {
  const text = String(stem || "").replace(/^#+\s*/gm, "").replace(/\s+/g, " ").trim();
  if (!text) return true;
  if (/^["'【（(]?\d{1,2}["'】）).．、]?\s*$/.test(text)) return true;
  return text.length < 12;
}

function choiceLabels(stem) {
  const labels = new Set();
  const optionRe = /(?:^|\n|\s{2,})\s*\$?\s*(?:(?:\\left\s*)?[（(]\s*(?:\\mathrm\s*\{\s*)?([A-D])(?:\s*\})?\s*(?:\\right\s*)?[）)]|\\mathrm\s*\{\s*[（(]\s*([A-D])\s*[）)]\s*\}|(?:\\mathrm\s*\{\s*)?([A-D])(?:\s*\})?\s*[．.、])/g;
  let match;
  while ((match = optionRe.exec(String(stem || "")))) labels.add(match[1] || match[2] || match[3]);
  return Array.from(labels).sort();
}

function hasChoiceOptions(stem) {
  return choiceLabels(stem).length >= 3;
}

function isBlankQuestion(question, stem) {
  const text = `${question.paper || ""}\n${stem || ""}`;
  return /填空题|_{3,}|____|underline|\\underline|\\qquad|应填|填\s*[:：]/.test(text);
}

function recentQuestionType(question) {
  const year = Number(question.year);
  const no = Number(question.question_no);
  if (year < 2021) return "";
  if (no >= 1 && no <= 10) return "choice";
  if (no >= 11 && no <= 16) return "blank";
  if (no >= 17) return "essay";
  return "";
}

function inferQuestionType(question, stem) {
  const structuralType = inferQuestionTypeFromStructure(question, stem);
  if (structuralType) return structuralType;
  if (isBlankQuestion(question, stem)) return "blank";
  return "essay";
}

function inferQuestionTypeFromStructure(question, stem) {
  const recentType = recentQuestionType(question);
  if (recentType) return recentType;
  if (hasChoiceOptions(stem) || hasChoiceSectionHeading(question, stem)) return "choice";
  return "";
}

function hasChoiceSectionHeading(question, stem) {
  const text = `${question.paper || ""}\n${stem || ""}`;
  const headingIndex = text.search(/(?:^|\n)\s*#*\s*(?:[一二三四五六七八九十]+[、.．]|\d+[、.．)]|[（(]\d+[）)])?\s*选择题/);
  if (headingIndex < 0) return false;
  const questionIndex = text.search(/(?:^|\n)\s*(?:[（(]\s*\d{1,2}\s*[）)]|\d{1,2}[.．、])/);
  return questionIndex < 0 || headingIndex < questionIndex;
}

function normalizeChoice(value) {
  const match = String(value || "").toUpperCase().match(/[A-D]/);
  return match ? match[0] : "";
}

function correctChoice(question, solution) {
  const inline = splitInlineContent(question.content_md).solution;
  return extractChoiceAnswer(inline, isTrustedSolution(solution) ? solution.content_md || "" : "", question.content_md || "");
}

function extractChoiceAnswer(...texts) {
  const candidates = texts.join("\n");
  const match = candidates.match(/(?:【答案】|答案\s*[:：]?)\s*[（(]?\s*([A-D])\s*[）)]?/i);
  return normalizeChoice(match?.[1] || "");
}

function untrustedChoiceAnswer(question, solution) {
  if (isTrustedSolution(solution)) return "";
  return extractChoiceAnswer(solution?.content_md || "");
}

function isTrustedSolution(solution) {
  if (!solution?.content_md) return false;
  if (solution.quality_status === "manual_check") return false;
  return !/^similarity_fallback/i.test(solution.map_method || "");
}

function isUsableSolutionForStemRecovery(solution) {
  if (!solution?.content_md) return false;
  return !/^similarity_fallback/i.test(solution.map_method || "");
}

function imageRefs(markdown) {
  return Array.from(String(markdown || "").matchAll(/!\[[^\]]*]\(([^)]+)\)/g)).map((match) => match[1]);
}

function isPublicAsset(src) {
  return /^(assets\/|\.\/assets\/|https?:|data:|\/)/.test(src);
}

function suspiciousHits(text) {
  const checks = [
    ["replacement_char", /�/],
    ["private_use_symbol_font", /[\uE000-\uF8FF]/],
    ["legacy_2024_surface_integral_garble", /P y z Q z x d d d d|/],
    ["bare_qquad", /(?<!\\)qquad/],
    ["ocr_spaced_function_names", /\b(?:l i m|s i n|c o s|t a n|r a n k|operatorname \{ [a-z] \s [a-z])/i],
    ["old_2025_q20_0yright", /0y\\right/],
    ["bad_option_repeat", /（B）\s*\n\s*\n（B）\s*\n\s*\n（B）/],
    ["broken_answer_marker", /【答案】\s*$/]
  ];
  return checks.filter(([, re]) => re.test(text)).map(([name]) => name);
}

function preview(text, length = 180) {
  return String(text || "").replace(/\s+/g, " ").slice(0, length);
}

function pushIssue(issues, severity, id, message, detail = {}) {
  issues.push({ severity, id, message, ...detail });
}

function renderIssueTable(issues) {
  if (!issues.length) return "无\n";
  return [
    "| 级别 | 题目ID | 问题 | 详情 |",
    "| --- | --- | --- | --- |",
    ...issues.map((issue) => `| ${issue.severity} | ${issue.id || "-"} | ${issue.message} | ${preview(JSON.stringify(issue), 220).replace(/\|/g, "\\|")} |`)
  ].join("\n");
}

fs.mkdirSync(outDir, { recursive: true });

const questions = loadQuestions();
const solutions = loadSolutions();
const issues = [];
const counts = {
  total: questions.length,
  type: { choice: 0, blank: 0, essay: 0 },
  inlineSolution: 0,
  solutionMapped: 0,
  recoveredStems: 0,
  contentOverrides: Object.keys(questionContentOverrides).length,
  imageRefs: 0,
  publicImageRefs: 0
};

const seenIds = new Set();

for (const question of questions) {
  const id = question.question_id;
  if (seenIds.has(id)) pushIssue(issues, "P0", id, "题目 ID 重复");
  seenIds.add(id);

  const inline = splitInlineContent(question.content_md);
  const solution = solutions[id];
  const recoveredStem = recoverStemFromSolution(question, inline, solution);
  const stem = recoveredStem || inline.question;
  const type = inferQuestionType(question, stem);
  const labels = choiceLabels(stem);
  const answer = correctChoice(question, solution);
  const lowTrustAnswer = untrustedChoiceAnswer(question, solution);
  const hits = suspiciousHits(question.content_md);
  const refs = imageRefs(question.content_md);

  counts.type[type] += 1;
  if (inline.solution) counts.inlineSolution += 1;
  if (solution) counts.solutionMapped += 1;
  if (recoveredStem) counts.recoveredStems += 1;
  counts.imageRefs += refs.length;
  counts.publicImageRefs += refs.filter(isPublicAsset).length;

  if (recoveredStem) pushIssue(issues, "P2", id, "题干已从内置解析恢复，建议人工抽查", { originalStem: inline.question, recoveredPreview: preview(recoveredStem) });
  if (!recoveredStem && inline.question.length < 12) pushIssue(issues, "P1", id, "题干拆分后过短", { stem: inline.question });
  if (/【答案】|【解析】|【解】/.test(stem)) pushIssue(issues, "P0", id, "题干页仍包含答案/解析标记", { stemPreview: preview(stem) });
  if (!solution && !inline.solution) pushIssue(issues, "P2", id, "未匹配解析且题内无解析");
  if (inline.solution && !/(【答案】|答案|【解析】|解析|【解】|解[:：])/.test(inline.solution)) {
    pushIssue(issues, "P1", id, "题内解析片段缺少明确答案/解析标记", { inlinePreview: preview(inline.solution) });
  }

  if (type === "choice") {
    if (labels.length === 0) pushIssue(issues, "P1", id, "选择题未识别到任何选项标签", { labels });
    else if (labels.length < 4) pushIssue(issues, "P2", id, "选择题选项标签可能不完整", { labels });
    if (!answer) pushIssue(issues, "P2", id, "选择题未识别到可信标准答案", { labels });
    if (!answer && lowTrustAnswer) pushIssue(issues, "P2", id, "低可信解析中存在答案，未用于自动判分", { answer: lowTrustAnswer, map_method: solution?.map_method, quality_status: solution?.quality_status });
    if (answer && labels.length && !labels.includes(answer)) pushIssue(issues, "P2", id, "标准答案不在选项标签中，疑似 OCR 选项标号缺失", { answer, labels });
  } else if (labels.length >= 3) {
    pushIssue(issues, "P1", id, "疑似选择题但未归入选择题板块", { inferredType: type, labels, preview: preview(question.content_md) });
  }

  for (const ref of refs) {
    if (!isPublicAsset(ref)) pushIssue(issues, "P1", id, "图片引用不是 Pages 可用的相对资源", { ref });
    const normalized = ref.replace(/^\.\//, "");
    if ((ref.startsWith("assets/") || ref.startsWith("./assets/")) && !fs.existsSync(path.join(root, normalized))) {
      pushIssue(issues, "P1", id, "图片文件缺失", { ref });
    }
  }

  if (hits.length) pushIssue(issues, "P2", id, "命中 OCR/乱码风险模式", { hits, preview: preview(question.content_md) });
}

const bySeverity = issues.reduce((map, issue) => {
  map[issue.severity] = (map[issue.severity] || 0) + 1;
  return map;
}, {});

const p0p1 = issues.filter((issue) => issue.severity === "P0" || issue.severity === "P1");
const p2 = issues.filter((issue) => issue.severity === "P2");

const report = `# 数据准确性与完整性审计

- 生成时间：${new Date().toLocaleString("zh-CN", { hour12: false })}
- 题目总数：${counts.total}
- 题型识别：选择题 ${counts.type.choice} / 填空题 ${counts.type.blank} / 大题 ${counts.type.essay}
- 题内答案/解析识别：${counts.inlineSolution}
- 题目级解析映射：${counts.solutionMapped}
- 从内置解析恢复残缺题干：${counts.recoveredStems}
- 人工内容覆盖：${counts.contentOverrides}
- 图片引用：${counts.publicImageRefs}/${counts.imageRefs} 为 Pages 可用相对资源
- 问题统计：${Object.entries(bySeverity).map(([key, value]) => `${key}=${value}`).join("，") || "无"}

## P0/P1 高优先级

${renderIssueTable(p0p1)}

## P2 待人工复核

${renderIssueTable(p2.slice(0, 120))}

${p2.length > 120 ? `\n> P2 共 ${p2.length} 条，报告仅显示前 120 条，完整 JSON 见同目录。` : ""}
`;

fs.writeFileSync(path.join(outDir, "data-integrity-report.md"), report, "utf8");
fs.writeFileSync(path.join(outDir, "data-integrity-report.json"), JSON.stringify({ counts, bySeverity, issues }, null, 2), "utf8");

console.log(JSON.stringify({ counts, bySeverity, p0p1: p0p1.length, output: path.join(outDir, "data-integrity-report.md") }, null, 2));
