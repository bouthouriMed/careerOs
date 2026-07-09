import { extractLinkedIn } from './extractors/linkedin';

interface JobData {
  sourceUrl: string;
  companyName: string;
  companyLogoUrl?: string;
  companyUrl?: string;
  jobTitle: string;
  jobDescription?: string;
  jobDescriptionHtml?: string;
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
  width: 44px;
  height: 44px;
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
#co-btn:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(99,102,241,0.55); }
#co-btn svg { width: 20px; height: 20px; }

#co-card {
  position: fixed;
  right: 72px;
  bottom: 80px;
  z-index: 999998;
  width: 400px;
  max-height: min(600px, 90vh);
  background: #0f1117;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.6);
  display: none;
  flex-direction: column;
  color: #e2e8f0;
  font-size: 13px;
  line-height: 1.5;
  overflow: hidden;
}
#co-card.open { display: flex; }

#co-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
#co-logo-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}
#co-header-title { font-size: 14px; font-weight: 600; flex: 1; color: #f1f5f9; }
#co-close {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: background 0.15s;
}
#co-close:hover { background: rgba(255,255,255,0.08); color: #fff; }

#co-body {
  overflow-y: auto;
  padding: 14px 16px;
  flex: 1;
}
#co-body::-webkit-scrollbar { width: 4px; }
#co-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

#co-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #64748b;
  text-align: center;
  gap: 8px;
}
#co-empty svg { width: 36px; height: 36px; opacity: 0.25; }

.co-company-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.co-company-avatar {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: linear-gradient(135deg, #1e293b, #334155);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
  flex-shrink: 0;
  overflow: hidden;
}
.co-company-avatar img { width: 100%; height: 100%; object-fit: cover; }
.co-company-name {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
  text-decoration: none;
}
.co-company-name:hover { color: #818cf8; }

.co-job-title {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 10px;
  color: #f1f5f9;
}

.co-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}
.co-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 500;
  background: rgba(99,102,241,0.1);
  color: #a5b4fc;
  border: 1px solid rgba(99,102,241,0.12);
  line-height: 1.4;
}
.co-badge--muted {
  background: rgba(255,255,255,0.03);
  color: #94a3b8;
  border-color: rgba(255,255,255,0.05);
}
.co-badge--green {
  background: rgba(34,197,94,0.1);
  color: #4ade80;
  border-color: rgba(34,197,94,0.12);
}
.co-badge--amber {
  background: rgba(251,191,36,0.08);
  color: #fbbf24;
  border-color: rgba(251,191,36,0.1);
}

.co-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-bottom: 10px;
}
.co-meta-item {
  background: rgba(255,255,255,0.025);
  border-radius: 6px;
  padding: 7px 10px;
}
.co-meta-label {
  font-size: 10px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 1px;
}
.co-meta-value {
  font-size: 12px;
  font-weight: 500;
  color: #e2e8f0;
}

