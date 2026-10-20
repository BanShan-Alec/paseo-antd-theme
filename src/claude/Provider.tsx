import { ConfigProvider, type ConfigProviderProps, type ThemeConfig } from "antd";
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
  /**
   * Theme used for the server snapshot when `mode="system"`. The server cannot
   * know the client's prefers-color-scheme, so pass the preference resolved
   * from a cookie/header here to avoid a light-to-dark flash.
   */
  ssrMode?: "dark" | "light";
  /** Replaces the default antd loading icon in Button, Spin and Select. */
  loadingIcon?: ReactElement;
}

interface ResolveThemeOptions {
  mode?: PaseoThemeMode;
  systemDark?: boolean;
  theme?: ConfigProviderProps["theme"];
}

/** Pure theme selection, also used by tests and SSR. */
export function resolvePaseoTheme({
  mode = "system",
  systemDark = false,
  theme,
}: ResolveThemeOptions): ThemeConfig {
  if (theme) return theme;
  if (mode === "dark") return paseoDarkTheme;
  if (mode === "light") return claudeLightTheme;
  return systemDark ? paseoDarkTheme : claudeLightTheme;
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

/**
 * Drop-in replacement for antd's ConfigProvider: picks the Paseo dark theme or
 * the Claude light theme, and installs the component-level behaviors that
 * ThemeConfig cannot express (custom loading icon, Segmented gap, Select gap).
 */
export function PaseoThemeProvider({
  mode = "system",
  theme,
  ssrMode = "light",
  loadingIcon,
  children,
  ...rest
}: PaseoThemeProviderProps) {
  const systemDark = useSyncExternalStore(
    subscribeToColorScheme,
    getSystemDark,
    () => mode === "dark" || (mode === "system" && ssrMode === "dark"),
  );

  const resolvedTheme = resolvePaseoTheme({ mode, systemDark, theme });
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
