/**
 * Builds `preview.html` — the one-page spec sheet.
 *
 * Every value comes from the same resolvers the package ships with
 * (`resolveTailwindVariables` + antd's own token pipeline), so the page can
 * never drift from `tailwind.css` / `MAPPING.md`. Nothing here is hand-typed:
 * adding a variable to `TAILWIND_VARIABLES` adds a swatch on the next run.
 */
import { theme as antdTheme } from "antd";
import { contrast } from "../src/testing/contrast.ts";
import { claudeLightTheme } from "../src/themes/claude/theme.ts";
import { paseoDarkTheme } from "../src/themes/paseo-dark/theme.ts";
import { resolveTailwindVariables, TAILWIND_VARIABLES } from "../src/tailwind/build.ts";

type TokenSet = ReturnType<typeof antdTheme.getDesignToken>;

interface Scheme {
  readonly key: "light" | "dark";
  readonly title: string;
  readonly subtitle: string;
  readonly values: Record<string, string>;
  readonly tokens: TokenSet;
}

const { light, dark } = resolveTailwindVariables();
const schemes: readonly Scheme[] = [
  {
    key: "light",
    title: "Claude Light",
    subtitle: "浅色槽 · :root",
    values: light,
    tokens: antdTheme.getDesignToken(claudeLightTheme),
  },
  {
    key: "dark",
    title: "Paseo Dark",
    subtitle: "深色槽 · media / .dark",
    values: dark,
    tokens: antdTheme.getDesignToken(paseoDarkTheme),
  },
];

const esc = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const COLOR_GROUPS = ["表面", "文字", "主色", "状态色", "链接", "边框与分隔", "填充", "控件底色", "Diff", "状态点", "身份色", "选区"];

function colorSwatches(scheme: Scheme, group: string): string {
  const specs = TAILWIND_VARIABLES.filter((spec) => spec.kind === "color" && spec.group === group);
  if (specs.length === 0) return "";
  const isText = group === "文字";
  const card = scheme.values["surface-1"];
  const items = specs
    .map((spec) => {
      const value = scheme.values[spec.name];
      const style = isText
        ? `background:${esc(card)};color:${esc(value)}`
        : `background:${esc(value)}`;
      return `<figure class="swatch">
        <div class="chip" style="${style}">${isText ? "Aa 正文" : ""}</div>
        <figcaption><code>${esc(spec.name)}</code><span>${esc(value)}</span></figcaption>
      </figure>`;
    })
    .join("");
  return `<section class="group"><h3>${esc(group)}</h3><div class="swatches">${items}</div></section>`;
}

function contrastTable(scheme: Scheme): string {
  const surfaces: readonly [string, string][] = [
    ["页面底", "surface-0"],
    ["容器", "surface-1"],
    ["浮层", "surface-2"],
    ["面板头", "surface-head"],
    ["卡片 hover", "surface-hover"],
  ];
  const tiers: readonly [string, string, "aa" | "meta" | "none"][] = [
    ["一 · 正文", "text", "aa"],
    ["二 · 次要", "text-secondary", "aa"],
    ["三 · 三级", "text-tertiary", "meta"],
    ["四 · 四级", "text-quaternary", "none"],
  ];
  const head = `<tr><th>文字档位</th>${surfaces.map(([label]) => `<th>${label}</th>`).join("")}</tr>`;
  const rows = tiers
    .map(([label, name, floor]) => {
      const cells = surfaces
        .map(([, surfaceName]) => {
          const ratio = contrast(scheme.values[name], scheme.values[surfaceName]);
          const shown = ratio.toFixed(2);
          if (floor === "none") return `<td class="na">${shown}</td>`;
          const limit = floor === "aa" ? 4.5 : surfaceName === "surface-0" || surfaceName === "surface-1" ? 4.5 : 4;
          return `<td class="${ratio >= limit ? "ok" : "bad"}">${shown}</td>`;
        })
        .join("");
      return `<tr><th>${label}</th>${cells}</tr>`;
    })
    .join("");
  return `<section class="group"><h3>文字对比度（实测）</h3>
    <p class="hint">一、二级对所有承载文字的表面 ≥ 4.5；三级对页面底与容器 ≥ 4.5，对其余表面 ≥ 4.0；四级只用于禁用态与占位符。</p>
    <table class="contrast">${head}${rows}</table></section>`;
}

