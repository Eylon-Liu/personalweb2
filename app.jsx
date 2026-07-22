/* Eylon's personal site — app.jsx
   Tabbed magazine layout with colored blocks, animation, and personality. */

const { useState, useEffect, useRef } = React;
const { TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakToggle,
        CursorDoodle, HeroStickers, CoffeeBadge, PhotoLightbox,
        confettiBurst, useSecretCode } = window;

// ============================ STYLES ============================
const css = `
  /* ============ LAYOUT ============ */
  .page { position: relative; z-index: 2; max-width: 1320px; margin: 0 auto; padding: 18px 28px 80px; }
  @media (max-width: 760px) { .page { padding: 12px 12px 60px; } }

  /* ============ TOPBAR ============ */
  .topbar { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
            gap: 24px; padding: 14px 22px; background: var(--c-cream);
            border-radius: 999px; border: 1px solid var(--ink); position: sticky; top: 18px;
            z-index: 30; box-shadow: 0 6px 0 -2px var(--ink); }
  @media (max-width: 880px) {
    .topbar { grid-template-columns: 1fr auto; padding: 10px 14px; gap: 12px; top: 10px; }
    .topbar .nav-loc { display: none; }
  }
  @media (max-width: 520px) {
    .topbar { grid-template-columns: 1fr; gap: 8px; padding: 10px 12px; border-radius: 20px; }
    .topbar .nav-brand { justify-content: center; font-size: 18px; }
    .topbar .tabs { justify-content: center; overflow-x: auto; max-width: 100%;
                    scrollbar-width: none; -ms-overflow-style: none; }
    .topbar .tabs::-webkit-scrollbar { display: none; }
    .topbar .tab-btn { padding: 7px 11px; font-size: 10px; letter-spacing: 0.1em; }
  }
  .nav-brand { font-family: var(--serif); font-size: 22px; letter-spacing: -0.01em;
               display: inline-flex; align-items: center; gap: 8px; }
  .nav-brand .dot { width: 10px; height: 10px; border-radius: 50%;
                    background: var(--c-terra); display: inline-block;
                    animation: pulse 2.4s ease-in-out infinite; }
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.4); opacity: 0.6; }
  }
  .tabs { display: flex; gap: 4px; padding: 4px; background: var(--bg-2);
          border-radius: 999px; }
  .tab-btn { background: transparent; border: 0; cursor: pointer;
             padding: 8px 16px; border-radius: 999px;
             font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em;
             text-transform: uppercase; color: var(--ink-2);
             transition: background 0.2s, color 0.2s; white-space: nowrap; }
  .tab-btn:hover { color: var(--ink); }
  .tab-btn.is-active { background: var(--ink); color: var(--c-cream); }
  .nav-loc { font-family: var(--mono); font-size: 11px; opacity: 0.7; letter-spacing: 0.08em;
             text-align: right; display: flex; align-items: center; justify-content: flex-end; gap: 8px;
             white-space: nowrap; }
  .nav-loc .live-dot { width: 7px; height: 7px; border-radius: 50%; background: #2C8A3F;
                       box-shadow: 0 0 0 0 rgba(44, 138, 63, 0.5);
                       animation: live 1.6s ease-out infinite; }
  @keyframes live {
    0% { box-shadow: 0 0 0 0 rgba(44,138,63,0.6); }
    100% { box-shadow: 0 0 0 10px rgba(44,138,63,0); }
  }

  /* ============ TAB CONTENT ============ */
  .tab-content { margin-top: 22px; opacity: 1; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }

  /* ============ SCROLL REVEAL ============ */
  /* hidden state only applies once JS confirms the observer is live (body.js-reveal) —
     if anything fails, content simply shows */
  @media (prefers-reduced-motion: no-preference) {
    body:not(.no-motion) .tab-content { animation: fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }
    body.js-reveal:not(.no-motion) .rv { opacity: 0; transform: translateY(18px); }
    body.js-reveal:not(.no-motion) .rv.is-in { opacity: 1; transform: none;
      transition: opacity 0.65s ease, transform 0.65s cubic-bezier(.22,1,.36,1);
      transition-delay: var(--rv-d, 0ms); }
  }

  /* ============ BLOCK ============ */
  .block { border-radius: 24px; padding: 40px; border: 1px solid var(--ink);
           box-shadow: 0 6px 0 -2px var(--ink); position: relative; overflow: hidden; }
  .block.ov { overflow: visible; }
  @media (max-width: 760px) { .block { padding: 24px; border-radius: 18px; } }
  .block.cream  { background: var(--c-cream); }
  .block.butter { background: var(--c-butter); }
  .block.sage   { background: var(--c-sage); }
  .block.sky    { background: var(--c-sky); }
  .block.rose   { background: var(--c-rose); }
  .block.terra  { background: var(--c-terra); color: var(--c-cream); }
  .block.terra .ink2, .block.terra .muted { color: rgba(251,245,230,0.8); }
  .block.ink    { background: var(--c-ink); color: var(--c-cream); }
  .block.ink .ink2, .block.ink .muted { color: rgba(251,245,230,0.7); }
  .block.mint   { background: var(--c-mint); }
  .block.pink   { background: var(--c-pink); }
  .block.lemon  { background: var(--c-lemon); }
  .block.paper  { background: var(--paper); }

  .block-kicker { font-family: var(--mono); font-size: 12px; letter-spacing: 0.22em;
                  text-transform: uppercase; opacity: 0.7; }
  .block-title { font-family: var(--serif); font-size: clamp(40px, 6vw, 80px);
                 line-height: 1; letter-spacing: -0.02em; margin: 10px 0 0; font-weight: 400; }
  .block-title .ital { font-style: italic; }
  .block-lede { font-family: var(--serif); font-size: clamp(18px, 2vw, 24px); line-height: 1.45;
                color: inherit; opacity: 0.88; margin-top: 16px; max-width: 600px;
                text-wrap: pretty; }
  .block-head { display: grid; grid-template-columns: 1.2fr 1fr; align-items: end;
                gap: 24px 48px; margin-bottom: 36px; }
  @media (max-width: 760px) { .block-head { grid-template-columns: 1fr; gap: 16px; } }

  /* ============ HERO ============ */
  .hero { display: grid; grid-template-columns: 1.2fr auto; gap: 32px; align-items: center; }
  @media (max-width: 760px) { .hero { grid-template-columns: 1fr; } }
  .hero-greet { display: flex; flex-wrap: wrap; gap: 14px 24px; font-family: var(--serif);
                font-size: 22px; color: var(--ink-2); margin-bottom: 28px; }
  .hero-greet span { display: inline-flex; align-items: baseline; gap: 8px; white-space: nowrap; }
  .hero-greet em { font-style: italic; color: var(--ink); }
  .hero-greet .tag { font-family: var(--mono); font-size: 10px; letter-spacing: 0.18em;
                     text-transform: uppercase; opacity: 0.55; }
  .hero-name { font-family: var(--serif); font-size: clamp(58px, 13vw, 200px);
               line-height: 0.9; letter-spacing: -0.03em; margin: 0; font-weight: 400; }
  .hero-name .ital { font-style: italic; color: var(--c-terra); }
  .hero-cn { font-family: "Noto Serif SC", var(--serif); font-size: clamp(30px, 5vw, 80px);
             line-height: 1; margin-top: 10px; letter-spacing: 0.04em; opacity: 0.92; }
  .hero-pron { font-family: var(--mono); font-size: 13px; letter-spacing: 0.1em;
               text-transform: uppercase; opacity: 0.6; margin-top: 18px;
               display: flex; align-items: center; gap: 10px; }
  .hero-pron .pron-pill { background: var(--ink); color: var(--c-cream);
                          padding: 5px 12px; border-radius: 999px; letter-spacing: 0.06em; }

  .avatar-wrap { position: relative; width: 390px; height: 390px;
                 transform: rotate(-3deg); transition: transform 0.4s; }
  .avatar-wrap:hover { transform: rotate(3deg) scale(1.04); }
  .avatar { width: 100%; height: 100%; border-radius: 999px; overflow: hidden;
            background: var(--c-butter); border: 2px solid var(--ink); position: relative;
            box-shadow: 0 8px 0 -2px var(--ink); }
  .avatar img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 18%; display: block; }
  .avatar-sticker { position: absolute; top: -10px; right: -10px; z-index: 2;
                    cursor: pointer; transition: transform 0.18s;
                    background: var(--c-terra); color: var(--c-cream);
                    width: 96px; height: 96px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center; text-align: center;
                    font-family: var(--mono); font-size: 12px; letter-spacing: 0.1em;
                    text-transform: uppercase; line-height: 1.1; border: 2px solid var(--ink);
                    transform: rotate(12deg); }
  .avatar-sticker:hover { transform: rotate(4deg) scale(1.12); }
  .avatar-sticker:active { transform: rotate(4deg) scale(0.92); }
  @media (max-width: 760px) { .avatar-wrap { width: 240px; height: 240px; } }

  /* ============ CURSOR DOODLE ============ */
  .cursor-doodle { position: fixed; left: 0; top: 0; width: 18px; height: 18px;
                   margin: -9px 0 0 -9px; border: 1.6px solid var(--c-terra);
                   border-radius: 50%; pointer-events: none; z-index: 9999;
                   transition: width 0.2s, height 0.2s, margin 0.2s, background 0.2s, opacity 0.2s; }
  .cursor-doodle.is-hot { width: 38px; height: 38px; margin: -19px 0 0 -19px;
                          background: oklch(0.62 0.12 35 / 0.14); }
  /* paintbrush mode — ring fills with the active paint color, teardrop tip */
  .cursor-doodle.is-brush { width: 16px; height: 16px; margin: -8px 0 0 -8px;
                            border-color: rgba(26,25,22,0.32);
                            background: var(--brush, var(--c-terra));
                            border-radius: 62% 62% 62% 0;
                            box-shadow: 0 0 0 2px rgba(251,245,230,0.92),
                                        0 2px 6px rgba(26,25,22,0.28); }
  .cursor-doodle.is-brush.is-hot { width: 30px; height: 30px; margin: -15px 0 0 -15px;
                                   background: var(--brush, var(--c-terra)); }
  body.brush-on { cursor: none; }
  body.brush-on a, body.brush-on button, body.brush-on .strip-btn,
  body.brush-on .stk { cursor: none; }

  /* paint splats dropped on click / drag — purely decorative overlay */
  .paint-layer { position: fixed; inset: 0; pointer-events: none; z-index: 9990; overflow: hidden; }
  .paint-splat { position: fixed; transform: translate(-50%, -50%) rotate(var(--rot, 0deg)) scale(0);
                 mix-blend-mode: multiply; opacity: 0; will-change: transform, opacity;
                 animation: splatPop 2.7s cubic-bezier(.2,1.4,.35,1) forwards; }
  @keyframes splatPop {
    0%   { transform: translate(-50%,-50%) rotate(var(--rot)) scale(0);    opacity: 0; }
    16%  { transform: translate(-50%,-50%) rotate(var(--rot)) scale(1.12); opacity: 0.95; }
    34%  { transform: translate(-50%,-50%) rotate(var(--rot)) scale(0.94); opacity: 0.9; }
    100% { transform: translate(-50%,-50%) rotate(var(--rot)) scale(1.02); opacity: 0; }
  }
  @media (pointer: coarse) { .cursor-doodle, .paint-layer { display: none; } }
  body.no-motion .cursor-doodle { display: none; }
  body.no-motion .paint-layer { display: none; }

  /* ============ HERO STICKERS ============ */
  .stk { position: absolute; z-index: 6; cursor: grab; user-select: none;
         touch-action: none; transform: rotate(var(--stk-r, 0deg));
         font-family: var(--mono); border: 1px solid var(--ink);
         box-shadow: 0 3px 0 -1px var(--ink); transition: box-shadow 0.2s; }
  .stk:active { cursor: grabbing; box-shadow: 0 6px 0 -1px var(--ink); }
  .stk-pass { background: var(--c-sky); font-size: 9px; letter-spacing: 0.08em;
              line-height: 1.6; padding: 8px 12px; border-radius: 8px;
              border-left: 1px dashed var(--ink); text-transform: uppercase; }
  .stk-chop { background: var(--c-terra); color: var(--c-cream);
              font-family: var(--serif); font-size: 30px; width: 52px; height: 52px;
              display: flex; align-items: center; justify-content: center;
              border-radius: 10px; }
  .stk-film { background: var(--c-ink); color: var(--c-cream); font-size: 9px;
              letter-spacing: 0.14em; padding: 7px 11px; border-radius: 6px; }
  @media (max-width: 1020px) { .stk { display: none; } }

  /* ============ PEEL CHIPS & GHOST GLYPHS (overlap layer) ============ */
  .peel { position: absolute; z-index: 5; font-family: var(--mono); font-size: 10px;
          letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink);
          padding: 8px 14px; border: 1px solid var(--ink); border-radius: 999px;
          box-shadow: 0 3px 0 -1px var(--ink); white-space: nowrap;
          transform: rotate(var(--peel-r, -3deg)); pointer-events: none; }
  @media (prefers-reduced-motion: no-preference) {
    body:not(.no-motion) .peel { animation: peelBob 5.5s ease-in-out infinite; }
  }
  @keyframes peelBob { 0%, 100% { transform: rotate(var(--peel-r, -3deg)) translateY(0); }
                       50% { transform: rotate(var(--peel-r, -3deg)) translateY(-6px); } }
  .peel.p-butter { background: var(--c-butter); }
  .peel.p-sky    { background: var(--c-sky); }
  .peel.p-sage   { background: var(--c-sage); }
  .peel.p-rose   { background: var(--c-rose); }
  @media (max-width: 760px) { .peel { display: none; } }

  .block-glyph { position: absolute; top: -34px; right: 34px; z-index: 4;
                 font-family: var(--serif); font-style: italic; font-size: 150px;
                 line-height: 1; color: var(--ink); opacity: 0.07;
                 pointer-events: none; user-select: none; }
  @media (max-width: 760px) { .block-glyph { font-size: 90px; top: -22px; right: 18px; } }

  /* ============ PASSPORT STAMPS ============ */
  .stamp-row { grid-column: 1 / -1; display: flex; align-items: center; gap: 18px;
               flex-wrap: wrap; margin-top: 6px; padding: 16px 18px;
               border: 1px dashed var(--ink); border-radius: 16px; opacity: 0.96; }
  .stamp-row-label { font-size: 10px; letter-spacing: 0.22em; color: var(--muted); }
  .stamp { display: flex; flex-direction: column; align-items: center; gap: 1px;
           padding: 10px 16px; border: 2.2px double currentColor;
           transform: rotate(var(--stamp-r, 0deg)) scale(2.4);
           opacity: 0; visibility: hidden; }
  .stamp.round { border-radius: 50%; padding: 14px 18px; }
  .stamp.oval  { border-radius: 50% / 38%; padding: 12px 20px; }
  .stamp.rect  { border-radius: 6px; }
  .stamp.si-red  { color: oklch(0.52 0.16 32); }
  .stamp.si-blue { color: oklch(0.45 0.10 255); }
  .stamp.si-ink  { color: var(--ink); }
  .stamp.is-landed { opacity: 0.82; visibility: visible;
                     animation: stampThunk 0.42s cubic-bezier(.2,1.6,.35,1) both; }
  @keyframes stampThunk {
    0%   { transform: rotate(var(--stamp-r)) scale(2.4); opacity: 0; }
    62%  { transform: rotate(var(--stamp-r)) scale(0.94); opacity: 0.9; }
    100% { transform: rotate(var(--stamp-r)) scale(1); opacity: 0.82; }
  }
  body.no-motion .stamp.is-landed { animation: none; }
  .stamp-glyph { font-family: var(--serif); font-size: 17px; line-height: 1.1; white-space: nowrap; }
  .stamp-name { font-family: var(--mono); font-size: 10px; letter-spacing: 0.18em; }
  .stamp-sub { font-family: var(--mono); font-size: 8px; letter-spacing: 0.14em; opacity: 0.75; }

  .love.wide { grid-column: span 6; min-height: 150px; }
  .love.half { grid-column: span 3; }
  @media (max-width: 880px) { .love.wide, .love.half { grid-column: span 2; } }

  /* ============ PLAYFUL SHAPES (tweakable) ============ */
  body.shapes-playful .block.hero { border-radius: 56px 140px 56px 140px; }
  body.shapes-playful .stats { border-radius: 999px; }
  body.shapes-playful .stat:first-child { padding-left: 44px; }
  body.shapes-playful .stat:last-child { padding-right: 44px; }
  body.shapes-playful .block.sage.now-block { border-radius: 26px 120px 120px 26px; }
  body.shapes-playful .block.butter.chapter-teaser { border-radius: 120px 26px 26px 120px; }
  body.shapes-playful .block.rose { border-radius: 90px 26px 90px 26px; }
  body.shapes-playful .proj { transition: transform 0.3s, box-shadow 0.3s; }
  body.shapes-playful .proj:nth-child(3n+1) { border-radius: 70px 18px 18px 18px; transform: rotate(-0.5deg); }
  body.shapes-playful .proj:nth-child(3n+2) { border-radius: 18px 18px 70px 18px; transform: rotate(0.4deg); }
  body.shapes-playful .proj:nth-child(3n)   { border-radius: 18px 70px 18px 70px; }
  body.shapes-playful .proj:hover { transform: rotate(0deg) translateY(-3px); }
  body.shapes-playful .love:nth-child(6n+1) { border-radius: 60px 18px 60px 18px; transform: rotate(-0.6deg); }
  body.shapes-playful .love:nth-child(6n+2) { border-radius: 999px 999px 18px 18px / 120px 120px 18px 18px; }
  body.shapes-playful .love:nth-child(6n+3) { border-radius: 18px 60px 18px 60px; transform: rotate(0.6deg); }
  body.shapes-playful .love:nth-child(6n+4) { border-radius: 18px 18px 90px 18px; transform: rotate(0.4deg); }
  body.shapes-playful .love:nth-child(6n+5) { border-radius: 90px 18px 18px 18px; }
  body.shapes-playful .love:nth-child(6n)   { border-radius: 18px 18px 18px 90px; transform: rotate(-0.4deg); }
  body.shapes-playful .love.wide { border-radius: 999px; padding-left: 48px; padding-right: 48px;
                                   align-items: flex-start; transform: rotate(0deg); }
  @media (max-width: 880px) { body.shapes-playful .love.wide { border-radius: 40px; padding-left: 22px; padding-right: 22px; } }
  body.shapes-playful .love:hover { transform: rotate(0deg) scale(1.02); }
  body.shapes-playful .chapter-row:nth-child(odd) { border-radius: 999px 18px 18px 999px / 90px 18px 18px 90px; padding-left: 36px; }
  body.shapes-playful .chapter-row:nth-child(even) { border-radius: 18px 999px 999px 18px / 18px 90px 90px 18px; }
  @media (max-width: 760px) {
    body.shapes-playful .chapter-row:nth-child(odd),
    body.shapes-playful .chapter-row:nth-child(even) { border-radius: 24px; padding-left: 24px; }
    body.shapes-playful .block.hero { border-radius: 32px 80px 32px 80px; }
  }
  body.shapes-playful .meta-card:nth-child(odd) { border-radius: 70px 14px 70px 14px; }
  body.shapes-playful .meta-card:nth-child(even) { border-radius: 14px 70px 14px 70px; }
  body.shapes-playful .marquee { border-radius: 999px; }

  /* ============ SECRET TOAST ============ */
  .secret-toast { position: fixed; left: 50%; bottom: 34px; transform: translateX(-50%);
                  z-index: 10001; background: var(--ink); color: var(--c-cream);
                  font-family: var(--mono); font-size: 12px; letter-spacing: 0.12em;
                  text-transform: uppercase; padding: 12px 22px; border-radius: 999px;
                  box-shadow: 0 6px 0 -2px rgba(27,26,23,0.4);
                  animation: toastIn 0.35s cubic-bezier(.2,1.4,.4,1) both; }
  @keyframes toastIn { from { transform: translate(-50%, 24px); opacity: 0; }
                       to { transform: translate(-50%, 0); opacity: 1; } }

  /* ============ COFFEE BADGE ============ */
  .coffee-badge { position: absolute; left: -20px; bottom: -12px; width: 84px;
                  height: 84px; z-index: 3; cursor: pointer; display: block;
                  transition: transform 0.25s; }
  .coffee-badge:hover { transform: scale(1.1); }
  .coffee-badge:hover .cb-spin { animation-duration: 5s; }
  .coffee-badge svg { width: 100%; height: 100%; display: block;
                      filter: drop-shadow(0 3px 0 rgba(26,25,22,0.6)); }
  .cb-spin { animation: cbSpin 16s linear infinite; }
  @keyframes cbSpin { to { transform: rotate(360deg); } }
  body.no-motion .cb-spin { animation: none; }
  .cb-core { position: absolute; inset: 0; display: flex; align-items: center;
             justify-content: center; font-size: 22px; color: var(--c-terra); }
  @media (max-width: 760px) { .coffee-badge { width: 64px; height: 64px; left: -12px; bottom: -8px; } }

  /* ============ STAT STRIP ============ */
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
           background: var(--c-ink); color: var(--c-cream); border-radius: 24px;
           padding: 0; border: 1px solid var(--ink); overflow: hidden;
           box-shadow: 0 6px 0 -2px var(--ink); }
  @media (max-width: 760px) { .stats { grid-template-columns: 1fr 1fr; } }
  .stat { padding: 28px 22px; border-right: 1px dashed rgba(251,245,230,0.2);
          display: flex; flex-direction: column; gap: 6px; min-height: 140px;
          justify-content: space-between; transition: background 0.3s; }
  .stat:hover { background: rgba(251,245,230,0.06); }
  .stat:last-child { border-right: 0; }
  @media (max-width: 760px) {
    .stat:nth-child(2) { border-right: 0; }
    .stat:nth-child(odd) { border-bottom: 1px dashed rgba(251,245,230,0.2); }
  }
  .stat-num { font-family: var(--serif); font-size: clamp(56px, 6vw, 84px); line-height: 0.95;
              letter-spacing: -0.02em; }
  .stat-num .ital { font-style: italic; color: var(--c-butter); }
  .stat-label { font-family: var(--mono); font-size: 11px; letter-spacing: 0.16em;
                text-transform: uppercase; opacity: 0.78; }

  /* ============ HOME GRID ============ */
  .home-row { margin-top: 18px; }
  .home-row2 { display: grid; gap: 18px; grid-template-columns: 1fr 1fr; margin-top: 18px; }
  @media (max-width: 760px) { .home-row2 { grid-template-columns: 1fr; } }

  /* mini map card */
  .mini-map-block { padding: 28px 32px; }
  @media (max-width: 760px) { .mini-map-block { padding: 22px; } }
  .mini-map-block .block-kicker { color: rgba(26,25,22,0.7); }
  .mini-map-head { display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px 48px;
                   align-items: end; margin-bottom: 8px; }
  @media (max-width: 760px) { .mini-map-head { grid-template-columns: 1fr; gap: 10px; } }
  .mini-wrap { background: var(--c-cream); border: 1px solid var(--ink); border-radius: 16px;
               margin-top: 18px; padding: 18px; overflow: hidden; }
  @media (max-width: 760px) { .mini-wrap { padding: 10px; } }
  .mini-cta { margin-top: 14px; display: flex; align-items: center; justify-content: space-between;
              gap: 12px; font-family: var(--mono); font-size: 12px; letter-spacing: 0.1em;
              text-transform: uppercase; flex-wrap: wrap; }
  .mini-cta button { background: var(--ink); color: var(--c-cream); border: 0; padding: 10px 16px;
                     border-radius: 999px; font: inherit; letter-spacing: 0.12em;
                     text-transform: uppercase; cursor: pointer; display: inline-flex; gap: 6px;
                     align-items: center; transition: transform 0.2s, background 0.2s; }
  .mini-cta button:hover { background: var(--c-terra); transform: translateX(2px); }

  /* chapter teaser */
  .chapter-teaser { display: flex; flex-direction: column; gap: 14px; height: 100%; }
  .chapter-teaser .yr { font-family: var(--mono); font-size: 12px; letter-spacing: 0.16em;
                        text-transform: uppercase; opacity: 0.78; }
  .chapter-teaser h3 { font-family: var(--serif); font-size: clamp(40px, 4.6vw, 60px); line-height: 1.02;
                       margin: 0; font-weight: 400; text-wrap: balance; }
  .chapter-teaser .body { font-family: var(--serif); font-size: clamp(18px, 2vw, 24px); line-height: 1.45;
                          flex: 1; opacity: 0.88; text-wrap: pretty; }
  .chapter-teaser .foot { display: flex; gap: 10px; font-family: var(--mono); font-size: 11px;
                          letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.78; }

  /* tile */
  .tile-label { font-family: var(--mono); font-size: 10px; letter-spacing: 0.18em;
                text-transform: uppercase; opacity: 0.7; }
  .tile-big { font-family: var(--serif); font-size: clamp(38px, 4.6vw, 56px); line-height: 1.04;
              letter-spacing: -0.01em; margin: 6px 0; text-wrap: balance; }
  .tile-big .ital { font-style: italic; }

  /* lang strip block */
  .langs-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; margin-top: 18px; }
  @media (max-width: 760px) { .langs-strip { grid-template-columns: 1fr 1fr; } }
  .lang { padding: 22px 16px; border-right: 1px solid rgba(26,25,22,0.18);
          display: flex; flex-direction: column; gap: 4px; }
  .lang:last-child { border-right: 0; }
  @media (max-width: 760px) { .lang:nth-child(2) { border-right: 0; } }
  .lang-script { font-family: "Noto Serif SC", var(--serif); font-size: clamp(38px, 5vw, 56px); line-height: 1; }
  .lang-name { font-family: var(--mono); font-size: 12px; letter-spacing: 0.14em;
               text-transform: uppercase; opacity: 0.78; }
  .lang-level { font-family: var(--serif); font-style: italic; font-size: 19px; opacity: 0.9; }

  /* now snapshot */
  .now-row { display: grid; grid-template-columns: 100px 1fr; padding: 12px 0;
             border-top: 1px dashed rgba(26,25,22,0.25); }
  .now-row:first-child { border-top: 0; }
  .now-row .k { font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em;
                text-transform: uppercase; opacity: 0.78; padding-top: 4px; }
  .now-row .v { font-family: var(--serif); font-size: 20px; line-height: 1.45; text-wrap: pretty; }
  .now-row .v .ital { font-style: italic; }

  /* marquee strip */
  .marquee { background: var(--c-ink); color: var(--c-cream); border-radius: 999px;
             overflow: hidden; padding: 14px 0; border: 1px solid var(--ink);
             box-shadow: 0 6px 0 -2px var(--ink); white-space: nowrap; }
  .marquee-inner { display: inline-flex; gap: 36px; animation: marquee 28s linear infinite;
                   font-family: var(--mono); font-size: 12px; letter-spacing: 0.14em;
                   text-transform: uppercase; }
  .marquee-inner span { display: inline-flex; align-items: center; gap: 16px; }
  .marquee-inner span::after { content: "✦"; color: var(--c-terra); opacity: 0.8; }
  @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

  /* ============ LIFEMAP (shared) ============ */
  .lifemap { position: relative; display: grid; grid-template-columns: 1fr 320px;
             gap: 18px; align-items: start; }
  .lifemap.is-compact { display: block; padding: 0; }
  .lifemap-stage { position: relative; min-width: 0; }
  .lifemap-svg { width: 100%; height: auto; display: block; }
  .lifemap-card { width: auto; align-self: start; position: sticky; top: 96px;
                  background: var(--c-cream); border: 1px solid var(--ink);
                  border-radius: 18px; padding: 20px;
                  box-shadow: 0 6px 0 -2px var(--ink); }
  .lifemap-card-kicker { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase;
                         display: flex; align-items: center; gap: 8px; color: var(--ink-2); }
  .lifemap-card-kicker .dot { width: 6px; height: 6px; border-radius: 50%;
                              background: var(--c-terra); display: inline-block; }
  .lifemap-card-title { font-size: 38px; line-height: 1; margin: 10px 0 4px; }
  .lifemap-card-sub { font-size: 11px; color: var(--muted); letter-spacing: 0.08em;
                      text-transform: uppercase; margin-bottom: 14px; }
  .lifemap-card-note { font-size: 15px; line-height: 1.5; color: var(--ink-2);
                       padding-top: 12px; border-top: 1px solid var(--rule); }
  .lifemap-card-moment { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
                         color: var(--c-terra); margin-top: 10px; }
  .lifemap-card-coords { font-size: 10px; color: var(--muted); margin-top: 14px;
                         letter-spacing: 0.06em; }
  @media (max-width: 880px) {
    .lifemap { grid-template-columns: 1fr; }
    .lifemap-card { position: static; width: auto; }
  }

  .lifemap-legend { position: absolute; left: 12px; bottom: 12px; white-space: nowrap;
                    display: flex; gap: 14px; font-size: 10px; letter-spacing: 0.14em;
                    text-transform: uppercase; color: var(--ink-2);
                    background: var(--c-cream); border: 1px solid var(--ink);
                    border-radius: 999px; padding: 8px 14px;
                    box-shadow: 0 4px 0 -2px var(--ink); align-items: center; }
  .lifemap-legend span { display: inline-flex; align-items: center; gap: 7px; }
  .lg-lived { width: 8px; height: 8px; border-radius: 50%; background: var(--c-terra);
              outline: 1px solid var(--c-terra); outline-offset: 2px; }
  .lg-trav { width: 8px; height: 8px; border-radius: 50%;
             background: var(--c-cream); border: 1.4px solid var(--ink); }
  .lg-line { width: 22px; height: 0; border-top: 1.8px solid var(--c-terra); }
  .replay-btn { background: var(--ink); color: var(--c-cream); border: 0; white-space: nowrap;
                padding: 4px 10px; border-radius: 999px; font-family: var(--mono);
                font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
                cursor: pointer; margin-left: 4px; }
  .replay-btn:hover { background: var(--c-terra); }
  @media (max-width: 760px) { .lifemap-legend { position: static; margin-top: 12px; flex-wrap: wrap; } }

  .lifemap-strip { grid-column: 1 / -1; display: flex; gap: 8px; margin-top: 0; overflow-x: auto; }

  /* zoom controls */
  .map-zoom { position: absolute; right: 12px; top: 12px; z-index: 3;
              display: flex; flex-direction: column; align-items: center; gap: 5px;
              background: var(--c-cream); border: 1px solid var(--ink);
              border-radius: 999px; padding: 7px;
              box-shadow: 0 4px 0 -2px var(--ink); }
  .map-zoom button { width: 30px; height: 30px; border-radius: 50%;
                     border: 1px solid var(--ink); background: var(--c-cream);
                     color: var(--ink); cursor: pointer; font-family: var(--mono);
                     font-size: 16px; line-height: 1; padding: 0;
                     display: flex; align-items: center; justify-content: center;
                     transition: background 0.15s, color 0.15s, transform 0.15s; }
  .map-zoom button:hover:not(:disabled) { background: var(--c-terra); color: var(--c-cream);
                                          transform: scale(1.08); }
  .map-zoom button:disabled { opacity: 0.35; cursor: default; }
  .map-zoom .zoom-lvl { font-size: 9px; letter-spacing: 0.04em; opacity: 0.7; }
  .strip-btn { flex: 1; min-width: 140px; display: flex; flex-direction: column; align-items: flex-start;
               gap: 4px; padding: 14px 16px; background: var(--c-cream); cursor: pointer;
               text-align: left; color: var(--ink); border: 1px solid var(--ink);
               border-radius: 14px; box-shadow: 0 4px 0 -2px var(--ink);
               transition: transform 0.2s, background 0.2s; }
  .strip-btn:hover { transform: translateY(-2px); }
  .strip-btn.is-active { background: var(--c-terra); color: var(--c-cream); }
  .strip-era { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.8; }
  .strip-name { font-family: var(--serif); font-size: 24px; line-height: 1; }

  /* ============ ATLAS TAB ============ */
  .atlas-block { padding: 24px; }
  .atlas-meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;
                margin-top: 18px; }
  @media (max-width: 760px) { .atlas-meta { grid-template-columns: 1fr 1fr; } }
  .meta-card { background: var(--c-cream); border: 1px solid var(--ink);
               border-radius: 14px; padding: 16px; min-height: 110px;
               box-shadow: 0 4px 0 -2px var(--ink); display: flex; flex-direction: column;
               justify-content: space-between; align-items: center; text-align: center; }
  .meta-card .k { font-family: var(--mono); font-size: 10px; letter-spacing: 0.14em;
                  text-transform: uppercase; opacity: 0.7; }
  .meta-card .v { font-family: var(--serif); font-size: 32px; line-height: 1; }

  /* ============ WORK TAB ============ */
  .work-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 16px; }
  @media (max-width: 880px) { .work-grid { grid-template-columns: 1fr; } }
  .proj { grid-column: span 3; padding: 26px; border-radius: 18px;
          border: 1px solid var(--ink); box-shadow: 0 6px 0 -2px var(--ink);
          display: flex; flex-direction: column; gap: 10px; min-height: 280px;
          position: relative; transition: transform 0.25s, box-shadow 0.25s; }
  .proj:hover { transform: translateY(-3px); box-shadow: 0 9px 0 -2px var(--ink); }
  .proj.feat { grid-column: span 6; min-height: 320px; }
  .proj.third { grid-column: span 2; }
  @media (max-width: 880px) { .proj, .proj.feat, .proj.third { grid-column: span 1; } }
  .proj.c-cream { background: var(--c-cream); }
  .proj.c-butter { background: var(--c-butter); }
  .proj.c-sage { background: var(--c-sage); }
  .proj.c-sky { background: var(--c-sky); }
  .proj.c-rose { background: var(--c-rose); }
  .proj.c-mint { background: var(--c-mint); }
  .proj.c-pink { background: var(--c-pink); }
  .proj.c-lemon { background: var(--c-lemon); }
  .proj-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
  .proj-num { font-family: var(--mono); font-size: 10px; letter-spacing: 0.18em;
              opacity: 0.6; }
  .proj-status { font-family: var(--mono); font-size: 9px; letter-spacing: 0.14em;
                 text-transform: uppercase; padding: 3px 9px; border-radius: 999px;
                 border: 1px solid var(--ink); background: var(--c-cream); color: var(--ink); }
  .proj-status.shipped { background: var(--ink); color: var(--c-cream); }
  .proj-status.production { background: var(--c-terra); color: var(--c-cream); border-color: var(--c-terra); }
  .proj-status.wip { background: var(--c-terra); color: var(--c-cream); border-color: var(--c-terra); }
  .proj-kicker { font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em;
                 text-transform: uppercase; opacity: 0.7; }
  .proj-title { font-family: var(--serif); font-size: 32px; line-height: 1.05; margin: 4px 0 4px;
                font-weight: 400; }
  .proj.feat .proj-title { font-size: 52px; }
  .proj-title .ital { font-style: italic; }
  .proj-text { font-size: 15px; line-height: 1.6; opacity: 0.9; flex: 1; text-wrap: pretty; }
  .proj-stack { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
  .chip { font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em;
          text-transform: uppercase; padding: 4px 9px; border: 1px solid var(--ink);
          border-radius: 999px; }

  /* ============ LIFE TAB — chapters ============ */
  .chapter-rows { display: flex; flex-direction: column; gap: 14px; margin-top: 18px; }
  .chapter-row { display: grid; grid-template-columns: 120px 1.4fr 1fr 116px; gap: 24px;
                 padding: 22px 24px; border: 1px solid var(--ink); border-radius: 18px;
                 box-shadow: 0 4px 0 -2px var(--ink); position: relative;
                 transition: transform 0.25s; align-items: start; }
  .chapter-row:hover { transform: translateX(4px); }
  .chapter-row.c-cream { background: var(--c-cream); }
  .chapter-row.c-butter { background: var(--c-butter); }
  .chapter-row.c-sage { background: var(--c-sage); }
  .chapter-row.c-sky { background: var(--c-sky); }
  .chapter-row.c-rose { background: var(--c-rose); }
  .chapter-row.c-mint { background: var(--c-mint); }
  @media (max-width: 900px) { .chapter-row { grid-template-columns: 1fr; gap: 8px; } }
  .ch-yr { font-family: var(--mono); font-size: 13px; opacity: 0.7; padding-top: 4px; }
  .ch-where { font-family: var(--mono); font-size: 10px; letter-spacing: 0.18em;
              text-transform: uppercase; color: var(--c-terra); margin-bottom: 6px; }
  .ch-title { font-family: var(--serif); font-size: 28px; line-height: 1.1; margin: 0 0 12px;
               font-weight: 400; text-wrap: balance; }
  .ch-text { font-size: 15px; line-height: 1.65; opacity: 0.9; }
  .ch-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
  .ch-photo { width: 116px; height: 116px; border: 1px solid var(--ink); border-radius: 12px;
              overflow: hidden; background: var(--c-cream); justify-self: end;
              box-shadow: 0 4px 0 -2px var(--ink); transform: rotate(2.5deg);
              transition: transform 0.25s; }
  .chapter-row:nth-child(even) .ch-photo { transform: rotate(-2.5deg); }
  .chapter-row:hover .ch-photo { transform: rotate(0deg) scale(1.05); }
  .ch-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .ch-photo .ch-ph-empty { width: 100%; height: 100%; display: flex; align-items: center;
    justify-content: center; text-align: center; padding: 8px;
    font-family: var(--mono); font-size: 10px; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--muted); }
  @media (max-width: 900px) { .ch-photo { justify-self: start; } }

  /* loves */
  .loves-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 14px; margin-top: 18px; }
  @media (max-width: 880px) { .loves-grid { grid-template-columns: 1fr 1fr; } }
  .love { padding: 22px; border-radius: 18px; border: 1px solid var(--ink);
          box-shadow: 0 5px 0 -2px var(--ink); grid-column: span 2;
          transition: transform 0.3s, box-shadow 0.3s;
          display: flex; flex-direction: column; gap: 10px; min-height: 200px;
          transition: transform 0.2s; }
  .love:hover { transform: rotate(-1deg) scale(1.02); }
  @media (max-width: 880px) { .love { grid-column: span 2; } }
  .love.c-cream { background: var(--c-cream); }
  .love.c-butter { background: var(--c-butter); }
  .love.c-sage { background: var(--c-sage); }
  .love.c-sky { background: var(--c-sky); }
  .love.c-rose { background: var(--c-rose); }
  .love.c-mint { background: var(--c-mint); }
  .love.c-pink { background: var(--c-pink); }
  .love-emoji { font-family: var(--serif); font-style: italic; font-size: 50px; line-height: 1;
                opacity: 0.7; }
  .love-title { font-family: var(--serif); font-size: 28px; line-height: 1; margin-top: 4px; }
  .love-text { font-size: 15px; line-height: 1.6; opacity: 0.9; flex: 1; }
  .love-foot { font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em;
               text-transform: uppercase; opacity: 0.7; }

  /* ============ PHOTOS TAB ============ */
  .photos { display: grid; grid-template-columns: repeat(12, 1fr); gap: 14px;
            grid-auto-rows: 100px; margin-top: 18px; }
  .ph { border: 1px solid var(--ink); border-radius: 14px; box-shadow: 0 4px 0 -2px var(--ink);
        position: relative; overflow: hidden; transition: transform 0.25s; }
  .ph:hover { transform: scale(1.02); }
  .ph img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .ph-cap { position: absolute; left: 10px; bottom: 10px;
            font-family: var(--mono); font-size: 9px; letter-spacing: 0.08em;
            text-transform: uppercase; color: var(--ink); display: inline-flex; gap: 8px;
            align-items: center; pointer-events: none; white-space: nowrap;
            background: var(--c-cream); border: 1px solid var(--ink);
            padding: 4px 10px; border-radius: 999px; max-width: calc(100% - 20px); }
  .ph-cap span { white-space: nowrap; }
  .ph-cap .roll { color: var(--c-terra); border-left: 1px solid rgba(0,0,0,0.2); padding-left: 8px; }
  .ph-expand { position: absolute; top: 8px; right: 8px; width: 30px; height: 30px;
               border-radius: 50%; border: 1px solid var(--ink); background: var(--c-cream);
               color: var(--ink); cursor: pointer; font-family: var(--mono); font-size: 13px;
               display: flex; align-items: center; justify-content: center;
               opacity: 0; transition: opacity 0.2s, background 0.15s, color 0.15s; z-index: 2; }
  .ph:hover .ph-expand, .ph-expand:focus-visible { opacity: 1; }
  .ph-expand:hover { background: var(--c-terra); color: var(--c-cream); }
  @media (pointer: coarse) { .ph-expand { opacity: 1; } }

  /* ============ LIGHTBOX ============ */
  .lb { position: fixed; inset: 0; z-index: 100; background: rgba(26,25,22,0.9);
        display: flex; align-items: center; justify-content: center;
        animation: lbIn 0.25s ease both; }
  @keyframes lbIn { from { opacity: 0; } to { opacity: 1; } }
  .lb-frame { background: var(--c-ink); border: 1px solid rgba(251,245,230,0.25);
              border-radius: 14px; padding: 0 18px; max-width: 82vw;
              animation: lbFrame 0.3s cubic-bezier(.22,1,.36,1) both; }
  @keyframes lbFrame { from { transform: scale(0.92); } to { transform: none; } }
  .lb-sprockets { height: 20px; margin: 12px 0;
                  background-image: radial-gradient(rgba(251,245,230,0.85) 0 4.5px, transparent 5px);
                  background-size: 32px 20px; background-repeat: repeat-x;
                  background-position: center; }
  .lb-stage { position: relative; overflow: hidden; border-radius: 4px; }
  .lb-stage img { display: block; max-width: 74vw; max-height: 60vh;
                  border: 1px solid rgba(251,245,230,0.2); }
  .lb-empty { width: min(74vw, 560px); height: 320px; display: flex; align-items: center;
              justify-content: center; color: rgba(251,245,230,0.6); font-size: 12px;
              letter-spacing: 0.1em; text-transform: uppercase;
              border: 1px dashed rgba(251,245,230,0.3); border-radius: 4px; }
  .lb-shutter { position: absolute; inset: 0; background: #000;
                animation: shutterOpen 0.32s cubic-bezier(.7,0,.3,1) both; }
  @keyframes shutterOpen { 0% { transform: scaleY(1); } 35% { transform: scaleY(1); }
                           100% { transform: scaleY(0); } }
  .lb-bar { display: flex; justify-content: space-between; gap: 16px;
            color: var(--c-cream); padding: 2px 2px 14px; font-size: 11px;
            letter-spacing: 0.12em; text-transform: uppercase; }
  .lb-bar .lb-roll { color: var(--c-terra); }
  .lb-x, .lb-nav { position: fixed; width: 46px; height: 46px; border-radius: 50%;
                   border: 1px solid var(--ink); background: var(--c-cream); color: var(--ink);
                   cursor: pointer; font-size: 16px; display: flex; align-items: center;
                   justify-content: center; box-shadow: 0 4px 0 -2px var(--ink);
                   transition: background 0.15s, color 0.15s, transform 0.15s; }
  .lb-x:hover, .lb-nav:hover { background: var(--c-terra); color: var(--c-cream);
                               transform: scale(1.08); }
  .lb-x { top: 22px; right: 26px; }
  .lb-nav { top: 50%; margin-top: -23px; }
  .lb-prev { left: 26px; }
  .lb-next { right: 26px; }
  @media (max-width: 760px) {
    .lb-nav { top: auto; bottom: 18px; margin-top: 0; }
    .lb-prev { left: 22vw; }
    .lb-next { right: 22vw; }
  }
  .ph.t-1  { grid-column: span 7; grid-row: span 3; background: var(--c-sky); }
  .ph.t-2  { grid-column: span 5; grid-row: span 3; background: var(--c-butter); }
  .ph.t-3  { grid-column: span 4; grid-row: span 2; background: var(--c-rose); }
  .ph.t-4  { grid-column: span 4; grid-row: span 2; background: var(--c-sage); }
  .ph.t-5  { grid-column: span 4; grid-row: span 2; background: var(--c-mint); }
  .ph.t-6  { grid-column: span 5; grid-row: span 3; background: var(--c-pink); }
  .ph.t-7  { grid-column: span 7; grid-row: span 3; background: var(--c-butter); }
  .ph.t-8  { grid-column: span 4; grid-row: span 2; background: var(--c-sky); }
  .ph.t-9  { grid-column: span 4; grid-row: span 2; background: var(--c-rose); }
  .ph.t-10 { grid-column: span 4; grid-row: span 2; background: var(--c-sage); }
  .ph.t-11 { grid-column: span 6; grid-row: span 3; background: var(--c-mint); }
  .ph.t-12 { grid-column: span 6; grid-row: span 3; background: var(--c-butter); }
  .ph.t-13 { grid-column: span 6; grid-row: span 3; background: var(--c-sky); }
  .ph.t-14 { grid-column: span 6; grid-row: span 3; background: var(--c-rose); }
  @media (max-width: 760px) {
    .photos { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 140px; }
    .ph { grid-column: span 1 !important; grid-row: span 2 !important; }
  }

  /* ============ FOOTER ============ */
  .foot-left { display: flex; align-items: center; gap: 14px; }
  .foot-mascot { width: 52px; height: auto; flex-shrink: 0;
                 transition: transform 0.3s cubic-bezier(.2,1.4,.4,1); }
  .foot-mascot:hover { transform: rotate(-6deg) scale(1.12); }
  footer { margin-top: 36px; padding: 28px; background: var(--c-cream);
           border: 1px solid var(--ink); border-radius: 24px;
           box-shadow: 0 6px 0 -2px var(--ink); display: flex; justify-content: space-between;
           align-items: center; flex-wrap: wrap; gap: 16px;
           font-family: var(--mono); font-size: 12px; letter-spacing: 0.14em;
           text-transform: uppercase; color: var(--ink-2); }
  .foot-links { display: flex; gap: 18px; }
  .foot-links a { text-decoration: none; color: var(--ink); padding: 8px 14px;
                  background: var(--c-butter); border: 1px solid var(--ink);
                  border-radius: 999px; box-shadow: 0 3px 0 -1px var(--ink);
                  transition: transform 0.2s, background 0.2s; }
  .foot-links a:hover { transform: translateY(-2px); background: var(--c-terra); color: var(--c-cream); }
  .foot-links a:nth-child(2) { background: var(--c-sage); }
  .foot-links a:nth-child(3) { background: var(--c-sky); }

  /* utility */
  .ink2 { color: var(--ink-2); }
  .muted { color: var(--muted); }

  /* ============ EDITORIAL POLISH ============ */
  ::selection { background: var(--c-terra); color: var(--c-cream); }
  a { color: var(--c-terra); }
  a:hover { color: var(--ink); }
  /* paper grain over everything, very faint */
  body::after { content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 9997;
                opacity: 0.05; mix-blend-mode: multiply;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
  /* hand-drawn wavy underline on italic accent words */
  .block-title .ital, .hero-name .ital {
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='8' viewBox='0 0 28 8'%3E%3Cpath d='M0 5 Q 7 0.5 14 5 T 28 5' fill='none' stroke='%23D97757' stroke-width='2.4' stroke-linecap='round'/%3E%3C/svg%3E") repeat-x left bottom;
    background-size: 0.52em 0.15em; padding-bottom: 0.14em; }
  .block.terra .block-title .ital, .block.ink .block-title .ital { background: none; padding-bottom: 0; }
  .nav-time { color: var(--c-terra); font-variant-numeric: tabular-nums; }
  .tab-btn:active { transform: scale(0.93); }
  .marquee:hover .marquee-inner { animation-play-state: paused; }
  .love .love-emoji { transition: transform 0.3s cubic-bezier(.2,1.4,.4,1); }
  .love:hover .love-emoji { transform: rotate(-8deg) scale(1.12); opacity: 1; }
  .proj .proj-num { transition: color 0.2s, opacity 0.2s; }
  .proj:hover .proj-num { color: var(--c-terra); opacity: 1; }
  .chip { transition: background 0.2s, color 0.2s; }
  .proj:hover .chip:first-child, .chapter-row:hover .chip:first-child { background: var(--ink); color: var(--c-cream); }
  .stat:hover .stat-num .ital, .stat:hover .stat-num { color: var(--c-butter); transition: color 0.3s; }

  /* ============ TABLET / MOBILE FIXES ============ */
  @media (max-width: 1020px) { .avatar-wrap { width: 300px; height: 300px; } }

  /* ============ ENVELOPE INTRO ============ */
  .env-overlay { position: fixed; inset: 0; z-index: 10000; cursor: pointer;
                 display: flex; flex-direction: column; align-items: center; justify-content: center;
                 gap: 28px; transition: opacity 0.45s ease;
                 background: radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px) 0 0 / 22px 22px, var(--bg); }
  .env-overlay.away { opacity: 0; pointer-events: none; }
  .envelope { position: relative; width: min(560px, 88vw); height: min(340px, 54vw);
              perspective: 1000px; animation: envIn 0.65s cubic-bezier(.2,1.2,.4,1) both; }
  @keyframes envIn { from { transform: translateY(-36px) rotate(-4deg); opacity: 0; } }
  .env-back { position: absolute; inset: 0; z-index: 1; background: var(--c-butter);
              border: 1.6px solid var(--ink); border-radius: 16px;
              box-shadow: 0 12px 0 -5px var(--ink); }
  .env-letter { position: absolute; left: 5%; right: 5%; top: 5%; height: 90%; z-index: 3;
                background: var(--c-cream); border: 1.4px solid var(--ink); border-radius: 10px;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
                padding-top: 7%; gap: 8px; font-family: var(--mono); font-size: 11px;
                letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-2);
                transition: transform 1.15s cubic-bezier(.22,1,.36,1) 0.55s; }
  .env-logo { width: clamp(96px, 20vw, 132px); height: auto; margin-bottom: 4px;
              filter: drop-shadow(0 4px 8px rgba(26,25,22,0.16)); }
  .env-letter .env-name { font-family: var(--serif); font-size: clamp(26px, 5vw, 38px);
                          text-transform: none; letter-spacing: -0.01em; color: var(--ink); }
  .env-letter .env-name .ital { font-style: italic; color: var(--c-terra); }
  .open .env-letter { transform: translateY(-66%); }
  .env-front { position: absolute; inset: 0; z-index: 4; background: var(--c-cream);
               border-radius: 16px; border: 1.6px solid var(--ink);
               clip-path: polygon(0 8%, 50% 54%, 100% 8%, 100% 100%, 0 100%); }
  .env-front::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 13px;
                      border-top: 1.4px solid var(--ink);
                      background: repeating-linear-gradient(-45deg, var(--c-terra) 0 12px,
                        var(--c-cream) 12px 24px, #7A9CC6 24px 36px, var(--c-cream) 36px 48px); }
  .env-addr { position: absolute; left: 8%; bottom: 13%; font-family: var(--mono); font-size: 11px;
              letter-spacing: 0.16em; text-transform: uppercase; line-height: 2.1; color: var(--ink-2);
              text-align: left; }
  .env-addr b { color: var(--ink); font-weight: 400; border-bottom: 1px solid rgba(26,25,22,0.35); }
  @media (max-width: 520px) { .env-addr { font-size: 9px; } }
  .env-mark { position: absolute; right: 8%; bottom: 30%; width: 66px; height: 66px;
              border: 1.6px dashed var(--ink); border-radius: 50%; opacity: 0.5;
              display: flex; align-items: center; justify-content: center; text-align: center;
              font-family: var(--mono); font-size: 8px; letter-spacing: 0.12em; line-height: 1.5;
              transform: rotate(12deg); }
  @media (max-width: 520px) { .env-mark { width: 52px; height: 52px; } }
  .env-flap { position: absolute; left: 0; right: 0; top: 0; height: 55%; z-index: 5;
              transform-origin: top center;
              transition: transform 0.9s cubic-bezier(.55,0,.3,1), z-index 0s 0.45s; }
  .env-flap svg { width: 100%; height: 100%; display: block; }
  .open .env-flap { transform: rotateX(178deg); z-index: 2; }
  .env-seal { position: absolute; left: 50%; top: 51%; z-index: 6; width: 82px; height: 82px;
              margin: -41px 0 0 -41px; border-radius: 50%; background: var(--c-terra);
              color: var(--c-cream); border: 2px solid var(--ink);
              box-shadow: 0 4px 0 -1px var(--ink);
              display: flex; flex-direction: column; align-items: center; justify-content: center;
              font-family: var(--serif); font-style: italic; font-size: 24px; line-height: 1;
              transform: rotate(-6deg); transition: transform 0.5s, opacity 0.5s; }
  .env-seal small { font-family: var(--mono); font-style: normal; font-size: 7px;
                    letter-spacing: 0.18em; margin-top: 4px; opacity: 0.8; }
  .envelope:hover .env-seal { transform: rotate(-2deg) scale(1.06); }
  .open .env-seal { transform: scale(0) rotate(40deg); opacity: 0; }
  .env-hint { font-family: var(--mono); font-size: 12px; letter-spacing: 0.22em;
              text-transform: uppercase; color: var(--ink-2);
              animation: hintBob 1.8s ease-in-out infinite; }
  @keyframes hintBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
  .open .env-hint, .away .env-hint { opacity: 0; transition: opacity 0.3s; }

  /* cards assemble after the envelope opens */
  @keyframes cardAsm { from { opacity: 0;
    transform: translate(var(--asm-x, 0), 70px) rotate(var(--asm-r, -3deg)) scale(0.9); } }
  body.cards-in .topbar { animation: cardAsm 0.6s cubic-bezier(.22,1,.36,1) both; }
  body.cards-in .tab-content > *, body.cards-in footer,
  body.cards-in .home-row2 > * { animation: cardAsm 0.65s cubic-bezier(.22,1,.36,1) both; }
  body.cards-in .tab-content > .home-row2 { animation: none; }
  body.cards-in .tab-content > :nth-child(1) { animation-delay: 0.05s; --asm-x: -60px; --asm-r: -5deg; }
  body.cards-in .tab-content > :nth-child(3) { animation-delay: 0.16s; --asm-x: 60px; --asm-r: 4deg; }
  body.cards-in .tab-content > :nth-child(4) { animation-delay: 0.26s; --asm-x: -40px; --asm-r: -3deg; }
  body.cards-in .home-row2 > :nth-child(1) { animation-delay: 0.36s; --asm-x: -50px; --asm-r: 3deg; }
  body.cards-in .home-row2 > :nth-child(2) { animation-delay: 0.44s; --asm-x: 50px; --asm-r: -4deg; }
  body.cards-in .tab-content > :nth-child(6) { animation-delay: 0.52s; --asm-x: 40px; --asm-r: 2deg; }
  body.cards-in .tab-content > :nth-child(8) { animation-delay: 0.6s; --asm-x: -30px; --asm-r: -2deg; }
  body.cards-in footer { animation-delay: 0.68s; }
  body.no-motion .tab-content > *, body.no-motion .topbar, body.no-motion footer,
  body.no-motion .home-row2 > * { animation: none !important; }
`;

