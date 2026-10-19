import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button, ConfigProvider, Table, theme as antdTheme } from "antd";
import {
  PASEO_DARK_TOKEN_MAPPING,
  PASEO_DERIVED_TOKENS,
  antdDefaultLightTheme,
  paseoDarkTheme,
  paseoTheme,
  type PaseoColorScheme,
} from "./theme";
import { PASEO_FONT_STACK, paseoDark, paseoIdentityDark } from "./tokens";

// ---------------------------------------------------------------------------
// WCAG contrast — paseo's own palette discipline ("retune with the contrast
// band, not by eye"), applied to the integrated dark tokens.
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

  it("keeps the exact paseo accent as the dark primary", () => {
    // Without the algorithm wrapper this is antd's darkened #1e6642.
    expect(dark.colorPrimary).toBe(paseoDark.accent);
    expect(dark.colorSuccess).toBe(paseoDark.statusSuccess);
    expect(dark.colorWarning).toBe(paseoDark.statusWarning);
    expect(dark.colorError).toBe(paseoDark.statusDanger);
    expect(dark.colorInfo).toBe(paseoDark.statusDotRunning);
    expect(dark.colorLink).toBe(paseoDark.accentBright);
  });

  it("keeps the paseo surface ladder distinct through the dark algorithm", () => {
    // The fill ramp deliberately reuses container/border levels — antd's
    // alias derivations expect that — but the five paseo surfaces must all
    // be present and nothing else may leak in.
    const ladder = [
      dark.colorBgLayout,
      dark.colorBgContainer,
      dark.colorBgElevated,
      dark.colorFill,
      dark.colorFillSecondary,
      dark.colorFillTertiary,
      dark.colorFillQuaternary,
    ] as string[];
    expect(new Set(ladder)).toEqual(
      new Set([
        paseoDark.surface0,
        paseoDark.surface1,
        paseoDark.surface2,
        paseoDark.surface3,
        paseoDark.border,
      ]),
    );
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
    expect(dark.fontFamily).toContain("system-ui");
    expect(dark.fontFamilyCode).toContain("SFMono-Regular");
  });

  it("uses the synced 40px control / 12px radius / 14px body scale", () => {
    // The full dark scheme follows the light scheme's form language: 40px
    // controls, 12px radius, 14px body. The minimal scheme stays compact.
    expect(dark.fontSize).toBe(14);
    expect(dark.fontSizeSM).toBe(12);
    expect(dark.fontSizeLG).toBe(16);
    expect(dark.controlHeight).toBe(40);
    expect(dark.controlHeightSM).toBe(32);
    expect(dark.controlHeightLG).toBe(48);
    expect(dark.borderRadius).toBe(12);
    expect(dark.borderRadiusSM).toBe(8);
    expect(dark.borderRadiusLG).toBe(12);
    expect(dark.borderRadiusXS).toBe(4);
    expect(paseoDarkTheme.components?.Alert?.borderRadius).toBe("12px");
    expect(paseoDarkTheme.components?.Segmented?.trackPadding).toBe(4);
  });

  it("uses soft elevation instead of flat chrome", () => {
    expect(String(dark.boxShadow)).toContain("rgba(0, 0, 0");
    expect(paseoDarkTheme.components?.Button?.primaryShadow).not.toBe("none");
  });
});

// ---------------------------------------------------------------------------
// Light mode is antd's stock theme — nothing overridden
// ---------------------------------------------------------------------------

describe("light mode", () => {
  it("overrides nothing but the shared font stack", () => {
    // Colors, sizes, radii and components stay stock; only fontFamily is
    // pinned, and through the algorithm — a seed in `token` would be
    // stripped by formatToken.
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
    // system-ui and antd's default stack resolve to different fonts on
    // Windows (~7% width), which used to move every content-sized element.
    expect(light.fontFamily).toBe(PASEO_FONT_STACK);
    expect(light.fontFamily).toBe(dark.fontFamily);
    expect(light.fontFamily).toContain("system-ui");
  });

  it("carries no custom tokens", () => {
    expect(light.paseoDiffAddition).toBeUndefined();
    expect(light.paseoSurfaceSidebar).toBeUndefined();
    expect(light.paseoIdentityViolet).toBeUndefined();
    expect(Object.keys(light).filter((key) => key.startsWith("paseo"))).toEqual([]);
  });

  it("keeps antd's default hover/active derivation", () => {
    expect(light.colorPrimaryHover).not.toBe(light.colorPrimary);
    expect(light.colorPrimaryActive).not.toBe(light.colorPrimary);
  });
});

