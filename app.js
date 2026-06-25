const STORE_KEY = "math1-practice-state-v1";

const app = {
  questions: [],
  filtered: [],
  records: {},
  currentId: null,
  view: "practice",
  questionTab: "question",
  auditFilter: "pending",
  auditCurrentId: null,
  selectedYears: new Set(),
  selectedPapers: new Set(),
  selectedTags: new Set(),
  selectedStatuses: new Set(["unseen", "done", "wrong", "favorite", "review", "manual_check"]),
  qStart: 1,
  qEnd: 23,
  maxQuestionNo: 23,
  search: "",
  timerSeconds: 0,
  timerRunning: true,
  timerHandle: null,
  draftSaveHandle: null
};

const tags = [
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

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

document.addEventListener("DOMContentLoaded", init);

function init() {
  app.questions = (window.QUESTION_DATA || []).map(enrichQuestion);
  app.maxQuestionNo = Math.max(...app.questions.map((q) => q.question_no), 23);
  app.qEnd = app.maxQuestionNo;
  $("#qEnd").value = app.qEnd;
  app.records = loadRecords();
  if (location.hash === "#audit") app.view = "audit";
  if (location.hash === "#bank") app.view = "bank";
  if (location.hash === "#stats") app.view = "stats";
  if (location.hash === "#solution") app.questionTab = "solution";
  if (location.hash === "#record") app.questionTab = "record";
  hydrateFilters();
  bindEvents();
  applyFilters();
  app.currentId = localStorage.getItem("math1-current-question") || app.filtered[0]?.question_id || app.questions[0]?.question_id;
  renderAll();
  if (app.view !== "practice") switchView(app.view);
  startTimer();
}

function enrichQuestion(question) {
  const content = question.content_md || "";
  return {
    ...question,
    year: Number(question.year),
    question_no: Number(question.question_no),
    inferred_tags: inferTags(content),
    search_text: `${question.year} ${question.paper} 第${question.question_no}题 ${content}`.toLowerCase()
  };
}

function inferTags(content) {
  const text = content.toLowerCase();
  return tags
    .filter((tag) => tag.patterns.some((pattern) => text.includes(pattern.toLowerCase())))
    .map((tag) => tag.name)
    .slice(0, 4);
}

function hydrateFilters() {
  const years = unique(app.questions.map((q) => q.year)).sort((a, b) => b - a);
  const papers = unique(app.questions.map((q) => q.paper));
  years.forEach((year) => app.selectedYears.add(year));
  papers.forEach((paper) => app.selectedPapers.add(paper));
  tags.forEach((tag) => app.selectedTags.add(tag.name));

  $("#yearGrid").innerHTML = years.map((year) => (
    `<button class="chip active" data-year="${year}">${year}</button>`
  )).join("");

  $("#paperFilters").innerHTML = papers.map((paper) => (
    `<label class="check-row"><input class="paper-filter" type="checkbox" value="${escapeAttr(paper)}" checked><span>${escapeHtml(paper)}</span></label>`
  )).join("");

  $("#tagFilters").innerHTML = tags.map((tag) => (
    `<button class="tag-chip active" data-tag="${escapeAttr(tag.name)}">${escapeHtml(tag.name)}</button>`
  )).join("");
}

function bindEvents() {
  $$(".rail-item").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });

  $$(".question-tab").forEach((button) => {
    button.addEventListener("click", () => {
      app.questionTab = button.dataset.questionTab;
      renderCurrentQuestion();
    });
  });

  $("#searchInput").addEventListener("input", (event) => {
    app.search = event.target.value.trim().toLowerCase();
    applyFilters();
    renderCurrentSafe();
  });

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      $("#searchInput").focus();
    }
    if (event.key === "ArrowRight" && app.view === "practice") goNext();
    if (event.key === "ArrowLeft" && app.view === "practice") goPrev();
  });

  $("#resetFilters").addEventListener("click", resetFilters);
  $("#toggleAllYears").addEventListener("click", toggleAllYears);

  $("#yearGrid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-year]");
    if (!button) return;
    const year = Number(button.dataset.year);
    toggleSet(app.selectedYears, year);
    button.classList.toggle("active", app.selectedYears.has(year));
    applyFilters();
    renderCurrentSafe();
  });

  $("#paperFilters").addEventListener("change", (event) => {
    if (!event.target.classList.contains("paper-filter")) return;
    const paper = event.target.value;
    event.target.checked ? app.selectedPapers.add(paper) : app.selectedPapers.delete(paper);
    applyFilters();
    renderCurrentSafe();
  });

  $("#tagFilters").addEventListener("click", (event) => {
    const button = event.target.closest("[data-tag]");
    if (!button) return;
    const tag = button.dataset.tag;
    toggleSet(app.selectedTags, tag);
    button.classList.toggle("active", app.selectedTags.has(tag));
    applyFilters();
    renderCurrentSafe();
  });

  $("#qStart").addEventListener("change", syncRange);
  $("#qEnd").addEventListener("change", syncRange);

  $$(".status-filter").forEach((input) => {
    input.addEventListener("change", () => {
      input.checked ? app.selectedStatuses.add(input.value) : app.selectedStatuses.delete(input.value);
      applyFilters();
      renderCurrentSafe();
    });
  });

  $("#prevQuestion").addEventListener("click", goPrev);
  $("#nextQuestion").addEventListener("click", goNext);
  $("#randomQuestion").addEventListener("click", goRandom);
  $("#refreshTable").addEventListener("click", () => renderBank());
  $("#saveRecord").addEventListener("click", saveCurrentRecord);
  $("#auditFilter").addEventListener("change", (event) => {
    app.auditFilter = event.target.value;
    app.auditCurrentId = null;
    renderAudit();
  });
  $("#exportAudit").addEventListener("click", exportAuditRecords);
  $("#saveAuditNote").addEventListener("click", () => saveAuditRecord());
  $("#openAuditQuestion").addEventListener("click", openAuditQuestion);
  $("#copyAuditId").addEventListener("click", copyAuditId);
  $$(".audit-actions [data-audit-status]").forEach((button) => {
    button.addEventListener("click", () => saveAuditRecord(button.dataset.auditStatus));
  });
  $("#resetTimer").addEventListener("click", () => {
    app.timerSeconds = 0;
    renderTimer();
  });
  $("#toggleTimer").addEventListener("click", () => {
    app.timerRunning = !app.timerRunning;
    $("#toggleTimer").textContent = app.timerRunning ? "Ⅱ" : "▶";
  });

  $$(".status-btn[data-status]").forEach((button) => {
    button.addEventListener("click", () => {
      const record = currentRecord();
      record.status = button.dataset.status;
      saveRecordObject(record);
      renderRecordPanel();
      renderStats();
      renderTopProgress();
      setSaveState("状态已保存");
    });
  });

  $("#favoriteBtn").addEventListener("click", () => {
    const record = currentRecord();
    record.favorite = !record.favorite;
    saveRecordObject(record);
    renderRecordPanel();
    renderStats();
    setSaveState(record.favorite ? "已收藏" : "已取消收藏");
  });

  $("#manualBtn").addEventListener("click", () => {
    const record = currentRecord();
    record.manualFlag = !record.manualFlag;
    saveRecordObject(record);
    renderRecordPanel();
    renderQualityBanner();
    renderStats();
    setSaveState(record.manualFlag ? "已标记需校对" : "已取消校对标记");
  });

  $$(".reason-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const record = currentRecord();
      record.reason = record.reason === button.dataset.reason ? "" : button.dataset.reason;
      saveRecordObject(record);
      renderRecordPanel();
      setSaveState("错因已保存");
    });
  });

  ["answerInput", "thoughtInput", "noteInput"].forEach((id) => {
    $(`#${id}`).addEventListener("input", scheduleDraftSave);
  });

  $("#copyQuestionId").addEventListener("click", copyCurrentId);
  $("#openSource").addEventListener("click", openCurrentSource);
  $("#openSolutionSource").addEventListener("click", openCurrentSolutionSource);
  $("#fullscreenReading").addEventListener("click", () => {
    document.body.classList.toggle("reading-focus");
    $("#fullscreenReading").textContent = document.body.classList.contains("reading-focus") ? "退出专注" : "专注阅读";
  });
}

