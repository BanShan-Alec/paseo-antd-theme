import type { ThemeConfig } from "antd";
import { theme as antdTheme } from "antd";
import { PASEO_FONT_STACK } from "./fonts";

/** `ThemeConfig["token"]` minus the `undefined` — antd does not export `AliasToken` itself. */
export type AntdToken = NonNullable<ThemeConfig["token"]>;
export type AntdComponents = NonNullable<ThemeConfig["components"]>;

export interface TokenMapping {
  /** antd v6 token name. Typed against antd's own token union, so typos fail the build. */
  readonly antdToken: keyof AntdToken;
  /** `seed` feeds the theme algorithm; `map` replaces a value the algorithm derived. */
  readonly kind: "seed" | "map";
  readonly value: string | number;
  /** Source token in paseo, for traceability. */
  readonly paseoToken: string;
  /** Rationale, recorded where the mapping is a judgement call rather than a rename. */
  readonly note?: string;
}

export interface DerivedToken {
  readonly antdToken: string;
  /** The token antd derives this from. We control that one, so we never set this. */
  readonly derivedFrom: string;
}

export type FamilyPrefix =
  | "colorPrimary"
  | "colorSuccess"
  | "colorWarning"
  | "colorError"
  | "colorInfo";

/**
 * The ten slots a color family needs, regardless of how they were derived
 * (antd's dark ramp or the OKLCH light solver). Hue-independent by design.
 */
export interface ColorFamilySlots {
  readonly base: string;
  readonly bg: string;
  readonly bgHover: string;
  readonly border: string;
  readonly borderHover: string;
  readonly hover: string;
  readonly active: string;
  readonly text: string;
  readonly textHover: string;
  readonly textActive: string;
}

export function familyTokens(prefix: FamilyPrefix, palette: ColorFamilySlots): AntdToken {
  return {
    [`${prefix}`]: palette.base,
    [`${prefix}Hover`]: palette.hover,
    [`${prefix}Active`]: palette.active,
    [`${prefix}Bg`]: palette.bg,
    [`${prefix}BgHover`]: palette.bgHover,
    [`${prefix}Border`]: palette.border,
    [`${prefix}BorderHover`]: palette.borderHover,
    [`${prefix}Text`]: palette.text,
    [`${prefix}TextHover`]: palette.textHover,
    [`${prefix}TextActive`]: palette.textActive,
  } as AntdToken;
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * paseo concepts antd has no slot for. `surfaceHead` / `surfaceHover` exist
 * only in the Claude light scheme (paper-on-paper hierarchy); the dark scheme
 * carries its hierarchy in the surface ladder alone.
 */
export interface PaseoExtrasInput {
  surface0: string;
  surface1: string;
  surface2: string;
  surface3: string;
  surface4: string;
  surfaceSidebar: string;
  surfaceHead?: string;
  surfaceHover?: string;
  diffAddition: string;
  diffDeletion: string;
  diffAdditionText: string;
  diffDeletionText: string;
  statusDotSuccess: string;
  statusDotDanger: string;
  statusDotWarning: string;
  statusDotRunning: string;
  statusMerged: string;
  selection: string;
  identity: Record<string, string>;
}

/**
 * Custom tokens antd passes through the token pipeline verbatim — exposed via
 * useToken() and emitted as CSS variables, so consumers keep one source of
 * truth.
 */
export function extras(values: PaseoExtrasInput): AntdToken {
  return {
    ...(values.surfaceHead !== undefined ? { paseoSurfaceHead: values.surfaceHead } : {}),
    ...(values.surfaceHover !== undefined ? { paseoSurfaceHover: values.surfaceHover } : {}),
    paseoSurface0: values.surface0,
    paseoSurface1: values.surface1,
    paseoSurface2: values.surface2,
    paseoSurface3: values.surface3,
    paseoSurface4: values.surface4,
    paseoSurfaceSidebar: values.surfaceSidebar,
    paseoDiffAddition: values.diffAddition,
    paseoDiffDeletion: values.diffDeletion,
    paseoDiffAdditionText: values.diffAdditionText,
    paseoDiffDeletionText: values.diffDeletionText,
    paseoStatusDotSuccess: values.statusDotSuccess,
    paseoStatusDotDanger: values.statusDotDanger,
    paseoStatusDotWarning: values.statusDotWarning,
    paseoStatusDotRunning: values.statusDotRunning,
    paseoStatusMerged: values.statusMerged,
    paseoSelection: values.selection,
    ...Object.fromEntries(
      Object.entries(values.identity).map(([name, value]) => [
        `paseoIdentity${capitalize(name)}`,
        value,
      ]),
    ),
  } as unknown as AntdToken;
}

export function buildToken(mappings: readonly TokenMapping[], extra: AntdToken): AntdToken {
  const token = Object.fromEntries(mappings.map((row) => [row.antdToken, row.value])) as AntdToken;
  return { ...token, ...extra };
}

/**
 * antd's own algorithms with a single shared delta: `fontFamily` is pinned to
 * the same stack the built-in themes use. antd's default stack
 * (`-apple-system, …`) resolves to Segoe UI on Windows while `system-ui`
 * resolves to a ~7% wider system font, so without the pin every content-sized
 * element (buttons, tags, segmented, menu items) shifts by a few pixels when a
 * stock slot is mixed with a Paseo slot. Everything else — colors, sizes,
 * radii, components — stays antd's default.
 */
export const lightFontAlgorithm: typeof antdTheme.defaultAlgorithm = (seed) =>
  ({
    ...antdTheme.defaultAlgorithm(seed),
    fontFamily: PASEO_FONT_STACK,
  }) as ReturnType<typeof antdTheme.defaultAlgorithm>;

export const darkFontAlgorithm: typeof antdTheme.darkAlgorithm = (seed) =>
  ({
    ...antdTheme.darkAlgorithm(seed),
    fontFamily: PASEO_FONT_STACK,
  }) as ReturnType<typeof antdTheme.darkAlgorithm>;
