/* signFlipTimeline.js — Act 4 centerpiece.

   Two halves:
     squeeze (left)  — ink stroke, slightly thinner (the deflating story)
     rebound (right) — accent stroke, slightly thicker (the payoff)
   The playhead is ink in the squeeze region and accent in the rebound region.
   Position eases toward the scroll-progress target via rAF for momentum feel.

   Marker placement (FLIP = 0.42) chosen so playhead spends meaningful distance
   in both phases without burying either.
*/

const SignFlipTimeline = (() => {
  const FLIP = 0.42;
  const margin = { top: 40, right: 16, bottom: 36, left: 16 };
  let svg, x, y, w, h;
  let leftPath, rightPath, leftLen, rightLen, playhead, markerPulse;

  /* Easing state for the playhead momentum */
  let targetT = 0;       /* updated synchronously from main.js scroll progress */
  let currentT = 0;      /* eased toward targetT each frame */
  let rafHandle = null;
  let lastRegion = 'squeeze';

  function wageCurve(t) {
    if (t <= FLIP) {
      const u = t / FLIP;
      return 70 - 35 * (u * u * (3 - 2 * u));
    }
    const u = (t - FLIP) / (1 - FLIP);
    return 35 + 70 * (u * u * (3 - 2 * u));
  }

  function setup() {
    const el = document.getElementById('sign-flip-chart');
    if (!el) return;
    const box = getSvgBox(el, 280);
    const W = box.width;
    const H = box.height;
    w = W - margin.left - margin.right;
    h = H - margin.top  - margin.bottom;

    svg = d3.select(el)
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    x = d3.scaleLinear().domain([0, 1]).range([0, w]);
    y = d3.scaleLinear().domain([15, 115]).range([h, 0]);

    /* baseline */
    g.append('line')
      .attr('x1', 0).attr('y1', h).attr('x2', w).attr('y2', h)
      .attr('stroke', COLORS.inkFaint);

    /* axis hints */
    g.append('text')
      .attr('x', 0).attr('y', h + 20)
      .attr('text-anchor', 'start').attr('fill', COLORS.inkSoft)
      .style('font-family', "'Space Mono', monospace").style('font-size', '10px')
      .style('letter-spacing', '0.08em')
      .text('NOW · CHEAP AI ARRIVES');
    g.append('text')
      .attr('x', w).attr('y', h + 20)
      .attr('text-anchor', 'end').attr('fill', COLORS.inkSoft)
      .style('font-family', "'Space Mono', monospace").style('font-size', '10px')
      .style('letter-spacing', '0.08em')
      .text('LONG RUN');

    g.append('text')
      .attr('x', -6).attr('y', y(105)).attr('text-anchor', 'end')
      .attr('fill', COLORS.inkFaint)
      .style('font-family', "'Space Mono', monospace").style('font-size', '9px')
      .text('high');
    g.append('text')
      .attr('x', -6).attr('y', y(25)).attr('text-anchor', 'end')
      .attr('fill', COLORS.inkFaint)
      .style('font-family', "'Space Mono', monospace").style('font-size', '9px')
      .text('low');

    /* region labels */
    g.append('text')
      .attr('x', x(FLIP / 2)).attr('y', 18)
      .attr('text-anchor', 'middle').attr('fill', COLORS.ink)
      .style('font-family', "'Space Mono', monospace")
      .style('font-weight', '400').style('font-size', '10.5px')
      .style('letter-spacing', '0.22em')
      .text('SQUEEZE');
    g.append('text')
      .attr('x', x(FLIP) + (w - x(FLIP)) / 2).attr('y', 18)
      .attr('text-anchor', 'middle').attr('fill', COLORS.accent)
      .style('font-family', "'Space Mono', monospace")
      .style('font-weight', '400').style('font-size', '10.5px')
      .style('letter-spacing', '0.22em')
      .text('REBOUND');

    /* curve */
    const N = 120;
    const data = d3.range(N + 1).map(i => {
      const tt = i / N;
      return { t: tt, w: wageCurve(tt) };
    });
    const line = d3.line()
      .x(d => x(d.t))
      .y(d => y(d.w))
      .curve(d3.curveMonotoneX);

    const dataLeft  = data.filter(d => d.t <= FLIP + 1e-3);
    const dataRight = data.filter(d => d.t >= FLIP - 1e-3);

    leftPath = g.append('path')
      .datum(dataLeft)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', COLORS.ink)
      .attr('stroke-width', 1.75)
      .attr('stroke-linecap', 'round');

    rightPath = g.append('path')
      .datum(dataRight)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', COLORS.accent)
      .attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round');

    leftLen  = leftPath.node().getTotalLength();
    rightLen = rightPath.node().getTotalLength();
    leftPath
      .attr('stroke-dasharray', `${leftLen} ${leftLen}`)
      .attr('stroke-dashoffset', leftLen);
    rightPath
      .attr('stroke-dasharray', `${rightLen} ${rightLen}`)
      .attr('stroke-dashoffset', rightLen);

    /* marker */
    const markerX = x(FLIP);
    const markerG = g.append('g');
    markerG.append('line')
      .attr('x1', markerX).attr('x2', markerX)
      .attr('y1', 0).attr('y2', h)
      .attr('stroke', COLORS.accent)
      .attr('stroke-width', 0.75)
      .attr('opacity', 0.85);
    markerG.append('rect')
      .attr('x', markerX - 82).attr('y', h - 26)
      .attr('width', 164).attr('height', 20)
      .attr('fill', COLORS.paper);
    markerG.append('text')
      .attr('x', markerX).attr('y', h - 12)
      .attr('text-anchor', 'middle').attr('fill', COLORS.accent)
      .style('font-family', "'Space Mono', monospace")
      .style('font-size', '9.5px').style('letter-spacing', '0.1em')
      .style('text-transform', 'uppercase')
      .text('capital adjusts · 5–15 yrs');

    /* directional glyphs (subtle) */
    g.append('text')
      .attr('x', x(FLIP / 2)).attr('y', y(48))
      .attr('text-anchor', 'middle').attr('fill', COLORS.inkFaint)
      .style('font-family', "'Space Mono', monospace").style('font-size', '14px')
      .text('↓');
    g.append('text')
      .attr('x', x(FLIP) + (w - x(FLIP)) * 0.55).attr('y', y(63))
      .attr('text-anchor', 'middle').attr('fill', COLORS.accent)
      .style('font-family', "'Space Mono', monospace").style('font-size', '14px')
      .text('↑');

    /* marker pulse — appears briefly when the playhead crosses */
    markerPulse = g.append('circle')
      .attr('cx', markerX).attr('cy', y(wageCurve(FLIP)))
      .attr('r', 0)
      .attr('fill', 'none')
      .attr('stroke', COLORS.accent)
      .attr('stroke-width', 1.5)
      .attr('opacity', 0);

    /* playhead */
    playhead = g.append('g').attr('opacity', 0);
    playhead.append('circle')
      .attr('class', 'flip-playhead-ring')
      .attr('r', 9)
      .attr('fill', 'none')
      .attr('stroke', COLORS.ink)
      .attr('stroke-width', 1)
      .attr('opacity', 0.4);
    playhead.append('circle')
      .attr('class', 'flip-playhead-dot')
      .attr('r', 4)
      .attr('fill', COLORS.ink);
  }

  function applyVisuals() {
    if (!svg) return;
    const t = currentT;

    let dashLeft, dashRight;
    if (t <= FLIP) {
      const frac = t / FLIP;
      dashLeft  = leftLen  * (1 - frac);
      dashRight = rightLen;
    } else {
      const frac = (t - FLIP) / (1 - FLIP);
      dashLeft  = 0;
      dashRight = rightLen * (1 - frac);
    }
    leftPath.attr('stroke-dashoffset', dashLeft);
    rightPath.attr('stroke-dashoffset', dashRight);

    if (playhead) {
      playhead
        .attr('transform', `translate(${x(t)},${y(wageCurve(t))})`)
        .attr('opacity', t > 0.01 ? 1 : 0);

      const inRebound = t > FLIP;
      const c = inRebound ? COLORS.accent : COLORS.ink;
      playhead.select('.flip-playhead-dot').attr('fill', c);
      playhead.select('.flip-playhead-ring').attr('stroke', c);

      /* Pulse when crossing the marker */
      const region = inRebound ? 'rebound' : 'squeeze';
      if (region !== lastRegion && region === 'rebound') {
        markerPulse
          .interrupt()
          .attr('r', 4).attr('opacity', 0.9)
          .transition().duration(700).ease(d3.easeCubicOut)
          .attr('r', 22).attr('opacity', 0);
      }
      lastRegion = region;
    }
  }

  /* requestAnimationFrame loop — eases currentT toward targetT */
  function tick() {
    const delta = targetT - currentT;
    if (Math.abs(delta) < 0.0005) {
      currentT = targetT;
      applyVisuals();
      rafHandle = null;
      return;
    }
    currentT += delta * 0.18;  /* smoothing factor — feels like 100ms ease */
    applyVisuals();
    rafHandle = requestAnimationFrame(tick);
  }

  function updateProgress(t) {
    if (!svg) return;
    targetT = Math.max(0, Math.min(1, t));
    if (rafHandle === null) {
      rafHandle = requestAnimationFrame(tick);
    }
  }

  return { setup, updateProgress };
})();
