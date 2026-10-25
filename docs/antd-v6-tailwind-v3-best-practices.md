# antd v6 + Tailwind v3 最佳实践：不开 layer，用构建期 token 同步

> 写给从 antd v4 + Tailwind v3 迁移过来的应用开发者。
>
> 本文的前提：Tailwind 固定 v3；**不启用 `StyleProvider layer`**；Tailwind 只镜像 antd 的全局 alias token（主色、文字、背景、边框、状态色、圆角/字体），不碰 `Button.*`、`Table.*` 这类 component token。

## 0. 先说结论

- **不开 layer**。Tailwind v3 不产出原生级联层，硬开 antd layer 得到的不是 v4 + v6 那种确定顺序，而是「无层级的 preflight 和 utility 反过来压 antd」。
- **Tailwind 的色板通过构建期生成**。用 `theme.getDesignToken` 把全局 alias token 算成 `--brand-*`，Tailwind 只写 `var(--brand-*)`。一份数据源，暗色靠改变量，不靠重编译。
- **组件内部 token 留在 antd**。`Button.primaryShadow`、`Table.headerBg` 这类东西由 `theme.components` 消费，不进入 Tailwind 色板。

一句话：**antd 管组件内部，Tailwind 管全局语义色板，两者在 alias 层握手。**

这套方案适合：已经在 Tailwind v3、短期不打算升 v4、又想让两套系统共用同一批颜色的项目。不适合：必须依赖原生 `@layer` 做复杂覆盖，或者完全不想引入生成脚本的项目。

本文不展开 SSR 的完整实现、`zeroRuntime` 的迁移、多主题的工程化，也不讨论 Tailwind v4——这些各自都能单独成篇；这里只把 v6 + v3 不开 layer 的基线搭稳。

## 1. v4 + v3 的痛点

antd v4 + Tailwind v3 的组合不是不能用，是「覆盖全靠约定」：

| 痛点 | 具体表现 | 后果 |
| --- | --- | --- |
| 没有原生层 | `.ant-btn` 和 `.bg-primary` 同为 (0,1,0) | 谁后加载谁赢，覆盖靠运气 |
| 按需注入顺序不稳 | `babel-plugin-import` 在运行时注入 antd CSS | Tailwind 不一定排在后面 |
| 两套 reset | Tailwind preflight 和 antd 全局 reset 都在清默认样式 | 常见做法是关掉 preflight |
| 内部状态选择器更强 | `.ant-btn-primary:hover` 这类组合选择器 | `!important` 越写越多 |
| 主题两套值 | Less 变量和 Tailwind 色板各维护一份 | 时间一长必然漂移 |

把这些痛点具体化：

- 你写 `<Button className="rounded-full">`，`.ant-btn` 和 `.rounded-full` 同为 (0,1,0)。如果 antd 的按需 CSS 后注入，圆角就不生效；你只能写 `.ant-btn { border-radius: 9999px }` 或 `!important`。
- 内部状态更麻烦：`.ant-btn-primary:hover` 是 (0,2,0)，Tailwind 的 `hover:bg-primary-hover` 也是 (0,2,0)。看似平手，但 antd 的注入时机常常在后面，结果还是 antd 赢。
- 主题两套值：`@primary-color` 改了，Tailwind 的 `primary` 不会变；你会在两个文件里各改一次，而且很难保证颜色完全一致。
- 关掉 preflight 之后，页面级的基础样式又得自己补；不关，两套 reset 的顺序又变成新的不确定性。

当年也有人用 `:not(#\#)`、`postcss-increase-specificity` 或 `important: "#app"` 来提权。这些手段能救急，但本质是在和浏览器的级联规则对抗：`important: "#app"` 会把所有 utility 锁进 `#app`、提到 ID 级特异性，后续覆盖会更难。它们是权宜之计，不是最佳实践。

v6 的 `:where` 和原生 `@layer` 看起来正好能解决前两条，但它们和 Tailwind v3 配合时并不成立。

## 2. 为什么 v6 + v3 不开 layer

先把两个事实摆出来：

- Tailwind v3 的 `@layer base/components/utilities` 是**构建时的分桶指令**，编译后是普通 CSS；它不产出浏览器原生的 `@layer`。
- antd v6 的 `<StyleProvider layer>` 会把运行时注入的组件样式包进 `@layer antd`。

