import { Card, Typography } from "antd";
import { Note, useSchemeTokens } from "../primitives";

const { Paragraph } = Typography;

const dotStates = [
  { key: "success", label: "passed", dot: "paseoStatusDotSuccess", detail: "3 个检查全部完成" },
  { key: "warning", label: "flaky", dot: "paseoStatusDotWarning", detail: "1 个测试需要复查" },
  { key: "danger", label: "failed", dot: "paseoStatusDotDanger", detail: "构建失败于 step 4" },
  { key: "running", label: "running", dot: "paseoStatusDotRunning", detail: "正在执行 12s" },
];

export function StatusSection() {
  const { t, get, has } = useSchemeTokens();
  const custom = has("paseoStatusDotSuccess");

  return (
    <Card variant="borderless" title="状态圆点" size="small">
      {!custom && <Note>当前方案没有自定义状态圆点 token——回退到 antd 状态色。</Note>}
      <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
        {dotStates.map((s) => (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              title={s.dot}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: get(s.dot, t.colorSuccess),
                flex: "none",
              }}
            />
            <code style={{ minWidth: 150, fontSize: 12 }}>{s.dot}</code>
            <span style={{ color: t.colorTextSecondary, fontSize: 12 }}>{s.detail}</span>
          </div>
        ))}
      </div>
      <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 12, marginBottom: 0 }}>
        六个色相、同一色度家族（paseo 的归一化状态色）；merged 色 <code>paseoStatusMerged</code>{" "}
        用于 PR 合并态：
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: get("paseoStatusMerged", t.colorPrimary),
            marginLeft: 8,
            verticalAlign: "middle",
          }}
        />
      </Paragraph>
    </Card>
  );
}
