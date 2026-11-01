import { writeFileSync } from "node:fs";
import { buildPreviewHtml } from "./preview-html.ts";

writeFileSync(new URL("../preview.html", import.meta.url), buildPreviewHtml());
console.log("preview.html written");
