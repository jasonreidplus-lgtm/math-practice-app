const fs = require("fs");
const path = require("path");

const sourceRoot = "E:\\数学自用\\数据资料\\真题\\按年份整理";
const appRoot = "E:\\数学自用\\数学真题刷题小程序";
const questionsJsonl = "E:\\数学自用\\题库数据库整理\\tables\\questions_seed.jsonl";
const outputJs = path.join(appRoot, "data", "solutions.js");
const reportPath = path.join(appRoot, "docs", "solutions-build-report.md");
const SIMILARITY_FALLBACK_THRESHOLD = 0.12;
const MANUAL_SCORE_THRESHOLD = 0.08;

const questions = fs.readFileSync(questionsJsonl, "utf8")
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => JSON.parse(line));

const questionsByYear = groupBy(questions, (q) => String(q.year));
const solutions = {};
const solutionById = {};
const yearSources = {};
const reportRows = [];

for (const [year, yearQuestions] of Object.entries(questionsByYear)) {
  const sourcePath = findSolutionFile(Number(year));
  if (!sourcePath) {
    reportRows.push({ year, source: "", chunks: 0, matched: 0, status: "missing_source" });
    continue;
  }

  const markdown = fs.readFileSync(sourcePath, "utf8");
  yearSources[year] = sourcePath;
  const chunks = splitSolutions(markdown, Number(year))
    .map((chunk, index) => ({ ...chunk, index }));
  const byQuestionNo = new Map();

  for (const chunk of chunks) {
    if (!chunk.content.trim()) continue;
    if (!byQuestionNo.has(chunk.no)) {
      byQuestionNo.set(chunk.no, chunk);
    }
  }

  let matched = 0;
  const questionNos = [...new Set(yearQuestions.map((q) => Number(q.question_no)))].sort((a, b) => a - b);
  const uniqueChunkNos = new Set(chunks.map((chunk) => chunk.no));
  const hasGlobalQuestionNumbers = questionNos.filter((no) => uniqueChunkNos.has(no)).length >= Math.min(questionNos.length, 18);
  const useSequentialMap = !hasGlobalQuestionNumbers && chunks.length >= Math.ceil(questionNos.length * 0.65);

  for (let index = 0; index < questionNos.length; index += 1) {
    const no = questionNos[index];
    let chunk = null;
    let mapMethod = "";
    if (useSequentialMap) {
      chunk = chunks[index] || null;
      mapMethod = "sequential_year_index";
    } else {
      chunk = byQuestionNo.get(no) || null;
      mapMethod = "year_question_no";
    }
    const content = chunk?.content?.trim() || "";
    if (!content) continue;
    matched += 1;
    solutions[`${year}:${no}`] = {
      year: Number(year),
      question_no: no,
      chunk_no: chunk.no,
      source_chunk_index: chunk.index + 1,
      content_md: content,
      source_path: sourcePath,
      quality_status: estimateQuality(content, Number(year)),
      map_method: mapMethod
    };
  }

  for (const question of yearQuestions) {
    const best = findBestChunk(question, chunks);
    const direct = solutions[`${year}:${Number(question.question_no)}`];
    let chosen = null;
    let mapMethod = "";
    let matchScore = null;
    if (direct) {
      chosen = direct;
      mapMethod = direct.map_method || "year_question_no";
      matchScore = scoreQuestionAgainstContent(question, direct.content_md || "");
    } else if (best && best.score >= SIMILARITY_FALLBACK_THRESHOLD) {
      chosen = best.chunk;
      mapMethod = `similarity_fallback:${best.score.toFixed(3)}`;
      matchScore = best.score;
    }
    if (chosen) {
      const content = chosen.content_md || chosen.content || "";
      const chunkNo = chosen.chunk_no || chosen.no || null;
      const sourceChunkIndex = chosen.source_chunk_index || (chosen.index === undefined ? null : chosen.index + 1);
      const quality = estimateMappedQuality({
        content,
        year: Number(year),
        questionNo: Number(question.question_no),
        chunkNo,
        mapMethod,
        matchScore
      });
      solutionById[question.question_id] = {
        year: Number(year),
        question_no: Number(question.question_no),
        chunk_no: chunkNo,
        source_chunk_index: sourceChunkIndex,
        content_md: content,
        source_path: chosen.source_path || sourcePath,
        quality_status: quality,
        map_method: mapMethod,
        match_score: matchScore === null ? null : Number(matchScore.toFixed(3)),
        direct_key: direct ? `${year}:${Number(question.question_no)}` : "",
        best_chunk_no: best?.chunk?.no || null,
        best_score: best ? Number(best.score.toFixed(3)) : null
      };
    }
  }

  reportRows.push({
    year,
    source: sourcePath,
    chunks: chunks.length,
    matched,
    status: matched ? (useSequentialMap ? "ok_sequential" : "ok_numbered") : "no_chunks"
  });
}

