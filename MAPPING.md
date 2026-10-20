<!-- 由 scripts/dump-mapping.ts 生成，请勿手改 -->

## 完整映射表

### 最小方案 · 深色（Paseo Dark）

只钉 13 个 token（五个颜色族的种子 + 三个背景 + 字体栈），其余由 antd 以 paseo 的种子色自行派生。
浅色仍是 antd 默认主题，仅字体栈例外。

| antd token | 类型 | 值 | paseo 来源 | 说明 |
| --- | --- | --- | --- | --- |
| `colorPrimary` | seed | `#20744A` | `accent` |  |
| `colorSuccess` | seed | `#6cb17b` | `statusSuccess` |  |
| `colorWarning` | seed | `#c09664` | `statusWarning` |  |
| `colorError` | seed | `#d8847b` | `statusDanger` |  |
| `colorInfo` | seed | `#5caaf6` | `statusDotRunning` | paseo has no info color; its 'running' blue is the only informational hue. |
| `colorTextBase` | seed | `#fafafa` | `foreground` |  |
| `colorBgBase` | seed | `#181B1A` | `surface0` |  |
| `colorLink` | seed | `#7ccba0` | `accentBright` | Pinned to accentBright by the wrapped algorithm; the seed keeps derivation in-family. |
| `fontFamily` | seed | `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif` | `fontFamily.ui` |  |
| `fontFamilyCode` | seed | `SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace` | `fontFamily.mono` |  |
| `colorBgLayout` | map | `#181B1A` | `surface0` |  |
| `colorBgContainer` | map | `#1E2120` | `surface1` | Default buttons, inputs, cards. |
| `colorBgElevated` | map | `#272A29` | `surface2` | Popovers, dropdowns, modals. |

### 完整方案 · 深色（Paseo Dark + Claude.ai 形态）

paseo 配色 + Claude.ai 形态：40px 控件、16px 正文、12px 圆角、软阴影。
Diff 行底已降饱和为 `#32573a` / `#783630`。

