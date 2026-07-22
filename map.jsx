/* Interactive LifeMap — equirectangular world with dot-pattern land
   and an ANIMATED journey that draws when you pick a city. */

const { useState, useMemo, useRef, useEffect } = React;

// 36 rows × 72 cols → 5° per cell, lat 90 (top) to -90 (bottom), lon -180 to 180.
const LAND_ROWS = [
  "........................................................................",
  "........................................................................",
  ".....######.....######################################.......######....",
  "..########.....##############################################.########.",
  ".###############################################################.######",
  "##############################################################...######",
  "#######...########################################################.####",
  "#######.....####################################################...####",
  "#####........##################################################........",
  "....##........###############################################..........",
  "....##.........############################################............",
  ".....##.........######...####.###############..####################....",
  ".....###.........###......###..############......###################...",
  "......##..........##........#..############.......##################...",
  ".......#..........##............##########..........################...",
  "........###........#............##########...........##############....",
  ".........###.......#.............#########............############.....",
  "..........###......##.............########..............#########......",
  "...........####....###............#######................#######.......",
  "............###....###.............######.................#####........",
  ".............##....###.............######.................####.........",
  "..............#....###..............#####..................###.........",
  "...................##...............####.....................#........",
  "...................##.................##...............................",
  "....................#..................##..............................",
  "....................#..................##............#.................",
  "........................................##..........###................",
  "...........................................##......##.................",
  "..............................................##.######...............",
  ".................................................######...............",
  "...................................................####...............",
  "........................................................................",
  "........................................................................",
  ".......######.........#####.........######........######...............",
  ".......######.........#####.........######........######...............",
  "......#######........######........#######.......#######...............",
];

function project(lon, lat) {
  return { x: (lon + 180) / 360, y: (90 - lat) / 180 };
}

const PLACES = [
  { id: "guangzhou", name: "Guangzhou",   label: "home",  country: "China",                  lat: 23.13, lon: 113.26, era: "Chapter 01 · home",  order: 0, kind: "home",
    note: "Where it begins. Cantonese household, jasmine tea, dim sum on Sunday. Childhood on the Pearl River.",
    moment: "first language: 粤语" },
  { id: "nashville", name: "Nashville",   label: "Vandy", country: "Tennessee, USA",         lat: 36.16, lon: -86.78, era: "Chapter 02 · undergrad", order: 1, kind: "lived",
    note: "Vanderbilt. Math + Child Development. Researching how 24-month-olds understand pictures.",
    moment: "thesis: highest honors" },
  { id: "vienna",    name: "Vienna",      label: "Wien",  country: "Austria",                lat: 48.21, lon: 16.37,  era: "Chapter 03 · semester abroad", order: 2, kind: "lived",
    note: "A semester in Deutsch. Project assistant at SOS Children's Villages. Coffee houses and tram lines.",
    moment: "lived in 4th language" },
  { id: "nashvilleB",name: "Nashville",   label: "back",  country: "Tennessee, USA",         lat: 36.16, lon: -86.78, era: "senior spring",      order: 3, kind: "lived",
    note: "Senior spring. Wrote the thesis, ran the lab, walked the bridges across the Cumberland.",
    moment: "Top 20 Outstanding Senior", hidden: true },
  { id: "brooklyn",  name: "Brooklyn",    label: "NYU",   country: "New York, USA",          lat: 40.69, lon: -73.99, era: "Chapter 04 · grad school", order: 4, kind: "lived",
    dX: 11, dY: 10, ldx: 12, ldy: 24,
    note: "Three years in downtown Brooklyn. MS Financial Engineering at NYU Tandon — genetic algorithms in C++, LSTMs, and a pandemic out the window.",
    moment: "MS FinEng · NYU Tandon" },
  { id: "jc",        name: "Jersey City", label: "JC",    country: "New Jersey, USA",        lat: 40.72, lon: -74.05, era: "Chapter 05 · now",   order: 5, kind: "home-now",
    note: "Across the Hudson now — almost five years on Wall St. building quant systems. Manhattan skyline out the window.",
    moment: "quant strategist" },

  // Travel
  { id: "hk",        name: "Hong Kong",      country: "China",         lat: 22.32, lon: 114.17,  era: "travel", kind: "travel" },
  { id: "seattle",   name: "Seattle",        country: "Washington, USA", lat: 47.61, lon: -122.33, era: "travel", kind: "travel" },
  { id: "tahoe",     name: "Lake Tahoe",     country: "California, USA", lat: 39.09, lon: -120.04, era: "travel", kind: "travel" },
  { id: "vegas",     name: "Las Vegas",      country: "Nevada, USA",   lat: 36.17, lon: -115.14, era: "travel", kind: "travel" },
  { id: "niagara",   name: "Niagara Falls",  country: "NY / Ontario",  lat: 43.09, lon: -79.06,  era: "travel", kind: "travel" },
  { id: "dc",        name: "Washington DC",  country: "USA",           lat: 38.91, lon: -77.04,  era: "travel", kind: "travel" },
  { id: "miami",     name: "Miami",          country: "Florida, USA",  lat: 25.76, lon: -80.19,  era: "travel", kind: "travel" },
  { id: "dallas",    name: "Dallas",         country: "Texas, USA",    lat: 32.78, lon: -96.80,  era: "travel", kind: "travel" },
  { id: "lima",      name: "Lima",           country: "Peru",          lat: -12.05, lon: -77.04, era: "travel", kind: "travel" },
  { id: "cusco",     name: "Cusco",          country: "Peru",          lat: -13.53, lon: -71.97, era: "travel", kind: "travel" },
  { id: "lapaz",     name: "La Paz",         country: "Bolivia",       lat: -16.50, lon: -68.15, era: "travel", kind: "travel" },
  { id: "uyuni",     name: "Uyuni",          country: "Bolivia",       lat: -20.46, lon: -66.83, era: "travel", kind: "travel" },
  { id: "innsbruck", name: "Innsbruck",      country: "Austria",       lat: 47.27, lon: 11.39,   era: "travel", kind: "travel" },
  { id: "budapest",  name: "Budapest",       country: "Hungary",       lat: 47.50, lon: 19.04,   era: "travel", kind: "travel" },
  { id: "monaco",    name: "Monaco",         country: "Côte d'Azur",   lat: 43.74, lon: 7.42,    era: "travel", kind: "travel" },
];

