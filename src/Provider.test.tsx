import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  Button,
  Segmented,
  Select,
  Spin,
  theme as antdTheme,
} from "antd";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { claudeLightTheme } from "./themes/claude/theme";
import { paseoDarkTheme } from "./themes/paseo-dark/theme";
import {
  PaseoThemeProvider,
  resolvePaseoTheme,
} from "./Provider";

function LayoutProbe({ onLayout }: { onLayout: (layout: string) => void }) {
  const { token } = antdTheme.useToken();
  onLayout(String(token.colorBgLayout));
  return null;
}

function LayoutAttributeProbe() {
  const { token } = antdTheme.useToken();
  return <div data-layout={String(token.colorBgLayout)} />;
}

function installMatchMedia(initialDark: boolean) {
  const listeners = new Set<() => void>();
  let dark = initialDark;
  const original = window.matchMedia;

  const media = {
    get matches() {
      return dark;
    },
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addEventListener: (_event: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_event: string, listener: () => void) => listeners.delete(listener),
    addListener: (listener: () => void) => listeners.add(listener),
    removeListener: (listener: () => void) => listeners.delete(listener),
    dispatchEvent: () => false,
  } as unknown as MediaQueryList;

  window.matchMedia = (() => media) as typeof window.matchMedia;

  return {
    setDark(next: boolean) {
      dark = next;
      for (const listener of listeners) listener();
    },
    restore() {
      window.matchMedia = original;
    },
  };
}

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

    const icons = container.querySelectorAll("svg[data-paseo-loading]");
    expect(icons.length).toBeGreaterThan(0);
    expect(icons[0]?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector("svg[data-paseo-loading] > g.paseo-loading-spin")).toBeTruthy();
    expect(container.querySelector(".anticon-loading")).toBeNull();
    expect(screen.getByRole("button", { name: "Run agent" })).toBeTruthy();
  });

  it("adds the Segmented item gap class", () => {
    const { container } = render(
      <PaseoThemeProvider>
        <Segmented options={["全部", "运行中"]} />
      </PaseoThemeProvider>,
    );

    expect(container.querySelectorAll(".paseo-segmented-item").length).toBe(2);
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

    expect(document.querySelectorAll(".paseo-select-item").length).toBeGreaterThan(0);
  });

  it("uses the paseo dark theme in dark mode", () => {
    let layout = "";
    render(
      <PaseoThemeProvider mode="dark">
        <LayoutProbe onLayout={(value) => (layout = value)} />
      </PaseoThemeProvider>,
    );

    expect(layout).toBe("#181B1A");
  });

  it("uses the claude light theme in light mode", () => {
    let layout = "";
    render(
      <PaseoThemeProvider mode="light">
        <LayoutProbe onLayout={(value) => (layout = value)} />
      </PaseoThemeProvider>,
    );

    expect(layout).toBe("#F0EDE2");
  });

  it("resolves mode, system preference and theme override", () => {
    expect(resolvePaseoTheme({ mode: "dark" })).toBe(paseoDarkTheme);
    expect(resolvePaseoTheme({ mode: "light" })).toBe(claudeLightTheme);
    expect(resolvePaseoTheme({ mode: "system", systemDark: true })).toBe(paseoDarkTheme);
    expect(resolvePaseoTheme({ mode: "system", systemDark: false })).toBe(claudeLightTheme);

    const override = { token: { colorBgLayout: "#123456" } };
    expect(resolvePaseoTheme({ mode: "dark", theme: override })).toBe(override);
  });

  it("subscribes to prefers-color-scheme in system mode", () => {
    const media = installMatchMedia(false);

    try {
      let layout = "";
      render(
        <PaseoThemeProvider mode="system">
          <LayoutProbe onLayout={(value) => (layout = value)} />
        </PaseoThemeProvider>,
      );
      expect(layout).toBe("#F0EDE2");

      act(() => media.setDark(true));
      expect(layout).toBe("#181B1A");

      act(() => media.setDark(false));
      expect(layout).toBe("#F0EDE2");
    } finally {
      media.restore();
    }
  });

  it("lets the theme prop win over mode", () => {
    let layout = "";
    render(
      <PaseoThemeProvider mode="dark" theme={{ token: { colorBgLayout: "#123456" } }}>
        <LayoutProbe onLayout={(value) => (layout = value)} />
      </PaseoThemeProvider>,
    );

    expect(layout).toBe("#123456");
  });

  it("lets loadingIcon replace the default spinner", () => {
    const { container } = render(
      <PaseoThemeProvider loadingIcon={<span data-custom-loading="" />}>
        <Button loading>Run agent</Button>
      </PaseoThemeProvider>,
    );

    expect(container.querySelector("[data-custom-loading]")).toBeTruthy();
    expect(container.querySelector("svg[data-paseo-loading]")).toBeNull();
  });

  it("passes other ConfigProvider props through", () => {
    const { container } = render(
      <PaseoThemeProvider componentSize="small">
        <Button>Run agent</Button>
      </PaseoThemeProvider>,
    );

    expect(container.querySelector("button")?.className).toContain("ant-btn-sm");
  });

  it("uses the custom loading icon in Select", () => {
    const { container } = render(
      <PaseoThemeProvider>
        <Select loading options={[{ value: "claude", label: "Claude Code" }]} />
      </PaseoThemeProvider>,
    );

    expect(container.querySelector(".ant-select svg[data-paseo-loading]")).toBeTruthy();
  });

  it("resolves the server snapshot from ssrMode", () => {
    const darkHtml = renderToString(
      <PaseoThemeProvider mode="system" ssrMode="dark">
        <LayoutAttributeProbe />
      </PaseoThemeProvider>,
    );
    const lightHtml = renderToString(
      <PaseoThemeProvider mode="system" ssrMode="light">
        <LayoutAttributeProbe />
      </PaseoThemeProvider>,
    );

    expect(darkHtml).toContain("#181B1A");
    expect(lightHtml).toContain("#F0EDE2");
  });

  it("hydrates without a mismatch", async () => {
    const html = renderToString(
      <PaseoThemeProvider mode="system" ssrMode="light">
        <span>hydrate me</span>
      </PaseoThemeProvider>,
    );
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      await act(async () => {
        hydrateRoot(
          container,
          <PaseoThemeProvider mode="system" ssrMode="light">
            <span>hydrate me</span>
          </PaseoThemeProvider>,
        );
      });

      const hydrationErrors = errorSpy.mock.calls.filter(([message]) => {
        const text = String(message);
        return text.includes("Hydration") || text.includes("did not match");
      });
      expect(hydrationErrors).toEqual([]);
    } finally {
      errorSpy.mockRestore();
      container.remove();
    }
  });

  it("applies the injected CSS to real elements", () => {
    render(
      <PaseoThemeProvider>
        <Button loading>Loading</Button>
        <Segmented options={["A", "B"]} />
        <Select open options={[{ value: "a", label: "A" }]} />
      </PaseoThemeProvider>,
    );

    const css = document.querySelector("style[data-paseo-theme]")?.textContent ?? "";
    expect(css).toContain("animation: paseo-loading-rotate 1s linear infinite");
    expect(css).toContain("margin-inline-end: 4px");
    expect(css).toContain("border-top: 2px solid transparent");
    expect(css).toContain("border-bottom: 2px solid transparent");
    expect(css).toContain("background-clip: padding-box");

    // jsdom cannot resolve @keyframes or CSS variables; the animation and the
    // 44px var-driven row height are covered by the browser check. The
    // cascade-critical properties below are statically computed.
    const segmentedItem = document.querySelector(".paseo-segmented-item");
    const selectItem = document.querySelector(".paseo-select-item");
    expect(segmentedItem ? getComputedStyle(segmentedItem).marginInlineEnd : null).toBe("4px");
    expect(selectItem ? getComputedStyle(selectItem).borderTopWidth : null).toBe("2px");
    expect(selectItem ? getComputedStyle(selectItem).borderBottomWidth : null).toBe("2px");
    expect(selectItem ? getComputedStyle(selectItem).backgroundClip : null).toBe("padding-box");
  });

  it("renders a long Select list with listItemHeight", () => {
    const options = Array.from({ length: 200 }, (_, index) => ({
      value: String(index),
      label: `Option ${index}`,
    }));

    render(
      <PaseoThemeProvider>
        <Select open virtual={false} listItemHeight={44} options={options} />
      </PaseoThemeProvider>,
    );

    const dropdowns = document.querySelectorAll(".ant-select-dropdown");
    const dropdown = dropdowns[dropdowns.length - 1];
    const items = dropdown.querySelectorAll(".paseo-select-item");
    expect(items.length).toBe(200);
    // jsdom leaves var()-based min-height/padding unresolved; assert the
    // statically computed gap borders. The 44px total is covered in browser.
    const first = items[0] as HTMLElement;
    expect(getComputedStyle(first).borderTopWidth).toBe("2px");
    expect(getComputedStyle(first).borderBottomWidth).toBe("2px");
    expect(getComputedStyle(first).backgroundClip).toBe("padding-box");
  });
});
