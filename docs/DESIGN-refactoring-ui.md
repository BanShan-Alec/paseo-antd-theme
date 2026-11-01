# 设计规范 · refactoring-ui 重新生成版

> **这是一次性评审稿，不是发布物。** 2026-11-01 用 refactoring-ui Workflow A 独立生成，用来和当时的 `packages/theme/DESIGN.md` 对照；两者的差异已合并回 `packages/theme/DESIGN.md`，本文件只作决策记录保留，后续不再维护。
>
> **生成方式**：refactoring-ui Workflow A（Step 0 检测 → 补齐刻度 → 对比度校验 → 输出 DESIGN.md）。
> 生成时未参考仓库现有 `packages/theme/DESIGN.md`；所有数值取自 `src/themes/**` 的 token 源、antd `theme.getDesignToken()` 的实测输出，以及 `tests/` 里的对比度断言。
>
> **取值约定**：本文只写**规则与用法**，颜色一律引用 token 名。具体色值见 `MAPPING.md` 与 `dist/tailwind-vars.css`（生成物，以它们为准）；尺寸类刻度（px）直接写在本文，因为它们不在生成物里。

---

## 0. 这套系统是什么

两套完整主题（Claude Light / Paseo Dark）加两套 antd 原生配色，共用一个**形态规格**：40px 控件、14px 正文、12px 圆角、4px 栅格、三级软阴影、44px Select 行高。颜色可以换槽位，尺寸不能。

### 人格决策（Round 2）及各自产出

| 轴 | 选择 | 落到哪 |
| --- | --- | --- |
| 严肃 ↔ 活泼 | **严肃**（控制台 / agent 工作流，长时间驻留） | 圆角止步于 12px，不做胶囊、不做渐变、不做装饰色块；强调靠层级不靠色彩面积 |
| 经典 ↔ 现代 | **现代** | 中性无衬线系统栈（`system-ui` 优先）；灰阶带温度——浅色偏奶油、深色偏青绿，全系统不用纯灰 |
| 密集 ↔ 宽敞 | **密集** | 正文 14px（不是 16）、控件 40px、工作间距落在 8/12/16 三档，32 以上只给页面级留白 |

> 这三个选择是**推论**，不是访谈结果：它们由已发布的取值反推而来（`fontSize: 14`、`borderRadius: 12`、`sizeUnit: 4`、暖灰表面）。要改人格，改的是这些源头值，不是逐页调样式。

### 三条总规则

1. **颜色只从 token 取**。antd 组件吃 `ConfigProvider`，自己的标记吃 Tailwind 类或 `theme.useToken()`。任何 `#` 字面量都是 bug。
2. **文字 ≥ 4.5:1，非文字图形 ≥ 3:1**。内置值已按此校准，由 `tests/` 的断言守住；改色必须重新过线。
3. **一屏只有一个主操作**。主色是稀缺资源，不是强调色。

---

## 1. 颜色

### 1.1 表面阶梯：三层 + 三个定点槽

页面由「底 → 容器 → 浮层」三层构成，**不要出现第四层**。侧栏、面板头、hover 是同一体系里的定点槽位，不是新层级。

| 层级 | antd token | Tailwind | 什么时候用 |
| --- | --- | --- | --- |
| 页面底 | `colorBgLayout` / `paseoSurface0` | `bg-layout` / `bg-surface-0` | Layout body、页面空白区、Segmented 轨道 |
| 容器 | `colorBgContainer` / `paseoSurface1` | `bg-container` / `bg-surface-1` | 卡片、输入框、默认按钮、面板、表格底 |
| 浮层 | `colorBgElevated` / `paseoSurface2` | `bg-elevated` / `bg-surface-2` | 弹层、下拉、Modal、Message、Segmented 选中滑块 |
| 侧栏 | `paseoSurfaceSidebar` | `bg-surface-sidebar` | Sider、Menu 底色 |
| 面板头 | `paseoSurfaceHead` | `bg-surface-head` | Card 头（表格表头与表格同底，不用它） |
| 卡片 hover | `paseoSurfaceHover` | `bg-surface-hover` | 卡片 / 表格行 hover |
| 强填充 | `paseoSurface3` / `paseoSurface4` | `bg-surface-3` / `bg-surface-4` | 控件内需要压过邻近表面的填充：菜单 hover / 选中、进度轨道 |

