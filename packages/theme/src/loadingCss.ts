import { createContext } from "react";
import {
  PASEO_LOADING_CSS,
  PASEO_LOADING_CSS_ATTRIBUTE,
} from "./themeStyles";

/**
 * True for icons rendered inside a provider that already emitted the loading
 * CSS. The provider's <style> lives in the tree, so a child insertion effect
 * cannot reliably see it in the DOM yet — the context makes that decision
 * deterministic. The attribute check below still covers icons mounted in a
 * different root (portals, static `message` calls).
 */
export const PaseoLoadingCssContext = createContext(false);

/**
 * `PaseoLoadingIcon` renders correctly on its own, without the provider. The
 * only thing it cannot inline is the keyframes, so the first icon mounted on
 * the client puts them in <head> once. Both this helper and the provider tag
 * their <style> with the same attribute, so whichever lands first wins and the
 * other skips.
 */
export function hasLoadingCss(): boolean {
  if (typeof document === "undefined") return false;
  return document.querySelector(`style[${PASEO_LOADING_CSS_ATTRIBUTE}]`) !== null;
}

/** Client-only; a no-op on the server and when the CSS is already present. */
export function ensureLoadingCss(): void {
  if (typeof document === "undefined" || hasLoadingCss()) return;
  const style = document.createElement("style");
  style.setAttribute(PASEO_LOADING_CSS_ATTRIBUTE, "");
  style.textContent = PASEO_LOADING_CSS;
  document.head.appendChild(style);
}
