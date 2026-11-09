import { useMemo, useRef, useState } from "react";
import { Button, Col, Container, Form, Modal, Row } from "react-bootstrap";

const CONFETTI = Array.from({ length: 40 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: ((i * 13) % 20) / 10,
  dur: 2 + ((i * 7) % 15) / 10,
  color: ["#e74c3c", "#f1c40f", "#2ecc71", "#3498db", "#9b59b6", "#e84393"][i % 6],
  size: 6 + (i % 4) * 3,
}));

const popupCss = `
@keyframes lw-fall { 0% { transform: translateY(-20px) rotate(0); opacity: 1; } 100% { transform: translateY(420px) rotate(720deg); opacity: 0; } }
@keyframes lw-pop { 0% { transform: scale(.3); opacity: 0; } 60% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
@keyframes lw-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
.lw-winner .modal-content { border: 0; border-radius: 24px; overflow: hidden; background: linear-gradient(135deg, #667eea 0%, #764ba2 55%, #f093fb 100%); color: #fff; box-shadow: 0 20px 60px rgba(0,0,0,.45); animation: lw-pop .5s ease-out; }
.lw-winner .lw-trophy { font-size: 4.5rem; display: inline-block; animation: lw-bounce 1.2s ease-in-out infinite; }
.lw-winner .lw-name { font-size: clamp(1.8rem, 6vw, 3rem); font-weight: 800; word-break: break-word; text-shadow: 0 3px 12px rgba(0,0,0,.35); background: rgba(255,255,255,.18); border-radius: 16px; padding: .5rem 1rem; display: inline-block; }
.lw-winner .lw-confetti { position: absolute; top: 0; border-radius: 2px; animation-name: lw-fall; animation-iteration-count: infinite; animation-timing-function: linear; pointer-events: none; }
`;

const COLORS = [
  "#e74c3c", "#f39c12", "#f1c40f", "#2ecc71", "#1abc9c",
  "#3498db", "#9b59b6", "#e84393", "#16a085", "#d35400",
];
const SPIN_MS = 6000;
const R = 200; // wheel radius in viewBox units

const polar = (angleDeg: number, r: number) => {
  const a = ((angleDeg - 90) * Math.PI) / 180; // 0deg = top
  return [r * Math.cos(a), r * Math.sin(a)];
};

const LuckyWheelPage = () => {
  const [text, setText] = useState("Pizza\nSushi\nBurger\nPasta\nSalad\nTacos");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const rotationRef = useRef(0);

  const items = useMemo(
    () => text.split("\n").map((s) => s.trim()).filter(Boolean),
    [text]
  );
  const n = items.length;
  const slice = n > 0 ? 360 / n : 360;

  const spin = () => {
    if (spinning || n < 2) return;
    setWinner(null);
    setSpinning(true);
    const target = Math.random() * 360;
    // land `target` degrees (wheel coordinates) under the top pointer
    const current = rotationRef.current;
    const base = current - (current % 360);
    const next = base + 360 * 8 + (360 - target);
    rotationRef.current = next;
    setRotation(next);
    window.setTimeout(() => {
      const idx = Math.floor(target / slice) % n;
      setWinner(items[idx]);
      setSpinning(false);
      setShowPopup(true);
    }, SPIN_MS + 100);
  };

  return (
    <Container fluid className="py-3">
      <Row className="g-4 align-items-center justify-content-center">
        <Col xs={12} lg={7} className="d-flex justify-content-center">
          <div
            style={{
              position: "relative",
              width: "min(100%, calc(100vh - 140px))",
              aspectRatio: "1 / 1",
              minWidth: 220,
            }}
          >
            <svg viewBox="-215 -225 430 440" style={{ width: "100%", height: "100%" }}>
              <g
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning
                    ? `transform ${SPIN_MS}ms cubic-bezier(0.05, 0.75, 0.1, 1)`
                    : "none",
                }}
              >
                {n === 0 && <circle r={R} fill="#ddd" />}
                {n === 1 && <circle r={R} fill={COLORS[0]} />}
                {n >= 2 &&
                  items.map((label, i) => {
                    const a0 = i * slice;
                    const a1 = (i + 1) * slice;
                    const [x0, y0] = polar(a0, R);
                    const [x1, y1] = polar(a1, R);
                    const mid = a0 + slice / 2;
                    const [tx, ty] = polar(mid, R * 0.62);
                    const fontSize = Math.max(8, Math.min(22, 120 / Math.sqrt(n) / 2.2));
                    const maxChars = 14;
                    const shown = label.length > maxChars ? label.slice(0, maxChars - 1) + "…" : label;
                    return (
                      <g key={i}>
                        <path
                          d={`M0 0 L${x0} ${y0} A${R} ${R} 0 ${slice > 180 ? 1 : 0} 1 ${x1} ${y1} Z`}
                          fill={COLORS[i % COLORS.length]}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                        <text
                          x={tx}
                          y={ty}
                          fill="#fff"
                          fontSize={fontSize}
                          fontWeight={600}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${mid - 90} ${tx} ${ty})`}
                        >
                          {shown}
                        </text>
                      </g>
                    );
                  })}
                <circle r={R} fill="none" stroke="#333" strokeWidth={4} />
              </g>
              <circle r={18} fill="#fff" stroke="#333" strokeWidth={4} />
              {/* pointer */}
              <polygon points="-14,-222 14,-222 0,-188" fill="#333" stroke="#fff" strokeWidth={2} />
            </svg>
          </div>
        </Col>

        <Col xs={12} lg={4}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Selections (one per line)</Form.Label>
            <Form.Control
              as="textarea"
              rows={8}
              value={text}
              disabled={spinning}
              onChange={(e) => setText(e.target.value)}
              placeholder={"Option 1\nOption 2\nOption 3"}
            />
            <Form.Text muted>{n} option{n === 1 ? "" : "s"} (need at least 2)</Form.Text>
          </Form.Group>
          <Button size="lg" className="w-100" onClick={spin} disabled={spinning || n < 2}>
            {spinning ? "Spinning..." : "SPIN"}
          </Button>
          {winner && !showPopup && (
            <div className="text-center mt-3 fs-5">
              Last winner: <strong>{winner}</strong>
            </div>
          )}
        </Col>
      </Row>

      <style>{popupCss}</style>
      <Modal
        show={showPopup}
        onHide={() => setShowPopup(false)}
        centered
        dialogClassName="lw-winner"
        contentClassName="text-center"
      >
        <Modal.Body className="position-relative py-5 px-4" style={{ overflow: "hidden" }}>
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              className="lw-confetti"
              style={{
                left: `${c.left}%`,
                width: c.size,
                height: c.size * 1.6,
                background: c.color,
                animationDuration: `${c.dur}s`,
                animationDelay: `${c.delay}s`,
              }}
            />
          ))}
          <div className="lw-trophy">🏆</div>
          <h5 className="text-uppercase mt-2 mb-3" style={{ letterSpacing: 4, opacity: 0.9 }}>
            Congratulations!
          </h5>
          <div className="lw-name">{winner}</div>
          <div className="mt-4 d-flex gap-2 justify-content-center">
            <Button variant="light" size="lg" onClick={() => setShowPopup(false)}>
              Awesome!
            </Button>
            <Button
              variant="outline-light"
              size="lg"
              onClick={() => {
                setShowPopup(false);
                spin();
              }}
            >
              Spin again
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default LuckyWheelPage;
