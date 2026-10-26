import type { ThemeConfig } from "antd";
import { theme as antdTheme } from "antd";
import {
  buildToken,
  extras,
  familyTokens,
  type AntdComponents,
  type AntdToken,
  type DerivedToken,
  type TokenMapping,
} from "../../shared/theme";
import { darkFamily } from "../../shared/colors";
import { PASEO_FONT_STACK, PASEO_MONO_FONT_STACK } from "../../shared/fonts";
import { paseoDark, paseoIdentityDark } from "./tokens";

// ---------------------------------------------------------------------------
// Pinned color families
//
// antd v6 deletes every *seed* token from a user's `theme.token` override
// (formatToken in antd/lib/theme/util/alias.js strips all defaultSeed keys),
// and its dark algorithm re-derives each color family from the seed into its
// own darkened ramp. Two consequences shape this file:
//
//   1. The exact paseo hexes cannot be pinned through `token` — they are
//      pinned by wrapping the algorithm, whose output lands *after* the seed
//      stripping.
//   2. Alias tokens (colorSplit, colorTextPlaceholder, controlOutline, …) are
//      recomputed last, from tokens we do control. They are documented below
//      rather than set — overriding them would be silently discarded.
//
// Pinning matters here more than usual: paseo's status family is normalized
// (one lightness, one chroma fraction, hue varies), and pushing it through
// antd's per-color dark adjustment would break exactly that relationship.
// ---------------------------------------------------------------------------

const primary = darkFamily(paseoDark.accent);
const primaryBright = darkFamily(paseoDark.accentBright);

// Claude.ai's soft elevation, black-tinted for the dark scheme. The original
// paseo chrome was flat; Q14 syncs the full dark scheme to the same form
// language as the Claude light scheme. Alphas stay low: the dark surface
// ladder (#181B1A / #1E2120 / #272A29) already carries the hierarchy, so the
// shadow only needs to hint at material.
const DARK_SHADOW = {
  base: "0 1px 2px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.16)",
  secondary: "0 4px 10px rgba(0, 0, 0, 0.18), 0 1px 3px rgba(0, 0, 0, 0.10)",
  tertiary: "0 1px 2px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.10)",
  buttonDefault: "0 1px 2px rgba(0, 0, 0, 0.10)",
  buttonPrimary: "0 1px 2px rgba(0, 0, 0, 0.14)",
  buttonDanger: "0 1px 2px rgba(0, 0, 0, 0.14)",
} as const;

const pinnedDarkColors: AntdToken = {
  ...familyTokens("colorPrimary", primary),
  // Primary-colored *text* on a dark surface takes paseo's bright accent —
  // the same substitution paseo itself makes wherever the deep accent would
  // be unreadable.
  colorPrimaryText: paseoDark.accentBright,
  colorPrimaryTextHover: primaryBright.raw[9],
  colorPrimaryTextActive: primaryBright.raw[7],
  ...familyTokens("colorSuccess", darkFamily(paseoDark.statusSuccess)),
  ...familyTokens("colorWarning", darkFamily(paseoDark.statusWarning)),
  ...familyTokens("colorError", darkFamily(paseoDark.statusDanger)),
  ...familyTokens("colorInfo", darkFamily(paseoDark.statusDotRunning)),
  // Links: the deep accent is ~2.4:1 on the dark background, so links take
  // accentBright (4.5:1+) — the same call paseo's own design makes.
  colorLink: paseoDark.accentBright,
  colorLinkHover: primaryBright.raw[8],
  colorLinkActive: primaryBright.raw[7],
};

/**
 * The dark algorithm wrapped so paseo's exact hexes survive: its return value
 * lands after the seed stripping in formatToken.
 */
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
// Dark token mappings
// ---------------------------------------------------------------------------