| antd token | 类型 | 值 | paseo 来源 | 说明 |
| --- | --- | --- | --- | --- |
| `colorPrimary` | seed | `#20744A` | `accent` |  |
| `colorSuccess` | seed | `#6cb17b` | `statusSuccess` |  |
| `colorWarning` | seed | `#c09664` | `statusWarning` |  |
| `colorError` | seed | `#d8847b` | `statusDanger` |  |
| `colorInfo` | seed | `#5caaf6` | `statusDotRunning` | paseo has no info color; its 'running' blue is the only informational hue in the system. |
| `colorTextBase` | seed | `#fafafa` | `foreground` |  |
| `colorBgBase` | seed | `#181B1A` | `surface0` |  |
| `colorLink` | seed | `#7ccba0` | `accentBright` | Pinned to accentBright by the wrapped algorithm; the seed keeps derivation in-family. |
| `fontFamily` | seed | `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif` | `fontFamily.ui` |  |
| `fontFamilyCode` | seed | `SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace` | `fontFamily.mono` |  |
| `fontSize` | seed | `14` | `fontSize.base` |  |
| `borderRadius` | seed | `12` | `borderRadius.lg` |  |
| `sizeUnit` | seed | `4` | `spacing.1` |  |
| `sizeStep` | seed | `4` | `spacing.1` |  |
| `controlHeight` | seed | `40` | `—` |  |
| `lineWidth` | seed | `1` | `borderWidth.1` |  |
| `colorBgLayout` | map | `#181B1A` | `surface0` |  |
| `colorBgContainer` | map | `#1E2120` | `surface1` | Default buttons, inputs, cards. |
| `colorBgElevated` | map | `#272A29` | `surface2` | Popovers, dropdowns, modals. |
| `colorBgSpotlight` | map | `#272A29` | `surface2` | Tooltip background. |
| `colorBgMask` | map | `rgba(0, 0, 0, 0.65)` | `—` | paseo defines no mask; matched to its overlay darkness. |
| `colorText` | map | `#fafafa` | `foreground` |  |
| `colorTextSecondary` | map | `#A1A5A4` | `foregroundMuted` |  |
| `colorTextTertiary` | map | `#717574` | `foregroundExtraMuted` |  |
| `colorTextQuaternary` | map | `#595B5B` | `surface4` |  |
| `colorBorder` | map | `#252B2A` | `border` |  |
| `colorBorderSecondary` | map | `#2F3534` | `borderAccent` |  |
| `colorFill` | map | `#434645` | `surface3` |  |
| `colorFillSecondary` | map | `#272A29` | `surface2` |  |
| `colorFillTertiary` | map | `#1E2120` | `surface1` | Also feeds controlItemBgHover — paseo's sidebar hover step. |
| `colorFillQuaternary` | map | `#252B2A` | `border` | Zebra stripes and disabled outlines sit at hairline weight. |
| `controlHeightSM` | map | `32` | `spacing.8` |  |
| `controlHeightLG` | map | `48` | `spacing.12` |  |
| `fontSizeSM` | map | `12` | `fontSize.sm` |  |
| `fontSizeLG` | map | `16` | `fontSize.lg` |  |
| `borderRadiusSM` | map | `8` | `borderRadius.base` |  |
| `borderRadiusLG` | map | `12` | `borderRadius.lg` |  |
| `borderRadiusXS` | map | `4` | `borderRadius.sm` |  |
| `padding` | map | `16` | `spacing.4` |  |
| `paddingSM` | map | `12` | `spacing.3` |  |
| `paddingXS` | map | `8` | `spacing.2` |  |
| `paddingXXS` | map | `4` | `spacing.1` |  |
| `paddingLG` | map | `24` | `spacing.6` |  |
| `margin` | map | `16` | `spacing.4` |  |
| `marginSM` | map | `12` | `spacing.3` |  |
| `marginXS` | map | `8` | `spacing.2` |  |
| `marginXXS` | map | `4` | `spacing.1` |  |
| `marginLG` | map | `24` | `spacing.6` |  |
| `boxShadow` | map | `0 1px 2px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.16)` | `—` |  |
| `boxShadowSecondary` | map | `0 4px 10px rgba(0, 0, 0, 0.18), 0 1px 3px rgba(0, 0, 0, 0.10)` | `—` |  |
| `boxShadowTertiary` | map | `0 1px 2px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.10)` | `—` |  |

### Claude 浅色（Claude Light）

Claude 品牌表面 + Claude Code 信号色 + paseo 归一化状态色（OKLCH L*=0.52 / 55% 彩度）。
主色 clay 的按钮文字为墨色；链接为压暗后的 Claude suggestion 蓝。