规则：

- **浅色靠边框和阴影分层，深色靠亮度分层**。浅色卡片只比页面亮约 1.06，必须带 `border-border`；深色层次已由亮度拉开，边框用默认 `border-secondary`，不要加粗。不要反过来。
- **hover 跟着它所在的表面走**。白卡上的行 hover 用 `bg-surface-hover`（浅色）/ `bg-surface-1`（深色）；侧栏菜单 hover 用 `bg-surface-3`（浅色）/ `bg-surface-1`（深色），选中用 `bg-surface-4`（浅色）/ `bg-surface-2`（深色）。不要拿 `bg-surface-2` 做卡片 hover——那是浮层色，卡片会看起来被抬起来。
- 浮层与底之间用阴影区分，不要在已有阴影的浮层上再加边框。
- **深色没有「纸上纸」**：`surface-head` / `surface-hover` 在深色下回落到 `surface-1`。这个回落只发生在 Tailwind 工具类层；`theme.useToken()` 里这两个键在深色 token 集中**不存在**，直接取会是 `undefined`。
- `bg-layout` / `bg-container` / `bg-elevated` 与 `bg-surface-0/1/2` 同值双名：前者对齐 antd，后者表达层级。自己的标记统一用 `bg-surface-*`。
- `colorFill` 阶梯是 antd 组件内部在用的填充色（hover、禁用、斑马纹）。写自己的标记优先用 `bg-surface-*` 表达「这是哪一层」。

### 1.2 文字阶梯：四档，但只有三档可读

| 档位 | antd token | Tailwind | 什么时候用 |
| --- | --- | --- | --- |
| 一 · 正文 | `colorText` | `text-text` | 正文、标题、表格内容、菜单选中 |
| 二 · 次要 | `colorTextSecondary` | `text-text-secondary` | 说明、副标题、标签名、菜单未选中 |
| 三 · 三级 | `colorTextTertiary` | `text-text-tertiary` | 元信息、时间戳、帮助文本、图标 |
| 四 · 四级 | `colorTextQuaternary` | `text-text-quaternary` | **只给禁用态与占位符**，不是正文层级 |
| 反白 | `colorTextLightSolid` | `text-text-light-solid` | 实心按钮 / 状态标签上的文字 |

规则：

- **降级强调用二级，不要用 `opacity`**。系统已经给了四档，`opacity: 0.6` 会落进对比度盲区，而且深色下不可预测。
- **四级约 2.5:1，任何需要阅读的内容都不许用它**。它只承接 `colorTextPlaceholder` / `colorTextDisabled`（antd 从四级派生），占位符低于 4.5:1 属库行为，已被知情接受——不要在这个基础上再往下降。
- **三级是「有边界的档位」**：对页面底与卡片 ≥ 4.5:1；对面板头、卡片 hover 填充、以及深色浮层会掉到 4.5 以下。落在这些表面上的说明文字升一档用二级。
- 表格数字、ID、代码、diff 内容用 `font-mono`；金额与统计加 `tabular-nums` 保持列对齐。
- 标题不需要单独颜色：`text-text` + 字重 600 就是标题。

**实测对比度（生成时按 WCAG 公式算，页面底 / 容器 / 浮层）**

