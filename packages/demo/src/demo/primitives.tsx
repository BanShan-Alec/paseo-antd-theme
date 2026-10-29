import { Alert, theme as antdTheme, Typography } from "antd";
import type { TokenMapping } from "paseo-antd-themes";

const { Text } = Typography;

/** Live token accessor for behavior checks (is a custom token present?). */
export function useSchemeTokens() {
  const { token } = antdTheme.useToken();
  const t = token as unknown as Record<string, string>;
  return {
    t,
    has: (key: string) => Boolean(t[key]),
    get: (key: string, fallback: string) => t[key] ?? fallback,
  };
}

export function Note({ children }: { children: React.ReactNode }) {
  return (
    <Alert
      type="info"
      showIcon
      className="mb-4"
      message={<span className="text-sm">{children}</span>}
    />
  );
}

export function SpaceWrap({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

export function isColorValue(value: string | number): value is string {
  return typeof value === "string" && (value.startsWith("#") || value.startsWith("rgb"));
}

export function TokenSwatchRow({ row, live }: { row: TokenMapping; live: string | number }) {
  return (
    <div className="flex items-center gap-3 border-b border-split py-1">
      {isColorValue(row.value) ? (
        <span
          title={row.value}
          className="h-5 w-5 shrink-0 rounded-xs border border-black/20"
          style={{ background: row.value }}
        />
      ) : (
        <span className="w-5 shrink-0 text-center text-text-tertiary">—</span>
      )}
      <code className="min-w-48">{row.antdToken}</code>
      <span className="min-w-36 text-text-secondary">{row.paseoToken}</span>
      <code className="ml-auto text-text-tertiary">{String(live)}</code>
    </div>
  );
}

export function TokenChip({ tokenKey, value }: { tokenKey: string; value: string }) {
  return (
    <span title={`${tokenKey} = ${value}`} className="inline-flex items-center gap-2">
      <span
        className="h-3.5 w-3.5 shrink-0 rounded-xs border border-black/20"
        style={{ background: value }}
      />
      <code className="text-xs">{tokenKey.replace(/^paseo/, "")}</code>
    </span>
  );
}

export function TokenGroup({ title, tokens }: { title: string; tokens: Record<string, string> }) {
  const entries = Object.entries(tokens);
  if (entries.length === 0) return null;
  return (
    <div className="mt-2">
      <Text type="secondary" className="text-xs">
        {title}（{entries.length}）
      </Text>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-2">
        {entries.map(([key, value]) => (
          <TokenChip key={key} tokenKey={key} value={value} />
        ))}
      </div>
    </div>
  );
}
