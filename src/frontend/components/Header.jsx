import React from 'react';

export default function Header({ searchInput, setSearchInput, onSearchSubmit, isRunning }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchInput.trim()) {
      onSearchSubmit(searchInput);
    }
  };

  return (
    <header class="fixed top-0 left-72 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-surface-container-high/40 z-40 flex items-center justify-between px-6">
      {/* Global Search Bar */}
      <div class="flex-1 max-w-2xl">
        <div class="flex items-center h-10 w-full rounded-lg bg-surface-container-low border border-surface-container-high/60 px-3 gap-2 focus-within:border-secondary/50 transition-colors">
          <span class="material-symbols-outlined text-outline text-[18px]">search</span>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isRunning}
            class="w-full bg-transparent font-sans text-xs text-on-surface placeholder:text-outline focus:outline-none"
            placeholder="Search AI/ML opportunities for 2nd-year CSE student..."
            type="text"
          />
          <div class="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-container-highest font-mono text-[10px] text-on-surface-variant">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Telemetry Bar */}
      <div class="flex items-center gap-6 pl-4">
        <div class="hidden xl:flex items-center gap-4">
          <div class="flex flex-col items-end">
            <span class="font-mono text-[10px] text-outline uppercase tracking-wider">Sources Active</span>
            <span class="font-mono text-xs text-secondary font-semibold">Unstop • Devfolio • MAIT</span>
          </div>
          <div class="h-6 w-[1px] bg-surface-container-high"></div>
          <div class="flex flex-col items-end">
            <span class="font-mono text-[10px] text-outline uppercase tracking-wider">Infrastructure</span>
            <span class="font-mono text-xs text-on-surface-variant flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              WebCMD Engine
            </span>
          </div>
        </div>

        {/* User avatar */}
        <div class="w-8 h-8 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center text-secondary font-bold text-xs shadow-sm">
          AS
        </div>
      </div>
    </header>
  );
}
