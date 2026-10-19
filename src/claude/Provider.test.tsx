import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button, Segmented, Select, Spin, theme as antdTheme } from "antd";
import { PaseoThemeProvider } from "./Provider";

describe("PaseoThemeProvider", () => {
  it("injects the component-level CSS", () => {
    const { container } = render(
      <PaseoThemeProvider>
        <span />
      </PaseoThemeProvider>,
    );

    expect(container.querySelector("style[data-paseo-theme]")).toBeTruthy();
  });

  it("replaces the default Button and Spin loading icons", () => {
    const { container } = render(
      <PaseoThemeProvider>
        <Button loading>Run agent</Button>
        <Spin />
      </PaseoThemeProvider>,
    );

    expect(container.querySelectorAll("svg[data-claude-loading]").length).toBeGreaterThan(0);
    expect(container.querySelector("svg[data-claude-loading] > g.claude-loading-spin")).toBeTruthy();
    expect(container.querySelector(".anticon-loading")).toBeNull();
  });

  it("adds the Segmented item gap class", () => {
    const { container } = render(
      <PaseoThemeProvider>
        <Segmented options={["全部", "运行中"]} />
      </PaseoThemeProvider>,
    );

    expect(container.querySelectorAll(".claude-segmented-item").length).toBe(2);
  });

  it("adds the Select option gap class", () => {
    render(
      <PaseoThemeProvider>
        <Select
          open
          options={[
            { value: "claude", label: "Claude Code" },
            { value: "codex", label: "Codex" },
          ]}
        />
      </PaseoThemeProvider>,
    );

    expect(document.querySelectorAll(".claude-select-item").length).toBeGreaterThan(0);
  });

  it("uses the paseo dark theme in dark mode", () => {
    let layout = "";
    function Probe() {
      const { token } = antdTheme.useToken();
      layout = token.colorBgLayout as string;
      return null;
    }

    render(
      <PaseoThemeProvider mode="dark">
        <Probe />
      </PaseoThemeProvider>,
    );

    expect(layout).toBe("#181B1A");
  });

  it("uses the claude light theme in light mode", () => {
    let layout = "";
    function Probe() {
      const { token } = antdTheme.useToken();
      layout = token.colorBgLayout as string;
      return null;
    }

    render(
      <PaseoThemeProvider mode="light">
        <Probe />
      </PaseoThemeProvider>,
    );

    expect(layout).toBe("#F4F2EC");
  });
});
