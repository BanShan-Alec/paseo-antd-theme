# 从 antd v4 + Tailwind v3 到 antd v6 + Tailwind v4（上）：先搞懂概念，再学会覆盖

> 这篇写给这样的开发者：用 antd v4 配过 Less 主题，用 Tailwind v3 写过 `tailwind.config.js`，但没深入过 antd v5/v6 和 Tailwind v4。
>
> 上篇只讲两件事：**新版的概念**，以及**在新栈里怎么覆盖和新增样式**。两套 token 怎么共用一条管线、`StyleProvider` 怎么配、暗色和 SSR 怎么处理，放到下篇（桥接篇）。

## 0. 先说结论

第一次看 antd v6 和 Tailwind v4 的文档，最容易产生的错觉是：它们只是换了一套 API。实际上变的是三件更底层的事：

- **antd v4 的主题是构建期常量，antd v6 的主题是运行时数据。**
- **Tailwind v3 的 utility 值是字面量，Tailwind v4 的 utility 值是 CSS 变量引用。**
- **Tailwind v3 的覆盖靠选择器和加载顺序，Tailwind v4 靠浏览器原生的级联层。**

这三件事决定了旧经验哪里还能用、哪里会静默失效。本文先用六个概念把新模型讲清楚，再讲两种覆盖：antd 的主题 token，以及 Tailwind 的 utility。

全程用两个组件当例子，后面每一节都会回到它们：

```tsx
<Button type="primary" className="rounded-full hover:bg-primary-hover">
  保存
</Button>

<Card className="border-split bg-surface-1">…</Card>
```

目标很具体：让主色按钮在 hover 时换成主题的 hover 色、变成全圆角；让卡片的边框用主题的分隔线色、底色用主题的容器色。

### 0.1 两次重写各自想解决什么

antd 从 v4 到 v6 的核心动机是**主题必须能在运行时变**。Less 方案下，主题是构建产物：想换主色要重新编译，想同时支持亮/暗要编译两份，想在一个页面里嵌一块不同主题的面板基本做不到。v5 开始把样式改成 cssinjs、把主题拆成 token；v6 继续收紧 token 的计算规则，并默认把 token 物化成 CSS 变量。

Tailwind 从 v3 到 v4 的核心动机是**配置和运行时值解耦**。Tailwind v3 的 `theme` 是构建期常量，utility 里写的是字面量；想在运行时换色，只能自己手动把颜色改成 `var(--x)`。Tailwind v4 把主题搬进 CSS、把 utility 改成变量引用，同时接入浏览器原生级联层，让「第三方组件库 vs 工具类」的冲突有一个确定的裁决方式。

所以这两次重写不是各改各的：一个让值在运行时可变，一个让消费这些值的 utility 也能跟着变。两者叠在一起，才有了「一套 token 同时喂组件和工具类」的可能。

### 0.2 构建侧也换了：两套工具链各自换了什么

前面讲的是「值怎么变」，这一节讲「样式怎么产出」。两边的变化方向不同：Tailwind 换的是 CSS 处理器，antd 换的是样式生成的时机。

**Tailwind：PostCSS 插件链 → 内置处理 + Lightning CSS。** v3 的典型 CSS 管线是一条 PostCSS 插件链：`tailwindcss` 负责生成，`postcss-import` 负责内联 `@import`，`autoprefixer` 负责加前缀。v4 把这三件事收进自己的工具链：`@import` 由 Tailwind 处理，前缀和现代语法转换交给 Lightning CSS，`autoprefixer` 和 `postcss-import` 都不再需要。PostCSS 并没有消失——`@tailwindcss/postcss` 仍是 Next.js、Angular 这类项目的接入方式；只是在 Vite 项目里，官方更推荐 `@tailwindcss/vite`。

**antd：Less + 静态 CSS → cssinjs 运行时注入。** 这条变化更彻底，跨了三代：

| | antd v4 | antd v5 | antd v6 |
| --- | --- | --- | --- |
| 样式来源 | Less 编译成静态 CSS | cssinjs 运行时注入 | 默认同 v5；可选 `zeroRuntime` |
| Less / less-loader | 改主题时需要（`modifyVars`） | 全部移除 | 不需要 |
| 按需样式 | `babel-plugin-import` | 内置，不再支持该插件 | 同 v5 |
| `antd/dist/antd.css` | 全量静态 CSS | 移除 | 只服务 `zeroRuntime` |
| SSR | 加载 CSS 即可 | 需抽出注入样式内联 | 同 v5 |

具体到消费端：

- v4 想改主题，要把 `antd.less` 交给 less-loader 编译并配 `modifyVars`；按需样式靠 `babel-plugin-import`。v5 起这两样都不再需要。
- v5 移除了所有 Less 文件和 `antd/dist/antd.css`，样式改为运行时注入；SSR 因此从「加载一份 CSS」变成「把注入的样式抽出来内联」。
- v6 默认仍是运行时注入，但提供 `zeroRuntime`：用预构建的 `antd/dist/antd.css` 换回静态 CSS，代价是主题切换不再那么自由。v6 的 peer dependency 也要求 React ≥ 18。

**两者的差别。** Tailwind 的变化停在构建期：产物还是 CSS，只是处理器换了，消费端仍然加载一份静态样式表。antd 的变化延伸到了运行时：默认不再有完整的静态 CSS，样式跟着组件渲染注入。所以 Tailwind 的迁移主要是改配置和依赖；antd 的迁移还要处理 SSR、首屏和覆盖方式。

## 1. 三个转变，决定了旧经验为什么会失效

### 1.1 antd：样式从构建期 CSS 变成运行时注入

antd v4 的样式是 Less 编译出来的静态 CSS。你在 `modifyVars` 里改一个变量，构建工具重新编译一遍 `antd.less`，产出一份新的 CSS 文件。浏览器加载它，class 名固定，样式在页面打开前就全部存在。

antd v6 不再这样。组件样式以 JS 函数的形式跟着组件走，**组件渲染时**才被序列化成 `<style>` 标签插进 `<head>`，class 名带 hash。换主题不需要重新构建，token 重新算一遍，新的样式再注入一遍；没渲染到的组件也不会产生样式。

