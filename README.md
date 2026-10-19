# paseo-antd-theme（最小方案）

把 [Paseo](https://github.com/getpaseo/paseo) 的配色以**最小配置**整合为 **antd v6** 的深色主题：五个颜色族 + 三个背景色，其余全部交给 antd 以 paseo 的种子色自行派生。浅色模式用 antd 默认主题，仅字体栈与深色一致。

> 完整保真方案（48 个 token + 组件 token + 自定义 token + 派生 token 登记）备份在
> `../paseo-antd-theme-full/`，含 `package-lock.json` 可完整复现。

```tsx
import { ConfigProvider } from "antd";
import { paseoTheme, type PaseoColorScheme } from "./paseo/theme";

const scheme: PaseoColorScheme = window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";

<ConfigProvider theme={paseoTheme(scheme)}>
  <App />
</ConfigProvider>;
```

映射表见 [MAPPING.md](./MAPPING.md)（由 `scripts/dump-mapping.ts` 生成）。

## 为什么必须包装算法

antd v6 的 token 管线有两个行为决定了“直接写 `theme.token`”行不通（读 `antd/lib/theme/util/alias.js` 与 `themes/dark/index.js` 确认）：

1. **种子 token 的覆盖会被丢弃**——`formatToken` 把用户 `theme.token` 里所有 `defaultSeed` 键删掉再合并，`colorPrimary`、`fontFamily` 都在此列，它们只作为算法输入存在。
2. **深色算法会重新派生颜色族**——种子色经 `@ant-design/colors` 深色色板生成后基色被暗化（`#20744A` → `#1e6642`）。

所以 `paseoDarkAlgorithm` 包住 `antdTheme.darkAlgorithm`，在返回值里钉回 paseo 精确色值，并用 antd 自己的色板生成器（`generate(color, { theme: "dark" })`，索引映射与 `themes/dark/colors.js` 一致）围绕原色重建每个色族的 hover/active/bg 阶梯。别名 token（`colorSplit`、`colorTextPlaceholder`、`controlOutline` 等）最后被强制派生，不能手动设——最小方案不碰它们，它们的来源（`colorBorderSecondary`、`colorTextQuaternary`、`colorPrimaryBg`…）已经在 paseo 种子的派生路径上。

## 配了哪些

| 类别 | token |
| --- | --- |
| 颜色族（种子 + 派生层钉固） | `colorPrimary` `colorSuccess` `colorWarning` `colorError` `colorInfo` `colorLink` |
| 背景（map 覆盖） | `colorBgLayout` `colorBgContainer` `colorBgElevated` |
| 种子基准 | `colorTextBase` `colorBgBase` |
| 字体 | `fontFamily` `fontFamilyCode`（深浅一致，避免切换位移） |

`colorInfo` 用 paseo 的 running 蓝 `#5caaf6`（paseo 体系没有 info 色）；`colorLink` 用 `accentBright` `#7ccba0`（深绿 accent 在深色背景上只有约 2.4:1）。

## 验证

```bash
npm install
npm run typecheck   # token 名对照 antd v6 自身类型，拼错即编译失败
npm test            # 18 个测试
npm run build
npm run dev         # demo
```

测试覆盖：13 个 token 解析值与源值逐字节一致（含主色不被暗化）、hover/active 围绕钉住基色保持“悬停更亮、激活更暗”、浅色仅字体栈例外且无自定义 token、对比度纪律（正文 ≥ 4.5:1、主按钮白字 ≥ 4.5:1、状态色 ≥ 3:1）、双主题渲染冒烟。

## 备注

- `@ant-design/colors` 是显式依赖，升级 antd 大版本时需重新核对其暗色色板索引映射是否变化。
- 兼容 `cssVar`：`theme={{ ...paseoTheme(scheme), cssVar: true }}`。
- 浅色字体栈钉固的原因：antd 默认栈在 Windows 上落到 Segoe UI，`system-ui` 落到另一个宽约 7% 的系统字体，不钉则切换主题时按钮/标签/表格列全部位移。
