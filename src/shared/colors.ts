/**
 * Color-space helpers shared by the two built-in themes and `extendTheme`.
 *
 * The status family is normalized the way paseo defines it: one perceived
 * lightness and one chroma fraction across every hue, so no status is louder
 * than another. On a light surface that common lightness has to drop to
 * L*=0.52 to clear 4.5:1, and antd's own `generate()` palette is not usable
 * for the *background* slots of such low-chroma bases — it washes them into
 * neutral grey (#467650 → #aab5ab). These helpers derive every slot from the
 * same hue at stepped lightness instead.
 *
 * The dark family mirrors antd's own dark mapping (`themes/dark/colors.js`)
 * but keeps paseo's exact hex in the base slot instead of the darkened hex
 * antd would put there.
 */
import { generate } from "@ant-design/colors";
import type { ColorFamilySlots } from "./theme";

export interface LightFamily {
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

function linearize(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function delinearize(channel: number): number {
  return channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055;
}

/** OKLab → linear sRGB. */
function oklabToLinearRgb(L: number, a: number, b: number): readonly [number, number, number] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function inGamut(rgb: readonly [number, number, number]): boolean {
  return rgb.every((channel) => channel >= -0.0005 && channel <= 1.0005);
}

function hexFromLinear(rgb: readonly [number, number, number]): string {
  return `#${rgb
    .map((channel) =>
      Math.round(Math.max(0, Math.min(1, delinearize(channel))) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

/** The largest chroma this hue can hold at this lightness inside sRGB. */
export function maxChroma(L: number, hue: number): number {
  const radians = (hue * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  let low = 0;
  let high = 0.4;
  for (let i = 0; i < 24; i += 1) {
    const mid = (low + high) / 2;
    if (inGamut(oklabToLinearRgb(L, mid * cos, mid * sin))) low = mid;
    else high = mid;
  }
  return low;
}

/** OKLCH → hex. Throws rather than silently clipping when the request is out of gamut. */
export function oklchHex(L: number, chroma: number, hue: number): string {
  const radians = (hue * Math.PI) / 180;
  const rgb = oklabToLinearRgb(L, chroma * Math.cos(radians), chroma * Math.sin(radians));
  if (!inGamut(rgb)) {
    throw new Error(`OKLCH(${L} ${chroma} ${hue}) is outside sRGB`);
  }
  return hexFromLinear(rgb);
}

/**
 * The paseo status rule, re-solved for a light surface.
 *
 * `baseL` is the common perceived lightness every hue shares; `chromaFraction`
 * is the share of that hue's sRGB-maximum chroma. The remaining slots step
 * away from the base in lightness only, so the family keeps one voice.
 */
export function normalizedLightFamily(
  hue: number,
  baseL = 0.52,
  chromaFraction = 0.55,
): LightFamily {
  const at = (L: number) => oklchHex(L, maxChroma(L, hue) * chromaFraction, hue);
  return {
    base: at(baseL),
    bg: at(0.94),
    bgHover: at(0.91),
    border: at(0.87),
    borderHover: at(0.83),
    hover: at(baseL + 0.05),
    active: at(baseL - 0.06),
    text: at(baseL),
    textHover: at(baseL - 0.04),
    textActive: at(baseL - 0.08),
  };
}

export interface Oklch {
  readonly L: number;
  readonly C: number;
  readonly H: number;
}

function hexChannels(hex: string): readonly [number, number, number] {
  let value = hex.trim().replace(/^#/, "");
  // antd's own dark theme resolves colorBgBase to "#000"; accept the short
  // form so scheme detection works on stock themes too.
  if (/^[0-9a-f]{3}$/i.test(value)) {
    value = value
      .split("")
      .map((channel) => channel + channel)
      .join("");
  }
  if (!/^[0-9a-f]{6}$/i.test(value)) {
    throw new Error(`expected a 3- or 6-digit hex color, got "${hex}"`);
  }
  return [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16) / 255) as unknown as readonly [
    number,
    number,
    number,
  ];
}

/** Hex → OKLCH, the inverse of `oklchHex`. */
export function hexToOklch(hex: string): Oklch {
  const [red, green, blue] = hexChannels(hex).map(linearize);
  const l = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
  const m = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
  const s = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);
  const okL = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const okA = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const okB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return {
    L: okL,
    C: Math.hypot(okA, okB),
    H: ((Math.atan2(okB, okA) * 180) / Math.PI + 360) % 360,
  };
}

/** sRGB relative luminance (WCAG). `extendTheme` uses it to detect the scheme. */
export function hexLuminance(hex: string): number {
  const [red, green, blue] = hexChannels(hex).map(linearize);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export interface DarkFamily extends ColorFamilySlots {
  /** The raw @ant-design/colors ramp for the base color, dark variant. */
  readonly raw: readonly string[];
}

/**
 * antd's dark palette mapping around paseo's exact hex instead of the darkened
 * hex antd would put in the base slot. Text slots deliberately deviate from
 * antd's mapping: antd reuses the darkened base there, which is unreadable on
 * a dark surface (~1.9:1), while the light slots of the same ramp sit at 4:1
 * or better.
 */
export function darkFamily(base: string): DarkFamily {
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
    text: raw[8],
    textHover: raw[9],
    textActive: raw[7],
  };
}

/**
 * The light counterpart, anchored at an arbitrary base color: read its OKLCH
 * hue / lightness / chroma, then step every other slot from there. Used by
 * `extendTheme` where the caller supplies a base hex rather than a hue.
 *
 * The stepping lightness is clamped so very light or very dark inputs cannot
 * push a derived slot outside sRGB; the `base` slot keeps the exact input.
 */
export function lightFamilyFromBase(base: string): LightFamily {
  const { L, C, H } = hexToOklch(base);
  const steppedL = Math.min(0.86, Math.max(0.3, L));
  const maximum = maxChroma(steppedL, H);
  const chromaFraction = maximum > 1e-6 ? Math.min(1, C / maximum) : 0;
  return { ...normalizedLightFamily(H, steppedL, chromaFraction), base };
}