于是就会出现一个反直觉的结果：**antd 进了层，Tailwind v3 的 preflight 和 utility 还在层外。** 按级联层规则，层外的普通声明赢过所有层——preflight 对 `button` 的背景重置、对 `*` 的 `border-width: 0`，会压过 `@layer antd` 里的 `.ant-btn`。也就是说，开 layer 不是让覆盖更确定，而是让 preflight 意外地压坏 antd。

看一个最小例子：

```css
/* Tailwind v3 preflight，无层级 */
button { background: transparent; border: 0; }

/* antd v6，被 StyleProvider layer 包进层 */
@layer antd {
  .ant-btn { background: #1677ff; border: 1px solid #1677ff; }
}
```

`button` 的特异性远低于 `.ant-btn`，但它在层外，按规则仍然赢。结果就是 antd 按钮变成透明、无边框。这个结论不依赖 antd 的版本，只依赖「层外恒胜」这一条。

四种组合放在一起：

| 方案 | antd 是否进层 | TW v3 preflight | 实际结果 |
| --- | --- | --- | --- |
| 不开 layer | 否 | 层外 | 两边都无层级，按特异性/顺序 |
| 开 layer + 保留 preflight | 是 | 层外 | preflight 压 antd |
| 开 layer + 关 preflight | 是 | 无 | antd 进层，但 utility 仍在层外，你自己的层最弱 |
| TW v4 + layer | 是 | 在 base 层 | 层序确定，utilities 恒胜 antd |

如果团队一定要用 layer，最小代价方案是：关掉 preflight、把 antd 放进 `@layer antd`，并接受「utility 仍在层外」这个事实。这样至少不会出现 preflight 压 antd，但你也得不到「层序决定一切」；一旦你开始写原生 `@layer components`，它会输给层外的 utility。这个方案只适合「只想要 utility 压 antd」的单一诉求，不适合作为长期架构。

所以 v6 + v3 的最佳解不是「努力用上层」，而是**承认 TW v3 没有原生层，换一条路解决颜色一致性**。

要让层序真正为所用，你需要 Tailwind v4 那种原生层输出，或者手动把 Tailwind v3 的全部 CSS 包进层里——后者既不可维护，也改变了 preflight 的语义。

另外还有两个成本：

- **浏览器门槛**：`@layer` 需要 Chrome 99+ / Safari 15.4+ / Firefox 97+；不开则维持 antd v6 的 `:where`（Chrome 88+）和逻辑属性（Chrome 89+）这一档。
- **收益很小**：即使 antd 进了层，Tailwind v3 的 utility 仍在层外，覆盖顺序依旧不是「声明一次层序」就能解决的。

所以结论是：**v6 + v3 不开 layer，也不要写原生 `@layer`。** 覆盖回到「token 优先 + 特异性/顺序兜底」，颜色一致性用构建期 token 同步解决。

`StyleProvider` 本身仍然可以保留——用于 SSR cache、`hashPriority`；CSP nonce 配在 `ConfigProvider` 上。只是不要传 `layer`。

## 3. 方案总览

```
antd ConfigProvider theme
        │
        ▼
theme.getDesignToken(light / dark)  ← 构建期
        │
        ▼
--brand-primary / --brand-text / …（:root 与 .dark）
        │
        ▼
tailwind.config.js: colors → var(--brand-*)
```

- **antd 组件**：继续吃 `ConfigProvider theme` 的 seed / component token。
- **你自己的标记**：吃 Tailwind utility，色值来自同一批 `--brand-*`。
- **组件内部 token**：只由 antd 消费，不进入 Tailwind。

放到一段代码里看：

```tsx
<ConfigProvider theme={{ token: { colorPrimary: "#BA5B37" } }}>
  <Button type="primary">保存</Button>
  <div className="border border-line-split bg-surface text-foreground">
    卡片内容
  </div>
</ConfigProvider>
```

Button 的颜色来自 `colorPrimary`；div 的边框、底色、文字来自 `--brand-border` / `--brand-bg-container` / `--brand-text`；这两组值都由同一份 `getDesignToken` 结果生成。Button 的阴影、Table 的表头、Select 的选中项，仍然留在 `theme.components` 里，不进入 Tailwind。

