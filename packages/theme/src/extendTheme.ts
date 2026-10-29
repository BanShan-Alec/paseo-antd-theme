import { theme as antdTheme, type MappingAlgorithm, type ThemeConfig } from "antd";
import { darkFamily, hexLuminance, lightFamilyFromBase } from "./shared/colors";
import {
  familyTokens,
  type AntdComponents,
  type AntdToken,
  type FamilyPrefix,
} from "./shared/theme";

/**
 * An extension never replaces the base algorithm — it is appended as a final
 * derivative step. That matters because the built-in themes pin their token
 * palettes *inside* the algorithm (antd v6 strips seed tokens from
 * `theme.token`, and its derivation runs before any override lands), so a
 * nested `ConfigProvider theme={{ token: { colorPrimary } }}` on top of either
 * built-in theme is silently ignored. Returning the overrides from a later
 * derivative is the only place they survive.
 */
export type ThemeExtension = Omit<ThemeConfig, "algorithm">;

const FAMILY_PREFIXES: readonly FamilyPrefix[] = [
  "colorPrimary",
  "colorSuccess",
  "colorWarning",
  "colorError",
  "colorInfo",
];

const schemes = new WeakMap<ThemeConfig, "light" | "dark">();

/**
 * antd exposes no "is this theme dark?" flag, so ask the resolved tokens. The
 * base background is a seed token in every theme we ship, which keeps this
 * independent of the algorithm identity (`extendTheme` has to work on themes it
 * did not build).
 */
function resolveScheme(theme: ThemeConfig): "light" | "dark" {
  const cached = schemes.get(theme);
  if (cached) return cached;
  const background = String(antdTheme.getDesignToken(theme).colorBgBase);
  let scheme: "light" | "dark";
  try {
    scheme = hexLuminance(background) < 0.5 ? "dark" : "light";
  } catch {
    throw new Error(
      `extendTheme: cannot detect the base scheme — colorBgBase resolved to "${background}", which is not a hex color. Pass a theme that sets colorBgBase as hex.`,
    );
  }
  schemes.set(theme, scheme);
  return scheme;
}

function mergeComponents(
  base: AntdComponents | undefined,
  extension: AntdComponents | undefined,
): AntdComponents | undefined {
  if (!base && !extension) return undefined;
  const merged = { ...base } as Record<string, Record<string, unknown>>;
  for (const [name, tokens] of Object.entries(
    (extension ?? {}) as Record<string, Record<string, unknown>>,
  )) {
    merged[name] = { ...merged[name], ...tokens };
  }
  return merged as AntdComponents;
}

/**
 * Derives a new theme from `base` without replacing it.
 *
 * - Overriding a color-family base (`colorPrimary`, `colorSuccess`,
 *   `colorWarning`, `colorError`, `colorInfo`) rebuilds that family's ten
 *   slots from the new hex — the dark ramp `generate(…, "dark")` in a dark
 *   scheme, the OKLCH ladder anchored at the new color in a light one. Hover,
 *   active, background, border and text slots follow instead of staying on the
 *   base theme's hue.
 * - Any other token is applied verbatim, including seed tokens that antd would
 *   otherwise strip.
 * - Component tokens merge per component, so `Button.primaryShadow` survives
 *   an extension that only changes `Button.primaryColor`.
 *
 * The base theme object is never mutated.
 */
export function extendTheme(base: ThemeConfig, extension: ThemeExtension = {}): ThemeConfig {
  const scheme = resolveScheme(base);

  const familySlots: AntdToken = {};
  for (const prefix of FAMILY_PREFIXES) {
    const baseColor = extension.token?.[prefix];
    if (typeof baseColor !== "string" || baseColor.length === 0) continue;
    const palette = scheme === "dark" ? darkFamily(baseColor) : lightFamilyFromBase(baseColor);
    Object.assign(familySlots, familyTokens(prefix, palette));
  }

  const overlay: MappingAlgorithm = (_seed, mapToken) =>
    ({
      ...mapToken,
      ...familySlots,
      ...extension.token,
    }) as ReturnType<MappingAlgorithm>;

  const baseAlgorithms: MappingAlgorithm[] = Array.isArray(base.algorithm)
    ? [...base.algorithm]
    : base.algorithm
      ? [base.algorithm as MappingAlgorithm]
      : [antdTheme.defaultAlgorithm];

  return {
    ...base,
    ...extension,
    algorithm: [...baseAlgorithms, overlay],
    token: { ...base.token, ...extension.token },
    components: mergeComponents(base.components, extension.components),
  };
}