| 档位 | 浅色 | 深色 |
| --- | --- | --- |
| 一 · 正文 | 9.56 / 10.15 / 11.20 | 16.62 / 15.55 / 13.88 |
| 二 · 次要 | 6.43 / 6.83 / 7.53 | 6.97 / 6.52 / 5.82 |
| 三 · 三级 | 5.12 / 5.44 / 6.00 | 5.23 / 4.90 / **4.37** |
| 四 · 四级 | 2.50 / 2.66 / 2.93 | 2.54 / 2.37 / 2.12 |

浅色三级在面板头 4.41、卡片 hover 4.25；深色二级在 `surface-3` 3.83、`surface-4` 2.75。这些表面上的文字都要升档。

### 1.3 主色、链接与语义色

| 角色 | token | Tailwind | 什么时候用 |
| --- | --- | --- | --- |
| 主色 | `colorPrimary` 族 | 背景/图形：`bg-primary`、`border-primary`、`*-primary-hover/active`；文字：`text-primary-text` | 主按钮、带勾选语义的控件选中态、焦点环、进度 |
| 链接 | `colorLink` 族 | `text-link`、`text-link-hover`、`text-link-active` | 只有可点击的文字链接，与主色同族 |
| success | `colorSuccess` 族 | `bg-success`、`text-success` 等 | 成功、通过、新增 |
| warning | `colorWarning` 族 | `bg-warning` 等 | 警告、待处理 |
| error | `colorError` 族 | `bg-error` 等 | 失败、危险操作、删除 |
| info | `colorInfo` 族 | `bg-info` 等 | 中性提示、进行中 |

规则：

- **主色只给「这一屏最重要的那个操作」**。一个区块出现两个 primary 按钮，就等于没有主操作。视图切换、导航选中优先用表面色；只有带勾选语义的控件（Radio / Checkbox / Select 选项）才用主色。
- **彩色文字用 `text-primary-text`**（`colorPrimaryText`）。`text-primary` 是主色本身：浅色下作正文只有 3.86:1，深色 3.02:1，只适合大字号或图标、进度这类图形。
- **链接与主色同族**，不单独引入链接蓝：浅色取主色的 text 档（4.86 / 5.17），深色取亮绿（9.01 / 8.43），hover / active 都在同族内加深。
- **语义色只表达状态**，不做装饰背景、不做分类标签的默认色。分类与图表用身份色。
- 实心按钮上的字是逐档校准的：浅色主按钮白字 4.53:1，深色主按钮白字 5.74:1；**不要用更浅的品牌装饰色做按钮底色**。
- **深色的语义色是文字档，不是填充档**：`colorError` 在深色是浅红，作文字 6.20:1；antd 的实心 danger 会直接拿它当底色，白字只有 2.80:1，所以主题把标签改成墨字（`Button.dangerColor`，5.95:1）。确认类操作优先用描边 danger。
- 换品牌色用 `extendTheme` 覆盖 `colorPrimary`，它会重建十槽色族；嵌套 `ConfigProvider` 传 seed 会被算法覆盖。

### 1.4 扩展色

| 用途 | token | Tailwind | 说明 |
| --- | --- | --- | --- |
| 状态点 | `paseoStatusDot*` | `bg-status-dot-success` 等 | 小圆点、徽标、运行状态；**只做非文字图形** |
| 已合并 | `paseoStatusMerged` | `bg-status-merged` | 合并类状态，唯一允许的紫色语义 |
| diff 行底 | `paseoDiffAddition` / `paseoDiffDeletion` | `bg-diff-addition` / `bg-diff-deletion` | 整行背景，只负责「哪一行是增/删」 |
| diff 文字 | `paseoDiffAdditionText` / `paseoDiffDeletionText` | `text-diff-addition-text` 等 | 词级高亮与 `+12 −3` 统计 |
| 身份色 | `paseoIdentity*`（10 色） | `bg-identity-violet` 等 | 主机 / agent / 项目标识 |
| 身份色文字 | `paseoIdentityInk` | `text-identity-ink` | 色块上的文字：浅色白字、深色墨字 |
| 选区 | `paseoSelection` | `selection:bg-selection` | `::selection` 背景，不要手写半透明色 |

