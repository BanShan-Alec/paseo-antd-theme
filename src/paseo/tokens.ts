/**
 * Paseo design tokens (minimal scheme), copied verbatim from the paseo
 * monorepo (https://github.com/getpaseo/paseo) so this integration has no
 * dependency on React Native. Provenance:
 *   surfaces / accents / status — packages/app/src/styles/theme.ts:460-477
 *     (paseoDarkColors, "Paseo — subtle teal-green tint (default)")
 *   fonts — packages/app/src/styles/theme.ts:635-645
 *
 * Only the values the minimal scheme configures are kept; the full-fidelity
 * version (component tokens, custom tokens, the whole surface ladder) lives
 * in ../paseo-full/.
 */

export const paseoDark = {
  surface0: "#181B1A", // main background → colorBgLayout
  surface1: "#1E2120", // panel → colorBgContainer
  surface2: "#272A29", // elevated / popover → colorBgElevated

  foreground: "#fafafa",

  accent: "#20744A",
  accentBright: "#7ccba0",

  statusSuccess: "#6cb17b",
  statusDanger: "#d8847b",
  statusWarning: "#c09664",
  statusDotRunning: "#5caaf6",
} as const;

/** Platform default font stacks (theme.ts:635-645, web branch). */
export const PASEO_FONT_STACK =
  "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
export const PASEO_MONO_FONT_STACK =
  "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
