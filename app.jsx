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
  @media (pointer: coarse) { .cursor-doodle { display: none; } }
  body.no-motion .cursor-doodle { display: none; }

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
  .stamp-glyph { font-family: var(--serif); font-size: 17px; line-height: 1.1; }
  .stamp-name { font-family: var(--mono); font-size: 10px; letter-spacing: 0.18em; }
  .stamp-sub { font-family: var(--mono); font-size: 8px; letter-spacing: 0.14em; opacity: 0.75; }

  .love.wide { grid-column: span 6; min-height: 150px; }
  @media (max-width: 880px) { .love.wide { grid-column: span 2; } }

  /* ============ PLAYFUL SHAPES (tweakable) ============ */
  body.shapes-playful .block.hero { border-radius: 56px 140px 56px 140px; }
  body.shapes-playful .stats { border-radius: 999px; }
  body.shapes-playful .stat:first-child { padding-left: 44px; }
  body.shapes-playful .stat:last-child { padding-right: 44px; }
  body.shapes-playful .block.sage { border-radius: 130px 130px 26px 26px; }
  body.shapes-playful .block.butter.chapter-teaser { border-radius: 26px 26px 130px 26px; }
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
  .chapter-teaser h3 { font-family: var(--serif); font-size: clamp(34px, 3.6vw, 46px); line-height: 1.04;
                       margin: 0; font-weight: 400; text-wrap: balance; }
  .chapter-teaser .body { font-size: 16px; line-height: 1.6; flex: 1; text-wrap: pretty; }
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
               justify-content: space-between; }
  .meta-card .k { font-family: var(--mono); font-size: 10px; letter-spacing: 0.14em;
                  text-transform: uppercase; opacity: 0.7; }
  .meta-card .v { font-family: var(--serif); font-size: 32px; line-height: 1; }

  /* ============ WORK TAB ============ */
  .work-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; }
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
  @media (max-width: 760px) { .chapter-row { grid-template-columns: 1fr; gap: 8px; } }
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
  @media (max-width: 760px) { .ch-photo { justify-self: start; } }

  /* loves */
  .loves-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; margin-top: 18px; }
  @media (max-width: 880px) { .loves-grid { grid-template-columns: 1fr 1fr; } }
  .love { padding: 22px; border-radius: 18px; border: 1px solid var(--ink);
          box-shadow: 0 5px 0 -2px var(--ink); grid-column: span 2;
          transition: transform 0.3s, box-shadow 0.3s;
          display: flex; flex-direction: column; gap: 10px; min-height: 200px;
          transition: transform 0.2s; }
  .love:hover { transform: rotate(-1deg) scale(1.02); }
  .love:nth-child(1) { grid-column: span 3; }
  .love:nth-child(4) { grid-column: span 3; }
  @media (max-width: 880px) { .love, .love:nth-child(1), .love:nth-child(4) { grid-column: span 1; } }
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
  .ph .ph-empty { position: absolute; inset: 0; display: flex; align-items: center;
    justify-content: center; font-family: var(--mono); font-size: 11px;
    letter-spacing: 0.14em; text-transform: uppercase; color: rgba(26,25,22,0.45); }
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
  .ph.t-1 { grid-column: span 5; grid-row: span 3; background: var(--c-sky); }
  .ph.t-2 { grid-column: span 4; grid-row: span 2; background: var(--c-butter); }
  .ph.t-3 { grid-column: span 3; grid-row: span 2; background: var(--c-rose); }
  .ph.t-4 { grid-column: span 4; grid-row: span 2; background: var(--c-sage); }
  .ph.t-5 { grid-column: span 3; grid-row: span 2; background: var(--c-mint); }
  .ph.t-6 { grid-column: span 5; grid-row: span 2; background: var(--c-pink); }
  .ph.t-7 { grid-column: span 4; grid-row: span 2; background: var(--c-cream); }
  .ph.t-8 { grid-column: span 8; grid-row: span 3; background: var(--c-butter); }
  .ph.t-9 { grid-column: span 4; grid-row: span 3; background: var(--c-rose); }
  @media (max-width: 760px) {
    .photos { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 140px; }
    .ph { grid-column: span 1 !important; grid-row: span 2 !important; }
  }

  /* ============ FOOTER ============ */
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
{ num: "5", label: "Years on Wall St." }];


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
{ yr: "Now", where: "Jersey City · Wall St.", title: "Building the systems behind the decisions.",
  text: "Almost five years as a quantitative strategist across the Hudson. Client segmentation, deposit-retention models, a multi-billion PnL redesign. I like when a number actually changes a decision.",
  tags: ["Quant", "Segmentation", "Retention"], color: "c-mint" }];