| antd token | 类型 | 值 | paseo 来源 | 说明 |
| --- | --- | --- | --- | --- |
| `colorPrimary` | seed | `#BA5B37` | `accent` | Claude's site interactive clay (#C6613F); brand-palette #D97757 is the lighter decorative variant. |
| `colorSuccess` | seed | `#467650` | `statusSuccess` | Paseo's normalized rule re-solved at L*=0.52, C=55% gamut max. |
| `colorWarning` | seed | `#806340` | `statusWarning` |  |
| `colorError` | seed | `#a14b43` | `statusDanger` |  |
| `colorInfo` | seed | `#436c96` | `statusRunning` | Claude Code's suggestion blue hue is reserved for links; info uses paseo's running blue. |
| `colorTextBase` | seed | `#3C3C2C` | `foreground` |  |
| `colorBgBase` | seed | `#F5F4EC` | `surface1` |  |
| `colorLink` | seed | `#4B5BD8` | `link` | Claude Code's suggestion hue #5769F7 darkened until it clears 4.5:1 on #F0EDE2. |
| `fontFamily` | seed | `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif` | `fontFamily.ui` |  |
| `fontFamilyCode` | seed | `SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace` | `fontFamily.mono` |  |
| `fontSize` | seed | `14` | `—` | 14px body — the 16px Claude.ai scale felt cramped in dense app chrome. |
| `borderRadius` | seed | `12` | `—` |  |
| `sizeUnit` | seed | `4` | `spacing.1` |  |
| `sizeStep` | seed | `4` | `spacing.1` |  |
| `controlHeight` | seed | `40` | `—` |  |
| `lineWidth` | seed | `1` | `borderWidth.1` |  |
| `colorBgLayout` | map | `#F0EDE2` | `surface0` |  |
| `colorBgContainer` | map | `#F5F4EC` | `surface1` | Default buttons, inputs, cards. |
| `colorBgElevated` | map | `#FFFFFF` | `surface2` | Popovers, dropdowns, modals — separated from cards by shadow. |
| `colorBgSpotlight` | map | `#1F1E1D` | `—` | Tooltip stays dark ink with white text. |
| `colorBgMask` | map | `rgba(20, 20, 19, 0.45)` | `—` |  |
| `colorText` | map | `#3C3C2C` | `foreground` |  |
| `colorTextSecondary` | map | `#5C5C54` | `foregroundMuted` |  |
| `colorTextTertiary` | map | `#65635E` | `foregroundExtraMuted` |  |
| `colorTextQuaternary` | map | `#878681` | `foregroundFaint` | Placeholder/disabled only — not a body-text level. |
| `colorTextLightSolid` | map | `#FFFFFF` | `—` | Danger/solid labels stay white; primary buttons override with Button.primaryColor. |
| `colorBorder` | map | `#DBD9D0` | `border` |  |
| `colorBorderSecondary` | map | `#E8E6DF` | `borderAccent` |  |
| `colorFill` | map | `#D1CCBF` | `surface4` |  |
| `colorFillSecondary` | map | `#D7D2C7` | `surface3` |  |
| `colorFillTertiary` | map | `#DDD9CE` | `surfaceHover` | Hover/disabled fills on white surfaces: 1.30:1 against the container, clearly visible without shouting. |
| `colorFillQuaternary` | map | `#EDEBE0` | `—` | Zebra stripes and hairline fills. |
| `controlHeightSM` | map | `32` | `—` |  |
| `controlHeightLG` | map | `48` | `—` |  |
| `fontSizeSM` | map | `12` | `—` |  |
| `fontSizeLG` | map | `16` | `—` |  |
| `borderRadiusSM` | map | `8` | `—` |  |
| `borderRadiusLG` | map | `12` | `—` |  |
| `borderRadiusXS` | map | `4` | `—` |  |
| `padding` | map | `16` | `spacing.4` |  |
| `paddingSM` | map | `12` | `spacing.3` |  |
| `paddingXS` | map | `8` | `spacing.2` |  |
| `paddingXXS` | map | `4` | `spacing.1` |  |
| `paddingLG` | map | `24` | `spacing.6` |  |
| `margin` | map | `16` | `spacing.4` |  |
| `marginSM` | map | `12` | `spacing.3` |  |
| `marginXS` | map | `8` | `spacing.2` |  |
| `marginXXS` | map | `4` | `spacing.1` |  |
| `marginLG` | map | `24` | `spacing.6` |  |
| `boxShadow` | map | `0 1px 2px rgba(31, 30, 29, 0.06), 0 4px 12px rgba(31, 30, 29, 0.08)` | `—` |  |
| `boxShadowSecondary` | map | `0 6px 16px rgba(31, 30, 29, 0.10), 0 2px 6px rgba(31, 30, 29, 0.05)` | `—` |  |
| `boxShadowTertiary` | map | `0 1px 2px rgba(31, 30, 29, 0.04), 0 4px 12px rgba(31, 30, 29, 0.06)` | `—` |  |
