import preset from "paseo-antd-themes/tailwind-preset";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  // Every color/radius/font utility resolves to var(--paseo-*), and the
  // variables come from the package (tailwind-preset + the scoped blocks the
  // Vite plugin emits), so the demo never carries its own color values.
  presets: [preset],
  // antd v6 ships its own reset; Tailwind's preflight would fight it.
  corePlugins: { preflight: false },
};
