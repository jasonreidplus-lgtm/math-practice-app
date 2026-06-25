const fs = require("fs");
const path = require("path");
const vm = require("vm");

const appRoot = "E:\\数学自用\\数学真题刷题小程序";
const organizedRoot = "E:\\数学自用\\数据资料\\真题\\按年份整理";
const questionDataPath = path.join(appRoot, "data", "questions.js");
const solutionDataPath = path.join(appRoot, "data", "solutions.js");
const questionsJsonlPath = "E:\\数学自用\\题库数据库整理\\tables\\questions_seed.jsonl";
const reportPath = path.join(appRoot, "docs", "question-garble-fix-report.md");

const suspectRe = /[\uFFFD\uE000-\uF8FF\uF028\uF029\uF02B\uF02D\uF03C\uF03D\uF05B\uF05D\uF078\uF0A2\uF0A3\uF0A5\uF0AE\uF0B1\uF0B6\uF0E6-\uF0FB\uF053]/g;

const symbolFontMap = new Map([
  ["", "("],
  ["", ")"],
  ["", "+"],
  ["", "-"],
  ["", "="],
  ["", "<"],
  ["", "["],
  ["", "]"],
  ["", "\\xi"],
  ["", "\\Sigma"],
  ["", "\\pi"],
  ["", "'"],
  ["", "\\leqslant"],
  ["", "\\infty"],
  ["", "\\to"],
  ["", "\\pm"],
  ["", "\\partial"],
  ["", "\\int"],
  ["", "\\sum"],
  ["", "("],
  ["", ")"],
  ["", ""],
  ["", ""],
  ["", "("],
  ["", ")"],
  ["", "["],
  ["", "]"],
  ["", ""],
  ["", ""],
  ["", "["],
  ["", "]"],
  ["", "\\left\\{"],
  ["", ""],
  ["", ""],
  ["", "\\right."],
  ["", ""]
]);

function loadQuestionData() {
  const text = fs.readFileSync(questionDataPath, "utf8");
  const match = text.match(/window\.QUESTION_DATA\s*=\s*([\s\S]*);\s*$/);
  if (!match) {
    throw new Error(`Cannot parse ${questionDataPath}`);
  }
  return JSON.parse(match[1]);
}