规则：

- **状态点与语义色是两套**：文字用 `text-success`，点用 `bg-status-dot-success`。状态点按「非文字图形」调亮度，两者不要互相顶替。
- **diff 的两组值不要混用**。行底只标增删；统计数字用 `diff-*-text`（对页面底 6.78 / 6.20）。**深色下不要把 `diff-*-text` 铺回行底**——那是 3.21 / 3.17，不到 4.5；浅色下这两者可以同用（5.14 / 5.38）。
- **身份色按等响度归一化，色相只负责「是谁」，不负责「多重要」**。色块上的文字一律用 `paseoIdentityInk`：浅色白字（4.72–5.19），深色墨字（5.85–6.45）。不要假设白字在深色下可用——十条浅彩色配白字只有 2.75。

### 1.5 边框、分隔、遮罩

| 角色 | token | Tailwind | 什么时候用 |
| --- | --- | --- | --- |
| 外框 / 控件边框 | `colorBorder` | `border-border` | 卡片外框、输入框、默认按钮 |
| 轻分隔 | `colorBorderSecondary` | `border-border-secondary` | 表头分隔、分组边界 |
| 行内分隔 | `colorSplit`（派生） | `border-split` | 表格行线、列表分隔、Card 分区 |

- 一张卡最多一层外框；表格只用 `border-split` 画行线，不要每行描 `border-border`。
- **边框永远 1px**（`lineWidth`）。不存在「加粗边框表达选中」——选中用背景或主色。2px（`lineWidthBold`）只归 antd 自己的指示器（Tabs ink bar、Segmented 滑块），不要手写。
- 遮罩用 `colorBgMask`（浅色暖黑 45%、深色纯黑 65%），Modal / Drawer / 图片预览都用它。
- Tooltip 用 `colorBgSpotlight`：浅色固定深墨配白字，深色用 `surface-2`。它故意不跟着页面变浅。
- 派生 token（`colorSplit` / `colorTextPlaceholder` / `colorTextDisabled` / `colorIcon` / `colorFillAlter` / `controlOutline` 等）**只读**，改色只改上游。

---

## 2. 排版

### 2.1 字号阶梯

| 用途 | token | Tailwind | px | 行高 |
| --- | --- | --- | --- | --- |
| 小号元信息 | `fontSizeSM` | `text-xs` | 12 | 20（1.67） |
| 正文 / 控件 / 表格 | `fontSize` | `text-sm` | 14 | 22（1.57） |
| 强调正文 | `fontSizeLG` | `text-base` | 16 | 24（1.5） |
| 卡片标题 | `fontSizeHeading5` | `text-base` | 16 | 1.5 |
| 区块标题 | `fontSizeHeading4` | `text-xl` | 20 | 1.4 |
| 页面标题 | `fontSizeHeading3` | `text-2xl` | 24 | 1.33 |
| 大屏标题 | `fontSizeHeading2` | `text-3xl` | 30 | 1.27 |
| 极少使用 | `fontSizeHeading1` | `text-4xl`（**36，与 token 的 38 不等**） | 38 | 1.21 |

- 只有 **12 / 14 / 16** 三档是显式 pin 过的；标题的 16 / 20 / 24 / 30 / 38 由 antd 从 `fontSize` 派生，**不要在页面里手写标题字号**，用 `Typography.Title level={1..5}` 或上表的 token。
- 正文固定 14px：40px 控件配 14px 是这套主题的密度基准。改成 16px 会让 Agent 列表、表单、表格并排时显得拥挤。
- 字重只有两档：**400 正文 / 600 标题与强调**（`fontWeightStrong`）。不要用 500 或 700 造中间层级。
- 行高不单独设置：antd 按字号派生（正文 1.57、小号 1.67、大号 1.5、标题 1.21–1.5）。长文段落可以放宽到 1.5–1.7，标题可以收到 1.25，**这是唯二允许偏离派生值的地方**。
- 行宽 **45–75 字符（约 20–35em）**。演示站的规范页容器是 980px / 14px = 70em，已经超出这个区间一倍——长文档页需要单独收窄，不要把整页宽度当行宽。
- 数字列、金额、统计加 `tabular-nums`；代码、ID、diff 内容用 `font-mono`。

