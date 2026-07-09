import { useEffect, useState } from 'react';
import { styles } from './styles';
import { JobPreview } from './components/JobPreview';
import { importApplication, checkAuth } from '../utils/api';
import { tokens } from '../utils/design-tokens';

type View = 'loading' | 'idle' | 'preview' | 'saving' | 'saved' | 'error' | 'no-auth';

interface JobData {
  sourceUrl: string;
  companyName: string;
  companyDomain?: string;
  companyDescription?: string;
  jobTitle: string;
  jobDescription?: string;
  jobLocation?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  jobType?: string;
  keywords?: string[];
  applicationDeadline?: string;
}

async function getCurrentTab(): Promise<chrome.tabs.Tab | null> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab ?? null;
  } catch {
    return null;
  }
}

async function injectContentScript(tabId: number): Promise<boolean> {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js'],
    });
    return true;
  } catch {
    return false;
  }
}

async function requestJobData(tabId: number): Promise<JobData | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const results = await chrome.tabs.sendMessage<{ type: string }, JobData | null>(
        tabId,
        { type: 'CAREEROS_EXTRACT' },
      );
      if (results) return results;
    } catch {
      // content script not loaded — inject it
      await injectContentScript(tabId);
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  return null;
}

export function App() {
  const [view, setView] = useState<View>('loading');
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const auth = await checkAuth();
      if (!auth?.user) {
        setView('no-auth');
        return;
      }
      setUserName(auth.user.name ?? auth.user.email);

      const tab = await getCurrentTab();
      if (!tab || !tab.id || !tab.url || tab.url === 'about:blank') {
        setView('idle');
        return;
      }

      const data = await requestJobData(tab.id);
      if (data) {
        setJobData(data);
        setView('preview');
      } else {
        setView('idle');
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!jobData) return;
    setView('saving');
    try {
      await importApplication({ ...jobData, source: 'browser_extension' });
      setView('saved');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save');
      setView('error');
    }
  };

  const handleOpenDashboard = () => {
    chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
  };

  if (view === 'loading') {
    return (
      <div style={{ ...styles.container, alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={styles.loadingPulse} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (view === 'no-auth') {
    return (
      <div style={styles.container}>
        <Header />
        <div style={styles.emptyState}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={tokens.colors.dim} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <div style={styles.emptyTitle}>Not signed in</div>
          <div style={styles.emptyDesc}>
            Open CareerOS in your browser to sign in with Google, then come back.
          </div>
          <button style={styles.primaryButton} onClick={handleOpenDashboard}>
            Open CareerOS
          </button>
        </div>
      </div>
    );
  }

  if (view === 'idle') {
    return (
      <div style={styles.container}>
        <Header userName={userName} />
        <div style={styles.emptyState}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={tokens.colors.dim} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
          </svg>
          <div style={styles.emptyTitle}>No job detected</div>
          <div style={styles.emptyDesc}>
            Navigate to a job posting and click the CareerOS icon again.
          </div>
        </div>
      </div>
    );
  }

  if (view === 'saved') {
    return (
      <div style={styles.container}>
        <Header userName={userName} />
        <div style={styles.successBanner}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Saved to CareerOS
        </div>
        {jobData && <JobPreview {...jobData} />}
        <button style={styles.primaryButton} onClick={handleOpenDashboard}>
          View in Dashboard
        </button>
      </div>
    );
  }

  if (view === 'error') {
    return (
      <div style={styles.container}>
        <Header userName={userName} />
        <div style={styles.errorBanner}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {errorMsg || 'Something went wrong'}
        </div>
        <button style={styles.secondaryButton} onClick={() => setView('preview')}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Header userName={userName} />

      {jobData && <JobPreview {...jobData} />}

      <button style={styles.primaryButton} onClick={handleSave}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        Save to CareerOS
      </button>

      <button style={styles.secondaryButton} onClick={handleOpenDashboard}>
        Open Dashboard
      </button>

      <div style={styles.footer}>
        <a style={styles.footerLink} onClick={handleOpenDashboard}>
          Powered by CareerOS
        </a>
      </div>
    </div>
  );
}

function Header({ userName }: { userName?: string | null }) {
  return (
    <div style={styles.header}>
      <div style={styles.logoIcon}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M8 2L13 5.5V10.5L8 14L3 10.5V5.5L8 2Z" fill="white" fillOpacity="0.9" />
          <path d="M8 5L11 7V11L8 13L5 11V7L8 5Z" fill="white" fillOpacity="0.3" />
        </svg>
      </div>
      <span style={styles.logoText}>CareerOS</span>
      <div style={styles.statusDot(!!userName)} title={userName ? `Signed in as ${userName}` : 'Not connected'} />
    </div>
  );
}
