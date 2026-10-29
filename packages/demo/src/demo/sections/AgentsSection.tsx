import { Badge, Card, Table, Tag, Typography } from "antd";

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

/** Alphabetical, matching the sorted order the token table uses. */
const IDENTITY_NAMES = [
  "amber",
  "blue",
  "emerald",
  "indigo",
  "orange",
  "pink",
  "red",
  "sky",
  "teal",
  "violet",
] as const;

export function AgentsSection() {
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
      align: "right" as const,
      render: (_: unknown, row: (typeof agents)[number]) => (
        <span className="font-mono tabular-nums">
          <span className="text-diff-addition-text">+{row.added}</span>{" "}
          <span className="text-diff-deletion-text">−{row.removed}</span>
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
        const name = IDENTITY_NAMES[index % IDENTITY_NAMES.length];
        return <Badge color={`var(--paseo-identity-${name})`} text={`host-${index + 1}`} />;
      },
    },
  ];

  return (
    <Card variant="borderless" title="Agent 列表" size="small">
      <Table size="small" columns={columns} dataSource={agents} pagination={false} />
      <Paragraph className="mt-3" style={{ marginBottom: 0 }} type="secondary">
        变更列用 <code>paseoDiffAdditionText</code>/<code>paseoDiffDeletionText</code>（paseo
        规定统计是状态信号，不用 diff 色阶）；Host 列色点取自 <code>paseoIdentity*</code>{" "}
        十色身份盘。切换到其他方案可见回退效果。
      </Paragraph>
    </Card>
  );
}
