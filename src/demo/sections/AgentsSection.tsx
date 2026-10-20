import { Badge, Card, Table, Tag, Typography } from "antd";
import { useSchemeTokens } from "../primitives";

const { Paragraph } = Typography;

const agents = [
  { key: "1", name: "claude-code", state: "running", added: 128, removed: 12 },
  { key: "2", name: "codex", state: "success", added: 34, removed: 3 },
  { key: "3", name: "copilot", state: "warning", added: 7, removed: 41 },
  { key: "4", name: "pi", state: "danger", added: 0, removed: 88 },
];

const stateTag: Record<string, { color: string; label: string }> = {
  running: { color: "processing", label: "running" },
  success: { color: "success", label: "passed" },
  warning: { color: "warning", label: "flaky" },
  danger: { color: "error", label: "failed" },
};

export function AgentsSection() {
  const { t, get } = useSchemeTokens();
  const identityKeys = Object.keys(t)
    .filter((key) => key.startsWith("paseoIdentity"))
    .sort();
  const addText = t.paseoDiffAdditionText;
  const delText = t.paseoDiffDeletionText;

  const columns = [
    { title: "Agent", dataIndex: "name", key: "name" },
    {
      title: "状态",
      dataIndex: "state",
      key: "state",
      render: (state: string) => <Tag color={stateTag[state].color}>{stateTag[state].label}</Tag>,
    },
    {
      title: "变更",
      key: "diff",
      render: (_: unknown, row: (typeof agents)[number]) => (
        <span style={{ fontFamily: "var(--paseo-mono, monospace)" }}>
          <span style={addText ? { color: addText } : undefined}>+{row.added}</span>{" "}
          <span style={delText ? { color: delText } : undefined}>−{row.removed}</span>
        </span>
      ),
    },
    {
      title: "Host",
      key: "host",
      render: (_: unknown, _record: unknown, index: number) => {
        // A color makes Badge render its status dot; without one it falls
        // back to the count variant, which is ~19px wider and shifts the
        // table's auto layout.
        const key = identityKeys[index % identityKeys.length];
        return <Badge color={key ? get(key, "blue") : "blue"} text={`host-${index + 1}`} />;
      },
    },
  ];

  return (
    <Card variant="borderless" title="Agent 列表" size="small">
      <Table size="small" columns={columns} dataSource={agents} pagination={false} />
      <Paragraph style={{ marginTop: 12, marginBottom: 0 }} type="secondary">
        变更列用 <code>paseoDiffAdditionText</code>/<code>paseoDiffDeletionText</code>（paseo
        规定统计是状态信号，不用 diff 色阶）；Host 列色点取自 <code>paseoIdentity*</code>{" "}
        十色身份盘。切换到其他方案可见回退效果。
      </Paragraph>
    </Card>
  );
}
