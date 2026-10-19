import { useId, type SVGProps } from "react";

function joinClassNames(...values: (string | undefined)[]): string {
  return values.filter(Boolean).join(" ");
}

/**
 * Loading spinner adapted from `@ant-design/icons`' internal LoadingIcon
 * (two gradient arcs plus a hairline connector), copied locally so the theme
 * has no dependency on another project's node_modules. `currentColor` keeps
 * it correct on primary buttons, text buttons and Spin.
 *
 * The rotation lives on the inner <g>, matching the reference: the outer 1em
 * box stays static, so the icon does not shimmer or jitter at small sizes.
 */
export function ClaudeLoadingIcon(props: SVGProps<SVGSVGElement>) {
  const { className, ...rest } = props;
  // useId keeps the SVG gradient ids unique per rendered instance; colons are
  // stripped because they are awkward inside url(#...) references.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const idTop = `claude-loading-top-${uid}`;
  const idDown = `claude-loading-down-${uid}`;
  const idHeader = `claude-loading-header-${uid}`;

  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 12 12"
      fill="none"
      color="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      data-icon="loading"
      data-claude-loading=""
      aria-hidden="true"
      className={joinClassNames("claude-loading-icon", className)}
      {...rest}
    >
      <g className="claude-loading-spin" strokeWidth="2.42">
        <path
          d="M1.35561 5.96553C1.36473 4.7336 1.86287 3.55573 2.74043 2.69107C3.618 1.82642 4.80311 1.34578 6.03505 1.35491C7.26698 1.36403 8.44485 1.86217 9.30951 2.73973C10.1742 3.6173 10.6548 4.80241 10.6457 6.03434"
          stroke={`url(#${idTop})`}
        />
        <path
          d="M10.6452 6C10.6452 7.23197 10.1558 8.41349 9.28465 9.28463C8.41351 10.1558 7.23199 10.6452 6.00002 10.6452C4.76805 10.6452 3.58653 10.1558 2.71539 9.28463C1.84426 8.41349 1.35486 7.23197 1.35486 6"
          stroke={`url(#${idDown})`}
        />
        <path
          d="M1.35487 6C1.35453 5.96773 1.35453 5.93549 1.35487 5.90322"
          stroke={`url(#${idHeader})`}
          strokeLinecap="round"
        />
      </g>
      <defs>
        <linearGradient id={idTop} x1="0" y1="6" x2="12" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0.106214" stopColor="currentColor" stopOpacity="0" />
          <stop offset="0.835524" stopColor="currentColor" stopOpacity="0.66" />
        </linearGradient>
        <linearGradient
          id={idDown}
          x1="1.35486"
          y1="6"
          x2="12"
          y2="6"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient
          id={idHeader}
          x1="1.35487"
          y1="6"
          x2="1.35487"
          y2="6.3871"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
