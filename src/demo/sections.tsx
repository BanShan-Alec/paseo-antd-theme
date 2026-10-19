import { useState } from "react";
import {
  Alert,
  App as AntApp,
  Badge,
  Button,
  Card,
  Col,
  Input,
  Layout,
  Menu,
  Modal,
  Progress,
  Row,
  Segmented,
  Select,
  Slider,
  Switch,
  Table,
  Tabs,
  Tag,
  theme as antdTheme,
  Typography,
} from "antd";

const { Header, Sider, Content } = Layout;
import * as full from "../paseo-full/theme";
import * as minimal from "../paseo/theme";
import * as claude from "../claude/theme";
import type { TokenMapping } from "../paseo/theme";

const { Paragraph, Text } = Typography;

export type View = "light" | "claude" | "minimal" | "full";

/** Live token accessor with graceful degradation when a token is absent. */
function useSchemeTokens() {
  const { token } = antdTheme.useToken();
  const t = token as unknown as Record<string, string>;
  return {
    t,
    has: (key: string) => Boolean(t[key]),
    get: (key: string, fallback: string) => t[key] ?? fallback,
  };
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <Alert
      type="info"
      showIcon
      style={{ marginBottom: 16 }}
      message={<span style={{ fontSize: 13 }}>{children}</span>}
    />
  );
}

function SpaceWrap({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>{children}</div>
  );
}

// ---------------------------------------------------------------------------
// 概览 — general antd components
// ---------------------------------------------------------------------------

export function OverviewSection() {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} xl={12}>
        <Card variant="borderless" title="按钮" size="small">
          <SpaceWrap>
            <Button type="primary">Run agent</Button>
            <Button>Cancel</Button>
            <Button type="dashed">Dashed</Button>
            <Button type="text">Text</Button>
            <Button type="link">Link</Button>
            <Button danger>Delete</Button>
            <Button type="primary" loading>
              Loading
            </Button>
            <Button type="primary" disabled>
              Disabled
            </Button>
          </SpaceWrap>
        </Card>
      </Col>

      <Col xs={24} xl={12}>
        <Card variant="borderless" title="状态与反馈" size="small">
          <SpaceWrap>
            <Tag color="success">success</Tag>
            <Tag color="warning">warning</Tag>
            <Tag color="error">error</Tag>
            <Tag color="processing">running</Tag>
            <Tag color="purple">merged</Tag>
            <Progress percent={72} size="small" style={{ width: 160, marginInline: 4 }} />
          </SpaceWrap>
          <div style={{ marginTop: 12 }}>
            <Alert type="success" showIcon message="CI 通过 — 3 个检查全部完成" />
          </div>
          <div style={{ marginTop: 8 }}>
            <Alert type="warning" showIcon message="1 个 flaky 测试需要复查" />
          </div>
        </Card>
      </Col>

      <Col xs={24} xl={12}>
        <Card variant="borderless" title="表单控件" size="small">
          <div style={{ display: "grid", gap: 12, maxWidth: 420 }}>
            <Input placeholder="搜索 agent、文件、命令…" allowClear />
            <Select
              defaultValue="claude"
              options={[
                { value: "claude", label: "Claude Code" },
                { value: "codex", label: "Codex" },
                { value: "copilot", label: "GitHub Copilot" },
              ]}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Switch defaultChecked />
              <Slider defaultValue={40} style={{ flex: 1, margin: 0 }} />
            </div>
            <Segmented
              block
              defaultValue="all"
              options={[
                { label: "全部", value: "all" },
                { label: "运行中", value: "running" },
                { label: "已完成", value: "done" },
              ]}
            />
          </div>
        </Card>
      </Col>
    </Row>
  );
}

// ---------------------------------------------------------------------------
// Agent 列表 — table consuming diff-stat and identity tokens
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Diff 视图 — consuming the diff line-fill and stat-text tokens
// ---------------------------------------------------------------------------

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
          <span style={{ opacity: 0.6 }}> （paseoDiffAdditionText / paseoDiffDeletionText）</span>
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