function switchView(view) {
  app.view = view;
  document.body.classList.toggle("audit-mode", view === "audit");
  $$(".rail-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  $$(".view").forEach((section) => section.classList.remove("active"));
  $(`#${view}View`)?.classList.add("active");
  if (view === "bank") renderBank();
  if (view === "review") renderReview();
  if (view === "audit") renderAudit();
  if (view === "favorites") renderFavorites();
  if (view === "stats") renderStats();
}

function applyFilters() {
  app.filtered = app.questions.filter((question) => {
    const record = app.records[question.question_id] || {};
    const status = record.status || "unseen";
    const statusMatch =
      app.selectedStatuses.has(status) ||
      (record.favorite && app.selectedStatuses.has("favorite")) ||
      (hasManualRisk(question, record) && app.selectedStatuses.has("manual_check"));
    const tagsMatch = question.inferred_tags.length === 0 || question.inferred_tags.some((tag) => app.selectedTags.has(tag));
    const searchMatch = !app.search || question.search_text.includes(app.search) || question.question_id.includes(app.search);
    return app.selectedYears.has(question.year) &&
      app.selectedPapers.has(question.paper) &&
      question.question_no >= app.qStart &&
      question.question_no <= app.qEnd &&
      statusMatch &&
      tagsMatch &&
      searchMatch;
  }).sort(sortQuestions);
}

function sortQuestions(a, b) {
  return a.year - b.year || a.paper.localeCompare(b.paper, "zh-CN") || a.question_no - b.question_no;
}

function renderAll() {
  renderCurrentQuestion();
  renderRecordPanel();
  renderTopProgress();
  renderBank();
  renderReview();
  renderAudit();
  renderFavorites();
  renderStats();
}

function renderCurrentSafe() {
  flushCurrentDraft();
  if (!app.filtered.some((q) => q.question_id === app.currentId)) {
    app.currentId = app.filtered[0]?.question_id || null;
  }
  renderAll();
}

function renderCurrentQuestion() {
  const question = currentQuestion();
  if (!question) {
    $("#questionTitle").textContent = "没有匹配题目";
    $("#questionMeta").textContent = "请调整筛选条件";
    $("#questionBody").innerHTML = `<div class="empty-state">当前筛选条件下没有题目。</div>`;
    $("#qualityBanner").classList.add("hidden");
    $("#sourceNote").textContent = "题目来源：-";
    return;
  }
  localStorage.setItem("math1-current-question", question.question_id);
  $("#questionMeta").textContent = `${question.year} 年 · 数学一 · ${question.paper}`;
  $("#questionTitle").textContent = `${question.year} 数学一 ${question.paper} 第${pad2(question.question_no)}题`;
  renderQuestionTabContent(question);
  $("#sourceNote").textContent = `题目来源：${question.source_path}`;
  renderQualityBanner();
  typesetMath();
}

function renderQuestionTabContent(question) {
  $$(".question-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.questionTab === app.questionTab);
  });

  if (app.questionTab === "solution") {
    renderSolutionPanel(question);
    return;
  }

  if (app.questionTab === "record") {
    renderRecordSummary();
    return;
  }

  $("#questionBody").innerHTML = renderMarkdown(question.content_md || "", question);
}

