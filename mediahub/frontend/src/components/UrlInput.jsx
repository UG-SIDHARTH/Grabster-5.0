import React, { useRef } from 'react';
import { Link, Clipboard, X, Search, Loader2 } from 'lucide-react';

export default function UrlInput({ url, setUrl, onFetch, isLoading, onClear }) {
  const inputRef = useRef(null);

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text);
        }
      } else {
        // Alert fallback for secure contexts
        alert("Unable to access clipboard automatically. Please press Ctrl+V to paste.");
        inputRef.current?.focus();
      }
    } catch (err) {
      console.warn("Failed to read clipboard:", err);
      // Fallback
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim() && !isLoading) {
      onFetch();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto px-1">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center glass-panel rounded-3xl p-2 gap-2.5 focus-within:ring-2 focus-within:ring-accent-cyan/50 focus-within:border-accent-cyan/60 transition-all duration-300 shadow-lg">
        {/* Input Area containing left icon, input field, and clear button */}
        <div className="flex items-center flex-1 min-w-0 bg-white/5 sm:bg-transparent rounded-2xl px-3 py-1 sm:py-0 border border-white/5 sm:border-none">
          <div className="text-slate-400 flex-shrink-0 mr-2">
            <Link className="w-5 h-5" />
          </div>
          <input
            ref={inputRef}
            type="url"
            placeholder="Paste media link here (YouTube, Pinterest, X...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            className="w-full bg-transparent border-0 outline-none text-slate-100 placeholder-slate-400 py-3 text-base"
            required
          />
          {url && !isLoading && (
            <button
              type="button"
              onClick={onClear}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-150 flex-shrink-0"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Buttons Area */}
        <div className="flex items-center gap-2 sm:flex-shrink-0">
          {!url && (
            <button
              type="button"
              onClick={handlePaste}
              className="flex items-center justify-center gap-1.5 px-4 py-3 sm:py-2.5 text-xs font-semibold text-accent-cyan hover:text-white rounded-xl bg-accent-cyan/10 hover:bg-accent-cyan/20 transition-all duration-200 flex-1 sm:flex-initial"
              title="Paste from clipboard"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste</span>
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="flex items-center justify-center p-3 sm:p-2.5 px-6 rounded-xl font-orbitron font-semibold text-sm text-black disabled:opacity-50 disabled:cursor-not-allowed neon-button-cyan flex-1 sm:flex-initial"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : (
              <span className="flex items-center gap-1.5">
                <Search className="w-4 h-4" />
                <span>Fetch</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