const darkMappings: readonly TokenMapping[] = [
  // Seeds — these reach the algorithm (they are stripped from the override
  // merge) and drive everything not explicitly pinned above.
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
    note: "paseo has no info color; its 'running' blue is the only informational hue in the system.",
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
  { antdToken: "fontSize", kind: "seed", value: 14, paseoToken: "fontSize.base" },
  { antdToken: "borderRadius", kind: "seed", value: 12, paseoToken: "borderRadius.lg" },
  { antdToken: "sizeUnit", kind: "seed", value: 4, paseoToken: "spacing.1" },
  { antdToken: "sizeStep", kind: "seed", value: 4, paseoToken: "spacing.1" },
  { antdToken: "controlHeight", kind: "seed", value: 40, paseoToken: "—" },
  { antdToken: "lineWidth", kind: "seed", value: 1, paseoToken: "borderWidth.1" },

  // Map tokens — paseo's surface ladder, mapped so the visual hierarchy
  // (layout < container < elevated) matches the app instead of antd's
  // neutral gray derivation.
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
  {
    antdToken: "colorBgSpotlight",
    kind: "map",
    value: paseoDark.surface2,
    paseoToken: "surface2",
    note: "Tooltip background.",
  },
  {
    antdToken: "colorBgMask",
    kind: "map",
    value: "rgba(0, 0, 0, 0.65)",
    paseoToken: "—",
    note: "paseo defines no mask; matched to its overlay darkness.",
  },

  // Text ladder — paseo's three foreground levels; the fourth level borrows
  // surface4 so disabled/placeholder text sits inside the same neutral ramp.
  { antdToken: "colorText", kind: "map", value: paseoDark.foreground, paseoToken: "foreground" },
  {
    antdToken: "colorTextSecondary",
    kind: "map",
    value: paseoDark.foregroundMuted,
    paseoToken: "foregroundMuted",
  },
  {
    antdToken: "colorTextTertiary",
    kind: "map",
    value: paseoDark.foregroundExtraMuted,
    paseoToken: "foregroundExtraMuted",
  },
  { antdToken: "colorTextQuaternary", kind: "map", value: paseoDark.surface4, paseoToken: "surface4" },

  // Borders and fills — paseo's border pair, then the surface ladder inverted
  // into antd's fill ramp (colorFill is the strongest, quaternary the weakest).
  { antdToken: "colorBorder", kind: "map", value: paseoDark.border, paseoToken: "border" },
  {
    antdToken: "colorBorderSecondary",
    kind: "map",
    value: paseoDark.borderAccent,
    paseoToken: "borderAccent",
  },
  { antdToken: "colorFill", kind: "map", value: paseoDark.surface3, paseoToken: "surface3" },
  { antdToken: "colorFillSecondary", kind: "map", value: paseoDark.surface2, paseoToken: "surface2" },
  {
    antdToken: "colorFillTertiary",
    kind: "map",
    value: paseoDark.surface1,
    paseoToken: "surface1",
    note: "Also feeds controlItemBgHover — paseo's sidebar hover step.",
  },
  {
    antdToken: "colorFillQuaternary",
    kind: "map",
    value: paseoDark.border,
    paseoToken: "border",
    note: "Zebra stripes and disabled outlines sit at hairline weight.",
  },

  // Size ladder — paseo's spacing scale is already antd's (4-based), but the
  // control/type/radius scale follows the Claude.ai form language (Q13/Q14):
  // 40px controls, 16px body, 12px radius. Spacing stays on the 4px grid.
  { antdToken: "controlHeightSM", kind: "map", value: 32, paseoToken: "spacing.8" },
  { antdToken: "controlHeightLG", kind: "map", value: 48, paseoToken: "spacing.12" },
  { antdToken: "fontSizeSM", kind: "map", value: 12, paseoToken: "fontSize.sm" },
  { antdToken: "fontSizeLG", kind: "map", value: 16, paseoToken: "fontSize.lg" },
  { antdToken: "borderRadiusSM", kind: "map", value: 8, paseoToken: "borderRadius.base" },
  { antdToken: "borderRadiusLG", kind: "map", value: 12, paseoToken: "borderRadius.lg" },
  { antdToken: "borderRadiusXS", kind: "map", value: 4, paseoToken: "borderRadius.sm" },
  { antdToken: "padding", kind: "map", value: 16, paseoToken: "spacing.4" },
  { antdToken: "paddingSM", kind: "map", value: 12, paseoToken: "spacing.3" },
  { antdToken: "paddingXS", kind: "map", value: 8, paseoToken: "spacing.2" },
  { antdToken: "paddingXXS", kind: "map", value: 4, paseoToken: "spacing.1" },
  { antdToken: "paddingLG", kind: "map", value: 24, paseoToken: "spacing.6" },
  { antdToken: "margin", kind: "map", value: 16, paseoToken: "spacing.4" },
  { antdToken: "marginSM", kind: "map", value: 12, paseoToken: "spacing.3" },
  { antdToken: "marginXS", kind: "map", value: 8, paseoToken: "spacing.2" },
  { antdToken: "marginXXS", kind: "map", value: 4, paseoToken: "spacing.1" },
  { antdToken: "marginLG", kind: "map", value: 24, paseoToken: "spacing.6" },

  // Elevation — soft and black-tinted, so popovers separate from the surface
  // ladder by shadow rather than by a lighter fill.
  { antdToken: "boxShadow", kind: "map", value: DARK_SHADOW.base, paseoToken: "—" },
  {
    antdToken: "boxShadowSecondary",
    kind: "map",
    value: DARK_SHADOW.secondary,
    paseoToken: "—",
  },
  {
    antdToken: "boxShadowTertiary",
    kind: "map",
    value: DARK_SHADOW.tertiary,
    paseoToken: "—",
  },
];

