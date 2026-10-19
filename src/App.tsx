import { useState } from "react";
import { App as AntApp, ConfigProvider, Layout, Menu, Segmented, Typography } from "antd";
import {
  AgentsSection,
  ComponentsSection,
  DiffSection,
  HostsSection,
  MappingSection,
  OverviewSection,
  StatusSection,
  type View,
} from "./demo/sections";
import * as minimal from "./paseo/theme";
import * as full from "./paseo-full/theme";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const VIEW_OPTIONS = [
  { label: "antd 默认", value: "light" },
  { label: "Paseo 最小", value: "minimal" },
  { label: "Paseo 完整", value: "full" },
] as const;

type Section =
  | "overview"
  | "agents"
  | "diff"
  | "status"
  | "hosts"
  | "components"
  | "mapping";

const SECTIONS: { key: Section; label: string; hint: string }[] = [
  { key: "overview", label: "概览", hint: "antd 基础组件" },
  { key: "agents", label: "Agent 列表", hint: "表格 + diff 统计 + Host 徽章" },
  { key: "diff", label: "Diff 视图", hint: "diff 行底色 token" },
  { key: "status", label: "状态圆点", hint: "状态圆点 token" },
  { key: "hosts", label: "Host 身份色", hint: "十色身份盘 + selection" },
  { key: "components", label: "组件 Token", hint: "Layout/Menu/Table/Tabs/Modal/Message…" },
  { key: "mapping", label: "Token 映射", hint: "映射 / 派生 / 自定义 token" },
];

function themeFor(view: View) {
  if (view === "full") return full.paseoDarkTheme;
  if (view === "minimal") return minimal.paseoDarkTheme;
  return minimal.antdDefaultLightTheme;
}

const SECTION_TITLES: Record<Section, string> = {
  overview: "概览 · antd 基础组件",
  agents: "Agent 列表",
  diff: "Diff 视图",
  status: "状态圆点",
  hosts: "Host 身份色",
  components: "组件 Token",
  mapping: "Token 映射",
};

export default function App() {
  const [view, setView] = useState<View>("full");
  const [section, setSection] = useState<Section>("overview");

  // Remount on theme change: antd's cssinjs does not fully reclaim the
  // previous theme's style tags when components are reused, which leaves
  // some elements (buttons, tags) painted with the old theme's colors.
  // Keying the provider forces every component to re-register its styles.
  return (
    <ConfigProvider key={view} theme={themeFor(view)}>
      <AntApp>
        <Layout style={{ minHeight: "100vh" }}>
          <Sider width={232}>
            <div style={{ padding: "16px 20px", color: "#fff" }}>
              <Title level={5} style={{ color: "inherit", margin: 0 }}>
                Paseo × antd v6
              </Title>
              <Text style={{ color: "inherit", opacity: 0.6, fontSize: 12 }}>
                agent orchestration
              </Text>
            </div>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[section]}
              onClick={({ key }) => setSection(key as Section)}
              items={SECTIONS.map((s) => ({ key: s.key, label: s.label }))}
            />
            <div
              style={{
                padding: "12px 20px",
                color: "rgba(255,255,255,0.45)",
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
              <Text strong>{SECTION_TITLES[section]}</Text>
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
              {section === "components" && <ComponentsSection />}
              {section === "mapping" && <MappingSection view={view} />}
            </Content>
          </Layout>
        </Layout>
      </AntApp>
    </ConfigProvider>
  );
}
