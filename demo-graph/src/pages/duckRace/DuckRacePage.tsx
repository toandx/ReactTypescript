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
type Motion = { p: number; v: number };
type EventKind = "turbo" | "current" | "comeback" | "stall" | "wave" | "shuffle";
type RaceEvent = { id: number; kind: EventKind; text: string };

/* ---------- physics tuning (units: % of track per 16.67ms frame) ---------- */
const RACE_SECONDS = 15;                       // nominal pace; events + rubber band finish ~12s
const BASE_SPEED = 100 / (RACE_SECONDS * 60);  // ~0.111 %/frame
const INERTIA_TAU = 9;                         // frames to reach ~63% of target speed
const EVENT_TAU = 4;                           // snappier response while an event is active
const RUBBER_BAND = 0.4;                       // max boost for the duck furthest behind
const LEADER_DRAG = 0.08;                      // slight drag on a runaway leader

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

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
  const [motion, setMotion] = useState<Motion[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [winner, setWinner] = useState<Duck | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [event, setEvent] = useState<RaceEvent | null>(null);
  const raf = useRef<number>(0);
  const lanesRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 500 });

  useEffect(() => {
    const el = lanesRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // fit duck size to the lane height (board height is fixed) and board width
  const dims = useMemo(() => {
    const n = Math.max(ducks.length, 1);
    const laneH = Math.max((size.h - 24) / n, 16);
    const widthCap = Math.min(110, Math.max(40, size.w * 0.11));
    const dw = Math.max(18, Math.min(laneH * 0.92, widthCap));
    const lw = Math.min(120, Math.max(48, dw * 1.1));
    const font = Math.max(8, Math.min(16, dw * 0.22));
    return { dw, lw, font };
  }, [ducks.length, size]);

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
    const n = list.length;
    setWinner(null);
    setShowPopup(false);
    setEvent(null);
    setStatus("running");

    /* ---------------- per-duck physics state ---------------- */
    const pos = new Array<number>(n).fill(0);
    const vel = new Array<number>(n).fill(0);
    // "natural" pace of each duck; drifts slowly so no duck is permanently fastest
    const base = list.map(() => BASE_SPEED * rand(0.9, 1.1));
    // the pace the duck is currently *trying* to swim at; vel eases toward it
    const target = base.map((b) => b * rand(0.7, 1.3));
    const nextRetarget = list.map(() => rand(300, 900));
    // temporary modifiers from events: speed multiplier, additive push, expiry
    const mod = list.map(() => ({ mult: 1, add: 0, until: 0 }));

    let elapsed = 0; // ms since race start
    let nextEvent = rand(1200, 2200);
    let eventHideAt = 0;
    let eventId = 0;
    let last = performance.now();
    setMotion(pos.map((p, i) => ({ p, v: vel[i] })));

    const announce = (kind: EventKind, text: string) => {
      eventId += 1;
      setEvent({ id: eventId, kind, text });
      eventHideAt = elapsed + 2200;
    };
    const applyMod = (i: number, mult: number, add: number, ms: number) => {
      mod[i] = { mult, add, until: elapsed + ms };
    };
    const order = () => pos.map((_, i) => i).sort((a, b) => pos[b] - pos[a]); // leader first

    /* ---------------- surprise events ---------------- */
    const fireEvent = () => {
      const ranked = order();
      const leader = ranked[0];
      const lastDuck = ranked[n - 1];
      const leadPos = pos[leader];
      // weights shift with the race: comebacks and counter-currents are more likely late
      const late = leadPos > 55;
      const pool: EventKind[] = late
        ? ["turbo", "current", "current", "comeback", "comeback", "stall", "wave"]
        : ["turbo", "turbo", "current", "comeback", "stall", "wave", "shuffle"];
      const kind = pick(pool);

      switch (kind) {
        case "turbo": {
          const i = pick(ranked.slice(Math.floor(n / 3))); // not the leader group
          applyMod(i, 2.4, 0, rand(800, 1300));
          announce(kind, `⚡ ${list[i].name} hits the turbo!`);
          break;
        }
        case "current": {
          // an upstream current catches the front runners and drags them backwards
          const count = clamp(Math.round(rand(1, Math.max(1, n / 3))), 1, 3);
          const hit = ranked.slice(0, count);
          hit.forEach((i) => applyMod(i, 0, -BASE_SPEED * rand(1.6, 2.6), rand(600, 1000)));
          const names = hit.map((i) => list[i].name).join(", ");
          announce(kind, `🌊 Counter-current! ${names} swept back`);
          break;
        }
        case "comeback": {
          applyMod(lastDuck, 3.0, 0, rand(1100, 1600));
          announce(kind, `🔥 ${list[lastDuck].name} fights upstream from last place!`);
          break;
        }
        case "stall": {
          const i = pick(ranked.slice(0, Math.max(1, Math.ceil(n / 2)))); // someone up front
          applyMod(i, 0, 0, rand(600, 1000));
          announce(kind, `😴 ${list[i].name} stops to look around`);
          break;
        }
        case "wave": {
          // a big wave: ducks ahead of the pack are slowed, ducks behind are pushed forward
          const median = pos[ranked[Math.floor(n / 2)]];
          for (let i = 0; i < n; i++) {
            if (pos[i] >= median) applyMod(i, 0.45, 0, rand(800, 1200));
            else applyMod(i, 1.7, 0, rand(800, 1200));
          }
          announce(kind, "🌊 A big wave shakes the river!");
          break;
        }
        case "shuffle": {
          for (let i = 0; i < n; i++) {
            base[i] = BASE_SPEED * rand(0.8, 1.25);
            target[i] = base[i] * rand(0.6, 1.5);
          }
          announce(kind, "🎲 Everyone changes pace!");
          break;
        }
      }
      nextEvent = elapsed + rand(1300, 2600);
    };

    /* ---------------- main loop ---------------- */
    const tick = (now: number) => {
      const dtMs = Math.min(now - last, 50);
      const dt = dtMs / 16.67;
      last = now;
      elapsed += dtMs;

      const ranked = order();
      const leadPos = pos[ranked[0]];
      const tailPos = pos[ranked[n - 1]];
      const spread = Math.max(leadPos - tailPos, 1);

      if (elapsed >= nextEvent && leadPos < 96) fireEvent();
      if (eventHideAt && elapsed > eventHideAt) {
        eventHideAt = 0;
        setEvent(null);
      }

      let winnerIdx = -1;
      for (let i = 0; i < n; i++) {
        // 1) slowly wander the duck's intended pace (smooth, not per-frame jitter)
        nextRetarget[i] -= dtMs;
        if (nextRetarget[i] <= 0) {
          target[i] = base[i] * rand(0.65, 1.4);
          base[i] += (BASE_SPEED - base[i]) * 0.15 + BASE_SPEED * rand(-0.06, 0.06);
          nextRetarget[i] = rand(350, 1000);
        }

        // 2) rubber band: the further behind, the harder the duck paddles
        const behind = (leadPos - pos[i]) / spread; // 0 = leader, 1 = last
        let eff = target[i] * (1 + behind * RUBBER_BAND);
        if (i === ranked[0] && leadPos - pos[ranked[1]] > 6) eff *= 1 - LEADER_DRAG;

        // 3) event modifiers
        const m = mod[i];
        const active = elapsed < m.until;
        if (active) eff = eff * m.mult + m.add;

        // 4) inertia: velocity eases toward the effective target speed
        const tau = active ? EVENT_TAU : INERTIA_TAU;
        vel[i] += (eff - vel[i]) * (1 - Math.exp(-dt / tau));
        pos[i] = clamp(pos[i] + vel[i] * dt, 0, 100);

        if (pos[i] >= 100 && (winnerIdx < 0 || vel[i] > vel[winnerIdx])) winnerIdx = i;
      }

      setMotion(pos.map((p, i) => ({ p, v: vel[i] })));
      if (winnerIdx >= 0) {
        setWinner(list[winnerIdx]);
        setStatus("finished");
        setShowPopup(true);
        setEvent(null);
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
        {event && (
          <div key={event.id} className={`race-event race-event--${event.kind}`} role="status">
            {event.text}
          </div>
        )}
        <div
          className="race-lanes"
          ref={lanesRef}
          style={{
            ["--dw" as any]: `${dims.dw}px`,
            ["--lw" as any]: `${dims.lw}px`,
            ["--fs" as any]: `${dims.font}px`,
          }}
        >
          {ducks.map((d, i) => {
            const m = motion[i] ?? { p: 0, v: 0 };
            const rel = m.v / BASE_SPEED; // 1 = normal pace
            const tilt = clamp(-(rel - 1) * 7, -12, 10); // fast -> nose up, backwards -> nose down
            const cls =
              "duck-wrap" +
              (running ? " swimming" : "") +
              (running && rel > 1.9 ? " fast" : "") +
              (running && m.v < -0.01 ? " reverse" : "") +
              (running && Math.abs(m.v) < 0.015 ? " stalled" : "");
            return (
              <div className="lane" key={d.name + i}>
                <div className="lane-water">
                  <div
                    className={cls}
                    style={{ ["--p" as any]: m.p, ["--tilt" as any]: `${tilt}deg` }}
                  >
                    <span className="duck-name" style={{ borderColor: d.color }} title={d.name}>
                      {d.name}
                    </span>
                    <span className="duck-body">
                      <span className="wake" />
                      <DuckIcon color={d.color} />
                    </span>
                  </div>
                </div>
                <div className="finish-line" />
              </div>
            );
          })}
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
              setMotion([]);
            }
          }}
        />
        <button className="btn btn-warning btn-lg w-100 mt-3" onClick={start} disabled={running}>
          {running ? "Racing..." : status === "finished" ? "Race again" : "Start race"}
        </button>
        <p className="race-hint text-muted small mt-3 mb-0">
          Ducks swim with momentum. Watch for turbo bursts, counter-currents, big waves and
          last-second comebacks. Nothing is decided until the finish line.
        </p>
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
