/* costCurve.js — Act 0 hero counter.
   Continuously interpolates between adjacent years in DATA_COST_CURVE
   as global scroll progress t ∈ [0,1] sweeps across the hero section.

   Effect: the price reads dramatic and smooth — $60 → $40 → $20 → $10 →
   $2.50 → $0.30 → $0.08 — rather than snapping per scroll step. */

const CostCurve = (() => {
  /* Slide is LINEAR (locked to scroll, constant velocity) and starts in
     the last third of step 1 so the counter is already in measurable
     motion by the time the step 1 → step 2 boundary hits — that boundary
     is where the cost-jump $2.50 → $0.30 begins and where the closing
     paragraph appears, both of which need the counter to be visibly
     moving (not parked at top with a sub-pixel slope).

     With numSteps = 3 in Act 0:
       step 0 (intro):      t ∈ [0,     0.333]   — counter pinned, scrolls through text
       step 1 (middle):     t ∈ [0.333, 0.667]   — counter pinned for most of it,
                                                   begins to slide at t=0.55
       step 2 (closing):    t ∈ [0.667, 1.0  ]   — slide continues at the same rate
       opacity fades:       t ∈ [0.85,  1.0  ]   — fades smoothstep near the very end

     Linear (not smoothstep) for the slide because the slide tracks the
     user's scroll input — they expect "scroll X = move Y" 1:1, not a
     curve that lags at the start. */
  const SLIDE_START = 0.55;
  const SLIDE_END   = 1.0;
  const FADE_START  = 0.85;
  const FADE_END    = 1.0;
  const SLIDE_VH    = 60;     /* total slide distance in viewport-height units */

  let valueEl, yearEl, stageEl;
  let lastWhole = -1;

  function setup() {
    valueEl = document.getElementById('hero-counter-value');
    yearEl  = document.getElementById('hero-counter-year');
    stageEl = document.querySelector('.hero-stage');
    renderAt(0);
  }

  /* Interpolation between adjacent yearly data points. t ∈ [0, 1] (clamped).
     Cost uses GEOMETRIC (log) interpolation: cost = c0 · (c1/c0)^frac.
     The series is exponential ($60 → $0.08, ~2.5×/yr), so equal scroll
     should drop the cost by an equal RATIO, not an equal dollar amount —
     otherwise the number plunges $20/segment early and crawls $0.22/segment
     late. Year stays linear so the label reads 2020 → 2026 evenly.
     At every exact data point both schemes return the true stored value. */
  function renderAt(t) {
    if (!valueEl || !yearEl) return;
    const series = DATA_COST_CURVE;
    const n = series.length;
    const tc = Math.max(0, Math.min(1, t));
    const f  = tc * (n - 1);
    const i0 = Math.floor(f);
    const i1 = Math.min(n - 1, i0 + 1);
    const frac = f - i0;

    const cost = series[i0].cost * Math.pow(series[i1].cost / series[i0].cost, frac);
    const year = series[i0].year + (series[i1].year - series[i0].year) * frac;

    valueEl.textContent = fmtMoney(cost);
    yearEl.textContent  = Math.round(year);

    // Slide is linear; fade is smoothstep-eased.
    //   slide: 1:1 with scroll position — feels locked to the user's input,
    //          no zero-slope start, no apparent "stuck" frames
    //   fade:  eased so the disappearance feels gentle at the boundaries
    if (stageEl) {
      let slideVh = 0;
      if (tc > SLIDE_START) {
        const us = Math.min(1, (tc - SLIDE_START) / (SLIDE_END - SLIDE_START));
        slideVh = us * SLIDE_VH;   /* linear — constant velocity */
      }

      let opacity = 1;
      if (tc > FADE_START) {
        const uf = Math.min(1, (tc - FADE_START) / (FADE_END - FADE_START));
        const easedFade = uf * uf * (3 - 2 * uf);
        opacity = 1 - easedFade;
      }

      stageEl.style.opacity = opacity.toFixed(3);
      stageEl.style.transform = `translate3d(0, ${slideVh.toFixed(2)}vh, 0)`;
    }

    // Brief brightness pulse on year crossing — adds visceral feel.
    const whole = Math.round(year);
    if (whole !== lastWhole) {
      lastWhole = whole;
      valueEl.style.filter = 'brightness(1.35)';
      // Reset on next frame so it animates back via CSS transition.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          valueEl.style.filter = 'brightness(1)';
        });
      });
    }
  }

  return {
    setup,
    updateProgress: renderAt
  };
})();
