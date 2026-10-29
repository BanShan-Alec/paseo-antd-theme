import { writeFileSync } from "node:fs";
import {
  generateTailwindCss,
  generateTailwindPreset,
  generateTailwindVarsCss,
} from "../src/tailwind/build.ts";

writeFileSync(new URL("../src/tailwind/theme.css", import.meta.url), generateTailwindCss());
writeFileSync(
  new URL("../src/tailwind/vars.css", import.meta.url),
  generateTailwindVarsCss(),
);
writeFileSync(
  new URL("../src/tailwind/preset.cjs", import.meta.url),
  generateTailwindPreset(),
);
console.log("src/tailwind/{theme.css,vars.css,preset.cjs} written");