Tailwind 侧有三条路可选：

| | 路一：复制色值 | 路二：构建期生成 | 路三：映射 `--ant-*` |
| --- | --- | --- | --- |
| 单一数据源 | 否，会漂移 | 是（antd theme） | 是（antd 运行时） |
| 运行时换主题 | 不支持 | 支持（改变量） | 支持（换 theme） |
| 构建成本 | 无 | 一个生成脚本 | 无 |
| 主要风险 | 值漂移 | 忘记重新生成 | 作用域类/portal |
| Tailwind v3 兼容 | 是 | 是 | 是 |
| 多主题 | 难 | 可以 | 较麻烦 |

路二在「单一数据源 + 运行时切换 + 不依赖 antd 运行时」之间取得了最好的平衡，也是本文的重点。

## 4. 路二：构建期生成

### 4.1 只同步全局 alias token

不要把所有 token 都倒进 Tailwind。维护一张 20–30 个 key 的语义色板即可：

| 类别 | antd 全局 token | Tailwind 侧建议 |
| --- | --- | --- |
| 主色 | `colorPrimary`、`colorPrimaryHover`、`colorPrimaryActive`、`colorPrimaryBg`、`colorPrimaryBorder` | `primary`、`primary-hover`… |
| 文字 | `colorText`、`colorTextSecondary`、`colorTextTertiary`、`colorTextQuaternary`、`colorTextLightSolid` | `foreground`、`foreground-secondary`… |
| 背景 | `colorBgLayout`、`colorBgContainer`、`colorBgElevated`、`colorBgSpotlight` | `surface`、`surface-layout`… |
| 边框 | `colorBorder`、`colorBorderSecondary`、`colorSplit` | `line`、`line-split` |
| 状态 | `colorSuccess` / `colorWarning` / `colorError` / `colorInfo` 及常用 hover/active/bg/border/text | `success`、`error-bg`… |
| 链接 | `colorLink`、`colorLinkHover`、`colorLinkActive` | `link`、`link-hover`… |
| 非颜色 | `borderRadius`、`borderRadiusLG`、`borderRadiusSM`、`fontFamily`、`fontFamilyCode` | `rounded-*`、`font-*` |
| **不映射** | `Button.*`、`Table.*`、`Select.*`、`Card.*`、阴影、控件高度 | 留在 `theme.components` |

为什么是 alias 层：组件和业务代码读的就是这一层，它已经包含了 seed 派生出来的 hover、浅底、边框。component token 是组件自己的局部决策，既不稳定，也不该变成全局 utility。

再展开一点选择标准：

- **不要从 seed 正着抄**。seed 只有十几个旋钮（主色、圆角、字号），而 Tailwind 需要的是已经带语义的角色：`colorText`、`colorBgContainer`、`colorSplit`。这些都在 alias 层。
- **不要从 token 列表倒着抄**。先列出你实际会在 `className` 里用到的角色——主色、主色 hover、正文、次要文字、页面底色、卡片底色、边框、分隔线、成功/警告/错误——再反查对应的 alias token。用不到的不进表。
- **命名要服务 Tailwind**。`foreground` / `surface` / `line` 比 `text` / `bg` / `border` 更不容易写出 `text-text-secondary` 这种重复前缀；同时在 MAPPING 表里保留「Tailwind key → antd token」的对应关系，方便回查。
- **状态色按需映射**。如果只用 `text-success`、`bg-error-bg`，就只导出 success/error 的 DEFAULT、bg、border；不要把所有 hover/active 都搬进来。

全量导出会带来两个问题：一是 token 数量上百，Tailwind 配置和生成物都会膨胀；二是很多 token 只在特定组件里有意义，放到全局色板会误导使用者。只导出实际用到的 20–30 个语义角色，色板才是可读的。

component token 还有一个更根本的问题：它的生命周期跟着组件实现走。Button 的阴影、Table 的表头、Select 的选中态，可能在下个版本改名或改变语义；把它们变成全局 utility，等于把组件的内部实现暴露成公共 API。组件内部要改，直接用 `theme.components`，改完只影响那个组件。

### 4.2 生成逻辑

核心只有两步：先用 `getDesignToken` 解析两套主题，再按映射表输出变量。

