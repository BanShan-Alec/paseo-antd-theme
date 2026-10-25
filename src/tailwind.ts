/**
 * Build-time entry: generate the Tailwind v4 stylesheet for whatever light/dark
 * pair the app actually uses. The shipped `tailwind.css` is the default pair
 * (Claude Light + Paseo Dark); this module exists so a mixed setup — for
 * example antd's own light slot plus Paseo dark — can keep utilities and
 * components in sync instead of silently disagreeing.
 *
 * Runs in Node or a bundler; it needs antd (a peer dependency) but no browser.
 */
export {
  DEFAULT_TAILWIND_THEMES,
  generateTailwindCss,
  resolveTailwindVariables,
  TAILWIND_VARIABLES,
} from "./tailwind/build";
export type {
  ResolvedTailwindVariables,
  TailwindThemePair,
  TailwindVariable,
} from "./tailwind/build";
