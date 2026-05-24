/* twoDials.js — Act 5 interactive heart.

   Custom drag knobs (no <input type="range">). Each knob has:
     • SVG track + thumb that draws at viewBox coords
     • pointer events for drag (mouse + touch via PointerEvent)
     • velocity tracking → inertia decay on release
     • soft snap detent at midpoint (within 0.04, low velocity)
     • keyboard support (arrows ±0.05, Home/End)
     • ARIA role=slider with live aria-valuenow

   Outcome mapping (the paper's Prop 1, plain language):
     slope = max(0, A − 0.5) + max(0, B − 0.5) − ε     ε = 0.05
   Strictly OR: slope > 0 iff at least one dial > 0.5.
*/

const TwoDials = (() => {
  const EPSILON = 0.05;
  const margin = { top: 14, right: 18, bottom: 26, left: 18 };
  let svg, x, y, w, h;
  let aValueEl, bValueEl, statusEl, outcomeBoxEl;

  const dials = {
    A: { value: 0.4, vel: 0, geom: null, animFrame: null },
    B: { value: 0.4, vel: 0, geom: null, animFrame: null }
  };

  function longRunSlope(A, B) {
    return Math.max(0, A - 0.5) + Math.max(0, B - 0.5) - EPSILON;
  }

  function wageCurve(t, slope) {
    if (t < 0.3) {
      const u = t / 0.3;
      return 70 - 25 * (u * u * (3 - 2 * u));
    }
    const u = (t - 0.3) / 0.7;
    const endValue = 45 + slope * 90;
    return 45 + (endValue - 45) * (u * u * (3 - 2 * u));
  }

  function describeA(v) {
    if (v < 0.25) return 'Totally interchangeable';
    if (v < 0.45) return 'Mostly interchangeable';
    if (v < 0.55) return 'Mixed';
    if (v < 0.75) return 'Mostly prefer human';
    return 'Strongly prefer human';
  }
  function describeB(v) {
    if (v < 0.25) return 'Replaces the worker';
    if (v < 0.45) return 'Mostly replaces';
    if (v < 0.55) return 'Mixed';
    if (v < 0.75) return 'Mostly complements';
    return 'Strongly complements';
  }

  /* ---------- Build custom dial SVG inside a host <div class="dial-knob"> ---------- */
  function buildKnob(letter) {
    const existing = document.getElementById('dial-' + letter.toLowerCase() + '-knob');
    if (!existing) return null;
    const knobEl = existing.cloneNode(false);
    existing.parentNode.replaceChild(knobEl, existing);
    knobEl.innerHTML = '';

    /* viewBox coordinate space — actual pixel size scales via CSS width: 100% */
    const W = 280;
    const H = 44;
    const trackY = H / 2;
    const trackPad = 14;
    const trackWidth = W - 2 * trackPad;

    const ns = 'http://www.w3.org/2000/svg';
    const svgEl = document.createElementNS(ns, 'svg');
    svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svgEl.setAttribute('preserveAspectRatio', 'none');

    /* Track — single ink hairline */
    const track = document.createElementNS(ns, 'line');
    track.setAttribute('x1', trackPad);
    track.setAttribute('x2', W - trackPad);
    track.setAttribute('y1', trackY);
    track.setAttribute('y2', trackY);
    track.setAttribute('stroke', COLORS.ink);
    track.setAttribute('stroke-width', '1');
    svgEl.appendChild(track);

    /* End ticks */
    [trackPad, W - trackPad].forEach(tx => {
      const t = document.createElementNS(ns, 'line');
      t.setAttribute('x1', tx); t.setAttribute('x2', tx);
      t.setAttribute('y1', trackY - 5); t.setAttribute('y2', trackY + 5);
      t.setAttribute('stroke', COLORS.ink);
      t.setAttribute('stroke-width', '1');
      svgEl.appendChild(t);
    });

    /* Midpoint detent tick — the "knife-edge" */
    const midX = trackPad + 0.5 * trackWidth;
    const midTick = document.createElementNS(ns, 'line');
    midTick.setAttribute('x1', midX);
    midTick.setAttribute('x2', midX);
    midTick.setAttribute('y1', trackY - 8);
    midTick.setAttribute('y2', trackY + 8);
    midTick.setAttribute('stroke', COLORS.accent);
    midTick.setAttribute('stroke-width', '1.5');
    midTick.setAttribute('opacity', '0.55');
    svgEl.appendChild(midTick);

    /* Thumb group — anchored at translate(x, 0) */
    const thumb = document.createElementNS(ns, 'g');
    thumb.setAttribute('class', 'dial-thumb');

    const thumbRing = document.createElementNS(ns, 'circle');
    thumbRing.setAttribute('cx', 0);
    thumbRing.setAttribute('cy', trackY);
    thumbRing.setAttribute('r', 14);
    thumbRing.setAttribute('fill', COLORS.paper);
    thumbRing.setAttribute('stroke', COLORS.ink);
    thumbRing.setAttribute('stroke-width', '1.5');
    thumb.appendChild(thumbRing);

    const thumbFill = document.createElementNS(ns, 'circle');
    thumbFill.setAttribute('cx', 0);
    thumbFill.setAttribute('cy', trackY);
    thumbFill.setAttribute('r', 4.5);
    thumbFill.setAttribute('fill', COLORS.ink);
    thumb.appendChild(thumbFill);

    svgEl.appendChild(thumb);

    knobEl.appendChild(svgEl);

    return { knobEl, svgEl, thumb, thumbFill, thumbRing, midTick, W, H, trackY, trackPad, trackWidth };
  }

  function updateThumb(letter) {
    const d = dials[letter];
    if (!d.geom) return;
    const { thumb, thumbFill, thumbRing, trackPad, trackWidth, knobEl } = d.geom;
    const xpos = trackPad + d.value * trackWidth;
    thumb.setAttribute('transform', `translate(${xpos}, 0)`);

    const past = d.value > 0.5;
    thumbFill.setAttribute('fill', past ? COLORS.accent : COLORS.ink);
    thumbRing.setAttribute('stroke', past ? COLORS.accent : COLORS.ink);

    knobEl.setAttribute('aria-valuenow', d.value.toFixed(2));
  }

  function setDialValue(letter, newValue) {
    const d = dials[letter];
    d.value = Math.max(0, Math.min(1, newValue));
    updateThumb(letter);
    render();
  }

  /* ---------- Drag, inertia, snap ---------- */
  function attachHandlers(letter) {
    const d = dials[letter];
    const knobEl = d.geom.knobEl;
    let pointerId = null;
    let startX = 0;
    let startValue = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocityHistory = [];

    function pointerDown(e) {
      if (d.animFrame) { cancelAnimationFrame(d.animFrame); d.animFrame = null; }
      pointerId = e.pointerId;
      try { knobEl.setPointerCapture(pointerId); } catch (err) {}
      knobEl.focus();
      startX = e.clientX;
      startValue = d.value;
      lastX = e.clientX;
      lastTime = performance.now();
      velocityHistory = [];
      d.vel = 0;
      e.preventDefault();
    }

    function pointerMove(e) {
      if (pointerId !== e.pointerId) return;
      const rect = knobEl.getBoundingClientRect();
      if (rect.width === 0) return;
      const dx = e.clientX - startX;
      d.value = Math.max(0, Math.min(1, startValue + dx / rect.width));

      const now = performance.now();
      const dt = now - lastTime;
      if (dt > 0) {
        const instantVel = (e.clientX - lastX) / dt;
        velocityHistory.push(instantVel);
        if (velocityHistory.length > 5) velocityHistory.shift();
      }
      lastX = e.clientX;
      lastTime = now;

      updateThumb(letter);
      render();
    }

    function pointerEnd(e) {
      if (pointerId === null) return;
      try { knobEl.releasePointerCapture(pointerId); } catch (err) {}
      pointerId = null;

      const rect = knobEl.getBoundingClientRect();
      const avgPxPerMs = velocityHistory.reduce((s, v) => s + v, 0) / Math.max(1, velocityHistory.length);
      d.vel = rect.width > 0 ? avgPxPerMs / rect.width : 0;  /* value-units per ms */

      /* Soft snap detent: low velocity AND near midpoint → snap to 0.5 */
      if (Math.abs(d.vel) < 0.001 && Math.abs(d.value - 0.5) < 0.04) {
        snapTo(letter, 0.5);
        return;
      }
      if (Math.abs(d.vel) > 0.0005) {
        startInertia(letter);
      }
    }

    knobEl.addEventListener('pointerdown', pointerDown);
    knobEl.addEventListener('pointermove', pointerMove);
    knobEl.addEventListener('pointerup', pointerEnd);
    knobEl.addEventListener('pointercancel', pointerEnd);

    knobEl.addEventListener('keydown', (e) => {
      let next = d.value;
      if      (e.key === 'ArrowLeft'  || e.key === 'ArrowDown') { next -= 0.05; e.preventDefault(); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowUp')   { next += 0.05; e.preventDefault(); }
      else if (e.key === 'Home')                                { next = 0;     e.preventDefault(); }
      else if (e.key === 'End')                                 { next = 1;     e.preventDefault(); }
      else return;
      setDialValue(letter, next);
    });
  }

  function startInertia(letter) {
    const d = dials[letter];
    const friction = 0.92;
    function step() {
      d.value = Math.max(0, Math.min(1, d.value + d.vel * 16));   /* 16ms per frame */
      d.vel *= friction;
      updateThumb(letter);
      render();
      if (Math.abs(d.vel) < 0.0003) {
        d.animFrame = null;
        if (Math.abs(d.value - 0.5) < 0.04) snapTo(letter, 0.5);
        return;
      }
      d.animFrame = requestAnimationFrame(step);
    }
    d.animFrame = requestAnimationFrame(step);
  }

  function snapTo(letter, target) {
    const d = dials[letter];
    if (d.animFrame) cancelAnimationFrame(d.animFrame);
    const startVal = d.value;
    const startTime = performance.now();
    const duration = 240;

    /* Brief midpoint-tick pulse to mark the snap */
    if (d.geom && d.geom.midTick) {
      const tick = d.geom.midTick;
      tick.setAttribute('opacity', '1');
      setTimeout(() => tick.setAttribute('opacity', '0.55'), 320);
    }

    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = t * t * (3 - 2 * t);
      d.value = startVal + (target - startVal) * eased;
      updateThumb(letter);
      render();
      if (t < 1) {
        d.animFrame = requestAnimationFrame(step);
      } else {
        d.value = target;
        d.animFrame = null;
        updateThumb(letter);
        render();
      }
    }
    d.animFrame = requestAnimationFrame(step);
  }

  /* ---------- Wage-curve render ---------- */
  function render() {
    if (!svg) return;
    const slope = longRunSlope(dials.A.value, dials.B.value);
    const N = 90;
    const data = d3.range(N + 1).map(i => {
      const tt = i / N;
      return { t: tt, w: wageCurve(tt, slope) };
    });
    const line = d3.line()
      .x(d => x(d.t))
      .y(d => y(d.w))
      .curve(d3.curveMonotoneX);

    const dataLeft  = data.filter(d => d.t <= 0.302);
    const dataRight = data.filter(d => d.t >= 0.298);
    const good = slope > 0;

    svg.select('#dial-line-left').datum(dataLeft).attr('d', line);
    svg.select('#dial-line-right')
      .datum(dataRight)
      .attr('d', line)
      .attr('stroke', good ? COLORS.accent : COLORS.ink)
      .attr('stroke-width', good ? 2.75 : 1.75);

    const last = data[data.length - 1];
    svg.select('#dial-endpoint')
      .attr('cx', x(last.t))
      .attr('cy', y(last.w))
      .attr('fill', good ? COLORS.accent : COLORS.inkSoft);

    if (aValueEl) aValueEl.textContent = describeA(dials.A.value);
    if (bValueEl) bValueEl.textContent = describeB(dials.B.value);

    if (statusEl && outcomeBoxEl) {
      if (good) {
        statusEl.textContent = 'Human work becomes more valuable.';
        outcomeBoxEl.classList.remove('outcome-bad');
        outcomeBoxEl.classList.add('outcome-good');
      } else {
        statusEl.textContent = 'Displacement never reverses — the pessimists are right.';
        outcomeBoxEl.classList.remove('outcome-good');
        outcomeBoxEl.classList.add('outcome-bad');
      }
    }
  }

  function setup() {
    const el = document.getElementById('two-dials-chart');
    if (!el) return;
    const box = getSvgBox(el, 200);
    w = box.width  - margin.left - margin.right;
    h = box.height - margin.top  - margin.bottom;

    svg = d3.select(el)
      .attr('viewBox', `0 0 ${box.width} ${box.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    x = d3.scaleLinear().domain([0, 1]).range([0, w]);
    y = d3.scaleLinear().domain([25, 145]).range([h, 0]);

    /* zero-reference baseline */
    g.append('line')
      .attr('x1', 0).attr('y1', y(45))
      .attr('x2', w).attr('y2', y(45))
      .attr('stroke', COLORS.inkFaint)
      .attr('stroke-dasharray', '3 4');

    g.append('text').attr('x', 0).attr('y', h + 18)
      .attr('text-anchor', 'start').attr('fill', COLORS.inkFaint)
      .style('font-family', "'Space Mono', monospace").style('font-size', '9.5px')
      .style('letter-spacing', '0.1em').style('text-transform', 'uppercase')
      .text('NOW');
    g.append('text').attr('x', w).attr('y', h + 18)
      .attr('text-anchor', 'end').attr('fill', COLORS.inkFaint)
      .style('font-family', "'Space Mono', monospace").style('font-size', '9.5px')
      .style('letter-spacing', '0.1em').style('text-transform', 'uppercase')
      .text('LONG RUN');

    g.append('path').attr('id', 'dial-line-left')
      .attr('fill', 'none').attr('stroke', COLORS.ink)
      .attr('stroke-width', 1.75).attr('stroke-linecap', 'round');
    g.append('path').attr('id', 'dial-line-right')
      .attr('fill', 'none').attr('stroke', COLORS.ink)
      .attr('stroke-width', 2).attr('stroke-linecap', 'round');

    g.append('circle').attr('id', 'dial-endpoint').attr('r', 4);

    /* Custom knobs */
    ['A', 'B'].forEach(letter => {
      dials[letter].geom = buildKnob(letter);
      if (dials[letter].geom) {
        attachHandlers(letter);
        updateThumb(letter);
      }
    });

    aValueEl     = document.getElementById('dial-a-value');
    bValueEl     = document.getElementById('dial-b-value');
    statusEl     = document.getElementById('two-dials-status');
    outcomeBoxEl = document.getElementById('two-dials-outcome');

    render();
  }

  /* main.js calls this on step enter; widget itself is user-driven. */
  function update(stepIndex) {
    const dialAGroup = document.querySelector('.dial-group[data-dial="A"]');
    const dialBGroup = document.querySelector('.dial-group[data-dial="B"]');
    if (dialAGroup) dialAGroup.classList.toggle('is-active', stepIndex === 1);
    if (dialBGroup) dialBGroup.classList.toggle('is-active', stepIndex === 2);

    const beat = document.getElementById('uncertainty-beat');
    if (beat) beat.classList.toggle('is-visible', stepIndex >= 4);
  }

  return { setup, update };
})();
