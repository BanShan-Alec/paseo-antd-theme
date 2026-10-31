import { Card, Col, Row } from "antd";

const LEVELS = [
  {
    token: "colorText",
    className: "text-text",
    role: "正文、标题、表格内容",
    sample: "Agent 已完成 3 项任务，等待合并",
  },
  {
    token: "colorTextSecondary",
    className: "text-text-secondary",
    role: "说明、副标题、未选中菜单",
    sample: "上次运行 12 分钟前 · claude-code",
  },
  {
    token: "colorTextTertiary",
    className: "text-text-tertiary",
    role: "元信息、时间戳、帮助文本",
    sample: "日志保留 7 天，导出后即可清理",
  },
  {
    token: "colorTextQuaternary",
    className: "text-text-quaternary",
    role: "占位符、禁用态",
    sample: "搜索 agent、文件、命令…",
  },
] as const;

export function TypographySection() {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24}>
        <Card variant="borderless" title="文字阶梯" size="small">
          {LEVELS.map((level, index) => (
            <div
              key={level.token}
              className={`flex items-center gap-4 py-3 ${index === 0 ? "" : "border-t border-split"}`}
            >
              <span className={`${level.className} min-w-0 flex-1 text-sm`}>{level.sample}</span>
              <span className="w-44 shrink-0 text-xs text-text-tertiary">{level.role}</span>
              <code className="w-48 shrink-0 text-xs text-text-tertiary">{level.token}</code>
            </div>
          ))}
        </Card>
      </Col>

      <Col xs={24}>
        <Card variant="borderless" title="实际用法" size="small">
          <div className="flex justify-between gap-4">
            <div>
              <div className="text-sm text-text">修复 build 缓存失效</div>
              <div className="mt-1 text-xs text-text-secondary">claude-code · 3 个文件变更</div>
            </div>
            <div className="whitespace-nowrap text-right">
              <div className="text-xs text-text-tertiary">12 分钟前</div>
              <div className="text-xs text-text-tertiary">128 · 保留 7 天</div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 border-t border-split pt-3">
            <span className="text-sm text-text-quaternary">搜索 agent、文件、命令…</span>
            <span className="text-xs text-text-quaternary">已归档（禁用）</span>
          </div>
        </Card>
      </Col>
    </Row>
  );
}