```ts
import { theme } from "antd";

const LIGHT = theme.getDesignToken(lightTheme);
const DARK = theme.getDesignToken(darkTheme);

// { name: "primary", token: "colorPrimary" }
function renderVars(tokens: AliasToken, mapping: Mapping[]) {
  return mapping
    .map(({ name, token }) => `--brand-${name}: ${format(tokens[token])};`)
    .join("\n");
}
```

映射表本身是一个数组，左边是 Tailwind key，右边是 antd token：

```ts
const MAPPING = [
  { name: "primary", token: "colorPrimary" },
  { name: "primary-hover", token: "colorPrimaryHover" },
  { name: "primary-active", token: "colorPrimaryActive" },
  { name: "primary-bg", token: "colorPrimaryBg" },
  { name: "text", token: "colorText" },
  { name: "text-secondary", token: "colorTextSecondary" },
  { name: "text-tertiary", token: "colorTextTertiary" },
  { name: "bg-layout", token: "colorBgLayout" },
  { name: "bg-container", token: "colorBgContainer" },
  { name: "bg-elevated", token: "colorBgElevated" },
  { name: "border", token: "colorBorder" },
  { name: "border-secondary", token: "colorBorderSecondary" },
  { name: "split", token: "colorSplit" },
  { name: "success", token: "colorSuccess" },
  { name: "error", token: "colorError" },
  { name: "radius-md", token: "borderRadius" },
  { name: "font-sans", token: "fontFamily" },
];
```

数值 token 要补单位，否则 `borderRadius` 生成出来是裸数字，Tailwind 的 `var()` 不会帮你加 `px`：

```ts
const format = (value: string | number) =>
  typeof value === "number" ? `${value}px` : value;
```

生成物是两组变量块：

```css
:root {
  --brand-primary: #BA5B37;
  --brand-text: #1F1E1B;
  --brand-bg-container: #F5F4EC;
  --brand-border: #DBD9D0;
}

.dark {
  --brand-primary: #20744A;
  --brand-text: #E8E6DF;
  --brand-bg-container: #1A1A18;
  --brand-border: #3A3A36;
}
```

两个细节：

- 数值 token（圆角、字号）要补单位，`format()` 里判断 `number` 就加 `px`。
- 生成物要提交进仓库，并加一条新鲜度测试：重新生成后和已提交文件逐字节比对。没有这条测试，迟早会忘记重新生成。

新鲜度测试不用写得很复杂：在测试里用 `execFileSync` 重新跑一次生成脚本，读回产物，和仓库里的文件比较；比较前把 CRLF 归一化，避免 Windows 换行导致假失败。这样就同时防住了「改了主题忘记生成」和「手改了生成物」两种情况。

生成物用 `--brand-*` 而不是 `--ant-*`，是为了把「你的契约」和「antd 的内部变量」分开。`--ant-*` 的名字、prefix、作用域都可能随版本变化；`--brand-*` 是你自己承诺稳定的名字。Tailwind 配置只依赖 `--brand-*`，antd 升级时只需要重新生成，不需要改 Tailwind。

也不要在 React 里用 `theme.useToken()` 把 token 写到 `:root`：那需要一次额外的渲染，SSR 首屏拿不到值，而且每次主题变化都要重写变量。构建期生成是静态的，首屏和 SSR 都更简单。

生成时机：把脚本挂到 `predev` / `prebuild`，本地开发也不会忘记；CI 里跑一次新鲜度测试，防止有人手改生成物。生成脚本只依赖 antd 和你的主题配置，不需要浏览器环境。

目录可以这样分：

```
scripts/gen-token-css.ts      # 生成脚本
src/styles/token-mapping.ts   # Tailwind key → antd token 的映射表
src/styles/brand-vars.css     # 生成物，提交进仓库
tests/token-css.test.ts       # 新鲜度测试
```

映射表是数据，生成脚本是逻辑，生成物是产物，测试是保险。四者分开，改主题时只需要改映射表和主题配置，不需要碰 Tailwind 的具体键值。

### 4.3 Tailwind 配置

Tailwind v3 会把 `var(--brand-*)` 原样写进 utility，不需要 v4 的 `@theme inline`。也不要用 `theme()` 函数去读 antd 的值：`theme()` 只能读 Tailwind 自己的主题，读不到运行时变量，而且在 v4 里已经被标记为废弃。

