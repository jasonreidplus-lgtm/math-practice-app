# 数学真题刷题小程序

这是一个本地静态网页原型，用来验证刷题程序 UI 和基础交互。

## 打开方式

直接双击打开：

`E:\数学自用\数学真题刷题小程序\index.html`

也可以用浏览器打开该文件。当前版本不需要安装依赖、不需要启动服务器。

## 手机网页 / GitHub Pages

当前项目已经按纯静态网页准备，可直接发布到 GitHub Pages：

1. 在 GitHub 新建一个仓库。
2. 本地添加远程仓库并推送：

```powershell
git remote add origin https://github.com/你的用户名/你的仓库名.git
git branch -M main
git push -u origin main
```

3. 打开仓库 `Settings -> Pages`。
4. `Source` 选择 `Deploy from a branch`。
5. `Branch` 选择 `main`，目录选择 `/root`，保存。
6. 等待 GitHub Pages 发布完成后，用手机打开生成的网址。

项目已包含：

- `.nojekyll`：避免 GitHub Pages 用 Jekyll 处理静态资源。
- `manifest.webmanifest`：支持手机添加到主屏幕。
- `service-worker.js`：网页访问后缓存核心文件。
- `assets\`：题目和解析图片已复制为仓库内相对资源。

注意：GitHub Pages 如果使用公开仓库，题库内容也会公开可访问。若只想自己看，优先考虑私有仓库 Pages 或其他私有静态托管方案。

## 当前功能

- 读取本地题目数据：`data\questions.js`
- 三栏练习界面：左侧筛选、中间题目、右侧练习记录
- 手机端布局：单栏刷题、底部导航、筛选/记录底部抽屉
- GitHub Pages / 手机浏览器静态访问
- 题库表格
- 错题 / 待复习队列
- 校对工作台：集中处理需校对、待补写、修正解析草稿
- 收藏题目
- 基础统计
- 题目 / 解析 / 我的记录页签
- 年份、卷子版本、题号范围、状态、标签筛选
- 搜索题目正文
- 上一题、下一题、随机一题
- 保存做题状态、答案、思路、备注、错因
- 保存校对状态、校对备注、修正解析草稿
- 做题记录保存在浏览器 localStorage

## 数据来源

题目数据来自：

`E:\数学自用\题库数据库整理\tables\questions_seed.jsonl`

生成后的浏览器数据文件：

`E:\数学自用\数学真题刷题小程序\data\questions.js`

解析数据来自：

`E:\数学自用\数据资料\真题\按年份整理\各年份\解析\*.md`

生成后的浏览器解析文件：

`E:\数学自用\数学真题刷题小程序\data\solutions.js`

SQLite 迁移结构：

`E:\数学自用\数学真题刷题小程序\database\schema.sql`

SQLite 种子 SQL：

`E:\数学自用\数学真题刷题小程序\database\seed.sql`

## 注意事项

- 当前是前端原型，练习记录只存在当前浏览器的 localStorage 里。
- 校对工作台中的确认、需修正、补写草稿也暂存在当前浏览器的 localStorage，可在校对页导出 JSON。
- 公式渲染使用 MathJax CDN；如果离线，题目仍能显示，但公式不会美化渲染。
- 2022 年题目与解析已标记为需校对，原因是原始 Markdown/OCR 质量较差。
- 图片引用沿用原题目文件路径，浏览器打开本地文件时通常可以显示。
- 发布到 GitHub Pages 时，题目和解析图片使用仓库内 `assets\` 相对路径。
- 网页托管模式下无法打开本机 E 盘源文件，“打开源文件位置”会改为复制源路径。
- 解析文件格式不统一，当前题目级映射 893 条解析；未匹配的题目会提示打开整年解析源文件或标记待补写。

## 验证记录

- 已用 Edge headless 做桌面渲染烟测。
- 已用 Edge DevTools 协议做 390px 手机视口烟测。
- 截图位置：`docs\smoke-desktop.png`
- 手机首屏截图位置：`docs\mobile-practice-cdp.png`
- 手机筛选抽屉截图位置：`docs\mobile-filter-drawer.png`
- 手机记录抽屉截图位置：`docs\mobile-record-drawer.png`
- GitHub Pages/PWA 手机检查截图位置：`docs\pages-mobile-check.png`
- 解析页截图位置：`docs\smoke-audited.png`
- 校对页截图位置：`docs\smoke-audit-workbench.png`
- 数据加载结果：930 条题目。
- 解析加载结果：819 个年份题号解析键，893 条题目级解析映射。
- 当前质量审核：37 条待补写 / 待匹配，161 条需校对。
- 质量审核报告：`docs\quality-audit.md`
- 重新生成质量审核：`node tools\audit-quality.js`
- 重新生成 SQLite 种子数据：`node tools\export-sqlite-seed.js`

## 后续建议

- 增加 SQLite 后端，把 localStorage 迁移为真实数据库。
- 增加解析、答案、标签管理。
- 增加错题导出 Markdown。
- 把校对工作台中的修正解析草稿合并进 SQLite 后端。
