/* wagePolarization.js — Act 3.
   Three lines, ink-only palette plus a single accent.
   The accent goes on middle-skill — the act's emotional pivot.
*/

const WagePolarization = (() => {
  const margin = { top: 14, right: 84, bottom: 32, left: 44 };
  let g, x, y, width, height;

  const series = [
    { key: 'high_skill',   label: 'High skill',   stroke: COLORS.ink,     width: 1.75, dasharray: null },
    { key: 'low_skill',    label: 'Low skill',    stroke: COLORS.inkSoft, width: 1.25, dasharray: '4 3' },
    { key: 'middle_skill', label: 'Middle skill', stroke: COLORS.accent,  width: 2.5,  dasharray: null }
  ];

  function setup() {
    const svgEl = document.getElementById('wage-polarization-chart');
    if (!svgEl) return;
    const box = getSvgBox(svgEl, 400);
    width  = box.width  - margin.left - margin.right;
    height = box.height - margin.top  - margin.bottom;

    const svg = d3.select(svgEl)
      .attr('viewBox', `0 0 ${box.width} ${box.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    svg.selectAll('*').remove();

    g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    x = d3.scaleLinear().domain(d3.extent(DATA_WAGE_POLARIZATION, d => d.year)).range([0, width]);
    y = d3.scaleLinear().domain([60, 200]).range([height, 0]);

    g.append('g')
      .attr('class', 'gridlines')
      .selectAll('line')
      .data(y.ticks(5))
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
      .call(d3.axisLeft(y).ticks(5));

    g.append('line')
      .attr('class', 'gridline')
      .attr('x1', 0).attr('x2', width)
      .attr('y1', y(100)).attr('y2', y(100))
      .attr('stroke', COLORS.inkFaint).attr('opacity', 0.7);
    g.append('text')
      .attr('class', 'axis-label')
      .attr('x', 4).attr('y', y(100) - 4)
      .attr('fill', COLORS.inkFaint)
      .text('1980 baseline');

    const lineGen = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    series.forEach(s => {
      const seriesData = DATA_WAGE_POLARIZATION.map(d => ({ year: d.year, value: d[s.key] }));
      const path = g.append('path')
        .datum(seriesData)
        .attr('class', 'line')
        .attr('data-key', s.key)
        .attr('stroke', s.stroke)
        .attr('stroke-width', s.width)
        .attr('fill', 'none')
        .attr('d', lineGen);
      if (s.dasharray) path.attr('stroke-dasharray', s.dasharray);

      const totalLen = path.node().getTotalLength();
      path
        .attr('stroke-dasharray', s.dasharray
          ? `${totalLen} ${totalLen}`
          : `${totalLen} ${totalLen}`)
        .attr('stroke-dashoffset', totalLen);

      const last = seriesData[seriesData.length - 1];
      g.append('text')
        .attr('class', 'line-label')
        .attr('data-label', s.key)
        .attr('x', x(last.year) + 6)
        .attr('y', y(last.value) + 4)
        .attr('fill', s.stroke)
        .attr('opacity', 0)
        .text(s.label);
    });
  }

  function update(stepIndex) {
    if (!g) return;
    const reveal = {
      high_skill:   stepIndex >= 1,
      low_skill:    stepIndex >= 2,
      middle_skill: stepIndex >= 3
    };

    series.forEach(s => {
      const path = g.select(`path[data-key="${s.key}"]`);
      if (path.empty()) return;
      const totalLen = path.node().getTotalLength();
      const visible = reveal[s.key];
      path.transition()
        .duration(1100).ease(easeOut)
        .attr('stroke-dashoffset', visible ? 0 : totalLen)
        .on('end', function() {
          if (visible && s.dasharray) d3.select(this).attr('stroke-dasharray', s.dasharray);
        });

      g.select(`text[data-label="${s.key}"]`)
        .transition().duration(700).delay(visible ? 600 : 0)
        .attr('opacity', visible ? 1 : 0);
    });
  }

  return { setup, update };
})();
