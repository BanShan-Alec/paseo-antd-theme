import { useState } from "react";
import {
  App as AntApp,
  Layout,
  Menu,
  Segmented,
  Typography,
  theme as antdTheme,
} from "antd";
import {
  AgentsSection,
  ComponentsSection,
  DiffSection,
  HostsSection,
  MappingSection,
  OverviewSection,
  StatusSection,
} from "./demo/sections";
import type { View } from "./demo/view";
import * as full from "./themes/paseo-dark/theme";
import * as claude from "./themes/claude/theme";
import { PaseoThemeProvider } from "./Provider";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const VIEW_OPTIONS = [
  { label: "antd 默认", value: "light" },
  { label: "Claude 浅色", value: "claude" },
  { label: "Paseo 深色", value: "dark" },
] as const;

const SECTIONS = [
  { key: "overview", label: "概览", title: "概览 · antd 基础组件", hint: "antd 基础组件" },
  { key: "agents", label: "Agent 列表", title: "Agent 列表", hint: "表格 + diff 统计 + Host 徽章" },
  { key: "diff", label: "Diff 视图", title: "Diff 视图", hint: "diff 行底色 token" },
  { key: "status", label: "状态圆点", title: "状态圆点", hint: "状态圆点 token" },
  { key: "hosts", label: "Host 身份色", title: "Host 身份色", hint: "十色身份盘 + selection" },
  {
    key: "components",
    label: "组件 Token",
    title: "组件 Token",
    hint: "Layout/Menu/Table/Tabs/Modal/Message…",
  },
  { key: "mapping", label: "Token 映射", title: "Token 映射", hint: "映射 / 派生 / 自定义 token" },
] as const;

type Section = (typeof SECTIONS)[number]["key"];

function themeFor(view: View) {
  if (view === "claude") return claude.claudeLightTheme;
  if (view === "dark") return full.paseoDarkTheme;
  return full.antdDefaultLightTheme;
}

function Dashboard({
  view,
  section,
  setView,
  setSection,
}: {
  view: View;
  section: Section;
  setView: (view: View) => void;
  setSection: (section: Section) => void;
}) {
  const { token } = antdTheme.useToken();
  // The two light views need a light Sider and light Menu; the paseo dark view
  // keeps the dark chrome both themes were designed around.
  const isLight = view === "light" || view === "claude";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={248} theme={isLight ? "light" : "dark"}>
        <div style={{ padding: "16px 20px", color: token.colorText }}>
          <Title level={5} style={{ color: "inherit", margin: 0 }}>
            Paseo × antd v6
          </Title>
          <Text style={{ color: token.colorTextSecondary, fontSize: 12 }}>
            agent orchestration
          </Text>
        </div>
        <Menu
          theme={isLight ? "light" : "dark"}
          mode="inline"
          selectedKeys={[section]}
          onClick={({ key }) => setSection(key as Section)}
          items={SECTIONS.map((s) => ({ key: s.key, label: s.label }))}
        />
        <div
          style={{
            padding: "12px 20px",
            color: token.colorTextTertiary,
            fontSize: 11,
            lineHeight: 1.6,
          }}
        >
          {SECTIONS.find((s) => s.key === section)?.hint}
        </div>
      </Sider>
      <Layout>
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
          }}
        >
          <Text strong>{SECTIONS.find((s) => s.key === section)?.title}</Text>
          <Segmented
            value={view}
            onChange={(value) => setView(value as View)}
            options={VIEW_OPTIONS.map((o) => ({ ...o }))}
          />
        </Header>
        <Content style={{ padding: 24 }}>
          {section === "overview" && <OverviewSection />}
          {section === "agents" && <AgentsSection />}
          {section === "diff" && <DiffSection />}
          {section === "status" && <StatusSection />}
          {section === "hosts" && <HostsSection />}
          {section === "components" && <ComponentsSection isLight={isLight} />}
          {section === "mapping" && <MappingSection view={view} />}
        </Content>
      </Layout>
    </Layout>
  );
}

export default function App() {
  const [view, setView] = useState<View>("claude");
  const [section, setSection] = useState<Section>("overview");

  // Remount on theme change: antd's cssinjs does not fully reclaim the
  // previous theme's style tags when components are reused, which leaves
  // some elements (buttons, tags) painted with the old theme's colors.
  // Keying the provider forces every component to re-register its styles.
  return (
    <PaseoThemeProvider key={view} theme={themeFor(view)}>
      <AntApp>
        <Dashboard view={view} section={section} setView={setView} setSection={setSection} />
      </AntApp>
    </PaseoThemeProvider>
  );
}