// ============================ DATA ============================

const GREETS = [
{ script: "你好", tag: "MANDARIN" },
{ script: "你好啊", tag: "粵語" },
{ script: "Hello", tag: "ENGLISH" },
{ script: "Hallo", tag: "DEUTSCH" }];


const STATS = [
{ num: "5", label: "Cities lived" },
{ num: "4", label: "Languages spoken" },
{ num: "20+", label: "Countries visited" },
{ num: "5", label: "Yrs in finance" }];


const CHAPTERS = [
{ yr: "Chapter 01", where: "Guangzhou", title: "Born on the Pearl River.",
  text: "Cantonese household. Dim sum tables, jasmine tea, Saturday markets.",
  tags: ["Cantonese", "Mandarin"], color: "c-rose" },
{ yr: "Chapter 02", where: "Nashville · Vanderbilt", title: "A double-major no one expected.",
  text: "Math + Child Development — proof and play. Toddler cognition lab, multivariable grading, Magna Cum Laude.",
  tags: ["Math", "Child Development", "German minor"], color: "c-butter" },
{ yr: "Chapter 03", where: "Vienna · Wien", title: "A semester in Deutsch.",
  text: "European philosophy in a language that was mostly verbs and umlauts. SOS Children's Villages on the side.",
  tags: ["Deutsch", "SOS CV", "Kaffeehäuser"], color: "c-sage" },
{ yr: "Chapter 04", where: "Brooklyn · NYU Tandon", title: "Math, with money attached.",
  text: "MS Financial Engineering. Genetic algorithms in C++; LSTMs trying to predict Apple. A global pandemic interrupting most of it.",
  tags: ["C++", "ML", "Portfolio theory", "UN"], color: "c-sky" },
{ yr: "Now", where: "New York · Bloomberg", title: "Building quant tools traders actually use.",
  text: "Quant developer on Bloomberg's BQuant platform after four years across Goldman Sachs, Barclays and the UN. I turn trading workflows — fixed income, FX, equities — into Python analytics people ship. After hours I vibe-code personal projects like this one.",
  tags: ["Python", "BQuant", "Vibe-coding"], color: "c-mint" }];