// ---------------------------------------------------------------------------
// 状态圆点 — consuming the status-dot tokens
// ---------------------------------------------------------------------------

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
      <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        {dotStates.map((s) => (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
            <code style={{ minWidth: 150, fontSize: 13 }}>{s.dot}</code>
            <span style={{ opacity: 0.7, fontSize: 13 }}>{s.detail}</span>
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
            marginLeft: 6,
            verticalAlign: "middle",
          }}
        />
      </Paragraph>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Host 身份色 — consuming the identity palette + selection token
// ---------------------------------------------------------------------------

const hosts = [
  { name: "macbook-pro", key: "violet" },
  { name: "linux-box", key: "sky" },
  { name: "ci-runner", key: "emerald" },
  { name: "gpu-node", key: "orange" },
  { name: "raspberry-pi", key: "pink" },
];

export function HostsSection() {
  const { t, get, has } = useSchemeTokens();
  const identityKeys = Object.keys(t)
    .filter((key) => key.startsWith("paseoIdentity"))
    .sort();
  const custom = identityKeys.length > 0;
  const selection = t.paseoSelection;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} xl={12}>
        <Card variant="borderless" title="Host 身份色" size="small">
          {!custom && <Note>当前方案没有自定义身份色 token——回退 antd 默认徽章。</Note>}
          <div style={{ display: "grid", gap: 10 }}>
            {hosts.map((host, i) => {
              const key = identityKeys[i % identityKeys.length];
              const color = key ? get(key, t.colorPrimary) : t.colorPrimary;
              return (
                <div key={host.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    title={key ?? ""}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 4,
                      background: color,
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      flex: "none",
                    }}
                  >
                    {host.name[0].toUpperCase()}
                  </span>
                  <span style={{ fontSize: 13 }}>{host.name}</span>
                  <code style={{ fontSize: 11, opacity: 0.6, marginLeft: "auto" }}>
                    {key ?? "antd 默认"}
                  </code>
                </div>
              );
            })}
          </div>
          <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 12, marginBottom: 0 }}>
            十色全部压在同一对比度带（对白字 ≥4.2:1）——颜色起识别作用，不排名。
          </Paragraph>
        </Card>
      </Col>

      <Col xs={24} xl={12}>
        <Card variant="borderless" title="Selection" size="small">
          {selection && (
            <style>{`.demo-selectable::selection { background: ${selection}; }`}</style>
          )}
          {!selection && <Note>当前方案没有自定义 selection token——用浏览器默认选区色。</Note>}
          <p className="demo-selectable" style={{ fontSize: 13, lineHeight: 1.8 }}>
            试着选中这段文字——选区背景色来自 <code>paseoSelection</code> token。
            Paseo 把它定义为终端选区色的 Web 对应物，深色主题下是 20% 白的叠加。
          </p>
        </Card>
      </Col>
    </Row>
  );
}

// ---------------------------------------------------------------------------
// 组件 Token — the component-token groups the full scheme configures
// ---------------------------------------------------------------------------

const COMPONENT_COVERAGE: { group: string; tokens: string; where: string }[] = [
  { group: "Layout", tokens: "bodyBg / siderBg / headerBg / triggerBg", where: "本页 + 整页骨架" },
  { group: "Menu", tokens: "darkItem*（深色）/ item*（浅色）", where: "左侧边栏" },
  { group: "Table", tokens: "headerBg / rowHoverBg / borderColor / headerSort*Bg", where: "Agent 列表页" },
  { group: "Segmented", tokens: "trackBg / trackPadding / itemSelectedBg / itemColor", where: "概览页 + 右上角（+ Provider 4px 间隙）" },
  { group: "Tabs", tokens: "itemColor / itemSelectedColor / inkBarColor", where: "本页" },
  { group: "Card", tokens: "headerBg", where: "所有卡片" },
  { group: "Alert", tokens: "borderRadius", where: "概览页（补 antd css-var 默认缺失）" },
  { group: "Input", tokens: "hoverBorderColor / activeBorderColor", where: "概览页表单" },
  { group: "Modal", tokens: "contentBg / headerBg", where: "本页" },
  { group: "Message", tokens: "contentBg", where: "本页" },
  { group: "Notification", tokens: "colorBgElevated", where: "本页" },
  { group: "Button", tokens: "primaryShadow / defaultShadow / dangerShadow", where: "概览页（软阴影）" },
];

