/* spectrumViz.js — Act 7.
   Bubbles plotted from "fully automatable" (left) to "irreducibly human" (right).
   Color intensifies from ink-faint to accent as you move right — the design
   itself argues "as the spectrum approaches human-only, value concentrates."
*/

const SpectrumViz = (() => {
  const margin = { top: 30, right: 30, bottom: 60, left: 30 };
  let g, x, width, height;

  /* category → fill color (monotone intensification) */
  const categoryFill = {
    'automated':     COLORS.inkFaint,
    'at-risk':       COLORS.inkSoft,
    'hybrid':        COLORS.ink,
    'human-premium': COLORS.accent
  };

  function setup() {
    const svgEl = document.getElementById('spectrum-chart');
    if (!svgEl) return;
    const box = getSvgBox(svgEl, 320);
    width  = box.width  - margin.left - margin.right;
    height = box.height - margin.top  - margin.bottom;

    const svg = d3.select(svgEl)
      .attr('viewBox', `0 0 ${box.width} ${box.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    svg.selectAll('*').remove();

    g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    x = d3.scaleLinear().domain([0, 1]).range([0, width]);

    /* spectrum gradient — ink-faint to accent, no rainbow */
    const defs = svg.append('defs');
    const grad = defs.append('linearGradient').attr('id', 'spectrum-grad')
      .attr('x1', '0%').attr('x2', '100%');
    grad.append('stop').attr('offset', '0%').attr('stop-color', COLORS.inkFaint);
    grad.append('stop').attr('offset', '60%').attr('stop-color', COLORS.ink);
    grad.append('stop').attr('offset', '100%').attr('stop-color', COLORS.accent);

    const axisY = height * 0.6;

    g.append('rect')
      .attr('x', 0).attr('y', axisY - 1)
      .attr('width', width).attr('height', 2)
      .attr('fill', 'url(#spectrum-grad)')
      .attr('rx', 1);

    g.append('text')
      .attr('x', 0).attr('y', axisY + 32)
      .attr('text-anchor', 'start')
      .attr('fill', COLORS.inkFaint)
      .style('font-family', "'Space Mono', monospace")
      .style('font-size', '10px')
      .style('letter-spacing', '0.12em')
      .style('text-transform', 'uppercase')
      .text('← FULLY AUTOMATABLE');

    g.append('text')
      .attr('x', width).attr('y', axisY + 32)
      .attr('text-anchor', 'end')
      .attr('fill', COLORS.accent)
      .style('font-family', "'Space Mono', monospace")
      .style('font-size', '10px')
      .style('letter-spacing', '0.12em')
      .style('text-transform', 'uppercase')
      .text('IRREDUCIBLY HUMAN →');

    const seededOffsets = DATA_SPECTRUM.map((_, i) => ((i % 3) - 1) * 22);

    g.append('g')
      .attr('class', 'bubbles')
      .selectAll('g')
      .data(DATA_SPECTRUM, d => d.label)
      .enter().append('g')
        .attr('data-label', d => d.label)
        .attr('data-category', d => d.category)
        .attr('transform', (d, i) => `translate(${x(d.x)},${axisY + seededOffsets[i]})`)
        .each(function(d, i) {
          const sel = d3.select(this);
          const fill = categoryFill[d.category] || COLORS.inkSoft;
          sel.append('circle')
            .attr('class', 'bubble')
            .attr('r', 0)
            .attr('fill', fill)
            .attr('stroke', fill)
            .attr('fill-opacity', d.category === 'human-premium' ? 1 : 0.7)
            .attr('stroke-width', 1);
          sel.append('text')
            .attr('class', 'bubble-label')
            .attr('text-anchor', 'middle')
            .attr('y', seededOffsets[i] > 0 ? 28 : -16)
            .attr('opacity', 0)
            .attr('fill', COLORS.ink)
            .style('font-family', "'Space Mono', monospace")
            .style('font-size', '9.5px')
            .text(d.label);
        });

    g.node().__axisY = axisY;
  }

  function update(stepIndex) {
    if (!g) return;

    const visibleCategories = new Set();
    if (stepIndex >= 1) visibleCategories.add('automated');
    if (stepIndex >= 2) visibleCategories.add('at-risk');
    if (stepIndex >= 3) visibleCategories.add('hybrid');
    if (stepIndex >= 4) visibleCategories.add('human-premium');

    g.select('.bubbles').selectAll('g').each(function(d) {
      const visible = visibleCategories.has(d.category);
      const sel = d3.select(this);
      sel.select('circle')
        .transition().duration(700).ease(easeOut)
        .attr('r', visible ? 18 : 0);
      sel.select('text')
        .transition().duration(700).delay(visible ? 250 : 0)
        .attr('opacity', visible ? 1 : 0);
    });

    if (stepIndex >= 5) {
      g.select('.bubbles').selectAll('g')
        .filter(d => d.category === 'human-premium')
        .select('circle')
        .transition().duration(1400).ease(d3.easeSinInOut)
        .attr('r', 22)
        .transition().duration(1400)
        .attr('r', 18);
    }
  }

  return { setup, update };
})();
