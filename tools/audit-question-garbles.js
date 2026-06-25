const fs = require("fs");
const path = require("path");

const appRoot = "E:\\数学自用\\数学真题刷题小程序";
const questionDataPath = path.join(appRoot, "data", "questions.js");
const reportPath = path.join(appRoot, "docs", "question-garble-audit.md");

const suspectRe = /[\uFFFD\uE000-\uF8FF\uF028\uF029\uF02B\uF02D\uF03C\uF03D\uF05B\uF05D\uF078\uF0A2\uF0A3\uF0A5\uF0AE\uF0B1\uF0B6\uF0E6-\uF0FB\uF053]/g;

function loadQuestionData() {
  const text = fs.readFileSync(questionDataPath, "utf8");
  const match = text.match(/window\.QUESTION_DATA\s*=\s*([\s\S]*);\s*$/);
  if (!match) {
    throw new Error(`Cannot parse ${questionDataPath}`);
  }
  return JSON.parse(match[1]);
}

function describeChar(char) {
  return `${char} U+${char.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`;
}

function preview(text) {
  return text.replace(/\s+/g, " ").slice(0, 180).replace(/\|/g, "\\|");
}

function main() {
  const questions = loadQuestionData();
  const affected = questions
    .map((question) => {
      const hits = question.content_md.match(suspectRe) || [];
      if (!hits.length) return null;
      return {
        question,
        hitCount: hits.length,
        chars: [...new Set(hits)].map(describeChar)
      };
    })
    .filter(Boolean);

  const byYear = new Map();
  for (const item of affected) {
    const year = item.question.year;
    byYear.set(year, (byYear.get(year) || 0) + 1);
  }

  const lines = [
    "# 题目乱码核查报告",
    "",
    `- 题目总数：${questions.length}`,
    `- 含明显乱码字符题目数：${affected.length}`,
    `- 生成时间：${new Date().toLocaleString("zh-CN", { hour12: false })}`,
    "",
    "## 按年份统计",
    "",
    "| 年份 | 题目数 |",
    "| --- | ---: |",
    ...[...byYear.entries()].sort((a, b) => a[0] - b[0]).map(([year, count]) => `| ${year} | ${count} |`),
    "",
    "## 明细",
    "",
    "| 题目ID | 命中数 | 字符 | 预览 |",
    "| --- | ---: | --- | --- |",
    ...affected.map((item) => {
      const q = item.question;
      return `| ${q.question_id} | ${item.hitCount} | ${item.chars.join("<br>")} | ${preview(q.content_md)} |`;
    })
  ];

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");

  console.log(`questions=${questions.length}`);
  console.log(`affected=${affected.length}`);
  console.log(`report=${reportPath}`);
}

main();