这不是实现细节，它直接带来两个后果：

1. 你在构建产物里找不到完整的 antd CSS，它是在运行时长出来的。
2. 这些注入的样式**默认不在任何 `@layer` 里**。而级联层有一条铁律：不在层里的样式赢过所有层。所以不处理的话，antd 会压过 Tailwind 的所有 utility。

还有一个不太明显的影响：首屏。antd v4 的 CSS 随 HTML 一起到达，第一次绘制就有样式；antd v6 的组件样式要等 React 渲染、cssinjs 注入之后才出现。SSR 场景下需要把注入的样式抽出来内联进 HTML，这部分放在桥接篇，先知道有这回事即可。

把样式从构建到覆盖的生命周期放在一起：

| 阶段 | antd v4 | antd v6 |
| --- | --- | --- |
| 构建 | Less 编译出 `antd.css` | 只编译你自己的页面样式 |
| 加载 | 浏览器加载整份 antd CSS | antd 组件样式不存在于静态产物 |
| 渲染 | 直接命中静态 class | 执行样式函数，注入 `<style>` |
| 换主题 | 重新编译或换样式表 | 换 `theme`，组件重新渲染 |
| 覆盖 | 特异性 + 加载顺序 | 原生级联层 |

先记住第 2 点，第四个概念会解释它；`StyleProvider layer` 的作用就是让 antd 主动进层。

### 1.2 主题：从一层 Less 变量变成四级 token 图

antd v4 的主题是一张扁平的 Less 变量表：`@primary-color`、`@border-radius-base`、`@btn-primary-bg`。变量之间的派生由 Less 函数完成，比如 `darken(@primary-color, 10%)`，同样发生在构建期。

antd v6 把主题拆成一条计算链：seed → map → alias → component。你只拧 seed，后面的层级由 `algorithm` 在运行时算出来。所以「改主题」不再是「替换一个值」，而是「换一个输入，让整条链重新算」。

在 antd v4 里，你调的是**结果**：把 `@primary-color` 设成最终颜色，派生由 Less 函数算。在 antd v6 里，你调的是**输入**：把 seed 设成设计意图，派生由算法算。这个差别会在覆盖篇反复出现——你写的值不一定是你看到的值。

### 1.3 Tailwind：从 JS 配置变成 CSS 里的配置

Tailwind v3 的主题写在 `tailwind.config.js` 里，颜色、字体、圆角都是一个 JS 对象；utility 的值在构建时展开成字面量，比如 `.bg-primary { background-color: #BA5B37 }`。

Tailwind v4 把配置搬进 CSS：用 `@theme` 声明设计变量，用 `@utility` 新增工具类，用 `@custom-variant` 新增变体。utility 仍然是构建期生成的，但生成出来的值是 `var(--color-primary)` 这样的变量引用。**值本身可以在运行时变，utility 不用重新编译。**

把同一个类在两代下生成的结果放在一起，差别一目了然：

```css
/* v3 生成 */
.bg-primary { background-color: #BA5B37; }

/* v4 生成 */
.bg-primary { background-color: var(--color-primary); }
```

utility 的名字和用法没变，变的是它指向的东西。这就是为什么 Tailwind v4 的主题可以在运行时换：类本身不动，动的是类引用的变量。

这三个转变不是并列的，而是有因果的：antd 的主题变成运行时数据，才需要 cssinjs 在运行时生成样式；Tailwind 的值变成变量引用，才能在运行时跟着变；两者都在运行时参与，才需要一个比「加载顺序」更确定的裁决机制，也就是级联层。

把这三个转变放在一起，就是这篇的主线：antd 的样式在运行时产生，Tailwind 的值在运行时可变，而两者谁压谁由级联层决定。下面六个概念，就是在补这三句话背后的机制。可以先记住它们各自回答的问题：

| 概念 | 回答的问题 |
| --- | --- |
| token 四级 | 主题的值从哪来 |
| cssinjs | 样式什么时候产生 |
| CSS 变量解析 | 值能不能在运行时切换 |
| 级联层 | 冲突时谁压谁 |
| Tailwind CSS-first | 配置写在哪、utility 怎么生成 |
| `@theme inline` | 变量怎么接进 utility，才能跟着运行时切换 |

## 2. 概念一：token 四级——你拧的旋钮和算出来的结果

antd v6 的 token 分四层，先看这张表：

| 层级 | 它是什么 | 典型 token | 你能怎么改 |
| --- | --- | --- | --- |
| seed | 设计意图的最小集合：主色、圆角、字号 | `colorPrimary`、`borderRadius`、`fontSize` | `theme.token`，作为算法输入 |
| map | 由 seed 经算法派生的色板与尺度 | `colorPrimaryHover`、`colorPrimaryBg`、`colorPrimaryBorder` | 不直接写；改 seed 或包 `algorithm` |
| alias | 面向使用场景的语义变量，组件和业务代码都读它 | `colorText`、`colorBgContainer`、`colorBorder`、`colorSplit` | 部分会被重算；不要把它当稳定覆盖点 |
| component | 单个组件的局部变量 | `Button.primaryShadow`、`Table.headerBg` | `theme.components.<Component>` |

这张表最重要的信息不是四个名字，而是**可写性的分界**：seed 和 component 是稳定入口，map 和 alias 是计算结果。

举几个例子就清楚了。

**例一：主色。** 你在 `theme.token` 里写 `colorPrimary: "#BA5B37"`。算法会从它派生出 `colorPrimaryHover`、`colorPrimaryActive`、`colorPrimaryBg`、`colorPrimaryBorder` 一整族色阶；Button、Link、Switch、focus ring 都从这族值里取色。你只写了一个 token，改动却铺满了所有组件。

**例二：语义角色。** 卡片的底色读的是 `colorBgContainer`，边框读的是 `colorBorder`，分隔线读的是 `colorSplit`。这些是 alias，不是「卡片自己的颜色」。它们由算法从受控 token 计算出来，其中一部分（比如 `colorSplit`）会在最后被重新算一遍。你在 `theme.token` 里直接写它们，可能看起来生效，也可能被静默覆盖——不要依赖。

