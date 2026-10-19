# paseo-antd-theme

把 **Paseo 的深色体系**与 **Claude 的浅色体系**分别整合为 **antd v6** 主题。

| 方案 | 目录 | 说明 |
| --- | --- | --- |
| Paseo 完整（深色） | `src/paseo-full/` | paseo 配色 + Claude.ai 形态：40px 控件、14px 正文、12px 圆角、软阴影 |
| Claude 浅色 | `src/claude/` | Claude 品牌表面 + Claude Code 信号色 + paseo 归一化状态色 |
| Paseo 最小（深色） | `src/paseo/` | 13 个 token 的最小方案；浅色仍是 antd 默认，仅字体栈钉固 |

> 浅色方案不是 antd 官方浅色。Claude Code CLI 的浅色主题只有信号色、没有画布背景（终端负责背景），所以表面/中性色来自 Claude 品牌（ivory `#FAF9F5`、暖灰 `#F0EEE6`、边框 `#DEDCD1`、墨色 `#141413`），信号色来自 Claude Code 官方浅色主题，状态色则保留 paseo 的归一化规则。

```tsx
import { ConfigProvider } from "antd";
import { paseoDarkTheme } from "./paseo-full/theme";
import { claudeLightTheme } from "./claude/theme";

const scheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

<ConfigProvider theme={scheme === "dark" ? paseoDarkTheme : claudeLightTheme}>
  <App />
</ConfigProvider>;
```

映射表见 [MAPPING.md](./MAPPING.md)（由 `scripts/dump-mapping.ts` 生成）。

## 全局组件配置（loading 图标 / Segmented 间隙）

`ThemeConfig` 只能承载 token，不能承载 React 节点，所以下面两项由 `ClaudeThemeProvider` 通过 antd 的组件级配置注入：

- **loading 图标**：`button.loadingIcon`、`spin.indicator`、`select.loadingIcon` 全部指向 `ClaudeLoadingIcon`——本地复制的 `@ant-design/icons` LoadingIcon（双弧渐变 + 发丝连接线），`currentColor` 跟随文字色、1s 线性旋转。Button、Spin、Table 的 loading 都会继承。
- **Segmented 间隙**：antd 没有 item gap token。完整主题把 `Segmented.trackPadding` 设为 4（默认 2）；Provider 再给每个 item 加 `claude-segmented-item` 类，由 `theme.css` 加 4px 的 `margin-inline-end`（用 `:not(:last-child)`，避免尾部多出空白）。

```tsx
import { ClaudeThemeProvider } from "./claude/Provider";
import { paseoDarkTheme } from "./paseo-full/theme";

<ClaudeThemeProvider>
  <App />
</ClaudeThemeProvider>;

// 同一套 loading 图标与 Segmented 行为，换成 paseo 深色：
<ClaudeThemeProvider theme={paseoDarkTheme}>
  <App />
</ClaudeThemeProvider>;
```

只想要 token、不想要自定义图标时，继续直接用 `ConfigProvider theme={claudeLightTheme}` 即可。

## Claude 浅色是怎么拼出来的

### 表面

严格亮度递增，侧栏最暗、弹层最亮：

| 角色 | 值 |
| --- | --- |
| 侧栏 / `paseoSurfaceSidebar` | `#E9E6DC` |
| layout / `surface0` | `#F0EEE6` |
| container / `surface1` | `#FAF9F5` |
| elevated / `surface2` | `#FFFFFF` |
| 强填充 / `surface3` | `#E3DACC` |
| 最强填充 / `surface4` | `#D5D1C3` |
| 边框 | `#DEDCD1` |

卡片在 layout 上呈米白，弹层与卡片靠**阴影**区分——这是 Claude.ai 的纸感层次，而不是深色主题的“越亮越靠前”。

### 主色与文字

- 主色是 clay `#D97757`。clay 上白字只有 3.12:1，所以**主按钮文字钉为墨色 `#141413`（5.90:1）**；危险按钮仍用白字（`#a14b43` 上 5.53:1），靠 `Button.primaryColor` 单独覆盖，不动全局 `colorTextLightSolid`。
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

