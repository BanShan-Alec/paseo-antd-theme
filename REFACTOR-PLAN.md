# 重构 Plan：去掉最小方案 · 抽出共用基座 · 拆分 demo

分支：`feat/claude-light-theme`。基线（commit `12495ea`，Claude 浅色主题定稿）：`npm run typecheck` 通过，`npm test` 4 个文件 **79** 个用例全过。

## 本次修正（相对上一版 plan 的偏差）

上一版 plan 写于 Claude 浅色主题定稿前，以下假设已经过期，先修正再执行：

1. **基线从 78 → 79 个用例**。多出的一个来自 Claude 主题的「Segmented track 用卡片族浅中性 + itemHoverBg 不覆盖」断言（`src/claude/theme.test.tsx`）。
2. **`MAPPING.md` 的 10 行漂移已不存在**。定稿过程中已多次重新生成，当前 `MAPPING.md` 与源码完全同步（重新生成无 diff）。第 1 步不再需要「顺手修漂移」，只删最小方案表。
3. **`scripts/dump-mapping.ts` 的两处过期文案仍然存在**，第 1 步照旧修：
   - 第 40 行「40px 控件、**16px 正文**」→ 14px；
   - 第 48 行「主色 clay 的按钮文字**为墨色**」→ 白字 4.53:1。
4. **`docs/*.png` 截图已在 `12495ea` 更新为新版 Claude 主题**，是当前生效的图。重构不动色值，截图不应再变；若第 5 步之后截图出现 diff，说明重构意外改了渲染，属于 bug。
5. **两个构建脚本还是未跟踪状态**：`scripts/fix-dts-extensions.mjs` 和 `scripts/verify-package.mjs` 已被 `package.json` 的 `build:lib` / `verify:package` 引用，但没进过 git——别人 clone 下来这两个脚本是缺失的。**执行第 1 步之前必须先补提交**（见下方前置步骤 0）。
6. **`docs/palette-preview.html`（20 张色卡）是未跟踪的设计过程产物**。颜色已定稿，它没有运行时作用。建议：提交进仓库留档（设计决策的证据链），不要进 npm 包（`files` 已排除）。不接受的话删掉即可。
7. **`Provider.test.tsx` 里 10 处 `claude-*` 断言的行号仍然准确**（80、83、95、111、187、207、269、278、279、300），第 3 步按原清单改即可。
8. **`README.md` 第 86 行、`DESIGN.md` 第 46/56/73 行、`App.tsx` 第 83 行**对 `src/paseo/` 与 `src/claude/colors.ts` 的引用仍在原行号，第 1、3 步照旧。

## 目标结构

```
src/
  index.ts  claude.ts  paseo.ts      # 三个包入口，路径与 package.json exports 完全不变
  main.tsx  App.tsx  test-setup.ts
  Provider.tsx                        # PaseoThemeProvider（组合层：唯一同时认识两个主题的文件）
  LoadingIcon.tsx                     # PaseoLoadingIcon（原 ClaudeLoadingIcon）
  themeStyles.ts                      # PASEO_THEME_CSS（类名 claude-* → paseo-*）
  shared/                             # 主题基座，只依赖 antd，不依赖 themes
    theme.ts                          # TokenMapping/DerivedToken 类型 + familyTokens/capitalize/extras/buildToken + antdDefaultLightTheme
    colors.ts                         # OKLCH 数学（原 src/claude/colors.ts）
    fonts.ts                          # PASEO_FONT_STACK / PASEO_MONO_FONT_STACK（原 paseo-full/tokens.ts）
  themes/
    claude/      theme.ts  tokens.ts  theme.test.tsx
    paseo-dark/  theme.ts  tokens.ts  theme.test.tsx      # 原 paseo-full/
  demo/
    view.ts                           # export type View = "light" | "claude" | "dark"
    primitives.tsx                    # Note / SpaceWrap / useSchemeTokens / TokenSwatchRow / TokenChip / TokenGroup
    sections/
      index.ts                        # barrel，re-export 7 个 section
      OverviewSection.tsx  AgentsSection.tsx  DiffSection.tsx  StatusSection.tsx
      HostsSection.tsx  ComponentsSection.tsx  MappingSection.tsx
  testing/                            # 测试共用工具，dts 构建排除
    contrast.ts                       # luminance / contrast
    theme.tsx                         # resolveTokens(theme) / renderWithTheme
```

