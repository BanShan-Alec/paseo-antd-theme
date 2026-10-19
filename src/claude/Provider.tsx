import { ConfigProvider, type ConfigProviderProps } from "antd";
import { useSyncExternalStore, type ReactElement } from "react";
import { paseoDarkTheme } from "../paseo-full/theme";
import { ClaudeLoadingIcon } from "./LoadingIcon";
import { claudeLightTheme } from "./theme";
import { PASEO_THEME_CSS } from "./themeStyles";

export type PaseoThemeMode = "dark" | "light" | "system";

export interface PaseoThemeProviderProps
  extends Omit<ConfigProviderProps, "theme" | "button" | "spin" | "select" | "segmented"> {
  /** Defaults to "system"; ignored when `theme` is supplied. */
  mode?: PaseoThemeMode;
  /** Full ThemeConfig override; wins over mode. */
  theme?: ConfigProviderProps["theme"];
  /** Replaces the default antd loading icon in Button, Spin and Select. */
  loadingIcon?: ReactElement;
}

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

function subscribeToColorScheme(callback: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const media = window.matchMedia(COLOR_SCHEME_QUERY);
  media.addEventListener?.("change", callback);
  return () => media.removeEventListener?.("change", callback);
}

function getSystemDark(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(COLOR_SCHEME_QUERY).matches
  );
}

function getServerDark(): boolean {
  return false;
}

/**
 * Drop-in replacement for antd's ConfigProvider: picks the Paseo dark theme or
 * the Claude light theme, and installs the component-level behaviors that
 * ThemeConfig cannot express (custom loading icon, Segmented gap, Select gap).
 */
export function PaseoThemeProvider({
  mode = "system",
  theme,
  loadingIcon,
  children,
  ...rest
}: PaseoThemeProviderProps) {
  const systemDark = useSyncExternalStore(
    subscribeToColorScheme,
    getSystemDark,
    getServerDark,
  );

  const resolvedTheme =
    theme ??
    (mode === "system"
      ? systemDark
        ? paseoDarkTheme
        : claudeLightTheme
      : mode === "dark"
        ? paseoDarkTheme
        : claudeLightTheme);

  const indicator = loadingIcon ?? <ClaudeLoadingIcon />;

  return (
    <ConfigProvider
      {...rest}
      theme={resolvedTheme}
      button={{ loadingIcon: indicator }}
      spin={{ indicator }}
      select={{
        loadingIcon: indicator,
        classNames: { popup: { listItem: "claude-select-item" } },
      }}
      segmented={{ classNames: { item: "claude-segmented-item" } }}
    >
      <style data-paseo-theme="">{PASEO_THEME_CSS}</style>
      {children}
    </ConfigProvider>
  );
}
