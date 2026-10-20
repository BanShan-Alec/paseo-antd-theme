import { render } from "@testing-library/react";
import { ConfigProvider, theme as antdTheme } from "antd";
import type { ThemeConfig } from "antd";

/** Resolves a theme through antd's real token pipeline via useToken(). */
export function resolveTokens(theme: ThemeConfig): Record<string, string | number> {
  let resolved: Record<string, string | number> = {};
  function Probe() {
    const { token } = antdTheme.useToken();
    resolved = token as unknown as Record<string, string | number>;
    return null;
  }
  render(
    <ConfigProvider theme={theme}>
      <Probe />
    </ConfigProvider>,
  );
  return resolved;
}
