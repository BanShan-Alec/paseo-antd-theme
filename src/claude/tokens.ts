/**
 * Claude light design tokens.
 *
 * Provenance:
 *   surfaces / neutrals / clay — Anthropic brand palette
 *     ivory #FAF9F5, warm gray 150 #F0EEE6, warm gray 250 #DEDCD1,
 *     ink #141413, clay #D97757, oat #E3DACC.
 *   signals — Claude Code's official light TUI theme
 *     success #2C7A39, error #AB2B3F, warning #966C1E, suggestion #5769F7,
 *     diff line fills #69DB7C / #FFA8B4, selection #B4D5FF. The CLI defines
 *     no canvas background (the terminal supplies it), which is why the
 *     surfaces above come from the brand palette instead.
 *
 * The status family deliberately does NOT copy Claude Code's values: this
 * scheme keeps paseo's normalized status rule (one perceived lightness, one
 * chroma fraction, hue carries the meaning), re-solved for a light surface at
 * L*=0.52. Claude Code's own status hues are copied only when they are used
 * as a hue source in the notes above; the final values come from
 * `normalizedLightFamily` so the family stays equal-loudness.
 */

import { maxChroma, normalizedLightFamily, oklchHex } from "./colors";
import { PASEO_FONT_STACK, PASEO_MONO_FONT_STACK } from "../paseo-full/tokens";

/** Paseo's status hues (OKLCH degrees) — only the hue is borrowed. */
export const CLAUDE_LIGHT_STATUS_HUES = {
  success: 149.9,
  danger: 26.6,
  warning: 70.6,
  merged: 299.8,
  running: 249.7,
} as const;

const status = {
  success: normalizedLightFamily(CLAUDE_LIGHT_STATUS_HUES.success),
  danger: normalizedLightFamily(CLAUDE_LIGHT_STATUS_HUES.danger),
  warning: normalizedLightFamily(CLAUDE_LIGHT_STATUS_HUES.warning),
  merged: normalizedLightFamily(CLAUDE_LIGHT_STATUS_HUES.merged),
  running: normalizedLightFamily(CLAUDE_LIGHT_STATUS_HUES.running),
} as const;

/** A diff line fill is a background, so it sits far above the text band. */
function diffFill(hue: number): string {
  return oklchHex(0.92, maxChroma(0.92, hue) * 0.55, hue);
}

export const claudeLight = {
  surfaceSidebar: "#E9E6DC", // sidebar — one step below the page
  surface0: "#F0EEE6", // main background / layout
  surface1: "#FAF9F5", // panel / container
  surface2: "#FFFFFF", // elevated / popover
  surface3: "#E3DACC", // strong fill (oat)
  surface4: "#D5D1C3", // strongest fill

  foreground: "#141413",
  foregroundMuted: "#66645C",
  foregroundExtraMuted: "#6E6C64",
  foregroundFaint: "#A8A498",

  border: "#DEDCD1",
  borderAccent: "#E7E4DA",

  accent: "#D97757", // clay — fills
  accentText: "#A94F33", // clay darkened for text (5.17:1 on ivory)
  link: "#4B5BD8", // Claude suggestion hue, darkened from #5769F7
  linkHover: "#3640B3",
  linkActive: "#23288C",

  statusSuccess: status.success.base,
  statusDanger: status.danger.base,
  statusWarning: status.warning.base,
  statusMerged: status.merged.base,
  statusRunning: status.running.base,

  // Diff line fills are derived from the same status hues at L*=0.92.
  diffAddition: diffFill(CLAUDE_LIGHT_STATUS_HUES.success),
  diffDeletion: diffFill(CLAUDE_LIGHT_STATUS_HUES.danger),

  // ::selection — clay tint instead of paseo's white overlay, which is
  // invisible on a light surface.
  selection: "rgba(217, 119, 87, 0.32)",
} as const;

/** The full status families (bg/border/hover/text slots) for the theme layer. */
export const claudeLightStatusFamilies = status;

/**
 * Ten host identity hues, re-normalized at L*=0.55 / 55% chroma so a white
 * letter on top stays in the 4.7–5.2:1 band. Hues are paseo's identity hues;
 * only lightness/chroma are re-solved for a light surface.
 */
export const claudeIdentityLight = {
  violet: normalizedLightFamily(295.4, 0.55).base,
  sky: normalizedLightFamily(238.9, 0.55).base,
  emerald: normalizedLightFamily(169.0, 0.55).base,
  orange: normalizedLightFamily(55.7, 0.55).base,
  pink: normalizedLightFamily(354.2, 0.55).base,
  indigo: normalizedLightFamily(278.7, 0.55).base,
  teal: normalizedLightFamily(194.5, 0.55).base,
  red: normalizedLightFamily(21.5, 0.55).base,
  amber: normalizedLightFamily(90.0, 0.55).base,
  blue: normalizedLightFamily(256.4, 0.55).base,
} as const;

/** Shared with the paseo schemes so switching cannot shift type metrics. */
export const CLAUDE_FONT_STACK = PASEO_FONT_STACK;
export const CLAUDE_MONO_FONT_STACK = PASEO_MONO_FONT_STACK;
