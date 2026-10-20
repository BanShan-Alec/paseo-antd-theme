/**
 * OKLCH helpers for the Claude light scheme.
 *
 * The status family is normalized the way paseo defines it: one perceived
 * lightness and one chroma fraction across every hue, so no status is louder
 * than another. On a light surface that common lightness has to drop to
 * L*=0.52 to clear 4.5:1, and antd's own `generate()` palette is not usable
 * for the *background* slots of such low-chroma bases — it washes them into
 * neutral grey (#467650 → #aab5ab). These helpers derive every slot from the
 * same hue at stepped lightness instead.
 */

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