function renderQualityBanner() {
  const question = currentQuestion();
  const record = currentRecord(false);
  const flagged = question && hasManualRisk(question, record);
  $("#qualityBanner").classList.toggle("hidden", !flagged);
}

function renderSolutionPanel(question) {
  const solution = currentSolution(question);
  if (!solution) {
    const source = currentSolutionSource(question);
    $("#questionBody").innerHTML = `<div class="empty-state">
      <h2>暂未匹配到本题解析</h2>
      <p>已找到的解析文件格式可能未能按题号自动切开。可以先打开整年解析源文件查看。</p>
      ${source ? `<div class="file-path">${escapeHtml(source)}</div>` : "<p>当前年份暂未发现解析源文件。</p>"}
    </div>`;
    return;
  }

  const mapMethod = solution.map_method ? `<br><strong>映射方式：</strong>${escapeHtml(solution.map_method)}` : "";
  const meta = `<div class="solution-meta">
    <strong>解析来源：</strong>${escapeHtml(solution.source_path)}<br>
    <strong>质量状态：</strong>${solution.quality_status === "manual_check" ? "需人工核对" : "ok"}${mapMethod}
  </div>`;
  $("#questionBody").innerHTML = meta + renderMarkdown(solution.content_md || "", {
    source_path: solution.source_path
  });
}

