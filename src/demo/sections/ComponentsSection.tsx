import { App as AntApp, Button, Card, Col, Layout, Modal, Row, Tabs, theme as antdTheme, Typography } from "antd";
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
          <style>{`
            /* antd anchors the Sider trigger with position: fixed — it is
               built for a full-page sider, so inside this 220px demo card it
               would ride the page scrollbar. The Sider is already
               position: relative, so absolute keeps it in the card. */
            .paseo-demo-layout .ant-layout-sider-trigger {
              position: absolute;
            }
          `}</style>
          <Layout className="paseo-demo-layout" style={{ height: 220, borderRadius: 8, overflow: "hidden" }}>
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
              <Header style={{ height: 40, lineHeight: "40px", fontSize: 12, padding: "0 12px" }}>Header · headerBg</Header>
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
                <span style={{ color: token.colorTextSecondary, minWidth: 300 }}>{row.tokens}</span>
                <span style={{ marginLeft: "auto", color: token.colorTextTertiary }}>{row.where}</span>
              </div>
            ))}
          </div>
        </Card>
      </Col>
    </Row>
  );
}