const PROJECTS = [
{ n: "01", feat: true, color: "c-butter", status: "shipped",
  kicker: "Wall St. · year one", title: "Loan-level PnL system",
  text: "End-to-end redesign of the PnL pipeline for a multi-billion portfolio. Real-time dashboards, full data-pipeline rewrite. Cut manual review by 30%.",
  stack: ["SLANG", "SQL", "TypeScript", "Real-time"] },
{ n: "02", color: "c-sage", status: "shipped",
  kicker: "Wall St. · year two", title: "Client segmentation",
  text: "K-means cohorts of wealth-management clients. Powered targeted outreach; double-digit lift in cross-sell.",
  stack: ["Python", "Scikit-learn", "PowerBI"] },
{ n: "03", color: "c-sky", status: "shipped",
  kicker: "Wall St. · year two", title: "Deposit retention model",
  text: "GBM + regression to predict attrition and surface behavioral drivers. Material contribution to annual funding value.",
  stack: ["Python", "GBM", "Time series"] },
{ n: "04", third: true, color: "c-rose", status: "research",
  kicker: "Grad school · research", title: "GA Portfolio",
  text: "C++ genetic algorithm with custom fitness. Beat the market in backtests.",
  stack: ["C++", "libcurl", "SQLite"] },
{ n: "05", third: true, color: "c-mint", status: "research",
  kicker: "Grad school · research", title: "Bankruptcy & AAPL",
  text: "Classical ML for bankruptcy prediction; GRU/LSTM for daily-return modeling on AAPL. Strong in-sample performance.",
  stack: ["Keras", "LSTM", "SVM", "RF"] },
{ n: "06", third: true, color: "c-pink", status: "published",
  kicker: "UN · summer intern", title: "JPO retention analysis",
  text: "Logistic regression across 30 countries. Authored sections of the JPO Alumni Report.",
  stack: ["Python", "PowerBI"] },
{ n: "07", color: "c-lemon", status: "published",
  kicker: "Undergrad · research lab", title: "Toddler cognition lab",
  text: "Studies on 24-month-olds' understanding of pictures & video. Awarded grant; contributed to publications; highest honor on thesis.",
  stack: ["SPSS", "Bootstrap", "Thesis"] },
{ n: "08", color: "c-cream", status: "wip",
  kicker: "Personal · now", title: "In the kitchen",
  text: "Something new — tell me what to put here and I'll write it up properly.",
  stack: ["TBD"] }];


const LOVES = [
{ color: "c-sky", emoji: "f/2.0", title: "Photography",
  text: "Mostly digital, sometimes film. Cities at dusk, strangers' hands, the geometry of train stations.",
  foot: "ROLLING SHUTTER" },
{ color: "c-butter", emoji: "ß", title: "Languages",
  text: "Four scripts I think in: 中文, 粤语, English, Deutsch. I collect idioms that don't survive translation.",
  foot: "FOUR ON ROTATION" },
{ color: "c-mint", emoji: "↻", title: "Long walks",
  text: "I will out-walk you. Current project: the High Line end to end, then improvising until my feet file a complaint.",
  foot: "10K+ STEPS / DAY" },
{ color: "c-rose", emoji: "★", title: "Markets",
  text: "Both kinds. The kind with order books and the kind with peaches. I cook everything from one.",
  foot: "SATURDAY MORNINGS" },
{ color: "c-sage", emoji: "✎", title: "Reading",
  text: "Lately: Lulu Miller's Why Fish Don't Exist, Andy Weir's Project Hail Mary. Slow with novels, generous with margins.",
  foot: "BORROWS > BUYS" },
{ color: "c-pink", emoji: "ψ", title: "Toddlers",
  text: "Two years of research will do that to you. Still curious how a 2-y-o decides a photo is a thing.",
  foot: "RESEARCH HABIT" },
{ color: "c-sage", emoji: "▲", title: "National parks", wide: true,
  text: "Collecting them slowly — trailheads, tide pools, the smell of a forest after rain. The goal is all 63; the method is one long weekend at a time.",
  foot: "NEXT STAMP: ACADIA" }];