**例三：组件局部。** 如果你只想动 Button 的阴影，写 `theme.components.Button.primaryShadow`。component token 是链的末端，不会被上游重算，所以它是安全的局部入口。

**例四：圆角。** seed 的 `borderRadius` 会派生出整套圆角尺度，改 seed，所有组件一起变。只想动某个组件时，先查它有没有对应的 component token，没有再考虑包算法。

而 `algorithm` 就是中间那台机器。默认主题用 `defaultAlgorithm`，暗色用 `darkAlgorithm`，紧凑用 `compactAlgorithm`；它接收 seed，输出 map 和 alias。想理解「为什么改一个 seed 能影响几十个地方」，答案全在这里：

```tsx
<ConfigProvider
  theme={{
    algorithm: theme.darkAlgorithm,
    token: { colorPrimary: "#20744A" },
    components: { Button: { primaryShadow: "none" } },
  }}
>
```

三个字段，正好对应链上的三个位置：`algorithm` 是派生函数，`token` 是 seed 输入，`components` 是组件局部值。

一个实用的读法：`colorPrimaryBg` / `colorPrimaryHover` 这种「同一色相 + 状态」的是 map；`colorText` / `colorBgContainer` / `colorSplit` 这种「用途 + 角色」的是 alias；`Button.xxx` 这种点号路径是 component。看到 `colorPrimaryHover`，就知道它不该出现在 `theme.token` 里。

对着旧世界看一眼：`@primary-color` 对应 `colorPrimary`（seed）；`@text-color` 对应 `colorText`（alias）；`@btn-primary-bg` 在 antd v4 里是一个组件 Less 变量，在 antd v6 里通常由全局 `colorPrimary` 派生，只有局部差异才落到 `theme.components.Button`。

### 2.1 暗色不是把亮色反相

`darkAlgorithm` 不是简单地把每个颜色取反：它会把 seed 重新映射成一套暗色 ramp，再让 alias 从中取语义色。所以同一套 seed 在亮色和暗色下会得到不同的 hover、不同的浅底。想同时控制两套，通常要分别给亮/暗各传一个 theme 对象，或者包一层算法把关键 hex 钉住。

## 3. 概念二：cssinjs——样式在渲染时才长出来

把 antd v4 和 v6 的样式放到一起对比，最直观的差别是「谁在什么时候生成 CSS」。

antd v4 的模式是「一次编译，处处加载」：`antd.less` 在构建时变成一份 CSS，类名就是 `.ant-btn`、`.ant-card`，静态、可搜索、可覆盖。

antd v6 用的是 cssinjs：组件的样式是一段 JS 函数，输入是当前 token，输出是一段 CSS 字符串。组件第一次渲染时，这段字符串被塞进一个 `<style>` 标签，同时给元素加一个 hash class。同一套 token 下的第二次渲染会命中缓存，不会重复注入。

为什么要费这个劲？因为主题变成了运行时数据。只有样式能在运行时重新生成，`ConfigProvider` 换一个 `theme` 对象才能立刻生效；也只有这样，多套主题、暗色切换、甚至同一个页面里嵌不同主题才成立。

你可以自己观察一次：打开 DevTools，选中一个 antd Button，会看到它的 class 里除了 `ant-btn`，还有 `css-dev-only-do-not-override-*` 这样的 hash；`<head>` 里对应着一段带 `data-token` 属性的 `<style>`。这就是 cssinjs 的产物。

把一次换主题的过程拆开看：

1. `ConfigProvider` 的 `theme` 变了；
2. 所有消费 token 的组件重新执行样式函数；
3. 新的 CSS 字符串按 token 组合生成新的 hash；
4. 浏览器里多出一段 `<style>`，旧主题的样式可能被清理，也可能和新主题并存（取决于 `hashed` 的配置）。

所以「换主题」在 antd v6 里是一次 React 渲染，不是一次构建。也正因为这样，同一个页面可以同时挂两个不同主题的 Provider，而 antd v4 要为每套主题各编译一份 CSS。

它带来的后果在第 1 节已经提过，这里说完整：

- **CSS 不在你的静态产物里。** 做 CSP、做 SSR 首屏、做样式体积分析时，都要按运行时注入的思路处理。
- **注入的样式默认无层级。** 无层级赢过一切 `@layer`，所以它天然压过 Tailwind。要么让 antd 进层，要么所有覆盖都靠更高的特异性或 `!important`。
- **样式的作用域跟着组件走。** 这也解释了下一个概念：antd 的 CSS 变量为什么不在 `:root` 上。

### 3.1 StyleProvider 到底在管什么

cssinjs 不是全局单例，它需要知道：样式注入到哪个容器、hash 的优先级怎么算、注入的样式要不要包进层、SSR 时用哪个 cache。这些通过 `StyleProvider` 配置。

对这篇来说，只有一个 prop 重要：`layer`。不传，注入的样式无层级；传了，注入的样式会被包进 `@layer antd`。完整写法放在桥接篇，这里先建立判断：**看到「antd 样式压过 Tailwind」，第一反应应该是检查有没有配 `layer`。**

antd v6 还有一个 `zeroRuntime` 模式：不在运行时注入，而是用预构建的 `antd.css`。它同样需要手动进层，是另一条路线，桥接篇再展开。

## 4. 概念三：CSS 变量在定义处解析

这是全文最反直觉、也最值钱的一个概念。理解了它，`@theme inline` 就不用背了。

CSS 自定义属性会继承，但**带 `var()` 的属性值，是在它被声明的那一层完成替换的**。继承下去的是替换后的结果，不是一条还没求值的表达式。

```css
:root {
  --brand: blue;
  --primary: var(--brand);   /* 在这里就替换成 blue */
}

.dark {
  --brand: orange;           /* 改的是 --brand，不是 --primary */
}

.button {
  background: var(--primary); /* 拿到的仍然是 blue */
}
```

即使 `.button` 在 `.dark` 里面，它也不会变橙。因为 `--primary` 在 `:root` 上就已经定值了，`.dark` 里改 `--brand` 不会回头重算 `--primary`。

