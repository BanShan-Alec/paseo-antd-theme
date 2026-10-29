import { writeFileSync } from "node:fs";
import { PASEO_DARK_TOKEN_MAPPING as FULL_DARK_MAPPING } from "../src/themes/paseo-dark/theme.ts";
import { CLAUDE_LIGHT_TOKEN_MAPPING } from "../src/themes/claude/theme.ts";
import { resolveTailwindVariables, TAILWIND_VARIABLES } from "../src/tailwind/build.ts";

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

const docTemplate = `<!-- 由 scripts/dump-mapping.ts 生成，请勿手改 -->

## 完整映射表

### 完整方案 · 深色（Paseo Dark + Claude.ai 形态）

paseo 配色 + Claude.ai 形态：40px 控件、14px 正文、12px 圆角、软阴影。
Diff 行底已降饱和为 \`#32573a\` / \`#783630\`。

${table(FULL_DARK_MAPPING)}

### Claude 浅色（Claude Light）

Claude 品牌表面 + Claude Code 信号色 + paseo 归一化状态色（OKLCH L*=0.52 / 55% 彩度）。
主色 clay 的按钮文字为白字（4.53:1）；链接复用主色的 text 档（4.86:1），不再单独引入蓝色。

${table(CLAUDE_LIGHT_TOKEN_MAPPING)}
`;

function tailwindSection(): string {
  const { light, dark } = resolveTailwindVariables();
  const lines = [
    "| Tailwind 变量 | 浅色值（Claude Light） | 深色值（Paseo Dark） | antd token 来源 | 说明 |",
    "| --- | --- | --- | --- | --- |",
  ];
  for (const spec of TAILWIND_VARIABLES) {
    const source = `\`${spec.source}\`${spec.darkSource ? ` / \`${spec.darkSource}\`` : ""}`;
    const note =
      spec.note ??
      (spec.darkSource ? `深色主题无对应概念，取自 \`${spec.darkSource}\`` : "");
    lines.push(
      `| \`--paseo-${spec.name}\` | \`${light[spec.name]}\` | \`${dark[spec.name]}\` | ${source} | ${note} |`,
    );
  }
  return [
    "## Tailwind 变量映射\n",
    "`src/tailwind/{theme.css,vars.css,preset.cjs}` 由 `scripts/gen-tailwind.ts` 生成：值经 antd 管线解析（含算法派生的",
    "hover/active/色阶槽位）。`theme.css` 是 Tailwind v4 导出（`@theme inline`）；`vars.css` 是同一批变量的 v3 版本；",
    "`preset.cjs` 是 v3 preset，每个 utility 的值都指向 `var(--paseo-*)`。浅色写在 `:root`，深色同时写在",
    "`@media (prefers-color-scheme: dark)` 与 `.dark`。\n",
    lines.join("\n"),
  ].join("\n");
}

const doc = `${docTemplate}${tailwindSection()}
`;

writeFileSync(new URL("../MAPPING.md", import.meta.url), doc);
console.log("MAPPING.md written");
