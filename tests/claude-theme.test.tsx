import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button, ConfigProvider, Table } from "antd";
import { contrast, luminance } from "../src/testing/contrast";
import { resolveTokens } from "../src/testing/theme";
import {
  CLAUDE_LIGHT_DERIVED_TOKENS,
  CLAUDE_LIGHT_TOKEN_MAPPING,
  claudeLightTheme,
} from "../src/themes/claude/theme";
import { claudeIdentityLight, claudeLight, claudeLightStatusFamilies } from "../src/themes/claude/tokens";

const light = resolveTokens(claudeLightTheme);

// ---------------------------------------------------------------------------
// Mapping reaches antd's token pipeline
// ---------------------------------------------------------------------------

describe("claude → antd light token mapping", () => {
  it("pins every mapped token verbatim", () => {
    for (const row of CLAUDE_LIGHT_TOKEN_MAPPING) {
      expect(light[row.antdToken], row.antdToken).toBe(row.value);
    }
  });

  it("pins the Claude palette", () => {
    expect(light.colorPrimary).toBe("#BA5B37");
    expect(light.colorSuccess).toBe("#467650");
    expect(light.colorWarning).toBe("#806340");
    expect(light.colorError).toBe("#a14b43");
    expect(light.colorInfo).toBe("#436c96");
    expect(light.colorLink).toBe("#4B5BD8");
    expect(light.colorText).toBe("#3C3C2C");
    expect(light.colorBgLayout).toBe("#F0EDE2");
    expect(light.colorBgContainer).toBe("#F5F4EC");
    expect(light.colorBgElevated).toBe("#FFFFFF");
  });

  it("keeps the surface ladder ordered", () => {
    const ladder = [
      claudeLight.surfaceSidebar,
      claudeLight.surface0,
      claudeLight.surface1,
      claudeLight.surface2,
    ];
    // sidebar < layout < container. Container and elevated are both white in
    // light mode: elevation is carried by border + shadow, not lightness.
    expect(luminance(ladder[0]), "sidebar").toBeLessThan(luminance(ladder[1]));
    expect(luminance(ladder[1]), "layout").toBeLessThan(luminance(ladder[2]));
    expect(luminance(ladder[3]), "elevated").toBeGreaterThanOrEqual(luminance(ladder[2]));
    expect(light.colorBgLayout).toBe(claudeLight.surface0);
    expect(light.colorBgContainer).toBe(claudeLight.surface1);
    expect(light.colorBgElevated).toBe(claudeLight.surface2);
  });

  it("derives coherent hover/active states around each pinned base", () => {
    // Primary solid buttons darken on hover/active so the white label keeps
    // its contrast; the status families keep the lighter-hover convention.
    const primaryBase = light.colorPrimary as string;
    const primaryHover = light.colorPrimaryHover as string;
    const primaryActive = light.colorPrimaryActive as string;
    expect(new Set([primaryBase, primaryHover, primaryActive]).size).toBe(3);
    expect(luminance(primaryHover)).toBeLessThan(luminance(primaryBase));
    expect(luminance(primaryActive)).toBeLessThan(luminance(primaryHover));

    for (const family of ["colorSuccess", "colorWarning", "colorError"]) {
      const base = light[family] as string;
      const hover = light[`${family}Hover`] as string;
      const active = light[`${family}Active`] as string;
      expect(new Set([base, hover, active]).size, family).toBe(3);
      expect(luminance(hover), `${family}Hover`).toBeGreaterThan(luminance(base));
      expect(luminance(active), `${family}Active`).toBeLessThan(luminance(base));
    }
  });

  it("pins the shared font stacks", () => {
    expect(light.fontFamily).toContain("system-ui");
    expect(light.fontFamilyCode).toContain("SFMono-Regular");
  });

  it("keeps hover, selected and parchment panel-head steps visible", () => {
    // Hover visibility is measured against the surface it sits on. The V4
    // paper look keeps the card only 1.06 above the page, so hover is 1.16.
    expect(contrast(claudeLight.surfaceHover, claudeLight.surface1)).toBeGreaterThanOrEqual(1.15);
    // Selected must read stronger than hover on the sidebar.
    expect(contrast(claudeLight.surface4, claudeLight.surfaceSidebar)).toBeGreaterThan(
      contrast(claudeLight.surfaceHover, claudeLight.surfaceSidebar),
    );
    // Parchment panel-head tone against the white card.
    expect(contrast(claudeLight.surfaceHead, claudeLight.surface1)).toBeGreaterThanOrEqual(1.15);
    // Head must stay distinct from the hover step so hovering a row does not
    // look like the header.
    expect(contrast(claudeLight.surfaceHead, claudeLight.surfaceHover)).toBeGreaterThanOrEqual(1.02);

    // Menu hover/selected are derived for the sidebar surface (1.14 / 1.21),
    // and selected must stay above hover.
    expect(claudeLightTheme.components?.Menu?.itemHoverBg).toBe(claudeLight.surface3);
    expect(claudeLightTheme.components?.Menu?.itemSelectedBg).toBe(claudeLight.surface4);
    expect(contrast(claudeLight.surface4, claudeLight.surfaceSidebar)).toBeGreaterThan(
      contrast(claudeLight.surface3, claudeLight.surfaceSidebar),
    );
    expect(claudeLightTheme.components?.Table?.rowHoverBg).toBe(claudeLight.surfaceHover);
    expect(claudeLightTheme.components?.Table?.headerBg).toBe(claudeLight.surfaceHead);
    // Segmented's track is a light neutral in the card family, so it needs
    // no hover override — antd's default (colorFillSecondary = surface3)
    // already reads 1.21 against it.
    expect(claudeLightTheme.components?.Segmented?.trackBg).toBe(claudeLight.surfaceTrack);
    expect(claudeLightTheme.components?.Segmented?.itemHoverBg).toBeUndefined();
    expect(claudeLightTheme.components?.Card?.headerBg).toBe(claudeLight.surfaceHead);
    expect(light.colorFillTertiary).toBe(claudeLight.surfaceHover);
  });

  it("uses the 40px control / 12px radius / 14px body scale", () => {
    expect(light.fontSize).toBe(14);
    expect(light.fontSizeSM).toBe(12);
    expect(light.fontSizeLG).toBe(16);
    expect(light.controlHeight).toBe(40);
    expect(light.controlHeightSM).toBe(32);
    expect(light.controlHeightLG).toBe(48);
    expect(light.borderRadius).toBe(12);
    expect(light.borderRadiusSM).toBe(8);
    expect(light.borderRadiusLG).toBe(12);
    expect(light.borderRadiusXS).toBe(4);
    expect(claudeLightTheme.components?.Alert?.borderRadius).toBe("12px");
    expect(claudeLightTheme.components?.Segmented?.trackPadding).toBe(4);
    expect(claudeLightTheme.components?.Select?.optionPadding).toBe("9px 12px");
    expect(claudeLightTheme.components?.Select?.optionHeight).toBe(44);
  });

  it("uses soft elevation rather than the paseo flat chrome", () => {
    expect(String(light.boxShadow)).toContain("rgba(31, 30, 29");
    expect(claudeLightTheme.components?.Button?.primaryShadow).not.toBe("none");
    expect(claudeLightTheme.components?.Button?.primaryColor).toBe("#FFFFFF");
  });
});

