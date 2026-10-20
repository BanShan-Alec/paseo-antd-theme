# paseo-antd-themes

**Paseo Dark** 与 **Claude Light** 两套 **Ant Design v6** 主题。共享同一套 token 管线、字体度量和组件级行为，可作为 antd 默认主题的替代。

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

`PaseoThemeProvider` 是 `ConfigProvider` 的替代品：按 `mode` 选择主题，并自动注入自定义 loading 图标、Segmented 间隙和 Select 行间透明间隔。不需要额外引入 CSS。

```tsx
import { PaseoThemeProvider } from "paseo-antd-themes";

<PaseoThemeProvider mode="system">
  <App />
</PaseoThemeProvider>;
```

- `mode`: `"system" | "dark" | "light"`，默认 `"system"`，跟随 `prefers-color-scheme`。
- `theme`: 传入任意 `ThemeConfig` 覆盖内置主题，优先级高于 `mode`。
- `ssrMode`: `"dark" | "light"`（默认 `"light"`）。`mode="system"` 时服务端无法感知客户端偏好，SSR 输出由它决定；如果你的服务端能从 cookie/请求头解析出主题偏好，在这里传入可以避免首帧闪白。
- `loadingIcon`: 替换默认 loading 图标；默认是本包的双弧渐变 spinner。
- 其余 `ConfigProvider` props（`locale`、`direction`、`componentSize` 等）原样透传。

> **虚拟滚动 Select**：下拉列表超过一屏（默认约 256px）时 rc-virtual-list 开始接管渲染。此时必须同时传 `<Select listItemHeight={44}>`，否则虚拟列表仍按 antd 默认 40px 估算行高，行间透明间隔会错位；不开启虚拟滚动的 Select（如 `virtual={false}` 或短列表）不需要。

### 裸主题配置

只需要 token 时，继续用 antd 的 `ConfigProvider`：

```tsx
import { ConfigProvider } from "antd";
import { claudeLightTheme } from "paseo-antd-themes/claude";

<ConfigProvider theme={claudeLightTheme}>
  <App />
</ConfigProvider>;
```

```tsx
import { paseoDarkTheme } from "paseo-antd-themes/paseo";
```

> 裸主题只包含 token；自定义 loading 图标、Segmented / Select 间隙只在 `PaseoThemeProvider` 中生效。

### Tailwind v4（纯 CSS，无需 antd）

同一条 token 管线也发布为 Tailwind v4 样式表。值在构建期经 antd 管线解析（包含算法派生的 hover/active/色阶），发布为静态 CSS——**使用它的项目不需要安装 antd**：

```css
@import "tailwindcss";
@import "paseo-antd-themes/tailwind.css";
```

之后 `bg-primary`、`text-primary-hover`、`bg-surface-1`、`bg-text-secondary`、`border-split`、`font-sans`、`rounded-md` 等工具类直接可用。完整变量清单见 [MAPPING.md](./MAPPING.md) 的「Tailwind 变量映射」一节。

暗色策略两种都支持：浅色（Claude Light）写在 `:root`，深色（Paseo Dark）同时写在 `@media (prefers-color-scheme: dark)`（Tailwind 默认策略，`dark:` 变体开箱即用）与 `.dark`（类策略，写在 media 块之后，同时命中时类胜出）。要启用类策略需在项目里加一行：`@custom-variant dark (&:where(.dark, .dark *));`

命名规则：antd token 去 `color` 前缀转 kebab，自定义 token 同理——`colorPrimary` → `--paseo-primary`、`colorPrimaryHover` → `--paseo-primary-hover`、`paseoSurface0` → `--paseo-surface-0`、`paseoIdentityViolet` → `--paseo-identity-violet`。`@theme inline` 把它们映射为 Tailwind 的 `--color-*` 刻度。

一个已知别扭点：文字阶梯的键是 `text` / `text-secondary` / `text-tertiary` / `text-quaternary`（沿用 antd 的 `colorText*` 命名），而 Tailwind 的 `text-<x>` 颜色类解析到 `--color-<x>`，所以当颜色用要写 **`text-text-secondary`**、`bg-text-secondary`（键名以 `text-` 开头导致的重复）。若介意，可在项目里加 `@theme { --color-foreground: var(--paseo-text); --color-foreground-secondary: var(--paseo-text-secondary); … }` 起别名，无需改包。

两点有意覆盖，需要回退默认刻度时自行在项目里重定义：

- `--font-sans` / `--font-mono` 采用 paseo 的系统字体栈（与 antd 主题一致）；
- `--radius-xs/sm/md/lg` 对齐主题的 4/8/12/12px 圆角形态。

重新生成：`npm run gen:tailwind`（产物 `src/tailwind/theme.css` 已提交，改动主题后需要重新生成；测试会校验新鲜度）。

## Exports

| 入口 | 导出 |
| --- | --- |
| `paseo-antd-themes` | `PaseoThemeProvider`, `PaseoLoadingIcon`, `claudeLightTheme`, `paseoDarkTheme`, types |
| `paseo-antd-themes/claude` | `claudeLightTheme`, `claudeLight`, `claudeIdentityLight`, token mappings |
| `paseo-antd-themes/paseo` | `paseoDarkTheme`, `paseoDark`, token mappings |
| `paseo-antd-themes/tailwind.css` | Tailwind v4 样式表（浅色 `:root` + 深色 media/`.dark`，含 `@theme inline`） |

## 两套主题

| Paseo Dark · 概览 | Claude Light · 概览 |
| --- | --- |
| ![Paseo Dark 概览](./docs/paseo-dark.png) | ![Claude Light 概览](./docs/claude-light.png) |

| 维度 | Paseo Dark | Claude Light |
| --- | --- | --- |
| 定位 | 长时间运行的 agent orchestration 深色工作台 | 日间、评审/文档式的 Claude 品牌浅色界面 |
| 表面 | 青绿调深色阶梯，层与层靠亮度区分 | 官网取色奶油底 `#F0EDE2` + 纸感卡片 `#F5F4EC`，暖黑文字 |
| 主色 | paseo 深绿；链接用更亮的绿 | Claude 官网 clay；链接用 suggestion 蓝 |
| 状态色 | paseo 归一化家族，为深色表面调校 | 同一等响度规则在浅色表面重解 |
| Diff | 降饱和深色行底，白字可读 | 低饱和浅色行底 + 深色统计文字 |
| 阴影 | 黑色系软阴影 | 暖墨色软阴影 |
| 适合 | 夜间、专注、终端/agent 工作流 | 白天、评审/文档、Claude 品牌场景 |

**Paseo Dark** 保留 paseo 的青绿深色表面和绿色身份，状态色按等响度规则归一化。控件形态和软阴影与浅色主题共享同一套语言。

**Claude Light** 从 claude.ai 官网截图像素取色重推：奶油页面 `#F0EDE2`、只亮 1.06 的纸感卡片 `#F5F4EC`、hover `#DDD9CE`、暖黑文字 `#3C3C2C`，主色用官网交互态 clay `#BA5B37`（白字 4.53:1）。状态色仍按 paseo 等响度规则在浅色表面重解。完整取值见 [DESIGN.md](./DESIGN.md)。

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

设计取值、状态色归一化规则和算法包装细节见 [DESIGN.md](./DESIGN.md)；完整 token 映射见 [MAPPING.md](./MAPPING.md)。

## License

MIT
