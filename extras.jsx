/* extras.jsx — the fun layer: paintbrush cursor, draggable hero stickers,
   orbiting coffee badge, and a film-strip photo lightbox. */

const { useState, useEffect, useRef } = React;

/* ---------- 1. Cursor doodle → paintbrush: the ring carries a paint color,
   clicks drop an organic splat, and dragging leaves a trail ---------- */
const PAINT_PALETTE = [
  "#D97757", // terra
  "#F4D58D", // butter
  "#B7C6A8", // sage
  "#BED3E0", // sky
  "#E8B7A8", // rose
  "#C7DCC9", // mint
  "#F2C9CC", // pink
  "#6B4A2B", // cocoa
  "#F0E68C", // lemon
];

function CursorDoodle({ paint = true }) {
  const ref = useRef(null);
  const layerRef = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const el = ref.current;
    const layer = layerRef.current;
    if (!el) return;

    let x = -100, y = -100, tx = -100, ty = -100, raf;
    let ci = Math.floor(Math.random() * PAINT_PALETTE.length);
    let down = false, lastSplat = 0;

    const motionOK = () =>
      !document.body.classList.contains("no-motion") &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const blob = () => {
      const r = () => 38 + Math.random() * 42;
      return `${r()}% ${r()}% ${r()}% ${r()}% / ${r()}% ${r()}% ${r()}% ${r()}%`;
    };

    const splat = (px, py, small) => {
      if (!layer) return;
      const color = PAINT_PALETTE[ci % PAINT_PALETTE.length];
      const d = document.createElement("div");
      d.className = "paint-splat";
      const size = small ? (14 + Math.random() * 16) : (32 + Math.random() * 30);
      d.style.cssText =
        `left:${px}px;top:${py}px;width:${size}px;height:${size}px;` +
        `background:${color};border-radius:${blob()};` +
        `--rot:${(Math.random() * 70 - 35)}deg;`;
      layer.appendChild(d);
      setTimeout(() => d.remove(), 2700);
    };

    const setBrush = () =>
      el.style.setProperty("--brush", PAINT_PALETTE[ci % PAINT_PALETTE.length]);

    const move = (e) => {
      tx = e.clientX; ty = e.clientY;
      const t = e.target;
      const hot = !!(t && t.closest &&
        t.closest("a, button, .tab-btn, .strip-btn, .ph, .proj, .love, .meta-card, .stk"));
      el.classList.toggle("is-hot", hot);
      if (paint && down && motionOK()) {
        const now = performance.now();
        if (now - lastSplat > 50) { splat(e.clientX, e.clientY, true); lastSplat = now; }
      }
    };
    const pdown = (e) => {
      down = true;
      if (paint && motionOK()) {
        splat(e.clientX, e.clientY, false);
        ci = (ci + 1) % PAINT_PALETTE.length; // advance to next color
        setBrush();
      }
    };
    const pup = () => { down = false; };

    const loop = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      el.style.transform = `translate(${x}px, ${y}px)`;
      raf = requestAnimationFrame(loop);
    };

    el.classList.toggle("is-brush", paint);
    setBrush();
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", pdown, { passive: true });
    window.addEventListener("pointerup", pup, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", pdown);
      window.removeEventListener("pointerup", pup);
      cancelAnimationFrame(raf);
    };
  }, [paint]);
  return (
    <React.Fragment>
      <div ref={layerRef} className="paint-layer" aria-hidden="true"></div>
      <div ref={ref} className="cursor-doodle" aria-hidden="true"></div>
    </React.Fragment>
  );
}

/* ---------- 2. Draggable hero stickers ---------- */
const STICKER_DEFS = [
  { id: "pass", cls: "stk-pass", x: 84, y: 64, r: -6,
    body: <React.Fragment>CAN → BNA → JFK<br />SEAT 04L · ONE WAY</React.Fragment> },
  { id: "chop", cls: "stk-chop", x: 90, y: 42, r: 9, body: "广" },
  { id: "film", cls: "stk-film", x: 71, y: 8, r: -4, body: "35MM · K200" },
];

function Sticker({ def, pos, onMove }) {
  const ref = useRef(null);
  function down(e) {
    e.preventDefault();
    const parent = ref.current.offsetParent;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY, ox = pos.x, oy = pos.y;
    const move = (ev) => {
      const nx = ox + (ev.clientX - sx) / rect.width * 100;
      const ny = oy + (ev.clientY - sy) / rect.height * 100;
      onMove({ x: Math.max(0, Math.min(94, nx)), y: Math.max(0, Math.min(90, ny)) });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }
  return (
    <div ref={ref} className={"stk " + def.cls}
         style={{ left: pos.x + "%", top: pos.y + "%", "--stk-r": def.r + "deg" }}
         onPointerDown={down} title="drag me">
      {def.body}
    </div>
  );
}

function HeroStickers() {
  const [pos, setPos] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hero-stickers-v2")) || {}; }
    catch (e) { return {}; }
  });
  useEffect(() => {
    try { localStorage.setItem("hero-stickers-v2", JSON.stringify(pos)); } catch (e) {}
  }, [pos]);
  return (
    <React.Fragment>
      {STICKER_DEFS.map((d) => (
        <Sticker key={d.id} def={d}
                 pos={pos[d.id] || { x: d.x, y: d.y }}
                 onMove={(p) => setPos((prev) => ({ ...prev, [d.id]: p }))} />
      ))}
    </React.Fragment>
  );
}

