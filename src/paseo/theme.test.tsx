import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button, ConfigProvider, Table, theme as antdTheme } from "antd";
import {
  PASEO_DARK_TOKEN_MAPPING,
  antdDefaultLightTheme,
  paseoDarkTheme,
  paseoTheme,
  type PaseoColorScheme,
} from "./theme";
import { PASEO_FONT_STACK, paseoDark } from "./tokens";

// ---------------------------------------------------------------------------
// WCAG contrast — paseo's own palette discipline ("retune with the contrast
// band, not by eye"), applied to the source values.
// ---------------------------------------------------------------------------

function luminance(hex: string): number {
  const value = hex.replace("#", "");
  const channels = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function resolveTokens(scheme: PaseoColorScheme): Record<string, string | number> {
  let resolved: Record<string, string | number> = {};
  function Probe() {
    const { token } = antdTheme.useToken();
    resolved = token as unknown as Record<string, string | number>;
    return null;
  }
  render(
    <ConfigProvider theme={paseoTheme(scheme)}>
      <Probe />
    </ConfigProvider>,
  );
  return resolved;
}

const dark = resolveTokens("dark");
const light = resolveTokens("light");

// ---------------------------------------------------------------------------
// Dark mapping reaches antd's token pipeline
// ---------------------------------------------------------------------------

describe("paseo → antd dark token mapping", () => {
  it("pins every mapped token verbatim", () => {
    // antd v6 strips seed tokens from `theme.token` and re-derives color
    // families for dark mode; the wrapped algorithm is what makes the exact
    // paseo hexes survive. This asserts the pinning actually took.
    for (const row of PASEO_DARK_TOKEN_MAPPING) {
      expect(dark[row.antdToken], row.antdToken).toBe(row.value);
    }
  });

  it("keeps the exact paseo colors as the dark brand and status families", () => {
    // Without the algorithm wrapper the primary is antd's darkened #1e6642.
    expect(dark.colorPrimary).toBe(paseoDark.accent);
    expect(dark.colorSuccess).toBe(paseoDark.statusSuccess);
    expect(dark.colorWarning).toBe(paseoDark.statusWarning);
    expect(dark.colorError).toBe(paseoDark.statusDanger);
    expect(dark.colorInfo).toBe(paseoDark.statusDotRunning);
    expect(dark.colorLink).toBe(paseoDark.accentBright);
  });

  it("keeps the paseo background hierarchy", () => {
    expect(dark.colorBgLayout).toBe(paseoDark.surface0);
    expect(dark.colorBgContainer).toBe(paseoDark.surface1);
    expect(dark.colorBgElevated).toBe(paseoDark.surface2);
  });

  it("derives coherent hover/active states around each pinned base", () => {
    // antd's convention: hover is the lighter step, active the darker one,
    // around the pinned base.
    for (const family of ["colorPrimary", "colorSuccess", "colorWarning", "colorError"]) {
      const base = dark[family] as string;
      const hover = dark[`${family}Hover`] as string;
      const active = dark[`${family}Active`] as string;
      expect(new Set([base, hover, active]).size, family).toBe(3);
      expect(luminance(hover), `${family}Hover`).toBeGreaterThan(luminance(base));
      expect(luminance(active), `${family}Active`).toBeLessThan(luminance(base));
    }
  });

  it("pins the font stacks (seeds antd would otherwise default)", () => {
    for (const token of [dark, light]) {
      expect(token.fontFamily).toBe(PASEO_FONT_STACK);
      expect(token.fontFamily).toContain("system-ui");
      expect(token.fontFamilyCode).toContain("SFMono-Regular");
    }
  });

  it("leaves everything else to antd's derivation", () => {
    // The minimal scheme configures 13 tokens; the rest of the resolved
    // token set is antd's own dark derivation seeded with paseo's bases.
    expect(Object.keys(paseoTheme("dark").token ?? {})).toHaveLength(
      PASEO_DARK_TOKEN_MAPPING.length,
    );
    expect(paseoTheme("dark").components).toBeUndefined();
    // Neutral ramp still derives from the paseo seeds — e.g. borders pick up
    // the green-tinted base rather than antd's neutral gray.
    expect(String(dark.colorText)).toMatch(/^rgba?\(/);
    expect(String(dark.colorBorder)).toMatch(/^#/);
  });
});

// ---------------------------------------------------------------------------
// Light mode is antd's stock theme with the shared font stack
// ---------------------------------------------------------------------------

describe("light mode", () => {
  it("overrides nothing but the shared font stack", () => {
    expect(paseoTheme("light").token).toBeUndefined();
    expect(paseoTheme("light").components).toBeUndefined();
    expect(paseoTheme("light").algorithm).toBeDefined();
  });

  it("resolves to antd's own default values", () => {
    expect(light.colorPrimary).toBe("#1677ff");
    expect(light.colorBgContainer).toBe("#ffffff");
    expect(light.colorBgLayout).toBe("#f5f5f5");
    expect(light.colorBorder).toBe("#d9d9d9");
    expect(light.colorText).toBe("rgba(0,0,0,0.88)");
  });

  it("shares the dark theme's font stack so switching cannot shift layout", () => {
    expect(light.fontFamily).toBe(dark.fontFamily);
  });

  it("carries no custom tokens", () => {
    expect(Object.keys(light).filter((key) => key.startsWith("paseo"))).toEqual([]);
    expect(Object.keys(dark).filter((key) => key.startsWith("paseo"))).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Contrast discipline
// ---------------------------------------------------------------------------

describe("contrast", () => {
  it("body text clears 4.5:1 on the dark background stack", () => {
    expect(contrast(paseoDark.foreground, paseoDark.surface0)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(paseoDark.foreground, paseoDark.surface1)).toBeGreaterThanOrEqual(4.5);
  });

  it("primary button label clears 4.5:1 on the primary fill", () => {
    expect(contrast("#ffffff", paseoDark.accent)).toBeGreaterThanOrEqual(4.5);
  });

  it("links and status colors stay readable on the dark background", () => {
    expect(contrast(paseoDark.accentBright, paseoDark.surface0)).toBeGreaterThanOrEqual(4.5);
    for (const status of [
      paseoDark.statusSuccess,
      paseoDark.statusWarning,
      paseoDark.statusDanger,
    ]) {
      expect(contrast(status, paseoDark.surface0)).toBeGreaterThanOrEqual(3);
    }
  });
});

// ---------------------------------------------------------------------------
// Render smoke — neither theme may break antd's runtime
// ---------------------------------------------------------------------------

describe("rendering", () => {
  it("renders antd components under the paseo dark theme", () => {
    render(
      <ConfigProvider theme={paseoDarkTheme}>
        <Button type="primary">Run agent</Button>
      </ConfigProvider>,
    );
    expect(screen.getByRole("button", { name: "Run agent" })).toBeTruthy();
  });

  it("renders antd components under the stock light theme", () => {
    render(
      <ConfigProvider theme={antdDefaultLightTheme}>
        <Table
          columns={[{ title: "Agent", dataIndex: "name", key: "name" }]}
          dataSource={[{ key: "1", name: "claude-code" }]}
          pagination={false}
        />
      </ConfigProvider>,
    );
    expect(screen.getByText("claude-code")).toBeTruthy();
  });
});