const js = [
  "window.SOLUTION_DATA = ",
  JSON.stringify(solutions),
  ";",
  "window.SOLUTION_BY_ID = ",
  JSON.stringify(solutionById),
  ";",
  "window.SOLUTION_SOURCES = ",
  JSON.stringify(yearSources),
  ";"
].join("");
fs.writeFileSync(outputJs, js, "utf8");

const report = [
  "# 解析索引构建报告",
  "",
  `- 生成时间：${new Date().toLocaleString("zh-CN", { hour12: false })}`,
  `- 输出文件：${outputJs}`,
  `- 解析键数量：${Object.keys(solutions).length}`,
  `- 题目级解析映射：${Object.keys(solutionById).length}`,
  "",
  "| 年份 | 解析块数 | 已映射题号数 | 状态 | 源文件 |",
  "|---|---:|---:|---|---|",
  ...reportRows
    .sort((a, b) => Number(a.year) - Number(b.year))
    .map((row) => `| ${row.year} | ${row.chunks} | ${row.matched} | ${row.status} | ${row.source} |`),
  "",
  "## 说明",
  "",
  "- 解析文件格式并不完全统一，本脚本按题号标记切分；明确题号解析优先于相似度匹配。",
  "- 非顺序年份不再使用 chunks[index] 硬兜底，避免把相邻题解析错配为 ok。",
  "- 无明确题号时只保留相似度较高的兜底候选，并统一标记为 manual_check。",
  "- 早期年份存在大题/小题混排，题号映射可能需要后续人工校对。",
  "- 2022 年解析由 OCR 转换而来，自动标记为 manual_check。"
].join("\n");
fs.writeFileSync(reportPath, report, "utf8");

console.log(`solutions: ${Object.keys(solutions).length}`);
console.log(outputJs);
console.log(reportPath);

function findSolutionFile(year) {
  const dir = path.join(sourceRoot, String(year), "解析");
  if (!fs.existsSync(dir)) return null;
  const expected = path.join(dir, `${year}年解析.md`);
  if (fs.existsSync(expected)) return expected;
  const mdFiles = fs.readdirSync(dir)
    .filter((name) => name.toLowerCase().endsWith(".md"))
    .map((name) => path.join(dir, name))
    .sort((a, b) => fs.statSync(b).size - fs.statSync(a).size);
  return mdFiles[0] || null;
}

function splitSolutions(markdown, year) {
  const normalized = markdown.replace(/\r/g, "");
  if (year === 2022) return split2022Solutions(normalized);
  let matches = collectBracketMarkers(normalized);
  if (matches.length < 8) matches = collectLineMarkers(normalized);
  if (matches.length < 18) matches = mergeMarkers(matches, collectGenericNumberedMarkers(normalized));
  if (matches.length < 3) return [];

  const chunks = [];
  for (let i = 0; i < matches.length; i += 1) {
    const current = matches[i];
    const next = matches[i + 1];
    const content = normalized.slice(current.index, next ? next.index : normalized.length).trim();
    if (!content) continue;
    chunks.push({ no: current.no, content });
  }
  return chunks.filter((chunk) => chunk.no >= 1 && chunk.no <= 40);
}

function split2022Solutions(text) {
  const markers = [];
  const bareNumberRegex = /(^|\n)[ \t]*(\d{1,2})(?=\s+\S)/g;
  let match;
  while ((match = bareNumberRegex.exec(text))) {
    const no = Number(match[2]);
    if (no >= 1 && no <= 22) {
      markers.push({ no, index: match.index + match[1].length });
    }
  }
  const manualPatterns = [
    [3, /\n设数列/],
    [4, /\n若\s+\$I_\{1\}/],
    [5, /\n下列4个条件中/]
  ];
  for (const [no, pattern] of manualPatterns) {
    const found = pattern.exec(text);
    if (found) markers.push({ no, index: found.index + 1 });
  }
  const sorted = mergeMarkers(markers)
    .filter((marker) => marker.index < text.indexOf("# 2022年全国硕士研究生招生考试数学（一）答案速查"));
  const chunks = [];
  for (let i = 0; i < sorted.length; i += 1) {
    const current = sorted[i];
    const next = sorted[i + 1];
    chunks.push({
      no: current.no,
      content: text.slice(current.index, next ? next.index : text.length).trim()
    });
  }
  return chunks;
}