function renderRecordSummary() {
  const record = currentRecord(false);
  const question = currentQuestion();
  const rows = [
    ["题目 ID", question?.question_id || "-"],
    ["状态", statusText(record.status || "unseen")],
    ["错题原因", record.reason || "-"],
    ["我的答案", record.answer || "未填写"],
    ["解题思路", record.thought || "未填写"],
    ["备注", record.note || "未填写"],
    ["用时", record.seconds ? formatDuration(record.seconds) : "-"],
    ["更新时间", record.updatedAt ? formatTime(record.updatedAt) : "-"]
  ];
  $("#questionBody").innerHTML = `<div class="record-summary">
    <dl>
      ${rows.map(([key, value]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`).join("")}
    </dl>
  </div>`;
}

function renderRecordPanel() {
  const record = currentRecord(false);
  $("#answerInput").value = record.answer || "";
  $("#thoughtInput").value = record.thought || "";
  $("#noteInput").value = record.note || "";
  $$(".status-btn[data-status]").forEach((button) => {
    button.classList.toggle("active", (record.status || "unseen") === button.dataset.status);
  });
  $("#favoriteBtn").classList.toggle("active", !!record.favorite);
  $("#manualBtn").classList.toggle("active", !!record.manualFlag);
  $$(".reason-btn").forEach((button) => {
    button.classList.toggle("active", record.reason === button.dataset.reason);
  });
}

function renderTopProgress() {
  const total = app.questions.length;
  const done = app.questions.filter((q) => ["done", "wrong", "review"].includes((app.records[q.question_id] || {}).status)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  $("#topProgress").style.width = `${pct}%`;
  $("#progressText").textContent = `${done} / ${total} 题 (${pct}%)`;
}

function renderBank() {
  const visibleLimit = 260;
  const visibleQuestions = app.filtered.slice(0, visibleLimit);
  $("#tableSummary").textContent = app.filtered.length > visibleLimit
    ? `已匹配 ${app.filtered.length} 题，当前显示前 ${visibleLimit} 题`
    : `已匹配 ${app.filtered.length} 题`;
  const rows = visibleQuestions.map((question) => {
    const record = app.records[question.question_id] || {};
    const status = record.status || "unseen";
    const tagsHtml = question.inferred_tags.slice(0, 3).map((tag) => `<span class="badge blue">${escapeHtml(tag)}</span>`).join(" ");
    return `<tr data-id="${question.question_id}">
      <td>${question.year}</td>
      <td>${escapeHtml(question.paper)}</td>
      <td>第${pad2(question.question_no)}题</td>
      <td>${statusBadge(status, record.favorite)}</td>
      <td>${qualityBadge(question, record)}</td>
      <td>${solutionBadge(question)}</td>
      <td>${tagsHtml || "-"}</td>
      <td>${record.updatedAt ? formatTime(record.updatedAt) : "-"}</td>
    </tr>`;
  }).join("");
  $("#questionTable").innerHTML = rows || `<tr><td colspan="8"><div class="empty-state">没有匹配题目。</div></td></tr>`;
  $("#questionTable").onclick = (event) => {
    const row = event.target.closest("tr[data-id]");
    if (!row) return;
    flushCurrentDraft();
    app.currentId = row.dataset.id;
    switchView("practice");
    renderAll();
  };
}

function renderReview() {
  const list = app.questions.filter((question) => {
    const record = app.records[question.question_id] || {};
    return ["wrong", "review"].includes(record.status) || hasManualRisk(question, record);
  }).sort(sortQuestions);
  $("#reviewList").innerHTML = renderList(list, "暂无错题或待复习题。");
}

function renderAudit() {
  const allItems = getAuditItems("all");
  const manualCount = app.questions.filter((question) => hasManualRisk(question, app.records[question.question_id] || {})).length;
  const missingCount = app.questions.filter((question) => !currentSolution(question)).length;
  const doneCount = app.questions.filter((question) => {
    const status = (app.records[question.question_id] || {}).auditStatus;
    return status === "confirmed" || status === "fixed";
  }).length;
  const pendingCount = getAuditItems("pending").length;
  const visibleItems = getAuditItems(app.auditFilter);

  $("#auditFilter").value = app.auditFilter;
  $("#auditSummary").textContent = `全部校对相关 ${allItems.length} 题，当前显示 ${visibleItems.length} 题`;
  $("#auditPendingCount").textContent = pendingCount;
  $("#auditManualCount").textContent = manualCount;
  $("#auditMissingCount").textContent = missingCount;
  $("#auditDoneCount").textContent = doneCount;

  if (!visibleItems.some((question) => question.question_id === app.auditCurrentId)) {
    app.auditCurrentId = visibleItems[0]?.question_id || null;
  }

  $("#auditList").innerHTML = visibleItems.length
    ? visibleItems.slice(0, 220).map(renderAuditRow).join("")
    : `<div class="empty-state">当前筛选下没有校对任务。</div>`;
  $("#auditList").onclick = (event) => {
    const row = event.target.closest("[data-audit-id]");
    if (!row) return;
    saveAuditDraftSilently();
    app.auditCurrentId = row.dataset.auditId;
    renderAudit();
  };

  renderAuditDetail(currentAuditQuestion());
}

function renderAuditRow(question) {
  const record = app.records[question.question_id] || {};
  const risks = auditRiskLabels(question, record);
  return `<button class="audit-row ${question.question_id === app.auditCurrentId ? "active" : ""}" data-audit-id="${question.question_id}">
    <span>
      <strong>${question.year} ${escapeHtml(question.paper)} 第${pad2(question.question_no)}题</strong>
      <small>${escapeHtml(risks.join(" / ") || "人工记录")}</small>
    </span>
    ${auditStatusBadge(record.auditStatus)}
  </button>`;
}

function renderAuditDetail(question) {
  if (!question) {
    $("#auditMeta").textContent = "没有校对任务";
    $("#auditTitle").textContent = "校对详情";
    $("#auditRiskLine").classList.add("hidden");
    $("#auditQuestionBody").innerHTML = `<div class="empty-state">请选择左侧校对任务。</div>`;
    $("#auditSolutionBody").innerHTML = `<div class="empty-state">暂无解析。</div>`;
    $("#auditNote").value = "";
    $("#auditDraft").value = "";
    return;
  }

  const record = app.records[question.question_id] || {};
  const solution = currentSolution(question);
  const risks = auditRiskLabels(question, record);
  $("#auditMeta").textContent = `${question.year} 年 · ${question.paper} · ${auditStatusText(record.auditStatus)}`;
  $("#auditTitle").textContent = `${question.year} 数学一 ${question.paper} 第${pad2(question.question_no)}题`;
  $("#auditRiskLine").textContent = risks.join(" / ") || "人工校对记录";
  $("#auditRiskLine").classList.remove("hidden");
  $("#auditQuestionBody").innerHTML = renderMarkdown(question.content_md || "", question);
  $("#auditSolutionBody").innerHTML = solution
    ? renderAuditSolution(solution)
    : `<div class="empty-state">本题暂未匹配到题目级解析。可以在右下方先补写解析草稿。</div>`;
  $("#auditNote").value = record.auditNote || "";
  $("#auditDraft").value = record.solutionDraft || "";
  typesetMath();
}

function renderAuditSolution(solution) {
  const score = solution.match_score === null || solution.match_score === undefined ? "-" : solution.match_score;
  const meta = `<div class="solution-meta">
    <strong>来源：</strong>${escapeHtml(solution.source_path || "-")}<br>
    <strong>质量：</strong>${solution.quality_status === "manual_check" ? "需人工核对" : "ok"}<br>
    <strong>映射：</strong>${escapeHtml(solution.map_method || "-")}，chunk=${escapeHtml(solution.chunk_no ?? "-")}，score=${escapeHtml(score)}
  </div>`;
  return meta + renderMarkdown(solution.content_md || "", { source_path: solution.source_path });
}

function getAuditItems(filter) {
  return app.questions.filter((question) => {
    const record = app.records[question.question_id] || {};
    const manual = hasManualRisk(question, record);
    const missing = !currentSolution(question);
    const status = record.auditStatus || "";
    if (filter === "manual") return manual;
    if (filter === "missing") return missing;
    if (filter === "needs_fix") return status === "needs_fix";
    if (filter === "fixed") return status === "fixed";
    if (filter === "confirmed") return status === "confirmed";
    if (filter === "all") return manual || missing || !!status || !!record.auditNote || !!record.solutionDraft;
    return (manual || missing || status === "needs_fix") && status !== "confirmed" && status !== "fixed";
  }).sort(sortQuestions);
}

function currentAuditQuestion() {
  return app.questions.find((question) => question.question_id === app.auditCurrentId) || null;
}

function auditRiskLabels(question, record = {}) {
  const solution = currentSolution(question);
  const labels = [];
  if (!solution) labels.push("待补写");
  if (question.quality_status === "manual_check") labels.push("题目源需校对");
  if (solution?.quality_status === "manual_check") labels.push("解析需校对");
  if (record.manualFlag) labels.push("用户标记需校对");
  if (record.auditStatus) labels.push(auditStatusText(record.auditStatus));
  return labels;
}

function saveAuditRecord(status) {
  const question = currentAuditQuestion();
  if (!question) return;
  const record = currentRecordForQuestion(question.question_id);
  record.auditNote = $("#auditNote").value.trim();
  record.solutionDraft = $("#auditDraft").value.trim();
  if (status) record.auditStatus = status;
  if (!record.auditStatus) record.auditStatus = "needs_fix";
  saveRecordObject(record);
  setSaveState("校对记录已保存");
  renderAudit();
  renderStats();
}

function saveAuditDraftSilently() {
  const question = currentAuditQuestion();
  if (!question) return;
  const note = $("#auditNote").value.trim();
  const draft = $("#auditDraft").value.trim();
  const record = app.records[question.question_id] || {};
  if (record.auditNote === note && record.solutionDraft === draft) return;
  if (!note && !draft && !record.auditStatus) return;
  const next = currentRecordForQuestion(question.question_id);
  next.auditNote = note;
  next.solutionDraft = draft;
  if (!next.auditStatus && (note || draft)) next.auditStatus = "needs_fix";
  saveRecordObject(next);
}

function openAuditQuestion() {
  const question = currentAuditQuestion();
  if (!question) return;
  saveAuditDraftSilently();
  app.currentId = question.question_id;
  switchView("practice");
  renderAll();
}

function copyAuditId() {
  const id = currentAuditQuestion()?.question_id || "";
  if (!id) return;
  navigator.clipboard?.writeText(id);
  setSaveState("校对题目 ID 已复制");
}

function exportAuditRecords() {
  saveAuditDraftSilently();
  const rows = app.questions.map((question) => {
    const record = app.records[question.question_id] || {};
    if (!record.auditStatus && !record.auditNote && !record.solutionDraft && !record.manualFlag) return null;
    return {
      question_id: question.question_id,
      year: question.year,
      paper: question.paper,
      question_no: question.question_no,
      audit_status: record.auditStatus || "",
      audit_note: record.auditNote || "",
      solution_draft: record.solutionDraft || "",
      manual_flag: !!record.manualFlag,
      updated_at: record.updatedAt || ""
    };
  }).filter(Boolean);
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `math1-audit-records-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function renderFavorites() {
  const list = app.questions.filter((question) => (app.records[question.question_id] || {}).favorite).sort(sortQuestions);
  $("#favoriteList").innerHTML = renderList(list, "暂无收藏题目。");
}