分层规则（写进 `DESIGN.md`）：`shared/` 只依赖 antd；`themes/*` 依赖 `shared/`；`Provider.tsx` 在 src 根层组合两个主题；`demo/` 和 `testing/` 不进包。

## 前置步骤 0：`chore: 补齐未跟踪的构建脚本`

- `git add scripts/fix-dts-extensions.mjs scripts/verify-package.mjs docs/palette-preview.html`
- 提交。这三个文件已被 `package.json` 引用或属于设计留档，落在任何重构提交之前。

## 提交切分（5 个，每步都可单独 review、单独回滚）

每一步之后都跑 `npm run typecheck && npm test`；第 5 步之后加跑 `npm run build:lib && npm run verify:package && npm run build:demo`。

### 1. `refactor: 删除最小方案，demo 视图改为三项`

- 删除 `src/paseo/`（`theme.ts`、`tokens.ts`、`theme.test.tsx`）。
- `src/App.tsx`：删 `import * as minimal`；`VIEW_OPTIONS` 4 → 3 项，"Paseo 完整" 改标签为 **"Paseo 深色"**、值 `full` → `dark`；`themeFor()` 去掉 minimal 分支，"antd 默认" 分支改用 `full.antdDefaultLightTheme`（此刻还在 `paseo-full/theme`）；`SECTIONS`/`SECTION_TITLES`/`Section` 不动；第 83 行关于 "the paseo views" 的注释改写为单数。
- `src/demo/sections.tsx`：删 minimal import；`View` 4 → 3；`MappingSection` 的 `isFullDark` → `isPaseoDark`，mapping/derivedTokens 的三分支改两分支（`isClaude ? claude : paseo-dark`）；`TokenMapping` 类型改为从 `../paseo-full/theme` import。
- `scripts/dump-mapping.ts`：删 MINIMAL 导入与「最小方案」整节；修掉第 40、48 行两处过期文案（16px 正文 → 14px、主按钮文字墨色 → 白字）。
- 重生成 `MAPPING.md`（`node` 直跑不了，脚本里有对 `src/**/*.ts` 的无扩展名 import；用 vite 的 ssrLoadModule 或 `npx vite-node`）。预期 diff = 只删最小方案表 + 上述两处文案，**不应再有 10 行色值漂移**（已定稿时修过）。
- `README.md`：删第 86 行「仓库里的 `src/paseo/` 是最小方案……」；表格头 "Paseo Dark（完整）" → "Paseo Dark"；第 82 段去掉"完整方案 vs 原始紧凑形态"的对比措辞。
- `DESIGN.md`：第 56 行删掉最小方案那句，"两个完整方案" → "两套主题"。
- `vite.config.lib.ts`：dts exclude 删掉 `"src/paseo/**"`（`src/testing/**` 留到第 3 步加）。

### 2. `refactor: demo sections 拆成目录，共用原语上提`

- 新建 `src/demo/view.ts`（`View` 类型）。
- 新建 `src/demo/primitives.tsx`：`Note`、`SpaceWrap`、`useSchemeTokens`、`isColorValue`、`TokenSwatchRow`、`TokenChip`、`TokenGroup`。
- 新建 `src/demo/sections/`，一个 section 一个文件；section 私有数据随迁：`agents`/`stateTag` → Agents、`diffLines` → Diff、`dotStates` → Status、`hosts` → Hosts、`COMPONENT_COVERAGE` → Components。
- `src/demo/sections/index.ts` 只 re-export 7 个 section 组件；`App.tsx` 的 `type View` 改从 `./demo/view` 导入。
- 删除 `src/demo/sections.tsx`。
- `src/App.tsx`：`SECTIONS` 与 `SECTION_TITLES` 两张表合并成一张（`key / label / title / hint`），`Section` 联合类型由表的 key 推导。

### 3. `refactor: 搬家到 themes/shared，重命名公开符号`

纯路径变更 + 重命名，不改任何逻辑与取值。**`12495ea` 定稿的色值一个 hex 都不许动。**

