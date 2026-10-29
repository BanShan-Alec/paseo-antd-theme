import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import {
  generateTailwindCss,
  resolveTailwindVariables,
  TAILWIND_VARIABLES,
} from "../src/tailwind/build";
import { antdLightTheme } from "../src/themes/antd/theme";
import { claudeLightTheme } from "../src/themes/claude/theme";
import { paseoDarkTheme } from "../src/themes/paseo-dark/theme";

const ROOT = join(import.meta.dirname, "..");

/**
 * theme.css is a committed build artifact: regenerating it must produce a
 * byte-identical file (the same discipline as MAPPING.md). The generation
 * runs through vite-node because the theme sources are TypeScript.
 */
const generated = () => {
  const out = join(tmpdir(), `tailwind-theme-${process.pid}.css`);
  const entry = join(tmpdir(), `tailwind-theme-gen-${process.pid}.ts`);
  const script = `
    import { writeFileSync } from "node:fs";
    import { generateTailwindCss } from ${JSON.stringify(pathToFileURL(join(ROOT, "src/tailwind/build.ts")).href)};
    writeFileSync(${JSON.stringify(out)}, generateTailwindCss());
  `;
  writeFileSync(entry, script);
  execFileSync("npx", ["vite-node", entry], { cwd: ROOT });
  return readFileSync(out, "utf8");
};

describe("tailwind css artifact", () => {
  // The generator emits LF; git may check the committed file out as CRLF on
  // Windows, so compare content, not checkout line endings.
  const css = readFileSync(join(ROOT, "src/tailwind/theme.css"), "utf8").replace(/\r\n/g, "\n");

  it("is fresh — regeneration reproduces the committed file byte for byte", () => {
    expect(generated()).toBe(css);
  });

  it("declares every exported variable in the light, dark-media and dark-class blocks", () => {
    const rootStart = css.indexOf(":root, :host {");
    const mediaStart = css.indexOf("@media (prefers-color-scheme: dark) {");
    const classStart = css.indexOf(".dark {");
    expect(rootStart).toBeGreaterThan(0);
    expect(mediaStart).toBeGreaterThan(rootStart);
    expect(classStart).toBeGreaterThan(mediaStart);

    const lightBlock = css.slice(rootStart, mediaStart);
    const mediaBlock = css.slice(mediaStart, classStart);
    const classBlock = css.slice(classStart);
    for (const spec of TAILWIND_VARIABLES) {
      const name = `--paseo-${spec.name}`;
      expect(lightBlock).toContain(`${name}:`);
      expect(mediaBlock).toContain(`${name}:`);
      expect(classBlock).toContain(`${name}:`);
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
    }
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
