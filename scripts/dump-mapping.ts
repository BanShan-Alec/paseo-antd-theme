import { writeFileSync } from "node:fs";
import { PASEO_DARK_TOKEN_MAPPING as FULL_DARK_MAPPING } from "../src/themes/paseo-dark/theme.ts";
import { CLAUDE_LIGHT_TOKEN_MAPPING } from "../src/themes/claude/theme.ts";

function table(
  rows: readonly {
    antdToken: string;
    kind: string;
    value: string | number;
    paseoToken: string;
    note?: string;
  }[],
): string {
  const lines = [
    "| antd token | 类型 | 值 | paseo 来源 | 说明 |",
    "| --- | --- | --- | --- | --- |",
  ];
  for (const row of rows) {
    lines.push(
      `| \`${row.antdToken}\` | ${row.kind} | \`${row.value}\` | \`${row.paseoToken}\` | ${row.note ?? ""} |`,
    );
  }
  return lines.join("\n");
}

const doc = `<!-- 由 scripts/dump-mapping.ts 生成，请勿手改 -->

## 完整映射表

### 完整方案 · 深色（Paseo Dark + Claude.ai 形态）

paseo 配色 + Claude.ai 形态：40px 控件、14px 正文、12px 圆角、软阴影。
Diff 行底已降饱和为 \`#32573a\` / \`#783630\`。

${table(FULL_DARK_MAPPING)}

### Claude 浅色（Claude Light）

Claude 品牌表面 + Claude Code 信号色 + paseo 归一化状态色（OKLCH L*=0.52 / 55% 彩度）。
主色 clay 的按钮文字为白字（4.53:1）；链接为压暗后的 Claude suggestion 蓝。

${table(CLAUDE_LIGHT_TOKEN_MAPPING)}
`;

writeFileSync(new URL("../MAPPING.md", import.meta.url), doc);
console.log("MAPPING.md written");