function renderList(list, emptyText) {
  if (!list.length) return `<div class="empty-state">${emptyText}</div>`;
  return list.map((question) => {
    const record = app.records[question.question_id] || {};
    const reason = record.reason ? ` · ${escapeHtml(record.reason)}` : "";
    return `<div class="list-row" data-id="${question.question_id}">
      <div>
        <div class="list-title">${question.year} ${escapeHtml(question.paper)} 第${pad2(question.question_no)}题</div>
        <div class="list-meta">${statusText(record.status || "unseen")}${reason} · ${question.inferred_tags.join("、") || "未标标签"}</div>
      </div>
      <button class="secondary-btn" data-open="${question.question_id}">开始</button>
    </div>`;
  }).join("");
}

document.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-open]");
  const row = event.target.closest(".list-row[data-id]");
  const id = openButton?.dataset.open || row?.dataset.id;
  if (!id) return;
  flushCurrentDraft();
  app.currentId = id;
  switchView("practice");
  renderAll();
});

function renderStats() {
  const total = app.questions.length;
  const done = app.questions.filter((q) => ["done", "wrong", "review"].includes((app.records[q.question_id] || {}).status)).length;
  const wrong = app.questions.filter((q) => (app.records[q.question_id] || {}).status === "wrong").length;
  const withSolutions = app.questions.filter((q) => !!currentSolution(q)).length;
  const manual = app.questions.filter((q) => hasManualRisk(q, app.records[q.question_id] || {})).length;
  $("#statTotal").textContent = total;
  $("#statDone").textContent = done;
  $("#statWrong").textContent = wrong;
  $("#statSolutions").textContent = withSolutions;
  $("#statManual").textContent = manual;

  const byYear = groupBy(app.questions, (q) => q.year).sort((a, b) => b.key - a.key);
  $("#yearStats").innerHTML = byYear.map((group) => {
    const yearDone = group.items.filter((q) => ["done", "wrong", "review"].includes((app.records[q.question_id] || {}).status)).length;
    const pct = group.items.length ? Math.round((yearDone / group.items.length) * 100) : 0;
    return `<div class="year-stat-row">
      <strong>${group.key}</strong>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      <span>${yearDone}/${group.items.length}</span>
    </div>`;
  }).join("");
}

