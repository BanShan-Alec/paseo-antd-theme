/**
 * Generates `src/tailwind/theme.css` — the Tailwind v4 distribution of a
 * light/dark theme pair. Values are resolved through antd's own token pipeline
 * (`theme.getDesignToken`) at generation time, so the shipped CSS carries the
 * complete alias set (hover/active/ramps/split) as static values and needs no
 * antd dependency on the consumer side.
 *
 * The default pair is Claude Light + Paseo Dark, which is also
 * PaseoThemeProvider's default slot pairing. Consumers who mix other slots
 * (for example antd's own light with Paseo dark) call `generateTailwindCss`
 * from the package root with their pair and import that file instead, so
 * utilities and components cannot drift apart.
 *
 * Layering: the light slot lives on `:root`; the dark slot is written twice —
 * under `@media (prefers-color-scheme: dark)` for Tailwind's default dark
 * strategy and under `.dark` (after the media block, so the class wins when
 * both apply) for the class strategy.
 */
import { theme as antdTheme, type ThemeConfig } from "antd";
import { claudeLightTheme } from "../themes/claude/theme";
import { paseoDarkTheme } from "../themes/paseo-dark/theme";

export interface TailwindThemePair {
  readonly light: ThemeConfig;
  readonly dark: ThemeConfig;
}

/** The provider's default slot pairing. */
export const DEFAULT_TAILWIND_THEMES: TailwindThemePair = {
  light: claudeLightTheme,
  dark: paseoDarkTheme,
};

export interface TailwindVariable {
  /** Tailwind-facing name: the variable is `--paseo-<name>`, the `@theme` key `--color-<name>`. */
  readonly name: string;
  /** antd alias token (or paseo custom token) the value is read from. */
  readonly source: string;
  /** Alternative token for the dark scheme, for claude-only concepts antd has no dark slot for. */
  readonly darkSource?: string;
  /**
   * Stock antd has no `paseo*` custom tokens. These aliases let the same
   * stylesheet be generated for a pair that contains antd's own themes, so the
   * documented mixed setup (antd light + paseo dark) keeps working.
   */
  readonly fallback?: readonly string[];
  /** `kind: "other"` variables carry an explicit `@theme` namespace key (`--font-*`, `--radius-*`). */
  readonly themeKey?: string;
  readonly kind: "color" | "other";
  /** Group heading used as a CSS comment inside the generated blocks. */
  readonly group: string;
  readonly note?: string;
}

const FAMILY_SLOTS = [
  "",
  "Hover",
  "Active",
  "Bg",
  "BgHover",
  "Border",
  "BorderHover",
  "Text",
  "TextHover",
  "TextActive",
] as const;

function familyVariables(
  name: string,
  antdPrefix: string,
  group: string,
): TailwindVariable[] {
  return FAMILY_SLOTS.map((slot) => ({
    name: slot === "" ? name : `${name}-${slot.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}`,
    source: `${antdPrefix}${slot}`,
    kind: "color",
    group,
  }));
}

/**
 * The full export list, in CSS output order. Everything here must resolve in
 * BOTH themes — `tokenValue` throws on a missing key, so a renamed antd token
 * or a stripped paseo custom token fails generation instead of shipping a
 * wrong variable.
 */
