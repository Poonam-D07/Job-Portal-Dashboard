export class AboutView {
  constructor(containerId, onNavigate = null) {
    this.container = document.getElementById(containerId);
    this.onNavigate = onNavigate;
  }

  init() {
    this.render();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <section class="page-intro">
        <h2 class="hero-title">About the Project</h2>
        <p class="hero-subtitle">Technical review of the Vanilla JavaScript Single-Page Application (SPA) dashboard architecture.</p>
      </section>

      <div class="grid-cols-12">
        <div class="glass-panel col-span-8" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <h3 class="panel-title" style="border-bottom: 1px solid var(--card-border); padding-bottom: 0.5rem;">Architectural Paradigm</h3>
          
          <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6;">
            This Job Portal Dashboard was designed as a production-grade showcase using <strong>zero external frameworks</strong> (no React, Angular, Vue, or Tailwind CSS). It serves as a proof of concept showing how modular UI architectures can be built efficiently using native browser API mechanisms.
          </p>

          <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">Design Highlights:</h4>
          <ul class="modal-bullets-list" style="margin-left: 0.5rem; gap: 0.75rem;">
            <li>
              <strong>Reactive state store (Observable pattern)</strong>: State changes in the centralized data warehouse (\`store.js\`) automatically publish alerts to active listening pages, updating metric indicators and recent application tables dynamically.
            </li>
            <li>
              <strong>Custom client-side Router</strong>: Parses changes in the browser window hash (\`#/dashboard\`, \`#/jobs\`) to load page controllers, update title descriptors, and cleanly detach observers to prevent visual memory leaks.
            </li>
            <li>
              <strong>Math-based dynamic SVG Charts</strong>: Standard area graphs built using plain coordinate calculations. Bypasses standard charting library package weights, maintaining lightning-fast loads.
            </li>
            <li>
              <strong>Offline-first persistence</strong>: Application submissions, theme selections, filters, bookmarks, and viewed histories serialize to browser \`localStorage\` dynamically.
            </li>
          </ul>
        </div>

        <div class="col-span-4 flex-col-gap" style="display: flex; flex-direction: column; gap: 1.5rem;">
          <!-- Specifications -->
          <div class="glass-panel">
            <h3 class="panel-title" style="margin-bottom: 1rem;">System Specs</h3>
            <ul style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.85rem; padding:0; margin:0; list-style:none;">
              <li class="flex-between" style="border-bottom: 1px solid var(--card-border); padding-bottom: 0.5rem;">
                <span style="color: var(--text-secondary); font-weight: 500;">Core Tech</span>
                <span style="color: var(--primary-light); font-weight: 600;">HTML5 / CSS3 / ES6</span>
              </li>
              <li class="flex-between" style="border-bottom: 1px solid var(--card-border); padding-bottom: 0.5rem;">
                <span style="color: var(--text-secondary); font-weight: 500;">Routing Mode</span>
                <span style="color: var(--text-primary); font-weight: 500;">Dynamic Hash Router</span>
              </li>
              <li class="flex-between" style="border-bottom: 1px solid var(--card-border); padding-bottom: 0.5rem;">
                <span style="color: var(--text-secondary); font-weight: 500;">State Engine</span>
                <span style="color: var(--text-primary); font-weight: 500;">Custom Reactive Store</span>
              </li>
              <li class="flex-between" style="border-bottom: 1px solid var(--card-border); padding-bottom: 0.5rem;">
                <span style="color: var(--text-secondary); font-weight: 500;">Asset Weights</span>
                <span style="color: var(--success-text); font-weight: 600;">&lt; 50 KB (Compressed)</span>
              </li>
              <li class="flex-between">
                <span style="color: var(--text-secondary); font-weight: 500;">Accessibility</span>
                <span style="color: var(--success-text); font-weight: 600;">WCAG A11y Ready</span>
              </li>
            </ul>
          </div>

          <!-- Development stats -->
          <div class="glass-panel flex-align-center" style="gap: 1rem; padding: 1.25rem;">
            <div style="background-color: var(--success-glow); padding: 0.5rem; border-radius: var(--radius-md); color: var(--success-text);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div>
              <h4 style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">Execution Speed</h4>
              <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.1rem;">Page loads in under 150ms.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
