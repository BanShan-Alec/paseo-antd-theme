import { App as AntApp, Button, Card, Col, Layout, Modal, Row, Tabs, Typography } from "antd";
import { useState } from "react";
import { SpaceWrap } from "../primitives";

const { Header, Sider, Content } = Layout;
const { Paragraph } = Typography;

const COMPONENT_COVERAGE: { group: string; tokens: string; where: string }[] = [
  { group: "Layout", tokens: "bodyBg / siderBg / headerBg / triggerBg", where: "本页 + 整页骨架" },
  { group: "Menu", tokens: "darkItem*（深色）/ item*（浅色）", where: "左侧边栏" },
  { group: "Table", tokens: "headerBg / rowHoverBg / borderColor / headerSort*Bg", where: "Agent 列表页" },
  { group: "Segmented", tokens: "trackBg / trackPadding / itemSelectedBg / itemColor", where: "概览页 + 右上角（+ Provider 4px 间隙）" },
  { group: "Select", tokens: "optionPadding / optionHeight / 透明边框", where: "概览页（+ listItemHeight=44）" },
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
  const [modalOpen, setModalOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} xl={12}>
        <Card variant="borderless" title="Tabs" size="small" className="h-full">
          <Tabs
            items={[
              { key: "1", label: "工作区", children: <p className="text-sm">3 个 agent 正在运行…</p> },
              { key: "2", label: "Git", children: <p className="text-sm">main ← feat/diff-view（+128 −12）</p> },
              { key: "3", label: "浏览器", children: <p className="text-sm">预览 localhost:3000</p> },
            ]}
          />
          <Paragraph type="secondary" className="text-xs" style={{ marginBottom: 0 }}>
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
        <Card
          variant="borderless"
          title="浮层：Modal / Message / Notification"
          size="small"
          className="h-full"
        >
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
          <Paragraph type="secondary" className="mt-3 text-xs" style={{ marginBottom: 0 }}>
            Modal 用 surface2 作内容底；Message/Notification 经 <code>App.useApp()</code>{" "}
            挂载以继承主题（静态方法不继承 ConfigProvider）。
          </Paragraph>
          <Modal
            open={modalOpen}
            onOk={() => setModalOpen(false)}
            onCancel={() => setModalOpen(false)}
            title="删除 worktree？"
            // 确认即删除：破坏性操作按危险态上色，不抢占页面的主操作位。
            // 用描边而不是实心——深色方案的 colorError 是文字档浅红，铺成
            // 实心按钮会变成一块粉底，描边只留红色语义。
            okText="删除"
            okButtonProps={{ danger: true, type: "default" }}
          >
            <p className="text-sm">此操作会移除 agent-work-3 的 worktree，未提交的更改将丢失。</p>
          </Modal>
        </Card>
      </Col>

      <Col span={24}>
        <Card variant="borderless" title="Layout" size="small">
          <Layout className="paseo-demo-layout h-56 overflow-hidden rounded-md">
            <Sider
              theme={isLight ? "light" : "dark"}
              width={150}
              collapsible
              collapsed={collapsed}
              onCollapse={setCollapsed}
              trigger={<span className="text-xs">{collapsed ? "展开" : "收起"}</span>}
            >
              <div className="p-3 text-xs">Sider · siderBg</div>
            </Sider>
            <Layout>
              <Header className="px-3 text-xs" style={{ height: 40, lineHeight: "40px" }}>
                Header · headerBg
              </Header>
              <Content className="m-3 p-3 text-xs">Content · bodyBg</Content>
            </Layout>
          </Layout>
          <Paragraph type="secondary" className="mt-3 text-xs" style={{ marginBottom: 0 }}>
            底部触发器用 <code>triggerBg</code>；收起可对比 siderBg 与 headerBg。
          </Paragraph>
        </Card>
      </Col>

      <Col span={24}>
        <Card variant="borderless" title="组件 Token 覆盖" size="small">
          <div className="grid gap-1">
            {COMPONENT_COVERAGE.map((row) => (
              <div key={row.group} className="flex gap-3 border-b border-split pb-1 text-xs">
                <code className="min-w-32">{row.group}</code>
                <span className="min-w-80 text-text-secondary">{row.tokens}</span>
                <span className="ml-auto text-text-tertiary">{row.where}</span>
              </div>
            ))}
          </div>
        </Card>
      </Col>
    </Row>
  );
}