const PROJECTS = [
{ n: "01", feat: true, color: "c-butter", status: "production",
  kicker: "Bloomberg · Quant Developer", title: "FX Hedge Analytics Suite",
  text: "An app suite for evaluating currency exposure — Cash-Flow-at-Risk, VaR and volatility-cone modeling, with payoff visualization across hedge strategies and live Bloomberg option pricing.",
  stack: ["Python", "BQuant", "CFaR / VaR", "Options"] },
{ n: "02", color: "c-sage", status: "production",
  kicker: "Bloomberg · Quant Developer", title: "Mortgage Capital Workflow",
  text: "Relative-value analysis across agency and non-agency MBS deals: z-score screening, tranche credit-support analysis and interactive deal-comparison dashboards.",
  stack: ["Python", "BQuant", "MBS"] },
{ n: "03", color: "c-sky", status: "production",
  kicker: "Bloomberg · Quant Developer", title: "Equity Ownership Momentum",
  text: "Tracks historical shifts in institutional holders so traders can read position concentration, ownership rotation and potential momentum signals.",
  stack: ["Python", "Launchpad", "Equities"] },
{ n: "04", third: true, color: "c-rose", status: "shipped",
  kicker: "Goldman Sachs · Quant Strat", title: "Deposit term-structure model",
  text: "Rebuilt the non-maturity deposit model for PWM and Marcus retail; attrition and balance-volatility backtesting lifted funding value by an estimated $40mm / year.",
  stack: ["Python", "Time series", "ALM"] },
{ n: "05", third: true, color: "c-mint", status: "shipped",
  kicker: "Goldman Sachs · Quant Strat", title: "Loan-level PnL system",
  text: "End-to-end PnL monitoring for PWM bank loans — data pipelines and real-time dashboards for portfolio-wide risk and PnL attribution.",
  stack: ["SLANG", "SQL", "Real-time"] },
{ n: "06", third: true, color: "c-butter", status: "shipped",
  kicker: "Goldman Sachs · Quant Strat", title: "Risk & price-marking tools",
  text: "Mortgage-trading risk and marking tools built with the desk to sharpen PnL attribution and risk metrics — DV01, CVX01, CPNL.",
  stack: ["Python", "Risk", "Pricing"] },
{ n: "07", third: true, color: "c-sage", status: "delivered",
  kicker: "Barclays · Business Analyst", title: "AML data infrastructure",
  text: "Designed and validated ETL workflows for 10+ anti-money-laundering models, bridging business requirements and engineering to keep detection pipelines accurate and globally scalable.",
  stack: ["ETL", "SQL", "AML"] },
{ n: "08", third: true, color: "c-sky", status: "published",
  kicker: "United Nations · DESA intern", title: "JPO retention analysis",
  text: "Regression modeling of retention across 30 countries to surface drivers of program success; authored sections of the 2014–2018 JPO Alumni Survey Report.",
  stack: ["Python", "Regression", "PowerBI"] },
{ n: "09", third: true, color: "c-rose", status: "published",
  kicker: "Vanderbilt · Research Lab", title: "Toddler cognition research",
  text: "Studied how 24-month-olds understand pictures and video in a child-development lab. Won a research grant, contributed to publications, and earned the highest honor on my thesis.",
  stack: ["SPSS", "Bootstrap", "Thesis"] }];