// ---------------------------------------------------------------------------
// Derived tokens — antd recomputes these last from tokens we control
// ---------------------------------------------------------------------------

describe("antd-derived dark tokens", () => {
  it("derives alias tokens from the pinned tokens, not antd defaults", () => {
    expect(dark.colorTextPlaceholder).toBe(dark.colorTextQuaternary);
    expect(dark.colorTextDisabled).toBe(dark.colorTextQuaternary);
    expect(dark.colorFillContent).toBe(dark.colorFillSecondary);
    expect(dark.colorFillContentHover).toBe(dark.colorFill);
    expect(dark.controlItemBgHover).toBe(dark.colorFillTertiary);
    expect(dark.controlItemBgActive).toBe(dark.colorPrimaryBg);
    expect(String(dark.colorSplit)).toMatch(/^rgba?\(/);
  });

  it("documents the derivations it relies on", () => {
    const documented = PASEO_DERIVED_TOKENS.map((row) => row.antdToken);
    expect(documented).toContain("colorSplit");
    expect(documented).toContain("controlOutline");
    expect(documented).toContain("colorTextPlaceholder");
  });

  it("keeps a visible focus ring on the paseo green", () => {
    // controlOutline is alpha(colorPrimaryBg over colorBgContainer) — the
    // pinned green family, so the ring is on-brand rather than antd blue.
    expect(String(dark.controlOutline)).toMatch(/^rgba?\(/);
    expect(String(dark.colorPrimaryBg)).not.toBe(paseoDark.accent);
  });
});

// ---------------------------------------------------------------------------
// Custom tokens (paseo concepts antd has no slot for)
// ---------------------------------------------------------------------------

describe("paseo custom tokens", () => {
  it("passes diff, status-dot and surface tokens through to useToken()", () => {
    expect(dark.paseoDiffAddition).toBe(paseoDark.diffAddition);
    expect(dark.paseoDiffDeletion).toBe(paseoDark.diffDeletion);
    expect(dark.paseoStatusDotRunning).toBe(paseoDark.statusDotRunning);
    expect(dark.paseoStatusMerged).toBe(paseoDark.statusMerged);
    expect(dark.paseoSurfaceSidebar).toBe(paseoDark.surfaceSidebar);
    expect(dark.paseoSelection).toBe(paseoDark.selection);
  });

  it("passes all ten host identity colors through", () => {
    for (const [name, value] of Object.entries(paseoIdentityDark)) {
      const key = `paseoIdentity${name[0].toUpperCase()}${name.slice(1)}`;
      expect(dark[key], key).toBe(value);
    }
  });
});

// ---------------------------------------------------------------------------
// Contrast discipline
// ---------------------------------------------------------------------------

describe("dark contrast", () => {
  it("body text clears 4.5:1 on the dark background stack", () => {
    expect(contrast(paseoDark.foreground, paseoDark.surface0)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(paseoDark.foregroundMuted, paseoDark.surface0)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(paseoDark.foreground, paseoDark.surface1)).toBeGreaterThanOrEqual(4.5);
  });

  it("primary button label clears 4.5:1 on the primary fill", () => {
    expect(contrast("#ffffff", paseoDark.accent)).toBeGreaterThanOrEqual(4.5);
  });

  it("primary-colored text clears 4.5:1 on the dark background", () => {
    // The reason the text slots deviate from antd's dark mapping.
    expect(contrast(String(dark.colorPrimaryText), paseoDark.surface0)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(String(dark.colorLink), paseoDark.surface0)).toBeGreaterThanOrEqual(4.5);
  });

  it("status colors clear 3:1 as non-text signals on the dark surface", () => {
    for (const status of [
      paseoDark.statusSuccess,
      paseoDark.statusWarning,
      paseoDark.statusDanger,
    ]) {
      expect(contrast(status, paseoDark.surface0)).toBeGreaterThanOrEqual(3);
    }
  });

  it("diff stats stay readable", () => {
    // Stats take the status band — the rule paseo states in its own theme
    // source: a stat is a status signal, not a diff tier.
    expect(contrast(String(dark.paseoDiffAdditionText), paseoDark.surface0)).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(contrast(String(dark.paseoDiffDeletionText), paseoDark.surface0)).toBeGreaterThanOrEqual(
      4.5,
    );
  });

  it("diff line text stays readable on the desaturated fills", () => {
    // The old #4ade80 / #ef4444 pair was 1.67:1 / 3.61:1 under white text.
    expect(contrast("#fafafa", paseoDark.diffAddition)).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#fafafa", paseoDark.diffDeletion)).toBeGreaterThanOrEqual(4.5);
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
