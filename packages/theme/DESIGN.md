# 设计规范：Paseo Dark × Claude Light

本文档说明 `paseo-antd-themes` 导出的主题**应该怎么用**：每个 token 代表什么、什么时候选它、哪些组合是禁止的。

- 逐 token 的精确取值与取色来源见 [MAPPING.md](./MAPPING.md)（生成物，以它为准）。
- 色板、字阶、间距、阴影、圆角的一页式总览见 `preview.html`（生成物，随包发布）。
- 安装与 API 见 [README.md](./README.md)。

本文只写规则，不写色值：颜色一律引用 token 名，需要看具体色值时查上面两份生成物。

## 概述

| 导出 | 形态 | 适用场景 |
| --- | --- | --- |
| `paseoDarkTheme` | 深色：青绿调表面 + 绿色身份 | 夜间、终端 / agent 工作流、长时间驻留的控制台 |
| `claudeLightTheme` | 浅色：Claude 奶油纸感 + clay 主色 | 日间、评审 / 文档、Claude 品牌场景 |
| `antdLightTheme` / `antdDarkTheme` | antd 原生配色 + 本包形态 | 迁移对照、只换配色的存量页面 |
| `extendTheme(base, …)` | 从以上任一套派生 | 只换品牌色 / 单个 token，其余保持不变 |

`paseoDarkTheme` 与 `claudeLightTheme` **共享同一套形态规格**——40px 控件、14px 正文、12px 圆角、4px 栅格、软阴影、44px Select 行高——只是颜色相反。因此同一份页面代码换槽位不需要改尺寸。

