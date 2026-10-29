import { writeFileSync } from "node:fs";
import { generateTailwindCss } from "../src/tailwind/build.ts";

writeFileSync(new URL("../src/tailwind/theme.css", import.meta.url), generateTailwindCss());
console.log("src/tailwind/theme.css written");
