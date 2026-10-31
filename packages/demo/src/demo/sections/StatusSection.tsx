import { Card, Typography } from "antd";
import { Note, useSchemeTokens } from "../primitives";

const { Paragraph } = Typography;

const dotStates = [
  {
    key: "success",
    token: "paseoStatusDotSuccess",
    dotClass: "bg-status-dot-success",
    detail: "3 个检查全部完成",
  },
  {
    key: "warning",
    token: "paseoStatusDotWarning",
    dotClass: "bg-status-dot-warning",
    detail: "1 个测试需要复查",
  },
  {
    key: "danger",
    token: "paseoStatusDotDanger",
    dotClass: "bg-status-dot-danger",
    detail: "构建失败于 step 4",
  },
  {
    key: "running",
    token: "paseoStatusDotRunning",
    dotClass: "bg-status-dot-running",
    detail: "正在执行 12s",
  },
];

export function StatusSection() {
  const { has } = useSchemeTokens();
  const custom = has("paseoStatusDotSuccess");

  return (
    <Card variant="borderless" title="状态圆点" size="small">
      {!custom && <Note>当前方案没有自定义状态圆点 token——回退到 antd 状态色。</Note>}
      <div className="grid max-w-lg gap-3">
        {dotStates.map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <span
              title={`--paseo-${s.dotClass.replace(/^bg-/, "")}`}
              className={`${s.dotClass} h-2 w-2 shrink-0 rounded-full`}
            />
            <code className="min-w-36 text-xs">{s.token}</code>
            <span className="text-xs text-text-secondary">{s.detail}</span>
          </div>
        ))}
      </div>
      <Paragraph type="secondary" className="mt-3 text-xs" style={{ marginBottom: 0 }}>
        五个色相、同一色度家族（paseo 的归一化状态色）；merged 色 <code>paseoStatusMerged</code>{" "}
        用于 PR 合并态：
        <span className="ml-2 inline-block h-2 w-2 rounded-full bg-status-merged align-middle" />
      </Paragraph>
    </Card>
  );
}