export function ComponentsSection({ isLight }: { isLight: boolean }) {
  const { message, notification } = AntApp.useApp();
  const { token } = antdTheme.useToken();
  const [modalOpen, setModalOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} xl={12}>
        <Card variant="borderless" title="Tabs" size="small">
          <Tabs
            items={[
              { key: "1", label: "工作区", children: <p style={{ fontSize: 13 }}>3 个 agent 正在运行…</p> },
              { key: "2", label: "Git", children: <p style={{ fontSize: 13 }}>main ← feat/diff-view（+128 −12）</p> },
              { key: "3", label: "浏览器", children: <p style={{ fontSize: 13 }}>预览 localhost:3000</p> },
            ]}
          />
          <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 0 }}>
            {isLight ? (
              <>
                选中项文字用 <code>accentText</code>、ink bar 用 clay——clay 本身在浅色上作为文字只有
                3.85:1。
              </>
            ) : (
              <>
                选中项与 ink bar 用 <code>accentBright</code>——深色背景上深绿 accent 不可读。
              </>
            )}
          </Paragraph>
        </Card>
      </Col>

      <Col xs={24} xl={12}>
        <Card variant="borderless" title="浮层：Modal / Message / Notification" size="small">
          <SpaceWrap>
            <Button type="primary" onClick={() => setModalOpen(true)}>
              打开 Modal
            </Button>
            <Button onClick={() => message.success("Agent 已完成 3 个检查")}>Message</Button>
            <Button
              onClick={() =>
                notification.open({
                  message: "CI 通过",
                  description: "3 个检查全部完成，用时 42s",
                  placement: "bottomRight",
                })
              }
            >
              Notification
            </Button>
          </SpaceWrap>
          <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 12, marginBottom: 0 }}>
            Modal 用 surface2 作内容底；Message/Notification 经 <code>App.useApp()</code>{" "}
            挂载以继承主题（静态方法不继承 ConfigProvider）。
          </Paragraph>
          <Modal
            open={modalOpen}
            onOk={() => setModalOpen(false)}
            onCancel={() => setModalOpen(false)}
            title="删除 worktree？"
          >
            <p style={{ fontSize: 13 }}>此操作会移除 agent-work-3 的 worktree，未提交的更改将丢失。</p>
          </Modal>
        </Card>
      </Col>

      <Col xs={24} xl={12}>
        <Card variant="borderless" title="Layout" size="small">
          <Layout style={{ height: 220, borderRadius: 8, overflow: "hidden" }}>
            <Sider
              theme={isLight ? "light" : "dark"}
              width={150}
              collapsible
              collapsed={collapsed}
              onCollapse={setCollapsed}
              trigger={<span style={{ fontSize: 12 }}>{collapsed ? "展开" : "收起"}</span>}
            >
              <div style={{ padding: 12, color: token.colorText, fontSize: 12 }}>
                Sider · siderBg
              </div>
            </Sider>
            <Layout>
              <Header style={{ height: 40, fontSize: 12, padding: "0 12px" }}>Header · headerBg</Header>
              <Content style={{ margin: 12, padding: 12, fontSize: 12 }}>Content · bodyBg</Content>
            </Layout>
          </Layout>
          <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 12, marginBottom: 0 }}>
            底部触发器用 <code>triggerBg</code>；收起可对比 siderBg 与 headerBg。
          </Paragraph>
        </Card>
      </Col>

      <Col span={24}>
        <Card variant="borderless" title="组件 Token 覆盖" size="small">
          <div style={{ display: "grid", gap: 6 }}>
            {COMPONENT_COVERAGE.map((row) => (
              <div
                key={row.group}
                style={{
                  display: "flex",
                  gap: 12,
                  fontSize: 13,
                  borderBottom: "1px solid rgba(128,128,128,0.12)",
                  paddingBottom: 6,
                }}
              >
                <code style={{ minWidth: 130 }}>{row.group}</code>
                <span style={{ opacity: 0.65, minWidth: 300 }}>{row.tokens}</span>
                <span style={{ marginLeft: "auto", opacity: 0.8 }}>{row.where}</span>
              </div>
            ))}
          </div>
        </Card>
      </Col>
    </Row>
  );
}

// ---------------------------------------------------------------------------
// Token 映射 — the mapping table (+ derived / custom panels in the full scheme)
// ---------------------------------------------------------------------------

function isColorValue(value: string | number): value is string {
  return typeof value === "string" && (value.startsWith("#") || value.startsWith("rgb"));
}

function TokenSwatchRow({ row, live }: { row: TokenMapping; live: string | number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "5px 0",
        borderBottom: "1px solid var(--paseo-split, rgba(128,128,128,0.12))",
      }}
    >
      {isColorValue(row.value) ? (
        <span
          title={row.value}
          style={{
            width: 22,
            height: 22,
            borderRadius: 4,
            background: row.value,
            border: "1px solid rgba(128,128,128,0.35)",
            flex: "none",
          }}
        />
      ) : (
        <span style={{ width: 22, flex: "none", textAlign: "center", opacity: 0.5 }}>—</span>
      )}
      <code style={{ minWidth: 190 }}>{row.antdToken}</code>
      <span style={{ opacity: 0.65, minWidth: 150 }}>{row.paseoToken}</span>
      <code style={{ marginLeft: "auto", opacity: 0.8 }}>{String(live)}</code>
    </div>
  );
}

