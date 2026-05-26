/* jordanTriangle.js — Act 6.
   Three nodes drawn in equal ink — Jordan's point is that all three lenses
   matter equally. Accent appears only on the active-node halo pulse and on
   the "bad outcomes" endpoint of the small flowchart. */

const JordanTriangle = (() => {
  let svg, nodes;
  const nodeData = [
    { id: 'comp', title: 'COMPUTING',  sub: 'Algorithms and scale',         cx: 0.50, cy: 0.16 },
    { id: 'inf',  title: 'INFERENCE',  sub: 'Statistics and uncertainty',   cx: 0.16, cy: 0.66 },
    { id: 'econ', title: 'ECONOMICS',  sub: 'Incentives and mechanism',     cx: 0.84, cy: 0.66 }
  ];

  function setup() {
    const svgEl = document.getElementById('jordan-triangle');
    if (!svgEl) return;
    const box = getSvgBox(svgEl, 420);
    const W = box.width;
    const H = box.height;

    svg = d3.select(svgEl)
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    svg.selectAll('*').remove();

    /* edges */
    const edges = svg.append('g').attr('class', 'edges');
    const pairs = [
      [nodeData[0], nodeData[1]],
      [nodeData[1], nodeData[2]],
      [nodeData[2], nodeData[0]]
    ];
    pairs.forEach((p, i) => {
      edges.append('line')
        .attr('class', 'triangle-edge')
        .attr('data-edge', i)
        .attr('stroke', COLORS.inkFaint)
        .attr('stroke-width', 1)
        .attr('x1', p[0].cx * W).attr('y1', p[0].cy * H)
        .attr('x2', p[0].cx * W).attr('y2', p[0].cy * H);
    });

    /* nodes */
    nodes = svg.append('g').attr('class', 'nodes');
    nodeData.forEach(n => {
      const cx = n.cx * W, cy = n.cy * H;
      const grp = nodes.append('g').attr('data-node', n.id).attr('opacity', 0.18);

      grp.append('circle')
        .attr('class', 'triangle-node-fill')
        .attr('cx', cx).attr('cy', cy).attr('r', 26)
        .attr('fill', COLORS.paper)
        .attr('stroke', COLORS.ink)
        .attr('stroke-width', 1);

      grp.append('circle')
        .attr('class', 'triangle-node-halo')
        .attr('cx', cx).attr('cy', cy).attr('r', 26)
        .attr('fill', 'none')
        .attr('stroke', COLORS.accent)
        .attr('stroke-opacity', 0)
        .attr('stroke-width', 1);

      const isTop = n.cy < 0.5;
      const labelY = isTop ? cy - 42 : cy + 50;
      grp.append('text')
        .attr('x', cx).attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('fill', COLORS.ink)
        .style('font-family', "'Space Mono', monospace")
        .style('font-size', '11px')
        .style('letter-spacing', '0.18em')
        .text(n.title);
      grp.append('text')
        .attr('x', cx).attr('y', labelY + 16)
        .attr('text-anchor', 'middle')
        .attr('fill', COLORS.inkSoft)
        .style('font-family', "'Newsreader', Georgia, serif")
        .style('font-style', 'italic')
        .style('font-size', '11px')
        .text(n.sub);
    });

    svg.node().__pairs = pairs.map(p => [p[0].cx * W, p[0].cy * H, p[1].cx * W, p[1].cy * H]);

    /* Step-6 annotation: a short note pinned under the ECONOMICS node
       arguing the dials aren't passively unknown — they're being moved.
       Initially hidden; opacity is driven by update(stepIndex). */
    const econN  = nodeData[2];
    const econX  = econN.cx * W;
    const econY  = econN.cy * H;
    const annoTop = econY + 70;   /* just below the existing econ sub-label */

    const annotation = svg.append('g')
      .attr('class', 'econ-annotation')
      .attr('opacity', 0);

    /* vertical hairline connecting the econ node down to the note */
    annotation.append('line')
      .attr('x1', econX).attr('y1', annoTop)
      .attr('x2', econX).attr('y2', annoTop + 16)
      .attr('stroke', COLORS.accent)
      .attr('stroke-width', 1);

    /* small arrowhead at the bottom of the connector */
    annotation.append('path')
      .attr('d', `M ${econX - 3} ${annoTop + 16} L ${econX + 3} ${annoTop + 16} L ${econX} ${annoTop + 21} Z`)
      .attr('fill', COLORS.accent);

    annotation.append('text')
      .attr('x', econX).attr('y', annoTop + 38)
      .attr('text-anchor', 'middle')
      .attr('fill', COLORS.accent)
      .style('font-family', "'Space Mono', monospace")
      .style('font-size', '10px')
      .style('letter-spacing', '0.16em')
      .style('text-transform', 'uppercase')
      .text('Who moves the dials?');

    annotation.append('text')
      .attr('x', econX).attr('y', annoTop + 55)
      .attr('text-anchor', 'middle')
      .attr('fill', COLORS.inkSoft)
      .style('font-family', "'Newsreader', Georgia, serif")
      .style('font-style', 'italic')
      .style('font-size', '11px')
      .text('Platforms, firms, policy — not technology.');
  }

  function update(stepIndex) {
    if (!svg) return;
    const pairs = svg.node().__pairs;

    svg.selectAll('line[data-edge]').each(function(_, i) {
      const target = stepIndex >= 1 ? pairs[i] : [pairs[i][0], pairs[i][1], pairs[i][0], pairs[i][1]];
      d3.select(this)
        .transition().duration(900).ease(easeOut)
        .attr('x2', target[2]).attr('y2', target[3]);
    });

    const reveal = { comp: stepIndex >= 1, inf: stepIndex >= 2, econ: stepIndex >= 3 };
    Object.entries(reveal).forEach(([id, on]) => {
      svg.select(`g[data-node="${id}"]`)
        .transition().duration(700)
        .attr('opacity', on ? 1 : 0.15);
    });

    /* halo pulse on the just-revealed node */
    svg.selectAll('.triangle-node-halo').each(function() {
      const id = this.parentNode.dataset.node;
      if (!reveal[id]) return;
      d3.select(this)
        .interrupt()
        .attr('r', 26).attr('stroke-opacity', 0.6)
        .transition().duration(1400).ease(d3.easeSinInOut)
        .attr('r', 40).attr('stroke-opacity', 0);
    });

    /* Step 5: the "who moves the dials" note appears below the ECONOMICS
       node, and the econ halo gets one larger vermilion pulse to draw the
       eye to the contested-dial point. */
    const annotation = svg.select('.econ-annotation');
    if (!annotation.empty()) {
      annotation.transition().duration(700)
        .attr('opacity', stepIndex >= 5 ? 1 : 0);
    }
    if (stepIndex === 5) {
      svg.select('g[data-node="econ"] .triangle-node-halo')
        .interrupt()
        .attr('r', 26).attr('stroke-opacity', 0.85).attr('stroke', COLORS.accent)
        .transition().duration(1600).ease(d3.easeSinInOut)
        .attr('r', 56).attr('stroke-opacity', 0);
    }

    /* Step 6: contestation evidence — the counter-arrows beat. The block
       is in the scroll-text column (inline with the prose, not in the
       sticky chart-frame). Reveal it, then count both numbers up from 0
       to their target values in ~900ms with cubic ease-out. */
    const evidence = document.getElementById('contestation-evidence');
    if (evidence) {
      const showEvidence = stepIndex >= 6;
      evidence.classList.toggle('is-visible', showEvidence);
      if (showEvidence && !evidence.dataset.counted) {
        evidence.dataset.counted = '1';
        evidence.querySelectorAll('.contestation-number').forEach(el => {
          const target = parseInt(el.dataset.target || '0', 10);
          const dur = 900;
          const start = performance.now();
          function tick(now) {
            const t = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(target * eased) + '%';
            if (t < 1) requestAnimationFrame(tick);
            else el.textContent = target + '%';
          }
          requestAnimationFrame(tick);
        });
      } else if (!showEvidence) {
        /* Reset for re-reveal if the reader scrolls back up and down. */
        evidence.dataset.counted = '';
        evidence.querySelectorAll('.contestation-number').forEach(el => {
          el.textContent = '0%';
        });
      }
    }
  }

  return { setup, update };
})();
