# Design QA

final result: passed

## Scope

- Product: 数学真题刷题小程序
- Change: 手机端响应式布局、题型板块、选择题交互、题内解析回填
- Visual target: 当前桌面版工作台与用户提供的 UI 参考图
- Tested URL: `http://127.0.0.1:8765/index.html`

## Checks

- Desktop viewport `1440x900`: preserved three-column workbench layout.
- Mobile viewport `390x844`: single-column practice page renders without page-level horizontal overflow.
- Mobile navigation: six bottom navigation items are visible.
- Mobile tools: 筛选 and 记录 open as bottom drawers with overlay and close controls.
- Math content: long formulas stay within the page; formula area can scroll horizontally when needed.
- GitHub Pages mode: manifest is present, service worker registers, source paths render as relative paths.
- Source-file buttons: removed from the practice footer.
- Type sections: 选择题、填空题、大题 render as three mobile-friendly blocks.
- Choice interaction: A-D selection saves the answer and marks status when the correct answer is known.
- Inline solutions: questions containing `【答案】/【解析】/解：` hide that content from the question tab and show it on the solution tab.

## Evidence

- `docs/mobile-practice-cdp.png`
- `docs/mobile-filter-drawer.png`
- `docs/mobile-record-drawer.png`
- `docs/desktop-after-mobile.png`
- `docs/desktop-type-board.png`
- `docs/pages-mobile-check.png`
- `docs/interactive-choice-mobile.png`

## Notes

- The first 1987 question contains a naturally long inline formula. On mobile it is kept readable inside the content area rather than expanding the page width.
