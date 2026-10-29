/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  // antd v6 ships its own reset; Tailwind's preflight would fight it.
  corePlugins: { preflight: false },
  theme: { extend: {} },
  plugins: [],
};
