import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const dist = resolve("dist");

const FROM_SPECIFIER = /(from\s+["'])(\.\.?\/[^"']+)(["'])/g;
const DYNAMIC_SPECIFIER = /(import\(\s*["'])(\.\.?\/[^"']+)(["']\s*\))/g;

function hasRuntimeExtension(specifier) {
  return /\.(?:js|mjs|cjs|json|css)$/.test(specifier);
}

async function fixFile(path) {
  const original = await readFile(path, "utf8");
  let changed = false;

  const addExtension = (full, prefix, specifier, suffix) => {
    if (hasRuntimeExtension(specifier)) return full;
    changed = true;
    return `${prefix}${specifier}.js${suffix}`;
  };

  const next = original
    .replace(FROM_SPECIFIER, addExtension)
    .replace(DYNAMIC_SPECIFIER, addExtension);

  if (changed) await writeFile(path, next);
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (entry.name.endsWith(".d.ts")) await fixFile(path);
    }),
  );
}

await walk(dist);
console.log("fixed relative declaration imports");
