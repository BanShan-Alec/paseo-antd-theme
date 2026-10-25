import type { ThemeConfig } from "antd";
import { darkFontAlgorithm, lightFontAlgorithm } from "../../shared/theme";

// ---------------------------------------------------------------------------
// antd's own schemes, promoted to first-class slot candidates.
//
// The only delta from antd's defaults is the shared font stack: mixing a stock
// slot with a Paseo/Claude slot must not shift layout. Colors, sizes, radii and
// component tokens stay exactly as antd derives them.
//
// If you need byte-identical stock output (font included), pass antd's own
// algorithms instead: `{ algorithm: antdTheme.defaultAlgorithm }` /
// `{ algorithm: antdTheme.darkAlgorithm }`.
// ---------------------------------------------------------------------------

export const antdLightTheme: ThemeConfig = { algorithm: lightFontAlgorithm };

export const antdDarkTheme: ThemeConfig = { algorithm: darkFontAlgorithm };