function renderMarkdown(markdown, question) {
  const imageTokens = [];
  let text = markdown.replace(/\r/g, "");
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    const index = imageTokens.length;
    imageTokens.push({ alt, src: resolveAsset(src, question) });
    return `@@IMAGE_${index}@@`;
  });
  text = escapeHtml(text);
  text = text.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
  text = text.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
  text = text.replace(/^#\s+(.+)$/gm, "<h2>$1</h2>");
  text = text.split(/\n{2,}/).map((block) => {
    if (/^<h[23]>/.test(block)) return block;
    return `<p>${block.replace(/\n/g, "<br>")}</p>`;
  }).join("");
  imageTokens.forEach((image, index) => {
    const html = `<img src="${escapeAttr(image.src)}" alt="${escapeAttr(image.alt || "题目图片")}">`;
    text = text.replace(`@@IMAGE_${index}@@`, html);
  });
  return text;
}

function resolveAsset(src, question) {
  if (/^[a-z]+:/i.test(src) || src.startsWith("/")) return src;
  const sourcePath = (question.source_path || "").replace(/\\/g, "/");
  const base = sourcePath.endsWith(".md") ? sourcePath.replace(/\/[^/]+\.md$/, "") : sourcePath;
  return toFileUrl(`${base}/${src}`.replace(/\/\.\//g, "/"));
}

function toFileUrl(path) {
  return `file:///${path.replace(/\\/g, "/").replace(/^([A-Za-z]):\//, "$1:/")}`;
}

function goPrev() {
  moveQuestion(-1);
}

function goNext() {
  moveQuestion(1);
}

function goRandom() {
  if (!app.filtered.length) return;
  flushCurrentDraft();
  const index = Math.floor(Math.random() * app.filtered.length);
  app.currentId = app.filtered[index].question_id;
  resetQuestionTimer();
  renderAll();
}

function moveQuestion(delta) {
  if (!app.filtered.length) return;
  flushCurrentDraft();
  const currentIndex = Math.max(0, app.filtered.findIndex((q) => q.question_id === app.currentId));
  const nextIndex = (currentIndex + delta + app.filtered.length) % app.filtered.length;
  app.currentId = app.filtered[nextIndex].question_id;
  resetQuestionTimer();
  renderAll();
}

function saveCurrentRecord() {
  clearDraftTimer();
  const record = currentRecord();
  record.answer = $("#answerInput").value.trim();
  record.thought = $("#thoughtInput").value.trim();
  record.note = $("#noteInput").value.trim();
  record.seconds = app.timerSeconds;
  if (!record.status) record.status = "done";
  saveRecordObject(record);
  renderTopProgress();
  renderBank();
  renderReview();
  renderFavorites();
  renderStats();
  setSaveState("已保存 " + new Date().toLocaleTimeString("zh-CN", { hour12: false }));
}

function scheduleDraftSave() {
  setSaveState("有未保存内容");
  clearDraftTimer();
  app.draftSaveHandle = setTimeout(() => {
    app.draftSaveHandle = null;
    saveCurrentDraft();
  }, 600);
}

function flushCurrentDraft() {
  if (app.draftSaveHandle) {
    clearDraftTimer();
    saveCurrentDraft({ silent: true });
  }
}

function clearDraftTimer() {
  if (!app.draftSaveHandle) return;
  clearTimeout(app.draftSaveHandle);
  app.draftSaveHandle = null;
}

function saveCurrentDraft({ silent = false } = {}) {
  const question = currentQuestion();
  if (!question) return false;
  const answer = $("#answerInput").value.trim();
  const thought = $("#thoughtInput").value.trim();
  const note = $("#noteInput").value.trim();
  const existing = app.records[question.question_id];
  if (!existing && !answer && !thought && !note) return false;
  const record = currentRecord();
  if (record.answer === answer && record.thought === thought && record.note === note) return false;
  record.answer = answer;
  record.thought = thought;
  record.note = note;
  record.seconds = app.timerSeconds;
  saveRecordObject(record);
  if (!silent) {
    setSaveState("草稿已自动保存 " + new Date().toLocaleTimeString("zh-CN", { hour12: false }));
  }
  return true;
}

function saveRecordObject(record) {
  record.updatedAt = new Date().toISOString();
  app.records[record.question_id] = record;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(app.records));
  } catch (error) {
    console.error(error);
    setSaveState("保存失败：浏览器本地存储不可用");
  }
}