把两种写法放在一起对比：

| 写法 | 解析位置 | 结果 |
| --- | --- | --- |
| `--primary: var(--brand)` 声明在 `:root` | `:root` | 后代继承已定值，改 `--brand` 无效 |
| `background: var(--brand)` 直接用在元素上 | 元素 | 跟随该元素上的 `--brand` |

同一个变量，直接用在元素上就能跟随；先被另一个变量包一层再继承，就跟不动了。**所有暗色方案的差别，本质上都是解析位置的区别。**

这个规则解释了两件事。

**第一，antd v6 的 `--ant-*` 为什么不在 `:root` 上。** 上一节说过，cssinjs 的样式作用域跟着组件走；token 变量也挂在组件根节点的那个作用域类上。所以你在自己的 `<div>` 里写 `var(--ant-color-primary)`，默认是拿不到的——除非你手动把那个作用域类加到祖先节点，或者把 key 固定下来。这件事的完整做法放在桥接篇，这里只需要知道：**「antd 暴露了 CSS 变量」不等于「全页面都能直接用」。**

**第二，Tailwind 的普通 `@theme` 为什么救不了暗色。** 普通 `@theme` 生成的 utility 引用的是 `--color-primary`，而 `--color-primary: var(--brand-primary)` 在 `:root` 就替换完了。你在 `.dark` 里改 `--brand-primary`，`--color-primary` 看不到。这也是第六个概念 `@theme inline` 存在的原因。

**第三，作用域决定了切换的边界。** 变量定义在哪一层，切换就只影响那一层。antd 的 `--ant-*` 挂在组件作用域，Tailwind 的 `--brand-*` 通常挂在 `:root` 或 `.dark`；两者作用域不同，正是它们默认不能互相读到的原因。桥接要做的第一件事，就是让两边的变量落在同一个可见范围里。

## 5. 概念四：级联层——先定楼层，再比拳脚

级联层（cascade layers）是 CSS 的原生能力，不是 Tailwind 发明的。一条声明就能定下永久的优先级：

```css
@layer theme, base, antd, components, utilities;
```

规则只有三条：

1. **后声明的层恒胜先声明的层**，与选择器特异性无关。
2. **特异性只在同一层内部比较**。
3. **不在任何层里的样式，赢过所有层。**

层声明必须出现在所有 `@import` 之前；SSR 时还要保证这行声明先于任何组件样式到达浏览器，否则层的归属会错乱。

第 1 条经常被低估。看这个例子：

```css
@layer base, antd, utilities;

@layer antd {
  .card .title { color: red; }   /* 特异性更高 */
}

@layer utilities {
  .text-blue { color: blue; }    /* 层更靠后，赢 */
}
```

`.card .title` 的选择器更强，但它在 `antd` 层，`.text-blue` 在 `utilities` 层，后者恒胜。层顺序是全局裁决，特异性只是同一层里的加赛。

这正好补上了 Tailwind v3 时代最难受的一环。Tailwind v3 也有 `@layer base/components/utilities` 写法，但那只是 Tailwind 自己的分桶指令，编译后就是普通 CSS，浏览器并不知道这些层的存在；覆盖 antd 仍然要算特异性和加载顺序。**原生级联层是 Tailwind v4 时代才拿到的工具。**

反过来，如果没有层，antd 的 `.ant-btn` 就是无层级样式；按第 3 条它会赢过 `utilities` 层里的 `.bg-primary`，哪怕你的类加载得更晚。antd v4 时代大家习惯加 `!important`，就是在对抗这条规则；antd v6 给的解法是让 antd 进层。

层解决的是「哪条规则赢」，CSS 变量解决的是「值是多少」，两者互不替代。antd 进层只保证 utilities 能压过它，不保证 utilities 能读到 antd 的变量——后者要靠桥接。

回到 antd：v6 的注入样式默认无层级，按第 3 条会压过一切层。所以消费端必须让 antd 进层——`<StyleProvider layer>` 做的事就是把注入样式包进 `@layer antd`。配好之后，`utilities` 层排在 `antd` 后面，`className` 上的 Tailwind 类就能稳定覆盖组件样式，不需要 `!important`。具体配置在桥接篇，这里先建立因果关系：**antd 不进层，级联层就帮不了你。**

## 6. 概念五：Tailwind v4 的 CSS-first 配置

Tailwind v3 的主题是一个 JS 对象：

```js
// tailwind.config.js（v3）
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: { primary: "#BA5B37", "primary-hover": "#943F25" },
      borderRadius: { md: "12px" },
    },
  },
};
```

Tailwind v4 把同一件事搬进了 CSS。入口通常只有一行 `@import "tailwindcss"`，然后用 at-rule 做配置：

```css
/* main.css（v4） */
@import "tailwindcss";

@theme {
  --color-primary: #BA5B37;
  --color-primary-hover: #943F25;
  --radius-md: 12px;
}
```

`@theme` 里的变量不是随便写的普通变量，它们按命名空间注册，Tailwind 会据此生成 utility：

| 命名空间 | 生成的 utility |
| --- | --- |
| `--color-*` | `bg-*`、`text-*`、`border-*`、`fill-*`、`ring-*` |
| `--font-*` | `font-*` |
| `--radius-*` | `rounded-*` |
| `--spacing` | `p-*`、`m-*`、`gap-*`、`w-*` |
| `--breakpoint-*` | `sm:*`、`md:*`、`lg:*` |
| `--container-*` | `max-w-*` |
| `--shadow-*` | `shadow-*` |
| `--ease-*` | `ease-*` |
| `--tracking-*` | `tracking-*` |
| `--leading-*` | `leading-*` |

一个 `@theme` 变量要变成 utility，经过三步：

1. **注册命名空间**：`--color-primary` 被识别为颜色，候选类名是 `bg-primary`、`text-primary`、`border-primary` 等；
2. **扫描源码**：Tailwind v4 在项目里找这些候选类名，没被用到的不会生成；
3. **生成 CSS**：命中后输出 `background-color: var(--color-primary)`（普通 `@theme`）或 `var(--brand-primary)`（`inline`）。

