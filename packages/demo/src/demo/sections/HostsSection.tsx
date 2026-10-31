import { Card, Col, Row, Typography } from "antd";
import { Note, useSchemeTokens } from "../primitives";

const { Paragraph } = Typography;

const hosts = [
  { name: "macbook-pro", key: "violet" },
  { name: "linux-box", key: "sky" },
  { name: "ci-runner", key: "emerald" },
  { name: "gpu-node", key: "orange" },
  { name: "raspberry-pi", key: "pink" },
];

export function HostsSection() {
  const { has } = useSchemeTokens();
  const custom = has("paseoIdentityViolet");
  const selection = has("paseoSelection");

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} xl={12}>
        <Card variant="borderless" title="Host 身份色" size="small" className="h-full">
          {!custom && <Note>当前方案没有自定义身份色 token——回退 Antd 默认徽章。</Note>}
          <div className="grid gap-3">
            {hosts.map((host) => (
              <div key={host.name} className="flex items-center gap-2">
                <span
                  title={`--paseo-identity-${host.key}`}
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-xs text-xs font-semibold text-identity-ink"
                  style={{ background: `var(--paseo-identity-${host.key})` }}
                >
                  {host.name[0].toUpperCase()}
                </span>
                <span className="text-sm">{host.name}</span>
                <code className="ml-auto text-xs text-text-tertiary">
                  {`paseoIdentity${host.key.charAt(0).toUpperCase()}${host.key.slice(1)}`}
                </code>
              </div>
            ))}
          </div>
          <Paragraph type="secondary" className="mt-3 text-xs" style={{ marginBottom: 0 }}>
            十色全部压在同一对比度带——文字用 <code>paseoIdentityInk</code>（亮色白字 / 暗色墨字），
            对底色都不低于 4.5:1；颜色起识别作用，不排名。
          </Paragraph>
        </Card>
      </Col>

      <Col xs={24} xl={12}>
        <Card variant="borderless" title="Selection" size="small" className="h-full">
          {!selection && <Note>当前方案没有自定义 selection token——用浏览器默认选区色。</Note>}
          <p className="demo-selectable text-sm leading-7">
            试着选中这段文字——选区背景色来自 <code>paseoSelection</code> token。
            Paseo 把它定义为终端选区色的 Web 对应物，深色主题下是 20% 白的叠加。
          </p>
        </Card>
      </Col>
    </Row>
  );
}