function currentQuestion() {
  if (app.currentId) {
    const selected = app.questions.find((q) => q.question_id === app.currentId);
    if (selected) return selected;
  }
  return app.filtered[0] || null;
}

function currentSolution(question = currentQuestion()) {
  if (!question || !window.SOLUTION_BY_ID) return null;
  if (window.SOLUTION_BY_ID?.[question.question_id]) return window.SOLUTION_BY_ID[question.question_id];
  return null;
}

function currentSolutionSource(question = currentQuestion()) {
  if (!question || !window.SOLUTION_SOURCES) return "";
  const solution = currentSolution(question);
  return solution?.source_path || window.SOLUTION_SOURCES[String(question.year)] || "";
}

function currentRecord(create = true) {
  const question = currentQuestion();
  if (!question) return {};
  return currentRecordForQuestion(question.question_id, create);
}

function currentRecordForQuestion(questionId, create = true) {
  if (!questionId) return {};
  if (!app.records[questionId] && create) {
    app.records[questionId] = { question_id: questionId, status: "unseen" };
  }
  return app.records[questionId] || { question_id: questionId, status: "unseen" };
}

function loadRecords() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function syncRange() {
  app.qStart = Math.max(1, Number($("#qStart").value || 1));
  app.qEnd = Math.max(app.qStart, Number($("#qEnd").value || app.qStart));
  $("#qStart").value = app.qStart;
  $("#qEnd").value = app.qEnd;
  applyFilters();
  renderCurrentSafe();
}

