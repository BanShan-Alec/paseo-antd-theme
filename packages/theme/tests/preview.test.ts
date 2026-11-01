import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildPreviewHtml } from "../scripts/preview-html";
import { resolveTailwindVariables } from "../src/tailwind/build";

const ROOT = join(import.meta.dirname, "..");
const artifact = readFileSync(join(ROOT, "preview.html"), "utf8").replace(/\r\n/g, "\n");

describe("preview.html artifact", () => {
  it("is fresh — regeneration reproduces the committed file", () => {
    expect(buildPreviewHtml()).toBe(artifact);
  });

  it("renders both schemes and their contrast tables", () => {
    expect(artifact).toContain("Claude Light");
    expect(artifact).toContain("Paseo Dark");
    expect(artifact.match(/文字对比度（实测）/g)?.length).toBe(2);
  });

  it("renders every type step and the two shadows", () => {
    for (const size of ["caption", "body", "subtitle", "heading-sm", "heading", "heading-lg", "display"]) {
      expect(artifact, `type step ${size}`).toContain(`<code>${size}</code>`);
    }
    expect(artifact).toContain("<code>raised</code>");
    expect(artifact).toContain("<code>overlay</code>");
  });

  it("carries no hand-written hex outside the resolved theme values", () => {
    // Every hex in the page must be a value the theme pipeline produced; the
    // generator itself contains none. This is the same discipline the demo gate
    // enforces, applied to the generated spec sheet.
    const { light, dark } = resolveTailwindVariables();
    const allowed = new Set(
      [...Object.values(light), ...Object.values(dark)]
        .flatMap((value) => value.match(/#[0-9a-fA-F]{6}\b/g) ?? [])
        .map((hex) => hex.toLowerCase()),
    );
    const hexes = new Set(artifact.match(/#[0-9a-fA-F]{6}\b/g) ?? []);
    expect(hexes.size).toBeGreaterThan(0);
    for (const hex of hexes) {
      expect(allowed.has(hex.toLowerCase()), `unexpected hex ${hex}`).toBe(true);
    }
  });
});
