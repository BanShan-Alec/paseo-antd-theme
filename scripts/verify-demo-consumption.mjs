import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

/**
 * "The demo consumes the package" is a promise that decays on the next edit,
 * so it is enforced here rather than trusted: no relative imports into the
 * package sources, no color/spacing/type literals in demo components.
 *
 * The package's Tailwind preset maps every utility to var(--paseo-*), which is
 * why a hex value or an inline padding in the demo is a regression, not a
 * style preference.
 */

const root = resolve(".");
const demo = join(root, "packages/demo");
const src = join(demo, "src");

const failures = [];

const FORBIDDEN = [
  { pattern: /#[0-9a-fA-F]{3,8}\b/, label: "hex color literal" },
  { pattern: /rgba?\(/, label: "rgb()/rgba() literal" },
  { pattern: /fontSize\s*:/, label: "inline fontSize" },
  { pattern: /borderRadius\s*:/, label: "inline borderRadius" },
  { pattern: /\bopacity\s*:/, label: "opacity de-emphasis" },
  {
    // Numeric inline spacing is the classic escape hatch; 0 is allowed
    // because it is a reset, not a value from a private scale.
    pattern:
      /(?:gap|padding|margin|marginTop|marginRight|marginBottom|marginLeft|paddingTop|paddingRight|paddingBottom|paddingLeft|marginInline|paddingInline)[A-Za-z]*\s*:\s*(?!0\b)\d/,
    label: "numeric inline spacing",
  },
  { pattern: /\.\.\/(?:\.\.\/)*packages\//, label: "relative import into another package" },
  { pattern: /paseo-antd-themes\/(?:src|dist)\//, label: "deep import into the package" },
];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else if (/\.(?:ts|tsx)$/.test(entry.name)) files.push(path);
  }
  return files;
}

const files = await walk(src);
for (const file of files) {
  const text = await readFile(file, "utf8");
  const lines = text.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    for (const rule of FORBIDDEN) {
      if (rule.pattern.test(line)) {
        failures.push(
          `${file.slice(root.length + 1)}:${index + 1}: ${rule.label} — ${line.trim()}`,
        );
      }
    }
  }
}

// The demo must actually go through the package entry points.
const entries = await Promise.all(
  files.map(async (file) => ({ file, text: await readFile(file, "utf8") })),
);
if (!entries.some(({ text }) => /from\s+["']paseo-antd-themes["']/.test(text))) {
  failures.push("packages/demo/src: no import from the package entry point");
}
if (
  !entries.some(({ text }) =>
    /from\s+["']paseo-antd-themes\/DESIGN\.md\?raw["']/.test(text),
  )
) {
  failures.push("packages/demo/src: DESIGN.md is not read through the package export");
}

const tailwindConfig = await readFile(join(demo, "tailwind.config.js"), "utf8");
if (!/["']paseo-antd-themes\/tailwind-preset["']/.test(tailwindConfig)) {
  failures.push("packages/demo/tailwind.config.js: the package preset is not used");
}

if (failures.length > 0) {
  console.error("demo does not fully consume the package:\n");
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

console.log(`demo consumption verified (${files.length} files)`);
