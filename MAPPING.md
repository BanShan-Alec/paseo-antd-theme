<!-- 由 scripts/dump-mapping.ts 生成，请勿手改 -->

## 完整映射表

最小方案：深色只钉 13 个 token（五个颜色族的种子 + 三个背景 + 字体栈），
其余全部由 antd 以 paseo 的种子色自行派生。浅色是 antd 默认主题，仅字体栈例外。

### 深色主题（Paseo Dark）

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
