import { marked } from "marked";
import { useMemo } from "react";
import designMd from "paseo-antd-themes/DESIGN.md?raw";

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

export function DesignSection() {
  const html = useMemo(() => renderMarkdown(designMd), []);

  return (
    <>
      <div className="mb-3 text-xs text-text-tertiary">
        本页内容即仓库根的 DESIGN.md，随 npm 包一起发布。
      </div>
      <div className="doc" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
