import React, { useState, useEffect } from 'react';
import { ShieldCheck, Zap, Download, RefreshCw, AlertCircle } from 'lucide-react';
import UrlInput from './components/UrlInput';
import MetadataCard from './components/MetadataCard';
import HistoryList from './components/HistoryList';
import { ToastContainer } from './components/Toast';

// Strips credentials from window origin to prevent TypeError: Failed to execute 'fetch' on 'Window'
// when running behind basic authentication or with credentials in the URL
const getApiUrl = (apiPath) => {
  try {
    const url = new URL(apiPath, window.location.href);
    url.username = '';
    url.password = '';
    return url.toString();
  } catch (err) {
    return apiPath;
  }
};

export default function App() {
  const [url, setUrl] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [history, setHistory] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Toast Helpers
  const addToast = (message, type = 'info', duration = 6000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Fetch History from API
  const fetchHistory = async () => {
    try {
      const res = await fetch(getApiUrl('/api/history'));
      const data = await res.json();
      if (data.success) {
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to load downloads history:', err);
    }
  };

  // Load History on component mount
  useEffect(() => {
    fetchHistory();
  }, []);

  // Fetch video metadata
  const handleFetchMetadata = async () => {
    if (!url.trim()) return;

    setIsLoadingMetadata(true);
    setMetadata(null);
    setDownloadSuccess(false);

    try {
      const res = await fetch(getApiUrl('/api/info'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      if (res.status === 429) {
        addToast('Too many requests. Please wait a bit before trying again.', 'error');
        return;
      }

      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        addToast(`Server returned an invalid response (${res.status}). Ensure backend is running.`, 'error');
        return;
      }

      if (data.success) {
        setMetadata(data.metadata);
        addToast('Metadata loaded successfully!', 'success', 3000);
      } else {
        addToast(data.error || 'Failed to extract video metadata.', 'error');
      }
    } catch (err) {
      addToast('Network error while fetching media details. Ensure backend is running.', 'error');
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  // Handle Download Request
  const handleDownload = async (format) => {
    if (!url.trim()) return;

    setIsDownloading(true);
    setDownloadSuccess(false);
    addToast('Adding job to queue... Starting download process.', 'info', 4000);

    try {
      const res = await fetch(getApiUrl('/api/download'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), format })
      });

      if (res.status === 429) {
        addToast('Rate limited. Please wait and try again.', 'error');
        return;
      }

      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        addToast(`Server returned an invalid response (${res.status}). Ensure backend is running.`, 'error');
        return;
      }

      if (data.success && data.downloadUrl) {
        setDownloadSuccess(true);
        addToast('Download completed! Transferring file to browser...', 'success', 5000);
        
        // Trigger file download in browser
        const link = document.createElement('a');
        link.href = getApiUrl(data.downloadUrl);
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Refresh history list
        fetchHistory();
      } else {
        addToast(data.error || 'Failed to process media file download.', 'error');
      }
    } catch (err) {
      addToast('Network error occurred during download processing.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClear = () => {
    setUrl('');
    setMetadata(null);
    setDownloadSuccess(false);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between">
      
      {/* Animated gradient particles backdrop */}
      <div className="animated-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Header Bar */}
      <header className="w-full py-6 border-b border-white/5 bg-slate-950/20 backdrop-blur-md px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">⚡</span>
            <h1 className="font-orbitron font-extrabold text-lg md:text-xl tracking-wider bg-gradient-to-r from-accent-cyan via-white to-accent-pink bg-clip-text text-transparent">
              MEDIAHUB <span className="font-light text-slate-400">DOWNLOADER</span>
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold bg-slate-900/80 px-3 py-1.5 rounded-full border border-white/5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Online</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-10 md:py-16 space-y-12 md:space-y-16">
        
        {/* Intro Section */}
        <section className="text-center space-y-4 max-w-2xl mx-auto animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight font-orbitron">
            Fast, Simple, <br className="sm:hidden" />
            <span className="bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">
              High Quality
            </span> Downloads
          </h2>
          <p className="text-sm md:text-base text-slate-400">
            Download files directly to your VPS. Stream audio and video from YouTube, X, TikTok, Facebook, and Instagram automatically without ads or trackers.
          </p>
          
          {/* Quick Platform Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <span className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-md">YouTube</span>
            <span className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-md">Pinterest</span>
            <span className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-md">Facebook</span>
            <span className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-md">Instagram</span>
            <span className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-md">TikTok</span>
            <span className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-md">X (Twitter)</span>
          </div>
        </section>

        {/* Input Form Section */}
        <section className="space-y-6">
          <UrlInput
            url={url}
            setUrl={setUrl}
            onFetch={handleFetchMetadata}
            isLoading={isLoadingMetadata}
            onClear={handleClear}
          />
        </section>

        {/* Metadata display card section */}
        {metadata && (
          <section className="animate-fade-in">
            <MetadataCard
              metadata={metadata}
              onDownload={handleDownload}
              isDownloading={isDownloading}
              downloadSuccess={downloadSuccess}
            />
          </section>
        )}

        {/* History Logger Dashboard Section */}
        <section className="pt-4 border-t border-white/5">
          <HistoryList
            history={history}
            onDownloadSelect={(item) => {
              setUrl(item.url);
              setMetadata(null);
            }}
          />
        </section>

      </main>

      {/* Footer Info Area */}
      <footer className="w-full py-8 border-t border-white/5 bg-slate-950/20 backdrop-blur-md px-4 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-semibold">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-accent-cyan" />
            <span>Built for high performance media processing</span>
          </div>
          <div>
            <span>MediaHub Downloader &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Protected Sandbox</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Floating Notifications UI */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

    </div>
  );
}
