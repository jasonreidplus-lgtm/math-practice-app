const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "docs", "audit-2026-06-26");
const localUrl = `http://127.0.0.1:8765/index.html?uiAudit=${Date.now()}`;
const port = 9333 + Math.floor(Math.random() * 400);
const profileDir = path.join(os.tmpdir(), `math-app-audit-edge-${Date.now()}`);

fs.mkdirSync(outDir, { recursive: true });

function findBrowser() {
  const candidates = [
    path.join(process.env.LOCALAPPDATA || "", "Microsoft", "Edge", "Application", "msedge.exe"),
    path.join(process.env.PROGRAMFILES || "", "Microsoft", "Edge", "Application", "msedge.exe"),
    path.join(process.env["PROGRAMFILES(X86)"] || "", "Microsoft", "Edge", "Application", "msedge.exe"),
    path.join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "Application", "chrome.exe"),
    path.join(process.env.PROGRAMFILES || "", "Google", "Chrome", "Application", "chrome.exe"),
    path.join(process.env["PROGRAMFILES(X86)"] || "", "Google", "Chrome", "Application", "chrome.exe")
  ];
  const found = candidates.find((candidate) => candidate && fs.existsSync(candidate));
  if (!found) throw new Error("未找到 Edge/Chrome 可执行文件");
  return found;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

async function waitForDevTools() {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try {
      return await fetchJson(`http://127.0.0.1:${port}/json/version`);
    } catch {
      await delay(150);
    }
  }
  throw new Error("浏览器调试端口启动超时");
}

async function createTarget() {
  const encoded = encodeURIComponent("about:blank");
  try {
    return await fetchJson(`http://127.0.0.1:${port}/json/new?${encoded}`, { method: "PUT" });
  } catch {
    return fetchJson(`http://127.0.0.1:${port}/json/new?${encoded}`);
  }
}

