# 设计说明：Paseo Dark × Claude Light

本文档保留两套主题的取值理由与实现细节；安装、API 和使用方式见 [README.md](./README.md)。

## Claude 浅色是怎么拼出来的

### 表面

严格亮度递增，侧栏最暗、弹层最亮：

| 角色 | 值 |
| --- | --- |
| 侧栏 / `paseoSurfaceSidebar` | `#E2E0D6` |
| layout / `surface0` | `#F0EDE2` |
| container / `surface1` | `#F5F4EC` |
| elevated / `surface2` | `#FFFFFF` |
| 面板头（`surfaceHead`） | `#E0DDD0` |
| hover（`colorFillTertiary`） | `#DDD9CE` |
| Segmented track / `surfaceTrack` | `#E9E6DD` |
| 强填充 / `surface3` | `#D7D2C7` |
| 最强填充 / `surface4` | `#D1CCBF` |
| 边框 | `#DBD9D0` |

整套中性色保持同一 95° 暖色相，彩度压在 0.003–0.011 的低带内，亮度阶梯重排为：侧栏 < layout（Claude ivory #FAF9F5）< 卡片/浮层（纯白）。hover/选中按“坐在哪块表面上”分层：白卡上的 hover 用 #E4E2DA（对白 1.30），侧栏里的菜单 hover 用 #E4E2DA（对侧栏 1.09）、选中用 #DAD6CC（1.22）；卡片/表头用羊皮纸调的 #ECE7DB（对白 1.23），比 hover 亮一档，避免悬停行和表头撞色。

卡片只比页面亮 1.06，主要靠边框（1.28）+ 软阴影分层——这是 claude.ai 官网“纸上纸”的层次，而不是深色主题的“越亮越靠前”。主色 clay #BA5B37 是官网取色后再深一档，白字 4.53:1 直接过 4.5；hover/active 压深到 #943F25 / #6E2716。

### 主色与文字

- 主色是 Claude 官网交互态使用的 clay `#C6613F`（品牌色板里的 `#D97757` 是更浅的装饰变体）。主按钮用白字：`#C6613F` 上白字 **4.05:1**，这是整套主题唯一记录的品牌例外；hover / active 用同族更深的 `#B4543A`（白字 4.92）和 `#A64B32`（白字 5.72），静止态之外都回到 4.5 以上。危险按钮仍用白字（`#a14b43` 上 5.53:1），靠全局 `colorTextLightSolid`。
- 主色作为**文字**时用压暗的 `#A94F33`（5.17:1）；链接用 Claude Code suggestion 色相压暗到 `#4B5BD8`（象牙白 5.26:1）。
- 文字阶梯：`#141413` / `#66645C` / `#6E6C64` / `#A8A498`（最后一级只用于占位/禁用）。

### 状态色：paseo 规则，浅色重解

状态色没有直接抄 Claude Code 的 `#2C7A39` / `#AB2B3F` / `#966C1E`，而是沿用 paseo 的等响度规则：**同一感知明度（OKLCH `L* = 0.52`）+ 各色相最大彩度的 55%，只让色相承载语义**。

| 角色 | 浅色值 | 象牙白底对比 |
| --- | --- | --- |
| success | `#467650` | 5.02 |
| danger | `#a14b43` | 5.53 |
| warning | `#806340` | 5.28 |
| merged | `#774fb3` | 5.61 |
| running / info | `#436c96` | 5.21 |

代价是这组颜色比 Claude Code 终端里的状态色明显更安静——这是等响度 + 55% 彩度的直接结果。每个色族的 bg / border / hover / text 槽位由 `src/shared/colors.ts` 从同一色相按明度阶梯推导。**不能直接用 antd 的 `generate()` 派生这些槽位**：它会把低彩度基色洗成灰色（`#467650` → `#aab5ab`），并且会把 `*TextHover` 指向更浅、对比度不足的槽位。

### Diff 与选区

