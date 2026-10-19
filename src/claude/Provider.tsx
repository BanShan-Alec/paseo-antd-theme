import { ConfigProvider, type ConfigProviderProps } from "antd";
import type { ReactElement } from "react";
import { ClaudeLoadingIcon } from "./LoadingIcon";
import { claudeLightTheme } from "./theme";

export interface ClaudeThemeProviderProps
  extends Omit<ConfigProviderProps, "theme" | "button" | "spin" | "select" | "segmented"> {
  /** Defaults to the Claude light theme; pass a paseo theme to reuse the component behavior. */
  theme?: ConfigProviderProps["theme"];
  /** Replaces the default antd loading icon in Button, Spin and Select. */
  loadingIcon?: ReactElement;
}

/**
 * Theme config alone cannot carry React nodes, so the custom loading icon and
 * the Segmented item gap live here as ConfigProvider component configs.
 */
export function ClaudeThemeProvider({
  theme = claudeLightTheme,
  loadingIcon,
  children,
  ...rest
}: ClaudeThemeProviderProps) {
  const indicator = loadingIcon ?? <ClaudeLoadingIcon />;

  return (
    <ConfigProvider
      {...rest}
      theme={theme}
      button={{ loadingIcon: indicator }}
      spin={{ indicator }}
      select={{
        loadingIcon: indicator,
        classNames: { popup: { listItem: "claude-select-item" } },
      }}
      segmented={{ classNames: { item: "claude-segmented-item" } }}
    >
      {children}
    </ConfigProvider>
  );
}
