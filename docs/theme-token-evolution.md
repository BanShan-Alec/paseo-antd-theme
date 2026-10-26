# 主题 token 的两代模型：从 Tailwind v3 + antd v4 到 Tailwind v4 + antd v6

> 本文回答两个问题：**antd 的主题 token 怎么覆盖**，**Tailwind 的 utility 怎么覆盖和新增**；以及为什么同一件事在两个时代做法完全不同。
>
> 组合配置的操作步骤与排错清单见 [antd v6 + Tailwind v4 组合最佳实践](./antd-v6-tailwind-v4.md)，本文只讲机制。

## 0. 一句话结论

**v3 + antd v4 时代，主题是构建期常量，覆盖 = 改 Less 变量 + 拼选择器特异性。**
**v4 + antd v6 时代，主题是运行时数据，覆盖 = 喂 token + 排级联层顺序。**

| 维度 | Tailwind v3 + antd v4 | Tailwind v4 + antd v6 |
| --- | --- | --- |
| 主题值存在哪 | Less 变量，编译进静态 CSS | JS token，运行时派生并物化为 CSS 变量 |
| 覆盖入口 | `modifyVars`、组件 Less 变量 | `ConfigProvider theme` 的 `algorithm` / `token` / `components` |
| 运行时换主题 | 重新编译（后期只有实验性 CSS 变量模式） | 换 `theme` 对象；组件样式自动改读新变量 |
| utility 定义在哪 | `tailwind.config.js` | 入口 CSS 的 `@theme` |
| 新增 utility | `theme.extend` / `plugin(addUtilities)` | `@theme` / `@utility` |
| 冲突裁决 | 特异性 + 样式加载顺序 | 浏览器原生 `@layer` 顺序 |
| 重置样式 | 通常关闭 preflight，沿用 antd reset | 用 preflight，不引 antd reset |

这条分界线的本质是**样式的产物形态**：v3 + antd v4 的 CSS 是构建期产物，主题一变就得重新编译；v4 + antd v6 的样式是运行时产物（cssinjs 按需注入，Tailwind 工具类按需生成但只引用变量），主题可以在不重新构建的情况下切换。后面所有差异，都是这一点的推论。

---

## 1. 两代栈的心智模型

### 1.1 antd v4：Less 变量是唯一的主题入口

antd v4 的主题由 Less 变量定义。`default.less` 里有几百个 `@primary-color`、`@border-radius-base`、`@btn-primary-bg` 这样的变量，变量之间的派生（`darken()`、`fade()`）也由 Less 函数在**编译期**算完。

覆盖方式是在构建工具里替换变量：

```js
// webpack.config.js
{
  loader: "less-loader",
  options: {
    lessOptions: {
      javascriptEnabled: true,
      modifyVars: {
        "primary-color": "#BA5B37",
        "border-radius-base": "8px",
      },
    },
  },
}
```

覆盖粒度实际只有三级，而且前两级都要重新编译：

1. **全局 Less 变量**（`@primary-color`）——影响所有引用它的派生变量；
2. **组件 Less 变量**（`@btn-primary-bg`）——绕过派生，直接钉某个组件；
3. **运行时 CSS 覆盖**——写普通 CSS 压过 `.ant-*`，胜负由选择器和加载顺序决定，必要时上 `!important`。

v4 的 `ConfigProvider` 管的是 `prefixCls`、`direction`、`componentSize` 这类上下文，**没有 `theme` 属性**。动态换主题的主流方案是分别编译 `antd.dark.less` / `antd.compact.less`，官方注明不能同时配置两种以上主题；后期版本提供过实验性的 CSS 变量模式（`ConfigProvider.config` + `antd.variable.css`），只覆盖少数色彩变量，始终不是默认路径。

同一时期的 Tailwind v3 是镜像结构：`tailwind.config.js` 里 `theme` 替换、`theme.extend` 追加，utility 的值在构建期展开成字面量。想在运行时换色，只能自己写 `colors: { primary: "var(--primary)" }`，再在 `:root` / `.dark` 手写变量——这正是 v4 现在内建的做法，只是当年要手工搭。与 antd v4 共存时，v3 的 preflight 和 antd 的全局 reset 会互相打架，常规解法是关掉 preflight，再靠加载顺序让 utilities 排在 antd CSS 之后。

