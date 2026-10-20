import { generate } from "@ant-design/colors";
import type { ThemeConfig } from "antd";
import { theme as antdTheme } from "antd";
import type { DerivedToken, TokenMapping } from "../paseo-full/theme";
import { normalizedLightFamily, type LightFamily } from "./colors";
import {
  CLAUDE_FONT_STACK,
  CLAUDE_LIGHT_STATUS_HUES,
  CLAUDE_MONO_FONT_STACK,
  claudeIdentityLight,
  claudeLight,
  claudeLightStatusFamilies,
} from "./tokens";

/** `ThemeConfig["token"]` minus the `undefined` — antd does not export `AliasToken` itself. */
type AntdToken = NonNullable<ThemeConfig["token"]>;
type AntdComponents = NonNullable<ThemeConfig["components"]>;

// ---------------------------------------------------------------------------
// Pinned color families
//
// antd v6 deletes seed tokens from `theme.token` and derives alias tokens
// last. Pinning through the algorithm wrapper's return value is the only way
// the exact Claude hexes survive; the same mechanism the paseo dark theme
// uses. On top of that, antd's light mapping points `*TextHover` at a lighter
// ramp slot — for these muted bases that slot drops below 4.5:1, so every
// text slot is pinned explicitly.
// ---------------------------------------------------------------------------

const primaryPalette: LightFamily = {
  base: claudeLight.accent,
  // Parchment-tinted slots derived from the same clay hue; the generate()
  // light end is too close to the card to make selected states visible.
  bg: "#FAF1EB",
  bgHover: "#EDE5DF",
  border: "#E0C1AF",
  borderHover: "#D49E83",
  // The solid primary button carries a white label: 4.53:1 on the sampled
  // clay. Hover/active darken so white stays well clear (6.6 / 9.1).
  hover: "#943F25",
  active: "#6E2716",
  // Clay as text needs the darker text-safe tone (4.86:1 on the page).
  text: claudeLight.accentText,
  textHover: "#7D351D",
  textActive: "#571F10",
};

const linkRamp = generate(claudeLight.link);

const success = claudeLightStatusFamilies.success;
const warning = claudeLightStatusFamilies.warning;
const danger = claudeLightStatusFamilies.danger;
const info = normalizedLightFamily(CLAUDE_LIGHT_STATUS_HUES.running);

type FamilyPrefix = "colorPrimary" | "colorSuccess" | "colorWarning" | "colorError" | "colorInfo";

