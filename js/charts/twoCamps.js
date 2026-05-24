/* twoCamps.js — Act 1.
   Two ink-and-accent stories, distinguished by line weight, not stoplight color.
   Doom = thinner muted ink. Utopia = heavier ink. Accent only on the VS divider. */

const TwoCamps = (() => {
  const margin = { top: 56, right: 12, bottom: 32, left: 12 };
  let svg, doomPath, utopiaPath, doomLen, utopiaLen, dividerEl;

  function smoothNoise(i, amplitude, freq) {
    return amplitude * Math.sin(i * freq);
  }

  function buildPanel(parent, panelX, panelW, panelH, opts) {
    const { titleColor, titleText, subText, dataFn, stroke, strokeWidth } = opts;
    const g = parent.append('g').attr('transform', `translate(${panelX},0)`);

    g.append('text')
      .attr('x', panelW / 2).attr('y', 22)
      .attr('text-anchor', 'middle')
      .attr('fill', titleColor)
      .style('font-family', "'Space Mono', monospace")
      .style('font-weight', '400')
      .style('font-size', '10.5px')
      .style('letter-spacing', '0.22em')
      .style('text-transform', 'uppercase')
      .text(titleText);

    g.append('text')
      .attr('x', panelW / 2).attr('y', 40)
      .attr('text-anchor', 'middle')
      .attr('fill', COLORS.inkSoft)
      .style('font-family', "'Newsreader', Georgia, serif")
      .style('font-style', 'italic')
      .style('font-size', '11px')
      .text(subText);

    const chartTop = 60;
    const chartH = panelH - chartTop - 26;
    const x = d3.scaleLinear().domain([0, 1]).range([14, panelW - 14]);
    const y = d3.scaleLinear().domain([0, 100]).range([chartTop + chartH, chartTop + 6]);

    g.append('line')
      .attr('x1', 14).attr('y1', chartTop + chartH)
      .attr('x2', panelW - 14).attr('y2', chartTop + chartH)
      .attr('stroke', COLORS.inkFaint);

    g.append('text')
      .attr('x', 14).attr('y', chartTop + chartH + 18)
      .attr('text-anchor', 'start')
      .attr('fill', COLORS.inkFaint)
      .style('font-family', "'Space Mono', monospace")
      .style('font-size', '9px')
      .text('NOW');
    g.append('text')
      .attr('x', panelW - 14).attr('y', chartTop + chartH + 18)
      .attr('text-anchor', 'end')
      .attr('fill', COLORS.inkFaint)
      .style('font-family', "'Space Mono', monospace")
      .style('font-size', '9px')
      .text('FUTURE');

    const N = 40;
    const data = d3.range(N + 1).map(i => ({ t: i / N, w: dataFn(i / N, i) }));
    const line = d3.line()
      .x(d => x(d.t))
      .y(d => y(d.w))
      .curve(d3.curveMonotoneX);

    const path = g.append('path')
      .datum(data)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', stroke)
      .attr('stroke-width', strokeWidth)
      .attr('stroke-linecap', 'round');

    return path;
  }

  function setup() {
    const el = document.getElementById('two-camps-chart');
    if (!el) return;
    const box = getSvgBox(el, 360);
    const W = box.width;
    const H = box.height;

    svg = d3.select(el)
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    svg.selectAll('*').remove();

    const panelW = (W - 20) / 2;

    /* DOOM panel — muted, thinner */
    doomPath = buildPanel(svg, 0, panelW, H, {
      titleColor: COLORS.ink,
      titleText: 'THE DOOM STORY',
      subText: 'Machines replace workers. Wages fall.',
      dataFn: (t, i) => 80 - 55 * t + smoothNoise(i, 2.5, 0.7) * (1 - t * 0.6),
      stroke: COLORS.inkSoft,
      strokeWidth: 1.5
    });
    doomLen = doomPath.node().getTotalLength();
    doomPath
      .attr('stroke-dasharray', `${doomLen} ${doomLen}`)
      .attr('stroke-dashoffset', doomLen);

    /* central divider — vermilion (the only color here) */
    dividerEl = svg.append('g').attr('opacity', 0.5);
    const divX = panelW + 10;
    dividerEl.append('line')
      .attr('x1', divX).attr('y1', 14)
      .attr('x2', divX).attr('y2', H - 14)
      .attr('stroke', COLORS.accent)
      .attr('stroke-width', 1);
    dividerEl.append('rect')
      .attr('x', divX - 12).attr('y', H / 2 - 11)
      .attr('width', 24).attr('height', 22)
      .attr('fill', COLORS.paper);
    dividerEl.append('text')
      .attr('x', divX).attr('y', H / 2 + 4)
      .attr('text-anchor', 'middle')
      .attr('fill', COLORS.accent)
      .style('font-family', "'Space Mono', monospace")
      .style('font-size', '10px')
      .style('font-weight', '400')
      .style('letter-spacing', '0.18em')
      .text('VS');

    /* UTOPIA panel — heavier ink */
    utopiaPath = buildPanel(svg, panelW + 20, panelW, H, {
      titleColor: COLORS.ink,
      titleText: 'THE UTOPIA STORY',
      subText: 'AI frees us. Human work becomes precious.',
      dataFn: (t, i) => 20 + 65 * t + smoothNoise(i, 2.5, 0.7) * (1 - (1 - t) * 0.6),
      stroke: COLORS.ink,
      strokeWidth: 2.25
    });
    utopiaLen = utopiaPath.node().getTotalLength();
    utopiaPath
      .attr('stroke-dasharray', `${utopiaLen} ${utopiaLen}`)
      .attr('stroke-dashoffset', utopiaLen);
  }

  function update(stepIndex) {
    if (!doomPath || !utopiaPath) return;
    const showDoom   = stepIndex >= 0;
    const showUtopia = stepIndex >= 1;
    const emphasizeDivider = stepIndex >= 2;

    doomPath.transition()
      .duration(1100).ease(easeOut)
      .attr('stroke-dashoffset', showDoom ? 0 : doomLen);

    utopiaPath.transition()
      .duration(1100).ease(easeOut)
      .delay(showUtopia ? 200 : 0)
      .attr('stroke-dashoffset', showUtopia ? 0 : utopiaLen);

    if (dividerEl) {
      dividerEl.transition()
        .duration(500)
        .attr('opacity', emphasizeDivider ? 1 : 0.4);
    }
  }

  return { setup, update };
})();