function resetFilters() {
  app.selectedYears = new Set(app.questions.map((q) => q.year));
  app.selectedPapers = new Set(app.questions.map((q) => q.paper));
  app.selectedTags = new Set(tags.map((tag) => tag.name));
  app.selectedStatuses = new Set(["unseen", "done", "wrong", "favorite", "review", "manual_check"]);
  app.qStart = 1;
  app.qEnd = app.maxQuestionNo;
  app.search = "";
  $("#searchInput").value = "";
  $("#qStart").value = 1;
  $("#qEnd").value = app.maxQuestionNo;
  $$(".chip[data-year], .tag-chip[data-tag]").forEach((button) => button.classList.add("active"));
  $$(".paper-filter, .status-filter").forEach((input) => { input.checked = true; });
  applyFilters();
  renderCurrentSafe();
}

function toggleAllYears() {
  const allYears = unique(app.questions.map((q) => q.year));
  const allSelected = app.selectedYears.size === allYears.length;
  app.selectedYears = new Set(allSelected ? [] : allYears);
  $$(".chip[data-year]").forEach((button) => button.classList.toggle("active", !allSelected));
  applyFilters();
  renderCurrentSafe();
}

function startTimer() {
  if (app.timerHandle) clearInterval(app.timerHandle);
  app.timerHandle = setInterval(() => {
    if (!app.timerRunning) return;
    app.timerSeconds += 1;
    renderTimer();
  }, 1000);
}

function resetQuestionTimer() {
  app.timerSeconds = 0;
  app.timerRunning = true;
  $("#toggleTimer").textContent = "Ⅱ";
  renderTimer();
}

function renderTimer() {
  const h = Math.floor(app.timerSeconds / 3600);
  const m = Math.floor((app.timerSeconds % 3600) / 60);
  const s = app.timerSeconds % 60;
  $("#timer").textContent = `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

function copyCurrentId() {
  const id = currentQuestion()?.question_id || "";
  if (!id) return;
  navigator.clipboard?.writeText(id);
  setSaveState("题目 ID 已复制");
}

function openCurrentSource() {
  const source = currentQuestion()?.source_path;
  if (!source) return;
  window.open(toFileUrl(source), "_blank");
}

function openCurrentSolutionSource() {
  const source = currentSolutionSource();
  if (!source) return;
  window.open(toFileUrl(source), "_blank");
}

function setSaveState(text) {
  $("#saveState").textContent = text;
}

function statusBadge(status, favorite) {
  const base = `<span class="badge ${status === "wrong" ? "wrong" : status === "done" ? "ok" : status === "review" ? "warn" : ""}">${statusText(status)}</span>`;
  return favorite ? `${base} <span class="badge blue">收藏</span>` : base;
}

function qualityBadge(question, record) {
  const manual = hasManualRisk(question, record);
  return manual ? `<span class="badge warn">需校对</span>` : `<span class="badge ok">ok</span>`;
}

function solutionBadge(question) {
  const solution = currentSolution(question);
  if (!solution) return `<span class="badge warn">待补写</span>`;
  return solution.quality_status === "manual_check"
    ? `<span class="badge warn">需校对</span>`
    : `<span class="badge ok">有解析</span>`;
}

function auditStatusBadge(status) {
  if (!status) return `<span class="badge warn">待处理</span>`;
  const cls = status === "confirmed" || status === "fixed" ? "ok" : "warn";
  return `<span class="badge ${cls}">${auditStatusText(status)}</span>`;
}

function hasManualRisk(question, record = {}) {
  const solution = currentSolution(question);
  return question?.quality_status === "manual_check" ||
    !!record.manualFlag ||
    solution?.quality_status === "manual_check";
}

function statusText(status) {
  return {
    unseen: "未做",
    done: "会做",
    wrong: "做错",
    review: "待复习"
  }[status] || "未做";
}

function auditStatusText(status) {
  return {
    confirmed: "已确认",
    needs_fix: "需修正",
    fixed: "已补写"
  }[status] || "待处理";
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h ? `${h}小时${m}分${s}秒` : `${m}分${s}秒`;
}

function typesetMath() {
  if (window.MathJax?.typesetPromise) {
    window.MathJax.typesetPromise([
      $("#questionBody"),
      $("#auditQuestionBody"),
      $("#auditSolutionBody")
    ].filter(Boolean)).catch(() => {});
  }
}

function toggleSet(set, value) {
  set.has(value) ? set.delete(value) : set.add(value);
}

function unique(items) {
  return Array.from(new Set(items));
}

function groupBy(items, getter) {
  const map = new Map();
  items.forEach((item) => {
    const key = getter(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  });
  return Array.from(map.entries()).map(([key, groupItems]) => ({ key, items: groupItems }));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

function pad2(value) {
  return String(value).padStart(2, "0");
}
