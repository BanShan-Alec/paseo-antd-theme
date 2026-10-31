import { Card, Typography } from "antd";
import { Note, useSchemeTokens } from "../primitives";

const { Paragraph } = Typography;

const diffLines = [
  { type: "add" as const, text: "+ const answer = compute();" },
  { type: "context" as const, text: "  function compute() {" },
  { type: "del" as const, text: "− const answer = 42;" },
  { type: "add" as const, text: "+   return answer * 2;" },
  { type: "context" as const, text: "  }" },
];

const LINE_CLASS = {
  add: "bg-diff-addition",
  del: "bg-diff-deletion",
  context: "text-text-tertiary",
} as const;

export function DiffSection() {
  const { has } = useSchemeTokens();
  const custom = has("paseoDiffAddition");

  return (
    <Card variant="borderless" title="Diff 视图" size="small">
      {!custom && <Note>当前方案没有自定义 diff token——行底色与统计色回退到 antd 派生值。</Note>}
      <div className="font-mono text-sm">
        <div className="mb-2">
          统计：
          <span className="font-semibold text-diff-addition-text">+128</span>{" "}
          <span className="font-semibold text-diff-deletion-text">−12</span>
          <span className="text-text-tertiary">
            {" "}
            （paseoDiffAdditionText / paseoDiffDeletionText）
          </span>
        </div>
        <div className="overflow-hidden rounded-md">
          {diffLines.map((line, i) => (
            <div key={i} className={`px-3 py-1 ${LINE_CLASS[line.type]}`}>
              {line.text}
            </div>
          ))}
        </div>
        <Paragraph type="secondary" className="mt-2 text-xs" style={{ marginBottom: 0 }}>
          行底色用 <code>paseoDiffAddition</code>/<code>paseoDiffDeletion</code>（从归一化状态色相派生的
          低饱和行底）——逐行扫描时颜色本身就是信号。
        </Paragraph>
      </div>
    </Card>
  );
}
