import React from 'react';

export default function RecentRuns({ runs, onSelectRun }) {
  return (
    <section className="rounded-2xl bg-surface-container-lowest border border-surface-container-high/50 p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-on-surface">
          <span className="material-symbols-outlined text-secondary text-[20px]">history</span>
          Recent Autonomous Runs
        </h2>
      </div>

      {runs.length === 0 ? (
        <p className="text-xs text-on-surface-variant">
          No runs yet this session â€” launch the agent above to see runs appear here.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {runs.map((run) => (
            <button
              key={run.id}
              onClick={() => onSelectRun(run.id)}
              className="flex items-center justify-between gap-3 rounded-lg border border-surface-container-high/40 bg-surface-container-low/60 hover:border-secondary/40 px-3 py-2.5 text-left transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm text-on-surface truncate">Query: {run.query}</p>
                <p className="font-mono text-[11px] text-on-surface-variant">
                  Finished {run.finishedAgo} Â· {run.opportunitiesCount} ranked opportunities Â· {run.sourcesOk}/{run.sourcesTotal} sources ok
                  {run.simulatedFailure ? ' Â· recovery demo' : ''}
                </p>
              </div>
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="font-mono text-[10px] text-outline uppercase">Top score</span>
                <span className="font-mono text-sm font-bold text-secondary">{run.topScore ?? 'â€”'}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