/* ---------- 3. Spinning "open to coffee" badge — links to LinkedIn ---------- */
function CoffeeBadge() {
  return (
    <a className="coffee-badge" aria-label="Open to coffee — connect on LinkedIn"
       href="https://linkedin.com/in/eylonliu/" target="_blank" rel="noopener noreferrer"
       title="Connect on LinkedIn →">
      <svg viewBox="0 0 100 100" className="cb-spin">
        <defs>
          <path id="cb-circ" d="M 50,50 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"></path>
        </defs>
        <circle cx="50" cy="50" r="49" fill="var(--c-butter)" stroke="var(--ink)" strokeWidth="1.6"></circle>
        <circle cx="50" cy="50" r="25" fill="var(--c-cream)" stroke="var(--ink)" strokeWidth="1"></circle>
        <text fontSize="10" letterSpacing="2.1" fill="var(--ink)" fontFamily="var(--mono)">
          <textPath href="#cb-circ">OPEN TO COFFEE · OPEN TO CHAT ·</textPath>
        </text>
      </svg>
      <span className="cb-core serif">✦</span>
    </a>
  );
}

/* ---------- 4. Film-strip photo lightbox ---------- */
function PhotoLightbox({ photos, openIdx, onClose, onNav }) {
  const p = openIdx != null ? photos[openIdx] : null;
  const [src, setSrc] = useState(null);
  const [shutter, setShutter] = useState(false);

  useEffect(() => {
    if (!p) return;
    setShutter(true);
    const t = setTimeout(() => setShutter(false), 320);
    setSrc(p.img || null);
    return () => clearTimeout(t);
  }, [openIdx]);

  useEffect(() => {
    if (!p) return;
    const key = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav(1);
      if (e.key === "ArrowLeft") onNav(-1);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [openIdx, onClose, onNav]);

  if (!p) return null;
  return ReactDOM.createPortal(
    <div className="lb" onClick={onClose}>
      <div className="lb-frame" onClick={(e) => e.stopPropagation()}>
        <div className="lb-sprockets"></div>
        <div className="lb-stage">
          {src ?
            <img src={src} alt={p.cap} /> :
            <div className="lb-empty mono">no photo here yet</div>}
          {shutter && <div className="lb-shutter"></div>}
        </div>
        <div className="lb-sprockets"></div>
        <div className="lb-bar mono">
          <span>{p.cap}</span>
          <span className="lb-roll">FRAME {p.roll} / {String(photos.length).padStart(2, "0")}</span>
        </div>
      </div>
      <button className="lb-x mono" onClick={onClose} aria-label="Close">✕</button>
      <button className="lb-nav lb-prev mono" aria-label="Previous"
              onClick={(e) => { e.stopPropagation(); onNav(-1); }}>←</button>
      <button className="lb-nav lb-next mono" aria-label="Next"
              onClick={(e) => { e.stopPropagation(); onNav(1); }}>→</button>
    </div>,
    document.body
  );
}

/* ---------- 5. Confetti burst ---------- */
function confettiBurst(x, y) {
  if (document.body.classList.contains("no-motion")) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const css = getComputedStyle(document.documentElement);
  const colors = ["--c-terra", "--c-butter", "--c-sage", "--c-sky", "--c-rose", "--ink"]
    .map((v) => css.getPropertyValue(v).trim())
    .filter(Boolean);
  if (!colors.length) colors.push("#C96342", "#E8C766", "#1B1A17");
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:10000;overflow:hidden;";
  document.body.appendChild(host);
  const N = 44;
  for (let i = 0; i < N; i++) {
    const p = document.createElement("i");
    const sz = 5 + Math.random() * 7;
    const flat = Math.random() < 0.55;
    p.style.cssText = `position:absolute;left:0;top:0;width:${sz}px;height:${flat ? sz * 0.45 : sz}px;` +
      `background:${colors[i % colors.length]};border-radius:${flat ? "1px" : "50%"};`;
    host.appendChild(p);
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.7;
    const v = 90 + Math.random() * 200;
    const dx = Math.cos(ang) * v;
    const dy = Math.sin(ang) * v;
    const rot = (Math.random() - 0.5) * 900;
    const dur = 950 + Math.random() * 750;
    p.animate(
      [
        { transform: `translate(${x}px, ${y}px) rotate(0deg)`, opacity: 1 },
        { transform: `translate(${x + dx}px, ${y + dy}px) rotate(${rot * 0.4}deg)`, opacity: 1, offset: 0.35 },
        { transform: `translate(${x + dx * 1.3}px, ${y + dy + 340}px) rotate(${rot}deg)`, opacity: 0 },
      ],
      { duration: dur, easing: "cubic-bezier(.18,.6,.32,1)", fill: "forwards" }
    );
  }
  setTimeout(() => host.remove(), 1900);
}

/* ---------- 6. Secret keystroke ---------- */
function useSecretCode(code, cb) {
  useEffect(() => {
    let buf = "";
    const h = (e) => {
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (!e.key || e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-code.length);
      if (buf === code) { buf = ""; cb(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [code, cb]);
}

Object.assign(window, { CursorDoodle, HeroStickers, CoffeeBadge, PhotoLightbox,
                        confettiBurst, useSecretCode });