- `git mv src/claude src/themes/claude`；`git mv src/paseo-full src/themes/paseo-dark`。
- `git mv src/themes/claude/Provider.tsx src/Provider.tsx`；`Provider.test.tsx` 随迁到 `src/Provider.test.tsx`。
- `git mv src/themes/claude/LoadingIcon.tsx src/LoadingIcon.tsx`；`themeStyles.ts` 同理到 `src/themeStyles.ts`。
- `git mv src/themes/claude/colors.ts src/shared/colors.ts`（新建 `src/shared/`）。
- 新建 `src/shared/fonts.ts`，把 `PASEO_FONT_STACK` / `PASEO_MONO_FONT_STACK` 从 `themes/paseo-dark/tokens.ts` 剪出来；`themes/paseo-dark/theme.ts` 与其测试改为从 `../shared/fonts` 导入。
- 更新全部 import 路径：`src/index.ts`、`src/claude.ts`、`src/paseo.ts`、`Provider.tsx`（`../themes/paseo-dark/theme`）、两个主题的 `theme.ts` / `tokens.ts` / 测试、`scripts/dump-mapping.ts`。
- 重命名清单（`claude-` → `paseo-`，共 6 类，必须同改）：
  - `ClaudeLoadingIcon` → `PaseoLoadingIcon`（`index.ts`、`Provider.tsx`、`README.md` 导出表）；
  - CSS 类 `.claude-loading-icon` / `.claude-select-item`（含 `themeStyles.ts` 的加倍写法 `.claude-select-item.claude-select-item`）/ `.claude-segmented-item` → `paseo-*`；
  - `@keyframes claude-loading-rotate` → `paseo-loading-rotate`；
  - `data-claude-loading` → `data-paseo-loading`；
  - `LoadingIcon.tsx` 内三个渐变 id 前缀 `claude-loading-top/down/header-` → `paseo-loading-*`；
  - `Provider.test.tsx` 里 10 处断言同步（`:80 :83 :95 :111 :187 :207 :269 :278-279 :300`，行号已复核仍准确）。
  旋转逻辑（转内层 `<g>`、不转 `<svg>`）不动。
  **不要"顺手简化" `.paseo-select-item.paseo-select-item` 的加倍写法**：antd 的下拉选项规则实际是 `:where(.css-hash).ant-select-dropdown :where(.css-hash).ant-select-item`，特异性 (0,2,0)，我们的单类只有 (0,1,0) 会输。加倍是为了打平，同时仍然只用一个类 + 源顺序就能被用户覆盖。
- `vite.config.lib.ts`：dts exclude 把 `src/paseo/**` 换成 `src/testing/**`。
- 重跑 dump-mapping，确认 `MAPPING.md` 无 diff（只改了 import 路径，表格内容不该变）。

### 4. `refactor: 去重共用 helper 与测试工具`

- 新建 `src/shared/theme.ts`，从两个主题里收口：
  - 类型：`TokenMapping`、`DerivedToken`（现在定义在 `paseo-dark/theme.ts`，被 claude import）、`AntdToken`、`AntdComponents`、`FamilyPrefix`；
  - `familyTokens(prefix, palette)`：两个主题的实现输出键完全一致（base/Hover/Active/Bg/BgHover/Border/BorderHover/Text/TextHover/TextActive），参数类型收窄成结构化子集 `ColorFamilySlots`（`LightFamily` 与 `DarkPalette` 都满足，后者多一个 `raw` 不影响）；
  - `capitalize`（两份逐字节相同）；
  - `extras(values)`：两个主题的 `extras()` 键集完全相同、只有值不同，泛化成接收一个 `PaseoExtrasInput`（surface0–4 / surfaceSidebar / diffAddition / diffDeletion / diffAdditionText / diffDeletionText / statusDot×4 / statusMerged / selection / identity 盘），调用方各传自己的 token 对象。**注意：Claude 主题的 extras 现在多一个 `paseoSurfaceHead` 和 `paseoSurfaceTrack`，泛化时要带上**；
  - `buildToken(mappings, extra)`；
  - `lightFontAlgorithm` + `antdDefaultLightTheme`（两份重复，只有 demo 的对照视图和 paseo-dark 的测试在用）。