### 1.2 antd v6：四级 token，在运行时算出来

antd v6 把主题拆成四层，理解这条链路是理解一切覆盖方式的前提：

```
seed（设计师变量） → map（派生色板） → alias（语义变量） → component（组件变量）
```

四层各自的职责和可覆盖性：

| 层级 | 它是什么 | 典型 token | 你能怎么改 |
| --- | --- | --- | --- |
| seed | 设计意图的最小集合：主色、圆角、字号 | `colorPrimary`、`borderRadius`、`fontSize` | `theme.token`，作为算法输入 |
| map | 由 seed 经算法派生的色板与尺度 | `colorPrimaryHover`、`colorPrimaryBg`、`colorPrimaryBorder` | 不直接写；改 seed 或包 `algorithm` |
| alias | 面向使用场景的语义变量，组件和业务代码都读它 | `colorText`、`colorBgContainer`、`colorBorder`、`colorSplit` | v6 会从受控 token 重算，直接写会被丢弃 |
| component | 单个组件的局部变量 | `Button.primaryColor`、`Table.headerBg` | `theme.components.<Component>` |

以主色为例：`colorPrimary`（seed）派生出 `colorPrimaryHover` / `colorPrimaryActive` / `colorPrimaryBg`（map 与 alias），Button 再从中取自己的 `primaryColor` 等 component token。你在 `ConfigProvider` 里能干预的就是这条链的三个位置：

```tsx
<ConfigProvider
  theme={{
    algorithm: theme.darkAlgorithm,          // 派生函数：决定 seed 怎么变成 map/alias
    token: { colorPrimary: "#20744A" },     // seed 覆盖：喂给算法的输入
    components: { Button: { primaryShadow: "none" } }, // component token
  }}
>
```

与 v4 最本质的差别是：**派生发生在运行时**。`theme.getDesignToken(themeConfig)` 就是这条派生链的纯函数入口，不依赖 React——这也是后面「构建期预计算 Tailwind 变量」能够成立的基础。

v6 有两个行为会直接影响覆盖：

- 合成 alias 之前，antd 会从用户的 `token` 覆盖里**剔除 seed token**，seed 只作为算法输入。所以想钉死某个派生值，不能靠再写一遍同名 token，而要包一层 `algorithm`（本仓库的暗色主题就是这么做的，见 `src/themes/paseo-dark/theme.ts:17`）。
- 组件样式由 cssinjs 在运行时注入，且 token 默认被物化为 CSS 变量（`--ant-color-primary` 之类）。这些变量挂在**组件根节点的作用域类**上（key 默认由 React `useId` 生成），不是全局 `:root`。`theme.cssVar` 只剩下 `{ prefix, key }` 用于改前缀和 key，不再是一个开关。

cssinjs 注入的样式默认**没有层级**。这决定了 v6 与 Tailwind 的共存方式：要么让 antd 进层，要么 antd 永远压过 Tailwind。

### 1.3 Tailwind v4：CSS 里的主题，加上原生级联层

v3 到 v4 的变化可以概括成三句话：配置从 JS 对象搬到 CSS at-rule；utility 的值从字面量变成 CSS 变量引用；`@layer` 从 Tailwind 自己的分桶指令变成浏览器真正的级联层。

`@theme` 里的变量按命名空间自动生成 utility：

| 命名空间 | 生成的 utility |
| --- | --- |
| `--color-*` | `bg-*`、`text-*`、`border-*`、`fill-*`、`ring-*` |
| `--font-*` | `font-*` |
| `--radius-*` | `rounded-*` |
| `--spacing` | `p-*`、`m-*`、`gap-*`、`w-*` |

自定义 utility 用 `@utility`，它和内置 utility 一样能接变体：

```css
@utility tab-4 {
  tab-size: 4;
}
```

所以「新增 / 覆盖 utility」在 v4 里有三个入口，按从粗到细排列：

