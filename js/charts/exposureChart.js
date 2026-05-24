/* exposureChart.js — Act 2.

   Pictogram bar chart, hand-drawn variant.

   Per occupation: a label, a row of 20 little stick-figure SVGs, and a
   percent value.

   Each worker is a small humanoid silhouette (head + slightly-curved body
   + two legs). Each one has a deterministic small rotation (±3°) computed
   from row+index, so the collective effect is "crowd of slightly off-axis
   figures" — the hand-drawn feel comes from the variance across many
   figures rather than from drawing each one uniquely.

   When a worker is exposed/fallen, the humanoid fades out and a small
   horizontal ghost-mark fades in at the foot of the slot — the displaced
   workers literally lose their human shape and become tally marks.

   Step semantics (unchanged):
     step 0   — all workers neutral, faint
     step 1   — high-exposure rows (exposure ≥ 0.6) animate
     step 2   — every row animates
     step 3+  — emphasize-human (the survivors glow a touch brighter)
*/

const ExposureChart = (() => {
  const WORKERS_PER_ROW = 20;
  let containerEl;
  let data;

  /* Stick-figure SVG. Two groups:
       .worker-human  — head dot + slightly-curved body + two legs (default)
       .worker-ghost  — a single short horizontal stroke at the foot (fallen)
     viewBox is 10×24; preserveAspectRatio lets the figure sit centered
     in whatever width the flex slot gives it. */
  const WORKER_SVG = `
    <svg viewBox="0 0 10 24" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <g class="worker-human">
        <circle cx="5" cy="3.5" r="1.9"/>
        <path d="M 5 5.4 Q 4.85 10 5 14" fill="none" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M 5 14   Q 4   17   3.1 20.6" fill="none" stroke-width="1.25" stroke-linecap="round"/>
        <path d="M 5 14   Q 6   17   6.9 20.6" fill="none" stroke-width="1.25" stroke-linecap="round"/>
      </g>
      <g class="worker-ghost">
        <line x1="2.8" y1="21" x2="7.2" y2="21" stroke-width="1" stroke-linecap="round"/>
      </g>
    </svg>`;

  /* Deterministic pseudo-random tilt in degrees, range about ±3°.
     Stable per (rowIdx, workerIdx) so it doesn't reshuffle on re-render. */
  function workerTilt(rowIdx, workerIdx) {
    const seed = (rowIdx * 31 + workerIdx * 17 + 7) % 1000;
    return ((seed / 1000) - 0.5) * 6;
  }

  function bucket(exposure) {
    if (exposure >= 0.6) return 'exposed-high';
    if (exposure >= 0.3) return 'exposed-mid';
    return 'exposed-low';
  }

  function setup() {
    containerEl = document.getElementById('exposure-chart');
    if (!containerEl) return;
    containerEl.innerHTML = '';
    containerEl.classList.remove('emphasize-human');

    data = DATA_EXPOSURE.slice().sort((a, b) => b.exposure - a.exposure);

    data.forEach((d, rowIdx) => {
      const row = document.createElement('div');
      row.className = 'exposure-row';
      row.dataset.occupation = d.occupation;

      const label = document.createElement('div');
      label.className = 'exposure-label';
      label.textContent = d.occupation;

      const track = document.createElement('div');
      track.className = 'exposure-track';

      const exposedCount = Math.round(d.exposure * WORKERS_PER_ROW);
      for (let i = 0; i < WORKERS_PER_ROW; i++) {
        const w = document.createElement('div');
        w.className = 'worker';
        w.style.setProperty('--idx', i);
        w.style.setProperty('--tilt', workerTilt(rowIdx, i).toFixed(2) + 'deg');
        w.dataset.exposed = i < exposedCount ? '1' : '0';
        w.innerHTML = WORKER_SVG;
        track.appendChild(w);
      }

      const pct = document.createElement('div');
      pct.className = 'exposure-percent';
      pct.textContent = Math.round(d.exposure * 100) + '%';

      row.appendChild(label);
      row.appendChild(track);
      row.appendChild(pct);
      containerEl.appendChild(row);
    });
  }

  function setRowAnimated(row, exposure) {
    const exposedClass = bucket(exposure);
    row.querySelectorAll('.worker').forEach(w => {
      w.classList.remove('exposed-high', 'exposed-mid', 'exposed-low', 'human', 'fallen');
      if (w.dataset.exposed === '1') {
        w.classList.add('fallen', exposedClass);
      } else {
        w.classList.add('human');
      }
    });
    row.classList.add('is-revealed');
  }

  function setRowNeutral(row) {
    row.querySelectorAll('.worker').forEach(w => {
      w.classList.remove('exposed-high', 'exposed-mid', 'exposed-low', 'human', 'fallen');
    });
    row.classList.remove('is-revealed');
  }

  function update(stepIndex) {
    if (!containerEl || !data) return;
    const rows = containerEl.querySelectorAll('.exposure-row');

    rows.forEach((row, i) => {
      const d = data[i];
      if (stepIndex <= 0) {
        setRowNeutral(row);
      } else if (stepIndex === 1) {
        if (d.exposure >= 0.6) setRowAnimated(row, d.exposure);
        else                    setRowNeutral(row);
      } else {
        setRowAnimated(row, d.exposure);
      }
    });

    if (stepIndex >= 3) containerEl.classList.add('emphasize-human');
    else                 containerEl.classList.remove('emphasize-human');
  }

  return { setup, update };
})();
