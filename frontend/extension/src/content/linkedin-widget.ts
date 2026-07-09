import { extractLinkedIn } from './extractors/linkedin';

interface JobData {
  sourceUrl: string;
  companyName: string;
  companyLogoUrl?: string;
  companyUrl?: string;
  jobTitle: string;
  jobDescription?: string;
  jobLocation?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  jobType?: string;
  keywords?: string[];
  seniority?: string;
  industry?: string;
  jobFunction?: string;
  postedTime?: string;
  applicantCount?: number;
}

const STYLES = `
* { box-sizing: border-box; margin: 0; padding: 0; }
:host { all: initial; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; }

#co-btn {
  position: fixed;
  right: 16px;
  bottom: 80px;
  z-index: 999999;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  box-shadow: 0 4px 16px rgba(99,102,241,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
  color: #fff;
}
#co-btn:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(99,102,241,0.5); }
#co-btn svg { width: 22px; height: 22px; }

#co-overlay {
  position: fixed;
  inset: 0;
  z-index: 999997;
  background: rgba(0,0,0,0.4);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s, visibility 0.25s;
  backdrop-filter: blur(2px);
}
#co-overlay.open { opacity: 1; visibility: visible; }

#co-panel {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 999998;
  width: 400px;
  height: 100vh;
  background: #0f1117;
  border-left: 1px solid rgba(255,255,255,0.06);
  box-shadow: -8px 0 32px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  color: #e2e8f0;
  font-size: 14px;
  line-height: 1.5;
}
#co-panel.open { transform: translateX(0); }

#co-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
#co-logo {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}
#co-title { font-size: 15px; font-weight: 600; flex: 1; }
#co-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: background 0.15s;
}
#co-close:hover { background: rgba(255,255,255,0.08); color: #fff; }

#co-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
#co-body::-webkit-scrollbar { width: 4px; }
#co-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

#co-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #64748b;
  text-align: center;
  gap: 8px;
}
#co-empty svg { width: 40px; height: 40px; opacity: 0.3; }

.co-company-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.co-company-avatar {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #1e293b, #334155);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: #e2e8f0;
  flex-shrink: 0;
  overflow: hidden;
}
.co-company-avatar img { width: 100%; height: 100%; object-fit: cover; }
.co-company-name {
  font-size: 15px;
  font-weight: 600;
  color: #f1f5f9;
  text-decoration: none;
}
.co-company-name:hover { color: #818cf8; }

.co-job-title {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 14px;
  color: #f1f5f9;
}

.co-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}
.co-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(99,102,241,0.1);
  color: #a5b4fc;
  border: 1px solid rgba(99,102,241,0.15);
}
.co-badge--secondary {
  background: rgba(255,255,255,0.04);
  color: #94a3b8;
  border-color: rgba(255,255,255,0.06);
}
.co-badge--green {
  background: rgba(34,197,94,0.1);
  color: #4ade80;
  border-color: rgba(34,197,94,0.15);
}
.co-badge--amber {
  background: rgba(251,191,36,0.1);
  color: #fbbf24;
  border-color: rgba(251,191,36,0.15);
}

.co-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
}
.co-meta-item {
  background: rgba(255,255,255,0.03);
  border-radius: 8px;
  padding: 10px 12px;
}
.co-meta-label {
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}
.co-meta-value {
  font-size: 13px;
  font-weight: 500;
  color: #e2e8f0;
}

.co-section-label {
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  margin-top: 4px;
}

.co-desc-box {
  background: rgba(255,255,255,0.03);
  border-radius: 8px;
  padding: 12px;
  max-height: 200px;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.6;
  color: #94a3b8;
  white-space: pre-wrap;
  word-break: break-word;
}
.co-desc-box::-webkit-scrollbar { width: 3px; }
.co-desc-box::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

#co-footer {
  padding: 12px 20px;
  border-top: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}

.co-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.2);
  border-top-color: #fff;
  border-radius: 50%;
  animation: co-spin 0.6s linear infinite;
  margin: 40px auto;
}
@keyframes co-spin { to { transform: rotate(360deg); } }
`;

export class LinkedInWidget {
  private host: HTMLDivElement;
  private root: ShadowRoot;
  private button: HTMLButtonElement;
  private overlay: HTMLDivElement;
  private panel: HTMLDivElement;
  private bodyEl: HTMLDivElement;
  private currentJobId: string | null = null;
  private watchTimer: number | null = null;
  private visible = false;

  constructor() {
    this.host = document.createElement('div');
    this.host.id = 'careeros-linkedin-widget';
    this.root = this.host.attachShadow({ mode: 'closed' });
    this.root.innerHTML = `<style>${STYLES}</style>`;

    this.button = this.createButton();
    this.overlay = this.createOverlay();
    this.panel = this.createPanel();
    this.bodyEl = this.panel.querySelector('#co-body')!;

    this.root.appendChild(this.button);
    this.root.appendChild(this.overlay);
    this.root.appendChild(this.panel);
    document.documentElement.appendChild(this.host);

    this.startWatching();
  }

