import { render, screen } from "@testing-library/react";
import { Button, ConfigProvider } from "antd";
import { describe, expect, it } from "vitest";
import { resolveTokens } from "../src/testing/theme";
import { antdDarkTheme, antdLightTheme } from "../src/themes/antd/theme";
import { PASEO_FONT_STACK } from "../src/shared/fonts";

const light = resolveTokens(antdLightTheme);
const dark = resolveTokens(antdDarkTheme);

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
