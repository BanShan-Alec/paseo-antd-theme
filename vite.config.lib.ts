import { cpSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

/** Copies the generated Tailwind stylesheet into dist as a package entry asset. */
function copyTailwindCss(): Plugin {
  return {
    name: "copy-tailwind-css",
    apply: "build",
    closeBundle() {
      cpSync(
        new URL("./src/tailwind/theme.css", import.meta.url),
        new URL("./dist/tailwind.css", import.meta.url),
      );
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    copyTailwindCss(),
    dts({
      include: ["src"],
      exclude: [
        "src/demo/**",
        "src/testing/**",
        "src/tailwind/theme.css",
        "src/App.tsx",
        "src/main.tsx",
        "src/test-setup.ts",
        "src/**/*.test.*",
      ],
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
