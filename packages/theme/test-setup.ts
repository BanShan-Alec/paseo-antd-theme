// jsdom has no matchMedia; antd's responsive observer (used by Grid, Table,
// Descriptions) calls it on mount.
if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

// jsdom has no ResizeObserver; rc-virtual-list (Select, Table) instantiates it
// when a popup/list mounts.
if (typeof globalThis.ResizeObserver !== "function") {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}

// jsdom does not implement getComputedStyle(el, pseudoElt): it logs a virtual
// console error on every call, and antd's Table passes a pseudo-element while
// measuring the scrollbar. Dropping the argument returns the base element's
// style — all that measurement needs — and keeps real failures visible.
if (typeof window !== "undefined") {
  const originalGetComputedStyle = window.getComputedStyle.bind(window);
  window.getComputedStyle = ((element: Element) =>
    originalGetComputedStyle(element)) as typeof window.getComputedStyle;
}
