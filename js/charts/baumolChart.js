/* baumolChart.js — Act 4 supporting evidence.
   Diverging bars: cheaper sectors (negative) in muted ink, costlier sectors
   (positive) in accent. The accent direction is the argument's payoff: things
   only humans do get pricier. */

const BaumolChart = (() => {
  const margin = { top: 14, right: 50, bottom: 30, left: 110 };
  let g, x, y, width, height, data;

  function setup() {
    const svgEl = document.getElementById('baumol-chart');
    if (!svgEl) return;
    data = DATA_BAUMOL.slice().sort((a, b) => a.growth_pct - b.growth_pct);

    const box = getSvgBox(svgEl, 240);
    width  = box.width  - margin.left - margin.right;
    height = box.height - margin.top  - margin.bottom;

    const svg = d3.select(svgEl)
      .attr('viewBox', `0 0 ${box.width} ${box.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    svg.selectAll('*').remove();

    g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const maxAbs = d3.max(data, d => Math.abs(d.growth_pct));
    x = d3.scaleLinear().domain([-maxAbs, maxAbs]).range([0, width]);
    y = d3.scaleBand().domain(data.map(d => d.sector)).range([0, height]).padding(0.3);

    g.append('line')
      .attr('class', 'gridline')
      .attr('x1', x(0)).attr('x2', x(0))
      .attr('y1', 0).attr('y2', height)
      .attr('stroke', COLORS.inkFaint).attr('opacity', 0.8);

    g.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d => fmtPct(d)));

    g.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${x(0)},0)`)
      .call(d3.axisLeft(y).tickSize(0).tickPadding(8))
      .call(sel => {
        sel.select('.domain').remove();
        sel.selectAll('text')
          .style('font-family', "'Space Mono', monospace")
          .style('font-size', '10px')
          .style('text-transform', 'uppercase')
          .style('letter-spacing', '0.04em')
          .attr('text-anchor', d => {
            const v = data.find(r => r.sector === d).growth_pct;
            return v >= 0 ? 'end' : 'start';
          })
          .attr('x', d => {
            const v = data.find(r => r.sector === d).growth_pct;
            return v >= 0 ? -8 : 8;
          });
      });

    g.append('g')
      .attr('class', 'bars')
      .selectAll('rect')
      .data(data, d => d.sector)
      .enter().append('rect')
        .attr('class', 'bar')
        .attr('y', d => y(d.sector))
        .attr('height', y.bandwidth())
        .attr('x', x(0))
        .attr('width', 0)
        .attr('fill', d => d.growth_pct >= 0 ? COLORS.accent : COLORS.inkFaint)
        .attr('opacity', 0);

    g.append('g')
      .attr('class', 'bar-labels')
      .selectAll('text')
      .data(data, d => d.sector)
      .enter().append('text')
        .attr('class', 'bar-label')
        .attr('y', d => y(d.sector) + y.bandwidth() / 2 + 4)
        .attr('x', x(0))
        .attr('opacity', 0)
        .attr('text-anchor', d => d.growth_pct >= 0 ? 'start' : 'end')
        .attr('fill', d => d.growth_pct >= 0 ? COLORS.accent : COLORS.inkSoft)
        .text(d => fmtPct(d.growth_pct));
  }

  function update(stepIndex) {
    if (!g) return;
    let visible;
    if (stepIndex <= 0)      visible = () => false;
    else if (stepIndex === 1) visible = d => d.growth_pct <  0;
    else                      visible = () => true;

    g.select('.bars').selectAll('rect')
      .transition().duration(700).ease(easeOut)
      .attr('x', d => visible(d) ? (d.growth_pct >= 0 ? x(0) : x(d.growth_pct)) : x(0))
      .attr('width', d => visible(d) ? Math.abs(x(d.growth_pct) - x(0)) : 0)
      .attr('opacity', d => visible(d) ? 1 : 0);

    g.select('.bar-labels').selectAll('text')
      .transition().duration(700).delay(150).ease(easeOut)
      .attr('opacity', d => visible(d) ? 1 : 0)
      .attr('x', d => {
        if (!visible(d)) return x(0);
        return d.growth_pct >= 0 ? x(d.growth_pct) + 4 : x(d.growth_pct) - 4;
      });
  }

  return { setup, update };
})();
