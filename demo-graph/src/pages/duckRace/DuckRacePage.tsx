import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./DuckRace.css";

const COLORS = [
  "#ffd23f", "#ff6b6b", "#4ecdc4", "#5c7cfa", "#f783ac", "#94d82d",
  "#ff922b", "#9775fa", "#22b8cf", "#a9805b", "#e64980", "#2f9e44",
];
const MAX_DUCKS = 12;
const DEFAULT_NAMES = "Donald\nDaisy\nQuackers\nPuddles\nWaddles\nSunny";

type Duck = { name: string; color: string };
type Status = "idle" | "running" | "finished";

const DuckIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 64 64" className="duck-svg" aria-hidden="true">
    <ellipse cx="30" cy="42" rx="22" ry="14" fill={color} />
    <path d="M12 38 Q4 30 8 24 Q14 30 20 34 Z" fill={color} />
    <circle cx="44" cy="22" r="13" fill={color} />
    <path d="M54 22 L63 25 L54 29 Z" fill="#ff9f1c" />
    <circle cx="47" cy="19" r="2.5" fill="#222" />
    <circle cx="48" cy="18" r="0.9" fill="#fff" />
    <path d="M22 42 Q32 52 42 40 Q34 36 22 42 Z" fill="rgba(0,0,0,0.18)" />
  </svg>
);

const parseNames = (text: string): string[] =>
  text.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean).slice(0, MAX_DUCKS);

const DuckRacePage = () => {
  const [text, setText] = useState(DEFAULT_NAMES);
  // ducks follow the textbox live
  const ducks = useMemo<Duck[]>(
    () => parseNames(text).map((name, i) => ({ name, color: COLORS[i % COLORS.length] })),
    [text]
  );
  const [progress, setProgress] = useState<number[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [winner, setWinner] = useState<Duck | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const raf = useRef<number>(0);

  const stop = () => cancelAnimationFrame(raf.current);
  useEffect(() => stop, []);

  const start = useCallback(() => {
    const names = parseNames(text);
    if (names.length < 2) {
      alert("Please enter at least 2 duck names (one per line).");
      return;
    }
    stop();
    const list = ducks;
    setWinner(null);
    setShowPopup(false);
    setStatus("running");

    const pos = list.map(() => 0);
    // each duck gets its own random base speed, plus random bursts every frame
    const base = list.map(() => 0.1 + Math.random() * 0.1); // % per frame-unit
    let last = performance.now();
    setProgress([...pos]);

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 16.67, 3);
      last = now;
      let winnerIdx = -1;
      for (let i = 0; i < pos.length; i++) {
        if (Math.random() < 0.02) base[i] = 0.08 + Math.random() * 0.18; // change pace
        pos[i] += (base[i] + Math.random() * 0.12) * dt;
        if (pos[i] >= 100) {
          pos[i] = 100;
          if (winnerIdx < 0 || pos[i] > pos[winnerIdx]) winnerIdx = i;
        }
      }
      setProgress([...pos]);
      if (winnerIdx >= 0) {
        setWinner(list[winnerIdx]);
        setStatus("finished");
        setShowPopup(true);
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, [text, ducks]);

  const running = status === "running";

  return (
    <div className="race-page">
      <div className="race-board">
        <div className="race-sky" />
        <div className="race-lanes">
          {ducks.map((d, i) => (
            <div className="lane" key={d.name + i}>
              <div className="lane-water">
                <div
                  className={"duck-wrap" + (running ? " swimming" : "")}
                  style={{ ["--p" as any]: progress[i] ?? 0 }}
                >
                  <span className="duck-name" style={{ borderColor: d.color }} title={d.name}>
                    {d.name}
                  </span>
                  <DuckIcon color={d.color} />
                </div>
              </div>
              <div className="finish-line" />
            </div>
          ))}
        </div>
      </div>

      <div className="race-panel">
        <h4>🦆 Duck Race</h4>
        <label htmlFor="duck-names" className="form-label">
          Duck names (one per line, 2–{MAX_DUCKS})
        </label>
        <textarea
          id="duck-names"
          className="form-control"
          rows={8}
          value={text}
          disabled={running}
          onChange={(e) => {
            setText(e.target.value);
            if (status === "finished") {
              setStatus("idle");
              setProgress([]);
            }
          }}
        />
        <button className="btn btn-warning btn-lg w-100 mt-3" onClick={start} disabled={running}>
          {running ? "Racing..." : status === "finished" ? "Race again" : "Start race"}
        </button>
      </div>

      {showPopup && winner && (
        <div className="winner-overlay" onClick={() => setShowPopup(false)}>
          <div className="confetti">
            {Array.from({ length: 40 }).map((_, i) => (
              <i
                key={i}
                style={{
                  left: `${Math.random() * 100}%`,
                  background: COLORS[i % COLORS.length],
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
          <div className="winner-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="trophy">🏆</div>
            <h2>Congratulations!</h2>
            <div className="winner-duck" style={{ ["--c" as any]: winner.color }}>
              <DuckIcon color={winner.color} />
            </div>
            <p className="winner-name">{winner.name}</p>
            <p className="text-muted mb-3">is the winner of the Duck Race!</p>
            <button className="btn btn-warning" onClick={() => setShowPopup(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DuckRacePage;