```js
// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--brand-primary)",
          hover: "var(--brand-primary-hover)",
          active: "var(--brand-primary-active)",
          bg: "var(--brand-primary-bg)",
          border: "var(--brand-primary-border)",
        },
        foreground: {
          DEFAULT: "var(--brand-text)",
          secondary: "var(--brand-text-secondary)",
          tertiary: "var(--brand-text-tertiary)",
        },
        surface: {
          layout: "var(--brand-bg-layout)",
          DEFAULT: "var(--brand-bg-container)",
          elevated: "var(--brand-bg-elevated)",
        },
        line: {
          DEFAULT: "var(--brand-border)",
          split: "var(--brand-split)",
        },
      },
      borderRadius: {
        md: "var(--brand-radius-md)",
      },
    },
  },
};
```

除了颜色，圆角、字体、线宽也可以用同样的方式映射：

```js
fontFamily: {
  sans: "var(--brand-font-sans)",
  mono: "var(--brand-font-mono)",
},
borderRadius: {
  sm: "var(--brand-radius-sm)",
  md: "var(--brand-radius-md)",
  lg: "var(--brand-radius-lg)",
},
borderWidth: {
  DEFAULT: "var(--brand-line-width)",
},
```

`borderWidth.DEFAULT` 会改变 `border` 这个类的宽度；antd 的 `lineWidth` 通常是 1px，映射它可以让分隔线和 Tailwind 的边框保持一致。

`content` 仍然要配全，Tailwind v3 的 JIT 只会为扫描到的类名生成 CSS；`darkMode: "class"` 也要保留，因为非颜色的 `dark:` 变体还依赖它。

**不要用 `important: "#app"` 作为默认。** 它是 v4 时代的补丁，会把所有 utility 提到 ID 级特异性；在这个方案里颜色已经由 token 统一，不需要用 ID 去硬压 antd，用了反而让后续局部覆盖更痛苦。

如果以后升级到 Tailwind v4，这份 `--brand-*` 可以原样复用：把 `colors.primary = "var(--brand-primary)"` 换成 `@theme inline { --color-primary: var(--brand-primary) }`。`inline` 解决的是和 v3 一样的解析时机问题，迁移成本很低。

类名会更自然：`bg-primary`、`text-foreground-secondary`、`bg-surface`、`border-line-split`。不要照搬 antd 的 `colorText`，否则会写出 `text-text-secondary` 这种重复前缀。

### 4.4 暗色与运行时切换

生成 `:root` 和 `.dark` 两组变量后，切主题只需要在根节点上切类：

```ts
document.documentElement.classList.toggle("dark", mode === "dark");
```

配合同一个状态切换 antd 的 theme：

```tsx
<ConfigProvider theme={mode === "dark" ? darkTheme : lightTheme}>
```

把两件事放进同一个状态，才不会出现「Tailwind 已经是暗色、antd 还是亮色」的割裂：

```tsx
const [mode, setMode] = useState<"light" | "dark">("light");

useEffect(() => {
  document.documentElement.classList.toggle("dark", mode === "dark");
}, [mode]);

<ConfigProvider theme={mode === "dark" ? darkTheme : lightTheme}>
  <App onToggle={() => setMode((m) => (m === "dark" ? "light" : "dark"))} />
</ConfigProvider>;
```

如果希望跟随系统，再生成一份 `@media (prefers-color-scheme: dark)` 的变量块，并用 `matchMedia` 决定 antd 的 theme；或者只保留 `.dark` 类策略、由应用显式控制，避免两套策略互相打架。

生成物怎么引入：在 `main.tsx` 里 `import "./brand-vars.css"`。变量是定义，不参与规则胜负，放在 Tailwind CSS 之前或之后都可以；放在之前更符合阅读顺序。SSR 时把同一份 CSS 内联进 `<head>`，首屏就有值。

暗色策略可以归纳成三种：

1. **只 `.dark` 类**：应用显式控制，推荐。
2. **只 `prefers-color-scheme`**：跟随系统，但 antd 还要用 `matchMedia` 同步 theme。
3. **两者都生成**：`.dark` 写在 media 之后，同时命中时类胜出；antd 的 theme 仍要跟着 mode 切换。

