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
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="relative flex items-center glass-panel rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-accent-cyan/50 focus-within:border-accent-cyan/60 transition-all duration-300 shadow-lg">
        {/* Left Side Icon */}
        <div className="pl-4 pr-2 text-slate-400">
          <Link className="w-5 h-5" />
        </div>

        {/* URL input field */}
        <input
          ref={inputRef}
          type="url"
          placeholder="Paste video or audio link here (YouTube, X, TikTok, Facebook...)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
          className="w-full bg-transparent border-0 outline-none text-slate-100 placeholder-slate-400 py-3.5 pr-20 text-base rounded-xl"
          required
        />

        {/* Control Buttons Inside Input */}
        <div className="absolute right-3 flex items-center gap-2">
          {url && !isLoading && (
            <button
              type="button"
              onClick={onClear}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-150"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {!url && (
            <button
              type="button"
              onClick={handlePaste}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-accent-cyan hover:text-white rounded-lg bg-accent-cyan/10 hover:bg-accent-cyan/30 transition-all duration-200"
              title="Paste from clipboard"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste</span>
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="flex items-center justify-center p-2.5 px-5 rounded-xl font-orbitron font-semibold text-sm text-black disabled:opacity-50 disabled:cursor-not-allowed neon-button-cyan"
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