所以「变量定义了但类不生效」通常不是变量的问题，而是类名没被扫描到（用 `@source` 补），或者命名空间写错了（`--colors-primary` 不是 `--color-primary`）。

于是「新增」和「覆盖」在 Tailwind v4 里变成了同一个动作：

- 写一个默认主题没有的名字，是**新增**：`--color-brand` 多出 `bg-brand`。
- 写一个已有的名字，是**覆盖**：`--breakpoint-sm` 替换默认断点。
- 写 `--color-*: initial`，是**清空**整个色板，只保留你自己定义的颜色。

Tailwind v3 里 `extend` 和 `theme` 的「追加 vs 替换」，在 Tailwind v4 里变成了「同名 vs 新名 vs 清空命名空间」。

Tailwind v4 也不再需要 `content` 数组，它从项目源码里自动扫描类名。扫描不到的地方（monorepo 里的组件包、运行时拼出来的类名）用 `@source` 显式补；想「白名单」某个类，用 `@source inline("...")` 替代 Tailwind v3 的 `safelist`。

除了 `@theme`，还有三个常用指令：

```css
/* 新增一个能接变体的工具类 */
@utility tab-4 {
  tab-size: 4;
}

/* 新增一个变体：hocus:bg-primary = hover 和 focus 都生效 */
@custom-variant hocus (&:hover, &:focus);

/* 显式补充自动扫描不到的源文件 */
@source "../packages/ui";
```

把 Tailwind v3 的配置逐项翻译过来，大致是这张表：

| Tailwind v3 `tailwind.config.js` | Tailwind v4 CSS |
| --- | --- |
| `theme.extend.colors` | `@theme { --color-* }` |
| `theme.colors = {…}`（整体替换） | `@theme { --color-*: initial; … }` |
| `theme.extend.fontFamily` | `@theme { --font-* }` |
| `theme.extend.borderRadius` | `@theme { --radius-* }` |
| `theme.extend.spacing` | `@theme { --spacing-* }` |
| `plugins: [addUtilities]` | `@utility` |
| `plugins: [addVariant]` | `@custom-variant` |
| `darkMode: "class"` | `@custom-variant dark (...)` |
| `content` | 自动扫描 / `@source` |
| `corePlugins: { preflight: false }` | 不导入 `preflight.css` |
| `safelist` | `@source inline(...)` |
| 整个 config 文件 | `@config`（兼容层） |

如果你暂时不想把手上的 `tailwind.config.js` 全部翻译成 CSS，v4 也支持 `@config` 加载旧配置：

```css
@config "../tailwind.config.js";
```

但要记住 v4.0 的兼容边界：`corePlugins`、`safelist`、`separator` 这三个选项不再支持。`corePlugins: { preflight: false }` 要改成「不引入 preflight」，`safelist` 要改用 `@source inline(...)`。

`@config` 是给存量项目的逃生通道：先把 CSS 入口跑起来，再逐项把 JS 配置翻译成 `@theme` / `@utility`。它是合并而不是替代——CSS 里定义的值优先。

`@import "tailwindcss"` 本身等价于三行导入：

```css
@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css" layer(utilities);
```

想保留 Tailwind 的主题和工具类、但不要 preflight（比如你的项目已经有自己的 reset），就把中间那行去掉。这个写法比 Tailwind v3 的 `corePlugins: { preflight: false }` 更显式，也更容易解释。

### 6.1 还有几个 v4 的边角

- `@plugin` 仍可加载 Tailwind v3 的 JS 插件，适合插件生态还没迁移的过渡期。
- `@variant` 用在自定义 CSS 里套用变体，比如在规则里写 `@variant dark { … }`。
- `theme()` 函数被标记为废弃，改用 `var(--color-*)`；需要在构建期调整颜色透明度的，用 `--alpha()`。
- `prefix`、`important` 这类全局选项不再放在 JS 配置里，改成写在 `@import "tailwindcss"` 上。

### 6.2 层序里为什么有 antd 的位置

Tailwind v4 默认声明的层序是 `theme, base, components, utilities`。和 antd 混用时，消费端要在中间插入 `antd`：

```css
@layer theme, base, antd, components, utilities;
@import "tailwindcss";
```

位置不是随便放的：`base` 里是 preflight，它只该清浏览器默认样式，不该压 antd；`antd` 要在 `components` 之前，这样你自己的组件类才能覆盖组件库；`utilities` 放最后，`className` 才能压过一切。层序一旦声明就是永久的，所以这行要写在所有 `@import` 之前。

## 7. 概念六：`@theme inline`——让暗色不用重编译

现在把概念三和概念五接起来。

普通 `@theme` 会生成两样东西：一个定义在 `:root` 的主题变量，以及引用它的 utility。

```css
@theme {
  --color-primary: var(--brand-primary);
}
```

生成结果大致是：

```css
:root { --color-primary: var(--brand-primary); }
.bg-primary { background-color: var(--color-primary); }
```

按概念三，`--color-primary` 在 `:root` 就替换成了当时 `--brand-primary` 的值。你在 `.dark` 里改 `--brand-primary`，`.bg-primary` 拿到的还是浅色值。

`@theme inline` 改的是生成方式：它让 utility 直接内联变量的值。

```css
@theme inline {
  --color-primary: var(--brand-primary);
}
```

生成结果变成：

```css
.bg-primary { background-color: var(--brand-primary); }
```

两者放在一起：

| | 普通 `@theme` | `@theme inline` |
| --- | --- | --- |
| 生成的 utility | `background: var(--color-primary)` | `background: var(--brand-primary)` |
| 解析位置 | 主题变量定义处（`:root`） | 使用 utility 的元素上 |
| `.dark` 里换值 | 不生效 | 生效 |

解析被推迟到使用 `bg-primary` 的那个元素上。元素在 `.dark` 里，就拿到暗色的 `--brand-primary`；不在，就拿浅色。**Tailwind 不需要为暗色重新编译，切换的只是一批 CSS 变量。**

所以判断标准很简单：**如果 theme 变量的值来自另一个会在运行时变化的变量，就用 `inline`；如果值是字面量，普通 `@theme` 就够了。** 桥接 antd token 时几乎总是前者。

