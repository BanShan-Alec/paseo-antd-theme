# antd v6 + Tailwind v4 组合最佳实践

> 适用版本:antd 6.x(验证于 6.6.6)、tailwindcss 4.x(验证于 4.3.3)。
> 所有结论均对照 `node_modules` 源码与 antd 官方文档(compatible-style / reset.css)确认。

## 0. 一句话方案

```css
/* main.css / global.css */
@layer theme, base, antd, components, utilities;

@import "tailwindcss";
```

```tsx
// main.tsx
import { StyleProvider } from "@ant-design/cssinjs";

<StyleProvider layer>
  <ConfigProvider theme={...}>
    <App />
  </ConfigProvider>
</StyleProvider>;
```

两处配齐,antd 与 Tailwind 进入同一套 CSS `@layer` 权重秩序,此后**任何覆盖关系只由 layer 顺序决定,与选择器特异性无关**。

## 1. 为什么必须这样配

### 1.1 CSS layer 的两条铁律

1. **层声明顺序 = 永久权重顺序**,后声明者恒胜,不看特异性、不看源码顺序。
2. **无层级样式永远赢过任何 layer 里的样式**(特异性再低也赢)。

### 1.2 不加 `<StyleProvider layer>` 会发生什么

antd v6 的组件样式由 cssinjs 运行时注入,默认**无层级**。按铁律 2,它会压过 Tailwind 的所有层——包括 `utilities`。后果:所有想覆盖 antd 的 Tailwind 类(`className="bg-red-500"` 之类)静默失效,只能用 `!important` 硬打。

`StyleProvider` 的 `layer` 布尔 prop(`@ant-design/cssinjs` StyleContext.d.ts:36)把每个注入的组件样式包进 `@layer antd { … }`(useStyleRegister.js:186),antd 才能加入下述秩序。

### 1.3 层顺序的语义

```css
@layer theme, base, antd, components, utilities;
```

| 层 | 内容 | 权重关系 |
| --- | --- | --- |
| `theme` | Tailwind 主题变量 | 最弱,只提供 token |
| `base` | **Tailwind preflight** + 你的页面级基础样式 | 永远动不了 antd 组件 |
| `antd` | antd 全部组件样式(cssinjs 注入) | 胜 preflight;输给 utilities |
| `components` | 你自己的组件类 | 可以覆盖 antd |
| `utilities` | Tailwind 工具类 | 最强,`className` 直接覆盖 antd |

这条顺序来自 antd 官方文档(compatible-style → TailwindCSS v4 节),是官方唯一给定的配比。

## 2. 入口文件完整参考

```tsx
// main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConfigProvider } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";
import "./main.css"; // 必须在组件渲染前导入

function App() {
  return (
    <StyleProvider layer>
      <ConfigProvider theme={...}>
        <Router />
      </ConfigProvider>
    </StyleProvider>
  );
}
```

```css
/* main.css */
@layer theme, base, antd, components, utilities;

@import "tailwindcss";

/* 你的页面级基础样式(可选),进 base 层 */
@layer base {
  body {
    /* 页面级兜底,与 antd token 对齐的字体栈见 §4.3 */
  }
}
```

### 2.1 版本注意:v6 的 StyleProvider 从哪引

antd **v6 本体不再 re-export `StyleProvider`**(实测 `import("antd")` 无此导出),必须直接装并从 `@ant-design/cssinjs` 引:

```bash
# antd 6.x 的 dependencies 已含 @ant-design/cssinjs ^2.1.2,通常无需单独安装
npm ls @ant-design/cssinjs
```

版本保持与 antd 内部依赖一致,避免双实例。

## 3. reset 的取舍:只用 preflight,不引 antd reset.css

**结论:组合场景下用 Tailwind preflight,跳过 `antd/dist/reset.css`。**

依据(均源码验证):

- antd v6 组件**不依赖全局 reset**:每个组件自带 `resetComponent()`(margin/padding/listStyle 挂在 `.ant-*` 作用域),`genCommonStyle()` 的 `box-sizing` 也只罩 `[class^="ant-"]`。reset.css 影响的只是 antd 之外的页面级元素。
- preflight 覆盖了 reset.css 的全部页面级职责(`* { margin: 0; padding: 0; box-sizing: border-box }`、标题/列表清边距、表单 `font: inherit`),并多治了三类 reset.css 没有的问题:`svg/img/video { display: block; max-width: 100% }`(行内 svg 被行框裁剪——典型如 Message 图标显示不全)、Firefox placeholder 透明度、`button { border-radius: 0; background: transparent }` 的统一起点。
- 两份 reset 叠加没有收益,反而多一层需要维护的顺序关系。

