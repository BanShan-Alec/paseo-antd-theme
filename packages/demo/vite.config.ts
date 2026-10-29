import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import {
  antdDarkTheme,
  antdLightTheme,
  claudeLightTheme,
  generateTailwindVariables,
  paseoDarkTheme,
} from "paseo-antd-themes";

/** The three pairs the header switcher offers. */
const PAIRS = {
  antd: { light: antdLightTheme, dark: antdDarkTheme },
  paseo: { light: claudeLightTheme, dark: paseoDarkTheme },
  mixed: { light: antdLightTheme, dark: paseoDarkTheme },
} as const;

const SCHEMES = ["light", "dark"] as const;

const SCOPE_ID = "virtual:paseo-scopes.css";
const RESOLVED_SCOPE_ID = `\0${SCOPE_ID}`;

/**
 * Emits one variable scope per pair × scheme, resolved through the package's
 * own `generateTailwindVariables`. Every utility in the demo reads
 * `var(--paseo-*)`, so switching the `data-pair` / `data-scheme` attributes on
 * <html> is all it takes for one set of Tailwind classes to follow the theme.
 */
function themeScopes(): Plugin {
  return {
    name: "paseo-theme-scopes",
    resolveId(id) {
      return id === SCOPE_ID ? RESOLVED_SCOPE_ID : undefined;
    },
    load(id) {
      if (id !== RESOLVED_SCOPE_ID) return undefined;
      return Object.entries(PAIRS)
        .flatMap(([pair, slots]) =>
          SCHEMES.map((scheme) => {
            const vars = generateTailwindVariables(slots[scheme]);
            const declarations = Object.entries(vars)
              .map(([name, value]) => `  --paseo-${name}: ${value};`)
              .join("\n");
            return `[data-pair="${pair}"][data-scheme="${scheme}"] {\n${declarations}\n}`;
          }),
        )
        .join("\n\n");
    },
  };
}

export default defineConfig({
  plugins: [react(), themeScopes()],
});
