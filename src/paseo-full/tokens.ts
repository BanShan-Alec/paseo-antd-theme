/**
 * Paseo design tokens, copied verbatim from the paseo monorepo
 * (https://github.com/getpaseo/paseo) so this integration has no dependency
 * on React Native. Provenance:
 *   dark surfaces / accents / status — packages/app/src/styles/theme.ts:460-477
 *     (paseoDarkColors, "Paseo — subtle teal-green tint (default)")
 *   status dots  — packages/app/src/styles/theme.ts:204-218
 *   identity     — packages/app/src/styles/identity-colors.ts:74-86
 *   fonts        — packages/app/src/styles/theme.ts:635-645
 */

/** Dark theme ("Paseo") — the default dark scheme. Light mode is antd's stock theme. */
export const paseoDark = {
  surface0: "#181B1A", // main background
  surface1: "#1E2120", // panel
  surface2: "#272A29", // elevated / popover / selected
  surface3: "#434645", // strongest fill
  surface4: "#595B5B", // active fill
  surfaceSidebar: "#141716",

  foreground: "#fafafa",
  foregroundMuted: "#A1A5A4",
  foregroundExtraMuted: "#717574",

  border: "#252B2A",
  borderAccent: "#2F3534",

  accent: "#20744A",
  accentBright: "#7ccba0",
  destructive: "#c64f43",

  // Status family — one lightness (L=0.70) and one chroma fraction (55% of
  // gamut max) across all four hues; only the hue changes.
  statusSuccess: "#6cb17b",
  statusDanger: "#d8847b",
  statusWarning: "#c09664",
  statusMerged: "#a890d5",

  statusDotSuccess: "#35c264",
  statusDotDanger: "#f7796d",
  statusDotWarning: "#db932e",
  statusDotRunning: "#5caaf6",

  // Diff stays saturated: the color *is* the signal when scanning line by line.
  diffAddition: "#4ade80",
  diffDeletion: "#ef4444",

  // ::selection background (matches the theme's terminal selection).
  selection: "rgba(255, 255, 255, 0.2)",
} as const;

/**
 * Host identity colors — ten hues, all held to one contrast band against the
 * white letter on top (4.2–4.8:1) so the color identifies rather than ranks.
 */
export const paseoIdentityDark = {
  violet: "#a392d5",
  sky: "#6aa6ce",
  emerald: "#6cae96",
  orange: "#cc8f64",
  pink: "#d87da3",
  indigo: "#9299d5",
  teal: "#6cacab",
  red: "#d88381",
  amber: "#b29d64",
  blue: "#7ba1d5",
} as const;

/** Platform default font stacks (theme.ts:635-645, web branch). */
export const PASEO_FONT_STACK =
  "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
export const PASEO_MONO_FONT_STACK =
  "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