export const TAILWIND_VARIABLES: readonly TailwindVariable[] = [
  ...familyVariables("primary", "colorPrimary", "主色"),
  ...familyVariables("success", "colorSuccess", "状态色"),
  ...familyVariables("warning", "colorWarning", "状态色"),
  ...familyVariables("error", "colorError", "状态色"),
  ...familyVariables("info", "colorInfo", "状态色"),
  { name: "bg-layout", source: "colorBgLayout", kind: "color", group: "表面" },
  { name: "bg-container", source: "colorBgContainer", kind: "color", group: "表面" },
  { name: "bg-elevated", source: "colorBgElevated", kind: "color", group: "表面" },
  { name: "bg-spotlight", source: "colorBgSpotlight", kind: "color", group: "表面" },
  { name: "bg-mask", source: "colorBgMask", kind: "color", group: "表面" },
  {
    name: "surface-0",
    source: "paseoSurface0",
    fallback: ["colorBgLayout"],
    kind: "color",
    group: "表面",
  },
  {
    name: "surface-1",
    source: "paseoSurface1",
    fallback: ["colorBgContainer"],
    kind: "color",
    group: "表面",
  },
  {
    name: "surface-2",
    source: "paseoSurface2",
    fallback: ["colorBgElevated"],
    kind: "color",
    group: "表面",
  },
  {
    name: "surface-3",
    source: "paseoSurface3",
    fallback: ["colorFillSecondary"],
    kind: "color",
    group: "表面",
  },
  {
    name: "surface-4",
    source: "paseoSurface4",
    fallback: ["colorFill"],
    kind: "color",
    group: "表面",
  },
  {
    name: "surface-sidebar",
    source: "paseoSurfaceSidebar",
    fallback: ["colorBgLayout"],
    kind: "color",
    group: "表面",
  },
  {
    name: "surface-head",
    source: "paseoSurfaceHead",
    darkSource: "paseoSurface1",
    fallback: ["colorFillSecondary"],
    kind: "color",
    group: "表面",
    note: "深色主题没有 paper-on-paper 表头概念，用面板色 surface1 补位（与 Table.headerBg 一致）。",
  },
  {
    name: "surface-hover",
    source: "paseoSurfaceHover",
    darkSource: "paseoSurface1",
    fallback: ["colorFillTertiary"],
    kind: "color",
    group: "表面",
    note: "深色主题的卡片 hover 就是面板色 surface1（与 Table.rowHoverBg 一致）。",
  },
  { name: "text", source: "colorText", kind: "color", group: "文字" },
  { name: "text-secondary", source: "colorTextSecondary", kind: "color", group: "文字" },
  { name: "text-tertiary", source: "colorTextTertiary", kind: "color", group: "文字" },
  { name: "text-quaternary", source: "colorTextQuaternary", kind: "color", group: "文字" },
  { name: "text-light-solid", source: "colorTextLightSolid", kind: "color", group: "文字" },
  { name: "border", source: "colorBorder", kind: "color", group: "边框与分隔" },
  { name: "border-secondary", source: "colorBorderSecondary", kind: "color", group: "边框与分隔" },
  { name: "split", source: "colorSplit", kind: "color", group: "边框与分隔" },
  { name: "fill", source: "colorFill", kind: "color", group: "填充" },
  { name: "fill-secondary", source: "colorFillSecondary", kind: "color", group: "填充" },
  { name: "fill-tertiary", source: "colorFillTertiary", kind: "color", group: "填充" },
  { name: "fill-quaternary", source: "colorFillQuaternary", kind: "color", group: "填充" },
  { name: "control-item-bg-hover", source: "controlItemBgHover", kind: "color", group: "控件底色" },
  { name: "control-item-bg-active", source: "controlItemBgActive", kind: "color", group: "控件底色" },
  { name: "link", source: "colorLink", kind: "color", group: "链接" },
  { name: "link-hover", source: "colorLinkHover", kind: "color", group: "链接" },
  { name: "link-active", source: "colorLinkActive", kind: "color", group: "链接" },
  {
    name: "diff-addition",
    source: "paseoDiffAddition",
    fallback: ["colorSuccessBg"],
    kind: "color",
    group: "Diff",
  },
  {
    name: "diff-addition-text",
    source: "paseoDiffAdditionText",
    fallback: ["colorSuccessText"],
    kind: "color",
    group: "Diff",
  },
  {
    name: "diff-deletion",
    source: "paseoDiffDeletion",
    fallback: ["colorErrorBg"],
    kind: "color",
    group: "Diff",
  },
  {
    name: "diff-deletion-text",
    source: "paseoDiffDeletionText",
    fallback: ["colorErrorText"],
    kind: "color",
    group: "Diff",
  },
  {
    name: "status-dot-success",
    source: "paseoStatusDotSuccess",
    fallback: ["colorSuccess"],
    kind: "color",
    group: "状态点",
  },
  {
    name: "status-dot-danger",
    source: "paseoStatusDotDanger",
    fallback: ["colorError"],
    kind: "color",
    group: "状态点",
  },
  {
    name: "status-dot-warning",
    source: "paseoStatusDotWarning",
    fallback: ["colorWarning"],
    kind: "color",
    group: "状态点",
  },
  {
    name: "status-dot-running",
    source: "paseoStatusDotRunning",
    fallback: ["colorInfo"],
    kind: "color",
    group: "状态点",
  },
  {
    name: "status-merged",
    source: "paseoStatusMerged",
    fallback: ["colorPrimary"],
    kind: "color",
    group: "状态点",
  },
  {
    name: "selection",
    source: "paseoSelection",
    fallback: ["colorPrimaryBg"],
    kind: "color",
    group: "选区",
  },
  {
    name: "identity-violet",
    source: "paseoIdentityViolet",
    fallback: ["purple6"],
    kind: "color",
    group: "身份色",
  },
  {
    name: "identity-sky",
    source: "paseoIdentitySky",
    fallback: ["cyan6"],
    kind: "color",
    group: "身份色",
  },
  {
    name: "identity-emerald",
    source: "paseoIdentityEmerald",
    fallback: ["green6"],
    kind: "color",
    group: "身份色",
  },
  {
    name: "identity-orange",
    source: "paseoIdentityOrange",
    fallback: ["orange6"],
    kind: "color",
    group: "身份色",
  },
  {
    name: "identity-pink",
    source: "paseoIdentityPink",
    fallback: ["magenta6"],
    kind: "color",
    group: "身份色",
  },
  {
    name: "identity-indigo",
    source: "paseoIdentityIndigo",
    fallback: ["geekblue6"],
    kind: "color",
    group: "身份色",
  },
  {
    name: "identity-teal",
    source: "paseoIdentityTeal",
    fallback: ["cyan6"],
    kind: "color",
    group: "身份色",
  },
  {
    name: "identity-red",
    source: "paseoIdentityRed",
    fallback: ["red6"],
    kind: "color",
    group: "身份色",
  },
  {
    name: "identity-amber",
    source: "paseoIdentityAmber",
    fallback: ["gold6"],
    kind: "color",
    group: "身份色",
  },
  {
    name: "identity-blue",
    source: "paseoIdentityBlue",
    fallback: ["blue6"],
    kind: "color",
    group: "身份色",
  },
  {
    name: "identity-ink",
    source: "paseoIdentityInk",
    fallback: ["colorTextLightSolid"],
    kind: "color",
    group: "身份色",
  },
  { name: "font", source: "fontFamily", themeKey: "--font-sans", kind: "other", group: "字体" },
  { name: "font-mono", source: "fontFamilyCode", themeKey: "--font-mono", kind: "other", group: "字体" },
  { name: "radius-xs", source: "borderRadiusXS", themeKey: "--radius-xs", kind: "other", group: "圆角" },
  { name: "radius-sm", source: "borderRadiusSM", themeKey: "--radius-sm", kind: "other", group: "圆角" },
  { name: "radius-md", source: "borderRadius", themeKey: "--radius-md", kind: "other", group: "圆角" },
  { name: "radius-lg", source: "borderRadiusLG", themeKey: "--radius-lg", kind: "other", group: "圆角" },
];