- 浅色 diff 行底：新增 `#c1f4ca`、删除 `#f3dfdd`（同一状态色相、`L*=0.92`、55% 彩度）；词级/统计用状态色深一档的 text 槽位（`#3e6947` / `#91423c`），保证在浅色行底上也 ≥4.5。
- 深色 diff 行底同步降饱和：`#32573a` / `#783630`（`L*=0.42`，55% 彩度）。旧的 `#4ade80` / `#ef4444` 配白字只有 **1.67:1 / 3.61:1**，实际上不可读；新值配白字为 **7.86 / 8.49**。
- 选区：`rgba(198, 97, 63, 0.32)`。paseo 的 `rgba(255,255,255,0.2)` 在浅色表面上等于不可见。

### 形态

两个完整方案共享 Claude.ai 形态：控件高 40（SM 32 / LG 48）、正文 14（SM 12 / LG 16）、圆角 12（SM 8 / XS 4）、软阴影（浅色暖墨色、深色黑色）。正文最初试过 16px，在 Agent 列表和表单并排的卡片里显得拥挤，最终回到 antd/paseo 的 14px——40px 控件配 14px 正文既保留了 Claude.ai 的松弛感，又不会挤。

Select 选项：`optionPadding` 为 `9px 12px`、`optionHeight` 为 44（默认 40）。行间透明间隔由 Provider 的 `border-block: 2px solid transparent` + `background-clip: padding-box` 实现：hover/选中背景只画到 padding box，露出下拉框背景。**虚拟滚动列表需要传 `<Select listItemHeight={44}>`**，否则 rc-virtual-list 仍按 40px 估算行高。

这也意味着**完整深色方案不再是对 paseo 深色的 1:1 移植**：paseo 原始深色是扁平、紧凑的。配色仍来自 paseo，形态已同步到 Claude.ai。

## 为什么必须包装算法

antd v6 的 token 管线有两个行为决定了“直接写 `theme.token`”行不通（读 `antd/lib/theme/util/alias.js` 与 `themes/dark/index.js` 确认）：

1. **种子 token 的覆盖会被丢弃**——`formatToken` 把用户 `theme.token` 里所有 `defaultSeed` 键删掉再合并，`colorPrimary`、`fontFamily` 都在此列，它们只作为算法输入存在。
2. **算法会重新派生颜色族**——深色算法会把种子色暗化（`#20744A` → `#1e6642`）；浅色算法的 `*TextHover` 槽位会选更浅的色阶，对低彩度基色来说低于 4.5:1。

所以两个完整方案都用算法包装器：深色包 `darkAlgorithm`，浅色包 `defaultAlgorithm`，在返回值里钉回精确色值。浅色额外显式钉住所有 `*Text` / `*TextHover` / `*TextActive` 槽位，并自己推导状态族的背景/边框阶梯。

这两个行为也是 `extendTheme` 存在的原因：包装器在算法末尾重新铺一遍色族，嵌套 `ConfigProvider` 的 `token` 覆盖会被它盖掉。`extendTheme` 把覆盖值折进算法链的最后一步，并在覆盖色族基色时重建该族十槽（深色用 `darkFamily` 的 ramp 映射，浅色用 `lightFamilyFromBase` 的 OKLCH 阶梯），所以 `extendTheme(paseoDarkTheme, { token: { colorPrimary } })` 得到的是一套自洽的色族，而不只是 base 变色。

## 仓库结构

```
src/
  index.ts  claude.ts  paseo.ts  antd.ts  tailwind.ts
                                      # 五个包入口，路径与 package.json exports 一致
  Provider.tsx                        # PaseoThemeProvider（亮/暗槽位 + 行为开关）
  extendTheme.ts                      # 从任意 ThemeConfig 派生新主题
  LoadingIcon.tsx                     # PaseoLoadingIcon
  themeStyles.ts                      # 三段行为 CSS（loading / select gap / segmented gap）
  shared/                             # 主题基座，只依赖 antd，不依赖 themes
    theme.ts                          # TokenMapping/DerivedToken 类型 + familyTokens/capitalize/extras/buildToken + light/darkFontAlgorithm
    colors.ts                         # OKLCH 数学、hex↔OKLCH、亮度、darkFamily / lightFamilyFromBase
    fonts.ts                          # PASEO_FONT_STACK / PASEO_MONO_FONT_STACK
  themes/
    antd/        theme.ts             # antd 原生亮/暗（仅钉字体栈）
    claude/      theme.ts  tokens.ts
    paseo-dark/  theme.ts  tokens.ts
  tailwind/      build.ts  theme.css  # 生成器与提交的产物
  demo/                               # demo 应用（不进 npm 包）
  testing/                            # 测试共用工具（不进 npm 包）
```

