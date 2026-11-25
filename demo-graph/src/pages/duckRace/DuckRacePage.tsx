import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactElement } from "react";
import "./DuckRace.css";

const COLORS = [
  "#ffd23f", "#ff6b6b", "#4ecdc4", "#5c7cfa", "#f783ac", "#94d82d",
  "#ff922b", "#9775fa", "#22b8cf", "#a9805b", "#e64980", "#2f9e44",
];
const MAX_DUCKS = 100;
const MAX_LANES = 8;
const MIN_LANE_H = 36; // px; on small screens lanes stop splitting and ducks overlap
const DEFAULT_NAMES = "Nemo\nDory\nOcto\nShelly\nWilly\nCrabby";

type Species = "duck" | "fish" | "octopus" | "turtle" | "whale" | "crab" | "jellyfish" | "puffer" | "starfish";
const SPECIES: Species[] = ["duck", "fish", "octopus", "turtle", "whale", "crab", "jellyfish", "puffer", "starfish"];
type Duck = { name: string; color: string; species: Species };
type Status = "idle" | "running" | "finished";
type Motion = { p: number; v: number };
type EventKind = "turbo" | "current" | "comeback" | "stall" | "wave" | "shuffle";
type RaceEvent = { id: number; kind: EventKind; text: string };

/* ---------- physics tuning (units: % of track per 16.67ms frame) ---------- */
const RACE_SECONDS = 15;                       // nominal pace; events + rubber band finish ~12s
const BASE_SPEED = 100 / (RACE_SECONDS * 60);  // ~0.111 %/frame
const INERTIA_TAU = 28;                        // frames to reach ~63% of target speed
const RUBBER_BAND = 0.1;                       // max boost for the duck furthest behind
const LEADER_DRAG = 0.08;                      // slight drag on a runaway leader

/* ---------- moving camera ---------- */
const VIEW_SPAN = 40;  // % of the track visible at once
const LEAD_AT = 0.7;   // leader sits at 70% of the view; camera chases it
const CAM_TAU = 14;    // frames; larger = lazier camera

type Prop = { x: number; y: number; ch: string; size: number; op: number };
type LayerDef = {
  zone: "sky" | "water" | "bank";
  par: number; per: number; chars: string[];
  y: [number, number]; size: [number, number]; op: number;
};
const LAYER_DEFS: LayerDef[] = [
  { zone: "sky", par: 0.12, per: 3, chars: ["☁️", "☁️", "🕊️"], y: [0, 40], size: [24, 36], op: 0.9 },
  { zone: "sky", par: 0.4, per: 5, chars: ["🌲", "🌳", "🌴", "🏡", "🌳"], y: [30, 60], size: [26, 40], op: 1 },
  { zone: "water", par: 1, per: 6, chars: ["🪷", "🍃", "🫧"], y: [8, 94], size: [14, 22], op: 0.55 },
  { zone: "bank", par: 1, per: 7, chars: ["🌾", "🌿", "🪨", "🐸", "🌾"], y: [0, 30], size: [18, 28], op: 1 },
];
const seeded = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const SCENERY = LAYER_DEFS.map((d, li) => {
  const r = seeded(1234 + li * 77);
  const total = 100 * d.par + VIEW_SPAN; // world length this layer must cover
  const count = Math.round((d.per * total) / VIEW_SPAN);
  const props: Prop[] = Array.from({ length: count }, () => ({
    x: r() * total,
    y: d.y[0] + r() * (d.y[1] - d.y[0]),
    ch: d.chars[Math.floor(r() * d.chars.length)],
    size: d.size[0] + r() * (d.size[1] - d.size[0]),
    op: d.op,
  }));
  return { ...d, total, props };
});

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// mix a hex colour toward white (amt > 0) or black (amt < 0)
const shade = (hex: string, amt: number) => {
  const n = parseInt(hex.slice(1), 16);
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  const ch = (v: number) => Math.round((t - v) * p + v);
  return `rgb(${ch((n >> 16) & 255)},${ch((n >> 8) & 255)},${ch(n & 255)})`;
};

