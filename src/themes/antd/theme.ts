import type { MappingAlgorithm, ThemeConfig } from "antd";
import {
  SHARED_COMPONENT_GEOMETRY,
  SHARED_GEOMETRY,
  darkFontAlgorithm,
  lightFontAlgorithm,
} from "../../shared/theme";

// ---------------------------------------------------------------------------
// antd's own palettes, promoted to first-class slot candidates.
//
// Colors, fills, borders and shadows stay exactly as antd derives them; only
// the skeleton is shared with the complete themes (40px controls, 12px radius,
// 44px Select rows, shared font stack). That is what lets a mixed pair —
// antd light + Paseo dark — switch schemes without resizing controls.
//
// Colour- and geometry-identical stock output is still one line away: pass
// antd's own algorithms in a bare ConfigProvider instead.
// ---------------------------------------------------------------------------

const alignGeometry: MappingAlgorithm = (_seed, mapToken) =>
  ({ ...mapToken, ...SHARED_GEOMETRY }) as ReturnType<MappingAlgorithm>;

function stockGeometryComponents(): NonNullable<ThemeConfig["components"]> {
  return {
    Select: { ...SHARED_COMPONENT_GEOMETRY.Select },
    Segmented: { ...SHARED_COMPONENT_GEOMETRY.Segmented },
    // antd 6.6's css-var mode leaves the Alert component-token default empty,
    // which renders the alert square — the complete themes pin the string form
    // for the same reason (numeric values are skipped by that serializer).
    Alert: { borderRadius: "12px" as unknown as number },
  };
}

const stockLayoutComponents = (): NonNullable<ThemeConfig["components"]> => ({
  // antd hard-codes headerBg to the navy #001529 in both schemes (Layout's
  // prepareComponentToken), so the stock dark header sits 1.4× brighter than
  // its pure-black body. The complete themes all keep headerBg = bodyBg;
  // align the stock pair so a mixed pair doesn't swap header tones.
  Layout: { headerBg: "rgba(0, 0, 0, 0)" },
});

export const antdLightTheme: ThemeConfig = {
  algorithm: [lightFontAlgorithm, alignGeometry],
  components: { ...stockGeometryComponents(), ...stockLayoutComponents() },
};

export const antdDarkTheme: ThemeConfig = {
  algorithm: [darkFontAlgorithm, alignGeometry],
  components: { ...stockGeometryComponents(), ...stockLayoutComponents() },
};