生成物是纯 CSS，运行时没有额外计算；把变量控制在 30 个以内，体积可以忽略。Tailwind 的 utility 仍然按需生成，不会因为多了这些变量而膨胀。

- Tailwind 的颜色 utility 会跟着变量走，**不需要重新编译**。
- `dark:` 变体仍然需要 `darkMode: "class"`，但它只用于非颜色差异（阴影、间距、显隐）。
- 如果希望跟随系统，再生成一份 `@media (prefers-color-scheme: dark)` 的变量块；`.dark` 写在 media 之后，同时命中时类策略胜出。
- 变量作用域放在 `<html>` 或 `<body>` 上，portal、静态片段、独立 React root 都能继承。不要把变量收窄到某个局部 div，否则作用域外的内容会丢变量。

### 4.5 透明度修饰符

Tailwind v3 的 `bg-primary/50` 对 `var()` 色值支持有限。需要透明度时，生成 RGB 通道而不是 hex：

```css
:root {
  --brand-primary-rgb: 186 91 55;
}
```

```js
colors: {
  primary: "rgb(var(--brand-primary-rgb) / <alpha-value>)",
}
```

不需要透明度就跳过这一步，保持变量是 hex 更直观。如果某些色值不是 sRGB（比如用了 `oklch`），需要先转成 RGB 通道；antd 的 token 通常是 hex 或 rgba，转起来不麻烦。

## 5. 不开 layer 时的覆盖策略

优先级从高到低：

1. **antd 的 token**：颜色、圆角、字号、组件局部值，优先用 `ConfigProvider theme` 改，不要用 CSS 去打。
2. **v6 的语义 `classNames` / `styles`**：需要动组件内部节点时，先用组件暴露的入口。
3. **根节点上的 utility**：`<Button className="rounded-full">` 这类，简单属性通常能生效。
4. **更具体的选择器**：`.app .ant-btn-primary:hover`、`.ant-btn.ant-btn-primary`。
5. **`!important`**：最后手段。

按场景选手段：

| 你要改什么 | 首选 | 次选 | 避免 |
| --- | --- | --- | --- |
| 主色 / 文字 / 边框 / 状态色 | `theme.token` | — | 用 CSS 覆盖 |
| 某个组件的局部值 | `theme.components` | 语义 `classNames` | 深层 `.ant-*` |
| 某个实例的圆角 / 间距 | `className` utility | `style` prop | `!important` |
| 组件内部节点 | `classNames` / `styles` | 更具体的选择器 | 全局覆盖 |
| 暗色差异 | 变量 + `.dark` | `dark:` 变体 | 两套硬编码色值 |

最后手段长这样，能不用就不用：

```css
.app .ant-btn-primary:hover {
  background: var(--brand-primary-hover);
}
```

几个具体注意：

- 保持 `hashPriority` 默认的 `low`。antd 用 `:where()` 把根选择器压到 `.ant-btn` 这一档，utility 才有机会赢；改成 `high` 会给 antd 加上 `.css-hash` 的额外特异性，覆盖更难。
- **不要写原生 `@layer`**。你的 CSS 进了层，而 antd 和 Tailwind v3 都在层外，层外的普通样式恒胜，你的层反而最弱。
- **reset 二选一**：保留 Tailwind preflight，就不要引 `antd/dist/reset.css`；如果引 antd reset，就 `corePlugins: { preflight: false }`，并让 antd reset 先加载。两份全局 reset 叠在一起只会让顺序更难推理。
- 组件内部状态（hover、disabled、选中）选择器更强，utility 往往打不过；这是预期行为，不是 bug。

CSS Modules 和 styled-components 也常被拿来救场，但它们仍然是普通 CSS 或运行时 CSS，没有层序：它们能帮你做作用域，不解决 antd 的优先级问题。用它们覆盖 antd，还是要面对 specificity 和加载顺序。

### 5.1 从 v4 + v3 迁移的顺序

