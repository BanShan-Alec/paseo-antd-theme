import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button, Segmented, Spin } from "antd";
import { ClaudeThemeProvider } from "./Provider";

describe("ClaudeThemeProvider", () => {
  it("replaces the default Button and Spin loading icons", () => {
    const { container } = render(
      <ClaudeThemeProvider>
        <Button loading>Run agent</Button>
        <Spin />
      </ClaudeThemeProvider>,
    );

    expect(container.querySelectorAll("svg[data-claude-loading]").length).toBeGreaterThan(0);
    expect(container.querySelector(".anticon-loading")).toBeNull();
  });

  it("adds the Segmented item gap class", () => {
    const { container } = render(
      <ClaudeThemeProvider>
        <Segmented options={["全部", "运行中"]} />
      </ClaudeThemeProvider>,
    );

    expect(container.querySelectorAll(".claude-segmented-item").length).toBe(2);
  });
});