const LOVES = [
{ color: "c-sky", emoji: "f/2.0", title: "Photography", half: true,
  text: "Mostly digital, sometimes film. Cities at dusk, strangers' hands, the geometry of a train station.",
  foot: "ROLLING SHUTTER" },
{ color: "c-butter", emoji: "ß", title: "Languages", half: true,
  text: "Four I think in — 中文, 粵語, English, Deutsch. I collect the idioms that don't survive translation.",
  foot: "FOUR ON ROTATION" },
{ color: "c-mint", emoji: "↻", title: "Long walks",
  text: "I will out-walk you. Current project: the High Line end to end, then improvising until my feet complain.",
  foot: "10K+ STEPS / DAY" },
{ color: "c-sage", emoji: "★", title: "Markets",
  text: "Both kinds — the ones with order books and the ones with peaches. I cook out of the second.",
  foot: "SATURDAY MORNINGS" },
{ color: "c-rose", emoji: "⌖", title: "Travel",
  text: "20+ countries and counting — salt flats in Bolivia, alps in Austria, night markets back home. I plan the trip around the walking.",
  foot: "20+ COUNTRIES" },
{ color: "c-sky", emoji: "✎", title: "Reading", half: true,
  text: "Lately: Lulu Miller's Why Fish Don't Exist and Andy Weir's Project Hail Mary. Slow with novels, generous in the margins.",
  foot: "BORROWS > BUYS" },
{ color: "c-pink", emoji: "ψ", title: "How kids think", half: true,
  text: "Four years in a child-development lab left me hooked on one question — how a two-year-old decides that a picture is a thing.",
  foot: "FOUR-YEAR HABIT" },
{ color: "c-sage", emoji: "▲", title: "National parks", wide: true,
  text: "Collecting them slowly — trailheads, tide pools, the smell of a forest after rain. The goal is all 63; the method is one long weekend at a time.",
  foot: "NEXT STAMP: ACADIA" }];


