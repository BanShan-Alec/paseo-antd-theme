import { marked } from "marked";
import { useMemo } from "react";
import designMd from "../../../DESIGN.md?raw";
import { useSchemeTokens } from "../primitives";

const REPO_BLOB = "https://github.com/BanShan-Alec/paseo-antd-theme/blob/master";

/**
 * marked keeps heading text but not ids, and the spec links between sections.
 * Adding ids here also turns the repo-relative links into GitHub links so they
 * still work from the deployed demo.
 */
function slug(text: string): string {
  return text.replace(/\s+/g, "-");
}

function decodeFragment(fragment: string): string {
  try {
    return decodeURIComponent(fragment);
  } catch {
    return fragment;
  }
}

function renderMarkdown(markdown: string): string {
  return (marked.parse(markdown) as string)
    .replace(/<h([1-6])>([\s\S]*?)<\/h\1>/g, (_match, level: string, inner: string) => {
      const text = inner.replace(/<[^>]+>/g, "").trim();
      return `<h${level} id="${slug(text)}">${inner}</h${level}>`;
    })
    .replace(/href="#([^"]+)"/g, (_match, fragment: string) => {
      return `href="#${slug(decodeFragment(fragment))}"`;
    })
    .replace(/href="\.\/([^"#]+\.md)"/g, `href="${REPO_BLOB}/$1"`);
}

function docStyles(tokens: Record<string, string>): string {
  const border = tokens.colorBorderSecondary;
  const fill = tokens.colorFillTertiary;
  // Same scale as the demo chrome (12 / 14 / 16 headings 16–24) rather than a
  // private 13 / 15 / 17 / 22 ladder; antd's reset leaves headings at 500, so
  // the weight is pinned to the project's 400/600 pair.
  return `
.doc { color: ${tokens.colorText}; font-size: 14px; line-height: 1.7; max-width: 980px; }
.doc h1 { font-size: 24px; font-weight: 600; margin: 0 0 12px; line-height: 1.25; }
.doc h2 { font-size: 20px; font-weight: 600; margin: 32px 0 12px; padding-top: 16px; line-height: 1.35; border-top: 1px solid ${border}; }
.doc h3 { font-size: 16px; font-weight: 600; margin: 24px 0 8px; line-height: 1.4; }
.doc p { margin: 8px 0; }
.doc ul { margin: 8px 0; padding-left: 20px; }
.doc li { margin: 4px 0; }
.doc code { font-family: ${tokens.fontFamilyCode}; font-size: 12px; background: ${fill}; padding: 1px 4px; border-radius: 4px; }
.doc pre { background: ${fill}; border-radius: 8px; padding: 16px; overflow: auto; }
.doc pre code { background: none; padding: 0; font-size: 12px; }
.doc table { display: block; width: 100%; overflow-x: auto; border-collapse: collapse; margin: 12px 0; font-size: 12px; }
.doc th, .doc td { border: 1px solid ${border}; padding: 8px 12px; text-align: left; vertical-align: top; }
.doc th { background: ${fill}; font-weight: 600; }
.doc blockquote { margin: 12px 0; padding: 8px 16px; border-left: 3px solid ${tokens.colorPrimaryBorder}; background: ${fill}; color: ${tokens.colorTextSecondary}; }
.doc a { color: ${tokens.colorLink}; }
.doc hr { border: none; border-top: 1px solid ${border}; }
`;
}

export function DesignSection() {
  const { t } = useSchemeTokens();
  const html = useMemo(() => renderMarkdown(designMd), []);

  return (
    <>
      <style data-demo-design="">{docStyles(t)}</style>
      <div style={{ marginBottom: 12, color: t.colorTextTertiary, fontSize: 12 }}>
        本页内容即仓库根的 DESIGN.md，随 npm 包一起发布。
      </div>
      <div className="doc" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
