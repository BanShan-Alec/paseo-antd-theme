import { generate } from "@ant-design/colors";
import type { ThemeConfig } from "antd";
import { theme as antdTheme } from "antd";
import { PASEO_FONT_STACK, PASEO_MONO_FONT_STACK, paseoDark } from "./tokens";

export type PaseoColorScheme = "light" | "dark";

/** `ThemeConfig["token"]` minus the `undefined` — antd does not export `AliasToken` itself. */
type AntdToken = NonNullable<ThemeConfig["token"]>;

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

// ---------------------------------------------------------------------------
// Minimal scheme — five color families plus three backgrounds
//
// Why an algorithm wrapper at all: antd v6's formatToken deletes every seed
// token from a user's `theme.token` override, and its dark algorithm
// re-derives each color family into its own darkened ramp (#20744A would
// come back as #1e6642). Pinning through the wrapper's return value is the
// only way the exact paseo hexes survive. Everything not listed below is
// left to antd's derivation — which, seeded with paseo's bases, already
// lands close to paseo's neutral ramp.
// ---------------------------------------------------------------------------

interface DarkPalette {
  readonly raw: readonly string[];
  readonly base: string;
  readonly bg: string;
  readonly bgHover: string;
  readonly border: string;
  readonly borderHover: string;
  readonly hover: string;
  readonly active: string;
}

/**
 * Rebuilds antd's dark palette mapping (themes/dark/colors.js) around
 * paseo's exact hex instead of the darkened hex antd would put in the base
 * slot, so hover/active/bg stay coherent with the pinned base.
 */
function darkPalette(base: string): DarkPalette {
  const raw = generate(base, { theme: "dark" });
  return {
    raw,
    base,
    bg: raw[0],
    bgHover: raw[1],
    border: raw[2],
    borderHover: raw[3],
    hover: raw[6],
    active: raw[4],
  };
}

type FamilyPrefix = "colorPrimary" | "colorSuccess" | "colorWarning" | "colorError" | "colorInfo";

function familyTokens(prefix: FamilyPrefix, palette: DarkPalette): AntdToken {
  return {
    [`${prefix}`]: palette.base,
    [`${prefix}Hover`]: palette.hover,
    [`${prefix}Active`]: palette.active,
    [`${prefix}Bg`]: palette.bg,
    [`${prefix}BgHover`]: palette.bgHover,
    [`${prefix}Border`]: palette.border,
    [`${prefix}BorderHover`]: palette.borderHover,
  } as AntdToken;
}

const primary = darkPalette(paseoDark.accent);

const pinnedDarkColors: AntdToken = {
  ...familyTokens("colorPrimary", primary),
  ...familyTokens("colorSuccess", darkPalette(paseoDark.statusSuccess)),
  ...familyTokens("colorWarning", darkPalette(paseoDark.statusWarning)),
  ...familyTokens("colorError", darkPalette(paseoDark.statusDanger)),
  ...familyTokens("colorInfo", darkPalette(paseoDark.statusDotRunning)),
  // Links take accentBright: the deep accent is ~2.4:1 on the dark background.
  colorLink: paseoDark.accentBright,
  colorLinkHover: darkPalette(paseoDark.accentBright).raw[8],
  colorLinkActive: darkPalette(paseoDark.accentBright).raw[7],
};

/** Pins paseo's exact hexes; the rest of the derivative is antd's own. */
const paseoDarkAlgorithm: typeof antdTheme.darkAlgorithm = (seed, mapToken) =>
  ({
    ...antdTheme.darkAlgorithm(seed, mapToken),
    ...pinnedDarkColors,
    // antd's dark algorithm lifts the primary background to the border slot
    // for selected states; keep that behaviour on the pinned ramp.
    colorPrimaryBg: primary.border,
    colorPrimaryBgHover: primary.borderHover,
    fontFamily: PASEO_FONT_STACK,
    fontFamilyCode: PASEO_MONO_FONT_STACK,
  }) as ReturnType<typeof antdTheme.darkAlgorithm>;