// ---------------------------------------------------------------------------
// Derived + custom tokens
// ---------------------------------------------------------------------------

describe("antd-derived light tokens", () => {
  it("derives alias tokens from the pinned tokens", () => {
    expect(light.colorTextPlaceholder).toBe(light.colorTextQuaternary);
    expect(light.colorTextDisabled).toBe(light.colorTextQuaternary);
    expect(light.colorFillContent).toBe(light.colorFillSecondary);
    expect(light.colorFillContentHover).toBe(light.colorFill);
    expect(light.controlItemBgHover).toBe(light.colorFillTertiary);
    expect(light.controlItemBgActive).toBe(light.colorPrimaryBg);
    expect(String(light.colorSplit)).toMatch(/^rgba?\(/);
  });

  it("documents the derivations it relies on", () => {
    const documented = CLAUDE_LIGHT_DERIVED_TOKENS.map((row) => row.antdToken);
    expect(documented).toContain("colorSplit");
    expect(documented).toContain("controlOutline");
    expect(documented).toContain("colorTextPlaceholder");
  });
});

describe("claude custom tokens", () => {
  it("passes diff, status-dot, surface and selection tokens through", () => {
    expect(light.paseoDiffAddition).toBe(claudeLight.diffAddition);
    expect(light.paseoDiffDeletion).toBe(claudeLight.diffDeletion);
    expect(light.paseoDiffAdditionText).toBe(claudeLightStatusFamilies.success.textHover);
    expect(light.paseoDiffDeletionText).toBe(claudeLightStatusFamilies.danger.textHover);
    expect(light.paseoStatusDotSuccess).toBe(claudeLight.statusSuccess);
    expect(light.paseoStatusDotRunning).toBe(claudeLight.statusRunning);
    expect(light.paseoStatusMerged).toBe(claudeLight.statusMerged);
    expect(light.paseoSurfaceSidebar).toBe(claudeLight.surfaceSidebar);
    expect(light.paseoSelection).toBe(claudeLight.selection);
  });

  it("passes all ten host identity colors through", () => {
    for (const [name, value] of Object.entries(claudeIdentityLight)) {
      const key = `paseoIdentity${name[0].toUpperCase()}${name.slice(1)}`;
      expect(light[key], key).toBe(value);
    }
  });
});

// ---------------------------------------------------------------------------
// Contrast discipline
// ---------------------------------------------------------------------------

describe("claude light contrast", () => {
  it("body and secondary text clear 4.5:1 on the surface stack", () => {
    for (const surface of [claudeLight.surface0, claudeLight.surface1]) {
      expect(contrast(claudeLight.foreground, surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(claudeLight.foregroundMuted, surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(claudeLight.foregroundExtraMuted, surface)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("uses the sampled claude.ai clay with a white label above 4.5:1", () => {
    // #BA5B37 is the sampled clay taken one step deeper so white clears 4.5.
    expect(claudeLight.accent).toBe("#BA5B37");
    expect(claudeLightTheme.components?.Button?.primaryColor).toBe("#FFFFFF");
    expect(contrast("#ffffff", claudeLight.accent)).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#ffffff", light.colorPrimaryHover as string)).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#ffffff", light.colorPrimaryActive as string)).toBeGreaterThanOrEqual(4.5);
  });

  it("danger/solid buttons keep white text above 4.5:1", () => {
    expect(contrast("#ffffff", claudeLight.statusDanger)).toBeGreaterThanOrEqual(4.5);
  });

  it("links clear 4.5:1 on the layout", () => {
    expect(contrast(claudeLight.link, claudeLight.surface0)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(claudeLight.linkHover, claudeLight.surface0)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(claudeLight.linkActive, claudeLight.surface0)).toBeGreaterThanOrEqual(4.5);
  });

  it("status colors clear 4.5:1 as text on ivory", () => {
    for (const status of [
      claudeLight.statusSuccess,
      claudeLight.statusWarning,
      claudeLight.statusDanger,
      claudeLight.statusRunning,
      claudeLight.statusMerged,
    ]) {
      expect(contrast(status, claudeLight.surface1)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("status text clears 4.5:1 on its own background", () => {
    // Tag/Alert text sits on the family's bg slot, not on the page surface.
    const pairs: [string, string][] = [
      [light.colorSuccess as string, light.colorSuccessBg as string],
      [light.colorWarning as string, light.colorWarningBg as string],
      [light.colorError as string, light.colorErrorBg as string],
      [light.colorInfo as string, light.colorInfoBg as string],
      [light.colorPrimaryText as string, light.colorPrimaryBg as string],
    ];
    for (const [foreground, background] of pairs) {
      expect(contrast(foreground, background), `${foreground} on ${background}`).toBeGreaterThanOrEqual(
        4.5,
      );
    }
  });

  it("keeps white identity letters above 4.5:1", () => {
    for (const [name, value] of Object.entries(claudeIdentityLight)) {
      expect(contrast("#ffffff", value), name).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("diff line text and stats stay readable", () => {
    // Line text is ink on the pale fills; stats use the darker text slots of
    // the normalized families, so they pass on both the fills and the paper.
    expect(contrast(claudeLight.foreground, claudeLight.diffAddition)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(claudeLight.foreground, claudeLight.diffDeletion)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(String(light.paseoDiffAdditionText), claudeLight.diffAddition)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(String(light.paseoDiffDeletionText), claudeLight.diffDeletion)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(String(light.paseoDiffAdditionText), claudeLight.surface1)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(String(light.paseoDiffDeletionText), claudeLight.surface1)).toBeGreaterThanOrEqual(4.5);
  });

  it("selection is not the paseo white overlay", () => {
    expect(claudeLight.selection).toContain("rgba(186, 91, 55");
  });
});

// ---------------------------------------------------------------------------
// Render smoke
// ---------------------------------------------------------------------------

describe("rendering", () => {
  it("renders antd components under the Claude light theme", () => {
    render(
      <ConfigProvider theme={claudeLightTheme}>
        <Button type="primary">Run agent</Button>
      </ConfigProvider>,
    );
    expect(screen.getByRole("button", { name: "Run agent" })).toBeTruthy();
  });

  it("renders a table under the Claude light theme", () => {
    render(
      <ConfigProvider theme={claudeLightTheme}>
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