function TokenChip({ tokenKey, value }: { tokenKey: string; value: string }) {
  return (
    <span
      title={`${tokenKey} = ${value}`}
      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
    >
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: 3,
          background: value,
          border: "1px solid rgba(128,128,128,0.35)",
          flex: "none",
        }}
      />
      <code style={{ fontSize: 12 }}>{tokenKey.replace(/^paseo/, "")}</code>
    </span>
  );
}

function TokenGroup({ title, tokens }: { title: string; tokens: Record<string, string> }) {
  const entries = Object.entries(tokens);
  if (entries.length === 0) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <Text type="secondary" style={{ fontSize: 12 }}>
        {title}（{entries.length}）
      </Text>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 14px", marginTop: 4 }}>
        {entries.map(([key, value]) => (
          <TokenChip key={key} tokenKey={key} value={value} />
        ))}
      </div>
    </div>
  );
}

export function MappingSection({ view }: { view: View }) {
  const { token } = antdTheme.useToken();
  const t = token as unknown as Record<string, string>;
  const isStockLight = view === "light";
  const isFullDark = view === "full";
  const isClaude = view === "claude";
  const mapping = isFullDark
    ? full.PASEO_DARK_TOKEN_MAPPING
    : isClaude
      ? claude.CLAUDE_LIGHT_TOKEN_MAPPING
      : minimal.PASEO_DARK_TOKEN_MAPPING;
  const derivedTokens = isFullDark
    ? full.PASEO_DERIVED_TOKENS
    : isClaude
      ? claude.CLAUDE_LIGHT_DERIVED_TOKENS
      : [];
  const showDerived = isFullDark || isClaude;

  const customTokens = Object.fromEntries(
    Object.keys(t)
      .filter((key) => key.startsWith("paseo"))
      .sort()
      .map((key) => [key, t[key]]),
  );
  const pickGroup = (prefix: string) =>
    Object.fromEntries(Object.entries(customTokens).filter(([key]) => key.startsWith(prefix)));

  return (
    <>
      <Card
        variant="borderless"
        title="Token 映射（实时解析值）"
        size="small"
        extra={isStockLight ? null : <Text type="secondary">{mapping.length} 个 antd token</Text>}
      >
        {isStockLight ? (
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            这是 antd 默认浅色主题，未覆盖任何 antd 变量（唯一例外：字体栈与深色一致，避免切换时元素位移）。
            切到「Claude 浅色」查看完整浅色方案。
          </Paragraph>
        ) : (
          mapping.map((row) => <TokenSwatchRow key={row.antdToken} row={row} live={t[row.antdToken]} />)
        )}
      </Card>

      {showDerived && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} xl={12}>
            <Card
              variant="borderless"
              title="antd 自行派生的 token"
              size="small"
              extra={<Text type="secondary">无需手动设置</Text>}
            >
              <Paragraph type="secondary" style={{ fontSize: 12 }}>
                这些别名 token 由 antd 在最后一步从受控 token 计算得出——手动覆盖会被静默丢弃，
                完整方案里只登记派生来源。
              </Paragraph>
              {derivedTokens.map((row) => (
                <div
                  key={row.antdToken}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "4px 0",
                    borderBottom: "1px solid rgba(128,128,128,0.12)",
                    fontSize: 13,
                  }}
                >
                  <code style={{ minWidth: 190 }}>{row.antdToken}</code>
                  <span style={{ opacity: 0.65 }}>← {row.derivedFrom}</span>
                  <code style={{ marginLeft: "auto", opacity: 0.8 }}>{t[row.antdToken] ?? ""}</code>
                </div>
              ))}
            </Card>
          </Col>

          <Col xs={24} xl={12}>
            <Card
              variant="borderless"
              title="自定义 token"
              size="small"
              extra={<Text type="secondary">{Object.keys(customTokens).length} 个</Text>}
            >
              <Paragraph type="secondary" style={{ fontSize: 12 }}>
                antd 没有对应概念的部分，以自定义 token 注入，经 <code>useToken()</code>{" "}
                或 CSS 变量读取。左侧各演示页展示了它们对应的组件。
              </Paragraph>
              <TokenGroup title="Surface 阶梯" tokens={pickGroup("paseoSurface")} />
              <TokenGroup title="Diff" tokens={pickGroup("paseoDiff")} />
              <TokenGroup title="状态圆点与 merged" tokens={pickGroup("paseoStatus")} />
              <TokenGroup title="Selection" tokens={pickGroup("paseoSelection")} />
              <TokenGroup title="Host 身份色" tokens={pickGroup("paseoIdentity")} />
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
}
