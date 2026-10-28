<!-- 由 scripts/dump-mapping.ts 生成，请勿手改 -->

## 完整映射表

### 完整方案 · 深色（Paseo Dark + Claude.ai 形态）

paseo 配色 + Claude.ai 形态：40px 控件、14px 正文、12px 圆角、软阴影。
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
| `colorTextTertiary` | map | `#8A8E8D` | `foregroundExtraMuted` |  |
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
主色 clay 的按钮文字为白字（4.53:1）；链接复用主色的 text 档（4.86:1），不再单独引入蓝色。

| antd token | 类型 | 值 | paseo 来源 | 说明 |
| --- | --- | --- | --- | --- |
| `colorPrimary` | seed | `#BA5B37` | `accent` | Claude's site interactive clay (#C6613F); brand-palette #D97757 is the lighter decorative variant. |
| `colorSuccess` | seed | `#467650` | `statusSuccess` | Paseo's normalized rule re-solved at L*=0.52, C=55% gamut max. |
| `colorWarning` | seed | `#806340` | `statusWarning` |  |
| `colorError` | seed | `#a14b43` | `statusDanger` |  |
| `colorInfo` | seed | `#436c96` | `statusRunning` | paseo's 'running' blue is the only informational hue in the system; links stay in the primary family. |
| `colorTextBase` | seed | `#3C3C2C` | `foreground` |  |
| `colorBgBase` | seed | `#F5F4EC` | `surface1` |  |
| `colorLink` | seed | `#A34E2D` | `accentText` | Links reuse the primary family's text tone (4.86:1 on the page) instead of a separate hue. |
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
| `colorTextSecondary` | map | `#55554B` | `foregroundMuted` |  |
| `colorTextTertiary` | map | `#65635E` | `foregroundExtraMuted` |  |
| `colorTextQuaternary` | map | `#98978F` | `foregroundFaint` | Placeholder/disabled only — not a body-text level. |
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
## Tailwind 变量映射

`src/tailwind/theme.css` 由 `scripts/gen-tailwind.ts` 生成：值经 antd 管线解析（含算法派生的
hover/active/色阶槽位），浅色写在 `:root`，深色同时写在 `@media (prefers-color-scheme: dark)` 与 `.dark`。

