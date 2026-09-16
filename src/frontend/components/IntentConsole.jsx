import React from 'react';

const CATEGORIES = [
  { id: 'all', label: 'All Categories', phrase: "Find opportunities I can apply to. I'm a 2nd-year CSE student interested in AI/ML." },
  { id: 'hackathon', label: 'Hackathons', phrase: 'Find AI/ML hackathons for me' },
  { id: 'internship', label: 'Internships', phrase: 'Find AI/ML internships for a 2nd-year CSE student' },
  { id: 'competition', label: 'Competitions', phrase: 'Find AI/ML competitions I can enter' },
  { id: 'scholarship', label: 'Scholarships', phrase: 'Find scholarships for a CSE student' },
  { id: 'event', label: 'Events', phrase: 'Find campus events and workshops at MAIT' },
];

export default function IntentConsole({
  value,
  onChange,
  onSubmit,
  isRunning,
  activeCategory,
  onSelectCategory,
  simulateFailure,
  onToggleSimulateFailure,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && value.trim() && !isRunning) onSubmit(value);
  };

  return (
    <section className="rounded-2xl bg-surface-container-lowest border border-surface-container-high/50 shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-outline flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">terminal</span>
          Agent Intent Discovery Console
        </span>
        <span className="font-mono text-[10px] text-outline">
          Profile attached: <span className="text-secondary font-semibold">CSE_2ND_YEAR</span>
        </span>
      </div>

      <div className="px-5">
        <div className="flex items-center gap-3 rounded-xl bg-surface-container-low border border-surface-container-high/60 px-4 py-3 focus-within:border-secondary/50 transition-colors">
          <span className="material-symbols-outlined text-secondary text-[20px]">smart_toy</span>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isRunning}
            placeholder="Find opportunities I can apply to. I'm a 2nd-year CSE student interested in AI/ML."
            className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-container-highest font-mono text-[10px] text-on-surface-variant">
            âŒ˜K
          </kbd>
        </div>
      </div>

      <div className="px-5 py-3 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            disabled={isRunning}
            onClick={() => {
              onSelectCategory(cat.id);
              onChange(cat.phrase);
            }}
            className={`px-3 py-1.5 rounded-full font-mono text-[11px] font-semibold uppercase tracking-wide border transition-all ${
              activeCategory === cat.id
                ? 'bg-secondary/20 border-secondary/50 text-secondary'
                : 'bg-surface-container border-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-surface-container-high/40 bg-surface-container-low/40">
        <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            Engine: WebCMD Browser + HTTP Fallback
          </span>
          <span className="hidden sm:inline">3 sources: Unstop, Devfolio, MAIT</span>
          <button
            type="button"
            onClick={() => onToggleSimulateFailure(!simulateFailure)}
            title="Runs a demo-safe simulation of the browser-failure â†’ HTTP-recovery path"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all ${
              simulateFailure
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-surface-container border-surface-container-high text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">warning</span>
            {simulateFailure ? 'Simulate failure: ON' : 'Simulate failure: OFF'}
          </button>
        </div>

        <button
          type="button"
          disabled={isRunning || !value.trim()}
          onClick={() => onSubmit(value)}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-secondary text-on-secondary font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[16px]">
            {isRunning ? 'progress_activity' : 'rocket_launch'}
          </span>
          {isRunning ? 'Running Scout Missionâ€¦' : 'Launch Scout Agent'}
        </button>
      </div>
    </section>
  );
}