`antdLightTheme` / `antdDarkTheme` 的颜色完全遵循 [antd 自身的设计规范](https://ant.design/design.md)，形态则与本包其余主题一致（同样的控件高度、圆角、Select 行高和字体栈），所以「antd 亮 + Paseo 暗」这类混搭切换不跳尺寸；要连尺寸都逐像素等于 antd，自己传 antd 的 algorithm 即可。

三条总规则，其余章节都是它们的展开：

1. **颜色只从 token 取**：antd 组件吃 `ConfigProvider` 主题，自己的标记吃 Tailwind 类（`bg-surface-1`、`text-text-secondary`）或 `theme.useToken()`。任何 `#` 开头的字面量都是 bug。
2. **文字对比度按档位设门槛**（见[对比度门槛](#对比度门槛)），非文字图形 ≥ 3:1。内置值已按此校准，并由 `tests/` 里的断言守住；改色必须重新过线。
3. **一屏只有一个主操作**。主色是稀缺资源，不是强调色。

### 形态是怎么定下来的

这套形态是三个自觉的选择，不是 antd 的默认值：

| 轴 | 选择 | 落到哪 |
| --- | --- | --- |
| 严肃 ↔ 活泼 | 严肃（控制台、长时间驻留） | 圆角止步于 12px，不做胶囊、渐变、装饰色块；强调靠层级不靠色彩面积 |
| 经典 ↔ 现代 | 现代 | 中性无衬线系统栈；灰阶带温度（浅色偏奶油、深色偏青绿），全系统不用纯灰 |
| 密集 ↔ 宽敞 | 密集 | 正文 14px（不是 16）、控件 40px、工作间距落在 8 / 12 / 16 |

要改这套性格，改的是 `fontSize`、`borderRadius`、`sizeUnit` 这些源头值，不是逐页调样式。

## 颜色

### 表面：三层 + 三个定点槽

页面由「底 → 容器 → 浮层」三层构成，**永远不要出现第四层**；侧栏、面板头、hover 是同一体系里的定点槽位，不是新层级。

| 角色 | antd token | Tailwind | 用在哪 |
| --- | --- | --- | --- |
| 页面底 | `colorBgLayout` / `paseoSurface0` | `bg-layout` / `bg-surface-0` | Layout body、页面空白区、Segmented 轨道 |
| 容器 | `colorBgContainer` / `paseoSurface1` | `bg-container` / `bg-surface-1` | 卡片、输入框、默认按钮、面板、表格底 |
| 浮层 | `colorBgElevated` / `paseoSurface2` | `bg-elevated` / `bg-surface-2` | 弹层、下拉、Modal、Message、Segmented 选中滑块 |
| 侧栏 | `paseoSurfaceSidebar` | `bg-surface-sidebar` | Sider、Menu 底色 |
| 面板头 | `paseoSurfaceHead` | `bg-surface-head` | Card 头（表格表头与表格同底，不用它） |
| 卡片 hover | `paseoSurfaceHover` | `bg-surface-hover` | 卡片 / 表格行 hover |
| 强填充 | `paseoSurface3` / `paseoSurface4` | `bg-surface-3` / `bg-surface-4` | 控件内需要压过邻近表面的填充：菜单 hover / 选中、进度轨道 |

规则：

- **浅色靠边框和阴影分层，深色靠亮度分层**。浅色卡片只比页面亮约 1.06，必须带 `border-border`；深色的层次已经由亮度拉开，边框保持默认的 `border-secondary` 即可，不要加粗。不要反过来。
- **hover 跟着它所在的表面走**：白卡上的行 hover 用 `bg-surface-hover`（浅色）/ `bg-surface-1`（深色）；侧栏里的菜单 hover 用 `bg-surface-3`（浅色）/ `bg-surface-1`（深色）、选中用 `bg-surface-4`（浅色）/ `bg-surface-2`（深色）。不要拿 `bg-surface-2` 去做卡片 hover——那是浮层色，会让卡片看起来被抬起来。
- 浮层与底之间用阴影区分（见[层次与阴影](#层次与阴影)），不要在已经有阴影的浮层上再加一圈边框。
- **深色没有「纸上纸」**：`surface-head` / `surface-hover` 在深色下就是面板色 `surface-1`。这是 token 本身的值，不是 Tailwind 层的特例——`theme.useToken()` 和工具类拿到的是同一个结果。
- `bg-layout` / `bg-container` / `bg-elevated` 与 `bg-surface-0/1/2` 同值双名：前者对齐 antd token 名，后者表达层级。自己的标记统一用 `bg-surface-*`。
- `colorFill` 阶梯（`fill` / `fill-secondary` / `fill-tertiary` / `fill-quaternary`）是 antd 组件内部在用的填充色：hover、禁用、斑马纹。写自己的标记时优先用 `bg-surface-*` 表达「这是哪一层」。

### 文字：四档，但只有三档可读

| 档位 | antd token | Tailwind | 用途 |
| --- | --- | --- | --- |
| 一 · 正文 | `colorText` | `text-text` | 正文、标题、表格内容、菜单选中 |
| 二 · 次要 | `colorTextSecondary` | `text-text-secondary` | 说明、副标题、标签名、菜单未选中 |
| 三 · 三级 | `colorTextTertiary` | `text-text-tertiary` | 元信息、时间戳、帮助文本、图标 |
| 四 · 四级 | `colorTextQuaternary` | `text-text-quaternary` | **只给禁用态与占位符**，不是正文层级 |
| 反白 | `colorTextLightSolid` | `text-text-light-solid` | 实心按钮 / 状态标签上的文字 |

规则：

- **降级强调用 `text-text-secondary`，不要用 `opacity`**。主题已经给了四档，`opacity: 0.6` 在不同表面上会落进对比度盲区。
- **四级不参与正文判读**：它承接 `colorTextPlaceholder` / `colorTextDisabled`（antd 从四级派生），占位符低于 4.5:1 属库行为，已知情接受；不要再在此基础上往下降，也不要用它写任何需要读的内容。
- 三级是有边界的档位：对页面底与容器承诺 4.5:1，对面板头、hover 填充、浮层承诺 4.0:1。**低于 4.0 的表面（强填充）上禁止使用三级。**
- 表格数字、ID、代码、diff 内容用 `font-mono`；金额和统计加 `tabular-nums` 保持列对齐。
- 标题不需要单独颜色：用 `text-text` + 字重 600 表达层级。

#### 对比度门槛

| 档位 | 页面底 / 容器 | 面板头 / hover 填充 / 浮层 | 强填充（`surface-3` / `surface-4`） |
| --- | --- | --- | --- |
| 一 · 正文 | ≥ 4.5 | ≥ 4.5 | 不承载文字 |
| 二 · 次要 | ≥ 4.5 | ≥ 4.5 | 不承载文字 |
| 三 · 三级 | ≥ 4.5 | ≥ 4.0 | 禁用 |
| 四 · 四级 | 不参与（仅禁用 / 占位） | — | — |

强填充只做控件底色与进度轨道，**不放文字**：深色二级在 `surface-3` / `surface-4` 上只有 3.83 / 2.75，任何档位都不安全。

实测值（`preview.html` 里有完整矩阵）：

| 档位 | 浅色 页面 / 容器 / 浮层 | 深色 页面 / 容器 / 浮层 |
| --- | --- | --- |
| 一 · 正文 | 9.56 / 10.15 / 11.20 | 16.62 / 15.55 / 13.88 |
| 二 · 次要 | 6.43 / 6.83 / 7.53 | 6.97 / 6.52 / 5.82 |
| 三 · 三级 | 5.12 / 5.44 / 6.00 | 5.23 / 4.90 / 4.37 |
| 四 · 四级 | 2.50 / 2.66 / 2.93 | 2.54 / 2.37 / 2.12 |

三级在浅色面板头 4.41、卡片 hover 4.25，都落在 4.0 以上、4.5 以下——这正是上表第二列单独设 4.0 的原因：行 hover 是状态变化，文字不会跟着换档。深色二级在 `surface-3` / `surface-4` 上只有 3.83 / 2.75，所以强填充表面不承载文字。

> 三级单独设 4.0 是对 WCAG AA（小号正文只有 4.5 一档）的一次**有意偏离**，范围仅限补充性元信息，且写进了测试。改色时按上表重新验。

### 主色、链接与语义色

| 角色 | antd token | Tailwind | 用途 |
| --- | --- | --- | --- |
| 主色 | `colorPrimary` 族 | 背景 / 图形：`bg-primary`、`border-primary`、`*-primary-hover/active`；文字：`text-primary-text` | 主按钮、勾选类控件的选中态、焦点环、进度 |
| 链接 | `colorLink` 族 | `text-link`、`text-link-hover`、`text-link-active` | 只有可点击的文字链接，与主色同族 |
| success | `colorSuccess` 族 | `bg-success`、`text-success` 等 | 成功、通过、新增 |
| warning | `colorWarning` 族 | `bg-warning` 等 | 警告、待处理 |
| error | `colorError` 族 | `bg-error` 等 | 失败、危险操作、删除 |
| info | `colorInfo` 族 | `bg-info` 等 | 中性提示、进行中 |

规则：

- **主色只给「这一屏最重要的那个操作」**。一个区块出现两个 primary 按钮，就等于没有主操作。视图切换、导航选中优先用表面色（`surface-3` / `surface-4`、`surface-2`）；只有带勾选语义的控件（Radio、Checkbox、Select 选项）才用主色。
- **彩色文字用 `text-primary-text`**（`colorPrimaryText`）。`text-primary` 是主色本身：浅色下当正文只有 3.86:1，深色 3.02:1，只适合大字号或图标、进度这类图形。
- **链接与主色同族**：浅色取主色的 text 档（4.86 / 5.17），深色取更亮的绿（9.01 / 8.43）。整套界面只有一个品牌色相，不再单独引入链接蓝；hover / active 都在同族内加深。
- **语义色只表达状态**，不做装饰背景、不做分类标签的默认色。分类、图表请用身份色（见下）。
- 主按钮上的白字是逐档校准过的：浅色 4.53:1、深色 5.74:1，刚好过线。**不要用更浅的品牌装饰色做按钮底色**——那个颜色不在本包 token 里，白字只有 3.1:1。
- **深色的语义色是文字档，不是填充档**：`colorError` 在深色是浅红（作文字 6.20:1），antd 的实心 danger 按钮会直接拿它当底色；主题为此把标签改成墨字（`Button.dangerColor`，5.95:1），但视觉上仍是一块浅色。确认类操作优先用描边 danger。
- 需要换品牌色时用 `extendTheme` 覆盖 `colorPrimary`，它会重建整个十槽色族；直接嵌套 `ConfigProvider theme={{ token: { colorPrimary } }}` 会被算法覆盖，详见 README 的「从一个内置主题扩展」。

### 扩展色：状态点、diff、身份色、选区

| 用途 | antd token | Tailwind | 说明 |
| --- | --- | --- | --- |
| 状态点 | `paseoStatusDotSuccess/Danger/Warning/Running` | `bg-status-dot-success` 等 | 小圆点、徽标、运行状态；比正文语义色更亮，只做非文字图形 |
| 已合并 | `paseoStatusMerged` | `bg-status-merged` | 合并类状态，唯一允许的紫色语义 |
| diff 行底 | `paseoDiffAddition` / `paseoDiffDeletion` | `bg-diff-addition` / `bg-diff-deletion` | 整行背景，只负责「哪一行是增 / 删」 |
| diff 文字 | `paseoDiffAdditionText` / `paseoDiffDeletionText` | `text-diff-addition-text` 等 | 行外统计（`+12 −3`）与深色下的行内高亮 |
| 身份色 | `paseoIdentity*`（10 色） | `bg-identity-violet` 等 | 主机 / agent / 项目标识 |
| 身份色文字 | `paseoIdentityInk` | `text-identity-ink` | 身份色块上的文字：浅色白字、深色墨字 |
| 选区 | `paseoSelection` | `selection:bg-selection` | `::selection` 背景，不要手写半透明色 |

规则：

- 状态点与语义色是两套：**文字用 `text-success`，点用 `bg-status-dot-success`**。状态点是按「非文字图形」调过的亮度（深色下明显更亮），语义色是按文字阈值调的，两者不要互相顶替。
- **diff 的两组值不要混用。** 行底只标增删，行内文字继承正文色（浅色 9.10 / 8.75，深色 7.86 / 8.49）；`diff-*-text` 用在行外统计上（对页面底 6.78 / 6.20）。
- **深色下不要把 `diff-*-text` 铺回行底**——那是 3.21 / 3.17，不到 4.5。浅色下这两者可以同用（5.14 / 5.38），深色不行，因为深色的 diff 文字直接复用了状态色。
- 身份色按等响度归一化，色块上的文字一律用 `paseoIdentityInk`：浅色是白字（4.72–5.19），深色是墨字（5.85–6.45）。不要假设白字在深色下可用——那十条浅彩色配白字只有 2.75。不要从中挑一个再调亮，色相只负责「是谁」，不负责「多重要」。

### 边框与分隔

| 角色 | antd token | Tailwind | 用途 |
| --- | --- | --- | --- |
| 外框 / 控件边框 | `colorBorder` | `border-border` | 卡片外框、输入框、默认按钮边框 |
| 轻分隔 | `colorBorderSecondary` | `border-border-secondary` | 表头分隔、分组边界 |
| 行内分隔 | `colorSplit`（派生） | `border-split` | 表格行线、列表分隔、Card 分区 |

规则：一张卡最多一层外框；表格只用 `border-split` 画行线，不要每行都描 `border-border`。边框永远 1px（`lineWidth`），不存在「加粗边框表达选中」，选中用背景或主色。2px（`lineWidthBold`）只归 antd 自己的指示器（Tabs ink bar、Segmented 滑块），不要手写。

### 遮罩、Tooltip 与派生 token

- 遮罩用 `colorBgMask`。Modal / Drawer / 图片预览都用它，不要自己写半透明黑。
- Tooltip 用 `colorBgSpotlight`：浅色固定为深墨配白字，深色用 `surface-2`。Tooltip 故意不跟着页面变浅，以保证在任何表面上都可读。
- 下面这些 token 由 antd 从上游派生，**只读，不要手设**；改色时只改上游值：

| 派生 token | 来自 | 用在哪 |
| --- | --- | --- |
| `colorSplit` | `colorBorderSecondary` over `colorBgContainer` | 表格行线、列表分隔 |
| `colorTextPlaceholder` / `colorTextDisabled` | `colorTextQuaternary` | 占位符、禁用文字 |
| `colorTextHeading` | `colorText` | 标题 |
| `colorTextLabel` | `colorTextSecondary` | 表单标签 |
| `colorTextDescription` | `colorTextTertiary` | 描述 / 帮助文字 |
| `colorIcon` | `colorTextTertiary` | 图标默认色 |
| `colorFillAlter` | `colorFillQuaternary` | 表格斑马纹、交替底色 |
| `colorFillContent` / `colorFillContentHover` | `colorFillSecondary` / `colorFill` | 内容区底色及其 hover |
| `colorBgContainerDisabled` | `colorFillTertiary` | 禁用输入框 / 卡片 |
| `controlItemBgHover` / `controlItemBgActive` | `colorFillTertiary` / `colorPrimaryBg` | 选项 hover / 选中 |
| `controlOutline` | `colorPrimaryBg` over `colorBgContainer` | 控件焦点外框 |

## 字体与排版

| 角色 | token | Tailwind | 值 |
| --- | --- | --- | --- |
| 界面字体 | `fontFamily` | `font-sans` | 系统栈（`system-ui` 优先） |
| 等宽字体 | `fontFamilyCode` | `font-mono` | `SFMono-Regular` 优先的等宽栈 |

### 字号阶梯

| 用途 | token | Tailwind | px | 行高 |
| --- | --- | --- | --- | --- |
| 小号元信息 | `fontSizeSM` | `text-caption` | 12 | 20 |
| 正文 / 控件 / 表格 | `fontSize` | `text-body` | 14 | 22 |
| 强调正文 | `fontSizeLG` | `text-subtitle` | 16 | 24 |
| 卡片标题 | `fontSizeHeading5` | `text-subtitle` | 16 | 24 |
| 区块标题 | `fontSizeHeading4` | `text-heading-sm` | 20 | 28 |
| 页面标题 | `fontSizeHeading3` | `text-heading` | 24 | 32 |
| 大屏标题 | `fontSizeHeading2` | `text-heading-lg` | 30 | 38 |
| 极少使用 | `fontSizeHeading1` | `text-display` | 38 | 46 |

- 只有 **12 / 14 / 16** 是显式 pin 过的；标题的 16 / 20 / 24 / 30 / 38 由 antd 从 `fontSize` 派生。**不要手写标题字号**，用 `Typography.Title level={1..5}` 或上表的 token。
- Tailwind 自带的 `text-sm` / `text-base` / `text-4xl` 等刻度**没有被覆盖**：`text-sm` 恰好等于正文 14，但 `text-4xl` 是 36，与 `text-display` 的 38 不同。写页面时用上表右列的名字，不要混用两套刻度。
- 正文固定 14px：40px 控件配 14px 是这套主题的密度基准，改用 16px 会让 Agent 列表、表单、表格并排时显得拥挤。
- 字重只用 400 / 600（`fontWeightStrong`）：正文 400，标题与强调 600。不要用 500 或 700 造中间层级。
- 行高随字号派生（正文 1.57、小号 1.67、大号 1.5、标题 1.21–1.5），`text-*` 工具类已经带上了配对行高。长文段落可以放宽到 1.5–1.7，标题可以收到 1.25——**这是唯二允许偏离派生值的地方**，不要逐块手设。
- 行宽 **45–75 字符（约 20–35em）**。演示站的规范页容器是 70em，超出这个区间一倍——长文档页要单独收窄容器，不要把整页宽度当行宽。
- 数字列、金额、统计加 `tabular-nums`。

## 布局与间距

- 栅格是 **4px**（`sizeUnit` / `sizeStep`）。刻度 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48；**工作档位是 8 / 12 / 16**，4 只给图标与文字的贴合间距，20 及以上只给区块之间与页面留白。出现 13px、18px、7px 说明设计还没对齐。
- **组外间距必须大于组内间距**：卡片内元素 8，卡片之间 16，区块之间 32。三者相等时，分组就消失了——这一条能解决大部分「为什么这块看起来乱」。
- 控件高度：默认 40、小号 32、大号 48（`controlHeight` / `SM` / `LG`）。不要把两档混排在同一行。
- 内边距：`padding` 16、`paddingSM` 12、`paddingXS` 8、`paddingXXS` 4、`paddingLG` 24；卡片正文与表单分区用 16 / 24。
- 页面骨架：Layout body 用 `bg-layout`，Sider 用 `bg-surface-sidebar`，Header 与 body 同色（`headerBg = surface0`）。Header 自身没有边框 token，需要与内容分隔时自己画 1px `colorSplit` 下边框。
- Select 行高是 44（`optionHeight`），由 `optionPadding: 9px 12px` 加上 Provider 注入的上下 2px 透明边框组成；开启虚拟滚动时必须同时传 `<Select listItemHeight={44}>`，否则行高估算错位。

## 层次与阴影

阴影只有三级，其中两级给页面作者用：

| 角色 | token | Tailwind | 用在哪 |
| --- | --- | --- | --- |
| 极轻 | `boxShadowTertiary` | `shadow-raised` | 默认按钮、`hoverable` 卡片的悬浮态 |
| 浮层 | `boxShadowSecondary` | `shadow-overlay` | Dropdown、Modal、Popover、Notification |
| 基础 | `boxShadow` | 不导出 | antd 组件内部使用，不要主动加到自定义区块上 |

- **flat-first**：静止的页面区块不加阴影，靠表面色和边框分层；只有真正浮在页面之上的层才加 `shadow-overlay`。
- 光从上方来：抬起的层 = 更亮的顶边 + 下方一小片清晰阴影。不要给卡片叠第二层阴影表达 hover；hover 改背景（`surface-hover`）即可。
- 浅色阴影用暖墨色，深色用纯黑；不要手写半透明黑。

## 形态（圆角）

| 档位 | token | Tailwind | 落点 |
| --- | --- | --- | --- |
| 大 | `borderRadiusLG` / `borderRadius` | `rounded-md` / `rounded-lg`（12px） | Card、Modal、Alert、默认控件（Button / Input / Select） |
| 中 | `borderRadiusSM` | `rounded-sm`（8px） | 小号控件、Tag |
| 小 | `borderRadiusXS` | `rounded-xs`（4px） | 极小徽标、代码片段内联块 |

- 只用 12 / 8 / 4 三档，不要出现 6、10、14。
- 圆角随控件尺寸整体缩放：同一行的控件要么全用默认档，要么全用小号档，不要一个 12 一个 8。
- 头像、开关、Badge 计数等圆形 / 胶囊形由组件自身决定，不在这三档之内。

> 与「一个圆角应用到所有组件」的常规做法不同，这里按控件尺寸分三档。这是**有意的**：antd 的模型本身就是 XS / SM / base / LG 四档，本包收窄到三档并绑定控件尺寸。阴影同理，只有 antd 下发的三个槽，不额外造级。

## 组件规范

下表是「主题已经替你配好的部分」和「你写页面时该守的规则」。所有组件 token 都随主题下发，不需要你在项目里再覆盖。

| 组件 | 主题已配 | 使用规则 |
| --- | --- | --- |
| Button | 主按钮白字、hover/active 加深、三级投影；深色实心 danger 用墨字 | 每个区块最多一个 `type="primary"`；次级操作用默认按钮；第三级用 `type="text"`；删除才用 `danger`，确认类操作优先描边（`danger` + 默认类型）。loading 图标由 Provider 统一，不要自己传 |
| Input / Select | 边框色、hover/active 主色、12px 圆角、40px 高 | 错误态交给 `status="error"`，不要手写红边框；Select 的长列表见上文 `listItemHeight` |
| Card | `surface-1` 底、12px 圆角、头用 `surface-head`、默认无阴影 | 卡片是页面上的「纸」，不要嵌套三层卡片；卡片头与正文之间用 `border-split`；`hoverable` 才出现 `shadow-raised` |
| Table | 表头与表格同底（`surface-1`，靠字重 + `border-split` 行线区分）、行 hover `surface-hover`、行线 `border-split`、斑马纹 `colorFillAlter`（派生自 `fill-quaternary`） | 斑马纹与行 hover 不要同时开；数字列右对齐并用 mono；空态用 Empty，不要自己画 |
| Segmented / Tabs | Segmented：`Segmented.trackBg`（亮暗都用页面底 `surface0`）+ 4px 内边距 + 4px 项间距；Tabs：ink bar 主色 | 两者都表达「切视图」，同一区域只选一个；Segmented 选项不超过 5 个 |
| Menu / Layout | 侧栏底 `surface-sidebar`，hover/选中按表面分层 | 侧栏菜单只用一级图标 + 文字，不塞按钮组；选中项由路由决定，不要手写背景 |
| Tag / Badge | Tag 8px 圆角；Badge 用胶囊 / 圆点 | 状态用语义色的 text/bg 槽；分类用身份色；Tag 里不放可点击的主操作 |
| Alert / Message / Notification | Alert：状态色底 + 12px 圆角；Message / Notification：浮层 `surface-2` | Alert 常驻、Message 瞬时；同一条消息不要同时用两种；错误文案要说「怎么修」 |
| Modal / Drawer | `surface-2`、`shadow-overlay` | 表单类用 Drawer，确认类用 Modal；一个 Modal 只做一件事 |
| 加载态 | `PaseoLoadingIcon`（Button / Spin / Select 已自动替换） | 局部加载用 Spin，整块内容用 Skeleton；不要让页面出现两个转圈 |
| Diff | 行底 + 行内高亮 + 行外统计三档 token | 行底只标增删，行内文字继承正文色，统计用 `diff-*-text`；不要用 `success` / `error` 直接铺行底 |

## 操作层级

一屏之内：

- **一个主操作**（`type="primary"`）：这一屏用户最该做的事。没有就留空，不要为了「看起来完整」硬塞一个。
- **少量次操作**（默认按钮）：与主操作同级但次要的动作。
- **若干第三级操作**（`type="text"` / 图标按钮）：行内操作、更多菜单。

**危险操作不自动等于大声的操作**。删除用 `danger`，但确认类交互优先「描边 danger + 默认类型」，只有真正不可逆且高频的动作才用实心 danger。深色下实心 danger 是一块浅色（因为语义色是文字档），视觉重量远大于它的语义——用之前先问是否必要。

## 不在系统里的东西

先分清两种情况：**antd 有 token、本包没导出成工具类**，和**根本没有任何 token**。前者是导出范围的边界，后者才是设计缺口。

### antd 有 token，但没进 Tailwind 导出

| 项 | token | 值 |
| --- | --- | --- |
| 断点 | `screenXS` … `screenXXXL` | 480 / 576 / 768 / 992 / 1200 / 1600 / 2000 |
| 动效时长 | `motionDurationFast` / `Mid` / `Slow` | 0.1s / 0.2s / 0.3s |
| 缓动 | `motionEaseOut` 等 | antd 内置曲线 |
| 层级 | `zIndexBase` / `zIndexPopupBase` | 0 / 1000 |
| 图标尺寸 | `fontSizeIcon` | 12 |
| 焦点框 | `controlOutline` / `controlOutlineWidth` / `lineWidthFocus` | 2px / 3px |
| 间距刻度 | `sizeXXS` … `sizeXXL` | 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 |

用 antd 组件时这些自动生效；自己写标记时要显式取（`theme.useToken()` 或 antd 的 `Grid.useBreakpoint`），**不要手写第二份**——写 `0.2s`、`9999`、`768px` 都是在绕过系统。

### 真的没有 token

| 项 | 现状 | 缺了怎么办 |
| --- | --- | --- |
| 字距 `letter-spacing` | 全系统无 | 默认不动；全大写标签需要时加一档（0.02em 级别），不要逐处调 |
| 不透明度 `opacity` | 只有 `opacityImage` / `opacityLoading` 两个组件用值 | **不要用 opacity 做强调降级**，用文字档位或表面档位 |
| 宽度刻度 | 无 `max-width` / 栅格列宽 token | 先复用整百值（980 / 720 / 480），第二次用到时加 token |

**通用规则：缺一个值时，加 token，不要写字面量。** 同一个字面量出现第二次，就是它在申请成为 token。

## 该做与不该做

| ✅ 该做 | ❌ 不该做 |
| --- | --- |
| `className="bg-surface-1 border border-border"` | `style={{ background: "写死的色值" }}` |
| `text-text-secondary` 降低强调 | `opacity: 0.6` |
| 一屏一个 primary 按钮 | 每个卡片都放一个 primary |
| 状态色表达成功 / 失败 | 用 success 绿做装饰色块 |
| 4px 栅格上的 8 / 12 / 16 | 13px、18px、7px 这类魔数 |
| 组外间距大于组内间距 | 卡片内外都用 16 |
| 圆角 12 / 8 / 4 | 圆角 6 / 10，或同一行控件混用 12 和 8 |
| 浮层加 `shadow-overlay` | 给静态卡片叠两层阴影 |
| `text-body` / `text-heading` 走字阶 | `text-lg`（18）这种系统里没有的字号 |
| `extendTheme(base, { token })` 换色 | 嵌套 `ConfigProvider` 传 seed token |
| 用 `text-link` 做链接（主色系 text 档） | 用主色填充色当链接（浅色仅 3.86:1） |
| 彩色文字用 `text-primary-text` | 用 `text-primary` 写正文 |
| 深色 diff 行内高亮用正文色 | 深色把 `diff-*-text` 铺回行底（3.2:1） |
| 换槽位配对后重新生成 `tailwind.css` / `tailwind-vars.css` | 混搭主题 + 默认 Tailwind 产物（工具类会与组件色漂移） |

## 微调 vs 加档

- **调一个已有档位是安全的**：把主色的某一档加深一点，只影响用到它的地方，对比度测试会告诉你有没有踩线。
- **加一档是危险的**：给文字加第五档、给圆角加 6px、给阴影加第四级——每加一档，原有档位就失去「唯一正确选择」的地位，后面每个页面都要重新判断一次。这正是系统退化成「一堆样式」的方式。
- 需要新档位时先问：现有档位里有没有一个能表达这个语义？如果没有，是**替换**某一档，而不是**新增**。

## 定制与覆盖

**换颜色**：`extendTheme(base, { token, components })`。它会重建被覆盖的色族（hover / active / bg / border / text 十个槽位），所以不需要手工填 `colorPrimaryHover`。主题深浅由 `base` 的 `colorBgBase` 自动判断。

**覆盖组件样式**：用 Tailwind 工具类，但要先按 README 配好 `@layer … antd … utilities` 与 `StyleProvider layer`，否则 utilities 压不过 antd 的无层级样式。

**覆盖 Provider 行为**：`PaseoThemeProvider` 会往 DOM 写三个类，需要改这几处时按类覆盖即可。

| 类名 | 作用 | 覆盖写法 |
| --- | --- | --- |
| `.paseo-loading-icon` / `.paseo-loading-spin` | spinner 对齐与内层 `<g>` 旋转 | `.paseo-loading-icon { … }` |
| `.paseo-select-item` | Select 行间 2px 透明间隔（规则本身写成加倍类名以压过 antd） | `.paseo-select-item { … }`，源顺序在包之后即胜 |
| `.paseo-segmented-item` | Segmented 项间 4px 间距 | `.paseo-segmented-item { … }` |

不要改成靶向 `.ant-select-item` / `.ant-segmented-item`：`prefixCls` 一改就静默失效，而且会波及 Provider 之外的 antd 实例。

**暗色策略**：`mode` 支持 `system` / `light` / `dark`；Tailwind 侧同时输出 `prefers-color-scheme` 与 `.dark` 两套变量，类策略需在项目里加 `@custom-variant dark (&:where(.dark, .dark *));`。

**cssVar 模式**：`theme={{ ...claudeLightTheme, cssVar: true }}` 受支持；antd 原生两套的形态与骨架对齐细节见[概述](#概述)。

## 自检清单

写完一屏，过一遍：

- [ ] 颜色全部来自 token，没有 `#` 字面量，没有 `opacity` 降级
- [ ] 只有一个 primary 操作；危险操作没有抢主操作的位
- [ ] 组外间距 > 组内间距；间距全在 4px 栅格上
- [ ] 字号只用了 `text-caption` / `text-body` / `text-subtitle` 或标题档；字重只有 400 / 600
- [ ] 圆角只用了 12 / 8 / 4，同一行控件档位一致
- [ ] 静止区块没有阴影；浮层才有 `shadow-overlay`
- [ ] 三级文字没有落在 `surface-3` / `surface-4` 上
- [ ] 深色下没有把 `diff-*-text` 铺在 diff 行底上；身份色块用 `identity-ink` 而不是白字
- [ ] 新出现的值：是 token 吗？不是的话，为什么不是？