  private createButton(): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.id = 'co-btn';
    btn.title = 'CareerOS';
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`;
    btn.addEventListener('click', () => this.toggle());
    return btn;
  }

  private createOverlay(): HTMLDivElement {
    const el = document.createElement('div');
    el.id = 'co-overlay';
    el.addEventListener('click', () => this.hide());
    return el;
  }

  private createPanel(): HTMLDivElement {
    const el = document.createElement('div');
    el.id = 'co-panel';
    el.innerHTML = `
      <div id="co-header">
        <div id="co-logo">C</div>
        <div id="co-title">CareerOS</div>
        <button id="co-close">&times;</button>
      </div>
      <div id="co-body">
        <div id="co-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <div>No job detected</div>
          <div style="font-size:12px;max-width:220px">Select a job on LinkedIn to see details here.</div>
        </div>
      </div>
      <div id="co-footer">
        <div style="font-size:11px;color:#64748b;text-align:center">Click the CareerOS extension icon to save</div>
      </div>
    `;
    el.querySelector('#co-close')!.addEventListener('click', () => this.hide());
    return el;
  }

  private getJobId(): string | null {
    const m = window.location.href.match(/currentJobId=(\d+)/);
    return m ? m[1] : null;
  }

  private startWatching(): void {
    this.watchTimer = window.setInterval(async () => {
      const jobId = this.getJobId();
      if (jobId && jobId !== this.currentJobId) {
        this.currentJobId = jobId;
        this.bodyEl.innerHTML = '<div class="co-spinner"></div>';
        try {
          const data = await extractLinkedIn();
          this.render(data);
          if (data) this.show();
        } catch {
          this.bodyEl.innerHTML = `<div id="co-empty"><div style="color:#ef4444">Extraction failed</div></div>`;
        }
      }
    }, 1200);
  }

  private render(data: JobData | null): void {
    if (!data) {
      this.bodyEl.innerHTML = `
        <div id="co-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <div>No job detected</div>
        </div>`;
      return;
    }
    const initial = data.companyName.charAt(0).toUpperCase();
    const logoHtml = data.companyLogoUrl
      ? `<img src="${data.companyLogoUrl}" alt="${data.companyName}" />`
      : initial;

    const badges: string[] = [];
    if (data.jobLocation) badges.push(this.badgeHtml('📍', data.jobLocation));
    if (data.jobType) badges.push(this.badgeHtml('💼', data.jobType));
    if (data.seniority) badges.push(this.badgeHtml('📊', data.seniority, '--secondary'));
    if (data.postedTime) badges.push(this.badgeHtml('🕐', data.postedTime, '--amber'));
    if (data.applicantCount) badges.push(this.badgeHtml('👥', `${data.applicantCount} applicants`, '--green'));

    let salaryHtml = '';
    if (data.salaryMin || data.salaryMax) {
      const curr = data.salaryCurrency || '';
      const min = data.salaryMin ? `${curr}${data.salaryMin.toLocaleString()}` : '';
      const max = data.salaryMax ? `${curr}${data.salaryMax.toLocaleString()}` : '';
      if (min || max) salaryHtml = `<div class="co-meta-item"><div class="co-meta-label">Salary</div><div class="co-meta-value">${min}${min && max ? ' — ' : ''}${max}</div></div>`;
    }

    let metaRight = '';
    if (data.industry) metaRight += `<div class="co-meta-item"><div class="co-meta-label">Industry</div><div class="co-meta-value">${data.industry}</div></div>`;
    if (data.jobFunction) metaRight += `<div class="co-meta-item"><div class="co-meta-label">Function</div><div class="co-meta-value">${data.jobFunction}</div></div>`;

    let descHtml = '';
    if (data.jobDescription) {
      descHtml = `
        <div class="co-section-label">Description</div>
        <div class="co-desc-box">${this.escapeHtml(data.jobDescription)}</div>
      `;
    }

    this.bodyEl.innerHTML = `
      <div class="co-company-row">
        <div class="co-company-avatar">${logoHtml}</div>
        <a class="co-company-name" href="${data.companyUrl || '#'}" target="_blank" rel="noopener">${this.escapeHtml(data.companyName)}</a>
      </div>
      <div class="co-job-title">${this.escapeHtml(data.jobTitle)}</div>
      ${badges.length ? `<div class="co-badges">${badges.join('')}</div>` : ''}
      ${(salaryHtml || metaRight) ? `<div class="co-meta-grid">${salaryHtml}${metaRight}</div>` : ''}
      ${descHtml}
    `;
  }

  private badgeHtml(icon: string, text: string, variant = ''): string {
    return `<span class="co-badge co-badge${variant}">${icon} ${this.escapeHtml(text)}</span>`;
  }

  private escapeHtml(s: string): string {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  private toggle(): void {
    this.visible ? this.hide() : this.show();
  }

  private show(): void {
    this.visible = true;
    this.overlay.classList.add('open');
    this.panel.classList.add('open');
  }

  private hide(): void {
    this.visible = false;
    this.overlay.classList.remove('open');
    this.panel.classList.remove('open');
  }

  destroy(): void {
    if (this.watchTimer) clearInterval(this.watchTimer);
    this.host.remove();
  }
}
