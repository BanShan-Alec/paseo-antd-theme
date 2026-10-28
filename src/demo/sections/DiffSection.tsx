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

export function DiffSection() {
  const { t, get, has } = useSchemeTokens();
  const custom = has("paseoDiffAddition");
  const addBg = get("paseoDiffAddition", t.colorSuccessBg);
  const delBg = get("paseoDiffDeletion", t.colorErrorBg);
  const addText = get("paseoDiffAdditionText", t.colorSuccess);
  const delText = get("paseoDiffDeletionText", t.colorError);

  return (
    <Card variant="borderless" title="Diff 视图" size="small">
      {!custom && <Note>当前方案没有自定义 diff token——行底色与统计色回退到 antd 派生值。</Note>}
      <div style={{ fontFamily: "var(--paseo-mono, monospace)", fontSize: 13 }}>
        <div style={{ marginBottom: 8 }}>
          统计：
          <span style={{ color: addText, fontWeight: 600 }}>+128</span>{" "}
          <span style={{ color: delText, fontWeight: 600 }}>−12</span>
          <span style={{ color: t.colorTextTertiary }}> （paseoDiffAdditionText / paseoDiffDeletionText）</span>
        </div>
        <div style={{ borderRadius: 6, overflow: "hidden" }}>
          {diffLines.map((line, i) => (
            <div
              key={i}
              style={{
                padding: "2px 10px",
                background:
                  line.type === "add" ? addBg : line.type === "del" ? delBg : "transparent",
                color: line.type === "context" ? t.colorTextTertiary : undefined,
              }}
            >
              {line.text}
            </div>
          ))}
        </div>
        <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8, marginBottom: 0 }}>
          行底色用 <code>paseoDiffAddition</code>/<code>paseoDiffDeletion</code>（从归一化状态色相派生的
          低饱和行底）——逐行扫描时颜色本身就是信号。
        </Paragraph>
      </div>
    </Card>
  );
}
