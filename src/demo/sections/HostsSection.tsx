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
    .filter((key) => key.startsWith("paseoIdentity") && key !== "paseoIdentityInk")
    .sort();
  const custom = identityKeys.length > 0;
  const selection = t.paseoSelection;
  // The scheme decides the letter color: white on the light scheme's fills,
  // ink on the dark scheme's pastels. Stock antd (no identity tokens) keeps
  // antd's own white-on-primary pairing.
  const ink = get("paseoIdentityInk", t.colorTextLightSolid);

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} xl={12}>
        <Card variant="borderless" title="Host 身份色" size="small">
          {!custom && <Note>当前方案没有自定义身份色 token——回退 Antd 默认徽章。</Note>}
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
                      color: ink,
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
                  <code style={{ fontSize: 11, color: t.colorTextTertiary, marginLeft: "auto" }}>
                    {key ?? "Antd 默认"}
                  </code>
                </div>
              );
            })}
          </div>
          <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 12, marginBottom: 0 }}>
            十色全部压在同一对比度带——文字用 <code>paseoIdentityInk</code>（亮色白字 / 暗色墨字），
            对底色都不低于 4.5:1；颜色起识别作用，不排名。
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
