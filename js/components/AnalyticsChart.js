import { mockApplicationTrend } from '../utils/mockData.js';

export class AnalyticsChart {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.data = mockApplicationTrend;
  }

  init() {
    this.render();
    this.setupTooltips();
  }

  render() {
    if (!this.container) return;

    // Calculate dimensions
    const width = 500;
    const height = 180;
    const padding = { top: 20, right: 20, bottom: 30, left: 35 };

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Find max value in dataset to scale Y axis
    const maxVal = Math.max(...this.data.map(d => Math.max(d.applied, d.interviews)), 15);
    const yMax = Math.ceil(maxVal / 5) * 5; // round up to multiple of 5

    // Map data to SVG coordinates
    const pointsApplied = this.data.map((d, index) => {
      const x = padding.left + (index / (this.data.length - 1)) * chartWidth;
      const y = padding.top + chartHeight - (d.applied / yMax) * chartHeight;
      return { x, y, val: d.applied, month: d.month };
    });

    const pointsInterviews = this.data.map((d, index) => {
      const x = padding.left + (index / (this.data.length - 1)) * chartWidth;
      const y = padding.top + chartHeight - (d.interviews / yMax) * chartHeight;
      return { x, y, val: d.interviews, month: d.month };
    });

    // Create SVG paths
    const buildPath = (points) => {
      if (points.length === 0) return '';
      return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    };

    const buildAreaPath = (points) => {
      if (points.length === 0) return '';
      const first = points[0];
      const last = points[points.length - 1];
      const linePath = buildPath(points);
      return `${linePath} L ${last.x} ${padding.top + chartHeight} L ${first.x} ${padding.top + chartHeight} Z`;
    };

    const pathApplied = buildPath(pointsApplied);
    const areaApplied = buildAreaPath(pointsApplied);

    const pathInterviews = buildPath(pointsInterviews);
    const areaInterviews = buildAreaPath(pointsInterviews);

    // Build Grid lines
    let gridLinesHTML = '';
    const ticksCount = 4;
    for (let i = 0; i <= ticksCount; i++) {
      const yVal = (yMax / ticksCount) * i;
      const y = padding.top + chartHeight - (yVal / yMax) * chartHeight;
      gridLinesHTML += `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="var(--card-border)" stroke-dasharray="4 4" stroke-width="1" />
        <text x="${padding.left - 10}" y="${y + 4}" fill="var(--text-secondary)" font-size="10" font-weight="500" text-anchor="end">${yVal}</text>
      `;
    }

    // Build X Axis labels
    let xAxisHTML = '';
    this.data.forEach((d, index) => {
      const x = padding.left + (index / (this.data.length - 1)) * chartWidth;
      xAxisHTML += `
        <text x="${x}" y="${height - 5}" fill="var(--text-secondary)" font-size="10" font-weight="500" text-anchor="middle">${d.month}</text>
      `;
    });

    // Render component HTML
    this.container.innerHTML = `
      <div class="chart-wrapper-inner">
        <div class="chart-header flex-between">
          <div class="chart-info">
            <h3 class="chart-title">Application Funnel</h3>
            <p class="chart-subtitle">Monthly job applications vs interviews</p>
          </div>
          <div class="chart-legends">
            <div class="legend-item">
              <span class="legend-dot legend-applied"></span>
              <span class="legend-label">Applied</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot legend-interviews"></span>
              <span class="legend-label">Interviews</span>
            </div>
          </div>
        </div>

        <div class="svg-container">
          <svg viewBox="0 0 ${width} ${height}" class="chart-svg" width="100%" height="100%">
            <defs>
              <!-- Applied Gradient -->
              <linearGradient id="appliedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="var(--primary)" stop-opacity="0.0"/>
              </linearGradient>
              <!-- Interviews Gradient -->
              <linearGradient id="interviewGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--success)" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="var(--success)" stop-opacity="0.0"/>
              </linearGradient>
            </defs>

            <!-- Grid Lines -->
            ${gridLinesHTML}

            <!-- X Labels -->
            ${xAxisHTML}

            <!-- Areas -->
            <path d="${areaApplied}" fill="url(#appliedGrad)" class="chart-area" />
            <path d="${areaInterviews}" fill="url(#interviewGrad)" class="chart-area" />

            <!-- Lines -->
            <path d="${pathApplied}" fill="none" stroke="var(--primary)" stroke-width="3" stroke-linecap="round" class="chart-line" />
            <path d="${pathInterviews}" fill="none" stroke="var(--success)" stroke-width="3" stroke-linecap="round" class="chart-line" />

            <!-- Applied Nodes -->
            ${pointsApplied.map(p => `
              <circle cx="${p.x}" cy="${p.y}" r="5" fill="var(--bg-secondary)" stroke="var(--primary)" stroke-width="2.5" class="chart-node" data-val="${p.val}" data-month="${p.month}" data-type="Applied" />
            `).join('')}

            <!-- Interviews Nodes -->
            ${pointsInterviews.map(p => `
              <circle cx="${p.x}" cy="${p.y}" r="5" fill="var(--bg-secondary)" stroke="var(--success)" stroke-width="2.5" class="chart-node" data-val="${p.val}" data-month="${p.month}" data-type="Interview" />
            `).join('')}
          </svg>
          <div class="chart-tooltip" id="chartTooltip"></div>
        </div>
      </div>
    `;
  }

  setupTooltips() {
    const tooltip = this.container.querySelector('#chartTooltip');
    const nodes = this.container.querySelectorAll('.chart-node');
    
    nodes.forEach(node => {
      node.addEventListener('mouseenter', (e) => {
        const val = node.dataset.val;
        const month = node.dataset.month;
        const type = node.dataset.type;
        
        node.setAttribute('r', '7');
        node.style.cursor = 'pointer';

        // Calculate positioning inside parent container
        const containerRect = this.container.getBoundingClientRect();
        const nodeRect = e.target.getBoundingClientRect();
        
        const left = nodeRect.left - containerRect.left + (nodeRect.width / 2);
        const top = nodeRect.top - containerRect.top - 45;

        tooltip.innerHTML = `
          <span class="tooltip-title">${month}</span>
          <span class="tooltip-desc">${type}: <strong>${val}</strong></span>
        `;
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.classList.add('visible');
      });

      node.addEventListener('mouseleave', () => {
        node.setAttribute('r', '5');
        tooltip.classList.remove('visible');
      });
    });
  }
}