1. **`@theme`**：按命名空间批量增删。写一个默认主题没有的名字是新增（`--color-brand` → `bg-brand`），写一个已有的名字是覆盖（`--breakpoint-sm`），`--color-*: initial` 清空整个色板。
2. **`@utility`**：新增一个具名工具类，能自动接 `hover:`、`md:`、`dark:` 等变体，等价于 v3 的 `plugin(addUtilities)`。
3. **`utilities` 层里的普通 CSS**：一次性规则，优先级与内置 utility 同级，按生成顺序裁决。

注意 utility 之间打架时，**class 属性里的书写顺序不决定胜负**。`px-2 px-4` 谁赢取决于生成后的 CSS 顺序，两个时代都一样。需要确定顺序的规则，要么拆成语义类放进 `components` 层，要么用 `@utility` 起一个明确的名字。

#### `@theme` 与 `@theme inline` 的区别，是暗色能不能工作的分水岭

普通 `@theme` 的 utility 会引用主题变量本身：

```css
@theme {
  --color-primary: var(--paseo-primary);
}
/* .bg-primary { background-color: var(--color-primary); } */
```

问题在于 `--color-primary` 的值在**它被定义的地方**（`:root`）就解析完了。你在更深层的 `.dark` 里改 `--paseo-primary`，已经定值的 `--color-primary` 看不到这个变化。

`@theme inline` 让 utility 直接内联变量的值：

```css
@theme inline {
  --color-primary: var(--paseo-primary);
}
/* .bg-primary { background-color: var(--paseo-primary); } */
```

现在解析发生在使用点，`.dark` 里的变量覆盖立刻生效。**没有 inline，暗色切换就必须重新编译 Tailwind。**

v4 生成的样式自带原生层顺序：`theme`（主题变量）、`base`（preflight）、`components`、`utilities`。这为「和 antd 讲和」提供了 v3 时代不存在的工具。

### 1.4 暗色在两代栈里分别怎么实现

| | Tailwind v3 + antd v4 | Tailwind v4 + antd v6 |
| --- | --- | --- |
| antd 组件 | 引入另一套 `antd.dark.less`，整套样式换掉 | 换 `algorithm: theme.darkAlgorithm`，token 重新派生 |
| Tailwind utility | 单独构建一套暗色样式，或手写 `.dark` 变量 | 变量在 `:root` / `.dark` / media 间切换，utility 不重编译 |
| 切换成本 | 换样式表，通常伴随重新编译 | 换 Provider 的 theme，或给根节点加 `.dark` |
| 多主题共存 | 困难，官方不支持同时配置两种以上主题 | 可以，多套变量或多个 Provider 并存 |

这解释了为什么本仓库的 Tailwind 产物要同时写 `@media (prefers-color-scheme: dark)` 和 `.dark`：前者跟随系统，后者允许应用显式控制，两层同时命中时类选择器胜出。

---

## 2. 覆盖与扩展的对照表

| 你要做的事 | Tailwind v3 + antd v4 | Tailwind v4 + antd v6 |
| --- | --- | --- |
| 改主色 | `modifyVars` 改 `primary-color` | `theme.token.colorPrimary`；派生值要钉死则包 `algorithm` |
| 改某个组件 | 覆盖组件 Less 变量（`@btn-primary-bg`） | `theme.components.Button.*` |
| 改单个实例 | `className` + 自定义 CSS，常需提高特异性或 `!important` | `className` 上的 utility，`utilities` 层恒胜 `antd` 层 |
| 新增语义色 | `theme.extend.colors.surface` | `@theme { --color-surface: … }` |
| 新增复合 utility | `plugin(addUtilities)` | `@utility name { … }` |
| 新增变体 | `plugin(addVariant)` | `@custom-variant` |
| 暗色 | 单独编译 `antd.dark.less`，或手写 CSS 变量 | 切换 `theme` 对象，或预生成变量 + `dark:` 变体 |
| 定义冲突怎么裁决 | 加载顺序 + 选择器特异性 | `@layer theme, base, antd, components, utilities` |
| 重置样式 | 关 preflight，用 antd 的全局 reset | 开 preflight，不引 antd reset |

**新增**和**覆盖**在 v4 里是同一个动作：在 `@theme` 里写一个默认主题没有的名字就是新增，写一个已有的名字就是覆盖；`--color-*: initial` 清空整个命名空间。v3 则要区分 `theme`（替换）和 `theme.extend`（追加）。