function familyTokens(prefix: FamilyPrefix, palette: LightFamily): AntdToken {
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

const pinnedLightColors: AntdToken = {
  ...familyTokens("colorPrimary", primaryPalette),
  ...familyTokens("colorSuccess", success),
  ...familyTokens("colorWarning", warning),
  ...familyTokens("colorError", danger),
  ...familyTokens("colorInfo", info),
  // Links darken on hover/active: antd's light ramp would pick #7586e6
  // (3.16:1) for the hover slot.
  colorLink: claudeLight.link,
  colorLinkHover: linkRamp[6],
  colorLinkActive: linkRamp[7],
  fontFamily: CLAUDE_FONT_STACK,
  fontFamilyCode: CLAUDE_MONO_FONT_STACK,
};

const claudeLightAlgorithm: typeof antdTheme.defaultAlgorithm = (seed) =>
  ({
    ...antdTheme.defaultAlgorithm(seed),
    ...pinnedLightColors,
  }) as ReturnType<typeof antdTheme.defaultAlgorithm>;

// ---------------------------------------------------------------------------
// Elevation — Claude.ai's soft shadows, warmed with the ink base so they
// never read as neutral grey on the ivory surfaces.
// ---------------------------------------------------------------------------

const SHADOW = {
  base: "0 1px 2px rgba(31, 30, 29, 0.06), 0 4px 12px rgba(31, 30, 29, 0.08)",
  secondary: "0 6px 16px rgba(31, 30, 29, 0.10), 0 2px 6px rgba(31, 30, 29, 0.05)",
  tertiary: "0 1px 2px rgba(31, 30, 29, 0.04), 0 4px 12px rgba(31, 30, 29, 0.06)",
  buttonPrimary: "0 1px 2px rgba(31, 30, 29, 0.12)",
  buttonDefault: "0 1px 2px rgba(31, 30, 29, 0.06)",
  buttonDanger: "0 1px 2px rgba(31, 30, 29, 0.12)",
} as const;

// ---------------------------------------------------------------------------
// Token mappings — seeds feed derivation; map rows replace what antd would
// derive as neutral grey.
// ---------------------------------------------------------------------------

const lightMappings: readonly TokenMapping[] = [
  // Seeds
  {
    antdToken: "colorPrimary",
    kind: "seed",
    value: claudeLight.accent,
    paseoToken: "accent",
    note: "Claude's site interactive clay (#C6613F); brand-palette #D97757 is the lighter decorative variant.",
  },
  {
    antdToken: "colorSuccess",
    kind: "seed",
    value: claudeLight.statusSuccess,
    paseoToken: "statusSuccess",
    note: "Paseo's normalized rule re-solved at L*=0.52, C=55% gamut max.",
  },
  {
    antdToken: "colorWarning",
    kind: "seed",
    value: claudeLight.statusWarning,
    paseoToken: "statusWarning",
  },
  {
    antdToken: "colorError",
    kind: "seed",
    value: claudeLight.statusDanger,
    paseoToken: "statusDanger",
  },
  {
    antdToken: "colorInfo",
    kind: "seed",
    value: claudeLight.statusRunning,
    paseoToken: "statusRunning",
    note: "Claude Code's suggestion blue hue is reserved for links; info uses paseo's running blue.",
  },
  {
    antdToken: "colorTextBase",
    kind: "seed",
    value: claudeLight.foreground,
    paseoToken: "foreground",
  },
  {
    antdToken: "colorBgBase",
    kind: "seed",
    value: claudeLight.surface1,
    paseoToken: "surface1",
  },
  {
    antdToken: "colorLink",
    kind: "seed",
    value: claudeLight.link,
    paseoToken: "link",
    note: "Claude Code's suggestion hue #5769F7 darkened until it clears 4.5:1 on #F0EDE2.",
  },
  { antdToken: "fontFamily", kind: "seed", value: CLAUDE_FONT_STACK, paseoToken: "fontFamily.ui" },
  {
    antdToken: "fontFamilyCode",
    kind: "seed",
    value: CLAUDE_MONO_FONT_STACK,
    paseoToken: "fontFamily.mono",
  },
  { antdToken: "fontSize", kind: "seed", value: 14, paseoToken: "—", note: "14px body — the 16px Claude.ai scale felt cramped in dense app chrome." },
  { antdToken: "borderRadius", kind: "seed", value: 12, paseoToken: "—" },
  { antdToken: "sizeUnit", kind: "seed", value: 4, paseoToken: "spacing.1" },
  { antdToken: "sizeStep", kind: "seed", value: 4, paseoToken: "spacing.1" },
  { antdToken: "controlHeight", kind: "seed", value: 40, paseoToken: "—" },
  { antdToken: "lineWidth", kind: "seed", value: 1, paseoToken: "borderWidth.1" },

  // Surfaces — strict luminance order: sidebar < layout < container < elevated.
  { antdToken: "colorBgLayout", kind: "map", value: claudeLight.surface0, paseoToken: "surface0" },
  {
    antdToken: "colorBgContainer",
    kind: "map",
    value: claudeLight.surface1,
    paseoToken: "surface1",
    note: "Default buttons, inputs, cards.",
  },
  {
    antdToken: "colorBgElevated",
    kind: "map",
    value: claudeLight.surface2,
    paseoToken: "surface2",
    note: "Popovers, dropdowns, modals — separated from cards by shadow.",
  },
  {
    antdToken: "colorBgSpotlight",
    kind: "map",
    value: "#1F1E1D",
    paseoToken: "—",
    note: "Tooltip stays dark ink with white text.",
  },
  {
    antdToken: "colorBgMask",
    kind: "map",
    value: "rgba(20, 20, 19, 0.45)",
    paseoToken: "—",
  },

  // Text ladder. Claude Code's #AFAFAF only reaches 2.08:1 on ivory, so the
  // tertiary slot is re-derived rather than copied.
  { antdToken: "colorText", kind: "map", value: claudeLight.foreground, paseoToken: "foreground" },
  {
    antdToken: "colorTextSecondary",
    kind: "map",
    value: claudeLight.foregroundMuted,
    paseoToken: "foregroundMuted",
  },
  {
    antdToken: "colorTextTertiary",
    kind: "map",
    value: claudeLight.foregroundExtraMuted,
    paseoToken: "foregroundExtraMuted",
  },
  {
    antdToken: "colorTextQuaternary",
    kind: "map",
    value: claudeLight.foregroundFaint,
    paseoToken: "foregroundFaint",
    note: "Placeholder/disabled only — not a body-text level.",
  },
  {
    antdToken: "colorTextLightSolid",
    kind: "map",
    value: "#FFFFFF",
    paseoToken: "—",
    note: "Danger/solid labels stay white; primary buttons override with Button.primaryColor.",
  },

  // Borders and fills. In light mode the strongest fill is the darkest step,
  // so the ramp runs opposite to the dark scheme.
  { antdToken: "colorBorder", kind: "map", value: claudeLight.border, paseoToken: "border" },
  {
    antdToken: "colorBorderSecondary",
    kind: "map",
    value: claudeLight.borderAccent,
    paseoToken: "borderAccent",
  },
  { antdToken: "colorFill", kind: "map", value: claudeLight.surface4, paseoToken: "surface4" },
  {
    antdToken: "colorFillSecondary",
    kind: "map",
    value: claudeLight.surface3,
    paseoToken: "surface3",
  },
  {
    antdToken: "colorFillTertiary",
    kind: "map",
    value: claudeLight.surfaceHover,
    paseoToken: "surfaceHover",
    note: "Hover/disabled fills on white surfaces: 1.30:1 against the container, clearly visible without shouting.",
  },
  {
    antdToken: "colorFillQuaternary",
    kind: "map",
    value: "#EDEBE0",
    paseoToken: "—",
    note: "Zebra stripes and hairline fills.",
  },

  // Scale
  { antdToken: "controlHeightSM", kind: "map", value: 32, paseoToken: "—" },
  { antdToken: "controlHeightLG", kind: "map", value: 48, paseoToken: "—" },
  { antdToken: "fontSizeSM", kind: "map", value: 12, paseoToken: "—" },
  { antdToken: "fontSizeLG", kind: "map", value: 16, paseoToken: "—" },
  { antdToken: "borderRadiusSM", kind: "map", value: 8, paseoToken: "—" },
  { antdToken: "borderRadiusLG", kind: "map", value: 12, paseoToken: "—" },
  { antdToken: "borderRadiusXS", kind: "map", value: 4, paseoToken: "—" },
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

  // Elevation
  { antdToken: "boxShadow", kind: "map", value: SHADOW.base, paseoToken: "—" },
  {
    antdToken: "boxShadowSecondary",
    kind: "map",
    value: SHADOW.secondary,
    paseoToken: "—",
  },
  { antdToken: "boxShadowTertiary", kind: "map", value: SHADOW.tertiary, paseoToken: "—" },
];

/** Tokens antd derives last, from tokens this integration controls. Never set them. */
const lightDerivedTokens: readonly DerivedToken[] = [
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
// Custom tokens
// ---------------------------------------------------------------------------

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function extras(): AntdToken {
  return {
    paseoSurfaceHead: claudeLight.surfaceHead,
    paseoSurfaceHover: claudeLight.surfaceHover,
    paseoSurface0: claudeLight.surface0,
    paseoSurface1: claudeLight.surface1,
    paseoSurface2: claudeLight.surface2,
    paseoSurface3: claudeLight.surface3,
    paseoSurface4: claudeLight.surface4,
    paseoSurfaceSidebar: claudeLight.surfaceSidebar,
    paseoDiffAddition: claudeLight.diffAddition,
    paseoDiffDeletion: claudeLight.diffDeletion,
    // The base status colors are only 4.30:1 on the pale diff fills; the
    // family's text-hover slot is one step darker and still passes on both
    // the fill and the page surface.
    paseoDiffAdditionText: success.textHover,
    paseoDiffDeletionText: danger.textHover,
    paseoStatusDotSuccess: claudeLight.statusSuccess,
    paseoStatusDotDanger: claudeLight.statusDanger,
    paseoStatusDotWarning: claudeLight.statusWarning,
    paseoStatusDotRunning: claudeLight.statusRunning,
    paseoStatusMerged: claudeLight.statusMerged,
    paseoSelection: claudeLight.selection,
    ...Object.fromEntries(
      Object.entries(claudeIdentityLight).map(([name, value]) => [
        `paseoIdentity${capitalize(name)}`,
        value,
      ]),
    ),
  } as unknown as AntdToken;
}

// ---------------------------------------------------------------------------
// Component tokens
// ---------------------------------------------------------------------------

const lightComponents: AntdComponents = {
  Layout: {
    bodyBg: claudeLight.surface0,
    siderBg: claudeLight.surfaceSidebar,
    headerBg: claudeLight.surface0,
    triggerBg: claudeLight.surface3,
    lightSiderBg: claudeLight.surfaceSidebar,
    lightTriggerBg: claudeLight.surface3,
    lightTriggerColor: claudeLight.foreground,
  },
  Menu: {
    itemBg: claudeLight.surfaceSidebar,
    subMenuItemBg: claudeLight.surfaceSidebar,
    popupBg: claudeLight.surface2,
    itemColor: claudeLight.foregroundMuted,
    // Sidebar hover/selected are measured against the sidebar, not the card:
    // 1.14 and 1.21. Selected stays clearly above hover.
    itemHoverBg: claudeLight.surface3,
    itemHoverColor: claudeLight.foreground,
    itemSelectedBg: claudeLight.surface4,
    itemSelectedColor: claudeLight.foreground,
    itemActiveBg: claudeLight.surface3,
    itemDisabledColor: claudeLight.foregroundFaint,
  },
  Table: {
    // Parchment panel-head tone, shared with Card.
    headerBg: claudeLight.surfaceHead,
    rowHoverBg: claudeLight.surfaceHover,
    borderColor: claudeLight.borderAccent,
    headerSplitColor: claudeLight.borderAccent,
    headerSortHoverBg: claudeLight.surface3,
    headerSortActiveBg: claudeLight.surface4,
    bodySortBg: "#F5F3EF",
  },
  Segmented: {
    // A light neutral in the card family (antd's own default is
    // colorBgLayout). The sidebar tone would be darker than the hover step
    // and invert the hover direction.
    trackBg: claudeLight.surfaceTrack,
    // Default is lineWidthBold (2). 4 gives the selected thumb visible
    // breathing room inside the 40px track; the item-to-item gap is added by
    // PaseoThemeProvider because antd has no gap token.
    trackPadding: 4,
    itemColor: claudeLight.foregroundMuted,
    // itemHoverBg is deliberately NOT set: antd's default is
    // colorFillSecondary (surface3), which reads 1.21 against the track.
    itemSelectedBg: claudeLight.surface2,
    itemSelectedColor: claudeLight.foreground,
  },
  Select: {
    // 9px padding + the provider's 2px transparent borders keeps the text
    // spacing of 11px and the total row at 44px. Virtualized lists also need
    // <Select listItemHeight={44}>.
    optionPadding: "9px 12px",
    optionHeight: 44,
  },
  Tabs: {
    itemColor: claudeLight.foregroundMuted,
    itemSelectedColor: claudeLight.accentText,
    // The 2px ink bar is non-text: #BC5C3C clears the 3:1 threshold (3.78:1).
    inkBarColor: claudeLight.accent,
  },
  Card: { headerBg: claudeLight.surfaceHead },
  // antd 6.6's css-var mode does not emit the Alert component-token default,
  // which leaves `--ant-alert-border-radius` empty and the alert square. The
  // value must be a string: the css-var serializer skips a numeric value for
  // this token, so `{ borderRadius: 12 }` would still produce a square. The
  // cast only satisfies antd's `number`-typed component-token declaration.
  Alert: { borderRadius: "12px" as unknown as number },
  Input: {
    hoverBorderColor: claudeLight.accent,
    activeBorderColor: claudeLight.accentText,
  },
  Modal: { contentBg: claudeLight.surface2, headerBg: claudeLight.surface2 },
  Message: { contentBg: claudeLight.surface2 },
  Notification: { colorBgElevated: claudeLight.surface2 },
  Button: {
    // The one intentional contrast exception: white on #C6613F is 4.05:1
    // (Claude's site accepts it). Hover/active darken to #B4543A / #A64B32,
    // where white clears 4.5. Danger keeps white via colorTextLightSolid.
    primaryColor: "#FFFFFF",
    primaryShadow: SHADOW.buttonPrimary,
    defaultShadow: SHADOW.buttonDefault,
    dangerShadow: SHADOW.buttonDanger,
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function buildToken(mappings: readonly TokenMapping[], extra: AntdToken): AntdToken {
  return { ...Object.fromEntries(mappings.map((row) => [row.antdToken, row.value])), ...extra } as AntdToken;
}

/** Claude light as an antd v6 `ThemeConfig`. Drop into `ConfigProvider theme={...}`. */
export const claudeLightTheme: ThemeConfig = {
  algorithm: claudeLightAlgorithm,
  token: buildToken(lightMappings, extras()),
  components: lightComponents,
};

/** The full mapping, for docs, swatch panels and tests. */
export const CLAUDE_LIGHT_TOKEN_MAPPING: readonly TokenMapping[] = lightMappings;
/** Tokens antd derives from the ones above — documented so nobody sets them by hand. */
export const CLAUDE_LIGHT_DERIVED_TOKENS: readonly DerivedToken[] = lightDerivedTokens;
