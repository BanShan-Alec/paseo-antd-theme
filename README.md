# paseo-antd-themes

**Paseo Dark**、**Claude Light** 两套完整主题，加上 **antd 原生亮/暗**，填进一个亮色槽位和一个暗色槽位，自由搭配（例如 antd 原生亮 + Paseo 暗）。共享同一套 token 管线、字体度量和组件级行为。

> **快速预览**：在线 demo 部署在 GitHub Pages —— [https://banshan-alec.github.io/paseo-antd-theme/](https://banshan-alec.github.io/paseo-antd-theme/)，顶部切换器选配对（Antd 原生 / Claude + Paseo / 混搭），侧边栏底部用图标切换亮色 / 暗色 / 跟随系统（默认跟随系统）。

## 安装

```bash
npm install paseo-antd-themes
```

本包是 **ESM-only**（`"type": "module"`，只提供 `import` 入口）；不支持 CJS `require` 和 Node10 解析。Peer dependencies：

- `antd >= 6.6.0 < 7`
- `react >= 18`
- `react-dom >= 18`

## 使用

### PaseoThemeProvider（推荐）

`PaseoThemeProvider` 是 `ConfigProvider` 的替代品：它只做三件事——按 `mode` 从亮/暗两个槽位里选一套主题、按需安装组件级行为、其余 props 透传给 antd。槽位里放什么由你决定，可以整对替换，也可以只换一侧。

```tsx
import { PaseoThemeProvider } from "paseo-antd-themes";

// 默认：亮 = Claude Light，暗 = Paseo Dark
<PaseoThemeProvider mode="system">
  <App />
</PaseoThemeProvider>;
```

混搭（antd 原生亮色 + Paseo 暗色，两套形态一致，切换不跳尺寸）：

```tsx
import { PaseoThemeProvider, antdLightTheme } from "paseo-antd-themes";

<PaseoThemeProvider mode="system" themes={{ light: antdLightTheme }}>
  <App />
</PaseoThemeProvider>;
```

- `themes`: `{ light?: ThemeConfig; dark?: ThemeConfig }`。**省略的槽位回落到内置默认**（Claude Light / Paseo Dark），所以只想换一侧时只传另一边即可。
- `mode`: `"system" | "light" | "dark"`，默认 `"system"`，跟随 `prefers-color-scheme`。
- `ssrMode`: `"dark" | "light"`（默认 `"light"`）。`mode="system"` 时服务端无法感知客户端偏好，SSR 输出由它决定；如果你的服务端能从 cookie/请求头解析出主题偏好，在这里传入可以避免首帧闪白。
- `behaviors`: 组件级行为，逐项默认开启、可单独关闭：
  - `loadingIcon`: `ReactElement | false`，默认本包的双弧渐变 spinner；`false` 用回 antd 自带图标。
  - `segmentedGap`: 默认 `true`，Segmented 项间 4px 间隙。
  - `selectGap`: 默认 `true`，Select 行间透明 2px 间隔。

  关掉的项连对应 CSS 都不会注入。
- 其余 `ConfigProvider` props（`locale`、`direction`、`componentSize` 等）原样透传。

行为与主题解耦：槽位里放 antd 原生主题时行为默认仍然生效；要还原 antd 原始形态就显式关掉：

```tsx
<PaseoThemeProvider
  mode="system"
  themes={{ light: antdLightTheme, dark: antdDarkTheme }}
  behaviors={{ loadingIcon: false, segmentedGap: false, selectGap: false }}
>
  <App />
</PaseoThemeProvider>;
```

> **虚拟滚动 Select**：下拉列表超过一屏（默认约 256px）时 rc-virtual-list 开始接管渲染。此时必须同时传 `<Select listItemHeight={44}>`，否则虚拟列表仍按 antd 默认 40px 估算行高，行间透明间隔会错位；不开启虚拟滚动的 Select（如 `virtual={false}` 或短列表）不需要。

### 单独使用 PaseoLoadingIcon

`PaseoLoadingIcon` 从主入口单独导出，不依赖主题，也不依赖 Provider。首次挂载时它自己把旋转关键帧注入 `<head>`（仅客户端、只注一次），所以在 provider 外使用照样会转；在 provider 内则复用 provider 的那份 `<style>`，不会多出一份。服务端不输出额外 `<style>`，水合没有差异。

```tsx
import { PaseoLoadingIcon } from "paseo-antd-themes";

// 自己的标记里：尺寸跟随 font-size（1em）
<span className="flex items-center gap-2">
  <PaseoLoadingIcon style={{ fontSize: 16 }} />
  正在读取工作区
</span>;

// Spin 的 indicator
<Spin indicator={<PaseoLoadingIcon />} />;

// Select 的 loadingIcon
<Select loading loadingIcon={<PaseoLoadingIcon />} options={options} />;

// 静态 message / notification
message.loading({ content: "部署中", icon: <PaseoLoadingIcon />, duration: 0 });
```

- 颜色走 `currentColor`，主按钮、文字按钮、深色表面上都自动跟随当前文字色。
- 旋转作用在内部 `<g>` 上，外层 1em 盒子不动，小尺寸下不会抖。
- 尺寸由 `font-size` 决定（`1em`），用 `style={{ fontSize: 16 }}` 或外层字号控制即可。
- Button 没有单组件级的 `loadingIcon` prop（antd 只在 `ConfigProvider` 上有 `button.loadingIcon`），要换按钮图标就走 Provider 的 `behaviors.loadingIcon`。反过来，把该行为关掉后在页面里手动放这个图标，它仍会自己注入关键帧。

### 从一个内置主题扩展

`extendTheme(base, { token, components })` 返回继承 `base` 的新主题，不改动 `base`。为什么需要它：内置主题在 algorithm 里钉死了调色板，antd 又会把 seed token 从 `theme.token` 覆盖层里删掉，所以直接嵌套 `ConfigProvider theme={{ token: { colorPrimary } }}` **不会生效**。`extendTheme` 把覆盖值放进派生链的最后一步，并重建整个色族，hover/active/bg/border/text 十槽跟着走。

```tsx
import { extendTheme, paseoDarkTheme, PaseoThemeProvider } from "paseo-antd-themes";

const violetPaseo = extendTheme(paseoDarkTheme, {
  token: { colorPrimary: "#7C6BF0" },
  components: { Button: { primaryColor: "#FFFFFF" } },
});

<PaseoThemeProvider mode="system" themes={{ dark: violetPaseo }}>
  <App />
</PaseoThemeProvider>;
```

- 覆盖 `colorPrimary` / `colorSuccess` / `colorWarning` / `colorError` / `colorInfo` 时，按方案重建该族十槽：深色走 antd 的 dark ramp，浅色走 OKLCH 归一化阶梯（浅色阶与本包浅色主题同一套规则，不沿用 antd 自带 ramp）。
- 其余 token（含 seed）与 `components` 照常合并；`components` 按组件浅合并，没提到的组件 token 保留。
- 主题深浅由 `base` 的 `colorBgBase` 亮度自动判断。

### 裸主题配置

只需要 token 时，继续用 antd 的 `ConfigProvider`：

```tsx
import { ConfigProvider } from "antd";
import { claudeLightTheme } from "paseo-antd-themes";

<ConfigProvider theme={claudeLightTheme}>
  <App />
</ConfigProvider>;
```

```tsx
import { antdDarkTheme, antdLightTheme, paseoDarkTheme } from "paseo-antd-themes";
```

> `antdLightTheme` / `antdDarkTheme` 是 antd 原生**配色** + 本包形态：颜色、填充、边框、阴影全部由 antd 算法派生，控件高度、圆角、Select 行高与字体栈则与内置主题一致，所以混搭槽位切换不会跳尺寸。需要连尺寸也逐像素等于 antd 时，直接传 `{ algorithm: antdTheme.defaultAlgorithm }` / `{ algorithm: antdTheme.darkAlgorithm }`。
>
> 裸主题只包含 token；Segmented / Select 间隙只在 `PaseoThemeProvider` 中生效（`PaseoLoadingIcon` 本身可单独使用，见上文）。

### Tailwind v4（纯 CSS，无需 antd）

同一条 token 管线也发布为 Tailwind v4 样式表。值在构建期经 antd 管线解析（包含算法派生的 hover/active/色阶），发布为静态 CSS——**使用它的项目不需要安装 antd**：

```css
@import "tailwindcss";
@import "paseo-antd-themes/tailwind.css";
```

之后 `bg-primary`、`text-primary-hover`、`bg-surface-1`、`bg-text-secondary`、`border-split`、`font-sans`、`rounded-md` 等工具类直接可用。完整变量清单见 [MAPPING.md](./MAPPING.md) 的「Tailwind 变量映射」一节。

一张卡片就能看清 token 的搭配关系——surface 配 border、文字走 text 阶梯、按钮用 primary：

```tsx
<div className="rounded-md border border-border bg-bg-container p-4">
  <div className="flex items-center justify-between">
    <span className="text-sm text-text-secondary">构建 #128</span>
    <span className="flex items-center gap-1.5 text-xs text-text-tertiary">
      <span className="size-1.5 rounded-full bg-status-dot-success" />
      通过
    </span>
  </div>
  <p className="mt-2 text-text">feat: 新增 diff 统计</p>
  <button className="mt-3 rounded-sm bg-primary px-3 py-1.5 text-sm text-text-light-solid hover:bg-primary-hover">
    查看详情
  </button>
</div>
```

常用类一行速查：`bg-surface-1`（纸感卡片底）、`border-split`（分隔线）、`font-mono`（等宽）、`rounded-md`（12px 圆角）。

暗色下不写 `dark:` 的类会随 `--paseo-*` 变量自动换色；需要浅深用不同 token 时用 `dark:` 变体：

```tsx
<div className="bg-surface-1 dark:bg-surface-2" />
```

暗色策略两种都支持：浅色（Claude Light）写在 `:root`，深色（Paseo Dark）同时写在 `@media (prefers-color-scheme: dark)`（Tailwind 默认策略，`dark:` 变体开箱即用）与 `.dark`（类策略，写在 media 块之后，同时命中时类胜出）。要启用类策略需在项目里加一行：`@custom-variant dark (&:where(.dark, .dark *));`

命名规则：antd token 去 `color` 前缀转 kebab，自定义 token 同理——`colorPrimary` → `--paseo-primary`、`colorPrimaryHover` → `--paseo-primary-hover`、`paseoSurface0` → `--paseo-surface-0`、`paseoIdentityViolet` → `--paseo-identity-violet`。`@theme inline` 把它们映射为 Tailwind 的 `--color-*` 刻度。

一个已知别扭点：文字阶梯的键是 `text` / `text-secondary` / `text-tertiary` / `text-quaternary`（沿用 antd 的 `colorText*` 命名），而 Tailwind 的 `text-<x>` 颜色类解析到 `--color-<x>`，所以当颜色用要写 **`text-text-secondary`**、`bg-text-secondary`（键名以 `text-` 开头导致的重复）。若介意，可在项目里加 `@theme { --color-foreground: var(--paseo-text); --color-foreground-secondary: var(--paseo-text-secondary); … }` 起别名，无需改包。

两点有意覆盖，需要回退默认刻度时自行在项目里重定义：

- `--font-sans` / `--font-mono` 采用 paseo 的系统字体栈（与 antd 主题一致）；
- `--radius-xs/sm/md/lg` 对齐主题的 4/8/12/12px 圆角形态。

重新生成（本仓库）：`npm run gen:tailwind`（产物 `src/tailwind/theme.css` 已提交，改动主题后需要重新生成；测试会校验新鲜度）。

**换了槽位配对时必须重新生成**：`tailwind.css` 里写死的是默认配对（Claude Light + Paseo Dark）。如果你用的是混搭（例如 antd 亮 + Paseo 暗），工具类的色值会和组件主题对不上。用构建期入口按自己的配对生成一份：

```ts
// scripts/theme-css.ts —— 构建前运行
import { writeFileSync } from "node:fs";
import { antdLightTheme, generateTailwindCss, paseoDarkTheme } from "paseo-antd-themes";

writeFileSync(
  "src/theme.css",
  generateTailwindCss({ light: antdLightTheme, dark: paseoDarkTheme }),
);
```

然后在入口 CSS 里 `@import "./theme.css";` 代替 `paseo-antd-themes/tailwind.css`。antd 原生主题没有 `paseo*` 自定义 token，生成器会按固定别名回退（`surface-0` → `colorBgLayout`、状态点 → 对应状态色、身份色 → antd 预设色阶），清单见 `src/tailwind/build.ts` 里每项的 `fallback`。

### Tailwind v4 + antd v6

同一份 token 管线有两条出口：antd 组件吃 `ConfigProvider` 的 JS 主题，你自己写的标记吃 Tailwind 工具类，色值同源。混用的关键是让两边进入同一套 CSS `@layer` 权重秩序：

```css
/* main.css —— 层声明必须在任何 @import 之前 */
@layer theme, base, antd, components, utilities;

@import "tailwindcss";
@import "paseo-antd-themes/tailwind.css";
```

```tsx
// main.tsx —— antd v6 不再 re-export StyleProvider，从 @ant-design/cssinjs 引
import { StyleProvider } from "@ant-design/cssinjs";
import { PaseoThemeProvider } from "paseo-antd-themes";

<StyleProvider layer>
  <PaseoThemeProvider mode="system">
    <App />
  </PaseoThemeProvider>
</StyleProvider>;
```

配好后 utilities 层恒胜 antd 层，`className` 直接覆盖组件样式，无需 `!important`：

```tsx
<Button className="rounded-full">圆角按钮</Button>
<Card className="border-split bg-surface-2">…</Card>
```

**为什么暗色不用重新编译**：样式表用 `@theme inline` 把 `--color-*` 映射到 `var(--paseo-*)`，工具类编译出来是变量引用而非写死的色值；`:root`（浅色）与 `.dark` / `prefers-color-scheme`（深色）切换的是同一批变量，utilities 跟着自动换色。

注意事项：

- **layer + `StyleProvider layer` 是硬前提**：不配则 antd 的无层级注入样式压过 utilities，所有覆盖静默失效（SSR 时层声明还须先于一切组件样式到达浏览器）。
- **不要引 `antd/dist/reset.css`**：Tailwind preflight 已覆盖它的全部页面级职责；遗留页面必须引时要带 `layer(reset)`。
- **`PaseoThemeProvider` 注入的行为 CSS 是无层级的**（loading 图标、Segmented/Select 间隙），会赢过 utilities——想用工具类改这几处时压不过它。不需要这些行为时用 `behaviors` 逐项关掉，关掉的项不会注入任何 CSS。

另见上一小节的两点有意覆盖（`text-text-secondary` 命名、font/radius 刻度）。以上结论的完整论证见 [antd v6 + Tailwind v4 组合最佳实践](./docs/antd-v6-tailwind-v4.md)。

想系统理解新版概念与覆盖方式，见博客《[从 antd v4 + Tailwind v3 到 antd v6 + Tailwind v4（上）：先搞懂概念，再学会覆盖](./docs/antd-v6-tailwind-v4-part1-concepts-and-overrides.md)》。如果你必须留在 Tailwind v3，见《[antd v6 + Tailwind v3 最佳实践：不开 layer，用构建期 token 同步](./docs/antd-v6-tailwind-v3-best-practices.md)》。

## Exports

整个包只有两个入口：

| 入口 | 导出 |
| --- | --- |
| `paseo-antd-themes` | `PaseoThemeProvider`、`PaseoLoadingIcon`、`claudeLightTheme`、`paseoDarkTheme`、`antdLightTheme`、`antdDarkTheme`、`extendTheme`、`generateTailwindCss`（构建期），以及 `PaseoThemeProviderProps`、`PaseoBehaviors`、`PaseoThemeMode`、`PaseoThemeSlots`、`ThemeExtension`、`TailwindThemePair` 类型 |
| `paseo-antd-themes/tailwind.css` | Tailwind v4 样式表（浅色 `:root` + 深色 media/`.dark`，含 `@theme inline`） |

裸 token 表、token 映射、字体算法、Tailwind 变量推导等实现细节不对外导出；具体取值看 [MAPPING.md](./MAPPING.md)，每个 token 该怎么用看 [DESIGN.md](./DESIGN.md)。

## 四套内置主题

| Paseo Dark · 概览 | Claude Light · 概览 |
| --- | --- |
| ![Paseo Dark 概览](./docs/paseo-dark.png) | ![Claude Light 概览](./docs/claude-light.png) |

| 维度 | Paseo Dark | Claude Light |
| --- | --- | --- |
| 定位 | 长时间运行的 agent orchestration 深色工作台 | 日间、评审/文档式的 Claude 品牌浅色界面 |
| 表面 | 青绿调深色阶梯，层与层靠亮度区分 | 官网取色奶油底 `#F0EDE2` + 纸感卡片 `#F5F4EC`，暖黑文字 |
| 主色 | paseo 深绿；链接用更亮的绿 | Claude 官网 clay；链接同主色系（text 档） |
| 状态色 | paseo 归一化家族，为深色表面调校 | 同一等响度规则在浅色表面重解 |
| Diff | 降饱和深色行底，白字可读 | 低饱和浅色行底 + 深色统计文字 |
| 阴影 | 黑色系软阴影 | 暖墨色软阴影 |
| 适合 | 夜间、专注、终端/agent 工作流 | 白天、评审/文档、Claude 品牌场景 |

**Paseo Dark** 保留 paseo 的青绿深色表面和绿色身份，状态色按等响度规则归一化。控件形态和软阴影与浅色主题共享同一套语言。

**Claude Light** 从 claude.ai 官网截图像素取色重推：奶油页面 `#F0EDE2`、只亮 1.06 的纸感卡片 `#F5F4EC`、hover `#DDD9CE`、暖黑文字 `#3C3C2C`，主色用官网交互态 clay `#BA5B37`（白字 4.53:1）。状态色仍按 paseo 等响度规则在浅色表面重解。完整取值见 [MAPPING.md](./MAPPING.md)，配色与用法的规范见 [DESIGN.md](./DESIGN.md)。

**Antd 原生** 两套（`antdLightTheme` / `antdDarkTheme`）用 antd 自带算法出颜色，形态与本包一致：控件 40 / 32 / 48、圆角 12 / 8 / 4、Select 行高 44、Segmented 轨道内边距 4、Alert 圆角 12，字体栈也钉成同一组。这样「antd 亮 + Paseo 暗」这类混搭在切换时只换颜色、不换骨架。要连尺寸都逐像素等于 antd，按上面裸主题一节直接传 antd 的 algorithm。

## 从 0.1.0 迁移

0.1.0 把「亮 → Claude、暗 → Paseo」写死在 Provider 里，用 `theme` 整体替换，`loadingIcon` 放在顶层。新版本改成显式的槽位与行为开关：

| 0.1.0 | 现在 |
| --- | --- |
| 什么都不传（默认） | 不变：亮 = Claude Light，暗 = Paseo Dark |
| `theme={myTheme}` | `themes={{ light: myTheme, dark: myTheme }}`（只填需要替换的一侧即可） |
| `loadingIcon={<X />}` | `behaviors={{ loadingIcon: <X /> }}` |
| 不想要 Segmented / Select 间隙 | `behaviors={{ segmentedGap: false, selectGap: false }}` |
| 固定单一主题、不跟随系统 | 两个槽位填同一个主题，或传 `mode="light"` / `"dark"` |

## 开发与验证

```bash
npm install
npm run typecheck
npm test
npm run gen:tailwind   # 重生成 src/tailwind/theme.css（主题色值变更后）
npm run build:lib      # 发布产物：ESM + d.ts（相对导入自动补 .js）+ tailwind.css
npm run build:demo     # demo，输出到 dist-demo/
npm run verify:package # 打包并校验：exports、CJS 残留、声明解析、publint、attw (esm-only)
npm run pack:dry       # npm pack --dry-run（触发 prepack 构建）
```

`npm publish` 流程：`prepublishOnly`（typecheck + test）→ `prepack`（build:lib + verify:package）→ 发布。发布前需要先 `npm login`。

每个 token 的用途与使用规范见 [DESIGN.md](./DESIGN.md)；完整取值与取色来源见 [MAPPING.md](./MAPPING.md)。

## License

MIT
