import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src"],
      exclude: [
        "src/demo/**",
        "src/paseo/**",
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
        claude: "src/claude.ts",
        paseo: "src/paseo.ts",
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
