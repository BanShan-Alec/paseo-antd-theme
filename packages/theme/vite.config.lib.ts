import { cpSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

/** Copies the generated Tailwind artifacts into dist as package entry assets. */
function copyTailwindAssets(): Plugin {
  const copies = [
    ["theme.css", "tailwind.css"],
    ["vars.css", "tailwind-vars.css"],
    ["preset.cjs", "tailwind-preset.cjs"],
  ] as const;
  return {
    name: "copy-tailwind-assets",
    apply: "build",
    closeBundle() {
      for (const [from, to] of copies) {
        cpSync(
          new URL(`./src/tailwind/${from}`, import.meta.url),
          new URL(`./dist/${to}`, import.meta.url),
        );
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    copyTailwindAssets(),
    dts({
      include: ["src"],
      exclude: ["src/testing/**", "src/tailwind/theme.css", "src/**/*.test.*"],
    }),
  ],
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
      },
      formats: ["es"],
      fileName: (format, entryName) =>
        `${entryName}.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: ["antd", "react", "react-dom", "react/jsx-runtime", "@ant-design/colors"],
    },
    sourcemap: false,
    minify: false,
    emptyOutDir: true,
  },
});
