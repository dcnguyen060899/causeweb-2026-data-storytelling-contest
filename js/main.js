/* main.js — scrollama orchestration + progress bar.

   Two handler tables:
     ENTER_HANDLERS    — fired once when a step enters; used by charts that
                         render discrete states on step boundaries (bars,
                         lines, triangle nodes).
     PROGRESS_HANDLERS — fired continuously as a step scrolls past, with a
                         progress value in [0,1]; used by charts whose state
                         interpolates smoothly inside a step.

   Acts with a progress handler set `progress: true` on their scrollama
   instance so onStepProgress fires.

   Act-by-act:
     0 — Hero          (PROGRESS, cost counter)
     1 — Two Camps     (ENTER)
     2 — Exposure      (ENTER)
     3 — Squeeze       (ENTER, wage polarization)
     4 — Rebound       (ENTER, Baumol bars; sign-flip line is added in
                        next iteration with PROGRESS)
     5 — Jordan        (ENTER)
     6 — Spectrum      (ENTER)
     7 — Methodology   (no chart)
*/

(function () {
  'use strict';

  function initCharts() {
    CostCurve.setup();
    TwoCamps.setup();
    ExposureChart.setup();
    WagePolarization.setup();
    SignFlipTimeline.setup();
    BaumolChart.setup();
    TwoDials.setup();
    JordanTriangle.setup();
    SpectrumViz.setup();
  }

  const ENTER_HANDLERS = {
    /* Act 0 has a no-op enter handler purely so scrollama still sets up for
       the hero and toggles `.is-active` on its text steps. The cost counter
       itself is NOT driven per-step (that produced dead zones at the start
       and end); it's driven by whole-section scroll progress — see
       initHeroCounter(). */
    '0': () => {},
    '1': (i) => TwoCamps.update(i),
    '2': (i) => ExposureChart.update(i),
    '3': (i) => WagePolarization.update(i),
    '4': (i) => BaumolChart.update(i),
    '5': (i) => TwoDials.update(i),
    '6': (i) => JordanTriangle.update(i),
    '7': (i) => SpectrumViz.update(i)
  };

  const PROGRESS_HANDLERS = {
    '4': (stepIndex, progress, numSteps) => {
      /* Act 4: playhead sweeps left-to-right across the sign-flip curve. */
      const t = (stepIndex + progress) / numSteps;
      SignFlipTimeline.updateProgress(t);
    }
  };

  function initScrollama() {
    document.querySelectorAll('.scroll-section[data-act]').forEach(section => {
      const act    = section.dataset.act;
      const steps  = section.querySelectorAll('.scroll-step');
      if (steps.length === 0) return;

      const enterFn    = ENTER_HANDLERS[act];
      const progressFn = PROGRESS_HANDLERS[act];
      if (!enterFn && !progressFn) return;

      const numSteps = steps.length;

      const s = scrollama();
      s.setup({
        step: `#act-${act} .scroll-step`,
        offset: 0.5,
        progress: Boolean(progressFn),
        debug: false
      });

      s.onStepEnter(({ element, index }) => {
        element.classList.add('is-active');
        if (enterFn)    enterFn(index);
        if (progressFn) progressFn(index, 0, numSteps);
      });

      if (progressFn) {
        s.onStepProgress(({ index, progress }) => {
          progressFn(index, progress, numSteps);
        });
      }

      s.onStepExit(({ element, index, direction }) => {
        if (direction === 'up') {
          element.classList.remove('is-active');
          if (index === 0) {
            /* Exiting step 0 going up means the reader is above the first
               step entirely — restore to the section's true start state
               (t = 0). The previous behavior wrongly held t at end-of-step-0
               (i.e. 1/numSteps), which left the cost counter stuck at the
               $20/2022 value when scrolling back to the top. */
            if (enterFn)    enterFn(0);
            if (progressFn) progressFn(0, 0, numSteps);
          } else {
            const prev = index - 1;
            if (enterFn)    enterFn(prev);
            if (progressFn) progressFn(prev, 1, numSteps);
          }
        } else if (direction === 'down') {
          if (progressFn) progressFn(index, 1, numSteps);
        }
      });
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initCharts, 200);
    });
  }

  function initProgressBar() {
    const bar = document.getElementById('progress-bar');
    if (!bar) return;
    const updateBar = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total > 0 ? Math.min(1, scrolled / total) : 0;
      bar.style.height = (pct * 100) + '%';
    };
    document.addEventListener('scroll', updateBar, { passive: true });
    updateBar();
  }

  /* Drive the Act 0 cost counter from the hero's WHOLE-SECTION scroll
     progress (0 at section top, 1 at section bottom) rather than scrollama's
     per-step progress. Per-step driving left the counter frozen at $60 until
     the first step entered the active zone, and frozen at $0.08 after the last
     step exited — two large dead zones. Section progress maps the full $60→
     $0.08 sweep uniformly across the entire hero scroll, with no dead zones. */
  function initHeroCounter() {
    const hero = document.getElementById('act-0');
    if (!hero || typeof CostCurve === 'undefined') return;

    let top = 0;
    let scrollable = 1;
    function measure() {
      const rect = hero.getBoundingClientRect();
      top = rect.top + window.scrollY;
      scrollable = Math.max(1, hero.offsetHeight - window.innerHeight);
    }

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const p = (window.scrollY - top) / scrollable;
        CostCurve.updateProgress(Math.max(0, Math.min(1, p)));
        ticking = false;
      });
    }

    measure();
    CostCurve.updateProgress(0);
    document.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { measure(); onScroll(); });
    /* Re-measure once fonts settle — they shift the hero's height/offset. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { measure(); onScroll(); });
    }
  }

  function boot() {
    // Always start at the very top on load/refresh. Without this, browsers
    // restore the previous scroll position — which means refreshing while
    // scrolled into Act 0 causes scrollama to fire onStepEnter for whichever
    // step is currently active, snapping the cost counter to that step's
    // t-value instead of the proper starting state ($60 / 2020).
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    initCharts();
    initScrollama();
    initProgressBar();
    initHeroCounter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