function typeScale(): string {
  const rows = TAILWIND_VARIABLES.filter((spec) => spec.kind === "fontSize")
    .map((spec) => {
      const size = light[spec.name];
      const lineHeight = spec.lineHeight === undefined ? "" : light[spec.lineHeight.name];
      const label = spec.name.replace(/^text-/, "");
      return `<div class="type-row">
        <div class="type-meta"><code>${esc(label)}</code><span>${esc(size)} / ${esc(lineHeight)}</span></div>
        <div class="type-sample" style="font-size:${esc(size)};line-height:${esc(lineHeight)}">设计规范 · ${esc(label)}</div>
      </div>`;
    })
    .join("");
  return `<section class="group"><h3>字号阶梯（两套方案共用）</h3>
    <p class="hint">12 / 14 / 16 是 pin 的；16 / 20 / 24 / 30 / 38 由 antd 从 <code>fontSize</code> 派生。行高随字号派生，不要逐块手设。</p>
    ${rows}</section>`;
}

function spacingScale(scheme: Scheme): string {
  const steps: readonly [string, string][] = [
    ["XXS", "sizeXXS"],
    ["XS", "sizeXS"],
    ["SM", "sizeSM"],
    ["base", "size"],
    ["MD", "sizeMD"],
    ["LG", "sizeLG"],
    ["XL", "sizeXL"],
    ["XXL", "sizeXXL"],
  ];
  const bars = steps
    .map(([label, token]) => {
      const value = Number((scheme.tokens as unknown as Record<string, number>)[token]);
      return `<div class="space-row"><code>${label}</code><span class="bar" style="width:${value}px"></span><span>${value}px</span></div>`;
    })
    .join("");
  return `<section class="group"><h3>间距刻度（4px 栅格）</h3>
    <p class="hint">工作档位是 8 / 12 / 16；4 只给图标与文字的贴合间距，20 以上只给区块之间与页面留白。组外间距必须大于组内间距。</p>
    ${bars}</section>`;
}

function radiusAndShadow(scheme: Scheme): string {
  const radii = TAILWIND_VARIABLES.filter((spec) => spec.name.startsWith("radius-"))
    .map((spec) => {
      const value = scheme.values[spec.name];
      return `<figure class="swatch"><div class="chip radius" style="border-radius:${esc(value)}"></div>
        <figcaption><code>${esc(spec.name.replace(/^radius-/, ""))}</code><span>${esc(value)}</span></figcaption></figure>`;
    })
    .join("");
  const shadows = TAILWIND_VARIABLES.filter((spec) => spec.name.startsWith("shadow-"))
    .map((spec) => {
      const value = scheme.values[spec.name];
      return `<figure class="swatch"><div class="chip" style="background:${esc(scheme.values["surface-1"])};box-shadow:${esc(value)}"></div>
        <figcaption><code>${esc(spec.name.replace(/^shadow-/, ""))}</code><span>${esc(value)}</span></figcaption></figure>`;
    })
    .join("");
  return `<section class="group"><h3>圆角与阴影</h3>
    <p class="hint">圆角只有 12 / 8 / 4 三档；阴影只有「抬起」和「浮层」两级，静止区块不加阴影。</p>
    <div class="swatches">${radii}${shadows}</div></section>`;
}

function schemeSection(scheme: Scheme): string {
  const groups = COLOR_GROUPS.map((group) => colorSwatches(scheme, group)).join("");
  return `<section class="scheme scheme-${scheme.key}" style="background:${esc(scheme.values["surface-0"])};color:${esc(scheme.values.text)};border-color:${esc(scheme.values.border)}">
    <header class="scheme-head">
      <h2>${esc(scheme.title)}</h2><span class="tag" style="background:${esc(scheme.values["surface-2"])};color:${esc(scheme.values["text-secondary"])}">${esc(scheme.subtitle)}</span>
    </header>
    ${groups}
    ${contrastTable(scheme)}
    ${radiusAndShadow(scheme)}
  </section>`;
}