// ---------------------------------------------------------------------------
// Tokens: the seeds that keep derivation in-family, plus the three
// backgrounds whose visual hierarchy (layout < container < elevated) antd
// would otherwise derive as flat neutral grays.
// ---------------------------------------------------------------------------

const darkMappings: readonly TokenMapping[] = [
  { antdToken: "colorPrimary", kind: "seed", value: paseoDark.accent, paseoToken: "accent" },
  {
    antdToken: "colorSuccess",
    kind: "seed",
    value: paseoDark.statusSuccess,
    paseoToken: "statusSuccess",
  },
  {
    antdToken: "colorWarning",
    kind: "seed",
    value: paseoDark.statusWarning,
    paseoToken: "statusWarning",
  },
  {
    antdToken: "colorError",
    kind: "seed",
    value: paseoDark.statusDanger,
    paseoToken: "statusDanger",
  },
  {
    antdToken: "colorInfo",
    kind: "seed",
    value: paseoDark.statusDotRunning,
    paseoToken: "statusDotRunning",
    note: "paseo has no info color; its 'running' blue is the only informational hue.",
  },
  { antdToken: "colorTextBase", kind: "seed", value: paseoDark.foreground, paseoToken: "foreground" },
  { antdToken: "colorBgBase", kind: "seed", value: paseoDark.surface0, paseoToken: "surface0" },
  {
    antdToken: "colorLink",
    kind: "seed",
    value: paseoDark.accentBright,
    paseoToken: "accentBright",
    note: "Pinned to accentBright by the wrapped algorithm; the seed keeps derivation in-family.",
  },
  {
    antdToken: "fontFamily",
    kind: "seed",
    value: PASEO_FONT_STACK,
    paseoToken: "fontFamily.ui",
  },
  {
    antdToken: "fontFamilyCode",
    kind: "seed",
    value: PASEO_MONO_FONT_STACK,
    paseoToken: "fontFamily.mono",
  },
  { antdToken: "colorBgLayout", kind: "map", value: paseoDark.surface0, paseoToken: "surface0" },
  {
    antdToken: "colorBgContainer",
    kind: "map",
    value: paseoDark.surface1,
    paseoToken: "surface1",
    note: "Default buttons, inputs, cards.",
  },
  {
    antdToken: "colorBgElevated",
    kind: "map",
    value: paseoDark.surface2,
    paseoToken: "surface2",
    note: "Popovers, dropdowns, modals.",
  },
];

// ---------------------------------------------------------------------------
// Light mode is antd's stock theme with one exception: the font stack is
// pinned to the same stack the dark theme uses. antd's default stack
// (`-apple-system, …`) resolves to Segoe UI on Windows while `system-ui`
// resolves to a ~7% wider system font, so without the pin every
// content-sized element shifts when switching schemes.
// ---------------------------------------------------------------------------

const lightFontAlgorithm: typeof antdTheme.defaultAlgorithm = (seed) =>
  ({
    ...antdTheme.defaultAlgorithm(seed),
    fontFamily: PASEO_FONT_STACK,
  }) as ReturnType<typeof antdTheme.defaultAlgorithm>;

export const antdDefaultLightTheme: ThemeConfig = {
  algorithm: lightFontAlgorithm,
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function buildToken(mappings: readonly TokenMapping[]): AntdToken {
  return Object.fromEntries(mappings.map((row) => [row.antdToken, row.value])) as AntdToken;
}

/** The paseo dark theme (minimal scheme) as an antd v6 `ThemeConfig`. */
export const paseoDarkTheme: ThemeConfig = {
  algorithm: paseoDarkAlgorithm,
  token: buildToken(darkMappings),
};

/** Dark → paseo (minimal), light → antd's default theme with the shared font stack. */
export function paseoTheme(scheme: PaseoColorScheme): ThemeConfig {
  return scheme === "light" ? antdDefaultLightTheme : paseoDarkTheme;
}

/** The full mapping, for docs, swatch panels and tests. */
export const PASEO_DARK_TOKEN_MAPPING: readonly TokenMapping[] = darkMappings;