// a lightly "3D" duck: radial-gradient shading, glossy highlights, wing, two-tone beak
const DuckIcon = ({ color }: { color: string }) => {
  const id = useId().replace(/:/g, "");
  const light = shade(color, 0.55);
  const mid = shade(color, 0.12);
  const dark = shade(color, -0.35);
  return (
    <svg viewBox="0 0 64 64" className="duck-svg" aria-hidden="true">
      <defs>
        <radialGradient id={`b${id}`} cx="35%" cy="28%" r="80%">
          <stop offset="0" stopColor={light} />
          <stop offset="0.45" stopColor={mid} />
          <stop offset="1" stopColor={dark} />
        </radialGradient>
        <radialGradient id={`h${id}`} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor={light} />
          <stop offset="0.5" stopColor={mid} />
          <stop offset="1" stopColor={shade(color, -0.25)} />
        </radialGradient>
        <linearGradient id={`w${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={mid} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <linearGradient id={`k${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffc247" />
          <stop offset="1" stopColor="#e8780c" />
        </linearGradient>
      </defs>
      <ellipse cx="30" cy="57" rx="22" ry="4" fill="rgba(0,30,60,0.28)" />
      <path d="M12 38 Q2 30 7 21 Q14 29 21 34 Z" fill={`url(#w${id})`} />
      <ellipse cx="30" cy="42" rx="22" ry="14.5" fill={`url(#b${id})`} />
      <path d="M16 46 Q30 58 46 46 Q34 54 16 46 Z" fill="rgba(0,0,0,0.14)" />
      <path d="M17 38 Q27 31 39 38 Q36 52 24 50 Q15 47 17 38 Z" fill={`url(#w${id})`} opacity="0.85" />
      <path d="M20 40 Q27 35 35 39" stroke={light} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.7" />
      <circle cx="44" cy="22" r="13" fill={`url(#h${id})`} />
      <ellipse cx="38" cy="14.5" rx="5" ry="2.8" fill="#fff" opacity="0.5" transform="rotate(-25 38 14.5)" />
      <path d="M53 20 Q60 20 63 24 Q58 25.5 53 25 Z" fill={`url(#k${id})`} />
      <path d="M53 25 Q59 25.5 62 24.5 Q59 29.5 53 28.5 Z" fill="#d96a08" />
      <circle cx="49" cy="26.5" r="2.6" fill="#ff7a8a" opacity="0.45" />
      <circle cx="47" cy="19" r="3.2" fill="#fff" />
      <circle cx="47.8" cy="19.2" r="2.2" fill="#1d1d1d" />
      <circle cx="48.6" cy="18.3" r="0.9" fill="#fff" />
    </svg>
  );
};

/* ---------- cute sea animals (all face right; tinted with the racer's colour) ---------- */
const STAR_POINTS = Array.from({ length: 10 }, (_, k) => {
  const a = (-90 + k * 36) * (Math.PI / 180);
  const r = k % 2 === 0 ? 24 : 11;
  return `${(32 + r * Math.cos(a)).toFixed(1)},${(33 + r * Math.sin(a)).toFixed(1)}`;
}).join(" ");

const Eye = ({ cx, cy, r = 3.6 }: { cx: number; cy: number; r?: number }) => (
  <>
    <circle cx={cx} cy={cy} r={r} fill="#fff" />
    <circle cx={cx + 0.7} cy={cy + 0.3} r={r * 0.68} fill="#1d1d1d" />
    <circle cx={cx + 1.5} cy={cy - 0.6} r={r * 0.28} fill="#fff" />
  </>
);
const Blush = ({ cx, cy }: { cx: number; cy: number }) => (
  <ellipse cx={cx} cy={cy} rx="3" ry="1.9" fill="#ff7a8a" opacity="0.5" />
);
const Smile = ({ d }: { d: string }) => (
  <path d={d} stroke="#5a2a1a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
);

const AnimalIcon = ({ color, species }: { color: string; species: Species }) => {
  const id = useId().replace(/:/g, "");
  if (species === "duck") return <DuckIcon color={color} />;
  const light = shade(color, 0.55);
  const mid = shade(color, 0.12);
  const dark = shade(color, -0.35);
  const B = `url(#ab${id})`;
  const D = `url(#ad${id})`;
  let art: ReactElement;
  switch (species) {
    case "fish":
      art = (
        <>
          <path d="M14 34 L2 21 Q6 34 2 47 Z" fill={D} />
          <path d="M20 20 Q30 6 40 21 Z" fill={D} />
          <path d="M28 48 Q34 58 40 47 Z" fill={D} />
          <ellipse cx="30" cy="34" rx="23" ry="16" fill={B} />
          <path d="M22 20 Q18 34 22 48 M32 19 Q28 34 32 49" stroke={light} strokeWidth="3" fill="none" opacity="0.45" />
          <ellipse cx="38" cy="22" rx="7" ry="2.6" fill="#fff" opacity="0.4" transform="rotate(-15 38 22)" />
          <Eye cx={44} cy={30} r={4.2} />
          <Blush cx={43} cy={39} />
          <Smile d="M52 36 Q49 39 46 37" />
        </>
      );
      break;
    case "octopus":
      art = (
        <>
          <g stroke={D} strokeWidth="6" strokeLinecap="round" fill="none">
            <path d="M18 40 Q9 50 16 55" />
            <path d="M25 44 Q21 54 27 56" />
            <path d="M39 44 Q43 54 37 56" />
            <path d="M46 40 Q55 50 48 55" />
          </g>
          <ellipse cx="32" cy="28" rx="19" ry="20" fill={B} />
          <ellipse cx="25" cy="14" rx="6" ry="3" fill="#fff" opacity="0.45" transform="rotate(-25 25 14)" />
          <circle cx="40" cy="16" r="2" fill={light} opacity="0.7" />
          <circle cx="45" cy="21" r="1.4" fill={light} opacity="0.7" />
          <Eye cx={26} cy={30} r={4.2} />
          <Eye cx={40} cy={30} r={4.2} />
          <Smile d="M29 38 Q33 42 37 38" />
          <Blush cx={20} cy={37} />
          <Blush cx={46} cy={37} />
        </>
      );
      break;
    case "turtle":
      art = (
        <>
          <path d="M9 44 L1 47 L10 49 Z" fill={D} />
          <ellipse cx="19" cy="50" rx="6" ry="4.5" fill={D} />
          <ellipse cx="41" cy="50" rx="6" ry="4.5" fill={D} />
          <circle cx="52" cy="36" r="9.5" fill={B} />
          <path d="M8 47 Q8 17 32 17 Q54 17 54 47 Z" fill={D} />
          <path d="M8 47 H54 V50 Q31 55 8 50 Z" fill={light} opacity="0.7" />
          <path d="M20 22 L26 33 L20 46 M44 22 L38 33 L44 46 M26 33 H38" stroke={light} strokeWidth="2" fill="none" opacity="0.55" strokeLinejoin="round" />
          <ellipse cx="22" cy="24" rx="6" ry="2.6" fill="#fff" opacity="0.35" transform="rotate(-30 22 24)" />
          <Eye cx={55} cy={33} r={3.3} />
          <Blush cx={51} cy={40} />
          <Smile d="M54 41 Q57 43 60 40" />
        </>
      );
      break;
    case "whale":
      art = (
        <>
          <path d="M11 38 Q-1 30 3 17 Q11 21 16 33 Z" fill={D} />
          <g stroke="#cfeeff" strokeWidth="2.6" strokeLinecap="round" fill="none">
            <path d="M42 22 Q42 13 37 9" />
            <path d="M42 22 Q45 13 51 10" />
          </g>
          <ellipse cx="32" cy="38" rx="26" ry="17" fill={B} />
          <path d="M9 44 Q30 58 57 42 Q50 53 32 55 Q15 55 9 44 Z" fill="#fff" opacity="0.55" />
          <path d="M26 46 Q22 54 33 52 Z" fill={D} />
          <ellipse cx="30" cy="26" rx="9" ry="3" fill="#fff" opacity="0.4" transform="rotate(-10 30 26)" />
          <Eye cx={46} cy={34} r={3.8} />
          <Blush cx={50} cy={41} />
          <Smile d="M51 44 Q45 48 38 45" />
        </>
      );
      break;
    case "crab":
      art = (
        <>
          <g stroke={D} strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M14 44 L5 50 M16 48 L9 56 M50 44 L59 50 M48 48 L55 56" />
            <path d="M16 34 Q8 30 9 23 M48 34 Q56 30 55 23" strokeWidth="4" />
            <path d="M25 31 V25 M39 31 V25" strokeWidth="2" />
          </g>
          <circle cx="9" cy="18" r="7.5" fill={D} />
          <circle cx="55" cy="18" r="7.5" fill={D} />
          <path d="M9 11 L9 18 M55 11 L55 18" stroke={light} strokeWidth="1.6" opacity="0.5" />
          <ellipse cx="32" cy="42" rx="21" ry="14" fill={B} />
          <ellipse cx="25" cy="34" rx="7" ry="2.6" fill="#fff" opacity="0.4" transform="rotate(-15 25 34)" />
          <Eye cx={25} cy={22} r={4.4} />
          <Eye cx={39} cy={22} r={4.4} />
          <Smile d="M27 45 Q32 50 37 45" />
          <Blush cx={20} cy={44} />
          <Blush cx={44} cy={44} />
        </>
      );
      break;
    case "jellyfish":
      art = (
        <>
          <g stroke={mid} strokeWidth="3.2" strokeLinecap="round" fill="none" opacity="0.85">
            <path d="M19 36 Q14 44 19 49 Q23 54 18 57" />
            <path d="M27 38 Q23 47 28 52" />
            <path d="M37 38 Q41 47 36 52" />
            <path d="M45 36 Q50 44 45 49 Q41 54 46 57" />
          </g>
          <path d="M9 36 Q9 7 32 7 Q55 7 55 36 Q47 41 40 36 Q32 42 24 36 Q17 41 9 36 Z" fill={B} opacity="0.93" />
          <ellipse cx="22" cy="15" rx="7" ry="3" fill="#fff" opacity="0.5" transform="rotate(-25 22 15)" />
          <Eye cx={25} cy={25} r={3.8} />
          <Eye cx={39} cy={25} r={3.8} />
          <Smile d="M29 31 Q32 34 35 31" />
          <Blush cx={19} cy={30} />
          <Blush cx={45} cy={30} />
        </>
      );
      break;
    case "puffer":
      art = (
        <>
          <path d="M14 35 L2 24 Q6 35 2 46 Z" fill={D} />
          <g fill={D}>
            <path d="M23 17 L26 8 L31 15 Z" />
            <path d="M34 15 L39 8 L41 18 Z" />
            <path d="M12 26 L4 20 L14 33 Z" />
            <path d="M23 52 L26 59 L31 53 Z" />
            <path d="M35 53 L40 59 L43 51 Z" />
            <path d="M48 20 L55 14 L52 25 Z" />
          </g>
          <circle cx="32" cy="35" r="20" fill={B} />
          <ellipse cx="35" cy="48" rx="12" ry="5.5" fill="#fff" opacity="0.45" />
          <path d="M29 36 Q23 45 32 45 Z" fill={D} />
          <ellipse cx="26" cy="21" rx="7" ry="2.8" fill="#fff" opacity="0.45" transform="rotate(-25 26 21)" />
          <Eye cx={42} cy={30} r={4.6} />
          <circle cx="52" cy="39" r="2.4" fill="#ff7a8a" />
          <Blush cx={44} cy={39} />
        </>
      );
      break;
    default: // starfish
      art = (
        <>
          <polygon points={STAR_POINTS} fill={B} stroke={mid} strokeWidth="6" strokeLinejoin="round" />
          <g fill={light} opacity="0.7">
            <circle cx="32" cy="14" r="1.6" />
            <circle cx="50" cy="29" r="1.6" />
            <circle cx="14" cy="29" r="1.6" />
            <circle cx="24" cy="49" r="1.6" />
            <circle cx="40" cy="49" r="1.6" />
          </g>
          <Eye cx={27} cy={32} r={3.5} />
          <Eye cx={38} cy={32} r={3.5} />
          <Smile d="M29 39 Q32.5 42 36 39" />
          <Blush cx={22} cy={38} />
          <Blush cx={43} cy={38} />
        </>
      );
  }
  return (
    <svg viewBox="0 0 64 64" className="duck-svg" aria-hidden="true">
      <defs>
        <radialGradient id={`ab${id}`} cx="35%" cy="28%" r="80%">
          <stop offset="0" stopColor={light} />
          <stop offset="0.45" stopColor={mid} />
          <stop offset="1" stopColor={dark} />
        </radialGradient>
        <linearGradient id={`ad${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={mid} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
      </defs>
      <ellipse cx="30" cy="58" rx="22" ry="3.5" fill="rgba(0,30,60,0.25)" />
      {art}
    </svg>
  );
};

const parseNames = (text: string): string[] =>
  text.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean).slice(0, MAX_DUCKS);

const DuckRacePage = () => {
  const [text, setText] = useState(DEFAULT_NAMES);
  // ducks follow the textbox live
  const ducks = useMemo<Duck[]>(
    () => parseNames(text).map((name, i) => ({ name, color: COLORS[i % COLORS.length], species: SPECIES[i % SPECIES.length] })),
    [text]
  );
  const [motion, setMotion] = useState<Motion[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [winner, setWinner] = useState<Duck | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [event, setEvent] = useState<RaceEvent | null>(null);
  const raf = useRef<number>(0);
  const lanesRef = useRef<HTMLDivElement>(null);
  const [cam, setCam] = useState(0); // left edge of the visible window, in % of track
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
    const availH = Math.max(size.h - 24, MIN_LANE_H);
    // big screens fit more lanes; once lanes would get thinner than MIN_LANE_H, stop splitting
    // and let extra ducks share lanes (overlapping)
    const lanes = clamp(Math.floor(availH / MIN_LANE_H), 1, Math.min(n, MAX_LANES));
    const laneH = availH / lanes;
    const widthCap = Math.min(110, Math.max(40, size.w * 0.11));
    const dw = Math.max(18, Math.min(laneH * 0.92, widthCap));
    const lw = Math.min(120, Math.max(48, dw * 1.1));
    const font = Math.max(8, Math.min(16, dw * 0.22));
    return { dw, lw, font, lanes };
  }, [ducks.length, size]);

  const stop = () => cancelAnimationFrame(raf.current);
  useEffect(() => stop, []);

  const start = useCallback(() => {
    const names = parseNames(text);
    if (names.length < 2) {
      alert("Please enter at least 2 names (one per line).");
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
    const base = list.map(() => BASE_SPEED * rand(0.85, 1.15));
    // each duck has a personality: a slow, smooth surge cycle plus a stamina profile
    // (bias > 0: fast starter that fades; bias < 0: slow starter that finishes strong)
    const persona = list.map(() => ({
      amp: rand(0.12, 0.3),
      period: rand(5000, 11000),
      phase: rand(0, Math.PI * 2),
      bias: rand(-0.3, 0.3),
    }));
    // the pace the duck is currently *trying* to swim at; vel eases toward it
    const target = base.map((b) => b * rand(0.88, 1.12));
    const nextRetarget = list.map(() => rand(1500, 3000));
    // temporary modifiers from events: speed multiplier, additive push, expiry
    // each effect fades in and out smoothly (no step change), then the duck rests (cooldown)
    const mod = list.map(() => ({ mult: 1, from: 0, until: 0, cool: 0 }));

    let elapsed = 0; // ms since race start
    let nextEvent = rand(2500, 4000);
    let eventHideAt = 0;
    let eventId = 0;
    let last = performance.now();
    let camPos = 0;
    setCam(0);
    setMotion(pos.map((p, i) => ({ p, v: vel[i] })));

    const announce = (kind: EventKind, text: string) => {
      eventId += 1;
      setEvent({ id: eventId, kind, text });
      eventHideAt = elapsed + 2200;
    };
    const applyMod = (i: number, mult: number, ms: number, restMs = 5000) => {
      mod[i] = { mult, from: elapsed, until: elapsed + ms, cool: elapsed + ms + restMs };
    };
    const ready = (i: number) => elapsed >= mod[i].cool;
    // pick up to `count` distinct ducks from `pool` that are not recovering from an effect
    const choose = (pool: number[], count: number) => {
      const free = pool.filter(ready);
      const out: number[] = [];
      while (out.length < count && free.length) out.push(free.splice(Math.floor(Math.random() * free.length), 1)[0]);
      return out;
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
          // a surge hits several ducks from the middle/back of the pack
          const group = choose(ranked.slice(Math.floor(n / 4)), clamp(Math.round(n / 4), 2, 4));
          if (!group.length) return;
          group.forEach((i) => applyMod(i, rand(1.35, 1.6), rand(2200, 3200)));
          announce(kind, `⚡ ${group.map((i) => list[i].name).join(", ")} surge ahead!`);
          break;
        }
        case "current": {
          // a counter-current slows the front runners (never pushes them backwards)
          const hit = choose(ranked.slice(0, Math.ceil(n / 3)), clamp(Math.round(n / 4), 1, 3));
          if (!hit.length) return;
          hit.forEach((i) => applyMod(i, rand(0.55, 0.75), rand(2000, 2800)));
          announce(kind, `🌊 Counter-current slows ${hit.map((i) => list[i].name).join(", ")}`);
          break;
        }
        case "comeback": {
          const group = choose(ranked.slice(Math.ceil(n * 0.6)), clamp(Math.round(n / 4), 2, 3));
          if (!group.length) return;
          group.forEach((i) => applyMod(i, rand(1.4, 1.7), rand(2600, 3600)));
          announce(kind, `🔥 ${group.map((i) => list[i].name).join(", ")} fight back from behind!`);
          break;
        }
        case "stall": {
          const i = choose(ranked.slice(0, Math.max(1, Math.ceil(n / 2))), 1)[0];
          if (i === undefined) return;
          applyMod(i, 0.35, rand(1200, 1800));
          announce(kind, `😴 ${list[i].name} slows to look around`);
          break;
        }
        case "wave": {
          // ducks ahead of the pack are slowed a little, ducks behind are pushed forward
          const median = pos[ranked[Math.floor(n / 2)]];
          for (let i = 0; i < n; i++) {
            if (!ready(i)) continue;
            applyMod(i, pos[i] >= median ? 0.8 : 1.25, rand(2200, 3000));
          }
          announce(kind, "🌊 A big wave shakes the river!");
          break;
        }
        case "shuffle": {
          for (let i = 0; i < n; i++) {
            base[i] = BASE_SPEED * rand(0.9, 1.12);
            target[i] = base[i] * rand(0.85, 1.15);
          }
          announce(kind, "🎲 Everyone changes pace!");
          break;
        }
      }
      nextEvent = elapsed + rand(1800, 3200);
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
          target[i] = base[i] * rand(0.88, 1.12);
          base[i] += (BASE_SPEED - base[i]) * 0.2 + BASE_SPEED * rand(-0.03, 0.03);
          nextRetarget[i] = rand(1500, 3200);
        }

        // 2) rubber band: the further behind, the harder the duck paddles
        const behind = (leadPos - pos[i]) / spread; // 0 = leader, 1 = last
        const ps = persona[i];
        const surge = 1 + ps.amp * Math.sin((elapsed / ps.period) * Math.PI * 2 + ps.phase);
        const stamina = 1 + ps.bias * (0.5 - pos[i] / 100) * 2;
        let eff = target[i] * surge * stamina * (1 + behind * RUBBER_BAND);
        if (i === ranked[0] && leadPos - pos[ranked[1]] > 6) eff *= 1 - LEADER_DRAG;

        // 3) event modifiers
        const m = mod[i];
        const active = elapsed < m.until;
        if (active) {
          // smooth bump: ease in over the first 40%, ease out over the last 50%
          const t = (elapsed - m.from) / (m.until - m.from);
          const up = clamp(t / 0.4, 0, 1);
          const down = clamp((1 - t) / 0.5, 0, 1);
          const k = Math.min(up, down);
          const env = k * k * (3 - 2 * k);
          eff *= 1 + (m.mult - 1) * env;
        }

        // 4) inertia: velocity eases toward the effective target speed (never backwards)
        vel[i] += (eff - vel[i]) * (1 - Math.exp(-dt / INERTIA_TAU));
        vel[i] = Math.max(vel[i], 0);
        pos[i] = clamp(pos[i] + vel[i] * dt, 0, 100);

        if (pos[i] >= 100 && (winnerIdx < 0 || vel[i] > vel[winnerIdx])) winnerIdx = i;
      }

      // camera chases the front-runner, never showing beyond the finish line
      const camTarget = clamp(pos[order()[0]] - VIEW_SPAN * LEAD_AT, 0, 100 - VIEW_SPAN);
      camPos += (camTarget - camPos) * (1 - Math.exp(-dt / CAM_TAU));
      setCam(camPos);
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
        {SCENERY.map((l, li) => (
          <div key={li} className={`scn scn-${l.zone}`} aria-hidden="true">
            <div
              className="scn-layer"
              style={{
                width: `${(l.total / VIEW_SPAN) * 100}%`,
                transform: `translateX(${-((cam * l.par) / l.total) * 100}%)`,
              }}
            >
              {l.props.map((p, k) => (
                <span
                  key={k}
                  className="scn-item"
                  style={{
                    left: `${(p.x / l.total) * 100}%`,
                    top: `${p.y}%`,
                    fontSize: p.size,
                    opacity: p.op,
                  }}
                >
                  {p.ch}
                </span>
              ))}
            </div>
          </div>
        ))}
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
            ["--fp" as any]: ((100 - cam) / VIEW_SPAN) * 100,
            ["--sp" as any]: ((0 - cam) / VIEW_SPAN) * 100,
          }}
        >
          {Array.from({ length: dims.lanes }, (_, laneIdx) => (
            <div className="lane" key={laneIdx}>
              <div className="lane-water">
                {ducks.map((d, i) => {
                  if (i % dims.lanes !== laneIdx) return null;
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
                    <div
                      key={d.name + i}
                      className={cls}
                      style={{
                        ["--p" as any]: clamp(((m.p - cam) / VIEW_SPAN) * 100, 0, 100),
                        ["--tilt" as any]: `${tilt}deg`,
                        // the duck further ahead is drawn on top
                        zIndex: 1 + Math.round(m.p * 100),
                        ["--dy" as any]: `${((Math.floor(i / dims.lanes) % 3) - 1) * 0.18 * (size.h / dims.lanes)}px`,
                      }}
                    >
                      <span className="duck-name" style={{ borderColor: d.color }} title={d.name}>
                        {d.name}
                      </span>
                      <span className="duck-body">
                        <span className="wake" />
                        <AnimalIcon color={d.color} species={d.species} />
                      </span>
                    </div>
                  );
                })}
                {cam < VIEW_SPAN * 0.2 && <div className="start-line" />}
                {100 - cam <= VIEW_SPAN * 1.05 && <div className="finish-line" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="race-panel">
        <h4>🐠 Sea Race</h4>
        <label htmlFor="duck-names" className="form-label">
          Racer names (one per line, 2–{MAX_DUCKS})
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
              setCam(0);
            }
          }}
        />
        <button className="btn btn-warning btn-lg w-100 mt-3" onClick={start} disabled={running}>
          {running ? "Racing..." : status === "finished" ? "Race again" : "Start race"}
        </button>
        <p className="race-hint text-muted small mt-3 mb-0">
          Sea friends swim with momentum. Watch for turbo bursts, counter-currents, big waves and
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
              <AnimalIcon color={winner.color} species={winner.species} />
            </div>
            <p className="winner-name">{winner.name}</p>
            <p className="text-muted mb-3">is the winner of the Sea Race!</p>
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
