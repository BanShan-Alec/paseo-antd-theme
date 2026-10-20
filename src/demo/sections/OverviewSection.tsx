import { Alert, Button, Card, Col, Input, Progress, Row, Segmented, Select, Slider, Switch, Tag } from "antd";
import { SpaceWrap } from "../primitives";

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
              listItemHeight={44}
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
