import { writeFileSync } from "node:fs";
import { PASEO_DARK_TOKEN_MAPPING } from "../src/paseo/theme.ts";

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

最小方案：深色只钉 13 个 token（五个颜色族的种子 + 三个背景 + 字体栈），
其余全部由 antd 以 paseo 的种子色自行派生。浅色是 antd 默认主题，仅字体栈例外。

### 深色主题（Paseo Dark）

${table(PASEO_DARK_TOKEN_MAPPING)}
`;

writeFileSync(new URL("../MAPPING.md", import.meta.url), doc);
console.log("MAPPING.md written");