function collectBracketMarkers(text) {
  const matches = [];
  const regex = /【\s*(\d{1,2})\s*】/g;
  let match;
  while ((match = regex.exec(text))) {
    matches.push({ no: Number(match[1]), index: match.index });
  }
  return matches;
}

function collectLineMarkers(text) {
  const matches = [];
  const regex = /(^|\n)[ \t]*(?:(?:#{0,3}\s*)?([一二三四五六七八九十]{1,3})[、.，]\s*(?=【解】|【答案】|【解析】|【证明】|$)|(?:#{0,3}\s*)?([一二三四五六七八九十]{1,3})、(?=\s*$)|[（(]\s*(\d{1,2})\s*[)）](?=\s*(?:【答案】|【解析】|【解】|【证明】|$|[A-D][\.。]?))|(\d{1,2})[\.、](?=\s*(?:【答案】|【解析】|【解】|【证明】|$|[A-D][\.。]?)))/g;
  let match;
  while ((match = regex.exec(text))) {
    const chineseNo = match[2] || match[3];
    matches.push({
      no: chineseNo ? chineseNumberToInt(chineseNo) : Number(match[4] || match[5]),
      index: match.index + match[1].length
    });
  }
  return matches;
}

function collectGenericNumberedMarkers(text) {
  const matches = [];
  const regex = /(^|\n)[ \t]*(?:[（(]\s*(\d{1,2})\s*[)）]|(\d{1,2})[\.、]|(\d{1,2})(?=\s+[\u4e00-\u9fa5]))(?=\s*(?:[\u4e00-\u9fa5]|\$|\\|[（(]|[A-D][\.。]?))/g;
  let match;
  while ((match = regex.exec(text))) {
    matches.push({
      no: Number(match[2] || match[3] || match[4]),
      index: match.index + match[1].length
    });
  }
  return matches;
}

function mergeMarkers(...groups) {
  const byIndex = new Map();
  for (const group of groups) {
    for (const marker of group) byIndex.set(marker.index, marker);
  }
  return [...byIndex.values()].sort((a, b) => a.index - b.index);
}

function chineseNumberToInt(value) {
  const map = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
  if (value === "十") return 10;
  if (value === "十一") return 11;
  if (value.startsWith("十")) return 10 + (map[value.slice(1)] || 0);
  if (value.endsWith("十")) return (map[value[0]] || 1) * 10;
  if (value.includes("十")) {
    const [tens, ones] = value.split("十");
    return (map[tens] || 1) * 10 + (map[ones] || 0);
  }
  return map[value] || 0;
}

function estimateQuality(content, year) {
  if (year === 2022) return "manual_check";
  if (content.includes("\uFFFD")) return "manual_check";
  return "ok";
}

function estimateMappedQuality({ content, year, questionNo, chunkNo, mapMethod, matchScore }) {
  if (estimateQuality(content, year) === "manual_check") return "manual_check";
  if (mapMethod.startsWith("similarity_fallback")) return "manual_check";
  if (mapMethod === "sequential_year_index" && matchScore !== null && matchScore < MANUAL_SCORE_THRESHOLD) return "manual_check";
  if (year >= 2004 && chunkNo !== null && Number(chunkNo) !== Number(questionNo)) return "manual_check";
  return "ok";
}

function findBestChunk(question, chunks) {
  const questionTokens = makeTokenSet(question.content_md || "");
  if (!questionTokens.size) return null;
  let best = null;
  for (const chunk of chunks) {
    const chunkTokens = makeTokenSet(chunk.content || "");
    if (!chunkTokens.size) continue;
    const score = containmentScore(questionTokens, chunkTokens);
    if (!best || score > best.score) best = { chunk, score };
  }
  return best;
}

function scoreQuestionAgainstContent(question, content) {
  const questionTokens = makeTokenSet(question.content_md || "");
  const contentTokens = makeTokenSet(content || "");
  if (!questionTokens.size || !contentTokens.size) return 0;
  return containmentScore(questionTokens, contentTokens);
}

function makeTokenSet(text) {
  const clean = String(text)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .toLowerCase();
  const set = new Set();
  if (clean.length <= 3) {
    if (clean) set.add(clean);
    return set;
  }
  for (let i = 0; i <= clean.length - 3; i += 1) {
    set.add(clean.slice(i, i + 3));
  }
  return set;
}

function containmentScore(sourceTokens, candidateTokens) {
  let hit = 0;
  for (const token of sourceTokens) {
    if (candidateTokens.has(token)) hit += 1;
  }
  return hit / sourceTokens.size;
}

function groupBy(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}