const LANGS = [
{ script: "中文", name: "Mandarin", level: "native" },
{ script: "粵語", name: "Cantonese", level: "native" },
{ script: "English", name: "English", level: "fluent" },
{ script: "Deutsch", name: "German", level: "advanced" }];


const NOW = [
{ k: "Building", v: <>Python analytics on Bloomberg's <span className="ital">BQuant</span> platform.</> },
{ k: "Reading", v: <>Lulu Miller, <span className="ital">Why Fish Don't Exist</span>. Andy Weir, <span className="ital">Project Hail Mary</span>.</> },
{ k: "Cooking", v: <>Recreating my mom's 蒜蓉粉丝蒸扇贝.</> },
{ k: "Walking", v: <>The High Line, end to end — then wherever the next espresso is.</> },
{ k: "Next trip", v: <>Acadia National Park — tide pools, granite, sunrise from Cadillac Mountain.</> }];


const PHOTOS = [
{ id: "ph-1", t: 1, cap: "VIENNA · SEMESTER ABROAD", roll: "01", img: "images/ph-1.jpg" },
{ id: "ph-2", t: 2, cap: "SAN DIEGO, CA", roll: "02", img: "images/ph-2.jpg" },
{ id: "ph-3", t: 3, cap: "GUANGZHOU · 广州塔", roll: "03" },
{ id: "ph-4", t: 4, cap: "MACHU PICCHU · PERU", roll: "04" },
{ id: "ph-5", t: 5, cap: "INNSBRUCK · ALPS", roll: "05" },
{ id: "ph-6", t: 6, cap: "SEATTLE · MT BAKER", roll: "06" },
{ id: "ph-8", t: 7, cap: "JERSEY CITY · NJ", roll: "07" },
{ id: "ph-7", t: 8, cap: "ISLA INCAHUASI · SALAR DE UYUNI · BOLIVIA", roll: "08" },
{ id: "ph-9", t: 9, cap: "SALINERAS DE MARAS · SACRED VALLEY · PERU", roll: "09" },
{ id: "ph-10", t: 10, cap: "NEW JERSEY", roll: "10" },
{ id: "ph-11", t: 11, cap: "WACHAU · AUSTRIA · UNESCO", roll: "11" },
{ id: "ph-12", t: 12, cap: "HAVANA · CUBA", roll: "12" },
{ id: "ph-13", t: 13, cap: "ALASKA", roll: "13" },
{ id: "ph-14", t: 14, cap: "PUERTO RICO", roll: "14" }];


const MARQUEE = [
"QUANT DEVELOPER", "JERSEY CITY · NJ", "FROM GUANGZHOU", "FOUR LANGUAGES",
"WHY FISH DON'T EXIST", "WALKING THE HIGH LINE", "蒜蓉粉丝蒸扇贝", "ACADIA NEXT ▲", "AVAILABLE FOR COFFEE"];


// ============================ COMPONENTS ============================

function LocalClock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const f = () => setT(new Date().toLocaleTimeString("en-US",
      { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" }));
    f();
    const id = setInterval(f, 30000);
    return () => clearInterval(id);
  }, []);
  return <span className="nav-time">{t}</span>;
}

// ============================ ENVELOPE INTRO ============================
function EnvelopeIntro({ onDone }) {
  const [phase, setPhase] = useState("closed"); // closed → open → away
  const open = () => {
    if (phase !== "closed") return;
    setPhase("open");
    setTimeout(() => {
      setPhase("away");
      document.body.classList.add("cards-in");
    }, 1650);
    setTimeout(onDone, 2250);
  };
  return (
    <div className={"env-overlay " + phase} onClick={open} role="button" tabIndex={0}
    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") open(); }}
    aria-label="Open the letter">
      <div className="envelope">
        <div className="env-back"></div>
        <div className="env-letter">
          <img className="env-logo" src="assets/niuniu.png" alt="" onError={(e) => e.target.style.display = "none"} />
          <span className="env-name">Eylon</span>
        </div>
        <div className="env-front">
          <div className="env-addr">
            to: <b>you, the visitor</b><br />
            from: eylon
          </div>
          <div className="env-mark">JUL<br />2026</div>
        </div>
        <div className="env-flap">
          <svg viewBox="0 0 100 55" preserveAspectRatio="none" aria-hidden="true">
            <polygon points="1,1 99,1 50,53" fill="var(--c-butter)" stroke="var(--ink)" strokeWidth="1.4"></polygon>
          </svg>
        </div>
        <div className="env-seal">EL</div>
      </div>
      <div className="env-hint">✉︎ click to open</div>
    </div>);

}

function Topbar({ tab, setTab }) {
  const TABS = ["home", "atlas", "work", "life", "photos"];
  return (
    <nav className="topbar">
      <div className="nav-brand">
        <span className="dot" />
        Eylon <span style={{ fontStyle: "italic", color: "var(--c-terra)" }}>Liu</span>
      </div>
      <div className="tabs">
        {TABS.map((t) =>
        <button key={t}
        className={"tab-btn" + (tab === t ? " is-active" : "")}
        onClick={() => setTab(t)}>{t}</button>
        )}
      </div>
      <div className="nav-loc">
        <span className="live-dot" /> JERSEY CITY · NJ <LocalClock />
      </div>
    </nav>);

}

function Hero({ goAtlas }) {
  return (
    <div className="block cream hero ov" data-screen-label="01 Hero">
      <HeroStickers />
      <div>
        <div className="hero-greet">
          {GREETS.map((g, i) =>
          <span key={i}>
              <em>{g.script}</em>
              <span className="tag">/ {g.tag}</span>
            </span>
          )}
        </div>
        <h1 className="hero-name">Eylon <span className="ital">Liu</span></h1>
        <div className="hero-cn" style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "clamp(22px, 3vw, 32px)", opacity: 0.7 }}>Xinyu Liu</div>
        <div className="hero-pron">
          Pronounced <span className="pron-pill">/ ee · len /</span>
        </div>
      </div>
      <div className="avatar-wrap">
        <div className="avatar">
          <img src="images/hero-avatar.jpg" alt="Cartoon avatar of Eylon Liu" />
        </div>
        <div className="avatar-sticker" title="click me"
        onClick={(e) => confettiBurst(e.clientX, e.clientY)}>Hi!<br />this is me</div>
        <CoffeeBadge />
      </div>
    </div>);

}

function CountUp({ value }) {
  const m = /^(\d+)(.*)$/.exec(value);
  const [n, setN] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (!m) return;
    const target = +m[1];
    if (document.body.classList.contains("no-motion") ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        !("IntersectionObserver" in window)) { setN(target); return; }
    let raf;
    const io = new IntersectionObserver((es) => {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      const start = performance.now(), dur = 1100;
      const tick = (now) => {
        const p = Math.min(1, (now - start) / dur);
        setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value]);
  if (!m) return <span>{value}</span>;
  return <span ref={ref}>{n}{m[2]}</span>;
}

function StatStrip() {
  return (
    <div className="stats rv">
      {STATS.map((s, i) =>
      <div className="stat" key={i}>
          <div className="stat-num">
            {i === 1 || i === 3 ?
            <span className="ital"><CountUp value={s.num} /></span> :
            <CountUp value={s.num} />}
          </div>
          <div className="stat-label">{s.label}</div>
        </div>
      )}
    </div>);

}

function MiniMap({ goAtlas }) {
  return (
    <div className="block sky mini-map-block rv" data-comment-anchor="31681b397f-div-603-5">
      <div className="mini-map-head">
        <div>
          <div className="block-kicker">↗ Atlas · preview</div>
          <h2 className="block-title">A <span className="ital">life</span>, plotted.</h2>
        </div>
        <p className="block-lede" style={{ marginTop: 0 }}>
          Five cities lived, a dozen borrowed. Tap below to fly the path.
        </p>
      </div>
      <div className="mini-wrap">
        <LifeMap compact autoplay />
      </div>
      <div className="mini-cta">
        <span className="muted">Guangzhou → Nashville → Wien → Brooklyn → JC</span>
        <button onClick={goAtlas}>Open atlas →</button>
      </div>
    </div>);

}

function ChapterTeaser() {
  return (
    <div className="block butter chapter-teaser rv" data-screen-label="03 Summary">
      <div className="yr">In short</div>
      <h3>Quant developer building analytics traders actually use.</h3>
      <p className="body">Five years across Bloomberg, Goldman Sachs, Barclays and the UN — turning trading workflows into scalable Python tools spanning fixed income, FX and equities. Off the clock, I vibe-code personal projects like this site.</p>
      <div className="foot">
        <span>· Python</span><span>· BQuant</span><span>· Vibe-coding</span>
      </div>
    </div>);

}

function NowSnapshot() {
  return (
    <div className="block sage now-block rv" style={{ "--rv-d": "90ms" }} data-screen-label="04 Now">
      <div className="block-kicker">/now · 2026</div>
      <h2 className="block-title">Currently <span className="ital">/now/</span></h2>
      <div style={{ marginTop: 18 }}>
        {NOW.map((row, i) =>
        <div className="now-row" key={i}>
            <div className="k">{row.k}</div>
            <div className="v">{row.v}</div>
          </div>
        )}
      </div>
    </div>);

}

function LangBlock() {
  return (
    <div className="block rose rv" data-screen-label="05 Languages">
      <div className="block-kicker">§ tongues</div>
      <h2 className="block-title">Four <span className="ital">scripts</span>.</h2>
      <div className="langs-strip">
        {LANGS.map((l, i) =>
        <div className="lang" key={i}>
            <div className="lang-script">{l.script}</div>
            <div className="lang-name">{l.name}</div>
            <div className="lang-level">{l.level}</div>
          </div>
        )}
      </div>
    </div>);

}

function Marquee() {
  // duplicate for seamless loop
  const items = [...MARQUEE, ...MARQUEE];
  return (
    <div className="marquee rv">
      <div className="marquee-inner">
        {items.map((m, i) => <span key={i}>{m}</span>)}
      </div>
    </div>);

}

// ---------------- TABS ----------------

function HomeTab({ goAtlas }) {
  return (
    <div className="tab-content is-entering" key="home">
      <Hero />
      <div style={{ height: 18 }} />
      <StatStrip />
      <div className="home-row">
        <MiniMap goAtlas={goAtlas} />
      </div>
      <div className="home-row2">
        <ChapterTeaser />
        <NowSnapshot />
      </div>
      <div className="home-row" style={{ marginTop: 18 }}>
        <LangBlock />
      </div>
      <div style={{ height: 18 }} />
      <Marquee />
    </div>);

}

function AtlasTab() {
  return (
    <div className="tab-content is-entering" key="atlas">
      <div className="block cream atlas-block ov" data-screen-label="02 Atlas">
        <span className="peel p-sky" style={{ top: "-16px", right: "60px", "--peel-r": "3deg" }}>par avion ✈︎</span>
        <div className="block-head">
          <div>
            <div className="block-kicker">§ atlas · interactive</div>
            <h2 className="block-title">A <span className="ital">life</span>, plotted.</h2>
          </div>
          <p className="block-lede">
            Click any pin and the journey draws to it. Each city has its own story —
            the side card opens. <em>↻ Replay</em> the whole trip from the top.
          </p>
        </div>
        <div style={{ background: "var(--c-cream)", border: "1px solid var(--ink)",
          borderRadius: 18, padding: 16, position: "relative" }}>
          <LifeMap />
        </div>
      </div>
      <div className="atlas-meta">
        <div className="meta-card rv" style={{ background: "var(--c-butter)" }}>
          <div className="k">Hometown</div>
          <div className="v">广州<br /><span style={{ fontStyle: "italic", fontSize: "0.5em", opacity: 0.7 }}>guangzhou</span></div>
        </div>
        <div className="meta-card rv" style={{ background: "var(--c-sage)", "--rv-d": "70ms" }}>
          <div className="k">Cities lived</div>
          <div className="v">5<span style={{ fontSize: "0.4em", opacity: 0.7 }}> &amp; counting</span></div>
        </div>
        <div className="meta-card rv" style={{ background: "var(--c-sky)", "--rv-d": "140ms" }}>
          <div className="k">Home now</div>
          <div className="v">Jersey City</div>
        </div>
        <div className="meta-card rv" style={{ background: "var(--c-rose)", "--rv-d": "210ms" }}>
          <div className="k">Continents</div>
          <div className="v">3</div>
        </div>
      </div>
    </div>);

}

function WorkTab() {
  return (
    <div className="tab-content is-entering" key="work">
      <div className="block cream ov" data-screen-label="06 Work header">
        <span className="peel p-butter" style={{ top: "-16px", right: "56px", "--peel-r": "-3deg" }}>★ shipped &amp; shipping</span>
        <span className="block-glyph">№</span>
        <div className="block-head">
          <div>
            <div className="block-kicker">§ work · projects</div>
            <h2 className="block-title">Things I've <span className="ital">built</span>.</h2>
          </div>
          <p className="block-lede">
            Quant tools built across Bloomberg's BQuant platform, Goldman Sachs,
            Barclays and the UN — fixed income, FX and equities, plus risk,
            retention and PnL modeling. In production, shipped, and published.
          </p>
        </div>
        <div className="work-grid">
          {PROJECTS.map((p, i) => {
            const klass = "proj rv " + p.color + (p.feat ? " feat" : "") + (p.third ? " third" : "");
            return (
              <article className={klass} style={{ "--rv-d": i % 3 * 70 + "ms" }} key={p.n}>
                <div className="proj-head">
                  <span className="proj-num">{p.n}</span>
                  <span className={"proj-status " + p.status}>{p.status}</span>
                </div>
                <div className="proj-kicker">{p.kicker}</div>
                <h3 className="proj-title">{p.title}</h3>
                <p className="proj-text">{p.text}</p>
                <div className="proj-stack">
                  {p.stack.map((s) => <span className="chip" key={s}>{s}</span>)}
                </div>
              </article>);

          })}
        </div>
      </div>
    </div>);

}

function LifeTab() {
  return (
    <div className="tab-content is-entering" key="life">
      <div className="block cream ov" data-screen-label="07 Chapters">
        <span className="peel p-rose" style={{ top: "-16px", right: "64px", "--peel-r": "2deg" }}>est. 1997 · 广州</span>
        <span className="block-glyph">ch.</span>
        <div className="block-head">
          <div>
            <div className="block-kicker">§ life · chapters</div>
            <h2 className="block-title">In <span className="ital">chapters</span>.</h2>
          </div>
          <p className="block-lede">
            Eras, not bullet points. Where I was, what I was making, what I was failing at.
          </p>
        </div>
        <div className="chapter-rows">
          {CHAPTERS.map((c, i) =>
          <div className={"chapter-row rv " + c.color} style={{ "--rv-d": i * 70 + "ms" }} key={i}>
              <div className="ch-yr">{c.yr}</div>
              <div>
                <div className="ch-where">{c.where}</div>
                <h3 className="ch-title">{c.title}</h3>
                <div className="ch-tags">
                  {c.tags.map((t) => <span className="chip" key={t}>{t}</span>)}
                </div>
              </div>
              <p className="ch-text">{c.text}</p>
              <div className="ch-photo">
                {c.img ? <img src={c.img} alt={c.where} /> : <div className="ch-ph-empty">{c.where}</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="block paper ov" style={{ marginTop: 18 }} data-screen-label="08 Loves">
        <span className="block-glyph">&amp;</span>
        <div className="block-head">
          <div>
            <div className="block-kicker">§ off-the-clock</div>
            <h2 className="block-title">Things I <span className="ital">love</span>.</h2>
          </div>
          <p className="block-lede">
            The categories that won't fit on a résumé — but probably should.
          </p>
        </div>
        <div className="loves-grid">
          {LOVES.map((l, i) =>
          <div className={"love rv " + l.color + (l.wide ? " wide" : "") + (l.half ? " half" : "")} style={{ "--rv-d": i % 3 * 70 + "ms" }} key={i}>
              <div className="love-emoji">{l.emoji}</div>
              <div className="love-title">{l.title}</div>
              <div className="love-text">{l.text}</div>
              <div className="love-foot">{l.foot}</div>
            </div>
          )}
        </div>
      </div>
    </div>);

}

function PhotosTab() {
  const [lightbox, setLightbox] = useState(null);
  const nav = (dir) => setLightbox((i) => (i + dir + PHOTOS.length) % PHOTOS.length);
  return (
    <div className="tab-content is-entering" key="photos">
      <div className="block cream ov" data-screen-label="09 Photos">
        <span className="peel p-sage" style={{ top: "-16px", right: "52px", "--peel-r": "-2deg" }}>film · no filters</span>
        <span className="block-glyph">ƒ</span>
        <div className="block-head">
          <div>
            <div className="block-kicker">§ photography</div>
            <h2 className="block-title">A few <span className="ital">frames</span>.</h2>
          </div>
          <p className="block-lede">
            Tap ⤤ on a tile to view it big in the film strip.
          </p>
        </div>
        <div className="photos">
          {PHOTOS.map((p, i) =>
          <div className={"ph rv t-" + p.t} style={{ "--rv-d": i % 3 * 60 + "ms" }} key={p.id}>
              {p.img && <img src={p.img} alt={p.cap} />}
              <button className="ph-expand" title="View larger" aria-label={"View " + p.cap}
              onClick={() => setLightbox(i)}>⤤</button>
              <div className="ph-cap">
                <span>{p.cap}</span>
                <span className="roll">R · {p.roll}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <PhotoLightbox photos={PHOTOS} openIdx={lightbox}
      onClose={() => setLightbox(null)} onNav={nav} />
    </div>);

}

function Foot() {
  const [contact, setContact] = useState(null); // {user, dom} — decoded only after a human click
  // email stored as shifted char codes — never appears as text in source,
  // and is only decoded in response to a real click event
  const EU = [102, 122, 109, 112, 111, 47, 109, 106, 118];
  const ED = [104, 110, 98, 106, 109, 47, 100, 112, 110];
  const dec = (a) => a.map((c) => String.fromCharCode(c - 1)).join("");
  const reveal = (e) => {
    e.preventDefault();
    if (!e.isTrusted) return; // ignore synthetic/scripted clicks
    if (contact) {
      window.location.href = "mail" + "to:" + contact.user + "@" + contact.dom;
    } else {
      setContact({ user: dec(EU), dom: dec(ED) });
    }
  };
  return (
    <footer data-comment-anchor="4c804c36ee-footer-892-5">
      <div className="foot-left">
        <img className="foot-mascot" src="assets/niuniu.png" alt="" onError={(e) => e.target.style.display = "none"} />
        <div>© Eylon Liu · 2026 <span style={{ opacity: 0.45, marginLeft: 10 }}>· psst: try typing my name</span></div>
      </div>
      <div className="foot-links">
        <a href="#contact" onClick={reveal} title={contact ? "Click to open mail app" : "Click to reveal"}>
          {contact ? <>{contact.user} <span style={{ opacity: 0.5 }}>[at]</span> {contact.dom} ↗</> : "Email →"}
        </a>
        <a href="https://linkedin.com/in/eylonliu/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </div>
    </footer>);

}

// ============================ APP ============================

const TWEAKS = /*EDITMODE-BEGIN*/{
  "background": "warm",
  "wallpaper": "dots",
  "motion": true,
  "flightSound": false,
  "shapes": "playful",
  "paint": true,
  "envelope": true
} /*EDITMODE-END*/;

const BG_MAP = {
  warm: { bg: "#F4ECDA", bg2: "#EDE2C8" },
  cream: { bg: "#FBF5E6", bg2: "#F2EAD3" },
  sky: { bg: "#D6DFF4", bg2: "#BED3E0" },
  sage: { bg: "#DCE3D5", bg2: "#C5D2BA" },
  pink: { bg: "#F5DCDA", bg2: "#E8C6C2" }
};

function App() {
  const [tab, setTab] = useState("home");
  const [t, setTweak] = useTweaks(TWEAKS);
  const [toast, setToast] = useState(null);

  // envelope intro — shown on every load unless motion/intro is off
  const wantIntro = t.envelope !== false && t.motion !== false &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [introDone, setIntroDone] = useState(false);
  const introActive = wantIntro && !introDone;
  useEffect(() => {
    document.body.style.overflow = introActive ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [introActive]);

  // secret: type "eylon" anywhere → fly the whole journey
  const flyover = React.useCallback(() => {
    setTab("atlas");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setToast("\u2708\uFE0E secret flyover — enjoy the ride");
    setTimeout(() => window.dispatchEvent(new Event("lifemap-flyover")), 750);
    setTimeout(() => setToast(null), 4000);
  }, []);
  useSecretCode("eylon", flyover);

  useEffect(() => {
    const root = document.documentElement;
    const bg = BG_MAP[t.background] || BG_MAP.warm;
    root.style.setProperty("--bg", bg.bg);
    root.style.setProperty("--bg-2", bg.bg2);
  }, [t.background]);

  useEffect(() => {
    const body = document.body;
    body.classList.remove("wp-dots", "wp-grid", "wp-none");
    body.classList.add("wp-" + (t.wallpaper || "dots"));
  }, [t.wallpaper]);

  useEffect(() => {
    document.body.classList.toggle("no-motion", t.motion === false);
  }, [t.motion]);

  useEffect(() => {
    window.__flightSound = t.flightSound === true;
  }, [t.flightSound]);

  useEffect(() => {
    document.body.classList.toggle("shapes-playful", t.shapes !== "classic");
  }, [t.shapes]);

  // paintbrush cursor — only when motion is allowed (it hides the native cursor)
  useEffect(() => {
    const on = t.paint !== false && t.motion !== false;
    document.body.classList.toggle("brush-on", on);
  }, [t.paint, t.motion]);

  // scroll-reveal: fade blocks up as they enter the viewport
  useEffect(() => {
    if (t.motion === false) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    document.body.classList.add("js-reveal");
    const els = document.querySelectorAll(".rv:not(.is-in)");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [tab, t.motion]);

  return (
    <>
      <style>{css}</style>
      <style>{`
        body.wp-dots::before {
          content: ""; position: fixed; inset: 0;
          background-image: radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px);
          background-size: 22px 22px; pointer-events: none; z-index: 1;
        }
        body.wp-grid::before {
          content: ""; position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px);
          background-size: 44px 44px; pointer-events: none; z-index: 1;
        }
      `}</style>
      <div className="page">
        <Topbar tab={tab} setTab={setTab} />
        {tab === "home" && <HomeTab goAtlas={() => setTab("atlas")} />}
        {tab === "atlas" && <AtlasTab />}
        {tab === "work" && <WorkTab />}
        {tab === "life" && <LifeTab />}
        {tab === "photos" && <PhotosTab />}
        <Foot />
      </div>
      <CursorDoodle paint={t.paint !== false} />
      {introActive && <EnvelopeIntro onDone={() => setIntroDone(true)} />}
      {toast && <div className="secret-toast">{toast}</div>}

      <TweaksPanel title="Tweaks">
        <TweakSection title="Page background">
          <TweakRadio label="" value={t.background}
          onChange={(v) => setTweak("background", v)}
          options={[
          { value: "warm", label: "Warm" },
          { value: "cream", label: "Cream" },
          { value: "sky", label: "Sky" },
          { value: "sage", label: "Sage" },
          { value: "pink", label: "Pink" }]
          } />
        </TweakSection>
        <TweakSection title="Wallpaper">
          <TweakRadio label="" value={t.wallpaper}
          onChange={(v) => setTweak("wallpaper", v)}
          options={[
          { value: "dots", label: "Dots" },
          { value: "grid", label: "Grid" },
          { value: "none", label: "None" }]
          } />
        </TweakSection>
        <TweakSection title="Shapes">
          <TweakRadio label="" value={t.shapes || "playful"}
          onChange={(v) => setTweak("shapes", v)}
          options={[
          { value: "playful", label: "Playful" },
          { value: "classic", label: "Classic" }]
          } />
        </TweakSection>
        <TweakSection title="Cursor">
          <TweakToggle label="Paintbrush" value={t.paint !== false}
          onChange={(v) => setTweak("paint", v)} />
        </TweakSection>
        <TweakSection title="Intro">
          <TweakToggle label="Envelope on load" value={t.envelope !== false}
          onChange={(v) => setTweak("envelope", v)} />
        </TweakSection>
        <TweakSection title="Motion">
          <TweakToggle label="Scroll animations" value={t.motion !== false}
          onChange={(v) => setTweak("motion", v)} />
          <TweakToggle label="Flight sound" value={t.flightSound === true}
          onChange={(v) => setTweak("flightSound", v)} />
        </TweakSection>
      </TweaksPanel>
    </>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);