---

## 3. 间距与布局

- 栅格 **4px**（`sizeUnit` / `sizeStep`）。刻度：4 / 8 / 12 / 16 / 20 / 24 / 32 / 48。**工作档位是 8 / 12 / 16**；4 只给图标与文字的贴合间距，20 及以上只给区块之间与页面留白。
- **组外间距必须大于组内间距**。这一条能解决大部分「为什么这块看起来乱」的问题：卡片内元素间距 8，卡片之间 16，区块之间 32。三者相等时，分组就消失了。
- 内边距：`padding` 16、`paddingSM` 12、`paddingXS` 8、`paddingXXS` 4、`paddingLG` 24；卡片正文与表单分区用 16 / 24。
- 控件高度：默认 40、小号 32、大号 48。不要把两档混排在同一行。
- 页面骨架：Layout body 用 `bg-layout`，Sider 用 `bg-surface-sidebar`，Header 与 body 同色。Header 没有边框 token，需要分隔时自己画 1px `colorSplit` 下边框。
- Select 行高 44（`optionHeight`），由 `optionPadding: 9px 12px` 加 Provider 注入的上下 2px 透明边框组成；开虚拟滚动时必须同时传 `<Select listItemHeight={44}>`。

---

## 4. 形状与深度

### 4.1 圆角

| 档位 | token | Tailwind | 落点 |
| --- | --- | --- | --- |
| 大 | `borderRadius` / `borderRadiusLG` | `rounded-md` / `rounded-lg` | Card、Modal、Alert、默认控件 |
| 中 | `borderRadiusSM` | `rounded-sm` | 小号控件、Tag |
| 小 | `borderRadiusXS` | `rounded-xs` | 极小徽标、代码内联块 |

只用 **12 / 8 / 4** 三档，不要出现 6、10、14。圆角随控件尺寸整体缩放：同一行控件要么全用默认档，要么全用小号档。头像、开关、Badge 计数等圆形/胶囊形由组件自身决定，不在这三档内。

> 与书里「一个圆角决定应用到所有组件」的偏离：antd 的模型本身就是 XS/SM/base/LG 四档，本系统收窄到三档并绑定控件尺寸。这是**有意的**，不是遗漏。

### 4.2 阴影

| 角色 | token | 用在哪 |
| --- | --- | --- |
| 极轻 | `boxShadowTertiary` | 默认按钮、`hoverable` 卡片的悬浮态 |
| 浮层 | `boxShadowSecondary` | Dropdown、Modal、Popover、Notification |
| 基础 | `boxShadow` | antd 组件内部使用，不要主动加到自定义区块上 |

- **flat-first**：静止的页面区块不加阴影，靠表面色和边框分层；只有真正浮在页面之上的层才加 `boxShadowSecondary`。
- 光从上方来：抬起的层 = 更亮的顶边 + 下方一小片清晰阴影。不要给卡片叠第二层阴影表达 hover，hover 改背景。
- 浅色阴影用暖墨色，深色用纯黑；不要手写 `rgba(0,0,0,0.1)`。

> 与书里五级 elevation 的偏离：antd 只下发三个阴影槽，本系统沿用三档 + flat-first。这是**有意的**。

---

## 5. 操作层级

一屏之内：

- **一个主操作**（`type="primary"`）：这一屏用户最该做的事。没有就留空，不要为了「看起来完整」硬塞一个。
- **少量次操作**（默认按钮）：与主操作同级但次要的动作。
- **若干第三级操作**（`type="text"` / 图标按钮）：行内操作、更多菜单。