- `themes/claude/tokens.ts`：删 `CLAUDE_FONT_STACK` / `CLAUDE_MONO_FONT_STACK` 两个别名（非公开导出），`themes/claude/theme.ts` 直接用 `PASEO_FONT_STACK`。
- `themes/paseo-dark/theme.ts`：删 `paseoTheme()` 与 `PaseoColorScheme`（全仓无消费者，只有它自己的测试在调），对应测试用例一并删除。
- 新建 `src/testing/contrast.ts`（`luminance`、`contrast`）与 `src/testing/theme.tsx`（`resolveTokens(theme: ThemeConfig)`，收掉三个测试文件里三份复制；claude 那份原本无参硬编码 `claudeLightTheme`，统一成传参）；三个 `theme.test.tsx` 改为 import，删掉本地复制。

### 5. `docs: 同步新结构与导出命名`

- `README.md`：导出表 `ClaudeLoadingIcon` → `PaseoLoadingIcon`；「使用」段若还有旧名一并换。
- `DESIGN.md`：`src/claude/colors.ts` → `src/shared/colors.ts`（第 46、73 行两处）；新增「仓库结构」小节，贴目标树 + 一句话分层规则。
- `DESIGN.md` 再补一小节**「Provider 注入的类名契约」**：列出 `.paseo-loading-icon` / `.paseo-loading-spin`（在我们自己的 SVG 上）、`.paseo-select-item`、`.paseo-segmented-item`，各改什么属性、权重为什么是 (0,2,0)、用户想覆盖该写什么。这些类会出现在消费者的 DOM 里，从隐式契约变成显式文档。
- 复跑 dump-mapping，确认 `MAPPING.md` 无 diff。
- 终检：`npm run typecheck && npm test && npm run build:lib && npm run verify:package && npm run build:demo`。
- **回归确认**：`docs/*.png` 不应有 diff。定稿提交 `12495ea` 之后没改过渲染，如果截图变了说明重构碰到了样式。

## 我替你拍掉的残留决策

1. **`Provider.tsx` / `LoadingIcon.tsx` / `themeStyles.ts` 放 src 根，不住 `src/shared/`**（与第 1 轮问答里"Provider 进 shared"的说法有一处偏离）。理由：Provider 是两个主题唯一的汇合点，住进 `shared/` 会让 `shared/` 反向依赖 `themes/`，基座就不再是纯基座；这三个文件放根层，和 `index.ts` / `claude.ts` / `paseo.ts` 三个入口并列，读起来就是"组合层"。不认可的话，把这三个文件 `git mv` 进 `src/shared/` 即可，其余不变。
2. **Segmented 的值 `full` → `dark`**（你只指定了标签）。标签叫"Paseo 深色"而值还叫 `full` 会很难看；`View` 类型随之变成 `"light" | "claude" | "dark"`。
3. **删 `paseoTheme()` / `PaseoColorScheme`**：全仓没有生产消费者，留着就是一坨只有自家测试用的死代码。
4. **删 `CLAUDE_FONT_STACK` 别名**：字体栈搬去 `shared/fonts.ts` 后再给 claude 留一份改名副本没有意义。
5. **`extras()` 泛化**：这是第 4 步里唯一带点设计意味的去重（其余三个是纯复制）。如果想让第 4 步更保守，可以只收口 `familyTokens` / `capitalize` / `buildToken`，`extras()` 两个主题各留一份。
6. **`App.tsx` 合并 `SECTIONS` 与 `SECTION_TITLES`**：两张表描述同一批 section，拆 demo 时顺手合一。

## 明确不做

- **不动任何色值**。`12495ea` 是 Claude 主题的定稿提交（官网取色 + 你确认过），深色状态色和十色身份盘继续用 `themes/paseo-dark/tokens.ts` 里的十六进制字面量，不引入 `normalizedDarkFamily`——那是独立的一次设计调整，要配自己的视觉回归。
- 不合并两个主题的 `components` 块：那是数据不是代码，合并只会造出一层难读的间接。
- 不改 `package.json` 的 exports 和三个入口文件路径，`verify-package.mjs` 不需要动。
- 不重新截 demo 图（`docs/*.png` 在 `12495ea` 已是新版；重构后应无 diff）。
- 不改成靶向 antd 自己的 `.ant-select-item` / `.ant-segmented-item` 选择器（省掉自造类名）：`ConfigProvider prefixCls` 一改，我们的规则就静默失效；而且 CSS 是全局的，会波及 PaseoThemeProvider 之外的 antd 实例。用 `classNames` 插槽加自己的类，与 prefixCls 无关，也只在 provider 子树内生效。
- 不发布、不打 tag。