export function buildPreviewHtml(): string {
  const chrome = schemes[0];
  const lightValues = chrome.values;
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>paseo-antd-themes · 设计规范一页版</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 32px 24px 64px;
    background: ${esc(lightValues["surface-0"])};
    color: ${esc(lightValues.text)};
    font-family: ${esc(lightValues.font)};
    font-size: 14px;
    line-height: 1.5714;
  }
  .page { max-width: 1180px; margin: 0 auto; }
  .page > header { margin-bottom: 24px; }
  h1 { margin: 0 0 4px; font-size: 24px; line-height: 32px; font-weight: 600; }
  .meta { margin: 0; color: ${esc(lightValues["text-secondary"])}; font-size: 12px; line-height: 20px; }
  .scheme {
    margin: 0 0 24px;
    padding: 24px;
    border: 1px solid;
    border-radius: 12px;
  }
  .scheme-head { display: flex; align-items: baseline; gap: 12px; margin-bottom: 8px; }
  .scheme-head h2 { margin: 0; font-size: 20px; line-height: 28px; font-weight: 600; }
  .tag { padding: 2px 8px; border-radius: 8px; font-size: 12px; line-height: 20px; }
  .group { margin-top: 24px; }
  .group h3 { margin: 0 0 8px; font-size: 16px; line-height: 24px; font-weight: 600; }
  .hint { margin: 0 0 12px; font-size: 12px; line-height: 20px; opacity: .8; }
  .swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(148px, 1fr)); gap: 12px; }
  .swatch { margin: 0; }
  .chip {
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, .08);
    font-size: 12px;
  }
  .chip.radius { background: currentColor; opacity: .18; }
  figcaption { display: flex; flex-direction: column; margin-top: 4px; font-size: 12px; line-height: 16px; }
  figcaption code { font-family: ${esc(lightValues["font-mono"])}; }
  figcaption span { opacity: .7; }
  .contrast { width: 100%; border-collapse: collapse; font-size: 12px; }
  .contrast th, .contrast td { padding: 6px 8px; border: 1px solid currentColor; text-align: left; }
  .contrast th { font-weight: 600; }
  .contrast td { font-family: ${esc(lightValues["font-mono"])}; }
  .contrast td.ok::after { content: " ✓"; }
  .contrast td.bad { font-weight: 700; }
  .contrast td.bad::after { content: " ✕"; }
  .contrast td.na { opacity: .55; }
  .type-row { display: flex; gap: 16px; align-items: baseline; padding: 6px 0; border-top: 1px solid rgba(128, 128, 128, .25); }
  .type-meta { display: flex; flex-direction: column; width: 160px; flex: none; font-size: 12px; line-height: 16px; }
  .type-meta code { font-family: ${esc(lightValues["font-mono"])}; }
  .type-meta span { opacity: .7; }
  .type-sample { min-width: 0; }
  .space-row { display: flex; align-items: center; gap: 12px; padding: 3px 0; font-size: 12px; }
  .space-row code { width: 48px; flex: none; font-family: ${esc(lightValues["font-mono"])}; }
  .space-row span:last-child { opacity: .7; }
  .bar { display: block; height: 12px; border-radius: 4px; background: ${esc(lightValues["primary-bg"])}; border: 1px solid ${esc(lightValues["primary-border"])}; }
  @media (max-width: 720px) {
    body { padding: 16px 12px 32px; }
    .scheme { padding: 16px; }
    .type-row { flex-direction: column; gap: 2px; }
  }
</style>
</head>
<body>
<div class="page">
  <header>
    <h1>paseo-antd-themes · 设计规范一页版</h1>
    <p class="meta">由 <code>scripts/gen-preview.ts</code> 从主题配置生成，请勿手改 · 取值与 MAPPING.md / tailwind.css 同源 · 用法规则见 DESIGN.md</p>
  </header>
  ${schemes.map(schemeSection).join("\n  ")}
  <section class="scheme" style="background:${esc(lightValues["surface-1"])};color:${esc(lightValues.text)};border-color:${esc(lightValues.border)}">
    ${typeScale()}
    ${spacingScale(chrome)}
  </section>
</div>
</body>
</html>
`;
}
