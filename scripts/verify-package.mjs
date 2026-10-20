import { execFileSync } from "node:child_process";
import { access, mkdtemp, readFile, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(".");
const dist = join(root, "dist");
const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const temp = await mkdtemp(join(tmpdir(), "paseo-pack-"));

function fail(message) {
  throw new Error(message);
}

function npmEnv() {
  // npm publish runs lifecycle scripts with npm_config_dry_run and friends in
  // the environment; the child `npm pack` must not inherit them or it silently
  // writes no tarball file.
  const env = { ...process.env };
  delete env.npm_config_dry_run;
  delete env.npm_dry_run;
  return env;
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files;
}

try {
  await access(join(dist, "index.js"));

  const packJson = execFileSync(
    "npm",
    ["pack", "--ignore-scripts", "--json", "--pack-destination", temp],
    { cwd: root, encoding: "utf8", env: npmEnv() },
  );
  const [pack] = JSON.parse(packJson);
  const tarball = join(temp, pack.filename);
  if (!(await stat(tarball)).isFile()) {
    fail(`npm pack reported ${pack.filename} but the file does not exist`);
  }
  const packed = new Set(pack.files.map((file) => file.path));

  const required = [
    "README.md",
    "DESIGN.md",
    "MAPPING.md",
    "LICENSE",
    "docs/paseo-dark.png",
    "docs/claude-light.png",
    "dist/index.js",
    "dist/index.d.ts",
    "dist/claude.js",
    "dist/claude.d.ts",
    "dist/paseo.js",
    "dist/paseo.d.ts",
  ];
  for (const file of required) {
    if (!packed.has(file)) fail(`missing from tarball: ${file}`);
  }

  for (const file of packed) {
    if (/\.cjs(?:\.map)?$/.test(file)) fail(`unexpected CJS artifact: ${file}`);
  }

  for (const [entry, conditions] of Object.entries(pkg.exports ?? {})) {
    if (entry === "./package.json") continue;
    for (const [condition, target] of Object.entries(conditions)) {
      if (!["types", "import", "default"].includes(condition)) continue;
      const relative = target.replace(/^\.\//, "");
      if (!packed.has(relative)) fail(`exports ${entry}.${condition} -> missing ${relative}`);
    }
  }

  for (const entry of ["index", "claude", "paseo"]) {
    const mod = await import(pathToFileURL(join(dist, `${entry}.js`)).href);
    if (Object.keys(mod).length === 0) fail(`empty ESM entry: ${entry}`);
  }

  const declarationFiles = (await walk(dist)).filter((file) => file.endsWith(".d.ts"));
  const badImports = [];
  for (const file of declarationFiles) {
    const text = await readFile(file, "utf8");
    for (const match of text.matchAll(/(?:from\s+|import\(\s*)["'](\.\.?\/[^"']+)["']/g)) {
      if (!/\.(?:js|mjs|cjs|json|css)$/.test(match[1])) {
        badImports.push(`${file}: ${match[1]}`);
      }
    }
  }
  if (badImports.length > 0) {
    fail(`extensionless relative declaration imports:\n${badImports.join("\n")}`);
  }

  const npx = process.platform === "win32" ? "npx.cmd" : "npx";
  execFileSync(npx, ["publint", "run", tarball, "--strict"], {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env: npmEnv(),
  });
  execFileSync(npx, ["attw", tarball, "--profile", "esm-only"], {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env: npmEnv(),
  });

  console.log("package verification passed");
} finally {
  await rm(temp, { recursive: true, force: true });
}