什么时候不用 inline？值本身是字面量（`--color-brand: #BA5B37`）时，普通 `@theme` 更直观，还能让别的 CSS 直接 `var(--color-brand)`。只有值来自另一个运行时变量时，才需要 inline。

### 7.1 暗色的两种触发方式

Tailwind v4 默认的 `dark:` 跟随 `prefers-color-scheme`。要用类策略，加一行：

```css
@custom-variant dark (&:where(.dark, .dark *));
```

然后确保 `.dark` 挂在根节点或需要切换的子树根上。变量方案里，`--brand-primary` 也要在 `.dark` 里重新赋值。两者可以一起用：变量负责让 utility 自动换色，`dark:` 负责「个别 token 需要不同值」的场景。

## 8. 覆盖（一）：antd v6 的主题 token

概念讲完，进入操作。antd v6 的主题覆盖只有三个稳定入口，对应 token 链的三个位置：

| 你想改什么 | 写在哪 | 例子 |
| --- | --- | --- |
| 全局设计输入 | `theme.token` | `colorPrimary`、`borderRadius` |
| 单个组件局部 | `theme.components.<Component>` | `Button.primaryShadow` |
| 派生的具体值 | 包一层 `algorithm` | 钉死 `colorPrimaryHover` |

### 8.1 改主色

```tsx
<ConfigProvider theme={{ token: { colorPrimary: "#BA5B37" } }}>
```

这一行会让 Button、Link、Switch、focus ring 一起变，因为它们的颜色都从 `colorPrimary` 派生。派生色（hover、active、浅底）由算法算出，不需要逐个列。

### 8.2 改组件局部

```tsx
<ConfigProvider
  theme={{ components: { Button: { primaryShadow: "none" } } }}
>
```

component token 是链的末端，不会被上游重算，所以适合做「只动这一个组件」的微调。

### 8.3 钉死派生值

假设 hover 必须精确等于 `#943F25`，不能是算法算出来的值。这时 `token` 和 `components` 都不够，要包一层 `algorithm`：

```tsx
import { theme as antdTheme } from "antd";

const pinnedAlgorithm = (seed, mapToken) => ({
  ...antdTheme.defaultAlgorithm(seed, mapToken),
  colorPrimaryHover: "#943F25",
});

<ConfigProvider theme={{ algorithm: pinnedAlgorithm }}>
```

`algorithm` 的输出落在派生结果上，所以这里写的值会覆盖算法算出来的 hover。

把 antd v4 的 Less 变量名对应过来：

| antd v4 Less 变量 | antd v6 token | 层级 |
| --- | --- | --- |
| `@primary-color` | `colorPrimary` | seed |
| `@success-color` / `@error-color` | `colorSuccess` / `colorError` | seed |
| `@border-radius-base` | `borderRadius` | seed |
| `@text-color` | `colorText` | alias |
| `@text-color-secondary` | `colorTextSecondary` | alias |
| `@border-color-base` | `colorBorder` | alias |
| `@border-color-split` | `colorSplit` | alias |
| `@component-background` | `colorBgContainer` | alias |
| `@btn-primary-bg` | 由全局 `colorPrimary` 派生 | component 结果 |

三种入口怎么选：

1. 改的是所有组件共享的设计输入 → seed；
2. 只动一个组件的局部值，且组件暴露了对应 component token → components；
3. 需要精确控制某个派生值 → 包 algorithm。

先试 seed，再试 component，最后才包 algorithm。反过来会把简单问题复杂化。

### 8.4 旧世界里最容易失效的三个习惯

**习惯一：把 `@primary-color` 的改法等同于「所有派生色都按我的色板走」。** antd v4 的 Less 派生是固定的 `darken()` / `fade()`，你大致能预判结果；antd v6 的算法有自己的推导规则，改 seed 得到的 hover 不一定是你想要的那个 hex。要精确值，就得包 `algorithm`。

**习惯二：想改语义色就去写 alias。** antd v4 里改 `@text-color`、`@border-color-split` 很自然；antd v6 里这些 alias 有一部分会在最后被重算，写了可能被静默覆盖。改 seed 或 component，别改 alias。

**习惯三：找 `@btn-primary-bg` 的同名 token。** antd v6 的 Button 没有直接对应「主按钮背景」的 component token；主按钮背景来自全局 `colorPrimary`。只有确实属于组件局部的值（阴影、尺寸、特殊状态色）才落到 `theme.components.Button`。

### 8.5 在 React 之外读 token

组件里用 `theme.useToken()` 拿到当前解析后的 token，适合写需要跟主题联动的自定义组件；它返回的 `token` 已经是当前主题（浅色或暗色）的最终值。

不在 React 里时，用 `theme.getDesignToken(themeConfig)`。它是同一条派生链的纯函数入口，不需要渲染：构建脚本、Canvas 绘制、邮件模板都能用。下篇的「构建期预生成 Tailwind 变量」就是靠它。

```tsx
// 组件内
const { token } = theme.useToken();
<div style={{ color: token.colorPrimary }} />;

// 组件外
const token = theme.getDesignToken({ token: { colorPrimary: "#BA5B37" } });
```

### 8.6 改完怎么验证

三个动作：

1. DevTools 里看计算值，确认你改的是最终生效的那个属性，不是被组件内部样式压掉的；
2. 切一次暗色，看派生值有没有跟着变——只变主色、hover 和浅底没变，通常说明你改的是 alias，不是 seed；
3. 如果只有部分组件变，检查它读的是全局 token 还是自己的 component token。

## 9. 覆盖（二）：Tailwind utility 的覆盖与新增

Tailwind 侧的覆盖分两层：先看 utility 自身怎么加、怎么改，再看它和 antd 谁压谁。

### 9.1 新增 utility

两个入口：

```css
/* 加一个设计变量，自动获得对应工具类 */
@theme {
  --color-brand: #BA5B37;   /* 得到 bg-brand / text-brand / border-brand */
}

/* 加一个复合工具类，自动支持 hover: / md: / dark: */
@utility tab-4 {
  tab-size: 4;
}
```

