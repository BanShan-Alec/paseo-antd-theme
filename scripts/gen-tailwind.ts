import { writeFileSync } from "node:fs";
import { buildTailwindCss } from "../src/tailwind/build.ts";

writeFileSync(new URL("../src/tailwind/theme.css", import.meta.url), buildTailwindCss());
console.log("src/tailwind/theme.css written");