具体到「谁压谁」，可以拆成四种冲突：

| 冲突双方 | v3 + antd v4 | v4 + antd v6 |
| --- | --- | --- |
| utility vs antd 组件样式 | 同特异性看加载顺序；组件内部状态选择器常要 `!important` | `utilities` 层排在 `antd` 层之后，utility 直接赢 |
| utility vs utility | 看生成后的 CSS 顺序，class 书写顺序无效 | 同上；层内顺序由生成器决定 |
| 自定义 CSS vs utility | 看选择器与加载顺序 | 放进 `components` 层能覆盖 antd，但输给 utilities；要赢 utilities 得放更后的层或无层级 |
| antd 组件之间 | 改 Less 变量，或提高特异性压 `.ant-*` | 改 component token；同层内按 cssinjs 注入顺序 |

### 2.1 名字怎么对应

antd 侧（v4 Less 变量 → v6 token）：

| v4 Less 变量 | v6 token | 层级 |
| --- | --- | --- |
| `@primary-color` | `colorPrimary` | seed |
| `@success-color` / `@error-color` | `colorSuccess` / `colorError` | seed |
| `@border-radius-base` | `borderRadius` | seed |
| `@text-color` | `colorText` | alias |
| `@text-color-secondary` | `colorTextSecondary` | alias |
| `@border-color-base` | `colorBorder` | alias |
| `@border-color-split` | `colorSplit` | alias |
| `@component-background` | `colorBgContainer` | alias |
| `@btn-primary-bg` | 全局 `colorPrimary` 派生的 Button 样式 | component 结果 |

Tailwind 侧（v3 配置 → v4 at-rule）：

| v3 `tailwind.config.js` | v4 CSS |
| --- | --- |
| `theme.extend.colors.primary` | `@theme { --color-primary: … }` |
| `theme.colors = {…}`（整体替换） | `@theme { --color-*: initial; … }` |
| `theme.extend.fontFamily.sans` | `@theme { --font-sans: … }` |
| `theme.extend.borderRadius.md` | `@theme { --radius-md: … }` |
| `plugins: [addUtilities({…})]` | `@utility name { … }` |
| `plugins: [addVariant("hocus", …)]` | `@custom-variant hocus (&:hover, &:focus)` |
| `darkMode: "class"` | `@custom-variant dark (&:where(.dark, .dark *))` |
| `content: [...]` | 自动扫描；非源码位置用 `@source` 补充 |

---

## 3. 桥接：一条 token 管线，两条出口

真正的新问题不是「怎么覆盖」，而是**同一套色值怎么同时供给 antd 组件和 Tailwind utility**。antd 的 token 是 JS 对象，Tailwind 的 utility 只认 CSS 变量，中间必须有人做翻译。有两种接法。

### 3.1 方案 A：运行时直接映射 antd 变量

v6 默认把 token 物化成 `--ant-*`，所以可以让 Tailwind 的命名空间直接指向它们：

```css
@theme inline {
  --color-primary: var(--ant-color-primary);
  --color-text: var(--ant-color-text);
}
```

注意必须用 `inline`，理由同上一节：`--ant-*` 定义在 antd 的作用域里，普通 `@theme` 会在 `:root` 提前解析，拿不到。

还有第二个前提：这些变量只存在于 antd 组件根节点的作用域类里（默认 key 由 `useId` 生成），你自己的 `<div>` 默认读不到。要让 utility 在整页生效，得把 key 固定下来并手动加到应用根节点：

```tsx
<ConfigProvider theme={{ cssVar: { key: "app-theme" } }}>
  <div className="app-theme">…</div>
</ConfigProvider>
```

优点是作用域覆盖到页面后，antd 换主题 utility 会自动跟着换。代价是消费端必须运行 antd，变量名绑定 antd 的版本与 prefix，作用域类需要手动维护，而且只有 antd 认识的 token 能被导出。

### 3.2 方案 B：构建期预计算成本地变量（本仓库的做法）

`getDesignToken` 在构建期分别解析两套主题，把结果写成普通的 `--paseo-*` 变量，再用 `@theme inline` 映射到 Tailwind 命名空间：