Tailwind v3 里同样的需求要靠插件，Tailwind v4 直接把规则写成 at-rule：

```js
// v3
plugins: [
  ({ addUtilities }) => {
    addUtilities({ ".tab-4": { tabSize: "4" } });
  },
];
```

```css
/* v4 */
@utility tab-4 {
  tab-size: 4;
}
```

### 9.2 覆盖已有 utility

三个入口，按影响范围从大到小：

1. **覆盖同名 theme 变量**：`--color-primary` 改值，所有 `bg-primary` / `text-primary` 一起变。
2. **清空命名空间**：`--color-*: initial`，默认色板全部移除，只留你自己定义的颜色。
3. **在 `utilities` 层写普通 CSS**：一次性覆盖某条规则，优先级与内置 utility 同级。

选哪一个，看你要改的是「值」还是「某条规则」：

| 目标 | Tailwind v3 | Tailwind v4 |
| --- | --- | --- |
| 改一个 token 值 | `theme.extend.colors.x` | 同名 `--color-x` |
| 换整套色板 | `theme.colors = {…}` | `--color-*: initial` + 自定义 |
| 加工具类 | `addUtilities` | `@utility` |
| 一次性覆盖某条规则 | 普通 CSS + 特异性 | `utilities` 层普通 CSS |

`@apply` 在 Tailwind v4 里还在，但在 Vue/Svelte 的 `<style>` 或 CSS Modules 里使用时，要先 `@reference "../app.css"`，否则找不到主题变量和自定义 utility。

### 9.3 utility 之间打架：class 顺序不算数

```tsx
<div className="px-2 px-4" />
```

这两个类谁赢，取决于生成后的 CSS 顺序，不取决于你在 `className` 里先写哪个。Tailwind v3 和 v4 都一样。需要确定顺序时，不要依赖书写顺序，改用语义类放进 `components` 层，或者用 `@utility` 起一个明确的名字。

### 9.4 utility 和 antd 打架：由层决定

在 Tailwind v4 + antd v6 里，前提是 antd 已经通过 `StyleProvider layer` 进了 `@layer antd`。配好之后，`utilities` 层排在 `antd` 之后，下面这行不需要任何 `!important`：

```tsx
<Button type="primary" className="rounded-full hover:bg-primary-hover">
  保存
</Button>
```

没有配置层的话，结论完全相反：antd 的运行时注入样式无层级，会赢过 `utilities`，同样的类看起来「没生效」。这也是为什么旧栈里大家习惯性加 `!important`，而新栈里应该先检查层。

### 9.5 旧世界里最容易失效的三个习惯

**习惯一：用 `corePlugins: { preflight: false }` 关掉 preflight。** Tailwind v4 的 `@config` 兼容层不支持这个选项，要改成不导入 `tailwindcss/preflight.css`（见第 6 节）。

**习惯二：`darkMode: "class"`。** Tailwind v4 用变体声明代替：

```css
@custom-variant dark (&:where(.dark, .dark *));
```

之后 `dark:bg-surface-2` 仍然照写，但生成的选择器是「在 `.dark` 里面」而不是「`.dark` 的后代」那种旧写法。

**习惯三：用 `plugin(addUtilities)` 加工具类。** Tailwind v4 里直接写 `@utility`；`plugin(addVariant)` 则换成 `@custom-variant`。旧的 config 文件还能用 `@config` 加载，但 `corePlugins`、`safelist`、`separator` 这三个选项不支持，需要按第 6 节的方式改写。

### 9.6 三个常见误解

**误解一：antd v6 暴露了 `--ant-*`，Tailwind 直接映射这些变量就行。** 变量挂在组件根节点的作用域类上，不是全局 `:root`；自己的标记默认读不到。要么固定 key 并把作用域类加到根节点，要么在构建期把 token 预计算成全局变量。两条路的取舍在桥接篇。

**误解二：`@theme` 就是「把 config.js 换成 CSS 写法」。** 语义上还多了一条解析时机：普通 `@theme` 在定义处解析，`inline` 在使用处解析。暗色能不能工作，差别就在这一条。

**误解三：层配好了就能覆盖一切。** 层只裁决「进了层的样式」。第三方库运行时插入的 `<style>`、组件里手写的 `<style>` 仍然是无层级样式，会赢过所有层。遇到压不过的样式，先看它在不在层里，再谈特异性。

### 9.7 覆盖手段怎么选

从影响最小的一档开始：

1. 只改一个组件的局部值 → antd component token；
2. 改全局设计输入 → antd seed token；
3. 只改某个实例 → Tailwind utility；
4. 改一类元素的统一规则 → `components` 层或 `@utility`；
5. 需要精确派生值 → 包 `algorithm`。

不要从 `!important` 开始，也不要用 utility 去改本该由 token 控制的东西。后者会让主题切换时出现「一半跟着变、一半不跟着变」的割裂：组件吃 token，你的标记吃写死的值。

### 9.8 utility 和 token 的边界

最后一个判断原则：**token 管「主题语义」，utility 管「这一次布局和状态」。** 颜色、字号、圆角这类会随主题变的值，应该来自 token；间距、对齐、宽高这类与主题无关的，直接用 utility。

反过来，如果某个颜色只在一个地方用、且确定永远不随主题变，写成任意值（`bg-[#f5f4ec]`）也合理；但要清楚它不会跟着暗色走。用错边界的代价不是编译报错，而是某天切主题时发现颜色没变。

## 10. 把贯穿例子完整走一遍

把前面的碎片拼成两份可运行的配置。目标还是那两个：主色按钮 hover 换色 + 全圆角；卡片用主题的分隔线色和容器底色。

### 10.1 v3 + antd v4

```js
// webpack.config.js
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

```js
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        primary: "#BA5B37",
        "primary-hover": "#943F25",
        split: "#DBD9D0",
        surface: { 1: "#F5F4EC" },
      },
      borderRadius: { md: "12px" },
    },
  },
};
```

```tsx
import "antd/dist/antd.less";
import "./tailwind.css";