// Lived journey, in order
const JOURNEY = ["guangzhou", "nashville", "vienna", "nashville", "brooklyn", "jc"];

// Build a smooth great-circle-ish arc between two points
function arcPath(x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  // perpendicular offset for curvature, proportional to distance
  const dist = Math.hypot(dx, dy);
  const cx = mx - dy * 0.25;
  const cy = my + dx * 0.25 - dist * 0.18; // lift the arc up
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

// soft "whoosh" for flight legs (only when the sound tweak is on)
function flightWhoosh() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = flightWhoosh.ctx = flightWhoosh.ctx || new AC();
    if (ctx.state === "suspended") ctx.resume();
    const dur = 0.9;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = "bandpass";
    filt.Q.value = 1.4;
    filt.frequency.setValueAtTime(280, ctx.currentTime);
    filt.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + dur * 0.55);
    filt.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + dur * 0.22);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    src.connect(filt);
    filt.connect(g);
    g.connect(ctx.destination);
    src.start();
  } catch (e) {/* audio unavailable */}
}

function LifeMap({ compact = false, autoplay = false }) {
  const [hover, setHover] = useState(null);
  const [active, setActive] = useState("jc");
  const [animKey, setAnimKey] = useState(0); // bump to retrigger draw

  const W = 1440, H = 720;

  // ---- zoom & pan ----
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState({ x: W / 2, y: H / 2 });
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef(null);
  const dragRef = useRef(null);
  const movedRef = useRef(false);
  const clampN = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const vw = W / zoom, vh = H / zoom;
  const vx = clampN(center.x - vw / 2, 0, W - vw);
  const vy = clampN(center.y - vh / 2, 0, H - vh);

  function zoomTo(nz) {
    const z = clampN(nz, 1, 6);
    setZoom(z);
    if (z === 1) setCenter({ x: W / 2, y: H / 2 });
  }
  function onPointerDown(e) {
    if (zoom <= 1) return;
    dragRef.current = { px: e.clientX, py: e.clientY, cx: center.x, cy: center.y };
    movedRef.current = false;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e) {
    const d = dragRef.current;
    if (!d || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const dx = e.clientX - d.px, dy = e.clientY - d.py;
    if (Math.abs(dx) + Math.abs(dy) > 5) movedRef.current = true;
    setCenter({
      x: clampN(d.cx - dx * (vw / rect.width), vw / 2, W - vw / 2),
      y: clampN(d.cy - dy * (vh / rect.height), vh / 2, H - vh / 2),
    });
  }
  function onPointerUp() {
    dragRef.current = null;
    setDragging(false);
  }

  const landDots = useMemo(() => {
    const dots = [];
    const rows = LAND_ROWS.length, cols = LAND_ROWS[0].length;
    const cellW = W / cols, cellH = H / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (LAND_ROWS[r][c] === "#") dots.push({
        cx: c * cellW + cellW / 2,
        cy: r * cellH + cellH / 2,
        r: Math.min(cellW, cellH) * 0.32,
      });
    }
    return dots;
  }, []);

  const pts = useMemo(() =>
    PLACES.map(p => {
      const { x, y } = project(p.lon, p.lat);
      return { ...p, X: x * W + (p.dX || 0), Y: y * H + (p.dY || 0) };
    }), []);

  // Journey path up to & including active city
  const journeyByIdx = useMemo(() => {
    const byId = Object.fromEntries(pts.map(p => [p.id, p]));
    return JOURNEY.map(id => byId[id]).filter(Boolean);
  }, [pts]);

  // Index of active in journey (or -1 if not lived)
  const activeIdx = useMemo(() => {
    const journeyIds = JOURNEY;
    for (let i = journeyIds.length - 1; i >= 0; i--) {
      if (journeyIds[i] === active) return i;
    }
    return -1;
  }, [active]);

  // Segments to draw (each arc is its own path so we animate independently)
  const segments = useMemo(() => {
    const segs = [];
    for (let i = 1; i < journeyByIdx.length; i++) {
      const a = journeyByIdx[i-1], b = journeyByIdx[i];
      segs.push({
        d: arcPath(a.X, a.Y, b.X, b.Y),
        from: a, to: b, idx: i,
      });
    }
    return segs;
  }, [journeyByIdx]);

  // ---- sequential journey animation ----
  // Draw legs one at a time, plane flying each. Replay resets to Guangzhou and re-flies all.
  const pathRefs = useRef({});
  const planeRef = useRef(null);
  const [plane, setPlane] = useState({ x: 0, y: 0, on: false });
  const drawnRef = useRef(0);          // how many segments currently drawn
  const seqRef = useRef(0);            // cancellation token
  const lastKeyRef = useRef(0);        // last animKey we handled
  const initedRef = useRef(false);
  const [inited, setInited] = useState(false);
  const [landedSegs, setLandedSegs] = useState(0); // legs the plane has finished

  // secret flyover: replay the whole journey to the end
  useEffect(() => {
    if (compact) return;
    const go = () => { setActive("jc"); setAnimKey((k) => k + 1); };
    window.addEventListener("lifemap-flyover", go);
    return () => window.removeEventListener("lifemap-flyover", go);
  }, [compact]);

  useEffect(() => {
    const token = ++seqRef.current;
    const getEl = (i) => pathRefs.current[i];
    const setSeg = (i, drawn, animate) => {
      const el = getEl(i);
      if (!el) return;
      const len = el.getTotalLength();
      el.style.strokeDasharray = len;
      if (animate) {
        void el.getBoundingClientRect(); // commit start value so transition fires
        el.style.transition = "stroke-dashoffset 1000ms cubic-bezier(.22,1,.36,1)";
      } else {
        el.style.transition = "none";
      }
      el.style.strokeDashoffset = drawn ? 0 : len;
    };
    const flyPlane = (i) => new Promise((res) => {
      const el = getEl(i);
      if (!el) return res();
      const len = el.getTotalLength();
      let start;
      const dur = Math.max(350, Math.min(1000, len * 3)); // short hops fly faster
      const step = (ts) => {
        if (seqRef.current !== token) { setPlane((p) => ({ ...p, on: false })); return res(); }
        if (!start) start = ts;
        const k = Math.min(1, (ts - start) / dur);
        const e = 1 - Math.pow(1 - k, 3);
        const pt = el.getPointAtLength(e * len);
        const ahead = el.getPointAtLength(Math.min(len, e * len + 3));
        const a = Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180 / Math.PI;
        setPlane({ x: pt.x, y: pt.y, a, on: k < 1 });
        if (k < 1) requestAnimationFrame(step);else res();
      };
      requestAnimationFrame(step);
    });

    (async () => {
      const target = Math.max(0, activeIdx);
      let from = drawnRef.current;

      if (!initedRef.current) {
        // first paint: start from zero, everything hidden
        segments.forEach((s) => setSeg(s.idx, false, false));
        initedRef.current = true;
        setInited(true);
        from = 0;
        drawnRef.current = 0;
        setLandedSegs(0);
      } else if (lastKeyRef.current !== animKey) {
        // replay: wipe the whole journey and redraw from the start
        segments.forEach((s) => setSeg(s.idx, false, false));
        from = 0;
        drawnRef.current = 0;
        setLandedSegs(0);
      }
      lastKeyRef.current = animKey;

      if (target < from) {
        // picked an earlier city: retract later legs
        for (let i = from; i > target; i--) setSeg(i, false, true);
        setPlane((p) => ({ ...p, on: false }));
        drawnRef.current = target;
        setLandedSegs(target);
        return;
      }
      for (let i = from + 1; i <= target; i++) {
        if (seqRef.current !== token) return;
        setSeg(i, true, true);
        drawnRef.current = i;
        if (!compact && window.__flightSound) flightWhoosh();
        await flyPlane(i);
        if (seqRef.current !== token) return;
        setLandedSegs(i);
      }
    })();
  }, [segments, activeIdx, animKey]);

  const activePoint = pts.find(p => p.id === (hover || active));

  // autoplay through journey
  useEffect(() => {
    if (!autoplay) return;
    const ids = ["guangzhou","nashville","vienna","brooklyn","jc"];
    let i = 0;
    setActive(ids[0]); setAnimKey(k => k+1);
    const t = setInterval(() => {
      i = (i + 1) % ids.length;
      setActive(ids[i]);
      if (i === 0) setAnimKey(k => k+1);
    }, 2400);
    return () => clearInterval(t);
  }, [autoplay]);

  function pickCity(id) {
    if (movedRef.current) { movedRef.current = false; return; } // it was a pan, not a click
    if (id === active) {
      // replay
      setAnimKey(k => k + 1);
    } else {
      setActive(id);
    }
  }

  return (
    <div className={"lifemap" + (compact ? " is-compact" : "")}>
      <div className="lifemap-stage">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="lifemap-svg"
           onPointerDown={onPointerDown} onPointerMove={onPointerMove}
           onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
           style={{ cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default", touchAction: "none" }}>
        <defs>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(27,26,23,0.05)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect x="0" y="0" width={W} height={H} fill="url(#grid)" />

        <g className="map-pan"
           transform={`scale(${zoom}) translate(${-vx} ${-vy})`}
           style={{ transition: dragging ? "none" : "transform 0.5s cubic-bezier(.22,1,.36,1)" }}>

        {/* equator + prime meridian */}
        <line x1="0" y1={H/2} x2={W} y2={H/2} stroke="rgba(27,26,23,0.12)" strokeDasharray="2 6" />
        <line x1={W/2} y1="0" x2={W/2} y2={H} stroke="rgba(27,26,23,0.12)" strokeDasharray="2 6" />
        <line x1="0" y1={H * (90-23.5)/180} x2={W} y2={H * (90-23.5)/180} stroke="rgba(27,26,23,0.06)" strokeDasharray="1 5" />
        <line x1="0" y1={H * (90+23.5)/180} x2={W} y2={H * (90+23.5)/180} stroke="rgba(27,26,23,0.06)" strokeDasharray="1 5" />

        {/* land dots */}
        <g>
          {landDots.map((d, i) => (
            <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill="rgba(27,26,23,0.32)" />
          ))}
        </g>

        {/* animated journey segments */}
        <g style={{ opacity: inited ? 1 : 0 }}>
          {segments.map(s => (
            <path
              key={s.idx}
              ref={el => (pathRefs.current[s.idx] = el)}
              d={s.d}
              fill="none"
              stroke="var(--c-terra)"
              strokeWidth={2.2 / Math.sqrt(zoom)}
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* the little plane flying the current leg */}
        {plane.on && (
          <g transform={`translate(${plane.x}, ${plane.y}) rotate(${plane.a || 0}) scale(${1 / zoom})`}>
            <circle r="15" fill="var(--c-terra)" opacity="0.2" filter="url(#softGlow)" />
            <text textAnchor="middle" dominantBaseline="central" fontSize="24"
                  fill="var(--c-terra)" stroke="var(--paper)" strokeWidth="0.8"
                  style={{ pointerEvents: "none" }}>{"✈︎"}</text>
          </g>
        )}

        {/* halo on active */}
        {activePoint && (
          <circle cx={activePoint.X} cy={activePoint.Y} r={22 / zoom}
                  fill="var(--c-terra)" opacity="0.18" filter="url(#softGlow)" />
        )}

        {/* pins */}
        {pts.filter(p => !p.hidden).map(p => {
          const isLived = p.kind !== "travel";
          const isActive = p.id === (hover || active);
          const iz = 1 / zoom;
          return (
            <g key={p.id}
               onMouseEnter={() => setHover(p.id)}
               onMouseLeave={() => setHover(null)}
               onClick={() => pickCity(p.id)}
               style={{ cursor: "pointer" }}>
              <circle cx={p.X} cy={p.Y} r={20 * iz} fill="transparent" />
              {isLived ? (
                <>
                  <circle cx={p.X} cy={p.Y} r={(isActive ? 8 : 5.5) * iz} fill="var(--c-terra)"
                          style={{ transition: "r 0.2s" }} />
                  <circle cx={p.X} cy={p.Y} r={(isActive ? 16 : 12) * iz} fill="none"
                          stroke="var(--c-terra)" strokeWidth={1.2 * iz} opacity="0.65"
                          style={{ transition: "r 0.2s" }} />
                </>
              ) : (
                <circle cx={p.X} cy={p.Y} r={(isActive ? 5.5 : 4) * iz}
                        fill="var(--paper)" stroke="var(--ink)" strokeWidth={1.4 * iz} />
              )}
              {(isLived || (!compact && (isActive || zoom >= 2))) && (
                <text x={p.X + (p.ldx != null ? p.ldx : 12) * iz} y={p.Y + (p.ldy != null ? p.ldy : -10) * iz}
                      fontFamily="var(--mono)" fontSize={13 * iz}
                      fill={isActive ? "var(--ink)" : "var(--ink-2)"}
                      opacity={isActive ? 1 : isLived ? 0.65 : 0.5}
                      style={{ pointerEvents: "none" }}>
                  {p.name}
                </text>
              )}
            </g>
          );
        })}

        <g fontFamily="var(--mono)" fontSize="10" fill="var(--muted)">
          <text x="6" y={H/2 - 4}>0°</text>
          <text x={W/2 + 4} y="14">0°</text>
        </g>
        </g>
      </svg>

      {!compact && (
        <div className="map-zoom mono">
          <button onClick={() => zoomTo(zoom * 1.5)} disabled={zoom >= 6}
                  aria-label="Zoom in" title="Zoom in">+</button>
          <span className="zoom-lvl">{(Math.round(zoom * 10) / 10).toString().replace(/\.0$/, "")}×</span>
          <button onClick={() => zoomTo(zoom / 1.5)} disabled={zoom <= 1}
                  aria-label="Zoom out" title="Zoom out">−</button>
          {zoom > 1 && (
            <button className="zoom-reset" onClick={() => zoomTo(1)}
                    aria-label="Reset zoom" title="Reset">⌖</button>
          )}
        </div>
      )}

      {!compact && (
        <div className="lifemap-legend mono">
          <span><span className="lg lg-lived" /> Lived</span>
          <span><span className="lg lg-trav" /> Traveled</span>
          <span><span className="lg lg-line" /> Journey</span>
          <button className="replay-btn mono" onClick={() => setAnimKey(k => k + 1)}>
            ↻ Replay
          </button>
        </div>
      )}
      </div>

      {!compact && (
        <>
          <div className="lifemap-card">
            <div className="lifemap-card-kicker mono">
              <span className="dot" /> {activePoint?.kind === "travel" ? "TRAVELED" : "LIVED"}
              <span style={{opacity: 0.5}}> · </span>
              {activePoint?.era}
            </div>
            <div className="lifemap-card-title serif">
              {activePoint?.name}
              {activePoint?.label && activePoint.label !== activePoint.name && (
                <span className="ital" style={{opacity: 0.55, marginLeft: 10, fontSize: "0.7em"}}>
                  {activePoint.label}
                </span>
              )}
            </div>
            <div className="lifemap-card-sub mono">{activePoint?.country}</div>
            <div className="lifemap-card-note">{activePoint?.note || "A quick stop. Camera-only."}</div>
            {activePoint?.moment && (
              <div className="lifemap-card-moment mono">
                ★ {activePoint.moment}
              </div>
            )}
            <div className="lifemap-card-coords mono">
              {activePoint.lat.toFixed(2)}° {activePoint.lat >= 0 ? "N" : "S"}
              {"   ·   "}
              {Math.abs(activePoint.lon).toFixed(2)}° {activePoint.lon >= 0 ? "E" : "W"}
            </div>
          </div>

          <div className="lifemap-strip">
            {pts.filter(p => p.kind !== "travel" && !p.hidden).map(p => (
              <button key={p.id}
                      className={"strip-btn" + (active === p.id ? " is-active" : "")}
                      onClick={() => pickCity(p.id)}>
                <span className="mono strip-era">{p.era}</span>
                <span className="serif strip-name">{p.name}</span>
              </button>
            ))}
          </div>

          <PassportStamps landedSegs={landedSegs} inited={inited} />
        </>
      )}
    </div>
  );
}

window.LifeMap = LifeMap;
window.PLACES = PLACES;

/* ---------- Passport stamps: one per lived city, thunks in as the plane lands ---------- */
const STAMP_DEFS = [
  // seg = journey leg after which this city is "landed" (0 = origin, always stamped)
  { id: "guangzhou", seg: 0, name: "GUANGZHOU", sub: "CAN · 1997", glyph: "广州", shape: "round", inkCls: "si-red",  r: -8 },
  { id: "nashville", seg: 1, name: "NASHVILLE", sub: "BNA · 2015", glyph: "★", shape: "rect",  inkCls: "si-blue", r: 5 },
  { id: "vienna",    seg: 2, name: "WIEN",      sub: "VIE · 2017", glyph: "♪", shape: "oval",  inkCls: "si-ink",  r: -4 },
  { id: "brooklyn",  seg: 4, name: "BROOKLYN",  sub: "NYU · 2018", glyph: "⚒", shape: "round", inkCls: "si-blue", r: 7 },
  { id: "jc",        seg: 5, name: "JERSEY CITY", sub: "EWR · 2021", glyph: "⌂", shape: "rect", inkCls: "si-red", r: -5 },
];

function PassportStamps({ landedSegs, inited }) {
  return (
    <div className="stamp-row" aria-label="Passport stamps">
      <span className="stamp-row-label mono">ARRIVALS →</span>
      {STAMP_DEFS.map((s) => {
        const landed = inited && landedSegs >= s.seg;
        return (
          <div key={s.id}
               className={"stamp " + s.shape + " " + s.inkCls + (landed ? " is-landed" : "")}
               style={{ "--stamp-r": s.r + "deg" }}>
            <span className="stamp-glyph">{s.glyph}</span>
            <span className="stamp-name">{s.name}</span>
            <span className="stamp-sub">{s.sub}</span>
          </div>
        );
      })}
    </div>
  );
}