function loadSolutionData() {
  const text = fs.readFileSync(solutionDataPath, "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(text, sandbox);
  return sandbox.window.SOLUTION_BY_ID || {};
}

function loadJsonl(filePath) {
  return fs.readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function saveQuestionData(questions) {
  fs.writeFileSync(questionDataPath, `window.QUESTION_DATA = ${JSON.stringify(questions, null, 0)};\n`, "utf8");
}

function saveJsonl(filePath, rows) {
  fs.writeFileSync(filePath, `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`, "utf8");
}

function extractQuestionStem(content) {
  const normalized = content.replace(/\r\n/g, "\n").trim();
  const marker = normalized.search(/(?:^|\n)\s*(?:【?答案】?|答案(?:\s|[:：]|$)|分析(?:\s|[:：]|$)|解[：:]|解\s|证明|证\s)/m);
  const stem = (marker >= 0 ? normalized.slice(0, marker) : normalized).trim();
  return stem
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function cleanSymbolFont(text) {
  let output = text;
  for (const [from, to] of symbolFontMap) {
    output = output.split(from).join(to);
  }
  return output;
}

function containsSuspect(text) {
  suspectRe.lastIndex = 0;
  return suspectRe.test(text);
}

function replaceBeforeAnswer(text, replacement) {
  const index = text.search(/(?:^|\n)【答案】/m);
  if (index < 0) return replacement.trim();
  return `${replacement.trim()}\n\n${text.slice(index).trimStart()}`;
}

function patch2024Question(question) {
  let text = question.content_md;
  if (question.question_no === 2) {
    text = text.replace(
      /则\s*P y z Q z x d d d d\+\s*=\s*/,
      () => "则 $\\iint_{\\Sigma} P\\,\\mathrm{d}y\\,\\mathrm{d}z + Q\\,\\mathrm{d}z\\,\\mathrm{d}x =$"
    );
    text = text.replace(
      /\n\n\$\$\n\\iint_ \{\\Sigma\} \\left\(- \\frac \{x\}\{z\} P \+ \\frac \{y\}\{z\} Q\\right\) d x d y\n\$\$/,
      () => "\n\n（B）\n\n$$\n\\iint_ {\\Sigma} \\left(- \\frac {x}{z} P + \\frac {y}{z} Q\\right) d x d y\n$$"
    );
    text = text.replace(
      /\n\n（B）\n\n\$\n(\\iint_ \{\\Sigma\} \\left\(- \\frac \{x\}\{z\} P \+ \\frac \{y\}\{z\} Q\\right\) d x d y)\n\$/,
      (_match, formula) => `\n\n（B）\n\n$$\n${formula}\n$$`
    );
    text = `【2】设 $P=P(x,y,z),Q=Q(x,y,z)$ 均为连续函数，$\\Sigma$ 为曲面 $z=\\sqrt{1-x^2-y^2}$（$x\\geqslant 0,y\\geqslant 0$）的上侧，则

$$
\\iint_{\\Sigma} P\\,\\mathrm{d}y\\,\\mathrm{d}z+Q\\,\\mathrm{d}z\\,\\mathrm{d}x =
$$

（A）

$$
\\iint_{\\Sigma}\\left(\\frac{x}{z}P+\\frac{y}{z}Q\\right)\\mathrm{d}x\\,\\mathrm{d}y
$$

（B）

$$
\\iint_{\\Sigma}\\left(-\\frac{x}{z}P+\\frac{y}{z}Q\\right)\\mathrm{d}x\\,\\mathrm{d}y
$$

（C）

$$
\\iint_{\\Sigma}\\left(\\frac{x}{z}P-\\frac{y}{z}Q\\right)\\mathrm{d}x\\,\\mathrm{d}y
$$

（D）

$$
\\iint_{\\Sigma}\\left(-\\frac{x}{z}P-\\frac{y}{z}Q\\right)\\mathrm{d}x\\,\\mathrm{d}y
$$

【答案】（A）`;
  }
  if (question.question_id === "math1_2024_main_ref_answers_q13") {
    text = text.replace(
      /则\s*极\s*限2 2 1lim sin nn a − = n\s*→\s*/,
      "则极限 $\\lim_{n\\to\\infty} n^2\\sin a_{2n-1} =$"
    );
  }
  if (question.question_id === "math1_2024_main_ref_answers_q21") {
    text = text.replace(
      /2 0 2 −【答案】 0 2 2A  = − −   ，6 3 3   − −/,
      "【答案】$A = \\begin{pmatrix} -2 & 0 & 2 \\\\ 0 & -2 & -2 \\\\ -6 & -3 & 3 \\end{pmatrix}$，"
    );
  }
  return cleanSymbolFont(text);
}

function patch2025Question(question) {
  let text = question.content_md;

  if (question.question_id === "math1_2025_main_q03") {
    const cleanStem = `3．设函数 $f(x)$ 在区间 $(0,+\\infty)$ 上可导，则

A．当 $\\lim_{x\\to+\\infty} f(x)$ 存在时，$\\lim_{x\\to+\\infty} f'(x)$ 存在．

B．当 $\\lim_{x\\to+\\infty} f'(x)$ 存在时，$\\lim_{x\\to+\\infty} f(x)$ 存在．

C．当 $\\lim_{x\\to+\\infty}\\frac{\\int_0^x f(t)\\,\\mathrm{d}t}{x}$ 存在时，$\\lim_{x\\to+\\infty} f(x)$ 存在．

D．当 $\\lim_{x\\to+\\infty} f(x)$ 存在时，$\\lim_{x\\to+\\infty}\\frac{\\int_0^x f(t)\\,\\mathrm{d}t}{x}$ 存在．`;
    text = replaceBeforeAnswer(text, cleanStem);
  }

  if (question.question_id === "math1_2025_main_q04") {
    text = `4．设函数 $f(x,y)$ 连续，则 $\\int_{-2}^{2}\\mathrm{d}x\\int_{4-x^2}^{4} f(x,y)\\,\\mathrm{d}y =$

A．$\\int_0^4 \\left[\\int_{-2}^{-\\sqrt{4-y}} f(x,y)\\,\\mathrm{d}x + \\int_{\\sqrt{4-y}}^2 f(x,y)\\,\\mathrm{d}x\\right]\\mathrm{d}y$．

B．$\\int_0^4 \\left[\\int_{-2}^{\\sqrt{4-y}} f(x,y)\\,\\mathrm{d}x + \\int_{\\sqrt{4-y}}^2 f(x,y)\\,\\mathrm{d}x\\right]\\mathrm{d}y$．

C．$\\int_0^4 \\left[\\int_{-2}^{-\\sqrt{4-y}} f(x,y)\\,\\mathrm{d}x + \\int_{-\\sqrt{4-y}}^2 f(x,y)\\,\\mathrm{d}x\\right]\\mathrm{d}y$．

D．$\\int_0^4 \\int_{\\sqrt{4-y}}^2 f(x,y)\\,\\mathrm{d}x\\,\\mathrm{d}y$．

【答案】A

【解析】积分区域为

$$
D = \\{(x,y)\\mid -2\\leq x\\leq 2,\\ 4-x^2\\leq y\\leq 4\\}.
$$

改为先对 $x$ 积分时，$0\\leq y\\leq 4$，且

$$
-2\\leq x\\leq -\\sqrt{4-y}\\quad \\text{或}\\quad \\sqrt{4-y}\\leq x\\leq 2.
$$

因此

$$
\\int_{-2}^{2}\\mathrm{d}x\\int_{4-x^2}^{4} f(x,y)\\,\\mathrm{d}y
= \\int_0^4 \\left[\\int_{-2}^{-\\sqrt{4-y}} f(x,y)\\,\\mathrm{d}x + \\int_{\\sqrt{4-y}}^2 f(x,y)\\,\\mathrm{d}x\\right]\\mathrm{d}y.
$$`;
  }

  if (question.question_id === "math1_2025_main_q10") {
    text = `10．设 $X_1,X_2,\\cdots,X_n$ 为来自正态总体 $N(\\mu,2)$ 的简单随机样本。记 $\\overline X=\\frac1n\\sum_{i=1}^n X_i$，$Z_\\alpha$ 表示标准正态分布的上侧 $\\alpha$ 分位数。假设检验问题 $H_0:\\mu\\leq 1, H_1:\\mu>1$ 的显著性水平为 $\\alpha$ 的检验的拒绝域为

$$
\\left\\{(X_1,X_2,\\cdots,X_n)\\mid \\overline X>1+\\sqrt{\\frac{2}{n}}Z_\\alpha\\right\\}.
$$

【答案】D

【解析】当 $\\mu=1$ 时，$\\frac{\\overline X-1}{\\sqrt{2/n}}\\sim N(0,1)$。右侧检验在显著性水平 $\\alpha$ 下的拒绝域为

$$
\\frac{\\overline X-1}{\\sqrt{2/n}}>Z_\\alpha,
$$

即 $\\overline X>1+\\sqrt{\\frac{2}{n}}Z_\\alpha$。`;
  }

  if (question.question_id === "math1_2025_main_q08") {
    text = `8．设二维随机变量 $(X,Y)$ 服从正态分布 $N(0,0;1,1;\\rho)$，其中 $\\rho\\in(-1,1)$。若 $a,b$ 为满足 $a^2+b^2=1$ 的任意实数，则 $D(aX+bY)$ 的最大值为

A．1

B．2

C．$1+|\\rho|$

D．$1+\\rho^2$

【答案】C

【解析】由于 $D(X)=D(Y)=1,\\operatorname{Cov}(X,Y)=\\rho$，

$$
D(aX+bY)=a^2+b^2+2ab\\rho=1+2ab\\rho.
$$

在 $a^2+b^2=1$ 下，$|2ab|\\leq 1$，故最大值为 $1+|\\rho|$。`;
  }

  if (question.question_id === "math1_2025_main_q13") {
    text = `13. 已知函数 $u(x,y,z)=xy^2z^3$，向量 $\\pmb n=(2,2,-1)$，则 $\\left.\\frac{\\partial u}{\\partial \\pmb n}\\right|_{(1,1,1)} =$ ______.

【答案】1

【解析】有

$$
\\nabla u=(y^2z^3,2xyz^3,3xy^2z^2),
$$

故

$$
\\nabla u(1,1,1)=(1,2,3).
$$

向量 $\\pmb n=(2,2,-1)$ 的单位向量为

$$
\\pmb n_0=\\left(\\frac23,\\frac23,-\\frac13\\right).
$$

因此

$$
\\left.\\frac{\\partial u}{\\partial \\pmb n}\\right|_{(1,1,1)}
=\\nabla u(1,1,1)\\cdot\\pmb n_0
=\\frac23+\\frac43-1=1.
$$`;
  }

  if (question.question_id === "math1_2025_main_q17") {
    text = `17．（本题满分 10分）

计算

$$
\\int_0^1 \\frac{1}{(x+1)(x^2-2x+2)}\\,\\mathrm{d}x.
$$

【解析】

$$
\\frac{1}{(x+1)(x^2-2x+2)}
=\\frac{1}{5}\\cdot\\frac{1}{x+1}
+\\frac{-\\frac15x+\\frac35}{x^2-2x+2}.
$$

于是

$$
\\begin{aligned}
\\int_0^1 \\frac{\\mathrm{d}x}{(x+1)(x^2-2x+2)}
&=\\left[\\frac15\\ln(x+1)-\\frac1{10}\\ln(x^2-2x+2)+\\frac25\\arctan(x-1)\\right]_0^1\\\\
&=\\frac3{10}\\ln2+\\frac\\pi{10}.
\\end{aligned}
$$`;
  }

  if (question.question_id === "math1_2025_main_q18") {
    text = `18.（本题满分 12分）

已知函数 $f(u)$ 在区间 $(0,+\\infty)$ 内具有二阶导数，记 $g(x,y)=f\\left(\\frac{x}{y}\\right)$。若 $g(x,y)$ 满足

$$
x^2\\frac{\\partial^2 g}{\\partial x^2}
+xy\\frac{\\partial^2 g}{\\partial x\\partial y}
+y^2\\frac{\\partial^2 g}{\\partial y^2}=1,
$$

且 $g(x,x)=1$，$\\left.\\frac{\\partial g}{\\partial x}\\right|_{(x,x)}=\\frac2x$，求 $f(u)$。

【解析】令 $u=\\frac{x}{y}$，则

$$
\\frac{\\partial g}{\\partial x}=\\frac1y f'(u),\\qquad
\\frac{\\partial g}{\\partial y}=-\\frac{x}{y^2}f'(u).
$$

由 $g(x,x)=f(1)=1$，$\\left.\\frac{\\partial g}{\\partial x}\\right|_{(x,x)}=\\frac{f'(1)}x=\\frac2x$，得 $f'(1)=2$。

继续求二阶偏导并代入已知等式，可化为

$$
u^2 f''(u)+u f'(u)=1,
$$

即

$$
f''(u)+\\frac1u f'(u)=\\frac1{u^2}.
$$

令 $p=f'(u)$，则 $p'+\\frac1u p=\\frac1{u^2}$，故

$$
(up)'=\\frac1u,\\qquad p=\\frac{\\ln u+C}{u}.
$$

由 $f'(1)=2$ 得 $C=2$，所以

$$
f'(u)=\\frac{\\ln u+2}{u}.
$$

积分得

$$
f(u)=\\frac12\\ln^2 u+2\\ln u+C_1.
$$

由 $f(1)=1$ 得 $C_1=1$，因此

$$
f(u)=\\frac12\\ln^2 u+2\\ln u+1.
$$`;
  }

  if (question.question_id === "math1_2025_main_q19") {
    text = `19.（本题满分 12分）

设函数 $f(x)$ 在区间 $(a,b)$ 内可导。证明：导函数 $f'(x)$ 在 $(a,b)$ 内严格单调增加的充分必要条件是：对 $(a,b)$ 内任意 $x_1,x_2,x_3$，当 $x_1<x_2<x_3$ 时，

$$
\\frac{f(x_2)-f(x_1)}{x_2-x_1}
<
\\frac{f(x_3)-f(x_2)}{x_3-x_2}.
$$

【证明】必要性：若 $f'(x)$ 严格单调增加，由拉格朗日中值定理，存在 $\\xi_1\\in(x_1,x_2)$、$\\xi_2\\in(x_2,x_3)$，使得

$$
\\frac{f(x_2)-f(x_1)}{x_2-x_1}=f'(\\xi_1),\\qquad
\\frac{f(x_3)-f(x_2)}{x_3-x_2}=f'(\\xi_2).
$$

因为 $\\xi_1<\\xi_2$，所以 $f'(\\xi_1)<f'(\\xi_2)$，必要性成立。

充分性：任取 $u<v$，再取 $w\\in(u,v)$。由题设，对 $u<s<w$ 有

$$
\\frac{f(s)-f(u)}{s-u}<\\frac{f(w)-f(s)}{w-s}.
$$

令 $s\\to u^+$，得

$$
f'(u)\\leq \\frac{f(w)-f(u)}{w-u}.
$$

同理，对 $w<t<v$ 有

$$
\\frac{f(t)-f(w)}{t-w}<\\frac{f(v)-f(t)}{v-t}.
$$

令 $t\\to v^-$，得

$$
\\frac{f(v)-f(w)}{v-w}\\leq f'(v).
$$

又由题设直接有

$$
\\frac{f(w)-f(u)}{w-u}<\\frac{f(v)-f(w)}{v-w}.
$$

故 $f'(u)<f'(v)$。由于 $u,v$ 任意，$f'(x)$ 在 $(a,b)$ 内严格单调增加。`;
  }

  if (question.question_id === "math1_2025_main_q20") {
    const answerIndex = text.indexOf("解：");
    const tail = answerIndex >= 0 ? text.slice(answerIndex) : "";
    const cleanStem = `20.（本题满分 12分）

设 $\\Sigma$ 是由直线 $\\left\\{\\begin{array}{l}x=0,\\\\ y=0\\end{array}\\right.$ 绕直线 $\\left\\{\\begin{array}{l}x=t,\\\\ y=t,\\\\ z=t\\end{array}\\right.$（$t$ 为参数）旋转一周得到的曲面，$\\Sigma_1$ 是 $\\Sigma$ 介于平面 $x+y+z=0$ 与平面 $x+y+z=1$ 之间部分的外侧，计算曲面积分

$$
I = \\iint_{\\Sigma_1} x\\,\\mathrm{d}y\\,\\mathrm{d}z + (y+1)\\,\\mathrm{d}z\\,\\mathrm{d}x + (z+2)\\,\\mathrm{d}x\\,\\mathrm{d}y.
$$`;
    text = `${cleanStem}\n\n${tail.trimStart()}`;
    text = text.replace(
      /解：由题意可知直线[\s\S]*?则直 线 \$l _ \{ 1 \}\$ 绕直 线 \$l _ \{ 2 \}\$ 旋转 所得 曲\s*\n\n面/,
      "解：由题意，记直线 $l_1:\\left\\{\\begin{array}{l}x=0,\\\\ y=0\\end{array}\\right.$，旋转轴 $l_2:\\left\\{\\begin{array}{l}x=t,\\\\ y=t,\\\\ z=t\\end{array}\\right.$，则直线 $l_1$ 绕直线 $l_2$ 旋转所得曲面"
    );
  }

  return cleanSymbolFont(text);
}

function safeWriteSource(question, content) {
  if (!question.source_path) return false;
  const resolved = path.resolve(question.source_path);
  const allowed = path.resolve(organizedRoot);
  if (!resolved.toLowerCase().startsWith(allowed.toLowerCase() + path.sep.toLowerCase())) {
    return false;
  }
  if (!fs.existsSync(resolved)) {
    return false;
  }
  fs.writeFileSync(resolved, content, "utf8");
  return true;
}

function main() {
  const questions = loadQuestionData();
  const seedRows = loadJsonl(questionsJsonlPath);
  const solutionById = loadSolutionData();
  const seedById = new Map(seedRows.map((row) => [row.question_id, row]));
  const changed = [];
  const sourceWrites = [];

  for (const question of questions) {
    const before = question.content_md;
    let after = before;
    const hasSuspect = containsSuspect(before);
    const force2024Patch = question.year === 2024 && [
      "math1_2024_main_q02",
      "math1_2024_main_with_answers_q02",
      "math1_2024_main_ref_answers_q02",
      "math1_2024_main_ref_answers_q13",
      "math1_2024_main_ref_answers_q21"
    ].includes(question.question_id);
    const force2025Patch = question.year === 2025 && [
      "math1_2025_main_q03",
      "math1_2025_main_q04",
      "math1_2025_main_q08",
      "math1_2025_main_q10",
      "math1_2025_main_q13",
      "math1_2025_main_q17",
      "math1_2025_main_q18",
      "math1_2025_main_q19",
      "math1_2025_main_q20"
    ].includes(question.question_id);

    if (question.year === 2022 && question.paper_slug === "main" && hasSuspect) {
      const solution = solutionById[question.question_id];
      if (solution?.content_md) {
        after = extractQuestionStem(solution.content_md);
      }
    } else if (question.question_id === "math1_2023_main_q15") {
      const solution = solutionById[question.question_id];
      if (solution?.content_md) {
        after = extractQuestionStem(solution.content_md);
      }
    } else if (question.year === 2024 && (hasSuspect || force2024Patch)) {
      after = patch2024Question(question);
    } else if (question.year === 2025 && (hasSuspect || force2025Patch)) {
      after = patch2025Question(question);
    }

    after = after.replace(/\r\n/g, "\n").replace(/\n{4,}/g, "\n\n\n").trim();

    if (after && after !== before) {
      question.content_md = after;
      question.quality_status = question.quality_status === "ok" ? "manual_check" : question.quality_status;
      const seed = seedById.get(question.question_id);
      if (seed) {
        seed.content_md = after;
        seed.quality_status = question.quality_status;
      }
      const wroteSource = safeWriteSource(question, after);
      changed.push(question.question_id);
      if (wroteSource) sourceWrites.push(question.relative_source_path || question.source_path);
    }
  }

  saveQuestionData(questions);
  saveJsonl(questionsJsonlPath, seedRows);

  const remaining = questions
    .filter((question) => containsSuspect(question.content_md))
    .map((question) => question.question_id);

  const report = [
    "# 题目乱码修复报告",
    "",
    `- 修复题目数：${changed.length}`,
    `- 同步写回按题拆分文件：${sourceWrites.length}`,
    `- 剩余明显乱码题目数：${remaining.length}`,
    `- 生成时间：${new Date().toLocaleString("zh-CN", { hour12: false })}`,
    "",
    "## 已修复题目",
    "",
    ...changed.map((id) => `- ${id}`),
    "",
    "## 剩余明显乱码题目",
    "",
    ...(remaining.length ? remaining.map((id) => `- ${id}`) : ["无"]),
    "",
    "## 处理说明",
    "",
    "- 2022 年明显 OCR 乱码题从已整理的 2022 解析中抽取题干替换，仍保留人工校对标记。",
    "- 2023/2024/2025 年少量符号字体乱码按题修复；2025 年题干参考公开试题 PDF 对关键公式做了标准 LaTeX 化。",
    "- 未改动原始 GitHub 仓库 `Kaoyan-Math1-Papers`。"
  ];
  fs.writeFileSync(reportPath, `${report.join("\n")}\n`, "utf8");

  console.log(`changed=${changed.length}`);
  console.log(`sourceWrites=${sourceWrites.length}`);
  console.log(`remaining=${remaining.length}`);
  console.log(`report=${reportPath}`);
}

main();
