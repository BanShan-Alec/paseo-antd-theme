import { useState } from "react";
import { App as AntApp, Breadcrumb, Layout, Menu, Segmented, Typography, theme as antdTheme } from "antd";
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
import { antdDarkTheme, antdLightTheme } from "./themes/antd/theme";
import { paseoDarkTheme } from "./themes/paseo-dark/theme";
import { PaseoThemeProvider, type PaseoBehaviors, type PaseoThemeMode, type PaseoThemeSlots } from "./Provider";
import { hexLuminance } from "./shared/colors";
import { MoonIcon, SunIcon, SystemIcon } from "./demo/icons";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const VIEW_OPTIONS = [
  { label: "Antd 原生", value: "antd" },
  { label: "Claude + Paseo", value: "paseo" },
  { label: "混搭", value: "mixed" },
] as const;

const MODE_OPTIONS = [
  { value: "system", icon: <SystemIcon />, title: "跟随系统" },
  { value: "light", icon: <SunIcon />, title: "亮色" },
  { value: "dark", icon: <MoonIcon />, title: "暗色" },
] as const;

const SECTIONS = [
  { key: "overview", label: "概览" },
  { key: "agents", label: "Agent 列表" },
  { key: "diff", label: "Diff 视图" },
  { key: "status", label: "状态圆点" },
  { key: "hosts", label: "Host 身份色" },
  { key: "components", label: "组件 Token" },
  { key: "mapping", label: "Token 映射" },
] as const;

type Section = (typeof SECTIONS)[number]["key"];

const VIEW_STORAGE_KEY = "paseo-demo-pair";
const MODE_STORAGE_KEY = "paseo-demo-mode";

// Each view is a light/dark *pair*; the scheme inside the pair follows the OS.
// Only the explicit pair choice is persisted.
const VIEW_PRESETS: Record<View, { themes?: PaseoThemeSlots; behaviors?: PaseoBehaviors }> = {
  antd: {
    themes: { light: antdLightTheme, dark: antdDarkTheme },
    // Stock antd has neither the Paseo spinner nor the extra gaps: turn every
    // behavior off so this view stays an honest baseline.
    behaviors: { loadingIcon: false, segmentedGap: false, selectGap: false },
  },
  paseo: {},
  mixed: { themes: { light: antdLightTheme, dark: paseoDarkTheme } },
};

function resolveInitialView(): View {
  try {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY);
    if (stored === "antd" || stored === "paseo" || stored === "mixed") {
      return stored;
    }
  } catch {
    // localStorage unavailable (privacy mode) — fall through to the default
  }
  return "paseo";
}

function resolveInitialMode(): PaseoThemeMode {
  try {
    const stored = localStorage.getItem(MODE_STORAGE_KEY);
    if (stored === "system" || stored === "light" || stored === "dark") {
      return stored;
    }
  } catch {
    // localStorage unavailable (privacy mode) — fall through to the default
  }
  return "system";
}

/** Non-hex backgrounds (none in these themes) fall back to the light chrome. */
function isLightSurface(color: string): boolean {
  try {
    return hexLuminance(color) > 0.5;
  } catch {
    return true;
  }
}

function Dashboard({
  view,
  mode,
  section,
  changeView,
  changeMode,
  setSection,
}: {
  view: View;
  mode: PaseoThemeMode;
  section: Section;
  changeView: (view: View) => void;
  changeMode: (mode: PaseoThemeMode) => void;
  setSection: (section: Section) => void;
}) {
  const { token } = antdTheme.useToken();
  // The pair is fixed per view but the resolved scheme follows the OS, so the
  // chrome (Sider/Menu variant) has to follow the resolved background rather
  // than the view name.
  const isLight = isLightSurface(String(token.colorBgLayout));

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={248}
        theme={isLight ? "light" : "dark"}
        // Sticky + viewport height: the sidebar and its footer stay put while
        // the content column scrolls, instead of growing with the page.
        style={{ position: "sticky", top: 0, height: "100vh" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <div style={{ flexShrink: 0, padding: "16px 20px", color: token.colorText }}>
            <Title level={5} style={{ color: "inherit", margin: 0 }}>
              Paseo × antd v6
            </Title>
            <Text style={{ color: token.colorTextSecondary, fontSize: 12 }}>
              agent orchestration
            </Text>
          </div>
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            <Menu
              theme={isLight ? "light" : "dark"}
              mode="inline"
              selectedKeys={[section]}
              onClick={({ key }) => setSection(key as Section)}
              items={SECTIONS.map((s) => ({ key: s.key, label: s.label }))}
            />
          </div>
          <div style={{ flexShrink: 0, padding: "12px 20px 20px" }}>
            <Segmented
              shape="round"
              size="small"
              value={mode}
              onChange={(value) => changeMode(value as PaseoThemeMode)}
              options={MODE_OPTIONS.map((o) => ({ ...o }))}
            />
          </div>
        </div>
      </Sider>
      <Layout>
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            // antd's stock light header is dark navy #001529 while headerColor
            // stays the normal dark text — unreadable. The Paseo/Claude themes
            // override headerBg; the stock-light views pin it to colorBgLayout
            // here so the header stays readable without touching the theme.
            background: view !== "paseo" && isLight ? token.colorBgLayout : undefined,
          }}
        >
          <Breadcrumb
            items={[
              { title: "工作台" },
              {
                title: (
                  <Text strong>
                    {SECTIONS.find((s) => s.key === section)?.label}
                  </Text>
                ),
              },
            ]}
          />
          <Segmented
            value={view}
            onChange={(value) => changeView(value as View)}
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
          {section === "mapping" && <MappingSection view={view} isLight={isLight} />}
        </Content>
      </Layout>
    </Layout>
  );
}

export default function App() {
  const [view, setView] = useState<View>(resolveInitialView);
  const [mode, setMode] = useState<PaseoThemeMode>(resolveInitialMode);
  const [section, setSection] = useState<Section>("overview");

  const changeView = (next: View) => {
    setView(next);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      // ignore persistence failures (privacy mode)
    }
  };

  const changeMode = (next: PaseoThemeMode) => {
    setMode(next);
    try {
      localStorage.setItem(MODE_STORAGE_KEY, next);
    } catch {
      // ignore persistence failures (privacy mode)
    }
  };

  // Remount when the pair or the resolved slot changes: antd's cssinjs does
  // not fully reclaim the previous theme's style tags when components are
  // reused, which leaves some elements (buttons, tags) painted with the old
  // theme's colors. Keying the provider forces every component to re-register
  // its styles.
  return (
    <PaseoThemeProvider key={`${view}:${mode}`} mode={mode} {...VIEW_PRESETS[view]}>
      <AntApp>
        <Dashboard
          view={view}
          mode={mode}
          section={section}
          changeView={changeView}
          changeMode={changeMode}
          setSection={setSection}
        />
      </AntApp>
    </PaseoThemeProvider>
  );
}