/** Tokens antd derives last, from tokens this integration controls. Never set them. */
const darkDerivedTokens: readonly DerivedToken[] = [
  { antdToken: "colorSplit", derivedFrom: "colorBorderSecondary over colorBgContainer" },
  { antdToken: "colorTextPlaceholder", derivedFrom: "colorTextQuaternary" },
  { antdToken: "colorTextDisabled", derivedFrom: "colorTextQuaternary" },
  { antdToken: "colorFillContent", derivedFrom: "colorFillSecondary" },
  { antdToken: "colorFillContentHover", derivedFrom: "colorFill" },
  { antdToken: "colorFillAlter", derivedFrom: "colorFillQuaternary" },
  { antdToken: "colorBgContainerDisabled", derivedFrom: "colorFillTertiary" },
  { antdToken: "controlItemBgHover", derivedFrom: "colorFillTertiary" },
  { antdToken: "controlItemBgActive", derivedFrom: "colorPrimaryBg" },
  { antdToken: "controlOutline", derivedFrom: "colorPrimaryBg over colorBgContainer" },
  { antdToken: "colorIcon", derivedFrom: "colorTextTertiary" },
  { antdToken: "colorTextHeading", derivedFrom: "colorText" },
  { antdToken: "colorTextLabel", derivedFrom: "colorTextSecondary" },
  { antdToken: "colorTextDescription", derivedFrom: "colorTextTertiary" },
];

// ---------------------------------------------------------------------------
// Custom tokens — paseo concepts antd has no slot for. antd passes unknown
// keys through the token pipeline, exposes them via useToken(), and emits
// them as CSS variables, so consumers keep one source of truth.
//
// Diff carries two pairs: the saturated line fills, and a text-grade pair for
// diff *stats*. The stat follows the rule paseo states explicitly in its own
// theme source — a stat is a status signal, so it takes the status colors,
// not the diff band.
// ---------------------------------------------------------------------------

