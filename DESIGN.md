# 设计规范：Paseo Dark × Claude Light

本文档说明 `paseo-antd-themes` 导出的主题**应该怎么用**：每个 token 代表什么、什么时候选它、哪些组合是禁止的。逐 token 的精确取值和取色来源见 [MAPPING.md](./MAPPING.md)（生成物，以它为准）；安装与 API 见 [README.md](./README.md)。

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
2. **文字对比度 ≥ 4.5:1，非文字图形 ≥ 3:1**。内置值已按此校准，并由 `tests/` 里的对比度断言守住；改色必须重新过这条线。
3. **一屏只有一个主操作**。主色是稀缺资源，不是强调色。

## 颜色

### 表面：三层 + 三个扩展槽

页面由「底 → 容器 → 浮层」三层构成，永远不要出现第四层；侧栏、卡片头、hover 是同一体系里的定点槽位，不是新层级。

| 角色 | antd token | Tailwind | 用在哪 | 亮色 | 深色 |
| --- | --- | --- | --- | --- | --- |
| 页面底 | `colorBgLayout` / `paseoSurface0` | `bg-layout` / `bg-surface-0` | Layout body、页面空白区 | `#F0EDE2` | `#181B1A` |
| 容器 | `colorBgContainer` / `paseoSurface1` | `bg-container` / `bg-surface-1` | 卡片、输入框、默认按钮、面板 | `#F5F4EC` | `#1E2120` |
| 浮层 | `colorBgElevated` / `paseoSurface2` | `bg-elevated` / `bg-surface-2` | 弹层、下拉、Modal、Message、Segmented 选中滑块 | `#FFFFFF` | `#272A29` |
| 侧栏 | `paseoSurfaceSidebar` | `bg-surface-sidebar` | Sider、Menu 底色 | `#E2E0D6` | `#141716` |
| 面板头 | `paseoSurfaceHead` | `bg-surface-head` | Card 头（表格表头与表格同底，不用它） | `#E0DDD0` | `#1E2120` |
| 卡片 hover | `paseoSurfaceHover` | `bg-surface-hover` | 卡片 / 表格行 hover | `#DDD9CE` | `#1E2120` |
| 强填充 | `paseoSurface3` / `paseoSurface4` | `bg-surface-3` / `bg-surface-4` | 控件内的强对比填充：菜单 hover / 选中、进度轨道 | `#D7D2C7` / `#D1CCBF` | `#434645` / `#595B5B` |

规则：