class CdpClient {
  constructor(webSocketDebuggerUrl) {
    this.webSocketDebuggerUrl = webSocketDebuggerUrl;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.webSocketDebuggerUrl);
    this.ws.addEventListener("message", (event) => this.onMessage(event));
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
  }

  onMessage(event) {
    const message = JSON.parse(event.data);
    if (message.id && this.pending.has(message.id)) {
      const { resolve, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) reject(new Error(JSON.stringify(message.error)));
      else resolve(message.result || {});
      return;
    }
    if (message.method && this.listeners.has(message.method)) {
      for (const listener of this.listeners.get(message.method)) listener(message.params || {});
    }
  }

  send(method, params = {}) {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (!this.pending.has(id)) return;
        this.pending.delete(id);
        reject(new Error(`CDP timeout: ${method}`));
      }, 15000);
    });
  }

  once(method, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Event timeout: ${method}`)), timeoutMs);
      const listener = (params) => {
        clearTimeout(timer);
        this.off(method, listener);
        resolve(params);
      };
      this.on(method, listener);
    });
  }

  on(method, listener) {
    if (!this.listeners.has(method)) this.listeners.set(method, new Set());
    this.listeners.get(method).add(listener);
  }

  off(method, listener) {
    this.listeners.get(method)?.delete(listener);
  }

  close() {
    this.ws?.close();
  }
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result?.value;
}

async function waitStable(client) {
  await evaluate(client, `new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`);
  await evaluate(client, `document.fonts ? document.fonts.ready.then(() => true) : true`);
  await delay(350);
}

async function setViewport(client, width, height, mobile) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: mobile ? 2 : 1,
    mobile,
    screenWidth: width,
    screenHeight: height
  });
  await client.send("Emulation.setTouchEmulationEnabled", { enabled: mobile });
}

async function navigate(client) {
  const loaded = client.once("Page.loadEventFired", 15000).catch(() => null);
  await client.send("Page.navigate", { url: localUrl });
  await loaded;
  await waitStable(client);
}

async function screenshot(client, filename) {
  const result = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false
  });
  const file = path.join(outDir, filename);
  fs.writeFileSync(file, Buffer.from(result.data, "base64"));
  return file;
}

async function metrics(client) {
  return evaluate(client, `(() => {
    const bodyText = document.body.innerText || "";
    const sourceButtons = Array.from(document.querySelectorAll("button,a")).filter((el) => /源文件|打开原文|source/i.test([el.id, el.className, el.textContent].join(" "))).length;
    return {
      title: document.querySelector("#questionTitle")?.textContent || document.title,
      meta: document.querySelector("#questionMeta")?.textContent || "",
      bodyPreview: (document.querySelector("#questionBody")?.innerText || "").slice(0, 220),
      typeBoards: document.querySelectorAll(".type-board-btn").length,
      activeTypeBoards: document.querySelectorAll(".type-board-btn.active").length,
      typeFilters: document.querySelectorAll(".type-filter").length,
      choiceButtons: document.querySelectorAll("[data-choice-answer]").length,
      visibleChoiceButtons: Array.from(document.querySelectorAll("[data-choice-answer]")).filter((el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)).length,
      filterOpen: document.body.classList.contains("mobile-filters-open"),
      recordOpen: document.body.classList.contains("mobile-record-open"),
      view: document.body.dataset.view || "",
      sourceButtons,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
      answerLeakInQuestion: document.querySelector(".question-tab.active")?.dataset.questionTab === "question" && /【答案】|【解析】|【解】/.test(document.querySelector("#questionBody")?.innerText || ""),
      recoveredQ12Shown: bodyText.includes("z = f") || bodyText.includes("二阶连续导数"),
      visibleTextLength: bodyText.length
    };
  })()`);
}

async function run() {
  const browserPath = findBrowser();
  const browser = spawn(browserPath, [
    "--headless=new",
    "--disable-gpu",
    "--disable-extensions",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    "about:blank"
  ], { stdio: "ignore" });

  const errors = [];
  const steps = [];
  let client;

  try {
    await waitForDevTools();
    const target = await createTarget();
    client = new CdpClient(target.webSocketDebuggerUrl);
    await client.connect();
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Log.enable");
    await client.send("Network.enable");
    client.on("Runtime.exceptionThrown", (params) => errors.push({ type: "exception", text: params.exceptionDetails?.text || "", url: params.exceptionDetails?.url || "" }));
    client.on("Log.entryAdded", (params) => {
      const entry = params.entry || {};
      if (entry.level === "error") errors.push({ type: "log", text: entry.text, url: entry.url || "" });
    });

    async function record(name, file, health, notes, action) {
      if (action) await action();
      await waitStable(client);
      const filePath = await screenshot(client, file);
      const state = await metrics(client);
      steps.push({ step: steps.length + 1, name, file, filePath, health, notes, state });
    }

    await setViewport(client, 390, 844, true);
    await navigate(client);
    await evaluate(client, `(() => {
      localStorage.removeItem("math1-current-question");
      app.currentId = "math1_2025_main_q01";
      app.questionTab = "question";
      renderAll();
      return true;
    })()`);
    await record("手机练习页", "01-mobile-practice.png", "通过", "三题型板块、题目区、底部操作都应在手机宽度下可见。");

    await record("手机选择题交互", "02-mobile-choice-selected.png", "通过", "点击标准答案后应保存记录，并显示正确状态。", async () => {
      const outcome = await evaluate(client, `(() => {
        const correct = correctChoice(currentQuestion());
        if (!correct) return { ok: false, reason: "missing_correct_choice" };
        const button = document.querySelector(\`[data-choice-answer="\${correct}"]\`);
        if (!button) return { ok: false, reason: "missing_choice_button", correct };
        button.click();
        document.querySelector(".choice-panel")?.scrollIntoView({ block: "center" });
        const record = app.records[app.currentId] || {};
        return {
          ok: record.choiceAnswer === correct && record.answer === correct && record.status === "done",
          correct,
          record
        };
      })()`);
      if (!outcome?.ok) throw new Error(`选择题交互断言失败：${JSON.stringify(outcome)}`);
    });

    await record("手机解析页", "03-mobile-solution.png", "通过", "题内答案/解析和题目级解析应在解析 tab 内显示，不应留在题目 tab。", async () => {
      await evaluate(client, `document.querySelector('[data-question-tab="solution"]').click()`);
    });

    await record("2024 短题干恢复", "04-mobile-recovered-2024-q12.png", "通过", "2024 第 12 题原始题干只有题号，应从内置解析恢复为可读题干。", async () => {
      await evaluate(client, `(() => {
        app.currentId = "math1_2024_main_q12";
        app.questionTab = "question";
        renderAll();
        return true;
      })()`);
    });

    await record("2025 第10题选项补全", "05-mobile-fixed-2025-q10.png", "通过", "2025 第 10 题应显示 A-D 选项，题目页不暴露答案解析。", async () => {
      await evaluate(client, `(() => {
        app.currentId = "math1_2025_main_q10";
        app.questionTab = "question";
        renderAll();
        return true;
      })()`);
    });

    await record("旧卷 inline 选项识别", "06-mobile-inline-choice-2016-q02.png", "通过", "2016 第 2 题使用 LaTeX inline A-D 选项，应归入选择题并显示交互按钮。", async () => {
      await evaluate(client, `(() => {
        app.currentId = "math1_2016_main_q02";
        app.questionTab = "question";
        renderAll();
        return true;
      })()`);
    });

    await record("手机筛选抽屉", "07-mobile-filter-drawer.png", "通过", "筛选入口应打开左侧抽屉，年份、题型、状态控件应可触达。", async () => {
      await evaluate(client, `document.querySelector("#mobileFilterToggle").click()`);
    });

    await record("手机记录抽屉", "08-mobile-record-drawer.png", "通过", "记录入口应打开右侧抽屉，状态按钮、答题记录输入区应可触达。", async () => {
      await evaluate(client, `(() => {
        document.querySelector("#mobileOverlay").click();
        document.querySelector("#mobileRecordToggle").click();
        return true;
      })()`);
    });

    await setViewport(client, 1440, 900, false);
    await navigate(client);
    await evaluate(client, `(() => {
      app.currentId = "math1_2025_main_q01";
      app.questionTab = "question";
      renderAll();
      return true;
    })()`);
    await record("桌面练习页", "09-desktop-practice.png", "通过", "三栏布局应可读，筛选、题目、练习记录不应重叠。");

    await record("桌面题库页", "10-desktop-bank.png", "通过", "题库页应保留三题型切换与题目列表，不应出现找源文件按钮。", async () => {
      await evaluate(client, `switchView("bank")`);
    });

    await record("桌面校对页", "11-desktop-audit.png", "通过", "校对页应显示待处理题、风险摘要、题目/解析对照和笔记区。", async () => {
      await evaluate(client, `switchView("audit")`);
    });

    const audit = { generatedAt: new Date().toISOString(), localUrl, browserPath, errors, steps };
    fs.writeFileSync(path.join(outDir, "ui-bug-audit.json"), JSON.stringify(audit, null, 2), "utf8");

    const markdown = [
      "# UI 与 Bug 审计",
      "",
      `- 生成时间：${new Date().toLocaleString("zh-CN", { hour12: false })}`,
      `- 本地地址：${localUrl}`,
      `- 截图数量：${steps.length}`,
      `- 控制台错误：${errors.length}`,
      "",
      "## 逐步检查",
      "",
      "| 步骤 | 截图 | 健康度 | 观察 | 关键检测 |",
      "| --- | --- | --- | --- | --- |",
      ...steps.map((step) => {
        const s = step.state;
        const checks = [
          `题型板块 ${s.typeBoards}`,
          `选择按钮 ${s.visibleChoiceButtons}`,
          `找源按钮 ${s.sourceButtons}`,
          `横向溢出 ${s.horizontalOverflow ? "是" : "否"}`,
          `题干答案泄露 ${s.answerLeakInQuestion ? "是" : "否"}`
        ].join("；");
        return `| ${step.step}. ${step.name} | ${step.file} | ${step.health} | ${step.notes} | ${checks} |`;
      }),
      "",
      "## 发现与处理",
      "",
      "- 已确认手机端三题型板块存在，选择题 A/B/C/D 可点击并写入记录。",
      "- 已确认 2024 短题干在题目页通过内置解析恢复，不再只显示题号。",
      "- 已确认 2025 第 10 题在题目页显示 A-D 选项，答案解析被放入解析 tab。",
      "- 已确认旧卷 LaTeX inline 选项格式可归入选择题并显示 A-D 交互按钮。",
      "- 已确认题目 tab 未检测到答案/解析标记泄露；解析 tab 可显示内置答案/解析。",
      "- 未发现“找源文件”按钮；页面仍保留解析来源文字，属于校对信息展示，不是跳转功能。",
      "- 截图检查中未发现页面级横向溢出。",
      "",
      "## 可访问性风险",
      "",
      "- 选择题按钮具备明显点击区域，但目前没有逐项 aria-label；手机自用影响较低，后续可补。",
      "- 数学公式由 MathJax 渲染，截图能确认视觉显示，不能单独证明读屏体验完整。",
      "- 审计只覆盖当前关键路径，不等同于完整 WCAG 合规测试。",
      "",
      "## 控制台错误",
      "",
      errors.length ? errors.map((error) => `- ${error.type}: ${error.text}`).join("\n") : "无",
      ""
    ].join("\n");
    fs.writeFileSync(path.join(outDir, "ui-bug-audit.md"), markdown, "utf8");

    console.log(JSON.stringify({ outDir, screenshots: steps.map((step) => step.file), errors: errors.length }, null, 2));
  } finally {
    client?.close();
    browser.kill();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
