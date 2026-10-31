/**
 * Demo-only chrome icons. Inlined instead of pulling `@ant-design/icons` into
 * the demo: that package is a transitive antd dependency, and the library
 * itself avoids depending on another project's node_modules.
 */

interface IconProps {
  title?: string;
}

const base = {
  width: "1em",
  height: "1em",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function SunIcon({ title }: IconProps) {
  return (
    <svg {...base} role={title ? "img" : undefined} aria-label={title}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

export function MoonIcon({ title }: IconProps) {
  return (
    <svg {...base} role={title ? "img" : undefined} aria-label={title}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

export function SystemIcon({ title }: IconProps) {
  return (
    <svg {...base} role={title ? "img" : undefined} aria-label={title}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

export function MenuIcon({ title }: IconProps) {
  return (
    <svg {...base} role={title ? "img" : undefined} aria-label={title}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
