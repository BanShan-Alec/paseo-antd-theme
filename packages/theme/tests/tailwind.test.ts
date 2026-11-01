import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  generateTailwindCss,
  generateTailwindPreset,
  generateTailwindVariables,
  generateTailwindVarsCss,
  resolveTailwindVariables,
  TAILWIND_VARIABLES,
} from "../src/tailwind/build";
import { antdLightTheme } from "../src/themes/antd/theme";
import { claudeLightTheme } from "../src/themes/claude/theme";
import { paseoDarkTheme } from "../src/themes/paseo-dark/theme";

const ROOT = join(import.meta.dirname, "..");

/**
 * The tailwind artifacts are committed build outputs: regenerating them must
 * produce byte-identical files (the same discipline as MAPPING.md). The
 * generators are pure functions of the theme configs, so call them directly —
 * spawning `vite-node` per artifact made this test take ~5s and time out on CI.
 */
const generated = (generator: "Css" | "VarsCss" | "Preset" = "Css") => {
  if (generator === "VarsCss") return generateTailwindVarsCss();
  if (generator === "Preset") return generateTailwindPreset();
  return generateTailwindCss();
};

/** Reads a committed artifact, normalizing git's CRLF checkout on Windows. */
const artifact = (path: string) =>
  readFileSync(join(ROOT, path), "utf8").replace(/\r\n/g, "\n");

/** Asserts a vars stylesheet repeats every variable in its dark blocks. */
function expectCompleteBlocks(css: string) {
  const rootStart = css.indexOf(":root, :host {");
  const mediaStart = css.indexOf("@media (prefers-color-scheme: dark) {");
  const classStart = css.indexOf(".dark {");
  expect(rootStart).toBeGreaterThan(0);
  expect(mediaStart).toBeGreaterThan(rootStart);
  expect(classStart).toBeGreaterThan(mediaStart);

  const mediaBlock = css.slice(mediaStart, classStart);
  const classBlock = css.slice(classStart);
  for (const spec of TAILWIND_VARIABLES) {
    const names = [spec.name, ...(spec.lineHeight ? [spec.lineHeight.name] : [])];
    for (const name of names) {
      expect(mediaBlock).toContain(`--paseo-${name}:`);
      expect(classBlock).toContain(`--paseo-${name}:`);
    }
  }
}

describe("tailwind css artifact", () => {
  // The generator emits LF; git may check the committed file out as CRLF on
  // Windows, so compare content, not checkout line endings.
  const css = artifact("src/tailwind/theme.css");

  it("is fresh — regeneration reproduces the committed file byte for byte", () => {
    expect(generated()).toBe(css);
  });

  it("declares every exported variable in the light, dark-media and dark-class blocks", () => {
    expectCompleteBlocks(css);
    const rootStart = css.indexOf(":root, :host {");
    const mediaStart = css.indexOf("@media (prefers-color-scheme: dark) {");
    const lightBlock = css.slice(rootStart, mediaStart);
    for (const spec of TAILWIND_VARIABLES) {
      expect(lightBlock).toContain(`--paseo-${spec.name}:`);
      if (spec.lineHeight !== undefined) {
        expect(lightBlock).toContain(`--paseo-${spec.lineHeight.name}:`);
      }
    }
  });

  it("exposes every variable to Tailwind through @theme", () => {
    const themeBlock = css.slice(css.indexOf("@theme inline {"), css.indexOf(":root, :host {"));
    for (const spec of TAILWIND_VARIABLES) {
      if (spec.kind === "color") {
        expect(themeBlock).toContain(`--color-${spec.name}: var(--paseo-${spec.name});`);
      } else {
        expect(themeBlock).toContain(`${spec.themeKey}: var(--paseo-${spec.name});`);
      }
      if (spec.lineHeight !== undefined) {
        expect(themeBlock).toContain(
          `${spec.lineHeight.themeKey}: var(--paseo-${spec.lineHeight.name});`,
        );
      }
    }
  });

  it("carries the type scale with paired line-heights, in px", () => {
    const { light, dark } = resolveTailwindVariables();
    expect(light["text-caption"]).toBe("12px");
    expect(light["text-caption-lh"]).toBe("20px");
    expect(light["text-body"]).toBe("14px");
    expect(light["text-body-lh"]).toBe("22px");
    expect(light["text-subtitle"]).toBe("16px");
    expect(light["text-subtitle-lh"]).toBe("24px");
    expect(light["text-heading-sm"]).toBe("20px");
    expect(light["text-heading-sm-lh"]).toBe("28px");
    expect(light["text-heading"]).toBe("24px");
    expect(light["text-heading-lh"]).toBe("32px");
    expect(light["text-heading-lg"]).toBe("30px");
    expect(light["text-heading-lg-lh"]).toBe("38px");
    expect(light["text-display"]).toBe("38px");
    expect(light["text-display-lh"]).toBe("46px");
    // The type scale is scheme-independent; only colors move between slots.
    expect(dark["text-body"]).toBe(light["text-body"]);
  });

  it("exports the two shadows a page author may apply, and not the internal one", () => {
    const { light, dark } = resolveTailwindVariables();
    expect(light["shadow-raised"]).toContain("rgba(31, 30, 29");
    expect(light["shadow-overlay"]).toContain("rgba(31, 30, 29");
    expect(dark["shadow-raised"]).toContain("rgba(0, 0, 0");
    // `boxShadow` stays antd-internal — it must not become a utility.
    expect(TAILWIND_VARIABLES.some((spec) => spec.source === "boxShadow")).toBe(false);
  });

  it("maps light to Claude Light and dark to Paseo Dark", () => {
    const { light, dark } = resolveTailwindVariables();
    expect(light.primary).toBe("#BA5B37");
    expect(dark.primary).toBe("#20744A");
    // Derived (algorithm) values, not just pinned ones:
    expect(light["primary-hover"]).toBe("#943F25");
    expect(dark["primary-hover"]).toBe("#347552");
    // claude-only concepts with a documented dark substitute:
    expect(light["surface-head"]).toBe("#E0DDD0");
    expect(dark["surface-head"]).toBe(dark["surface-1"]);
  });

  it("resolves every listed source token in both themes", () => {
    const { light, dark } = resolveTailwindVariables();
    for (const spec of TAILWIND_VARIABLES) {
      expect(light[spec.name], `light ${spec.name}`).toBeTruthy();
      expect(dark[spec.name], `dark ${spec.name}`).toBeTruthy();
    }
  });

  it("generates a mixed pair through the documented stock fallbacks", () => {
    const { light, dark } = resolveTailwindVariables({
      light: antdLightTheme,
      dark: paseoDarkTheme,
    });

    expect(light.primary).toBe("#1677ff");
    expect(dark.primary).toBe("#20744A");
    // antd has no paseo custom tokens; these aliases keep the export total.
    expect(light["surface-0"]).toBe("#f5f5f5");
    expect(light["surface-1"]).toBe("#ffffff");
    expect(light["status-dot-success"]).toBe("#52c41a");
    expect(light.selection).toBe("#e6f4ff");
    expect(light["identity-violet"]).toBe("#722ed1");
  });

  it("generates the same stylesheet for the explicit default pair", () => {
    expect(generateTailwindCss({ light: claudeLightTheme, dark: paseoDarkTheme })).toBe(
      generateTailwindCss(),
    );
  });
});