### 3.1 如果一定要引 antd reset.css(如 preflight 被裁剪的遗留页面)

**必须给它指定 layer**,否则无层级样式会反过来压过所有 layer(包括 antd):

```css
@layer theme, reset, base, antd, components, utilities;

@import "tailwindcss";
@import url("antd/dist/reset.css") layer(reset);
```

reset 放 `base` 之前:只清 UA 默认,不与 Tailwind base 竞争。这是 antd v6 文档的明确要求(compatible-style → reset.css 和 antd.css 节)。

### 3.2 preflight 与 antd 的已知交叠(均无风险)

| preflight 规则 | 对 antd 的影响 |
| --- | --- |
| `svg { display: block }` | antd 的 `.anticon svg { display: inline-block }` 权重更高(preflight 在 base 层),图标对齐不受影响;反而修复了无 reset 页面的图标裁剪 |
| `button { border-radius: 0; background: transparent }` | antd Button 样式更高权重,完全覆盖;只影响你自己手写的裸 `<button>`(Tailwind 场景本就要自己上样式) |
| `html { line-height: 1.5; font-family: var(--font-sans) }` | antd 组件内部用自己的 token,不受影响;组件**之外**的文字会继承。见 §4.3 对齐建议 |

## 4. 常见踩坑

### 4.1 覆盖 antd 的正确姿势

- 用 Tailwind utilities 覆盖 antd 组件:直接写 `className`,utilities 层恒胜 antd 层,无需 `!important`。
- 用自己的 CSS 覆盖:放进 `components` 层(`@layer components { … }`),或任意比 `antd` 后声明的层。
- 反过来,想让 antd 压过你的某段样式:把那段放进 `antd` 之前的层。

### 4.2 手插的 `<style>` 与第三方 CSS-in-JS 是无层级样式

任何不进层的样式(组件里手插的 `<style>`、styled-components/emotion 默认输出)都是无层级 → 按铁律 2 赢过一切。要有意利用(如主题包注入的行为层 CSS),也要警惕它压过 Tailwind utilities。给这类样式留退路时,可以:

```tsx
// 第三方库若支持,配 layer;不支持则包一层
<style>{`@layer components { ${thirdPartyCss} }`}</style>
```

### 4.3 字体栈对齐(Windows 位移问题)

preflight 把 `html` 字体钉在 `--theme(--default-font-family, …)`,antd 组件钉在主题 token 的 `fontFamily`。两者解析到不同字体时(典型:Windows 上 antd 默认栈解析到 Segoe UI、`system-ui` 解析到另一款,宽度差约 7%),页面在组件边界处会跳宽。做法:Tailwind 主题与 antd token 用**同一栈**:

```css
/* main.css */
@theme {
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-mono: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
```

### 4.4 SSR:层声明必须最先加载

`@layer theme, base, antd, …;` 这行声明必须出现在任何用到 `@layer` 的样式之前。SSR 把样式内联进 HTML 时,保证层声明在 `<head>` 里排在所有组件样式之前,否则层归属在解析时不确定,权重秩序错乱。antd 文档专门有 ❌/✅ 写法示例(compatible-style → SSR 场景)。

### 4.5 `zeroRuntime` 模式的额外一步

若启用 antd 6 的 `zeroRuntime`,antd 样式变成预构建的 `antd.css` 文件。它也必须进同一个层,且层顺序声明先于它加载:

```css
@import url("antd/dist/antd.css") layer(antd);
```

### 4.6 降权后想回退

`StyleProvider layer` 与 `hashPriority` 等其他 StyleProvider 选项可同时使用。如果某个局部需要 antd 样式恢复无层级(极少见),在那个子树外再套一层不带 `layer` 的 StyleProvider 即可,但会重新破坏 utilities 覆盖,慎用。

## 5. 检查清单

- [ ] `main.css` 第一行(任何 `@import` 之前)声明 `@layer theme, base, antd, components, utilities;`
- [ ] `@import "tailwindcss"` 紧随其后
- [ ] **不引** `antd/dist/reset.css`(或按 §3.1 带 `layer(reset)` 引)
- [ ] `<StyleProvider layer>` 从 `@ant-design/cssinjs` 导入,包住 ConfigProvider
- [ ] Tailwind `--font-sans` / `--font-mono` 与 antd 主题 `fontFamily` / `fontFamilyCode` 同栈
- [ ] 自己的覆盖样式进 `components` 或更后的层,不写裸样式
- [ ] SSR:层声明样式先于一切组件样式到达浏览器
- [ ] 全页面手写裸 `<button>`/`<input>` 的地方知道它们已被 preflight 清成直角透明,需要自己补样式
