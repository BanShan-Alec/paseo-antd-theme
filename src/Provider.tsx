import { ConfigProvider, type ConfigProviderProps, type ThemeConfig } from "antd";
import { useSyncExternalStore, type ReactElement } from "react";
import { paseoDarkTheme } from "./themes/paseo-dark/theme";
import { PaseoLoadingIcon } from "./LoadingIcon";
import { claudeLightTheme } from "./themes/claude/theme";
import {
  PASEO_LOADING_CSS,
  PASEO_SEGMENTED_GAP_CSS,
  PASEO_SELECT_GAP_CSS,
} from "./themeStyles";

export type PaseoThemeMode = "system" | "light" | "dark";

/**
 * Every app has exactly two slots. Either one may hold any ThemeConfig — a
 * built-in theme, antd's own, or one derived with `extendTheme` — so mixing is
 * just filling them independently.
 */
export interface PaseoThemeSlots {
  light?: ThemeConfig;
  dark?: ThemeConfig;
}

/**
 * The component-level behaviors antd tokens cannot express. Each one is on by
 * default and can be turned off on its own; the provider only injects the CSS
 * for the behaviors that are still enabled.
 */
export interface PaseoBehaviors {
  /** `false` keeps antd's own spinner in Button, Spin and Select. */
  loadingIcon?: ReactElement | false;
  /** 4px gap between Segmented items (antd has no gap token for them). */
  segmentedGap?: boolean;
  /** Transparent 2px borders that give Select options real breathing room. */
  selectGap?: boolean;
}

export interface PaseoThemeProviderProps
  extends Omit<ConfigProviderProps, "theme" | "button" | "spin" | "select" | "segmented"> {
  /** Slot contents. An omitted slot falls back to its built-in default. */
  themes?: PaseoThemeSlots;
  /** Which slot to use. Defaults to "system" (prefers-color-scheme). */
  mode?: PaseoThemeMode;
  /**
   * Slot used for the server snapshot when `mode="system"`. The server cannot
   * know the client's prefers-color-scheme, so pass the preference resolved
   * from a cookie/header here to avoid a light-to-dark flash.
   */
  ssrMode?: "dark" | "light";
  behaviors?: PaseoBehaviors;
}

const DEFAULT_THEMES: Required<PaseoThemeSlots> = {
  light: claudeLightTheme,
  dark: paseoDarkTheme,
};

interface ResolveThemeOptions {
  mode?: PaseoThemeMode;
  systemDark?: boolean;
  themes?: PaseoThemeSlots;
}

/** Pure slot selection, also used by tests and SSR. */
export function resolvePaseoTheme({
  mode = "system",
  systemDark = false,
  themes,
}: ResolveThemeOptions = {}): ThemeConfig {
  const slot = mode === "system" ? (systemDark ? "dark" : "light") : mode;
  return themes?.[slot] ?? DEFAULT_THEMES[slot];
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
 * Drop-in replacement for antd's ConfigProvider: resolves the light/dark slot,
 * and installs the component-level behaviors that ThemeConfig cannot express
 * (custom loading icon, Segmented gap, Select gap). Behaviors are independent
 * of which themes the slots hold.
 */
export function PaseoThemeProvider({
  mode = "system",
  themes,
  ssrMode = "light",
  behaviors,
  children,
  ...rest
}: PaseoThemeProviderProps) {
  const systemDark = useSyncExternalStore(
    subscribeToColorScheme,
    getSystemDark,
    () => mode === "dark" || (mode === "system" && ssrMode === "dark"),
  );

  const resolvedTheme = resolvePaseoTheme({ mode, systemDark, themes });
  const loadingIcon = behaviors?.loadingIcon === undefined ? <PaseoLoadingIcon /> : behaviors.loadingIcon;
  const segmentedGap = behaviors?.segmentedGap ?? true;
  const selectGap = behaviors?.selectGap ?? true;

  const css = [
    loadingIcon ? PASEO_LOADING_CSS : "",
    selectGap ? PASEO_SELECT_GAP_CSS : "",
    segmentedGap ? PASEO_SEGMENTED_GAP_CSS : "",
  ]
    .filter(Boolean)
    .join("\n");

  const select =
    loadingIcon || selectGap
      ? {
          ...(loadingIcon ? { loadingIcon } : {}),
          ...(selectGap ? { classNames: { popup: { listItem: "paseo-select-item" } } } : {}),
        }
      : undefined;

  return (
    <ConfigProvider
      {...rest}
      theme={resolvedTheme}
      button={loadingIcon ? { loadingIcon } : undefined}
      spin={loadingIcon ? { indicator: loadingIcon } : undefined}
      select={select}
      segmented={segmentedGap ? { classNames: { item: "paseo-segmented-item" } } : undefined}
    >
      {css ? <style data-paseo-theme="">{css}</style> : null}
      {children}
    </ConfigProvider>
  );
}
