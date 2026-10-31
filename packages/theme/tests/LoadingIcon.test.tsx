import { cleanup, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { Spin } from "antd";
import { PaseoLoadingIcon } from "../src/LoadingIcon";
import { PaseoThemeProvider } from "../src/Provider";

const LOADING_STYLE = "style[data-paseo-loading-css]";

/** The injected style is document-level and outlives RTL's container cleanup. */
function removeLoadingStyles() {
  for (const style of document.querySelectorAll(LOADING_STYLE)) style.remove();
}

afterEach(() => {
  cleanup();
  removeLoadingStyles();
});

describe("PaseoLoadingIcon", () => {
  it("renders without a provider", () => {
    const { container } = render(<PaseoLoadingIcon />);

    const svg = container.querySelector("svg[data-paseo-loading]");
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.getAttribute("class")).toContain("paseo-loading-icon");
    expect(container.querySelector("g.paseo-loading-spin")).toBeTruthy();
  });

  it("injects its own keyframes when used standalone", () => {
    render(<PaseoLoadingIcon />);

    const styles = document.querySelectorAll(LOADING_STYLE);
    expect(styles.length).toBe(1);
    expect(styles[0]?.parentElement).toBe(document.head);
    expect(styles[0]?.textContent).toContain("@keyframes paseo-loading-rotate");
    expect(styles[0]?.textContent).toContain("animation: paseo-loading-rotate 1s linear infinite");
  });

  it("injects once for many icons", () => {
    render(
      <>
        <PaseoLoadingIcon />
        <PaseoLoadingIcon />
        <PaseoLoadingIcon />
      </>,
    );

    expect(document.querySelectorAll(LOADING_STYLE).length).toBe(1);
  });

  it("works as a Spin indicator without the provider", () => {
    const { container } = render(<Spin indicator={<PaseoLoadingIcon />} />);

    expect(container.querySelector(".ant-spin svg[data-paseo-loading]")).toBeTruthy();
    expect(document.querySelectorAll(LOADING_STYLE).length).toBe(1);
  });

  it("reuses the provider's stylesheet instead of adding a second one", () => {
    const { container } = render(
      <PaseoThemeProvider>
        <PaseoLoadingIcon />
      </PaseoThemeProvider>,
    );

    expect(container.querySelector("style[data-paseo-theme]")?.hasAttribute("data-paseo-loading-css")).toBe(
      true,
    );
    expect(document.querySelectorAll(LOADING_STYLE).length).toBe(1);
    expect(document.head.querySelectorAll(LOADING_STYLE).length).toBe(0);
  });

  it("does not emit a stylesheet during server rendering", () => {
    const html = renderToString(<PaseoLoadingIcon />);

    expect(html).toContain("data-paseo-loading");
    expect(html).not.toContain("paseo-loading-rotate");
    expect(document.querySelectorAll(LOADING_STYLE).length).toBe(0);
  });
});