分层规则：`shared/` 只依赖 antd；`themes/*` 依赖 `shared/`；`Provider.tsx` 只认槽位与默认配对；`extendTheme.ts` 只依赖 `shared/` 的类型与色彩工具，不认识任何具体主题；`demo/` 与 `testing/` 不进包。

## Provider 注入的类名契约

`PaseoThemeProvider` 通过 antd 的 `classNames` 插槽和自身 SVG 的 `className` 往消费者 DOM 里写入以下类。CSS 由 `themeStyles.ts` 以字符串形式随 Provider 注入（无需单独 import），且**只注入仍启用的行为**：`behaviors` 关掉哪一项，对应的类、CSS 甚至 spinner 一起消失。这些类与 `prefixCls` 无关，只在 Provider 子树内生效。

| 类名 | 落点 | 改了什么 | 为什么是 (0,2,0) | 想覆盖时写什么 |
| --- | --- | --- | --- | --- |
| `.paseo-loading-icon` / `.paseo-loading-spin` | 我们自己的 loading SVG（默认图标与 Spin 的 indicator） | `vertical-align: -0.125em`；内层 `<g>` 绕中心旋转 1s/圈。旋转加在内层 `<g>` 而非 `<svg>`：1em 盒子不随旋转变化，小尺寸下笔画不闪 | 纯单类 (0,1,0)，作用在我们自己的 DOM 上，无 antd 规则竞争 | 选择器 `.paseo-loading-icon`（后写的样式或更高特异性均可） |
| `.paseo-select-item` | Select 下拉选项（`Select.popup.classNames.listItem`） | 上下 2px 透明边框 + `background-clip: padding-box`，让 hover/选中背景止步于 padding box，露出下拉背景形成行间间隔 | 写成 **`.paseo-select-item.paseo-select-item`** 的加倍形式。antd 的下拉选项规则实际是 `:where(.css-hash).ant-select-dropdown :where(.css-hash).ant-select-item`，特异性 (0,2,0)；我们的单类只有 (0,1,0) 会输。加倍打平后靠源顺序取胜，且用户仍能用一个类覆盖 | `.paseo-select-item { … }`（特异性 (0,1,0)，与我们的规则同权重，源顺序在用户侧之后即胜）；需要更强保证就写 `.ant-select-item.paseo-select-item` |
| `.paseo-segmented-item` | Segmented 选项（`Segmented.classNames.item`） | `:not(:last-child) { margin-inline-end: 4px }`——antd 没有 Segmented 间隙 token | 单类 (0,1,0)，竞争规则只有 antd 自身的 reset | `.paseo-segmented-item` 或更具体的选择器 |

> 注意：不要为了省掉自造类名而改成靶向 `.ant-select-item` / `.ant-segmented-item`——`ConfigProvider prefixCls` 一改这些规则就静默失效，而且 CSS 是全局的，会波及 Provider 之外的 antd 实例。

## 备注

- `@ant-design/colors` 仍是显式依赖，但浅色状态族的 bg/border 槽位由 `src/shared/colors.ts` 的 OKLCH 推导，不依赖它的色板索引。
- 兼容 `cssVar`：`theme={{ ...claudeLightTheme, cssVar: true }}`。
- 字体栈在所有方案中钉固为同一组，避免 Windows 上 `system-ui` 与 antd 默认栈的宽度差导致切换位移。
- 完整深色方案的自定义 diff token 已换成降饱和值；如果你的消费方直接引用了 `#4ade80` / `#ef4444`，需要同步更新。
