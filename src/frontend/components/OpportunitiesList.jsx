import React from 'react';

const REASON_LABELS = {
  degreeMatch: 'CSE match',
  yearMatch: 'year eligible',
  interestMatch: 'AI/ML interest',
  skillMatch: 'skill match',
  locationMatch: 'Delhi/Remote',
  urgency: 'active deadline',
};

function reasonsFor(opp) {
  const breakdown = opp.scoreData?.breakdown || {};
  return Object.keys(breakdown)
    .filter((k) => REASON_LABELS[k])
    .map((k) => REASON_LABELS[k]);
}

export default function OpportunitiesList({ opportunities }) {
  if (!opportunities || opportunities.length === 0) {
    return (
      <section className="rounded-2xl bg-surface-container-lowest border border-surface-container-high/50 p-5">
        <p className="text-sm text-on-surface-variant">
          No ranked opportunities yet â€” launch the Scout agent to populate this list with real results.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-surface-container-lowest border border-surface-container-high/50 p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-on-surface">
          <span className="material-symbols-outlined text-secondary text-[20px]">folder_special</span>
          Ranked Opportunities
        </h2>
        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-container-high text-secondary">
          {opportunities.length} total
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {opportunities.map((opp, idx) => {
          const reasons = reasonsFor(opp);
          return (
            <a
              key={`${opp.url}-${idx}`}
              href={opp.url}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 rounded-lg border border-surface-container-high/40 bg-surface-container-low/60 hover:border-secondary/40 px-3 py-2.5 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant uppercase">
                    {opp.type}
                  </span>
                  <span className="font-mono text-[10px] text-outline">{opp.source}</span>
                </div>
                <p className="text-sm text-on-surface mt-1 truncate">{opp.title || 'Untitled opportunity'}</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  {opp.deadline ? `Deadline: ${opp.deadline}` : 'Deadline: not specified'}
                  {reasons.length > 0 ? ` Â· ${reasons.join(' + ')}` : ''}
                </p>
              </div>
              <div className="flex-shrink-0 flex flex-col items-end">
                <span className="font-mono text-[10px] text-outline uppercase">Score</span>
                <span className="font-mono text-base font-bold text-secondary">{opp.score}</span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

