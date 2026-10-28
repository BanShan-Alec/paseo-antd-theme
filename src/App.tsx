import { useState } from "react";
import {
  App as AntApp,
  Breadcrumb,
  Button,
  Drawer,
  Layout,
  Menu,
  Segmented,
  Typography,
  theme as antdTheme,
} from "antd";
import {
  AgentsSection,
  ComponentsSection,
  DesignSection,
  DiffSection,
  HostsSection,
  MappingSection,
  OverviewSection,
  StatusSection,
  TypographySection,
} from "./demo/sections";
import type { View } from "./demo/view";
import { antdDarkTheme, antdLightTheme } from "./themes/antd/theme";
import { paseoDarkTheme } from "./themes/paseo-dark/theme";
import { PaseoThemeProvider, type PaseoBehaviors, type PaseoThemeMode, type PaseoThemeSlots } from "./Provider";
import { hexLuminance } from "./shared/colors";
import { MenuIcon, MoonIcon, SunIcon, SystemIcon } from "./demo/icons";

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
  { key: "typography", label: "文字阶梯" },
  { key: "components", label: "组件 Token" },
  { key: "mapping", label: "Token 映射" },
  { key: "design", label: "DESIGN.md" },
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

/**
 * Demo chrome only — the package itself injects nothing here. The media query
 * is the whole responsive strategy: the 248px sider is great on a laptop and
 * unusable on a phone, so below 992px it leaves the flow and the same nav
 * renders inside a drawer, while the header stacks the view switcher.
 */
const CHROME_CSS = `
  .paseo-demo-header.ant-layout-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 0 24px;
  }
  .paseo-demo-header-bar {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
  }
  .paseo-demo-nav-toggle { display: none; }
  .paseo-demo-content.ant-layout-content { padding: 24px; }

  @media (max-width: 991.98px) {
    .paseo-demo-sider { display: none !important; }
    .paseo-demo-header.ant-layout-header {
      flex-direction: column;
      align-items: stretch;
      height: auto;
      line-height: normal;
      gap: 8px;
      padding: 8px 12px;
    }
    .paseo-demo-header-switch { align-self: flex-start; }
    .paseo-demo-nav-toggle { display: inline-flex; }
    .paseo-demo-content.ant-layout-content { padding: 16px; }
  }
`;

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

/** The nav column, shared by the desktop sider and the mobile drawer. */
function SidebarBody({
  isLight,
  mode,
  section,
  changeMode,
  setSection,
  onNavigate,
}: {
  isLight: boolean;
  mode: PaseoThemeMode;
  section: Section;
  changeMode: (mode: PaseoThemeMode) => void;
  setSection: (section: Section) => void;
  onNavigate?: () => void;
}) {
  const { token } = antdTheme.useToken();
  return (
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
          onClick={({ key }) => {
            setSection(key as Section);
            onNavigate?.();
          }}
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
  );
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
  const [navOpen, setNavOpen] = useState(false);
  // The pair is fixed per view but the resolved scheme follows the OS, so the
  // chrome (Sider/Menu variant) has to follow the resolved background rather
  // than the view name.
  const isLight = isLightSurface(String(token.colorBgLayout));
  const tokens = token as unknown as Record<string, string>;
  const sidebarBg = tokens.paseoSurfaceSidebar ?? String(token.colorBgContainer);

  const sidebar = (onNavigate?: () => void) => (
    <SidebarBody
      isLight={isLight}
      mode={mode}
      section={section}
      changeMode={changeMode}
      setSection={setSection}
      onNavigate={onNavigate}
    />
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <style data-demo-chrome="">{CHROME_CSS}</style>
      <Sider
        className="paseo-demo-sider"
        width={248}
        theme={isLight ? "light" : "dark"}
        // Sticky + viewport height: the sidebar and its footer stay put while
        // the content column scrolls, instead of growing with the page.
        style={{ position: "sticky", top: 0, height: "100vh" }}
      >
        {sidebar()}
      </Sider>
      <Layout>
        <Header className="paseo-demo-header">
          <div className="paseo-demo-header-bar">
            {/* Below 992px the sider is display:none, so this is the only way
                into the nav. */}
            <Button
              className="paseo-demo-nav-toggle"
              type="text"
              aria-label="打开导航"
              icon={<MenuIcon />}
              onClick={() => setNavOpen(true)}
            />
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
          </div>
          <Segmented
            className="paseo-demo-header-switch"
            value={view}
            onChange={(value) => changeView(value as View)}
            options={VIEW_OPTIONS.map((o) => ({ ...o }))}
          />
        </Header>
        <Content className="paseo-demo-content">
          {section === "overview" && <OverviewSection />}
          {section === "agents" && <AgentsSection />}
          {section === "diff" && <DiffSection />}
          {section === "status" && <StatusSection />}
          {section === "hosts" && <HostsSection />}
          {section === "typography" && <TypographySection />}
          {section === "components" && <ComponentsSection isLight={isLight} />}
          {section === "mapping" && <MappingSection view={view} isLight={isLight} />}
          {section === "design" && <DesignSection />}
        </Content>
      </Layout>
      <Drawer
        placement="left"
        width={288}
        open={navOpen}
        onClose={() => setNavOpen(false)}
        title={null}
        styles={{
          header: { background: sidebarBg, borderBottom: "none" },
          body: { padding: 0, height: "100%", background: sidebarBg },
          content: { background: sidebarBg },
        }}
      >
        {sidebar(() => setNavOpen(false))}
      </Drawer>
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