<Button type="primary" className="rounded-full hover:bg-primary-hover">保存</Button>
<Card className="custom-card">…</Card>
```

```css
/* 覆盖 antd 内部状态，通常要叠选择器或 !important */
.custom-card.ant-card { border-color: #DBD9D0; }
.ant-btn-primary:hover { background-color: #943F25 !important; }
```

### 10.2 v4 + antd v6

```css
/* main.css */
@layer theme, base, antd, components, utilities;

@import "tailwindcss";

@theme {
  --color-primary: #BA5B37;
  --color-primary-hover: #943F25;
  --color-split: #DBD9D0;
  --color-surface-1: #F5F4EC;
  --radius-md: 12px;
}
```

```tsx
// main.tsx
import { ConfigProvider } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";

<StyleProvider layer>
  <ConfigProvider theme={{ token: { colorPrimary: "#BA5B37" } }}>
    <App />
  </ConfigProvider>
</StyleProvider>;
```

```tsx
<Button type="primary" className="rounded-full hover:bg-primary-hover">保存</Button>
<Card className="border-split bg-surface-1">…</Card>
```

### 10.3 两份配置差在哪

| 消失了 | 出现了 |
| --- | --- |
| `modifyVars` / less-loader | `theme={{ token }}` |
| `corePlugins.preflight` | `@layer` 声明 + preflight 默认开启 |
| 组件 Less 变量覆盖 | `theme.components.*` |
| 为覆盖加的选择器和 `!important` | `utilities` 层 |
| 为暗色单独编译一套 CSS | 变量切换（下篇展开） |

这张表也解释了为什么不要把 Tailwind v3 的写法硬搬：不是 API 名字变了，是每一条覆盖都换了裁决机制。

### 10.4 建议的迁移顺序

1. **先升 antd**：把 Less 主题逐项映射到 `theme.token` / `theme.components`，先不追求像素级一致，跑通为主。
2. **再升 Tailwind**：把 `tailwind.config.js` 翻成 `@theme`；翻不完就先 `@config` 兼容，别停在这一步。
3. **补层序**：声明 `@layer theme, base, antd, components, utilities`，给 antd 加 `StyleProvider layer`，删掉为覆盖加的 `!important`。
4. **改暗色**：从「两套 CSS」改成「一套变量 + 算法/变量切换」。
5. **验证**：按 8.6 的三个动作逐项检查，重点是派生值和暗色跟随。

顺序不要反过来。先补层序再升 Tailwind，会在配置还没稳定时反复调层；先改暗色再升 antd，会同时动两套主题变量，很难定位问题。

## 11. 一张速查表，和下一篇

| 你要做的事 | Tailwind v3 + antd v4 | Tailwind v4 + antd v6 |
| --- | --- | --- |
| 改主色 | `modifyVars` 改 `primary-color` | `theme.token.colorPrimary` |
| 钉死派生色 | 改对应的 Less 变量 | 包一层 `algorithm` |
| 改组件局部 | 覆盖组件 Less 变量 | `theme.components.Button.*` |
| 新增语义色 | `theme.extend.colors` | `@theme { --color-* }` |
| 新增复合 utility | `plugin(addUtilities)` | `@utility` |
| 新增变体 | `plugin(addVariant)` | `@custom-variant` |
| 暗色变体 | `darkMode: "class"` | `@custom-variant dark` |
| 关掉 preflight | `corePlugins.preflight: false` | 不导入 `preflight.css` |
| 覆盖裁决 | 特异性 + 加载顺序 | 原生级联层顺序 |
| 运行时换主题 | 重新编译（或实验性 CSS 变量模式） | 换 `theme` 对象 / 换变量 |

如果只记三件事：

1. 改主题：找 seed 和 component，不要写 map/alias。
2. 加/改 utility：用 `@theme` 和 `@utility`，别再改 config 文件。
3. 覆盖打架：先看层，不要先上 `!important`。

### 11.1 术语表

| 术语 | 一句话 |
| --- | --- |
| seed token | 你拧的旋钮，作为算法的输入 |
| map token | 算法从 seed 派生的色板与尺度 |
| alias token | 语义角色，如文字、容器、边框 |
| component token | 单个组件自己的局部变量 |
| algorithm | 把 seed 算成 map/alias 的函数 |
| cssinjs | 运行时把样式对象注入 `<style>` 的方案 |
| `StyleProvider` | cssinjs 的配置入口，`layer` 决定是否进层 |
| utility | Tailwind 生成的原子类，如 `bg-primary` |
| variant | `hover:`、`dark:` 这类前缀 |
| `@theme` | Tailwind v4 在 CSS 里声明设计变量的指令 |
| `@theme inline` | 让 utility 直接内联变量值的变体 |
| cascade layer | 浏览器原生的样式优先级分组 |

### 11.2 三个小练习

**练习一**：把 Tailwind v3 的 `theme.extend.colors.primary = "#BA5B37"` 改成 Tailwind v4 写法。

答案：`@theme { --color-primary: #BA5B37; }`。

**练习二**：Tailwind v3 的 `darkMode: "class"` 在 Tailwind v4 里对应什么？

答案：`@custom-variant dark (&:where(.dark, .dark *));`，同时把 `.dark` 放在根节点。

**练习三**：`colorPrimaryHover` 能不能写在 `theme.token` 里？为什么？

答案：不建议。它是 map 层，由算法从 `colorPrimary` 派生；写了可能被重算覆盖。要精确控制就包 `algorithm`。

上篇到这里。你已经知道新版的概念长什么样、覆盖该写在哪。但还剩一个关键问题没回答：**antd 的 token 和 Tailwind 的 utility 怎么共用同一套值？** 这需要把 antd 的主题解析成 CSS 变量，再用 `@theme inline` 接进 Tailwind；同时还要把 `@layer` 和 `StyleProvider layer` 配到位。

那是下篇（桥接篇）的内容，TODO：

- 一条 token 管线的两条出口：运行时映射 `--ant-*` vs 构建期预计算成本地变量；
- `@layer theme, base, antd, components, utilities` 与 `<StyleProvider layer>` 的完整配置；
- 暗色策略：`prefers-color-scheme` 与 `.dark` 怎么共存；
- 一次完整迁移的配置对照和验收清单。
