import { Card, Col, Row, theme as antdTheme, Typography } from "antd";
import * as full from "../../themes/paseo-dark/theme";
import * as claude from "../../themes/claude/theme";
import {
  TokenGroup,
  TokenSwatchRow,
} from "../primitives";
import type { View } from "../view";

const { Paragraph, Text } = Typography;

export function MappingSection({ view }: { view: View }) {
  const { token } = antdTheme.useToken();
  const t = token as unknown as Record<string, string>;
  const isStockLight = view === "light";
  const isPaseoDark = view === "dark";
  const isClaude = view === "claude";
  const mapping = isPaseoDark
    ? full.PASEO_DARK_TOKEN_MAPPING
    : claude.CLAUDE_LIGHT_TOKEN_MAPPING;
  const derivedTokens = isPaseoDark
    ? full.PASEO_DERIVED_TOKENS
    : claude.CLAUDE_LIGHT_DERIVED_TOKENS;
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
        extra={isStockLight ? null : <Text type="secondary">{mapping.length} 个 antd token</Text>}
      >
        {isStockLight ? (
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            这是 antd 默认浅色主题，未覆盖任何 antd 变量（唯一例外：字体栈与深色一致，避免切换时元素位移）。
            切到「Claude 浅色」查看完整浅色方案。
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
                    borderBottom: "1px solid rgba(128,128,128,0.12)",
                    fontSize: 13,
                  }}
                >
                  <code style={{ minWidth: 190 }}>{row.antdToken}</code>
                  <span style={{ opacity: 0.65 }}>← {row.derivedFrom}</span>
                  <code style={{ marginLeft: "auto", opacity: 0.8 }}>{t[row.antdToken] ?? ""}</code>
                </div>
              ))}
            </Card>
          </Col>

          <Col xs={24} xl={12}>
            <Card
              variant="borderless"
              title="自定义 token"
              size="small"
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
