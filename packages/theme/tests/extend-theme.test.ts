import { generate } from "@ant-design/colors";
import { theme as antdTheme } from "antd";
import type { ThemeConfig } from "antd";
import { describe, expect, it } from "vitest";
import { extendTheme } from "../src/extendTheme";
import { lightFamilyFromBase } from "../src/shared/colors";
import { antdDarkTheme, antdLightTheme } from "../src/themes/antd/theme";
import { claudeLightTheme } from "../src/themes/claude/theme";
import { paseoDarkTheme } from "../src/themes/paseo-dark/theme";
import { paseoDark } from "../src/themes/paseo-dark/tokens";

const BAND = "#7C6BF0";

const resolve = (theme: ThemeConfig) =>
  antdTheme.getDesignToken(theme) as unknown as Record<string, string | number>;

describe("extendTheme", () => {
  it("rebuilds every slot of a dark color family from the new base", () => {
    const tokens = resolve(extendTheme(paseoDarkTheme, { token: { colorPrimary: BAND } }));
    const ramp = generate(BAND, { theme: "dark" });

    expect(tokens.colorPrimary).toBe(BAND);
    expect(tokens.colorPrimaryHover).toBe(ramp[6]);
    expect(tokens.colorPrimaryActive).toBe(ramp[4]);
    expect(tokens.colorPrimaryBg).toBe(ramp[0]);
    expect(tokens.colorPrimaryBgHover).toBe(ramp[1]);
    expect(tokens.colorPrimaryBorder).toBe(ramp[2]);
    expect(tokens.colorPrimaryBorderHover).toBe(ramp[3]);
    expect(tokens.colorPrimaryText).toBe(ramp[8]);
    expect(tokens.colorPrimaryTextHover).toBe(ramp[9]);
    expect(tokens.colorPrimaryTextActive).toBe(ramp[7]);
  });

  it("rebuilds a light family with the OKLCH ladder anchored at the input", () => {
    const tokens = resolve(extendTheme(claudeLightTheme, { token: { colorSuccess: "#123456" } }));
    const family = lightFamilyFromBase("#123456");

    expect(tokens.colorSuccess).toBe("#123456");
    expect(tokens.colorSuccessBg).toBe(family.bg);
    expect(tokens.colorSuccessBorder).toBe(family.border);
    expect(tokens.colorSuccessHover).toBe(family.hover);
    expect(tokens.colorSuccessText).toBe(family.text);
  });

  it("leaves every family the extension did not name alone", () => {
    const tokens = resolve(extendTheme(paseoDarkTheme, { token: { colorPrimary: BAND } }));

    expect(tokens.colorSuccess).toBe(paseoDark.statusSuccess);
    expect(tokens.colorWarning).toBe(paseoDark.statusWarning);
    expect(tokens.colorBgLayout).toBe(paseoDark.surface0);
    expect(tokens.colorBgContainer).toBe(paseoDark.surface1);
  });

  it("works on antd's own themes in both schemes", () => {
    const dark = resolve(extendTheme(antdDarkTheme, { token: { colorPrimary: BAND } }));
    expect(dark.colorPrimary).toBe(BAND);
    expect(dark.colorPrimaryHover).toBe(generate(BAND, { theme: "dark" })[6]);

    const light = resolve(extendTheme(antdLightTheme, { token: { colorPrimary: BAND } }));
    expect(light.colorPrimary).toBe(BAND);
    expect(light.colorPrimaryHover).toBe(lightFamilyFromBase(BAND).hover);
  });

  it("applies non-family tokens verbatim, including seeds antd would strip", () => {
    const tokens = resolve(
      extendTheme(paseoDarkTheme, { token: { fontSize: 15, colorBgLayout: "#010203" } }),
    );

    expect(tokens.fontSize).toBe(15);
    expect(tokens.colorBgLayout).toBe("#010203");
    // Seeds reach antd's own derivation too, so dependent sizes still follow.
    expect(Number(tokens.fontSizeSM)).toBeLessThan(15);
  });

  it("merges component tokens per component", () => {
    const theme = extendTheme(paseoDarkTheme, {
      components: { Button: { primaryColor: "#101010" } },
    });

    expect(theme.components?.Button?.primaryColor).toBe("#101010");
    expect(theme.components?.Button?.primaryShadow).toBe(
      paseoDarkTheme.components?.Button?.primaryShadow,
    );
    expect(theme.components?.Table?.headerBg).toBe(paseoDarkTheme.components?.Table?.headerBg);
  });

  it("keeps the base theme untouched", () => {
    extendTheme(paseoDarkTheme, { token: { colorPrimary: "#000000" } });
    const baseToken = paseoDarkTheme.token as Record<string, unknown>;

    expect(baseToken.colorPrimary).toBe(paseoDark.accent);
    expect(Array.isArray(paseoDarkTheme.algorithm)).toBe(false);
    expect(baseToken.paseoSurface0).toBe(paseoDark.surface0);
  });

  it("appends the overlay after the base algorithm", () => {
    const theme = extendTheme(paseoDarkTheme, { token: { colorPrimary: BAND } });

    expect(Array.isArray(theme.algorithm)).toBe(true);
    const chain = theme.algorithm as unknown[];
    expect(chain[0]).toBe(paseoDarkTheme.algorithm);
    expect(chain.length).toBe(2);
  });

  it("extends a theme that has no algorithm", () => {
    const base: ThemeConfig = { token: { colorBgLayout: "#fafafa" } };
    const tokens = resolve(extendTheme(base, { token: { colorPrimary: BAND } }));

    expect(tokens.colorPrimary).toBe(BAND);
    expect(tokens.colorBgLayout).toBe("#fafafa");
  });

  it("returns an empty-handed clone when given no extension", () => {
    const theme = extendTheme(paseoDarkTheme);
    const tokens = resolve(theme);

    expect(tokens.colorPrimary).toBe(paseoDark.accent);
    expect(tokens.colorBgLayout).toBe(paseoDark.surface0);
    expect(theme.components).toEqual(paseoDarkTheme.components);
  });
});