.co-collapser {
  margin-bottom: 6px;
}
.co-collapser-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  user-select: none;
  transition: background 0.15s;
}
.co-collapser-header:hover { background: rgba(255,255,255,0.04); color: #e2e8f0; }
.co-collapser-header svg { width: 14px; height: 14px; transition: transform 0.2s; flex-shrink: 0; }
.co-collapser-header.open svg { transform: rotate(90deg); }
.co-collapser-body {
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.3s ease;
}
.co-collapser-body.open { max-height: 5000px; }

.co-desc-wrap {
  position: relative;
}
.co-desc-preview {
  max-height: 4.5em;
  overflow: hidden;
  position: relative;
}
.co-desc-preview::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1.5em;
  background: linear-gradient(transparent, #0f1117);
}
.co-desc-full { display: none; }
.co-desc-full.show { display: block; }
.co-desc-preview.hide { display: none; }

.co-desc-content {
  font-size: 12.5px;
  line-height: 1.65;
  color: #94a3b8;
  word-break: break-word;
}
.co-desc-content p { margin-bottom: 6px; }
.co-desc-content ul, .co-desc-content ol { padding-left: 18px; margin-bottom: 6px; }
.co-desc-content li { margin-bottom: 2px; }
.co-desc-content strong { color: #cbd5e1; }
.co-desc-content br { display: block; content: ''; margin-bottom: 4px; }

.co-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  padding: 3px 10px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  color: #818cf8;
  background: rgba(99,102,241,0.08);
  transition: background 0.15s;
}
.co-toggle-btn:hover { background: rgba(99,102,241,0.15); }

.co-company-section {
  margin-top: 4px;
  padding: 8px 10px;
  background: rgba(255,255,255,0.02);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.co-company-section-logo {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
}
.co-company-section-logo img { width: 100%; height: 100%; object-fit: cover; }
.co-company-section-info { flex: 1; min-width: 0; }
.co-company-section-name {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.co-company-section-link {
  font-size: 11px;
  color: #64748b;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.co-company-section-link:hover { color: #818cf8; }

#co-footer {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  border-top: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
.co-btn-primary {
  flex: 1;
  padding: 8px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  transition: opacity 0.15s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.co-btn-primary:hover { opacity: 0.9; }
.co-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.co-btn-secondary {
  flex: 1;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  background: transparent;
  color: #e2e8f0;
  transition: background 0.15s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.co-btn-secondary:hover { background: rgba(255,255,255,0.05); }

.co-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.2);
  border-top-color: #fff;
  border-radius: 50%;
  animation: co-spin 0.6s linear infinite;
  margin: 30px auto;
}
@keyframes co-spin { to { transform: rotate(360deg); } }
`;

export class LinkedInWidget {
  private host: HTMLDivElement;
  private root: ShadowRoot;
  private btn: HTMLButtonElement;
  private card: HTMLDivElement;
  private bodyEl: HTMLDivElement;
  private saveBtn: HTMLButtonElement;
  private currentJobId: string | null = null;
  private watchTimer: number | null = null;
  private visible = false;
  private lastData: JobData | null = null;
  private saving = false;

  constructor() {
    this.host = document.createElement('div');
    this.host.id = 'careeros-linkedin-widget';
    this.root = this.host.attachShadow({ mode: 'closed' });
    this.root.innerHTML = `<style>${STYLES}</style>`;

    this.btn = this.createButton();
    this.card = this.createCard();
    this.bodyEl = this.card.querySelector('#co-body')!;
    this.saveBtn = this.card.querySelector('#co-save-btn') as HTMLButtonElement;

    this.root.appendChild(this.btn);
    this.root.appendChild(this.card);
    document.documentElement.appendChild(this.host);

    document.addEventListener('click', (e) => {
      if (this.visible && !this.root.contains(e.target as Node)) this.hide();
    });

    this.startWatching();
  }

  private createButton(): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.id = 'co-btn';
    btn.title = 'CareerOS';
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`;
    btn.addEventListener('click', (e) => { e.stopPropagation(); this.toggle(); });
    return btn;
  }

  private createCard(): HTMLDivElement {
    const el = document.createElement('div');
    el.id = 'co-card';
    el.innerHTML = `
      <div id="co-header">
        <div id="co-logo-icon">C</div>
        <div id="co-header-title">CareerOS</div>
        <button id="co-close">&times;</button>
      </div>
      <div id="co-body">
        <div id="co-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <div style="font-size:13px;font-weight:500">No job detected</div>
          <div style="font-size:11px;max-width:200px;color:#475569">Select a job on LinkedIn to see details.</div>
        </div>
      </div>
      <div id="co-footer">
        <button id="co-save-btn" class="co-btn-primary" disabled>Save</button>
        <button id="co-dash-btn" class="co-btn-secondary">Dashboard</button>
      </div>
    `;
    el.querySelector('#co-close')!.addEventListener('click', () => this.hide());
    el.querySelector('#co-dash-btn')!.addEventListener('click', () => this.openDashboard());
    this.saveBtn = el.querySelector('#co-save-btn') as HTMLButtonElement;
    this.saveBtn.addEventListener('click', () => this.handleSave());
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
          this.lastData = data;
          this.render(data);
          if (data) this.show();
        } catch {
          this.bodyEl.innerHTML = `<div id="co-empty"><div style="color:#ef4444;font-size:13px">Extraction failed</div></div>`;
        }
      }
    }, 1200);
  }

  private render(data: JobData | null): void {
    if (!data) {
      this.bodyEl.innerHTML = `
        <div id="co-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <div style="font-size:13px;font-weight:500">No job detected</div>
        </div>`;
      this.saveBtn.disabled = true;
      return;
    }

    this.saveBtn.disabled = false;
    const initial = data.companyName.charAt(0).toUpperCase();
    const logoHtml = data.companyLogoUrl
      ? `<img src="${data.companyLogoUrl}" alt="${data.companyName}" />`
      : initial;

    const badges: string[] = [];
    if (data.jobLocation) badges.push(`<span class="co-badge">📍 ${this.esc(data.jobLocation)}</span>`);
    if (data.jobType) badges.push(`<span class="co-badge co-badge--muted">💼 ${this.esc(data.jobType)}</span>`);
    if (data.postedTime) badges.push(`<span class="co-badge co-badge--amber">🕐 ${this.esc(data.postedTime)}</span>`);
    if (data.applicantCount) badges.push(`<span class="co-badge co-badge--green">👥 ${data.applicantCount} applicant${data.applicantCount > 1 ? 's' : ''}</span>`);

    let metaHtml = '';
    const metaItems: string[] = [];
    if (data.seniority) metaItems.push(`<div class="co-meta-item"><div class="co-meta-label">Seniority</div><div class="co-meta-value">${this.esc(data.seniority)}</div></div>`);
    if (data.industry) metaItems.push(`<div class="co-meta-item"><div class="co-meta-label">Industry</div><div class="co-meta-value">${this.esc(data.industry)}</div></div>`);
    if (data.jobFunction) metaItems.push(`<div class="co-meta-item"><div class="co-meta-label">Function</div><div class="co-meta-value">${this.esc(data.jobFunction)}</div></div>`);
    if (data.salaryMin || data.salaryMax) {
      const c = data.salaryCurrency || '';
      const min = data.salaryMin ? `${c}${data.salaryMin.toLocaleString()}` : '';
      const max = data.salaryMax ? `${c}${data.salaryMax.toLocaleString()}` : '';
      metaItems.push(`<div class="co-meta-item"><div class="co-meta-label">Salary</div><div class="co-meta-value">${min}${min && max ? ' — ' : ''}${max}</div></div>`);
    }
    if (metaItems.length) {
      metaHtml = `<div class="co-meta-grid">${metaItems.join('')}</div>`;
    }

    let descHtml = '';
    if (data.jobDescription || data.jobDescriptionHtml) {
      const content = data.jobDescriptionHtml
        ? this.sanitizeHtml(data.jobDescriptionHtml)
        : `<p>${this.esc(data.jobDescription || '')}</p>`;
      descHtml = `
        <div class="co-collapser" data-collapser="desc">
          <div class="co-collapser-header" data-collapser-trigger="desc">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"/></svg>
            Description
          </div>
          <div class="co-collapser-body open" data-collapser-body="desc">
            <div class="co-desc-wrap">
              <div class="co-desc-preview co-desc-content">${content}</div>
              <div class="co-desc-full co-desc-content">${content}</div>
            </div>
            <button class="co-toggle-btn" data-toggle-desc>Show more ▾</button>
          </div>
        </div>`;
    }

    let companyHtml = '';
    if (data.companyName) {
      companyHtml = `
        <div class="co-company-section">
          <div class="co-company-section-logo">${logoHtml}</div>
          <div class="co-company-section-info">
            <div class="co-company-section-name">${this.esc(data.companyName)}</div>
            ${data.companyUrl ? `<a class="co-company-section-link" href="${data.companyUrl}" target="_blank" rel="noopener">View LinkedIn page ↗</a>` : ''}
          </div>
        </div>`;
    }

    this.bodyEl.innerHTML = `
      <div class="co-company-row">
        <div class="co-company-avatar">${logoHtml}</div>
        <a class="co-company-name" href="${data.companyUrl || '#'}" target="_blank" rel="noopener">${this.esc(data.companyName)}</a>
      </div>
      <div class="co-job-title">${this.esc(data.jobTitle)}</div>
      ${badges.length ? `<div class="co-badges">${badges.join('')}</div>` : ''}
      ${metaHtml}
      ${descHtml}
      ${companyHtml}
    `;

    this.attachCollapserEvents();
  }

  private attachCollapserEvents(): void {
    // Collapsible section toggles
    this.bodyEl.querySelectorAll('[data-collapser-trigger]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const key = trigger.getAttribute('data-collapser-trigger');
        const body = this.bodyEl.querySelector(`[data-collapser-body="${key}"]`);
        if (body) {
          body.classList.toggle('open');
          trigger.classList.toggle('open');
        }
      });
    });

    // Description show more/less toggle
    const toggleBtn = this.bodyEl.querySelector('[data-toggle-desc]');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const wrap = toggleBtn.closest('.co-collapser-body');
        if (!wrap) return;
        const preview = wrap.querySelector('.co-desc-preview') as HTMLElement;
        const full = wrap.querySelector('.co-desc-full') as HTMLElement;
        const isPreview = preview && !preview.classList.contains('hide');
        if (isPreview) {
          preview.classList.add('hide');
          full.classList.add('show');
          toggleBtn.textContent = 'Show less ▴';
        } else {
          preview?.classList.remove('hide');
          full?.classList.remove('show');
          toggleBtn.textContent = 'Show more ▾';
        }
      });
    }
  }

  private async handleSave(): Promise<void> {
    if (!this.lastData || this.saving) return;
    this.saving = true;
    this.saveBtn.textContent = 'Saving…';
    this.saveBtn.disabled = true;
    try {
      await chrome.runtime.sendMessage({ type: 'CAREEROS_SAVE', data: { ...this.lastData, source: 'browser_extension' } });
      this.saveBtn.textContent = '✔ Saved';
      setTimeout(() => {
        this.saveBtn.textContent = 'Save';
        this.saveBtn.disabled = false;
        this.saving = false;
      }, 2000);
    } catch {
      this.saveBtn.textContent = '✖ Error';
      this.saving = false;
      setTimeout(() => {
        this.saveBtn.textContent = 'Save';
        this.saveBtn.disabled = false;
      }, 2000);
    }
  }

  private openDashboard(): void {
    chrome.runtime.sendMessage({ type: 'CAREEROS_OPEN_DASHBOARD' });
  }

  private sanitizeHtml(html: string): string {
    const allowedTags = new Set(['p', 'br', 'b', 'strong', 'i', 'em', 'ul', 'ol', 'li', 'span', 'div', 'br']);
    const div = document.createElement('div');
    div.innerHTML = html;
    const clean = (node: Node): string => {
      if (node.nodeType === 3) return node.textContent || '';
      if (node.nodeType !== 1) return '';
      const el = node as Element;
      const tag = el.tagName.toLowerCase();
      if (!allowedTags.has(tag)) {
        return Array.from(el.childNodes).map(clean).join('');
      }
      const attrs = Array.from(el.attributes)
        .map((a) => `${a.name}="${a.value.replace(/"/g, '&quot;')}"`)
        .join(' ');
      const inner = Array.from(el.childNodes).map(clean).join('');
      if (tag === 'br') return '<br>';
      return `<${tag}${attrs ? ' ' + attrs : ''}>${inner}</${tag}>`;
    };
    return Array.from(div.childNodes).map(clean).join('');
  }

  private esc(s: string): string {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  private toggle(): void {
    this.visible ? this.hide() : this.show();
  }

  private show(): void {
    this.visible = true;
    this.card.classList.add('open');
  }

  private hide(): void {
    this.visible = false;
    this.card.classList.remove('open');
  }

  destroy(): void {
    if (this.watchTimer) clearInterval(this.watchTimer);
    this.host.remove();
  }
}
