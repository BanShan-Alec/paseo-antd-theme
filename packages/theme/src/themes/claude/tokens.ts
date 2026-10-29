/**
 * Claude light design tokens.
 *
 * Provenance:
 *   surfaces / neutrals — sampled from the claude.ai UI (V4)
 *     page #F0EDE2, card #F5F4EC (1.06 above the page), hover #E4E4D4,
 *     ink #3C3C2C, secondary #55554B, clay #BC5C3C.
 *   clay — #C6613F, the interactive clay used on Claude's site (the brand
 *     palette's #D97757 is its lighter decorative variant). White text on it
 *     is 4.05:1, the theme's one documented contrast exception.
 *   signals — Claude Code's official light TUI theme
 *     success #2C7A39, error #AB2B3F, warning #966C1E, suggestion #5769F7,
 *     diff line fills #69DB7C / #FFA8B4, selection #B4D5FF. The CLI defines
 *     no canvas background (the terminal supplies it), which is why the
 *     surfaces above come from the brand palette instead. One deliberate
 *     departure: links do not take the suggestion blue — they reuse the
 *     primary family's text tone so the whole interface stays clay.
 *
 * The status family deliberately does NOT copy Claude Code's values: this
 * scheme keeps paseo's normalized status rule (one perceived lightness, one
 * chroma fraction, hue carries the meaning), re-solved for a light surface at
 * L*=0.52. Claude Code's own status hues are copied only when they are used
 * as a hue source in the notes above; the final values come from
 * `normalizedLightFamily` so the family stays equal-loudness.
 */

import { maxChroma, normalizedLightFamily, oklchHex } from "../../shared/colors";

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
  surfaceSidebar: "#E2E0D6", // sidebar — one step below the page
  surface0: "#F0EDE2", // main background / layout (Claude.ai cream)
  surface1: "#F5F4EC", // panel / container — paper-on-paper, only 1.06 above the page
  surface2: "#FFFFFF", // elevated / popover
  surfaceHead: "#E0DDD0", // card/table head — clearly reads on the card (1.24), above hover (1.08)
  surfaceHover: "#DDD9CE", // hover step on cards — same hue as the page (1.28 vs card)
  surface3: "#D7D2C7", // one step darker: segmented hover (antd default) + menu hover
  surface4: "#D1CCBF", // strongest fill / menu selected

  foreground: "#3C3C2C", // warm ink (9.6:1 on the page)
  foregroundMuted: "#55554B", // warm gray (6.4:1) — kept a clear step above tier 3
  foregroundExtraMuted: "#65635E", // 5.1:1
  foregroundFaint: "#98978F", // placeholder/disabled only (2.5:1)

  border: "#DBD9D0",
  borderAccent: "#E8E6DF",

  accent: "#BA5B37", // clay sampled from claude.ai, one step deeper (white label 4.53:1 — clears 4.5)
  accentText: "#A34E2D", // clay darkened for text (4.86:1 on the page); also drives links

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
  selection: "rgba(186, 91, 55, 0.32)",
} as const;

/** The full status families (bg/border/hover/text slots) for the theme layer. */
export const claudeLightStatusFamilies = status;

/**
 * Ten host identity hues, re-normalized at L*=0.55 / 55% chroma so the ink
 * below stays in the 4.7–5.2:1 band. Hues are paseo's identity hues; only
 * lightness/chroma are re-solved for a light surface.
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

/**
 * The letter color that pairs with every identity fill. The light fills are
 * dark enough for white (4.72–5.19:1); the dark scheme's pastels are not
 * (2.6:1), which is why each scheme ships its own ink instead of one
 * "identity always takes white" rule.
 */
export const claudeIdentityInk = "#FFFFFF" as const;
