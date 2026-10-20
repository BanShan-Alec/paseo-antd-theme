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
  const { t, get, has } = useSchemeTokens();
  const identityKeys = Object.keys(t)
    .filter((key) => key.startsWith("paseoIdentity"))
    .sort();
  const custom = identityKeys.length > 0;
  const selection = t.paseoSelection;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} xl={12}>
        <Card variant="borderless" title="Host 身份色" size="small">
          {!custom && <Note>当前方案没有自定义身份色 token——回退 antd 默认徽章。</Note>}
          <div style={{ display: "grid", gap: 10 }}>
            {hosts.map((host, i) => {
              const key = identityKeys[i % identityKeys.length];
              const color = key ? get(key, t.colorPrimary) : t.colorPrimary;
              return (
                <div key={host.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    title={key ?? ""}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 4,
                      background: color,
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      flex: "none",
                    }}
                  >
                    {host.name[0].toUpperCase()}
                  </span>
                  <span style={{ fontSize: 13 }}>{host.name}</span>
                  <code style={{ fontSize: 11, opacity: 0.6, marginLeft: "auto" }}>
                    {key ?? "antd 默认"}
                  </code>
                </div>
              );
            })}
          </div>
          <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 12, marginBottom: 0 }}>
            十色全部压在同一对比度带（对白字 ≥4.2:1）——颜色起识别作用，不排名。
          </Paragraph>
        </Card>
      </Col>

      <Col xs={24} xl={12}>
        <Card variant="borderless" title="Selection" size="small">
          {selection && (
            <style>{`.demo-selectable::selection { background: ${selection}; }`}</style>
          )}
          {!selection && <Note>当前方案没有自定义 selection token——用浏览器默认选区色。</Note>}
          <p className="demo-selectable" style={{ fontSize: 13, lineHeight: 1.8 }}>
            试着选中这段文字——选区背景色来自 <code>paseoSelection</code> token。
            Paseo 把它定义为终端选区色的 Web 对应物，深色主题下是 20% 白的叠加。
          </p>
        </Card>
      </Col>
    </Row>
  );
}