1. **先升 antd v6**：把 Less 变量逐项换成 `theme.token` / `theme.components`。这一步先不动 Tailwind，让组件本身跑通。
2. **建 token 映射表**：只列全局 alias token，不列 component token；从实际用到的语义角色反查。
3. **写生成脚本**：`getDesignToken(light/dark)` → `--brand-*`；提交产物，加新鲜度测试。
4. **改 Tailwind 配置**：`colors` / `borderRadius` / `fontFamily` 指向 `var(--brand-*)`，删掉手抄的 hex。
5. **改暗色**：用 `.dark` 驱动变量，同时切换 `ConfigProvider` 的 theme；删掉两套硬编码色值。
6. **清理覆盖**：删掉能由 token 解决的 CSS 和 `!important`；剩下的按 §5 的优先级处理。

顺序不要反过来。先改 Tailwind 再升 antd，会在两套主题系统并存时反复对照色值，很难定位问题。

### 5.2 三个典型覆盖场景

**改卡片边框颜色。** 先用 `theme.token.colorBorderSecondary`，不要写 `.ant-card { border-color: ... }`；如果只想改某一张卡片，再用 `className="border-line-split"`。

**改按钮圆角。** 全局改就写 `theme.token.borderRadius`；只改 Button 就写 `theme.components.Button.borderRadius`；只改某一个按钮才用 `className="rounded-full"`。从全局到局部，优先级和影响范围都递减。

**改 Table 表头背景。** 这是 component token：`theme.components.Table.headerBg`。不要用 `.ant-table-thead > tr > th` 这种深层选择器，antd 一改 DOM 结构就失效。

**改页面底色。** 用 `theme.token.colorBgLayout`，不要写 `body { background: ... }`；你自己的区块用 `bg-surface-layout`，两者读同一个值。

## 6. 边界与注意事项

- **浏览器**：不开 layer 后，下限由 antd v6 的 `:where`（Chrome 88+）、逻辑属性（Chrome 89+）和 React ≥ 18 决定；Tailwind v3 官方面向 latest stable，不支持 IE。这条组合比 v4 + v6 的 Chrome 111 / Safari 16.4 / Firefox 128 低，但仍不支持 IE。`hashPriority="high"` 不会改变浏览器门槛，只改变选择器特异性。
- **SSR**：`--brand-*` 是静态 CSS，可以直接内联进 HTML；antd v6 的组件样式仍然是在服务端渲染时由 cssinjs 生成的，需要 `createCache` + `extractStyle` 抽出来，或者开 `zeroRuntime`。不要以为颜色变量静态了，antd 的样式也静态了——这是两件事。
- **zeroRuntime**：把 `antd/dist/antd.css` 作为普通样式在 Tailwind 之前引入，不要 `layer(antd)`；组件规则是静态的，但 token 变量仍可能由运行时补充，上线前要在真实页面里验证暗色和自定义主色。
- **多主题**：变量放在 `<html>` / `<body>` 的 `[data-theme]` 上最稳；如果把变量收窄到某个子树，自定义 portal、静态片段、独立 root 会丢变量。antd 自己的弹层会带 cssVar 类，通常不受影响。多主题还要注意：Tailwind 的 `content` 扫描不会因为主题变化而重跑，变量切换不影响 utility 的生成。
- **component token**：不要映射进 Tailwind。需要改 `Button.primaryShadow` 就去 `theme.components.Button`；Tailwind 色板里出现组件级名字，说明边界已经破了。
- **版本耦合**：生成脚本依赖 `getDesignToken` 和 token 名；antd 升级后先跑生成和新鲜度测试，确认映射表没有失效。
- **algorithm 变化**：如果你只生成 light/dark 两套变量，却在前端用 `compactAlgorithm` 或自定义 algorithm，Tailwind 侧不会跟着变。要么为每个 algorithm 生成一套变量并用 `[data-density]` 切换，要么明确不支持。

三种组合的浏览器门槛放在一起：

| 组合 | 大致下限 | 是否依赖原生 `@layer` |
| --- | --- | --- |
| antd v6 + TW v3（本文） | `:where` Chrome 88+、逻辑属性 Chrome 89+、React ≥ 18 | 否 |
| antd v6 + TW v4 | Chrome 111 / Safari 16.4 / Firefox 128 | 是（TW v4 自带） |
| antd v4 + TW v3 | 更低，但 TW v3 官方只面向 latest stable，不支持 IE | 否 |

这套方案只保证**全局语义 token 一致**：它不会让 antd 组件内部的每一种颜色都变成 utility，也不承诺像素级一致。组件内部仍然是 antd 的算法说了算，Tailwind 只负责你自己写的标记。

