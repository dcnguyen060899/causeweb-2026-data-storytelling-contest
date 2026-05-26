/* techTransitions.js — Act 4 historical precedent.
   The natural experiment: two ~10× cost-collapse shocks, a generation apart.
   Handloom weavers (muted ink) collapse and stay collapsed. Painters (accent)
   dip on the same shock, then recover into an authenticity premium. The
   divergence — same shock, different institutions, different ending — is the
   payoff, so it carries the accent.

   Reveal is step-driven (ENTER): step 1 draws the weaver collapse; step 2 draws
   the painter recovery and the divergence note. Draw-on uses stroke-dashoffset,
   matching wagePolarization.js. */

const TechTransitions = (() => {
  const margin = { top: 16, right: 104, bottom: 30, left: 40 };
  let g, x, y, width, height;

  /* Visual epistemics: the SOLID line is the documented series (weaver
     collapse, Bythell/Hobsbawm); the DASHED line is the illustrative one
     (painter recovery, author's synthesis). Legend states the convention so
     the illustrative curve never looks more measured than the documented one. */
  const series = [
    { key: 'weavers',  label: 'Handloom weavers', data: 'weavers',  stroke: COLORS.inkSoft, width: 1.75, dash: null  },
    { key: 'painters', label: 'Painters',         data: 'painters', stroke: COLORS.accent,  width: 2.5,  dash: '4 3' }
  ];

  function setup() {
    const svgEl = document.getElementById('tech-transitions-chart');
    if (!svgEl) return;

    const box = getSvgBox(svgEl, 320);
    width  = box.width  - margin.left - margin.right;
    height = box.height - margin.top  - margin.bottom;

    const svg = d3.select(svgEl)
      .attr('viewBox', `0 0 ${box.width} ${box.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    svg.selectAll('*').remove();

    g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    x = d3.scaleLinear().domain([1800, 1900]).range([0, width]);
    y = d3.scaleLinear().domain([0, 150]).range([height, 0]);

    g.append('g')
      .attr('class', 'gridlines')
      .selectAll('line')
      .data(y.ticks(4))
      .enter().append('line')
        .attr('class', 'gridline')
        .attr('x1', 0).attr('x2', width)
        .attr('y1', d => y(d)).attr('y2', d => y(d));

    g.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format('d')));

    g.append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(y).ticks(4));

    /* shared starting baseline */
    g.append('line')
      .attr('class', 'gridline')
      .attr('x1', 0).attr('x2', width)
      .attr('y1', y(100)).attr('y2', y(100))
      .attr('stroke', COLORS.inkFaint).attr('opacity', 0.7);
    g.append('text')
      .attr('class', 'axis-label')
      .attr('x', 4).attr('y', y(100) - 4)
      .attr('fill', COLORS.inkFaint)
      .text('each indexed to 100 at its start');
    g.append('text')
      .attr('class', 'axis-label')
      .attr('x', 4).attr('y', y(100) + 13)
      .attr('fill', COLORS.inkFaint)
      .style('font-family', "'Space Mono', monospace")
      .style('font-size', '9px')
      .text('dashed = illustrative · solid = documented');

    const lineGen = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.wage))
      .curve(d3.curveMonotoneX);

    series.forEach(s => {
      const seriesData = DATA_TECH_TRANSITIONS[s.data];
      const path = g.append('path')
        .datum(seriesData)
        .attr('class', 'line')
        .attr('data-key', s.key)
        .attr('stroke', s.stroke)
        .attr('stroke-width', s.width)
        .attr('fill', 'none')
        .attr('stroke-linecap', 'round')
        .attr('d', lineGen);

      const totalLen = path.node().getTotalLength();
      path
        .attr('stroke-dasharray', `${totalLen} ${totalLen}`)
        .attr('stroke-dashoffset', totalLen);

      const last = seriesData[seriesData.length - 1];
      g.append('text')
        .attr('class', 'line-label')
        .attr('data-label', s.key)
        .attr('x', x(last.year) + 6)
        .attr('y', y(last.wage) + 4)
        .attr('fill', s.stroke)
        .attr('opacity', 0)
        .style('font-family', "'Space Mono', monospace")
        .style('font-size', '10px')
        .text(s.label);
    });

    /* divergence note, hidden until step 2 */
    g.append('text')
      .attr('class', 'divergence-note')
      .attr('x', x(1882))
      .attr('y', y(70))
      .attr('text-anchor', 'middle')
      .attr('fill', COLORS.inkSoft)
      .attr('opacity', 0)
      .style('font-family', "'Space Mono', monospace")
      .style('font-size', '9.5px')
      .style('letter-spacing', '0.04em')
      .text('same shock — different institutions');
  }

  function update(stepIndex) {
    if (!g) return;

    const reveal = {
      weavers:  stepIndex >= 1,
      painters: stepIndex >= 2
    };

    series.forEach(s => {
      const path = g.select(`path[data-key="${s.key}"]`);
      if (path.empty()) return;
      const totalLen = path.node().getTotalLength();
      const visible = reveal[s.key];

      path.transition()
        .duration(1100).ease(easeOut)
        .attr('stroke-dashoffset', visible ? 0 : totalLen)
        .on('end', function () {
          if (visible && s.dash) d3.select(this).attr('stroke-dasharray', s.dash);
          else if (!visible) d3.select(this).attr('stroke-dasharray', `${totalLen} ${totalLen}`);
        });

      g.select(`text[data-label="${s.key}"]`)
        .transition().duration(600).delay(visible ? 700 : 0)
        .attr('opacity', visible ? 1 : 0);
    });

    g.select('.divergence-note')
      .transition().duration(600).delay(stepIndex >= 2 ? 500 : 0)
      .attr('opacity', stepIndex >= 2 ? 1 : 0);
  }

  return { setup, update };
})();