| Tailwind 变量 | 浅色值（Claude Light） | 深色值（Paseo Dark） | antd token 来源 | 说明 |
| --- | --- | --- | --- | --- |
| `--paseo-primary` | `#BA5B37` | `#20744A` | `colorPrimary` |  |
| `--paseo-primary-hover` | `#943F25` | `#347552` | `colorPrimaryHover` |  |
| `--paseo-primary-active` | `#6E2716` | `#1c5237` | `colorPrimaryActive` |  |
| `--paseo-primary-bg` | `#FAF1EB` | `#183124` | `colorPrimaryBg` |  |
| `--paseo-primary-bg-hover` | `#EDE5DF` | `#193f2c` | `colorPrimaryBgHover` |  |
| `--paseo-primary-border` | `#E0C1AF` | `#183124` | `colorPrimaryBorder` |  |
| `--paseo-primary-border-hover` | `#D49E83` | `#193f2c` | `colorPrimaryBorderHover` |  |
| `--paseo-primary-text` | `#A34E2D` | `#7ccba0` | `colorPrimaryText` |  |
| `--paseo-primary-text-hover` | `#7D351D` | `#ecfaf1` | `colorPrimaryTextHover` |  |
| `--paseo-primary-text-active` | `#571F10` | `#cbdcd2` | `colorPrimaryTextActive` |  |
| `--paseo-success` | `#467650` | `#6cb17b` | `colorSuccess` |  |
| `--paseo-success-hover` | `#50865c` | `#85ac8c` | `colorSuccessHover` |  |
| `--paseo-success-active` | `#3a6343` | `#4d7a57` | `colorSuccessActive` |  |
| `--paseo-success-bg` | `#d2f6d8` | `#19201b` | `colorSuccessBg` |  |
| `--paseo-success-bg-hover` | `#b8f3c2` | `#223226` | `colorSuccessBgHover` |  |
| `--paseo-success-border` | `#92eda5` | `#2e4333` | `colorSuccessBorder` |  |
| `--paseo-success-border-hover` | `#88de9b` | `#3c5b42` | `colorSuccessBorderHover` |  |
| `--paseo-success-text` | `#467650` | `#c4d0c6` | `colorSuccessText` |  |
| `--paseo-success-text-hover` | `#3e6947` | `#d1dfd2` | `colorSuccessTextHover` |  |
| `--paseo-success-text-active` | `#365d3e` | `#b3c0b5` | `colorSuccessTextActive` |  |
| `--paseo-warning` | `#806340` | `#c09664` | `colorWarning` |  |
| `--paseo-warning-hover` | `#91714a` | `#baa17f` | `colorWarningHover` |  |
| `--paseo-warning-active` | `#6c5335` | `#846948` | `colorWarningActive` |  |
| `--paseo-warning-bg` | `#f6e9da` | `#221d18` | `colorWarningBg` |  |
| `--paseo-warning-bg-hover` | `#f2dec7` | `#352c21` | `colorWarningBgHover` |  |
| `--paseo-warning-border` | `#eccfad` | `#483b2c` | `colorWarningBorder` |  |
| `--paseo-warning-border-hover` | `#e7c092` | `#614f38` | `colorWarningBorderHover` |  |
| `--paseo-warning-text` | `#806340` | `#e0dbd2` | `colorWarningText` |  |
| `--paseo-warning-text-hover` | `#725839` | `#eeeae0` | `colorWarningTextHover` |  |
| `--paseo-warning-text-active` | `#654e31` | `#cfc2ae` | `colorWarningTextActive` |  |
| `--paseo-error` | `#a14b43` | `#d8847b` | `colorError` |  |
| `--paseo-error-hover` | `#b7554d` | `#d1a099` | `colorErrorHover` |  |
| `--paseo-error-active` | `#883e38` | `#935d57` | `colorErrorActive` |  |
| `--paseo-error-bg` | `#f6e7e5` | `#261b1b` | `colorErrorBg` |  |
| `--paseo-error-bg-hover` | `#f2dbd8` | `#3c2826` | `colorErrorBgHover` |  |
| `--paseo-error-border` | `#edcbc7` | `#4f3633` | `colorErrorBorder` |  |
| `--paseo-error-border-hover` | `#e7bbb6` | `#6c4642` | `colorErrorBorderHover` |  |
| `--paseo-error-text` | `#a14b43` | `#f8ece9` | `colorErrorText` |  |
| `--paseo-error-text-hover` | `#91423c` | `#faefec` | `colorErrorTextHover` |  |
| `--paseo-error-text-active` | `#803a34` | `#e7d2ce` | `colorErrorTextActive` |  |
| `--paseo-info` | `#436c96` | `#5caaf6` | `colorInfo` |  |
| `--paseo-info-hover` | `#4d7baa` | `#7cb5e8` | `colorInfoHover` |  |
| `--paseo-info-active` | `#375b7e` | `#4376a7` | `colorInfoActive` |  |
| `--paseo-info-bg` | `#e3ecf6` | `#18202a` | `colorInfoBg` |  |
| `--paseo-info-bg-hover` | `#d5e3f2` | `#203043` | `colorInfoBgHover` |  |
| `--paseo-info-border` | `#c3d7ec` | `#2a4158` | `colorInfoBorder` |  |
| `--paseo-info-border-hover` | `#b0cbe6` | `#34587a` | `colorInfoBorderHover` |  |
| `--paseo-info-text` | `#436c96` | `#d3e9f8` | `colorInfoText` |  |
| `--paseo-info-text-hover` | `#3b6186` | `#ecf4fa` | `colorInfoTextHover` |  |
| `--paseo-info-text-active` | `#345577` | `#a8d3f3` | `colorInfoTextActive` |  |
| `--paseo-bg-layout` | `#F0EDE2` | `#181B1A` | `colorBgLayout` |  |
| `--paseo-bg-container` | `#F5F4EC` | `#1E2120` | `colorBgContainer` |  |
| `--paseo-bg-elevated` | `#FFFFFF` | `#272A29` | `colorBgElevated` |  |
| `--paseo-bg-spotlight` | `#1F1E1D` | `#272A29` | `colorBgSpotlight` |  |
| `--paseo-bg-mask` | `rgba(20, 20, 19, 0.45)` | `rgba(0, 0, 0, 0.65)` | `colorBgMask` |  |
| `--paseo-surface-0` | `#F0EDE2` | `#181B1A` | `paseoSurface0` |  |
| `--paseo-surface-1` | `#F5F4EC` | `#1E2120` | `paseoSurface1` |  |
| `--paseo-surface-2` | `#FFFFFF` | `#272A29` | `paseoSurface2` |  |
| `--paseo-surface-3` | `#D7D2C7` | `#434645` | `paseoSurface3` |  |
| `--paseo-surface-4` | `#D1CCBF` | `#595B5B` | `paseoSurface4` |  |
| `--paseo-surface-sidebar` | `#E2E0D6` | `#141716` | `paseoSurfaceSidebar` |  |
| `--paseo-surface-head` | `#E0DDD0` | `#1E2120` | `paseoSurfaceHead` / `paseoSurface1` | 深色主题没有 paper-on-paper 表头概念，用面板色 surface1 补位（与 Table.headerBg 一致）。 |
| `--paseo-surface-hover` | `#DDD9CE` | `#1E2120` | `paseoSurfaceHover` / `paseoSurface1` | 深色主题的卡片 hover 就是面板色 surface1（与 Table.rowHoverBg 一致）。 |
| `--paseo-text` | `#3C3C2C` | `#fafafa` | `colorText` |  |
| `--paseo-text-secondary` | `#55554B` | `#A1A5A4` | `colorTextSecondary` |  |
| `--paseo-text-tertiary` | `#65635E` | `#8A8E8D` | `colorTextTertiary` |  |
| `--paseo-text-quaternary` | `#98978F` | `#595B5B` | `colorTextQuaternary` |  |
| `--paseo-text-light-solid` | `#FFFFFF` | `#fff` | `colorTextLightSolid` |  |
| `--paseo-border` | `#DBD9D0` | `#252B2A` | `colorBorder` |  |
| `--paseo-border-secondary` | `#E8E6DF` | `#2F3534` | `colorBorderSecondary` |  |
| `--paseo-split` | `rgba(28,11,19,0.06)` | `rgba(219,255,254,0.09)` | `colorSplit` |  |
| `--paseo-fill` | `#D1CCBF` | `#434645` | `colorFill` |  |
| `--paseo-fill-secondary` | `#D7D2C7` | `#272A29` | `colorFillSecondary` |  |
| `--paseo-fill-tertiary` | `#DDD9CE` | `#1E2120` | `colorFillTertiary` |  |
| `--paseo-fill-quaternary` | `#EDEBE0` | `#252B2A` | `colorFillQuaternary` |  |
| `--paseo-control-item-bg-hover` | `#DDD9CE` | `#1E2120` | `controlItemBgHover` |  |
| `--paseo-control-item-bg-active` | `#FAF1EB` | `#183124` | `controlItemBgActive` |  |
| `--paseo-link` | `#A34E2D` | `#7ccba0` | `colorLink` |  |
| `--paseo-link-hover` | `#7D351D` | `#deebe3` | `colorLinkHover` |  |
| `--paseo-link-active` | `#571F10` | `#cbdcd2` | `colorLinkActive` |  |
| `--paseo-diff-addition` | `#c1f4ca` | `#32573a` | `paseoDiffAddition` |  |
| `--paseo-diff-addition-text` | `#3e6947` | `#6cb17b` | `paseoDiffAdditionText` |  |
| `--paseo-diff-deletion` | `#f3dfdd` | `#783630` | `paseoDiffDeletion` |  |
| `--paseo-diff-deletion-text` | `#91423c` | `#d8847b` | `paseoDiffDeletionText` |  |
| `--paseo-status-dot-success` | `#467650` | `#35c264` | `paseoStatusDotSuccess` |  |
| `--paseo-status-dot-danger` | `#a14b43` | `#f7796d` | `paseoStatusDotDanger` |  |
| `--paseo-status-dot-warning` | `#806340` | `#db932e` | `paseoStatusDotWarning` |  |
| `--paseo-status-dot-running` | `#436c96` | `#5caaf6` | `paseoStatusDotRunning` |  |
| `--paseo-status-merged` | `#774fb3` | `#a890d5` | `paseoStatusMerged` |  |
| `--paseo-selection` | `rgba(186, 91, 55, 0.32)` | `rgba(255, 255, 255, 0.2)` | `paseoSelection` |  |
| `--paseo-identity-violet` | `#7a5ac1` | `#a392d5` | `paseoIdentityViolet` |  |
| `--paseo-identity-sky` | `#4a7795` | `#6aa6ce` | `paseoIdentitySky` |  |
| `--paseo-identity-emerald` | `#4c7d6b` | `#6cae96` | `paseoIdentityEmerald` |  |
| `--paseo-identity-orange` | `#936646` | `#cc8f64` | `paseoIdentityOrange` |  |
| `--paseo-identity-pink` | `#a84f76` | `#d87da3` | `paseoIdentityPink` |  |
| `--paseo-identity-indigo` | `#6166c1` | `#9299d5` | `paseoIdentityIndigo` |  |
| `--paseo-identity-teal` | `#4c7b7b` | `#6cacab` | `paseoIdentityTeal` |  |
| `--paseo-identity-red` | `#ad5151` | `#d88381` | `paseoIdentityRed` |  |
| `--paseo-identity-amber` | `#807046` | `#b29d64` | `paseoIdentityAmber` |  |
| `--paseo-identity-blue` | `#4773ae` | `#7ba1d5` | `paseoIdentityBlue` |  |
| `--paseo-identity-ink` | `#FFFFFF` | `#1F1E1D` | `paseoIdentityInk` |  |
| `--paseo-font` | `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif` | `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif` | `fontFamily` |  |
| `--paseo-font-mono` | `SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace` | `SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace` | `fontFamilyCode` |  |
| `--paseo-radius-xs` | `4px` | `4px` | `borderRadiusXS` |  |
| `--paseo-radius-sm` | `8px` | `8px` | `borderRadiusSM` |  |
| `--paseo-radius-md` | `12px` | `12px` | `borderRadius` |  |
| `--paseo-radius-lg` | `12px` | `12px` | `borderRadiusLG` |  |