多主题的最小写法：

```css
[data-theme="light"] { --brand-primary: #BA5B37; }
[data-theme="dark"] { --brand-primary: #20744A; }
```

```tsx
<html data-theme={mode}>
```

变量放在 `html` / `body` 上，portal、静态片段、独立 root 都能继承；放在某个子树里，作用域外的内容会丢。

### 6.1 常见问题

**生成期变量和直接映射 `--ant-*` 的区别是什么？** 前者是你的构建产物，名字和作用域由你控制，不依赖 antd 运行时；后者是 antd 的运行时投影，省构建步骤，但要管理 `cssVar.key` 和作用域。本文选前者，是因为它更稳定，也更容易做多主题。

**改了 antd 主题，Tailwind 没变？** 依次查三件事：生成脚本有没有重新跑；生成出来的 CSS 有没有被正确引入；变量作用域有没有覆盖到使用 utility 的元素。按这个顺序排查，基本不会漏。

**组件内部颜色怎么改？** 用 `theme.components.<Component>`，不要塞进 Tailwind，也不要用深层 `.ant-*` 选择器。Tailwind 只负责全局语义色板。

**`bg-primary/50` 不生效？** Tailwind v3 的透明度修饰符不支持任意 `var()` 色值。需要透明度就生成 RGB 通道变量，并在配置里写 `rgb(var(--brand-primary-rgb) / <alpha-value>)`。

**能和 `zeroRuntime` 一起用吗？** 可以。`zeroRuntime` 解决的是 antd 组件样式什么时候生成；`--brand-*` 仍然由构建期生成，两者是不同维度。把 `antd/dist/antd.css` 作为普通样式在 Tailwind 之前引入，不要加 `layer(antd)`。

**要不要用 `important: true`？** 不要。它是 v4 时代的补丁，会让所有 utility 带 `!important`，后续再想局部覆盖会非常痛苦。这个方案里颜色已经由 token 统一，不需要用 `!important` 硬压。

**为什么生成物要提交进仓库，而不是构建时临时生成？** 部署环境可能不安装 devDependencies，或者 antd 版本和本地不一致；临时生成会得到不同结果。提交产物 + 新鲜度测试能保证线上和本地看到的是同一份 CSS。

几个最常见的错误：

- 同时维护 `--ant-*` 和 `--brand-*` 两套变量，最后不知道哪个是准的。
- 生成物提交了，但入口没 import，Tailwind 全是无效值。
- `.dark` 类和 `ConfigProvider` 的 theme 分成两个开关，界面一半暗一半亮。
- 把 `Button.primaryShadow` 这种 component token 放进 Tailwind 色板。
- 用 `!important` 解决本应由 token 解决的颜色问题。

## 7. 检查清单

- [ ] 没有 `<StyleProvider layer>`，没有原生 `@layer` 声明；
- [ ] Tailwind 色板只映射全局 alias token，没有 `Button.*` / `Table.*`；
- [ ] `--brand-*` 由 `getDesignToken` 生成，产物已提交；
- [ ] 有一条「重新生成后逐字节比对」的新鲜度测试；
- [ ] `:root` 和 `.dark` 两组变量齐全，作用域在 `<html>` / `<body>`；
- [ ] `.dark` 类与 `ConfigProvider` 的 theme 在同一个状态里切换；
- [ ] reset 只保留一套（preflight 或 antd reset）；
- [ ] 需要透明度的地方使用 RGB 通道变量；
- [ ] SSR 已抽取 antd 样式，或启用了 `zeroRuntime`；
- [ ] 覆盖仍按「token → classNames/styles → utility → 具体选择器 → `!important`」的顺序处理。

## 8. 一句话

**v6 + v3 不开 layer，不是退步，而是承认 Tailwind v3 没有原生层这个事实；把颜色一致性交给构建期生成的 alias 变量，把覆盖交给 token 和有限的 specificity，反而比硬套 v4 的层序更可维护。**

如果哪天升级到 Tailwind v4，再考虑把 antd 放进 `@layer antd`：那时 utility 才真的能参与层序，`StyleProvider layer` 才有意义。在 v3 里，最值钱的不是层，而是那份构建期生成的语义色板。