- **浅色靠边框和阴影分层，深色靠亮度分层**。浅色卡片只比页面亮 1.06，必须带 `border-border`；深色的层次已经由亮度拉开，边框保持 antd 默认的 `border-secondary` 即可，不要加粗。不要反过来：浅色用亮度差、深色用重边框。
- **hover 跟着它所在的表面走**：白卡上的行 hover 用 `bg-surface-hover`（浅色）/ `bg-surface-1`（深色）；侧栏里的菜单 hover 用 `bg-surface-3`（浅色）/ `bg-surface-1`（深色）、选中用 `bg-surface-4`（浅色）/ `bg-surface-2`（深色）。不要拿 `bg-surface-2` 去做卡片 hover——那是浮层色，会让卡片看起来被抬起来。
- 浮层与底之间用阴影区分（见[层次与阴影](#层次与阴影)），不要在已经有阴影的浮层上再加一圈边框。
- 深色主题没有「纸上纸」的表头概念，`surface-head` / `surface-hover` 在深色下回落到 `surface-1`，这是有意为之，不是缺值。
- `bg-layout` / `bg-container` / `bg-elevated` 与 `bg-surface-0/1/2` 同值双名：前者对齐 antd token 名，后者表达层级。自己的标记统一用 `bg-surface-*`。
- `colorFill` 阶梯（`fill` / `fill-secondary` / `fill-tertiary` / `fill-quaternary`）是 antd 组件内部在用的填充色：hover、禁用、斑马纹。写自己的标记时优先用 `bg-surface-*` 表达「这是哪一层」，只有需要和相邻 antd 组件呼应时才用 `bg-fill-tertiary` 这类语义较弱的名字。

### 文字：四档 + 反白色

| 角色 | antd token | Tailwind | 用途 |
| --- | --- | --- | --- |
| 正文 | `colorText` | `text-text` | 正文、标题、表格内容、菜单选中 |
| 次要 | `colorTextSecondary` | `text-text-secondary` | 说明、副标题、标签名、菜单未选中 |
| 三级 | `colorTextTertiary` | `text-text-tertiary` | 元信息、时间戳、帮助文本、图标 |
| 四级 | `colorTextQuaternary` | `text-text-quaternary` | **只给占位符与禁用态**，不是正文层级 |
| 反白 | `colorTextLightSolid` | `text-text-light-solid` | 实心按钮 / 状态标签上的文字 |

规则：

- **降级强调用 `text-text-secondary`，不要用 `opacity`**。主题已经给了四档，`opacity: 0.6` 在不同表面上会落进对比度盲区。
- `text-text-quaternary` 在浅色下约 2.5:1，任何需要阅读的内容都不许用它；它只用于 placeholder、disabled。
- 三级（元信息）的 4.5:1 承诺覆盖页面底与卡片两种表面；浮层（`#FFFFFF` / `#272A29`）上不保证，浮层里的说明文字升一档改用二级。
- 表格数字、ID、代码、diff 内容用 `font-mono`；金额和统计加 `tabular-nums` 保持列对齐。
- 标题不需要单独颜色：用 `text-text` + 字重 600 表达层级。

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
- **彩色文字用 `text-primary-text`**（`colorPrimaryText`），`text-primary` 指的是主色本身。浅色下 `#BA5B37` 当正文只有 3.86:1，只适合大字号或图标、进度这类图形。
- **链接与主色同族**：`colorLink` 在 Claude 浅色取主色的 text 档（`#A34E2D`，不是 3.86:1 的填充档），Paseo 深色取更亮的绿。整套界面只有一个品牌色相，不再单独引入链接蓝；hover / active 都在同族内加深并过 4.5:1。
- **语义色只表达状态**，不做装饰背景、不做分类标签的默认色。分类、图表请用身份色（见下）。
- 主按钮上的白字是刻意校准过的：Claude 浅色 `#BA5B37` 上白字 4.53:1，刚好过线。**不要用更浅的品牌装饰色 `#D97757` 做按钮底色**，白字只有 3.12:1。
- **深色的语义色是文字档，不是填充档**：`colorError` 在深色是浅红（作文字 5.8:1），antd 的实心 danger 按钮会直接拿它当底色；主题为此把标签改成墨字（`Button.dangerColor`），但视觉上仍是一块浅色。确认类操作优先用描边 danger。
- 需要换品牌色时用 `extendTheme` 覆盖 `colorPrimary`，它会重建整个十槽色族；直接嵌套 `ConfigProvider theme={{ token: { colorPrimary } }}` 会被算法覆盖，详见 README 的「从一个内置主题扩展」。

### 扩展色：状态点、diff、身份色、选区

| 用途 | antd token | Tailwind | 说明 |
| --- | --- | --- | --- |
| 状态点 | `paseoStatusDotSuccess/Danger/Warning/Running` | `bg-status-dot-success` 等 | 小圆点、徽标、运行状态；比正文语义色更亮，只做非文字图形 |
| 已合并 | `paseoStatusMerged` | `bg-status-merged` | 合并类状态，唯一允许的紫色语义 |
| diff 行底 | `paseoDiffAddition` / `paseoDiffDeletion` | `bg-diff-addition` / `bg-diff-deletion` | 整行背景 |
| diff 文字 | `paseoDiffAdditionText` / `paseoDiffDeletionText` | `text-diff-addition-text` 等 | 词级高亮与 `+12 −3` 统计 |
| 身份色 | `paseoIdentity*`（10 色） | `bg-identity-violet` 等 | 主机 / agent / 项目标识 |
| 身份色文字 | `paseoIdentityInk` | `text-identity-ink` | 身份色块上的文字：亮色白字、暗色墨字 |
| 选区 | `paseoSelection` | `selection:bg-selection` | `::selection` 背景，不要手写半透明色 |

规则：

- 状态点与语义色是两套：**文字用 `text-success`，点用 `bg-status-dot-success`**。状态点是按「非文字图形」调过的亮度（深色下明显更亮），语义色是按 4.5:1 文字阈值调的，两者不要互相顶替。
- diff 行底只负责「哪一行是增/删」，**统计数字用 `diff-*-text`**；把状态色直接铺在行底上会低于 4.5:1（浅色行底只有约 4.3）。
- 身份色按等响度归一化，色块上的文字一律用 `paseoIdentityInk`：亮色是白字（4.7–5.2:1），暗色是墨字（6.1–6.4:1）。不要假设白字在深色下可用——那十条浅彩色配白字只有 2.6:1。不要从中挑一个再调亮，色相只负责「是谁」，不负责「多重要」。

### 边框与分隔

| 角色 | antd token | Tailwind | 用途 |
| --- | --- | --- | --- |
| 外框 / 控件边框 | `colorBorder` | `border-border` | 卡片外框、输入框、默认按钮边框 |
| 轻分隔 | `colorBorderSecondary` | `border-border-secondary` | 表头分隔、分组边界 |
| 行内分隔 | `colorSplit`（派生） | `border-split` | 表格行线、列表分隔、Card 分区 |

规则：一张卡最多一层外框；表格只用 `border-split` 画行线，不要每行都描 `border-border`。边框永远 1px（`lineWidth`），不存在「加粗边框表达选中」，选中用背景或主色。

### 遮罩、Tooltip 与派生 token

- 遮罩用 `colorBgMask`：浅色 `rgba(20,20,19,0.45)`、深色 `rgba(0,0,0,0.65)`。Modal / Drawer / 图片预览都用它，不要自己写 `rgba(0,0,0,0.5)`。
- Tooltip 用 `colorBgSpotlight`：浅色固定为深墨 `#1F1E1D` 配白字，深色用 `surface-2`。Tooltip 故意不跟着页面变浅，以保证在任何表面上都可读。
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

### 对比度底线

- 正文与可读文字 ≥ 4.5:1；非文字（图标、边框、状态点、ink bar、焦点环）≥ 3:1。
- 文字阶梯按表面分开承诺：一、二、三级对页面底与卡片 ≥ 4.5:1；三级在浮层上改用二级；四级只做占位与禁用，不参与正文判读。
- 本包两套完整主题的配对全部过线，没有豁免。`antdLightTheme` / `antdDarkTheme` 走的是 antd 原生算法，其白字主按钮低于 4.5:1 是 antd 设计文档自己记录的行为，不属于本包引入的问题。
- 改动任何颜色 token 后，必须重新跑 `npm test`——`tests/` 里的对比度断言覆盖了这些配对。改色请用 `extendTheme`，不要改主题源码。

## 字体

| 角色 | token | Tailwind | 值 |
| --- | --- | --- | --- |
| 界面字体 | `fontFamily` | `font-sans` | `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif` |
| 等宽字体 | `fontFamilyCode` | `font-mono` | `SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace` |
| 正文 | `fontSize` | `text-sm`（14px） | 14 |
| 小号 | `fontSizeSM` | `text-xs`（12px） | 12 |
| 大号 | `fontSizeLG` | `text-base`（16px） | 16 |

- 正文固定 14px：40px 控件配 14px 是这套主题的密度基准，改用 16px 会让 Agent 列表、表单、表格并排时显得拥挤。
- 字重只用 400 / 600，与 antd 一致；不要用 500 或 700 造中间层级。
- 界面字体栈在所有导出主题里钉成同一组（antd 原生两套的等宽字体仍是 antd 默认），目的就是槽位切换时控件宽度不跳动——不要局部覆盖字体，否则切换会抖。

## 布局与间距

- 栅格是 **4px**（`sizeUnit` / `sizeStep`）。间距只用 4 / 8 / 12 / 16 / 24 / 32；出现 13px、18px、7px 说明设计还没对齐。
- 控件高度：默认 40、小号 32、大号 48（`controlHeight` / `SM` / `LG`）。不要把两档混排在同一行。
- 内边距：`padding` 16、`paddingSM` 12、`paddingXS` 8、`paddingXXS` 4、`paddingLG` 24；卡片正文与表单分区用 16/24。
- 页面骨架：Layout body 用 `bg-layout`，Sider 用 `bg-surface-sidebar`，Header 与 body 同色（`headerBg = surface0`）。Header 自身没有边框 token，需要与内容分隔时自己画 1px `colorSplit` 下边框。
- Select 行高是 44（`optionHeight`），由 `optionPadding: 9px 12px` 加上 Provider 注入的上下 2px 透明边框组成；开启虚拟滚动时必须同时传 `<Select listItemHeight={44}>`，否则行高估算错位。

## 层次与阴影

阴影分三级：页面区块最多用最轻的一级，真正浮在页面之上的层才用二级。

| 角色 | token | 用在哪 |
| --- | --- | --- |
| 极轻 | `boxShadowTertiary` | 默认按钮、`hoverable` 卡片的悬浮态 |
| 浮层 | `boxShadowSecondary` | Dropdown、Modal、Popover、Notification |
| 基础 | `boxShadow` | antd 组件内部使用，不要主动加到自定义区块上 |

- **flat-first**：静止的页面区块不加阴影，靠表面色和边框分层；只有真正浮在页面之上的层才加 `boxShadowSecondary`。
- 不要给卡片叠第二层阴影来表达 hover；hover 改背景（`surface-hover`）即可。
- 浅色阴影用暖墨色（`rgba(31,30,29,…)`），深色用纯黑；不要手写 `rgba(0,0,0,0.1)`。

## 形态

| 档位 | token | Tailwind | 落点 |
| --- | --- | --- | --- |
| 大 | `borderRadiusLG` / `borderRadius` | `rounded-md` / `rounded-lg`（12px） | Card、Modal、Alert、默认控件（Button / Input / Select） |
| 中 | `borderRadiusSM` | `rounded-sm`（8px） | 小号控件、Tag |
| 小 | `borderRadiusXS` | `rounded-xs`（4px） | 极小徽标、代码片段内联块 |

- 只用 12 / 8 / 4 三档，不要出现 6、10、14。
- 圆角随控件尺寸整体缩放：同一行的控件要么全用默认档，要么全用小号档，不要一个 12 一个 8。
- 头像、开关、Badge 计数等圆形/胶囊形由组件自身决定，不在这三档之内。

## 组件规范

下表是「主题已经替你配好的部分」和「你写页面时该守的规则」。所有组件 token 都随主题下发，不需要你在项目里再覆盖。

| 组件 | 主题已配 | 使用规则 |
| --- | --- | --- |
| Button | 主按钮白字、hover/active 加深、三级投影；深色实心 danger 用墨字 | 每个区块最多一个 `type="primary"`；次级操作用默认按钮；第三级用 `type="text"`；删除才用 `danger`，确认类操作优先描边（`danger` + 默认类型）。loading 图标由 Provider 统一，不要自己传 |
| Input / Select | 边框色、hover/active 主色、12px 圆角、40px 高 | 错误态交给 `status="error"`，不要手写红边框；Select 的长列表见上文 `listItemHeight` |
| Card | `surface-1` 底、12px 圆角、头用 `surface-head`、默认无阴影 | 卡片是页面上的「纸」，不要嵌套三层卡片；卡片头与正文之间用 `border-split`；`hoverable` 才出现悬浮投影 |
| Table | 表头与表格同底（`surface-1`，靠字重 + `border-split` 行线区分）、行 hover `surface-hover`、行线 `border-split`、斑马纹 `colorFillAlter`（派生自 `fill-quaternary`） | 斑马纹与行 hover 不要同时开；数字列右对齐并用 mono；空态用 Empty，不要自己画 |
| Segmented / Tabs | Segmented：`Segmented.trackBg`（亮暗都用页面底 `surface0`）+ 4px 内边距 + 4px 项间距；Tabs：ink bar 主色 | 两者都表达「切视图」，同一区域只选一个；Segmented 选项不超过 5 个 |
| Menu / Layout | 侧栏底 `surface-sidebar`，hover/选中按表面分层 | 侧栏菜单只用一级图标 + 文字，不塞按钮组；选中项由路由决定，不要手写背景 |
| Tag / Badge | Tag 8px 圆角；Badge 用胶囊/圆点 | 状态用语义色的 text/bg 槽；分类用身份色；Tag 里不放可点击的主操作 |
| Alert / Message / Notification | Alert：状态色底 + 12px 圆角；Message / Notification：浮层 `surface-2` | Alert 常驻、Message 瞬时；同一条消息不要同时用两种；错误文案要说「怎么修」 |
| Modal / Drawer | `surface-2`、`boxShadowSecondary` | 表单类用 Drawer，确认类用 Modal；一个 Modal 只做一件事 |
| 加载态 | `PaseoLoadingIcon`（Button / Spin / Select 已自动替换） | 局部加载用 Spin，整块内容用 Skeleton；不要让页面出现两个转圈 |
| Diff | 行底 + 词级 + 统计三档 token | 行底只标增删，词级用 `diff-*-text`，统计数字同色；不要用 `success` / `error` 直接铺行底 |

## 该做与不该做

| ✅ 该做 | ❌ 不该做 |
| --- | --- |
| `className="bg-surface-1 border border-border"` | `style={{ background: "#F5F4EC" }}` |
| `text-text-secondary` 降低强调 | `opacity: 0.6` |
| 一屏一个 primary 按钮 | 每个卡片都放一个 primary |
| 状态色表达成功/失败 | 用 success 绿做装饰色块 |
| 4px 栅格上的 8 / 12 / 16 | 13px、18px、7px 这类魔数 |
| 圆角 12 / 8 / 4 | 圆角 6 / 10，或同一行控件混用 12 和 8 |
| 浮层加 `boxShadowSecondary` | 给静态卡片叠两层阴影 |
| `extendTheme(base, { token })` 换色 | 嵌套 `ConfigProvider` 传 seed token |
| 用 `text-link` 做链接（主色系 text 档） | 用主色填充色当链接（浅色仅 3.86:1） |
| 彩色文字用 `text-primary-text` | 用 `text-primary` 写正文 |
| 换槽位配对后重新生成 `tailwind.css` | 混搭主题 + 默认 `tailwind.css`（工具类会与组件色漂移） |

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