```css
/* 生成产物 src/tailwind/theme.css 的结构 */
@theme inline {
  --color-primary: var(--paseo-primary);
}

:root, :host {
  --paseo-primary: #BA5B37;      /* 浅色 */
}

@media (prefers-color-scheme: dark) {
  :root, :host { --paseo-primary: #20744A; }
}

.dark {
  --paseo-primary: #20744A;      /* 类策略，写在 media 之后，同时命中时胜出 */
}
```

于是 `.bg-primary` 编译出来是 `background-color: var(--paseo-primary)`。换主题只是换这批变量，Tailwind 不需要重新编译；只消费这套样式表的项目也完全不需要安装 antd。

这条管线的三个关键点在仓库里都能看到：`src/tailwind/build.ts:163` 构建期调用 `getDesignToken`，`src/tailwind/build.ts:206` 生成 `@theme inline`，变量分三层落在 `src/tailwind/theme.css:137`（`:root`）、`:260`（media）与 `:385`（`.dark`）。

代价是主题改动后必须重新生成（`npm run gen:tailwind`），所以仓库用新鲜度测试兜底。

两种接法的取舍：

| | 方案 A：运行时映射 | 方案 B：构建期预计算 |
| --- | --- | --- |
| 消费端依赖 | 需要 antd 运行时 | 不需要 antd |
| 换主题时 | 自动跟随 | 重新生成样式表 |
| 变量名 | 随 antd 版本与 prefix 变化 | 本包承诺的 `--paseo-*` |
| 可审计性 | 运行时才知道最终值 | 静态 CSS，可 diff、可审查 |
| 适用场景 | 单一 antd 应用，想少一层构建 | 设计系统、多主题、非 antd 消费方 |

两者不互斥：用 B 作为 Tailwind 的唯一出口，运行时需要 token 的地方继续用 `theme.useToken()`，只要保证同一个语义色只有一个来源。最怕的是 A 和 B 各导一套同义变量，最后谁也说不清哪个是准的。

### 3.3 层顺序：让 utilities 和 antd 各归其位

变量解决「值从哪来」，层解决「谁压谁」。消费端需要两处配合：

```css
@layer theme, base, antd, components, utilities;
@import "tailwindcss";
```

```tsx
// main.tsx —— StyleProvider 从 @ant-design/cssinjs 引入
<StyleProvider layer>
  <ConfigProvider theme={…}>
```

配好后，antd 注入的组件样式进入 `antd` 层，Tailwind 的 utility 在 `utilities` 层，`className` 直接覆盖组件样式，不需要 `!important`。这也补上了 v3 时代最难受的一环：不用再猜「这个覆盖到底赢在特异性还是赢在加载顺序」。

两条层规则值得单独记住：层声明必须出现在所有 `@import` 之前；层的顺序一经声明就是永久的权重顺序，后声明的层恒胜；而**不在任何层里的样式永远赢过所有层**。所以 antd 必须主动进层（`<StyleProvider layer>`），否则它的运行时注入样式会压过 utilities。

分工原则只有一句：**antd 组件吃 token，你自己写的标记吃 utility，两边读同一批变量。** 完整的层序论证与清单见 [组合最佳实践](./antd-v6-tailwind-v4.md)。

---

## 4. 两份完整配置

### 4.1 Tailwind v3 + antd v4

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  corePlugins: { preflight: false }, // 让位给 antd 的全局 reset
  theme: {
    extend: {
      colors: {
        primary: "#BA5B37",
        "primary-hover": "#943F25",
      },
      borderRadius: { md: "12px" },
    },
  },
};
```

```js
// webpack.config.js：Less 变量覆盖
{
  loader: "less-loader",
  options: {
    lessOptions: {
      javascriptEnabled: true,
      modifyVars: { "primary-color": "#BA5B37" },
    },
  },
}
```

```tsx
// main.tsx：样式顺序决定覆盖关系
import "antd/dist/antd.less"; // 由 less-loader 编译，modifyVars 在这里生效
import "./tailwind.css";      // 后加载，utilities 才能压住 .ant-*
```

覆盖组件内部状态时，v3 的 utility 与 antd 选择器往往特异性相同，谁后加载谁赢；遇到 `.ant-btn-primary:hover` 这类组合选择器，要么提高特异性，要么 `!important`。

### 4.2 Tailwind v4 + antd v6

```css
/* main.css */
@layer theme, base, antd, components, utilities;

