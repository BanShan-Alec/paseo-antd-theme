import { Card, Col, Row } from "antd";
import { useSchemeTokens } from "../primitives";

const LEVELS = [
  {
    token: "colorText",
    role: "正文、标题、表格内容",
    sample: "Agent 已完成 3 项任务，等待合并",
  },
  {
    token: "colorTextSecondary",
    role: "说明、副标题、未选中菜单",
    sample: "上次运行 12 分钟前 · claude-code",
  },
  {
    token: "colorTextTertiary",
    role: "元信息、时间戳、帮助文本",
    sample: "日志保留 7 天，导出后即可清理",
  },
  {
    token: "colorTextQuaternary",
    role: "占位符、禁用态",
    sample: "搜索 agent、文件、命令…",
  },
] as const;

export function TypographySection() {
  const { t } = useSchemeTokens();

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24}>
        <Card variant="borderless" title="文字阶梯" size="small">
          {LEVELS.map((level, index) => (
            <div
              key={level.token}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "10px 0",
                borderTop:
                  index === 0 ? undefined : "1px solid var(--paseo-split, rgba(128,128,128,0.12))",
              }}
            >
              <span style={{ color: t[level.token], fontSize: 14, flex: 1, minWidth: 0 }}>
                {level.sample}
              </span>
              <span
                style={{
                  color: t.colorTextTertiary,
                  fontSize: 12,
                  width: 180,
                  flex: "none",
                }}
              >
                {level.role}
              </span>
              <code style={{ color: t.colorTextTertiary, fontSize: 12, width: 190, flex: "none" }}>
                {level.token}
              </code>
            </div>
          ))}
        </Card>
      </Col>

      <Col xs={24} xl={10}>
        <Card variant="borderless" title="实际用法" size="small">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ color: t.colorText, fontSize: 14 }}>修复 build 缓存失效</div>
              <div style={{ color: t.colorTextSecondary, fontSize: 12, marginTop: 2 }}>
                claude-code · 3 个文件变更
              </div>
            </div>
            <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
              <div style={{ color: t.colorTextTertiary, fontSize: 12 }}>12 分钟前</div>
              <div style={{ color: t.colorTextTertiary, fontSize: 12 }}>#128 · 保留 7 天</div>
            </div>
          </div>
          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: "1px solid var(--paseo-split, rgba(128,128,128,0.12))",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ color: t.colorTextQuaternary, fontSize: 14 }}>
              搜索 agent、文件、命令…
            </span>
            <span style={{ color: t.colorTextQuaternary, fontSize: 12 }}>已归档（禁用）</span>
          </div>
        </Card>
      </Col>
    </Row>
  );
}
