# SQLite 数据库结构

本目录用于把当前静态题库迁移到长期可维护的数据层。

## 文件

- `schema.sql`：SQLite 表结构。
- `seed.sql`：由 `node tools\export-sqlite-seed.js` 生成的题目、解析、标签和校对任务种子数据。
- `seed-summary.md`：生成统计。

## 导入方式

安装 `sqlite3` 后可执行：

```powershell
sqlite3 math1.sqlite ".read schema.sql"
sqlite3 math1.sqlite ".read seed.sql"
```

当前小程序仍是静态网页，运行不依赖 SQLite。这个数据库结构用于下一阶段桌面版或本地后端迁移。
