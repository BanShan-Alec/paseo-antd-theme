import { Alert, theme as antdTheme, Typography } from "antd";
import type { TokenMapping } from "paseo-antd-themes";

const { Text } = Typography;

/** Live token accessor with graceful degradation when a token is absent. */
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
      style={{ marginBottom: 16 }}
      message={<span style={{ fontSize: 14 }}>{children}</span>}
    />
  );
}

export function SpaceWrap({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>{children}</div>
  );
}

export function isColorValue(value: string | number): value is string {
  return typeof value === "string" && (value.startsWith("#") || value.startsWith("rgb"));
}

export function TokenSwatchRow({ row, live }: { row: TokenMapping; live: string | number }) {
  const { t } = useSchemeTokens();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "4px 0",
        borderBottom: `1px solid ${t.colorSplit}`,
      }}
    >
      {isColorValue(row.value) ? (
        <span
          title={row.value}
          style={{
            width: 22,
            height: 22,
            borderRadius: 4,
            background: row.value,
            border: "1px solid rgba(128,128,128,0.35)",
            flex: "none",
          }}
        />
      ) : (
        <span style={{ width: 22, flex: "none", textAlign: "center", color: t.colorTextTertiary }}>
          —
        </span>
      )}
      <code style={{ minWidth: 190 }}>{row.antdToken}</code>
      <span style={{ color: t.colorTextSecondary, minWidth: 150 }}>{row.paseoToken}</span>
      <code style={{ marginLeft: "auto", color: t.colorTextTertiary }}>{String(live)}</code>
    </div>
  );
}

export function TokenChip({ tokenKey, value }: { tokenKey: string; value: string }) {
  return (
    <span
      title={`${tokenKey} = ${value}`}
      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
    >
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: 4,
          background: value,
          border: "1px solid rgba(128,128,128,0.35)",
          flex: "none",
        }}
      />
      <code style={{ fontSize: 12 }}>{tokenKey.replace(/^paseo/, "")}</code>
    </span>
  );
}

export function TokenGroup({ title, tokens }: { title: string; tokens: Record<string, string> }) {
  const entries = Object.entries(tokens);
  if (entries.length === 0) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <Text type="secondary" style={{ fontSize: 12 }}>
        {title}（{entries.length}）
      </Text>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginTop: 4 }}>
        {entries.map(([key, value]) => (
          <TokenChip key={key} tokenKey={key} value={value} />
        ))}
      </div>
    </div>
  );
}
