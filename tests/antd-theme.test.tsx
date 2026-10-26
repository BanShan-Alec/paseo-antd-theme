import { render, screen } from "@testing-library/react";
import { Button, ConfigProvider } from "antd";
import { describe, expect, it } from "vitest";
import { resolveTokens } from "../src/testing/theme";
import { antdDarkTheme, antdLightTheme } from "../src/themes/antd/theme";
import { claudeLightTheme } from "../src/themes/claude/theme";
import { paseoDarkTheme } from "../src/themes/paseo-dark/theme";
import { PASEO_FONT_STACK } from "../src/shared/fonts";

const light = resolveTokens(antdLightTheme);
const dark = resolveTokens(antdDarkTheme);
const claude = resolveTokens(claudeLightTheme);
const paseo = resolveTokens(paseoDarkTheme);

const GEOMETRY_KEYS = [
  "controlHeight",
  "controlHeightSM",
  "controlHeightLG",
  "borderRadius",
  "borderRadiusSM",
  "borderRadiusXS",
  "borderRadiusLG",
] as const;

describe("antd stock themes", () => {
  it("keeps antd's own light palette", () => {
    expect(light.colorPrimary).toBe("#1677ff");
    expect(light.colorBgBase).toBe("#fff");
    expect(light.colorBgLayout).toBe("#f5f5f5");
    expect(light.colorBgContainer).toBe("#ffffff");
    expect(light.colorText).toBe("rgba(0,0,0,0.88)");
  });

  it("keeps antd's own dark palette", () => {
    expect(dark.colorPrimary).toBe("#1668dc");
    expect(dark.colorBgBase).toBe("#000");
    expect(dark.colorBgLayout).toBe("#000000");
    expect(dark.colorBgContainer).toBe("#141414");
  });

  it("pins the shared font stack in both schemes", () => {
    expect(light.fontFamily).toBe(PASEO_FONT_STACK);
    expect(dark.fontFamily).toBe(PASEO_FONT_STACK);
    // The mono stack is antd's own in both algorithms, so it already matches.
    expect(light.fontFamilyCode).toBe(dark.fontFamilyCode);
  });

  it("shares the complete themes' geometry so a mixed pair cannot resize", () => {
    for (const key of GEOMETRY_KEYS) {
      expect(light[key], `light ${key}`).toBe(claude[key]);
      expect(dark[key], `dark ${key}`).toBe(paseo[key]);
    }
  });

  it("pins the component geometry that has no seed token", () => {
    // 2px transparent borders + 9px padding keep the Select row at 44 and the
    // text at the same 11px inset antd has by default.
    expect(antdLightTheme.components?.Select?.optionHeight).toBe(44);
    expect(antdLightTheme.components?.Select?.optionPadding).toBe("9px 12px");
    expect(antdLightTheme.components?.Segmented?.trackPadding).toBe(4);
    expect(antdDarkTheme.components).toEqual(antdLightTheme.components);
    expect(antdLightTheme.components?.Select?.optionHeight).toBe(
      claudeLightTheme.components?.Select?.optionHeight,
    );
  });

  it("keeps the header on the body tone in both schemes", () => {
    // antd hard-codes the navy #001529 header into both schemes; the stock
    // pair overrides it to transparent so the body background shows through —
    // same headerBg = bodyBg rule the complete themes follow.
    expect(antdLightTheme.components?.Layout?.headerBg).toBe("rgba(0, 0, 0, 0)");
    expect(antdDarkTheme.components?.Layout?.headerBg).toBe("rgba(0, 0, 0, 0)");
  });

  it("carries no paseo custom tokens", () => {
    expect(Object.keys(light).filter((key) => key.startsWith("paseo"))).toEqual([]);
    expect(Object.keys(dark).filter((key) => key.startsWith("paseo"))).toEqual([]);
  });

  it("renders antd components under both stock themes", () => {
    render(
      <ConfigProvider theme={antdLightTheme}>
        <Button type="primary">Run agent</Button>
      </ConfigProvider>,
    );
    expect(screen.getByRole("button", { name: "Run agent" })).toBeTruthy();

    render(
      <ConfigProvider theme={antdDarkTheme}>
        <Button type="primary">Run agent</Button>
      </ConfigProvider>,
    );
    expect(screen.getAllByRole("button", { name: "Run agent" }).length).toBeGreaterThan(0);
  });
});