function darkExtras(): AntdToken {
  return extras({
    surface0: paseoDark.surface0,
    surface1: paseoDark.surface1,
    surface2: paseoDark.surface2,
    surface3: paseoDark.surface3,
    surface4: paseoDark.surface4,
    surfaceSidebar: paseoDark.surfaceSidebar,
    diffAddition: paseoDark.diffAddition,
    diffDeletion: paseoDark.diffDeletion,
    diffAdditionText: paseoDark.statusSuccess,
    diffDeletionText: paseoDark.statusDanger,
    statusDotSuccess: paseoDark.statusDotSuccess,
    statusDotDanger: paseoDark.statusDotDanger,
    statusDotWarning: paseoDark.statusDotWarning,
    statusDotRunning: paseoDark.statusDotRunning,
    statusMerged: paseoDark.statusMerged,
    selection: paseoDark.selection,
    identity: paseoIdentityDark,
  });
}

// ---------------------------------------------------------------------------
// Component tokens (dark)
// ---------------------------------------------------------------------------

const darkComponents: AntdComponents = {
  Layout: {
    bodyBg: paseoDark.surface0,
    siderBg: paseoDark.surfaceSidebar,
    headerBg: paseoDark.surface0,
    triggerBg: paseoDark.surface1,
  },
  Menu: {
    darkItemBg: paseoDark.surfaceSidebar,
    darkSubMenuItemBg: paseoDark.surfaceSidebar,
    darkPopupBg: paseoDark.surface2,
    darkItemColor: paseoDark.foregroundMuted,
    darkItemHoverBg: paseoDark.surface1,
    darkItemHoverColor: paseoDark.foreground,
    darkItemSelectedBg: paseoDark.surface2,
    darkItemSelectedColor: paseoDark.foreground,
    darkItemDisabledColor: paseoDark.surface4,
  },
  Table: {
    headerBg: paseoDark.surface1,
    rowHoverBg: paseoDark.surface1,
    borderColor: paseoDark.border,
    headerSplitColor: paseoDark.border,
    headerSortHoverBg: paseoDark.surface2,
    headerSortActiveBg: paseoDark.surface2,
    bodySortBg: paseoDark.surface1,
  },
  Segmented: {
    trackBg: paseoDark.surface0,
    trackPadding: 4,
    itemColor: paseoDark.foregroundMuted,
    itemSelectedBg: paseoDark.surface2,
    itemSelectedColor: paseoDark.foreground,
  },
  Select: {
    // 9px padding + the provider's 2px transparent borders = 44px rows.
    optionPadding: "9px 12px",
    optionHeight: 44,
  },
  Tabs: {
    itemColor: paseoDark.foregroundMuted,
    itemSelectedColor: paseoDark.accentBright,
    inkBarColor: paseoDark.accentBright,
  },
  Card: { headerBg: paseoDark.surface1 },
  // Explicit component token: antd 6.6's css-var mode leaves the Alert
  // default empty, so the alert would render square. The string form is
  // required — numeric values are skipped by the css-var serializer here.
  // The cast only satisfies antd's `number`-typed token declaration.
  Alert: { borderRadius: "12px" as unknown as number },
  Input: { hoverBorderColor: paseoDark.accent, activeBorderColor: paseoDark.accentBright },
  Modal: { contentBg: paseoDark.surface2, headerBg: paseoDark.surface2 },
  Message: { contentBg: paseoDark.surface2 },
  Notification: { colorBgElevated: paseoDark.surface2 },
  // Soft elevation in place of paseo's original flat chrome (Q14 sync).
  Button: {
    primaryShadow: DARK_SHADOW.buttonPrimary,
    defaultShadow: DARK_SHADOW.buttonDefault,
    dangerShadow: DARK_SHADOW.buttonDanger,
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** The paseo dark theme as an antd v6 `ThemeConfig`. Drop into `ConfigProvider theme={...}`. */
export const paseoDarkTheme: ThemeConfig = {
  algorithm: paseoDarkAlgorithm,
  token: buildToken(darkMappings, darkExtras()),
  components: darkComponents,
};

/** The full dark mapping, for docs, swatch panels and tests. */
export const PASEO_DARK_TOKEN_MAPPING: readonly TokenMapping[] = darkMappings;
/** Tokens antd derives from the ones above — documented so nobody sets them by hand. */
export const PASEO_DERIVED_TOKENS: readonly DerivedToken[] = darkDerivedTokens;
