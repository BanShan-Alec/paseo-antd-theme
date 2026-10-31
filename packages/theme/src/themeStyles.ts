/**
 * Global CSS for the component-level behaviors that antd tokens cannot express.
 * PaseoThemeProvider injects only the parts that are still enabled, so turning
 * a behavior off leaves no orphan rules behind.
 */

/**
 * Shared marker so the standalone icon and the provider agree on whether the
 * loading CSS is already in the document.
 */
export const PASEO_LOADING_CSS_ATTRIBUTE = "data-paseo-loading-css";

/** Only needed by the default Paseo spinner. */
export const PASEO_LOADING_CSS = `
@keyframes paseo-loading-rotate {
  to {
    transform: rotate(360deg);
  }
}

.paseo-loading-icon {
  vertical-align: -0.125em;
}

/* Rotate the inner group, not the outer <svg>: the reference icon does this
   so the 1em box never changes and the strokes do not shimmer at small sizes. */
.paseo-loading-spin {
  animation: paseo-loading-rotate 1s linear infinite;
  transform-box: fill-box;
  transform-origin: center;
}
`;

/** Paired with the `paseo-select-item` class the provider adds to list rows. */
export const PASEO_SELECT_GAP_CSS = `
/* Real transparent gaps between Select options: the hover/selected background
   stops at the padding box, so the 2px top/bottom borders reveal the dropdown
   background instead of letting adjacent rows touch. The border is included in
   the row's offsetHeight, so optionHeight and listItemHeight both stay 44.
   Physical border properties are used so the rule also wins over antd's reset
   in engines with weaker logical-property cascade support. */
.paseo-select-item.paseo-select-item {
  border-top: 2px solid transparent;
  border-bottom: 2px solid transparent;
  background-clip: padding-box;
}
`;

/** antd has no gap token for Segmented items; the provider adds the class. */
export const PASEO_SEGMENTED_GAP_CSS = `
/* The rule keeps the gap out of the trailing edge. */
.paseo-segmented-item:not(:last-child) {
  margin-inline-end: 4px;
}
`;

/** All behaviors, for anyone who prefers one import over the provider. */
export const PASEO_THEME_CSS = [PASEO_LOADING_CSS, PASEO_SELECT_GAP_CSS, PASEO_SEGMENTED_GAP_CSS].join(
  "\n",
);
