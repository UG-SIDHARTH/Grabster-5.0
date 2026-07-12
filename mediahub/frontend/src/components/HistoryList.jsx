import React from 'react';
import { ExternalLink, Download, Clock, HardDrive, Film, Music, History } from 'lucide-react';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 MB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  if (i === 0) return `${bytes} B`;
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function timeAgo(dateString) {
  try {
    const now = new Date();
    const past = new Date(dateString);
    const ms = now - past;
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);

    if (sec < 60) return 'Just now';
    if (min < 60) return `${min}m ago`;
    if (hr < 24) return `${hr}h ago`;
    return `${day}d ago`;
  } catch (err) {
    return 'Recently';
  }
}

export default function HistoryList({ history, onDownloadSelect }) {
  if (!history || history.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto glass-panel rounded-3xl p-10 text-center border border-white/5 space-y-3">
        <div className="mx-auto w-12 h-12 bg-slate-900/50 rounded-full flex items-center justify-center border border-white/5">
          <History className="w-6 h-6 text-slate-500" />
        </div>
        <h3 className="text-slate-400 font-semibold text-base">No downloads recorded</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          URLs processed and successfully downloaded will appear in this history list.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-2 px-1">
        <History className="w-4 h-4 text-accent-cyan" />
        <h3 className="font-orbitron text-sm font-semibold tracking-wider uppercase text-slate-400">
          Recent Downloads History
        </h3>
        <span className="text-[10px] bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded-full">
          {history.length}
        </span>
      </div>

      <div className="space-y-3.5">
        {history.map((item) => {
          const isAudio = item.format.includes('mp3') || item.format === 'm4a';
          return (
            <div
              key={item.id}
              className="glass-panel glass-panel-hover rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 border border-white/5"
            >
              {/* Left format indicator badge */}
              <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border ${
                isAudio 
                  ? 'bg-accent-purple/10 border-accent-purple/20 text-accent-purple' 
                  : 'bg-accent-cyan/10 border-accent-cyan/20 text-accent-cyan'
              }`}>
                {isAudio ? <Music className="w-5 h-5" /> : <Film className="w-5 h-5" />}
              </div>

              {/* Title & metadata info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-200 truncate pr-4">
                    {item.title}
                  </h4>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-400">
                  <span className="font-medium text-slate-300 truncate max-w-[120px]">{item.uploader}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 opacity-60" />
                    <span>{timeAgo(item.timestamp)}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 opacity-60" />
                    <span>{formatBytes(item.size)}</span>
                  </span>
                  <span className="bg-slate-900/60 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-slate-400 border border-white/5">
                    {item.format}
                  </span>
                </div>
              </div>

              {/* Action utilities */}
              <div className="flex items-center gap-2">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg border border-white/5 transition-all duration-150"
                  title="Open Original Link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                {item.filename && (
                  <a
                    href={`/downloads/${item.filename}`}
                    download
                    className={`p-2 rounded-lg border flex items-center justify-center transition-all duration-200 ${
                      isAudio
                        ? 'border-accent-purple/20 text-accent-purple hover:bg-accent-purple/10'
                        : 'border-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/10'
                    }`}
                    title="Download File to Device"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