const LANGS = [
{ script: "中文", name: "Mandarin", level: "native" },
{ script: "粵語", name: "Cantonese", level: "native" },
{ script: "English", name: "English", level: "fluent" },
{ script: "Deutsch", name: "German", level: "advanced" }];


const NOW = [
{ k: "Working", v: <>Deposit retention + a redesigned <span className="ital">PnL system</span> at the day job.</> },
{ k: "Reading", v: <>Lulu Miller, <span className="ital">Why Fish Don't Exist</span>. Andy Weir, <span className="ital">Project Hail Mary</span>.</> },
{ k: "Cooking", v: <>Recreating my mom's 蒜蓉粉丝蒸扇贝.</> },
{ k: "Walking", v: <>The High Line, end to end — then wherever the next espresso is.</> },
{ k: "Next trip", v: <>Acadia National Park — tide pools, granite, sunrise from Cadillac Mountain.</> }];


const PHOTOS = [
{ id: "ph-1", t: 1, cap: "VIENNA · SEMESTER ABROAD", roll: "01" },
{ id: "ph-2", t: 2, cap: "SAN DIEGO, CA", roll: "02", img: "images/ph-2.jpg" },
{ id: "ph-3", t: 3, cap: "GUANGZHOU · 春节", roll: "03" },
{ id: "ph-4", t: 4, cap: "UYUNI · SALT FLATS", roll: "04" },
{ id: "ph-5", t: 5, cap: "INNSBRUCK · ALPS", roll: "05" },
{ id: "ph-6", t: 6, cap: "NASHVILLE, FALL", roll: "06" },
{ id: "ph-7", t: 7, cap: "CUSCO · ANDES", roll: "07" },
{ id: "ph-8", t: 8, cap: "NIAGARA FALLS", roll: "08" },
{ id: "ph-9", t: 9, cap: "BUDAPEST · KELETI", roll: "09" }];


const MARQUEE = [
"QUANT STRATEGIST", "JERSEY CITY · NJ", "FROM GUANGZHOU", "FOUR LANGUAGES",
"WHY FISH DON'T EXIST", "WALKING THE HIGH LINE", "蒜蓉粉丝蒸扇贝", "ACADIA NEXT ▲", "AVAILABLE FOR COFFEE"];


// ============================ COMPONENTS ============================

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
        <span className="live-dot" /> JERSEY CITY · NJ
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

function StatStrip() {
  return (
    <div className="stats rv">
      {STATS.map((s, i) =>
      <div className="stat" key={i}>
          <div className="stat-num">
            {i === 1 || i === 3 ? <span className="ital">{s.num}</span> : s.num}
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
  const c = CHAPTERS[CHAPTERS.length - 1];
  return (
    <div className="block butter chapter-teaser rv" data-screen-label="03 Chapter Teaser">
      <div className="yr">Current chapter</div>
      <h3>{c.title}</h3>
      <p className="body">{c.text}</p>
      <div className="foot">
        {c.tags.slice(0, 3).map((t) => <span key={t}>· {t}</span>)}
      </div>
    </div>);

}

function NowSnapshot() {
  return (
    <div className="block sage rv" style={{ "--rv-d": "90ms" }} data-screen-label="04 Now">
      <div className="block-kicker">/now · May '26</div>
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
            Shipped, researched, published — and one still in the kitchen.
            The number game: a multi-billion portfolio, double-digit lift in cross-sell,
            strong out-of-sample accuracy, and one stubborn LSTM that finally cooperated.
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
          <div className={"love rv " + l.color + (l.wide ? " wide" : "")} style={{ "--rv-d": i % 3 * 70 + "ms" }} key={i}>
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
      <div>© Eylon Liu · 2026 <span style={{ opacity: 0.45, marginLeft: 10 }}>· psst: try typing my name</span></div>
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
  "shapes": "playful"
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
      <CursorDoodle />
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