代价是这组颜色比 Claude Code 终端里的状态色明显更安静——这是等响度 + 55% 彩度的直接结果。每个色族的 bg / border / hover / text 槽位由 `src/claude/colors.ts` 从同一色相按明度阶梯推导。**不能直接用 antd 的 `generate()` 派生这些槽位**：它会把低彩度基色洗成灰色（`#467650` → `#aab5ab`），并且会把 `*TextHover` 指向更浅、对比度不足的槽位。

### Diff 与选区

- 浅色 diff 行底：新增 `#c1f4ca`、删除 `#f3dfdd`（同一状态色相、`L*=0.92`、55% 彩度）；词级/统计用状态色深一档的 text 槽位（`#3e6947` / `#91423c`），保证在浅色行底上也 ≥4.5。
- 深色 diff 行底同步降饱和：`#32573a` / `#783630`（`L*=0.42`，55% 彩度）。旧的 `#4ade80` / `#ef4444` 配白字只有 **1.67:1 / 3.61:1**，实际上不可读；新值配白字为 **7.86 / 8.49**。
- 选区：`rgba(217, 119, 87, 0.32)`。paseo 的 `rgba(255,255,255,0.2)` 在浅色表面上等于不可见。

### 形态

两个完整方案共享 Claude.ai 形态：控件高 40（SM 32 / LG 48）、正文 14（SM 12 / LG 16）、圆角 12（SM 8 / XS 4）、软阴影（浅色暖墨色、深色黑色）。正文最初试过 16px，在 Agent 列表和表单并排的卡片里显得拥挤，最终回到 antd/paseo 的 14px——40px 控件配 14px 正文既保留了 Claude.ai 的松弛感，又不会挤。最小方案 `src/paseo/` 保持原来的 32 / 14 / 6 紧凑形态，不受影响。

这也意味着**完整深色方案不再是对 paseo 深色的 1:1 移植**：paseo 原始深色是扁平、紧凑的。配色仍来自 paseo，形态已同步到 Claude.ai。

## 为什么必须包装算法

antd v6 的 token 管线有两个行为决定了“直接写 `theme.token`”行不通（读 `antd/lib/theme/util/alias.js` 与 `themes/dark/index.js` 确认）：

1. **种子 token 的覆盖会被丢弃**——`formatToken` 把用户 `theme.token` 里所有 `defaultSeed` 键删掉再合并，`colorPrimary`、`fontFamily` 都在此列，它们只作为算法输入存在。
2. **算法会重新派生颜色族**——深色算法会把种子色暗化（`#20744A` → `#1e6642`）；浅色算法的 `*TextHover` 槽位会选更浅的色阶，对低彩度基色来说低于 4.5:1。

所以两个完整方案都用算法包装器：深色包 `darkAlgorithm`，浅色包 `defaultAlgorithm`，在返回值里钉回精确色值。浅色额外显式钉住所有 `*Text` / `*TextHover` / `*TextActive` 槽位，并自己推导状态族的背景/边框阶梯。

## 验证

```bash
npm install
npm run typecheck   # token 名对照 antd v6 自身类型，拼错即编译失败
npm test            # 64 个测试：最小 15 + 完整深色 25 + Claude 浅色 22 + Provider 2
npm run build
npm run dev         # demo 可切换 antd 默认 / Claude 浅色 / Paseo 最小 / Paseo 完整
```

测试覆盖：映射值与源值逐字节一致、表面阶梯亮度顺序、hover/active 围绕基色、状态族等响度、对比度纪律（正文/三级文字/主按钮/链接/状态/身份色/diff ≥ 4.5）、双主题渲染冒烟。

## 备注

- `@ant-design/colors` 仍是显式依赖，但浅色状态族的 bg/border 槽位由 `src/claude/colors.ts` 的 OKLCH 推导，不依赖它的色板索引。
- 兼容 `cssVar`：`theme={{ ...claudeLightTheme, cssVar: true }}`。
- 字体栈在所有方案中钉固为同一组，避免 Windows 上 `system-ui` 与 antd 默认栈的宽度差导致切换位移。
- 完整深色方案的自定义 diff token 已换成降饱和值；如果你的消费方直接引用了 `#4ade80` / `#ef4444`，需要同步更新。
