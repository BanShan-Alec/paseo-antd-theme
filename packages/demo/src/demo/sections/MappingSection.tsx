import { Card, Col, Row, theme as antdTheme, Typography } from "antd";
import {
  CLAUDE_LIGHT_DERIVED_TOKENS,
  CLAUDE_LIGHT_TOKEN_MAPPING,
  PASEO_DARK_TOKEN_MAPPING,
  PASEO_DERIVED_TOKENS,
} from "paseo-antd-themes";
import {
  TokenGroup,
  TokenSwatchRow,
} from "../primitives";
import type { View } from "../view";

const { Paragraph, Text } = Typography;

export function MappingSection({ view, isLight }: { view: View; isLight: boolean }) {
  const { token } = antdTheme.useToken();
  const t = token as unknown as Record<string, string>;
  // Which theme is actually on screen depends on both the pair and the
  // resolved scheme — the demo follows the OS inside every view.
  const isStock = view === "antd" || (view === "mixed" && isLight);
  const isPaseoDark = !isLight && view !== "antd";
  const isClaude = isLight && view === "paseo";
  const mapping = isPaseoDark ? PASEO_DARK_TOKEN_MAPPING : CLAUDE_LIGHT_TOKEN_MAPPING;
  const derivedTokens = isPaseoDark ? PASEO_DERIVED_TOKENS : CLAUDE_LIGHT_DERIVED_TOKENS;
  const showDerived = isPaseoDark || isClaude;

  const customTokens = Object.fromEntries(
    Object.keys(t)
      .filter((key) => key.startsWith("paseo"))
      .sort()
      .map((key) => [key, t[key]]),
  );
  const pickGroup = (prefix: string) =>
    Object.fromEntries(Object.entries(customTokens).filter(([key]) => key.startsWith(prefix)));

  return (
    <>
      <Card
        variant="borderless"
        title="Token 映射（实时解析值）"
        size="small"
        extra={isStock ? null : <Text type="secondary">{mapping.length} 个 antd token</Text>}
      >
        {isStock ? (
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            antd 原生配色 + 本包形态：颜色、填充、边框、阴影全部由 antd 算法派生；控件高度、圆角、
            Select 行高、Segmented 轨道内边距和字体栈与内置主题一致，所以换槽位只换颜色、不跳尺寸。
            切到「Claude + Paseo」查看完整方案。
          </Paragraph>
        ) : (
          mapping.map((row) => <TokenSwatchRow key={row.antdToken} row={row} live={t[row.antdToken]} />)
        )}
      </Card>

      {showDerived && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} xl={12}>
            <Card
              variant="borderless"
              title="antd 自行派生的 token"
              size="small"
              style={{ height: "100%" }}
              extra={<Text type="secondary">无需手动设置</Text>}
            >
              <Paragraph type="secondary" style={{ fontSize: 12 }}>
                这些别名 token 由 antd 在最后一步从受控 token 计算得出——手动覆盖会被静默丢弃，
                完整方案里只登记派生来源。
              </Paragraph>
              {derivedTokens.map((row) => (
                <div
                  key={row.antdToken}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "4px 0",
                    borderBottom: `1px solid ${t.colorSplit}`,
                    fontSize: 12,
                  }}
                >
                  <code style={{ minWidth: 190 }}>{row.antdToken}</code>
                  <span style={{ color: t.colorTextTertiary }}>← {row.derivedFrom}</span>
                  <code style={{ marginLeft: "auto", color: t.colorTextSecondary }}>
                    {t[row.antdToken] ?? ""}
                  </code>
                </div>
              ))}
            </Card>
          </Col>

          <Col xs={24} xl={12}>
            <Card
              variant="borderless"
              title="自定义 token"
              size="small"
              style={{ height: "100%" }}
              extra={<Text type="secondary">{Object.keys(customTokens).length} 个</Text>}
            >
              <Paragraph type="secondary" style={{ fontSize: 12 }}>
                antd 没有对应概念的部分，以自定义 token 注入，经 <code>useToken()</code>{" "}
                或 CSS 变量读取。左侧各演示页展示了它们对应的组件。
              </Paragraph>
              <TokenGroup title="Surface 阶梯" tokens={pickGroup("paseoSurface")} />
              <TokenGroup title="Diff" tokens={pickGroup("paseoDiff")} />
              <TokenGroup title="状态圆点与 merged" tokens={pickGroup("paseoStatus")} />
              <TokenGroup title="Selection" tokens={pickGroup("paseoSelection")} />
              <TokenGroup title="Host 身份色" tokens={pickGroup("paseoIdentity")} />
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
}