**危险操作不自动等于大声的操作**。删除用 `danger`，但确认类交互优先「描边 danger + 默认类型」，只有真正不可逆且高频的动作才用实心 danger。深色下实心 danger 是一块浅色（因为语义色是文字档），视觉重量远大于它的语义——用之前先问是否必要。

---

## 6. 不在系统里的东西

先分清两种情况：**antd 有 token、本包没导出**，和**根本没有任何 token**。前者是文档缺口，后者才是设计缺口。

### 6.1 antd 有 token，但没进 Tailwind 导出（用 antd 组件时自动生效，自己写标记时要显式取）

| 项 | token | 值 |
| --- | --- | --- |
| 断点 | `screenXS` … `screenXXXL` | 480 / 576 / 768 / 992 / 1200 / 1600 / 2000 |
| 动效时长 | `motionDurationFast` / `Mid` / `Slow` | 0.1s / 0.2s / 0.3s |
| 缓动 | `motionEaseOut` 等 | antd 内置曲线 |
| 层级 | `zIndexBase` / `zIndexPopupBase` | 0 / 1000 |
| 图标尺寸 | `fontSizeIcon` | 12 |
| 焦点框 | `controlOutline` / `controlOutlineWidth` / `lineWidthFocus` | 2px / 3px |

这些值**不要手写第二份**。要自定义动效或断点时，从 `theme.useToken()` 取，或加进本包的 Tailwind 导出（`src/tailwind/build.ts` 的 `TAILWIND_VARIABLES`），不要在页面里写 `0.2s`、`9999`、`768px`。

### 6.2 真的没有 token

| 项 | 现状 | 缺了怎么办 |
| --- | --- | --- |
| 字距 letter-spacing | 全系统无 | 默认不动；全大写标签需要时加一档（0.02em 级别），不要逐处调 |
| 不透明度 opacity | 只有 `opacityImage` / `opacityLoading` 两个组件用值，没有通用刻度 | **不要用 opacity 做强调降级**，用文字档位或表面档位 |
| 宽度刻度 | 无 `max-width` / 栅格列宽 token | 先复用整百值（980 / 720 / 480），第二次用到时加 token |

**通用规则：缺一个值时，加 token，不要写字面量。** 同一个字面量出现第二次，就是它在申请成为 token。

---

## 7. 微调 vs 加档

- **调一个已有档位是安全的**：把主色的某一档加深 4%，只影响用到它的地方，对比度测试会告诉你有没有踩线。
- **加一档是危险的**：给文字加第五档、给圆角加 6px、给阴影加第四级——每加一档，原有的档位就失去「唯一正确选择」的地位，后面每个页面都要重新判断一次。这正是系统退化成「一堆样式」的方式。
- 需要新档位时，先问：现有档位里有没有一个能表达这个语义？如果没有，是**替换**某一档，而不是**新增**。

---

## 8. 自检清单

写完一屏，过一遍：

- [ ] 颜色全部来自 token，没有 `#` 字面量，没有 `opacity` 降级
- [ ] 只有一个 primary 操作；危险操作没有抢主操作的位
- [ ] 组外间距 > 组内间距；间距全在 4px 栅格上
- [ ] 字号只用了 12 / 14 / 16（正文区）或标题 token；字重只有 400 / 600
- [ ] 圆角只用了 12 / 8 / 4，同一行控件档位一致
- [ ] 静止区块没有阴影；浮层才有 `boxShadowSecondary`
- [ ] 三级文字没有落在浮层、面板头、hover 填充上
- [ ] 深色下没有把 `diff-*-text` 铺在 diff 行底上；身份色块用 `identity-ink` 而不是白字
- [ ] 新出现的值：是 token 吗？不是的话，为什么不是？