describe("tailwind v3 artifacts", () => {
  const varsCss = artifact("src/tailwind/vars.css");
  const preset = artifact("src/tailwind/preset.cjs");

  it("vars.css is fresh — regeneration reproduces the committed file", () => {
    expect(generated("VarsCss")).toBe(varsCss);
  });

  it("preset.cjs is fresh — regeneration reproduces the committed file", () => {
    expect(generated("Preset")).toBe(preset);
  });

  it("vars.css repeats every variable in both dark blocks", () => {
    expectCompleteBlocks(varsCss);
  });

  it("preset maps every color, the type/shadow/font/radius scales to --paseo-*", () => {
    const mod: { exports: { theme: { extend: Record<string, Record<string, unknown>> } } } = {
      exports: { theme: { extend: {} } },
    };
    new Function("module", "exports", preset)(mod, mod.exports);
    const extend = mod.exports.theme.extend;
    for (const spec of TAILWIND_VARIABLES) {
      if (spec.kind === "color") {
        expect(extend.colors[spec.name], spec.name).toBe(`var(--paseo-${spec.name})`);
      }
    }
    expect(extend.fontFamily).toEqual({
      sans: "var(--paseo-font)",
      mono: "var(--paseo-font-mono)",
    });
    expect(extend.fontSize).toEqual({
      caption: ["var(--paseo-text-caption)", { lineHeight: "var(--paseo-text-caption-lh)" }],
      body: ["var(--paseo-text-body)", { lineHeight: "var(--paseo-text-body-lh)" }],
      subtitle: ["var(--paseo-text-subtitle)", { lineHeight: "var(--paseo-text-subtitle-lh)" }],
      "heading-sm": [
        "var(--paseo-text-heading-sm)",
        { lineHeight: "var(--paseo-text-heading-sm-lh)" },
      ],
      heading: ["var(--paseo-text-heading)", { lineHeight: "var(--paseo-text-heading-lh)" }],
      "heading-lg": [
        "var(--paseo-text-heading-lg)",
        { lineHeight: "var(--paseo-text-heading-lg-lh)" },
      ],
      display: ["var(--paseo-text-display)", { lineHeight: "var(--paseo-text-display-lh)" }],
    });
    expect(extend.boxShadow).toEqual({
      raised: "var(--paseo-shadow-raised)",
      overlay: "var(--paseo-shadow-overlay)",
    });
    expect(extend.borderRadius).toEqual({
      xs: "var(--paseo-radius-xs)",
      sm: "var(--paseo-radius-sm)",
      md: "var(--paseo-radius-md)",
      lg: "var(--paseo-radius-lg)",
    });
  });

  it("generateTailwindVariables resolves one theme exactly like the pair does", () => {
    const { light, dark } = resolveTailwindVariables();
    expect(generateTailwindVariables(claudeLightTheme)).toEqual(light);
    expect(generateTailwindVariables(paseoDarkTheme)).toEqual(dark);
    // Stock antd has no paseo custom tokens; the fallbacks must still resolve.
    expect(generateTailwindVariables(antdLightTheme).primary).toBe("#1677ff");
  });
});