type DesignToken = ReturnType<typeof antdTheme.getDesignToken>;

function pickValue(tokens: DesignToken, sources: readonly string[]): string | number {
  for (const source of sources) {
    const raw = (tokens as unknown as Record<string, unknown>)[source];
    if (raw !== undefined && raw !== "") return raw as string | number;
  }
  throw new Error(
    `tailwind export: none of ${sources.map((source) => `"${source}"`).join(", ")} exist in the resolved design tokens`,
  );
}

function formatValue(value: string | number): string {
  return typeof value === "number" ? `${value}px` : value;
}

export interface ResolvedTailwindVariables {
  light: Record<string, string>;
  dark: Record<string, string>;
}

export function resolveTailwindVariables(
  themes: TailwindThemePair = DEFAULT_TAILWIND_THEMES,
): ResolvedTailwindVariables {
  const lightTokens = antdTheme.getDesignToken(themes.light);
  const darkTokens = antdTheme.getDesignToken(themes.dark);
  const light: Record<string, string> = {};
  const dark: Record<string, string> = {};
  for (const spec of TAILWIND_VARIABLES) {
    const fallback = spec.fallback ?? [];
    light[spec.name] = formatValue(pickValue(lightTokens, [spec.source, ...fallback]));
    dark[spec.name] = formatValue(
      pickValue(darkTokens, [spec.darkSource ?? spec.source, spec.source, ...fallback]),
    );
  }
  return { light, dark };
}

function declarations(
  values: Record<string, string>,
  indent: string,
): string[] {
  const lines: string[] = [];
  let group = "";
  for (const spec of TAILWIND_VARIABLES) {
    if (spec.group !== group) {
      group = spec.group;
      lines.push(`${indent}/* ${group} */`);
    }
    lines.push(`${indent}--paseo-${spec.name}: ${values[spec.name]};`);
  }
  return lines;
}

const HEADER = `/*
 * 由 scripts/gen-tailwind.ts 生成（npm run gen:tailwind），请勿手改。
 *
 * 默认配对：浅色槽 = Claude Light（:root）；深色槽 = Paseo Dark，同时写在
 * @media (prefers-color-scheme: dark) 与 .dark（类选择器在后，两种同时命中时类胜出）。
 * 换配对时用 paseo-antd-themes/tailwind 的 generateTailwindCss({ light, dark })
 * 重新生成这份 CSS，否则工具类色值和组件主题会对不上。
 *
 * Tailwind v4 用法：在入口 CSS 里
 *   @import "tailwindcss";
 *   @import "paseo-antd-themes/tailwind.css";
 * 之后 bg-primary、text-secondary、border-split、bg-surface-1 等工具类直接可用。
 * 注意 --font-sans 与 --radius-* 覆盖了 Tailwind 的默认刻度（字体用 paseo 的系统栈，圆角对齐 12px 形态）。
 */`;

export function generateTailwindCss(
  themes: TailwindThemePair = DEFAULT_TAILWIND_THEMES,
): string {
  const { light, dark } = resolveTailwindVariables(themes);

  const themeLines: string[] = ["@theme inline {"];
  let group = "";
  for (const spec of TAILWIND_VARIABLES) {
    if (spec.group !== group) {
      group = spec.group;
      themeLines.push(`  /* ${group} */`);
    }
    themeLines.push(
      spec.kind === "color"
        ? `  --color-${spec.name}: var(--paseo-${spec.name});`
        : `  ${spec.themeKey}: var(--paseo-${spec.name});`,
    );
  }
  themeLines.push("}");

  const darkLines = declarations(dark, "    ");
  const css = [
    HEADER,
    "",
    ...themeLines,
    "",
    ":root, :host {",
    ...declarations(light, "  "),
    "}",
    "",
    "@media (prefers-color-scheme: dark) {",
    "  :root, :host {",
    ...darkLines,
    "  }",
    "}",
    "",
    ".dark {",
    ...declarations(dark, "  "),
    "}",
    "",
  ];
  return css.join("\n");
}