@import "tailwindcss";
@import "paseo-antd-themes/tailwind.css"; /* 可选：复用预生成的 --paseo-* 管线 */

/* 新增自己的主题值 */
@theme {
  --color-brand: #BA5B37;
}
```

```tsx
// main.tsx
import { ConfigProvider } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";
import { paseoDarkTheme } from "paseo-antd-themes";

<StyleProvider layer>
  <ConfigProvider theme={paseoDarkTheme}>
    <App />
  </ConfigProvider>
</StyleProvider>;
```

```tsx
// 覆盖不需要 !important，utilities 层恒胜 antd 层
<Button className="rounded-full bg-primary hover:bg-primary-hover">保存</Button>
```

### 4.3 把一次 token 覆盖走一遍

目标：把主色从 antd 默认蓝换成陶土色，并让 Button、Link、Switch、focus ring 一起变。

v4 时代改 Less 变量后重新编译。派生色（hover、active、浅底）由 Less 函数算出来，不需要逐个写：

```js
lessOptions: { modifyVars: { "primary-color": "#BA5B37" } }
```

v6 时代改 seed token，派生在运行时发生：

```tsx
<ConfigProvider theme={{ token: { colorPrimary: "#BA5B37" } }}>
```

如果某个派生值必须精确（比如 hover 要 `#943F25`，而不是算法算出来的值），就要包一层 `algorithm`，因为 v6 会重算派生层。Tailwind 侧不需要额外动作：只要它读同一条 token 管线，`bg-primary` 和 `hover:bg-primary-hover` 会一起变。

### 4.4 把一次 utility 覆盖走一遍

目标：主色按钮改成全圆角，hover 时换成主题的 hover 色。

v3 + v4 时代，这两个 utility 和 antd 的 `.ant-btn` / `.ant-btn-primary:hover` 特异性相同，胜负取决于谁后加载；而 antd 的样式常被 `babel-plugin-import` 按组件在运行时注入，顺序并不可控。能稳定生效的写法通常退回自定义 CSS：

```tsx
<Button type="primary" className="rounded-full hover:bg-primary-hover">保存</Button>
```

```css
/* 与 .ant-btn-primary:hover 打平，靠 !important 兜底 */
.ant-btn-primary:hover {
  background-color: #943F25 !important;
}
```

v4 + v6 时代，同一组类不需要任何附加 CSS：`utilities` 层排在 `antd` 层之后，胜负在层声明时就定了。

```tsx
<Button type="primary" className="rounded-full hover:bg-primary-hover">保存</Button>
```

这就是两代栈在「覆盖」上的全部差别：v3 每次都要判断选择器和加载顺序，v4 只需要判断一次层。

---

## 5. 迁移时真正要换的三样东西

1. **配置载体**：`tailwind.config.js` 的 `theme` / `theme.extend` → 入口 CSS 的 `@theme`；新增复合类用 `@utility` 替代 `plugin(addUtilities)`。
2. **值来源**：Less 变量名 → token 名。`@primary-color` 对应 `colorPrimary`，`@btn-primary-bg` 在 v6 里由全局 `colorPrimary` 派生，局部差异再落到 `theme.components.Button`；派生逻辑从 Less 函数搬到 `algorithm`。
3. **裁决机制**：从「特异性 + 加载顺序」切换到「级联层顺序」。先声明 `@layer theme, base, antd, components, utilities`，再让 antd 通过 `<StyleProvider layer>` 进层，覆盖关系就只由层序决定。

---

## 延伸阅读

- [antd v6 + Tailwind v4 组合最佳实践](./antd-v6-tailwind-v4.md)：层序、reset 取舍、SSR、`zeroRuntime`。
- [README · Tailwind v4](../README.md#tailwind-v4纯-css无需-antd)：本仓库样式表的消费方式与工具类清单。
- [MAPPING.md · Tailwind 变量映射](../MAPPING.md)：`--paseo-*` 与 antd token 的逐项对照。
